import { NextResponse, type NextRequest } from "next/server";
import { readClubData } from "@/lib/server-store";

export async function GET(_: NextRequest, { params }: { params: { matchId: string } }) {
  const backendBase = (process.env.FASTAPI_URL || process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
  if (backendBase) {
    try {
      const response = await fetch(`${backendBase}/api/matches/${params.matchId}`, { cache: "no-store" });
      const payload = await response.json();
      return NextResponse.json(payload, { status: response.ok ? 200 : response.status });
    } catch {
      // Fall back to the local Next store so the page still renders in local-only mode.
    }
  }

  const data = await readClubData();
  const match = data.matches.find((row) => String(row.id) === params.matchId || row.sourceUrl.includes(`/match/detail/${params.matchId}`));
  return match
    ? NextResponse.json({ ok: true, data: match })
    : NextResponse.json({ ok: false, message: "Match not found" }, { status: 404 });
}
