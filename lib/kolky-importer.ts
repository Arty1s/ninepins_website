import "server-only";

import { promises as fs } from "fs";
import path from "path";
import { type LiveMatch } from "@/lib/live-store";
import fixtureMatches from "@/fixtures/kolky-hlohovec-matches.json";

const DEFAULT_IMPORT_URLS = [
  "https://vysledky.kolky.sk/match/detail/43531/KO-Zarnovica-vs-KKZ-Hlohovec-A"
];

const DEFAULT_SEASON_START = "2025-09-01";
const DEFAULT_QUERY = "Hlohovec";
const MAX_DISCOVERED_URLS = 250;
const DEFAULT_ID_SCAN_FROM = 43000;
const DEFAULT_ID_SCAN_TO = 44050;
const ID_SCAN_CONCURRENCY = 8;
const FETCH_TIMEOUT_MS = 15000;
const DEFAULT_CACHE_FILE = "fixtures/kolky-hlohovec-matches.json";

export type KolkyImportMode = "live" | "cache" | "fixture";

export type KolkyImportLog = {
  level: "info" | "warning" | "error";
  type: "dns_failure" | "timeout" | "blocked_connection" | "http_error" | "invalid_html" | "no_match" | "cache" | "fixture" | "import";
  message: string;
  url: string;
};

export type KolkyImportOptions = {
  from: string;
  to: string;
  query: string;
  includeUndatedManualUrls: boolean;
  mode: KolkyImportMode;
  cacheFile: string;
  fallbackFixture: boolean;
};

export type KolkyImportResult = {
  imported: LiveMatch[];
  checkedUrls: string[];
  warnings: string[];
  logs: KolkyImportLog[];
  status: "imported" | "partial" | "no_matches" | "failed";
  mode: KolkyImportMode;
  from: string;
  to: string;
  query: string;
};

export async function importHlohovecMatchesFromKolky(
  manualUrls: string[] = [],
  options: KolkyImportOptions = {}
): Promise<KolkyImportResult> {
  const from = normalizeIsoDate(options.from || process.env.KOLKY_IMPORT_FROM || DEFAULT_SEASON_START);
  const to = normalizeIsoDate(options.to || process.env.KOLKY_IMPORT_TO || new Date().toISOString().slice(0, 10));
  const query = options.query || process.env.KOLKY_IMPORT_QUERY || DEFAULT_QUERY;
  const mode = options.mode || "live";
  const logs: KolkyImportLog[] = [];
  if (mode === "fixture") {
    const imported = filterMatchesByRange(readFixtureMatches(logs), from, to, query);
    return resultFor({ imported, checkedUrls: ["fixtures/kolky-hlohovec-matches.json"], logs, from, to, query, mode });
  }

  if (mode === "cache") {
    const imported = filterMatchesByRange(await readCachedMatches(options.cacheFile, logs), from, to, query);
    return resultFor({ imported, checkedUrls: [options.cacheFile || process.env.KOLKY_IMPORT_CACHE_FILE || DEFAULT_CACHE_FILE], logs, from, to, query, mode });
  }

  const urls = manualUrls.length ? unique(manualUrls) : await discoverImportUrls(query, logs);
  const imported: LiveMatch[] = [];
  const warnings: string[] = [];

  logs.push({ level: "info", type: "import", message: `Starting live import. Checking ${urls.length} URLs.` });
  await importUrls(urls, { query, from, to, manual: manualUrls.length > 0, includeUndatedManualUrls: options.includeUndatedManualUrls }, imported, warnings, logs);

  if (!imported.length && options.fallbackFixture) {
    logs.push({ level: "warning", type: "fixture", message: "Live import found no matches. Using development fixture fallback." });
    imported.push(...filterMatchesByRange(readFixtureMatches(logs), from, to, query));
  }

  return resultFor({ imported, checkedUrls: urls, warnings, logs, from, to, query, mode });
}

async function discoverImportUrls(query: string, logs: KolkyImportLog[]) {
  const explicitUrls = splitEnvList(process.env.KOLKY_IMPORT_URLS);
  if (explicitUrls.length) return unique(explicitUrls);

  const discovered = await discoverFromIndex(query, logs);
  const idScanUrls = buildIdScanUrls();
  return unique([...discovered, ...DEFAULT_IMPORT_URLS, ...idScanUrls]).slice(0, MAX_DISCOVERED_URLS + idScanUrls.length);
}

async function importUrls(
  urls: string[],
  options: { query: string; from: string; to: string; manual: boolean; includeUndatedManualUrls: boolean },
  imported: LiveMatch[],
  warnings: string[],
  logs: KolkyImportLog[]
) {
  let cursor = 0;
  const workers = Array.from({ length: Math.min(ID_SCAN_CONCURRENCY, Math.max(urls.length, 1)) }, async () => {
    while (cursor < urls.length) {
      const url = urls[cursor];
      cursor += 1;
      await importSingleUrl(url, options, imported, warnings, logs);
    }
  });

  await Promise.all(workers);
}

