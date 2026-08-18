import { NextResponse } from "next/server";
import { readClubData } from "@/lib/server-store";

export async function GET() {
  const backendBase = (process.env.FASTAPI_URL || process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
  if (backendBase) {
    try {
      const response = await fetch(`${backendBase}/api/teams`, { cache: "no-store" });
      const payload = await response.json();
      return NextResponse.json(payload, { status: response.ok ? 200 : response.status });
    } catch {
      // Fall back to the local Next store so the page still renders in local-only mode.
    }
  }

  const data = await readClubData();
  return NextResponse.json({ ok: true, data: data.teams });
}
