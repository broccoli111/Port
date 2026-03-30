import { stripe, getPlanFromPrice } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = await createServiceClient();

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      const priceId = subscription.items.data[0]?.price.id;
      const plan = getPlanFromPrice(priceId);

      let status: "active" | "canceled" | "past_due" | "trialing" = "active";
      if (subscription.status === "past_due") status = "past_due";
      else if (subscription.status === "canceled") status = "canceled";
      else if (subscription.status === "trialing") status = "trialing";

      // Find client by stripe_customer_id
      const { data: existingClient } = await supabase
        .from("clients")
        .select("id, user_id")
        .eq("stripe_customer_id", customerId)
        .single();

      if (existingClient) {
        await supabase
          .from("clients")
          .update({
            subscription_id: subscription.id,
            plan,
            status,
          })
          .eq("id", existingClient.id);
      } else {
        // New customer — try to find by checkout session metadata
        const customer = (await stripe.customers.retrieve(
          customerId
        )) as Stripe.Customer;
        const email = customer.email;

        if (email) {
          // Look up user by email
          const { data: userRecord } = await supabase
            .from("users")
            .select("id")
            .eq("email", email)
            .single();

          if (userRecord) {
            // Upsert client record
            const { data: clientRecord } = await supabase
              .from("clients")
              .select("id")
              .eq("user_id", userRecord.id)
              .single();

            if (clientRecord) {
              await supabase
                .from("clients")
                .update({
                  stripe_customer_id: customerId,
                  subscription_id: subscription.id,
                  plan,
                  status,
                })
                .eq("id", clientRecord.id);
            } else {
              await supabase.from("clients").insert({
                user_id: userRecord.id,
                stripe_customer_id: customerId,
                subscription_id: subscription.id,
                plan,
                status,
              });
            }
          }
        }
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      await supabase
        .from("clients")
        .update({ status: "canceled" })
        .eq("stripe_customer_id", customerId);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
