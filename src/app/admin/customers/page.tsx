export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma, Prisma } from "@/lib/prisma";
import { AdminCustomerSearch } from "@/components/admin/AdminCustomerSearch";

interface Props {
  searchParams: Promise<{ search?: string }>;
}

export default async function AdminCustomersPage({ searchParams }: Props) {
  const { search = "" } = await searchParams;

  const where: Prisma.UserWhereInput = { role: "CUSTOMER" };
  if (search.trim()) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const customers = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      _count: { select: { orders: true } },
      orders: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { total: true, createdAt: true },
      },
    },
  });

  return (
    <div className="min-h-screen bg-surface">
      <div className="px-8 py-7 border-b border-outline/10 bg-surface-lowest">
        <p className="text-[10px] uppercase tracking-widest text-on-surface-faint mb-1">Directory</p>
        <div className="flex items-end justify-between">
          <h1 className="text-3xl text-on-surface" style={{ fontFamily: "var(--font-serif)", letterSpacing: "-0.02em" }}>
            Customers
          </h1>
          <span className="label text-on-surface-faint">{customers.length} found</span>
        </div>
      </div>

      <div className="px-8 py-8">
        <div className="mb-6">
          <AdminCustomerSearch defaultValue={search} />
        </div>

        <div className="bg-surface-lowest rounded-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline/10">
                {["Name", "Email", "Orders", "Last Order", "Joined", ""].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 text-[9px] uppercase tracking-widest text-on-surface-faint font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-14 text-center text-sm text-on-surface-faint">
                    {search ? `No customers found for "${search}"` : "No customers yet."}
                  </td>
                </tr>
              ) : customers.map((c) => (
                <tr key={c.id} className="border-b border-outline/5 hover:bg-surface-low/40 transition-colors">
                  <td className="px-5 py-4 text-sm font-medium text-on-surface">{c.name ?? "—"}</td>
                  <td className="px-5 py-4 text-sm text-on-surface-muted">{c.email}</td>
                  <td className="px-5 py-4 text-sm text-on-surface-muted">{c._count.orders}</td>
                  <td className="px-5 py-4 text-sm text-on-surface-muted">
                    {c.orders[0]
                      ? `₦${Number(c.orders[0].total).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      : "—"}
                  </td>
                  <td className="px-5 py-4 text-xs text-on-surface-faint">
                    {new Date(c.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-5 py-4">
                    <Link href={`/admin/customers/${c.id}`} className="text-[10px] uppercase tracking-widest text-primary hover:underline underline-offset-2">
                      View
                    </Link>
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
