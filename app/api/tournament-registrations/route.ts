import { NextResponse } from "next/server";
import { addRegistration, readRegistrations } from "@/lib/server-store";
import type { TournamentRegistration } from "@/lib/live-store";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const tournamentId = Number(url.searchParams.get("tournamentId"));
  const rows = await readRegistrations();
  const filtered = Number.isFinite(tournamentId) && tournamentId > 0 ? rows.filter((row) => row.tournamentId === tournamentId) : rows;
  return NextResponse.json({ ok: true, data: filtered });
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<TournamentRegistration>;
  if (!body.tournamentId || !body.name || !body.email || !body.slot) {
    return NextResponse.json({ ok: false, message: "Missing registration fields" }, { status: 400 });
  }

  const registration = await addRegistration({
    tournamentId: Number(body.tournamentId),
    name: String(body.name),
    club: String(body.club || "Bez klubu"),
    email: String(body.email),
    phone: String(body.phone || ""),
    slot: String(body.slot),
    note: String(body.note || ""),
    paymentStatus: body.paymentStatus === "free" ? "free" : "pending"
  });

  return NextResponse.json({ ok: true, data: registration });
}
