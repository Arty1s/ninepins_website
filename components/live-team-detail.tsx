"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ElementType } from "react";
import {
  Award,
  BarChart3,
  CalendarDays,
  ChevronRight,
  MapPin,
  Star,
  Trophy,
  UserRound,
  Users
} from "lucide-react";
import { readLiveData, subscribeLiveData, type LiveClubData, type LiveMatch, type LiveMember, type LivePlayer, type LiveTeam } from "@/lib/live-store";
import { getLeagueTheme, type LeagueTheme } from "@/lib/league-theme";
import { ClubLogo } from "@/components/club-logo";

type PlayerCard = {
  name: string;
  role: string;
  description: string;
  average: string;
  matches: number | null;
  bestPerformance?: string;
  source?: LiveMember;
};

const FALLBACK_TEAMS: LiveTeam[] = [
  { id: 6, slug: "prva-liga", name: "1. liga", league: "KKZ Hlohovec A", externalLeagueId: 372, externalTeamId: 5041, category: "1. liga", season: "2026/2027", coach: "Trénera doplní admin", captain: "Kapitána doplní admin", members: "", achievements: "Výsledky sa synchronizujú z vysledky.kolky.sk", description: "A-tím KKZ Hlohovec v aktuálnej sezóne 1. ligy." },
  { id: 3, slug: "druha-liga", name: "2. liga", league: "KKZ Hlohovec B", externalLeagueId: 373, externalTeamId: 5054, category: "2. liga", season: "2026/2027", coach: "Trénera doplní admin", captain: "Kapitána doplní admin", members: "", achievements: "Výsledky sa synchronizujú z vysledky.kolky.sk", description: "B-tím KKZ Hlohovec pokračuje v aktuálnej sezóne 2. ligy." },
  { id: 5, slug: "dorast", name: "Dorast", league: "KKZ Hlohovec", externalLeagueId: 376, externalTeamId: 5084, category: "Dorast", season: "2026/2027", coach: "Trénera doplní admin", captain: "Kapitána doplní admin", members: "", achievements: "Výsledky sa synchronizujú z vysledky.kolky.sk", description: "Dorastenecký tím KKZ Hlohovec v sezóne 2026/2027." },
  { id: 1, slug: "extraliga-muzi", name: "Extraliga muži", league: "KKZ Hlohovec A", externalLeagueId: 355, externalTeamId: 4855, category: "Extraliga muži", season: "2025/2026", coach: "Trénera doplní admin", captain: "Kapitána doplní admin", members: "", achievements: "Výsledky sa synchronizujú z vysledky.kolky.sk", description: "Mužský A-tím KKZ Hlohovec v najvyššej slovenskej súťaži." },
  { id: 2, slug: "extraliga-zeny", name: "Extraliga ženy", league: "KKZ Hlohovec", externalLeagueId: 356, externalTeamId: 4865, category: "Extraliga ženy", season: "2025/2026", coach: "Trénera doplní admin", captain: "Kapitánku doplní admin", members: "", achievements: "Výsledky sa synchronizujú z vysledky.kolky.sk", description: "Ženský extraligový tím reprezentujúci Hlohovec v najvyššej súťaži." },
  { id: 4, slug: "tretia-liga", name: "3. liga", league: "KKZ Hlohovec C", externalLeagueId: 362, externalTeamId: 4925, category: "3. liga", season: "2025/2026", coach: "Trénera doplní admin", captain: "Kapitána doplní admin", members: "", achievements: "Výsledky sa synchronizujú z vysledky.kolky.sk", description: "C-tím KKZ Hlohovec zo sezóny 2025/2026." }
];

