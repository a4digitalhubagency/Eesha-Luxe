export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/collections/ProductCard";

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `Search: ${q}` : "Search",
  };
}

export default async function SearchPage({ searchParams }: Props) {
  const { q = "" } = await searchParams;
  const query = q.trim();

  const products = query
    ? await prisma.product.findMany({
        where: {
          published: true,
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { color: { contains: query, mode: "insensitive" } },
            { composition: { contains: query, mode: "insensitive" } },
            { category: { name: { contains: query, mode: "insensitive" } } },
          ],
        },
        orderBy: [{ stock: "desc" }, { createdAt: "desc" }],
        take: 60,
        select: {
          id: true,
          slug: true,
          name: true,
          color: true,
          sizes: true,
          price: true,
          images: true,
          stock: true,
        },
      })
    : [];

  const cards = products.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    color: p.color,
    sizes: p.sizes,
    price: Number(p.price),
    image: p.images[0] ?? "",
    stock: p.stock,
  }));

  return (
    <div className="bg-surface min-h-screen">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12">
        <div className="mb-10">
          <p className="label text-on-surface-faint mb-2">Search Results</p>
          <h1
            className="text-3xl md:text-4xl text-on-surface mb-2"
            style={{ fontFamily: "var(--font-serif)", letterSpacing: "-0.02em" }}
          >
            {query ? `“${query}”` : "Search the Atelier"}
          </h1>
          {query && (
            <p className="text-sm text-on-surface-muted">
              {cards.length} {cards.length === 1 ? "result" : "results"}
            </p>
          )}
        </div>

        {!query ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Search size={28} strokeWidth={1.5} className="text-on-surface-faint mb-4" />
            <p className="text-sm text-on-surface-muted">
              Enter a search term in the search bar above.
            </p>
          </div>
        ) : cards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Search size={28} strokeWidth={1.5} className="text-on-surface-faint mb-4" />
            <p className="text-base text-on-surface mb-2">No products found</p>
            <p className="text-sm text-on-surface-muted mb-6">
              We couldn&apos;t find anything matching <span className="text-on-surface">“{query}”</span>.
              Try a different search term.
            </p>
            <Link href="/collections" className="btn-primary inline-flex h-11 px-6 items-center text-sm">
              Browse Collections
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-12">
            {cards.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
