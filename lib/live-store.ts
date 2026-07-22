export type LiveTournament = {
  id: number;
  name: string;
  date: string;
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
};

export type LiveTeam = {
  id: number;
  slug: string;
  name: string;
  league: string;
  coach: string;
  captain: string;
  members: string;
  achievements: string;
  description: string;
};

export type LiveMatch = {
  id: number;
  sourceUrl: string;
  league: string;
  round: string;
  date: string;
  location: string;
  home: string;
  away: string;
  score: string;
  pins: string;
  status: "odohrané" | "plánované" | "import";
  detailRows: string;
  importedAt?: string;
  importStatus?: "manual" | "auto" | "edited";
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

export type LiveClubData = {
  tournaments: LiveTournament[];
  leagues: LiveLeague[];
  players: LivePlayer[];
  members: LiveMember[];
  teams: LiveTeam[];
  matches: LiveMatch[];
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
  matches: [
    { id: 1, sourceUrl: "https://vysledky.kolky.sk/match/detail/43531/KO-Zarnovica-vs-KKZ-Hlohovec-A", league: "Extraliga muži", round: "22. kolo", date: "18.04.2026", location: "Žarnovica", home: "KO Žarnovica", away: "KKZ Hlohovec A", score: "7.0 : 1.0", pins: "3 586 : 3 372", status: "odohrané", importStatus: "manual", detailRows: "Jančovič Martin | 629 | Novosad Róbert | 537\nNasvetr Dalibor | 574 | Poláčik Roman | 588\nTkáč Ján | 582 | Vlčko Jaroslav | 573\nKlubert Dávid | 592 | Jaderko Róbert | 574\nFúska Radoslav st. | 590 | Šišan Michal | 541\nPašiak Tomáš | 619 | Kadlečík Matúš | 559" },
    { id: 2, sourceUrl: "", league: "1. KL západ", round: "18. kolo", date: "11.05.2024", location: "Hlohovec", home: "KK Hlohovec", away: "TJ Rakovice", score: "6 : 2", pins: "3372 : 3291", status: "odohrané", importStatus: "manual", detailRows: "" },
    { id: 3, sourceUrl: "", league: "2. liga západ", round: "18. kolo", date: "25.05.2026", location: "Kolkáreň Hlohovec", home: "KK Hlohovec", away: "ŠKK Trnava", score: "vs", pins: "-", status: "plánované", importStatus: "manual", detailRows: "" }
  ],
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
      tournaments: parsed.tournaments?.length ? parsed.tournaments : defaultLiveData.tournaments,
      leagues: parsed.leagues?.length ? parsed.leagues : defaultLiveData.leagues,
      players: parsed.players?.length ? parsed.players : defaultLiveData.players,
      members: parsed.members?.length ? parsed.members : defaultLiveData.members,
      teams: parsed.teams?.length ? parsed.teams : defaultLiveData.teams,
      matches: parsed.matches?.length ? parsed.matches : defaultLiveData.matches,
      gallery: parsed.gallery?.length ? parsed.gallery : defaultLiveData.gallery
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

export type TournamentRegistration = {
  id: number;
  tournamentId: number;
  name: string;
  club: string;
  email: string;
  phone: string;
  slot: string;
  note: string;
  paymentStatus: "free" | "pending";
  createdAt: string;
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
