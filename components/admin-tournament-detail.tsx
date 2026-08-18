"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, CalendarDays, CreditCard, MapPin, Trash2, Users } from "lucide-react";
import {
  deleteTournamentRegistrationInBackend,
  persistTournamentRegistrationsToBackend,
  readLiveData,
  readTournamentRegistrations,
  refreshTournamentRegistrationsFromBackend,
  subscribeLiveData,
  subscribeTournamentRegistrations,
  writeTournamentRegistrations,
  type LiveClubData,
  type TournamentRegistration
} from "@/lib/live-store";
import { cn } from "@/lib/utils";

const surfaceClass =
  "rounded-2xl border border-white/[0.05] bg-[linear-gradient(180deg,#0A1D3A_0%,#08172E_100%)] shadow-[0_8px_30px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.04)]";

export function AdminTournamentDetail({ tournamentId }: { tournamentId: number }) {
  const [data, setData] = useState<LiveClubData>(() => readLiveData());
  const [registrations, setRegistrations] = useState<TournamentRegistration[]>(() => readTournamentRegistrations());

  useEffect(() => subscribeLiveData(setData), []);
  useEffect(() => {
    refreshTournamentRegistrationsFromBackend(tournamentId).then((rows) => {
      const other = readTournamentRegistrations().filter((row) => row.tournamentId !== tournamentId);
      const next = [...rows, ...other];
      setRegistrations(next);
      writeTournamentRegistrations(next);
    }).catch(() => undefined);
  }, [tournamentId]);
  useEffect(() => subscribeTournamentRegistrations(setRegistrations), []);

  const tournament = data.tournaments.find((item) => item.id === tournamentId);
  const tournamentRegistrations = registrations.filter((row) => row.tournamentId === tournamentId);
  const activeRegistrations = tournamentRegistrations.filter((row) => (row.cancellationStatus || "active") === "active");
  const slotGroups = groupRegistrationsBySlot(activeRegistrations);
  const capacity = parseCapacity(tournament.capacity);
  const percent = capacity ? Math.round((activeRegistrations.length / capacity) * 100) : 0;

  const removeRegistration = async (id: number) => {
    await deleteTournamentRegistrationInBackend(id);
    const next = registrations.filter((registration) => registration.id !== id);
    setRegistrations(next);
    writeTournamentRegistrations(next);
  };

  const updateRegistration = async (id: number, patch: Partial<TournamentRegistration>) => {
    const next = registrations.map((registration) => registration.id === id ? { ...registration, ...patch } : registration);
    setRegistrations(next);
    writeTournamentRegistrations(next);
    await persistTournamentRegistrationsToBackend(next);
  };

  if (!tournament) {
    return (
      <main className="min-h-screen bg-[#031225] px-5 py-8 text-white">
        <div className="mx-auto max-w-5xl">
          <Link href="/admin" className="inline-flex items-center gap-2 text-sm font-bold text-[#7db7ff] hover:text-white">
            <ArrowLeft size={16} /> Späť do adminu
          </Link>
          <section className={cn(surfaceClass, "mt-6 p-6")}>
            <h1 className="text-3xl font-black">Turnaj sa nenašiel</h1>
            <p className="mt-2 text-[#9fb0c8]">Tento turnaj možno bol vymazaný alebo ešte nie je uložený v lokálnych dátach.</p>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#031225] px-5 py-8 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Link href="/admin" className="inline-flex items-center gap-2 text-sm font-bold text-[#7db7ff] hover:text-white">
            <ArrowLeft size={16} /> Späť do admin dashboardu
          </Link>
          <Link href="/admin" className="inline-flex h-11 items-center justify-center rounded-lg border border-white/[0.06] px-5 text-sm font-black uppercase text-white transition hover:border-blue-400/25 hover:text-[#7db7ff]">
            Upraviť turnaj
          </Link>
        </div>

        <section className={cn(surfaceClass, "overflow-hidden")}>
          <div className="grid gap-6 p-6 lg:grid-cols-[1.25fr_.75fr] lg:p-8">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#4e9bff]">{tournament.status}</p>
              <h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">{tournament.name}</h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-[#c7d6ee]">{tournament.description || "Detail turnaja a registrácie hráčov."}</p>

              <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <Info icon={CalendarDays} label="Dátum" value={`${tournament.date} - ${tournament.time}`} />
                <Info icon={MapPin} label="Miesto" value={tournament.location} />
                <Info icon={Users} label="Kapacita" value={`${activeRegistrations.length} / ${capacity || "-"}`} />
                <Info icon={CreditCard} label="Platba" value={tournament.entryType === "free" ? "Bez poplatku" : tournament.fee} />
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.05] bg-[#061a33]/70 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#9fb0c8]">Obsadenosť</p>
              <div className="mt-4 flex items-end justify-between gap-4">
                <div>
                  <p className="text-5xl font-black">{activeRegistrations.length}</p>
                  <p className="mt-1 text-sm text-[#9fb0c8]">aktívnych registrácií</p>
                </div>
                <p className="text-2xl font-black text-[#4e9bff]">{percent}%</p>
              </div>
              <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-[#1677ff]" style={{ width: `${Math.min(percent, 100)}%` }} />
              </div>
              <p className="mt-4 text-sm text-[#9fb0c8]">Kapacita: {capacity || "-"} hráčov, dráhy: {tournament.lanes || "4"}.</p>
            </div>
          </div>
        </section>

        <section className={cn(surfaceClass, "mt-6 overflow-hidden")}>
          <div className="border-b border-white/[0.05] p-6">
            <h2 className="text-2xl font-black">Registrovaní používatelia</h2>
            <p className="mt-2 text-sm text-[#9fb0c8]">Všetci hráči prihlásení na tento konkrétny turnaj vrátane zrušených registrácií.</p>
          </div>

          <div className="grid gap-4 border-b border-white/[0.05] p-6 lg:grid-cols-2 xl:grid-cols-3">
            {slotGroups.map((group) => (
              <article key={group.slot} className="rounded-2xl bg-[#061a33]/70 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] ring-1 ring-white/[0.05]">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-[#4e9bff]">Štart</p>
                    <h3 className="mt-1 text-lg font-black text-white">{group.slot}</h3>
                  </div>
                  <span className="rounded-full bg-[#1683ff]/12 px-3 py-1 text-xs font-black text-[#7db7ff]">{group.rows.length} hráčov</span>
                </div>
                <div className="space-y-2">
                  {group.rows.map((registration) => (
                    <div key={registration.id} className="rounded-xl bg-white/[0.035] p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-black text-white">{registration.name}</p>
                          <p className="mt-1 text-xs text-[#9fb0c8]">{registration.club} · {registration.email}</p>
                        </div>
                        <button type="button" onClick={() => removeRegistration(registration.id)} className="rounded-lg border border-red-400/15 px-2 py-1 text-[11px] font-black uppercase text-red-200 hover:bg-red-500/12">
                          Zmazať
                        </button>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button type="button" onClick={() => updateRegistration(registration.id, { paymentStatus: "paid" })} className="rounded-md bg-emerald-500/14 px-2 py-1 text-[11px] font-black uppercase text-emerald-300">
                          Zaplatené
                        </button>
                        <button type="button" onClick={() => updateRegistration(registration.id, { paymentStatus: "pending" })} className="rounded-md bg-amber-500/14 px-2 py-1 text-[11px] font-black uppercase text-amber-200">
                          Čaká platba
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            ))}
            {!slotGroups.length ? (
              <div className="rounded-2xl bg-[#061a33]/70 p-5 text-sm text-[#9fb0c8] ring-1 ring-white/[0.05]">
                Zatiaľ tu nie sú žiadne aktívne registrácie rozdelené podľa časov.
              </div>
            ) : null}
          </div>

          <div className="overflow-x-auto p-6">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="text-xs font-black uppercase tracking-[0.05em] text-[#9fb0c8]">
                <tr className="border-b border-white/[0.06]">
                  <th className="px-3 py-3">#</th>
                  <th className="px-3 py-3">Meno</th>
                  <th className="px-3 py-3">Klub / mesto</th>
                  <th className="px-3 py-3">E-mail</th>
                  <th className="px-3 py-3">Telefón</th>
                  <th className="px-3 py-3">Slot</th>
                  <th className="px-3 py-3">Platba</th>
                  <th className="px-3 py-3">Stav</th>
                  <th className="px-3 py-3">Poznámka</th>
                  <th className="px-3 py-3 text-right">Akcia</th>
                </tr>
              </thead>
              <tbody>
                {tournamentRegistrations.map((registration, index) => (
                  <tr key={registration.id} className="border-b border-white/[0.04] last:border-b-0">
                    <td className="px-3 py-4 text-[#9fb0c8]">{index + 1}</td>
                    <td className="px-3 py-4 font-bold text-white">{registration.name}</td>
                    <td className="px-3 py-4 text-[#c7d6ee]">{registration.club}</td>
                    <td className="px-3 py-4 text-[#c7d6ee]">{registration.email}</td>
                    <td className="px-3 py-4 text-[#c7d6ee]">{registration.phone || "-"}</td>
                    <td className="px-3 py-4 text-[#c7d6ee]">{registration.slot}</td>
                    <td className="px-3 py-4">
                      <span className={cn("inline-flex rounded-md px-3 py-1 text-xs font-bold", registration.paymentStatus === "free" ? "bg-emerald-500/18 text-emerald-300" : "bg-[#1677ff]/18 text-[#75b6ff]")}>
                        {paymentLabel(registration.paymentStatus)}
                      </span>
                    </td>
                    <td className="px-3 py-4">
                      <span className={cn("inline-flex rounded-md px-3 py-1 text-xs font-bold", (registration.cancellationStatus || "active") === "active" ? "bg-emerald-500/18 text-emerald-300" : "bg-amber-500/15 text-amber-200")}>
                        {cancellationLabel(registration.cancellationStatus || "active")}
                      </span>
                    </td>
                    <td className="max-w-[220px] px-3 py-4 text-[#9fb0c8]">{registration.note || "-"}</td>
                    <td className="px-3 py-4 text-right">
                      <button type="button" onClick={() => removeRegistration(registration.id)} className="inline-flex h-9 items-center gap-2 rounded-lg border border-red-400/15 px-3 text-xs font-black uppercase text-red-200 transition hover:bg-red-500/12">
                        <Trash2 size={14} /> Odstrániť
                      </button>
                    </td>
                  </tr>
                ))}
                {!tournamentRegistrations.length ? (
                  <tr>
                    <td colSpan={10} className="px-3 py-10 text-center text-[#9fb0c8]">
                      Zatiaľ tu nie sú žiadni registrovaní hráči.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

function Info({ icon: Icon, label, value }: { icon: typeof CalendarDays; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/[0.05] bg-[#061a33]/70 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
      <Icon className="mb-3 text-[#4e9bff]" size={19} />
      <p className="text-[11px] font-black uppercase tracking-[0.08em] text-[#9fb0c8]">{label}</p>
      <p className="mt-1 font-bold text-white">{value}</p>
    </div>
  );
}

function parseCapacity(value: string) {
  const match = value.match(/\d+/);
  return match ? Number(match[0]) : 0;
}

function groupRegistrationsBySlot(rows: TournamentRegistration[]) {
  const grouped = new Map<string, TournamentRegistration[]>();
  rows.forEach((row) => {
    const slot = row.slot || "Bez času";
    grouped.set(slot, [...(grouped.get(slot) || []), row]);
  });
  return Array.from(grouped.entries())
    .map(([slot, slotRows]) => ({ slot, rows: slotRows }))
    .sort((a, b) => a.slot.localeCompare(b.slot, "sk"));
}

function paymentLabel(status: TournamentRegistration["paymentStatus"]) {
  const labels: Record<TournamentRegistration["paymentStatus"], string> = {
    free: "bez platby",
    pending: "čaká platba",
    paid: "zaplatené",
    refunded: "vrátené",
    cancelled: "zrušené"
  };
  return labels[status] || status;
}

function cancellationLabel(status: NonNullable<TournamentRegistration["cancellationStatus"]>) {
  const labels: Record<NonNullable<TournamentRegistration["cancellationStatus"]>, string> = {
    active: "aktívna",
    cancelled: "zrušená",
    refund_due: "refund 48h+",
    no_refund: "bez refundu"
  };
  return labels[status] || status;
}
