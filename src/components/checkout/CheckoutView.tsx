"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, Shield, Leaf, Truck } from "lucide-react";
import { CheckoutInput } from "./CheckoutInput";
import { useCartStore } from "@/store/cart";
import { useSessionStore } from "@/store/session";

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
              <p className="text-sm text-on-surface-muted mt-1">₦{(item.price * item.quantity).toLocaleString()}.00</p>
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-outline/10 pt-4 flex flex-col gap-3 mb-4">
        {[
          { label: "Subtotal", value: `₦${subtotal.toLocaleString()}.00` },
          { label: "Shipping", value: "Complimentary" },
          { label: "VAT (7.5%)", value: `₦${tax.toFixed(2)}` },
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
          ₦{(subtotal + tax).toLocaleString(undefined, { minimumFractionDigits: 2 })}
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

export function CheckoutView() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const user = useSessionStore((s) => s.user);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const tax = subtotal * 0.075;
  const total = subtotal + tax;

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    firstName: "", lastName: "", address: "", city: "", state: "", postal: "",
  });

  function set(field: string) {
    return (v: string) => setForm((f) => ({ ...f, [field]: v }));
  }

  async function handleCompleteOrder() {
    const required: [string, string][] = [
      [form.firstName, "First name"],
      [form.lastName, "Last name"],
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

    setError("");
    setSubmitting(true);

    // 1. Initialize PayStack transaction
    let reference: string;
    let publicKey: string;
    try {
      const res = await fetch("/api/checkout/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: total }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to initialize payment.");
        setSubmitting(false);
        return;
      }
      reference = data.reference;
      publicKey = data.publicKey;
    } catch {
      setError("Unable to connect. Please check your connection and try again.");
      setSubmitting(false);
      return;
    }

    // 2. Load PayStack CDN script on demand (avoids bundler/Turbopack issues
    //    with the @paystack/inline-js CJS package)
    try {
      await new Promise<void>((resolve, reject) => {
        // Already loaded from a previous attempt on this page
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

    type PaystackPopInstance = {
      newTransaction: (opts: {
        key: string; email: string; amount: number; ref: string;
        onSuccess: (t: { reference: string }) => void;
        onCancel: () => void;
      }) => void;
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const PaystackPop = (window as any).PaystackPop as new () => PaystackPopInstance;
    const popup = new PaystackPop();

    popup.newTransaction({
      key: publicKey,
      email: user?.email ?? "",
      amount: Math.round(total * 100), // NGN → kobo
      ref: reference,

      onSuccess: async (transaction) => {
        // 3. Verify and create order
        try {
          const res = await fetch("/api/checkout/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              reference: transaction.reference,
              items,
              shipping: {
                firstName: form.firstName,
                lastName: form.lastName,
                line1: form.address,
                city: form.city,
                state: form.state,
                postalCode: form.postal,
                country: "Nigeria",
              },
              subtotal,
              tax,
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
            `Payment received but order could not be saved. Contact support with reference: ${transaction.reference}`
          );
          setSubmitting(false);
        }
      },

      onCancel: () => {
        setError("Payment was cancelled. You have not been charged.");
        setSubmitting(false);
      },
    });
  }

  return (
    <div className="bg-surface min-h-screen">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10">
        <div className="md:grid md:grid-cols-[1fr_380px] md:gap-14">

          {/* Left form */}
          <div>
            {/* Mobile cart preview */}
            <div className="md:hidden bg-surface-low rounded-sm p-4 mb-8 flex items-center justify-between">
              <span className="label text-on-surface-muted">Your Selection ({items.length} item{items.length !== 1 ? "s" : ""})</span>
              <span className="text-sm font-medium text-on-surface">₦{subtotal.toLocaleString()}.00</span>
            </div>

            {/* Account */}
            <section className="mb-10">
              <h2 className="text-2xl text-on-surface mb-4" style={{ fontFamily: "var(--font-serif)", letterSpacing: "-0.02em" }}>
                Account
              </h2>
              <div className="bg-surface-lowest rounded-sm p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-on-surface">{user?.name}</p>
                  <p className="text-xs text-on-surface-muted mt-0.5">{user?.email}</p>
                </div>
                <Link href="/account" className="label text-primary hover:underline underline-offset-2 text-xs">
                  My Account
                </Link>
              </div>
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

            {/* Payment notice */}
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

            {/* Mobile totals */}
            <div className="md:hidden flex flex-col gap-3 mb-6 pt-4 border-t border-outline/10">
              {[
                { label: "Subtotal", value: `₦${subtotal.toLocaleString()}.00` },
                { label: "Shipping", value: "Complimentary" },
                { label: "VAT (7.5%)", value: `₦${tax.toFixed(2)}` },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-sm text-on-surface-muted">{label}</span>
                  <span className="text-sm text-on-surface-muted">{value}</span>
                </div>
              ))}
              <div className="flex justify-between pt-2 border-t border-outline/10">
                <span className="label text-on-surface">Total</span>
                <span className="text-lg font-medium text-on-surface" style={{ fontFamily: "var(--font-serif)" }}>
                  ₦{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
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
                <>Complete Order · ₦{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</>
              )}
            </button>

            <p className="text-[10px] text-center text-on-surface-faint leading-relaxed">
              By placing this order, you agree to the Eesha Luxe Terms of Service.
            </p>
          </div>

          {/* Desktop summary */}
          <div className="hidden md:block">
            <DesktopOrderSummary />
          </div>
        </div>
      </div>

      <footer className="mt-16 border-t border-outline/10 px-6 py-5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-[10px] uppercase tracking-widest text-on-surface-faint">© 2024 Eesha Luxe. The Digital Atelier.</p>
          <div className="flex items-center gap-5">
            {["Privacy", "Shipping", "Returns"].map((l) => (
              <Link key={l} href={`/${l.toLowerCase()}`} className="text-[10px] uppercase tracking-widest text-on-surface-faint hover:text-primary transition-colors">{l}</Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
