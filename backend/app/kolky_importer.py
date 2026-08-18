import asyncio
import json
import re
import unicodedata
from datetime import date, datetime
from hashlib import sha1
from html import unescape
from pathlib import Path
from urllib.parse import urljoin, unquote

import httpx

from backend.app.config import get_settings
from backend.app.models import LiveMatch, LivePlayer, LiveStandingRow, LiveTeam, MatchPlayerStat, MatchTeamStats

DEFAULT_IMPORT_URLS = [
    "https://vysledky.kolky.sk/match/detail/43531/KO-Zarnovica-vs-KKZ-Hlohovec-A"
]
KOLKY_API_URL = "https://api.vysledky.kolky.sk/"
KOLKY_APP_ACCESS_TOKEN = "SK-98b7dd25-b672-4684-b3f8-8336adf6e1dc"
MATCH_DETAIL_FIELDS = [
    "league",
    "details",
    "teams",
    "teams.club",
    "results",
    "results.lanes",
    "referee",
    "substitutions",
    "sprint",
    "hall",
    "hall.parent",
    "cards",
    "cards.player",
]
SCHEDULE_FIELDS = [
    "league",
    "rounds",
    "rounds.matches",
    "rounds.matches.homeTeam",
    "rounds.matches.awayTeam",
    "rounds.matches.teamResult",
    "matches",
    "matches.homeTeam",
    "matches.awayTeam",
    "matches.teamResult",
    "schedule",
    "schedule.matches",
    "results",
    "results.homeTeam",
    "results.awayTeam",
    "homeTeam",
    "awayTeam",
    "teamResult",
    "hall",
]
MAX_DISCOVERED_URLS = 250
ID_SCAN_CONCURRENCY = 8
SCHEDULE_PAGE_LIMIT = 40
SCHEDULE_ROUND_SCAN_LIMIT = 40
SUSPICIOUS_SEASON_MATCH_COUNT = 8
PROJECT_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_CACHE_FILE = "fixtures/kolky-hlohovec-matches.json"
ALLOWED_COMPETITIONS = ["Extraliga muži", "Extraliga ženy", "2. liga", "3. liga", "Dorast"]
CURRENT_SEASON = "2025/2026"
TEAM_DISCOVERY_FIELDS = [
    "league",
    "team",
    "matches",
    "results",
    "schedule",
    "rounds",
    "table",
]
HLOHOVEC_TEAM_DEFINITIONS = [
    {
        "id": 4855,
        "slug": "extraliga-muzi",
        "name": "KKZ Hlohovec A",
        "category": "Extraliga muži",
        "leagueId": 355,
        "sourceSlug": "KKZ-Hlohovec-A",
        "description": "Mužský A-tím KKZ Hlohovec v najvyššej slovenskej súťaži.",
    },
    {
        "id": 4865,
        "slug": "extraliga-zeny",
        "name": "KKZ Hlohovec",
        "category": "Extraliga ženy",
        "leagueId": 356,
        "sourceSlug": "KKZ-Hlohovec",
        "description": "Ženský extraligový tím reprezentujúci Hlohovec v najvyššej súťaži.",
    },
    {
        "id": 4889,
        "slug": "druha-liga",
        "name": "KKZ Hlohovec B",
        "category": "2. liga",
        "leagueId": 359,
        "sourceSlug": "KKZ-Hlohovec-B",
        "description": "B-tím v 2. lige prepája skúsených hráčov s novými členmi.",
    },
    {
        "id": 4925,
        "slug": "tretia-liga",
        "name": "KKZ Hlohovec C",
        "category": "3. liga",
        "leagueId": 362,
        "sourceSlug": "KKZ-Hlohovec-C",
        "description": "C-tím v 3. lige dáva priestor hráčom, ktorí chcú pravidelne hrávať.",
    },
    {
        "id": 4923,
        "slug": "dorast",
        "name": "KKZ Hlohovec",
        "category": "Dorast",
        "leagueId": 361,
        "sourceSlug": "KKZ-Hlohovec",
        "description": "Dorastenecký tím pre mladých hráčov a hráčky, ktorí zbierajú súťažné skúsenosti.",
    },
]
HLOHOVEC_TEAM_KEYS = {(item["leagueId"], item["id"]): item for item in HLOHOVEC_TEAM_DEFINITIONS}
HLOHOVEC_TEAM_IDS = {item["id"] for item in HLOHOVEC_TEAM_DEFINITIONS}
HLOHOVEC_LEAGUE_IDS = {item["leagueId"] for item in HLOHOVEC_TEAM_DEFINITIONS}


async def import_hlohovec_matches(
    manual_urls: list[str] | None = None,
    from_date: str | None = None,
    to_date: str | None = None,
    query: str | None = None,
    mode: str = "live",
    cache_file: str | None = None,
    fallback_fixture: bool = False,
    id_from: int | None = None,
    id_to: int | None = None,
) -> dict:
    settings = get_settings()
    start = normalize_iso_date(from_date or settings.kolky_import_from)
    end = normalize_iso_date(to_date or settings.kolky_import_to or date.today().isoformat())
    search = query or settings.kolky_import_query
    logs: list[dict] = []

    if mode == "fixture":
        imported = filter_matches_by_range(read_fixture_matches(logs), start, end, search)
        return result_for(imported, ["fixtures/kolky-hlohovec-matches.json"], [], logs, start, end, search, mode)

    if mode == "cache":
        selected_cache_file = cache_file or settings.kolky_import_cache_file or DEFAULT_CACHE_FILE
        imported = filter_matches_by_range(read_cached_matches(selected_cache_file, logs), start, end, search)
        return result_for(imported, [selected_cache_file], [], logs, start, end, search, mode)

    imported: list[LiveMatch] = []
    warnings: list[str] = []

    async with httpx.AsyncClient(timeout=20, headers={
        "user-agent": "KKHlohovecWebsiteBot/1.0",
        "content-type": "application/json",
        "x-app-accesstoken": KOLKY_APP_ACCESS_TOKEN,
    }) as client:
        schedule_matches, schedule_checked_urls = await discover_complete_hlohovec_schedule(client, start, end, logs)
        imported.extend(schedule_matches)
        if manual_urls:
            urls = unique(manual_urls)
        elif schedule_matches:
            urls = unique([
                match.sourceUrl
                for match in schedule_matches
                if "/match/detail/" in (match.sourceUrl or "")
            ])
        else:
            urls = unique(await discover_import_urls(search, logs, id_from=id_from, id_to=id_to, client=client))
        logs.append({"level": "info", "type": "import", "message": f"Starting detail enrichment. Checking {len(urls)} match detail URLs after schedule discovery."})
        for batch in chunks(urls, ID_SCAN_CONCURRENCY):
            results = await asyncio.gather(
                *[fetch_match(client, url, search, start, end, bool(manual_urls), logs) for url in batch],
                return_exceptions=True,
            )
            for result in results:
                if isinstance(result, Exception):
                    warnings.append(str(result))
                elif isinstance(result, LiveMatch):
                    imported.append(result)
                elif isinstance(result, str) and result:
                    warnings.append(result)

    imported, duplicates_removed = unique_matches(imported, logs)
    checked_sources = unique([*schedule_checked_urls, *urls])

    if not imported and fallback_fixture:
        logs.append({"level": "warning", "type": "fixture", "message": "Live import found no matches. Using development fixture fallback."})
        imported.extend(filter_matches_by_range(read_fixture_matches(logs), start, end, search))

    return result_for(imported, checked_sources, warnings, logs, start, end, search, mode, duplicates_removed)


async def sync_hlohovec_club_data(
    from_date: str | None = None,
    to_date: str | None = None,
    mode: str = "live",
    cache_file: str | None = None,
    id_from: int | None = None,
    id_to: int | None = None,
) -> dict:
    logs: list[dict] = [{
        "level": "info",
        "type": "sync",
        "message": "Starting KKZ Hlohovec sync for the five approved team/league pairs.",
        "teams": [{"leagueId": item["leagueId"], "teamId": item["id"], "category": item["category"]} for item in HLOHOVEC_TEAM_DEFINITIONS],
    }]
    result = await import_hlohovec_matches(
        manual_urls=None,
        from_date=from_date or "2025-07-01",
        to_date=to_date or "2027-06-30",
        query="Hlohovec",
        mode=mode,
        cache_file=cache_file,
        fallback_fixture=False,
        id_from=id_from,
        id_to=id_to,
    )
    logs.extend(result.get("logs", []))
    matches = [match for match in result["imported"] if is_hlohovec_match(match)]
    teams = build_official_teams(matches)
    players = build_players_from_matches(matches)
    standings = build_standings_from_matches(matches)
    team_results = build_team_sync_results(matches, logs)
    errors = [log.get("message", "") for log in logs if log.get("level") == "error"]

    logs.append({
        "level": "info",
        "type": "sync_summary",
        "message": f"KKZ sync completed: teams={len(teams)}, players={len(players)}, matches={len(matches)}, standings={len(standings)}, errors={len(errors)}.",
        "teams": len(teams),
        "players": len(players),
        "matches": len(matches),
        "standings": len(standings),
        "errors": len(errors),
    })

    return {
        "ok": bool(matches) and not errors and result.get("status") != "failed",
        "status": "partial" if matches and errors else "synced" if matches else "failed",
        "mode": result.get("mode"),
        "from": result.get("from"),
        "to": result.get("to"),
        "teams": teams,
        "players": players,
        "matches": matches,
        "standings": standings,
        "errors": errors,
        "team_results": team_results,
        "logs": logs,
        "checkedUrls": result.get("checkedUrls", []),
        "counts": {
            "teams": len(teams),
            "players": len(players),
            "matches": len(matches),
            "standings": len(standings),
            "errors": len(errors),
        },
    }


