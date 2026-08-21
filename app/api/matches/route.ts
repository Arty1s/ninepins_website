import { NextResponse, type NextRequest } from "next/server";
import { readClubData } from "@/lib/server-store";
import { readLocalSyncResult } from "@/lib/server-sync-result";

export async function GET(request: NextRequest) {
  const backendBase = (process.env.FASTAPI_URL || process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
  if (backendBase) {
    try {
      const upstreamUrl = new URL(`${backendBase}/api/matches`);
      request.nextUrl.searchParams.forEach((value, key) => upstreamUrl.searchParams.set(key, value));
      const response = await fetch(upstreamUrl, { cache: "no-store", signal: AbortSignal.timeout(1500) });
      if (!response.ok) throw new Error(`FastAPI returned ${response.status}`);
      const payload = await response.json();
      return NextResponse.json(payload, { status: response.ok ? 200 : response.status });
    } catch {
      // Fall back to the local Next store so the page still renders in local-only mode.
    }
  }

  const leagueId = request.nextUrl.searchParams.get("league_id");
  const teamId = request.nextUrl.searchParams.get("team_id");
  const season = request.nextUrl.searchParams.get("season");
  const page = Math.max(Number(request.nextUrl.searchParams.get("page") || 1), 1);
  const pageSize = Math.min(Math.max(Number(request.nextUrl.searchParams.get("page_size") || 500), 1), 1000);
  const storeData = await readClubData();
  const syncData = await readLocalSyncResult();
  const data = syncData?.matches?.length && syncData.matches.length > storeData.matches.length
    ? { ...storeData, ...syncData }
    : storeData;
  let rows = data.matches;
  if (leagueId) rows = rows.filter((match) => String(match.externalLeagueId || "") === leagueId);
  if (teamId) rows = rows.filter((match) => String(match.homeExternalTeamId || "") === teamId || String(match.awayExternalTeamId || "") === teamId);
  if (season) rows = rows.filter((match) => normalizeSeason(match.season || match.league || match.date) === normalizeSeason(season));
  rows = [...rows].sort((a, b) => sortableDate(b.date).localeCompare(sortableDate(a.date)));
  const total = rows.length;
  const items = rows.slice((page - 1) * pageSize, page * pageSize);
  return NextResponse.json({
    ok: true,
    data: items,
    items,
    total,
    page,
    page_size: pageSize,
    pages: total ? Math.ceil(total / pageSize) : 1
  });
}

function normalizeSeason(value: string) {
  const explicit = value.match(/(20\d{2})\s*[/-]\s*(20\d{2})/)?.slice(1, 3);
  if (explicit) return `${explicit[0]}/${explicit[1]}`;
  const match = value.match(/(\d{1,2})\.(\d{1,2})\.(20\d{2})/);
  if (!match) return value.toLowerCase().trim();
  const year = Number(match[3]);
  const month = Number(match[2]);
  const startYear = month >= 7 ? year : year - 1;
  return `${startYear}/${startYear + 1}`;
}

function sortableDate(value: string) {
  const match = value.match(/(\d{1,2})\.(\d{1,2})\.(20\d{2})/);
  if (!match) return value;
  return `${match[3]}-${match[2].padStart(2, "0")}-${match[1].padStart(2, "0")}`;
}
