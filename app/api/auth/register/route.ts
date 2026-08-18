import { NextResponse } from "next/server";
import { createUserSession, USER_SESSION_COOKIE } from "@/lib/user-auth";
import { createSupabaseAuthClient, getSiteUrl, isSupabaseAuthConfigured } from "@/lib/supabase-auth-server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { name: string; email: string; password: string };
    const name = body.name.trim() || "";
    const email = body.email.trim().toLowerCase() || "";
    const password = body.password || "";

    if (!name || !email || !password) {
      return NextResponse.json({ ok: false, message: "Vyplň meno, e-mail aj heslo." }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ ok: false, message: "Heslo musí mať aspoň 6 znakov." }, { status: 400 });
    }

    if (!isSupabaseAuthConfigured()) {
      return NextResponse.json(
        { ok: false, message: "Registrácia potrebuje nastaviť Supabase URL a anon key v .env." },
        { status: 500 }
      );
    }

    const supabase = createSupabaseAuthClient();
    if (!supabase) {
      return NextResponse.json({ ok: false, message: "Supabase Auth nie je nakonfigurovaný." }, { status: 500 });
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${getSiteUrl(request.url)}/api/auth/callbacknext=${encodeURIComponent("/profile")}`
      }
    });

    if (error) {
      return NextResponse.json({ ok: false, message: error.message || "Registrácia zlyhala." }, { status: 400 });
    }

    if (data.session && data.user) {
      await ensureBackendMember({
        email,
        name,
        provider: "email",
        avatarUrl: ""
      });

      const response = NextResponse.json({ ok: true, redirectTo: "/profile" });
      response.cookies.set(USER_SESSION_COOKIE, createUserSession(data.user, data.session, "email"), {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.ADMIN_COOKIE_SECURE === "true",
        path: "/",
        maxAge: 60 * 60 * 8
      });
      return response;
    }

    return NextResponse.json({
      ok: true,
      message: "Účet je vytvorený. Ak Supabase vyžaduje potvrdenie, skontroluj e-mail a potom sa prihlás."
    });
  } catch {
    return NextResponse.json({ ok: false, message: "Pri registrácii nastala chyba." }, { status: 500 });
  }
}

async function ensureBackendMember(payload: { email: string; name: string; provider: string; avatarUrl: string }) {
  const fastApiUrl = process.env.FASTAPI_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!fastApiUrl) return;

  try {
    await fetch(`${fastApiUrl.replace(/\/$/, "")}/api/members/ensure`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    });
  } catch {
    // Registration can still continue; the member row can be repaired by next login.
  }
}
