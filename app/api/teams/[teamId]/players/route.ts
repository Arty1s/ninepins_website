import { NextResponse, type NextRequest } from "next/server";
import { readClubData } from "@/lib/server-store";
import { readLocalSyncResult } from "@/lib/server-sync-result";

export async function GET(_: NextRequest, { params }: { params: { teamId: string } }) {
  const backendBase = (process.env.FASTAPI_URL || process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
  if (backendBase) {
    try {
      const response = await fetch(`${backendBase}/api/teams/${params.teamId}/players`, { cache: "no-store", signal: AbortSignal.timeout(1500) });
      if (!response.ok) throw new Error(`FastAPI returned ${response.status}`);
      const payload = await response.json();
      const rows = Array.isArray(payload.data) ? payload.data.filter((player: { name: string }) => isRealPlayerName(player.name || "")) : [];
      return NextResponse.json({ ...payload, data: rows }, { status: response.ok ? 200 : response.status });
    } catch {
      // Fall back to the local Next store so the page still renders in local-only mode.
    }
  }

  const storeData = await readClubData();
  const syncData = await readLocalSyncResult();
  const data = syncData.players.length && syncData.players.length > storeData.players.length
    ? { ...storeData, ...syncData }
    : storeData;
  const team = data.teams.find((row) => String(row.id) === params.teamId || String(row.externalTeamId || "") === params.teamId);
  if (!team) return NextResponse.json({ ok: false, message: "Team not found" }, { status: 404 });
  const teamNames = [team.name, team.league, team.category, team.slug].filter((value): value is string => Boolean(value)).map(normalize);
  const rows = data.players
    .filter((player) => {
      if (!isRealPlayerName(player.name)) return false;
      if (team.externalTeamId && player.externalTeamId === team.externalTeamId) return true;
      if (team.externalLeagueId && player.externalLeagueId === team.externalLeagueId) return true;
      const playerNames = [player.team, player.category || "", player.rosterKey || ""].filter((value): value is string => Boolean(value)).map(normalize);
      return playerNames.some((name) => teamNames.includes(name));
    })
    .sort((a, b) => Number(b.matches || 0) - Number(a.matches || 0));
  return NextResponse.json({ ok: true, team, data: rows });
}

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function isRealPlayerName(value: string) {
  const name = normalize(value);
  return Boolean(name) && !["nikto", "nobody", "neznamy", "neznámy", "-", "x"].includes(name);
}
