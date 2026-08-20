"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Target, TrendingUp, Users } from "lucide-react";
import { Card } from "@/components/card";
import { readLiveData, subscribeLiveData, type LiveClubData } from "@/lib/live-store";

export function LiveCityLeague() {
  const [data, setData] = useState<LiveClubData>(() => readLiveData());

  useEffect(() => subscribeLiveData(setData), []);

  return (
    <section className="container-page grid gap-6 py-16 lg:grid-cols-[1.2fr_0.8fr]">
      <Card>
        <h2 className="sport-title mb-5 text-4xl">Ligy a súťaže</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left">
            <thead className="text-xs uppercase text-navy/55">
              <tr><th className="py-3">Liga</th><th>Sezóna</th><th>Tímy</th><th>Stav</th><th>Líder</th></tr>
            </thead>
            <tbody>
              {data.leagues.map((row) => (
                <tr key={row.id} className="border-t border-navy/10">
                  <td className="py-4 font-black">{row.name}</td>
                  <td>{row.season}</td>
                  <td>{row.teams}</td>
                  <td>{row.status}</td>
                  <td>{row.leader}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <div className="space-y-6">
        <Mini icon={CalendarDays} title="Najbližší zápas" text={data.leagues[0] ? `${data.leagues[0].name}: ďalšie kolo pripravuje admin.` : "Admin zatiaľ nepridal ligu."} />
        <Mini icon={Target} title="Výsledky" text={data.leagues[0] ? `Vedie ${data.leagues[0].leader}.` : "Výsledky budú dostupné po pridaní ligy."} />
        <Mini icon={TrendingUp} title="Hráčske štatistiky" text={data.players[0] ? `Najlepší priemer: ${data.players[0].name}, ${data.players[0].average} kolkov.` : "Admin zatiaľ nepridal hráčov."} />
        <Card>
          <Users className="mb-3 text-kkhc" />
          <h2 className="sport-title text-3xl">Hráči v systéme</h2>
          <div className="mt-3 space-y-2">
            {data.players.slice(0, 4).map((player) => (
              <p key={player.id} className="rounded-md bg-mist p-3 text-sm text-navy/75">
                <strong className="text-navy">{player.name}</strong> · {player.team} · priemer {player.average}
              </p>
            ))}
          </div>
        </Card>
      </div>
    </section>
  );
}

function Mini({ icon: Icon, title, text }: { icon: React.ElementType; title: string; text: string }) {
  return (
    <Card>
      <Icon className="mb-3 text-kkhc" />
      <h2 className="sport-title text-3xl">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-navy/70">{text}</p>
    </Card>
  );
}
