import Link from "next/link";
import { ArrowRight, Clock, Mail, MapPin, MessageSquareText, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

const contactCards = [
  {
    title: "Adresa",
    text: "Bernolákova 720, Hlohovec",
    icon: MapPin
  },
  {
    title: "E-mail",
    text: "prezidentkkz@gmail.com",
    icon: Mail,
    href: "mailto:prezidentkkz@gmail.com"
  },
  {
    title: "Tréningy a rezervácie",
    text: "Napíšte nám a dohodneme najbližší voľný termín.",
    icon: Clock
  },
  {
    title: "Členstvo",
    text: "Radi poradíme novým hráčom, rodičom aj partnerom.",
    icon: MessageSquareText
  }
];

export default function KontaktPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#020b18] text-white">
      <section className="relative min-h-[calc(100vh-82px)] pt-[82px]">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,11,24,.96)_0%,rgba(3,16,34,.86)_38%,rgba(3,16,34,.48)_68%,rgba(2,11,24,.86)_100%),url('/images/contact-spotlight-bg.png')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_17%_18%,rgba(22,131,255,.18),transparent_30%),radial-gradient(circle_at_80%_46%,rgba(22,131,255,.18),transparent_34%)]" />
        <div className="absolute inset-x-0 top-[82px] h-px bg-white/[0.08]" />

        <div className="container-page relative z-10 grid min-h-[calc(100vh-82px)] items-center gap-10 py-12 lg:grid-cols-[1.05fr_.95fr] xl:gap-16">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.32em] text-[#1683ff]">KK Hlohovec</p>
            <h1 className="mt-5 font-display text-5xl font-black uppercase leading-none tracking-tight sm:text-6xl lg:text-7xl">
              Kontakt
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#c7d6ee]">
              Máte otázky, záujem o členstvo, turnaj alebo rezerváciu dráh Napíšte nám a ozveme sa vám čo najskôr.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {contactCards.map((item) => {
                const Icon = item.icon;
                const content = (
                  <div className="group rounded-2xl bg-[linear-gradient(180deg,rgba(10,29,58,.74),rgba(8,23,46,.52))] p-6 shadow-[0_18px_56px_rgba(0,0,0,.28),inset_0_1px_0_rgba(255,255,255,.045)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(0,0,0,.34),inset_0_1px_0_rgba(255,255,255,.06)]">
                    <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-[#1683ff]/14 text-[#2290ff]">
                      <Icon size={25} strokeWidth={1.8} />
                    </div>
                    <h2 className="text-sm font-black uppercase tracking-[0.06em]">{item.title}</h2>
                    <p className="mt-3 text-sm leading-6 text-[#c5d4ea]">{item.text}</p>
                  </div>
                );

                return item.href ? (
                  <a key={item.title} href={item.href} className="block">
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
              <Button href="mailto:prezidentkkz@gmail.com" variant="secondary" className="mt-5 h-12 px-5 sm:mt-0">
                Napísať e-mail
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
              <input className="h-13 rounded-xl bg-[#071a33]/80 px-4 text-sm text-white outline-none shadow-[inset_0_0_0_1px_rgba(255,255,255,.08)] transition placeholder:text-white/45 focus:shadow-[inset_0_0_0_1px_rgba(22,131,255,.58),0_0_0_4px_rgba(22,131,255,.12)]" placeholder="Predmet" />
              <textarea className="min-h-[150px] resize-none rounded-xl bg-[#071a33]/80 px-4 py-4 text-sm text-white outline-none shadow-[inset_0_0_0_1px_rgba(255,255,255,.08)] transition placeholder:text-white/45 focus:shadow-[inset_0_0_0_1px_rgba(22,131,255,.58),0_0_0_4px_rgba(22,131,255,.12)]" placeholder="Vaša správa" />
              <button className="mt-2 inline-flex h-14 items-center justify-center gap-3 rounded-xl bg-[#1683ff] px-6 text-sm font-black uppercase tracking-[0.04em] text-white shadow-[0_18px_46px_rgba(22,131,255,.28)] transition hover:-translate-y-0.5 hover:bg-[#2b91ff]" type="submit">
                Odoslať správu
                <Send size={17} />
              </button>
              <p className="text-sm text-[#9fb0c8]">Formulár je pripravený pre napojenie na Resend. Zatiaľ nás kontaktujte priamo e-mailom.</p>
            </form>
          </section>
        </div>
      </section>
    </main>
  );
}
