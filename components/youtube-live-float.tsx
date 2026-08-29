"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Radio, X } from "lucide-react";

export type YoutubeLiveState = {
  active: boolean;
  videoId?: string;
  title?: string;
  watchUrl?: string;
  embedUrl?: string;
};

export function YoutubeLiveFloat() {
  const [live, setLive] = useState<YoutubeLiveState>({ active: false });
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const refresh = () => fetch("/api/youtube-live", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload: YoutubeLiveState) => {
        if (!cancelled) setLive(payload);
      })
      .catch(() => undefined);
    refresh();
    const timer = window.setInterval(refresh, 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  if (!live.active || !live.embedUrl || closed) return null;

  return (
    <aside className="fixed bottom-4 right-4 z-[80] w-[min(390px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-red-400/35 bg-[#06182f] text-white shadow-[0_24px_90px_rgba(0,0,0,.55)]">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-red-400"><Radio size={15} /> Práve vysielame</p>
          <p className="mt-1 truncate text-sm font-bold">{live.title || "KKZ Hlohovec naživo"}</p>
        </div>
        <button type="button" onClick={() => setClosed(true)} aria-label="Zavrieť živé vysielanie" className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/[0.07] hover:bg-white/[0.12]"><X size={17} /></button>
      </div>
      <div className="aspect-video bg-black">
        <iframe className="h-full w-full" src={live.embedUrl} title={live.title || "KKZ Hlohovec naživo"} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
      </div>
      {live.watchUrl ? <a href={live.watchUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 px-4 py-3 text-xs font-black uppercase tracking-[0.1em] text-[#8ec5ff] hover:text-white">Otvoriť na YouTube <ExternalLink size={14} /></a> : null}
    </aside>
  );
}
