"use client";

import Image from "next/image";
import type { ElementType, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  GalleryHorizontalEnd,
  ImagePlus,
  LayoutDashboard,
  LogOut,
  Menu,
  MoreVertical,
  Settings,
  ShieldCheck,
  Trophy,
  UserRound,
  Users,
  Wrench,
  ClipboardCheck,
  UserPlus,
  Swords,
} from "lucide-react";
import { AdminCrudDashboard, type AdminTab } from "@/components/admin-crud-dashboard";
import {
  defaultLiveData,
  readLiveData,
  readTournamentRegistrations,
  subscribeLiveData,
  subscribeTournamentRegistrations,
  writeTournamentRegistrations,
  type LiveClubData,
  type LiveTournament,
  type TournamentRegistration
} from "@/lib/live-store";
import { cn } from "@/lib/utils";

type AdminSection = "prehlad" | AdminTab | "galeria" | "registracie" | "clenovia" | "nastavenia";

const sidebarItems: { id: AdminSection; label: string; icon: ElementType }[] = [
  { id: "prehlad", label: "Prehľad", icon: LayoutDashboard },
  { id: "turnaje", label: "Turnaje", icon: Wrench },
  { id: "galeria", label: "Galéria", icon: GalleryHorizontalEnd },
  { id: "registracie", label: "Registrácie", icon: ClipboardCheck },
  { id: "clenovia", label: "Členovia", icon: Users },
  { id: "timy", label: "Tímy", icon: ShieldCheck },
  { id: "zapasy", label: "Zápasy", icon: Swords },
  { id: "nastavenia", label: "Nastavenia", icon: Settings }
];

const adminSurfaceClass =
  "rounded-2xl border border-white/[0.05] bg-[linear-gradient(180deg,#0A1D3A_0%,#08172E_100%)] shadow-[0_8px_30px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.04)]";

export function AdminDashboardShell() {
  const [active, setActive] = useState<AdminSection>("prehlad");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [data, setData] = useState<LiveClubData>(defaultLiveData);
  const [registrations, setRegistrations] = useState<TournamentRegistration[]>([]);
  const [adminEmail, setAdminEmail] = useState("admin@kkhlohovec.sk");

  useEffect(() => {
    setData(readLiveData());
    setRegistrations(readTournamentRegistrations());
    const unsubData = subscribeLiveData(setData);
    const unsubRegistrations = subscribeTournamentRegistrations(setRegistrations);
    return () => {
      unsubData();
      unsubRegistrations();
    };
  }, []);

  useEffect(() => {
    fetch("/api/auth/session", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((session) => {
        if (session?.user?.email) setAdminEmail(session.user.email);
      })
      .catch(() => undefined);
  }, []);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/prihlasenie";
  };

  const dateLabel = new Intl.DateTimeFormat("sk-SK", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date());
  const timeLabel = new Intl.DateTimeFormat("sk-SK", { hour: "2-digit", minute: "2-digit" }).format(new Date());
  const crudTab = toCrudTab(active);

  return (
    <main className="min-h-screen bg-[#031225] text-white">
      <AdminSidebar
        active={active}
        setActive={(value) => {
          setActive(value);
          setMobileOpen(false);
        }}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        adminEmail={adminEmail}
        logout={logout}
      />

      <section className={cn("min-h-screen px-4 py-5 transition-all duration-300 lg:px-7", collapsed ? "lg:ml-[92px]" : "lg:ml-[260px]")}>
        <AdminTopbar dateLabel={dateLabel} timeLabel={timeLabel} openMobile={() => setMobileOpen(true)} />

        {active === "prehlad" ? (
          <AdminOverview data={data} registrations={registrations} setActive={setActive} />
        ) : active === "registracie" ? (
          <RegistrationsManager registrations={registrations} tournaments={data.tournaments} setRegistrations={setRegistrations} />
        ) : crudTab ? (
          <div className="mt-6">
            <AdminCrudDashboard key={crudTab} initialActive={crudTab} compactHeader />
          </div>
        ) : (
          <AdminPlaceholder section={active} data={data} registrations={registrations} />
        )}

        <footer className="mt-8 border-t border-white/[0.05] py-5 text-center text-sm text-[#9fb0c8]">
          © 2024 KK Hlohovec - Kolkársky klub. Všetky práva vyhradené.
        </footer>
      </section>
    </main>
  );
}

