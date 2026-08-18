import "server-only";

import { existsSync, promises as fs } from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { defaultLiveData, type LiveClubData, type TournamentRegistration } from "@/lib/live-store";

const CLUB_DATA_KEY = "club-data";
const REGISTRATIONS_KEY = "tournament-registrations";
const PROJECT_DATA_DIR = findProjectDataDir();
const LOCAL_DATA_DIR = process.env.KKHC_DATA_DIR || PROJECT_DATA_DIR;
const LOCAL_DATA_FILE = path.join(LOCAL_DATA_DIR, "kkhc-live-store.json");
const LOCAL_SYNC_RESULT_FILE = path.join(LOCAL_DATA_DIR, "kolky-sync-result.json");

type LocalDocument = {
  [CLUB_DATA_KEY]: LiveClubData;
  [REGISTRATIONS_KEY]: TournamentRegistration[];
};

function findProjectDataDir() {
  let current = process.cwd();
  for (let i = 0; i < 8; i += 1) {
    const marker = path.join(current, "package.json");
    const syncResult = path.join(current, ".data", "kolky-sync-result.json");
    try {
      if (existsSync(marker) && existsSync(syncResult)) {
        return path.join(current, ".data");
      }
    } catch {
      break;
    }
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return path.join(process.cwd(), ".data");
}

export function isSupabaseStoreConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return null;

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export async function readClubData(): Promise<LiveClubData> {
  const remote = await readStateDocument<LiveClubData>(CLUB_DATA_KEY);
  return hydrateFromSyncResult(normalizeClubData(remote));
}

export async function writeClubData(data: LiveClubData) {
  const normalized = normalizeClubData(data);
  await writeStateDocument(CLUB_DATA_KEY, normalized);
  return normalized;
}

export async function readRegistrations(): Promise<TournamentRegistration[]> {
  return (await readStateDocument<TournamentRegistration[]>(REGISTRATIONS_KEY)) || [];
}

export async function writeRegistrations(rows: TournamentRegistration[]) {
  await writeStateDocument(REGISTRATIONS_KEY, rows);
  return rows;
}

export async function addRegistration(registration: Omit<TournamentRegistration, "id" | "createdAt">) {
  const rows = await readRegistrations();
  const next: TournamentRegistration = {
    ...registration,
    id: Date.now(),
    createdAt: new Date().toISOString()
  };
  await writeRegistrations([next, ...rows]);
  return next;
}

export async function removeRegistration(id: number) {
  const rows = await readRegistrations();
  const next = rows.filter((row) => row.id !== id);
  await writeRegistrations(next);
  return next;
}

async function readStateDocument<T>(key: string): Promise<T | null> {
  const supabase = createAdminClient();

  if (supabase) {
    const { data, error } = await supabase
      .from("kkhc_live_state")
      .select("payload")
      .eq("key", key)
      .maybeSingle();

    if (!error && data.payload) return data.payload as T;
  }

  const local = await readLocalDocument();
  return (local[key as keyof LocalDocument] as T | undefined) ?? null;
}

async function writeStateDocument<T>(key: string, payload: T) {
  const supabase = createAdminClient();

  if (supabase) {
    const { error } = await supabase
      .from("kkhc_live_state")
      .upsert({ key, payload, updated_at: new Date().toISOString() }, { onConflict: "key" });

    if (!error) return;
  }

  const local = await readLocalDocument();
  await fs.mkdir(LOCAL_DATA_DIR, { recursive: true });
  await fs.writeFile(LOCAL_DATA_FILE, JSON.stringify({ ...local, [key]: payload }, null, 2), "utf8");
}

async function readLocalDocument(): Promise<LocalDocument> {
  try {
    const raw = await fs.readFile(LOCAL_DATA_FILE, "utf8");
    return JSON.parse(raw) as LocalDocument;
  } catch {
    return {};
  }
}

function normalizeClubData(data: Partial<LiveClubData> | null): LiveClubData {
  if (!data) return defaultLiveData;

  return {
    tournaments: data.tournaments.length ? data.tournaments : defaultLiveData.tournaments,
    leagues: data.leagues.length ? data.leagues : defaultLiveData.leagues,
    players: data.players.length ? data.players : defaultLiveData.players,
    members: data.members.length ? data.members : defaultLiveData.members,
    teams: data.teams.length ? data.teams : defaultLiveData.teams,
    matches: data.matches.length ? data.matches : defaultLiveData.matches,
    standings: data.standings.length ? data.standings : defaultLiveData.standings,
    gallery: data.gallery.length ? data.gallery : defaultLiveData.gallery
  };
}

async function hydrateFromSyncResult(data: LiveClubData): Promise<LiveClubData> {
  try {
    const raw = (await fs.readFile(LOCAL_SYNC_RESULT_FILE, "utf8")).replace(/^\uFEFF/, "").replace(/^ï»¿/, "");
    const sync = JSON.parse(raw) as Partial<LiveClubData>;
    const matches = Array.isArray(sync.matches) ? sync.matches : [];
    const players = Array.isArray(sync.players) ? sync.players : [];
    const teams = Array.isArray(sync.teams) ? sync.teams : [];
    const standings = Array.isArray(sync.standings) ? sync.standings : [];

    if (matches.length <= data.matches.length && players.length <= data.players.length) return data;

    return {
      ...data,
      matches: matches.length > data.matches.length ? matches : data.matches,
      players: players.length > data.players.length ? players : data.players,
      teams: teams.length >= data.teams.length ? teams : data.teams,
      standings: standings.length >= data.standings.length ? standings : data.standings
    } as LiveClubData;
  } catch {
    return data;
  }
}
