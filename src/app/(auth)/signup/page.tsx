"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();
  const supabase = createClient();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role: "client" },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    setMessage("Check your email to confirm your account.");
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-secondary px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-text-primary">
            Create your account
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Get started with your subscription
          </p>
        </div>

        <div className="bg-surface rounded-xl border border-border p-6 shadow-sm">
          <form onSubmit={handleSignup} className="space-y-4">
            <Input
              id="name"
              label="Full name"
              type="text"
              placeholder="Jane Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <Input
              id="email"
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              id="password"
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />

            {error && (
              <p className="text-sm text-error bg-red-50 p-3 rounded-lg">
                {error}
              </p>
            )}

            {message && (
              <p className="text-sm text-success bg-green-50 p-3 rounded-lg">
                {message}
              </p>
            )}

            <Button type="submit" className="w-full" loading={loading}>
              Create account
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-text-secondary mt-6">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-accent hover:text-accent-hover font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
