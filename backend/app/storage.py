import json
from pathlib import Path
from threading import Lock
from typing import Any

from app.config import get_settings
from app.default_data import DEFAULT_CLUB_DATA
from app.models import LiveClubData, TournamentRegistration

CLUB_DATA_KEY = "club-data"
REGISTRATIONS_KEY = "tournament-registrations"

_lock = Lock()


def _store_path() -> Path:
    settings = get_settings()
    return settings.data_dir / "kkhc-fastapi-store.json"


def _read_document() -> dict[str, Any]:
    path = _store_path()
    if not path.exists():
        return {}
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {}


def _write_document(document: dict[str, Any]) -> None:
    path = _store_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(document, ensure_ascii=False, indent=2), encoding="utf-8")


def read_club_data() -> LiveClubData:
    with _lock:
        document = _read_document()
        raw = document.get(CLUB_DATA_KEY)
        if not raw:
            return DEFAULT_CLUB_DATA
        return LiveClubData.model_validate(raw)


def write_club_data(data: LiveClubData) -> LiveClubData:
    normalized = LiveClubData.model_validate(data)
    with _lock:
        document = _read_document()
        document[CLUB_DATA_KEY] = normalized.model_dump(mode="json")
        _write_document(document)
    return normalized


def read_registrations() -> list[TournamentRegistration]:
    with _lock:
        document = _read_document()
        return [TournamentRegistration.model_validate(item) for item in document.get(REGISTRATIONS_KEY, [])]


def write_registrations(rows: list[TournamentRegistration]) -> list[TournamentRegistration]:
    normalized = [TournamentRegistration.model_validate(row) for row in rows]
    with _lock:
        document = _read_document()
        document[REGISTRATIONS_KEY] = [row.model_dump(mode="json") for row in normalized]
        _write_document(document)
    return normalized

