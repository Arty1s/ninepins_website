import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import { ArrowRight, CalendarDays, Check, CreditCard, FileText, Mail, Users, Waypoints } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pricingPlans, type MembershipPlan } from "@/lib/landing-data";

export function MembershipPricingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#031326] pt-24 text-white">
      <div className="absolute inset-x-0 top-0 h-[560px]">
        <Image src="/images/team-blue-balls.png" alt="Kolkárske gule v kolkárni" fill priority className="object-cover object-right" sizes="100vw" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#031326_0%,rgba(3,19,38,.94)_45%,rgba(3,19,38,.42)_100%),linear-gradient(180deg,rgba(3,19,38,.2),#031326_94%)]" />
      </div>
      <section className="container-page relative z-10 py-14 sm:py-20">
        <div className="max-w-4xl">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[#58a3ff]">Členstvo a cenník</p>
          <h1 className="mt-4 font-display text-5xl font-black leading-[1.02] md:text-7xl">Vyber si, čo ti vyhovuje</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[#c0d0e4]">Členstvo, pravidelné tréningy alebo prenájom kolkárne. Všetko prehľadne na jednom mieste.</p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {pricingPlans.map((plan) => (
            <PricingCard key={plan.title} plan={plan} index={pricingPlans.indexOf(plan)} />
          ))}
        </div>
      </section>

      <section className="container-page relative z-10 pb-20">
        <div className="grid gap-7 border-t border-[#2c6698]/35 py-8 md:grid-cols-3 md:divide-x md:divide-[#2c6698]/35">
          <Feature icon={Mail} title="Mesačné pripomienky" text="Člen dostane upozornenie pred splatnosťou." />
          <Feature icon={CreditCard} title="História platieb" text="Profil bude zobrazovať úhrady a stav členstva." />
          <Feature icon={FileText} title="Doklady" text="Prehľad dokladov a platieb na jednom mieste." />
        </div>
      </section>
    </main>
  );
}

function PricingCard({ plan, index }: { plan: MembershipPlan; index: number }) {
  const Icon = [Users, Waypoints, CalendarDays][index] || CalendarDays;
  return (
    <article
      className={`relative flex min-h-[500px] flex-col rounded-2xl border p-7 transition duration-300 hover:-translate-y-1 ${
        plan.featured
          ? "border-[#1688ff] bg-[linear-gradient(160deg,rgba(8,38,75,.98),rgba(4,23,45,.98))] shadow-[0_24px_80px_rgba(8,120,255,.2)]"
          : "border-[#2b6598]/45 bg-[linear-gradient(160deg,rgba(6,29,56,.96),rgba(4,21,42,.98))]"
      }`}
    >
      {plan.featured ? (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#0878ff] px-4 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-white">
          Najobľúbenejšie
        </span>
      ) : null}
      <Icon className="mb-4 h-10 w-10 text-[#238eff]" strokeWidth={1.7} />
      <h2 className="font-display text-3xl font-black text-white">{titleCase(plan.title)}</h2>
      <p className="mt-2 text-base text-[#afc0d6]">{plan.subtitle}</p>
      <p className="mt-7 font-display text-3xl font-black text-[#1688ff] sm:text-4xl">{plan.price}</p>
      <div className="mt-6 h-px bg-[#3370a4]/40" />
      <ul className="mt-6 flex-1 space-y-4 text-sm text-[#d7e0ec]">
        {plan.features.map((feature) => (
          <li key={feature} className="flex gap-3">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#1688ff]" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <Button href={plan.href} variant={plan.featured ? "primary" : "secondary"} className="mt-8 w-full justify-center">
        {plan.cta} <ArrowRight size={17} />
      </Button>
    </article>
  );
}

function Feature({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  return (
    <div className="flex gap-4 md:px-7 first:pl-0 last:pr-0">
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#0a315d] text-[#58a3ff]"><Icon className="h-6 w-6" /></span>
      <div>
        <h3 className="font-black text-white">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-[#9baac0]">{text}</p>
      </div>
    </div>
  );
}

function titleCase(value: string) {
  return value.toLocaleLowerCase("sk-SK").replace(/^./, (letter) => letter.toLocaleUpperCase("sk-SK"));
}
