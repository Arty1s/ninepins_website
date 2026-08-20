import { homeWidgetRegistry } from "@/components/home-widgets";

const schema = {
  "@context": "https://schema.org",
  "@type": ["SportsClub", "LocalBusiness"],
  name: "Kolkársky Klub Hlohovec",
  alternateName: "KK Hlohovec",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Bernolákova 720",
    addressLocality: "Hlohovec",
    addressCountry: "SK"
  },
  sport: "Nine-pin bowling",
  url: "https://kkhlohovec.sk",
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
