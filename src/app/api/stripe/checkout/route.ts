import { stripe, getStripePrice } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { plan } = await request.json();

    if (!plan || !["A", "B"].includes(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const priceId = getStripePrice(plan);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

    // If user is authenticated, attach their email and metadata
    const sessionParams: Parameters<typeof stripe.checkout.sessions.create>[0] = {
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/portal?checkout=success`,
      cancel_url: `${appUrl}/pricing?checkout=canceled`,
      metadata: { plan },
    };

    if (user) {
      // Check for existing Stripe customer
      const { data: client } = await supabase
        .from("clients")
        .select("stripe_customer_id")
        .eq("user_id", user.id)
        .single();

      if (client?.stripe_customer_id) {
        sessionParams.customer = client.stripe_customer_id;
      } else {
        sessionParams.customer_email = user.email;
      }
      sessionParams.metadata!.user_id = user.id;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
