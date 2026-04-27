export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Package, ChevronRight, ChevronLeft } from "lucide-react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "My Orders" };

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "In Transit",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};

const STATUS_STYLE: Record<string, string> = {
  PENDING:    "bg-amber-50 text-amber-700",
  CONFIRMED:  "bg-blue-50 text-blue-700",
  PROCESSING: "bg-purple-50 text-purple-700",
  SHIPPED:    "bg-indigo-50 text-indigo-700",
  DELIVERED:  "bg-emerald-50 text-emerald-700",
  CANCELLED:  "bg-red-50 text-red-600",
  REFUNDED:   "bg-gray-50 text-gray-600",
};

function fmt(n: number) {
  return `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
}

export default async function OrdersPage() {
  const session = await getSession();
  if (!session) redirect("/login?from=/account/orders");

  const orders = await prisma.order.findMany({
    where: { userId: session.sub },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: { product: { select: { name: true, images: true } } },
      },
    },
  });

  return (
    <div className="bg-surface min-h-screen">
      <div className="max-w-3xl mx-auto px-5 md:px-6 py-10">

        <div className="flex items-center gap-3 mb-8">
          <Link href="/account" className="text-on-surface-faint hover:text-primary transition-colors">
            <ChevronLeft size={18} />
          </Link>
          <div>
            <p className="label text-on-surface-faint">My Atelier</p>
            <h1 className="text-3xl text-on-surface" style={{ fontFamily: "var(--font-serif)", letterSpacing: "-0.02em" }}>
              Order History
            </h1>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center text-center py-20">
            <div className="w-14 h-14 rounded-sm bg-surface-low flex items-center justify-center mb-5">
              <Package size={22} strokeWidth={1.5} className="text-on-surface-faint" />
            </div>
            <p className="text-xl text-on-surface mb-2" style={{ fontFamily: "var(--font-serif)" }}>No orders yet</p>
            <p className="text-sm text-on-surface-faint mb-6 max-w-xs leading-relaxed">
              Your order history will appear here once you shop the atelier.
            </p>
            <Link href="/collections" className="btn-primary inline-flex items-center gap-2 text-sm">
              Explore Collections
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {orders.map((order) => {
              const ref = `LX-${order.id.slice(-8).toUpperCase()}`;
              const status = STATUS_LABEL[order.status] ?? order.status;
              const style = STATUS_STYLE[order.status] ?? "bg-surface-low text-on-surface-muted";
              const firstItem = order.items[0];

              return (
                <div key={order.id} className="bg-surface-lowest rounded-sm overflow-hidden">
                  {/* Header row */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-outline/8">
                    <div>
                      <p className="label text-primary mb-0.5">{ref}</p>
                      <p className="text-xs text-on-surface-faint">
                        {new Date(order.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                    </div>
                    <span className={`text-[10px] px-2.5 py-1 rounded-full uppercase tracking-widest font-medium ${style}`}>
                      {status}
                    </span>
                  </div>

                  {/* Items */}
                  <div className="px-5 py-4 flex flex-col gap-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4">
                        <div className="relative w-14 h-16 bg-surface-low rounded-sm overflow-hidden shrink-0">
                          {item.product.images[0] && (
                            <Image
                              src={item.product.images[0]}
                              alt={item.product.name}
                              fill
                              className="object-cover object-top"
                              sizes="56px"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-on-surface leading-snug">{item.product.name}</p>
                          <p className="text-xs text-on-surface-faint mt-0.5">Qty {item.quantity} · {fmt(Number(item.unitPrice))}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between px-5 py-3 border-t border-outline/8 bg-surface-low/40">
                    <div>
                      <span className="text-xs text-on-surface-faint">Total · </span>
                      <span className="text-sm font-medium text-on-surface" style={{ fontFamily: "var(--font-serif)" }}>
                        {fmt(Number(order.total))}
                      </span>
                    </div>
                    <span className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-on-surface-faint">
                      {order.items.length} item{order.items.length !== 1 ? "s" : ""} <ChevronRight size={11} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
