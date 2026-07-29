import { NextResponse } from "next/server";
import { readClubData } from "@/lib/server-store";

export async function GET() {
  return NextResponse.json({ ok: true, data: await readClubData() });
}