def result_for(
    imported: list[LiveMatch],
    checked_urls: list[str],
    warnings: list[str],
    logs: list[dict],
    start: date,
    end: date,
    search: str,
    mode: str,
    duplicates_removed: int = 0,
) -> dict:
    by_competition: dict[str, int] = {}
    for match in imported:
        competition = match.competition or canonical_competition_name(match.league) or "Nezaradené"
        by_competition[competition] = by_competition.get(competition, 0) + 1
    logs.append({
        "level": "info",
        "type": "summary",
        "message": f"Parsed {len(imported)} matches from {len(checked_urls)} requested URLs. Removed {duplicates_removed} duplicates.",
        "parsedMatches": len(imported),
        "checkedUrlCount": len(checked_urls),
        "duplicatesRemoved": duplicates_removed,
        "byCompetition": by_competition,
    })
    if not imported:
        has_errors = any(log.get("level") == "error" for log in logs)
        logs.append({
            "level": "error" if has_errors else "warning",
            "type": "no_match",
            "message": "Live crawler failed. No real matches were imported." if mode == "live" else "Import finished with zero matches. No site data was silently changed.",
        })
    if not warnings:
        warnings = [log["message"] for log in logs if log.get("level") != "info"]
    has_errors = any(log.get("level") == "error" for log in logs)
    status_value = "partial" if imported and has_errors else "imported" if imported else "failed" if has_errors else "no_matches"
    return {
        "imported": imported,
        "checkedUrls": checked_urls,
        "warnings": warnings,
        "logs": logs,
        "status": status_value,
        "mode": mode,
        "from": start.isoformat(),
        "to": end.isoformat(),
        "query": search,
        "scanned": len(checked_urls),
        "found": len(imported),
        "duplicatesRemoved": duplicates_removed,
        "byCompetition": by_competition,
    }


async def discover_complete_hlohovec_schedule(
    client: httpx.AsyncClient,
    start: date,
    end: date,
    logs: list[dict],
) -> tuple[list[LiveMatch], list[str]]:
    global_matches, global_checked_urls = await discover_global_match_list_schedule(client, start, end, logs)
    if global_matches:
        return global_matches, global_checked_urls

    matches: list[LiveMatch] = []
    checked_urls: list[str] = []
    for team in HLOHOVEC_TEAM_DEFINITIONS:
        team_matches, team_checked_urls = await discover_league_schedule_for_team(client, team, start, end, logs)
        matches.extend(team_matches)
        checked_urls.extend(team_checked_urls)
    return matches, unique(checked_urls)


async def discover_global_match_list_schedule(
    client: httpx.AsyncClient,
    start: date,
    end: date,
    logs: list[dict],
) -> tuple[list[LiveMatch], list[str]]:
    api_url = f"{KOLKY_API_URL}match/list"
    checked_urls = [api_url]
    payload = {"fields": SCHEDULE_FIELDS}
    try:
        response = await client.post(api_url, json=payload, timeout=80)
        logs.append({
            "level": "info",
            "type": "global_match_list_request",
            "message": f"Requested {api_url} -> HTTP {response.status_code}.",
            "url": api_url,
            "status": response.status_code,
            "payload": compact_probe_payload(payload),
            "responseLength": len(response.text),
        })
        if response.status_code >= 400:
            return [], checked_urls
        try:
            data = response.json()
        except ValueError:
            logs.append({
                "level": "error",
                "type": "invalid_json",
                "message": f"{api_url} returned invalid JSON.",
                "url": api_url,
                "status": response.status_code,
            })
            return [], checked_urls
    except Exception as exc:  # noqa: BLE001
        logs.append(classify_fetch_error(exc, api_url))
        return [], checked_urls

    raw_rows = data.get("list") if isinstance(data, dict) else data
    if not isinstance(raw_rows, list):
        logs.append({
            "level": "error",
            "type": "invalid_html",
            "message": "match/list did not return a list of matches.",
            "url": api_url,
        })
        return [], checked_urls

    normalized_rows: list[dict] = []
    for raw in raw_rows:
        if not isinstance(raw, dict):
            continue
        league_id = to_int(raw.get("leagueId") or raw.get("league_id") or (raw.get("league") or {}).get("id"))
        if league_id not in HLOHOVEC_LEAGUE_IDS:
            continue
        normalized = normalize_schedule_match_payload(raw, league_id)
        if normalized:
            normalized_rows.append(normalized)

    parsed_matches: list[LiveMatch] = []
    for team in HLOHOVEC_TEAM_DEFINITIONS:
        league_rows = [row for row in normalized_rows if (extract_league_id(row) or team["leagueId"]) == team["leagueId"]]
        team_rows = [row for row in league_rows if schedule_payload_belongs_to_team(row, team)]
        team_matches: list[LiveMatch] = []
        round_numbers: set[int] = set()
        for row in team_rows:
            round_number = to_int(row.get("round"))
            if round_number is not None:
                round_numbers.add(round_number)
            match = parse_schedule_match_payload(row, team, logs)
            parsed_date = parse_slovak_date(match.date)
            if parsed_date and not (start <= parsed_date <= end):
                continue
            team_matches.append(match)
        team_matches, duplicates_removed = unique_matches(team_matches, logs)
        parsed_matches.extend(team_matches)
        logs.append({
            "level": "info",
            "type": "league_schedule_summary",
            "message": f"{team['category']}: global match/list parsed {len(league_rows)} league rows and kept {len(team_matches)} Hlohovec matches by team id.",
            "category": team["category"],
            "leagueId": team["leagueId"],
            "teamId": team["id"],
            "availableRoundsDiscovered": sorted(round_numbers),
            "availableRoundsCount": len(round_numbers),
            "leagueMatchResponsesDiscovered": 1,
            "allLeagueMatchesParsed": len(league_rows),
            "hlohovecMatchesAfterIdFiltering": len(team_matches),
            "duplicatesRemoved": duplicates_removed,
            "invalidResponses": 0,
            "checkedUrlCount": len(checked_urls),
        })
        if 0 < len(team_matches) < SUSPICIOUS_SEASON_MATCH_COUNT:
            logs.append({
                "level": "warning",
                "type": "suspicious_low_match_count",
                "message": f"{team['category']}: only {len(team_matches)} Hlohovec matches were discovered from global match/list.",
                "category": team["category"],
                "leagueId": team["leagueId"],
                "teamId": team["id"],
                "matches_found": len(team_matches),
            })

    parsed_matches, duplicates_removed = unique_matches(parsed_matches, logs)
    logs.append({
        "level": "info",
        "type": "global_match_list_summary",
        "message": f"Global match/list kept {len(parsed_matches)} Hlohovec matches from {len(normalized_rows)} rows in approved leagues.",
        "approvedLeagueRows": len(normalized_rows),
        "hlohovecMatches": len(parsed_matches),
        "duplicatesRemoved": duplicates_removed,
    })
    return parsed_matches, checked_urls


async def discover_league_schedule_for_team(
    client: httpx.AsyncClient,
    team: dict,
    start: date,
    end: date,
    logs: list[dict],
) -> tuple[list[LiveMatch], list[str]]:
    checked_urls: list[str] = []
    all_league_matches: list[dict] = []
    unique_payload_keys: set[str] = set()
    round_numbers: set[int] = set()
    response_count = 0
    invalid_response_count = 0

    probes = build_league_schedule_probes(team)
    page_probe_signatures: set[str] = set()
    empty_pages_in_a_row = 0

    while probes:
        path, payload = probes.pop(0)
        api_url = f"{KOLKY_API_URL}{path}"
        checked_urls.append(api_url)
        try:
            response = await client.post(api_url, json=payload)
            response_count += 1
            logs.append({
                "level": "info",
                "type": "league_schedule_request",
                "message": f"{team['category']}: requested {api_url} -> HTTP {response.status_code}.",
                "category": team["category"],
                "leagueId": team["leagueId"],
                "teamId": team["id"],
                "url": api_url,
                "status": response.status_code,
                "payload": compact_probe_payload(payload),
                "responseLength": len(response.text),
            })
            if response.status_code >= 400:
                continue
            try:
                data = response.json()
            except ValueError:
                invalid_response_count += 1
                logs.append({
                    "level": "warning",
                    "type": "invalid_json",
                    "message": f"{team['category']}: {api_url} returned invalid JSON for schedule probe.",
                    "category": team["category"],
                    "leagueId": team["leagueId"],
                    "teamId": team["id"],
                    "url": api_url,
                    "status": response.status_code,
                })
                continue

            extracted = extract_schedule_match_payloads(data, team["leagueId"])
            discovered_rounds = extract_round_numbers(data)
            before_rounds = len(round_numbers)
            round_numbers.update(discovered_rounds)
            for item in extracted:
                key = schedule_payload_key(item, team["leagueId"])
                if key in unique_payload_keys:
                    continue
                unique_payload_keys.add(key)
                all_league_matches.append(item)

            if discovered_rounds and len(round_numbers) > before_rounds:
                for round_number in sorted(discovered_rounds):
                    for round_probe in build_round_schedule_probes(team, round_number):
                        if probe_signature(round_probe) not in page_probe_signatures:
                            page_probe_signatures.add(probe_signature(round_probe))
                            probes.append(round_probe)

            if has_pagination_hint(data):
                page = to_int(payload.get("page")) or 1
                if page < SCHEDULE_PAGE_LIMIT:
                    next_probe = (path, {**payload, "page": page + 1})
                    signature = probe_signature(next_probe)
                    if signature not in page_probe_signatures:
                        page_probe_signatures.add(signature)
                        probes.append(next_probe)

            empty_pages_in_a_row = empty_pages_in_a_row + 1 if not extracted else 0
            if empty_pages_in_a_row >= 5 and all(to_int(probe[1].get("page")) for probe in probes[:5]):
                logs.append({
                    "level": "info",
                    "type": "pagination_stop",
                    "message": f"{team['category']}: stopped schedule pagination after repeated empty pages.",
                    "category": team["category"],
                    "leagueId": team["leagueId"],
                    "teamId": team["id"],
                })
                probes = [probe for probe in probes if not to_int(probe[1].get("page"))]
        except Exception as exc:  # noqa: BLE001
            logs.append(classify_fetch_error(exc, api_url) | {
                "category": team["category"],
                "leagueId": team["leagueId"],
                "teamId": team["id"],
                "payload": compact_probe_payload(payload),
            })

    hlohovec_payloads = [
        item for item in all_league_matches
        if schedule_payload_belongs_to_team(item, team)
    ]
    parsed_matches: list[LiveMatch] = []
    for item in hlohovec_payloads:
        match = parse_schedule_match_payload(item, team, logs)
        parsed_date = parse_slovak_date(match.date)
        if parsed_date and not (start <= parsed_date <= end):
            continue
        parsed_matches.append(match)

    parsed_matches, duplicates_removed = unique_matches(parsed_matches, logs)
    summary = {
        "level": "info",
        "type": "league_schedule_summary",
        "message": f"{team['category']}: schedule discovery parsed {len(all_league_matches)} league rows and kept {len(parsed_matches)} Hlohovec matches by team id.",
        "category": team["category"],
        "leagueId": team["leagueId"],
        "teamId": team["id"],
        "availableRoundsDiscovered": sorted(round_numbers),
        "availableRoundsCount": len(round_numbers),
        "leagueMatchResponsesDiscovered": response_count,
        "allLeagueMatchesParsed": len(all_league_matches),
        "hlohovecMatchesAfterIdFiltering": len(parsed_matches),
        "duplicatesRemoved": duplicates_removed,
        "invalidResponses": invalid_response_count,
        "checkedUrlCount": len(set(checked_urls)),
    }
    logs.append(summary)
    if 0 < len(parsed_matches) < SUSPICIOUS_SEASON_MATCH_COUNT:
        logs.append({
            "level": "warning",
            "type": "suspicious_low_match_count",
            "message": f"{team['category']}: only {len(parsed_matches)} Hlohovec matches were discovered for the full season. Verify round/pagination discovery.",
            "category": team["category"],
            "leagueId": team["leagueId"],
            "teamId": team["id"],
            "matches_found": len(parsed_matches),
        })
    if not parsed_matches:
        logs.append({
            "level": "error",
            "type": "league_schedule_empty",
            "message": f"{team['category']}: no Hlohovec matches were discovered from complete league schedule probes.",
            "category": team["category"],
            "leagueId": team["leagueId"],
            "teamId": team["id"],
        })
    return parsed_matches, unique(checked_urls)


