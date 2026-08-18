import { NextResponse, type NextRequest } from "next/server";
import type { Provider, SupportedStorage } from "@supabase/supabase-js";
import { createSupabaseAuthClient, getSiteUrl, isSupabaseAuthConfigured, SUPABASE_AUTH_STORAGE_KEY } from "@/lib/supabase-auth-server";

const providers = new Set(["google", "facebook"]);
const OAUTH_VERIFIER_COOKIE = "kkhc_oauth_code_verifier";
const OAUTH_REDIRECT_COOKIE = "kkhc_oauth_redirect";

export async function GET(request: NextRequest, { params }: { params: { provider: string } }) {
  const provider = params.provider as Provider;

  if (!providers.has(provider)) {
    return redirectWithError(request, "Tento poskytovateľ prihlásenia nie je podporovaný.");
  }

  if (!isSupabaseAuthConfigured()) {
    return redirectWithError(request, "Google/Facebook login potrebuje nastaviť Supabase URL a anon key v .env.");
  }

  const storage = new MemoryStorage();
  const supabase = createSupabaseAuthClient(storage);
  if (!supabase) return redirectWithError(request, "Supabase login nie je nakonfigurovaný.");

  const next = sanitizeNext(request.nextUrl.searchParams.get("next"));
  const siteUrl = getSiteUrl(request.url);
  const redirectTo = `${siteUrl}/api/auth/callbacknext=${encodeURIComponent(next)}`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      scopes: provider === "google" ? "email profile" : "email,public_profile"
    }
  });

  if (error || !data.url) {
    return redirectWithError(request, error.message || "Nepodarilo sa spustiť sociálne prihlásenie.");
  }

  const response = NextResponse.redirect(data.url);
  const verifier = storage.get(`${SUPABASE_AUTH_STORAGE_KEY}-code-verifier`);

  if (verifier) {
    response.cookies.set(OAUTH_VERIFIER_COOKIE, verifier, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.ADMIN_COOKIE_SECURE === "true",
      path: "/",
      maxAge: 60 * 10
    });
  }

  response.cookies.set(OAUTH_REDIRECT_COOKIE, next, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.ADMIN_COOKIE_SECURE === "true",
    path: "/",
    maxAge: 60 * 10
  });

  return response;
}

class MemoryStorage implements SupportedStorage {
  private values = new Map<string, string>();

  get(key: string) {
    return this.values.get(key);
  }

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }

  removeItem(key: string) {
    this.values.delete(key);
  }
}

function sanitizeNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/profile";
  return value;
}

function redirectWithError(request: NextRequest, message: string) {
  const url = request.nextUrl.clone();
  url.pathname = "/prihlasenie";
  url.searchParams.set("error", message);
  return NextResponse.redirect(url);
}
