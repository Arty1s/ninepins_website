import { NextResponse } from "next/server";
import { registerFileUser } from "@/lib/file-user-store";
import { createLocalMemberSession, createUserSession, USER_SESSION_COOKIE } from "@/lib/user-auth";
import { createSupabaseAuthClient, getSiteUrl, isSupabaseAuthConfigured } from "@/lib/supabase-auth-server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let registrationInput: { name?: string; email?: string; password?: string } | null = null;
  try {
    const body = (await request.json()) as { name: string; email: string; password: string };
    registrationInput = body;
    const name = body.name.trim() || "";
    const email = body.email.trim().toLowerCase() || "";
    const password = body.password || "";

    if (!name || !email || !password) {
      return NextResponse.json({ ok: false, message: "Vyplň meno, e-mail aj heslo." }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ ok: false, message: "Zadaj platnú e-mailovú adresu." }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ ok: false, message: "Heslo musí mať aspoň 6 znakov." }, { status: 400 });
    }

    const result = await registerFileUser(name, email, password);
    if (!result.ok) return NextResponse.json({ ok: false, message: "Účet s týmto e-mailom už existuje." }, { status: 409 });

    await ensureBackendMember({ email, name, provider: "password", avatarUrl: "" });
    const response = NextResponse.json({ ok: true, redirectTo: "/profile" });
    response.cookies.set(USER_SESSION_COOKIE, createLocalMemberSession(result.user.email, result.user.name), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production" || process.env.ADMIN_COOKIE_SECURE === "true",
      path: "/",
      maxAge: 60 * 60 * 8
    });
    return response;
  } catch (error) {
    console.error("File registration failed", error);
    if (isSupabaseAuthConfigured()) {
      const supabase = createSupabaseAuthClient();
      if (supabase) {
        const body = registrationInput;
        if (body?.name && body.email && body.password) {
          const email = body.email.trim().toLowerCase();
          const { data, error: authError } = await supabase.auth.signUp({ email, password: body.password, options: { data: { full_name: body.name.trim() }, emailRedirectTo: `${getSiteUrl(request.url)}/api/auth/callback?next=${encodeURIComponent("/profile")}` } });
          if (!authError) {
            if (data.user && data.session) {
              const response = NextResponse.json({ ok: true, redirectTo: "/profile" });
              response.cookies.set(USER_SESSION_COOKIE, createUserSession(data.user, data.session, "email"), { httpOnly: true, sameSite: "lax", secure: true, path: "/", maxAge: 60 * 60 * 8 });
              return response;
            }
            return NextResponse.json({ ok: true, message: "Účet je vytvorený. Skontroluj e-mail a potvrď registráciu." });
          }
        }
      }
    }
    return NextResponse.json({ ok: false, message: "Účet sa nepodarilo bezpečne uložiť." }, { status: 500 });
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
