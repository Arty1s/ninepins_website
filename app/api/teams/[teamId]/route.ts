import { NextResponse, type NextRequest } from "next/server";
import { readClubData } from "@/lib/server-store";

export async function GET(_: NextRequest, { params }: { params: { teamId: string } }) {
  const backendBase = (process.env.FASTAPI_URL || process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
  if (backendBase) {
    try {
      const response = await fetch(`${backendBase}/api/teams/${params.teamId}`, { cache: "no-store" });
      const payload = await response.json();
      return NextResponse.json(payload, { status: response.ok ? 200 : response.status });
    } catch {
      // Fall back to the local Next store so the page still renders in local-only mode.
    }
  }

  const data = await readClubData();
  const team = data.teams.find((row) => String(row.id) === params.teamId || String(row.externalTeamId || "") === params.teamId);
  return team
    ? NextResponse.json({ ok: true, data: team })
    : NextResponse.json({ ok: false, message: "Team not found" }, { status: 404 });
}
