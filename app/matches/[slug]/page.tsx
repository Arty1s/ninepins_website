import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { matchArchive } from "@/lib/data";

export function generateStaticParams() {
  return matchArchive.map((match) => ({ slug: match.slug }));
}

export default function MatchDetailPage({ params }: { params: { slug: string } }) {
  const match = matchArchive.find((item) => item.slug === params.slug);
  if (!match) notFound();

  return (
    <main className="bg-[#3f3f3f] pt-24 text-white">
      <section className="border-b border-white/30 bg-[#474747]">
        <div className="container-page py-4">
          <Link href="/zapasy" className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-white/70 hover:text-white">
            <ArrowLeft size={16} /> Späť na zápasy
          </Link>
          <p className="text-center text-sm font-bold text-white/86">
            {match.round}, {match.league} <span className="mx-2">|</span> {match.date} {match.time} <span className="mx-2">|</span> {match.location}
          </p>
          <div className="mt-4 grid items-center gap-5 md:grid-cols-[1fr_auto_1fr]">
            <TeamHeader team={match.home} align="left" />
            <div className="text-center">
              <p className="text-[11px] font-black uppercase text-white/50">Body</p>
              <strong className="block text-2xl font-black">{match.points}</strong>
              <p className="mt-2 text-[11px] font-black uppercase text-white/50">Spolu</p>
              <strong className="block text-2xl font-black">{match.pins}</strong>
            </div>
            <TeamHeader team={match.away} align="right" />
          </div>
        </div>
      </section>

      <section className="border-b border-white/30 bg-[#494949]">
        <div className="container-page grid gap-4 py-5 sm:grid-cols-4">
          <Metric title="Sety" value={match.sets} />
          <Metric title="Plné" value={match.fulls} />
          <Metric title="Dorážka" value={match.cleanup} />
          <Metric title="Chyby" value={match.faults} />
        </div>
      </section>

      {match.progress.length ? (
        <section className="border-b-4 border-[#222] bg-[#4a4a4a] py-5">
          <div className="container-page">
            <h2 className="mb-2 text-sm font-black text-black">Priebeh zápasu</h2>
            <MatchChart values={match.progress} />
          </div>
        </section>
      ) : null}

      <section className="container-page py-8">
        {match.rows.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse text-left">
              <thead>
                <tr className="border-b border-white/35 text-xs uppercase text-white/62">
                  <th className="px-3 py-3">{match.home.name}</th>
                  <th className="px-3 py-3 text-center">Plné</th>
                  <th className="px-3 py-3 text-center">Dor.</th>
                  <th className="px-3 py-3 text-center">CH</th>
                  <th className="px-3 py-3 text-center">SUM</th>
                  <th className="px-3 py-3 text-center">S.B.</th>
                  <th className="px-3 py-3 text-center">B</th>
                  <th className="px-3 py-3">{match.away.name}</th>
                  <th className="px-3 py-3 text-center">Plné</th>
                  <th className="px-3 py-3 text-center">Dor.</th>
                  <th className="px-3 py-3 text-center">CH</th>
                  <th className="px-3 py-3 text-center">SUM</th>
                  <th className="px-3 py-3 text-center">S.B.</th>
                  <th className="px-3 py-3 text-center">B</th>
                </tr>
              </thead>
              <tbody>
                {match.rows.map((row) => (
                  <tr key={`${row.homePlayer}-${row.awayPlayer}`} className="border-b border-white/35">
                    <PlayerCell value={row.homePlayer} />
                    <ScoreCell value={row.homeFulls} />
                    <ScoreCell value={row.homeCleanup} />
                    <ScoreCell value={row.homeFaults} />
                    <ScoreCell value={row.homeTotal} strong />
                    <ScoreCell value={row.homeSets} />
                    <ScoreCell value={row.homePoints} strong />
                    <PlayerCell value={row.awayPlayer} />
                    <ScoreCell value={row.awayFulls} />
                    <ScoreCell value={row.awayCleanup} />
                    <ScoreCell value={row.awayFaults} />
                    <ScoreCell value={row.awayTotal} strong />
                    <ScoreCell value={row.awaySets} />
                    <ScoreCell value={row.awayPoints} strong />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-lg border border-white/15 bg-white/8 p-6">
            <h2 className="text-2xl font-black">Detailná zápisnica čaká na doplnenie</h2>
            <p className="mt-2 max-w-2xl text-white/70">
              Detailné výkony hráčov, plné, dorážka, chyby, súčet a body zatiaľ nie sú zverejnené.
            </p>
          </div>
        )}

        <a href={match.sourceHref} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#58a3ff] hover:text-white">
          Otvoriť zdroj: {match.source} <ExternalLink size={15} />
        </a>
      </section>
    </main>
  );
}

function TeamHeader({ team, align }: { team: { name: string; shortName: string; badgeClass: string }; align: "left" | "right" }) {
  const isKkhc = team.name.includes("Hlohovec");

  return (
    <div className={`flex items-center gap-4 ${align === "right" ? "justify-end" : ""}`}>
      {align === "left" ? <TeamMark team={team} isKkhc={isKkhc} /> : null}
      <h1 className="text-lg font-bold">{team.name}</h1>
      {align === "right" ? <TeamMark team={team} isKkhc={isKkhc} /> : null}
    </div>
  );
}

function TeamMark({ team, isKkhc }: { team: { shortName: string; badgeClass: string }; isKkhc: boolean }) {
  if (isKkhc) {
    return (
      <div className="grid h-16 w-16 place-items-center">
        <Image src="/kkhc-logo.png" alt="KKHC logo" width={62} height={46} className="kkhc-logo-cutout h-12 w-auto object-contain" />
      </div>
    );
  }

  return (
    <div className={`grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br ${team.badgeClass} text-white ring-1 ring-white/15`}>
      <span className="text-xs font-black">{team.shortName}</span>
    </div>
  );
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-[11px] font-black uppercase text-[#cbd5e1]">{title}</p>
      <strong className="mt-1 block text-lg font-black">{value}</strong>
    </div>
  );
}

function PlayerCell({ value }: { value: string }) {
  return <td className="px-3 py-4 text-base font-black text-white">{value}</td>;
}

function ScoreCell({ value, strong = false }: { value: string | number; strong: boolean }) {
  return (
    <td className={`px-3 py-4 text-center ${strong ? "text-base font-black" : "text-sm font-medium text-white/90"}`}>
      {value}
    </td>
  );
}

function MatchChart({ values }: { values: number[] }) {
  const max = 300;
  const width = 1000;
  const height = 210;
  const points = values
    .map((value, index) => `${(index / (values.length - 1)) * width},${height - (value / max) * (height - 20) - 10}`)
    .join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-[210px] w-full bg-[#4a4a4a]" role="img" aria-label="Priebeh zápasu">
      {[0, 100, 200, 300].map((line) => {
        const y = height - (line / max) * (height - 20) - 10;
        return (
          <g key={line}>
            <line x1="0" x2={width} y1={y} y2={y} stroke="rgba(255,255,255,.32)" />
            <text x="0" y={y - 6} fill="white" fontSize="13">{line}</text>
          </g>
        );
      })}
      <polyline points={points} fill="none" stroke="#147cff" strokeWidth="3" />
    </svg>
  );
}
