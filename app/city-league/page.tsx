import { SectionHeading } from "@/components/section-heading";
import { LiveCityLeague } from "@/components/live-city-league";

export default function CityLeaguePage() {
  return (
    <main className="bg-mist">
      <section className="bg-navy py-20 text-white">
        <div className="container-page">
          <SectionHeading light eyebrow="Lokálna súťaž" title="Mestská liga" text="Ligy, tímy, hráči a štatistiky sa aktualizujú priamo z admin dashboardu." />
        </div>
      </section>
      <LiveCityLeague />
    </main>
  );
}
