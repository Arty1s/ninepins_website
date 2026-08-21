import type { Metadata } from "next";
import { GalleryPage } from "@/components/gallery-page";

export const metadata: Metadata = {
  title: "Galéria KK Hlohovec",
  description: "Fotografie zo zápasov, turnajov a klubových podujatí Kolkárskeho klubu Hlohovec.",
  alternates: { canonical: "/galeria" },
  openGraph: { title: "Galéria KK Hlohovec", description: "Fotografie zo zápasov a podujatí KK Hlohovec.", url: "/galeria" }
};

export default function GaleriaPage() {
  return <GalleryPage />;
}
