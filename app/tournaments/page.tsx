import { SectionHeading } from "@/components/section-heading";
import { LiveTournamentList } from "@/components/live-tournament-list";

export default function TournamentsPage() {
  return (
    <main className="bg-mist">
      <section className="bg-navy py-20 text-white">
        <div className="container-page">
          <SectionHeading
            light
            eyebrow="Registrácie a výsledky"
            title="Turnaje"
            text="Prehľad pripravovaných, aktuálnych a ukončených podujatí. Záznamy sa aktualizujú priamo z admin dashboardu."
          />
        </div>
      </section>
      <LiveTournamentList />
    </main>
  );
}
