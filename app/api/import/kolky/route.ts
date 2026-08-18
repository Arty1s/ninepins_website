import { NextResponse, type NextRequest } from "next/server";
import { requireAdminSession } from "@/lib/admin-request";
import { importHlohovecMatchesFromKolky } from "@/lib/kolky-importer";
import { readClubData, writeClubData } from "@/lib/server-store";
import type { LiveMatch } from "@/lib/live-store";

export async function GET(request: NextRequest) {
  return runImport(request);
}

export async function POST(request: NextRequest) {
  return runImport(request);
}

async function runImport(request: NextRequest) {
  const cronSecret = process.env.KOLKY_IMPORT_SECRET;
  const suppliedSecret = request.nextUrl.searchParams.get("secret") || request.headers.get("x-kkhc-import-secret");
  const isVercelCron = request.headers.get("user-agent").toLowerCase().includes("vercel-cron") || request.headers.get("x-vercel-cron") === "1";
  const isCron = Boolean((cronSecret && suppliedSecret === cronSecret) || isVercelCron);

  if (!isCron && !requireAdminSession()) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const clubData = await readClubData();
  const manualUrl = request.nextUrl.searchParams.get("url");
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

function mergeMatches(existing: LiveMatch[], imported: LiveMatch[]) {
  const bySource = new Map(existing.map((match) => [match.sourceUrl || String(match.id), match]));

  for (const match of imported) {
    const key = match.sourceUrl || String(match.id);
    const current = bySource.get(key);
    bySource.set(key, current.importStatus === "edited" ? current : { ...current, ...match });
  }

  return Array.from(bySource.values()).sort((a, b) => String(b.date).localeCompare(String(a.date)));
}
