import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AdminStatusUpdater } from "@/components/admin/AdminStatusUpdater";

interface Props {
  params: Promise<{ id: string }>;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING:    "bg-amber-50 text-amber-700 border-amber-200",
  CONFIRMED:  "bg-blue-50 text-blue-700 border-blue-200",
  PROCESSING: "bg-purple-50 text-purple-700 border-purple-200",
  SHIPPED:    "bg-indigo-50 text-indigo-700 border-indigo-200",
  DELIVERED:  "bg-emerald-50 text-emerald-700 border-emerald-200",
  CANCELLED:  "bg-red-50 text-red-700 border-red-200",
  REFUNDED:   "bg-gray-50 text-gray-600 border-gray-200",
};

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true } },
      address: true,
      items: {
        include: { product: { select: { name: true, images: true, slug: true } } },
      },
    },
  });

  if (!order) notFound();

  const orderRef = `LX-${order.id.slice(-8).toUpperCase()}`;

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <div className="border-b border-outline/10 bg-surface-lowest px-6 py-5">
        <div className="max-w-4xl mx-auto">
          <Link href="/admin/orders" className="inline-flex items-center gap-1.5 label text-on-surface-faint hover:text-primary transition-colors mb-4">
            <ArrowLeft size={13} /> All Orders
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-on-surface-faint mb-1">Eesha Luxe · Admin</p>
              <h1 className="text-2xl text-on-surface" style={{ fontFamily: "var(--font-serif)", letterSpacing: "-0.02em" }}>
                {orderRef}
              </h1>
              <p className="text-xs text-on-surface-faint mt-1">
                {new Date(order.createdAt).toLocaleDateString("en-NG", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] uppercase tracking-wide border ${STATUS_COLORS[order.status] ?? ""}`}>
              {order.status}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 grid md:grid-cols-[1fr_280px] gap-8">
        {/* Left */}
        <div className="flex flex-col gap-6">
          {/* Items */}
          <div className="bg-surface-lowest rounded-sm p-6">
            <p className="label text-on-surface-muted mb-4">Items</p>
            <div className="flex flex-col divide-y divide-outline/10">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 py-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-on-surface">{item.product.name}</p>
                    <p className="text-xs text-on-surface-faint mt-0.5">Qty {item.quantity} · ₦{Number(item.unitPrice).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} each</p>
                  </div>
                  <p className="text-sm text-on-surface-muted shrink-0">
                    ₦{Number(item.total).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              ))}
            </div>
            <div className="border-t border-outline/10 mt-2 pt-4 flex flex-col gap-2">
              <div className="flex justify-between text-sm text-on-surface-muted">
                <span>Subtotal</span><span>₦{Number(order.subtotal).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-sm text-on-surface-muted">
                <span>Shipping</span><span>Complimentary</span>
              </div>
              <div className="flex justify-between text-sm text-on-surface-muted">
                <span>VAT</span><span>₦{Number(order.tax).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-base font-medium text-on-surface pt-2 border-t border-outline/10">
                <span>Total</span>
                <span style={{ fontFamily: "var(--font-serif)" }}>₦{Number(order.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Customer */}
          <div className="bg-surface-lowest rounded-sm p-6">
            <p className="label text-on-surface-muted mb-4">Customer</p>
            <p className="text-sm font-medium text-on-surface">{order.user.name}</p>
            <p className="text-sm text-on-surface-muted mt-0.5">{order.user.email}</p>
            {order.address.phone && (
              <p className="text-sm text-on-surface-muted mt-0.5">{order.address.phone}</p>
            )}
          </div>

          {/* Shipping address */}
          <div className="bg-surface-lowest rounded-sm p-6">
            <p className="label text-on-surface-muted mb-4">Shipping Address</p>
            <p className="text-sm text-on-surface leading-relaxed">
              {order.address.line1}<br />
              {order.address.city}, {order.address.state} {order.address.postalCode}<br />
              {order.address.country}
            </p>
          </div>
        </div>

        {/* Right — status update */}
        <div>
          <div className="bg-surface-lowest rounded-sm p-6 sticky top-6">
            <p className="label text-on-surface-muted mb-4">Update Status</p>
            <AdminStatusUpdater orderId={order.id} currentStatus={order.status} />
          </div>
        </div>
      </div>
    </div>
  );
}
