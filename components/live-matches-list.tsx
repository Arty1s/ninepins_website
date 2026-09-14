"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronRight, MapPin, Radio } from "lucide-react";
import { type LiveMatch } from "@/lib/live-store";
import { ClubLogo } from "@/components/club-logo";

const ALL_COMPETITIONS = "Všetky";
const COMPETITIONS = [ALL_COMPETITIONS, "Extraliga muži", "Extraliga ženy", "1. liga", "2. liga", "3. liga", "Dorast"];
const OFFICIAL_TEAM_PAIRS = new Set([
  "355:4855", "356:4865", "359:4889", "362:4925", "361:4923",
  "372:5041", "373:5054", "376:5084"
]);
const DEFAULT_COLLAPSED_SEASONS = new Set(["2025/2026"]);
const SEASON_SHELLS = ["2026/2027", "2025/2026"];

export function LiveMatchesList() {
  const [rows, setRows] = useState<LiveMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [competition, setCompetition] = useState(ALL_COMPETITIONS);
  const [season, setSeason] = useState("2026/2027");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetch("/api/matches?page_size=1000", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload) => {
        if (cancelled) return;
        const nextRows = Array.isArray(payload.items)
          ? payload.items
          : Array.isArray(payload.data)
            ? payload.data
            : [];
        setRows(nextRows);
      })
      .catch(() => {
        if (!cancelled) setRows([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const normalizedRows = useMemo(() => {
    return dedupeMatches(rows)
      .map(normalizeMatch)
      .filter(isOfficialHlohovecMatch);
  }, [rows]);

  const matches = useMemo(() => {
    return normalizedRows
      .filter((match) => (competition === ALL_COMPETITIONS || match.competitionName === competition) && match.seasonName === season)
      .sort((a, b) => dateValue(a.date) - dateValue(b.date));
  }, [competition, normalizedRows, season]);

  const monthGroups = useMemo(() => groupByMonth(matches), [matches]);

  const competitionCounts = useMemo(() => {
    return COMPETITIONS.reduce<Record<string, number>>((acc, name) => {
      acc[name] = name === ALL_COMPETITIONS
        ? normalizedRows.length
        : normalizedRows.filter((match) => match.competitionName === name).length;
      return acc;
    }, {});
  }, [normalizedRows]);

  return (
    <section className="relative overflow-hidden bg-[#06182f] py-5 text-white sm:py-7">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(22,136,255,.18),transparent_34%),linear-gradient(180deg,#071a33_0%,#041121_100%)]" />
      <div className="absolute inset-0 opacity-[.10] [background-image:linear-gradient(110deg,transparent_0%,transparent_46%,rgba(47,155,255,.30)_47%,transparent_48%,transparent_100%)] [background-size:420px_100%]" />
      <div className="container-page relative z-10">
        <div className="flex flex-col gap-3 border-b border-white/[0.08] pb-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {COMPETITIONS.filter((name) => competitionCounts[name] > 0).map((name) => (
              <button key={name} type="button" onClick={() => setCompetition(name)} className={`shrink-0 rounded-md px-4 py-2.5 text-xs font-bold transition ring-1 ${competition === name ? "bg-[#1688ff] text-white ring-[#42a0ff]" : "bg-[#0a2341] text-[#afc3dc] ring-white/[0.08] hover:bg-[#103158]"}`}>{name}{name === ALL_COMPETITIONS ? ` (${competitionCounts[name]})` : ""}</button>
            ))}
          </div>
          <label className="flex shrink-0 items-center gap-3 text-xs font-black text-[#afc3dc]"><span>Sezóna</span><span className="flex items-center gap-2 rounded-md bg-[#0a2341] px-3 ring-1 ring-white/[0.09]"><CalendarDays size={15} className="text-[#48a3ff]" /><select value={season} onChange={(event) => setSeason(event.target.value)} className="h-10 bg-transparent font-bold text-white outline-none">{SEASON_SHELLS.map((value) => <option key={value} value={value} className="bg-[#081a34]">{value}</option>)}</select></span></label>
        </div>
        <div className="mt-6">
        {loading ? (
          <EmptyState text="Načítavam zápasy z backendu..." />
        ) : !matches.length ? (
          <EmptyState text={`Backend vrátil ${rows.length} zápasov, ale pre vybraný filter sa nič nenašlo. Skús zmeniť súťaž.`} />
        ) : (
          <div className="space-y-7">
            {monthGroups.map((group) => <section key={group.key}><div className="mb-3 flex items-center gap-4"><h2 className="text-lg font-black text-white">{group.label}</h2><span className="h-px flex-1 bg-white/[0.09]" /><span className="text-[11px] text-[#8fa7c5]">{group.rows.length} zápasov</span></div><div className="overflow-hidden rounded-xl ring-1 ring-[#245a8b]/45">{group.rows.map((match) => <MatchRow key={matchKey(match)} match={match} />)}</div></section>)}
          </div>
        )}
        </div>
      </div>
    </section>
  );
}

