import asyncio
import hmac
from datetime import datetime, timezone
from typing import Any
from urllib.parse import urlparse

from fastapi import Body, Depends, FastAPI, HTTPException, Query, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware

from backend.app.auth import (
    authenticate,
    clear_session_cookies,
    is_login_blocked,
    read_request_session,
    record_login_attempt,
    require_admin,
    set_session_cookie,
)
from backend.app.config import get_settings
from backend.app.kolky_importer import build_official_teams, get_hlohovec_team_definitions, import_hlohovec_matches, is_hlohovec_match, sync_hlohovec_club_data
from backend.app.models import (
    CheckoutBody,
    LiveClubData,
    LiveMatch,
    LiveMember,
    LoginBody,
    MemberEnsureBody,
    RegistrationCancelBody,
    RegistrationCreate,
    TournamentRegistration,
)
from backend.app.storage import read_club_data, read_registrations, write_club_data, write_registrations

settings = get_settings()

IMPORT_SECRET_HEADER = "x-kkhc-import-secret"
ALLOWED_IMPORT_HOSTS = {"vysledky.kolky.sk", "www.vysledky.kolky.sk"}
MAX_IMPORT_ID_RANGE = 5000

app = FastAPI(
    title="KK Hlohovec API",
    version="0.1.0",
    description="FastAPI backend for KK Hlohovec website, admin CRUD, registrations, payments and kolky.sk import.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def start_background_import() -> None:
    if settings.kolky_auto_import_enabled:
        asyncio.create_task(kolky_auto_import_loop())


def _require_import_auth(request: Request) -> None:
    """Import/sync endpoints: shared secret header or admin session. Never anonymous."""
    if not settings.kolky_import_secret:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Import is not configured. Set KOLKY_IMPORT_SECRET.",
        )
    supplied = request.headers.get(IMPORT_SECRET_HEADER)
    if supplied and hmac.compare_digest(supplied, settings.kolky_import_secret):
        return
    require_admin(request)


def _validate_manual_import_url(url: str | None) -> None:
    if not url:
        return
    try:
        parsed = urlparse(url)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid import URL")
    if parsed.scheme != "https" or parsed.hostname not in ALLOWED_IMPORT_HOSTS or not parsed.path.startswith("/match/detail/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only vysledky.kolky.sk match detail URLs can be imported",
        )


def _validate_import_id_range(id_from: int | None, id_to: int | None) -> None:
    if id_from is None or id_to is None:
        return
    if id_from > id_to or (id_to - id_from) > MAX_IMPORT_ID_RANGE:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid match ID range")


def _client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


async def _verify_supabase_user(email: str, provider_token: str) -> bool:
    """Confirm the e-mail against Supabase Auth instead of trusting the browser."""
    if not provider_token or not settings.supabase_configured:
        return False
    import httpx

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(
                f"{settings.supabase_url}/auth/v1/user",
                headers={
                    "apikey": settings.supabase_service_role_key,
                    "Authorization": f"Bearer {provider_token}",
                },
            )
    except Exception:
        return False
    if response.status_code != 200:
        return False
    try:
        return str(response.json().get("email", "")).lower() == email.lower()
    except ValueError:
        return False


@app.get("/health")
def health() -> dict[str, Any]:
    return {"ok": True, "service": "kkhc-fastapi", "time": datetime.utcnow().isoformat()}


@app.get("/api/club-data")
def get_club_data() -> dict[str, Any]:
    return {"ok": True, "data": read_club_data()}


@app.get("/api/teams")
def get_teams() -> dict[str, Any]:
    data = read_club_data()
    teams = filter_hlohovec_teams(data.teams)
    return {"ok": True, "data": teams}


@app.get("/api/teams/{team_id}")
def get_team(team_id: int) -> dict[str, Any]:
    team = next((item for item in filter_hlohovec_teams(read_club_data().teams) if item.id == team_id or item.externalTeamId == team_id), None)
    if not team:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found")
    return {"ok": True, "data": team}


