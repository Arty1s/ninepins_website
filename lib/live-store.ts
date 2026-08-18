export type LiveTournament = {
  id: number;
  name: string;
  date: string;
  dateFrom: string;
  dateTo: string;
  time: string;
  status: string;
  location: string;
  capacity: string;
  fee: string;
  entryType: "free" | "paid";
  description: string;
  lanes: string;
  paymentUrl: string;
  type: "upcoming" | "current" | "past";
};

export type LiveLeague = {
  id: number;
  name: string;
  season: string;
  teams: string;
  status: string;
  leader: string;
};

export type LivePlayer = {
  id: number;
  name: string;
  team: string;
  role: string;
  average: string;
  externalPlayerId: number | null;
  externalLeagueId: number | null;
  externalTeamId: number | null;
  season: string;
  category: string;
  profileUrl: string;
  matches: number | null;
  totalPerformance: number | null;
  bestPerformance: number | null;
  full: number | null;
  clearing: number | null;
  faults: number | null;
  sourceUrl: string;
  rosterKey: string;
};

export type LiveMember = {
  id: number;
  name: string;
  email: string;
  team: string;
  role: "admin" | "coach" | "player" | "member";
  memberSince: string;
  membershipStatus: "paid" | "unpaid" | "pending";
  lastPayment: string;
  nextPayment: string;
  authProvider: string;
  avatarUrl: string;
};

export type LiveTeam = {
  id: number;
  slug: string;
  name: string;
  league: string;
  externalLeagueId: number | null;
  externalTeamId: number | null;
  competition: string;
  category: string;
  season: string;
  sourceUrl: string;
  isHlohovecTeam: boolean;
  coach: string;
  captain: string;
  members: string;
  achievements: string;
  description: string;
  standing: string;
  matchesPlayed: number | null;
  wins: number | null;
  draws: number | null;
  losses: number | null;
  points: number | null;
};

export type LiveMatch = {
  id: number;
  sourceUrl: string;
  league: string;
  competition: string;
  season: string;
  round: string;
  date: string;
  location: string;
  home: string;
  away: string;
  externalLeagueId: number | null;
  homeExternalTeamId: number | null;
  awayExternalTeamId: number | null;
  score: string;
  pins: string;
  status: string;
  detailRows: string;
  homeTeam: LiveMatchTeam | null;
  awayTeam: LiveMatchTeam | null;
  importKey: string;
  importedAt: string;
  importStatus: "manual" | "auto" | "edited";
  adminLocked: boolean;
};

export type LiveMatchPlayer = {
  name: string;
  externalPlayerId: number | null;
  profileUrl: string;
  full: number | null;
  clearing: number | null;
  faults: number | null;
  total: number | null;
  point: number | null;
};

export type LiveMatchTeam = {
  name: string;
  players: LiveMatchPlayer[];
  fullTotal: number | null;
  clearingTotal: number | null;
  faultsTotal: number | null;
  pinsTotal: number | null;
  pointsTotal: number | null;
};

export type LiveGalleryAlbum = {
  id: number;
  slug: string;
  title: string;
  category: "zapasy" | "turnaje" | "podujatia" | "zakulisie";
  date: string;
  description: string;
  coverImage: string;
  photos: string;
  featured: boolean;
};

export type LiveStandingRow = {
  id: number;
  league: string;
  category: string;
  season: string;
  team: string;
  externalLeagueId: number | null;
  externalTeamId: number | null;
  position: number | null;
  matchesPlayed: number | null;
  wins: number | null;
  draws: number | null;
  losses: number | null;
  score: string;
  pins: string;
  points: number | null;
  isHlohovecTeam: boolean;
};

export type LiveClubData = {
  tournaments: LiveTournament[];
  leagues: LiveLeague[];
  players: LivePlayer[];
  members: LiveMember[];
  teams: LiveTeam[];
  matches: LiveMatch[];
  standings: LiveStandingRow[];
  gallery: LiveGalleryAlbum[];
};

export const LIVE_STORE_KEY = "kkhc-live-club-data";
export const LIVE_STORE_EVENT = "kkhc-live-club-data-change";
export const TOURNAMENT_REGISTRATION_KEY = "kkhc-tournament-registrations";
export const TOURNAMENT_REGISTRATION_EVENT = "kkhc-tournament-registrations-change";

