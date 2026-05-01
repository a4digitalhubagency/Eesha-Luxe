import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminProductForm } from "@/components/admin/AdminProductForm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/");

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true },
  });

  return (
    <div className="min-h-screen bg-surface">
      <div className="px-5 md:px-8 py-7 border-b border-outline/10 bg-surface-lowest">
        <div className="flex items-center gap-2 text-xs text-on-surface-faint mb-3">
          <Link href="/admin/products" className="hover:text-primary transition-colors">Products</Link>
          <span>/</span>
          <span>New Product</span>
        </div>
        <h1
          className="text-3xl text-on-surface"
          style={{ fontFamily: "var(--font-serif)", letterSpacing: "-0.02em" }}
        >
          Add Product
        </h1>
        <p className="text-sm text-on-surface-muted mt-1">Fill in the details to add a new item to your catalog.</p>
      </div>

      <div className="px-5 md:px-8 py-8 max-w-2xl">
        {categories.length === 0 ? (
          <div className="bg-amber-50 border border-amber-200 rounded-sm px-4 py-4 mb-6">
            <p className="text-sm text-amber-700">
              You need at least one category before adding products.{" "}
              <Link href="/admin/categories/new" className="underline underline-offset-2">
                Create a category first
              </Link>
              .
            </p>
          </div>
        ) : null}
        <AdminProductForm categories={categories} />
      </div>
    </div>
  );
}
