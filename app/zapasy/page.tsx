import Image from "next/image";
import { SectionHeading } from "@/components/section-heading";
import { LiveMatchesList } from "@/components/live-matches-list";

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
            text="Admin môže zápasy pridať ručne alebo importovať z vysledky.kolky.sk. Zmeny sa zobrazia okamžite."
          />
        </div>
      </section>
      <LiveMatchesList />
    </main>
  );
}
