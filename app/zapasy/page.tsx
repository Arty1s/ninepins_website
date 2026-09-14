import type { Metadata } from "next";
import { LiveMatchesList } from "@/components/live-matches-list";

export const metadata: Metadata = {
  title: "Zápasy a výsledky KK Hlohovec",
  description: "Program, výsledky a zápisnice zo zápasov tímov KK Hlohovec podľa súťaží a sezón.",
  alternates: { canonical: "/zapasy" },
  openGraph: { title: "Zápasy a výsledky KK Hlohovec", description: "Výsledky, program a zápisnice tímov KK Hlohovec.", url: "/zapasy" }
};

export default function ZapasyPage() {
  return (
    <main className="bg-[#06182f]">
      <section className="relative overflow-hidden border-b border-white/[0.06] bg-[#071a33] py-10 text-white sm:py-12">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#071a33_0%,rgba(7,26,51,.9)_47%,rgba(7,26,51,.28)_100%),url('/images/hero-lane.jpg')] bg-cover bg-right" />
        <div className="container-page relative z-10">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#67aff8]">Domov&nbsp;&nbsp;/&nbsp;&nbsp; Zápasy</p>
          <h1 className="sport-title mt-2 text-3xl text-white sm:text-4xl">Výsledky a program</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#b9c7db]">Všetky zápasy KK Hlohovec na jednom mieste. Sledujte výsledky, nadchádzajúce stretnutia a detailné zápisnice tímov.</p>
        </div>
      </section>
      <LiveMatchesList />
    </main>
  );
}
