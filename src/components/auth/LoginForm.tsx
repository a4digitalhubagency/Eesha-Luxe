"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";
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
    if (!email.trim() || !password) return;

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Sign in failed. Please try again.");
        return;
      }

      setUser({ id: data.id, email: data.email, name: data.name ?? "" });
      router.push("/account");
      router.refresh();
    } catch {
      setError("Unable to connect. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
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
              onChange={(v) => { setEmail(v); setError(""); }}
              autoComplete="email"
            />
            <CheckoutInput
              label="Password"
              type="password"
              value={password}
              onChange={(v) => { setPassword(v); setError(""); }}
              autoComplete="current-password"
            />

            <div className="flex justify-end -mt-2">
              <span className="text-xs text-on-surface-faint">
                Forgot your password? Contact support.
              </span>
            </div>

            {error && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-sm px-3 py-2.5 -mt-2">
                <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-xs text-red-600 leading-relaxed">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email.trim() || !password}
              className="btn-primary w-full h-12 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign In"
              )}
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
