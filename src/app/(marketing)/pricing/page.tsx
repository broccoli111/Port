import { isSupabaseConfigured, createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";
import { PricingCard } from "@/components/pricing-card";
import type { SubscriptionPlan } from "@/types";

export const dynamic = "force-dynamic";

const fallbackTiers = [
  {
    id: "a",
    name: "Standard",
    plan: "A" as SubscriptionPlan,
    price: 3500,
    features: [
      "One active task at a time",
      "Unlimited requests",
      "48-hour turnaround",
      "Dedicated project manager",
      "Pause or cancel anytime",
    ],
    stripe_price_id: "",
    created_at: "",
  },
  {
    id: "b",
    name: "Pro",
    plan: "B" as SubscriptionPlan,
    price: 5500,
    features: [
      "Two active tasks at a time",
      "Unlimited requests",
      "24-hour turnaround",
      "Dedicated project manager",
      "Priority support",
      "Pause or cancel anytime",
      "Strategy consultation calls",
    ],
    stripe_price_id: "",
    created_at: "",
  },
];

const fallbackFaqs = [
  { id: "1", question: "How does the subscription work?", answer: "Once subscribed, you can submit unlimited design and development requests. We work through them based on priority, delivering completed work for your review." },
  { id: "2", question: "What counts as a single task?", answer: "A task is a self-contained unit of work — a landing page, a logo concept, a component build, etc. Complex projects are broken into multiple tasks." },
  { id: "3", question: "How do revisions work?", answer: "Every deliverable goes through a review cycle. You can request as many revisions as needed until you are satisfied with the result." },
  { id: "4", question: "Can I pause my subscription?", answer: "Yes. You can pause your subscription at any time from the billing portal and resume when you are ready." },
];

async function getData() {
  if (!isSupabaseConfigured()) {
    return { tiers: fallbackTiers, faqs: fallbackFaqs };
  }

  try {
    const supabase = await createClient();
    const { data: tiers } = await supabase
      .from("pricing_tiers")
      .select("*")
      .order("price");
    const { data: faqs } = await supabase
      .from("faqs")
      .select("*")
      .order("sort_order");

    return {
      tiers: tiers && tiers.length > 0 ? tiers : fallbackTiers,
      faqs: faqs && faqs.length > 0 ? faqs : fallbackFaqs,
    };
  } catch {
    return { tiers: fallbackTiers, faqs: fallbackFaqs };
  }
}

export default async function PricingPage() {
  const { tiers, faqs } = await getData();

  return (
    <div className="py-20">
      <div className="max-w-5xl mx-auto px-5 sm:px-6">
        <div className="text-center mb-10 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-text-secondary max-w-xl mx-auto">
            Choose the plan that fits your needs. No hidden fees. Pause or
            cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {tiers.map((tier) => (
            <PricingCard
              key={tier.id}
              name={tier.name}
              plan={tier.plan}
              price={formatCurrency(tier.price)}
              features={tier.features}
              highlighted={tier.plan === "B"}
            />
          ))}
        </div>

        {faqs.length > 0 && (
          <div className="mt-20 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-text-primary text-center mb-8">
              Questions? We have answers.
            </h2>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <details
                  key={faq.id}
                  className="group bg-surface border border-border rounded-xl"
                >
                  <summary className="flex items-center justify-between cursor-pointer p-5 text-text-primary font-medium text-sm">
                    {faq.question}
                    <svg
                      className="w-5 h-5 text-text-tertiary transition-transform group-open:rotate-180"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                      />
                    </svg>
                  </summary>
                  <div className="px-5 pb-5 text-sm text-text-secondary">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
