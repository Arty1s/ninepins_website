import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function PlaceholderPage({ title, description }: { title: string; description: string }) {
  return (
    <main className="min-h-[70vh] bg-[#031326] pt-32 text-white">
      <section className="container-page py-16">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-[#58a3ff]">KK Hlohovec</p>
        <h1 className="mt-4 font-display text-5xl font-black uppercase leading-tight md:text-7xl">{title}</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-[#b9c7db]">{description}</p>
        <Link
          href="/"
          className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-[#1e7dff]/35 bg-[#0878ff] px-6 text-sm font-black uppercase text-white transition hover:-translate-y-0.5 hover:bg-[#1688ff]"
        >
          Späť na domov <ArrowRight size={17} />
        </Link>
      </section>
    </main>
  );
}