@app.get("/api/teams/{team_id}/players")
def get_team_players(team_id: int) -> dict[str, Any]:
    data = read_club_data()
    team = next((item for item in filter_hlohovec_teams(data.teams) if item.id == team_id or item.externalTeamId == team_id), None)
    if not team:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found")
    exact_rows = [
        player
        for player in data.players
        if is_real_player_name(player.name) and player.externalTeamId == team.externalTeamId
    ]
    rows = exact_rows or [
        player for player in data.players
        if is_real_player_name(player.name) and (player.team == team.name or player.team == team.category)
    ]
    return {"ok": True, "team": team, "data": rows}


@app.get("/api/matches")
def get_matches(
    league_id: int | None = Query(default=None),
    team_id: int | None = Query(default=None),
    season: str | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=500, ge=1, le=1000),
) -> dict[str, Any]:
    rows = [match for match in read_club_data().matches if is_hlohovec_match(match)]
    if league_id is not None:
        rows = [match for match in rows if match.externalLeagueId == league_id]
    if team_id is not None:
        rows = [match for match in rows if match.homeExternalTeamId == team_id or match.awayExternalTeamId == team_id]
    if season:
        normalized_season = normalize_season_text(season)
        rows = [match for match in rows if normalize_season_text(match.season or match.league or match.date) == normalized_season]

    rows = sorted(rows, key=lambda item: sortable_match_date(item.date), reverse=True)
    total = len(rows)
    start = (page - 1) * page_size
    end = start + page_size
    items = rows[start:end]
    pages = (total + page_size - 1) // page_size if total else 1
    by_category: dict[str, int] = {}
    by_team: dict[str, int] = {}
    for match in rows:
        category = match.competition or normalize_match_competition(match.league) or "Nezaradené"
        by_category[category] = by_category.get(category, 0) + 1
        for side_team_id in [match.homeExternalTeamId, match.awayExternalTeamId]:
            if side_team_id is not None:
                key = f"{match.externalLeagueId}:{side_team_id}"
                by_team[key] = by_team.get(key, 0) + 1

    return {
        "ok": True,
        "data": items,
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "pages": pages,
        "byCategory": by_category,
        "byTeam": by_team,
    }


@app.get("/api/matches/{match_id}")
def get_match(match_id: int) -> dict[str, Any]:
    match = next((item for item in read_club_data().matches if item.id == match_id and is_hlohovec_match(item)), None)
    if not match:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Match not found")
    return {"ok": True, "data": match}


@app.get("/api/standings")
def get_standings() -> dict[str, Any]:
    rows = [row for row in read_club_data().standings if row.isHlohovecTeam]
    return {"ok": True, "data": rows}


@app.get("/api/admin/live-data")
def get_admin_live_data(_: dict[str, Any] = Depends(require_admin)) -> dict[str, Any]:
    return {"ok": True, "data": read_club_data()}


@app.put("/api/admin/live-data")
def put_admin_live_data(body: dict[str, LiveClubData], _: dict[str, Any] = Depends(require_admin)) -> dict[str, Any]:
    data = body.get("data")
    if not data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing data")
    return {"ok": True, "data": write_club_data(LiveClubData.model_validate(data))}


@app.get("/api/tournament-registrations")
def get_tournament_registrations(
    tournamentId: int | None = Query(default=None),
    _: dict[str, Any] = Depends(require_admin),
) -> dict[str, Any]:
    rows = read_registrations()
    if tournamentId:
        rows = [row for row in rows if row.tournamentId == tournamentId]
    return {"ok": True, "data": rows}


@app.post("/api/tournament-registrations")
def create_tournament_registration(body: RegistrationCreate) -> dict[str, Any]:
    rows = read_registrations()
    tournament = next((item for item in read_club_data().tournaments if item.id == body.tournamentId), None)
    if not tournament:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tournament not found")

    capacity = parse_capacity(tournament.capacity)
    active_count = len([row for row in rows if row.tournamentId == body.tournamentId and row.cancellationStatus == "active"])
    if capacity and active_count >= capacity:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Tournament capacity is full")

    duplicate = next(
        (
            row
            for row in rows
            if row.tournamentId == body.tournamentId
            and row.email.lower() == str(body.email).lower()
            and row.cancellationStatus == "active"
        ),
        None,
    )
    if duplicate:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Player is already registered")

    registration = TournamentRegistration(
        **{**body.model_dump(), "paymentStatus": "free" if tournament.entryType == "free" else "pending"},
        id=int(datetime.utcnow().timestamp() * 1000),
        createdAt=datetime.utcnow().isoformat(),
        userEmail=str(body.userEmail or body.email).lower(),
    )
    write_registrations([registration, *rows])
    return {"ok": True, "data": registration}


