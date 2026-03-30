"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";

export function BillingPortalButton() {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setLoading(false);
    }
  }

  return (
    <Button variant="outline" onClick={handleClick} loading={loading}>
      Manage Billing
    </Button>
  );
}
