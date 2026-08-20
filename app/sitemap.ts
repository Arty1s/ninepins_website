import type { MetadataRoute } from "next";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://kolkyhlohovec.com").replace(/\/$/, "");

const routes = [
  "",
  "/o_klube.html",
  "/timy",
  "/zapasy",
  "/turnaje",
  "/cennik",
  "/galeria",
  "/kontakt",
  "/prihlasenie",
  "/registracia"
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7
  }));
}
