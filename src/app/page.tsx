import { prisma } from "@/lib/prisma";
import { HeroSection } from "@/components/home/HeroSection";
import { CuratedEssentials } from "@/components/home/CuratedEssentials";
import { EditorialEdit } from "@/components/home/EditorialEdit";
import { BestSellers } from "@/components/home/BestSellers";

export default async function HomePage() {
  const [categories, newArrivals, featured] = await Promise.all([
    prisma.category.findMany({
      orderBy: { createdAt: "asc" },
      take: 3,
      select: { id: true, name: true, slug: true, imageUrl: true },
    }),
    prisma.product.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true, slug: true, name: true, price: true, images: true,
        category: { select: { name: true } },
      },
    }),
    prisma.product.findMany({
      where: { published: true, featured: true },
      orderBy: { createdAt: "desc" },
      take: 4,
      select: { id: true, slug: true, name: true, price: true, images: true },
    }),
  ]);

  const editorialProducts = newArrivals.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: Number(p.price),
    image: p.images[0] ?? "",
    category: p.category.name,
  }));

  const bestSellers = featured.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: Number(p.price),
    image: p.images[0] ?? "",
  }));

  return (
    <>
      <HeroSection />
      <CuratedEssentials categories={categories} />
      <EditorialEdit products={editorialProducts} />
      <BestSellers products={bestSellers} />
    </>
  );
}
