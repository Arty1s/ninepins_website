import { SectionHeading } from "@/components/section-heading";
import { LiveTournamentList } from "@/components/live-tournament-list";

export default function TournamentsPage() {
  return (
    <main className="bg-[#f4f8ff]">
      <section className="relative isolate overflow-hidden pt-[82px] text-white">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,10,24,.94)_0%,rgba(5,18,42,.72)_42%,rgba(5,18,42,.22)_100%),url('/images/teams-hero-bg.png')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_24%,rgba(22,136,255,.22),transparent_34%),linear-gradient(180deg,transparent_0%,rgba(2,11,24,.18)_100%)]" />
        <div className="container-page relative z-10 grid min-h-[330px] items-center py-16 md:min-h-[390px]">
          <SectionHeading
            light
            eyebrow="Archív a výsledky"
            title="Turnaje"
            text="Prehľad minulých turnajov. Výsledky, fotografie a ďalšie podrobnosti bude priebežne dopĺňať admin."
          />
        </div>
      </section>
      <LiveTournamentList />
    </main>
  );
}

