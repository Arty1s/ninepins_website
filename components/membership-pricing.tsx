import type { LucideIcon } from "lucide-react";
import { Check, CreditCard, FileText, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pricingPlans, type MembershipPlan } from "@/lib/landing-data";

export function MembershipPricingPage() {
  return (
    <main className="min-h-screen bg-[#031326] pt-28 text-white">
      <section className="container-page py-16">
        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[#58a3ff]">Členstvo a cenník</p>
          <h1 className="mt-4 font-display text-5xl font-black uppercase leading-tight md:text-7xl">
            Členstvo a rezervácia kolkárne v Hlohovci
          </h1>
          <p className="mt-5 text-lg leading-8 text-[#b9c7db]">
            Členstvo, pravidelné tréningy a prenájom kolkárne alebo samostatnej dráhy na jednom mieste.
          </p>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {pricingPlans.map((plan) => (
            <PricingCard key={plan.title} plan={plan} />
          ))}
        </div>
      </section>

      <section className="container-page pb-20">
        <div className="grid gap-4 rounded-2xl border border-[#1e7dff]/22 bg-[#061b35] p-6 shadow-[0_18px_60px_rgba(0,0,0,.22)] md:grid-cols-3">
          <Feature icon={Mail} title="Mesačné pripomienky" text="Člen dostane upozornenie pred splatnosťou." />
          <Feature icon={CreditCard} title="História platieb" text="Profil bude zobrazovať úhrady a stav členstva." />
          <Feature icon={FileText} title="Doklady" text="Prehľad dokladov a platieb na jednom mieste." />
        </div>
      </section>
    </main>
  );
}

function PricingCard({ plan }: { plan: MembershipPlan }) {
  return (
    <article
      className={`relative rounded-2xl border p-6 transition duration-200 hover:-translate-y-1 ${
        plan.featured
          ? "border-[#1688ff] bg-[#08213e] shadow-[0_24px_80px_rgba(8,120,255,.18)] lg:-mt-3"
          : "border-[#1e7dff]/22 bg-[#061b35]"
      }`}
    >
      {plan.featured ? (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#0878ff] px-4 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-white">
          Odporúčané
        </span>
      ) : null}
      <h2 className="font-display text-2xl font-black uppercase text-white">{plan.title}</h2>
      <p className="mt-1 text-sm text-[#9baac0]">{plan.subtitle}</p>
      <p className="mt-7 font-display text-4xl font-black text-[#1688ff]">{plan.price}</p>
      <ul className="mt-7 space-y-3 text-sm text-[#d7e0ec]">
        {plan.features.map((feature) => (
          <li key={feature} className="flex gap-3">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#1688ff]" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <Button href={plan.href} variant={plan.featured ? "primary" : "secondary"} className="mt-8 w-full">
        {plan.cta}
      </Button>
    </article>
  );
}

function Feature({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  return (
    <div className="flex gap-4">
      <Icon className="h-8 w-8 shrink-0 text-[#58a3ff]" />
      <div>
        <h3 className="font-black text-white">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-[#9baac0]">{text}</p>
      </div>
    </div>
  );
}
