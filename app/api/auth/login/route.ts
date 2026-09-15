import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, createAdminSession, getAdminEmail, verifyAdminPassword } from "@/lib/admin-auth";
import { createSupabaseAuthClient, isSupabaseAuthConfigured } from "@/lib/supabase-auth-server";
import { verifyFileUser } from "@/lib/file-user-store";
import { createLocalMemberSession, createUserSession, USER_SESSION_COOKIE } from "@/lib/user-auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email: string; password: string };
    const email = body.email.trim().toLowerCase() || "";
    const password = body.password || "";

    if (!email || !password) {
      return NextResponse.json({ ok: false, message: "Zadaj e-mail aj heslo." }, { status: 400 });
    }

    const validAdmin = await verifyAdminPassword(email, password);
    if (validAdmin) {
      const response = NextResponse.json({ ok: true, user: { email: getAdminEmail(), role: "admin" }, redirectTo: "/admin" });
      response.cookies.set(ADMIN_SESSION_COOKIE, createAdminSession(email), {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.ADMIN_COOKIE_SECURE === "true",
        path: "/",
        maxAge: 60 * 60 * 8
      });

      return response;
    }

    const localUser = await verifyFileUser(email, password);
    if (localUser) {
      const response = NextResponse.json({
        ok: true,
        user: { email: localUser.email, role: "member", name: localUser.name, accountType: localUser.accountType },
        redirectTo: "/profile"
      });
      response.cookies.set(USER_SESSION_COOKIE, createLocalMemberSession(localUser.email, localUser.name, "password", localUser.accountType), {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production" || process.env.ADMIN_COOKIE_SECURE === "true",
        path: "/",
        maxAge: 60 * 60 * 8
      });

      return response;
    }

    if (!isSupabaseAuthConfigured()) {
      return NextResponse.json(
        { ok: false, message: "Nesprávny e-mail alebo heslo. Pre bežných členov treba nastaviť Supabase Auth." },
        { status: 401 }
      );
    }

    const supabase = createSupabaseAuthClient();
    if (!supabase) {
      return NextResponse.json({ ok: false, message: "Supabase Auth nie je nakonfigurovaný." }, { status: 500 });
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.session || !data.user) {
      return NextResponse.json({ ok: false, message: "Nesprávny e-mail alebo heslo." }, { status: 401 });
    }

    const authenticatedEmail = (data.user.email || "").trim().toLowerCase();
    if (!authenticatedEmail) return NextResponse.json({ ok: false, message: "Účet nemá platný e-mail." }, { status: 401 });
    const role = authenticatedEmail === getAdminEmail() ? "admin" : "member";
    const response = NextResponse.json({
      ok: true,
      user: { email: authenticatedEmail, role },
      redirectTo: role === "admin" ? "/admin" : "/profile"
    });
    response.cookies.set(USER_SESSION_COOKIE, createUserSession(data.user, data.session, "email"), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.ADMIN_COOKIE_SECURE === "true",
      path: "/",
      maxAge: 60 * 60 * 8
    });

    return response;
  } catch {
    return NextResponse.json({ ok: false, message: "Pri prihlasovaní nastala chyba." }, { status: 500 });
  }
}
