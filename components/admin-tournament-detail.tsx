"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, CalendarDays, CreditCard, MapPin, Trash2, Users } from "lucide-react";
import {
  readLiveData,
  readTournamentRegistrations,
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
  useEffect(() => subscribeTournamentRegistrations(setRegistrations), []);

  const tournament = data.tournaments.find((item) => item.id === tournamentId);
  const tournamentRegistrations = registrations.filter((row) => row.tournamentId === tournamentId);
  const capacity = parseCapacity(tournament?.capacity);
  const percent = capacity ? Math.round((tournamentRegistrations.length / capacity) * 100) : 0;

  const removeRegistration = (id: number) => {
    const next = registrations.filter((registration) => registration.id !== id);
    setRegistrations(next);
    writeTournamentRegistrations(next);
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
                <Info icon={Users} label="Kapacita" value={`${tournamentRegistrations.length} / ${capacity || "-"}`} />
                <Info icon={CreditCard} label="Platba" value={tournament.entryType === "free" ? "Bez poplatku" : tournament.fee} />
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.05] bg-[#061a33]/70 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#9fb0c8]">Obsadenosť</p>
              <div className="mt-4 flex items-end justify-between gap-4">
                <div>
                  <p className="text-5xl font-black">{tournamentRegistrations.length}</p>
                  <p className="mt-1 text-sm text-[#9fb0c8]">registrovaných hráčov</p>
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
            <p className="mt-2 text-sm text-[#9fb0c8]">Všetci hráči prihlásení na tento konkrétny turnaj.</p>
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
                        {registration.paymentStatus === "free" ? "bez platby" : "čaká platba"}
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
                    <td colSpan={9} className="px-3 py-10 text-center text-[#9fb0c8]">
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

function parseCapacity(value?: string) {
  const match = value?.match(/\d+/);
  return match ? Number(match[0]) : 0;
}
