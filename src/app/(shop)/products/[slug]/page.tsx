import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductDetail } from "@/components/product/ProductDetail";
import { CompleteTheLook } from "@/components/product/CompleteTheLook";

interface Props {
  params: Promise<{ slug: string }>;
}

const STANDARD_SIZES = ["FR 34", "FR 36", "FR 38", "FR 40", "FR 42", "FR 44"];

const BADGES = [
  { icon: "truck" as const, text: "Complimentary Express Shipping" },
  { icon: "leaf" as const, text: "Sustainably Sourced Silk" },
];

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
    // composition queried via select below once column exists
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

  const sizes = STANDARD_SIZES.map((label, i) => ({
    label,
    available: product.stock > 0 ? i < STANDARD_SIZES.length - (product.stock < 5 ? 3 : 2) || i < 4 : false,
  }));

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
          category: "Ready-to-Wear",
          composition: (product as Record<string, unknown>).composition as string | null ?? null,
          description: product.description ?? "",
          images,
          sizes,
          badges: BADGES,
        }}
      />
      <CompleteTheLook products={completeTheLook} />
    </div>
  );
}