function AdminSidebar({
  active,
  setActive,
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
  adminEmail,
  logout
}: {
  active: AdminSection;
  setActive: (value: AdminSection) => void;
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (value: boolean) => void;
  adminEmail: string;
  logout: () => void;
}) {
  return (
    <>
      {mobileOpen ? <button className="fixed inset-0 z-40 bg-black/55 lg:hidden" aria-label="Zavrieť menu" onClick={() => setMobileOpen(false)} type="button" /> : null}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-white/[0.06] bg-[#021020] transition duration-300",
          collapsed && "lg:w-[92px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-[88px] items-center gap-3 border-b border-white/[0.05] px-6">
          <Image src="/kkhc-logo.png" alt="KK Hlohovec" width={58} height={42} className="h-11 w-auto object-contain" priority />
          {!collapsed ? (
            <div className="min-w-0">
              <p className="text-lg font-black leading-tight">KK Hlohovec</p>
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/62">Kolkársky klub</p>
            </div>
          ) : null}
        </div>

        <div className={cn("border-b border-white/[0.05] px-5 py-6", collapsed && "px-3")}>
          <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-[#1677ff]/80 bg-[#071a33] text-[#1677ff]">
              <UserRound size={27} />
            </span>
            {!collapsed ? (
              <div className="min-w-0">
                <p className="font-black">Admin</p>
                <p className="truncate text-xs text-[#9fb0c8]">{adminEmail}</p>
                <span className="mt-2 inline-flex rounded-md bg-[#1677ff]/22 px-2 py-1 text-[10px] font-bold text-[#7db7ff]">Administrátor</span>
              </div>
            ) : null}
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5" aria-label="Admin navigácia">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const selected = active === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActive(item.id)}
                className={cn(
                  "relative flex h-12 w-full items-center gap-3 rounded-lg px-4 text-sm font-bold text-[#dbe7ff] transition hover:bg-[#0a2a52]/70",
                  selected && "bg-[#0d3d78]/82 text-white",
                  collapsed && "justify-center px-0"
                )}
                title={item.label}
              >
                {selected ? <span className="absolute right-0 top-2 h-8 w-1 rounded-l-full bg-[#1677ff]" /> : null}
                <Icon size={18} className={selected ? "text-[#1677ff]" : "text-white/78"} />
                {!collapsed ? <span>{item.label}</span> : null}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto space-y-4 px-4 pb-5">
          <button
            type="button"
            onClick={logout}
            className={cn("flex h-12 w-full items-center gap-3 rounded-lg px-4 text-sm font-bold text-white transition hover:bg-red-500/14 hover:text-red-200", collapsed && "justify-center px-0")}
          >
            <LogOut size={18} />
            {!collapsed ? "Odhlásiť sa" : null}
          </button>

          {!collapsed ? (
            <div className={cn(adminSurfaceClass, "relative overflow-hidden p-4")}>
              <div className="absolute inset-0 bg-[linear-gradient(150deg,rgba(22,119,255,.12),transparent_62%),url('/images/login-bg.png')] bg-cover bg-left-bottom opacity-55" />
              <div className="relative h-28" />
            </div>
          ) : null}

          <button type="button" onClick={() => setCollapsed(!collapsed)} className="hidden h-10 w-full items-center justify-center rounded-full border border-white/[0.06] bg-[#071a33] text-[#9fb0c8] transition hover:border-blue-400/20 hover:text-white lg:flex">
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
      </aside>
    </>
  );
}

function AdminTopbar({ dateLabel, timeLabel, openMobile }: { dateLabel: string; timeLabel: string; openMobile: () => void }) {
  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div className="flex items-start gap-3">
        <button type="button" onClick={openMobile} className="mt-1 grid h-11 w-11 place-items-center rounded-xl border border-white/[0.05] bg-[#081b35] text-white lg:hidden">
          <Menu size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-black tracking-tight md:text-4xl">Prehľad</h1>
          <p className="mt-2 text-[#9fb0c8]">Vitajte späť v administrácii KK Hlohovec</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button className="relative grid h-12 w-12 place-items-center rounded-xl border border-white/[0.05] bg-[linear-gradient(180deg,#0A1D3A_0%,#08172E_100%)] text-white shadow-[0_8px_24px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.04)] transition hover:border-blue-400/20" type="button" aria-label="Notifikácie">
          <Bell size={19} />
          <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-[#1677ff] text-[10px] font-black">3</span>
        </button>
        <div className="rounded-xl border border-white/[0.05] bg-[linear-gradient(180deg,#0A1D3A_0%,#08172E_100%)] px-4 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.04)]">
          <p className="text-xs text-[#9fb0c8]">{dateLabel}</p>
          <p className="text-lg font-black">{timeLabel}</p>
        </div>
      </div>
    </header>
  );
}

function AdminOverview({ data, registrations, setActive }: { data: LiveClubData; registrations: TournamentRegistration[]; setActive: (value: AdminSection) => void }) {
  const activeTournaments = data.tournaments.filter((item) => item.type !== "past");
  const upcomingTournaments = data.tournaments.filter((item) => item.type === "upcoming");
  const nearest = upcomingTournaments[0] ?? data.tournaments[0];
  const capacity = parseCapacity(nearest?.capacity);
  const registered = registrations.filter((row) => row.tournamentId === nearest?.id).length;
  const percent = capacity ? Math.round((registered / capacity) * 100) : 0;

  const stats = [
    { label: "Aktívne turnaje", value: activeTournaments.length, icon: CalendarDays, color: "blue", target: "turnaje" as AdminSection },
    { label: "Nadchádzajúce turnaje", value: upcomingTournaments.length, icon: CalendarDays, color: "blue", target: "turnaje" as AdminSection },
    { label: "Počet registrácií", value: registrations.length, icon: Users, color: "green", target: "registracie" as AdminSection },
    { label: "Počet galérií", value: data.gallery.length, icon: ImagePlus, color: "purple", target: "galeria" as AdminSection },
    { label: "Členov klubu", value: data.members.length, icon: UserPlus, color: "orange", target: "clenovia" as AdminSection }
  ];

  return (
    <div className="mt-6 space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map((stat) => (
          <DashboardStatCard key={stat.label} {...stat} onClick={() => setActive(stat.target)} />
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.15fr_.85fr_1.25fr]">
        <UpcomingTournamentCard tournament={nearest} registered={registered} capacity={capacity} percent={percent} />
        <QuickActions setActive={setActive} />
        <RecentRegistrations registrations={registrations} tournaments={data.tournaments} setActive={setActive} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.45fr_.9fr]">
        <TournamentTable tournaments={data.tournaments} registrations={registrations} setActive={setActive} />
        <GalleryActivity gallery={data.gallery} setActive={setActive} />
      </div>
    </div>
  );
}

