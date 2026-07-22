import Image from "next/image";
import Link from "next/link";
import type { ElementType, ReactNode } from "react";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Newspaper,
  Target,
  Trophy,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Team } from "@/lib/landing-data";

type FeatureWidget = {
  title: string;
  text: string;
  icon: ElementType;
};

type NewsWidget = {
  title: string;
  date: string;
  text: string;
  image: string;
};

type TournamentWidget = {
  day: string;
  month: string;
  title: string;
  location: string;
  time: string;
};

type RecentMatchWidget = {
  league: string;
  date: string;
  home: Team;
  away: Team;
  score: string;
  homePins: number;
  awayPins: number;
  href: string;
};

export const heroFeatureWidgets: FeatureWidget[] = [
  {
    title: "Tradícia od roku 1970",
    text: "Viac ako 50 rokov kolkárskej histórie v Hlohovci.",
    icon: Trophy
  },
  {
    title: "Komunita & priateľstvá",
    text: "Sme jeden veľký tím, kde má každý svoje miesto.",
    icon: Users
  },
  {
    title: "Rozvoj & tréningy",
    text: "Podporujeme talent, zlepšujeme sa a posúvame hranice.",
    icon: Target
  },
  {
    title: "Súťaže & turnaje",
    text: "Domáce ligy aj medzinárodné podujatia počas celého roka.",
    icon: CalendarDays
  }
];

const newsWidgets: NewsWidget[] = [
  {
    title: "Víťazstvo doma!",
    date: "12. máj 2024",
    text: "Naši muži vyhrali posledné kolo ligy a posúvajú sa na prvé miesto.",
    image: "/images/gallery-2.jpg"
  },
  {
    title: "Mládež na turnaji v Trnave",
    date: "8. máj 2024",
    text: "Naši mladí ukázali bojovnosť a odniesli si skvelé výsledky.",
    image: "/images/team-photo.jpg"
  }
];

const tournamentWidgets: TournamentWidget[] = [
  { day: "25", month: "MÁJ", title: "2. liga západ - 18. kolo", location: "KK Hlohovec - ŠKK Trnava", time: "10:00" },
  { day: "01", month: "JÚN", title: "Majstrovstvá Slovenska dorast", location: "Podbrezová", time: "09:00" },
  { day: "15", month: "JÚN", title: "Hlohovec Cup 2024", location: "Medzinárodný turnaj", time: "09:30" }
];

const recentMatchWidgets: RecentMatchWidget[] = [
  {
    league: "1. KL 2023/2024 - 18. KOLO",
    date: "11.05.2024",
    home: { name: "KK Hlohovec", shortName: "KKH", badgeClass: "from-[#071a3d] to-[#0d2d67]" },
    away: { name: "TJ Rakovice", shortName: "TJR", badgeClass: "from-[#d51f31] to-[#7b111f]" },
    score: "6 : 2",
    homePins: 3372,
    awayPins: 3291,
    href: "/matches/kk-hlohovec-vs-tj-rakovice"
  },
  {
    league: "1. KL 2023/2024 - 17. KOLO",
    date: "04.05.2024",
    home: { name: "KK Hlohovec", shortName: "KKH", badgeClass: "from-[#071a3d] to-[#0d2d67]" },
    away: { name: "KK Trstená", shortName: "RCT", badgeClass: "from-[#1f2937] to-[#020617]" },
    score: "7 : 1",
    homePins: 3398,
    awayPins: 3230,
    href: "/matches/kk-hlohovec-vs-kk-trstena"
  },
  {
    league: "1. KL 2023/2024 - 16. KOLO",
    date: "27.04.2024",
    home: { name: "KK Hlohovec", shortName: "KKH", badgeClass: "from-[#071a3d] to-[#0d2d67]" },
    away: { name: "KK Inter Bratislava", shortName: "INTER", badgeClass: "from-[#0f172a] to-[#334155]" },
    score: "5 : 3",
    homePins: 3301,
    awayPins: 3250,
    href: "/matches/kk-hlohovec-vs-kk-inter-bratislava"
  }
];

export const homeWidgetRegistry = {
  hero: HeroWidget,
  introCards: IntroCardsWidget,
  lowerClubSection: LowerClubSectionWidget
};

