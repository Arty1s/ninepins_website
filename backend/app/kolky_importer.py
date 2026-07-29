import re
from datetime import date, datetime
from hashlib import sha1
from html import unescape
from urllib.parse import urljoin, unquote

import httpx

from app.config import get_settings
from app.models import LiveMatch

DEFAULT_IMPORT_URLS = [
    "https://vysledky.kolky.sk/match/detail/43531/KO-Zarnovica-vs-KKZ-Hlohovec-A"
]
MAX_DISCOVERED_URLS = 250


async def import_hlohovec_matches(
    manual_urls: list[str] | None = None,
    from_date: str | None = None,
    to_date: str | None = None,
    query: str | None = None,
) -> dict:
    settings = get_settings()
    start = normalize_iso_date(from_date or settings.kolky_import_from)
    end = normalize_iso_date(to_date or settings.kolky_import_to or date.today().isoformat())
    search = query or settings.kolky_import_query
    urls = unique(manual_urls or await discover_import_urls(search))
    imported: list[LiveMatch] = []
    warnings: list[str] = []

    async with httpx.AsyncClient(timeout=20, headers={"user-agent": "KKHlohovecWebsiteBot/1.0"}) as client:
        for url in urls:
            try:
                response = await client.get(url)
                if response.status_code >= 400:
                    warnings.append(f"{url}: HTTP {response.status_code}")
                    continue
                html = response.text
                text = strip_tags(html)
                if not contains_query(text, search) and not contains_query(url, search):
                    continue
                parsed = parse_match_detail(url, html)
                parsed_date = parse_slovak_date(parsed.date)
                if parsed_date and not (start <= parsed_date <= end):
                    continue
                if not parsed_date and not manual_urls:
                    warnings.append(f"{url}: match date not found, skipped by season filter")
                    continue
                imported.append(parsed)
            except Exception as exc:  # noqa: BLE001
                warnings.append(f"{url}: {exc}")

    return {
        "imported": imported,
        "checkedUrls": urls,
        "warnings": warnings,
        "from": start.isoformat(),
        "to": end.isoformat(),
        "query": search,
    }


async def discover_import_urls(query: str) -> list[str]:
    settings = get_settings()
    explicit_urls = split_env_list(settings.kolky_import_urls)
    if explicit_urls:
        return explicit_urls

    index_urls = split_env_list(settings.kolky_import_index_urls) or ["https://vysledky.kolky.sk/"]
    hrefs: list[str] = []
    seen_indexes: set[str] = set()
    queue = list(index_urls)

    async with httpx.AsyncClient(timeout=20, headers={"user-agent": "KKHlohovecWebsiteBot/1.0"}) as client:
        while queue and len(hrefs) < MAX_DISCOVERED_URLS:
            index_url = queue.pop(0)
            if index_url in seen_indexes:
                continue
            seen_indexes.add(index_url)
            try:
                response = await client.get(index_url)
                if response.status_code >= 400:
                    continue
                for href in extract_hrefs(response.text, index_url):
                    if "/match/detail/" in href:
                        hrefs.append(href)
                    elif contains_query(href, query) and href not in seen_indexes:
                        queue.append(href)
            except Exception:  # noqa: BLE001
                continue

    return unique([*hrefs, *DEFAULT_IMPORT_URLS])[:MAX_DISCOVERED_URLS]


def parse_match_detail(source_url: str, html: str) -> LiveMatch:
    text = normalize_whitespace(strip_tags(html))
    title = extract_title(html) or text[:160]
    home, away = parse_teams_from_url(source_url)
    score = first_match(text, r"(?:BODY\s*)?(\d+(?:[.,]\d+)?)\s*:\s*(\d+(?:[.,]\d+)?)") or "import"
    pins = first_match(text, r"(?:SPOLU|KOLKY)?\s*(\d[\d\s]{2,})\s*:\s*(\d[\d\s]{2,})") or "-"
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


def parse_player_rows(text: str) -> str:
    row_pattern = re.compile(
        r"([A-ZÁČĎÉÍĽĹŇÓÔŔŠŤÚÝŽ][A-Za-zÁ-ž.\s-]{4,})\s+(?:Plne\s*)?(\d{3})\s+(?:Dor\.\s*)?(\d{2,3})\s+(?:CH\s*)?(\d{1,2})\s+(?:SUM\s*)?(\d{3})"
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


def strip_tags(html: str) -> str:
    html = re.sub(r"<script[\s\S]*?</script>", " ", html, flags=re.I)
    html = re.sub(r"<style[\s\S]*?</style>", " ", html, flags=re.I)
    return re.sub(r"<[^>]+>", " ", html)


def normalize_whitespace(value: str) -> str:
    return re.sub(r"\s+", " ", unescape(value)).strip()


def extract_title(html: str) -> str:
    match = re.search(r"<title[^>]*>([\s\S]*?)</title>", html, flags=re.I)
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


def normalize_for_search(value: str) -> str:
    replacements = str.maketrans("áäčďéíľĺňóôŕšťúýžÁÄČĎÉÍĽĹŇÓÔŔŠŤÚÝŽ", "aacdeillnoorstuyzAACDEILLNOORSTUYZ")
    return unescape(value).translate(replacements).lower()


def split_env_list(value: str) -> list[str]:
    return [item.strip() for item in value.split(",") if item.strip()]


def unique(values: list[str]) -> list[str]:
    return list(dict.fromkeys(values))


def stable_id(value: str) -> int:
    return int(sha1(value.encode("utf-8")).hexdigest()[:8], 16)

