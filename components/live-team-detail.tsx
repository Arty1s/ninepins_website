"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ElementType } from "react";
import {
  Award,
  BarChart3,
  CalendarDays,
  ChevronRight,
  ShieldCheck,
  Star,
  Trophy,
  UserRound,
  Users
} from "lucide-react";
import { readLiveData, refreshLiveDataFromBackend, subscribeLiveData, type LiveClubData, type LiveMember, type LiveTeam } from "@/lib/live-store";

type PlayerCard = {
  name: string;
  role: string;
  description: string;
  source?: LiveMember;
};

export function LiveTeamDetail({ slug }: { slug: string }) {
  const [data, setData] = useState<LiveClubData>(() => readLiveData());

  useEffect(() => {
    refreshLiveDataFromBackend().then(setData).catch(() => undefined);
    return subscribeLiveData(setData);
  }, []);

  const team = data.teams.find((item) => item.slug === slug);
  const players = useMemo(() => buildPlayers(team, data.members), [team, data.members]);
  const achievements = useMemo(() => splitList(team?.achievements || "", ";"), [team?.achievements]);

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
    <main className="min-h-screen bg-[#f6f8fc] text-[#071a33]">
      <section className="relative isolate overflow-hidden pt-[82px] text-white">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,11,24,.94)_0%,rgba(5,18,42,.70)_44%,rgba(5,18,42,.18)_100%),url('/images/teams-hero-bg.png')] bg-cover bg-center" />
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
              <HeroStat icon={CalendarDays} value="2024/2025" label="sezóna" />
              <HeroStat icon={Trophy} value={achievements[0] ? "Aktívny tím" : "Pripravené"} label="úspechy" />
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-7">
        <div className="flex flex-wrap items-center gap-8 border-b border-[#071a3d]/10">
          <Tab active icon={Users} label="Hráči" />
          <Tab icon={BarChart3} label="Štatistiky" />
        </div>
      </section>

      <section className="container-page pb-16">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {players.length ? players.map((player, index) => (
            <PlayerTile key={`${player.name}-${index}`} player={player} index={index} />
          )) : (
            <div className="col-span-full rounded-2xl bg-white p-8 text-center shadow-[0_18px_50px_rgba(7,26,61,.12)]">
              <p className="text-lg font-black">Admin zatiaľ nepridal hráčov do tohto tímu.</p>
              <p className="mt-2 text-sm text-[#071a3d]/60">Po doplnení členov v administrácii sa zobrazia automaticky tu.</p>
            </div>
          )}
        </div>

        <div className="mt-7 grid gap-5 lg:grid-cols-2">
          <StaffCard icon={UserRound} eyebrow="Tréner" title={team.coach} text="Skúsený tréner alebo zodpovedná osoba tímu. Detail môže neskôr doplniť admin." />
          <StaffCard icon={ShieldCheck} eyebrow="Kapitán tímu" title={team.captain} text="Kapitán vedie tím na dráhe, drží disciplínu a pomáha novým hráčom zapadnúť." />
        </div>

        <div className="mt-7 rounded-2xl bg-white p-6 shadow-[0_18px_50px_rgba(7,26,61,.12)] ring-1 ring-[#071a3d]/[0.06]">
          <div className="mb-5 flex items-center gap-3">
            <Award className="text-[#114bff]" />
            <h2 className="text-2xl font-black">Úspechy tímu</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {achievements.length ? achievements.map((achievement) => (
              <p key={achievement} className="flex gap-3 rounded-xl bg-[#f3f7ff] p-4 text-sm font-semibold leading-6 text-[#071a3d]/75">
                <Star size={18} className="mt-0.5 shrink-0 text-[#114bff]" />
                {achievement}
              </p>
            )) : (
              <p className="rounded-xl bg-[#f3f7ff] p-4 text-sm font-semibold text-[#071a3d]/60">Úspechy doplní admin.</p>
            )}
          </div>
        </div>
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

function Tab({ icon: Icon, label, active = false }: { icon: ElementType; label: string; active?: boolean }) {
  return (
    <button className={`relative inline-flex items-center gap-2 py-4 text-lg font-bold ${active ? "text-[#114bff]" : "text-[#071a3d]/68"}`} type="button">
      <Icon size={22} strokeWidth={1.8} />
      {label}
      {active ? <span className="absolute bottom-[-1px] left-0 h-[2px] w-full rounded-full bg-[#114bff]" /> : null}
    </button>
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
      <Star className="absolute bottom-5 right-5 text-[#071a3d]/45" size={19} strokeWidth={1.6} />
    </article>
  );
}

function StaffCard({ icon: Icon, eyebrow, title, text }: { icon: ElementType; eyebrow: string; title: string; text: string }) {
  return (
    <article className="grid gap-5 rounded-2xl bg-white p-6 shadow-[0_18px_50px_rgba(7,26,61,.12)] ring-1 ring-[#071a3d]/[0.06] sm:grid-cols-[112px_1fr]">
      <div className="grid h-28 w-28 place-items-center rounded-2xl bg-[#f0f5ff] text-[#114bff]">
        <Icon size={58} strokeWidth={1.35} />
      </div>
      <div>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#114bff]">{eyebrow}</p>
        <h3 className="mt-2 text-2xl font-black">{title}</h3>
        <div className="mt-3 h-[2px] w-14 rounded-full bg-[#114bff]" />
        <p className="mt-4 text-sm leading-6 text-[#071a3d]/70">{text}</p>
      </div>
    </article>
  );
}

function buildPlayers(team: LiveTeam | undefined, members: LiveMember[]): PlayerCard[] {
  if (!team) return [];
  const teamMembers = splitList(team.members);
  const linkedMembers = members.filter((member) => {
    const memberTeam = normalize(member.team);
    return memberTeam === normalize(team.name) || memberTeam === normalize(team.slug) || memberTeam === normalize(team.league);
  });

  const names = teamMembers.length ? teamMembers : linkedMembers.map((member) => member.name);
  const uniqueNames = Array.from(new Set(names)).slice(0, 10);

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

function splitList(value: string, separator = ",") {
  return value.split(separator).map((item) => item.trim()).filter(Boolean);
}

function normalize(value: string) {
  return value.trim().toLocaleLowerCase("sk-SK");
}
