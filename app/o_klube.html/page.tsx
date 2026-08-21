import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  Check,
  CircleDot,
  Flag,
  HeartHandshake,
  Home,
  MapPin,
  Medal,
  Rocket,
  ShieldCheck,
  Target,
  Trophy,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "O klube | Kolkársky klub Hlohovec",
  description: "Spoznajte históriu, tímy a kolkáreň KK Hlohovec na Bernolákovej 720 v Hlohovci.",
  alternates: { canonical: "/o_klube.html" },
  openGraph: {
    title: "O klube | Kolkársky klub Hlohovec",
    description: "História, tímy a domáca kolkáreň KK Hlohovec.",
    url: "/o_klube.html"
  }
};

const statItems = [
  { value: "1949", label: "založenie klubu", icon: CalendarDays },
  { value: "5", label: "súťažných tímov", icon: Users },
  { value: "4", label: "kvalitné dráhy", icon: CircleDot },
  { value: "Hlohovec", label: "náš domov", icon: MapPin },
  { value: "Mládež", label: "naša budúcnosť", icon: HeartHandshake }
];

const clubHighlights = [
  { title: "Domáca kolkáreň so 4 dráhami", text: "Stále zázemie pre tréningy, zápasy aj klubové podujatia.", icon: Home },
  { title: "Tímy mužov, žien a mládeže", text: "Súťažné kategórie pre skúsených hráčov aj začínajúcich talentov.", icon: Users },
  { title: "Pravidelné tréningy", text: "Technika, presnosť, kondícia a pokojná práca na výkone.", icon: Target },
  { title: "Účasť v domácich súťažiach", text: "Klub reprezentuje Hlohovec v ligových zápasoch a turnajoch.", icon: Trophy },
  { title: "Silná komunita", text: "Rodiny, hráči, tréneri a fanúšikovia držia klub pokope.", icon: HeartHandshake },
  { title: "Fair play a rešpekt", text: "Športové hodnoty sú rovnako dôležité ako výsledky.", icon: ShieldCheck }
];

const comparisonRows = [
  ["9 kolkov", "Počet kolkov", "10 kolkov"],
  ["Guľa bez otvorov", "Guľa", "Guľa s otvormi"],
  ["Užšia dráha (1,70 m)", "Dráha", "Širšia dráha (2,23 m)"],
  ["120 hodov", "Pravidlá hry", "Rôzne herné varianty"],
  ["Európsky šport s tradíciou", "Charakter", "Americký šport"],
  ["Ligové zápasy a reprezentácia", "Súťaže", "Bowlingové ligy"]
];

const milestones = [
  { year: "1949", title: "Založenie klubu", text: "V Hlohovci vzniká kolkársky klub, ktorý odštartoval dlhú športovú tradíciu.", icon: Flag },
  { year: "1974", title: "Prvé ligové úspechy", text: "Klub sa postupne presadil v súťažiach a získal cenné skúsenosti.", icon: Medal },
  { year: "1988", title: "Krajská dominancia", text: "Naše tímy začali pravidelne bojovať o popredné priečky.", icon: Trophy },
  { year: "2004", title: "Modernizácia kolkárne", text: "Zázemie sa posunulo na vyššiu úroveň pre tréning aj zápasy.", icon: Building2 },
  { year: "2016", title: "Mládežnícky program", text: "Systematická práca s deťmi a dorastom sa stala dôležitou súčasťou klubu.", icon: Users },
  { year: "2024+", title: "Budujeme budúcnosť", text: "Rozvíjame talent, komunitu a dostupnosť kolkov pre Hlohovec.", icon: Rocket }
];

const numberStats = [
  { value: "75+", label: "rokov tradície", icon: ShieldCheck },
  { value: "30+", label: "hráčov", icon: Users },
  { value: "50+", label: "medailí", icon: Medal },
  { value: "5", label: "súťažných tímov", icon: Trophy },
  { value: "1000+", label: "odohraných zápasov", icon: CalendarDays },
  { value: "20+", label: "organizovaných turnajov", icon: Target }
];

