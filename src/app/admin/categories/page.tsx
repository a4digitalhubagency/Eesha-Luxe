export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="min-h-screen bg-surface">
      <div className="px-8 py-7 border-b border-outline/10 bg-surface-lowest">
        <p className="text-[10px] uppercase tracking-widest text-on-surface-faint mb-1">Catalog</p>
        <div className="flex items-end justify-between">
          <h1 className="text-3xl text-on-surface" style={{ fontFamily: "var(--font-serif)", letterSpacing: "-0.02em" }}>
            Categories
          </h1>
          <Link href="/admin/categories/new" className="btn-primary px-5 h-10 text-sm flex items-center gap-2">
            <span className="text-base leading-none">+</span> Add Category
          </Link>
        </div>
      </div>

      <div className="px-8 py-8">
        <div className="bg-surface-lowest rounded-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline/10">
                {["Name", "Slug", "Products", ""].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 text-[9px] uppercase tracking-widest text-on-surface-faint font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-14 text-center text-sm text-on-surface-faint">
                    No categories yet. <Link href="/admin/categories/new" className="text-primary hover:underline">Create one</Link>.
                  </td>
                </tr>
              ) : categories.map((c) => (
                <tr key={c.id} className="border-b border-outline/5 hover:bg-surface-low/40 transition-colors">
                  <td className="px-5 py-4 text-sm font-medium text-on-surface">{c.name}</td>
                  <td className="px-5 py-4 text-xs text-on-surface-faint font-mono">{c.slug}</td>
                  <td className="px-5 py-4 text-sm text-on-surface-muted">{c._count.products}</td>
                  <td className="px-5 py-4">
                    <Link href={`/admin/categories/${c.id}/edit`} className="text-[10px] uppercase tracking-widest text-primary hover:underline underline-offset-2">
                      Edit
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
