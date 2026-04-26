import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CollectionView } from "@/components/collections/CollectionView";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) return { title: "Collection Not Found" };
  return {
    title: category.name,
    description: category.description ?? undefined,
  };
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;

  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      products: {
        where: { published: true },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          slug: true,
          name: true,
          color: true,
          sizes: true,
          price: true,
          images: true,
        },
      },
    },
  });

  if (!category) notFound();

  const products = category.products.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    color: p.color,
    sizes: p.sizes,
    price: Number(p.price),
    image: p.images[0] ?? "",
  }));

  return (
    <CollectionView
      title={category.name}
      description={category.description ?? ""}
      breadcrumb={category.name}
      products={products}
    />
  );
}