export function HeroWidget() {
  return (
    <section className="relative bg-[#030b1b] pt-24 text-white">
      <div className="absolute inset-0 overflow-hidden">
        <Image src="/images/hero-ball.png" alt="Kolkárska guľa na dráhe KK Hlohovec" fill priority className="object-contain object-right opacity-95" sizes="100vw" />
        <div className="absolute inset-0 bg-[linear-gradient(105deg,#030b1b_0%,rgba(3,11,27,.96)_32%,rgba(3,11,27,.5)_54%,rgba(3,11,27,.16)_78%,#030b1b_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_45%,rgba(8,120,255,.24),transparent_28%)]" />
      </div>

      <div className="container-page relative z-10 grid min-h-[560px] items-center gap-10 pb-20 pt-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="max-w-[650px]">
          <Image src="/kkhc-logo.png" alt="Logo KKHC" width={145} height={96} className="kkhc-logo-cutout mb-8 h-20 w-auto object-contain" />
          <p className="text-sm font-black uppercase tracking-[0.22em] text-[#1e7dff]">Kolkársky klub Hlohovec</p>
          <h1 className="mt-3 font-display text-[4rem] font-black leading-[0.95] tracking-tight text-white sm:text-[5.4rem] lg:text-[6.2rem]">
            Tradícia, ktorá
            <br />
            <span className="text-[#164fff]">posúva vpred.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-white/82">
            KK Hlohovec spája generácie hráčov. U nás nájdeš priateľov, súťaže, tréningy a zážitky, ktoré zostanú.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Button href="/registracia">
              Staň sa členom <ArrowRight size={18} />
            </Button>
            <Button href="/achievements" variant="secondary">
              Spoznaj klub <ArrowRight size={18} />
            </Button>
          </div>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex -space-x-2">
              {["MN", "LH", "PK", "TB"].map((avatar) => (
                <span key={avatar} className="grid h-10 w-10 place-items-center rounded-full border-2 border-[#07182f] bg-[#153f8f] text-xs font-black text-white">
                  {avatar}
                </span>
              ))}
            </div>
            <p className="max-w-xs text-sm leading-6 text-white/78">
              Pridaj sa k viac než 100 aktívnym hráčom a buď súčasťou našej kolkárskej rodiny.
            </p>
          </div>
        </div>
        <div className="hidden lg:block" aria-hidden="true" />
      </div>

      <div className="container-page relative z-20 -mb-12">
        <WidgetShell className="grid overflow-hidden border-[#355d9f]/55 bg-[#06142a]/95 p-0 shadow-[0_22px_60px_rgba(0,0,0,.35)] lg:grid-cols-4">
          {heroFeatureWidgets.map((feature, index) => (
            <FeaturePillWidget key={feature.title} feature={feature} last={index === heroFeatureWidgets.length - 1} />
          ))}
        </WidgetShell>
      </div>
    </section>
  );
}

