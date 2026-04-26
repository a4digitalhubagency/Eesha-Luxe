"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Check, Loader2 } from "lucide-react";
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
    return (v: string) => {
      setForm((f) => ({ ...f, [field]: v }));
      setError("");
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!agreed) return;

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Registration failed. Please try again.");
        return;
      }

      setUser({ id: data.id, email: data.email, name: data.name ?? `${form.firstName} ${form.lastName}` });
      router.push("/account");
      router.refresh();
    } catch {
      setError("Unable to connect. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  const passwordStrength =
    form.password.length === 0 ? null :
    form.password.length < 8 ? "weak" :
    form.password.length < 12 ? "fair" : "strong";

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

            <CheckoutInput
              label="Email Address"
              type="email"
              value={form.email}
              onChange={set("email")}
              autoComplete="email"
            />

            <div>
              <CheckoutInput
                label="Password"
                type="password"
                value={form.password}
                onChange={set("password")}
                autoComplete="new-password"
              />
              {passwordStrength && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex gap-1 flex-1">
                    {["weak", "fair", "strong"].map((level, i) => (
                      <div
                        key={level}
                        className={`h-0.5 flex-1 rounded-full transition-colors ${
                          passwordStrength === "weak" && i === 0 ? "bg-red-400" :
                          passwordStrength === "fair" && i <= 1 ? "bg-amber-400" :
                          passwordStrength === "strong" ? "bg-emerald-400" :
                          "bg-outline/15"
                        }`}
                      />
                    ))}
                  </div>
                  <span className={`text-[10px] uppercase tracking-wide ${
                    passwordStrength === "weak" ? "text-red-400" :
                    passwordStrength === "fair" ? "text-amber-500" :
                    "text-emerald-500"
                  }`}>
                    {passwordStrength}
                  </span>
                </div>
              )}
            </div>

            <CheckoutInput
              label="Confirm Password"
              type="password"
              value={form.confirm}
              onChange={set("confirm")}
              autoComplete="new-password"
            />

            <label className="flex items-start gap-3 cursor-pointer">
              <span
                onClick={() => setAgreed((v) => !v)}
                className={`mt-0.5 w-4 h-4 flex items-center justify-center shrink-0 border transition-all ${
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
              <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-sm px-3 py-2.5 -mt-2">
                <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-xs text-red-600 leading-relaxed">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !agreed}
              className="btn-primary w-full h-12 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Creating account…
                </>
              ) : (
                "Create Account"
              )}
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