export const defaultLiveData: LiveClubData = {
  tournaments: [
    {
      id: 1,
      name: "KK Hlohovec Open 2025",
      date: "21. jún 2025",
      time: "18:00",
      status: "Registrácia otvorená",
      location: "Kolkáreň Hlohovec",
      capacity: "64 hráčov",
      fee: "15 €",
      entryType: "paid",
      description: "Otvorený turnaj pre registrovaných aj rekreačných hráčov. Vyber si časový slot a potvrď účasť.",
      lanes: "4",
      paymentUrl: "",
      type: "upcoming"
    },
    {
      id: 2,
      name: "Memoriál KKHC",
      date: "18. júl 2026",
      time: "10:00",
      status: "Pripravuje sa",
      location: "Bernolákova 720",
      capacity: "48 hráčov",
      fee: "12 €",
      entryType: "paid",
      description: "Klubový memoriál s kapacitou podľa obsadenosti dráh. Po registrácii admin potvrdí štart.",
      lanes: "4",
      paymentUrl: "",
      type: "upcoming"
    },
    {
      id: 3,
      name: "Náborový turnaj pre verejnosť",
      date: "05. september 2026",
      time: "15:00",
      status: "Bez štartovného",
      location: "Kolkáreň Hlohovec",
      capacity: "32 hráčov",
      fee: "zadarmo",
      entryType: "free",
      description: "Voľný vstup pre nových hráčov, rodičov a ľudí z Hlohovca, ktorí si chcú kolky vyskúšať.",
      lanes: "4",
      paymentUrl: "",
      type: "upcoming"
    }
  ],
  leagues: [
    { id: 1, name: "Mestská liga Hlohovec", season: "2025/2026", teams: "12", status: "Prebieha", leader: "Kolkári Centrum" }
  ],
  players: [
    { id: 1, name: "Michaela Vavrová", team: "KK Hlohovec", role: "Hráčka", average: "čaká na import" },
    { id: 2, name: "Peter Kováč", team: "Prvá liga", role: "Hráč", average: "612" }
  ],
  members: [
    {
      id: 1,
      name: "Michaela Vavrová",
      email: "michaela@kkhlohovec.sk",
      team: "KK Hlohovec",
      role: "player",
      memberSince: "2026-07-22",
      membershipStatus: "pending",
      lastPayment: "-",
      nextPayment: "Po aktivácii členstva"
    },
    {
      id: 2,
      name: "Peter Kováč",
      email: "peter@example.com",
      team: "Prvá liga",
      role: "player",
      memberSince: "2024-05-01",
      membershipStatus: "paid",
      lastPayment: "2026-07-01",
      nextPayment: "2026-08-01"
    }
  ],
  teams: [
    { id: 1, slug: "dorastenecka-liga", name: "Dorastenecká liga", league: "Mládež a rozvoj", coach: "Tréner doplní admin", captain: "Kapitán dorastu doplní admin", members: "Mladý hráč 1, Mladý hráč 2, Mladá hráčka 3", achievements: "Pravidelný nábor nových talentov; Účasť na mládežníckych turnajoch", description: "Mladí hráči a hráčky, ktorí sa učia techniku a klubové hodnoty." },
    { id: 2, slug: "zenska-extraliga", name: "Ženská extraliga", league: "Najvyššia ženská súťaž", coach: "Trénerka doplní admin", captain: "Kapitánka doplní admin", members: "Hráčka 1, Hráčka 2, Hráčka 3", achievements: "Extraligové zápasy žien; Osobné úspechy doplní admin", description: "Ženský tím reprezentujúci Hlohovec v najvyššej súťaži." },
    { id: 3, slug: "prva-liga", name: "Prvá liga", league: "Súťažné družstvo", coach: "Tréner doplní admin", captain: "Kapitán doplní admin", members: "Michaela Vavrová, Hráč 2, Hráč 3, Hráč 4", achievements: "Ligové výsledky bude dopĺňať admin; Detailné zápisnice budú prepojené so sekciou zápasy", description: "Skúsený súťažný tím postavený na pravidelnom tréningu." },
    { id: 4, slug: "druha-liga", name: "Druhá liga", league: "Seniorská liga", coach: "Tréner doplní admin", captain: "Kapitán doplní admin", members: "Hráč 1, Hráč 2, Hráč 3", achievements: "Silná domáca bilancia; Regionálne zápasy a turnaje", description: "Tím prepájajúci skúsených hráčov s novými členmi." },
    { id: 5, slug: "tretia-liga", name: "Tretia liga", league: "Rozvojová súťaž", coach: "Tréner doplní admin", captain: "Kapitán doplní admin", members: "Hráč 1, Hráč 2, Hráč 3", achievements: "Aktívna klubová základňa; Výsledky doplní admin", description: "Priestor pre členov, ktorí chcú pravidelne hrávať." }
  ],
  matches: [],
  standings: [],
  gallery: [
    { id: 1, slug: "kk-hlohovec-podbrezova", title: "KK Hlohovec - SK Železiarne Podbrezová", category: "zapasy", date: "12. máj 2024", description: "Domáci zápas a atmosféra v kolkárni.", coverImage: "/images/gallery-1.jpg", photos: "/images/gallery-1.jpg, /images/gallery-2.jpg, /images/gallery-3.jpg", featured: true },
    { id: 2, slug: "priprava-pred-zapasom", title: "Príprava pred zápasom", category: "zakulisie", date: "10. máj 2024", description: "Tímová príprava a šatňa pred zápasom.", coverImage: "/images/team-photo.jpg", photos: "/images/team-photo.jpg, /images/players-action.jpg, /images/gallery-2.jpg", featured: true },
    { id: 3, slug: "vitazi-pohara-slovenska-2024", title: "Víťazi Pohára Slovenska 2024", category: "turnaje", date: "5. máj 2024", description: "Trofeje, medaily a klubová hrdosť.", coverImage: "/images/trophies.jpg", photos: "/images/trophies.jpg, /images/team-photo.jpg, /images/gallery-3.jpg", featured: true }
  ]
};

