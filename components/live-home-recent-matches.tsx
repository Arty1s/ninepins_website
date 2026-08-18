"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { type RecentMatchWidget } from "@/components/home-widgets";
import { type Team } from "@/lib/landing-data";
import { type LiveMatch } from "@/lib/live-store";

const OFFICIAL_TEAM_PAIRS = new Set(["355:4855", "356:4865", "359:4889", "362:4925", "361:4923"]);

export function LiveHomeRecentMatches({ fallbackMatches }: { fallbackMatches: RecentMatchWidget[] }) {
  const [rows, setRows] = useState<LiveMatch[]>([]);
  const [loading, setLoading] = useState(true);

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

  const matches = useMemo(() => {
    const realMatches = dedupeHomeMatches(rows)
      .filter(isHomeHlohovecMatch)
      .sort((a, b) => homeDateValue(b.date) - homeDateValue(a.date))
      .slice(0, 3)
      .map(toRecentMatchWidget);

    return realMatches.length ? realMatches : fallbackMatches;
  }, [fallbackMatches, rows]);

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-3">
        {matches.map((match) => (
          <MatchResultWidget key={`${match.date}-${match.home.name}-${match.away.name}-${match.href}`} match={match} />
        ))}
      </div>
      {loading ? <p className="mt-4 text-xs font-bold uppercase tracking-[0.12em] text-[#8bbfff]">Nacitavam realne zapasy...</p> : null}
    </>
  );
}

function MatchResultWidget({ match }: { match: RecentMatchWidget }) {
  return (
    <article className="rounded-lg border border-[#1b5790]/70 bg-[linear-gradient(180deg,rgba(8,38,78,.92),rgba(6,28,58,.88))] px-4 pb-4 pt-3 shadow-[inset_0_1px_0_rgba(255,255,255,.055),0_14px_34px_rgba(0,0,0,.14)] transition duration-300 hover:-translate-y-0.5 hover:border-[#2c86d8]/75 hover:shadow-[inset_0_1px_0_rgba(255,255,255,.08),0_20px_42px_rgba(0,0,0,.2)]">
      <div className="flex items-center justify-between border-b border-[#183e67]/80 pb-3 text-[11px] uppercase text-[#9db4d2]">
        <span>{match.league}</span>
        <span>{match.date}</span>
      </div>
      <div className="mt-6 grid grid-cols-[1fr_110px_1fr] items-center gap-4 text-center">
        <TeamBadgeWidget team={match.home} pins={match.homePins} isClub={match.homeIsClub} />
        <strong className="font-display text-[2.65rem] font-black leading-none tracking-[0.08em] text-[#1688ff]">
          {match.score}
        </strong>
        <TeamBadgeWidget team={match.away} pins={match.awayPins} isClub={match.awayIsClub} />
      </div>
      <Link href={match.href} className="mt-5 flex justify-center border-t border-[#183e67]/70 pt-3 text-[11px] font-black uppercase tracking-[0.08em] text-[#58a3ff]">
        Detail zapasu
      </Link>
    </article>
  );
}

function TeamBadgeWidget({ team, pins, isClub = false }: { team: Team; pins: number | string; isClub: boolean }) {
  return (
    <div>
      {isClub ? (
        <span className="mx-auto grid h-[54px] w-[54px] place-items-center">
          <Image src="/kkhc-logo.png" alt="KK Hlohovec" width={54} height={54} className="kkhc-logo-cutout h-[48px] w-auto object-contain" />
        </span>
      ) : (
        <span className={`mx-auto grid h-[54px] w-[54px] place-items-center rounded-full bg-gradient-to-br ${team.badgeClass} ring-1 ring-white/15`}>
          <span className="px-1 text-[10px] font-black leading-none text-white">{team.shortName}</span>
        </span>
      )}
      <p className="mt-2 min-h-9 text-xs font-bold leading-tight text-white">{team.name}</p>
      <p className="font-display text-base font-black text-[#1688ff]">{pins}</p>
    </div>
  );
}

