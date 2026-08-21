"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CircleDot, Target, Trophy, UserRound, Users } from "lucide-react";
import { type LiveTeam } from "@/lib/live-store";
import { getLeagueTheme } from "@/lib/league-theme";

const OFFICIAL_TEAM_IDS = new Set([4855, 4865, 4889, 4925, 4923]);
const OFFICIAL_CATEGORIES = ["Extraliga muži", "Extraliga ženy", "2. liga", "3. liga", "Dorast"];
const OFFICIAL_FALLBACK_TEAMS: LiveTeam[] = [
  { id: 1, slug: "extraliga-muzi", name: "Extraliga muži", league: "KKZ Hlohovec A", externalLeagueId: 355, externalTeamId: 4855, category: "Extraliga muži", season: "2025/2026", coach: "Trénera doplní admin", captain: "Kapitána doplní admin", members: "", achievements: "Výsledky sa synchronizujú z vysledky.kolky.sk", description: "Mužský A-tím KKZ Hlohovec v najvyššej slovenskej súťaži." },
  { id: 2, slug: "extraliga-zeny", name: "Extraliga ženy", league: "KKZ Hlohovec", externalLeagueId: 356, externalTeamId: 4865, category: "Extraliga ženy", season: "2025/2026", coach: "Trénera doplní admin", captain: "Kapitánku doplní admin", members: "", achievements: "Výsledky sa synchronizujú z vysledky.kolky.sk", description: "Ženský extraligový tím reprezentujúci Hlohovec v najvyššej súťaži." },
  { id: 3, slug: "druha-liga", name: "2. liga", league: "KKZ Hlohovec B", externalLeagueId: 359, externalTeamId: 4889, category: "2. liga", season: "2025/2026", coach: "Trénera doplní admin", captain: "Kapitána doplní admin", members: "", achievements: "Výsledky sa synchronizujú z vysledky.kolky.sk", description: "B-tím v 2. lige prepája skúsených hráčov s novými členmi." },
  { id: 4, slug: "tretia-liga", name: "3. liga", league: "KKZ Hlohovec C", externalLeagueId: 362, externalTeamId: 4925, category: "3. liga", season: "2025/2026", coach: "Trénera doplní admin", captain: "Kapitána doplní admin", members: "", achievements: "Výsledky sa synchronizujú z vysledky.kolky.sk", description: "C-tím v 3. lige dáva priestor hráčom, ktorí chcú pravidelne hrávať." },
  { id: 5, slug: "dorast", name: "Dorast", league: "KKZ Hlohovec", externalLeagueId: 361, externalTeamId: 4923, category: "Dorast", season: "2025/2026", coach: "Trénera doplní admin", captain: "Kapitána doplní admin", members: "", achievements: "Výsledky sa synchronizujú z vysledky.kolky.sk", description: "Dorastenecký tím pre mladých hráčov a hráčky, ktorí zbierajú súťažné skúsenosti." }
];

const iconMap = [
  { match: "dorast", icon: CircleDot },
  { match: "žensk", icon: UserRound },
  { match: "zensk", icon: UserRound },
  { match: "prvá", icon: Trophy },
  { match: "prva", icon: Trophy },
  { match: "druhá", icon: Users },
  { match: "druha", icon: Users },
  { match: "tretia", icon: Target }
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
  const Icon = pickIcon(team);
  const theme = getLeagueTheme(`${team.category || ""} ${team.name} ${team.league}`);

  return (
    <Link
      href={`/timy/${team.slug}`}
      className={`group block overflow-hidden rounded-[22px] bg-white shadow-[0_26px_70px_rgba(7,26,61,.16),0_2px_8px_rgba(7,26,61,.08)] ring-1 ring-[#071a3d]/[0.06] transition duration-300 hover:-translate-y-1 hover:shadow-[0_34px_90px_rgba(7,26,61,.22),0_5px_18px_rgba(7,26,61,.1)] focus:outline-none focus:ring-4 ${theme.ring}`}
    >
      <article>
        <div className={`relative overflow-hidden ${theme.panel} p-6 text-white`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_0%,rgba(255,255,255,.16),transparent_32%),linear-gradient(135deg,transparent_0_58%,rgba(255,255,255,.08)_59%,transparent_75%)]" />
          <div className="relative flex gap-5">
            <div className={`grid h-[92px] w-[92px] shrink-0 place-items-center rounded-[26px] bg-white/10 ring-1 ${theme.ring}`}>
              <Icon size={42} strokeWidth={1.55} />
            </div>
            <div className="min-w-0">
              <span className={`inline-flex rounded-md px-3 py-1 text-xs font-black uppercase tracking-[0.18em] ring-1 ${theme.badge}`}>
                {theme.label}
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

function pickIcon(team: LiveTeam) {
  const haystack = `${team.name} ${team.league}`.toLocaleLowerCase("sk-SK");
  return iconMap.find((item) => haystack.includes(item.match))?.icon ?? Trophy;
}

function splitList(value: string, separator = ",") {
  return value.split(separator).map((item) => item.trim()).filter(Boolean);
}

function officialTeams(teams: LiveTeam[]) {
  const rows = teams
    .filter((team) => {
      if (team.externalTeamId && OFFICIAL_TEAM_IDS.has(team.externalTeamId)) return true;
      const category = team.category || team.name;
      return OFFICIAL_CATEGORIES.includes(category);
    })
    .sort((a, b) => OFFICIAL_CATEGORIES.indexOf(a.category || a.name) - OFFICIAL_CATEGORIES.indexOf(b.category || b.name));
  return rows.length ? rows : OFFICIAL_FALLBACK_TEAMS;
}
