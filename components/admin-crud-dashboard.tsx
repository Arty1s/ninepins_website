"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { Download, LogOut, Pencil, Plus, Save, Shield, Trash2, Trophy, Users, Images, Swords } from "lucide-react";
import {
  defaultLiveData,
  persistLiveDataToBackend,
  readLiveData,
  refreshLiveDataFromBackend,
  subscribeLiveData,
  writeLiveData,
  type LiveClubData,
  type LiveGalleryAlbum,
  type LiveMatch,
  type LiveMember,
  type LiveTeam,
  type LiveTournament
} from "@/lib/live-store";

export type AdminTab = "turnaje" | "galeria" | "clenovia" | "timy" | "zapasy" | "import";

const adminSurfaceClass =
  "rounded-2xl border border-white/[0.05] bg-[linear-gradient(180deg,#0A1D3A_0%,#08172E_100%)] shadow-[0_8px_30px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.04)]";

export function AdminCrudDashboard({ initialActive = "turnaje", compactHeader = false }: { initialActive?: AdminTab; compactHeader?: boolean }) {
  const [active, setActive] = useState<AdminTab>(initialActive);
  const [data, setData] = useState<LiveClubData>(defaultLiveData);
  const [adminEmail, setAdminEmail] = useState("admin");

  useEffect(() => {
    setData(readLiveData());
    refreshLiveDataFromBackend().then(setData).catch(() => undefined);
    return subscribeLiveData(setData);
  }, []);

  useEffect(() => {
    fetch("/api/auth/session", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((session) => {
        if (session?.user?.email) setAdminEmail(session.user.email);
      })
      .catch(() => undefined);
  }, []);

  const updateData = (next: LiveClubData) => {
    setData(next);
    writeLiveData(next);
    persistLiveDataToBackend(next).catch(() => undefined);
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/prihlasenie";
  };

  const stats = useMemo(
    () => [
      { label: "Turnaje", value: data.tournaments.length, icon: Trophy },
      { label: "Galérie", value: data.gallery.length, icon: Images },
      { label: "Členovia", value: data.members.length, icon: Users },
      { label: "Tímy", value: data.teams.length, icon: Shield },
      { label: "Zápasy", value: data.matches.length, icon: Swords }
    ],
    [data.gallery.length, data.matches.length, data.members.length, data.teams.length, data.tournaments.length]
  );

  return (
    <div className="space-y-6">
      {!compactHeader ? (
        <div className={`${adminSurfaceClass} flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between`}>
          <div>
            <p className="text-xs font-black uppercase text-[#1677ff]">Prihlásený administrátor</p>
            <h2 className="mt-1 text-xl font-black text-white">{adminEmail}</h2>
          </div>
          <button className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-red-400/20 px-5 text-sm font-black uppercase text-red-200 transition hover:bg-red-500/12" onClick={logout} type="button">
            <LogOut size={17} /> Odhlásiť sa
          </button>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-5">
        {stats.map((stat) => (
          <div key={stat.label} className={`${adminSurfaceClass} p-5`}>
            <stat.icon className="mb-4 h-7 w-7 text-[#1683ff]" />
            <p className="text-3xl font-black leading-none text-white">{stat.value}</p>
            <p className="mt-1 text-xs font-black uppercase text-[#9fb0c8]">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className={adminSurfaceClass}>
        <div className="flex flex-wrap gap-2 border-b border-white/[0.05] p-4">
          <TabButton active={active === "turnaje"} onClick={() => setActive("turnaje")}>Turnaje</TabButton>
          <TabButton active={active === "galeria"} onClick={() => setActive("galeria")}>Galéria</TabButton>
          <TabButton active={active === "clenovia"} onClick={() => setActive("clenovia")}>Členovia</TabButton>
          <TabButton active={active === "timy"} onClick={() => setActive("timy")}>Tímy</TabButton>
          <TabButton active={active === "zapasy"} onClick={() => setActive("zapasy")}>Zápasy</TabButton>
          <TabButton active={active === "import"} onClick={() => setActive("import")}>Import kolky.sk</TabButton>
        </div>

        <div className="p-5">
          {active === "turnaje" ? (
            <TournamentCrud rows={data.tournaments} setRows={(tournaments) => updateData({ ...data, tournaments })} />
          ) : active === "galeria" ? (
            <GalleryCrud rows={data.gallery} setRows={(gallery) => updateData({ ...data, gallery })} />
          ) : active === "clenovia" ? (
            <MemberCrud rows={data.members} setRows={(members) => updateData({ ...data, members })} />
          ) : active === "timy" ? (
            <TeamCrud rows={data.teams} members={data.members} setRows={(teams) => updateData({ ...data, teams })} />
          ) : active === "zapasy" ? (
            <MatchCrud rows={data.matches} setRows={(matches) => updateData({ ...data, matches })} />
          ) : (
            <KolkyImport rows={data.matches} setRows={(matches) => updateData({ ...data, matches })} />
          )}
        </div>
      </div>

      <div className={`${adminSurfaceClass} p-5`}>
        <h3 className="font-black uppercase text-white">Ako sa to bude správať v produkcii</h3>
        <p className="mt-2 text-sm leading-6 text-[#9fb0c8]">
          Teraz sa zmeny ukladajú lokálne a verejné stránky ich čítajú hneď. Produkčne sa tieto dáta presunú do Supabase tabuliek. Import zápasov bude volaný cron jobom každých 24 hodín a admin bude môcť importované záznamy stále ručne opraviť.
        </p>
      </div>
    </div>
  );
}

function TournamentCrud({ rows, setRows }: { rows: LiveTournament[]; setRows: (rows: LiveTournament[]) => void }) {
  const empty: Omit<LiveTournament, "id"> = { name: "", date: "", time: "18:00", status: "Pripravuje sa", location: "Kolkáreň Hlohovec", capacity: "32 hráčov", fee: "", entryType: "paid", description: "", lanes: "4", paymentUrl: "", type: "upcoming" };
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState<number | null>(null);
  const save = () => {
    if (!form.name.trim()) return;
    if (editingId) setRows(rows.map((row) => row.id === editingId ? { id: editingId, ...form } : row));
    else setRows([{ id: Date.now(), ...form }, ...rows]);
    setForm(empty);
    setEditingId(null);
  };

  return (
    <CrudShell title="Správa turnajov" description="Vytvor platený alebo bezplatný turnaj, nastav kapacitu, počet dráh, popis a stav. Verejná stránka Turnaje sa zmení okamžite.">
      <div className="grid gap-3 md:grid-cols-4">
        <Input label="Názov" value={form.name} onChange={(name) => setForm({ ...form, name })} />
        <Input label="Dátum" value={form.date} onChange={(date) => setForm({ ...form, date })} />
        <Input label="Čas" value={form.time} onChange={(time) => setForm({ ...form, time })} />
        <Input label="Stav" value={form.status} onChange={(status) => setForm({ ...form, status })} />
        <Input label="Miesto" value={form.location} onChange={(location) => setForm({ ...form, location })} />
        <Input label="Kapacita" value={form.capacity} onChange={(capacity) => setForm({ ...form, capacity })} />
        <Input label="Poplatok" value={form.fee} onChange={(fee) => setForm({ ...form, fee })} />
        <Input label="Počet dráh" value={form.lanes} onChange={(lanes) => setForm({ ...form, lanes })} />
        <Select label="Štartovné" value={form.entryType} onChange={(entryType) => setForm({ ...form, entryType: entryType as LiveTournament["entryType"], fee: entryType === "free" ? "zadarmo" : form.fee })} options={["paid", "free"]} />
        <Select label="Typ" value={form.type} onChange={(type) => setForm({ ...form, type: type as LiveTournament["type"] })} options={["upcoming", "current", "past"]} />
        <Input label="Stripe / platobný link" value={form.paymentUrl} onChange={(paymentUrl) => setForm({ ...form, paymentUrl })} />
        <Input label="Popis" value={form.description} onChange={(description) => setForm({ ...form, description })} />
      </div>
      <ActionButton onClick={save}>{editingId ? <Save size={17} /> : <Plus size={17} />} {editingId ? "Uložiť turnaj" : "Pridať turnaj"}</ActionButton>
      <DataTable headers={["Názov", "Dátum", "Stav", "Poplatok", "Kapacita"]} rows={rows.map((row) => ({ id: row.id, cells: [row.name, row.date, row.status, row.entryType === "free" ? "zadarmo" : row.fee, row.capacity] }))} onEdit={(id) => {
        const row = rows.find((item) => item.id === id);
        if (row) {
          setEditingId(id);
          setForm(row);
        }
      }} onDelete={(id) => setRows(rows.filter((row) => row.id !== id))} />
    </CrudShell>
  );
}

function GalleryCrud({ rows, setRows }: { rows: LiveGalleryAlbum[]; setRows: (rows: LiveGalleryAlbum[]) => void }) {
  const empty: Omit<LiveGalleryAlbum, "id"> = { slug: "", title: "", category: "zapasy", date: "", description: "", coverImage: "/images/gallery-1.jpg", photos: "/images/gallery-1.jpg, /images/gallery-2.jpg", featured: false };
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState<number | null>(null);
  const save = () => {
    if (!form.title.trim()) return;
    const slug = form.slug || slugify(form.title);
    const payload = { ...form, slug };
    if (editingId) setRows(rows.map((row) => row.id === editingId ? { id: editingId, ...payload } : row));
    else setRows([{ id: Date.now(), ...payload }, ...rows]);
    setForm(empty);
    setEditingId(null);
  };
  const uploadPhotos = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;

    const uploaded = await readFilesAsDataUrls(files);
    setForm({
      ...form,
      coverImage: uploaded[0] ?? form.coverImage,
      photos: uploaded.join(", ")
    });
    event.target.value = "";
  };

  return (
    <CrudShell title="Správa galérie" description="Admin môže meniť názov, popis, kategóriu a nahrať fotky priamo zo stránky. Prvá nahratá fotka sa automaticky použije ako cover albumu.">
      <div className="grid gap-3 md:grid-cols-4">
        <Input label="Názov albumu" value={form.title} onChange={(title) => setForm({ ...form, title })} />
        <Input label="Slug" value={form.slug} onChange={(slug) => setForm({ ...form, slug })} />
        <Select label="Kategória" value={form.category} onChange={(category) => setForm({ ...form, category: category as LiveGalleryAlbum["category"] })} options={["zapasy", "turnaje", "podujatia", "zakulisie"]} />
        <Input label="Dátum" value={form.date} onChange={(date) => setForm({ ...form, date })} />
        <Input label="Popis" value={form.description} onChange={(description) => setForm({ ...form, description })} />
        <Select label="Featured" value={String(form.featured)} onChange={(featured) => setForm({ ...form, featured: featured === "true" })} options={["false", "true"]} />
      </div>
      <GalleryUploadBox coverImage={form.coverImage} photoCount={splitCsv(form.photos).length} onUpload={uploadPhotos} />
      <ActionButton onClick={save}>{editingId ? <Save size={17} /> : <Plus size={17} />} {editingId ? "Uložiť album" : "Pridať album"}</ActionButton>
      <DataTable headers={["Album", "Kategória", "Dátum", "Fotky", "Cover"]} rows={rows.map((row) => ({ id: row.id, cells: [row.title, row.category, row.date, String(splitCsv(row.photos).length), row.coverImage.startsWith("data:") ? "nahratá fotka" : row.coverImage] }))} onEdit={(id) => {
        const row = rows.find((item) => item.id === id);
        if (row) {
          setEditingId(id);
          setForm(row);
        }
      }} onDelete={(id) => setRows(rows.filter((row) => row.id !== id))} />
    </CrudShell>
  );
}

function GalleryUploadBox({ coverImage, photoCount, onUpload }: { coverImage: string; photoCount: number; onUpload: (event: ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <div className="grid gap-4 rounded-xl border border-white/[0.05] bg-[#061a33]/55 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] md:grid-cols-[190px_1fr]">
      <div className="relative h-32 overflow-hidden rounded-lg bg-[#020b18]">
        {coverImage ? <img src={coverImage} alt="Cover albumu" className="h-full w-full object-cover" /> : null}
      </div>
      <div className="flex flex-col justify-center">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-[#7db7ff]">Fotky albumu</p>
        <p className="mt-2 text-sm leading-6 text-[#c7d6ee]">
          Nahraj fotky priamo tu. Aktuálne v albume: <strong className="text-white">{photoCount}</strong>.
        </p>
        <label className="mt-4 inline-flex h-11 w-fit cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#1683ff] bg-[#147cff] px-5 text-sm font-black uppercase text-white shadow-[0_12px_28px_rgba(20,124,255,.20)] transition hover:-translate-y-0.5 hover:bg-[#238bff]">
          <Images size={17} /> Nahrať fotky
          <input type="file" accept="image/*" multiple className="sr-only" onChange={onUpload} />
        </label>
        <p className="mt-2 text-xs text-[#9fb0c8]">Lokálne demo ukladá fotky do prehliadača. V produkcii sa upload napojí na Supabase Storage.</p>
      </div>
    </div>
  );
}

function MemberCrud({ rows, setRows }: { rows: LiveMember[]; setRows: (rows: LiveMember[]) => void }) {
  const empty: Omit<LiveMember, "id"> = { name: "", email: "", team: "KK Hlohovec", role: "member", memberSince: new Date().toISOString().slice(0, 10), membershipStatus: "pending", lastPayment: "-", nextPayment: "Po aktivácii členstva" };
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState<number | null>(null);
  const save = () => {
    if (!form.name.trim() || !form.email.trim()) return;
    if (editingId) setRows(rows.map((row) => row.id === editingId ? { id: editingId, ...form } : row));
    else setRows([{ id: Date.now(), ...form }, ...rows]);
    setForm(empty);
    setEditingId(null);
  };

  return (
    <CrudShell title="Správa členov" description="Admin vidí členov, tím, rolu, stav platby a odkedy sú členmi. Vie ich upraviť alebo odstrániť.">
      <div className="grid gap-3 md:grid-cols-4">
        <Input label="Meno" value={form.name} onChange={(name) => setForm({ ...form, name })} />
        <Input label="E-mail" value={form.email} onChange={(email) => setForm({ ...form, email })} />
        <Input label="Tím" value={form.team} onChange={(team) => setForm({ ...form, team })} />
        <Select label="Rola" value={form.role} onChange={(role) => setForm({ ...form, role: role as LiveMember["role"] })} options={["admin", "coach", "player", "member"]} />
        <Input label="Člen od" value={form.memberSince} onChange={(memberSince) => setForm({ ...form, memberSince })} />
        <Select label="Platba" value={form.membershipStatus} onChange={(membershipStatus) => setForm({ ...form, membershipStatus: membershipStatus as LiveMember["membershipStatus"] })} options={["paid", "pending", "unpaid"]} />
        <Input label="Posledná platba" value={form.lastPayment} onChange={(lastPayment) => setForm({ ...form, lastPayment })} />
        <Input label="Ďalšia platba" value={form.nextPayment} onChange={(nextPayment) => setForm({ ...form, nextPayment })} />
      </div>
      <ActionButton onClick={save}>{editingId ? <Save size={17} /> : <Plus size={17} />} {editingId ? "Uložiť člena" : "Pridať člena"}</ActionButton>
      <DataTable headers={["Meno", "Tím", "Platba", "Člen od", "Ďalšia platba"]} rows={rows.map((row) => ({ id: row.id, cells: [row.name, row.team, paymentLabel(row.membershipStatus), row.memberSince, row.nextPayment] }))} onEdit={(id) => {
        const row = rows.find((item) => item.id === id);
        if (row) {
          setEditingId(id);
          setForm(row);
        }
      }} onDelete={(id) => setRows(rows.filter((row) => row.id !== id))} />
    </CrudShell>
  );
}

function TeamCrud({ rows, members, setRows }: { rows: LiveTeam[]; members: LiveMember[]; setRows: (rows: LiveTeam[]) => void }) {
  const empty: Omit<LiveTeam, "id"> = { slug: "", name: "", league: "", coach: "", captain: "", members: "", achievements: "", description: "" };
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState<number | null>(null);
  const save = () => {
    if (!form.name.trim()) return;
    const payload = { ...form, slug: form.slug || slugify(form.name) };
    if (editingId) setRows(rows.map((row) => row.id === editingId ? { id: editingId, ...payload } : row));
    else setRows([{ id: Date.now(), ...payload }, ...rows]);
    setForm(empty);
    setEditingId(null);
  };
  const memberNames = members.map((member) => member.name).join(", ");

  return (
    <CrudShell title="Správa tímov" description="Tímy a ligy sú jedna sekcia. Tu admin mení kategóriu/ligu, trénera, kapitána, členov a úspechy tímu.">
      <p className="rounded-xl bg-[#1683ff]/10 p-3 text-sm text-[#cfe5ff]">Dostupní členovia: {memberNames || "zatiaľ bez členov"}</p>
      <div className="grid gap-3 md:grid-cols-3">
        <Input label="Slug" value={form.slug} onChange={(slug) => setForm({ ...form, slug })} />
        <Input label="Názov tímu" value={form.name} onChange={(name) => setForm({ ...form, name })} />
        <Input label="Liga/kategória" value={form.league} onChange={(league) => setForm({ ...form, league })} />
        <Input label="Tréner" value={form.coach} onChange={(coach) => setForm({ ...form, coach })} />
        <Input label="Kapitán" value={form.captain} onChange={(captain) => setForm({ ...form, captain })} />
        <Input label="Členovia CSV" value={form.members} onChange={(membersValue) => setForm({ ...form, members: membersValue })} />
        <Input label="Úspechy ; oddelené" value={form.achievements} onChange={(achievements) => setForm({ ...form, achievements })} />
        <Input label="Popis" value={form.description} onChange={(description) => setForm({ ...form, description })} />
      </div>
      <ActionButton onClick={save}>{editingId ? <Save size={17} /> : <Plus size={17} />} {editingId ? "Uložiť tím" : "Pridať tím"}</ActionButton>
      <DataTable headers={["Tím", "Liga/kategória", "Kapitán", "Členovia"]} rows={rows.map((row) => ({ id: row.id, cells: [row.name, row.league, row.captain, row.members] }))} onEdit={(id) => {
        const row = rows.find((item) => item.id === id);
        if (row) {
          setEditingId(id);
          setForm(row);
        }
      }} onDelete={(id) => setRows(rows.filter((row) => row.id !== id))} />
    </CrudShell>
  );
}

function MatchCrud({ rows, setRows }: { rows: LiveMatch[]; setRows: (rows: LiveMatch[]) => void }) {
  const empty: Omit<LiveMatch, "id"> = { sourceUrl: "", league: "", round: "", date: "", location: "", home: "", away: "", score: "", pins: "", status: "plánované", detailRows: "", importStatus: "manual" };
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState<number | null>(null);
  const save = () => {
    if (!form.home.trim() || !form.away.trim()) return;
    const payload = { ...form, importStatus: editingId ? "edited" as const : form.importStatus };
    if (editingId) setRows(rows.map((row) => row.id === editingId ? { id: editingId, ...payload } : row));
    else setRows([{ id: Date.now(), ...payload }, ...rows]);
    setForm(empty);
    setEditingId(null);
  };

  return (
    <CrudShell title="Správa zápasov" description="Admin vidí importované aj ručne pridané zápasy. Vie upraviť skóre, kolky, detailnú zápisnicu alebo plánovaný zápas.">
      <div className="grid gap-3 md:grid-cols-4">
        <Input label="Liga" value={form.league} onChange={(league) => setForm({ ...form, league })} />
        <Input label="Kolo" value={form.round} onChange={(round) => setForm({ ...form, round })} />
        <Input label="Dátum" value={form.date} onChange={(date) => setForm({ ...form, date })} />
        <Input label="Miesto" value={form.location} onChange={(location) => setForm({ ...form, location })} />
        <Input label="Domáci" value={form.home} onChange={(home) => setForm({ ...form, home })} />
        <Input label="Hostia" value={form.away} onChange={(away) => setForm({ ...form, away })} />
        <Input label="Skóre" value={form.score} onChange={(score) => setForm({ ...form, score })} />
        <Input label="Kolky" value={form.pins} onChange={(pins) => setForm({ ...form, pins })} />
        <Select label="Stav" value={form.status} onChange={(status) => setForm({ ...form, status: status as LiveMatch["status"] })} options={["plánované", "odohrané", "import"]} />
        <Input label="Zdroj URL" value={form.sourceUrl} onChange={(sourceUrl) => setForm({ ...form, sourceUrl })} />
        <Input label="Detailné riadky" value={form.detailRows} onChange={(detailRows) => setForm({ ...form, detailRows })} />
      </div>
      <ActionButton onClick={save}>{editingId ? <Save size={17} /> : <Plus size={17} />} {editingId ? "Uložiť zápas" : "Pridať zápas"}</ActionButton>
      <DataTable headers={["Liga", "Dátum", "Zápas", "Skóre", "Zdroj"]} rows={rows.map((row) => ({ id: row.id, cells: [row.league, row.date, `${row.home} vs ${row.away}`, row.score, row.importStatus || "manual"] }))} onEdit={(id) => {
        const row = rows.find((item) => item.id === id);
        if (row) {
          setEditingId(id);
          setForm(row);
        }
      }} onDelete={(id) => setRows(rows.filter((row) => row.id !== id))} />
    </CrudShell>
  );
}

function KolkyImport({ rows, setRows }: { rows: LiveMatch[]; setRows: (rows: LiveMatch[]) => void }) {
  const [url, setUrl] = useState("https://vysledky.kolky.sk/match/detail/43531/KO-Zarnovica-vs-KKZ-Hlohovec-A");
  const [message, setMessage] = useState("");

  const importMatch = async () => {
    if (!url.includes("vysledky.kolky.sk")) {
      setMessage("Použi link z vysledky.kolky.sk.");
      return;
    }

    setMessage("Importujem zo zdroja...");
    try {
      const response = await fetch(`/api/import/kolky?url=${encodeURIComponent(url)}`, { method: "POST" });
      const payload = await response.json() as { ok?: boolean; matches?: LiveMatch[]; warnings?: string[] };
      if (!response.ok || !payload.ok) {
        setMessage("Import zlyhal. Skontroluj URL alebo prihlásenie admina.");
        return;
      }
      const imported = payload.matches || [];
      if (!imported.length) {
        setMessage(payload.warnings?.[0] || "Import prebehol, ale nenašiel zápas s Hlohovcom.");
        return;
      }
      setRows([...imported, ...rows.filter((row) => !imported.some((match) => match.sourceUrl === row.sourceUrl))]);
      setMessage("Import uložený z backendu. Admin ho môže upraviť v sekcii Zápasy.");
    } catch {
      setMessage("Import zlyhal. Lokálne alebo externé spojenie nie je dostupné.");
    }
  };

  return (
    <CrudShell title="Import z vysledky.kolky.sk" description="Ručne vlož detail zápasu alebo použi backend endpoint. Produkčne ho bude volať cron každých 24 hodín a vezme zápasy, kde je Hlohovec.">
      <div className="grid gap-3 md:grid-cols-[1fr_auto]">
        <Input label="URL zápasu" value={url} onChange={setUrl} />
        <div className="flex flex-wrap items-end gap-2">
          <ActionButton onClick={importMatch}><Download size={17} /> Importovať</ActionButton>
        </div>
      </div>
      {message ? <p className="rounded-xl bg-emerald-500/12 p-3 text-sm font-bold text-emerald-200">{message}</p> : null}
      <div className="rounded-xl bg-[#1683ff]/10 p-4 text-sm leading-6 text-[#cfe5ff]">
        <p className="font-black text-white">Backend endpoint pripravený:</p>
        <p className="mt-1">`/api/import/kolky` - v produkcii ho nastavíme ako 24h cron. Ak parser nájde Hlohovec, zápas sa pridá na web a admin ho stále vie ručne prepísať.</p>
      </div>
    </CrudShell>
  );
}

function CrudShell({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-3xl font-black leading-none text-white">{title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#9fb0c8]">{description}</p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-md bg-emerald-500/14 px-3 py-2 text-xs font-black uppercase text-emerald-300">
          <Save size={14} /> Live save
        </span>
      </div>
      <div className="space-y-5">{children}</div>
    </div>
  );
}

function DataTable({ headers, rows, onEdit, onDelete }: { headers: string[]; rows: { id: number; cells: string[] }[]; onEdit: (id: number) => void; onDelete: (id: number) => void }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-white/[0.05] bg-[#061a33]/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="bg-white/[0.025] text-xs font-black uppercase text-[#9fb0c8]">
          <tr>
            {headers.map((header) => <th key={header} className="px-4 py-3">{header}</th>)}
            <th className="px-4 py-3 text-right">Akcie</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t border-white/[0.045]">
              {row.cells.map((cell, index) => <td key={`${row.id}-${index}`} className="px-4 py-4 text-[#dbe7ff]">{cell}</td>)}
              <td className="px-4 py-4">
                <div className="flex justify-end gap-2">
                  <button className="grid h-9 w-9 place-items-center rounded-md border border-white/[0.06] text-[#dbe7ff] transition hover:border-blue-400/25 hover:text-[#1683ff]" onClick={() => onEdit(row.id)} type="button" title="Upraviť"><Pencil size={16} /></button>
                  <button className="grid h-9 w-9 place-items-center rounded-md border border-red-400/20 text-red-300 transition hover:bg-red-500/12" onClick={() => onDelete(row.id)} type="button" title="Vymazať"><Trash2 size={16} /></button>
                </div>
              </td>
            </tr>
          ))}
          {!rows.length ? (
            <tr><td className="px-4 py-6 text-[#9fb0c8]" colSpan={headers.length + 1}>Zatiaľ bez záznamov.</td></tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button className={`rounded-md px-4 py-2 text-sm font-black uppercase transition ${active ? "bg-[#1683ff] text-white shadow-[0_8px_22px_rgba(20,124,255,0.20)]" : "border border-white/[0.04] bg-[#061a33]/60 text-[#c7d6ee] hover:bg-[#0d3d78] hover:text-white"}`} onClick={onClick} type="button">{children}</button>;
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase text-[#9fb0c8]">{label}</span>
      <input className="h-11 w-full rounded-md border border-white/[0.06] bg-[#061a33]/70 px-3 text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] outline-none transition focus:border-blue-400/35 focus:ring-2 focus:ring-[#1683ff]/15" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase text-[#9fb0c8]">{label}</span>
      <select className="h-11 w-full rounded-md border border-white/[0.06] bg-[#061a33]/70 px-3 text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] outline-none transition focus:border-blue-400/35 focus:ring-2 focus:ring-[#1683ff]/15" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}

function ActionButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return <button className="inline-flex h-11 items-center gap-2 rounded-lg border border-[#1683ff] bg-[#147cff] px-5 text-sm font-black uppercase text-white shadow-[0_12px_28px_rgba(20,124,255,.24)] transition hover:-translate-y-0.5 hover:bg-[#238bff]" onClick={onClick} type="button">{children}</button>;
}

function slugify(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function splitCsv(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function readFilesAsDataUrls(files: File[]) {
  return Promise.all(
    files.map(
      (file) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result ?? ""));
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(file);
        })
    )
  );
}

function paymentLabel(status: LiveMember["membershipStatus"]) {
  if (status === "paid") return "Zaplatené";
  if (status === "pending") return "Čaká na platbu";
  return "Nezaplatené";
}
