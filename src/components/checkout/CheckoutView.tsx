"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, Shield, Leaf, Truck } from "lucide-react";
import { CheckoutInput } from "./CheckoutInput";
import { useCartStore } from "@/store/cart";
import { useSessionStore } from "@/store/session";

function fmt(n: number) {
  return n.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function DesktopOrderSummary() {
  const items = useCartStore((s) => s.items);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const tax = subtotal * 0.075;

  return (
    <div className="bg-surface-lowest rounded-sm p-8 sticky top-20">
      <h2 className="text-2xl text-on-surface mb-6" style={{ fontFamily: "var(--font-serif)", letterSpacing: "-0.02em" }}>
        Order Summary
      </h2>
      <div className="flex flex-col gap-4 mb-6">
        {items.map((item) => (
          <div key={item.productId} className="flex gap-3">
            <div className="relative w-16 aspect-4/5 bg-surface-low rounded-sm overflow-hidden shrink-0">
              <Image src={item.image} alt={item.name} fill className="object-cover object-top" sizes="64px" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-on-surface uppercase tracking-wide leading-snug">{item.name}</p>
              <p className="text-xs text-on-surface-faint mt-0.5">Qty {item.quantity}</p>
              <p className="text-sm text-on-surface-muted mt-1">₦{fmt(item.price * item.quantity)}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-outline/10 pt-4 flex flex-col gap-3 mb-4">
        {[
          { label: "Subtotal", value: `₦${fmt(subtotal)}` },
          { label: "Shipping", value: "Complimentary" },
          { label: "VAT (7.5%)", value: `₦${fmt(tax)}` },
        ].map(({ label, value }) => (
          <div key={label} className="flex justify-between">
            <span className="text-sm text-on-surface-muted">{label}</span>
            <span className="text-sm text-on-surface-muted">{value}</span>
          </div>
        ))}
      </div>
      <div className="border-t border-outline/15 pt-4 flex justify-between mb-6">
        <span className="text-base font-medium text-on-surface">Total</span>
        <span className="text-xl font-medium text-on-surface" style={{ fontFamily: "var(--font-serif)" }}>
          ₦{fmt(subtotal + tax)}
        </span>
      </div>
      <div className="flex items-center justify-center gap-5">
        <Shield size={18} className="text-on-surface-faint" />
        <Leaf size={18} className="text-on-surface-faint" />
        <Truck size={18} className="text-on-surface-faint" />
      </div>
    </div>
  );
}

type AccountMode = "guest" | "login" | "register";

export function CheckoutView() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const user = useSessionStore((s) => s.user);
  const setUser = useSessionStore((s) => s.setUser);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const tax = subtotal * 0.075;
  const total = subtotal + tax;

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Account flow state (only used when not logged in)
  const [accountMode, setAccountMode] = useState<AccountMode>("guest");
  const [accountLoading, setAccountLoading] = useState(false);
  const [accountError, setAccountError] = useState("");
  const [authForm, setAuthForm] = useState({ email: "", password: "", firstName: "", lastName: "" });

  const [form, setForm] = useState({
    firstName: "", lastName: "", phone: "", address: "", city: "", state: "", postal: "",
  });

  function set(field: string) {
    return (v: string) => setForm((f) => ({ ...f, [field]: v }));
  }
  function setAuth(field: string) {
    return (v: string) => setAuthForm((f) => ({ ...f, [field]: v }));
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAccountError("");
    setAccountLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: authForm.email.trim(), password: authForm.password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAccountError(data.error ?? "Sign in failed.");
        return;
      }
      setUser({ id: data.id, email: data.email, name: data.name ?? "" });
      router.refresh();
    } catch {
      setAccountError("Unable to connect. Please try again.");
    } finally {
      setAccountLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setAccountError("");
    setAccountLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: authForm.firstName.trim(),
          lastName: authForm.lastName.trim(),
          email: authForm.email.trim(),
          password: authForm.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAccountError(data.error ?? "Registration failed.");
        return;
      }
      setUser({ id: data.id, email: data.email, name: data.name ?? "" });
      // pre-fill shipping with the names they used
      setForm((f) => ({ ...f, firstName: authForm.firstName, lastName: authForm.lastName }));
      router.refresh();
    } catch {
      setAccountError("Unable to connect. Please try again.");
    } finally {
      setAccountLoading(false);
    }
  }

  async function handleCompleteOrder() {
    const required: [string, string][] = [
      [form.firstName, "First name"],
      [form.lastName, "Last name"],
      [form.phone, "Phone number"],
      [form.address, "Shipping address"],
      [form.city, "City"],
      [form.state, "State"],
      [form.postal, "Postal code"],
    ];
    const missing = required.find(([val]) => !val.trim());
    if (missing) {
      setError(`${missing[1]} is required.`);
      return;
    }

    // Guest checkout requires email
    if (!user && accountMode === "guest" && !authForm.email.trim()) {
      setError("Email is required to place an order.");
      return;
    }

    setError("");
    setSubmitting(true);

    const guestEmail = !user ? authForm.email.trim() : undefined;

    let publicKey: string;
    let serverTotal: number;
    try {
      const res = await fetch("/api/checkout/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          guestEmail,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to initialize payment.");
        setSubmitting(false);
        return;
      }
      publicKey = data.publicKey;
      serverTotal = data.total;
    } catch {
      setError("Unable to connect. Please check your connection and try again.");
      setSubmitting(false);
      return;
    }

    try {
      await new Promise<void>((resolve, reject) => {
        if ((window as { PaystackPop?: unknown }).PaystackPop) { resolve(); return; }
        const script = document.createElement("script");
        script.src = "https://js.paystack.co/v1/inline.js";
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load payment SDK"));
        document.head.appendChild(script);
      });
    } catch {
      setError("Payment service could not be loaded. Please check your connection and try again.");
      setSubmitting(false);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const PaystackPop = (window as any).PaystackPop as {
      setup: (opts: {
        key: string; email: string; amount: number;
        callback: (response: { reference: string }) => void;
        onClose: () => void;
      }) => { openIframe: () => void };
    };

    // PayStack v1 inline.js validates `typeof callback === "function"` and
    // some bundler outputs of async arrow functions fail that check. Wrap in
    // a regular function that delegates to an async IIFE.
    function onPaystackSuccess(response: { reference: string }) {
      void (async () => {
        try {
          const res = await fetch("/api/checkout/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              reference: response.reference,
              // Only send productId + quantity; server recomputes prices from DB
              items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
              shipping: {
                firstName: form.firstName,
                lastName: form.lastName,
                line1: form.address,
                city: form.city,
                state: form.state,
                postalCode: form.postal,
                country: "Nigeria",
                phone: form.phone,
              },
              guestEmail,
            }),
          });
          const data = await res.json();
          if (!res.ok) {
            setError(data.error ?? "Order could not be saved. Please contact support.");
            setSubmitting(false);
            return;
          }
          clearCart();
          router.push(`/checkout/success?ref=${data.orderId}`);
        } catch {
          setError(
            `Payment received but order could not be saved. Contact support with reference: ${response.reference}`
          );
          setSubmitting(false);
        }
      })();
    }

    function onPaystackClose() {
      setError("Payment was cancelled. You have not been charged.");
      setSubmitting(false);
    }

    // No `ref` passed — PayStack auto-generates a unique reference for
    // each popup, which we capture in the success callback and verify.
    const handler = PaystackPop.setup({
      key: publicKey,
      email: user?.email ?? guestEmail ?? "",
      amount: Math.round(serverTotal * 100),
      callback: onPaystackSuccess,
      onClose: onPaystackClose,
    });

    handler.openIframe();
  }

  const inputClass =
    "w-full border border-outline/20 rounded-sm px-3 py-2.5 text-sm text-on-surface bg-surface focus:outline-none focus:border-primary/50 transition-colors";
  const labelClass = "block text-[10px] uppercase tracking-widest text-on-surface-faint mb-1.5";

  return (
    <div className="bg-surface min-h-screen">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10">
        <div className="md:grid md:grid-cols-[1fr_380px] md:gap-14">

          <div>
            <div className="md:hidden bg-surface-low rounded-sm p-4 mb-8 flex items-center justify-between">
              <span className="label text-on-surface-muted">Your Selection ({items.length} item{items.length !== 1 ? "s" : ""})</span>
              <span className="text-sm font-medium text-on-surface">₦{fmt(subtotal)}</span>
            </div>

            {/* Account section — guest / login / register */}
            <section className="mb-10">
              <h2 className="text-2xl text-on-surface mb-4" style={{ fontFamily: "var(--font-serif)", letterSpacing: "-0.02em" }}>
                Account
              </h2>

              {user ? (
                <div className="bg-surface-lowest rounded-sm p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-on-surface">{user.name}</p>
                    <p className="text-xs text-on-surface-muted mt-0.5">{user.email}</p>
                  </div>
                  <Link href="/account" className="label text-primary hover:underline underline-offset-2 text-xs">
                    My Account
                  </Link>
                </div>
              ) : (
                <div className="bg-surface-lowest rounded-sm p-5">
                  {/* Mode toggle */}
                  <div className="flex items-center gap-1 bg-surface border border-outline/15 rounded-sm p-1 mb-5">
                    {(["guest", "login", "register"] as AccountMode[]).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => { setAccountMode(m); setAccountError(""); }}
                        className={`flex-1 px-3 py-1.5 text-xs rounded-sm transition-colors ${
                          accountMode === m ? "bg-primary text-white" : "text-on-surface-muted hover:text-on-surface"
                        }`}
                      >
                        {m === "guest" ? "Guest" : m === "login" ? "Sign In" : "Create Account"}
                      </button>
                    ))}
                  </div>

                  {accountError && (
                    <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-sm px-3 py-2 mb-3">
                      <AlertCircle size={13} className="text-red-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-red-600">{accountError}</p>
                    </div>
                  )}

                  {accountMode === "guest" && (
                    <div>
                      <label className={labelClass}>Email Address *</label>
                      <input
                        type="email"
                        className={inputClass}
                        value={authForm.email}
                        onChange={(e) => setAuth("email")(e.target.value)}
                        placeholder="you@example.com"
                        autoComplete="email"
                      />
                      <p className="text-[10px] text-on-surface-faint mt-2">
                        We&apos;ll create an account for order tracking. You can set a password later.
                      </p>
                    </div>
                  )}

                  {accountMode === "login" && (
                    <form onSubmit={handleLogin} className="flex flex-col gap-3">
                      <div>
                        <label className={labelClass}>Email Address</label>
                        <input type="email" className={inputClass} value={authForm.email} onChange={(e) => setAuth("email")(e.target.value)} required />
                      </div>
                      <div>
                        <label className={labelClass}>Password</label>
                        <input type="password" className={inputClass} value={authForm.password} onChange={(e) => setAuth("password")(e.target.value)} required />
                      </div>
                      <button type="submit" disabled={accountLoading} className="btn-primary h-10 mt-1 disabled:opacity-50 flex items-center justify-center gap-2">
                        {accountLoading ? <><Loader2 size={13} className="animate-spin" /> Signing in…</> : "Sign In"}
                      </button>
                    </form>
                  )}

                  {accountMode === "register" && (
                    <form onSubmit={handleRegister} className="flex flex-col gap-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={labelClass}>First Name</label>
                          <input className={inputClass} value={authForm.firstName} onChange={(e) => setAuth("firstName")(e.target.value)} required />
                        </div>
                        <div>
                          <label className={labelClass}>Last Name</label>
                          <input className={inputClass} value={authForm.lastName} onChange={(e) => setAuth("lastName")(e.target.value)} required />
                        </div>
                      </div>
                      <div>
                        <label className={labelClass}>Email Address</label>
                        <input type="email" className={inputClass} value={authForm.email} onChange={(e) => setAuth("email")(e.target.value)} required />
                      </div>
                      <div>
                        <label className={labelClass}>Password (min. 8 characters)</label>
                        <input type="password" className={inputClass} value={authForm.password} onChange={(e) => setAuth("password")(e.target.value)} minLength={8} required />
                      </div>
                      <button type="submit" disabled={accountLoading} className="btn-primary h-10 mt-1 disabled:opacity-50 flex items-center justify-center gap-2">
                        {accountLoading ? <><Loader2 size={13} className="animate-spin" /> Creating account…</> : "Create Account & Continue"}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </section>

            {/* Shipping */}
            <section className="mb-10">
              <h2 className="text-2xl text-on-surface mb-5" style={{ fontFamily: "var(--font-serif)", letterSpacing: "-0.02em" }}>
                Shipping <span className="hidden md:inline">Information</span>
              </h2>
              <div className="grid grid-cols-2 gap-x-5 gap-y-6 mb-6">
                <CheckoutInput label="First Name" value={form.firstName} onChange={set("firstName")} autoComplete="given-name" />
                <CheckoutInput label="Last Name" value={form.lastName} onChange={set("lastName")} autoComplete="family-name" />
              </div>
              <div className="mb-6">
                <CheckoutInput label="Phone Number" value={form.phone} onChange={set("phone")} autoComplete="tel" />
              </div>
              <div className="mb-6">
                <CheckoutInput label="Shipping Address" value={form.address} onChange={set("address")} autoComplete="street-address" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-5 gap-y-6">
                <CheckoutInput label="City" value={form.city} onChange={set("city")} autoComplete="address-level2" />
                <CheckoutInput label="State" value={form.state} onChange={set("state")} autoComplete="address-level1" />
                <div className="col-span-2 md:col-span-1">
                  <CheckoutInput label="Postal Code" value={form.postal} onChange={set("postal")} autoComplete="postal-code" />
                </div>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl text-on-surface mb-3" style={{ fontFamily: "var(--font-serif)", letterSpacing: "-0.02em" }}>
                Payment
              </h2>
              <div className="bg-surface-lowest rounded-sm p-4 flex items-start gap-3">
                <Shield size={16} className="text-primary shrink-0 mt-0.5" />
                <p className="text-sm text-on-surface-muted leading-relaxed">
                  Secure payment powered by{" "}
                  <span className="font-medium text-on-surface">Paystack</span>.
                  You will be prompted to enter your card details on the next step.
                </p>
              </div>
            </section>

            <div className="md:hidden flex flex-col gap-3 mb-6 pt-4 border-t border-outline/10">
              {[
                { label: "Subtotal", value: `₦${fmt(subtotal)}` },
                { label: "Shipping", value: "Complimentary" },
                { label: "VAT (7.5%)", value: `₦${fmt(tax)}` },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-sm text-on-surface-muted">{label}</span>
                  <span className="text-sm text-on-surface-muted">{value}</span>
                </div>
              ))}
              <div className="flex justify-between pt-2 border-t border-outline/10">
                <span className="label text-on-surface">Total</span>
                <span className="text-lg font-medium text-on-surface" style={{ fontFamily: "var(--font-serif)" }}>
                  ₦{fmt(total)}
                </span>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-sm px-3 py-2.5 mb-4">
                <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-xs text-red-600 leading-relaxed">{error}</p>
              </div>
            )}

            <button
              onClick={handleCompleteOrder}
              disabled={submitting || items.length === 0}
              className="btn-primary w-full flex items-center justify-center gap-2 h-12 mb-3 disabled:opacity-50"
            >
              {submitting ? (
                <><Loader2 size={15} className="animate-spin" /> Processing…</>
              ) : (
                <>Complete Order · ₦{fmt(total)}</>
              )}
            </button>

            <p className="text-[10px] text-center text-on-surface-faint leading-relaxed">
              By placing this order, you agree to the Eesha Luxe Terms of Service.
            </p>
          </div>

          <div className="hidden md:block">
            <DesktopOrderSummary />
          </div>
        </div>
      </div>

      <footer className="mt-16 border-t border-outline/10 px-6 py-5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-[10px] uppercase tracking-widest text-on-surface-faint">© {new Date().getFullYear()} Eesha Luxe. The Digital Atelier.</p>
          <div className="flex items-center gap-5">
            {[
              { label: "Privacy", href: "/privacy" },
              { label: "Terms", href: "/terms" },
              { label: "FAQ", href: "/faq" },
            ].map((l) => (
              <Link key={l.href} href={l.href} className="text-[10px] uppercase tracking-widest text-on-surface-faint hover:text-primary transition-colors">{l.label}</Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
