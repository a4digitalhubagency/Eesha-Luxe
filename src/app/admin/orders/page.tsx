import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminOrderSearch } from "@/components/admin/AdminOrderSearch";

interface Props {
  searchParams: Promise<{ search?: string; page?: string }>;
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

export default async function AdminOrdersPage({ searchParams }: Props) {
  const { search = "", page = "1" } = await searchParams;
  const currentPage = Math.max(1, Number(page));
  const limit = 20;

  // Support searching by "LX-ABCD1234" or just "ABCD1234" (last 8 chars of id)
  const refMatch = search.match(/^(?:LX-)?([A-Z0-9]{8})$/i);
  const where = search
    ? {
        OR: [
          ...(refMatch
            ? [{ id: { endsWith: refMatch[1], mode: "insensitive" as const } }]
            : [{ id: { contains: search, mode: "insensitive" as const } }]),
          { user: { email: { contains: search, mode: "insensitive" as const } } },
          { user: { name: { contains: search, mode: "insensitive" as const } } },
        ],
      }
    : undefined;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (currentPage - 1) * limit,
      take: limit,
      include: {
        user: { select: { name: true, email: true } },
        items: { select: { quantity: true } },
      },
    }),
    prisma.order.count({ where }),
  ]);

  const pages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <div className="border-b border-outline/10 bg-surface-lowest px-6 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-on-surface-faint mb-1">Eesha Luxe · Admin</p>
            <h1 className="text-2xl text-on-surface" style={{ fontFamily: "var(--font-serif)", letterSpacing: "-0.02em" }}>
              Orders
            </h1>
          </div>
          <span className="label text-on-surface-faint">{total} total</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Search */}
        <div className="mb-6">
          <AdminOrderSearch defaultValue={search} />
        </div>

        {/* Table */}
        <div className="bg-surface-lowest rounded-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline/10">
                {["Reference", "Customer", "Items", "Total", "Status", "Date", ""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-on-surface-faint font-normal">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-on-surface-faint">
                    {search ? `No orders found for "${search}"` : "No orders yet."}
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const ref = `LX-${order.id.slice(-8).toUpperCase()}`;
                  const qty = order.items.reduce((s, i) => s + i.quantity, 0);
                  return (
                    <tr key={order.id} className="border-b border-outline/5 hover:bg-surface-low transition-colors">
                      <td className="px-4 py-4 font-mono text-xs text-on-surface">{ref}</td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-on-surface">{order.user.name}</p>
                        <p className="text-xs text-on-surface-faint">{order.user.email}</p>
                      </td>
                      <td className="px-4 py-4 text-sm text-on-surface-muted">{qty} item{qty !== 1 ? "s" : ""}</td>
                      <td className="px-4 py-4 text-sm text-on-surface">
                        ₦{Number(order.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide border ${STATUS_COLORS[order.status] ?? ""}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-xs text-on-surface-faint">
                        {new Date(order.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-4 py-4">
                        <Link href={`/admin/orders/${order.id}`} className="label text-primary hover:underline underline-offset-2">
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-xs text-on-surface-faint">
              Page {currentPage} of {pages}
            </p>
            <div className="flex gap-2">
              {currentPage > 1 && (
                <Link href={`/admin/orders?search=${search}&page=${currentPage - 1}`} className="btn-ghost px-4 py-1.5 text-xs">
                  Previous
                </Link>
              )}
              {currentPage < pages && (
                <Link href={`/admin/orders?search=${search}&page=${currentPage + 1}`} className="btn-primary px-4 py-1.5 text-xs">
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
