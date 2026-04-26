import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Collections",
  description: "Explore the full Digital Atelier — curated edits of luxury ready-to-wear.",
};

export default async function CollectionsPage() {
  const categories = await prisma.category.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      _count: { select: { products: { where: { published: true } } } },
    },
  });

  return (
    <div className="bg-surface min-h-screen">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-14">
        {/* Header */}
        <div className="mb-12">
          <p className="label text-primary mb-3">The Atelier</p>
          <h1
            className="text-4xl md:text-5xl text-on-surface mb-4"
            style={{ fontFamily: "var(--font-serif)", letterSpacing: "-0.02em" }}
          >
            All Collections
          </h1>
          <p className="text-sm text-on-surface-muted max-w-md leading-relaxed">
            Curated edits of luxury ready-to-wear, designed for women who dress with intention.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/collections/${cat.slug}`}
              className="group block"
            >
              <div className="relative w-full aspect-[3/4] bg-surface-low rounded-[4px] overflow-hidden mb-4">
                {cat.imageUrl ? (
                  <Image
                    src={cat.imageUrl}
                    alt={cat.name}
                    fill
                    className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.02]"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="absolute inset-0 bg-primary-container/30" />
                )}
                <div className="absolute inset-0 bg-on-surface/0 group-hover:bg-on-surface/5 transition-colors duration-500" />
              </div>
              <p className="text-base font-medium text-on-surface leading-snug">{cat.name}</p>
              <p className="text-xs text-on-surface-faint mt-0.5">
                {cat._count.products} {cat._count.products === 1 ? "piece" : "pieces"}
              </p>
            </Link>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p
              className="text-2xl text-on-surface mb-2"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Coming soon
            </p>
            <p className="text-sm text-on-surface-faint">The atelier is being prepared.</p>
          </div>
        )}
      </div>
    </div>
  );
}
