"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ExternalLink, Filter, MapPin } from "lucide-react";
import {
  readLiveData,
  refreshLiveDataFromBackend,
  subscribeLiveData,
  type LiveClubData,
  type LiveMatch
} from "@/lib/live-store";

const CURRENT_SEASON = "2026/2027";
const ARCHIVE_SEASON = "2025/2026";

const filters = [
  "Všetko",
  "Ženská extraliga",
  "Dorast",
  "Prvá liga",
  "Druhá liga",
  "Tretia liga",
  "Extraliga muži"
];

export function LiveMatchesList() {
  const [data, setData] = useState<LiveClubData>(() => readLiveData());
  const [openId, setOpenId] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState("Všetko");

  useEffect(() => {
    refreshLiveDataFromBackend().then(setData).catch(() => undefined);
    return subscribeLiveData(setData);
  }, []);

  const matches = useMemo(() => {
    return [...data.matches]
      .filter((match) => activeFilter === "Všetko" || matchCategory(match) === activeFilter)
      .sort((a, b) => dateValue(b.date) - dateValue(a.date));
  }, [activeFilter, data.matches]);

  const currentSeasonMatches = matches.filter((match) => matchSeason(match) === CURRENT_SEASON);
  const archiveSeasonMatches = matches.filter((match) => matchSeason(match) === ARCHIVE_SEASON);
  const olderMatches = matches.filter((match) => ![CURRENT_SEASON, ARCHIVE_SEASON].includes(matchSeason(match)));

  return (
    <section className="relative overflow-hidden bg-[#06182f] py-16 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(22,136,255,.22),transparent_34%),radial-gradient(circle_at_78%_28%,rgba(22,136,255,.12),transparent_34%),linear-gradient(180deg,#071a33_0%,#041121_100%)]" />
      <div className="absolute inset-0 opacity-[.13] [background-image:linear-gradient(110deg,transparent_0%,transparent_46%,rgba(47,155,255,.28)_47%,transparent_48%,transparent_100%)] [background-size:360px_100%]" />
      <div className="container-page relative z-10 space-y-12">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.035] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,.04)]">
          <div className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[#8bbfff]">
            <Filter size={15} /> Súťaže a tímy
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.08em] transition ${
                  activeFilter === filter
                    ? "bg-[#1688ff] text-white shadow-[0_12px_30px_rgba(22,136,255,.28)]"
                    : "border border-white/[0.08] bg-white/[0.04] text-[#b9c7db] hover:border-[#1688ff]/50 hover:text-white"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <SeasonGroup
          season={CURRENT_SEASON}
          eyebrow="Nová sezóna"
          title="Sezóna 2026/2027"
          matches={currentSeasonMatches}
          openId={openId}
          setOpenId={setOpenId}
          emptyText="Nová sezóna 2026/2027 je pripravená. Zápasy sa sem doplnia automaticky po importe z kolky.sk alebo ručne cez admin."
        />

        <SeasonGroup
          season={ARCHIVE_SEASON}
          eyebrow="Archív sezóny"
          title="Sezóna 2025/2026"
          matches={archiveSeasonMatches}
          openId={openId}
          setOpenId={setOpenId}
        />

        {olderMatches.length ? (
          <SeasonGroup
            season="staršie"
            eyebrow="Staršie dáta"
            title="Staršie sezóny"
            matches={olderMatches}
            openId={openId}
            setOpenId={setOpenId}
          />
        ) : null}
      </div>
    </section>
  );
}

function SeasonGroup({
  season,
  eyebrow,
  title,
  matches,
  openId,
  setOpenId,
  emptyText
}: {
  season: string;
  eyebrow: string;
  title: string;
  matches: LiveMatch[];
  openId: number | null;
  setOpenId: (id: number | null) => void;
  emptyText?: string;
}) {
  const planned = matches.filter((match) => match.status === "plánované");
  const played = matches.filter((match) => match.status !== "plánované");

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1688ff]">{eyebrow}</p>
          <h2 className="sport-title mt-2 text-4xl text-white">{title}</h2>
        </div>
        <span className="w-fit rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#9bcaff]">
          {matches.length} zápasov
        </span>
      </div>

      {!matches.length ? (
        <div className="rounded-2xl border border-dashed border-[#1688ff]/25 bg-[linear-gradient(180deg,rgba(10,29,58,.72),rgba(8,23,46,.55))] p-8 text-[#b9c7db] shadow-[inset_0_1px_0_rgba(255,255,255,.04)]">
          <p className="max-w-3xl text-sm leading-7">{emptyText || "Zatiaľ tu nie sú žiadne zápasy."}</p>
          <p className="mt-3 text-xs font-black uppercase tracking-[0.16em] text-[#1688ff]">
            Import: /api/import/kolky?from=2026-07-01&query=Hlohovec
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {planned.length ? <MatchGroup title="Plánované zápasy" matches={planned} openId={openId} setOpenId={setOpenId} season={season} /> : null}
          {played.length ? <MatchGroup title="Odohrané a importované zápasy" matches={played} openId={openId} setOpenId={setOpenId} season={season} /> : null}
        </div>
      )}
    </div>
  );
}

