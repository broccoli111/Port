import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";

async function getContent() {
  const supabase = await createClient();

  const [heroRes, featuresRes, howItWorksRes, faqsRes] = await Promise.all([
    supabase
      .from("site_content")
      .select("content")
      .eq("page", "home")
      .eq("section", "hero")
      .single(),
    supabase
      .from("site_content")
      .select("content")
      .eq("page", "home")
      .eq("section", "features")
      .single(),
    supabase
      .from("site_content")
      .select("content")
      .eq("page", "home")
      .eq("section", "how_it_works")
      .single(),
    supabase.from("faqs").select("*").order("sort_order"),
  ]);

  return {
    hero: heroRes.data?.content as Record<string, string> | null,
    features: featuresRes.data?.content as {
      items: { title: string; description: string; icon: string }[];
    } | null,
    howItWorks: howItWorksRes.data?.content as {
      steps: { step: number; title: string; description: string }[];
    } | null,
    faqs: faqsRes.data || [],
  };
}

const featureIcons: Record<string, React.ReactNode> = {
  layers: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L12 12.75 6.429 9.75m11.142 0l4.179 2.25-9.75 5.25-9.75-5.25 4.179-2.25" />
    </svg>
  ),
  "credit-card": (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
    </svg>
  ),
  zap: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  ),
  activity: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  ),
};

export default async function HomePage() {
  const { hero, features, howItWorks, faqs } = await getContent();

  const heroTitle = hero?.title || "Ship faster with a dedicated design & dev team";
  const heroSubtitle =
    hero?.subtitle ||
    "Your on-demand creative and engineering partner. Submit tasks, track progress, and receive polished deliverables.";
  const ctaText = hero?.cta_text || "Get Started";
  const ctaLink = hero?.cta_link || "/pricing";

  const featureItems = features?.items || [];
  const steps = howItWorks?.steps || [];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 py-24 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary tracking-tight leading-tight">
              {heroTitle}
            </h1>
            <p className="mt-6 text-lg text-text-secondary max-w-2xl mx-auto">
              {heroSubtitle}
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Link href={ctaLink}>
                <Button size="lg">{ctaText}</Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg">
                  Log in
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-accent-light/30 to-transparent" />
      </section>

      {/* Features */}
      {featureItems.length > 0 && (
        <section className="py-20 bg-surface-secondary">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-text-primary text-center mb-12">
              Everything you need to move fast
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {featureItems.map((feature) => (
                <div
                  key={feature.title}
                  className="bg-surface rounded-xl border border-border p-6 hover:shadow-md transition-shadow"
                >
                  <div className="w-10 h-10 rounded-lg bg-accent-light flex items-center justify-center text-accent mb-4">
                    {featureIcons[feature.icon] || featureIcons.layers}
                  </div>
                  <h3 className="text-base font-semibold text-text-primary mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-text-secondary">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How it works */}
      {steps.length > 0 && (
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-text-primary text-center mb-12">
              How it works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {steps.map((step) => (
                <div key={step.step} className="text-center">
                  <div className="w-12 h-12 rounded-full bg-accent text-white flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                    {step.step}
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-text-secondary">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      {faqs.length > 0 && (
        <section className="py-20 bg-surface-secondary">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-text-primary text-center mb-12">
              Frequently asked questions
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
        </section>
      )}

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-text-primary mb-4">
            Ready to ship faster?
          </h2>
          <p className="text-text-secondary mb-8 max-w-xl mx-auto">
            Join teams that use our platform to accelerate their design and
            development workflow.
          </p>
          <Link href="/pricing">
            <Button size="lg">View pricing</Button>
          </Link>
        </div>
      </section>
    </>
  );
}
