"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronDown, ChevronRight, Filter, MapPin, SlidersHorizontal } from "lucide-react";
import { type LiveMatch } from "@/lib/live-store";
import { getLeagueTheme } from "@/lib/league-theme";
import { ClubLogo } from "@/components/club-logo";

const ALL_COMPETITIONS = "Všetky";
const COMPETITIONS = [ALL_COMPETITIONS, "Extraliga muži", "Extraliga ženy", "1. liga", "2. liga", "3. liga", "Dorast"];
const OFFICIAL_TEAM_PAIRS = new Set(["355:4855", "356:4865", "359:4889", "362:4925", "361:4923"]);
const DEFAULT_COLLAPSED_SEASONS = new Set(["2025/2026"]);
const SEASON_SHELLS = ["2026/2027", "2025/2026"];

export function LiveMatchesList() {
  const [rows, setRows] = useState<LiveMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [competition, setCompetition] = useState(ALL_COMPETITIONS);
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [openSeasons, setOpenSeasons] = useState<Set<string>>(new Set());

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
      .filter((match) => competition === ALL_COMPETITIONS || match.competitionName === competition)
      .sort((a, b) => sort === "newest" ? dateValue(b.date) - dateValue(a.date) : dateValue(a.date) - dateValue(b.date));
  }, [competition, normalizedRows, sort]);

  const seasonGroups = useMemo(() => {
    const grouped = new Map<string, NormalizedMatch[]>();
    matches.forEach((match) => {
      const seasonName = match.seasonName || "Staršie";
      grouped.set(seasonName, [...(grouped.get(seasonName) || []), match]);
    });
    SEASON_SHELLS.forEach((seasonName) => {
      if (!grouped.has(seasonName)) grouped.set(seasonName, []);
    });

    return Array.from(grouped.entries())
      .map(([seasonName, seasonMatches]) => ({
        seasonName,
        rows: seasonMatches,
        byCompetition: groupByCompetition(seasonMatches, competition)
      }))
      .sort((a, b) => b.seasonName.localeCompare(a.seasonName, "sk"));
  }, [competition, matches]);

  const competitionCounts = useMemo(() => {
    return COMPETITIONS.reduce<Record<string, number>>((acc, name) => {
      acc[name] = name === ALL_COMPETITIONS
        ? normalizedRows.length
        : normalizedRows.filter((match) => match.competitionName === name).length;
      return acc;
    }, {});
  }, [normalizedRows]);

  useEffect(() => {
    setOpenSeasons((current) => {
      if (current.size) return current;
      const next = new Set<string>();
      seasonGroups.forEach((group) => {
        if (!DEFAULT_COLLAPSED_SEASONS.has(group.seasonName)) next.add(group.seasonName);
      });
      return next;
    });
  }, [seasonGroups]);

  const toggleSeason = (seasonName: string) => {
    setOpenSeasons((current) => {
      const next = new Set(current);
      if (next.has(seasonName)) next.delete(seasonName);
      else next.add(seasonName);
      return next;
    });
  };

  return (
    <section className="relative overflow-hidden bg-[#06182f] py-14 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(22,136,255,.18),transparent_34%),linear-gradient(180deg,#071a33_0%,#041121_100%)]" />
      <div className="absolute inset-0 opacity-[.10] [background-image:linear-gradient(110deg,transparent_0%,transparent_46%,rgba(47,155,255,.30)_47%,transparent_48%,transparent_100%)] [background-size:420px_100%]" />
      <div className="container-page relative z-10 space-y-8">
        <div className="rounded-2xl bg-[linear-gradient(180deg,rgba(10,29,58,.88),rgba(8,23,46,.82))] p-5 shadow-[0_18px_55px_rgba(0,0,0,.30),inset_0_1px_0_rgba(255,255,255,.04)] ring-1 ring-white/[0.05]">
          <div className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[#8bbfff]">
            <Filter size={15} /> Filter zápasov
          </div>
          <div className="grid gap-3 lg:grid-cols-[1fr_.55fr]">
            <PillSelect
              label="Súťaž"
              value={competition}
              onChange={setCompetition}
              options={COMPETITIONS.filter((name) => competitionCounts[name] > 0)}
              labels={Object.fromEntries(COMPETITIONS.map((name) => [name, `${name} (${competitionCounts[name] || 0})`]))}
            />
            <PillSelect
              label="Zoradenie"
              value={sort}
              onChange={(value) => setSort(value as "newest" | "oldest")}
              options={["newest", "oldest"]}
              labels={{ newest: "Najnovšie", oldest: "Najstaršie" }}
            />
          </div>
          <p className="mt-3 text-xs leading-6 text-[#9fb7d8]">
            Zobrazené sú iba oficiálne družstvá KKZ Hlohovec. Súperi sú súčasťou zápasov, ale už nie sú samostatný filter.
          </p>
        </div>

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1688ff]">Výsledky KK Hlohovec</p>
            <h2 className="sport-title mt-2 text-4xl text-white">Zápasy podľa sezón</h2>
          </div>
          <span className="w-fit rounded-full bg-white/[0.06] px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#9bcaff] ring-1 ring-white/[0.06]">
            {matches.length} zápasov
          </span>
        </div>

        {loading ? (
          <EmptyState text="Načítavam zápasy z backendu..." />
        ) : !matches.length ? (
          <EmptyState text={`Backend vrátil ${rows.length} zápasov, ale pre vybraný filter sa nič nenašlo. Skús zmeniť súťaž.`} />
        ) : (
          <div className="space-y-5">
            {seasonGroups.map((group) => {
              const isOpen = openSeasons.has(group.seasonName);
              return (
                <section
                  key={group.seasonName}
                  className="overflow-hidden rounded-2xl bg-[linear-gradient(180deg,rgba(10,29,58,.80),rgba(8,23,46,.70))] shadow-[0_20px_55px_rgba(0,0,0,.30),inset_0_1px_0_rgba(255,255,255,.04)] ring-1 ring-white/[0.05]"
                >
                  <button
                    type="button"
                    onClick={() => toggleSeason(group.seasonName)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition hover:bg-white/[0.035]"
                  >
                    <span>
                      <span className="block text-xs font-black uppercase tracking-[0.18em] text-[#1688ff]">Sezóna</span>
                      <span className="mt-1 block text-2xl font-black text-white">{group.seasonName}</span>
                    </span>
                    <span className="flex items-center gap-3">
                      <span className="rounded-full bg-white/[0.06] px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#9bcaff]">
                        {group.rows.length} zápasov
                      </span>
                      <ChevronDown className={`text-[#1688ff] transition ${isOpen ? "rotate-180" : ""}`} size={24} />
                    </span>
                  </button>

                  {isOpen ? (
                    <div className="space-y-9 border-t border-white/[0.06] p-5">
                      {group.byCompetition.map((competitionGroup) => (
                        <div key={`${group.seasonName}-${competitionGroup.name}`} className="space-y-4">
                          <h3 className={`inline-flex w-fit rounded-full px-4 py-2 text-sm font-black uppercase tracking-[0.08em] ring-1 ${getLeagueTheme(competitionGroup.name).badge}`}>{competitionGroup.name}</h3>
                          <div className="grid gap-4 xl:grid-cols-3">
                            {competitionGroup.rows.map((match) => <MatchCard key={matchKey(match)} match={match} />)}
                          </div>
                        </div>
                      ))}
                      {!group.rows.length ? (
                        <EmptyState text="Táto sezóna je pripravená. Po importe nového rozpisu z vysledky.kolky.sk sa sem automaticky doplnia zápasy KKZ Hlohovec." />
                      ) : null}
                    </div>
                  ) : null}
                </section>
              );
            })}
          </div>
        )}
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

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl bg-[linear-gradient(180deg,rgba(10,29,58,.72),rgba(8,23,46,.55))] p-8 text-[#b9c7db] shadow-[inset_0_1px_0_rgba(255,255,255,.04)] ring-1 ring-white/[0.05]">
      <p className="max-w-3xl text-sm leading-7">{text}</p>
    </div>
  );
}

function MatchCard({ match }: { match: NormalizedMatch }) {
  const theme = getLeagueTheme(match.competitionName);
  return (
    <article className={`flex min-h-[245px] flex-col rounded-2xl bg-[linear-gradient(180deg,#0a1d3a_0%,#08172e_100%)] p-5 shadow-[0_16px_48px_rgba(0,0,0,.32),inset_0_1px_0_rgba(255,255,255,.04)] ring-1 ${theme.ring}`}>
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] pb-4 text-[11px] font-black uppercase tracking-[0.08em] text-[#9bcaff]">
        <span>{match.competitionName} · {match.round}</span>
        <span>{match.date}</span>
      </div>

      <div className="grid flex-1 grid-cols-[1fr_auto_1fr] items-center gap-3 py-6 text-center">
        <TeamBlock name={match.home} externalTeamId={match.homeExternalTeamId} logoUrl={match.homeTeam?.logoUrl} />
        <div>
          <strong className={`block whitespace-nowrap text-4xl font-black ${theme.text}`}>{formatScore(match.score)}</strong>
          <p className={`mt-2 text-sm font-black ${theme.text}`}>{formatPins(match.pins)}</p>
        </div>
        <TeamBlock name={match.away} externalTeamId={match.awayExternalTeamId} logoUrl={match.awayTeam?.logoUrl} />
      </div>

      <div className="grid gap-2 border-t border-white/[0.06] pt-4 text-sm text-[#b9c7db] sm:grid-cols-2">
        <p className="flex gap-2"><CalendarDays size={17} className={theme.text} /> {readableStatus(match.status)}</p>
        <p className="flex gap-2"><MapPin size={17} className={theme.text} /> {match.location || "kolky.sk"}</p>
      </div>

      <Link
        href={`/zapasy/${match.id}`}
        className={`mt-5 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-black uppercase tracking-[0.08em] text-white transition hover:-translate-y-0.5 ${theme.button}`}
      >
        Zobraziť detail <ChevronRight size={17} />
      </Link>
    </article>
  );
}

function TeamBlock({ name, externalTeamId, logoUrl }: { name: string; externalTeamId?: number | null; logoUrl?: string }) {
  return <div className="flex min-w-0 flex-col items-center gap-2"><ClubLogo name={name} externalTeamId={externalTeamId} logoUrl={logoUrl} /><p className="text-sm font-black leading-tight text-white">{name}</p></div>;
}

function PillSelect({
  label,
  value,
  options,
  labels,
  onChange
}: {
  label: string;
  value: string;
  options: string[];
  labels: Record<string, string>;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.14em] text-[#9bcaff]">
        <SlidersHorizontal size={13} /> {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-xl bg-[#081a34] px-4 text-sm font-bold text-white outline-none ring-1 ring-white/[0.08] transition focus:ring-[#1688ff]/60"
      >
        {options.map((option) => (
          <option key={option} value={option}>{labels?.[option] || option}</option>
        ))}
      </select>
    </label>
  );
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

function formatScore(value: string) {
  return value.replace(/\.0/g, "").replace(/\s*:\s*/g, " : ");
}

function formatPins(value: string) {
  return value.replace(/\s*:\s*/g, " : ");
}

function dateValue(value: string) {
  return parsedDate(value).getTime() || 0;
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
