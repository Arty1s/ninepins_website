import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-request";
import { readRegistrations, removeRegistration, writeRegistrations } from "@/lib/server-store";
import type { TournamentRegistration } from "@/lib/live-store";

export async function GET() {
  if (!requireAdminSession()) return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ ok: true, data: await readRegistrations() });
}

export async function PUT(request: Request) {
  if (!requireAdminSession()) return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  const body = (await request.json()) as { data?: TournamentRegistration[] };
  const data = await writeRegistrations(body.data || []);
  return NextResponse.json({ ok: true, data });
}

export async function DELETE(request: Request) {
  if (!requireAdminSession()) return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!Number.isFinite(id)) return NextResponse.json({ ok: false, message: "Missing id" }, { status: 400 });
  return NextResponse.json({ ok: true, data: await removeRegistration(id) });
}