def build_league_schedule_probes(team: dict) -> list[tuple[str, dict]]:
    base_payloads = [
        {"id": team["leagueId"], "fields": SCHEDULE_FIELDS},
        {"leagueId": team["leagueId"], "fields": SCHEDULE_FIELDS},
        {"league_id": team["leagueId"], "fields": SCHEDULE_FIELDS},
        {"id": team["leagueId"], "season": CURRENT_SEASON, "fields": SCHEDULE_FIELDS},
        {"leagueId": team["leagueId"], "season": CURRENT_SEASON, "fields": SCHEDULE_FIELDS},
        {"leagueId": team["leagueId"], "seasonName": CURRENT_SEASON, "fields": SCHEDULE_FIELDS},
        {"leagueId": team["leagueId"], "season": CURRENT_SEASON, "teamId": team["id"], "fields": SCHEDULE_FIELDS},
        {"teamId": team["id"], "leagueId": team["leagueId"], "season": CURRENT_SEASON, "fields": SCHEDULE_FIELDS},
    ]
    paths = [
        "league/detail",
        "league/matches",
        "league/schedule",
        "league/results",
        "league/rounds",
        "match/list",
        "matches/list",
        "schedule/list",
        "competition/matches",
    ]
    probes = [(path, payload) for path in paths for payload in base_payloads]
    for page in range(1, 4):
        probes.extend([
            ("match/list", {"leagueId": team["leagueId"], "season": CURRENT_SEASON, "page": page, "fields": SCHEDULE_FIELDS}),
            ("league/matches", {"leagueId": team["leagueId"], "season": CURRENT_SEASON, "page": page, "fields": SCHEDULE_FIELDS}),
        ])
    for round_number in range(1, SCHEDULE_ROUND_SCAN_LIMIT + 1):
        probes.extend(build_round_schedule_probes(team, round_number))
    return dedupe_probes(probes)


def build_round_schedule_probes(team: dict, round_number: int) -> list[tuple[str, dict]]:
    return [
        ("match/list", {"leagueId": team["leagueId"], "season": CURRENT_SEASON, "round": round_number, "fields": SCHEDULE_FIELDS}),
        ("match/list", {"leagueId": team["leagueId"], "season": CURRENT_SEASON, "roundNumber": round_number, "fields": SCHEDULE_FIELDS}),
        ("league/matches", {"leagueId": team["leagueId"], "season": CURRENT_SEASON, "round": round_number, "fields": SCHEDULE_FIELDS}),
        ("league/schedule", {"leagueId": team["leagueId"], "season": CURRENT_SEASON, "round": round_number, "fields": SCHEDULE_FIELDS}),
    ]


def dedupe_probes(probes: list[tuple[str, dict]]) -> list[tuple[str, dict]]:
    seen: set[str] = set()
    result: list[tuple[str, dict]] = []
    for probe in probes:
        signature = probe_signature(probe)
        if signature in seen:
            continue
        seen.add(signature)
        result.append(probe)
    return result


def probe_signature(probe: tuple[str, dict]) -> str:
    path, payload = probe
    return f"{path}:{json.dumps(payload, sort_keys=True, ensure_ascii=False)}"


def compact_probe_payload(payload: dict) -> dict:
    compact = dict(payload)
    if "fields" in compact:
        compact["fields"] = f"{len(compact['fields'])} fields"
    return compact


def extract_schedule_match_payloads(payload, league_id: int) -> list[dict]:
    rows: list[dict] = []
    seen: set[str] = set()

    def visit(value) -> None:
        if isinstance(value, dict):
            normalized = normalize_schedule_match_payload(value, league_id)
            if normalized:
                key = schedule_payload_key(normalized, league_id)
                if key not in seen:
                    seen.add(key)
                    rows.append(normalized)
            for child in value.values():
                visit(child)
        elif isinstance(value, list):
            for child in value:
                visit(child)

    visit(payload)
    return rows


def normalize_schedule_match_payload(value: dict, league_id: int) -> dict | None:
    home_team = extract_schedule_team(value, "home")
    away_team = extract_schedule_team(value, "away")
    if not home_team or not away_team:
        return None

    match_id = first_available(value, ["id", "matchId", "match_id", "matchID"])
    round_number = first_available(value, ["round", "roundNumber", "round_number", "roundNo", "kolo"])
    start_date = first_available(value, ["startDate", "date", "matchDate", "scheduledAt", "playedAt", "datetime", "created"])
    status = first_available(value, ["status", "state", "matchStatus"]) or ""
    hall = first_available(value, ["hall", "place", "venue", "arena", "location"]) or {}
    league = value.get("league") if isinstance(value.get("league"), dict) else {"id": league_id, "name": first_available(value, ["leagueName", "competition", "competitionName"]) or ""}
    team_result = normalize_schedule_team_result(value)
    line_up = value.get("lineUp") or value.get("lineup") or value.get("players") or {}

    return {
        **value,
        "id": match_id,
        "round": round_number,
        "startDate": start_date,
        "status": normalize_schedule_status(status, team_result),
        "league": {**league, "id": extract_league_id({"league": league}) or league_id},
        "homeTeam": home_team,
        "awayTeam": away_team,
        "teamResult": team_result,
        "lineUp": line_up if isinstance(line_up, dict) else {},
        "hall": hall if isinstance(hall, dict) else {"name": hall},
    }


def extract_schedule_team(value: dict, side: str) -> dict | None:
    side_keys = {
        "home": ["homeTeam", "home_team", "teamHome", "homeClub", "home", "domaci", "domaciTim"],
        "away": ["awayTeam", "away_team", "teamAway", "awayClub", "away", "hostia", "hostujuciTim"],
    }[side]
    for key in side_keys:
        candidate = value.get(key)
        if isinstance(candidate, dict):
            if "team" in candidate and isinstance(candidate["team"], dict):
                candidate = candidate["team"]
            team_id = extract_team_id(candidate)
            name = clean_text(candidate.get("name") or candidate.get("title") or candidate.get("shortName") or candidate.get("clubName"))
            if team_id is not None or name:
                return {"id": team_id, "name": name, **candidate}
        elif isinstance(candidate, str) and candidate.strip():
            return {"id": None, "name": clean_text(candidate)}

    prefixes = [side, "home" if side == "home" else "away"]
    flat_id_keys = [f"{prefix}TeamId" for prefix in prefixes] + [f"{prefix}_team_id" for prefix in prefixes] + [f"{prefix}Id" for prefix in prefixes]
    flat_name_keys = [f"{prefix}TeamName" for prefix in prefixes] + [f"{prefix}_team_name" for prefix in prefixes] + [f"{prefix}Name" for prefix in prefixes]
    team_id = first_int(value, flat_id_keys)
    name = clean_text(first_available(value, flat_name_keys) or "")
    if team_id is not None or name:
        return {"id": team_id, "name": name}
    return None


def normalize_schedule_team_result(value: dict) -> dict:
    raw = value.get("teamResult") or value.get("result") or value.get("score") or {}
    if isinstance(raw, dict) and ("home" in raw or "away" in raw):
        return raw
    home = raw.get("home") if isinstance(raw, dict) else {}
    away = raw.get("away") if isinstance(raw, dict) else {}
    if not isinstance(home, dict):
        home = {}
    if not isinstance(away, dict):
        away = {}
    home.update(extract_schedule_result_side(value, "home"))
    away.update(extract_schedule_result_side(value, "away"))
    return {"home": home, "away": away}


def extract_schedule_result_side(value: dict, side: str) -> dict:
    score_keys = {
        "home": ["homeScore", "homePoints", "homeTeamPoints", "domaciBody"],
        "away": ["awayScore", "awayPoints", "awayTeamPoints", "hostiaBody"],
    }[side]
    total_keys = {
        "home": ["homeTotal", "homePins", "homeWood", "domaciKolky"],
        "away": ["awayTotal", "awayPins", "awayWood", "hostiaKolky"],
    }[side]
    result: dict[str, object] = {}
    score = first_available(value, score_keys)
    total = first_available(value, total_keys)
    if score is not None:
        result["teamPoints"] = score
    if total is not None:
        result["total"] = total
    return result


def schedule_payload_belongs_to_team(item: dict, team: dict) -> bool:
    league_id = extract_league_id(item) or team["leagueId"]
    if league_id != team["leagueId"]:
        return False

    home_id = extract_team_id(item.get("homeTeam") or {})
    away_id = extract_team_id(item.get("awayTeam") or {})
    if home_id is not None or away_id is not None:
        return team["id"] in {home_id, away_id}

    home_name = clean_text((item.get("homeTeam") or {}).get("name") or "")
    away_name = clean_text((item.get("awayTeam") or {}).get("name") or "")
    expected = normalize_for_search(team.get("sourceSlug") or team.get("name") or "")
    return expected and expected in {normalize_for_search(home_name), normalize_for_search(away_name)}


