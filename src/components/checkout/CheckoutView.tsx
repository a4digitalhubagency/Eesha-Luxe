"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Shield, Leaf, Truck, CreditCard } from "lucide-react";
import { CheckoutInput } from "./CheckoutInput";
import { useCartStore } from "@/store/cart";

function MiniCartSummary() {
  const items = useCartStore((s) => s.items);
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shown = items.slice(0, 2);
  const extra = items.length - 2;

  return (
    <div className="bg-surface-low rounded-[4px] p-4 mb-8">
      <div className="flex items-center justify-between mb-3">
        <span className="label text-on-surface-muted">Your Selection</span>
        <span className="text-sm font-medium text-on-surface">${total.toLocaleString()}.00</span>
      </div>
      <div className="flex items-center gap-2">
        {shown.map((item) => (
          <div key={item.productId} className="relative w-16 aspect-[4/5] bg-surface-lowest rounded-[4px] overflow-hidden flex-shrink-0">
            <Image src={item.image} alt={item.name} fill className="object-cover object-top" sizes="64px" />
          </div>
        ))}
        {extra > 0 && (
          <div className="flex flex-col">
            <span className="text-xs text-on-surface-muted">+{extra} other item{extra > 1 ? "s" : ""}</span>
            <Link href="/cart" className="text-xs font-semibold text-on-surface underline underline-offset-2">View Details</Link>
          </div>
        )}
      </div>
    </div>
  );
}

