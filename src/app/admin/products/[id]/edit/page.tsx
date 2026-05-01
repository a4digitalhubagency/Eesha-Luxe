import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminProductEditForm } from "@/components/admin/AdminProductEditForm";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: Props) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/");

  const { id } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { category: { select: { id: true, name: true, slug: true } } },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, slug: true } }),
  ]);

  if (!product) notFound();

  return (
    <div className="min-h-screen bg-surface">
      <div className="px-5 md:px-8 py-7 border-b border-outline/10 bg-surface-lowest">
        <div className="flex items-center gap-2 text-xs text-on-surface-faint mb-3">
          <Link href="/admin/products" className="hover:text-primary transition-colors">Products</Link>
          <span>/</span>
          <span className="truncate max-w-[200px]">{product.name}</span>
          <span>/</span>
          <span>Edit</span>
        </div>
        <h1
          className="text-3xl text-on-surface"
          style={{ fontFamily: "var(--font-serif)", letterSpacing: "-0.02em" }}
        >
          Edit Product
        </h1>
        <p className="text-sm text-on-surface-muted mt-1">Update the details for <span className="text-on-surface font-medium">{product.name}</span>.</p>
      </div>

      <div className="px-5 md:px-8 py-8 max-w-2xl">
        <AdminProductEditForm
          product={{
            id: product.id,
            name: product.name,
            description: product.description ?? "",
            price: Number(product.price),
            compareAt: product.compareAt ? Number(product.compareAt) : null,
            stock: product.stock,
            images: product.images,
            categoryId: product.categoryId,
            color: product.color ?? "",
            sizes: product.sizes,
            composition: product.composition ?? "",
            featured: product.featured,
            published: product.published,
          }}
          categories={categories}
        />
      </div>
    </div>
  );
}
