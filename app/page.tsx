import type { Metadata } from "next";
import { homeWidgetRegistry } from "@/components/home-widgets";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://kolkyhlohovec.com").replace(/\/$/, "");

export const metadata: Metadata = {
  title: "KK Hlohovec | Kolkársky klub a kolky v Hlohovci",
  description: "Kolkársky klub Hlohovec – tímy, zápasy, turnaje, tréningy a informácie pre každého, kto chce hrať kolky v Hlohovci.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "KK Hlohovec | Kolky v Hlohovci",
    description: "Spoznajte KK Hlohovec, naše tímy, zápasy, turnaje a možnosti tréningu kolkov v Hlohovci.",
    url: "/"
  }
};

const schema = {
  "@context": "https://schema.org",
  "@type": "SportsClub",
  name: "Kolkársky Klub Hlohovec",
  alternateName: "KK Hlohovec",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Bernolákova 720",
    addressLocality: "Hlohovec",
    addressCountry: "SK"
  },
  sport: "Nine-pin bowling",
  url: siteUrl,
  keywords: "kolky Hlohovec, kolkársky klub Hlohovec, kolkáreň Hlohovec, šport Hlohovec, turnaje kolky Hlohovec"
};

const pageWidgets = [
  homeWidgetRegistry.hero,
  homeWidgetRegistry.introCards,
  homeWidgetRegistry.lowerClubSection
];

export default function HomePage() {
  return (
    <main className="overflow-hidden bg-[#031326] text-[#f7faff]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      {pageWidgets.map((Widget, index) => (
        <Widget key={index} />
      ))}
    </main>
  );
}
