"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Product {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  category: string;
}

const VISIBLE = 3;

export function EditorialEdit({ products }: { products: Product[] }) {
  const [offset, setOffset] = useState(0);
  const canPrev = offset > 0;
  const canNext = offset + VISIBLE < products.length;

  if (products.length === 0) return null;

  return (
    <section className="bg-surface-low py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="label mb-3">Fresh Arrivals</p>
            <h2
              className="text-4xl md:text-5xl text-on-surface"
              style={{ fontFamily: "var(--font-serif)", letterSpacing: "-0.02em" }}
            >
              The Editorial Edit
            </h2>
          </div>
          {products.length > VISIBLE && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setOffset((o) => Math.max(0, o - 1))}
                disabled={!canPrev}
                className="w-8 h-8 flex items-center justify-center text-on-surface-muted hover:text-primary disabled:opacity-25 transition-colors"
                aria-label="Previous"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => setOffset((o) => (canNext ? o + 1 : o))}
                disabled={!canNext}
                className="w-8 h-8 flex items-center justify-center text-on-surface-muted hover:text-primary disabled:opacity-25 transition-colors"
                aria-label="Next"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {products.slice(offset, offset + VISIBLE).map((product) => (
            <Link key={product.id} href={`/products/${product.slug}`} className="group">
              <div className="bg-surface-lowest rounded-sm overflow-hidden">
                <div className="relative w-full aspect-4/5 overflow-hidden">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.02]"
                      sizes="(max-width: 768px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-surface-low" />
                  )}
                  <div className="absolute inset-0 bg-primary-container/0 group-hover:bg-primary-container/20 transition-colors duration-500" />
                </div>
                <div className="p-4 pb-5">
                  <p className="label mb-1.5">{product.category}</p>
                  <p className="text-sm font-medium text-on-surface">{product.name}</p>
                  <p className="text-sm text-on-surface-muted mt-1">${product.price.toLocaleString()}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
