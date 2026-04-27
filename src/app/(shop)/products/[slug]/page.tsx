import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductDetail } from "@/components/product/ProductDetail";
import { CompleteTheLook } from "@/components/product/CompleteTheLook";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) return { title: "Product Not Found" };
  return {
    title: product.name,
    description: product.description ?? undefined,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug, published: true },
    include: { category: true },
  });

  if (!product) notFound();

  const relatedProducts = await prisma.product.findMany({
    where: { published: true, categoryId: product.categoryId, slug: { not: slug } },
    orderBy: { createdAt: "desc" },
    take: 4,
    select: { id: true, slug: true, name: true, price: true, images: true },
  });

  const images = product.images.map((src, i) => ({
    src,
    alt: `${product.name} — view ${i + 1}`,
  }));

  // Use sizes from DB; all are available when in stock
  const sizes = product.sizes.length > 0
    ? product.sizes.map((label) => ({ label, available: product.stock > 0 }))
    : [];

  // Shipping badge always applies; material badge only when composition is set
  const badges: { icon: "truck" | "leaf"; text: string }[] = [
    { icon: "truck", text: "Complimentary Express Shipping" },
    ...(product.composition
      ? [{ icon: "leaf" as const, text: product.composition.split(".")[0].trim() }]
      : []),
  ];

  const completeTheLook = relatedProducts.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: Number(p.price),
    image: p.images[0] ?? "",
  }));

  return (
    <div className="bg-surface-lowest">
      <ProductDetail
        product={{
          id: product.id,
          slug: product.slug,
          name: product.name,
          price: Number(product.price),
          collection: product.category.name,
          category: product.category.name,
          composition: product.composition ?? null,
          description: product.description ?? "",
          images,
          sizes,
          badges,
        }}
      />
      <CompleteTheLook products={completeTheLook} />
    </div>
  );
}