function toRecentMatchWidget(match: LiveMatch): RecentMatchWidget {
  const [homePins, awayPins] = parsePins(match.pins);
  const competition = match.competition || matchCategory(match);
  return {
    league: [competition, match.season, match.round].filter(Boolean).join(" - "),
    date: match.date,
    home: teamFromName(match.home),
    away: teamFromName(match.away),
    score: formatHomeScore(match.score),
    homePins,
    awayPins,
    href: `/zapasy/${match.id}`,
    homeIsClub: isHlohovecName(match.home),
    awayIsClub: isHlohovecName(match.away)
  };
}

function teamFromName(name: string): Team {
  const normalized = homeNormalizeText(name);
  return {
    name,
    shortName: isHlohovecName(name) ? "KKHC" : opponentShortName(name),
    badgeClass: isHlohovecName(name)
      ? "from-[#071a3d] to-[#0d2d67]"
      : normalized.includes("rakovice")
        ? "from-[#d51f31] to-[#7b111f]"
        : normalized.includes("trstena")
          ? "from-[#1f2937] to-[#020617]"
          : normalized.includes("inter")
            ? "from-[#0f172a] to-[#334155]"
            : normalized.includes("piestany")
              ? "from-[#1e7dff] to-[#0a2f72]"
              : "from-[#243b55] to-[#0b1628]"
  };
}

function opponentShortName(name: string) {
  const words = name
    .replace(/\b(KK|KKZ|KO|TJ|SK|SK|MKK)\b/gi, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const source = words.length ? words : name.split(/\s+/);
  return source
    .slice(0, 2)
    .map((word) => word[0] || "")
    .join("")
    .toUpperCase()
    .slice(0, 5) || "SUP";
}

function parsePins(value: string) {
  const [home, away] = value.split(":").map((part) => part.trim());
  return [home || "-", away || "-"];
}

function formatHomeScore(value: string) {
  return value.replace(/\.0/g, "").replace(/\s*:\s*/g, " : ");
}

function dedupeHomeMatches(matches: LiveMatch[]) {
  const seen = new Set<string>();
  return [...matches]
    .sort((a, b) => Number(hasOfficialHomePair(b)) - Number(hasOfficialHomePair(a)))
    .filter((match) => {
      const key = [match.home, match.away, match.date, match.competition || match.league, match.round].map(homeNormalizeText).join("|");
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function isHomeHlohovecMatch(match: LiveMatch) {
  if (hasOfficialHomePair(match)) return true;
  if (match.externalLeagueId) return false;
  return isHlohovecName(`${match.home} ${match.away}`);
}

function hasOfficialHomePair(match: LiveMatch) {
  if (!match.externalLeagueId) return false;
  const homePair = `${match.externalLeagueId}:${match.homeExternalTeamId || ""}`;
  const awayPair = `${match.externalLeagueId}:${match.awayExternalTeamId || ""}`;
  return OFFICIAL_TEAM_PAIRS.has(homePair) || OFFICIAL_TEAM_PAIRS.has(awayPair);
}

function matchCategory(match: LiveMatch) {
  const value = homeNormalizeText(`${match.competition || ""} ${match.league} ${match.home} ${match.away}`);
  if (value.includes("1. liga") || value.includes("1 liga") || value.includes("1. kl") || value.includes("1 kl") || value.includes("1.kl")) return "1. liga";
  if (value.includes("dorast")) return "Dorast";
  if (value.includes("extraliga") && (value.includes("zen") || value.includes("zenska") || value.includes("zeny"))) return "Extraliga zeny";
  if (value.includes("extraliga")) return "Extraliga muzi";
  if (value.includes("3. liga") || value.includes("3 liga") || value.includes("iii liga") || value.includes("3.kl") || value.includes("3kl") || value.includes("tretia")) return "3. liga";
  if (value.includes("2. liga") || value.includes("2 liga") || value.includes("ii liga") || value.includes("2.kl") || value.includes("2kl") || value.includes("druha")) return "2. liga";
  return match.league || "Zapas";
}

function homeDateValue(value: string) {
  const iso = value.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3])).getTime();
  const match = value.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
  if (!match) return 0;
  return new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1])).getTime();
}

function isHlohovecName(value: string) {
  return homeNormalizeText(value).includes("hlohovec");
}

function homeNormalizeText(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}
