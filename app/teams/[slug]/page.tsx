import Image from "next/image";
import { notFound } from "next/navigation";
import { Award, BarChart3, ShieldCheck, UserRound } from "lucide-react";
import { Card } from "@/components/card";
import { SectionHeading } from "@/components/section-heading";
import { teams } from "@/lib/data";

export function generateStaticParams() {
  return teams.map((team) => ({ slug: team.slug }));
}

export default function TeamDetailPage({ params }: { params: { slug: string } }) {
  const team = teams.find((item) => item.slug === params.slug);
  if (!team) notFound();

  return (
    <main>
      <section className="relative min-h-[430px] overflow-hidden bg-navy text-white">
        <Image src={team.image} alt={team.name} fill className="object-cover opacity-35" priority />
        <div className="container-page relative z-10 flex min-h-[430px] items-end py-14">
          <SectionHeading light eyebrow={team.league} title={team.name} text={team.description} />
        </div>
      </section>
      <section className="container-page grid gap-8 py-16 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-6">
          <Card>
            <UserRound className="mb-3 text-kkhc" />
            <h2 className="sport-title text-3xl">Tréner</h2>
            <p className="text-navy/70">{team.coach}</p>
          </Card>
          <Card>
            <ShieldCheck className="mb-3 text-kkhc" />
            <h2 className="sport-title text-3xl">Kapitán</h2>
            <p className="text-navy/70">{team.captain}</p>
          </Card>
          <Card>
            <BarChart3 className="mb-3 text-kkhc" />
            <h2 className="sport-title text-3xl">Štatistiky</h2>
            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              <Stat label="Priemer" value={team.stats.priemer} />
              <Stat label="Zápasy" value={team.stats.zapasy} />
              <Stat label="Výhry" value={team.stats.vitazstva} />
            </div>
          </Card>
        </div>
        <div className="space-y-8">
          <Card>
            <h2 className="sport-title mb-5 text-4xl">Členovia tímu</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {team.members.map((member, index) => (
                <div key={member} className="flex items-center gap-4 rounded-md bg-mist p-4">
                  <div className="grid h-14 w-14 place-items-center rounded-full bg-kkhc font-black text-white">{index + 1}</div>
                  <div>
                    <p className="font-black text-navy">{member}</p>
                    <p className="text-sm text-navy/65">Hráč tímu, osobné úspechy doplní admin.</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <h2 className="sport-title mb-4 text-4xl">Tímové a osobné úspechy</h2>
            {team.achievements.map((achievement) => (
              <p key={achievement} className="mb-3 flex gap-3 text-navy/75"><Award className="text-kkhc" size={20} /> {achievement}</p>
            ))}
          </Card>
        </div>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md bg-mist p-3">
      <div className="sport-title text-3xl text-navy">{value}</div>
      <p className="text-xs font-black uppercase text-navy/60">{label}</p>
    </div>
  );
}
