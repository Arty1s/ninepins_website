import type { Metadata } from "next";
import { MembershipPricingPage } from "@/components/membership-pricing";

export const metadata: Metadata = {
  title: "Členstvo a cenník kolkárne v Hlohovci",
  description: "Cenník členstva KK Hlohovec, prenájmu kolkárne a rezervácie kolkárskej dráhy v Hlohovci.",
  alternates: { canonical: "/cennik" },
  openGraph: { title: "Členstvo a cenník | KK Hlohovec", description: "Členstvo, prenájom kolkárne a rezervácia dráhy v Hlohovci.", url: "/cennik" }
};

export default function CennikPage() {
  return <MembershipPricingPage />;
}
