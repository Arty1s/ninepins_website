"use client";

import { useEffect, useState, type ReactNode } from "react";

export function AdminGate({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let active = true;

    async function checkSession() {
      try {
        const response = await fetch("/api/auth/session", { cache: "no-store" });
        if (!active) return;

        if (!response.ok) {
          window.location.href = "/prihlasenie";
          return;
        }

        const session = (await response.json()) as { user?: { role?: string } };
        if (session.user?.role !== "admin") {
          window.location.href = "/prihlasenie";
          return;
        }

        setAllowed(true);
      } catch {
        if (active) window.location.href = "/prihlasenie";
      } finally {
        if (active) setReady(true);
      }
    }

    checkSession();
    return () => {
      active = false;
    };
  }, []);

  if (!ready) {
    return (
      <div className="rounded-lg border border-[#1683ff]/20 bg-[#071a33] p-6 text-white shadow-sm">
        Overujem admin prístup...
      </div>
    );
  }

  return allowed ? <>{children}</> : null;
}
