import "server-only";

import { type LiveMatch } from "@/lib/live-store";

const DEFAULT_IMPORT_URLS = [
  "https://vysledky.kolky.sk/match/detail/43531/KO-Zarnovica-vs-KKZ-Hlohovec-A"
];

const DEFAULT_SEASON_START = "2026-07-01";
const DEFAULT_QUERY = "Hlohovec";
const MAX_DISCOVERED_URLS = 250;

export type KolkyImportOptions = {
  from?: string;
  to?: string;
  query?: string;
  includeUndatedManualUrls?: boolean;
};

export type KolkyImportResult = {
  imported: LiveMatch[];
  checkedUrls: string[];
  warnings: string[];
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
  const urls = manualUrls.length ? unique(manualUrls) : await discoverImportUrls(query);
  const imported: LiveMatch[] = [];
  const warnings: string[] = [];

  for (const url of urls) {
    try {
      const response = await fetch(url, {
        cache: "no-store",
        headers: {
          "user-agent": "KKHlohovecWebsiteBot/1.0 (+https://kkhlohovec.sk)"
        }
      });

      if (!response.ok) {
        warnings.push(`${url}: HTTP ${response.status}`);
        continue;
      }

      const html = await response.text();
      const text = stripTags(html);
      if (!containsQuery(text, query) && !containsQuery(url, query)) continue;

      const parsed = parseMatchDetail(url, html);
      const parsedDate = parseSlovakDate(parsed.date);
      const allowUndatedManualUrl = manualUrls.length > 0 && options.includeUndatedManualUrls !== false;
      if (!parsedDate && !allowUndatedManualUrl) {
        warnings.push(`${url}: match date not found, skipped by season filter`);
        continue;
      }

      if (parsedDate && !isDateInRange(parsedDate, from, to)) continue;

      imported.push(parsed);
    } catch (error) {
      warnings.push(`${url}: ${error instanceof Error ? error.message : "unknown error"}`);
    }
  }

  return { imported, checkedUrls: urls, warnings, from, to, query };
}

async function discoverImportUrls(query: string) {
  const explicitUrls = splitEnvList(process.env.KOLKY_IMPORT_URLS);
  if (explicitUrls.length) return unique(explicitUrls);

  const discovered = await discoverFromIndex(query);
  return unique([...discovered, ...DEFAULT_IMPORT_URLS]);
}

async function discoverFromIndex(query: string) {
  const indexUrls = splitEnvList(process.env.KOLKY_IMPORT_INDEX_URLS || "https://vysledky.kolky.sk/");
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

        if (
          sameHost(href, indexUrl) &&
          hrefs.length < MAX_DISCOVERED_URLS &&
          containsQuery(href, query) &&
          !seenIndexes.has(href)
        ) {
          queue.push(href);
        }
      }
    } catch {
      // Keep the importer resilient. Manual URLs still run.
    }
  }

  return unique(hrefs).slice(0, MAX_DISCOVERED_URLS);
}

function parseMatchDetail(sourceUrl: string, html: string): LiveMatch {
  const text = normalizeWhitespace(stripTags(html));
  const title = decodeHtml(extractTitle(html) || text.slice(0, 160));
  const teams = parseTeamsFromUrl(sourceUrl);
  const score = firstMatch(text, /(?:BODY\s*)?(\d+(?:[.,]\d+)?)\s*:\s*(\d+(?:[.,]\d+)?)/i) || "import";
  const pins = firstMatch(text, /(?:SPOLU|KOLKY)?\s*(\d[\d\s]{2,})\s*:\s*(\d[\d\s]{2,})/i) || "-";
  const date = firstMatch(text, /(\d{1,2}\.\d{1,2}\.\d{4})/) || "";
  const location = decodeHtml(lastUrlPart(sourceUrl).split("-vs-")[0]?.replaceAll("-", " ") || "kolky.sk");
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
  const rowPattern = /([A-ZÁČĎÉÍĽĹŇÓÔŔŠŤÚÝŽ][A-Za-zÁ-ž.\s-]{4,})\s+(?:Plne\s*)?(\d{3})\s+(?:Dor\.\s*)?(\d{2,3})\s+(?:CH\s*)?(\d{1,2})\s+(?:SUM\s*)?(\d{3})/g;
  let match: RegExpExecArray | null;

  while ((match = rowPattern.exec(text)) && rows.length < 24) {
    rows.push(`${match[1].trim()} | ${match[2]} | ${match[3]} | ${match[4]} | ${match[5]}`);
  }

  return rows.join("\n");
}

function splitEnvList(value?: string) {
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

function stripTags(html: string) {
  return html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ");
}

function normalizeWhitespace(value: string) {
  return decodeHtml(value).replace(/\s+/g, " ").trim();
}

function extractTitle(html: string) {
  return html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim();
}

function firstMatch(value: string, pattern: RegExp) {
  const match = value.match(pattern);
  return match ? match.slice(1).join(" : ").replace(/\s+/g, " ").trim() : "";
}

function lastUrlPart(url: string) {
  return url.split("/").filter(Boolean).pop() || "";
}

function cleanupTeamName(value?: string) {
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