function MatchGroup({
  title,
  matches,
  openId,
  setOpenId,
  season
}: {
  title: string;
  matches: LiveMatch[];
  openId: number | null;
  setOpenId: (id: number | null) => void;
  season: string;
}) {
  return (
    <div>
      <h3 className="mb-4 text-lg font-black uppercase tracking-[0.08em] text-[#dbe8ff]">{title}</h3>
      <div className="grid gap-5 xl:grid-cols-3">
        {matches.map((match) => (
          <article
            key={`${season}-${match.id}`}
            className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[linear-gradient(180deg,#0a1d3a_0%,#08172e_100%)] shadow-[0_18px_55px_rgba(0,0,0,.30),inset_0_1px_0_rgba(255,255,255,.04)]"
          >
            <div className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-4 text-xs font-black uppercase text-[#9bcaff]">
                <span>{match.league} · {match.round}</span>
                <span>{match.date}</span>
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
            <div className="grid gap-3 border-t border-white/[0.06] px-5 py-4 text-sm text-[#b9c7db] sm:grid-cols-2">
              <p className="flex gap-2"><CalendarDays size={17} className="text-[#1688ff]" /> {match.status}</p>
              <p className="flex gap-2"><MapPin size={17} className="text-[#1688ff]" /> {match.location}</p>
            </div>
            <div className="border-t border-white/[0.06] p-5">
              <button
                type="button"
                onClick={() => setOpenId(openId === match.id ? null : match.id)}
                className="text-sm font-black uppercase tracking-[0.08em] text-[#1688ff] transition hover:text-white"
              >
                {openId === match.id ? "Skryť detail" : "Detail zápasu"}
              </button>
              {match.sourceUrl ? (
                <a
                  className="ml-5 inline-flex items-center gap-1 text-sm font-bold text-[#9bcaff] hover:text-white"
                  href={match.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Zdroj <ExternalLink size={14} />
                </a>
              ) : null}
              {openId === match.id ? <MatchRows rows={match.detailRows} /> : null}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function TeamName({ name }: { name: string }) {
  return <p className="text-sm font-black leading-tight text-white">{name}</p>;
}

function MatchRows({ rows }: { rows: string }) {
  const parsed = rows
    .split("\n")
    .map((line) => line.split("|").map((item) => item.trim()))
    .filter((line) => line.length > 1);

  if (!parsed.length) {
    return <p className="mt-4 rounded-md bg-white/[0.04] p-4 text-sm text-[#b9c7db]">Detailná zápisnica zatiaľ nie je doplnená.</p>;
  }

  return (
    <div className="mt-4 overflow-x-auto rounded-md border border-white/[0.06] bg-black/10">
      <table className="w-full min-w-[560px] text-left text-sm">
        <tbody>
          {parsed.map((row) => (
            <tr key={row.join("-")} className="border-b border-white/[0.06] last:border-b-0">
              {row.map((cell, index) => (
                <td key={`${row.join("-")}-${index}`} className="px-3 py-3 text-[#dbe8ff]">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function matchSeason(match: LiveMatch) {
  const explicit = match.league.match(/20\d{2}\/20\d{2}/)?.[0];
  if (explicit) return explicit;

  const matchDate = parsedDate(match.date);
  if (!matchDate) return "staršie";

  const year = matchDate.getFullYear();
  const month = matchDate.getMonth() + 1;
  const seasonStartYear = month >= 7 ? year : year - 1;
  return `${seasonStartYear}/${seasonStartYear + 1}`;
}

function matchCategory(match: LiveMatch) {
  const value = `${match.league} ${match.home} ${match.away}`.toLocaleLowerCase("sk-SK");
  if (value.includes("žensk") || value.includes("zensk") || value.includes("ženy")) return "Ženská extraliga";
  if (value.includes("dorast")) return "Dorast";
  if (value.includes("extraliga")) return "Extraliga muži";
  if (value.includes("3.") || value.includes("tretia")) return "Tretia liga";
  if (value.includes("2.") || value.includes("druhá") || value.includes("druha")) return "Druhá liga";
  if (value.includes("1.") || value.includes("prvá") || value.includes("prva")) return "Prvá liga";
  return "Všetko";
}

function dateValue(value: string) {
  return parsedDate(value)?.getTime() || 0;
}

function parsedDate(value: string) {
  const match = value.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
  if (!match) return null;
  return new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]));
}