function DashboardStatCard({ label, value, icon: Icon, color, onClick }: { label: string; value: number; icon: ElementType; color: string; onClick: () => void }) {
  const colorClass = {
    blue: "from-[#1677ff] to-[#0c55d8]",
    green: "from-[#18b978] to-[#0b7d50]",
    purple: "from-[#8067ff] to-[#5d36d8]",
    orange: "from-[#ffba08] to-[#f59e0b]"
  }[color] ?? "from-[#1677ff] to-[#0c55d8]";

  return (
    <article className={cn(adminSurfaceClass, "p-5 transition duration-200 hover:-translate-y-0.5 hover:border-blue-400/15 hover:shadow-[0_14px_44px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.05)]")}>
      <div className="flex items-center gap-4">
        <span className={cn("grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-white shadow-lg", colorClass)}>
          <Icon size={25} />
        </span>
        <div>
          <p className="text-xs font-black uppercase text-[#c6d5ef]/82">{label}</p>
          <p className="mt-2 text-3xl font-black">{value}</p>
        </div>
      </div>
      <button onClick={onClick} type="button" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#4e9bff] hover:text-white">
        Zobraziť všetky <ChevronRight size={16} />
      </button>
    </article>
  );
}

function Panel({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className={cn(adminSurfaceClass, "p-5")}>
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-xl font-black">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function UpcomingTournamentCard({ tournament, registered, capacity, percent }: { tournament?: LiveTournament; registered: number; capacity: number; percent: number }) {
  if (!tournament) return <Panel title="Najbližší turnaj"><p className="text-[#9fb0c8]">Zatiaľ nie je vytvorený turnaj.</p></Panel>;

  return (
    <Panel title="Najbližší turnaj">
      <div className="grid gap-5 sm:grid-cols-[180px_1fr]">
        <div className="relative min-h-60 overflow-hidden rounded-xl">
          <Image src="/images/gallery-1.jpg" alt={tournament.name} fill className="object-cover" />
        </div>
        <div>
          <span className="inline-flex rounded-md bg-[#1677ff] px-3 py-1 text-xs font-bold uppercase text-white">{tournament.status}</span>
          <h3 className="mt-4 text-2xl font-black">{tournament.name}</h3>
          <div className="mt-4 space-y-3 text-sm text-[#c7d6ee]">
            <p className="flex items-center gap-2"><CalendarDays size={16} /> {tournament.date}</p>
            <p>{tournament.time}</p>
            <p>{tournament.location}</p>
          </div>
          <div className="mt-5 border-t border-white/[0.06] pt-4">
            <div className="flex items-center justify-between text-sm text-[#c7d6ee]">
              <span>Prihlásených: {registered} / {capacity || "-"}</span>
              <span>{percent}%</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-white/10">
              <div className="h-full rounded-full bg-[#1677ff]" style={{ width: `${Math.min(percent, 100)}%` }} />
            </div>
          </div>
          <button type="button" className="mt-5 h-10 rounded-lg border border-white/[0.07] px-5 text-sm font-bold shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] transition hover:border-blue-400/25 hover:text-[#58a3ff]">
            Zobraziť turnaj
          </button>
        </div>
      </div>
    </Panel>
  );
}

function QuickActions({ setActive }: { setActive: (value: AdminSection) => void }) {
  const actions = [
    { title: "Vytvoriť turnaj", text: "Vytvorte nový turnaj", icon: Trophy, color: "bg-[#1677ff]", target: "turnaje" as AdminSection },
    { title: "Pridať galériu", text: "Pridajte nové fotografie", icon: ImagePlus, color: "bg-emerald-500", target: "galeria" as AdminSection },
    { title: "Zobraziť registrácie", text: "Spravujte registrácie na turnaje", icon: CalendarDays, color: "bg-violet-500", target: "registracie" as AdminSection }
  ];
  return (
    <Panel title="Rýchle akcie">
      <div className="space-y-4">
        {actions.map((action) => (
          <button key={action.title} onClick={() => setActive(action.target)} className="flex w-full items-center gap-4 rounded-xl border border-white/[0.05] bg-[#061a33]/70 p-4 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] transition hover:border-blue-400/20 hover:bg-[#09203d]/80" type="button">
            <span className={cn("grid h-14 w-14 shrink-0 place-items-center rounded-xl text-white", action.color)}>
              <action.icon size={24} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-lg font-bold">{action.title}</span>
              <span className="mt-1 block text-sm text-[#9fb0c8]">{action.text}</span>
            </span>
            <ChevronRight className="text-white/70" />
          </button>
        ))}
      </div>
    </Panel>
  );
}

function RecentRegistrations({ registrations, tournaments, setActive }: { registrations: TournamentRegistration[]; tournaments: LiveTournament[]; setActive: (value: AdminSection) => void }) {
  return (
    <Panel title="Posledné registrácie" action={<button onClick={() => setActive("registracie")} className="text-sm font-bold text-[#4e9bff]" type="button">Zobraziť všetky</button>}>
      <div className="space-y-1">
        {registrations.slice(0, 5).map((registration, index) => (
          <div key={registration.id} className="flex items-center gap-3 border-b border-white/[0.05] py-3 last:border-b-0">
            <span className={cn("grid h-9 w-9 place-items-center rounded-full text-white", index % 3 === 0 ? "bg-[#1677ff]" : index % 3 === 1 ? "bg-emerald-500" : "bg-amber-500")}>
              <UserRound size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold">{registration.name}</p>
              <p className="truncate text-xs text-[#9fb0c8]">{tournaments.find((item) => item.id === registration.tournamentId)?.name ?? "Turnaj"}</p>
            </div>
            <span className="text-xs text-[#9fb0c8]">{relativeTime(registration.createdAt)}</span>
          </div>
        ))}
        {!registrations.length ? <p className="rounded-xl border border-white/[0.05] bg-[#061a33]/70 p-4 text-sm text-[#9fb0c8] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">Zatiaľ nie sú žiadne registrácie.</p> : null}
      </div>
    </Panel>
  );
}

function TournamentTable({ tournaments, registrations, setActive }: { tournaments: LiveTournament[]; registrations: TournamentRegistration[]; setActive: (value: AdminSection) => void }) {
  return (
    <Panel title="Najnovšie turnaje" action={<button onClick={() => setActive("turnaje")} className="text-sm font-bold text-[#4e9bff]" type="button">Zobraziť všetky</button>}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="text-xs uppercase text-[#9fb0c8]">
            <tr className="border-b border-white/[0.06]">
              <th className="px-3 py-3">Názov turnaja</th>
              <th className="px-3 py-3">Dátum</th>
              <th className="px-3 py-3">Typ</th>
              <th className="px-3 py-3">Prihlásených</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3 text-right">Akcie</th>
            </tr>
          </thead>
          <tbody>
            {tournaments.slice(0, 6).map((tournament) => {
              const capacity = parseCapacity(tournament.capacity);
              const count = registrations.filter((row) => row.tournamentId === tournament.id).length;
              const percent = capacity ? Math.round((count / capacity) * 100) : 0;
              return (
                <tr key={tournament.id} className="border-b border-white/[0.045] last:border-b-0">
                  <td className="px-3 py-4 font-bold">{tournament.name}</td>
                  <td className="px-3 py-4 text-[#c7d6ee]">{tournament.date}</td>
                  <td className="px-3 py-4"><Badge tone={tournament.entryType === "free" ? "green" : "blue"}>{tournament.entryType === "free" ? "Bezplatný" : "Platený"}</Badge></td>
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-3">
                      <span className="w-16 text-[#c7d6ee]">{capacity ? `${count} / ${capacity}` : "-"}</span>
                      <span className="h-2 w-24 overflow-hidden rounded-full bg-white/10">
                        <span className="block h-full rounded-full bg-[#1677ff]" style={{ width: `${Math.min(percent, 100)}%` }} />
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-4"><Badge tone={tournament.status.toLowerCase().includes("otvoren") ? "green" : "yellow"}>{tournament.status}</Badge></td>
                  <td className="px-3 py-4 text-right"><button className="text-white/70 hover:text-white" type="button" aria-label="Akcie"><MoreVertical size={18} /></button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function GalleryActivity({ gallery, setActive }: { gallery: LiveClubData["gallery"]; setActive: (value: AdminSection) => void }) {
  return (
    <Panel title="Aktivita galérie" action={<button onClick={() => setActive("galeria")} className="text-sm font-bold text-[#4e9bff]" type="button">Zobraziť všetky</button>}>
      <div className="space-y-1">
        {gallery.slice(0, 4).map((album, index) => (
          <div key={album.id} className="flex gap-3 border-b border-white/[0.05] py-3 last:border-b-0">
            <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg">
              <Image src={album.coverImage} alt={album.title} fill className="object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold">{album.title}</p>
              <p className="mt-1 text-sm text-[#9fb0c8]">Pridané {album.photos.split(",").filter(Boolean).length} fotografií</p>
            </div>
            <span className="text-xs text-[#9fb0c8]">{index === 0 ? "pred 2 dňami" : index === 1 ? "pred 5 dňami" : "pred 1 týždňom"}</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function RegistrationsManager({
  registrations,
  tournaments,
  setRegistrations
}: {
  registrations: TournamentRegistration[];
  tournaments: LiveTournament[];
  setRegistrations: (rows: TournamentRegistration[]) => void;
}) {
  const [openId, setOpenId] = useState<number | null>(tournaments[0]?.id ?? null);

  const removeRegistration = (id: number) => {
    const next = registrations.filter((registration) => registration.id !== id);
    setRegistrations(next);
    writeTournamentRegistrations(next);
  };

  return (
    <div className="mt-6 space-y-5">
      <div>
        <h2 className="text-3xl font-black tracking-tight">Registrácie na turnaje</h2>
        <p className="mt-2 text-sm text-[#9fb0c8]">Tu admin vidí, kto je prihlásený na konkrétny turnaj. Zoznam sa mení hneď po odoslaní prihlášky.</p>
      </div>

      <div className="grid gap-5">
        {tournaments.map((tournament) => {
          const tournamentRegistrations = registrations.filter((row) => row.tournamentId === tournament.id);
          const capacity = parseCapacity(tournament.capacity);
          const open = openId === tournament.id;

          return (
            <section key={tournament.id} className={cn(adminSurfaceClass, "overflow-hidden")}>
              <button type="button" onClick={() => setOpenId(open ? null : tournament.id)} className="flex w-full flex-col gap-4 p-5 text-left transition hover:bg-white/[0.025] md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-[#4e9bff]">{tournament.status}</p>
                  <h3 className="mt-2 text-xl font-black text-white">{tournament.name}</h3>
                  <p className="mt-1 text-sm text-[#9fb0c8]">{tournament.date} - {tournament.location}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="rounded-xl bg-[#061a33]/80 px-4 py-3 text-sm font-bold text-[#c7d6ee]">
                    <strong className="text-xl text-white">{tournamentRegistrations.length}</strong> / {capacity || "-"} prihlásených
                  </span>
                  <ChevronRight className={cn("text-[#7db7ff] transition", open && "rotate-90")} />
                </div>
              </button>

              {open ? (
                <div className="border-t border-white/[0.05] p-5">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] text-left text-sm">
                      <thead className="text-xs font-black uppercase text-[#9fb0c8]">
                        <tr className="border-b border-white/[0.05]">
                          <th className="px-3 py-3">Hráč</th>
                          <th className="px-3 py-3">Klub / mesto</th>
                          <th className="px-3 py-3">Kontakt</th>
                          <th className="px-3 py-3">Slot</th>
                          <th className="px-3 py-3">Platba</th>
                          <th className="px-3 py-3 text-right">Akcia</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tournamentRegistrations.map((registration) => (
                          <tr key={registration.id} className="border-b border-white/[0.04] last:border-b-0">
                            <td className="px-3 py-4 font-bold text-white">{registration.name}</td>
                            <td className="px-3 py-4 text-[#c7d6ee]">{registration.club}</td>
                            <td className="px-3 py-4 text-[#c7d6ee]">{registration.email}{registration.phone ? ` / ${registration.phone}` : ""}</td>
                            <td className="px-3 py-4 text-[#c7d6ee]">{registration.slot}</td>
                            <td className="px-3 py-4">
                              <Badge tone={registration.paymentStatus === "free" ? "green" : "blue"}>{registration.paymentStatus === "free" ? "bez platby" : "čaká platba"}</Badge>
                            </td>
                            <td className="px-3 py-4 text-right">
                              <button type="button" onClick={() => removeRegistration(registration.id)} className="rounded-lg border border-red-400/15 px-3 py-2 text-xs font-black uppercase text-red-200 transition hover:bg-red-500/12">
                                Odstrániť
                              </button>
                            </td>
                          </tr>
                        ))}
                        {!tournamentRegistrations.length ? (
                          <tr>
                            <td colSpan={6} className="px-3 py-6 text-[#9fb0c8]">Zatiaľ bez prihlásených hráčov.</td>
                          </tr>
                        ) : null}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}
            </section>
          );
        })}
      </div>
    </div>
  );
}

function AdminPlaceholder({ section, data, registrations }: { section: AdminSection; data: LiveClubData; registrations: TournamentRegistration[] }) {
  const title = sidebarItems.find((item) => item.id === section)?.label ?? "Sekcia";
  const count = section === "registracie" ? registrations.length : section === "clenovia" ? data.members.length : data.gallery.length;
  return (
    <div className={cn(adminSurfaceClass, "mt-6 p-6")}>
      <h2 className="text-2xl font-black">{title}</h2>
      <p className="mt-2 text-[#9fb0c8]">Sekcia je pripravená na detailnú správu. Aktuálne záznamy: {count}.</p>
    </div>
  );
}

function Badge({ tone, children }: { tone: "blue" | "green" | "yellow"; children: ReactNode }) {
  const className = tone === "green" ? "bg-emerald-500/18 text-emerald-300" : tone === "yellow" ? "bg-amber-500/12 text-amber-300" : "bg-[#1677ff]/18 text-[#75b6ff]";
  return <span className={cn("inline-flex rounded-md px-3 py-1 text-xs font-bold", className)}>{children}</span>;
}

function parseCapacity(value?: string) {
  const match = value?.match(/\d+/);
  return match ? Number(match[0]) : 0;
}

function relativeTime(createdAt: string) {
  const diff = Date.now() - new Date(createdAt).getTime();
  const minutes = Math.max(1, Math.round(diff / 60000));
  if (minutes < 60) return `pred ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `pred ${hours} hod`;
  return `pred ${Math.round(hours / 24)} dňami`;
}

function toCrudTab(section: AdminSection): AdminTab | null {
  if (section === "turnaje" || section === "galeria" || section === "clenovia" || section === "timy" || section === "zapasy") return section;
  return null;
}

