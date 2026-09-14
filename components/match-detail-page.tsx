"use client";

import Link from "next/link";
import { Fragment, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ChevronDown, ExternalLink, Radio } from "lucide-react";
import { ClubLogo } from "@/components/club-logo";
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
          <p className="mt-3 max-w-2xl text-[#b9c7db]">Vráť sa na zoznam zápasov a skús vybrať iné stretnutie.</p>
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

          <div className="mt-8 overflow-hidden rounded-2xl bg-[linear-gradient(180deg,#0a1d3a,#08172e)] shadow-[0_18px_55px_rgba(0,0,0,.32),inset_0_1px_0_rgba(255,255,255,.04)] ring-1 ring-white/[0.07]">
            <div className="border-b border-white/[0.07] px-5 py-3 text-center text-[11px] font-black uppercase tracking-[0.11em] text-[#9bcaff]">
              {match.round} · {match.competition || stripSeason(match.league)} · {match.date} · {match.location}
            </div>
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-7 sm:px-8">
              <MatchTeamHero name={match.home} externalTeamId={match.homeExternalTeamId} logoUrl={homeTeam.logoUrl} />
              <div className="min-w-[92px] text-center sm:min-w-[150px]">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#9bcaff]">Body</p>
                <strong className="block whitespace-nowrap text-4xl font-black text-[#1688ff] sm:text-5xl">{formatScore(match.score)}</strong>
                <p className="mt-2 text-sm font-black text-white sm:text-lg">{formatPins(match.pins)}</p>
              </div>
              <MatchTeamHero name={match.away} externalTeamId={match.awayExternalTeamId} logoUrl={awayTeam.logoUrl} />
            </div>
            <div className="grid grid-cols-2 border-t border-white/[0.07] sm:grid-cols-4">
              <SummaryStat label="Plné" home={homeTeam.fullTotal} away={awayTeam.fullTotal} />
              <SummaryStat label="Dorážka" home={homeTeam.clearingTotal} away={awayTeam.clearingTotal} />
              <SummaryStat label="Chyby" home={homeTeam.faultsTotal} away={awayTeam.faultsTotal} />
              <SummaryStat label="Body hráčov" home={homeTeam.pointsTotal} away={awayTeam.pointsTotal} />
            </div>
            {match.sourceUrl ? (
              <div className="border-t border-white/[0.07] px-5 py-3 text-center">
                <a href={match.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.08em] text-[#1688ff] hover:text-white">
                  Zdrojová zápisnica <ExternalLink size={14} />
                </a>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {match.streamUrl ? (
        <section className="container-page pt-10">
          <div className="overflow-hidden rounded-2xl bg-[#08172e] shadow-[0_18px_55px_rgba(0,0,0,.32)] ring-1 ring-red-400/25">
            <div className="flex items-center justify-between gap-4 px-5 py-4">
              <h2 className="flex items-center gap-2 text-lg font-black"><Radio className="text-red-400" size={19} /> {isCompletedMatch(match) ? "Záznam zápasu" : "Stream zápasu"}</h2>
              <a href={match.streamUrl} target="_blank" rel="noreferrer" className="text-xs font-black uppercase text-[#8ec5ff] hover:text-white">YouTube <ExternalLink className="inline" size={14} /></a>
            </div>
            {youtubeEmbedUrl(match.streamUrl) ? <div className="aspect-video bg-black"><iframe className="h-full w-full" src={youtubeEmbedUrl(match.streamUrl)!} title={`Stream ${match.home} vs ${match.away}`} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen /></div> : null}
          </div>
        </section>
      ) : null}

      <section className="container-page py-12">
        <div className="grid gap-6">
          <TeamTable team={homeTeam} />
          <TeamTable team={awayTeam} />
        </div>
      </section>
    </main>
  );
}

function MatchTeamHero({ name, externalTeamId, logoUrl }: { name: string; externalTeamId: number | null; logoUrl?: string }) {
  return (
    <div className="min-w-0 text-center">
      <ClubLogo name={name} externalTeamId={externalTeamId} logoUrl={logoUrl} />
      <h1 className="mt-3 text-sm font-black leading-tight text-white sm:text-xl">{name}</h1>
    </div>
  );
}

function SummaryStat({ label, home, away }: { label: string; home: number | null; away: number | null }) {
  return (
    <div className="border-b border-r border-white/[0.07] px-3 py-4 text-center last:border-r-0 sm:border-b-0">
      <p className="text-[9px] font-black uppercase tracking-[0.13em] text-[#8da8c8]">{label}</p>
      <strong className="mt-1 block text-sm text-white">{formatNumber(home)} : {formatNumber(away)}</strong>
    </div>
  );
}

function youtubeEmbedUrl(value: string) {
  const id = value.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|live\/|embed\/))([\w-]{11})/)?.[1];
  return id ? `https://www.youtube-nocookie.com/embed/${id}` : "";
}