function DesktopOrderSummary() {
  const items = useCartStore((s) => s.items);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const tax = subtotal * 0.08;

  return (
    <div className="bg-surface-lowest rounded-[4px] p-8 sticky top-20">
      <h2 className="text-2xl text-on-surface mb-6" style={{ fontFamily: "var(--font-serif)", letterSpacing: "-0.02em" }}>Order Summary</h2>

      <div className="flex flex-col gap-4 mb-6">
        {items.map((item) => (
          <div key={item.productId} className="flex gap-3">
            <div className="relative w-16 aspect-[4/5] bg-surface-low rounded-[4px] overflow-hidden flex-shrink-0">
              <Image src={item.image} alt={item.name} fill className="object-cover object-top" sizes="64px" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-on-surface uppercase tracking-wide leading-snug">{item.name}</p>
              <p className="text-xs text-on-surface-faint mt-0.5">Qty {item.quantity}</p>
              <p className="text-sm text-on-surface-muted mt-1">${(item.price * item.quantity).toLocaleString()}.00</p>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-outline/10 pt-4 flex flex-col gap-3 mb-4">
        {[
          { label: "Subtotal", value: `$${subtotal.toLocaleString()}.00` },
          { label: "Shipping", value: "Complimentary" },
          { label: "Duties & Taxes", value: "$0.00" },
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
          ${(subtotal + tax).toLocaleString(undefined, { minimumFractionDigits: 2 })}
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
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const [identity, setIdentity] = useState<"guest" | "login">("guest");
  const [payMethod, setPayMethod] = useState<"card" | "paypal">("card");
  const [submitting, setSubmitting] = useState(false);
  const [fieldError, setFieldError] = useState("");
  const [form, setForm] = useState({
    email: "", firstName: "", lastName: "", address: "", city: "", state: "", postal: "",
    billingMatch: true, cardNumber: "", expiry: "", cvv: "",
  });

  function set(field: string) {
    return (v: string) => setForm((f) => ({ ...f, [field]: v }));
  }

  async function handleCompleteOrder() {
    const required: [string, string][] = [
      [form.email, "Email address"],
      [form.firstName, "First name"],
      [form.lastName, "Last name"],
      [form.address, "Shipping address"],
      [form.city, "City"],
      [form.state, "State"],
      [form.postal, "Postal code"],
      [form.cardNumber, "Card number"],
      [form.expiry, "Expiry date"],
      [form.cvv, "CVV"],
    ];
    const missing = required.find(([val]) => !val.trim());
    if (missing) {
      setFieldError(`${missing[1]} is required.`);
      return;
    }
    setFieldError("");
    setSubmitting(true);
    // Simulate brief processing delay, then navigate to success
    await new Promise((r) => setTimeout(r, 1200));
    clearCart();
    router.push("/checkout/success");
  }

  return (
    <div className="bg-surface min-h-screen">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10">
        <div className="md:grid md:grid-cols-[1fr_380px] md:gap-14">

          {/* Left form */}
          <div>
            {/* Mobile mini cart */}
            <div className="md:hidden">
              <MiniCartSummary />
            </div>

            {/* 1. Customer Identity */}
            <section className="mb-10">
              <div className="flex items-baseline justify-between mb-2">
                <h2 className="text-2xl text-on-surface" style={{ fontFamily: "var(--font-serif)", letterSpacing: "-0.02em" }}>
                  <span className="hidden md:inline">Customer </span>Identity
                </h2>
                <button className="hidden md:block label text-on-surface-faint hover:text-primary transition-colors">Sign In</button>
              </div>
              <p className="hidden md:block text-sm text-on-surface-muted mb-5">Sign in for faster checkout or continue as guest.</p>

              {/* Desktop identity cards */}
              <div className="hidden md:grid grid-cols-2 gap-3 mb-6">
                {[
                  { id: "login" as const, tag: "Returning Client", label: "Log In to Account" },
                  { id: "guest" as const, tag: "Active Choice", label: "Guest Checkout" },
                ].map(({ id, tag, label }) => (
                  <button
                    key={id}
                    onClick={() => setIdentity(id)}
                    className={`text-left p-4 rounded-[4px] border transition-all duration-200 ${
                      identity === id
                        ? "bg-primary-container border-primary/20"
                        : "bg-surface-lowest border-outline/15 hover:border-primary/30"
                    }`}
                  >
                    <p className="label text-on-surface-faint mb-1">{tag}</p>
                    <p className="text-sm font-medium text-on-surface">{label}</p>
                  </button>
                ))}
              </div>

              {/* Mobile email */}
              <div className="md:hidden">
                <CheckoutInput label="Email Address" type="email" value={form.email} onChange={set("email")} autoComplete="email" />
                <label className="flex items-center gap-2.5 mt-4 cursor-pointer">
                  <span className={`w-4 h-4 flex items-center justify-center flex-shrink-0 border transition-all ${
                    form.billingMatch ? "bg-secondary border-secondary" : "bg-surface-lowest border-outline/25"
                  }`} onClick={() => setForm((f) => ({ ...f, billingMatch: !f.billingMatch }))}>
                    {form.billingMatch && <Check size={10} strokeWidth={2.5} className="text-white" />}
                  </span>
                  <span className="text-xs text-on-surface-muted">Keep me updated on new collections and private sales.</span>
                </label>
              </div>
            </section>

            {/* 2. Shipping */}
            <section className="mb-10">
              <h2 className="text-2xl text-on-surface mb-5" style={{ fontFamily: "var(--font-serif)", letterSpacing: "-0.02em" }}>Shipping{" "}
                <span className="hidden md:inline">Information</span>
              </h2>
              <div className="grid grid-cols-2 gap-x-5 gap-y-6 mb-6">
                <CheckoutInput label="First Name" value={form.firstName} onChange={set("firstName")} autoComplete="given-name" />
                <CheckoutInput label="Last Name" value={form.lastName} onChange={set("lastName")} autoComplete="family-name" />
              </div>
              <div className="mb-6">
                <CheckoutInput label="Shipping Address" value={form.address} onChange={set("address")} autoComplete="street-address" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-5 gap-y-6 mb-6">
                <CheckoutInput label="City" value={form.city} onChange={set("city")} autoComplete="address-level2" />
                <CheckoutInput label="State" value={form.state} onChange={set("state")} autoComplete="address-level1" />
                <div className="col-span-2 md:col-span-1">
                  <CheckoutInput label="Postal Code" value={form.postal} onChange={set("postal")} autoComplete="postal-code" />
                </div>
              </div>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <span
                  className={`w-4 h-4 flex items-center justify-center flex-shrink-0 border transition-all ${
                    form.billingMatch ? "bg-secondary border-secondary" : "bg-surface-lowest border-outline/25"
                  }`}
                  onClick={() => setForm((f) => ({ ...f, billingMatch: !f.billingMatch }))}
                >
                  {form.billingMatch && <Check size={10} strokeWidth={2.5} className="text-white" />}
                </span>
                <span className="text-sm text-on-surface-muted">Billing address is same as shipping</span>
              </label>
            </section>

            {/* 3. Payment */}
            <section className="mb-10">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-2xl text-on-surface" style={{ fontFamily: "var(--font-serif)", letterSpacing: "-0.02em" }}>Payment{" "}
                  <span className="hidden md:inline">Details</span>
                </h2>
                <div className="flex items-center gap-2 text-on-surface-faint">
                  <CreditCard size={16} strokeWidth={1.5} />
                </div>
              </div>

              {/* Mobile payment tabs */}
              <div className="md:hidden grid grid-cols-2 rounded-[4px] overflow-hidden mb-5">
                {(["card", "paypal"] as const).map((method) => (
                  <button
                    key={method}
                    onClick={() => setPayMethod(method)}
                    className={`py-2.5 text-xs font-semibold tracking-widest uppercase transition-colors ${
                      payMethod === method ? "bg-secondary text-white" : "bg-surface-low text-on-surface-muted"
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>

              {/* Card fields */}
              <div className="bg-surface-lowest md:bg-transparent rounded-[4px] p-4 md:p-0">
                <div className="mb-5">
                  <CheckoutInput label="Card Number" value={form.cardNumber} onChange={set("cardNumber")} autoComplete="cc-number" />
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <CheckoutInput label="MM / YY" value={form.expiry} onChange={set("expiry")} autoComplete="cc-exp" />
                  <CheckoutInput label="CVV" value={form.cvv} onChange={set("cvv")} autoComplete="cc-csc" />
                </div>
              </div>
            </section>

            {/* Mobile summary */}
            <div className="md:hidden flex flex-col gap-3 mb-6 pt-4 border-t border-outline/10">
              {[
                { label: "Subtotal", value: `$${subtotal.toLocaleString()}.00` },
                { label: "Shipping", value: "Complimentary" },
                { label: "Estimated Tax", value: `$${tax.toFixed(2)}` },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-sm text-on-surface-muted">{label}</span>
                  <span className="text-sm text-on-surface-muted">{value}</span>
                </div>
              ))}
              <div className="flex justify-between pt-2 border-t border-outline/10">
                <span className="label text-on-surface">Total</span>
                <span className="text-lg font-medium text-on-surface" style={{ fontFamily: "var(--font-serif)" }}>
                  ${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* CTA */}
            {fieldError && (
              <p className="text-xs text-red-500 mb-3">{fieldError}</p>
            )}
            <button
              onClick={handleCompleteOrder}
              disabled={submitting || items.length === 0}
              className="btn-primary w-full flex items-center justify-center gap-2 h-12 mb-3 disabled:opacity-50"
            >
              {submitting ? "Processing…" : <>Complete Order <span className="hidden md:inline">· ${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></>}
            </button>
            <p className="text-[10px] text-center text-on-surface-faint leading-relaxed">
              By placing this order, you agree to the Digital Atelier Terms of Service.
            </p>
            <div className="md:hidden flex items-center justify-center gap-1.5 mt-3 label text-on-surface-faint">
              <Shield size={10} /> Secure Encrypted Checkout
            </div>
          </div>

          {/* Desktop order summary */}
          <div className="hidden md:block">
            <DesktopOrderSummary />
          </div>
        </div>
      </div>

      {/* Minimal checkout footer */}
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
