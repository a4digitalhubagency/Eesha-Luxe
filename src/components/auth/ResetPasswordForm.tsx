"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { AuthHeader } from "./AuthHeader";
import { CheckoutInput } from "@/components/checkout/CheckoutInput";

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  if (!token) {
    return (
      <div className="bg-surface min-h-screen flex flex-col">
        <AuthHeader />
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm text-center">
            <h1 className="text-3xl text-on-surface mb-3" style={{ fontFamily: "var(--font-serif)" }}>
              Invalid Link
            </h1>
            <p className="text-sm text-on-surface-muted mb-6">
              This password reset link is missing a token.
            </p>
            <Link href="/forgot-password" className="btn-primary inline-flex h-11 px-6 items-center">
              Request a new link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to reset password.");
        return;
      }
      setDone(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-surface min-h-screen flex flex-col">
      <AuthHeader />

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {done ? (
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={20} strokeWidth={1.5} className="text-primary" />
              </div>
              <h1 className="text-3xl text-on-surface mb-3" style={{ fontFamily: "var(--font-serif)" }}>
                Password Reset
              </h1>
              <p className="text-sm text-on-surface-muted">
                Your password has been reset. Redirecting you to sign in…
              </p>
            </div>
          ) : (
            <>
              <div className="mb-10 text-center">
                <p className="label text-primary mb-3">Set New Password</p>
                <h1
                  className="text-4xl text-on-surface mb-2"
                  style={{ fontFamily: "var(--font-serif)", letterSpacing: "-0.02em" }}
                >
                  New Password
                </h1>
                <p className="text-sm text-on-surface-muted">
                  Choose a new password for your account.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <CheckoutInput
                  label="New Password"
                  type="password"
                  value={password}
                  onChange={(v) => { setPassword(v); setError(""); }}
                  autoComplete="new-password"
                />
                <CheckoutInput
                  label="Confirm Password"
                  type="password"
                  value={confirm}
                  onChange={(v) => { setConfirm(v); setError(""); }}
                  autoComplete="new-password"
                />

                {error && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-sm px-3 py-2.5 -mt-2">
                    <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-red-600 leading-relaxed">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !password || !confirm}
                  className="btn-primary w-full h-12 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Setting password…
                    </>
                  ) : (
                    "Set New Password"
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
