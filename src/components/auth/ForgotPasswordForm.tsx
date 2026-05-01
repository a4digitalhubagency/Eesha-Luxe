"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { AuthHeader } from "./AuthHeader";
import { CheckoutInput } from "@/components/checkout/CheckoutInput";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setSubmitted(true);
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
            <p className="label text-primary mb-3">Account Recovery</p>
            <h1
              className="text-4xl text-on-surface mb-2"
              style={{ fontFamily: "var(--font-serif)", letterSpacing: "-0.02em" }}
            >
              Reset Password
            </h1>
            <p className="text-sm text-on-surface-muted">
              Enter your email and we&apos;ll send you a link to reset your password.
            </p>
          </div>

          {submitted ? (
            <div className="bg-surface-lowest rounded-sm p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={20} strokeWidth={1.5} className="text-primary" />
              </div>
              <p className="text-sm text-on-surface mb-2">Check your email</p>
              <p className="text-xs text-on-surface-muted leading-relaxed">
                If an account exists for <span className="text-on-surface">{email}</span>, a reset link has been sent.
                The link expires in 1 hour.
              </p>
              <Link
                href="/login"
                className="inline-block mt-6 text-xs uppercase tracking-widest text-primary hover:underline underline-offset-2"
              >
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <CheckoutInput
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(v) => { setEmail(v); setError(""); }}
                  autoComplete="email"
                />

                {error && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-sm px-3 py-2.5 -mt-2">
                    <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-red-600 leading-relaxed">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="btn-primary w-full h-12 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Sending…
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </form>

              <p className="text-center text-sm text-on-surface-muted mt-8">
                Remembered your password?{" "}
                <Link href="/login" className="text-primary hover:underline underline-offset-2 font-medium">
                  Sign In
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
