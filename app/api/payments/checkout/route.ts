import { NextResponse } from "next/server";
import { stripe } from "@/lib/payments";
import { getSiteUrl } from "@/lib/supabase-auth-server";

type CheckoutBody = {
  mode?: "membership" | "tournament";
  name?: string;
  amount?: number;
  email?: string;
  metadata?: Record<string, string>;
};

export async function POST(request: Request) {
  const body = (await request.json()) as CheckoutBody;

  if (!stripe) {
    return NextResponse.json({
      ok: false,
      message: "Stripe nie je nakonfigurovaný. Doplň STRIPE_SECRET_KEY a Stripe price/produkt v produkcii.",
      checkoutReady: false
    }, { status: 503 });
  }

  const amount = Number(body.amount || 0);
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ ok: false, message: "Invalid amount" }, { status: 400 });
  }

  const siteUrl = getSiteUrl(request.url);
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: body.email,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: Math.round(amount * 100),
          product_data: {
            name: body.name || (body.mode === "membership" ? "Členstvo KK Hlohovec" : "Turnaj KK Hlohovec")
          }
        }
      }
    ],
    metadata: {
      source: "kkhc-site",
      mode: body.mode || "membership",
      ...(body.metadata || {})
    },
    success_url: `${siteUrl}/profile?payment=success`,
    cancel_url: `${siteUrl}/profile?payment=cancelled`
  });

  return NextResponse.json({ ok: true, url: session.url });
}