export function IntroCardsWidget() {
  return (
    <section className="relative isolate -mt-px overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#f6faff_38%,#eef5ff_72%,#dcecff_100%)] pb-32 pt-24 text-[#071a3d]">
      <Image
        src="/images/premium-white-bg.png"
        alt=""
        fill
        className="pointer-events-none absolute inset-0 -z-10 object-cover object-center opacity-70"
        sizes="100vw"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_8%,rgba(255,255,255,.88),rgba(255,255,255,0)_48%),radial-gradient(ellipse_at_14%_28%,rgba(80,145,255,.13),rgba(80,145,255,0)_46%),radial-gradient(ellipse_at_88%_24%,rgba(164,205,255,.22),rgba(164,205,255,0)_44%),radial-gradient(ellipse_at_52%_72%,rgba(60,132,238,.09),rgba(60,132,238,0)_52%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-[-16%] top-[-18%] -z-10 h-[440px] animate-[club-lines-drift_18s_ease-in-out_infinite] rounded-[50%] bg-[linear-gradient(112deg,transparent_0_22%,rgba(255,255,255,.72)_32%,rgba(94,158,255,.20)_46%,transparent_62%_100%),linear-gradient(108deg,transparent_0_32%,rgba(17,75,255,.08)_42%,rgba(255,255,255,.46)_52%,transparent_68%_100%)] blur-[1px] opacity-75"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -left-[18%] top-8 -z-10 h-[540px] w-[680px] animate-[rink-sweep_12s_ease-in-out_infinite] rounded-[50%] border border-[#6ba8ff]/18 opacity-70 [mask-image:linear-gradient(135deg,#000,transparent_68%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -left-[22%] top-20 -z-10 h-[610px] w-[780px] animate-[club-wave-breathe_16s_ease-in-out_infinite] rounded-[50%] border border-white/70 opacity-80 [mask-image:linear-gradient(135deg,#000,transparent_70%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-50 [mask-image:linear-gradient(180deg,transparent_0%,#000_18%,#000_78%,transparent_100%)] bg-[repeating-linear-gradient(106deg,transparent_0_86px,rgba(23,87,171,.032)_88px,transparent_92px)]"
        aria-hidden="true"
      />
      <div
        className="premium-bg-grain pointer-events-none absolute inset-0 -z-10 opacity-[.16] mix-blend-soft-light"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-[-10%] bottom-0 z-0 h-[220px] animate-[club-wave-breathe_16s_ease-in-out_infinite] bg-[radial-gradient(ellipse_at_50%_24%,rgba(73,150,255,.18),rgba(73,150,255,0)_52%),linear-gradient(180deg,rgba(220,236,255,0)_0%,rgba(185,214,249,.40)_42%,rgba(7,26,51,.18)_72%,rgba(7,26,51,.92)_100%)] [clip-path:polygon(0_68%,14%_63%,31%_59%,48%_58%,66%_61%,84%_66%,100%_72%,100%_100%,0_100%)]"
        aria-hidden="true"
      />
      <div className="container-page relative z-10 mx-auto max-w-4xl text-center">
        <span className="inline-flex rounded-full bg-[#e9f2ff] px-4 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-[#114bff] ring-1 ring-[#cfe1ff]">
          KK Hlohovec
        </span>
        <h2 className="mt-5 text-4xl font-black tracking-tight text-[#061b35] sm:text-5xl">
          Aj kolky sú šport!
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#4b5d76]">
          Oficiálna stránka klubu, výsledky, tímy a turnaje na jednom mieste. Pre hráčov, rodičov, fanúšikov aj nových členov.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Button href="/zapasy">
            Pozri zápasy <ArrowRight size={16} />
          </Button>
          <Button
            href="/achievements"
            variant="secondary"
            className="border-[#9ac9ff] bg-[#dcecff] text-[#0757d8] shadow-[0_12px_28px_rgba(17,75,255,.12)] hover:border-[#1683ff] hover:bg-[#cfe6ff] hover:text-[#063fa8]"
          >
            O klube <ArrowRight size={16} />
          </Button>
        </div>
      </div>

      <div className="container-page relative z-10 mt-12 grid gap-4 lg:grid-cols-3">
        <NewsCardWidget />
        <TournamentCardWidget />
        <JoinCardWidget />
      </div>
    </section>
  );
}

export function LowerClubSectionWidget() {
  return (
    <section className="relative z-10 -mt-16 overflow-hidden bg-[#071a33] text-white">
      <Image
        src="/images/premium-blue-bg.png"
        alt=""
        fill
        className="pointer-events-none absolute inset-0 object-cover object-center opacity-95"
        sizes="100vw"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(7,26,51,.18)_0%,rgba(7,26,51,.38)_48%,rgba(7,26,51,.78)_100%)]"
        aria-hidden="true"
      />
      <div
        className="premium-bg-grain pointer-events-none absolute inset-0 opacity-[.09] mix-blend-soft-light"
        aria-hidden="true"
      />
      <RecentMatchesWidget />
      <MembershipCtaWidget />
    </section>
  );
}

export function RecentMatchesWidget() {
  return (
    <section className="relative z-10 pb-10 pt-16 text-white">
      <div className="container-page relative z-10">
        <DarkPanel title="Nedávne zápasy" action="Zobraziť všetky" href="/zapasy">
          <div className="grid gap-4 lg:grid-cols-3">
            {recentMatchWidgets.map((match) => (
              <MatchResultWidget key={`${match.date}-${match.away.name}`} match={match} />
            ))}
          </div>
        </DarkPanel>
      </div>
    </section>
  );
}

