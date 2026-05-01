export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";

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

export default async function AdminCustomerDetailPage({ params }: Props) {
  const { id } = await params;

  const customer = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      orders: {
        orderBy: { createdAt: "desc" },
        include: {
          items: { select: { quantity: true } },
          address: { select: { city: true, state: true } },
        },
      },
    },
  });

  if (!customer) notFound();

  const totalSpent = customer.orders.reduce((sum, o) => sum + Number(o.total), 0);

  function fmt(n: number) {
    return `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="border-b border-outline/10 bg-surface-lowest px-8 py-6">
        <Link href="/admin/customers" className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-on-surface-faint hover:text-primary transition-colors mb-4">
          <ArrowLeft size={13} /> All Customers
        </Link>
        <h1 className="text-3xl text-on-surface" style={{ fontFamily: "var(--font-serif)", letterSpacing: "-0.02em" }}>
          {customer.name ?? "Unnamed"}
        </h1>
        <p className="text-sm text-on-surface-muted mt-1">{customer.email}</p>
      </div>

      <div className="px-8 py-8 max-w-4xl">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Orders", value: customer.orders.length.toString() },
            { label: "Total Spent", value: fmt(totalSpent) },
            { label: "Member Since", value: new Date(customer.createdAt).toLocaleDateString("en-NG", { month: "long", year: "numeric" }) },
          ].map(({ label, value }) => (
            <div key={label} className="bg-surface-lowest rounded-sm p-5">
              <p className="text-[9px] uppercase tracking-widest text-on-surface-faint mb-2">{label}</p>
              <p className="text-xl font-medium text-on-surface" style={{ fontFamily: "var(--font-serif)" }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Orders */}
        <div className="bg-surface-lowest rounded-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-outline/10">
            <p className="text-[10px] uppercase tracking-widest text-on-surface-faint">Order History</p>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline/10">
                {["Reference", "Items", "Total", "Status", "Location", "Date", ""].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-[9px] uppercase tracking-widest text-on-surface-faint font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {customer.orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-sm text-on-surface-faint">No orders yet.</td>
                </tr>
              ) : customer.orders.map((order) => {
                const ref = `LX-${order.id.slice(-8).toUpperCase()}`;
                const qty = order.items.reduce((s, i) => s + i.quantity, 0);
                return (
                  <tr key={order.id} className="border-b border-outline/5 hover:bg-surface-low/40 transition-colors">
                    <td className="px-5 py-4 font-mono text-xs text-on-surface">{ref}</td>
                    <td className="px-5 py-4 text-sm text-on-surface-muted">{qty} item{qty !== 1 ? "s" : ""}</td>
                    <td className="px-5 py-4 text-sm text-on-surface">{fmt(Number(order.total))}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide border ${STATUS_COLORS[order.status] ?? ""}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-on-surface-muted">
                      {order.address ? `${order.address.city}, ${order.address.state}` : "—"}
                    </td>
                    <td className="px-5 py-4 text-xs text-on-surface-faint">
                      {new Date(order.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-5 py-4">
                      <Link href={`/admin/orders/${order.id}`} className="text-[10px] uppercase tracking-widest text-primary hover:underline underline-offset-2">
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
