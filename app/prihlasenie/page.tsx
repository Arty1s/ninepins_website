import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginFormCard } from "@/components/login-form-card";

export const metadata: Metadata = {
  title: "Prihlásenie člena",
  description: "Prihlásenie do členského účtu KK Hlohovec.",
  alternates: { canonical: "/prihlasenie" },
  robots: { index: false, follow: false }
};

export default function PrihlaseniePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020b18] pt-[82px] text-white">
      <div
        className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,11,24,.06)_0%,rgba(2,11,24,.14)_42%,rgba(2,11,24,.38)_100%),url('/images/login-bg.png')] bg-cover bg-left"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_58%_50%,rgba(20,124,255,.14),transparent_34%),linear-gradient(180deg,rgba(2,11,24,.04),rgba(2,11,24,.36))]" aria-hidden="true" />

      <section className="container-page relative z-10 flex min-h-[calc(100vh-82px)] items-center justify-center py-8 lg:justify-end lg:pr-[8vw]">
        <Suspense fallback={null}>
          <LoginFormCard />
        </Suspense>
      </section>

      <div className="pointer-events-none absolute bottom-0 right-0 h-48 w-full bg-[linear-gradient(180deg,transparent,rgba(20,124,255,.12)_55%,rgba(2,11,24,.9))]" aria-hidden="true" />
    </main>
  );
}
