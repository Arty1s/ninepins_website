import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import type { SupportedStorage } from "@supabase/supabase-js";
import { createUserSession, USER_SESSION_COOKIE } from "@/lib/user-auth";
import { createSupabaseAuthClient, SUPABASE_AUTH_STORAGE_KEY } from "@/lib/supabase-auth-server";

const OAUTH_VERIFIER_COOKIE = "kkhc_oauth_code_verifier";
const OAUTH_REDIRECT_COOKIE = "kkhc_oauth_redirect";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const next = sanitizeNext(request.nextUrl.searchParams.get("next") || cookies().get(OAUTH_REDIRECT_COOKIE)?.value);

  if (!code) {
    return redirectWithError(request, "Chýba autorizačný kód. Skús prihlásenie znova.");
  }

  const storage = new CookieVerifierStorage(cookies().get(OAUTH_VERIFIER_COOKIE)?.value);
  const supabase = createSupabaseAuthClient(storage);
  if (!supabase) {
    return redirectWithError(request, "Supabase login nie je nakonfigurovaný.");
  }

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.session || !data.user) {
    return redirectWithError(request, error?.message || "Nepodarilo sa dokončiť prihlásenie.");
  }

  const response = NextResponse.redirect(new URL(next, request.url));
  response.cookies.set(USER_SESSION_COOKIE, createUserSession(data.user, data.session, data.user.app_metadata?.provider), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.ADMIN_COOKIE_SECURE === "true",
    path: "/",
    maxAge: 60 * 60 * 8
  });
  response.cookies.set(OAUTH_VERIFIER_COOKIE, "", { path: "/", maxAge: 0 });
  response.cookies.set(OAUTH_REDIRECT_COOKIE, "", { path: "/", maxAge: 0 });

  return response;
}

class CookieVerifierStorage implements SupportedStorage {
  constructor(private readonly verifier?: string) {}

  getItem(key: string) {
    if (key === `${SUPABASE_AUTH_STORAGE_KEY}-code-verifier`) return this.verifier ?? null;
    return null;
  }

  setItem() {}

  removeItem() {}
}

function sanitizeNext(value?: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/profile";
  return value;
}

function redirectWithError(request: NextRequest, message: string) {
  const url = new URL("/prihlasenie", request.url);
  url.searchParams.set("error", message);
  return NextResponse.redirect(url);
}
