"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CircleDot, ShieldCheck, Target, Trophy, UserRound, Users } from "lucide-react";
import { readLiveData, refreshLiveDataFromBackend, subscribeLiveData, type LiveClubData, type LiveTeam } from "@/lib/live-store";

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
  const [data, setData] = useState<LiveClubData>(() => readLiveData());

  useEffect(() => {
    refreshLiveDataFromBackend().then(setData).catch(() => undefined);
    return subscribeLiveData(setData);
  }, []);

  return (
    <section className="relative overflow-hidden py-10 sm:py-14">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_8%,rgba(17,75,255,.08),transparent_28%),radial-gradient(circle_at_84%_42%,rgba(17,75,255,.07),transparent_32%)]" />
      <div className="container-page relative z-10">
        <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
          {data.teams.map((team) => (
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

  return (
    <Link
      href={`/timy/${team.slug}`}
      className="group block overflow-hidden rounded-[18px] bg-white shadow-[0_20px_55px_rgba(7,26,61,.14),0_2px_8px_rgba(7,26,61,.08)] ring-1 ring-[#071a3d]/[0.06] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_74px_rgba(7,26,61,.18),0_5px_18px_rgba(7,26,61,.1)] focus:outline-none focus:ring-4 focus:ring-[#114bff]/20"
    >
      <article>
        <div className="relative overflow-hidden bg-[linear-gradient(135deg,#08275f_0%,#114bff_100%)] p-6 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_0%,rgba(255,255,255,.16),transparent_32%),linear-gradient(135deg,transparent_0_58%,rgba(255,255,255,.08)_59%,transparent_75%)]" />
          <div className="relative flex gap-5">
            <div className="grid h-[84px] w-[84px] shrink-0 place-items-center rounded-full bg-[#071a3d]/18 ring-2 ring-[#278dff]/70">
              <Icon size={42} strokeWidth={1.55} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-[#b7d4ff]">{team.league}</p>
              <h2 className="mt-3 text-3xl font-black leading-tight tracking-tight">{team.name}</h2>
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-white/82">{team.description}</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid gap-3 text-sm text-[#071a3d]/72">
            <InfoRow icon={UserRound} label="Tréner:" value={team.coach} />
            <InfoRow icon={ShieldCheck} label="Kapitán:" value={team.captain} />
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 border-t border-[#071a3d]/10 pt-5 text-sm">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[#071a3d]/45">Členovia</p>
              <p className="mt-1 font-black text-[#071a3d]">{Math.min(members.length, 10)} zobrazených</p>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[#071a3d]/45">Úspechy</p>
              <p className="mt-1 font-black text-[#071a3d]">{achievements.length || "Doplní admin"}</p>
            </div>
          </div>

          <span className="mt-5 inline-flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-[#0b48d8] px-5 text-sm font-black uppercase tracking-[0.06em] text-white shadow-[0_14px_32px_rgba(17,75,255,.25)] transition group-hover:-translate-y-0.5 group-hover:bg-[#1265ff]">
            Zobraziť členov a úspechy
            <ArrowRight size={17} className="transition group-hover:translate-x-1" />
          </span>
        </div>
      </article>
    </Link>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof UserRound; label: string; value: string }) {
  return (
    <p className="flex items-center gap-3">
      <Icon size={18} className="shrink-0 text-[#114bff]" strokeWidth={1.9} />
      <span>{label}</span>
      <strong className="font-black text-[#071a3d]">{value}</strong>
    </p>
  );
}

function pickIcon(team: LiveTeam) {
  const haystack = `${team.name} ${team.league}`.toLocaleLowerCase("sk-SK");
  return iconMap.find((item) => haystack.includes(item.match))?.icon ?? Trophy;
}

function splitList(value: string, separator = ",") {
  return value.split(separator).map((item) => item.trim()).filter(Boolean);
}
