import { CircleDot } from "lucide-react";
import { LiveTeamsList } from "@/components/live-teams-list";

export default function TeamsPage() {
  return (
    <main className="bg-[#f6f8fc] text-[#071a33]">
      <section className="relative isolate overflow-hidden pt-[82px] text-white">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,11,24,.92)_0%,rgba(5,18,42,.64)_44%,rgba(5,18,42,.18)_100%),url('/images/teams-hero-bg.png')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(40,137,255,.24),transparent_32%),linear-gradient(180deg,transparent_0%,rgba(2,11,24,.2)_100%)]" />
        <div className="container-page relative z-10 grid min-h-[330px] items-center py-16 md:min-h-[390px]">
          <div className="max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[0.32em] text-[#4aa2ff]">Súťažné kategórie</p>
            <h1 className="mt-5 font-display text-5xl font-black leading-none tracking-tight sm:text-6xl lg:text-7xl">
              Tímy KK Hlohovec
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#d8e7ff]">
              Prehľad družstiev, trénerov, kapitánov a úspechov. Admin vie meniť zostavy a verejnosť ich vidí hneď bez zásahu do kódu.
            </p>
            <div className="mt-9 flex items-center gap-5 text-[#4aa2ff]">
              <span className="h-px w-16 bg-[#4aa2ff]" />
              <CircleDot size={22} strokeWidth={1.8} />
              <span className="h-px w-16 bg-[#4aa2ff]" />
            </div>
          </div>
        </div>
      </section>
      <LiveTeamsList />
    </main>
  );
}
