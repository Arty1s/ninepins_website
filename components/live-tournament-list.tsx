"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Bell, CalendarDays, CheckCircle2, CreditCard, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  readLiveData,
  readTournamentRegistrations,
  subscribeLiveData,
  subscribeTournamentRegistrations,
  writeTournamentRegistrations,
  type LiveClubData,
  type LiveTournament,
  type TournamentRegistration
} from "@/lib/live-store";

const labels = {
  upcoming: "Pripravované turnaje",
  current: "Aktuálne turnaje",
  past: "Minulé turnaje"
};

type RegistrationForm = {
  name: string;
  club: string;
  email: string;
  phone: string;
  slot: string;
  note: string;
};

const emptyForm: RegistrationForm = {
  name: "",
  club: "",
  email: "",
  phone: "",
  slot: "",
  note: ""
};

export function LiveTournamentList() {
  const [data, setData] = useState<LiveClubData>(() => readLiveData());
  const [registrations, setRegistrations] = useState<TournamentRegistration[]>(() => readTournamentRegistrations());
  const [activeTournamentId, setActiveTournamentId] = useState<number | null>(null);

  useEffect(() => subscribeLiveData(setData), []);
  useEffect(() => subscribeTournamentRegistrations(setRegistrations), []);

  const updateRegistrations = (next: TournamentRegistration[]) => {
    setRegistrations(next);
    writeTournamentRegistrations(next);
  };

  return (
    <section className="container-page space-y-12 py-16">
      {(["upcoming", "current", "past"] as const).map((type) => {
        const tournaments = data.tournaments.filter((item) => item.type === type);
        return (
          <div key={type}>
            <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-kkhc">Registrácie online</p>
                <h2 className="sport-title text-4xl text-navy">{labels[type]}</h2>
              </div>
              <p className="max-w-xl text-sm leading-6 text-navy/60">
                Admin vytvorí turnaj, nastaví štartovné a verejnosť sa môže prihlásiť cez sloty podobne ako v kolkárskych registračných systémoch.
              </p>
            </div>

            {tournaments.length ? (
              <div className="grid gap-6">
                {tournaments.map((tournament) => (
                  <TournamentCard
                    key={tournament.id}
                    tournament={normalizeTournament(tournament)}
                    registrations={registrations.filter((row) => row.tournamentId === tournament.id)}
                    active={activeTournamentId === tournament.id}
                    onToggle={() => setActiveTournamentId(activeTournamentId === tournament.id ? null : tournament.id)}
                    onRegister={(registration) => updateRegistrations([{ ...registration, id: Date.now(), createdAt: new Date().toISOString() }, ...registrations])}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-navy/10 bg-white p-6 shadow-sm">
                <p className="text-sm text-navy/65">Zatiaľ bez záznamov. Admin môže pridať turnaj v administračnom paneli.</p>
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}

function TournamentCard({
  tournament,
  registrations,
  active,
  onToggle,
  onRegister
}: {
  tournament: LiveTournament;
  registrations: TournamentRegistration[];
  active: boolean;
  onToggle: () => void;
  onRegister: (registration: Omit<TournamentRegistration, "id" | "createdAt">) => void;
}) {
  const capacity = parseCapacity(tournament.capacity);
  const freeSlots = Math.max(capacity - registrations.length, 0);
  const paid = tournament.entryType === "paid";

  return (
    <article className="overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-[0_24px_80px_rgba(7,26,61,.08)]">
      <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
        <div className="p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.12em] text-kkhc">{tournament.status}</p>
              <h3 className="sport-title mt-2 text-4xl leading-none text-navy md:text-5xl">{tournament.name}</h3>
            </div>
            <span className={`rounded-full px-4 py-2 text-sm font-black uppercase ${paid ? "bg-[#e8f2ff] text-[#0757d8]" : "bg-emerald-50 text-emerald-700"}`}>
              {paid ? tournament.fee : "Bez poplatku"}
            </span>
          </div>

          <p className="mt-5 max-w-3xl text-sm leading-7 text-navy/70">
            {tournament.description || "Turnajový záznam sa aktualizuje priamo z admin dashboardu. Detailné pravidlá a propozície doplní organizátor."}
          </p>

          <div className="mt-6 grid gap-3 text-sm text-navy/75 sm:grid-cols-2 xl:grid-cols-4">
            <Info icon={CalendarDays} label="Dátum" value={`${tournament.date} · ${tournament.time}`} />
            <Info icon={MapPin} label="Miesto" value={tournament.location} />
            <Info icon={Users} label="Kapacita" value={`${freeSlots}/${capacity} voľných`} />
            <Info icon={CreditCard} label="Platba" value={paid ? "Online / potvrdenie" : "Zadarmo"} />
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onToggle}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-[#1683ff] bg-[#147cff] px-6 text-sm font-black uppercase text-white shadow-[0_14px_34px_rgba(20,124,255,.28)] transition hover:-translate-y-0.5 hover:bg-[#238bff]"
            >
              {active ? "Zavrieť detail" : "Detail turnaja"} <ArrowRight size={17} />
            </button>
            <Button variant="outline"><Bell size={18} /> Pridať upozornenie</Button>
          </div>
        </div>

        <div className="border-t border-navy/10 bg-[linear-gradient(135deg,#071a33,#0b3c78)] p-6 text-white lg:border-l lg:border-t-0 md:p-8">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#58a3ff]">Obsadenosť turnaja</p>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <MiniStat value={String(capacity)} label="kapacita" />
            <MiniStat value={String(registrations.length)} label="prihlásení" />
            <MiniStat value={String(parseInt(tournament.lanes || "4", 10) || 4)} label="dráhy" />
          </div>
          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-white/55">Prihlásení hráči</p>
              {registrations.length ? <span className="text-xs font-bold text-[#7db7ff]">{registrations.length} spolu</span> : null}
            </div>
            {registrations.slice(0, 5).map((row) => (
              <div key={row.id} className="flex items-center justify-between rounded-lg bg-white/8 px-3 py-2 text-sm">
                <span className="font-bold">{row.name}</span>
                <span className="text-white/60">{row.slot}</span>
              </div>
            ))}
            {registrations.length > 5 ? <p className="pt-1 text-xs font-bold text-[#7db7ff]">Ďalší hráči sú v detaile turnaja.</p> : null}
            {!registrations.length ? <p className="rounded-lg bg-white/8 px-3 py-4 text-sm text-white/68">Zatiaľ bez prihlásených hráčov.</p> : null}
          </div>
        </div>
      </div>

      {active ? (
        <RegistrationPanel tournament={tournament} registrations={registrations} onRegister={onRegister} />
      ) : null}
    </article>
  );
}

function RegistrationPanel({
  tournament,
  registrations,
  onRegister
}: {
  tournament: LiveTournament;
  registrations: TournamentRegistration[];
  onRegister: (registration: Omit<TournamentRegistration, "id" | "createdAt">) => void;
}) {
  const slots = useMemo(() => buildSlots(tournament), [tournament]);
  const takenSlots = new Set(registrations.map((row) => row.slot));
  const firstOpenSlot = slots.find((slot) => !takenSlots.has(slot)) || slots[0] || "";
  const [form, setForm] = useState<RegistrationForm>({ ...emptyForm, slot: firstOpenSlot });
  const [saved, setSaved] = useState(false);
  const paid = tournament.entryType === "paid";

  const submit = () => {
    if (!form.name.trim() || !form.email.trim() || !form.slot) return;
    onRegister({
      tournamentId: tournament.id,
      name: form.name,
      club: form.club || "Bez klubu",
      email: form.email,
      phone: form.phone,
      slot: form.slot,
      note: form.note,
      paymentStatus: paid ? "pending" : "free"
    });
    setForm({ ...emptyForm, slot: firstOpenSlot });
    setSaved(true);
  };

  return (
    <div className="border-t border-navy/10 bg-[#f6f9ff] p-6 md:p-8">
      <div className="grid gap-8 xl:grid-cols-[0.82fr_0.9fr_1.05fr]">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-kkhc">Výber štartu</p>
          <h4 className="sport-title mt-2 text-3xl text-navy">Vyber si čas a dráhu</h4>
          <div className="mt-5 grid max-h-[360px] gap-2 overflow-auto pr-1 sm:grid-cols-2">
            {slots.map((slot) => {
              const taken = takenSlots.has(slot);
              return (
                <button
                  key={slot}
                  type="button"
                  disabled={taken}
                  onClick={() => setForm({ ...form, slot })}
                  className={`rounded-lg border px-3 py-3 text-left text-sm transition ${
                    form.slot === slot
                      ? "border-kkhc bg-kkhc text-white"
                      : taken
                        ? "border-navy/10 bg-white/60 text-navy/30"
                        : "border-navy/10 bg-white text-navy hover:border-kkhc hover:text-kkhc"
                  }`}
                >
                  <span className="block font-black">{slot}</span>
                  <span className="text-xs opacity-70">{taken ? "Obsadené" : "Voľné miesto"}</span>
                </button>
              );
            })}
          </div>
        </div>

        <RegisteredPlayersPanel registrations={registrations} capacity={parseCapacity(tournament.capacity)} />

        <div className="rounded-xl border border-navy/10 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-kkhc">Prihláška</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field label="Meno hráča" value={form.name} onChange={(name) => setForm({ ...form, name })} />
            <Field label="Klub / mesto" value={form.club} onChange={(club) => setForm({ ...form, club })} />
            <Field label="E-mail" value={form.email} onChange={(email) => setForm({ ...form, email })} />
            <Field label="Telefón" value={form.phone} onChange={(phone) => setForm({ ...form, phone })} />
          </div>
          <label className="mt-3 block">
            <span className="mb-2 block text-xs font-black uppercase text-navy/55">Poznámka</span>
            <textarea
              value={form.note}
              onChange={(event) => setForm({ ...form, note: event.target.value })}
              className="min-h-24 w-full rounded-md border border-navy/10 bg-white px-3 py-3 text-sm text-navy outline-none transition focus:border-kkhc focus:ring-2 focus:ring-kkhc/15"
            />
          </label>

          <div className={`mt-4 rounded-lg border p-4 ${paid ? "border-[#1683ff]/25 bg-[#edf5ff]" : "border-emerald-200 bg-emerald-50"}`}>
            <p className="flex items-center gap-2 text-sm font-black text-navy">
              {paid ? <CreditCard size={17} className="text-kkhc" /> : <CheckCircle2 size={17} className="text-emerald-600" />}
              {paid ? `Štartovné: ${tournament.fee}` : "Turnaj je bez štartovného"}
            </p>
            <p className="mt-1 text-xs leading-5 text-navy/60">
              {paid ? "Po odoslaní je platba označená ako čakajúca. V produkcii sa tu napojí Stripe alebo klubový platobný link." : "Registrácia je bez platby, stačí odoslať prihlášku."}
            </p>
          </div>

          {saved ? <p className="mt-4 rounded-md bg-emerald-50 p-3 text-sm font-bold text-emerald-700">Prihláška je uložená. Admin ju uvidí v ďalšom kroku systému.</p> : null}

          <button
            type="button"
            onClick={submit}
            className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-[#1683ff] bg-[#147cff] px-6 text-sm font-black uppercase text-white shadow-[0_14px_34px_rgba(20,124,255,.26)] transition hover:-translate-y-0.5 hover:bg-[#238bff]"
          >
            {paid ? "Registrovať a pripraviť platbu" : "Odoslať prihlášku"} <ArrowRight size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}

function RegisteredPlayersPanel({ registrations, capacity }: { registrations: TournamentRegistration[]; capacity: number }) {
  return (
    <div className="rounded-xl border border-navy/10 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-kkhc">Prihlásení hráči</p>
          <h4 className="sport-title mt-2 text-3xl text-navy">{registrations.length} / {capacity}</h4>
        </div>
        <span className="rounded-full bg-[#edf5ff] px-3 py-1 text-xs font-black uppercase text-[#0757d8]">
          Live zoznam
        </span>
      </div>

      <div className="mt-5 max-h-[360px] space-y-2 overflow-auto pr-1">
        {registrations.map((row, index) => (
          <div key={row.id} className="rounded-lg border border-navy/10 bg-[#f6f9ff] p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-black text-navy">{index + 1}. {row.name}</p>
                <p className="mt-1 text-xs text-navy/55">{row.club}</p>
              </div>
              <span className="shrink-0 rounded-md bg-white px-2 py-1 text-xs font-bold text-navy/60">{row.slot}</span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-navy/55">
              <span>{row.email}</span>
              {row.phone ? <span>- {row.phone}</span> : null}
              <span className={row.paymentStatus === "free" ? "font-bold text-emerald-700" : "font-bold text-[#0757d8]"}>
                - {row.paymentStatus === "free" ? "bez platby" : "platba čaká"}
              </span>
            </div>
          </div>
        ))}

        {!registrations.length ? (
          <div className="rounded-lg border border-dashed border-navy/15 bg-[#f6f9ff] p-5 text-sm leading-6 text-navy/60">
            Zatiaľ sa nikto neprihlásil. Keď hráč odošle prihlášku, okamžite sa zobrazí tu aj v admin paneli.
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Info({ icon: Icon, label, value }: { icon: typeof CalendarDays; label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[#f5f8fd] p-3">
      <Icon size={18} className="mb-2 text-kkhc" />
      <p className="text-[11px] font-black uppercase text-navy/45">{label}</p>
      <p className="mt-1 font-bold text-navy">{value}</p>
    </div>
  );
}

function MiniStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/8 p-4">
      <p className="sport-title text-3xl text-white">{value}</p>
      <p className="text-xs font-black uppercase text-white/55">{label}</p>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase text-navy/55">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-md border border-navy/10 bg-white px-3 text-sm text-navy outline-none transition focus:border-kkhc focus:ring-2 focus:ring-kkhc/15"
      />
    </label>
  );
}

function normalizeTournament(tournament: LiveTournament): LiveTournament {
  return {
    ...tournament,
    entryType: tournament.entryType || (tournament.fee?.toLowerCase().includes("zadarmo") ? "free" : "paid"),
    description: tournament.description || "",
    lanes: tournament.lanes || "4",
    paymentUrl: tournament.paymentUrl || ""
  };
}

function parseCapacity(capacity: string) {
  const value = parseInt(capacity, 10);
  return Number.isFinite(value) && value > 0 ? value : 32;
}

function buildSlots(tournament: LiveTournament) {
  const lanes = Math.max(parseInt(tournament.lanes || "4", 10) || 4, 1);
  const capacity = parseCapacity(tournament.capacity);
  const waves = Math.max(Math.ceil(capacity / lanes), 1);
  const [rawHour, rawMinute] = tournament.time.split(":").map((part) => parseInt(part, 10));
  const baseHour = Number.isFinite(rawHour) ? rawHour : 9;
  const baseMinute = Number.isFinite(rawMinute) ? rawMinute : 0;

  return Array.from({ length: waves }).flatMap((_, wave) => {
    const totalMinutes = baseHour * 60 + baseMinute + wave * 35;
    const hour = Math.floor(totalMinutes / 60) % 24;
    const minute = totalMinutes % 60;
    const time = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
    return Array.from({ length: lanes }).map((__, lane) => `${time} · dráha ${lane + 1}`);
  }).slice(0, capacity);
}
