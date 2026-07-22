"use client";

import { useEffect, useState } from "react";
import { Award, ShieldCheck, UserRound } from "lucide-react";
import { readLiveData, subscribeLiveData, type LiveClubData, type LiveTeam } from "@/lib/live-store";

export function LiveTeamsList() {
  const [data, setData] = useState<LiveClubData>(() => readLiveData());
  const [openId, setOpenId] = useState<number | null>(null);

  useEffect(() => subscribeLiveData(setData), []);

  return (
    <section className="container-page grid gap-6 py-16 md:grid-cols-2 xl:grid-cols-3">
      {data.teams.map((team) => (
        <TeamCard key={team.id} team={team} open={openId === team.id} onToggle={() => setOpenId(openId === team.id ? null : team.id)} />
      ))}
    </section>
  );
}

function TeamCard({ team, open, onToggle }: { team: LiveTeam; open: boolean; onToggle: () => void }) {
  const members = splitList(team.members);
  const achievements = splitList(team.achievements, ";");

  return (
    <article className="overflow-hidden rounded-lg border border-navy/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-premium">
      <div className="bg-[linear-gradient(135deg,#071a33,#114bff)] p-6 text-white">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-white/60">{team.league}</p>
        <h2 className="sport-title mt-2 text-4xl leading-none">{team.name}</h2>
        <p className="mt-4 text-sm leading-6 text-white/72">{team.description}</p>
      </div>
      <div className="p-6">
        <div className="grid gap-3 text-sm text-navy/75">
          <p className="flex gap-2"><UserRound size={18} className="text-kkhc" /> Tréner: <strong className="text-navy">{team.coach}</strong></p>
          <p className="flex gap-2"><ShieldCheck size={18} className="text-kkhc" /> Kapitán: <strong className="text-navy">{team.captain}</strong></p>
        </div>
        <button type="button" onClick={onToggle} className="mt-5 h-11 w-full rounded-lg bg-kkhc text-sm font-black uppercase text-white transition hover:bg-[#238bff]">
          {open ? "Skryť tím" : "Zobraziť členov a úspechy"}
        </button>

        {open ? (
          <div className="mt-5 space-y-5 border-t border-navy/10 pt-5">
            <div>
              <h3 className="font-black uppercase text-navy">Členovia tímu</h3>
              <div className="mt-3 grid gap-2">
                {members.map((member) => <p key={member} className="rounded-md bg-mist p-3 text-sm font-semibold text-navy/75">{member}</p>)}
              </div>
            </div>
            <div>
              <h3 className="font-black uppercase text-navy">Úspechy</h3>
              <div className="mt-3 grid gap-2">
                {achievements.map((achievement) => (
                  <p key={achievement} className="flex gap-2 rounded-md bg-mist p-3 text-sm text-navy/75"><Award size={17} className="shrink-0 text-kkhc" /> {achievement}</p>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </article>
  );
}

function splitList(value: string, separator = ",") {
  return value.split(separator).map((item) => item.trim()).filter(Boolean);
}