export function readLiveData(): LiveClubData {
  if (typeof window === "undefined") return defaultLiveData;

  try {
    const raw = window.localStorage.getItem(LIVE_STORE_KEY);
    if (!raw) return defaultLiveData;
    const parsed = JSON.parse(raw) as Partial<LiveClubData>;
    return {
      tournaments: parsed.tournaments.length ? parsed.tournaments : defaultLiveData.tournaments,
      leagues: parsed.leagues.length ? parsed.leagues : defaultLiveData.leagues,
      players: parsed.players.length ? parsed.players : defaultLiveData.players,
      members: parsed.members.length ? parsed.members : defaultLiveData.members,
      teams: parsed.teams.length ? parsed.teams : defaultLiveData.teams,
      matches: parsed.matches.length ? parsed.matches : defaultLiveData.matches,
      standings: parsed.standings.length ? parsed.standings : defaultLiveData.standings,
      gallery: parsed.gallery.length ? parsed.gallery : defaultLiveData.gallery
    };
  } catch {
    return defaultLiveData;
  }
}

export function writeLiveData(data: LiveClubData) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LIVE_STORE_KEY, JSON.stringify(data));
  window.dispatchEvent(new CustomEvent(LIVE_STORE_EVENT, { detail: data }));
}

export function subscribeLiveData(callback: (data: LiveClubData) => void) {
  if (typeof window === "undefined") return () => undefined;

  const handler = () => callback(readLiveData());
  const storageHandler = (event: StorageEvent) => {
    if (event.key === LIVE_STORE_KEY) callback(readLiveData());
  };

  window.addEventListener(LIVE_STORE_EVENT, handler);
  window.addEventListener("storage", storageHandler);

  return () => {
    window.removeEventListener(LIVE_STORE_EVENT, handler);
    window.removeEventListener("storage", storageHandler);
  };
}

