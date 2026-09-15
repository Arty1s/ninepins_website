"use client";

import { useState } from "react";
import { Loader2, Save } from "lucide-react";

export function ProfileSettings({ provisionalEmail }: { provisionalEmail: boolean }) {
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  async function save(event: React.FormEvent) {
    event.preventDefault(); setLoading(true); setMessage("");
    const response = await fetch("/api/profile/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, currentPassword, newPassword }) });
    const result = await response.json(); setMessage(result.message || "Nastavenia sa nepodarilo uložiť."); setLoading(false);
    if (response.ok) { setCurrentPassword(""); setNewPassword(""); }
  }
  return <form onSubmit={save} className="grid gap-3">
    {provisionalEmail ? <p className="rounded-xl bg-amber-400/10 px-4 py-3 text-sm text-amber-100">Účet zatiaľ nemá kontaktný e-mail. Doplň ho pri prvom prihlásení.</p> : null}
    <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Nový kontaktný e-mail" className="h-12 rounded-xl border border-white/10 bg-white/[0.04] px-4 outline-none focus:border-[#1683ff]" />
    <input required type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Aktuálne heslo" className="h-12 rounded-xl border border-white/10 bg-white/[0.04] px-4 outline-none focus:border-[#1683ff]" />
    <input minLength={8} type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Nové heslo (voliteľné)" className="h-12 rounded-xl border border-white/10 bg-white/[0.04] px-4 outline-none focus:border-[#1683ff]" />
    <button disabled={loading} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#1683ff] font-black disabled:opacity-60">{loading ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>} Uložiť nastavenia</button>
    {message ? <p className="text-sm text-white/70">{message}</p> : null}
  </form>;
}
