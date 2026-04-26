"use client";

import Link from "next/link";
import { useEffect } from "react";
import { CheckCircle } from "lucide-react";

export default function CheckoutSuccessPage() {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const orderRef = `LX-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

  return (
    <div className="bg-surface min-h-screen flex flex-col items-center justify-center px-6 py-20 text-center">
      <div className="w-16 h-16 rounded-sm bg-primary-container flex items-center justify-center mb-8">
        <CheckCircle size={28} strokeWidth={1.5} className="text-primary" />
      </div>

      <p className="label text-primary mb-4">Order Confirmed</p>

      <h1
        className="text-4xl md:text-5xl text-on-surface mb-4"
        style={{ fontFamily: "var(--font-serif)", letterSpacing: "-0.02em" }}
      >
        Thank You
      </h1>

      <p className="text-sm text-on-surface-muted max-w-xs leading-relaxed mb-2">
        Your order has been received and is being prepared with care.
      </p>
      <p className="label text-on-surface-faint mb-10">
        Reference · {orderRef}
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Link href="/account" className="btn-primary inline-flex items-center gap-2 px-8">
          View My Account
        </Link>
        <Link href="/collections" className="btn-ghost inline-flex items-center gap-2 px-8">
          Continue Shopping
        </Link>
      </div>

      <p className="text-xs text-on-surface-faint mt-10 max-w-xs leading-relaxed">
        A confirmation will be sent to your email shortly. For assistance, contact our atelier team.
      </p>
    </div>
  );
}