@app.delete("/api/tournament-registrations/{registration_id}")
def cancel_own_tournament_registration(
    registration_id: int,
    request: Request,
    body: RegistrationCancelBody | None = Body(default=None),
) -> dict[str, Any]:
    session = read_request_session(request)
    rows = read_registrations()
    current = next((row for row in rows if row.id == registration_id), None)
    if not current:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Registration not found")

    # Only the owner (authenticated session) or an admin can cancel.
    # The e-mail in the request body is not trusted.
    requester_email = str(session.get("email", "")).lower() if session else ""
    is_admin = bool(session and session.get("role") == "admin")
    if not is_admin and (not requester_email or requester_email not in {current.email.lower(), current.userEmail.lower()}):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can cancel only your own registration")

    data = read_club_data()
    tournament = next((item for item in data.tournaments if item.id == current.tournamentId), None)
    cancellation = cancellation_status(current, tournament)
    cancelled = current.model_copy(update={"cancelledAt": datetime.utcnow().isoformat(), "cancellationStatus": cancellation})
    next_rows = [cancelled if row.id == registration_id else row for row in rows]
    write_registrations(next_rows)
    return {"ok": True, "data": cancelled, "refundEligible": cancellation == "refund_due"}


@app.get("/api/admin/tournament-registrations")
def get_admin_tournament_registrations(_: dict[str, Any] = Depends(require_admin)) -> dict[str, Any]:
    return {"ok": True, "data": read_registrations()}


@app.put("/api/admin/tournament-registrations")
def put_admin_tournament_registrations(
    body: dict[str, list[TournamentRegistration]],
    _: dict[str, Any] = Depends(require_admin),
) -> dict[str, Any]:
    rows = [TournamentRegistration.model_validate(row) for row in body.get("data", [])]
    return {"ok": True, "data": write_registrations(rows)}


@app.delete("/api/admin/tournament-registrations/{registration_id}")
def delete_admin_tournament_registration(registration_id: int, _: dict[str, Any] = Depends(require_admin)) -> dict[str, Any]:
    rows = [row for row in read_registrations() if row.id != registration_id]
    return {"ok": True, "data": write_registrations(rows)}


@app.get("/api/admin/tournaments/{tournament_id}/registrations")
def get_admin_tournament_registration_detail(tournament_id: int, _: dict[str, Any] = Depends(require_admin)) -> dict[str, Any]:
    data = read_club_data()
    tournament = next((item for item in data.tournaments if item.id == tournament_id), None)
    if not tournament:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tournament not found")
    rows = [row for row in read_registrations() if row.tournamentId == tournament_id]
    return {"ok": True, "tournament": tournament, "data": rows}


@app.post("/api/auth/login")
def login(body: LoginBody, request: Request, response: Response) -> dict[str, Any]:
    client_ip = _client_ip(request)
    if is_login_blocked(client_ip, str(body.email)):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Príliš veľa pokusov. Skús to znova o chvíľu.",
        )
    user = authenticate(body.email, body.password)
    record_login_attempt(client_ip, str(body.email), success=user is not None)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Nesprávny e-mail alebo heslo.")

    set_session_cookie(response, user["email"], user["role"], user.get("name"))
    return {
        "ok": True,
        "user": user,
        "redirectTo": "/admin" if user["role"] == "admin" else "/profile",
    }


@app.post("/api/auth/logout")
def logout(response: Response) -> dict[str, Any]:
    clear_session_cookies(response)
    return {"ok": True}


@app.get("/api/auth/session")
def auth_session(request: Request) -> dict[str, Any]:
    session = read_request_session(request)
    if not session:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    return {"ok": True, "user": session}


