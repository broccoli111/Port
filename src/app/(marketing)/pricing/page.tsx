import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";
import { PricingCard } from "@/components/pricing-card";

async function getData() {
  const supabase = await createClient();
  const { data: tiers } = await supabase
    .from("pricing_tiers")
    .select("*")
    .order("price");
  const { data: faqs } = await supabase
    .from("faqs")
    .select("*")
    .order("sort_order");

  return { tiers: tiers || [], faqs: faqs || [] };
}

export default async function PricingPage() {
  const { tiers, faqs } = await getData();

  // Fallback tiers if DB is empty
  const displayTiers =
    tiers.length > 0
      ? tiers
      : [
          {
            id: "a",
            name: "Standard",
            plan: "A" as const,
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
            plan: "B" as const,
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

  return (
    <div className="py-20">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-text-primary mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-text-secondary max-w-xl mx-auto">
            Choose the plan that fits your needs. No hidden fees. Pause or
            cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {displayTiers.map((tier) => (
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