def parse_schedule_match_payload(item: dict, team: dict, logs: list[dict]) -> LiveMatch:
    match_id = to_int(item.get("id"))
    home_team = item.get("homeTeam") or {}
    away_team = item.get("awayTeam") or {}
    home_name = clean_text(home_team.get("name") or "Domaci tim")
    away_name = clean_text(away_team.get("name") or "Hostia")
    schedule_key = schedule_payload_key(item, team["leagueId"])
    source_url = build_match_url(match_id, home_name, away_name) if match_id else f"{team_source_url(team)}#{schedule_key}"
    payload = {
        **item,
        "id": match_id or stable_id(source_url),
        "homeTeam": home_team,
        "awayTeam": away_team,
        "league": item.get("league") or {"id": team["leagueId"], "name": team["category"]},
        "teamResult": item.get("teamResult") or {"home": {}, "away": {}},
    }
    if not payload.get("startDate"):
        payload["startDate"] = item.get("date") or item.get("matchDate") or item.get("scheduledAt") or item.get("created") or ""
    match = parse_match_api_payload(source_url, payload, team["category"], logs, team)
    match.externalLeagueId = team["leagueId"]
    match.season = match.season or CURRENT_SEASON
    match.competition = team["category"]
    match.league = f"{team['category']} {match.season}".strip()
    if match.score == "-" and match.pins == "-":
        match.status = "planovane"
    return match


def schedule_payload_key(item: dict, league_id: int) -> str:
    match_id = to_int(item.get("id") or item.get("matchId") or item.get("match_id"))
    if match_id is not None:
        return f"source:{match_id}"
    home = item.get("homeTeam") or {}
    away = item.get("awayTeam") or {}
    parts = [
        str(league_id),
        str(item.get("round") or ""),
        str(item.get("startDate") or item.get("date") or ""),
        str(extract_team_id(home) or home.get("name") or ""),
        str(extract_team_id(away) or away.get("name") or ""),
    ]
    return "schedule:" + "|".join(normalize_for_search(part) for part in parts)


def extract_round_numbers(payload) -> list[int]:
    rounds: set[int] = set()

    def visit(value, parent_key: str = "") -> None:
        if isinstance(value, dict):
            for key, child in value.items():
                lower = key.lower()
                if lower in {"round", "roundnumber", "round_number", "roundno", "kolo", "number"}:
                    candidate = to_int(child)
                    if candidate is not None and 1 <= candidate <= 80:
                        rounds.add(candidate)
                visit(child, lower)
        elif isinstance(value, list):
            for child in value:
                visit(child, parent_key)

    visit(payload)
    return sorted(rounds)


def has_pagination_hint(payload) -> bool:
    found = False

    def visit(value) -> None:
        nonlocal found
        if found:
            return
        if isinstance(value, dict):
            for key, child in value.items():
                lower = key.lower()
                if lower in {"next", "nextpage", "hasnext", "hasnextpage"} and bool(child):
                    found = True
                    return
                if lower in {"totalpages", "pagecount", "lastpage"} and (to_int(child) or 0) > 1:
                    found = True
                    return
                visit(child)
        elif isinstance(value, list):
            for child in value:
                visit(child)

    visit(payload)
    return found


def normalize_schedule_status(status, team_result: dict) -> str:
    status_text = normalize_for_search(str(status or ""))
    has_score = any((team_result.get(side) or {}).get("teamPoints") is not None for side in ("home", "away"))
    if status_text in {"finished", "closed", "done", "played", "odohrane"} or has_score:
        return "finished"
    if status_text in {"new", "scheduled", "planned", "upcoming", "planovane"}:
        return "new"
    return status_text or "new"


def first_available(value: dict, keys: list[str]):
    for key in keys:
        candidate = value.get(key)
        if candidate is None:
            continue
        if isinstance(candidate, str) and candidate == "":
            continue
        return candidate
    return None


def first_int(value: dict, keys: list[str]) -> int | None:
    for key in keys:
        candidate = to_int(value.get(key))
        if candidate is not None:
            return candidate
    return None


async def discover_import_urls(
    query: str,
    logs: list[dict] | None = None,
    id_from: int | None = None,
    id_to: int | None = None,
    client: httpx.AsyncClient | None = None,
) -> list[str]:
    settings = get_settings()
    explicit_urls = split_env_list(settings.kolky_import_urls)
    if explicit_urls:
        return explicit_urls

    index_urls = split_env_list(settings.kolky_import_index_urls) or ["https://vysledky.kolky.sk/archive", "https://vysledky.kolky.sk/"]
    hrefs: list[str] = []
    seen_indexes: set[str] = set()
    queue = list(index_urls)

    owns_client = client is None
    active_client = client or httpx.AsyncClient(timeout=20, headers={"user-agent": "KKHlohovecWebsiteBot/1.0"})
    try:
        team_urls = await discover_all_team_match_urls(active_client, logs)
        hrefs.extend(team_urls)
        while queue and len(hrefs) < MAX_DISCOVERED_URLS:
            index_url = queue.pop(0)
            if index_url in seen_indexes:
                continue
            seen_indexes.add(index_url)
            try:
                response = await active_client.get(index_url)
                if logs is not None:
                    logs.append({
                        "level": "info",
                        "type": "request",
                        "message": f"Requested {index_url} -> HTTP {response.status_code}",
                        "url": index_url,
                        "status": response.status_code,
                        "responseLength": len(response.text),
                    })
                if response.status_code >= 400:
                    continue
                for href in extract_hrefs(response.text, index_url):
                    if "/match/detail/" in href:
                        hrefs.append(href)
                    elif is_useful_discovery_link(href, index_url, query) and href not in seen_indexes:
                        queue.append(href)
            except Exception as exc:  # noqa: BLE001
                if logs is not None:
                    logs.append(classify_fetch_error(exc, index_url))
                continue
    finally:
        if owns_client:
            await active_client.aclose()

    id_scan_urls = build_id_scan_urls(settings, id_from=id_from, id_to=id_to)
    return unique([*hrefs, *DEFAULT_IMPORT_URLS, *id_scan_urls])[: MAX_DISCOVERED_URLS + len(id_scan_urls)]


async def discover_all_team_match_urls(client: httpx.AsyncClient, logs: list[dict] | None = None) -> list[str]:
    urls: list[str] = []
    for team in HLOHOVEC_TEAM_DEFINITIONS:
        discovered = await discover_team_matches(client, team, logs)
        urls.extend(discovered)
    return unique(urls)


async def discover_team_matches(client: httpx.AsyncClient, team: dict, logs: list[dict] | None = None) -> list[str]:
    source_url = team_source_url(team)
    discovered: list[str] = []
    skipped: list[str] = []
    response_length = 0
    html_match_links = 0
    html_match_ids = 0
    api_match_ids = 0

    try:
        response = await client.get(source_url)
        html = response.text
        response_length = len(html)
        if logs is not None:
            logs.append({
                "level": "info",
                "type": "team_request",
                "message": f"{team['category']}: requested {source_url} -> HTTP {response.status_code}, {response_length} bytes.",
                "category": team["category"],
                "leagueId": team["leagueId"],
                "teamId": team["id"],
                "url": source_url,
                "status": response.status_code,
                "responseLength": response_length,
            })
        if response.status_code >= 400:
            message = f"{team['category']}: team page HTTP {response.status_code}."
            if logs is not None:
                logs.append({"level": "error", "type": "team_http_error", "message": message, "url": source_url, "status": response.status_code})
            return []

        links = extract_match_links_for_team(html, source_url)
        ids = extract_match_ids_from_text(html)
        html_match_links = len(links)
        html_match_ids = len(ids)
        discovered.extend(links)
        discovered.extend(match_url_from_id(match_id) for match_id in ids)
    except Exception as exc:  # noqa: BLE001
        if logs is not None:
            logs.append(classify_fetch_error(exc, source_url) | {
                "category": team["category"],
                "leagueId": team["leagueId"],
                "teamId": team["id"],
            })
        return []

    api_urls = await discover_team_matches_from_api(client, team, logs)
    api_match_ids = len(api_urls)
    discovered.extend(api_urls)
    discovered = unique(discovered)

    if not discovered:
        skipped.append("No /match/detail links or match IDs were found in HTML/API discovery.")
        if logs is not None:
            logs.append({
                "level": "error",
                "type": "team_discovery_failed",
                "message": f"{team['category']}: HTTP 200, but zero match rows were discovered. The expected match structure was not found.",
                "category": team["category"],
                "leagueId": team["leagueId"],
                "teamId": team["id"],
                "sourceUrl": source_url,
                "status": 200,
                "responseLength": response_length,
                "matchContainersFound": 0,
                "matchLinksFound": html_match_links,
                "matchIdsFound": html_match_ids,
                "apiMatchIdsFound": api_match_ids,
                "parsedMatches": 0,
                "skippedMatches": len(skipped),
                "skipReasons": skipped,
            })
    elif logs is not None:
        logs.append({
            "level": "info",
            "type": "team_discovery",
            "message": f"{team['category']}: discovered {len(discovered)} candidate match links.",
            "category": team["category"],
            "leagueId": team["leagueId"],
            "teamId": team["id"],
            "sourceUrl": source_url,
            "status": 200,
            "responseLength": response_length,
            "matchContainersFound": len(discovered),
            "matchLinksFound": html_match_links,
            "matchIdsFound": html_match_ids,
            "apiMatchIdsFound": api_match_ids,
            "parsedMatches": 0,
            "skippedMatches": 0,
            "skipReasons": [],
            "matchesDiscovered": len(discovered),
        })
    return discovered