export async function refreshLiveDataFromBackend() {
  if (typeof window === "undefined") return defaultLiveData;

  try {
    const response = await fetch("/api/club-data", { cache: "no-store" });
    if (!response.ok) return readLiveData();
    const payload = await response.json() as { data: LiveClubData };
    if (!payload.data) return readLiveData();
    writeLiveData(payload.data);
    return payload.data;
  } catch {
    return readLiveData();
  }
}

export async function persistLiveDataToBackend(data: LiveClubData) {
  if (typeof window === "undefined") return false;

  try {
    const response = await fetch("/api/admin/live-data", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ data })
    });
    return response.ok;
  } catch {
    return false;
  }
}

export type TournamentRegistration = {
  id: number;
  tournamentId: number;
  name: string;
  club: string;
  email: string;
  userEmail: string;
  phone: string;
  slot: string;
  note: string;
  paymentStatus: "free" | "pending" | "paid" | "refunded" | "cancelled";
  createdAt: string;
  cancelledAt: string | null;
  cancellationStatus: "active" | "cancelled" | "refund_due" | "no_refund";
};

export function readTournamentRegistrations(): TournamentRegistration[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(TOURNAMENT_REGISTRATION_KEY);
    return raw ? JSON.parse(raw) as TournamentRegistration[] : [];
  } catch {
    return [];
  }
}

export function writeTournamentRegistrations(rows: TournamentRegistration[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOURNAMENT_REGISTRATION_KEY, JSON.stringify(rows));
  window.dispatchEvent(new CustomEvent(TOURNAMENT_REGISTRATION_EVENT, { detail: rows }));
}

export function subscribeTournamentRegistrations(callback: (rows: TournamentRegistration[]) => void) {
  if (typeof window === "undefined") return () => undefined;

  const handler = () => callback(readTournamentRegistrations());
  const storageHandler = (event: StorageEvent) => {
    if (event.key === TOURNAMENT_REGISTRATION_KEY) callback(readTournamentRegistrations());
  };

  window.addEventListener(TOURNAMENT_REGISTRATION_EVENT, handler);
  window.addEventListener("storage", storageHandler);

  return () => {
    window.removeEventListener(TOURNAMENT_REGISTRATION_EVENT, handler);
    window.removeEventListener("storage", storageHandler);
  };
}

export async function refreshTournamentRegistrationsFromBackend(tournamentId: number) {
  if (typeof window === "undefined") return [];

  try {
    const suffix = tournamentId ? `tournamentId=${encodeURIComponent(tournamentId)}` : "";
    const response = await fetch(`/api/tournament-registrations${suffix}`, { cache: "no-store" });
    if (!response.ok) return readTournamentRegistrations();
    const payload = await response.json() as { data: TournamentRegistration[] };
    if (!payload.data) return readTournamentRegistrations();
    if (!tournamentId) writeTournamentRegistrations(payload.data);
    return payload.data;
  } catch {
    return readTournamentRegistrations();
  }
}

export async function persistTournamentRegistrationsToBackend(rows: TournamentRegistration[]) {
  if (typeof window === "undefined") return false;

  try {
    const response = await fetch("/api/admin/tournament-registrations", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ data: rows })
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function createTournamentRegistrationInBackend(registration: Omit<TournamentRegistration, "id" | "createdAt">) {
  if (typeof window === "undefined") return null;

  try {
    const response = await fetch("/api/tournament-registrations", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(registration)
    });
    if (!response.ok) return null;
    const payload = await response.json() as { data: TournamentRegistration };
    return payload.data ?? null;
  } catch {
    return null;
  }
}

export async function cancelTournamentRegistrationInBackend(registrationId: number, email: string) {
  if (typeof window === "undefined") return null;

  try {
    const response = await fetch(`/api/tournament-registrations/${registrationId}`, {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: email || "" })
    });
    if (!response.ok) return null;
    const payload = await response.json() as { data: TournamentRegistration; refundEligible: boolean };
    return payload;
  } catch {
    return null;
  }
}

export async function deleteTournamentRegistrationInBackend(registrationId: number) {
  if (typeof window === "undefined") return false;

  try {
    const response = await fetch(`/api/admin/tournament-registrations/${registrationId}`, {
      method: "DELETE"
    });
    return response.ok;
  } catch {
    return false;
  }
}
