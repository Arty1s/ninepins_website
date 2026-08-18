import { NextResponse, type NextRequest } from "next/server";
import { requireAdminSession } from "@/lib/admin-request";

export async function POST(request: NextRequest) {
  if (!requireAdminSession()) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const backendBase = (process.env.FASTAPI_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");
  const upstreamUrl = new URL(`${backendBase}/api/admin/sync`);
  request.nextUrl.searchParams.forEach((value, key) => upstreamUrl.searchParams.set(key, value));

  const secret = process.env.KOLKY_IMPORT_SECRET;
  if (secret) upstreamUrl.searchParams.set("secret", secret);

  try {
    const response = await fetch(upstreamUrl, { method: "POST", cache: "no-store" });
    const payload = await response.json();
    return NextResponse.json(payload, { status: response.ok ? 200 : response.status });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      status: "failed",
      message: "FastAPI backend is not reachable. Start it and run sync again.",
      logs: [{
        level: "error",
        type: "backend_unreachable",
        message: error instanceof Error ? error.message : "Unknown backend connection error"
      }],
    }, { status: 502 });
  }
}
