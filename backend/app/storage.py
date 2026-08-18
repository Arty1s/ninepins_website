import json
from pathlib import Path
from threading import Lock
from typing import Any

import httpx

from backend.app.config import get_settings
from backend.app.default_data import DEFAULT_CLUB_DATA
from backend.app.models import LiveClubData, TournamentRegistration

CLUB_DATA_KEY = "club-data"
REGISTRATIONS_KEY = "tournament-registrations"

_lock = Lock()


def _store_path() -> Path:
    settings = get_settings()
    return settings.data_dir / "kkhc-fastapi-store.json"


def _sync_result_path() -> Path:
    settings = get_settings()
    return settings.data_dir / "kolky-sync-result.json"


def _read_document() -> dict[str, Any]:
    path = _store_path()
    if not path.exists():
        return {}
    try:
        return json.loads(path.read_text(encoding="utf-8").lstrip("\ufeff").removeprefix("ï»¿"))
    except json.JSONDecodeError:
        return {}


def _write_document(document: dict[str, Any]) -> None:
    path = _store_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(document, ensure_ascii=False, indent=2), encoding="utf-8")


def read_club_data() -> LiveClubData:
    with _lock:
        remote = _read_remote_state(CLUB_DATA_KEY)
        if remote:
            return _hydrate_from_sync_result(LiveClubData.model_validate(remote))
        document = _read_document()
        raw = document.get(CLUB_DATA_KEY)
        if not raw:
            return _hydrate_from_sync_result(DEFAULT_CLUB_DATA)
        return _hydrate_from_sync_result(LiveClubData.model_validate(raw))


def write_club_data(data: LiveClubData) -> LiveClubData:
    normalized = LiveClubData.model_validate(data)
    with _lock:
        if _write_remote_state(CLUB_DATA_KEY, normalized.model_dump(mode="json")):
            _write_local_key(CLUB_DATA_KEY, normalized.model_dump(mode="json"))
            return normalized
        document = _read_document()
        document[CLUB_DATA_KEY] = normalized.model_dump(mode="json")
        _write_document(document)
    return normalized


def read_registrations() -> list[TournamentRegistration]:
    with _lock:
        remote = _read_remote_state(REGISTRATIONS_KEY)
        if isinstance(remote, list):
            return [TournamentRegistration.model_validate(item) for item in remote]
        document = _read_document()
        return [TournamentRegistration.model_validate(item) for item in document.get(REGISTRATIONS_KEY, [])]


def write_registrations(rows: list[TournamentRegistration]) -> list[TournamentRegistration]:
    normalized = [TournamentRegistration.model_validate(row) for row in rows]
    with _lock:
        payload = [row.model_dump(mode="json") for row in normalized]
        if _write_remote_state(REGISTRATIONS_KEY, payload):
            _write_local_key(REGISTRATIONS_KEY, payload)
            return normalized
        document = _read_document()
        document[REGISTRATIONS_KEY] = payload
        _write_document(document)
    return normalized


def _write_local_key(key: str, payload: Any) -> None:
    document = _read_document()
    document[key] = payload
    _write_document(document)


def _hydrate_from_sync_result(data: LiveClubData) -> LiveClubData:
    """Use the latest local crawler result when it is richer than the store.

    The standalone crawler script writes `.data/kolky-sync-result.json`, while
    the app store lives in `.data/kkhc-fastapi-store.json`. This bridges that
    gap without replacing admin-managed tournaments, members or gallery data.
    """
    path = _sync_result_path()
    if not path.exists():
        return data

    try:
        sync = json.loads(path.read_text(encoding="utf-8").lstrip("\ufeff").removeprefix("ï»¿"))
    except (OSError, json.JSONDecodeError):
        return data

    matches = sync.get("matches") if isinstance(sync.get("matches"), list) else []
    players = sync.get("players") if isinstance(sync.get("players"), list) else []
    teams = sync.get("teams") if isinstance(sync.get("teams"), list) else []
    standings = sync.get("standings") if isinstance(sync.get("standings"), list) else []

    if len(matches) <= len(data.matches) and len(players) <= len(data.players):
        return data

    payload = data.model_dump(mode="json")
    if len(matches) > len(data.matches):
        payload["matches"] = matches
    if len(players) > len(data.players):
        payload["players"] = players
    if len(teams) >= len(data.teams):
        payload["teams"] = teams
    if len(standings) >= len(data.standings):
        payload["standings"] = standings
    return LiveClubData.model_validate(payload)


def _supabase_headers() -> dict[str, str]:
    settings = get_settings()
    return {
        "apikey": settings.supabase_service_role_key,
        "authorization": f"Bearer {settings.supabase_service_role_key}",
        "content-type": "application/json",
        "prefer": "return=representation",
    }


def _remote_url(key: str) -> str:
    settings = get_settings()
    table = settings.supabase_live_state_table
    return f"{settings.supabase_url}/rest/v1/{table}key=eq.{key}"


def _read_remote_state(key: str) -> Any | None:
    settings = get_settings()
    if not settings.supabase_configured:
        return None
    try:
        response = httpx.get(
            _remote_url(key),
            headers=_supabase_headers(),
            params={"select": "payload", "limit": "1"},
            timeout=8,
        )
        if response.status_code >= 400:
            return None
        rows = response.json()
        if not rows:
            return None
        return rows[0].get("payload")
    except Exception:
        return None


def _write_remote_state(key: str, payload: Any) -> bool:
    settings = get_settings()
    if not settings.supabase_configured:
        return False
    try:
        response = httpx.post(
            f"{settings.supabase_url}/rest/v1/{settings.supabase_live_state_table}",
            headers={**_supabase_headers(), "prefer": "resolution=merge-duplicates,return=representation"},
            params={"on_conflict": "key"},
            json={"key": key, "payload": payload},
            timeout=10,
        )
        return response.status_code < 400
    except Exception:
        return False