async def discover_team_matches_from_api(client: httpx.AsyncClient, team: dict, logs: list[dict] | None = None) -> list[str]:
    urls: list[str] = []
    candidates = [
        ("team/detail", {"id": team["id"], "leagueId": team["leagueId"], "fields": TEAM_DISCOVERY_FIELDS}),
        ("team/detail", {"teamId": team["id"], "leagueId": team["leagueId"], "fields": TEAM_DISCOVERY_FIELDS}),
        ("league/team", {"teamId": team["id"], "leagueId": team["leagueId"], "fields": TEAM_DISCOVERY_FIELDS}),
        ("match/list", {"teamId": team["id"], "leagueId": team["leagueId"], "season": CURRENT_SEASON}),
    ]
    for path, payload in candidates:
        api_url = f"{KOLKY_API_URL}{path}"
        try:
            response = await client.post(api_url, json=payload)
            if logs is not None:
                logs.append({
                    "level": "info",
                    "type": "team_api_request",
                    "message": f"{team['category']}: requested {api_url} -> HTTP {response.status_code}.",
                    "category": team["category"],
                    "leagueId": team["leagueId"],
                    "teamId": team["id"],
                    "url": api_url,
                    "status": response.status_code,
                    "responseLength": len(response.text),
                })
            if response.status_code >= 400:
                continue
            try:
                payload_data = response.json()
            except ValueError:
                continue
            for match_id in extract_match_ids_from_json(payload_data):
                urls.append(match_url_from_id(match_id))
        except Exception as exc:  # noqa: BLE001
            if logs is not None:
                logs.append(classify_fetch_error(exc, api_url) | {
                    "category": team["category"],
                    "leagueId": team["leagueId"],
                    "teamId": team["id"],
                })
    return unique(urls)


async def fetch_match(
    client: httpx.AsyncClient,
    url: str,
    search: str,
    start: date,
    end: date,
    manual: bool,
    logs: list[dict],
) -> LiveMatch | str | None:
    try:
        match_id = extract_match_id(url)
        if match_id:
            return await fetch_match_from_api(client, match_id, url, search, start, end, manual, logs)

        response = await client.get(url)
        logs.append({
            "level": "info",
            "type": "request",
            "message": f"Requested {url} -> HTTP {response.status_code}",
            "url": url,
            "status": response.status_code,
        })
        if response.status_code >= 400:
            if response.status_code != 404:
                message = f"{url}: HTTP {response.status_code}"
                logs.append({"level": "warning", "type": "http_error", "message": message, "url": url})
                return message
            return ""
        html = response.text
        if not looks_like_valid_match_html(html):
            message = f"{url}: invalid HTML or no match detail content"
            logs.append({"level": "warning", "type": "invalid_html", "message": message, "url": url})
            return message
        text = strip_tags(html)
        if not contains_query(text, search) and not contains_query(url, search):
            logs.append({"level": "info", "type": "no_match", "message": "Page does not contain requested team query.", "url": url})
            return None
        parsed = parse_match_detail(url, html)
        parsed_date = parse_slovak_date(parsed.date)
        if parsed_date and not (start <= parsed_date <= end):
            return None
        if not parsed_date and not manual:
            return f"{url}: match date not found, skipped by season filter"
        logs.append({"level": "info", "type": "import", "message": f"Imported {parsed.home} vs {parsed.away}.", "url": url})
        return parsed
    except Exception as exc:  # noqa: BLE001
        log = classify_fetch_error(exc, url)
        logs.append(log)
        return log["message"]


async def fetch_match_from_api(
    client: httpx.AsyncClient,
    match_id: int,
    source_url: str,
    search: str,
    start: date,
    end: date,
    manual: bool,
    logs: list[dict],
) -> LiveMatch | str | None:
    api_url = f"{KOLKY_API_URL}match/detail"
    try:
        response = await client.post(api_url, json={"id": match_id, "fields": MATCH_DETAIL_FIELDS})
        logs.append({
            "level": "info",
            "type": "request",
            "message": f"Requested {api_url} id={match_id} -> HTTP {response.status_code}",
            "url": api_url,
            "status": response.status_code,
        })
        if response.status_code >= 400:
            message = f"{api_url} id={match_id}: HTTP {response.status_code}"
            logs.append({"level": "warning", "type": "http_error", "message": message, "url": api_url, "status": response.status_code})
            return message

        try:
            payload = response.json()
        except ValueError:
            message = f"{api_url} id={match_id}: invalid JSON response"
            logs.append({"level": "warning", "type": "invalid_html", "message": message, "url": api_url, "status": response.status_code})
            return message

        if not isinstance(payload, dict) or not payload.get("id") or not payload.get("homeTeam") or not payload.get("awayTeam"):
            logs.append({"level": "info", "type": "no_match", "message": f"API returned no match detail for id={match_id}.", "url": api_url, "status": response.status_code})
            return None

        searchable = json.dumps(payload, ensure_ascii=False)
        if not contains_query(searchable, search) and not contains_query(source_url, search):
            logs.append({"level": "info", "type": "no_match", "message": f"Match id={match_id} does not contain requested team query.", "url": source_url})
            return None

        team_meta = match_hlohovec_team(payload)
        if not team_meta:
            logs.append({
                "level": "info",
                "type": "team_skipped",
                "message": f"Match id={match_id} skipped. It is not one of the five approved KKZ Hlohovec team/league pairs.",
                "url": source_url,
                "leagueId": extract_league_id(payload),
                "homeTeamId": extract_team_id(payload.get("homeTeam") or {}),
                "awayTeamId": extract_team_id(payload.get("awayTeam") or {}),
            })
            return None

        competition = team_meta["category"]
        season = infer_season(payload.get("startDate") or payload.get("created") or "")
        if not competition:
            raw_league = str((payload.get("league") or {}).get("name") or "")
            logs.append({
                "level": "info",
                "type": "competition_skipped",
                "message": f"Match id={match_id} skipped. Competition is not enabled for KK Hlohovec import: {raw_league}",
                "url": source_url,
                "competition": raw_league,
                "season": season,
            })
            return None

        parsed = parse_match_api_payload(source_url, payload, competition, logs, team_meta)
        parsed_date = parse_slovak_date(parsed.date)
        if parsed_date and not (start <= parsed_date <= end):
            return None
        if not parsed_date and not manual:
            return f"{source_url}: match date not found, skipped by season filter"

        home_count = len(parsed.homeTeam.players) if parsed.homeTeam else 0
        away_count = len(parsed.awayTeam.players) if parsed.awayTeam else 0
        logs.append({
            "level": "info",
            "type": "import",
            "message": f"Imported {parsed.home} vs {parsed.away} ({parsed.competition}) with players {home_count}/{away_count}.",
            "url": source_url,
            "competition": parsed.competition,
            "homePlayers": home_count,
            "awayPlayers": away_count,
        })
        return parsed
    except Exception as exc:  # noqa: BLE001
        log = classify_fetch_error(exc, api_url)
        logs.append(log)
        return log["message"]


def build_id_scan_urls(settings, id_from: int | None = None, id_to: int | None = None) -> list[str]:
    start_id = id_from if id_from is not None else settings.kolky_import_id_from
    end_id = id_to if id_to is not None else settings.kolky_import_id_to
    if end_id < start_id:
        return []
    return [f"https://vysledky.kolky.sk/match/detail/{match_id}" for match_id in range(start_id, end_id + 1)]


def extract_match_id(url: str) -> int | None:
    match = re.search(r"/match/detail/(\d+)|(:^|/)(\d{4,})(:/)$", url)
    if not match:
        return None
    raw = match.group(1) or match.group(2)
    return int(raw) if raw else None


def chunks(values: list[str], size: int):
    for index in range(0, len(values), size):
        yield values[index:index + size]


def read_fixture_matches(logs: list[dict]) -> list[LiveMatch]:
    logs.append({"level": "info", "type": "fixture", "message": "Loaded development fixture matches."})
    return read_matches_from_project_json("fixtures/kolky-hlohovec-matches.json", logs)


def read_cached_matches(cache_file: str | None, logs: list[dict]) -> list[LiveMatch]:
    return read_matches_from_project_json(cache_file or DEFAULT_CACHE_FILE, logs)


def read_matches_from_project_json(relative_path: str, logs: list[dict]) -> list[LiveMatch]:
    file_path = resolve_project_file(relative_path)
    if not file_path:
        logs.append({"level": "error", "type": "cache", "message": f"Rejected cache path outside project: {relative_path}"})
        return []
    try:
        payload = json.loads(file_path.read_text(encoding="utf-8"))
        rows = payload if isinstance(payload, list) else payload.get("matches", [])
        logs.append({"level": "info", "type": "cache", "message": f"Loaded {len(rows)} cached matches from {file_path.relative_to(PROJECT_ROOT)}."})
        return [LiveMatch.model_validate({**row, "importStatus": row.get("importStatus") or "auto"}) for row in rows]
    except Exception as exc:  # noqa: BLE001
        logs.append({"level": "error", "type": "cache", "message": f"Could not read cache file inside project ({relative_path}): {exc}"})
        return []


def resolve_project_file(relative_path: str) -> Path | None:
    candidate = Path(relative_path)
    if candidate.is_absolute():
        return None
    resolved = (PROJECT_ROOT / candidate).resolve()
    return resolved if resolved == PROJECT_ROOT or PROJECT_ROOT in resolved.parents else None


def filter_matches_by_range(matches: list[LiveMatch], start: date, end: date, search: str) -> list[LiveMatch]:
    filtered: list[LiveMatch] = []
    for match in matches:
        if not contains_query(f"{match.home} {match.away} {match.league} {match.sourceUrl}", search):
            continue
        parsed_date = parse_slovak_date(match.date)
        if parsed_date and not (start <= parsed_date <= end):
            continue
        filtered.append(match)
    return filtered


def looks_like_valid_match_html(html: str) -> bool:
    normalized = strip_tags(html).lower()
    return len(html) > 200 and any(token in normalized for token in ["body", "spolu", "kolky", "priebeh"])


def classify_fetch_error(exc: Exception, url: str) -> dict:
    raw = f"{exc.__class__.__name__}: {exc}"
    lower = raw.lower()
    log_type = "blocked_connection"
    message = f"{url}: connection failed ({raw})"
    if "timeout" in lower or "timed out" in lower:
        log_type = "timeout"
        message = f"{url}: timeout while contacting vysledky.kolky.sk"
    elif "name or service not known" in lower or "getaddrinfo" in lower or "dns" in lower:
        log_type = "dns_failure"
        message = f"{url}: DNS lookup failed"
    elif "permission" in lower or "forbidden" in lower or "10013" in lower or "connecterror" in lower:
        log_type = "blocked_connection"
        message = f"{url}: blocked connection or socket permission denied"
    return {"level": "error", "type": log_type, "message": message, "url": url}


