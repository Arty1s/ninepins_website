import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/app-shell";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kolkyhlohovec.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Kolkársky Klub Hlohovec | KKHC",
  description: "Moderný športový klub pre kolky v Hlohovci. Tímy, turnaje, mestská liga, členstvo a galéria.",
  keywords: ["kolky Hlohovec", "kolkársky klub Hlohovec", "kolkáreň Hlohovec", "šport Hlohovec", "turnaje kolky Hlohovec"],
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "Kolkársky Klub Hlohovec",
    description: "Tradícia, tímový duch a vášeň pre kolky.",
    url: siteUrl,
    siteName: "KK Hlohovec",
    locale: "sk_SK",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Kolkársky Klub Hlohovec",
    description: "Tradícia, tímový duch a vášeň pre kolky."
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sk">
      <body className="font-sans antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
