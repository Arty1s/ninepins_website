import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-request";
import { readClubData, writeClubData } from "@/lib/server-store";
import type { LiveClubData } from "@/lib/live-store";

export async function GET() {
  if (!requireAdminSession()) return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ ok: true, data: await readClubData() });
}

export async function PUT(request: Request) {
  if (!requireAdminSession()) return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as { data?: LiveClubData };
  if (!body.data) return NextResponse.json({ ok: false, message: "Missing data" }, { status: 400 });

  const data = await writeClubData(body.data);
  return NextResponse.json({ ok: true, data });
}