export function LiveTeamDetail({ slug }: { slug: string }) {
  const [data, setData] = useState<LiveClubData>(() => readLiveData());
  const [teams, setTeams] = useState<LiveTeam[]>(FALLBACK_TEAMS);
  const [syncedPlayers, setSyncedPlayers] = useState<LivePlayer[]>([]);
  const [activeTab, setActiveTab] = useState<"players" | "matches">("players");
  const [selectedSeason, setSelectedSeason] = useState("");

  useEffect(() => {
    return subscribeLiveData(setData);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/teams", { cache: "no-store" })
      .then((response) => response.json())
      .then(async (payload) => {
        if (cancelled) return;
        const rows = officialTeams(Array.isArray(payload.data) ? payload.data : []);
        const nextTeams = rows.length ? rows : FALLBACK_TEAMS;
        setTeams(nextTeams);
        const selected = nextTeams.find((item) => item.slug === slug);
        if (!selected) return;
        const teamId = selected.externalTeamId || selected.id;
        if (!teamId) return;
        const playerResponse = await fetch(`/api/teams/${teamId}/players`, { cache: "no-store" });
        const playerPayload = await playerResponse.json();
        if (!cancelled && Array.isArray(playerPayload.data)) setSyncedPlayers(playerPayload.data);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const team = teams.find((item) => item.slug === slug) || data.teams.find((item) => item.slug === slug) || FALLBACK_TEAMS.find((item) => item.slug === slug);
  const resolvedTeam = team ?? FALLBACK_TEAMS[0];
  const players = useMemo(() => buildPlayers(resolvedTeam, data.members || [], syncedPlayers.length ? syncedPlayers : data.players || []), [resolvedTeam, data.members, data.players, syncedPlayers]);
  const achievements = useMemo(() => splitList(resolvedTeam.achievements || "", ";"), [resolvedTeam.achievements]);
  const theme = getLeagueTheme(`${resolvedTeam.category || ""} ${resolvedTeam.name || ""} ${resolvedTeam.league || ""}`);
  const teamMatches = useMemo(() => (data.matches || []).filter((match) => isTeamMatch(match, resolvedTeam)).sort((a, b) => roundValue(a.round) - roundValue(b.round) || dateValue(a.date) - dateValue(b.date)), [data.matches, resolvedTeam]);
  const seasons = useMemo(() => Array.from(new Set(teamMatches.map(matchSeason))).sort().reverse(), [teamMatches]);

  useEffect(() => {
    if (seasons.length && !seasons.includes(selectedSeason)) setSelectedSeason(seasons[0]);
  }, [seasons, selectedSeason]);

  const seasonMatches = teamMatches.filter((match) => matchSeason(match) === selectedSeason);

  if (!team) {
    return (
      <main className="min-h-screen bg-[#f6f8fc] pt-[82px] text-[#071a33]">
        <section className="container-page py-20">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-[#114bff]">Tím nenájdený</p>
          <h1 className="mt-3 text-4xl font-black">Tento tím ešte nie je vytvorený.</h1>
          <Link className="mt-8 inline-flex rounded-xl bg-[#114bff] px-5 py-3 text-sm font-black uppercase text-white" href="/timy">
            Späť na tímy
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#03152a] text-white">
      <section className="relative isolate overflow-hidden pt-[82px] text-white">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,11,24,.96)_0%,rgba(5,18,42,.72)_46%,rgba(5,18,42,.15)_100%),url('/images/teams-hero-generated.png')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_20%,rgba(40,137,255,.22),transparent_34%),linear-gradient(180deg,transparent_0%,rgba(2,11,24,.18)_100%)]" />

        <div className="container-page relative z-10 grid min-h-[350px] items-end py-11 md:min-h-[420px]">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.08em] text-[#58a3ff]">
              <Link href="/" className="hover:text-white">Domov</Link>
              <ChevronRight size={14} />
              <Link href="/timy" className="hover:text-white">Tímy</Link>
              <ChevronRight size={14} />
              <span>{team.name}</span>
            </div>

            <h1 className="mt-5 font-display text-5xl font-black leading-none tracking-tight sm:text-6xl lg:text-7xl">
              {team.name}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#d8e7ff]">{team.description}</p>

            <div className="mt-9 grid max-w-3xl gap-4 sm:grid-cols-3">
              <HeroStat icon={Users} value={`${players.length}`} label="hráčov" />
              <HeroStat icon={CalendarDays} value={team.season || "2025/2026"} label="sezóna" />
              <HeroStat icon={Trophy} value={achievements[0] ? "Aktívny tím" : "Pripravené"} label="úspechy" />
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-0">
        <div className="flex flex-wrap items-center gap-8 border-b border-white/[0.1]">
          <Tab active={activeTab === "players"} icon={Users} label="Hráči" onClick={() => setActiveTab("players")} />
          <Tab active={activeTab === "matches"} icon={BarChart3} label="Zápasy" onClick={() => setActiveTab("matches")} />
        </div>
      </section>

      {activeTab === "players" ? <section className="relative overflow-hidden bg-[#03152a] px-0 py-6">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,12,26,.86),rgba(3,12,26,.95)),url('/images/premium-blue-bg.png')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(22,136,255,.2),transparent_30%),radial-gradient(circle_at_90%_62%,rgba(17,75,255,.12),transparent_34%)]" />
        <div className="container-page relative z-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {players.length ? players.map((player, index) => (
            <PremiumPlayerTile key={`${player.name}-${index}`} player={player} index={index} theme={theme} />
          )) : (
            <div className="col-span-full rounded-2xl bg-white p-8 text-center shadow-[0_18px_50px_rgba(7,26,61,.12)]">
              <p className="text-lg font-black">Zostava tímu zatiaľ nie je zverejnená.</p>
              <p className="mt-2 text-sm text-[#071a3d]/60">Hráči sa tu zobrazia po doplnení klubovej zostavy.</p>
            </div>
          )}
        </div>
        </div>
      </section> : <section className="container-page py-10"><TeamMatches matches={seasonMatches} seasons={seasons} selectedSeason={selectedSeason} setSelectedSeason={setSelectedSeason} /></section>}

      <section className="container-page pb-16 pt-3">
        {activeTab === "players" ? <div className="mt-5 rounded-2xl bg-[linear-gradient(90deg,#08203d,#05172e)] p-6 shadow-[0_18px_50px_rgba(0,0,0,.25)] ring-1 ring-[#2872b2]/30">
          <div className="mb-5 flex items-center gap-3">
            <Award className="text-[#114bff]" />
            <h2 className="text-2xl font-black">Úspechy tímu</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {achievements.length ? achievements.map((achievement) => (
              <p key={achievement} className="flex gap-3 rounded-xl bg-white/[0.04] p-4 text-sm font-semibold leading-6 text-[#c3d3e7]">
                <Star size={18} className="mt-0.5 shrink-0 text-[#114bff]" />
                {achievement}
              </p>
            )) : (
              <p className="rounded-xl bg-white/[0.04] p-4 text-sm font-semibold text-[#9eb2ca]">Úspechy tímu zatiaľ nie sú zverejnené.</p>
            )}
          </div>
        </div> : null}
      </section>
    </main>
  );
}

