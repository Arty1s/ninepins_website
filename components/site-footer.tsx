import Image from "next/image";
import Link from "next/link";
import { Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";

const footerGroups = [
  { title: "Klub", links: [{ label: "O klube", href: "/o_klube.html" }, { label: "Tímy", href: "/timy" }, { label: "Členstvo", href: "/cennik" }, { label: "Kontakt", href: "/kontakt" }] },
  { title: "Súťaže", links: [{ label: "Zápasy", href: "/zapasy" }, { label: "Turnaje", href: "/turnaje" }, { label: "Mestská liga", href: "/city-league" }, { label: "Galéria", href: "/galeria" }] },
  { title: "Kolkáreň", links: [{ label: "O kolkárni", href: "/o_klube.html" }, { label: "Rezervácia dráhy", href: "/kontakt" }, { label: "Cenník", href: "/cennik" }, { label: "Adresa", href: "/kontakt" }] }
];

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#020b18] text-white">
      <div className="container-page grid gap-10 py-12 lg:grid-cols-[1.35fr_0.75fr_0.8fr_0.75fr_1.05fr]">
        <div>
          <div className="flex items-center gap-3">
            <Image src="/kkhc-logo.png" alt="Logo KK Hlohovec" width={78} height={56} className="kkhc-logo-cutout h-14 w-auto object-contain" />
            <div>
              <p className="text-xl font-black">KK Hlohovec</p>
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/60">Kolkársky klub Hlohovec</p>
            </div>
          </div>
          <p className="mt-5 max-w-sm text-sm leading-6 text-[#9baac0]">
            Oficiálny web KK Hlohovec. Tímy, zápasy, turnaje a informácie pre ľudí, ktorí chcú hrať kolky v Hlohovci.
          </p>
          <div className="mt-6 flex gap-3">
            <a href="#" aria-label="Facebook" className="grid h-10 w-10 place-items-center rounded-full bg-white/8 text-white transition hover:bg-[#0878ff]">
              <Facebook size={18} />
            </a>
            <a href="#" aria-label="Instagram" className="grid h-10 w-10 place-items-center rounded-full bg-white/8 text-white transition hover:bg-[#0878ff]">
              <Instagram size={18} />
            </a>
          </div>
        </div>

        {footerGroups.map((group) => (
          <FooterList key={group.title} title={group.title} items={group.links} />
        ))}

        <div>
          <h3 className="mb-4 text-sm font-black uppercase tracking-[0.08em]">Kontakt</h3>
          <div className="space-y-4 text-sm text-[#9baac0]">
            <p className="flex gap-3"><MapPin size={18} className="shrink-0 text-[#58a3ff]" /> Štúrova 35, 920 01 Hlohovec</p>
            <p className="flex gap-3"><Phone size={18} className="shrink-0 text-[#58a3ff]" /> +421 905 123 456</p>
            <p className="flex gap-3"><Mail size={18} className="shrink-0 text-[#58a3ff]" /> kkhlohovec@gmail.com</p>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-3 py-5 text-xs text-white/50 md:flex-row md:items-center md:justify-between">
          <p>© 2026 KK Hlohovec. Všetky práva vyhradené.</p>
          <div className="flex flex-wrap gap-5">
            <Link href="/privacy" className="transition hover:text-white">Ochrana osobných údajov</Link>
            <Link href="/terms" className="transition hover:text-white">Podmienky používania</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterList({ title, items }: { title: string; items: { label: string; href: string }[] }) {
  return (
    <div>
      <h3 className="mb-4 text-sm font-black uppercase tracking-[0.08em]">{title}</h3>
      <ul className="space-y-2 text-sm text-[#9baac0]">
        {items.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className="transition hover:text-white">{item.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
