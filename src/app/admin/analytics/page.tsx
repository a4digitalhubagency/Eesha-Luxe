export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { AdminAnalyticsFilter } from "@/components/admin/AdminAnalyticsFilter";

interface Props {
  searchParams: Promise<{ range?: string }>;
}

function getRangeStart(range: string): Date | undefined {
  const now = new Date();
  if (range === "week") {
    const d = new Date(now);
    d.setDate(d.getDate() - 7);
    return d;
  }
  if (range === "month") {
    const d = new Date(now);
    d.setMonth(d.getMonth() - 1);
    return d;
  }
  if (range === "year") {
    const d = new Date(now);
    d.setFullYear(d.getFullYear() - 1);
    return d;
  }
  return undefined; // all time
}

export default async function AdminAnalyticsPage({ searchParams }: Props) {
  const { range = "all" } = await searchParams;
  const since = getRangeStart(range);
  const dateFilter = since ? { createdAt: { gte: since } } : {};

  const [orderStats, topProducts, revenueByStatus, newCustomers] = await Promise.all([
    prisma.order.aggregate({
      where: dateFilter,
      _sum: { total: true },
      _count: { id: true },
      _avg: { total: true },
    }),
    prisma.orderItem.groupBy({
      by: ["productId"],
      where: since ? { order: { createdAt: { gte: since } } } : {},
      _sum: { quantity: true, total: true },
      orderBy: { _sum: { total: "desc" } },
      take: 5,
    }),
    prisma.order.groupBy({
      by: ["status"],
      where: dateFilter,
      _sum: { total: true },
      _count: { id: true },
    }),
    prisma.user.count({
      where: { role: "CUSTOMER", ...(since ? { createdAt: { gte: since } } : {}) },
    }),
  ]);

  const productIds = topProducts.map((t) => t.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true },
  });
  const productMap = Object.fromEntries(products.map((p) => [p.id, p.name]));

  function fmt(n: number) {
    return `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  const rangeLabel: Record<string, string> = {
    week: "Last 7 days",
    month: "Last 30 days",
    year: "Last 12 months",
    all: "All time",
  };

  return (
    <div className="min-h-screen bg-surface">
      <div className="px-8 py-7 border-b border-outline/10 bg-surface-lowest">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-on-surface-faint mb-1">Reporting</p>
            <h1 className="text-3xl text-on-surface" style={{ fontFamily: "var(--font-serif)", letterSpacing: "-0.02em" }}>Analytics</h1>
          </div>
          <AdminAnalyticsFilter current={range} />
        </div>
        <p className="text-xs text-on-surface-faint mt-2">{rangeLabel[range] ?? "All time"}</p>
      </div>

      <div className="px-8 py-8 flex flex-col gap-8">
        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Revenue",   value: fmt(Number(orderStats._sum.total ?? 0)) },
            { label: "Total Orders",    value: orderStats._count.id.toString() },
            { label: "Average Order",   value: fmt(Number(orderStats._avg.total ?? 0)) },
            { label: "New Customers",   value: newCustomers.toString() },
          ].map(({ label, value }) => (
            <div key={label} className="bg-surface-lowest rounded-sm p-6">
              <p className="text-[9px] uppercase tracking-widest text-on-surface-faint mb-2">{label}</p>
              <p className="text-2xl font-medium text-on-surface" style={{ fontFamily: "var(--font-serif)" }}>{value}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Top products */}
          <div className="bg-surface-lowest rounded-sm p-6">
            <p className="text-[10px] uppercase tracking-widest text-on-surface-faint mb-5">Top Products by Revenue</p>
            <div className="flex flex-col gap-3">
              {topProducts.length === 0 ? (
                <p className="text-sm text-on-surface-faint text-center py-4">No sales data yet.</p>
              ) : topProducts.map((item) => (
                <div key={item.productId} className="flex items-center justify-between py-2 border-b border-outline/5 last:border-0">
                  <p className="text-sm text-on-surface truncate pr-4">{productMap[item.productId] ?? "Unknown"}</p>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-medium text-on-surface">{fmt(Number(item._sum.total ?? 0))}</p>
                    <p className="text-[10px] text-on-surface-faint">{item._sum.quantity ?? 0} units</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Orders by status */}
          <div className="bg-surface-lowest rounded-sm p-6">
            <p className="text-[10px] uppercase tracking-widest text-on-surface-faint mb-5">Orders by Status</p>
            <div className="flex flex-col gap-3">
              {revenueByStatus.length === 0 ? (
                <p className="text-sm text-on-surface-faint text-center py-4">No orders yet.</p>
              ) : revenueByStatus.map((s) => (
                <div key={s.status} className="flex items-center justify-between py-2 border-b border-outline/5 last:border-0">
                  <p className="text-xs uppercase tracking-wide text-on-surface">{s.status}</p>
                  <div className="text-right">
                    <p className="text-sm font-medium text-on-surface">{fmt(Number(s._sum.total ?? 0))}</p>
                    <p className="text-[10px] text-on-surface-faint">{s._count.id} order{s._count.id !== 1 ? "s" : ""}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
