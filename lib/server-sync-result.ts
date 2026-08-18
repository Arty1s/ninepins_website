import "server-only";

import { existsSync, promises as fs } from "fs";
import path from "path";
import type { LiveClubData } from "@/lib/live-store";

export async function readLocalSyncResult(): Promise<Partial<LiveClubData> | null> {
  const syncPath = path.join(process.cwd(), ".data", "kolky-sync-result.json");
  if (!existsSync(syncPath)) return null;

  try {
    const raw = (await fs.readFile(syncPath, "utf8")).replace(/^\uFEFF/, "").replace(/^ï»¿/, "");
    const payload = JSON.parse(raw) as Partial<LiveClubData>;
    return {
      matches: Array.isArray(payload.matches) ? payload.matches : [],
      players: Array.isArray(payload.players) ? payload.players : [],
      teams: Array.isArray(payload.teams) ? payload.teams : [],
      standings: Array.isArray(payload.standings) ? payload.standings : []
    };
  } catch {
    return null;
  }
}
