"use client";

import Link from "next/link";
import { CalendarDays, ChevronRight, MapPin } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { type LiveMatch } from "@/lib/live-store";

const OFFICIAL_TEAM_PAIRS = new Set([
  "355:4855", "356:4865", "359:4889", "362:4925", "361:4923",
  "372:5041", "373:5054", "376:5084"
]);

export function LiveHomeUpcomingMatches() {
  const [rows, setRows] = useState<LiveMatch[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/matches?page_size=1000", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload) => {
        if (cancelled) return;
        setRows(Array.isArray(payload.items) ? payload.items : Array.isArray(payload.data) ? payload.data : []);
      })
      .catch(() => {
        if (!cancelled) setRows([]);
      });
    return () => { cancelled = true; };
  }, []);

  const matches = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const seen = new Set<string>();
    return rows
      .filter(isOfficialClubMatch)
      .filter((match) => isUpcoming(match, now.getTime()))
      .sort((a, b) => dateValue(a.date) - dateValue(b.date))
      .filter((match) => {
        const key = [match.home, match.away, match.date, match.competition || match.league, match.round].map(normalize).join("|");
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 3);
  }, [rows]);

  if (!matches.length) {
    return <p className="rounded-lg border border-white/[0.08] bg-white/[0.035] px-4 py-5 text-sm text-[#9db4d2]">Najbližší program zatiaľ nie je zverejnený.</p>;
  }

  return (
    <div className="space-y-3">
      {matches.map((match) => {
        const date = parsedDate(match.date);
        return (
          <Link key={match.id} href={`/zapasy/${match.id}`} className="grid grid-cols-[52px_1fr_auto] items-center gap-3 rounded-lg border border-[#1b5790]/70 bg-[linear-gradient(180deg,rgba(8,38,78,.92),rgba(6,28,58,.88))] p-3 transition hover:border-[#2c86d8]">
            <span className="grid h-14 place-items-center rounded-md bg-[#147cff] text-center text-white">
              <span><strong className="block font-display text-xl leading-none">{date ? String(date.getDate()).padStart(2, "0") : "--"}</strong><small className="text-[9px] font-black uppercase">{date ? date.toLocaleDateString("sk-SK", { month: "short" }).replace(".", "") : ""}</small></span>
            </span>
            <span className="min-w-0">
              <strong className="block text-sm leading-5 text-white">{match.home} – {match.away}</strong>
              <span className="mt-1 flex flex-wrap gap-x-3 text-[11px] text-[#9db4d2]">
                <span>{[match.competition || match.league, match.round].filter(Boolean).join(" · ")}</span>
                {match.location ? <span className="inline-flex items-center gap-1"><MapPin size={11} />{match.location}</span> : null}
              </span>
            </span>
            <ChevronRight size={17} className="text-[#58a3ff]" />
          </Link>
        );
      })}
      <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.08em] text-[#58a3ff]"><CalendarDays size={13} /> Program zo stránky Zápasy</p>
    </div>
  );
}

function isOfficialClubMatch(match: LiveMatch) {
  if (match.externalLeagueId) {
    return OFFICIAL_TEAM_PAIRS.has(`${match.externalLeagueId}:${match.homeExternalTeamId || ""}`) || OFFICIAL_TEAM_PAIRS.has(`${match.externalLeagueId}:${match.awayExternalTeamId || ""}`);
  }
  return normalize(`${match.home} ${match.away}`).includes("hlohovec");
}

function isUpcoming(match: LiveMatch, today: number) {
  const timestamp = dateValue(match.date);
  const status = normalize(match.status);
  const score = match.score.trim();
  return timestamp >= today && (status.includes("plan") || !/\d/.test(score) || score === "-");
}

function parsedDate(value: string) {
  const iso = value.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
  const local = value.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
  return local ? new Date(Number(local[3]), Number(local[2]) - 1, Number(local[1])) : null;
}

function dateValue(value: string) {
  return parsedDate(value)?.getTime() || 0;
}

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}
