import Image from "next/image";
import type { Metadata } from "next";
import { SectionHeading } from "@/components/section-heading";
import { LiveMatchesList } from "@/components/live-matches-list";

export const metadata: Metadata = {
  title: "Zápasy a výsledky KK Hlohovec",
  description: "Program, výsledky a zápisnice zo zápasov tímov KK Hlohovec podľa súťaží a sezón.",
  alternates: { canonical: "/zapasy" },
  openGraph: { title: "Zápasy a výsledky KK Hlohovec", description: "Výsledky, program a zápisnice tímov KK Hlohovec.", url: "/zapasy" }
};

export default function ZapasyPage() {
  return (
    <main className="bg-[#f5f8fd]">
      <section className="relative overflow-hidden bg-navy py-24 text-white">
        <Image src="/images/premium-blue-bg.png" alt="" fill className="object-cover opacity-70" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-b from-navy/35 to-navy" />
        <div className="container-page relative z-10">
          <SectionHeading
            light
            eyebrow="Zápasy KK Hlohovec"
            title="Výsledky, program a detailné zápisnice"
            text="Pozrite si odohrané aj plánované zápasy tímov KK Hlohovec podľa súťaže a sezóny. Pri odohraných stretnutiach nájdete výsledok aj zápisnicu."
          />
        </div>
      </section>
      <LiveMatchesList />
    </main>
  );
}
