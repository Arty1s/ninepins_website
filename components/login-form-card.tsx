"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowRight, Eye, EyeOff, Facebook, Loader2, LockKeyhole, Mail } from "lucide-react";

export function LoginFormCard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("admin@kkhlohovec.sk");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const nextPath = useMemo(() => {
    const next = searchParams.get("next");
    if (!next || !next.startsWith("/") || next.startsWith("//")) return "";
    return next;
  }, [searchParams]);
  const authError = searchParams.get("error");
  const nextQuery = nextPath ? `next=${encodeURIComponent(nextPath)}` : "";

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const result = (await response.json()) as { ok: boolean; message: string; redirectTo: string };

      if (!response.ok || !result.ok) {
        setError(result.message || "Prihlásenie zlyhalo.");
        return;
      }

      router.push(nextPath || result.redirectTo || "/profile");
      router.refresh();
    } catch {
      setError("Server nie je dostupný. Skús to znova.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-[calc(100%-32px)] max-w-[510px] rounded-[22px] border border-[#1683ff]/22 bg-[#031026]/76 p-6 shadow-[0_28px_84px_rgba(0,0,0,.42)] backdrop-blur-xl sm:p-8 lg:p-11">
      <div className="mx-auto mb-8 max-w-md text-center">
        <p className="text-xs font-black uppercase tracking-[0.42em] text-[#1683ff]">Vitaj späť</p>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-white lg:text-[44px]">Prihlás sa</h1>
        <p className="mt-4 text-base leading-7 text-white/70">
          Pokračuj v správe svojho profilu, sleduj zápasy a buď vždy v obraze.
        </p>
      </div>

      <form className="space-y-5" onSubmit={onSubmit}>
        <label className="block">
          <span className="mb-2.5 block text-xs font-black uppercase tracking-[0.08em] text-white">E-mail</span>
          <span className="flex h-14 items-center gap-4 rounded-xl border border-[#1683ff]/20 bg-[#071a33]/60 px-5 text-white/74 shadow-[inset_0_1px_0_rgba(20,124,255,.10)] transition focus-within:border-[#1683ff]/74 focus-within:bg-[#071a33]/82 focus-within:ring-4 focus-within:ring-[#1683ff]/12">
            <Mail size={20} />
            <input
              className="h-full min-w-0 flex-1 bg-transparent text-base text-white outline-none placeholder:text-white/46"
              placeholder="Zadaj svoj e-mail"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              disabled={loading}
            />
          </span>
        </label>

        <label className="block">
          <span className="mb-2.5 block text-xs font-black uppercase tracking-[0.08em] text-white">Heslo</span>
          <span className="flex h-14 items-center gap-4 rounded-xl border border-[#1683ff]/20 bg-[#071a33]/60 px-5 text-white/74 shadow-[inset_0_1px_0_rgba(20,124,255,.10)] transition focus-within:border-[#1683ff]/74 focus-within:bg-[#071a33]/82 focus-within:ring-4 focus-within:ring-[#1683ff]/12">
            <LockKeyhole size={20} />
            <input
              className="h-full min-w-0 flex-1 bg-transparent text-base text-white outline-none placeholder:text-white/46"
              placeholder="Zadaj svoje heslo"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              disabled={loading}
            />
            <button
              className="grid h-9 w-9 place-items-center rounded-lg text-white/62 transition hover:bg-white/8 hover:text-white"
              type="button"
              aria-label={showPassword ? "Skryť heslo" : "Zobraziť heslo"}
              onClick={() => setShowPassword((value) => !value)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </span>
        </label>

        <div className="-mt-1 flex justify-end">
          <Link className="text-sm font-semibold text-[#1683ff] transition hover:text-[#62adff]" href="/kontakt">
            Zabudli ste heslo
          </Link>
        </div>

        {error || authError ? <p className="rounded-xl border border-red-400/25 bg-red-500/12 px-4 py-3 text-sm font-bold text-red-100">{error || authError}</p> : null}

        <button
          className="inline-flex h-14 w-full items-center justify-center gap-3 rounded-xl border border-[#1683ff] bg-[#147cff] px-6 text-sm font-black uppercase tracking-[0.04em] text-white shadow-[0_18px_44px_rgba(20,124,255,.32)] transition hover:-translate-y-0.5 hover:bg-[#238bff] hover:shadow-[0_24px_58px_rgba(20,124,255,.40)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-65 disabled:hover:translate-y-0"
          type="submit"
          disabled={loading}
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : null}
          {loading ? "Prihlasujem..." : "Prihlásiť sa"} {!loading ? <ArrowRight size={18} /> : null}
        </button>
      </form>

      <div className="my-7 flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.16em] text-white/46">
        <span className="h-px flex-1 bg-[#1683ff]/16" />
        Alebo pokračuj cez
        <span className="h-px flex-1 bg-[#1683ff]/16" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <a className="inline-flex h-12 items-center justify-center gap-3 rounded-xl border border-[#1683ff]/20 bg-[#071a33]/48 px-4 text-sm font-bold text-white transition hover:border-[#1683ff]/50 hover:bg-[#071a33]/76" href={`/api/auth/oauth/google${nextQuery}`}>
          <span className="text-lg font-black text-[#4285f4]">G</span>
          Google
        </a>
        <a className="inline-flex h-12 items-center justify-center gap-3 rounded-xl border border-[#1683ff]/20 bg-[#071a33]/48 px-4 text-sm font-bold text-white transition hover:border-[#1683ff]/50 hover:bg-[#071a33]/76" href={`/api/auth/oauth/facebook${nextQuery}`}>
          <Facebook size={18} className="text-[#1683ff]" />
          Facebook
        </a>
      </div>

      <div className="mt-7 flex justify-center text-sm text-white/60">
        <Link className="inline-flex items-center justify-center gap-2 font-bold text-[#1683ff] transition hover:text-[#62adff]" href="/registracia">
          Nemáš účet Zaregistruj sa
        </Link>
      </div>
    </div>
  );
}