async function importSingleUrl(
  url: string,
  options: { query: string; from: string; to: string; manual: boolean; includeUndatedManualUrls: boolean },
  imported: LiveMatch[],
  warnings: string[],
  logs: KolkyImportLog[]
) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const response = await fetch(url, {
      cache: "no-store",
      signal: controller.signal,
      headers: {
        "user-agent": "KKHlohovecWebsiteBot/1.0 (+https://kkhlohovec.sk)"
      }
    });
    clearTimeout(timeout);

    if (!response.ok) {
      if (response.status !== 404) {
        const message = `${url}: HTTP ${response.status}`;
        warnings.push(message);
        logs.push({ level: "warning", type: "http_error", message, url });
      }
      return;
    }

    const html = await response.text();
    if (!looksLikeValidMatchHtml(html)) {
      const message = `${url}: invalid HTML or no match detail content`;
      warnings.push(message);
      logs.push({ level: "warning", type: "invalid_html", message, url });
      return;
    }

    const text = stripTags(html);
    if (!containsQuery(text, options.query) && !containsQuery(url, options.query)) {
      logs.push({ level: "info", type: "no_match", message: "Page does not contain requested team query.", url });
      return;
    }

    const parsed = parseMatchDetail(url, html);
    const parsedDate = parseSlovakDate(parsed.date);
    const allowUndatedManualUrl = options.manual && options.includeUndatedManualUrls !== false;
    if (!parsedDate && !allowUndatedManualUrl) {
      const message = `${url}: match date not found, skipped by season filter`;
      warnings.push(message);
      logs.push({ level: "warning", type: "invalid_html", message, url });
      return;
    }

    if (parsedDate && !isDateInRange(parsedDate, options.from, options.to)) return;

    imported.push(parsed);
    logs.push({ level: "info", type: "import", message: `Imported ${parsed.home} vs ${parsed.away}.`, url });
  } catch (error) {
    const classified = classifyFetchError(error, url);
    warnings.push(classified.message);
    logs.push(classified);
  }
}

function buildIdScanUrls() {
  const from = Number(process.env.KOLKY_IMPORT_ID_FROM || DEFAULT_ID_SCAN_FROM);
  const to = Number(process.env.KOLKY_IMPORT_ID_TO || DEFAULT_ID_SCAN_TO);
  if (!Number.isFinite(from) || !Number.isFinite(to) || to < from) return [];

  const urls: string[] = [];
  for (let id = from; id <= to; id += 1) {
    urls.push(`https://vysledky.kolky.sk/match/detail/${id}`);
  }
  return urls;
}

async function discoverFromIndex(query: string, logs: KolkyImportLog[]) {
  const indexUrls = splitEnvList(process.env.KOLKY_IMPORT_INDEX_URLS || "https://vysledky.kolky.sk/archive,https://vysledky.kolky.sk/");
  const hrefs: string[] = [];
  const seenIndexes = new Set<string>();
  const queue = [...indexUrls];

  while (queue.length && hrefs.length < MAX_DISCOVERED_URLS) {
    const indexUrl = queue.shift();
    if (!indexUrl || seenIndexes.has(indexUrl)) continue;
    seenIndexes.add(indexUrl);

    try {
      const response = await fetch(indexUrl, {
        cache: "no-store",
        headers: { "user-agent": "KKHlohovecWebsiteBot/1.0" }
      });
      if (!response.ok) continue;
      const html = await response.text();

      for (const href of extractHrefs(html, indexUrl)) {
        if (/\/match\/detail\//i.test(href)) {
          hrefs.push(href);
          continue;
        }

        if (isUsefulDiscoveryLink(href, indexUrl, query) && !seenIndexes.has(href)) {
          queue.push(href);
        }
      }
    } catch (error) {
      // Keep discovery resilient. Manual URLs and ID scan still run.
      const classified = classifyFetchError(error, indexUrl);
      logs.push(classified);
      console.warn("[kolky-import] discovery failed", classified);
    }
  }

  return unique(hrefs).slice(0, MAX_DISCOVERED_URLS);
}

function looksLikeValidMatchHtml(html: string) {
  const normalized = stripTags(html).toLowerCase();
  return html.length > 200 && (
    normalized.includes("body") ||
    normalized.includes("spolu") ||
    normalized.includes("kolky") ||
    normalized.includes("priebeh") ||
    /\/match\/detail\//i.test(html)
  );
}

