import type { Metadata } from "next";
import { SectionHeading } from "@/components/section-heading";
import { LiveCityLeague } from "@/components/live-city-league";

export const metadata: Metadata = {
  title: "Mestská liga v kolkoch Hlohovec",
  description: "Tímy, hráči, výsledky a štatistiky mestskej ligy v kolkoch v Hlohovci.",
  alternates: { canonical: "/city-league" },
  openGraph: { title: "Mestská liga v kolkoch Hlohovec", description: "Výsledky a štatistiky mestskej ligy v Hlohovci.", url: "/city-league" }
};

export default function CityLeaguePage() {
  return (
    <main className="bg-mist">
      <section className="bg-navy py-20 text-white">
        <div className="container-page">
          <SectionHeading light eyebrow="Kolky v Hlohovci" title="Mestská liga" text="Prehľad tímov, hráčov, výsledkov a štatistík mestskej ligy v Hlohovci." />
        </div>
      </section>
      <LiveCityLeague />
    </main>
  );
}