function groupByCompetition(matches: NormalizedMatch[], selectedCompetition: string) {
  const names = selectedCompetition === ALL_COMPETITIONS
    ? Array.from(new Set(matches.map((match) => match.competitionName))).filter(Boolean)
    : [selectedCompetition];
  return names.map((name) => ({
    name,
    rows: matches.filter((match) => match.competitionName === name)
  })).filter((group) => group.rows.length);
}

function groupByMonth(matches: NormalizedMatch[]) {
  const grouped = new Map<string, { label: string; rows: NormalizedMatch[] }>();
  matches.forEach((match) => {
    const date = parsedDate(match.date);
    const key = date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}` : "unknown";
    const label = date ? date.toLocaleDateString("sk-SK", { month: "long", year: "numeric" }).replace(/^./, (letter) => letter.toUpperCase()) : "Bez dátumu";
    const group = grouped.get(key) || { label, rows: [] };
    group.rows.push(match);
    grouped.set(key, group);
  });
  return Array.from(grouped.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => ({ key, ...value }));
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl bg-[linear-gradient(180deg,rgba(10,29,58,.72),rgba(8,23,46,.55))] p-8 text-[#b9c7db] shadow-[inset_0_1px_0_rgba(255,255,255,.04)] ring-1 ring-white/[0.05]">
      <p className="max-w-3xl text-sm leading-7">{text}</p>
    </div>
  );
}

function MatchRow({ match }: { match: NormalizedMatch }) {
  const completed = isCompletedMatch(match);
  const date = parsedDate(match.date);
  return (
    <article className="grid min-w-0 items-stretch border-b border-white/[0.06] bg-[linear-gradient(90deg,#0b2341,#071b34)] last:border-0 hover:bg-[#0e2b50] lg:grid-cols-[76px_minmax(0,1fr)_260px]">
      <div className="flex items-center justify-center border-b border-white/[0.06] bg-[#0c294b] px-3 py-3 text-center lg:border-b-0 lg:border-r">
        <div><span className="block text-[9px] font-bold uppercase text-[#8fa7c5]">{date ? date.toLocaleDateString("sk-SK", { weekday: "short" }) : ""}</span><strong className="block text-lg leading-5 text-white">{date ? `${date.getDate()}. ${date.getMonth() + 1}.` : match.date}</strong></div>
      </div>
      <div className="min-w-0 px-4 py-3">
        <p className="mb-2 text-[9px] font-black uppercase tracking-[0.1em] text-[#48a3ff]">{match.competitionName} <span className="ml-2 text-[#8fa7c5]">· {match.round}</span></p>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <RowTeam name={match.home} externalTeamId={match.homeExternalTeamId} logoUrl={match.homeTeam?.logoUrl} />
          <div className="min-w-24 text-center"><strong className="block whitespace-nowrap text-2xl font-black text-white">{completed ? formatScore(match.score) : "— : —"}</strong><span className={`mt-1 inline-block rounded px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.08em] ${completed ? "bg-emerald-500/20 text-emerald-300" : "bg-[#1d4168] text-[#91bce8]"}`}>{completed ? "Odohrané" : "Nadchádzajúci zápas"}</span></div>
          <RowTeam right name={match.away} externalTeamId={match.awayExternalTeamId} logoUrl={match.awayTeam?.logoUrl} />
        </div>
      </div>
      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-t border-white/[0.06] px-4 py-3 xl:border-l xl:border-t-0"><div className="flex min-w-0 items-start gap-2"><MapPin size={16} className="mt-0.5 shrink-0 text-[#48a3ff]" /><div className="min-w-0"><span className="block break-words text-[10px] leading-4 text-[#8fa7c5]">{match.location || "Miesto bude doplnené"}</span>{match.streamUrl ? <a href={match.streamUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-[9px] font-black uppercase text-red-400"><Radio size={11} />{completed ? "Záznam" : "Stream"}</a> : null}</div></div><Link href={`/zapasy/${match.id}`} className="inline-flex h-9 shrink-0 items-center gap-2 rounded-md bg-[#0e3158] px-3 text-[10px] font-black uppercase text-white ring-1 ring-[#2874b9]/60 hover:bg-[#164575]">{completed ? "Zápisnica" : "Detail"}<ChevronRight size={14} /></Link></div>
    </article>
  );
}

function RowTeam({ name, externalTeamId, logoUrl, right = false }: { name: string; externalTeamId?: number | null; logoUrl?: string; right?: boolean }) {
  return <div className={`flex min-w-0 items-center gap-2 ${right ? "flex-row-reverse text-right" : ""}`}><div className="[&>span]:h-9 [&>span]:w-9"><ClubLogo name={name} externalTeamId={externalTeamId} logoUrl={logoUrl} /></div><p className="truncate text-xs font-black text-white sm:text-sm">{name}</p></div>;
}

type NormalizedMatch = LiveMatch & {
  competitionName: string;
  seasonName: string;
};

function normalizeMatch(match: LiveMatch): NormalizedMatch {
  const competitionName = match.competition || matchCategory(match);
  return {
    ...match,
    competitionName,
    seasonName: match.season || matchSeason(match),
    league: match.league || competitionName
  };
}

function dedupeMatches(matches: LiveMatch[]) {
  const seen = new Set<string>();
  return [...matches].sort((a, b) => Number(hasOfficialPair(b)) - Number(hasOfficialPair(a))).filter((match) => {
    const normalized = normalizeMatch(match);
    const key = visibleMatchKey(normalized);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function visibleMatchKey(match: LiveMatch | NormalizedMatch) {
  return [
    match.home,
    match.away,
    match.date,
    "competitionName" in match ? match.competitionName : match.competition || match.league,
    match.round
  ].map(normalizeText).join("|");
}

function matchKey(match: LiveMatch | NormalizedMatch) {
  const sourceId = match.sourceUrl.match(/\/match\/detail\/(\d+)/)?.[1];
  if (sourceId) return `source:${sourceId}`;
  return [
    match.home,
    match.away,
    match.date,
    "competitionName" in match ? match.competitionName : match.competition || match.league,
    match.round
  ].map(normalizeText).join("|");
}

function matchSeason(match: LiveMatch) {
  const explicit = match.league.match(/20\d{2}\/20\d{2}/)?.[0];
  if (explicit) return explicit;
  const matchDate = parsedDate(match.date);
  if (!matchDate) return "Staršie";
  const year = matchDate.getFullYear();
  const month = matchDate.getMonth() + 1;
  const seasonStartYear = month >= 7 ? year : year - 1;
  return `${seasonStartYear}/${seasonStartYear + 1}`;
}

function matchCategory(match: LiveMatch) {
  const value = normalizeText(`${match.competition || ""} ${match.league} ${match.home} ${match.away}`);
  if (value.includes("1. liga") || value.includes("1 liga") || value.includes("1. kl") || value.includes("1 kl") || value.includes("1.kl")) return "1. liga";
  if (value.includes("dorast")) return "Dorast";
  if (value.includes("extraliga") && (value.includes("zen") || value.includes("zenska") || value.includes("zeny"))) return "Extraliga ženy";
  if (value.includes("extraliga")) return "Extraliga muži";
  if (value.includes("3. liga") || value.includes("3 liga") || value.includes("iii liga") || value.includes("3.kl") || value.includes("3kl") || value.includes("tretia")) return "3. liga";
  if (value.includes("2. liga") || value.includes("2 liga") || value.includes("ii liga") || value.includes("2.kl") || value.includes("2kl") || value.includes("druha")) return "2. liga";
  return "Nezaradené";
}

function readableStatus(value: string) {
  if (normalizeText(value).includes("plan")) return "Plánované";
  if (normalizeText(value).includes("odohran")) return "Odohrané";
  return "Importované";
}

function isCompletedMatch(match: LiveMatch) {
  return normalizeText(match.status).includes("odohran") || /^\s*\d+(?:[.,]\d+)?\s*:\s*\d+(?:[.,]\d+)?\s*$/.test(match.score);
}

function formatScore(value: string) {
  return value.replace(/\.0/g, "").replace(/\s*:\s*/g, " : ");
}

function formatPins(value: string) {
  return value.replace(/\s*:\s*/g, " : ");
}

function dateValue(value: string) {
  return parsedDate(value)?.getTime() || 0;
}

function parsedDate(value: string) {
  const iso = value.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
  const match = value.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
  if (!match) return null;
  return new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]));
}

function normalizeText(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function isOfficialHlohovecMatch(match: NormalizedMatch) {
  if (hasOfficialPair(match)) return true;
  if (match.externalLeagueId) return false;
  return normalizeText(`${match.home} ${match.away}`).includes("hlohovec");
}

function hasOfficialPair(match: LiveMatch | NormalizedMatch) {
  if (!match.externalLeagueId) return false;
  const homePair = `${match.externalLeagueId}:${match.homeExternalTeamId || ""}`;
  const awayPair = `${match.externalLeagueId}:${match.awayExternalTeamId || ""}`;
  return OFFICIAL_TEAM_PAIRS.has(homePair) || OFFICIAL_TEAM_PAIRS.has(awayPair);
}
