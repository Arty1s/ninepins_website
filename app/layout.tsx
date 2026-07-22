import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/app-shell";

export const metadata: Metadata = {
  title: "Kolkársky Klub Hlohovec | KKHC",
  description: "Moderný športový klub pre kolky v Hlohovci. Tímy, turnaje, mestská liga, členstvo a galéria.",
  keywords: ["kolky Hlohovec", "kolkársky klub Hlohovec", "kolkáreň Hlohovec", "šport Hlohovec", "turnaje kolky Hlohovec"],
  openGraph: {
    title: "Kolkársky Klub Hlohovec",
    description: "Tradícia, tímový duch a vášeň pre kolky.",
    locale: "sk_SK",
    type: "website"
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