@app.post("/api/members/ensure")
async def ensure_member(body: MemberEnsureBody) -> dict[str, Any]:
    data = read_club_data()
    email = str(body.email).lower()
    if not await _verify_supabase_user(email, body.providerToken):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Google prihlásenie sa nepodarilo overiť.")
    existing = next((member for member in data.members if member.email.lower() == email), None)

    if existing:
        updated = existing.model_copy(
            update={
                "name": body.name or existing.name,
                "authProvider": body.provider or existing.authProvider,
                "avatarUrl": body.avatarUrl or existing.avatarUrl,
            }
        )
        members = [updated if member.id == existing.id else member for member in data.members]
        write_club_data(data.model_copy(update={"members": members}))
        return {"ok": True, "data": updated, "created": False}

    member = LiveMember(
        id=int(datetime.utcnow().timestamp() * 1000),
        name=body.name or email.split("@")[0],
        email=email,
        team="KK Hlohovec",
        role="member",
        memberSince=datetime.utcnow().date().isoformat(),
        membershipStatus="pending",
        lastPayment="-",
        nextPayment="Po aktivácii členstva",
        authProvider=body.provider or "google",
        avatarUrl=body.avatarUrl or "",
    )
    write_club_data(data.model_copy(update={"members": [member, *data.members]}))
    return {"ok": True, "data": member, "created": True}


@app.get("/api/profile")
def profile(request: Request) -> dict[str, Any]:
    session = read_request_session(request)
    if not session:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")

    data = read_club_data()
    email = str(session.get("email", "")).lower()
    is_admin = session.get("role") == "admin"
    member = next((item for item in data.members if item.email.lower() == email), None)
    name = "Admin" if is_admin else member.name if member else str(session.get("name") or "Michaela Vavrová")

    return {
        "authenticated": True,
        "user": {
            "email": email,
            "role": session.get("role"),
            "name": name,
            "avatarUrl": None,
            "provider": "password",
        },
        "membership": {
            "status": member.membershipStatus if member else "pending_payment",
            "label": "Zaplatené" if member and member.membershipStatus == "paid" else "Čaká na prvú platbu",
            "nextPayment": member.nextPayment if member else None,
            "stripeReady": bool(settings.stripe_secret_key),
        },
        "team": {
            "name": "Administrácia klubu" if is_admin else member.team if member else "KK Hlohovec",
            "category": "Správa klubu" if is_admin else member.role if member else "member",
            "captain": None,
            "coach": None,
        },
        "payments": [
            {"period": "Júl 2026", "item": "Členstvo", "amount": 19, "currency": "EUR", "status": "prepared"},
            {"period": "Jún 2026", "item": "Členstvo", "amount": 19, "currency": "EUR", "status": "no_record"},
        ],
        "matchSource": {
            "provider": "vysledky.kolky.sk",
            "playerName": None if is_admin else name,
            "totalMatches": None,
            "status": "waiting_for_player_id",
        },
        "tournamentHistory": [],
        "stats": {"matches": None, "tournaments": 0, "medals": 0},
    }


@app.post("/api/payments/checkout")
def checkout(body: CheckoutBody) -> dict[str, Any]:
    if not settings.stripe_secret_key:
        return {
            "ok": False,
            "checkoutReady": False,
            "message": "Stripe nie je nakonfigurovaný. Doplň STRIPE_SECRET_KEY.",
        }

    try:
        import stripe
    except ModuleNotFoundError:
        return {
            "ok": False,
            "checkoutReady": False,
            "message": "Stripe balik nie je nainstalovany. Spusti: python -m pip install stripe",
        }

    if body.amount <= 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid amount")

    stripe.api_key = settings.stripe_secret_key
    session = stripe.checkout.Session.create(
        mode="payment",
        customer_email=str(body.email) if body.email else None,
        line_items=[
            {
                "quantity": 1,
                "price_data": {
                    "currency": "eur",
                    "unit_amount": round(body.amount * 100),
                    "product_data": {"name": body.name or ("Členstvo KK Hlohovec" if body.mode == "membership" else "Turnaj KK Hlohovec")},
                },
            }
        ],
        metadata={"source": "kkhc-fastapi", "mode": body.mode, **body.metadata},
        success_url=f"{settings.frontend_origin}/profile?payment=success",
        cancel_url=f"{settings.frontend_origin}/profile?payment=cancelled",
    )
    return {"ok": True, "url": session.url}


