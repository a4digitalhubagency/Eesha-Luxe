import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminCategoryEditForm } from "@/components/admin/AdminCategoryEditForm";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditCategoryPage({ params }: Props) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/");

  const { id } = await params;
  const category = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  });
  if (!category) notFound();

  return (
    <div className="min-h-screen bg-surface">
      <div className="px-8 py-7 border-b border-outline/10 bg-surface-lowest">
        <div className="flex items-center gap-2 text-xs text-on-surface-faint mb-3">
          <Link href="/admin/categories" className="hover:text-primary transition-colors">Categories</Link>
          <span>/</span>
          <span>{category.name}</span>
        </div>
        <h1 className="text-3xl text-on-surface" style={{ fontFamily: "var(--font-serif)", letterSpacing: "-0.02em" }}>
          Edit Category
        </h1>
      </div>

      <div className="px-8 py-8 max-w-lg">
        <AdminCategoryEditForm
          category={{
            id: category.id,
            name: category.name,
            description: category.description ?? "",
            imageUrl: category.imageUrl ?? "",
          }}
          productCount={category._count.products}
        />
      </div>
    </div>
  );
}
