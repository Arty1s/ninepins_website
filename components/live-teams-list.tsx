"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { type LiveTeam } from "@/lib/live-store";
import { getLeagueTheme } from "@/lib/league-theme";

const OFFICIAL_TEAM_IDS = [5041, 5054, 5084, 4855, 4865, 4925];
const OFFICIAL_FALLBACK_TEAMS: LiveTeam[] = [
  { id: 6, slug: "prva-liga", name: "1. liga", league: "KKZ Hlohovec A", externalLeagueId: 372, externalTeamId: 5041, category: "1. liga", season: "2026/2027", coach: "Trénera doplní admin", captain: "Kapitána doplní admin", members: "", achievements: "Výsledky sa synchronizujú z vysledky.kolky.sk", description: "A-tím KKZ Hlohovec v aktuálnej sezóne 1. ligy." },
  { id: 3, slug: "druha-liga", name: "2. liga", league: "KKZ Hlohovec B", externalLeagueId: 373, externalTeamId: 5054, category: "2. liga", season: "2026/2027", coach: "Trénera doplní admin", captain: "Kapitána doplní admin", members: "", achievements: "Výsledky sa synchronizujú z vysledky.kolky.sk", description: "B-tím KKZ Hlohovec pokračuje v aktuálnej sezóne 2. ligy." },
  { id: 5, slug: "dorast", name: "Dorast", league: "KKZ Hlohovec", externalLeagueId: 376, externalTeamId: 5084, category: "Dorast", season: "2026/2027", coach: "Trénera doplní admin", captain: "Kapitána doplní admin", members: "", achievements: "Výsledky sa synchronizujú z vysledky.kolky.sk", description: "Dorastenecký tím KKZ Hlohovec v sezóne 2026/2027." },
  { id: 1, slug: "extraliga-muzi", name: "Extraliga muži", league: "KKZ Hlohovec A", externalLeagueId: 355, externalTeamId: 4855, category: "Extraliga muži", season: "2025/2026", coach: "Trénera doplní admin", captain: "Kapitána doplní admin", members: "", achievements: "Výsledky sa synchronizujú z vysledky.kolky.sk", description: "Mužský extraligový tím KKZ Hlohovec zo sezóny 2025/2026." },
  { id: 2, slug: "extraliga-zeny", name: "Extraliga ženy", league: "KKZ Hlohovec", externalLeagueId: 356, externalTeamId: 4865, category: "Extraliga ženy", season: "2025/2026", coach: "Trénera doplní admin", captain: "Kapitánku doplní admin", members: "", achievements: "Výsledky sa synchronizujú z vysledky.kolky.sk", description: "Ženský extraligový tím KKZ Hlohovec zo sezóny 2025/2026." },
  { id: 4, slug: "tretia-liga", name: "3. liga", league: "KKZ Hlohovec C", externalLeagueId: 362, externalTeamId: 4925, category: "3. liga", season: "2025/2026", coach: "Trénera doplní admin", captain: "Kapitána doplní admin", members: "", achievements: "Výsledky sa synchronizujú z vysledky.kolky.sk", description: "C-tím KKZ Hlohovec zo sezóny 2025/2026." }
];