function TeamTable({ team }: { team: LiveMatchTeam }) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const togglePlayer = (index: number) => {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };
  return (
    <section className="overflow-hidden rounded-2xl bg-[linear-gradient(160deg,#0b2243_0%,#07172e_75%)] shadow-[0_22px_65px_rgba(0,0,0,.36),inset_0_1px_0_rgba(255,255,255,.055)] ring-1 ring-[#2b78bd]/35">
      <div className="relative flex min-h-28 items-center gap-4 overflow-hidden border-b border-white/[0.07] px-5 py-5 sm:px-7">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#0b203d_0%,rgba(8,27,52,.92)_52%,rgba(5,20,39,.55)_100%),url('/images/hero-lane.jpg')] bg-cover bg-right" />
        <div className="relative [&>span]:h-14 [&>span]:w-14"><ClubLogo name={team.name} logoUrl={team.logoUrl} /></div>
        <div className="relative"><p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#8fa7c5]">Zápisnica tímu</p><h2 className="mt-1 text-2xl font-black text-white sm:text-3xl">{team.name}</h2></div>
        <div className="relative ml-auto text-right"><p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#8fa7c5]">Celkový výkon tímu</p><strong className="mt-1 block text-3xl font-black tabular-nums text-[#52a5ff] sm:text-4xl">{formatNumber(team.pinsTotal)}</strong></div>
      </div>
      {team.players.length ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-sm tabular-nums">
            <thead className="bg-[#06162c]/70 text-[10px] uppercase tracking-[0.14em] text-[#88bdf3]">
              <tr className="border-b border-white/[0.075]">
                <th className="w-12 px-4 py-4 text-center">#</th>
                <th className="px-3 py-4">Hráč</th>
                <th className="px-3 py-4 text-right">Plné</th>
                <th className="px-3 py-4 text-right">Dorážka</th>
                <th className="px-3 py-4 text-right">Chyby</th>
                <th className="px-3 py-4 text-right">Celkom</th>
                <th className="px-5 py-4 text-right">Bod</th>
              </tr>
            </thead>
            <tbody>
              {team.players.map((player, index) => {
                const hasLanes = Boolean(player.lanes?.length);
                const isOpen = expanded.has(index);
                return (
                  <Fragment key={`${player.name}-${index}`}>
                    <tr className="border-b border-white/[0.055] transition odd:bg-white/[0.018] hover:bg-[#1688ff]/[0.07]">
                      <td className="px-4 py-4 text-center text-[#a9bdd7]">{index + 1}</td>
                      <td className="px-3 py-4 font-black text-white">
                        <button type="button" disabled={!hasLanes} onClick={() => togglePlayer(index)} className="flex w-full items-center gap-2 text-left disabled:cursor-default">
                          <span>{player.name}</span>
                          {hasLanes ? <ChevronDown size={15} className={`ml-auto text-[#1688ff] transition ${isOpen ? "rotate-180" : ""}`} /> : null}
                        </button>
                      </td>
                      <NumberCell value={player.full} />
                      <NumberCell value={player.clearing} />
                      <NumberCell value={player.faults} />
                      <NumberCell value={player.total} strong accent />
                      <NumberCell value={player.point} strong pill />
                    </tr>
                    {isOpen && hasLanes ? (
                      <tr className="border-b border-white/[0.055] bg-[#06152a]">
                        <td colSpan={7} className="p-3 sm:p-4">
                          <div className="overflow-hidden rounded-xl bg-[linear-gradient(145deg,#071a32,#051225)] shadow-inner ring-1 ring-[#2b78bd]/30">
                            <div className="flex items-center gap-4 border-b border-white/[0.07] px-5 py-4">
                              <strong className="text-lg font-black text-white sm:text-xl">{player.name}</strong>
                              <span className="h-6 w-px bg-white/10" />
                              <span className="text-xs font-bold text-[#a9bdd7]">Rozpis dráh</span>
                            </div>
                            <div className="grid grid-cols-1 divide-y divide-white/[0.08] sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-4">
                            {player.lanes!.map((lane, laneIndex) => (
                              <div key={`${lane.lane}-${laneIndex}`} className="px-5 py-5">
                                <div className="flex items-center gap-3"><span className={`grid h-8 w-8 place-items-center rounded-md text-sm font-black ring-1 ${lane.point ? "bg-[#1688ff] text-white ring-[#55aaff]" : "bg-[#132c4b] text-[#c4d4e9] ring-[#315477]"}`}>{lane.lane || laneIndex + 1}</span><span className="text-sm font-bold text-[#a9bdd7]">Dráha {lane.lane || laneIndex + 1}</span></div>
                                <strong className="mt-3 block text-4xl font-black tabular-nums text-white sm:text-5xl">{formatNumber(lane.total)}</strong>
                                <div className="mt-2 flex flex-wrap gap-x-2 text-xs text-[#b9c9dc]"><b className="text-white">{formatNumber(lane.full)}</b><span>plné</span><span>•</span><b className="text-white">{formatNumber(lane.clearing)}</b><span>dorážka</span><span>•</span><b className="text-white">{formatNumber(lane.faults)}</b><span>chyby</span></div>
                                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#1c304b]"><div className="h-full rounded-full bg-[#2f9cff]" style={{ width: `${Math.min(100, Math.max(0, ((lane.total || 0) / 160) * 100))}%` }} /></div>
                                <div className={`mt-4 flex items-center gap-2 text-xs font-black ${lane.point ? "text-[#52a5ff]" : "text-[#8fa7c5]"}`}><span className={`h-4 w-4 rounded-full ${lane.point ? "bg-[#2f91ff]" : "ring-1 ring-[#66809f]"}`} />{formatNumber(lane.point)} {lane.point === 1 ? "bod" : "bodov"}</div>
                              </div>
                            ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })}
            </tbody>
            <tfoot className="bg-[linear-gradient(90deg,rgba(22,136,255,.16),rgba(22,136,255,.06))] font-black text-white">
              <tr>
                <td colSpan={2} className="px-5 py-4">Spolu</td>
                <NumberCell value={team.fullTotal} />
                <NumberCell value={team.clearingTotal} />
                <NumberCell value={team.faultsTotal} />
                <NumberCell value={team.pinsTotal} strong accent />
                <NumberCell value={team.pointsTotal} strong pill />
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

function NumberCell({ value, strong = false, accent = false, pill = false }: { value: number | null; strong?: boolean; accent?: boolean; pill?: boolean }) {
  return <td className={`px-3 py-4 text-right ${strong ? "font-black" : "text-[#c9daee]"}`}><span className={`${accent ? "text-[#63adff]" : "text-white"} ${pill ? "inline-grid min-w-7 place-items-center rounded-md bg-[#1688ff]/15 px-2 py-1 ring-1 ring-[#1688ff]/25" : ""}`}>{formatNumber(value)}</span></td>;
}

function normalizeTeam(team: LiveMatchTeam | null | undefined, name: string, detailRows: string, side: "home" | "away"): LiveMatchTeam {
  if (team?.players?.length) return team;
  const fallbackPlayers = parseLegacyRows(detailRows, side);
  return { name, logoUrl: team?.logoUrl, players: fallbackPlayers, ...calculateTotals(fallbackPlayers) };
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

function formatScore(value: string) {
  return value.replace(/\.0/g, "").replace(/\s*:\s*/g, " : ");
}

function isCompletedMatch(match: LiveMatch) {
  const status = match.status.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  return status.includes("odohran") || /^\s*\d+(?:[.,]\d+)?\s*:\s*\d+(?:[.,]\d+)?\s*$/.test(match.score);
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
