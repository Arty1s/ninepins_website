"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ExternalLink, MapPin } from "lucide-react";
import {
  readLiveData,
  subscribeLiveData,
  type LiveClubData,
  type LiveMatch,
  type LiveMatchPlayer,
  type LiveMatchTeam
} from "@/lib/live-store";

export function MatchDetailPage({ matchId }: { matchId: string }) {
  const [data, setData] = useState<LiveClubData>(() => readLiveData());
  const [remoteMatch, setRemoteMatch] = useState<LiveMatch | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/matches/${matchId}`, { cache: "no-store" })
      .then((response) => response.json())
      .then((payload) => {
        if (!cancelled && payload.data) setRemoteMatch(payload.data);
      })
      .catch(() => undefined);
    const unsubscribe = subscribeLiveData(setData);
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [matchId]);

  const match = useMemo(() => {
    if (remoteMatch) return remoteMatch;
    return data.matches.find((row) => String(row.id) === matchId || row.sourceUrl.includes(`/match/detail/${matchId}`));
  }, [data.matches, matchId, remoteMatch]);

  if (!match) {
    return (
      <main className="min-h-screen bg-[#06182f] px-6 py-24 text-white">
        <div className="container-page">
          <Link href="/zapasy" className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.08em] text-[#1688ff]">
            <ArrowLeft size={17} /> Späť na zápasy
          </Link>
          <h1 className="sport-title mt-8 text-4xl">Zápas sa nenašiel</h1>
          <p className="mt-3 max-w-2xl text-[#b9c7db]">Skús spustiť live import v administrácii alebo otvor zoznam zápasov znova.</p>
        </div>
      </main>
    );
  }

  const homeTeam = normalizeTeam(match.homeTeam, match.home, match.detailRows, "home");
  const awayTeam = normalizeTeam(match.awayTeam, match.away, match.detailRows, "away");

  return (
    <main className="min-h-screen bg-[#06182f] text-white">
      <section className="relative overflow-hidden border-b border-white/[0.06] bg-[#071a33] py-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(22,136,255,.20),transparent_36%),linear-gradient(180deg,#071a33_0%,#041121_100%)]" />
        <div className="container-page relative z-10">
          <Link href="/zapasy" className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.08em] text-[#1688ff]">
            <ArrowLeft size={17} /> Späť na zápasy
          </Link>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1.25fr_.75fr] lg:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1688ff]">
                {match.competition || stripSeason(match.league)} · {match.season || matchSeason(match)}
              </p>
              <h1 className="sport-title mt-3 text-4xl md:text-5xl">{match.home} vs {match.away}</h1>
              <div className="mt-5 flex flex-wrap gap-3 text-sm text-[#b9c7db]">
                <span>{match.round}</span>
                <span>{match.date}</span>
                <span className="inline-flex items-center gap-1"><MapPin size={16} className="text-[#1688ff]" /> {match.location}</span>
              </div>
            </div>

            <div className="rounded-2xl bg-[linear-gradient(180deg,#0a1d3a,#08172e)] p-6 text-center shadow-[0_18px_55px_rgba(0,0,0,.32),inset_0_1px_0_rgba(255,255,255,.04)] ring-1 ring-white/[0.055]">
              <p className="text-sm font-black uppercase tracking-[0.12em] text-[#9bcaff]">Výsledok</p>
              <strong className="mt-2 block text-5xl font-black text-[#1688ff]">{formatScore(match.score)}</strong>
              <p className="mt-2 text-lg font-black text-white">{formatPins(match.pins)}</p>
              {match.sourceUrl ? (
                <a href={match.sourceUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.08em] text-[#1688ff] hover:text-white">
                  Zdrojová zápisnica <ExternalLink size={15} />
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-12">
        <div className="grid gap-6 xl:grid-cols-2">
          <TeamTable team={homeTeam} />
          <TeamTable team={awayTeam} />
        </div>
      </section>
    </main>
  );
}

function TeamTable({ team }: { team: LiveMatchTeam }) {
  return (
    <section className="overflow-hidden rounded-2xl bg-[linear-gradient(180deg,#0a1d3a,#08172e)] shadow-[0_18px_55px_rgba(0,0,0,.32),inset_0_1px_0_rgba(255,255,255,.04)] ring-1 ring-white/[0.055]">
      <div className="border-b border-white/[0.06] px-5 py-4">
        <h2 className="text-xl font-black text-white">{team.name}</h2>
      </div>
      {team.players.length ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.12em] text-[#9bcaff]">
              <tr className="border-b border-white/[0.06]">
                <th className="px-5 py-4">Hráč</th>
                <th className="px-3 py-4 text-right">Plné</th>
                <th className="px-3 py-4 text-right">Dorážka</th>
                <th className="px-3 py-4 text-right">Chyby</th>
                <th className="px-3 py-4 text-right">Celkom</th>
                <th className="px-5 py-4 text-right">Bod</th>
              </tr>
            </thead>
            <tbody>
              {team.players.map((player, index) => (
                <tr key={`${player.name}-${index}`} className="border-b border-white/[0.055] last:border-b-0">
                  <td className="px-5 py-4 font-black text-white">{player.name}</td>
                  <NumberCell value={player.full} />
                  <NumberCell value={player.clearing} />
                  <NumberCell value={player.faults} />
                  <NumberCell value={player.total} strong />
                  <NumberCell value={player.point} strong />
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-white/[0.035] font-black text-white">
              <tr>
                <td className="px-5 py-4">Spolu</td>
                <NumberCell value={team.fullTotal} />
                <NumberCell value={team.clearingTotal} />
                <NumberCell value={team.faultsTotal} />
                <NumberCell value={team.pinsTotal} strong />
                <NumberCell value={team.pointsTotal} strong />
              </tr>
            </tfoot>
          </table>
        </div>
      ) : (
        <p className="px-5 py-6 text-sm leading-7 text-[#b9c7db]">Tento zápas zatiaľ nemá importované hráčske štatistiky.</p>
      )}
    </section>
  );
}

function NumberCell({ value, strong = false }: { value: number | null; suffix: string; strong: boolean }) {
  return <td className={`px-3 py-4 text-right ${strong ? "font-black text-white" : "text-[#dbe8ff]"}`}>{formatNumber(value)}</td>;
}

function normalizeTeam(team: LiveMatchTeam | null | undefined, name: string, detailRows: string, side: "home" | "away"): LiveMatchTeam {
  if (team.players.length) return team;
  const fallbackPlayers = parseLegacyRows(detailRows, side);
  return { name, players: fallbackPlayers, ...calculateTotals(fallbackPlayers) };
}

function parseLegacyRows(rows: string, side: "home" | "away"): LiveMatchPlayer[] {
  const parsed = rows
    .split("\n")
    .map((line) => line.split("|").map((cell) => cell.trim()))
    .filter((line) => line.length >= 5);
  const half = Math.ceil(parsed.length / 2);
  const sideRows = side === "home" ? parsed.slice(0, half) : parsed.slice(half);
  return sideRows.map((row) => {
    return {
      name: row[0] || "Hráč",
      full: toNumber(row[1]),
      clearing: toNumber(row[2]),
      faults: toNumber(row[3]),
      total: toNumber(row[4]),
      point: toNumber(row[6])
    };
  });
}

function calculateTotals(players: LiveMatchPlayer[]) {
  const sum = (field: keyof LiveMatchPlayer) => {
    const values = players.map((player) => player[field]).filter((value): value is number => typeof value === "number");
    return values.length ? values.reduce((total, value) => total + value, 0) : null;
  };
  return {
    fullTotal: sum("full"),
    clearingTotal: sum("clearing"),
    faultsTotal: sum("faults"),
    pinsTotal: sum("total"),
    pointsTotal: sum("point")
  };
}

function stripSeason(value: string) {
  return value.replace(/\s+20\d{2}\/20\d{2}/, "");
}

function matchSeason(match: LiveMatch) {
  const explicit = match.league.match(/20\d{2}\/20\d{2}/)?.[0];
  if (explicit) return explicit;
  const parsed = parsedDate(match.date);
  if (!parsed) return "";
  const startYear = parsed.getMonth() + 1 >= 7 ? parsed.getFullYear() : parsed.getFullYear() - 1;
  return `${startYear}/${startYear + 1}`;
}

function parsedDate(value: string) {
  const match = value.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
  if (!match) return null;
  return new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]));
}

function formatScore(value: string) {
  return value.replace(/\.0/g, "").replace(/\s*:\s*/g, " : ");
}

function formatPins(value: string) {
  return value.replace(/\s*:\s*/g, " : ");
}

function formatNumber(value: number | null) {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";
  return Number.isInteger(value) ? String(value) : value.toFixed(1).replace(".", ",");
}

function toNumber(value: string) {
  if (!value) return null;
  const number = Number(value.replace(",", "."));
  return Number.isFinite(number) ? number : null;
}