@app.post("/api/import/kolky")
async def import_kolky(
    request: Request,
    url: str | None = Query(default=None),
    from_date: str | None = Query(default=None, alias="from"),
    to_date: str | None = Query(default=None, alias="to"),
    query: str | None = Query(default=None),
    mode: str = Query(default="live"),
    cacheFile: str | None = Query(default=None),
    idFrom: int | None = Query(default=None),
    idTo: int | None = Query(default=None),
    fallback: str | None = Query(default=None),
    full_refresh: bool = Query(default=False),
) -> dict[str, Any]:
    _require_import_auth(request)
    _validate_manual_import_url(url)
    _validate_import_id_range(idFrom, idTo)

    data = read_club_data()
    selected_mode = mode if mode in {"live", "cache", "fixture"} else "live"
    result = await import_hlohovec_matches(
        [url] if url else None,
        from_date=from_date,
        to_date=to_date,
        query=query,
        mode=selected_mode,
        cache_file=cacheFile,
        fallback_fixture=False,
        id_from=idFrom,
        id_to=idTo,
    )
    imported = [match for match in result["imported"] if is_hlohovec_match(match)]
    safe_full_refresh = should_apply_full_refresh(result, full_refresh)
    merged, merge_stats = merge_matches(filter_hlohovec_matches(data.matches), imported, full_refresh=safe_full_refresh)
    if full_refresh and not safe_full_refresh:
        merge_stats["fullRefreshSkipped"] = 1
        merge_stats["fullRefreshSkipReason"] = "Live discovery was incomplete or failed; existing imported matches were preserved."
    updated = data.model_copy(update={"matches": merged})
    write_club_data(updated)

    return {
        "ok": len(imported) > 0,
        "source": "https://vysledky.kolky.sk",
        "status": result.get("status"),
        "importMode": result.get("mode"),
        "from": result["from"],
        "to": result["to"],
        "query": result["query"],
        "importedCount": len(imported),
        **merge_stats,
        "byCompetition": result.get("byCompetition", {}),
        "duplicatesRemoved": result.get("duplicatesRemoved", 0),
        "checkedUrls": result["checkedUrls"],
        "warnings": result["warnings"],
        "logs": result.get("logs", []),
        "matches": imported,
    }


@app.post("/api/admin/sync")
async def admin_sync(
    request: Request,
    from_date: str | None = Query(default=None, alias="from"),
    to_date: str | None = Query(default=None, alias="to"),
    mode: str = Query(default="live"),
    cacheFile: str | None = Query(default=None),
    idFrom: int | None = Query(default=None),
    idTo: int | None = Query(default=None),
    full_refresh: bool = Query(default=False),
) -> dict[str, Any]:
    _require_import_auth(request)
    _validate_import_id_range(idFrom, idTo)

    selected_mode = mode if mode in {"live", "cache", "fixture"} else "live"
    result = await sync_hlohovec_club_data(
        from_date=from_date,
        to_date=to_date,
        mode=selected_mode,
        cache_file=cacheFile,
        id_from=idFrom,
        id_to=idTo,
    )
    data = read_club_data()
    safe_full_refresh = should_apply_full_refresh(result, full_refresh)
    matches, merge_stats = merge_matches(filter_hlohovec_matches(data.matches), result["matches"], full_refresh=safe_full_refresh)
    if full_refresh and not safe_full_refresh:
        merge_stats["fullRefreshSkipped"] = 1
        merge_stats["fullRefreshSkipReason"] = "Live discovery was incomplete or failed; existing imported matches were preserved."
    updated = data.model_copy(update={
        "teams": result["teams"],
        "players": result["players"],
        "matches": matches,
        "standings": result["standings"],
    })
    write_club_data(updated)

    return {
        "ok": result["ok"],
        "status": result["status"],
        "source": "https://vysledky.kolky.sk",
        "from": result["from"],
        "to": result["to"],
        "counts": result["counts"],
        **merge_stats,
        "teams": result["teams"],
        "players": result["players"],
        "matches": matches,
        "standings": result["standings"],
        "errors": result["errors"],
        "team_results": result.get("team_results", []),
        "logs": result["logs"],
        "checkedUrls": result["checkedUrls"],
        "message": "Live crawler failed. No real matches were imported." if not result["ok"] and selected_mode == "live" else "Synchronizácia KKZ Hlohovec dokončená.",
    }


