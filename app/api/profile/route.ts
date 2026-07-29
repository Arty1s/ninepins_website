import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, readAdminSession } from "@/lib/admin-auth";
import { readClubData } from "@/lib/server-store";
import { readUserSession, USER_SESSION_COOKIE } from "@/lib/user-auth";

export async function GET() {
  const adminSession = readAdminSession(cookies().get(ADMIN_SESSION_COOKIE)?.value);
  const userSession = readUserSession(cookies().get(USER_SESSION_COOKIE)?.value);
  const session = userSession || adminSession;

  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const isAdmin = session.role === "admin";
  const email = session.email;
  const clubData = await readClubData();
  const member = clubData.members.find((item) => item.email.trim().toLowerCase() === email.trim().toLowerCase());
  const rawName = "name" in session ? session.name : undefined;
  const rawAvatarUrl = "avatarUrl" in session ? session.avatarUrl : undefined;
  const rawProvider = "provider" in session ? session.provider : undefined;
  const name = isAdmin ? "Admin" : member?.name || (typeof rawName === "string" && rawName.trim() ? rawName.trim() : "Michaela Vavrová");

  return NextResponse.json({
    authenticated: true,
    user: {
      email,
      role: session.role,
      name,
      avatarUrl: typeof rawAvatarUrl === "string" && rawAvatarUrl.trim() ? rawAvatarUrl.trim() : null,
      provider: typeof rawProvider === "string" && rawProvider.trim() ? rawProvider.trim() : isAdmin ? "password" : "email"
    },
    membership: {
      status: member?.membershipStatus || "pending_payment",
      label: member?.membershipStatus === "paid" ? "Zaplatené" : member?.membershipStatus === "unpaid" ? "Nezaplatené" : "Čaká na prvú platbu",
      nextPayment: member?.nextPayment || null,
      stripeReady: false
    },
    team: {
      name: isAdmin ? "Administrácia klubu" : member?.team || "KK Hlohovec",
      category: isAdmin ? "Správa klubu" : member?.role || "member",
      captain: null,
      coach: null
    },
    payments: [
      { period: "Júl 2026", item: "Členstvo", amount: 19, currency: "EUR", status: "prepared" },
      { period: "Jún 2026", item: "Členstvo", amount: 19, currency: "EUR", status: "no_record" },
      { period: "Máj 2026", item: "Turnajový poplatok", amount: 0, currency: "EUR", status: "free" }
    ],
    matchSource: {
      provider: "vysledky.kolky.sk",
      playerName: isAdmin ? null : "Michaela Vavrová",
      totalMatches: null,
      status: "waiting_for_player_id",
      note: "Presný počet zápasov za všetky roky sa doplní po napojení hráčskeho detailu z vysledky.kolky.sk."
    },
    tournamentHistory: [
      { name: "KK Hlohovec Open 2025", date: "2025-06-21", status: "registration_ready" },
      { name: "Memoriál J. Mego", date: "2024-06-08", status: "profile_tracking_ready" }
    ],
    stats: {
      matches: null,
      tournaments: 0,
      medals: 0
    }
  });
}
