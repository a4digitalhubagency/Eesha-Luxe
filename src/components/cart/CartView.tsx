"use client";

import Image from "next/image";
import Link from "next/link";
import { X, Shield, Truck } from "lucide-react";
import { useCartStore } from "@/store/cart";
import type { CartItem } from "@/types";

const VAT = 0.075;

function fmt(n: number) {
  return `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
}

function CartItemDesktop({ item }: { item: CartItem }) {
  const { updateQuantity, removeItem } = useCartStore();
  return (
    <div className="flex gap-6 py-10">
      <div className="relative w-40 aspect-4/5 shrink-0 bg-surface-low rounded-sm overflow-hidden">
        <Image src={item.image} alt={item.name} fill className="object-cover object-top" sizes="160px" />
      </div>
      <div className="flex-1 flex gap-4">
        <div className="flex-1">
          <h3 className="text-2xl text-on-surface mb-1" style={{ fontFamily: "var(--font-serif)", letterSpacing: "-0.02em" }}>
            {item.name}
          </h3>
          <p className="label text-on-surface-faint mb-6">Ref: EL-{item.slug.slice(0, 6).toUpperCase()}</p>
          <div className="flex items-center gap-4">
            <span className="label text-on-surface-muted">Quantity</span>
            <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center text-on-surface-muted hover:text-on-surface transition-colors text-lg">−</button>
            <span className="text-sm font-medium text-on-surface w-4 text-center">{item.quantity}</span>
            <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center text-on-surface-muted hover:text-on-surface transition-colors text-lg">+</button>
          </div>
        </div>
        <div className="flex flex-col items-end justify-between">
          <p className="text-lg font-medium text-on-surface">{fmt(item.price * item.quantity)}</p>
          <button onClick={() => removeItem(item.productId)} className="flex items-center gap-1.5 label text-on-surface-faint hover:text-primary transition-colors">
            <X size={11} /> Remove
          </button>
        </div>
      </div>
    </div>
  );
}

function CartItemMobile({ item }: { item: CartItem }) {
  const { updateQuantity, removeItem } = useCartStore();
  return (
    <div className="mb-2">
      <div className="relative w-full aspect-4/5 bg-surface-low rounded-sm overflow-hidden mb-4">
        <Image src={item.image} alt={item.name} fill className="object-cover object-top" sizes="100vw" />
      </div>
      <div className="px-1">
        <div className="flex items-baseline justify-between gap-2 mb-1">
          <h3 className="text-xl text-on-surface" style={{ fontFamily: "var(--font-serif)", letterSpacing: "-0.02em" }}>{item.name}</h3>
          <p className="text-base font-medium text-on-surface shrink-0">{fmt(item.price)}</p>
        </div>
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-3">
            <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="text-on-surface-muted hover:text-on-surface text-lg w-6">−</button>
            <span className="text-sm text-on-surface">{item.quantity}</span>
            <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="text-on-surface-muted hover:text-on-surface text-lg w-6">+</button>
          </div>
          <button onClick={() => removeItem(item.productId)} className="flex items-center gap-1 label text-on-surface-faint hover:text-primary transition-colors">
            Remove <X size={10} />
          </button>
        </div>
      </div>
    </div>
  );
}

function OrderSummary({ subtotal }: { subtotal: number }) {
  const tax = subtotal * VAT;
  const total = subtotal + tax;
  return (
    <div className="bg-surface-lowest rounded-sm p-8">
      <h2 className="text-2xl text-on-surface mb-6" style={{ fontFamily: "var(--font-serif)", letterSpacing: "-0.02em" }}>Order Summary</h2>
      <div className="flex flex-col gap-4 mb-6">
        {[
          { label: "Subtotal",         value: fmt(subtotal) },
          { label: "Shipping",         value: "Complimentary" },
          { label: "VAT (7.5%)",       value: fmt(tax) },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between">
            <span className="label text-on-surface-muted">{label}</span>
            <span className="text-sm text-on-surface-muted">{value}</span>
          </div>
        ))}
      </div>
      <div className="border-t border-outline/15 pt-5 mb-6 flex items-baseline justify-between">
        <span className="text-base font-medium text-on-surface" style={{ fontFamily: "var(--font-serif)" }}>Total</span>
        <span className="text-2xl font-medium text-on-surface" style={{ fontFamily: "var(--font-serif)" }}>{fmt(total)}</span>
      </div>
      <Link href="/checkout" className="btn-primary w-full flex items-center justify-center gap-2 mb-4">
        Proceed to Checkout <span>→</span>
      </Link>
      <div className="flex items-center justify-center gap-5">
        <span className="flex items-center gap-1.5 label text-on-surface-faint"><Shield size={11} /> Secure Payment</span>
        <span className="flex items-center gap-1.5 label text-on-surface-faint"><Truck size={11} /> Insured Delivery</span>
      </div>
    </div>
  );
}

export function CartView() {
  const items = useCartStore((s) => s.items);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const tax = subtotal * VAT;

  if (items.length === 0) {
    return (
      <div className="bg-surface min-h-screen">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 text-center">
          <h1 className="text-4xl text-on-surface mb-4" style={{ fontFamily: "var(--font-serif)", letterSpacing: "-0.02em" }}>The Bag</h1>
          <p className="label text-on-surface-faint mb-10">Your selection is empty</p>
          <Link href="/collections" className="btn-primary inline-flex items-center gap-2">Explore the Collection</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface min-h-screen">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12">

        <div className="hidden md:block mb-10">
          <h1 className="text-5xl text-on-surface mb-2" style={{ fontFamily: "var(--font-serif)", letterSpacing: "-0.02em" }}>The Bag</h1>
          <p className="label text-on-surface-faint">A Curated Selection for Your Digital Atelier</p>
        </div>

        <div className="md:hidden mb-8">
          <h1 className="text-4xl text-on-surface mb-1" style={{ fontFamily: "var(--font-serif)", letterSpacing: "-0.02em" }}>Your Selection</h1>
          <p className="text-sm italic text-on-surface-muted">{items.length} item{items.length !== 1 ? "s" : ""} in your atelier bag.</p>
        </div>

        {/* Desktop: 2-col */}
        <div className="hidden md:grid md:grid-cols-[1fr_380px] gap-12">
          <div>
            {items.map((item, i) => (
              <div key={item.productId}>
                {i > 0 && <div className="border-t border-outline/10" />}
                <CartItemDesktop item={item} />
              </div>
            ))}
          </div>
          <OrderSummary subtotal={subtotal} />
        </div>

        {/* Mobile: stacked */}
        <div className="md:hidden">
          <div className="flex flex-col gap-10 mb-10">
            {items.map((item) => (
              <CartItemMobile key={item.productId} item={item} />
            ))}
          </div>

          <div className="bg-surface-low rounded-sm p-5">
            <p className="label text-on-surface-muted mb-4">Order Summary</p>
            {[
              { label: "Subtotal",   value: fmt(subtotal) },
              { label: "Shipping",   value: "Complimentary" },
              { label: "VAT (7.5%)", value: fmt(tax) },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between mb-3">
                <span className="text-sm text-on-surface-muted">{label}</span>
                <span className="text-sm text-on-surface-muted">{value}</span>
              </div>
            ))}
            <div className="border-t border-outline/15 pt-4 mt-2 flex justify-between mb-6">
              <span className="text-base font-medium text-on-surface">Total</span>
              <span className="text-xl font-medium text-on-surface" style={{ fontFamily: "var(--font-serif)" }}>
                {fmt(subtotal + tax)}
              </span>
            </div>
            <Link href="/checkout" className="btn-primary w-full flex items-center justify-center">
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