async def kolky_auto_import_loop() -> None:
    await asyncio.sleep(10)
    while True:
        try:
            data = read_club_data()
            result = await sync_hlohovec_club_data(
                from_date=settings.kolky_import_from,
                to_date=settings.kolky_import_to or None,
            )
            merged, _ = merge_matches(filter_hlohovec_matches(data.matches), result["matches"])
            write_club_data(data.model_copy(update={
                "teams": result["teams"],
                "players": result["players"],
                "matches": merged,
                "standings": result["standings"],
            }))
        except Exception as exc:
            print(f"[kolky-import] scheduled import failed: {exc}")
        await asyncio.sleep(max(settings.kolky_auto_import_interval_seconds, 3600))


def should_apply_full_refresh(result: dict[str, Any], requested: bool) -> bool:
    if not requested:
        return False
    if not result.get("matches"):
        return False
    blocking_log_types = {"league_schedule_empty", "suspicious_low_match_count", "no_match"}
    logs = result.get("logs") or []
    if any(log.get("type") in blocking_log_types for log in logs):
        return False
    if result.get("status") in {"failed", "no_matches"}:
        return False
    return True


def merge_matches(existing: list[LiveMatch], imported: list[LiveMatch], full_refresh: bool = False) -> tuple[list[LiveMatch], dict[str, int]]:
    preserved = [
        match for match in existing
        if full_refresh and (match.importStatus in {"manual", "edited"} or match.adminLocked)
    ]
    stale = max(len(existing) - len(preserved), 0) if full_refresh else 0
    by_source: dict[str, LiveMatch] = {match_merge_key(match): match for match in preserved if full_refresh}
    if not full_refresh:
        by_source = {match_merge_key(match): match for match in existing}
    created = 0
    updated = 0
    for match in imported:
        key = match_merge_key(match)
        current = by_source.get(key)
        if current and (current.importStatus == "edited" or current.adminLocked):
            continue
        if current:
            updated += 1
        else:
            created += 1
        by_source[key] = match
    return sorted(by_source.values(), key=lambda item: item.date, reverse=True), {"created": created, "updated": updated, "staleRemoved": stale}


def filter_hlohovec_matches(matches: list[LiveMatch]) -> list[LiveMatch]:
    return [match for match in matches if is_hlohovec_match(match)]


def filter_hlohovec_teams(teams: list[Any]) -> list[Any]:
    definitions = get_hlohovec_team_definitions()
    allowed_pairs = {(item["leagueId"], item["id"]) for item in definitions}
    allowed_categories = {item["category"] for item in definitions}
    rows = [
        team for team in teams
        if (getattr(team, "externalLeagueId", None), getattr(team, "externalTeamId", None)) in allowed_pairs
        or getattr(team, "category", "") in allowed_categories
        or getattr(team, "name", "") in allowed_categories
    ]
    if rows:
        return rows
    return build_official_teams([])


def match_merge_key(match: LiveMatch) -> str:
    if match.importKey:
        return match.importKey
    source_id = extract_match_source_id(match.sourceUrl)
    if source_id:
        return f"source:{source_id}"
    return "match:" + "|".join([
        normalize_match_text(match.home),
        normalize_match_text(match.away),
        normalize_match_text(match.date),
        normalize_match_text(match.competition or match.league),
        normalize_match_text(match.round),
    ])


def extract_match_source_id(source_url: str) -> str:
    import re

    match = re.search(r"/match/detail/(\d+)", source_url or "")
    return match.group(1) if match else ""


