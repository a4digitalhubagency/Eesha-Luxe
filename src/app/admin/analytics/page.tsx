export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";

export default async function AdminAnalyticsPage() {
  const [orderStats, topProducts, revenueByStatus] = await Promise.all([
    prisma.order.aggregate({ _sum: { total: true }, _count: { id: true }, _avg: { total: true } }),
    prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true, total: true },
      orderBy: { _sum: { total: "desc" } },
      take: 5,
    }),
    prisma.order.groupBy({ by: ["status"], _sum: { total: true }, _count: { id: true } }),
  ]);

  const productIds = topProducts.map((t) => t.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true },
  });
  const productMap = Object.fromEntries(products.map((p) => [p.id, p.name]));

  function fmt(n: number) {
    return `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="px-8 py-7 border-b border-outline/10 bg-surface-lowest">
        <p className="text-[10px] uppercase tracking-widest text-on-surface-faint mb-1">Reporting</p>
        <h1 className="text-3xl text-on-surface" style={{ fontFamily: "var(--font-serif)", letterSpacing: "-0.02em" }}>Analytics</h1>
      </div>

      <div className="px-8 py-8 flex flex-col gap-8">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Revenue",  value: fmt(Number(orderStats._sum.total ?? 0)) },
            { label: "Total Orders",   value: orderStats._count.id.toString() },
            { label: "Average Order",  value: fmt(Number(orderStats._avg.total ?? 0)) },
          ].map(({ label, value }) => (
            <div key={label} className="bg-surface-lowest rounded-sm p-6">
              <p className="text-[9px] uppercase tracking-widest text-on-surface-faint mb-2">{label}</p>
              <p className="text-2xl font-medium text-on-surface" style={{ fontFamily: "var(--font-serif)" }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Top products by revenue */}
        <div className="bg-surface-lowest rounded-sm p-6">
          <p className="text-[10px] uppercase tracking-widest text-on-surface-faint mb-5">Top Products by Revenue</p>
          <div className="flex flex-col gap-3">
            {topProducts.map((item) => (
              <div key={item.productId} className="flex items-center justify-between py-2 border-b border-outline/5 last:border-0">
                <p className="text-sm text-on-surface">{productMap[item.productId] ?? item.productId}</p>
                <div className="text-right">
                  <p className="text-sm font-medium text-on-surface">{fmt(Number(item._sum.total ?? 0))}</p>
                  <p className="text-[10px] text-on-surface-faint">{item._sum.quantity ?? 0} units</p>
                </div>
              </div>
            ))}
            {topProducts.length === 0 && <p className="text-sm text-on-surface-faint text-center py-4">No sales data yet.</p>}
          </div>
        </div>

        {/* Orders by status */}
        <div className="bg-surface-lowest rounded-sm p-6">
          <p className="text-[10px] uppercase tracking-widest text-on-surface-faint mb-5">Orders by Status</p>
          <div className="flex flex-col gap-3">
            {revenueByStatus.map((s) => (
              <div key={s.status} className="flex items-center justify-between py-2 border-b border-outline/5 last:border-0">
                <p className="text-sm text-on-surface uppercase tracking-wide text-xs">{s.status}</p>
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
  );
}
