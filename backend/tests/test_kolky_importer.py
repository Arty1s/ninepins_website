from app.kolky_importer import (
    build_team_sync_results,
    extract_match_links_for_team,
    extract_schedule_match_payloads,
    match_hlohovec_team,
    parse_match_api_payload,
    parse_schedule_match_payload,
    schedule_payload_belongs_to_team,
    unique_matches,
)


def match_payload(league_id=362, home_id=4925, away_id=7001, status="finished"):
    return {
        "id": 99901,
        "round": 1,
        "status": status,
        "startDate": "2026-09-12T13:00:00",
        "league": {"id": league_id, "name": "3. liga"},
        "hall": {"name": "Hlohovec"},
        "homeTeam": {"id": home_id, "name": "KKZ Hlohovec C"},
        "awayTeam": {"id": away_id, "name": "Súper"},
        "teamResult": {
            "home": {"teamPoints": 6, "total": 3300},
            "away": {"teamPoints": 2, "total": 3210},
        },
        "lineUp": {
            "home": [
                {"player": {"id": 1, "firstName": "Test", "lastName": "Hráč"}, "full": 380, "clean": 180, "faults": 3, "total": 560, "points": 1},
            ],
            "away": [
                {"player": {"id": 2, "firstName": "Hosť", "lastName": "Hráč"}, "full": 370, "clean": 170, "faults": 5, "total": 540, "points": 0},
            ],
        },
    }


def test_team_page_html_discovers_match_links():
    html = '<a href="/match/detail/99901/KKZ-Hlohovec-C-vs-Super">detail</a>'
    links = extract_match_links_for_team(html, "https://vysledky.kolky.sk/team/detail/362/4925/KKZ-Hlohovec-C")
    assert links == ["https://vysledky.kolky.sk/match/detail/99901/KKZ-Hlohovec-C-vs-Super"]


def test_completed_match_with_opponent_is_imported_for_3_liga():
    logs = []
    payload = match_payload()
    assert match_hlohovec_team(payload)["id"] == 4925
    match = parse_match_api_payload("https://vysledky.kolky.sk/match/detail/99901", payload, "3. liga", logs, match_hlohovec_team(payload))
    assert match.externalLeagueId == 362
    assert match.homeExternalTeamId == 4925
    assert match.score == "6 : 2"
    assert match.homeTeam and match.homeTeam.players[0].name == "Test Hráč"


def test_upcoming_dorast_match_without_score_is_imported():
    logs = []
    payload = match_payload(league_id=361, home_id=4923, status="new")
    payload["teamResult"] = {}
    payload["lineUp"] = {"home": [], "away": []}
    meta = match_hlohovec_team(payload)
    assert meta["category"] == "Dorast"
    match = parse_match_api_payload("https://vysledky.kolky.sk/match/detail/99902", payload, "Dorast", logs, meta)
    assert match.externalLeagueId == 361
    assert match.homeExternalTeamId == 4923
    assert match.status == "plánované"
    assert match.score == "-"


def test_same_visible_name_different_leagues_does_not_merge_teams():
    dorast = match_hlohovec_team(match_payload(league_id=361, home_id=4923))
    women = match_hlohovec_team(match_payload(league_id=356, home_id=4865))
    assert dorast["id"] == 4923
    assert women["id"] == 4865
    assert dorast["category"] != women["category"]


def test_repeated_sync_does_not_duplicate_matches():
    logs = []
    payload = match_payload()
    meta = match_hlohovec_team(payload)
    match = parse_match_api_payload("https://vysledky.kolky.sk/match/detail/99901", payload, "3. liga", logs, meta)
    rows, duplicates = unique_matches([match, match], logs)
    assert len(rows) == 1
    assert duplicates == 1


def test_team_sync_reports_parser_failure_for_zero_discovery():
    logs = [{
        "level": "error",
        "type": "team_discovery_failed",
        "message": "Dorast: HTTP 200, but zero match rows were discovered.",
        "leagueId": 361,
        "teamId": 4923,
        "matchesDiscovered": 0,
    }]
    results = build_team_sync_results([], logs)
    dorast = next(row for row in results if row["team_id"] == 4923)
    assert dorast["matches_imported"] == 0
    assert dorast["errors"]


def test_schedule_parser_extracts_matches_from_all_rounds():
    payload = {
        "league": {"id": 362, "name": "3. liga"},
        "rounds": [
            {"round": 1, "matches": [match_payload(league_id=362, home_id=4925, away_id=7001)]},
            {"round": 2, "matches": [match_payload(league_id=362, home_id=7002, away_id=4925)]},
        ],
    }
    payload["rounds"][1]["matches"][0]["id"] = 99902
    rows = extract_schedule_match_payloads(payload, 362)
    hlohovec_rows = [row for row in rows if schedule_payload_belongs_to_team(row, {"leagueId": 362, "id": 4925, "sourceSlug": "KKZ-Hlohovec-C"})]
    assert len(rows) == 2
    assert len(hlohovec_rows) == 2


def test_schedule_parser_keeps_same_named_women_and_dorast_separate_by_league_id():
    women_payload = match_payload(league_id=356, home_id=4865)
    dorast_payload = match_payload(league_id=361, home_id=4923)
    women_rows = extract_schedule_match_payloads({"matches": [women_payload, dorast_payload]}, 356)
    dorast_rows = extract_schedule_match_payloads({"matches": [women_payload, dorast_payload]}, 361)
    assert any(schedule_payload_belongs_to_team(row, {"leagueId": 356, "id": 4865, "sourceSlug": "KKZ-Hlohovec"}) for row in women_rows)
    assert any(schedule_payload_belongs_to_team(row, {"leagueId": 361, "id": 4923, "sourceSlug": "KKZ-Hlohovec"}) for row in dorast_rows)
    assert not any(schedule_payload_belongs_to_team(row, {"leagueId": 356, "id": 4923, "sourceSlug": "KKZ-Hlohovec"}) for row in women_rows)


def test_schedule_match_without_lineup_still_imports_as_basic_match():
    logs = []
    team = {"leagueId": 359, "id": 4889, "category": "2. liga", "sourceSlug": "KKZ-Hlohovec-B"}
    payload = match_payload(league_id=359, home_id=4889, away_id=7010, status="new")
    payload["id"] = 99903
    payload["lineUp"] = {}
    payload["teamResult"] = {}
    match = parse_schedule_match_payload(payload, team, logs)
    assert match.externalLeagueId == 359
    assert match.homeExternalTeamId == 4889
    assert match.competition == "2. liga"
    assert match.score == "-"
