from datetime import datetime
from typing import Any

import stripe
from fastapi import Depends, FastAPI, HTTPException, Query, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware

from app.auth import authenticate, clear_session_cookies, read_request_session, require_admin, set_session_cookie
from app.config import get_settings
from app.kolky_importer import import_hlohovec_matches
from app.models import CheckoutBody, LiveClubData, LiveMatch, LoginBody, RegistrationCreate, TournamentRegistration
from app.storage import read_club_data, read_registrations, write_club_data, write_registrations

settings = get_settings()

app = FastAPI(
    title="KK Hlohovec API",
    version="0.1.0",
    description="FastAPI backend for KK Hlohovec website, admin CRUD, registrations, payments and kolky.sk import.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin, "http://127.0.0.1:3003", "http://localhost:3003"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, Any]:
    return {"ok": True, "service": "kkhc-fastapi", "time": datetime.utcnow().isoformat()}


@app.get("/api/club-data")
def get_club_data() -> dict[str, Any]:
    return {"ok": True, "data": read_club_data()}


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
def get_tournament_registrations(tournamentId: int | None = Query(default=None)) -> dict[str, Any]:
    rows = read_registrations()
    if tournamentId:
        rows = [row for row in rows if row.tournamentId == tournamentId]
    return {"ok": True, "data": rows}


@app.post("/api/tournament-registrations")
def create_tournament_registration(body: RegistrationCreate) -> dict[str, Any]:
    rows = read_registrations()
    registration = TournamentRegistration(
        **body.model_dump(),
        id=int(datetime.utcnow().timestamp() * 1000),
        createdAt=datetime.utcnow().isoformat(),
    )
    write_registrations([registration, *rows])
    return {"ok": True, "data": registration}


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


@app.post("/api/auth/login")
def login(body: LoginBody, response: Response) -> dict[str, Any]:
    user = authenticate(body.email, body.password)
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
) -> dict[str, Any]:
    supplied_secret = request.query_params.get("secret") or request.headers.get("x-kkhc-import-secret")
    if settings.kolky_import_secret and supplied_secret != settings.kolky_import_secret:
        require_admin(request)

    data = read_club_data()
    result = await import_hlohovec_matches([url] if url else None, from_date=from_date, to_date=to_date, query=query)
    imported = result["imported"]
    merged = merge_matches(data.matches, imported)
    updated = data.model_copy(update={"matches": merged})
    write_club_data(updated)

    return {
        "ok": True,
        "source": "https://vysledky.kolky.sk",
        "from": result["from"],
        "to": result["to"],
        "query": result["query"],
        "importedCount": len(imported),
        "checkedUrls": result["checkedUrls"],
        "warnings": result["warnings"],
        "matches": imported,
    }


@app.get("/api/import/kolky")
async def import_kolky_get(
    request: Request,
    url: str | None = Query(default=None),
    from_date: str | None = Query(default=None, alias="from"),
    to_date: str | None = Query(default=None, alias="to"),
    query: str | None = Query(default=None),
) -> dict[str, Any]:
    return await import_kolky(request, url=url, from_date=from_date, to_date=to_date, query=query)


def merge_matches(existing: list[LiveMatch], imported: list[LiveMatch]) -> list[LiveMatch]:
    by_source: dict[str, LiveMatch] = {match.sourceUrl or str(match.id): match for match in existing}
    for match in imported:
        key = match.sourceUrl or str(match.id)
        current = by_source.get(key)
        by_source[key] = current if current and current.importStatus == "edited" else match
    return sorted(by_source.values(), key=lambda item: item.date, reverse=True)