export function LiveTeamsList() {
  const [teams, setTeams] = useState<LiveTeam[]>(OFFICIAL_FALLBACK_TEAMS);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/teams", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload) => {
        if (cancelled) return;
        const rows = officialTeams(Array.isArray(payload.data) ? payload.data : []);
        setTeams(rows.length ? rows : OFFICIAL_FALLBACK_TEAMS);
      })
      .catch(() => {
        if (!cancelled) setTeams(OFFICIAL_FALLBACK_TEAMS);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="relative overflow-hidden py-10 sm:py-14">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_8%,rgba(17,75,255,.08),transparent_28%),radial-gradient(circle_at_84%_42%,rgba(17,75,255,.07),transparent_32%)]" />
      <div className="container-page relative z-10">
        <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
          {teams.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TeamCard({ team }: { team: LiveTeam }) {
  const members = useMemo(() => splitList(team.members), [team.members]);
  const achievements = useMemo(() => splitList(team.achievements, ";"), [team.achievements]);
  const theme = getLeagueTheme(`${team.category || ""} ${team.name} ${team.league}`);
  const isThirdLeague = team.externalTeamId === 4925 || team.slug === "tretia-liga";
  const logoSource = isThirdLeague ? "/logos/kkhc-3-liga.jpeg" : "/kkhc-logo.png";

  return (
    <Link
      href={`/timy/${team.slug}`}
      className={`group block overflow-hidden rounded-[22px] bg-white shadow-[0_26px_70px_rgba(7,26,61,.16),0_2px_8px_rgba(7,26,61,.08)] ring-1 ring-[#071a3d]/[0.06] transition duration-300 hover:-translate-y-1 hover:shadow-[0_34px_90px_rgba(7,26,61,.22),0_5px_18px_rgba(7,26,61,.1)] focus:outline-none focus:ring-4 ${theme.ring}`}
    >
      <article>
        <div className={`relative overflow-hidden ${theme.panel} p-6 text-white`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_0%,rgba(255,255,255,.16),transparent_32%),linear-gradient(135deg,transparent_0_58%,rgba(255,255,255,.08)_59%,transparent_75%)]" />
          <div className="relative flex gap-5">
            <div className={`grid h-[92px] w-[92px] shrink-0 place-items-center overflow-hidden rounded-[26px] bg-white ring-1 ${theme.ring}`}>
              <Image
                src={logoSource}
                alt={isThirdLeague ? "Logo KKHC 3. liga" : "Logo KK Hlohovec"}
                width={92}
                height={92}
                className={`${isThirdLeague ? "h-[84px] w-[84px]" : "kkhc-logo-cutout h-[74px] w-[78px]"} object-contain`}
              />
            </div>
            <div className="min-w-0">
              <span className={`inline-flex rounded-md px-3 py-1 text-xs font-black uppercase tracking-[0.18em] ring-1 ${theme.badge}`}>
                {theme.label}
              </span>
              <span className="ml-2 inline-flex rounded-md bg-white/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white/85 ring-1 ring-white/20">
                {team.season}
              </span>
              <h2 className="mt-3 text-3xl font-black leading-tight tracking-tight">{team.name}</h2>
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-white/82">{team.description}</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[#071a3d]/45">Členovia</p>
              <p className="mt-1 font-black text-[#071a3d]">{Math.min(members.length, 10)} zobrazených</p>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[#071a3d]/45">Úspechy</p>
              <p className="mt-1 font-black text-[#071a3d]">{achievements.length || "Zatiaľ bez údajov"}</p>
            </div>
          </div>

          <span className={`mt-5 inline-flex h-12 w-full items-center justify-center gap-3 rounded-xl px-5 text-sm font-black uppercase tracking-[0.06em] text-white transition group-hover:-translate-y-0.5 ${theme.button}`}>
            Zobraziť členov a úspechy
            <ArrowRight size={17} className="transition group-hover:translate-x-1" />
          </span>
        </div>
      </article>
    </Link>
  );
}

function splitList(value: string, separator = ",") {
  return value.split(separator).map((item) => item.trim()).filter(Boolean);
}

function officialTeams(teams: LiveTeam[]) {
  const imported = new Map(teams.filter((team) => team.externalTeamId && OFFICIAL_TEAM_IDS.includes(team.externalTeamId)).map((team) => [team.externalTeamId, team]));
  return OFFICIAL_FALLBACK_TEAMS
    .map((fallback) => imported.get(fallback.externalTeamId) || fallback)
    .sort((a, b) => OFFICIAL_TEAM_IDS.indexOf(a.externalTeamId || 0) - OFFICIAL_TEAM_IDS.indexOf(b.externalTeamId || 0));
}
