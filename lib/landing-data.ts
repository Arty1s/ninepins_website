import type { LucideIcon } from "lucide-react";
import { CalendarDays, Trophy, Users, Target } from "lucide-react";

export interface Team {
  name: string;
  shortName: string;
  badgeClass: string;
  logoUrl?: string;
}

export interface Player {
  name: string;
  team: string;
  average: number;
  image: string;
}

export interface MatchResult {
  homeScore: number;
  awayScore: number;
  homePins: number;
  awayPins: number;
}

export interface Match {
  league: string;
  date: string;
  homeTeam: Team;
  awayTeam: Team;
  result: MatchResult;
  detailHref: string;
}

export interface Event {
  day: string;
  month: string;
  title: string;
  type: string;
  place: string;
  time: string;
}

export interface LeagueStanding {
  rank: number;
  team: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  score: string;
  points: number;
}

export interface MembershipPlan {
  title: string;
  subtitle: string;
  price: string;
  features: string[];
  cta: string;
  featured: boolean;
  href: string;
}

export interface ClubStat {
  icon: LucideIcon;
  value: string;
  label: string;
}

export const kkhcTeam: Team = {
  name: "KK Hlohovec",
  shortName: "KKH",
  badgeClass: "from-[#0a3f96] to-[#071a3d]"
};

export const clubStats: ClubStat[] = [
  { icon: Trophy, value: "5+", label: "ligových titulov" },
  { icon: Users, value: "60+", label: "aktívnych členov" },
  { icon: CalendarDays, value: "20+", label: "turnajov ročne" },
  { icon: Target, value: "1", label: "cieľ: komunita a výsledky" }
];

export const latestMatches: Match[] = [
  {
    league: "1. KL ZÁPAD 2025/2026 - 18. KOLO",
    date: "11.05.2026",
    homeTeam: kkhcTeam,
    awayTeam: { name: "TJ Rakovice", shortName: "TJR", badgeClass: "from-[#c21d35] to-[#6f0f20]" },
    result: { homeScore: 6, awayScore: 2, homePins: 3372, awayPins: 3291 },
    detailHref: "/zapasy"
  },
  {
    league: "1. KL ZÁPAD 2025/2026 - 17. KOLO",
    date: "04.05.2026",
    homeTeam: kkhcTeam,
    awayTeam: { name: "KK Trstená", shortName: "TRS", badgeClass: "from-[#1f2937] to-[#64748b]" },
    result: { homeScore: 7, awayScore: 1, homePins: 3398, awayPins: 3230 },
    detailHref: "/zapasy"
  },
  {
    league: "1. KL ZÁPAD 2025/2026 - 16. KOLO",
    date: "27.04.2026",
    homeTeam: kkhcTeam,
    awayTeam: { name: "KK Inter Bratislava", shortName: "INT", badgeClass: "from-[#0d2c6b] to-[#030712]" },
    result: { homeScore: 5, awayScore: 3, homePins: 3301, awayPins: 3250 },
    detailHref: "/zapasy"
  }
];

export const upcomingEvents: Event[] = [
  { day: "25", month: "MÁJ", title: "Majstrovstvá regiónu jednotlivcov", type: "Turnaj jednotlivcov", place: "Hlohovec", time: "09:00" },
  { day: "08", month: "JÚN", title: "2. KL ZÁPAD - Finále", type: "Majstrovský zápas", place: "Hlohovec", time: "14:00" },
  { day: "22", month: "JÚN", title: "Letný pohár Hlohovec 2026", type: "Turnaj dvojíc", place: "Hlohovec", time: "09:00" }
];

export const leagueStandings: LeagueStanding[] = [
  { rank: 1, team: "KK Hlohovec", played: 18, wins: 14, draws: 1, losses: 3, score: "104.5", points: 29 },
  { rank: 2, team: "TJ Rakovice", played: 18, wins: 11, draws: 2, losses: 5, score: "98.0", points: 24 },
  { rank: 3, team: "KK Inter Bratislava", played: 18, wins: 10, draws: 1, losses: 7, score: "93.5", points: 21 },
  { rank: 4, team: "KK Trstená", played: 18, wins: 7, draws: 1, losses: 10, score: "86.0", points: 15 },
  { rank: 5, team: "KK Slavoj Trnava", played: 18, wins: 5, draws: 1, losses: 12, score: "80.0", points: 11 },
  { rank: 6, team: "KK Modranka", played: 18, wins: 2, draws: 0, losses: 16, score: "67.0", points: 4 }
];

export const pricingPlans: MembershipPlan[] = [
  {
    title: "ČLENSTVO",
    subtitle: "Pravidelné tréningy a ligové hranie",
    price: "25 € / mesiac",
    features: ["2 tréningy týždenne", "Účasť v mestskej lige", "Registrácia v lige", "Zľavy na turnaje"],
    cta: "STAŇ SA ČLENOM",
    featured: true,
    href: "/registracia"
  },
  {
    title: "PRENÁJOM KOLKÁRNE",
    subtitle: "Cena podľa počtu osôb",
    price: "od 20 € / hod.",
    features: ["Do 5 osôb — 20 € / hod.", "6 až 10 osôb — 30 € / hod.", "11 a viac osôb — 40 € / hod.", "Prenájom priestoru kolkárne"],
    cta: "REZERVUJ KOLKÁREŇ",
    featured: false,
    href: "/kontakt"
  },
  {
    title: "REZERVÁCIA DRÁHY",
    subtitle: "Hodina hry na jednej dráhe",
    price: "7 € / hod. / dráha",
    features: ["Cena za jednu dráhu", "60 minút hry", "Vhodné pre jednotlivcov aj skupiny", "Termín potvrdí klub"],
    cta: "REZERVUJ DRÁHU",
    featured: false,
    href: "/kontakt"
  }
];

export const calendarIcon = CalendarDays;
