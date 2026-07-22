import type { ElementType, ReactNode } from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  Award,
  CalendarClock,
  CheckCircle2,
  CreditCard,
  Database,
  History,
  Trophy,
  UserRound,
  Users
} from "lucide-react";
import { ADMIN_SESSION_COOKIE, readAdminSession } from "@/lib/admin-auth";
import { readUserSession, USER_SESSION_COOKIE } from "@/lib/user-auth";

const paymentRows = [
  {
    period: "Júl 2026",
    item: "Členstvo",
    amount: "19 €",
    status: "Pripravené",
    note: "Čaká na prvú online platbu"
  },
  {
    period: "Jún 2026",
    item: "Členstvo",
    amount: "19 €",
    status: "Bez záznamu",
    note: "História sa zobrazí po napojení Stripe"
  },
  {
    period: "Máj 2026",
    item: "Turnajový poplatok",
    amount: "0 €",
    status: "Bezplatné",
    note: "Ukážkový záznam pre bezplatné turnaje"
  }
];

const tournaments = [
  ["KK Hlohovec Open 2025", "Registrácia pripravená", "21. jún 2025"],
  ["Memoriál J. Mego", "Účasť sa uloží k profilu", "8. jún 2024"],
  ["Mestská liga", "Doplní admin alebo tréner", "sezóna 2026"]
];

export default function ProfilePage() {
  const adminSession = readAdminSession(cookies().get(ADMIN_SESSION_COOKIE)?.value);
  const userSession = readUserSession(cookies().get(USER_SESSION_COOKIE)?.value);
  const session = userSession || adminSession;

  if (!session) {
    redirect("/prihlasenie?next=/profile");
  }

  const isAdmin = session.role === "admin";
  const email = session.email;
  const rawName = "name" in session ? session.name : undefined;
  const rawAvatarUrl = "avatarUrl" in session ? session.avatarUrl : undefined;
  const rawProvider = "provider" in session ? session.provider : undefined;
  const name = isAdmin ? "Admin" : typeof rawName === "string" && rawName.trim() ? rawName.trim() : "Michaela Vavrová";
  const avatarUrl = typeof rawAvatarUrl === "string" && rawAvatarUrl.trim() ? rawAvatarUrl.trim() : undefined;
  const provider = typeof rawProvider === "string" && rawProvider.trim() ? rawProvider.trim() : isAdmin ? "password" : "email";
  const currentTeam = isAdmin ? "Administrácia klubu" : "KK Hlohovec";
  const teamRole = isAdmin ? "Správa klubu" : "Členka klubu";
  const matchCount = "Čaká na import";

  return (
    <main className="min-h-screen bg-[#06152a] text-white">
      <section className="relative overflow-hidden border-t border-white/5 bg-[linear-gradient(135deg,#06152a_0%,#082449_52%,#06152a_100%)] py-10 sm:py-14">
        <div className="absolute inset-0 opacity-60 [background:radial-gradient(circle_at_20%_12%,rgba(22,131,255,.22),transparent_34%),radial-gradient(circle_at_84%_4%,rgba(255,255,255,.08),transparent_24%)]" />
        <div className="absolute inset-0 bg-[url('/images/premium-blue-bg.png')] bg-cover bg-center opacity-20 mix-blend-screen" />
        <div className="container-page relative">
          <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.32em] text-[#1683ff]">Môj profil</p>
              <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Vitaj späť, {name}</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-white/70">
                Členský účet pripravený pre platby, tím, turnaje a hráčsku históriu. Zápasy z vysledky.kolky.sk budú napojené cez import podľa hráčskeho ID.
              </p>
            </div>
            {isAdmin ? (
              <Link className="inline-flex h-12 items-center justify-center rounded-xl bg-[#1683ff] px-5 text-sm font-black uppercase tracking-[0.04em] text-white shadow-[0_18px_44px_rgba(22,131,255,.28)] transition hover:-translate-y-0.5 hover:bg-[#2d90ff]" href="/admin">
                Otvoriť administráciu
              </Link>
            ) : null}
          </div>

          <div className="grid gap-5 lg:grid-cols-[0.9fr_1.6fr]">
            <Surface title="Členský účet" icon={UserRound}>
              <div className="flex items-center gap-4">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={name} className="h-[76px] w-[76px] rounded-2xl object-cover" />
                ) : (
                  <div className="grid h-[76px] w-[76px] place-items-center rounded-2xl bg-[#1683ff]/16 text-[#5fb0ff]">
                    <UserRound size={32} />
                  </div>
                )}
                <div className="min-w-0">
                  <h2 className="truncate text-2xl font-black">{name}</h2>
                  <p className="truncate text-sm text-white/62">{email}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="rounded-full bg-[#1683ff]/14 px-3 py-1 text-xs font-bold text-[#74bdff]">{isAdmin ? "Admin" : "Členka"}</span>
                    <span className="rounded-full bg-white/6 px-3 py-1 text-xs font-bold text-white/68">{provider}</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 grid gap-3">
                <StatusLine label="Členstvo" value="Čaká na prvú platbu" />
                <StatusLine label="Aktuálny tím" value={currentTeam} />
                <StatusLine label="Rola v klube" value={teamRole} />
              </div>
            </Surface>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Info icon={CreditCard} title="Členstvo" value="Online platby" />
              <Info icon={CalendarClock} title="Ďalšia platba" value="Po aktivácii" />
              <Info icon={Users} title="Tím" value={currentTeam} />
              <Info icon={Database} title="Zápasy kolky.sk" value={matchCount} />
            </div>
          </div>
        </div>
      </section>

      <section className="container-page grid gap-5 py-8 lg:grid-cols-[1.25fr_0.75fr]">
        <Surface title="Členstvo a história platieb" icon={CreditCard}>
          <div className="overflow-hidden rounded-2xl bg-white/[0.025]">
            {paymentRows.map((row) => (
              <div key={`${row.period}-${row.item}`} className="grid gap-3 border-b border-white/[0.05] px-4 py-4 last:border-b-0 sm:grid-cols-[1fr_1fr_0.7fr_1fr] sm:items-center">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#74bdff]">{row.period}</p>
                  <p className="mt-1 font-black">{row.item}</p>
                </div>
                <p className="text-sm text-white/68">{row.note}</p>
                <p className="text-xl font-black text-[#1683ff]">{row.amount}</p>
                <span className="w-fit rounded-full bg-white/6 px-3 py-1 text-xs font-bold text-white/72">{row.status}</span>
              </div>
            ))}
          </div>
        </Surface>

        <Surface title="Tím a hráčsky profil" icon={Users}>
          <div className="grid gap-3">
            <StatusLine label="Aktuálny tím" value={currentTeam} />
            <StatusLine label="Kapitán / tréner" value={isAdmin ? "Správa tímov" : "Doplní administrátor"} />
            <StatusLine label="Rola v klube" value={teamRole} />
            <StatusLine label="Profil hráča" value={isAdmin ? "Admin účet" : "Michaela Vavrová"} />
          </div>
        </Surface>

        <Surface title="Zápasy a turnaje" icon={Trophy}>
          <div className="mb-4 rounded-2xl bg-[#1683ff]/10 p-4 text-sm leading-6 text-white/76">
            <p className="font-black text-white">Počet zápasov za všetky roky: {matchCount}</p>
            <p className="mt-1">
              Zdroj bude `vysledky.kolky.sk`. Presné číslo doplníme automaticky po nájdení hráčskeho detailu alebo ID profilu pre Michaelu Vavrovú.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {tournaments.map(([title, state, date]) => (
              <div key={title} className="rounded-2xl bg-[#071a33]/70 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,.04)]">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#74bdff]">{date}</p>
                <h3 className="mt-2 text-lg font-black">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/62">{state}</p>
              </div>
            ))}
          </div>
        </Surface>

        <Surface title="Osobné štatistiky" icon={History}>
          <div className="grid grid-cols-2 gap-3">
            <Stat value="Sync" label="zápasy" />
            <Stat value="0" label="turnajov" />
            <Stat value="0" label="medailí" />
            <Stat value="kolky.sk" label="zdroj dát" />
          </div>
        </Surface>
      </section>
    </main>
  );
}