def parse_match_detail(source_url: str, html: str) -> LiveMatch:
    text = normalize_whitespace(strip_tags(html))
    title = extract_title(html) or text[:160]
    home, away = parse_teams_from_url(source_url)
    score = first_match(text, r"(:BODY\s*)(\d+(:[.,]\d+))\s*:\s*(\d+(:[.,]\d+))") or "import"
    pins = first_match(text, r"(:SPOLU|KOLKY)\s*(\d[\d\s]{2,})\s*:\s*(\d[\d\s]{2,})") or "-"
    match_date = first_match(text, r"(\d{1,2}\.\d{1,2}\.\d{4})") or ""
    round_name = first_match(text, r"(\d+\.\s*kolo)") or "Import"
    location = home or "kolky.sk"

    return LiveMatch(
        id=stable_id(source_url),
        sourceUrl=source_url,
        league="Extraliga" if "Extraliga" in title else "Import kolky.sk",
        round=round_name,
        date=match_date,
        location=location,
        home=home or "Domáci tím",
        away=away or "Hostia",
        score=score,
        pins=pins,
        status="import",
        detailRows=parse_player_rows(text),
        importedAt=datetime.utcnow().isoformat(),
        importStatus="auto",
    )


def parse_match_api_payload(source_url: str, payload: dict, competition: str, logs: list[dict], team_meta: dict | None = None) -> LiveMatch:
    home_team = payload.get("homeTeam") or {}
    away_team = payload.get("awayTeam") or {}
    hall = payload.get("hall") or {}
    team_result = payload.get("teamResult") or {}
    home_result = team_result.get("home") or {}
    away_result = team_result.get("away") or {}
    match_id = int(payload.get("id") or stable_id(source_url))
    league_id = extract_league_id(payload)
    home_team_id = extract_team_id(home_team)
    away_team_id = extract_team_id(away_team)
    home_name = clean_text(home_team.get("name") or "Domáci tím")
    away_name = clean_text(away_team.get("name") or "Hostia")
    home_points = number_to_score(home_result.get("teamPoints"))
    away_points = number_to_score(away_result.get("teamPoints"))
    home_total = number_to_score(home_result.get("total"))
    away_total = number_to_score(away_result.get("total"))
    match_url = build_match_url(match_id, home_name, away_name)
    match_date = format_api_date(payload.get("startDate") or payload.get("created") or "")
    season = infer_season(payload.get("startDate") or payload.get("created") or "")
    round_name = f"{payload.get('round')}. kolo" if payload.get("round") is not None else "Import"
    league_title = f"{competition} {season}" if season else competition
    home_stats, away_stats = parse_api_team_stats(payload, home_name, away_name, logs, match_id)
    import_key = normalized_match_key(match_url or source_url, home_name, away_name, match_date, competition, round_name)

    return LiveMatch(
        id=match_id,
        sourceUrl=match_url or source_url,
        league=league_title,
        competition=competition,
        season=season,
        round=round_name,
        date=match_date,
        location=clean_text(hall.get("name") or home_name),
        home=home_name,
        away=away_name,
        externalLeagueId=league_id,
        homeExternalTeamId=home_team_id,
        awayExternalTeamId=away_team_id,
        score=f"{home_points} : {away_points}" if home_points != "-" and away_points != "-" else "-",
        pins=f"{home_total} : {away_total}" if home_total != "-" and away_total != "-" else "-",
        status="odohrané" if payload.get("status") == "finished" else "plánované" if payload.get("status") == "new" else "import",
        detailRows=parse_api_player_rows(payload),
        homeTeam=home_stats,
        awayTeam=away_stats,
        importKey=import_key,
        importedAt=datetime.utcnow().isoformat(),
        importStatus="auto",
    )


def parse_api_player_rows(payload: dict) -> str:
    line_up = payload.get("lineUp") or {}
    rows: list[str] = []
    for side in ("home", "away"):
        for item in line_up.get(side) or []:
            player = item.get("player") or {}
            name = clean_text(" ".join(part for part in [player.get("firstName"), player.get("lastName")] if part) or item.get("specialName") or "Hráč")
            rows.append(
                " | ".join([
                    str(name),
                    number_to_score(item.get("full")),
                    number_to_score(item.get("clean")),
                    number_to_score(item.get("faults")),
                    number_to_score(item.get("total")),
                    number_to_score(item.get("setPoints")),
                    number_to_score(item.get("points")),
                ])
            )
    return "\n".join(rows)


def parse_api_team_stats(payload: dict, home_name: str, away_name: str, logs: list[dict], match_id: int) -> tuple[MatchTeamStats, MatchTeamStats]:
    line_up = payload.get("lineUp") or {}
    team_result = payload.get("teamResult") or {}
    home_players = parse_api_player_stats(line_up.get("home") or [], "home", logs, match_id)
    away_players = parse_api_player_stats(line_up.get("away") or [], "away", logs, match_id)
    if not home_players or not away_players:
        logs.append({
            "level": "warning",
            "type": "missing_player_stats",
            "message": f"Match id={match_id} has incomplete player stats: home={len(home_players)}, away={len(away_players)}.",
            "matchId": match_id,
            "homePlayers": len(home_players),
            "awayPlayers": len(away_players),
        })
    return (
        build_team_stats(home_name, home_players, team_result.get("home") or {}, "home", logs, match_id),
        build_team_stats(away_name, away_players, team_result.get("away") or {}, "away", logs, match_id),
    )


def parse_api_player_stats(items: list[dict], side: str, logs: list[dict], match_id: int) -> list[MatchPlayerStat]:
    players: list[MatchPlayerStat] = []
    for item in items:
        player = item.get("player") or {}
        player_id = to_int(player.get("id") or item.get("playerId") or item.get("player_id"))
        name = clean_text(" ".join(part for part in [player.get("firstName"), player.get("lastName")] if part) or item.get("specialName") or "Hráč")
        full = to_int(item.get("full"))
        clearing = to_int(item.get("clean"))
        faults = to_int(item.get("faults"))
        total = to_int(item.get("total"))
        point = to_float(item.get("points"))
        if total is not None and full is not None and clearing is not None and total != full + clearing:
            logs.append({
                "level": "warning",
                "type": "player_total_mismatch",
                "message": f"Match id={match_id}: {name} total {total} does not equal plne+dorazka {full + clearing}.",
                "matchId": match_id,
                "side": side,
                "player": name,
            })
        profile_url = f"https://vysledky.kolky.sk/player/detail/{player_id}" if player_id else ""
        players.append(MatchPlayerStat(name=name, externalPlayerId=player_id, profileUrl=profile_url, full=full, clearing=clearing, faults=faults, total=total, point=point))
    return players


def build_team_stats(name: str, players: list[MatchPlayerStat], source: dict, side: str, logs: list[dict], match_id: int) -> MatchTeamStats:
    full_total = sum_optional(player.full for player in players)
    clearing_total = sum_optional(player.clearing for player in players)
    faults_total = sum_optional(player.faults for player in players)
    pins_total = sum_optional(player.total for player in players)
    source_total = to_int(source.get("total"))
    if source_total is not None and pins_total is not None and source_total != pins_total:
        logs.append({
            "level": "warning",
            "type": "team_total_mismatch",
            "message": f"Match id={match_id}: {side} pins total {pins_total} differs from source total {source_total}.",
            "matchId": match_id,
            "side": side,
        })
    return MatchTeamStats(
        name=name,
        players=players,
        fullTotal=full_total,
        clearingTotal=clearing_total,
        faultsTotal=faults_total,
        pinsTotal=source_total if source_total is not None else pins_total,
        pointsTotal=to_float(source.get("teamPoints")),
    )


def format_api_date(value: str) -> str:
    if not value:
        return ""
    match = re.search(r"(\d{4})-(\d{2})-(\d{2})", value)
    if not match:
        return value
    return f"{match.group(3)}.{match.group(2)}.{match.group(1)}"


def number_to_score(value) -> str:
    if value is None:
        return "-"
    if isinstance(value, float) and value.is_integer():
        return str(int(value))
    return str(value).replace(".", ",")


def clean_text(value) -> str:
    text = str(value or "").strip()
    if not text:
        return ""
    if any(marker in text for marker in ["Ã", "Ä", "Å"]):
        try:
            decoded = text.encode("latin1").decode("utf-8")
            if decoded:
                return decoded
        except UnicodeError:
            return text
    return text


def to_int(value) -> int | None:
    if value is None or value == "":
        return None
    try:
        return int(float(str(value).replace(",", ".")))
    except ValueError:
        return None


def to_float(value) -> float | None:
    if value is None or value == "":
        return None
    try:
        return float(str(value).replace(",", "."))
    except ValueError:
        return None


def sum_optional(values) -> int | None:
    clean = [value for value in values if value is not None]
    return sum(clean) if clean else None


def build_match_url(match_id: int, home: str, away: str) -> str:
    slug = normalize_for_url(f"{home} vs {away}")
    return f"https://vysledky.kolky.sk/match/detail/{match_id}/{slug}" if slug else f"https://vysledky.kolky.sk/match/detail/{match_id}"


def normalize_for_url(value: str) -> str:
    normalized = normalize_for_search(value)
    return re.sub(r"[^a-z0-9]+", "-", normalized).strip("-")


def parse_player_rows(text: str) -> str:
    row_pattern = re.compile(
        r"([A-ZÁČĎÉÍĽĹŇÓÔŔŠŤÚÝŽ][A-Za-zÁ-ž.\s-]{4,})\s+(:Plne\s*)(\d{3})\s+(:Dor\.\s*)(\d{2,3})\s+(:CH\s*)(\d{1,2})\s+(:SUM\s*)(\d{3})"
    )
    rows: list[str] = []
    for match in row_pattern.finditer(text):
        rows.append(f"{match.group(1).strip()} | {match.group(2)} | {match.group(3)} | {match.group(4)} | {match.group(5)}")
        if len(rows) >= 24:
            break
    return "\n".join(rows)


def parse_teams_from_url(url: str) -> tuple[str, str]:
    slug = unquote(url.rstrip("/").split("/")[-1])
    slug = re.sub(r"^\d+[-/]", "", slug)
    parts = slug.split("-vs-")
    return cleanup_team_name(parts[0] if parts else ""), cleanup_team_name(parts[1] if len(parts) > 1 else "")