def normalize_match_text(value: str) -> str:
    import unicodedata

    text = unicodedata.normalize("NFKD", value or "")
    return "".join(char for char in text if not unicodedata.combining(char)).lower().strip()


def is_real_player_name(value: str) -> bool:
    name = normalize_match_text(value)
    return bool(name) and name not in {"nikto", "nobody", "neznamy", "neznama", "-", "x"}


def normalize_season_text(value: str) -> str:
    import re

    text = (value or "").replace("–", "-").replace("—", "-")
    match = re.search(r"(20\d{2})\s*[/\-]\s*(20\d{2})", text)
    if match:
        return f"{match.group(1)}/{match.group(2)}"
    date_match = re.search(r"(\d{1,2})\.(\d{1,2})\.(20\d{2})", text)
    if date_match:
        year = int(date_match.group(3))
        month = int(date_match.group(2))
        start_year = year if month >= 7 else year - 1
        return f"{start_year}/{start_year + 1}"
    iso_match = re.search(r"(20\d{2})-(\d{2})-(\d{2})", text)
    if iso_match:
        year = int(iso_match.group(1))
        month = int(iso_match.group(2))
        start_year = year if month >= 7 else year - 1
        return f"{start_year}/{start_year + 1}"
    return normalize_match_text(text)


def normalize_match_competition(value: str) -> str:
    text = normalize_match_text(value)
    if "dorast" in text:
        return "Dorast"
    if "extraliga" in text and any(token in text for token in ["zen", "zenska", "zeny"]):
        return "Extraliga ženy"
    if "extraliga" in text:
        return "Extraliga muži"
    if any(token in text for token in ["3. liga", "3 liga", "iii liga", "3.kl", "3kl", "tretia"]):
        return "3. liga"
    if any(token in text for token in ["2. liga", "2 liga", "ii liga", "2.kl", "2kl", "druha"]):
        return "2. liga"
    return ""


def sortable_match_date(value: str) -> str:
    import re

    match = re.search(r"(\d{1,2})\.(\d{1,2})\.(20\d{2})", value or "")
    if match:
        return f"{match.group(3)}-{int(match.group(2)):02d}-{int(match.group(1)):02d}"
    return value or ""


def parse_capacity(capacity: str) -> int:
    digits = "".join(char for char in capacity if char.isdigit())
    return int(digits) if digits else 0


def cancellation_status(registration: TournamentRegistration, tournament: Any | None) -> str:
    if registration.paymentStatus == "free":
        return "cancelled"
    if not tournament:
        return "no_refund"
    start_date = getattr(tournament, "dateFrom", "") or str(tournament.date).split(" - ")[0]
    starts_at = parse_tournament_datetime(str(start_date), str(tournament.time))
    if not starts_at:
        return "no_refund"
    hours_until = (starts_at - datetime.now(timezone.utc)).total_seconds() / 3600
    return "refund_due" if hours_until >= 48 else "no_refund"


def parse_tournament_datetime(date_text: str, time_text: str) -> datetime | None:
    normalized = date_text.strip().lower()
    months = {
        "január": "01",
        "február": "02",
        "marec": "03",
        "apríl": "04",
        "máj": "05",
        "jún": "06",
        "júl": "07",
        "august": "08",
        "september": "09",
        "október": "10",
        "november": "11",
        "december": "12",
    }
    for month, number in months.items():
        normalized = normalized.replace(month, number)
    normalized = normalized.replace(".", " ").replace(",", " ")
    parts = [part for part in normalized.split() if part]
    candidates = []
    if len(parts) >= 3:
        candidates.append(f"{parts[0]}.{parts[1]}.{parts[2]} {time_text}")
    candidates.append(f"{date_text} {time_text}")
    for candidate in candidates:
        for fmt in ("%d.%m.%Y %H:%M", "%d %m %Y %H:%M", "%Y-%m-%d %H:%M"):
            try:
                return datetime.strptime(candidate, fmt).replace(tzinfo=timezone.utc)
            except ValueError:
                continue
    return None
