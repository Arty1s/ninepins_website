import Image from "next/image";
import Link from "next/link";
import type { ElementType, ReactNode } from "react";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Target,
  Trophy,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LiveHomeRecentMatches } from "@/components/live-home-recent-matches";
import { LiveHomeUpcomingMatches } from "@/components/live-home-upcoming-matches";
import { type Team } from "@/lib/landing-data";

type FeatureWidget = {
  title: string;
  text: string;
  icon: ElementType;
};

export type RecentMatchWidget = {
  league: string;
  date: string;
  home: Team;
  away: Team;
  score: string;
  homePins: number | string;
  awayPins: number | string;
  href: string;
  homeIsClub: boolean;
  awayIsClub: boolean;
};

export const heroFeatureWidgets: FeatureWidget[] = [
  {
    title: "Kolkársky klub Hlohovec",
    text: "Klubová história a súťažné kolky v Hlohovci.",
    icon: Trophy
  },
  {
    title: "Hráči a klub",
    text: "Tímy, hráči, tréneri a ľudia okolo klubu.",
    icon: Users
  },
  {
    title: "Tréningy kolkov",
    text: "Pravidelná práca na technike, presnosti a výkone.",
    icon: Target
  },
  {
    title: "Súťaže & turnaje",
    text: "Ligové zápasy a turnaje KK Hlohovec.",
    icon: CalendarDays
  }
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
          <Image src="/kkhc-logo.png" alt="Logo Kolkárskeho klubu Hlohovec" width={145} height={96} className="kkhc-logo-cutout mb-8 h-20 w-auto object-contain" />
          <p className="text-sm font-black uppercase tracking-[0.22em] text-[#1e7dff]">Kolkársky klub Hlohovec</p>
          <h1 className="mt-3 font-display text-[4rem] font-black leading-[0.95] tracking-tight text-white sm:text-[5.4rem] lg:text-[6.2rem]">
            Hráme kolky.
            <br />
            <span className="text-[#164fff]">Hráme za Hlohovec.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-white/82">
            KK Hlohovec je kolkársky klub v Hlohovci pre súťažných hráčov, mládež aj ľudí, ktorí si chcú kolky vyskúšať.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Button href="/registracia">
              Pridaj sa na tréning <ArrowRight size={18} />
            </Button>
            <Button href="/o_klube.html" variant="secondary">
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
              Pridaj sa k viac než 100 aktívnym hráčom KK Hlohovec a začni pravidelne trénovať.
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
          Kolky v Hlohovci
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#4b5d76]">
          Na jednom mieste nájdeš tímy KK Hlohovec, výsledky zápasov, turnaje, galériu aj informácie o členstve.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Button href="/zapasy">
            Pozri zápasy <ArrowRight size={16} />
          </Button>
          <Button
            href="/o_klube.html"
            variant="secondary"
            className="border-[#9ac9ff] bg-[#dcecff] text-[#0757d8] shadow-[0_12px_28px_rgba(17,75,255,.12)] hover:border-[#1683ff] hover:bg-[#cfe6ff] hover:text-[#063fa8]"
          >
            O klube <ArrowRight size={16} />
          </Button>
        </div>
      </div>

      <div className="container-page relative z-10 mt-12 grid gap-4 lg:grid-cols-2">
        <LightWidget title="Najbližšie zápasy" icon={CalendarDays} action="Celý program" href="/zapasy">
          <LiveHomeUpcomingMatches light />
        </LightWidget>
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
    <section className="relative z-10 pb-8 pt-10 text-white sm:pb-10 sm:pt-16">
      <div className="container-page relative z-10">
        <div>
          <DarkPanel title="Nedávne zápasy" action="Zobraziť všetky" href="/zapasy">
            <LiveHomeRecentMatches fallbackMatches={recentMatchWidgets} />
          </DarkPanel>
        </div>
      </div>
    </section>
  );
}

export function MembershipCtaWidget() {
  return (
    <section className="relative pb-16 pt-4 text-white sm:pb-20">
      <div className="container-page relative z-10">
        <WidgetShell className="relative overflow-hidden border-[#2d6fa8]/35 bg-[#061a34] p-0 shadow-[0_28px_90px_rgba(0,0,0,.32)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(22,136,255,.18),transparent_32%)]" />
          <div className="relative grid lg:grid-cols-[1fr_.78fr_.72fr]">
            <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-12">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1688ff]">Tréningy v Hlohovci</p>
              <h2 className="mt-4 font-display text-4xl font-black leading-[1.02] sm:text-5xl">
                Príď si zahrať
                <span className="block text-[#1688ff]">kolky v Hlohovci.</span>
              </h2>
              <p className="mt-5 max-w-lg text-base leading-7 text-[#b9c7db]">
                Či už máš záujem o pravidelné tréningy, členstvo alebo si chceš len vyskúšať, radi ťa privítame.
              </p>
              <Button href="/kontakt" className="mt-8 w-fit">Chcem si zahrať <ArrowRight size={18} /></Button>
            </div>
            <div className="relative z-10 flex items-center p-5 sm:p-8 lg:-mr-8 lg:p-6">
              <div className="w-full rounded-2xl border border-[#3273aa]/35 bg-[#071d39]/95 p-5 shadow-[0_20px_60px_rgba(0,0,0,.28)] backdrop-blur sm:p-7">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#1688ff]">Vedeli ste</p>
                <h3 className="mt-2 font-display text-xl font-black uppercase sm:text-2xl">Kolky ≠ Bowling</h3>
                <div className="mt-5 grid grid-cols-2 gap-x-6 text-xs sm:text-sm">
                  <div className="pb-3 font-black uppercase tracking-[0.12em] text-[#1688ff]">Kolky</div>
                  <div className="pb-3 font-black uppercase tracking-[0.12em] text-white/72">Bowling</div>
                  {[
                    ["9 kolkov", "10 kolkov"], ["Guľa bez otvorov", "Guľa s otvormi"],
                    ["1,70 m dráha", "2,23 m dráha"], ["120 hodov", "Rôzne formáty"],
                    ["Európska tradícia", "Moderný globálny šport"]
                  ].map(([kolky, bowling]) => (
                    <div key={kolky} className="contents">
                      <div className="border-t border-white/[0.07] py-3 text-white">{kolky}</div>
                      <div className="border-t border-white/[0.07] py-3 text-white/70">{bowling}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="relative min-h-[300px] lg:min-h-[520px]">
              <Image src="/images/teams-hero-generated.png" alt="Kolkáreň s kolkárskou guľou" fill className="object-cover object-center" sizes="35vw" />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,#061a34_0%,rgba(6,26,52,.28)_30%,transparent_70%),linear-gradient(180deg,transparent_60%,rgba(3,16,33,.7))]" />
            </div>
          </div>
        </WidgetShell>
      </div>
    </section>
  );
}

function WidgetShell({ children, className = "" }: { children: ReactNode; className: string }) {
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
  action: string;
  href: string;
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
    <div className="rounded-xl border border-[#1b5790]/70 bg-[#061d3a]/82 p-3 shadow-[0_24px_80px_rgba(0,0,0,.28),inset_0_1px_0_rgba(255,255,255,.045)] backdrop-blur-sm sm:p-5">
      <div className="mb-4 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-black uppercase tracking-[0.04em] text-white sm:text-xl">{title}</h2>
        <Link href={href} className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.04em] text-[#58a3ff] sm:text-[11px]">
          {action} <ArrowRight size={14} />
        </Link>
      </div>
      {children}
    </div>
  );
}
