import { NextResponse } from "next/server";
import { stripe } from "@/lib/payments";

export async function POST(request: Request) {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ ok: false, message: "Stripe webhook is not configured" }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ ok: false, message: "Missing signature" }, { status: 400 });

  const payload = await request.text();
  const event = stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET);

  // Production hook point:
  // checkout.session.completed -> update member payment history / tournament registration payment state.
  return NextResponse.json({ ok: true, received: event.type });
}
