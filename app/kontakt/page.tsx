import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Clock, Facebook, Instagram, Mail, MapPin, Phone, Send, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Kontakt a rezervácia kolkárne v Hlohovci",
  description: "Kontaktujte KK Hlohovec pre členstvo, tréning kolkov alebo rezerváciu kolkárne na Bernolákovej 720 v Hlohovci.",
  alternates: { canonical: "/kontakt" },
  openGraph: { title: "Kontakt | KK Hlohovec", description: "Členstvo, tréningy a rezervácia kolkárne v Hlohovci.", url: "/kontakt" }
};

const contactCards = [
  {
    title: "Adresa",
    text: "Bernolákova 720/34",
    note: "Hlohovec · Zobraziť na mape",
    icon: MapPin,
    href: "https://www.google.com/maps/search/?api=1&query=Bernol%C3%A1kova+720%2F34%2C+920+01+Hlohovec%2C+Slovakia"
  },
  {
    title: "Telefón",
    text: "+421 905 123 456",
    note: "Po – Pia: 8:00 – 18:00",
    icon: Phone,
    href: "tel:+421905123456"
  },
  {
    title: "E-mail",
    text: "kkzprezident@gmail.com",
    note: "Odpovieme čo najskôr",
    icon: Mail,
    href: "mailto:kkzprezident@gmail.com"
  },
  {
    title: "Sociálne siete",
    text: "Instagram a Facebook",
    note: "Sledujte naše novinky",
    icon: Users
  }
];

