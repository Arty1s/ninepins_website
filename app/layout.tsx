import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/app-shell";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kolkyhlohovec.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "KK Hlohovec | Kolkársky klub a kolky v Hlohovci",
    template: "%s | KK Hlohovec"
  },
  description: "Kolkársky klub Hlohovec – tímy, zápasy, turnaje, tréningy a informácie o kolkoch v Hlohovci.",
  keywords: ["kolky Hlohovec", "kolkársky klub Hlohovec", "kolkáreň Hlohovec", "šport Hlohovec", "turnaje kolky Hlohovec"],
  openGraph: {
    title: "KK Hlohovec | Kolkársky klub v Hlohovci",
    description: "Tímy, zápasy, turnaje, tréningy a informácie o kolkoch v Hlohovci.",
    url: siteUrl,
    siteName: "KK Hlohovec",
    locale: "sk_SK",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "KK Hlohovec | Kolkársky klub v Hlohovci",
    description: "Tímy, zápasy, turnaje, tréningy a informácie o kolkoch v Hlohovci."
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
