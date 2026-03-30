"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useRef, useState } from "react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"password" | "magic">("password");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/portal";
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);

  function getSupabase() {
    if (!supabaseRef.current) {
      supabaseRef.current = createClient();
    }
    return supabaseRef.current;
  }

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: signInError } = await getSupabase().auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    router.push(redirect);
    router.refresh();
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: signInError } = await getSupabase().auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${redirect}`,
      },
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    setMessage("Check your email for the login link.");
    setLoading(false);
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
        </Link>
        <h1 className="text-2xl font-bold text-text-primary">Welcome back</h1>
        <p className="text-sm text-text-secondary mt-1">
          Sign in to your account
        </p>
      </div>

      <div className="bg-surface rounded-xl border border-border p-6 shadow-sm">
        <div className="flex gap-1 p-1 bg-surface-secondary rounded-lg mb-6">
          <button
            className={`flex-1 text-sm py-1.5 rounded-md font-medium transition-colors ${
              mode === "password"
                ? "bg-surface text-text-primary shadow-sm"
                : "text-text-secondary"
            }`}
            onClick={() => setMode("password")}
          >
            Password
          </button>
          <button
            className={`flex-1 text-sm py-1.5 rounded-md font-medium transition-colors ${
              mode === "magic"
                ? "bg-surface text-text-primary shadow-sm"
                : "text-text-secondary"
            }`}
            onClick={() => setMode("magic")}
          >
            Magic Link
          </button>
        </div>

        <form
          onSubmit={mode === "password" ? handlePasswordLogin : handleMagicLink}
          className="space-y-4"
        >
          <Input
            id="email"
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {mode === "password" && (
            <Input
              id="password"
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          )}

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
            {mode === "password" ? "Sign in" : "Send magic link"}
          </Button>
        </form>
      </div>

      <p className="text-center text-sm text-text-secondary mt-6">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="text-accent hover:text-accent-hover font-medium"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-secondary px-4">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