function HeroStat({ icon: Icon, value, label }: { icon: ElementType; value: string; label: string }) {
  return (
    <div className="flex items-center gap-4">
      <Icon className="h-8 w-8 text-[#1683ff]" strokeWidth={1.8} />
      <div>
        <p className="text-2xl font-black">{value}</p>
        <p className="text-sm text-[#c7d6ee]">{label}</p>
      </div>
    </div>
  );
}

function Tab({ icon: Icon, label, active = false, onClick }: { icon: ElementType; label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`relative inline-flex items-center gap-2 py-5 text-lg font-bold ${active ? "text-[#2492ff]" : "text-[#8fa7c2]"}`} type="button">
      <Icon size={22} strokeWidth={1.8} />
      {label}
      {active ? <span className="absolute bottom-[-1px] left-0 h-[2px] w-full rounded-full bg-[#114bff]" /> : null}
    </button>
  );
}

function PremiumPlayerTile({ player, index, theme }: { player: PlayerCard; index: number; theme: LeagueTheme }) {
  return (
    <article className={`relative flex min-h-[405px] flex-col overflow-hidden rounded-2xl bg-[linear-gradient(155deg,#0a294d,#061a33)] p-5 text-white shadow-[0_22px_60px_rgba(0,0,0,.3)] ring-1 ring-[#2872b2]/35 transition duration-300 hover:-translate-y-1 hover:ring-[#2994f5]/70`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_45%_20%,rgba(28,126,225,.16),transparent_34%)]" />
      <span className="absolute left-4 top-4 grid h-10 w-10 place-items-center rounded-lg bg-[#102f52] text-base font-black text-white ring-1 ring-[#2b6598]/30">
        {index + 1}
      </span>
      <div className="relative mt-2 text-center">
        <div className="mx-auto grid h-28 w-28 place-items-center rounded-full bg-[linear-gradient(180deg,#173d65,#0a2748)] text-[#06182f] shadow-[inset_0_1px_0_rgba(255,255,255,.08)] ring-1 ring-[#3a719f]/45">
          <UserRound size={72} fill="currentColor" strokeWidth={0} />
        </div>
        <h3 className="mt-5 min-h-[56px] text-2xl font-black leading-tight tracking-tight">{player.name}</h3>
        <p className="mt-1 text-sm text-[#a9bdd5]">{player.role}</p>
      </div>
      {player.bestPerformance ? (
        <div className="relative mt-4 rounded-xl border border-[#2a6699]/35 bg-[#0c2b4f] px-4 py-3 text-center">
          <p className="text-[10px] font-bold text-[#8fb5da]">Najlepší výkon</p>
          <p className="mt-1 text-3xl font-black text-white">{player.bestPerformance}</p>
        </div>
      ) : null}
      <div className="relative mt-auto grid grid-cols-2 gap-3 border-t border-white/[0.08] pt-4 text-sm text-[#b8c9dc]">
        <p><BarChart3 size={17} className="mr-2 inline text-[#2492ff]" />{player.matches || 0} zápasov</p>
        <p className="text-right"><Trophy size={17} className="mr-2 inline text-[#2492ff]" />Priemer {player.average || "-"}</p>
      </div>
    </article>
  );
}

