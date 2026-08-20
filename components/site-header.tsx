"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, UserRound, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { label: "Domov", href: "/" },
  { label: "O klube", href: "/o_klube.html" },
  { label: "Tímy", href: "/timy" },
  { label: "Zápasy", href: "/zapasy" },
  { label: "Turnaje", href: "/turnaje" },
  { label: "Členstvo", href: "/cennik" },
  { label: "Galéria", href: "/galeria" },
  { label: "Kontakt", href: "/kontakt" }
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="absolute top-0 z-50 w-full border-b border-white/10 bg-[#020b18]/88 text-white backdrop-blur-md">
      <div className="container-page flex h-[82px] items-center justify-between gap-4">
        <Link className="flex min-w-0 items-center gap-3" href="/" aria-label="KK Hlohovec domov" onClick={() => setOpen(false)}>
          <Image src="/kkhc-logo.png" alt="Logo KK Hlohovec" width={72} height={52} className="kkhc-logo-cutout h-12 w-auto object-contain" priority />
          <span className="leading-tight">
            <span className="block text-xl font-black tracking-tight">KK Hlohovec</span>
            <span className="block text-[10px] font-black uppercase tracking-[0.28em] text-white/68">Kolkársky klub</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 xl:flex" aria-label="Hlavná navigácia">
          {navLinks.map((link) => {
            const isActive = link.href === "/" ? pathname === "/" : pathname === link.href || pathname.startsWith(`${link.href}/`);

            return (
              <Link
                key={link.href}
                className={`relative py-8 text-[12px] font-black uppercase tracking-[0.04em] transition hover:text-white ${
                  isActive ? "text-white after:absolute after:bottom-5 after:left-0 after:h-[2px] after:w-full after:bg-[#0878ff]" : "text-white/74"
                }`}
                href={link.href}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button href="/prihlasenie" variant="secondary" className="h-11 px-5">
            <UserRound size={16} />
            Prihlásiť
          </Button>
          <Button href="/registracia" className="h-11 px-5">
            Registrácia
          </Button>
        </div>

        <button
          type="button"
          className="grid h-11 w-11 place-items-center rounded-lg border border-white/18 text-white transition hover:border-[#0878ff] hover:bg-[#0878ff] xl:hidden"
          aria-label={open ? "Zatvoriť menu" : "Otvoriť menu"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-white/10 bg-[#031326] px-4 pb-5 pt-2 shadow-2xl xl:hidden">
          <nav className="container-page grid gap-1" aria-label="Mobilná navigácia">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`rounded-lg px-3 py-3 text-sm font-black uppercase transition hover:bg-white/8 hover:text-white ${
                  pathname === link.href || (link.href !== "/" && pathname.startsWith(`${link.href}/`)) ? "bg-white/8 text-white" : "text-white/82"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="container-page mt-4 grid gap-3 md:hidden">
            <Button href="/prihlasenie" variant="secondary" className="w-full" >
              Prihlásiť
            </Button>
            <Button href="/registracia" className="w-full">
              Registrácia
            </Button>
          </div>
        </div>
      ) : null}
    </header>
  );
}
