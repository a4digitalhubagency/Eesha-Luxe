export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";

export default async function AdminCustomersPage() {
  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, createdAt: true, _count: { select: { orders: true } } },
  });

  return (
    <div className="min-h-screen bg-surface">
      <div className="px-8 py-7 border-b border-outline/10 bg-surface-lowest">
        <p className="text-[10px] uppercase tracking-widest text-on-surface-faint mb-1">Directory</p>
        <div className="flex items-end justify-between">
          <h1 className="text-3xl text-on-surface" style={{ fontFamily: "var(--font-serif)", letterSpacing: "-0.02em" }}>Customers</h1>
          <span className="label text-on-surface-faint">{customers.length} registered</span>
        </div>
      </div>

      <div className="px-8 py-8">
        <div className="bg-surface-lowest rounded-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline/10">
                {["Name", "Email", "Orders", "Joined"].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 text-[9px] uppercase tracking-widest text-on-surface-faint font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr><td colSpan={4} className="px-5 py-14 text-center text-sm text-on-surface-faint">No customers yet.</td></tr>
              ) : customers.map((c) => (
                <tr key={c.id} className="border-b border-outline/5 hover:bg-surface-low/40 transition-colors">
                  <td className="px-5 py-4 text-sm font-medium text-on-surface">{c.name ?? "—"}</td>
                  <td className="px-5 py-4 text-sm text-on-surface-muted">{c.email}</td>
                  <td className="px-5 py-4 text-sm text-on-surface-muted">{c._count.orders}</td>
                  <td className="px-5 py-4 text-xs text-on-surface-faint">
                    {new Date(c.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