function Surface({ title, icon: Icon, children }: { title: string; icon: ElementType; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/[0.06] bg-[linear-gradient(180deg,#0A1D3A_0%,#08172E_100%)] p-5 shadow-[0_18px_54px_rgba(0,0,0,.28),inset_0_1px_0_rgba(255,255,255,.04)] sm:p-6">
      <div className="mb-5 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#1683ff]/15 text-[#4aa2ff]">
          <Icon size={20} />
        </span>
        <h2 className="text-xl font-black tracking-tight">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Info({ icon: Icon, title, value }: { icon: ElementType; title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[linear-gradient(180deg,#0A1D3A_0%,#08172E_100%)] p-5 shadow-[0_18px_54px_rgba(0,0,0,.24),inset_0_1px_0_rgba(255,255,255,.04)]">
      <Icon className="text-[#1683ff]" size={28} />
      <p className="mt-4 text-xs font-black uppercase tracking-[0.12em] text-white/50">{title}</p>
      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  );
}

function StatusLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-white/[0.035] px-4 py-3">
      <span className="text-sm text-white/55">{label}</span>
      <span className="text-right text-sm font-bold text-white">{value}</span>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl bg-white/[0.035] p-4">
      <div className="flex items-center gap-2 text-[#1683ff]">
        <CheckCircle2 size={18} />
        <p className="text-2xl font-black text-white">{value}</p>
      </div>
      <p className="mt-1 text-sm text-white/58">{label}</p>
    </div>
  );
}
