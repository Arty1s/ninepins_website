import { ArrowRight, CreditCard, Shield, Trophy, UserRound } from "lucide-react";

export default function UserLoginPage() {
  return (
    <main className="min-h-screen bg-mist">
      <section className="container-page grid min-h-screen gap-8 pt-32 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="mb-3 text-sm font-black uppercase text-kkhc">Členský účet</p>
          <h1 className="sport-title text-5xl leading-none text-navy md:text-7xl">Prihlásenie hráča</h1>
          <p className="mt-4 max-w-xl text-navy/70">
            Hráč alebo člen vidí svoj profil, členstvo, platby, turnaje, osobné úspechy a štatistiky. Admin správa je oddelená.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <Mini icon={Shield} title="Členstvo" />
            <Mini icon={CreditCard} title="Platby" />
            <Mini icon={Trophy} title="Výsledky" />
          </div>
        </div>

        <div className="rounded-lg border border-navy/10 bg-white p-6 shadow-premium">
          <div className="mb-6 flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-kkhc text-white"><UserRound /></span>
            <div>
              <h2 className="font-black uppercase text-navy">Používateľské prihlásenie</h2>
              <p className="text-sm text-navy/60">Prihlásenie do členského profilu KK Hlohovec</p>
            </div>
          </div>
          <LoginForm emailPlaceholder="hrac@kkhlohovec.sk" buttonLabel="Prihlásiť sa do profilu" />
          <a href="/admin/login" className="mt-5 inline-flex items-center gap-2 text-sm font-black uppercase text-kkhc">
            Som admin <ArrowRight size={16} />
          </a>
        </div>
      </section>
    </main>
  );
}

function Mini({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="rounded-lg bg-white p-4 shadow-sm">
      <Icon className="mb-3 h-7 w-7 text-kkhc" />
      <p className="text-sm font-black uppercase text-navy">{title}</p>
    </div>
  );
}

function LoginForm({ emailPlaceholder, buttonLabel }: { emailPlaceholder: string; buttonLabel: string }) {
  return (
    <form className="space-y-4">
      <label className="block">
        <span className="mb-2 block text-xs font-black uppercase text-navy/55">E-mail</span>
        <input className="h-12 w-full rounded-md border border-navy/10 px-4 outline-none focus:border-kkhc focus:ring-2 focus:ring-kkhc/15" placeholder={emailPlaceholder} type="email" />
      </label>
      <label className="block">
        <span className="mb-2 block text-xs font-black uppercase text-navy/55">Heslo</span>
        <input className="h-12 w-full rounded-md border border-navy/10 px-4 outline-none focus:border-kkhc focus:ring-2 focus:ring-kkhc/15" placeholder="••••••••" type="password" />
      </label>
      <button className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-[#1683ff] bg-[#147cff] px-6 text-sm font-black uppercase text-white shadow-[0_14px_34px_rgba(20,124,255,.28)] transition hover:-translate-y-0.5 hover:bg-[#238bff]" type="button">
        {buttonLabel} <ArrowRight size={18} />
      </button>
    </form>
  );
}