export default function KontaktPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#020b18] text-white">
      <section className="relative min-h-[calc(100vh-82px)] pt-[82px]">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,11,24,.98)_0%,rgba(3,16,34,.91)_42%,rgba(3,16,34,.35)_73%,rgba(2,11,24,.72)_100%),url('/images/team-blue-balls.png')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_17%_18%,rgba(22,131,255,.18),transparent_30%),radial-gradient(circle_at_80%_46%,rgba(22,131,255,.18),transparent_34%)]" />
        <div className="absolute inset-x-0 top-[82px] h-px bg-white/[0.08]" />

        <div className="container-page relative z-10 grid min-h-[calc(100vh-82px)] items-center gap-10 py-12 lg:grid-cols-[1.05fr_.95fr] xl:gap-16">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.32em] text-[#1683ff]">KK Hlohovec</p>
            <h1 className="mt-5 font-display text-5xl font-black leading-[.92] tracking-tight sm:text-6xl lg:text-7xl">
              KONTAKT
              <span className="mt-2 block text-[#1683ff]">Sme tu pre vás</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#c7d6ee]">
              Chcete sa pridať do klubu, prísť na tréning alebo si rezervovať dráhu? Napíšte nám alebo zavolajte. Radi vám pomôžeme.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {contactCards.map((item) => {
                const Icon = item.icon;
                const content = (
                  <div className="group rounded-2xl bg-[linear-gradient(180deg,rgba(10,29,58,.74),rgba(8,23,46,.52))] p-6 shadow-[0_18px_56px_rgba(0,0,0,.28),inset_0_1px_0_rgba(255,255,255,.045)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(0,0,0,.34),inset_0_1px_0_rgba(255,255,255,.06)]">
                    <div className="flex gap-4"><div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#0b3769] text-[#2290ff]"><Icon size={25} strokeWidth={1.8} /></div><div>
                    <h2 className="font-black">{item.title}</h2>
                    {item.title === "Sociálne siete" ? <div className="mt-3 flex gap-3"><a href="https://www.instagram.com/kolkyhc/" target="_blank" rel="noreferrer" aria-label="Instagram KK Hlohovec" className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-fuchsia-500 via-red-500 to-amber-400 text-white"><Instagram size={19} /></a><a href="https://www.facebook.com/profile.php?id=100080568604136&locale=hi_IN" target="_blank" rel="noreferrer" aria-label="Facebook KK Hlohovec" className="grid h-9 w-9 place-items-center rounded-lg bg-[#1877f2] text-white"><Facebook size={19} /></a></div> : <p className="mt-2 text-sm font-bold leading-6 text-[#d5e4f7]">{item.text}</p>}
                    <p className="mt-2 text-xs text-[#8fa7c2]">{item.note}</p></div></div>
                  </div>
                );

                return item.href ? (
                  <a key={item.title} href={item.href} target={item.title === "Adresa" ? "_blank" : undefined} rel={item.title === "Adresa" ? "noreferrer" : undefined} className="block">
                    {content}
                  </a>
                ) : (
                  <div key={item.title}>{content}</div>
                );
              })}
            </div>

            <div className="mt-8 rounded-2xl bg-[linear-gradient(180deg,rgba(10,29,58,.72),rgba(8,23,46,.48))] p-5 shadow-[0_18px_60px_rgba(0,0,0,.26),inset_0_1px_0_rgba(255,255,255,.045)] sm:flex sm:items-center sm:justify-between sm:gap-5">
              <div className="flex items-center gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white/9 text-[#8ec8ff]">
                  <Clock size={22} />
                </div>
                <div>
                  <h2 className="font-black">Rezervujte dráhy</h2>
                  <p className="mt-1 text-sm text-[#9fb0c8]">Dohodnite si tréning, zápas alebo klubové stretnutie.</p>
                </div>
              </div>
              <Button href="mailto:kkzprezident@gmail.com" variant="primary" className="mt-5 h-12 px-5 sm:mt-0">
                Rezervovať dráhu
                <ArrowRight size={16} />
              </Button>
            </div>
          </div>

          <section className="rounded-[22px] bg-[linear-gradient(180deg,rgba(10,29,58,.82),rgba(8,23,46,.64))] p-6 shadow-[0_26px_90px_rgba(0,0,0,.38),inset_0_1px_0_rgba(255,255,255,.055)] backdrop-blur-md sm:p-8 lg:max-w-[520px]">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1683ff]">Napíšte nám</p>
            <h2 className="mt-3 text-2xl font-black tracking-tight">Pošlite správu klubu</h2>
            <form className="mt-7 grid gap-4">
              <input className="h-13 rounded-xl bg-[#071a33]/80 px-4 text-sm text-white outline-none shadow-[inset_0_0_0_1px_rgba(255,255,255,.08)] transition placeholder:text-white/45 focus:shadow-[inset_0_0_0_1px_rgba(22,131,255,.58),0_0_0_4px_rgba(22,131,255,.12)]" placeholder="Meno a priezvisko" />
              <input className="h-13 rounded-xl bg-[#071a33]/80 px-4 text-sm text-white outline-none shadow-[inset_0_0_0_1px_rgba(255,255,255,.08)] transition placeholder:text-white/45 focus:shadow-[inset_0_0_0_1px_rgba(22,131,255,.58),0_0_0_4px_rgba(22,131,255,.12)]" placeholder="E-mail" type="email" />
              <select className="h-13 rounded-xl bg-[#071a33]/80 px-4 text-sm text-white outline-none shadow-[inset_0_0_0_1px_rgba(255,255,255,.08)] transition focus:shadow-[inset_0_0_0_1px_rgba(22,131,255,.58),0_0_0_4px_rgba(22,131,255,.12)]" defaultValue=""><option value="" disabled>Predmet</option><option>Členstvo</option><option>Rezervácia dráhy</option><option>Tréning</option><option>Iná otázka</option></select>
              <textarea className="min-h-[150px] resize-none rounded-xl bg-[#071a33]/80 px-4 py-4 text-sm text-white outline-none shadow-[inset_0_0_0_1px_rgba(255,255,255,.08)] transition placeholder:text-white/45 focus:shadow-[inset_0_0_0_1px_rgba(22,131,255,.58),0_0_0_4px_rgba(22,131,255,.12)]" placeholder="Vaša správa" />
              <button className="mt-2 inline-flex h-14 items-center justify-center gap-3 rounded-xl bg-[#1683ff] px-6 text-sm font-black uppercase tracking-[0.04em] text-white shadow-[0_18px_46px_rgba(22,131,255,.28)] transition hover:-translate-y-0.5 hover:bg-[#2b91ff]" type="submit">
                Odoslať správu
                <Send size={17} />
              </button>
              <p className="text-sm text-[#9fb0c8]">Kým sa formulár odosielania pripravuje, kontaktujte nás priamo na <a className="text-[#2290ff]" href="mailto:kkzprezident@gmail.com">kkzprezident@gmail.com</a>.</p>
            </form>
          </section>
        </div>
      </section>
    </main>
  );
}
