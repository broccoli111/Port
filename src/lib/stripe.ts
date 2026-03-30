import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-08-27.basil",
      typescript: true,
    });
  }
  return _stripe;
}

export function getStripePrice(plan: "A" | "B"): string {
  if (plan === "A") return process.env.STRIPE_PRICE_ID_PLAN_A!;
  return process.env.STRIPE_PRICE_ID_PLAN_B!;
}

export function getPlanFromPrice(priceId: string): "A" | "B" | null {
  if (priceId === process.env.STRIPE_PRICE_ID_PLAN_A) return "A";
  if (priceId === process.env.STRIPE_PRICE_ID_PLAN_B) return "B";
  return null;
}
