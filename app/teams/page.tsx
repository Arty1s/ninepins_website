import { SectionHeading } from "@/components/section-heading";
import { LiveTeamsList } from "@/components/live-teams-list";

export default function TeamsPage() {
  return (
    <main className="bg-mist">
      <section className="bg-navy py-20 text-white">
        <div className="container-page">
          <SectionHeading light eyebrow="Súťažné kategórie" title="Tímy KK Hlohovec" text="Admin môže meniť tímy, členov, kapitánov a úspechy. Verejnosť ich vidí hneď bez zásahu do kódu." />
        </div>
      </section>
      <LiveTeamsList />
    </main>
  );
}
