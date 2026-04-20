"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PRODUCTS = [
  {
    id: "1",
    category: "Ready-to-Wear",
    name: "The Aurelia Silk Draped Gown",
    price: 1850,
    slug: "aurelia-silk-draped-gown",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "2",
    category: "Clothing",
    name: "Oversized Twill Blazer",
    price: 850,
    slug: "oversized-twill-blazer",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "3",
    category: "Clothing",
    name: "Pleur Trousers",
    price: 650,
    slug: "pleur-trousers",
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "4",
    category: "Clothing",
    name: "Draped Silk Blouse",
    price: 490,
    slug: "draped-silk-blouse",
    image: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=600&q=80",
  },
];

const VISIBLE = 3;

export function EditorialEdit() {
  const [offset, setOffset] = useState(0);
  const canPrev = offset > 0;
  const canNext = offset + VISIBLE < PRODUCTS.length;

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
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {PRODUCTS.slice(offset, offset + VISIBLE).map((product) => (
            <Link key={product.id} href={`/products/${product.slug}`} className="group">
              {/* Card: surface-lowest on surface-low background = natural lift */}
              <div className="bg-surface-lowest rounded-[4px] overflow-hidden">
                <div className="relative w-full aspect-[4/5] overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.02]"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-primary-container/0 group-hover:bg-primary-container/20 transition-colors duration-500" />
                </div>
                <div className="p-4 pb-5">
                  <p className="label mb-1.5">{product.category}</p>
                  <p className="text-sm font-medium text-on-surface">{product.name}</p>
                  <p className="text-sm text-on-surface-muted mt-1">
                    ${product.price.toLocaleString()}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
