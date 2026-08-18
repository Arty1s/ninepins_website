import { createClient, type SupportedStorage } from "@supabase/supabase-js";

export const SUPABASE_AUTH_STORAGE_KEY = "kkhc-supabase-auth";

export function isSupabaseAuthConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function createSupabaseAuthClient(storage: SupportedStorage) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) return null;

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      flowType: "pkce",
      persistSession: Boolean(storage),
      storage,
      storageKey: SUPABASE_AUTH_STORAGE_KEY
    }
  });
}

export function getSiteUrl(requestUrl: string) {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  if (requestUrl) {
    const url = new URL(requestUrl);
    return url.origin;
  }
  return "http://127.0.0.1:3003";
}