export default function AchievementsPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f7fbff_0%,#eef5ff_42%,#dcecff_100%)] text-[#071a33]">
      <HeroSection />
      <StorySection />
      <ComparisonSection />
      <TimelineSection />
      <NumbersSection />
      <ArenaSection />
      <QuoteAndCtaSection />
    </main>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(135deg,#031225_0%,#061b35_48%,#09244a_100%)] pt-[106px] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_28%,rgba(22,136,255,.20),transparent_34%),radial-gradient(circle_at_78%_18%,rgba(22,136,255,.14),transparent_30%),linear-gradient(115deg,transparent_0_46%,rgba(22,136,255,.08)_47%,transparent_57%_100%)]" />
      <div className="absolute inset-x-[-12%] bottom-[-42%] h-[420px] rounded-[50%] bg-[#1688ff]/10 blur-3xl" />
      <div className="absolute right-10 top-24 hidden text-[11rem] font-black leading-none text-white/[0.025] lg:block">KKHC</div>
      <div className="container-page relative z-10 py-12 md:py-16">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_.95fr]">
        <div><div className="text-sm text-white/62">
          <Link href="/" className="hover:text-white">Domov</Link>
          <span className="mx-2">/</span>
          <span>O klube</span>
        </div>
        <p className="mt-8 text-xs font-black uppercase tracking-[0.2em] text-[#1688ff]">Tradícia od roku 1949</p>
        <h1 className="mt-3 max-w-3xl font-display text-5xl font-black leading-[.96] tracking-tight md:text-7xl">
          Spoznaj<br /><span className="text-[#1688ff]">KK Hlohovec.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-[#c5d4ea]">
          Kolkársky klub Hlohovec má tradíciu od roku 1949. Trénujeme, hráme ligové zápasy a reprezentujeme Hlohovec na turnajoch.
        </p>
        <div className="mt-8 flex flex-wrap gap-3"><Button href="/registracia">Pridaj sa ku klubu <ArrowRight size={16} /></Button><Button href="/kontakt" variant="secondary">Navštív kolkáreň</Button></div>
        </div>
        <div className="relative min-h-[330px] overflow-hidden rounded-[28px] border border-white/10 shadow-[0_30px_90px_rgba(0,0,0,.38)] md:min-h-[440px]">
          <Image src="/images/hero-action.jpg" alt="Hráč KK Hlohovec pri hode na kolkárskej dráhe" fill priority className="object-cover object-center" sizes="(min-width: 1024px) 46vw, 100vw" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(3,18,37,.88)_100%)]" />
          <div className="absolute bottom-0 left-0 right-0 p-6"><p className="text-xs font-black uppercase tracking-[.18em] text-[#69adff]">Presnosť · Tím · Tradícia</p><p className="mt-2 text-2xl font-black">Kolky v Hlohovci</p></div>
        </div></div>
        <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {statItems.map((item) => (
            <div key={item.label} className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4">
              <item.icon className="h-6 w-6 shrink-0 text-[#1688ff]" strokeWidth={1.8} />
              <div>
                <p className="font-black">{item.value}</p>
                <p className="text-xs text-[#a9bad3]">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StorySection() {
  return (
    <SectionSurface className="mt-6">
      <div className="grid gap-8 lg:grid-cols-[1.05fr_.95fr]">
        <div>
          <p className="section-eyebrow">Kto sme</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">Kolkársky klub s tradíciou od roku 1949</h2>
          <p className="mt-5 max-w-3xl text-base leading-8 text-[#405b78]">
            KK Hlohovec je domácim klubom pre súťažných hráčov všetkých vekových kategórií. Reprezentujeme mesto Hlohovec v domácich ligách a turnajoch a vytvárame priestor pre hráčov, rodičov aj ľudí, ktorí chcú kolky prvýkrát vyskúšať.
          </p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {clubHighlights.map((item) => (
              <div key={item.title} className="flex gap-4">
                <item.icon className="mt-1 h-7 w-7 shrink-0 text-[#1688ff]" strokeWidth={1.7} />
                <div>
                  <h3 className="font-black text-[#071a33]">{item.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-[#46617f]">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-[1.15fr_.85fr]">
          <div className="relative min-h-[360px] overflow-hidden rounded-2xl">
            <Image src="/images/team-photo.jpg" alt="Tím KK Hlohovec" fill className="object-cover" sizes="(min-width: 1024px) 420px, 100vw" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#031225]/42 to-transparent" />
          </div>
          <div className="grid gap-4">
            <div className="relative min-h-[172px] overflow-hidden rounded-2xl">
              <Image src="/images/club-building.jpg" alt="Kolkáreň KK Hlohovec" fill className="object-cover" sizes="280px" />
              <div className="absolute inset-0 bg-[#031225]/15" />
            </div>
            <div className="relative min-h-[172px] overflow-hidden rounded-2xl">
              <Image src="/images/players-action.jpg" alt="Hráči KK Hlohovec" fill className="object-cover" sizes="280px" />
              <div className="absolute inset-0 bg-[#031225]/15" />
            </div>
          </div>
        </div>
      </div>
    </SectionSurface>
  );
}

function ComparisonSection() {
  return (
    <SectionSurface className="mt-6" tone="dark">
      <div className="text-center">
        <p className="section-eyebrow">Vedeli ste</p>
        <h2 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">Kolky nie sú bowling</h2>
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-[220px_1fr_220px] lg:items-center">
        <SportVisual title="Kolky" image="/images/hero-ball.png" primary />
        <div>
          <div className="grid grid-cols-[1fr_150px_1fr] text-sm max-md:grid-cols-[1fr]">
            {comparisonRows.map(([kolky, label, bowling]) => (
              <div key={label} className="contents max-md:block">
                <div className="flex items-center gap-2 border-t border-white/[0.07] py-3 font-bold text-white">
                  <Check className="h-4 w-4 shrink-0 text-[#1688ff]" />
                  {kolky}
                </div>
                <div className="border-t border-white/[0.07] py-3 text-center text-xs font-black uppercase text-white/72 max-md:text-left">{label}</div>
                <div className="border-t border-white/[0.07] py-3 text-right text-white/72 max-md:text-left">{bowling}</div>
              </div>
            ))}
          </div>
          <p className="mx-auto mt-6 max-w-2xl text-center text-sm leading-7 text-[#a9bad3]">
            Hoci si ich mnohí mýlia, kolky a bowling sú dva odlišné športy. Kolky stoja viac na presnosti, technike, pravidelnosti a európskej športovej tradícii.
          </p>
        </div>
        <SportVisual title="Bowling" image="/images/bowling-ball-photo.png" />
      </div>
    </SectionSurface>
  );
}

function TimelineSection() {
  return (
    <SectionSurface className="mt-6" tone="dark">
      <p className="section-eyebrow">Naša história</p>
      <h2 className="mt-2 text-3xl font-black tracking-tight">Dôležité míľniky klubu</h2>
      <div className="relative mt-10 grid gap-6 md:grid-cols-3 xl:grid-cols-6">
        <div className="absolute left-0 right-0 top-10 hidden h-px bg-[#1688ff]/48 xl:block" />
        {milestones.map((item) => (
          <article key={item.year} className="relative rounded-2xl bg-[linear-gradient(180deg,rgba(10,35,70,.48),rgba(7,26,51,.24))] p-5 shadow-[0_14px_42px_rgba(0,0,0,.16),inset_0_1px_0_rgba(255,255,255,.035)]">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#1688ff]/12 text-[#1688ff]">
              <item.icon size={25} strokeWidth={1.7} />
            </div>
            <p className="mt-4 font-display text-2xl font-black text-[#1688ff]">{item.year}</p>
            <h3 className="mt-2 font-black">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-[#9fb0c8]">{item.text}</p>
          </article>
        ))}
      </div>
    </SectionSurface>
  );
}

function NumbersSection() {
  return (
    <SectionSurface className="mt-6">
      <p className="section-eyebrow">Naše úspechy v číslach</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {numberStats.map((item) => (
          <div key={item.label} className="rounded-2xl bg-white/78 p-5 shadow-[0_16px_45px_rgba(7,26,51,.09),inset_0_1px_0_rgba(255,255,255,.75)] ring-1 ring-[#b9d7ff]/55">
            <item.icon className="h-8 w-8 text-[#1688ff]" strokeWidth={1.7} />
            <p className="mt-4 font-display text-3xl font-black">{item.value}</p>
            <p className="mt-1 text-sm leading-5 text-[#46617f]">{item.label}</p>
          </div>
        ))}
      </div>
    </SectionSurface>
  );
}

function ArenaSection() {
  return (
    <SectionSurface className="mt-6">
      <div className="grid gap-8 lg:grid-cols-[.9fr_1.1fr_.55fr]">
        <div>
          <p className="section-eyebrow">Naša kolkáreň</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">Domov na 4 dráhach</h2>
          <p className="mt-4 text-sm leading-7 text-[#405b78]">
            Klubové zázemie v Hlohovci ponúka štyri kvalitné kolkárske dráhy, tréningové priestory a prostredie pre ligové zápasy, turnaje aj prvý kontakt s týmto športom.
          </p>
          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            {[
              ["4 dráhy", "kvalitné kolkárske dráhy"],
              ["Tréningy", "pre všetky kategórie"],
              ["Zápasy", "domáce ligové kolá"],
              ["Lokalita", "Bernolákova 720, Hlohovec"]
            ].map(([title, text]) => (
              <div key={title} className="flex gap-3">
                <CircleDot className="mt-1 h-6 w-6 shrink-0 text-[#1688ff]" />
                <div>
                  <p className="font-black">{title}</p>
                  <p className="text-sm text-[#46617f]">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative min-h-[280px] overflow-hidden rounded-2xl">
          <Image src="/images/hero-lane.jpg" alt="4-dráhová kolkáreň KK Hlohovec" fill className="object-cover" sizes="(min-width: 1024px) 560px, 100vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#031225]/42 to-transparent" />
        </div>
        <div className="rounded-2xl bg-white/78 p-5 shadow-[0_16px_45px_rgba(7,26,51,.09),inset_0_1px_0_rgba(255,255,255,.75)] ring-1 ring-[#b9d7ff]/55">
          <div className="grid h-40 place-items-center rounded-xl bg-[radial-gradient(circle_at_50%_50%,rgba(22,136,255,.28),transparent_52%),linear-gradient(135deg,#092044,#051428)]">
            <MapPin className="h-12 w-12 text-[#1688ff]" />
          </div>
          <p className="mt-5 font-black">Bernolákova 720</p>
          <p className="mt-1 text-sm text-[#46617f]">Hlohovec</p>
          <Button href="/kontakt" className="mt-5 w-full">Zobraziť na mape</Button>
        </div>
      </div>
    </SectionSurface>
  );
}

function QuoteAndCtaSection() {
  return (
    <section className="container-page pb-16 pt-6">
      <div className="rounded-[26px] bg-[linear-gradient(120deg,#0d3159_0%,#071a33_68%)] p-7 text-white shadow-[0_24px_70px_rgba(7,26,51,.18),inset_0_1px_0_rgba(255,255,255,.05)] ring-1 ring-white/[0.07] md:p-9">
        <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[.18em] text-[#64adff]">Tréning kolkov v Hlohovci</p>
            <h2 className="mt-3 text-3xl font-black text-white">Príď si kolky nezáväzne vyskúšať</h2>
            <p className="mt-3 leading-7 text-[#bfd0e5]">Spoznaj hráčov KK Hlohovec, našu kolkáreň a spôsob, ako u nás prebiehajú tréningy. Prvý tréning je nezáväzný.</p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <Button href="/cennik">Staň sa členom <ArrowRight size={16} /></Button>
            <Button href="/kontakt" variant="secondary">Kontaktuj nás</Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionSurface({ children, className = "", tone = "light" }: { children: React.ReactNode; className: string; tone: "light" | "dark" }) {
  const dark = tone === "dark";
  return (
    <section className={`relative overflow-hidden py-10 ${dark ? "text-white" : "text-[#071a33]"} ${className}`}>
      <div className={`pointer-events-none absolute inset-0 ${dark ? "bg-[linear-gradient(135deg,#061a33_0%,#08244a_50%,#041225_100%)]" : "bg-[radial-gradient(circle_at_18%_20%,rgba(22,136,255,.10),transparent_34%),radial-gradient(circle_at_86%_18%,rgba(22,136,255,.08),transparent_30%)]"}`} />
      <div className="container-page relative z-10">
        <div className={dark ? "rounded-3xl bg-white/[0.035] p-5 shadow-[0_24px_80px_rgba(0,0,0,.20),inset_0_1px_0_rgba(255,255,255,.04)] ring-1 ring-white/[0.06] md:p-7" : "rounded-3xl bg-white/72 p-5 shadow-[0_24px_80px_rgba(7,26,51,.08),inset_0_1px_0_rgba(255,255,255,.75)] ring-1 ring-[#b9d7ff]/55 backdrop-blur md:p-7"}>
          {children}
        </div>
      </div>
    </section>
  );
}

function SportVisual({ title, image, primary = false }: { title: string; image: string; primary: boolean }) {
  return (
    <div className="text-center">
      <p className={`text-xs font-black uppercase tracking-[0.14em] ${primary ? "text-[#1688ff]" : "text-[#46617f]"}`}>{title}</p>
      <div className="relative mx-auto mt-4 h-48 w-full max-w-[240px] overflow-hidden rounded-2xl bg-[#e8f2ff] shadow-[0_18px_50px_rgba(7,26,51,.18)] ring-1 ring-[#b9d7ff]/60">
        <Image src={image} alt={title} fill className="object-cover" sizes="220px" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#031225]/48 to-transparent" />
      </div>
    </div>
  );
}
