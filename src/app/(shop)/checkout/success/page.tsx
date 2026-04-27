export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";

interface Props {
  searchParams: Promise<{ ref?: string }>;
}

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { ref } = await searchParams;
  if (!ref) notFound();

  const order = await prisma.order.findUnique({
    where: { id: ref },
    include: {
      address: true,
      items: {
        include: { product: { select: { name: true, images: true } } },
      },
    },
  });

  if (!order) notFound();

  const orderRef = `LX-${order.id.slice(-8).toUpperCase()}`;

  return (
    <div className="bg-surface min-h-screen px-6 py-20">
      <div className="max-w-xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-sm bg-primary-container flex items-center justify-center mb-8 mx-auto">
            <CheckCircle size={28} strokeWidth={1.5} className="text-primary" />
          </div>
          <p className="label text-primary mb-4">Order Confirmed</p>
          <h1 className="text-4xl md:text-5xl text-on-surface mb-4" style={{ fontFamily: "var(--font-serif)", letterSpacing: "-0.02em" }}>
            Thank You
          </h1>
          <p className="text-sm text-on-surface-muted leading-relaxed mb-2">
            Your order has been received and is being prepared with care.
          </p>
          <p className="label text-on-surface-faint">Reference · {orderRef}</p>
        </div>

        {/* Order items */}
        <div className="bg-surface-lowest rounded-sm p-6 mb-6">
          <p className="label text-on-surface-muted mb-4">Items Ordered</p>
          <div className="flex flex-col divide-y divide-outline/10">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-on-surface">{item.product.name}</p>
                  <p className="text-xs text-on-surface-faint mt-0.5">Qty {item.quantity}</p>
                </div>
                <p className="text-sm text-on-surface-muted">
                  ₦{Number(item.total).toLocaleString()}.00
                </p>
              </div>
            ))}
          </div>

          <div className="border-t border-outline/10 mt-2 pt-4 flex flex-col gap-2">
            <div className="flex justify-between text-sm text-on-surface-muted">
              <span>Subtotal</span>
              <span>₦{Number(order.subtotal).toLocaleString()}.00</span>
            </div>
            <div className="flex justify-between text-sm text-on-surface-muted">
              <span>Shipping</span>
              <span>Complimentary</span>
            </div>
            <div className="flex justify-between text-sm text-on-surface-muted">
              <span>VAT</span>
              <span>₦{Number(order.tax).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-base font-medium text-on-surface pt-2 border-t border-outline/10">
              <span>Total</span>
              <span style={{ fontFamily: "var(--font-serif)" }}>
                ₦{Number(order.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Shipping address */}
        <div className="bg-surface-lowest rounded-sm p-6 mb-10">
          <p className="label text-on-surface-muted mb-3">Shipping Address</p>
          <p className="text-sm text-on-surface leading-relaxed">
            {order.address.line1}<br />
            {order.address.city}, {order.address.state} {order.address.postalCode}<br />
            {order.address.country}
          </p>
          <p className="text-xs text-on-surface-faint mt-3">Expected delivery: 3–5 business days after dispatch.</p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mb-10">
          <Link href="/account" className="btn-primary inline-flex items-center gap-2 px-8 w-full sm:w-auto justify-center">
            View My Account
          </Link>
          <Link href="/collections" className="btn-ghost inline-flex items-center gap-2 px-8 w-full sm:w-auto justify-center">
            Continue Shopping
          </Link>
        </div>

        <p className="text-xs text-on-surface-faint text-center leading-relaxed">
          A confirmation has been sent to your email. For assistance, contact our atelier team.
        </p>
      </div>
    </div>
  );
}
