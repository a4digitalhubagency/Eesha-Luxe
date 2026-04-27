import Image from "next/image";
import Link from "next/link";
import { prisma, Prisma } from "@/lib/prisma";
import { AdminProductFilters } from "@/components/admin/AdminProductFilters";

interface Props {
  searchParams: Promise<{ search?: string; category?: string; stock?: string; page?: string }>;
}

function stockBadge(stock: number) {
  if (stock === 0) return { label: "Out of Stock", dot: "bg-red-500", text: "text-red-600", bg: "bg-red-50 border-red-200" };
  if (stock <= 5)  return { label: `Low Stock`,    dot: "bg-amber-500", text: "text-amber-600", bg: "bg-[#fdf0f0] border-[#f5c5c5]" };
  return { label: "Active",         dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" };
}

export default async function AdminProductsPage({ searchParams }: Props) {
  const { search = "", category = "", stock = "", page = "1" } = await searchParams;
  const currentPage = Math.max(1, Number(page));
  const limit = 10;

  const where: Prisma.ProductWhereInput = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }
  if (category) where.category = { slug: category };
  if (stock === "out") where.stock = { equals: 0 };
  if (stock === "low") where.stock = { gt: 0, lte: 5 };
  if (stock === "in")  where.stock = { gt: 5 };

  const [products, total, categories, stats, lowStockCount] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (currentPage - 1) * limit,
      take: limit,
      include: { category: { select: { name: true, slug: true } } },
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({ select: { name: true, slug: true }, orderBy: { name: "asc" } }),
    prisma.product.aggregate({ _sum: { price: true, stock: true }, _count: { id: true }, where: { published: true } }),
    prisma.product.count({ where: { stock: { gt: 0, lte: 5 } } }),
  ]);

  const pages = Math.ceil(total / limit);
  const totalInventoryValue = Number(stats._sum.price ?? 0);
  const totalStock = stats._sum.stock ?? 0;

  function pageUrl(p: number) {
    const params = new URLSearchParams();
    if (search)   params.set("search", search);
    if (category) params.set("category", category);
    if (stock)    params.set("stock", stock);
    params.set("page", p.toString());
    return `/admin/products?${params.toString()}`;
  }

  return (
    <div className="min-h-screen bg-surface">

      {/* ── MOBILE header ────────────────────────────── */}
      <div className="md:hidden px-5 pt-6 pb-4">
        <p className="text-[9px] uppercase tracking-widest text-on-surface-faint mb-1">Inventory Management</p>
        <h1 className="text-3xl text-on-surface mb-5" style={{ fontFamily: "var(--font-serif)", letterSpacing: "-0.02em" }}>
          Product Catalog
        </h1>
        <Link href="/admin/products" className="btn-primary w-full flex items-center justify-center gap-2 h-11 text-sm mb-6">
          <span className="text-base leading-none">+</span> Add Product
        </Link>

        {/* Mobile stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-surface-lowest rounded-sm p-4">
            <p className="text-[9px] uppercase tracking-widest text-on-surface-faint mb-2">Total Stock</p>
            <p className="text-3xl font-medium text-on-surface" style={{ fontFamily: "var(--font-serif)" }}>
              {totalStock.toLocaleString()}
            </p>
          </div>
          <div className="bg-[#fdf0f2] rounded-sm p-4">
            <p className="text-[9px] uppercase tracking-widest text-[#c47a8a] mb-2">Low Inventory</p>
            <p className="text-3xl font-medium text-[#8b3a52]" style={{ fontFamily: "var(--font-serif)" }}>
              {lowStockCount}
            </p>
          </div>
          <div className="bg-surface-lowest rounded-sm p-4">
            <p className="text-[9px] uppercase tracking-widest text-on-surface-faint mb-2">Active Listings</p>
            <p className="text-3xl font-medium text-on-surface" style={{ fontFamily: "var(--font-serif)" }}>
              {stats._count.id}
            </p>
          </div>
          <div className="bg-surface-lowest rounded-sm p-4">
            <p className="text-[9px] uppercase tracking-widest text-on-surface-faint mb-2">Value</p>
            <p className="text-2xl font-medium text-on-surface" style={{ fontFamily: "var(--font-serif)" }}>
              ₦{(totalInventoryValue / 1000).toFixed(1)}k
            </p>
          </div>
        </div>

        {/* Mobile product cards */}
        <div className="flex flex-col gap-4">
          {products.length === 0 ? (
            <p className="text-sm text-on-surface-faint text-center py-12">No products found.</p>
          ) : (
            products.map((product) => {
              const badge = stockBadge(product.stock);
              return (
                <div key={product.id} className="bg-surface-lowest rounded-sm overflow-hidden">
                  {/* Top row */}
                  <div className="flex items-center gap-4 p-4">
                    <div className="relative w-16 h-16 bg-surface-low rounded-sm overflow-hidden shrink-0">
                      {product.images[0] && (
                        <Image src={product.images[0]} alt={product.name} fill className="object-cover object-top" sizes="64px" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-on-surface leading-snug">{product.name}</p>
                      <p className="text-[9px] uppercase tracking-widest text-on-surface-faint mt-0.5">
                        Category · {product.category.name}
                      </p>
                    </div>
                    <button className="text-on-surface-faint shrink-0 text-lg leading-none pb-1">⋮</button>
                  </div>
                  {/* Details row */}
                  <div className="border-t border-outline/8 px-4 py-3 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] uppercase tracking-widest text-on-surface-faint">SKU</span>
                      <span className="text-xs font-mono text-on-surface-muted">EL-{product.id.slice(-8).toUpperCase()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] uppercase tracking-widest text-on-surface-faint">Price</span>
                      <span className="text-sm font-medium text-on-surface">₦{Number(product.price).toLocaleString()}.00</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] uppercase tracking-widest text-on-surface-faint">Status</span>
                      <span className={`text-[9px] uppercase tracking-widest px-2 py-1 rounded-sm border ${badge.bg} ${badge.text}`}>
                        {badge.label}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Mobile pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <Link href={pageUrl(currentPage - 1)} className={`w-8 h-8 flex items-center justify-center rounded-sm border border-outline/15 text-sm text-on-surface-muted ${currentPage <= 1 ? "pointer-events-none opacity-30" : ""}`}>‹</Link>
            {Array.from({ length: Math.min(pages, 3) }, (_, i) => i + 1).map((p) => (
              <Link key={p} href={pageUrl(p)} className={`w-8 h-8 flex items-center justify-center rounded-sm text-sm transition-colors ${p === currentPage ? "bg-secondary text-white" : "border border-outline/15 text-on-surface-muted"}`}>
                {p}
              </Link>
            ))}
            <Link href={pageUrl(currentPage + 1)} className={`w-8 h-8 flex items-center justify-center rounded-sm border border-outline/15 text-sm text-on-surface-muted ${currentPage >= pages ? "pointer-events-none opacity-30" : ""}`}>›</Link>
          </div>
        )}
      </div>

      {/* ── DESKTOP layout ───────────────────────────── */}
      <div className="hidden md:block">
        <div className="px-8 py-7 border-b border-outline/10 bg-surface-lowest">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl text-on-surface mb-1" style={{ fontFamily: "var(--font-serif)", letterSpacing: "-0.02em" }}>
                Product Inventory
              </h1>
              <p className="text-sm text-on-surface-muted">Manage your digital atelier&apos;s curated collections.</p>
            </div>
            <button className="btn-primary flex items-center gap-2 px-5 h-10 text-sm">
              <span className="text-base leading-none">+</span> Add Product
            </button>
          </div>
        </div>

        <div className="px-8 py-8">
          <div className="mb-6">
            <AdminProductFilters
              defaultSearch={search}
              defaultCategory={category}
              defaultStock={stock}
              categories={categories}
            />
          </div>

          <div className="bg-surface-lowest rounded-sm overflow-hidden mb-6">
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline/10">
                  {["Product", "Category", "Price", "Inventory", "Actions"].map((h) => (
                    <th key={h} className="text-left px-5 py-3.5 text-[9px] uppercase tracking-widest text-on-surface-faint font-normal">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr><td colSpan={5} className="px-5 py-14 text-center text-sm text-on-surface-faint">No products found.</td></tr>
                ) : (
                  products.map((product) => {
                    const badge = stockBadge(product.stock);
                    return (
                      <tr key={product.id} className="border-b border-outline/5 hover:bg-surface-low/40 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative w-12 h-14 bg-surface-low rounded-sm overflow-hidden shrink-0">
                              {product.images[0] && (
                                <Image src={product.images[0]} alt={product.name} fill className="object-cover object-top" sizes="48px" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-on-surface">{product.name}</p>
                              <p className="text-[10px] text-on-surface-faint mt-0.5 font-mono uppercase">EL-{product.id.slice(-8).toUpperCase()}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-on-surface-muted">{product.category.name}</td>
                        <td className="px-5 py-4 text-sm text-on-surface">₦{Number(product.price).toLocaleString()}.00</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                            <span className={`text-xs ${badge.text}`}>{product.stock === 0 ? "Out of Stock" : `${badge.label} (${product.stock})`}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <Link href={`/products/${product.slug}`} className="text-[10px] uppercase tracking-widest text-on-surface-faint hover:text-primary transition-colors">View</Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mb-8">
            <p className="text-xs text-on-surface-faint">
              Showing {Math.min((currentPage - 1) * limit + 1, total)}–{Math.min(currentPage * limit, total)} of {total} results
            </p>
            {pages > 1 && (
              <div className="flex items-center gap-1">
                <Link href={pageUrl(currentPage - 1)} className={`w-8 h-8 flex items-center justify-center rounded-sm border border-outline/15 text-sm text-on-surface-faint hover:border-primary transition-colors ${currentPage <= 1 ? "pointer-events-none opacity-30" : ""}`}>‹</Link>
                <Link href={pageUrl(currentPage + 1)} className={`w-8 h-8 flex items-center justify-center rounded-sm border border-outline/15 text-sm text-on-surface-faint hover:border-primary transition-colors ${currentPage >= pages ? "pointer-events-none opacity-30" : ""}`}>›</Link>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Total Inventory Value", value: `₦${totalInventoryValue.toLocaleString()}.00` },
              { label: "Active SKUs",           value: stats._count.id.toString() },
              { label: "Low Stock Alerts",      value: lowStockCount.toString() },
            ].map(({ label, value }) => (
              <div key={label} className="bg-surface-lowest rounded-sm p-5 border-t-2 border-outline/10">
                <p className="text-[9px] uppercase tracking-widest text-on-surface-faint mb-2">{label}</p>
                <p className="text-2xl font-medium text-on-surface" style={{ fontFamily: "var(--font-serif)" }}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