function classifyFetchError(error: unknown, url: string): KolkyImportLog {
  const raw = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  const lower = raw.toLowerCase();
  let type: KolkyImportLog["type"] = "blocked_connection";
  let message = `${url || "request"}: connection failed (${raw})`;

  if (lower.includes("abort") || lower.includes("timeout") || lower.includes("timed out")) {
    type = "timeout";
    message = `${url || "request"}: timeout after ${FETCH_TIMEOUT_MS}ms`;
  } else if (lower.includes("enotfound") || lower.includes("getaddrinfo") || lower.includes("dns")) {
    type = "dns_failure";
    message = `${url || "request"}: DNS lookup failed`;
  } else if (lower.includes("eacces") || lower.includes("eperm") || lower.includes("forbidden") || lower.includes("10013") || lower.includes("fetch failed")) {
    type = "blocked_connection";
    message = `${url || "request"}: blocked connection or socket permission denied`;
  }

  return { level: "error", type, message, url };
}

function resultFor(input: {
  imported: LiveMatch[];
  checkedUrls: string[];
  warnings: string[];
  logs: KolkyImportLog[];
  from: string;
  to: string;
  query: string;
  mode: KolkyImportMode;
}): KolkyImportResult {
  if (!input.imported.length) {
    const hasErrorsBeforeZeroLog = input.logs.some((log) => log.level === "error");
    input.logs.push({
      level: hasErrorsBeforeZeroLog ? "error" : "warning",
      type: "no_match",
      message: "Import finished with zero matches. No site data was silently changed."
    });
  }

  const warnings = input.warnings || input.logs.filter((log) => log.level !== "info").map((log) => log.message);
  const hasErrors = input.logs.some((log) => log.level === "error");
  const status: KolkyImportResult["status"] = input.imported.length
    ? hasErrors
      ? "partial"
      : "imported"
    : hasErrors
      ? "failed"
      : "no_matches";

  return { ...input, warnings, status };
}

function readFixtureMatches(logs: KolkyImportLog[]) {
  logs.push({ level: "info", type: "fixture", message: "Loaded development fixture matches." });
  return (fixtureMatches as LiveMatch[]).map((match) => ({ ...match, importStatus: "auto" as const }));
}

async function readCachedMatches(cacheFile: string | undefined, logs: KolkyImportLog[]) {
  const relative = cacheFile || process.env.KOLKY_IMPORT_CACHE_FILE || DEFAULT_CACHE_FILE;
  const filePath = resolveProjectFile(relative);
  if (!filePath) {
    logs.push({ level: "error", type: "cache", message: `Rejected cache path outside project: ${relative}` });
    return [];
  }

  try {
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as LiveMatch[] | { matches: LiveMatch[] };
    const rows = Array.isArray(parsed) ? parsed : parsed.matches || [];
    logs.push({ level: "info", type: "cache", message: `Loaded ${rows.length} cached matches from ${path.relative(process.cwd(), filePath)}.` });
    return rows.map((match) => ({ ...match, importStatus: match.importStatus || ("auto" as const) }));
  } catch (error) {
    logs.push({ level: "error", type: "cache", message: `Could not read cache file inside project (${relative}): ${error instanceof Error ? error.message : "unknown error"}` });
    return [];
  }
}

function resolveProjectFile(relativePath: string) {
  if (path.isAbsolute(relativePath)) return null;
  const projectRoot = process.cwd();
  const resolved = path.resolve(projectRoot, relativePath);
  return resolved.startsWith(projectRoot + path.sep) || resolved === projectRoot ? resolved : null;
}

function filterMatchesByRange(matches: LiveMatch[], from: string, to: string, query: string) {
  return matches.filter((match) => {
    if (!containsQuery(`${match.home} ${match.away} ${match.league} ${match.sourceUrl}`, query)) return false;
    const parsed = parseSlovakDate(match.date);
    if (!parsed) return true;
    return isDateInRange(parsed, from, to);
  });
}

function parseMatchDetail(sourceUrl: string, html: string): LiveMatch {
  const text = normalizeWhitespace(stripTags(html));
  const title = decodeHtml(extractTitle(html) || text.slice(0, 160));
  const teams = parseTeamsFromUrl(sourceUrl);
  const score = firstMatch(text, /(:BODY\s*)(\d+(:[.,]\d+))\s*:\s*(\d+(:[.,]\d+))/i) || "import";
  const pins = firstMatch(text, /(:SPOLU|KOLKY)\s*(\d[\d\s]{2,})\s*:\s*(\d[\d\s]{2,})/i) || "-";
  const date = firstMatch(text, /(\d{1,2}\.\d{1,2}\.\d{4})/) || "";
  const location = decodeHtml(lastUrlPart(sourceUrl).split("-vs-")[0].replaceAll("-", " ") || "kolky.sk");
  const players = parsePlayerRows(text);

  return {
    id: stableId(sourceUrl),
    sourceUrl,
    league: title.includes("Extraliga") ? "Extraliga" : "Import kolky.sk",
    round: firstMatch(text, /(\d+\.\s*kolo)/i) || "Import",
    date,
    location,
    home: teams.home,
    away: teams.away,
    score,
    pins,
    status: "import",
    detailRows: players,
    importedAt: new Date().toISOString(),
    importStatus: "auto"
  };
}

