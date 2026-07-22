"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Clock3, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { readLiveData, subscribeLiveData, type LiveClubData, type LiveTournament } from "@/lib/live-store";

export function HomeTournamentSpotlight() {
  const [data, setData] = useState<LiveClubData>(() => readLiveData());

  useEffect(() => subscribeLiveData(setData), []);

  const tournaments = useMemo(
    () => data.tournaments.filter((item) => item.type !== "past").slice(0, 4),
    [data.tournaments]
  );

  if (!tournaments.length) return null;

  return (
    <article className="bg-[#061b3a] p-6 text-white shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#4d90ff]">Nadchádzajúce podujatia</p>
      <div className="mt-5 space-y-4">
        {tournaments.map((item) => (
          <EventRow key={item.id} tournament={item} />
        ))}
      </div>
      <Button href="/tournaments" variant="secondary" className="mt-6 w-full">
        Zobraziť všetky podujatia <ArrowRight size={18} />
      </Button>
    </article>
  );
}

function EventRow({ tournament }: { tournament: LiveTournament }) {
  const [day, month = ""] = tournament.date.split(".");

  return (
    <a href="/tournaments" className="grid grid-cols-[64px_1fr] gap-4 border-b border-white/10 pb-4 last:border-b-0 last:pb-0">
      <div className="bg-[#1677ff] px-2 py-3 text-center">
        <strong className="block text-2xl leading-none">{day}</strong>
        <span className="mt-1 block text-[11px] font-black uppercase">{month || tournament.type}</span>
      </div>
      <div>
        <h3 className="font-black leading-tight">{tournament.name}</h3>
        <div className="mt-2 flex flex-wrap gap-3 text-xs text-white/62">
          <span className="inline-flex items-center gap-1"><MapPin size={13} /> {tournament.location}</span>
          <span className="inline-flex items-center gap-1"><Clock3 size={13} /> {tournament.time}</span>
        </div>
      </div>
    </a>
  );
}