function PlayerTile({ player, index }: { player: PlayerCard; index: number }) {
  return (
    <article className="relative min-h-[220px] rounded-2xl bg-white p-5 shadow-[0_16px_42px_rgba(7,26,61,.11)] ring-1 ring-[#071a3d]/[0.06] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(7,26,61,.16)]">
      <span className="absolute left-5 top-5 grid h-7 w-7 place-items-center rounded-md bg-[#114bff] text-sm font-black text-white shadow-[0_8px_18px_rgba(17,75,255,.24)]">
        {index + 1}
      </span>
      <div className="mt-8 flex items-start gap-4">
        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-[linear-gradient(180deg,#eef2f7,#d7dde7)] text-[#8b97a8]">
          <UserRound size={38} strokeWidth={1.5} />
        </div>
        <div>
          <h3 className="text-xl font-black leading-tight">{player.name}</h3>
          <p className="mt-1 text-sm font-bold text-[#114bff]">{player.role}</p>
        </div>
      </div>
      <p className="mt-5 text-sm leading-6 text-[#071a3d]/72">{player.description}</p>
      {player.bestPerformance ? (
        <div className="mt-4 border-t border-[#1688ff]/20 pt-4">
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#1688ff]">Najlepší výkon</p>
          <p className="mt-1 text-xl font-black text-[#071a33]">{player.bestPerformance}</p>
        </div>
      ) : null}
      {player.average ? (
        <p className="mt-4 text-sm font-black text-[#114bff]">
          Priemer {player.average}{player.matches ? ` · ${player.matches} zápasov` : ""}
        </p>
      ) : null}
      <Star className="absolute bottom-5 right-5 text-[#071a3d]/45" size={19} strokeWidth={1.6} />
    </article>
  );
}

function TeamMatches({ matches, seasons, selectedSeason, setSelectedSeason }: { matches: LiveMatch[]; seasons: string[]; selectedSeason: string; setSelectedSeason: (season: string) => void }) {
  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-xs font-black uppercase tracking-[.18em] text-[#114bff]">Sezónne výsledky</p><h2 className="mt-1 text-3xl font-black">Zápasy tímu</h2></div>
        {seasons.length ? <label className="flex items-center gap-3 text-sm font-bold text-[#b8c9dc]">Sezóna<select value={selectedSeason} onChange={(event) => setSelectedSeason(event.target.value)} className="rounded-xl border border-[#2b6598]/55 bg-[#08213e] px-4 py-3 font-black text-white outline-none focus:border-[#1688ff]">{seasons.map((season) => <option key={season} className="bg-[#08213e] text-white">{season}</option>)}</select></label> : null}
      </div>
      {matches.length ? <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">{matches.map((match) => <article key={match.id} className="overflow-hidden rounded-2xl bg-[linear-gradient(160deg,#092443,#06182f)] text-white shadow-[0_18px_50px_rgba(0,0,0,.26)] ring-1 ring-[#2b6598]/40">
        <div className="flex items-center justify-between gap-3 border-b border-white/[0.08] px-5 py-4 text-xs font-black uppercase text-[#48a3ff]"><span>{match.competition || match.league} · {match.round}</span><span>{match.date}</span></div>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 p-5 text-center"><div className="flex min-w-0 flex-col items-center gap-2"><ClubLogo name={match.home} externalTeamId={match.homeExternalTeamId} logoUrl={match.homeTeam?.logoUrl} /><strong>{match.home}</strong></div><div><p className="text-3xl font-black text-[#48a3ff]">{match.score}</p><p className="mt-1 text-xs font-bold text-[#8fa7c2]">{match.pins}</p></div><div className="flex min-w-0 flex-col items-center gap-2"><ClubLogo name={match.away} externalTeamId={match.awayExternalTeamId} logoUrl={match.awayTeam?.logoUrl} /><strong>{match.away}</strong></div></div>
        <div className="grid gap-2 border-t border-white/[0.08] px-5 py-4 text-sm text-[#a9bdd5] sm:grid-cols-2"><p className="flex items-center gap-2"><CalendarDays size={16} className="text-[#48a3ff]" />{match.status}</p><p className="flex items-center gap-2"><MapPin size={16} className="text-[#48a3ff]" />{match.location}</p></div>
      </article>)}</div> : <div className="rounded-2xl border border-dashed border-[#1688ff]/30 bg-[#071c36] p-8 text-center text-[#9eb2ca]">Pre túto sezónu zatiaľ nie sú evidované žiadne zápasy.</div>}
    </div>
  );
}

function isTeamMatch(match: LiveMatch, team: LiveTeam) {
  if (team.externalTeamId && [match.homeExternalTeamId, match.awayExternalTeamId].includes(team.externalTeamId)) return true;
  if (team.externalLeagueId && match.externalLeagueId === team.externalLeagueId) return true;
  const value = normalize(`${match.competition} ${match.league} ${match.home} ${match.away}`);
  return value.includes(normalize(team.category || team.name));
}

function matchSeason(match: LiveMatch) {
  if (match.season) return match.season;
  const explicit = match.league.match(/20\d{2}\/20\d{2}/)?.[0];
  if (explicit) return explicit;
  const year = Number(match.date.match(/20\d{2}/)?.[0]);
  const month = Number(match.date.split(/[.\/-]/)[1]);
  if (!year) return "Staršie";
  return month >= 7 ? `${year}/${year + 1}` : `${year - 1}/${year}`;
}

function dateValue(value: string) {
  const [day, month, year] = value.split(/[.\/-]/).map(Number);
  return year ? new Date(year, month - 1, day).getTime() : 0;
}

function buildPlayers(team: LiveTeam | undefined, members: LiveMember[], syncedPlayers: LivePlayer[]): PlayerCard[] {
  if (!team) return [];
  const externalPlayers = syncedPlayers
    .filter((player) => {
      if (!isRealPlayerName(player.name)) return false;
      if (team.externalTeamId && player.externalTeamId === team.externalTeamId) return true;
      if (team.externalLeagueId && player.externalLeagueId === team.externalLeagueId) return true;
      const teamNames = [team.name, team.league, team.category || "", team.slug].map(normalize);
      const playerNames = [player.team, player.category || "", player.rosterKey || ""].map(normalize);
      return playerNames.some((name) => teamNames.includes(name));
    })
    .sort((a, b) => Number(b.matches || 0) - Number(a.matches || 0))
    .slice(0, 10);
  if (externalPlayers.length) {
    return externalPlayers.map((player, index) => ({
      name: player.name,
      role: player.role || "Hráč",
      average: player.average,
      matches: player.matches,
      bestPerformance: player.bestPerformance || "Doplní sa po importe",
      description: player.matches
        ? `Oficiálne zápisy: ${player.matches}.`
        : playerDescriptions[index % playerDescriptions.length]
    }));
  }

  const teamMembers = splitList(team.members).filter(isRealPlayerName);
  const linkedMembers = members.filter((member) => {
    const memberTeam = normalize(member.team);
    return memberTeam === normalize(team.name) || memberTeam === normalize(team.slug) || memberTeam === normalize(team.league);
  });

  const names = teamMembers.length ? teamMembers : linkedMembers.map((member) => member.name);
  const uniqueNames = Array.from(new Set(names.filter(isRealPlayerName))).slice(0, 10);

  return uniqueNames.map((name, index) => {
    const source = linkedMembers.find((member) => normalize(member.name) === normalize(name));
    return {
      name,
      role: source?.role === "coach" ? "Tréner" : source?.role === "admin" ? "Admin" : "Hráč",
      description: playerDescriptions[index % playerDescriptions.length],
      source
    };
  });
}

const playerDescriptions = [
  "Spoľahlivý a technicky zdatný hráč s výbornou konzistentnosťou.",
  "Rýchly a dynamický hráč s dobrým odhadom dráhy.",
  "Technický hráč so silným mentálnym nastavením.",
  "Bojovný typ hráča, ktorý sa nevzdáva ani v náročných situáciách.",
  "Talentovaný hráč s veľkým potenciálom do budúcna.",
  "Presný a sústredený hráč so stabilnými výkonmi.",
  "Technicky vyspelý hráč s dobrým herným čítaním.",
  "Silný a vytrvalý hráč, dôležitý v kľúčových momentoch.",
  "Mladý hráč s výborným zmyslom pre presnosť.",
  "Ambiciózny hráč s chuťou neustále napredovať."
];

function splitList(value = "", separator = ",") {
  return value.split(separator).map((item) => item.trim()).filter(Boolean);
}

function normalize(value = "") {
  return value.trim().toLocaleLowerCase("sk-SK");
}

function isRealPlayerName(value: string) {
  const name = normalize(value);
  return Boolean(name) && !["nikto", "nobody", "neznamy", "neznámy", "-", "x"].includes(name);
}

function officialTeams(teams: LiveTeam[]) {
  const teamOrder = [5041, 5054, 5084, 4855, 4865, 4925];
  const imported = new Map(teams.filter((team) => team.externalTeamId && teamOrder.includes(team.externalTeamId)).map((team) => [team.externalTeamId, team]));
  return FALLBACK_TEAMS
    .map((fallback) => imported.get(fallback.externalTeamId) || fallback)
    .sort((a, b) => teamOrder.indexOf(a.externalTeamId || 0) - teamOrder.indexOf(b.externalTeamId || 0));
}

function roundValue(value: string) {
  return Number(value.match(/\d+/)?.[0]) || Number.MAX_SAFE_INTEGER;
}