function parseTeamsFromUrl(url: string) {
  const slug = decodeURIComponent(lastUrlPart(url));
  const withoutId = slug.replace(/^\d+[-/]/, "");
  const [homeRaw, awayRaw] = withoutId.split("-vs-");
  return {
    home: cleanupTeamName(homeRaw) || "Domáci tím",
    away: cleanupTeamName(awayRaw) || "Hostia"
  };
}

function parsePlayerRows(text: string) {
  const rows: string[] = [];
  const rowPattern = /([A-ZÁČĎÉÍĽĹŇÓÔŔŠŤÚÝŽ][A-Za-zÁ-ž.\s-]{4,})\s+(:Plne\s*)(\d{3})\s+(:Dor\.\s*)(\d{2,3})\s+(:CH\s*)(\d{1,2})\s+(:SUM\s*)(\d{3})/g;
  let match: RegExpExecArray | null;

  while ((match = rowPattern.exec(text)) && rows.length < 24) {
    rows.push(`${match[1].trim()} | ${match[2]} | ${match[3]} | ${match[4]} | ${match[5]}`);
  }

  return rows.join("\n");
}

function splitEnvList(value: string) {
  return (value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function unique(values: string[]) {
  return Array.from(new Set(values));
}

function extractHrefs(html: string, base: string) {
  const hrefs: string[] = [];
  const pattern = /href=["']([^"'#]+)["']/gi;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(html))) {
    try {
      hrefs.push(toAbsoluteUrl(match[1], base));
    } catch {
      // Ignore malformed links from the source page.
    }
  }

  return hrefs;
}

function toAbsoluteUrl(href: string, base: string) {
  return new URL(href, base).toString();
}

function sameHost(url: string, base: string) {
  try {
    return new URL(url).host === new URL(base).host;
  } catch {
    return false;
  }
}

function isUsefulDiscoveryLink(url: string, base: string, query: string) {
  if (!sameHost(url, base)) return false;
  const path = new URL(url).pathname.toLowerCase();
  if (containsQuery(url, query)) return true;
  return [
    "/archive",
    "/league",
    "/competition",
    "/team",
    "/club",
    "/match"
  ].some((segment) => path.includes(segment));
}

function stripTags(html: string) {
  return html.replace(/<script[\s\S]*<\/script>/gi, " ").replace(/<style[\s\S]*<\/style>/gi, " ").replace(/<[^>]+>/g, " ");
}

function normalizeWhitespace(value: string) {
  return decodeHtml(value).replace(/\s+/g, " ").trim();
}

function extractTitle(html: string) {
  return html.match(/<title[^>]*>([\s\S]*)<\/title>/i)?.[1]?.trim() || "";
}

function firstMatch(value: string, pattern: RegExp) {
  const match = value.match(pattern);
  return match ? match.slice(1).join(" : ").replace(/\s+/g, " ").trim() : "";
}

function lastUrlPart(url: string) {
  return url.split("/").filter(Boolean).pop() || "";
}

function cleanupTeamName(value: string) {
  if (!value) return "";
  return value.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toLocaleUpperCase("sk-SK")).trim();
}

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, "\"")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function normalizeIsoDate(value: string) {
  const slovakDate = parseSlovakDate(value);
  if (slovakDate) return toIsoDate(slovakDate);

  const iso = value.match(/\d{4}-\d{2}-\d{2}/)?.[0];
  return iso || DEFAULT_SEASON_START;
}

function parseSlovakDate(value: string) {
  const match = value.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
  if (!match) return null;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  if (!day || !month || !year) return null;

  return new Date(Date.UTC(year, month - 1, day));
}

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function isDateInRange(date: Date, from: string, to: string) {
  const value = toIsoDate(date);
  return value >= from && value <= to;
}

function containsQuery(value: string, query: string) {
  const normalizedValue = normalizeForSearch(value);
  return query
    .split(/[,\s]+/)
    .filter(Boolean)
    .some((part) => normalizedValue.includes(normalizeForSearch(part)));
}

function normalizeForSearch(value: string) {
  return decodeHtml(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function stableId(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) - hash + value.charCodeAt(index)) | 0;
  }
  return Math.abs(hash);
}
