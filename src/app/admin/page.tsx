import Image from "next/image";
import Link from "next/link";
import { TrendingUp, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { AdminBarChart } from "@/components/admin/AdminBarChart";

const STATUS_BADGE: Record<string, string> = {
  PENDING:    "bg-amber-50 text-amber-700 border-amber-200",
  CONFIRMED:  "bg-blue-50 text-blue-700 border-blue-200",
  PROCESSING: "bg-purple-50 text-purple-700 border-purple-200",
  SHIPPED:    "bg-indigo-50 text-indigo-700 border-indigo-200",
  DELIVERED:  "bg-emerald-50 text-emerald-700 border-emerald-200",
  CANCELLED:  "bg-red-50 text-red-700 border-red-200",
  REFUNDED:   "bg-gray-50 text-gray-600 border-gray-200",
};

function fmt(n: number) {
  return `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
}

function greeting(name: string) {
  const h = new Date().getHours();
  const time = h < 12 ? "Morning" : h < 17 ? "Afternoon" : "Evening";
  const first = name.split(" ")[0];
  return `${time}, ${first}.`;
}

export default async function AdminDashboardPage() {
  const session = await getSession();
  const userName = session?.name ?? "Admin";

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const [allOrders, thisMonthOrders, lastMonthOrders, statusCounts, recentOrders, topItems, sevenDayOrders, newestProduct] =
    await Promise.all([
      prisma.order.aggregate({ _sum: { total: true }, _count: true }),
      prisma.order.aggregate({ where: { createdAt: { gte: startOfMonth } }, _sum: { total: true } }),
      prisma.order.aggregate({ where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } }, _sum: { total: true } }),
      prisma.order.groupBy({ by: ["status"], _count: { id: true } }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { user: { select: { name: true } } },
      }),
      prisma.orderItem.groupBy({
        by: ["productId"],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 3,
      }),
      prisma.order.findMany({
        where: { createdAt: { gte: days[0] } },
        select: { total: true, createdAt: true },
      }),
      prisma.product.findFirst({
        where: { published: true },
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, images: true, description: true, category: { select: { name: true } }, createdAt: true },
      }),
    ]);

  const topProductIds = topItems.map((t) => t.productId);
  const topProducts = await prisma.product.findMany({
    where: { id: { in: topProductIds } },
    select: { id: true, name: true, price: true, images: true, stock: true, createdAt: true },
  });
  const topProductMap = Object.fromEntries(topProducts.map((p) => [p.id, p]));

  const chartData = days.map((day) => {
    const next = new Date(day);
    next.setDate(next.getDate() + 1);
    const amt = sevenDayOrders
      .filter((o) => o.createdAt >= day && o.createdAt < next)
      .reduce((s, o) => s + Number(o.total), 0);
    return { label: day.toLocaleDateString("en-NG", { weekday: "short" }).slice(0, 3).toUpperCase(), amount: amt };
  });

  const totalRevenue = Number(allOrders._sum.total ?? 0);
  const thisMonth = Number(thisMonthOrders._sum.total ?? 0);
  const lastMonth = Number(lastMonthOrders._sum.total ?? 0);
  const pctChange = lastMonth === 0 ? null : ((thisMonth - lastMonth) / lastMonth) * 100;
  const countByStatus = Object.fromEntries(statusCounts.map((s) => [s.status, s._count.id]));
  const activeShipments = (countByStatus.CONFIRMED ?? 0) + (countByStatus.PROCESSING ?? 0) + (countByStatus.SHIPPED ?? 0);
  const processingCount = countByStatus.PROCESSING ?? 0;
  const inTransitCount = countByStatus.SHIPPED ?? 0;
  const maxShipment = Math.max(processingCount + inTransitCount, 1);
  const monthLabel = now.toLocaleDateString("en-NG", { month: "long", year: "numeric" });

  return (
    <div className="min-h-screen bg-surface">

      {/* ── MOBILE layout ────────────────────────────── */}
      <div className="md:hidden px-5 pt-6 pb-4">
        {/* Greeting */}
        <p className="text-[10px] uppercase tracking-widest text-on-surface-faint mb-1">The Atelier Overview</p>
        <h1 className="text-4xl text-on-surface mb-2" style={{ fontFamily: "var(--font-serif)", letterSpacing: "-0.02em" }}>
          {greeting(userName)}
        </h1>
        <p className="text-sm text-on-surface-muted leading-relaxed mb-6">
          Your curation has grown by {pctChange !== null ? `${Math.abs(pctChange).toFixed(0)}%` : "—"} this week. Here is your digital atelier status.
        </p>

        {/* Revenue card */}
        <div className="bg-surface-lowest rounded-sm p-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[9px] uppercase tracking-widest text-on-surface-faint">Total Revenue</p>
            <TrendingUp size={16} className="text-on-surface-faint" />
          </div>
          <p className="text-3xl font-medium text-on-surface mb-0.5" style={{ fontFamily: "var(--font-serif)" }}>
            {fmt(totalRevenue)}
          </p>
          {pctChange !== null && (
            <p className={`text-[10px] mb-5 ${pctChange >= 0 ? "text-emerald-600" : "text-red-500"}`}>
              {pctChange >= 0 ? "+" : ""}{pctChange.toFixed(1)}% vs last month
            </p>
          )}
          <AdminBarChart data={chartData} />
        </div>

        {/* Orders summary */}
        <div className="bg-surface-lowest rounded-sm p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[9px] uppercase tracking-widest text-on-surface-faint">Orders Summary</p>
            <div className="w-7 h-7 bg-surface-low rounded-sm flex items-center justify-center">
              <span className="text-xs">🛍️</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-4xl font-medium text-on-surface" style={{ fontFamily: "var(--font-serif)" }}>{activeShipments}</span>
            <span className="text-sm text-on-surface-muted">Active shipments</span>
          </div>
          <div className="flex flex-col gap-3">
            {[
              { label: "Processing", count: processingCount },
              { label: "In Transit",  count: inTransitCount },
            ].map(({ label, count }) => (
              <div key={label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-on-surface-muted">{label}</span>
                  <span className="text-xs font-medium text-on-surface">{count}</span>
                </div>
                <div className="h-1 bg-surface-low rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary/40 rounded-full transition-all"
                    style={{ width: `${(count / maxShipment) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Curation Spotlight */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl text-on-surface" style={{ fontFamily: "var(--font-serif)", letterSpacing: "-0.02em" }}>
              Curation Spotlight
            </h2>
            <Link href="/admin/products" className="text-[10px] uppercase tracking-widest text-on-surface-faint hover:text-primary">
              View All
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {topItems.map((item, idx) => {
              const product = topProductMap[item.productId];
              if (!product) return null;
              const tag = idx === 0 ? "New Arrival" : product.stock <= 5 ? "Restocked" : "Top Seller";
              return (
                <div key={item.productId} className="bg-surface-lowest rounded-sm p-4 flex items-center gap-4">
                  <div className="relative w-16 h-16 bg-surface-low rounded-sm overflow-hidden shrink-0">
                    {product.images[0] && (
                      <Image src={product.images[0]} alt={product.name} fill className="object-cover object-top" sizes="64px" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] uppercase tracking-widest text-primary mb-0.5">{tag}</p>
                    <p className="text-sm font-medium text-on-surface leading-snug">{product.name}</p>
                    <p className="text-xs text-on-surface-faint mt-0.5">
                      {fmt(Number(product.price))} · {item._sum.quantity ?? 0} Units
                    </p>
                  </div>
                  <button className="text-on-surface-faint shrink-0">⋮</button>
                </div>
              );
            })}
            {topItems.length === 0 && (
              <p className="text-sm text-on-surface-faint text-center py-6 bg-surface-lowest rounded-sm">No sales yet.</p>
            )}
          </div>
        </div>

        {/* Atelier Journal — newest product */}
        {newestProduct && (
          <div className="mb-6">
            <h2 className="text-xl text-on-surface mb-4" style={{ fontFamily: "var(--font-serif)", letterSpacing: "-0.02em" }}>
              Atelier Journal
            </h2>
            <Link href={`/products/${newestProduct.id}`} className="block bg-surface-lowest rounded-sm overflow-hidden">
              <div className="relative h-48 bg-surface-low">
                {newestProduct.images[0] ? (
                  <Image
                    src={newestProduct.images[0]}
                    alt={newestProduct.name}
                    fill
                    className="object-cover object-top"
                    sizes="100vw"
                  />
                ) : (
                  <div className="w-full h-full bg-surface-low" />
                )}
              </div>
              <div className="p-4">
                <p className="text-[9px] uppercase tracking-widest text-on-surface-faint mb-2">
                  {newestProduct.category.name} · {newestProduct.createdAt.toLocaleDateString("en-NG", { month: "short", day: "numeric" })}
                </p>
                <h3 className="text-lg text-on-surface leading-snug mb-2" style={{ fontFamily: "var(--font-serif)" }}>
                  {newestProduct.name}
                </h3>
                {newestProduct.description && (
                  <p className="text-xs text-on-surface-muted leading-relaxed line-clamp-2">
                    {newestProduct.description}
                  </p>
                )}
              </div>
            </Link>
          </div>
        )}
      </div>

      {/* Floating action button — mobile only */}
      <Link
        href="/admin/products"
        className="md:hidden fixed bottom-20 right-5 z-30 w-12 h-12 bg-secondary text-white rounded-xl flex items-center justify-center shadow-lg"
      >
        <Plus size={20} />
      </Link>

      {/* ── DESKTOP layout ───────────────────────────── */}
      <div className="hidden md:block">
        <div className="px-8 py-7 border-b border-outline/10 bg-surface-lowest">
          <p className="text-[10px] uppercase tracking-widest text-on-surface-faint mb-1">Overview</p>
          <div className="flex items-end justify-between">
            <h1 className="text-3xl text-on-surface" style={{ fontFamily: "var(--font-serif)", letterSpacing: "-0.02em" }}>
              {greeting(userName)}
            </h1>
            <span className="text-xs text-on-surface-faint border border-outline/15 rounded-sm px-3 py-1.5">
              {monthLabel}
            </span>
          </div>
        </div>

        <div className="px-8 py-8 grid lg:grid-cols-[1fr_280px] gap-6">
          <div className="flex flex-col gap-6">
            {/* Revenue chart */}
            <div className="bg-surface-lowest rounded-sm p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-on-surface-faint mb-1">Revenue Stream</p>
                  <p className="text-xs text-on-surface-faint">Total earnings across all digital boutiques</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-medium text-on-surface" style={{ fontFamily: "var(--font-serif)" }}>
                    {fmt(totalRevenue)}
                  </p>
                  {pctChange !== null && (
                    <p className={`text-[10px] uppercase tracking-wide mt-0.5 ${pctChange >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                      {pctChange >= 0 ? "+" : ""}{pctChange.toFixed(1)}% vs last month
                    </p>
                  )}
                </div>
              </div>
              <RevenueChart data={chartData} />
            </div>

            {/* Curation Spotlight */}
            <div className="bg-surface-lowest rounded-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <p className="text-[10px] uppercase tracking-widest text-on-surface-faint">Curation Spotlight</p>
                <Link href="/admin/products" className="text-[10px] uppercase tracking-widest text-primary hover:underline underline-offset-2">
                  View All Inventory
                </Link>
              </div>
              <div className="flex flex-col gap-4">
                {topItems.map((item, idx) => {
                  const product = topProductMap[item.productId];
                  if (!product) return null;
                  const tag = idx === 0 ? "New Arrival" : product.stock <= 5 ? "Restocked" : "Top Seller";
                  return (
                    <div key={item.productId} className="flex items-center gap-4">
                      <div className="relative w-14 h-16 bg-surface-low rounded-sm overflow-hidden shrink-0">
                        {product.images[0] && (
                          <Image src={product.images[0]} alt={product.name} fill className="object-cover object-top" sizes="56px" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] uppercase tracking-widest text-primary mb-0.5">{tag}</p>
                        <p className="text-sm font-medium text-on-surface truncate">{product.name}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm text-on-surface">{fmt(Number(product.price))}</p>
                        <p className="text-[10px] uppercase tracking-wide text-on-surface-faint mt-0.5">
                          {item._sum.quantity ?? 0} sold
                        </p>
                      </div>
                    </div>
                  );
                })}
                {topItems.length === 0 && (
                  <p className="text-sm text-on-surface-faint py-4 text-center">No sales data yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-6">
            <div className="bg-surface-lowest rounded-sm p-6">
              <p className="text-[10px] uppercase tracking-widest text-on-surface-faint mb-1">Orders Summary</p>
              <p className="text-xs text-on-surface-muted mb-5 leading-relaxed">
                {activeShipments} active shipment{activeShipments !== 1 ? "s" : ""} awaiting fulfilment.
              </p>
              <div className="flex flex-col gap-3 mb-6">
                {[
                  { label: "Processing", count: countByStatus.PROCESSING ?? 0 },
                  { label: "Shipped",    count: countByStatus.SHIPPED ?? 0 },
                  { label: "Delivered",  count: countByStatus.DELIVERED ?? 0 },
                  { label: "Cancelled",  count: countByStatus.CANCELLED ?? 0 },
                ].map(({ label, count }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-widest text-on-surface-faint">{label}</span>
                    <span className="text-sm font-medium text-on-surface">{count}</span>
                  </div>
                ))}
              </div>
              <Link href="/admin/orders" className="btn-primary w-full flex items-center justify-center h-10 text-xs uppercase tracking-widest">
                Process All Orders
              </Link>
            </div>

            <div className="bg-surface-lowest rounded-sm p-6">
              <p className="text-[10px] uppercase tracking-widest text-on-surface-faint mb-5">Atelier Journal</p>
              <div className="flex flex-col gap-4">
                {recentOrders.map((order) => {
                  const ref = `LX-${order.id.slice(-8).toUpperCase()}`;
                  const mins = Math.round((Date.now() - new Date(order.createdAt).getTime()) / 60000);
                  const timeAgo =
                    mins < 60 ? `${mins}m ago` :
                    mins < 1440 ? `${Math.floor(mins / 60)}h ago` :
                    `${Math.floor(mins / 1440)}d ago`;
                  return (
                    <Link key={order.id} href={`/admin/orders/${order.id}`} className="flex items-start gap-3 group">
                      <div className="w-5 h-5 rounded-full bg-primary-container flex items-center justify-center shrink-0 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-on-surface group-hover:text-primary transition-colors">Order {ref} placed</p>
                        <p className="text-[10px] text-on-surface-faint mt-0.5">{timeAgo} · {order.user.name}</p>
                      </div>
                    </Link>
                  );
                })}
                {recentOrders.length === 0 && (
                  <p className="text-sm text-on-surface-faint text-center py-4">No orders yet.</p>
                )}
              </div>
              {recentOrders.length > 0 && (
                <Link href="/admin/orders" className="block text-center text-[10px] uppercase tracking-widest text-primary hover:underline underline-offset-2 mt-5">
                  View Audit Log
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