def extract_hrefs(html: str, base: str) -> list[str]:
    return [urljoin(base, href) for href in re.findall(r"href=[\"']([^\"'#]+)[\"']", html, flags=re.I)]


def extract_match_links_for_team(html: str, base: str) -> list[str]:
    links = [href for href in extract_hrefs(html, base) if "/match/detail/" in href]
    linked_ids = {extract_match_id(link) for link in links}
    for raw in re.findall(r"/match/detail/(\d+)(:/[^\"'\s<)]*)", html, flags=re.I):
        match_id = int(raw)
        if match_id not in linked_ids:
            links.append(match_url_from_id(match_id))
    return unique(links)


def extract_match_ids_from_text(value: str) -> list[int]:
    ids: list[int] = []
    patterns = [
        r"/match/detail/(\d+)",
        r"[\"']matchId[\"']\s*:\s*(\d+)",
        r"[\"']match_id[\"']\s*:\s*(\d+)",
        r"[\"']match[\"']\s*:\s*\{[^{}]*[\"']id[\"']\s*:\s*(\d+)",
    ]
    for pattern in patterns:
        for raw in re.findall(pattern, value, flags=re.I):
            try:
                ids.append(int(raw))
            except ValueError:
                continue
    return list(dict.fromkeys(ids))


def extract_match_ids_from_json(payload) -> list[int]:
    ids: list[int] = []

    def visit(value, parent_key: str = "") -> None:
        if isinstance(value, dict):
            current_id = to_int(value.get("id") or value.get("matchId") or value.get("match_id"))
            keys = " ".join(str(key).lower() for key in value.keys())
            if current_id and ("match" in parent_key.lower() or "home" in keys or "away" in keys or "teamresult" in keys):
                ids.append(current_id)
            for key, child in value.items():
                visit(child, str(key))
        elif isinstance(value, list):
            for child in value:
                visit(child, parent_key)

    visit(payload)
    return list(dict.fromkeys(ids))


def match_url_from_id(match_id: int) -> str:
    return f"https://vysledky.kolky.sk/match/detail/{match_id}"


def is_useful_discovery_link(url: str, base: str, query: str) -> bool:
    try:
        from urllib.parse import urlparse

        parsed = urlparse(url)
        base_parsed = urlparse(base)
        if parsed.netloc != base_parsed.netloc:
            return False
        path = parsed.path.lower()
        if contains_query(url, query):
            return True
        return any(segment in path for segment in ["/archive", "/league", "/competition", "/team", "/club", "/match"])
    except Exception:  # noqa: BLE001
        return False


def strip_tags(html: str) -> str:
    html = re.sub(r"<script[\s\S]*</script>", " ", html, flags=re.I)
    html = re.sub(r"<style[\s\S]*</style>", " ", html, flags=re.I)
    return re.sub(r"<[^>]+>", " ", html)


def normalize_whitespace(value: str) -> str:
    return re.sub(r"\s+", " ", unescape(value)).strip()


def extract_title(html: str) -> str:
    match = re.search(r"<title[^>]*>([\s\S]*)</title>", html, flags=re.I)
    return normalize_whitespace(match.group(1)) if match else ""


def first_match(value: str, pattern: str) -> str:
    match = re.search(pattern, value, flags=re.I)
    return " : ".join(match.groups()).strip() if match else ""


def cleanup_team_name(value: str) -> str:
    return value.replace("-", " ").strip().title()


def parse_slovak_date(value: str) -> date | None:
    match = re.search(r"(\d{1,2})\.(\d{1,2})\.(\d{4})", value)
    if not match:
        return None
    return date(int(match.group(3)), int(match.group(2)), int(match.group(1)))


def infer_season(value: str) -> str:
    if not value:
        return ""
    parsed = normalize_iso_date(value)
    start_year = parsed.year if parsed.month >= 7 else parsed.year - 1
    return f"{start_year}/{start_year + 1}"


def normalize_iso_date(value: str) -> date:
    slovak = parse_slovak_date(value)
    if slovak:
        return slovak
    match = re.search(r"\d{4}-\d{2}-\d{2}", value or "")
    if not match:
        return date(2026, 7, 1)
    return date.fromisoformat(match.group(0))


def contains_query(value: str, query: str) -> bool:
    normalized = normalize_for_search(value)
    return any(normalize_for_search(part) in normalized for part in re.split(r"[,\s]+", query) if part)


def canonical_competition_from_payload(payload: dict) -> str | None:
    league = payload.get("league") or {}
    raw = " ".join(str(part or "") for part in [
        league.get("name"),
        league.get("fullName"),
        payload.get("competition"),
        payload.get("category"),
        (payload.get("homeTeam") or {}).get("name"),
        (payload.get("awayTeam") or {}).get("name"),
    ])
    return canonical_competition_name(raw)


def extract_league_id(payload: dict) -> int | None:
    league = payload.get("league") or {}
    return to_int(league.get("id") or payload.get("leagueId") or payload.get("league_id"))


def extract_team_id(team: dict) -> int | None:
    return to_int(team.get("id") or team.get("teamId") or team.get("team_id"))


def match_hlohovec_team(payload: dict) -> dict | None:
    league_id = extract_league_id(payload)
    home_id = extract_team_id(payload.get("homeTeam") or {})
    away_id = extract_team_id(payload.get("awayTeam") or {})
    for team_id in [home_id, away_id]:
        if league_id is not None and team_id is not None and (league_id, team_id) in HLOHOVEC_TEAM_KEYS:
            return HLOHOVEC_TEAM_KEYS[(league_id, team_id)]

    # Last resort only when the API omits IDs. Never use this if IDs say the match is unrelated.
    if league_id in HLOHOVEC_LEAGUE_IDS and contains_query(json.dumps(payload, ensure_ascii=False), "Hlohovec"):
        for item in HLOHOVEC_TEAM_DEFINITIONS:
            if item["leagueId"] == league_id:
                return item
    return None


def is_hlohovec_match(match: LiveMatch) -> bool:
    if match.externalLeagueId is not None:
        if (match.externalLeagueId, match.homeExternalTeamId or -1) in HLOHOVEC_TEAM_KEYS:
            return True
        if (match.externalLeagueId, match.awayExternalTeamId or -1) in HLOHOVEC_TEAM_KEYS:
            return True
        return False
    value = normalize_for_search(f"{match.home} {match.away} {match.competition} {match.league}")
    return "hlohovec" in value and (match.competition in ALLOWED_COMPETITIONS or canonical_competition_name(match.league) in ALLOWED_COMPETITIONS)


def build_official_teams(matches: list[LiveMatch]) -> list[LiveTeam]:
    players_by_team: dict[int, set[str]] = {item["id"]: set() for item in HLOHOVEC_TEAM_DEFINITIONS}
    results_by_team: dict[int, dict[str, int]] = {item["id"]: {"played": 0, "wins": 0, "draws": 0, "losses": 0} for item in HLOHOVEC_TEAM_DEFINITIONS}

    for match in matches:
        definition = team_definition_for_match(match)
        if not definition:
            continue
        team_id = definition["id"]
        side = "home" if match.homeExternalTeamId == team_id or normalize_for_search(match.home).find("hlohovec") >= 0 else "away"
        stats = match.homeTeam if side == "home" else match.awayTeam
        if stats:
            players_by_team[team_id].update(player.name for player in stats.players if player.name)
        update_result_summary(results_by_team[team_id], match, side)

    teams: list[LiveTeam] = []
    for index, item in enumerate(HLOHOVEC_TEAM_DEFINITIONS, start=1):
        summary = results_by_team[item["id"]]
        achievements = "Výsledky sa synchronizujú z vysledky.kolky.sk; Admin môže doplniť klubové úspechy"
        if summary["played"]:
            achievements = f"{summary['played']} zápasov v sezóne {CURRENT_SEASON}; {summary['wins']} výhier, {summary['draws']} remíz, {summary['losses']} prehier"
        teams.append(LiveTeam(
            id=index,
            slug=item["slug"],
            name=item["category"],
            league=item["name"],
            externalLeagueId=item["leagueId"],
            externalTeamId=item["id"],
            category=item["category"],
            season=CURRENT_SEASON,
            sourceUrl=team_source_url(item),
            isHlohovecTeam=True,
            coach="Trénera doplní admin",
            captain="Kapitána doplní admin",
            members=", ".join(sorted(players_by_team[item["id"]], key=lambda name: name.lower())),
            achievements=achievements,
            description=item["description"],
            matchesPlayed=summary["played"] or None,
            wins=summary["wins"] or None,
            draws=summary["draws"] or None,
            losses=summary["losses"] or None,
        ))
    return teams


def build_players_from_matches(matches: list[LiveMatch]) -> list[LivePlayer]:
    grouped: dict[str, dict] = {}
    for match in matches:
        definition = team_definition_for_match(match)
        if not definition:
            continue
        season = match.season or infer_season(match.date)
        sides = [
            (match.homeExternalTeamId, match.homeTeam, match.home),
            (match.awayExternalTeamId, match.awayTeam, match.away),
        ]
        for team_id, stats, team_name in sides:
            is_team_side = team_id == definition["id"] or (team_id is None and contains_query(team_name, "Hlohovec"))
            if not is_team_side or not stats:
                continue
            for player in stats.players:
                key = player.rosterKey if hasattr(player, "rosterKey") else ""
                if not key:
                    key = f"{player.externalPlayerId or normalize_for_search(player.name)}:{definition['leagueId']}:{definition['id']}:{season}"
                row = grouped.setdefault(key, {
                    "name": player.name,
                    "externalPlayerId": player.externalPlayerId,
                    "externalLeagueId": definition["leagueId"],
                    "externalTeamId": definition["id"],
                    "team": definition["category"],
                    "category": definition["category"],
                    "season": season,
                    "profileUrl": player.profileUrl,
                    "sourceUrl": match.sourceUrl,
                    "matches": 0,
                    "totalPerformance": 0,
                    "bestPerformance": None,
                    "full": 0,
                    "clearing": 0,
                    "faults": 0,
                })
                row["matches"] += 1
                row["totalPerformance"] += player.total or 0
                row["bestPerformance"] = max(row["bestPerformance"] or 0, player.total or 0) or None
                row["full"] += player.full or 0
                row["clearing"] += player.clearing or 0
                row["faults"] += player.faults or 0

    players: list[LivePlayer] = []
    for index, (key, row) in enumerate(sorted(grouped.items(), key=lambda item: (item[1]["category"], item[1]["name"].lower())), start=1):
        average = row["totalPerformance"] / row["matches"] if row["matches"] else 0
        players.append(LivePlayer(
            id=index,
            name=row["name"],
            team=row["team"],
            role="Hráč",
            average=f"{average:.1f}" if average else "bez priemeru",
            externalPlayerId=row["externalPlayerId"],
            externalLeagueId=row["externalLeagueId"],
            externalTeamId=row["externalTeamId"],
            season=row["season"],
            category=row["category"],
            profileUrl=row["profileUrl"],
            matches=row["matches"],
            totalPerformance=row["totalPerformance"],
            bestPerformance=row["bestPerformance"],
            full=row["full"],
            clearing=row["clearing"],
            faults=row["faults"],
            sourceUrl=row["sourceUrl"],
            rosterKey=key,
        ))
    return players


