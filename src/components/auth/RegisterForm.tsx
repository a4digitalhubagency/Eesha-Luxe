"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { AuthHeader } from "./AuthHeader";
import { CheckoutInput } from "@/components/checkout/CheckoutInput";
import { useSessionStore } from "@/store/session";

export function RegisterForm() {
  const router = useRouter();
  const setUser = useSessionStore((s) => s.setUser);

  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", password: "", confirm: "",
  });
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function set(field: string) {
    return (v: string) => setForm((f) => ({ ...f, [field]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!agreed) return;

    setError("");

    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Registration failed.");
      return;
    }

    setUser({ id: "", email: form.email, name: `${form.firstName} ${form.lastName}` });
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
              Create Your Account
            </h1>
            <p className="text-sm text-on-surface-muted">
              Join the Digital Atelier community.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4">
              <CheckoutInput label="First Name" value={form.firstName} onChange={set("firstName")} autoComplete="given-name" />
              <CheckoutInput label="Last Name" value={form.lastName} onChange={set("lastName")} autoComplete="family-name" />
            </div>
            <CheckoutInput label="Email Address" type="email" value={form.email} onChange={set("email")} autoComplete="email" />
            <CheckoutInput label="Password" type="password" value={form.password} onChange={set("password")} autoComplete="new-password" />
            <CheckoutInput label="Confirm Password" type="password" value={form.confirm} onChange={set("confirm")} autoComplete="new-password" />

            <label className="flex items-start gap-3 cursor-pointer">
              <span
                onClick={() => setAgreed((v) => !v)}
                className={`mt-0.5 w-4 h-4 flex items-center justify-center flex-shrink-0 border transition-all ${
                  agreed ? "bg-secondary border-secondary" : "bg-surface-lowest border-outline/25"
                }`}
              >
                {agreed && <Check size={10} strokeWidth={2.5} className="text-white" />}
              </span>
              <span className="text-xs text-on-surface-muted leading-relaxed">
                I agree to the{" "}
                <Link href="/terms" className="text-primary hover:underline underline-offset-2">Terms of Service</Link>
                {" "}and{" "}
                <Link href="/privacy" className="text-primary hover:underline underline-offset-2">Privacy Policy</Link>.
              </span>
            </label>

            {error && (
              <p className="text-xs text-red-500 -mt-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !agreed}
              className="btn-primary w-full h-12 flex items-center justify-center gap-2 disabled:opacity-40"
            >
              {loading ? "Creating account…" : <>Create Account <span>→</span></>}
            </button>
          </form>

          <p className="text-center text-sm text-on-surface-muted mt-8">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline underline-offset-2 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
