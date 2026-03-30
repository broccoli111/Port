"use client";

import { Button } from "@/components/ui/button";
import { CheckIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import { useState } from "react";
import type { SubscriptionPlan } from "@/types";

interface PricingCardProps {
  name: string;
  plan: SubscriptionPlan;
  price: string;
  features: string[];
  highlighted?: boolean;
}

export function PricingCard({
  name,
  plan,
  price,
  features,
  highlighted = false,
}: PricingCardProps) {
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setLoading(false);
    }
  }

  return (
    <div
      className={cn(
        "rounded-2xl border p-8 flex flex-col",
        highlighted
          ? "border-accent bg-surface shadow-lg ring-1 ring-accent"
          : "border-border bg-surface"
      )}
    >
      {highlighted && (
        <span className="inline-block text-xs font-semibold text-accent bg-accent-light px-3 py-1 rounded-full mb-4 self-start">
          Most popular
        </span>
      )}
      <h3 className="text-xl font-bold text-text-primary">{name}</h3>
      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-4xl font-bold text-text-primary">{price}</span>
        <span className="text-text-secondary text-sm">/month</span>
      </div>
      <ul className="mt-8 space-y-3 flex-1">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <CheckIcon className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
            <span className="text-sm text-text-secondary">{feature}</span>
          </li>
        ))}
      </ul>
      <Button
        className="w-full mt-8"
        variant={highlighted ? "primary" : "outline"}
        onClick={handleCheckout}
        loading={loading}
      >
        Get started
      </Button>
    </div>
  );
}