def build_standings_from_matches(matches: list[LiveMatch]) -> list[LiveStandingRow]:
    rows: list[LiveStandingRow] = []
    summaries: dict[int, dict[str, int]] = {item["id"]: {"played": 0, "wins": 0, "draws": 0, "losses": 0, "points": 0} for item in HLOHOVEC_TEAM_DEFINITIONS}
    for match in matches:
        definition = team_definition_for_match(match)
        if not definition:
            continue
        side = "home" if match.homeExternalTeamId == definition["id"] else "away"
        before = summaries[definition["id"]].copy()
        update_result_summary(summaries[definition["id"]], match, side)
        if summaries[definition["id"]]["wins"] > before["wins"]:
            summaries[definition["id"]]["points"] += 2
        elif summaries[definition["id"]]["draws"] > before["draws"]:
            summaries[definition["id"]]["points"] += 1

    for index, item in enumerate(HLOHOVEC_TEAM_DEFINITIONS, start=1):
        summary = summaries[item["id"]]
        rows.append(LiveStandingRow(
            id=index,
            league=item["category"],
            category=item["category"],
            season=CURRENT_SEASON,
            team=item["name"],
            externalLeagueId=item["leagueId"],
            externalTeamId=item["id"],
            matchesPlayed=summary["played"] or None,
            wins=summary["wins"] or None,
            draws=summary["draws"] or None,
            losses=summary["losses"] or None,
            points=summary["points"] or None,
            isHlohovecTeam=True,
        ))
    return rows


def build_team_sync_results(matches: list[LiveMatch], logs: list[dict]) -> list[dict]:
    results: list[dict] = []
    discovery_by_team: dict[tuple[int, int], dict] = {}
    errors_by_team: dict[tuple[int, int], list[str]] = {}
    for log in logs:
        league_id = to_int(log.get("leagueId"))
        team_id = to_int(log.get("teamId"))
        if league_id is None or team_id is None:
            continue
        key = (league_id, team_id)
        if log.get("type") in {"league_schedule_summary", "team_discovery", "team_discovery_failed"}:
            discovery_by_team[key] = log
        if log.get("level") == "error":
            errors_by_team.setdefault(key, []).append(log.get("message", "Neznáma chyba importu."))

    for team in HLOHOVEC_TEAM_DEFINITIONS:
        key = (team["leagueId"], team["id"])
        team_matches = [
            match for match in matches
            if match.externalLeagueId == team["leagueId"]
            and (match.homeExternalTeamId == team["id"] or match.awayExternalTeamId == team["id"])
        ]
        team_players = {
            player.name
            for match in team_matches
            for stats in [match.homeTeam, match.awayTeam]
            if stats
            for player in stats.players
            if player.name
        }
        completed = [match for match in team_matches if parse_score_pair(match.score)[0] is not None]
        upcoming = [match for match in team_matches if parse_score_pair(match.score)[0] is None]
        discovery = discovery_by_team.get(key, {})
        results.append({
            "category": team["category"],
            "league_id": team["leagueId"],
            "team_id": team["id"],
            "players_found": len(team_players),
            "available_rounds_discovered": discovery.get("availableRoundsDiscovered") or [],
            "available_rounds_count": int(discovery.get("availableRoundsCount") or 0),
            "league_responses_discovered": int(discovery.get("leagueMatchResponsesDiscovered") or 0),
            "all_league_matches_parsed": int(discovery.get("allLeagueMatchesParsed") or 0),
            "hlohovec_matches_after_id_filtering": int(discovery.get("hlohovecMatchesAfterIdFiltering") or 0),
            "matches_discovered": int(discovery.get("hlohovecMatchesAfterIdFiltering") or discovery.get("matchesDiscovered") or discovery.get("matchLinksFound") or 0),
            "matches_imported": len(team_matches),
            "matches_updated": len(team_matches),
            "matches_skipped": int(discovery.get("skippedMatches") or 0),
            "completed": len(completed),
            "upcoming": len(upcoming),
            "errors": errors_by_team.get(key, []),
        })
    return results


def update_result_summary(summary: dict[str, int], match: LiveMatch, side: str) -> None:
    home_score, away_score = parse_score_pair(match.score)
    if home_score is None or away_score is None:
        return
    summary["played"] += 1
    own_score = home_score if side == "home" else away_score
    opponent_score = away_score if side == "home" else home_score
    if own_score > opponent_score:
        summary["wins"] += 1
    elif own_score == opponent_score:
        summary["draws"] += 1
    else:
        summary["losses"] += 1


def parse_score_pair(value: str) -> tuple[float | None, float | None]:
    parts = re.split(r"\s*:\s*", value or "")
    if len(parts) != 2:
        return None, None
    try:
        return float(parts[0].replace(",", ".")), float(parts[1].replace(",", "."))
    except ValueError:
        return None, None


def team_definition_for_match(match: LiveMatch) -> dict | None:
    pairs = [
        (match.externalLeagueId, match.homeExternalTeamId),
        (match.externalLeagueId, match.awayExternalTeamId),
    ]
    for league_id, team_id in pairs:
        if league_id is not None and team_id is not None and (league_id, team_id) in HLOHOVEC_TEAM_KEYS:
            return HLOHOVEC_TEAM_KEYS[(league_id, team_id)]
    competition = match.competition or canonical_competition_name(match.league)
    return next((item for item in HLOHOVEC_TEAM_DEFINITIONS if item["category"] == competition), None)


def get_hlohovec_team_definitions() -> list[dict]:
    return [dict(item) for item in HLOHOVEC_TEAM_DEFINITIONS]


def team_source_url(item: dict) -> str:
    return f"https://vysledky.kolky.sk/team/detail/{item['leagueId']}/{item['id']}/{item['sourceSlug']}"


def canonical_competition_name(value: str) -> str | None:
    normalized = normalize_for_search(value)
    if any(token in normalized for token in ["1. liga", "1 liga", "i. liga", "i liga", "1. kl", "1 kl"]):
        return None
    if any(token in normalized for token in ["dorast", "dorastenci", "dorastenecka"]):
        return "Dorast"
    if "extraliga" in normalized and any(token in normalized for token in ["zen", "zena", "zenska", "zeny"]):
        return "Extraliga ženy"
    if "extraliga" in normalized:
        return "Extraliga muži"
    if any(token in normalized for token in ["3. liga", "3 liga", "iii. liga", "iii liga", "tretia liga", "3.kl", "3 kl", "3kl"]):
        return "3. liga"
    if any(token in normalized for token in ["2. liga", "2 liga", "ii. liga", "ii liga", "druha liga", "2.kl", "2 kl", "2kl"]):
        return "2. liga"
    return None


def normalize_for_search(value: str) -> str:
    text = unicodedata.normalize("NFKD", unescape(value or ""))
    return "".join(char for char in text if not unicodedata.combining(char)).lower()


def split_env_list(value: str) -> list[str]:
    return [item.strip() for item in value.split(",") if item.strip()]


def unique(values: list[str]) -> list[str]:
    return list(dict.fromkeys(values))


def match_richness(match: LiveMatch) -> int:
    home_players = len(match.homeTeam.players) if match.homeTeam else 0
    away_players = len(match.awayTeam.players) if match.awayTeam else 0
    detail_rows = len([row for row in (match.detailRows or "").splitlines() if row.strip()])
    score_value = 1 if match.score and match.score != "-" else 0
    pins_value = 1 if match.pins and match.pins != "-" else 0
    source_value = 1 if "/match/detail/" in (match.sourceUrl or "") else 0
    return (home_players + away_players) * 100 + detail_rows * 10 + score_value + pins_value + source_value


def unique_matches(matches: list[LiveMatch], logs: list[dict] | None = None) -> tuple[list[LiveMatch], int]:
    by_key: dict[str, LiveMatch] = {}
    order: list[str] = []
    duplicates = 0
    for match in matches:
        key = match.importKey or normalized_match_key(match.sourceUrl, match.home, match.away, match.date, match.competition or match.league, match.round)
        existing = by_key.get(key)
        if existing is not None:
            duplicates += 1
            if match_richness(match) > match_richness(existing):
                by_key[key] = match
                if logs is not None:
                    logs.append({
                        "level": "info",
                        "type": "duplicate_match_replaced",
                        "message": f"Duplicate match replaced with richer detail data: {match.home} vs {match.away} ({match.date}, {match.competition or match.league}).",
                        "matchId": match.id,
                        "sourceUrl": match.sourceUrl,
                    })
                continue
            if logs is not None:
                logs.append({
                    "level": "warning",
                    "type": "duplicate_match",
                    "message": f"Duplicate match skipped: {match.home} vs {match.away} ({match.date}, {match.competition or match.league}).",
                    "matchId": match.id,
                    "sourceUrl": match.sourceUrl,
                })
            continue
        by_key[key] = match
        order.append(key)
    return [by_key[key] for key in order], duplicates


def normalized_match_key(source_url: str, home: str, away: str, match_date: str, competition: str, round_name: str) -> str:
    source_id = extract_match_id(source_url or "")
    if source_id:
        return f"source:{source_id}"
    raw = "|".join([home, away, match_date, competition, round_name])
    return "match:" + normalize_for_search(raw)


def stable_id(value: str) -> int:
    return int(sha1(value.encode("utf-8")).hexdigest()[:8], 16)
