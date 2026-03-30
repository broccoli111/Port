import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data: client } = await supabase
      .from("clients")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single();

    if (!client?.stripe_customer_id) {
      return NextResponse.json(
        { error: "No billing account found" },
        { status: 404 }
      );
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: client.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/portal/billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Portal error:", err);
    return NextResponse.json(
      { error: "Failed to create portal session" },
      { status: 500 }
    );
  }
}
