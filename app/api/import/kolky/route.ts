import { NextResponse, type NextRequest } from "next/server";
import { requireAdminSession } from "@/lib/admin-request";
import { importHlohovecMatchesFromKolky } from "@/lib/kolky-importer";
import { readClubData, writeClubData } from "@/lib/server-store";
import type { LiveMatch } from "@/lib/live-store";

// NOTE: in production (FASTAPI_URL set) Next.js rewrites /api/import/kolky
// straight to the FastAPI backend, so this handler is only the local fallback.
export async function POST(request: NextRequest) {
  return runImport(request);
}

async function runImport(request: NextRequest) {
  const cronSecret = process.env.KOLKY_IMPORT_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ ok: false, message: "Import is not configured" }, { status: 503 });
  }
  const suppliedSecret = request.headers.get("x-kkhc-import-secret");
  const isCron = !!suppliedSecret && suppliedSecret === cronSecret;

  if (!isCron && !requireAdminSession()) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const clubData = await readClubData();
  const manualUrl = request.nextUrl.searchParams.get("url");
  if (manualUrl && !isAllowedManualUrl(manualUrl)) {
    return NextResponse.json({ ok: false, message: "Only vysledky.kolky.sk match URLs can be imported" }, { status: 400 });
  }
  const from = request.nextUrl.searchParams.get("from") || undefined;
  const to = request.nextUrl.searchParams.get("to") || undefined;
  const query = request.nextUrl.searchParams.get("query") || undefined;
  const mode = request.nextUrl.searchParams.get("mode") || undefined;
  const cacheFile = request.nextUrl.searchParams.get("cacheFile") || undefined;
  const result = await importHlohovecMatchesFromKolky(manualUrl ? [manualUrl] : [], {
    from,
    to,
    query,
    cacheFile,
    fallbackFixture: false,
    mode: mode === "cache" || mode === "fixture" ? mode : "live"
  });
  const matches = mergeMatches(clubData.matches, result.imported);
  await writeClubData({ ...clubData, matches });

  return NextResponse.json({
    ok: result.imported.length > 0,
    mode: isCron ? "cron" : "admin",
    importMode: result.mode,
    status: result.status,
    frequency: "prepared for every 24 hours",
    source: "https://vysledky.kolky.sk",
    from: result.from,
    to: result.to,
    query: result.query,
    importedCount: result.imported.length,
    checkedUrls: result.checkedUrls,
    warnings: result.warnings,
    logs: result.logs,
    matches: result.imported
  }, { status: result.imported.length || result.status === "no_matches" ? 200 : 502 });
}

function isAllowedManualUrl(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" &&
      (parsed.hostname === "vysledky.kolky.sk" || parsed.hostname === "www.vysledky.kolky.sk") &&
      parsed.pathname.startsWith("/match/detail/");
  } catch {
    return false;
  }
}

function mergeMatches(existing: LiveMatch[], imported: LiveMatch[]) {
  const bySource = new Map(existing.map((match) => [match.sourceUrl || String(match.id), match]));

  for (const match of imported) {
    const key = match.sourceUrl || String(match.id);
    const current = bySource.get(key);
    if (!current) {
      bySource.set(key, match);
    } else if (current.importStatus !== "edited") {
      bySource.set(key, { ...current, ...match });
    }
  }

  return Array.from(bySource.values()).sort((a, b) => String(b.date).localeCompare(String(a.date)));
}
