import { NextResponse } from "next/server";

const HLOHOVEC_MATCH_SAMPLE = {
  sourceUrl: "https://vysledky.kolky.sk/match/detail/43531/KO-Zarnovica-vs-KKZ-Hlohovec-A",
  league: "Extraliga muži",
  round: "22. kolo",
  date: "18.04.2026",
  location: "Žarnovica",
  home: "KO Žarnovica",
  away: "KKZ Hlohovec A",
  score: "7.0 : 1.0",
  pins: "3 586 : 3 372",
  status: "odohrané",
  importedAt: new Date().toISOString(),
  importStatus: "auto",
  detailRows:
    "Jančovič Martin | 629 | Novosad Róbert | 537\nNasvetr Dalibor | 574 | Poláčik Roman | 588\nTkáč Ján | 582 | Vlčko Jaroslav | 573\nKlubert Dávid | 592 | Jaderko Róbert | 574\nFúska Radoslav st. | 590 | Šišan Michal | 541\nPašiak Tomáš | 619 | Kadlečík Matúš | 559"
};

export async function GET() {
  return NextResponse.json({
    ok: true,
    mode: "prepared-cron-endpoint",
    frequency: "every 24 hours",
    source: "https://vysledky.kolky.sk",
    filter: "matches containing Hlohovec",
    writesTo: "Supabase table in production; local admin can still edit imported matches",
    note: "Local demo cannot run a persistent 24h scheduler. On deployment, call this endpoint from Vercel Cron or a server cron job.",
    sampleImport: HLOHOVEC_MATCH_SAMPLE
  });
}
