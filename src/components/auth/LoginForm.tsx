"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthHeader } from "./AuthHeader";
import { CheckoutInput } from "@/components/checkout/CheckoutInput";
import { useSessionStore } from "@/store/session";

export function LoginForm() {
  const router = useRouter();
  const setUser = useSessionStore((s) => s.setUser);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Sign in failed.");
      return;
    }

    setUser({ id: data.id ?? "", email: data.email ?? email, name: data.name ?? "" });
    router.push("/account");
  }

  return (
    <div className="bg-surface min-h-screen flex flex-col">
      <AuthHeader />

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-10 text-center">
            <p className="label text-primary mb-3">My Atelier</p>
            <h1
              className="text-4xl text-on-surface mb-2"
              style={{ fontFamily: "var(--font-serif)", letterSpacing: "-0.02em" }}
            >
              Welcome Back
            </h1>
            <p className="text-sm text-on-surface-muted">
              Sign in to your Digital Atelier account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <CheckoutInput
              label="Email Address"
              type="email"
              value={email}
              onChange={setEmail}
              autoComplete="email"
            />
            <CheckoutInput
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              autoComplete="current-password"
            />

            <div className="flex justify-end -mt-2">
              <Link href="/forgot-password" className="text-xs text-on-surface-faint hover:text-primary transition-colors">
                Forgot your password?
              </Link>
            </div>

            {error && (
              <p className="text-xs text-red-500 -mt-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full h-12 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? "Signing in…" : <>Sign In <span>→</span></>}
            </button>
          </form>

          <p className="text-center text-sm text-on-surface-muted mt-8">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-primary hover:underline underline-offset-2 font-medium">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