export function MembershipCtaWidget() {
  return (
    <section className="relative pb-16 text-white">
      <div className="container-page relative z-10">
        <WidgetShell className="relative overflow-hidden border-white/[0.06] bg-[linear-gradient(135deg,rgba(8,31,62,.96),rgba(5,18,39,.98))] p-0 shadow-[0_28px_90px_rgba(0,0,0,.32),inset_0_1px_0_rgba(255,255,255,.05)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(22,136,255,.20),transparent_32%),radial-gradient(circle_at_78%_12%,rgba(22,136,255,.12),transparent_30%)]" />
          <div className="absolute inset-y-0 right-0 hidden w-[44%] lg:block">
            <Image src="/images/hero-lane.jpg" alt="Kolkáreň KK Hlohovec" fill className="object-cover" sizes="44vw" />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,#061b35_0%,rgba(6,27,53,.72)_26%,rgba(6,27,53,.24)_58%,rgba(6,27,53,.04)_100%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,27,53,.1),rgba(6,27,53,.48))]" />
          </div>
          <div className="relative z-10 grid gap-8 p-8 md:p-10 lg:grid-cols-[1.05fr_.95fr] lg:p-14">
            <div className="max-w-3xl">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1688ff]">Pridaj sa k nám</p>
              <h2 className="mt-4 font-display text-4xl font-black uppercase leading-tight sm:text-5xl">
                Staň sa súčasťou
                <span className="block text-[#1688ff]">KK Hlohovec</span>
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-[#b9c7db]">
                Či už si skúsený hráč alebo začiatočník, u nás nájdeš skvelú partiu, tréningy a možnosť rásť.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Button href="/cennik">Členstvo a cenník</Button>
                <Button href="/kontakt" variant="secondary">Kontaktuj nás</Button>
                <Button href="/achievements" variant="secondary" className="border-[#1688ff]/70 bg-[#06172f]/80 text-[#9dccff] hover:border-[#1688ff] hover:bg-[#0a2448] hover:text-white">
                  Kolky nie sú bowling <ArrowRight size={16} />
                </Button>
              </div>
              <div className="mt-8 grid gap-5 md:grid-cols-3">
                {[
                  { title: "Skvelá komunita", text: "Partia, priateľstvá a spoločné zážitky.", icon: Users },
                  { title: "Tréningy pre každého", text: "Od začiatočníkov po pokročilých hráčov.", icon: Target },
                  { title: "Súťaže & turnaje", text: "Domáce ligy aj medzinárodné podujatia.", icon: Trophy }
                ].map((item) => (
                  <div key={item.title} className="flex gap-3">
                    <item.icon className="mt-1 h-8 w-8 shrink-0 text-[#1688ff]" strokeWidth={1.8} />
                    <div>
                      <h3 className="text-sm font-black text-[#2f9bff]">{item.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-[#b9c7db]">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative lg:pr-[22%]">
              <div className="rounded-2xl border border-white/[0.08] bg-[linear-gradient(180deg,rgba(10,29,58,.92),rgba(8,23,46,.9))] p-6 shadow-[0_20px_60px_rgba(0,0,0,.28),inset_0_1px_0_rgba(255,255,255,.05)] backdrop-blur">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#1688ff]">Vedeli ste?</p>
                <h3 className="mt-3 font-display text-2xl font-black uppercase">Kolky ≠ Bowling</h3>
                <div className="mt-6 grid grid-cols-[1fr_auto_1fr] gap-3 text-sm">
                  <div className="text-center text-xs font-black uppercase tracking-[0.12em] text-[#1688ff]">Kolky</div>
                  <div />
                  <div className="text-center text-xs font-black uppercase tracking-[0.12em] text-white/72">Bowling</div>
                  {[
                    ["9 kolkov", "VS.", "10 kolkov"],
                    ["Guľa bez otvorov", "VS.", "Guľa s otvormi"],
                    ["Užšia dráha", "VS.", "Širšia dráha"],
                    ["Európska tradícia", "VS.", "Moderný globálny šport"]
                  ].map(([kolky, vs, bowling]) => (
                    <div key={kolky} className="contents">
                      <div className="border-t border-white/[0.07] py-3 font-bold text-white">{kolky}</div>
                      <div className="grid place-items-center border-t border-white/[0.07] py-3 text-[11px] font-black text-[#8bbfff]">{vs}</div>
                      <div className="border-t border-white/[0.07] py-3 text-right font-bold text-white/70">{bowling}</div>
                    </div>
                  ))}
                </div>
                <Link href="/achievements" className="mt-5 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.1em] text-[#1688ff] transition hover:text-white">
                  Zisti rozdiely <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </div>
        </WidgetShell>
      </div>
    </section>
  );
}

function WidgetShell({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border shadow-[0_14px_45px_rgba(15,35,70,.12)] ${className}`}>{children}</div>;
}

function FeaturePillWidget({ feature, last }: { feature: FeatureWidget; last: boolean }) {
  const Icon = feature.icon;

  return (
    <div className={`flex min-h-[108px] items-center gap-5 px-7 py-5 ${last ? "" : "border-b border-[#15395f]/70 lg:border-b-0 lg:border-r"}`}>
      <div className="grid h-16 w-16 shrink-0 place-items-center rounded-xl text-[#1e7dff]">
        <Icon size={46} strokeWidth={1.7} />
      </div>
      <div>
        <h3 className="text-base font-black text-white">{feature.title}</h3>
        <p className="mt-2 text-xs leading-5 text-white/72">{feature.text}</p>
      </div>
    </div>
  );
}

function NewsCardWidget() {
  return (
    <LightWidget title="Aktuality" icon={Newspaper}>
      <div className="space-y-5">
        {newsWidgets.map((item) => (
          <article key={item.title} className="grid grid-cols-[128px_1fr] gap-5">
            <div className="relative h-28 overflow-hidden rounded-md">
              <Image src={item.image} alt={item.title} fill className="object-cover" sizes="128px" />
            </div>
            <div>
              <p className="text-xs font-medium text-[#64748b]">{item.date}</p>
              <h3 className="mt-1 text-lg font-black text-[#071a3d]">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#334155]">{item.text}</p>
              <Link href="/gallery" className="mt-3 inline-flex items-center gap-2 text-xs font-black uppercase text-[#114bff]">
                Čítať viac <ArrowRight size={14} />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </LightWidget>
  );
}

function TournamentCardWidget() {
  return (
    <LightWidget title="Najbližšie turnaje" action="Zobraziť kalendár" href="/turnaje" icon={CalendarDays}>
      <div className="space-y-3">
        {tournamentWidgets.map((item) => (
          <Link key={`${item.day}-${item.title}`} href="/turnaje" className="grid grid-cols-[64px_1fr_auto] items-center gap-4 rounded-lg border border-[#dbe4f2] bg-white px-3 py-3 transition hover:border-[#114bff]/40 hover:shadow-sm">
            <div className="grid h-16 place-items-center rounded bg-[#164fff] text-center text-white">
              <div>
                <strong className="block font-display text-3xl leading-none">{item.day}</strong>
                <span className="text-[11px] font-black">{item.month}</span>
              </div>
            </div>
            <div>
              <h3 className="font-black text-[#071a3d]">{item.title}</h3>
              <p className="mt-1 text-sm text-[#64748b]">{item.location}</p>
            </div>
            <span className="inline-flex items-center gap-2 text-sm text-[#071a3d]">
              <Clock3 size={16} /> {item.time}
            </span>
          </Link>
        ))}
      </div>
      <Link href="/turnaje" className="mt-5 flex justify-center gap-2 text-xs font-black uppercase text-[#114bff]">
        Zobraziť všetky turnaje <ArrowRight size={14} />
      </Link>
    </LightWidget>
  );
}

function JoinCardWidget() {
  return (
    <LightWidget title="Pridaj sa k nám" icon={Users}>
      <div className="grid gap-6 sm:grid-cols-[1fr_160px]">
        <div>
          <h3 className="text-2xl font-black text-[#071a3d]">Kolky sú pre každého</h3>
          <p className="mt-3 text-sm leading-6 text-[#334155]">
            Hľadáme nových hráčov. Príď si vyskúšať tréning, spoznať partiu a zažiť atmosféru, ktorá ťa chytí.
          </p>
          <ul className="mt-5 space-y-3 text-sm text-[#334155]">
            {["Tréningy pre všetky vekové kategórie", "Skvelá partia a podpora", "Možnosť reprezentovať klub"].map((item) => (
              <li key={item} className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#114bff]" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="hidden place-items-center text-[#114bff] sm:grid">
          <Trophy size={118} strokeWidth={1.1} />
        </div>
      </div>
      <Button href="/registracia" className="mt-6">
        Chcem sa pridať <ArrowRight size={16} />
      </Button>
    </LightWidget>
  );
}

function LightWidget({
  title,
  icon: Icon,
  action,
  href,
  children
}: {
  title: string;
  icon: ElementType;
  action?: string;
  href?: string;
  children: ReactNode;
}) {
  return (
    <WidgetShell className="border-[#c8d9f2] bg-white p-6 text-[#071a3d] shadow-[0_22px_60px_rgba(4,19,54,.16)]">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.12em] text-[#114bff]">{title}</p>
          <div className="mt-2 h-[2px] w-10 bg-[#114bff]" />
        </div>
        {action && href ? (
          <Link href={href} className="inline-flex items-center gap-2 text-[11px] font-black uppercase text-[#114bff]">
            {action} <ArrowRight size={13} />
          </Link>
        ) : (
          <Icon className="text-[#114bff]" size={20} />
        )}
      </div>
      {children}
    </WidgetShell>
  );
}

function DarkPanel({ title, action, href, children }: { title: string; action: string; href: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-[#1b5790]/70 bg-[#061d3a]/82 p-5 shadow-[0_24px_80px_rgba(0,0,0,.28),inset_0_1px_0_rgba(255,255,255,.045)] backdrop-blur-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-black uppercase tracking-[0.04em] text-white">{title}</h2>
        <Link href={href} className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.04em] text-[#58a3ff]">
          {action} <ArrowRight size={14} />
        </Link>
      </div>
      {children}
    </div>
  );
}

function MatchResultWidget({ match }: { match: RecentMatchWidget }) {
  return (
    <article className="rounded-lg border border-[#1b5790]/70 bg-[linear-gradient(180deg,rgba(8,38,78,.92),rgba(6,28,58,.88))] px-4 pb-4 pt-3 shadow-[inset_0_1px_0_rgba(255,255,255,.055),0_14px_34px_rgba(0,0,0,.14)] transition duration-300 hover:-translate-y-0.5 hover:border-[#2c86d8]/75 hover:shadow-[inset_0_1px_0_rgba(255,255,255,.08),0_20px_42px_rgba(0,0,0,.2)]">
      <div className="flex items-center justify-between border-b border-[#183e67]/80 pb-3 text-[11px] uppercase text-[#9db4d2]">
        <span>{match.league}</span>
        <span>{match.date}</span>
      </div>
      <div className="mt-6 grid grid-cols-[1fr_110px_1fr] items-center gap-4 text-center">
        <TeamBadgeWidget team={match.home} pins={match.homePins} home />
        <strong className="font-display text-[2.65rem] font-black leading-none tracking-[0.08em] text-[#1688ff]">
          {match.score}
        </strong>
        <TeamBadgeWidget team={match.away} pins={match.awayPins} />
      </div>
      <Link href={match.href} className="mt-5 flex justify-center border-t border-[#183e67]/70 pt-3 text-[11px] font-black uppercase tracking-[0.08em] text-[#58a3ff]">
        Detail zápasu
      </Link>
    </article>
  );
}

function TeamBadgeWidget({ team, pins, home = false }: { team: Team; pins: number; home?: boolean }) {
  return (
    <div>
      {home ? (
        <span className="mx-auto grid h-[54px] w-[54px] place-items-center">
          <Image src="/kkhc-logo.png" alt="KK Hlohovec" width={54} height={54} className="kkhc-logo-cutout h-[48px] w-auto object-contain" />
        </span>
      ) : (
        <span className={`mx-auto grid h-[54px] w-[54px] place-items-center rounded-full bg-gradient-to-br ${team.badgeClass} ring-1 ring-white/15`}>
          <span className="px-1 text-[10px] font-black leading-none text-white">{team.shortName}</span>
        </span>
      )}
      <p className="mt-2 min-h-9 text-xs font-bold leading-tight text-white">{team.name}</p>
      <p className="font-display text-base font-black text-[#1688ff]">{pins}</p>
    </div>
  );
}
