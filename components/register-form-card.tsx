"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, Eye, EyeOff, Facebook, Loader2, LockKeyhole, Mail, UserRound } from "lucide-react";

type RegisterResult = {
  ok?: boolean;
  message?: string;
  redirectTo?: string;
};

export function RegisterFormCard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const nextPath = useMemo(() => {
    const next = searchParams.get("next");
    if (!next || !next.startsWith("/") || next.startsWith("//")) return "";
    return next;
  }, [searchParams]);

  const authError = searchParams.get("error");
  const nextQuery = nextPath ? `?next=${encodeURIComponent(nextPath)}` : "";

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });
      const result = (await response.json()) as RegisterResult;

      if (!response.ok || !result.ok) {
        setError(result.message || "Registrácia zlyhala.");
        return;
      }

      if (result.redirectTo) {
        router.push(nextPath || result.redirectTo);
        router.refresh();
        return;
      }

      setMessage(result.message || "Účet je pripravený. Teraz sa môžeš prihlásiť.");
    } catch {
      setError("Server nie je dostupný. Skús to znova.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-[calc(100%-32px)] max-w-[510px] rounded-[22px] border border-[#1683ff]/22 bg-[#031026]/76 p-6 shadow-[0_28px_84px_rgba(0,0,0,.42)] backdrop-blur-xl sm:p-8 lg:p-11">
      <div className="mx-auto mb-8 max-w-md text-center">
        <p className="text-xs font-black uppercase tracking-[0.42em] text-[#1683ff]">Nový účet</p>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-white lg:text-[44px]">Registrácia</h1>
        <p className="mt-4 text-base leading-7 text-white/70">
          Vytvor si členský účet, sleduj svoje platby, tím, turnaje a klubové novinky na jednom mieste.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <a className="inline-flex h-12 items-center justify-center gap-3 rounded-xl border border-[#1683ff]/28 bg-[#147cff] px-4 text-sm font-black text-white shadow-[0_16px_40px_rgba(20,124,255,.28)] transition hover:-translate-y-0.5 hover:bg-[#238bff]" href={`/api/auth/oauth/google${nextQuery}`}>
          <span className="text-lg font-black">G</span>
          Registrovať cez Google
        </a>
        <a className="inline-flex h-12 items-center justify-center gap-3 rounded-xl border border-[#1683ff]/20 bg-[#071a33]/48 px-4 text-sm font-bold text-white transition hover:border-[#1683ff]/50 hover:bg-[#071a33]/76" href={`/api/auth/oauth/facebook${nextQuery}`}>
          <Facebook size={18} className="text-[#1683ff]" />
          Facebook
        </a>
      </div>

      <div className="my-7 flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.16em] text-white/46">
        <span className="h-px flex-1 bg-[#1683ff]/16" />
        Alebo e-mailom
        <span className="h-px flex-1 bg-[#1683ff]/16" />
      </div>

      <form className="space-y-5" onSubmit={onSubmit}>
        <label className="block">
          <span className="mb-2.5 block text-xs font-black uppercase tracking-[0.08em] text-white">Meno</span>
          <span className="flex h-14 items-center gap-4 rounded-xl border border-[#1683ff]/20 bg-[#071a33]/60 px-5 text-white/74 shadow-[inset_0_1px_0_rgba(20,124,255,.10)] transition focus-within:border-[#1683ff]/74 focus-within:bg-[#071a33]/82 focus-within:ring-4 focus-within:ring-[#1683ff]/12">
            <UserRound size={20} />
            <input
              className="h-full min-w-0 flex-1 bg-transparent text-base text-white outline-none placeholder:text-white/46"
              placeholder="Tvoje meno"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              disabled={loading}
            />
          </span>
        </label>

        <label className="block">
          <span className="mb-2.5 block text-xs font-black uppercase tracking-[0.08em] text-white">E-mail</span>
          <span className="flex h-14 items-center gap-4 rounded-xl border border-[#1683ff]/20 bg-[#071a33]/60 px-5 text-white/74 shadow-[inset_0_1px_0_rgba(20,124,255,.10)] transition focus-within:border-[#1683ff]/74 focus-within:bg-[#071a33]/82 focus-within:ring-4 focus-within:ring-[#1683ff]/12">
            <Mail size={20} />
            <input
              className="h-full min-w-0 flex-1 bg-transparent text-base text-white outline-none placeholder:text-white/46"
              placeholder="tvoj@email.sk"
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
              placeholder="Aspoň 6 znakov"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
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

        {error || authError ? <p className="rounded-xl border border-red-400/25 bg-red-500/12 px-4 py-3 text-sm font-bold text-red-100">{error || authError}</p> : null}
        {message ? (
          <p className="flex items-start gap-3 rounded-xl border border-emerald-400/20 bg-emerald-500/12 px-4 py-3 text-sm font-bold text-emerald-100">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            {message}
          </p>
        ) : null}

        <button
          className="inline-flex h-14 w-full items-center justify-center gap-3 rounded-xl border border-[#1683ff] bg-[#147cff] px-6 text-sm font-black uppercase tracking-[0.04em] text-white shadow-[0_18px_44px_rgba(20,124,255,.32)] transition hover:-translate-y-0.5 hover:bg-[#238bff] hover:shadow-[0_24px_58px_rgba(20,124,255,.40)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-65 disabled:hover:translate-y-0"
          type="submit"
          disabled={loading}
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : null}
          {loading ? "Vytváram účet..." : "Vytvoriť účet"} {!loading ? <ArrowRight size={18} /> : null}
        </button>
      </form>

      <div className="mt-7 flex justify-center text-sm text-white/60">
        <Link className="inline-flex items-center justify-center gap-2 font-bold text-[#1683ff] transition hover:text-[#62adff]" href="/prihlasenie">
          Už máš účet? Prihlás sa
        </Link>
      </div>
    </div>
  );
}
