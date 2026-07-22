"use client";

import { useEffect, useState } from "react";
import { CalendarDays, ExternalLink, MapPin } from "lucide-react";
import { readLiveData, subscribeLiveData, type LiveClubData, type LiveMatch } from "@/lib/live-store";

export function LiveMatchesList() {
  const [data, setData] = useState<LiveClubData>(() => readLiveData());
  const [openId, setOpenId] = useState<number | null>(null);

  useEffect(() => subscribeLiveData(setData), []);

  const played = data.matches.filter((match) => match.status !== "plánované");
  const planned = data.matches.filter((match) => match.status === "plánované");

  return (
    <section className="container-page space-y-12 py-14">
      <MatchGroup title="Odohrané a importované zápasy" matches={played} openId={openId} setOpenId={setOpenId} />
      <MatchGroup title="Plánované zápasy" matches={planned} openId={openId} setOpenId={setOpenId} />
    </section>
  );
}

function MatchGroup({ title, matches, openId, setOpenId }: { title: string; matches: LiveMatch[]; openId: number | null; setOpenId: (id: number | null) => void }) {
  return (
    <div>
      <h2 className="sport-title mb-5 text-4xl text-navy">{title}</h2>
      <div className="grid gap-5 lg:grid-cols-2">
        {matches.map((match) => (
          <article key={match.id} className="overflow-hidden rounded-lg border border-navy/10 bg-white shadow-sm">
            <div className="bg-[#071a33] p-5 text-white">
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-black uppercase text-white/55">
                <span>{match.league} · {match.round}</span>
                <span>{match.status}</span>
              </div>
              <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-4 text-center">
                <TeamName name={match.home} />
                <div>
                  <strong className="block text-4xl font-black text-[#1688ff]">{match.score}</strong>
                  <p className="mt-1 font-black text-[#1688ff]">{match.pins}</p>
                </div>
                <TeamName name={match.away} />
              </div>
            </div>
            <div className="grid gap-3 p-5 text-sm text-navy/70 sm:grid-cols-2">
              <p className="flex gap-2"><CalendarDays size={17} className="text-kkhc" /> {match.date}</p>
              <p className="flex gap-2"><MapPin size={17} className="text-kkhc" /> {match.location}</p>
            </div>
            <div className="border-t border-navy/10 p-5">
              <button type="button" onClick={() => setOpenId(openId === match.id ? null : match.id)} className="text-sm font-black uppercase text-kkhc">
                {openId === match.id ? "Skryť detail" : "Detail zápasu"}
              </button>
              {match.sourceUrl ? <a className="ml-5 inline-flex items-center gap-1 text-sm font-bold text-navy/55 hover:text-kkhc" href={match.sourceUrl} target="_blank" rel="noreferrer">Zdroj <ExternalLink size={14} /></a> : null}
              {openId === match.id ? <MatchRows rows={match.detailRows} /> : null}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function TeamName({ name }: { name: string }) {
  return <p className="text-sm font-black leading-tight">{name}</p>;
}

function MatchRows({ rows }: { rows: string }) {
  const parsed = rows.split("\n").map((line) => line.split("|").map((item) => item.trim())).filter((line) => line.length > 1);
  if (!parsed.length) return <p className="mt-4 rounded-md bg-mist p-4 text-sm text-navy/65">Detailná zápisnica zatiaľ nie je doplnená.</p>;

  return (
    <div className="mt-4 overflow-x-auto rounded-md border border-navy/10">
      <table className="w-full min-w-[560px] text-left text-sm">
        <tbody>
          {parsed.map((row) => (
            <tr key={row.join("-")} className="border-b border-navy/10 last:border-b-0">
              {row.map((cell, index) => <td key={`${row.join("-")}-${index}`} className="px-3 py-3 text-navy/75">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
