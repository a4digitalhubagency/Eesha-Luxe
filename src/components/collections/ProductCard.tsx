"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useState } from "react";

export interface ProductCardData {
  id: string;
  slug: string;
  name: string;
  color?: string | null;
  sizes?: string[];
  price: number;
  image: string;
  stock?: number;
}

export function ProductCard({ product }: { product: ProductCardData }) {
  const [wishlisted, setWishlisted] = useState(false);
  const outOfStock = product.stock === 0;
  const lowStock = product.stock !== undefined && product.stock > 0 && product.stock <= 3;

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      {/* Image container */}
      <div className="relative w-full aspect-[4/5] bg-surface-low overflow-hidden rounded-[4px] mb-3">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className={`object-cover object-top transition-transform duration-700 group-hover:scale-[1.02] ${outOfStock ? "grayscale opacity-60" : ""}`}
          sizes="(max-width: 768px) 100vw, 25vw"
        />
        <div className="absolute inset-0 bg-primary-container/0 group-hover:bg-primary-container/10 transition-colors duration-500" />

        {outOfStock && (
          <div className="absolute top-3 left-3 px-2 py-1 bg-on-surface text-surface text-[9px] uppercase tracking-widest rounded-sm">
            Sold Out
          </div>
        )}
        {lowStock && (
          <div className="absolute top-3 left-3 px-2 py-1 bg-amber-500 text-white text-[9px] uppercase tracking-widest rounded-sm">
            Only {product.stock} left
          </div>
        )}

        {/* Wishlist */}
        <button
          onClick={(e) => { e.preventDefault(); setWishlisted((v) => !v); }}
          aria-label="Add to wishlist"
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-[4px] bg-surface-lowest/70 backdrop-blur-sm text-on-surface-muted hover:text-primary transition-colors"
        >
          <Heart
            size={14}
            strokeWidth={1.5}
            className={wishlisted ? "fill-primary text-primary" : ""}
          />
        </button>
      </div>

      {/* Desktop info — stacked */}
      <div className="hidden md:block">
        <p className="text-sm font-medium text-on-surface leading-snug">{product.name}</p>
        {product.color && <p className="text-xs text-on-surface-faint mt-0.5">{product.color}</p>}
        <p className="text-sm text-on-surface-muted mt-1">₦{product.price.toLocaleString("en-NG", { minimumFractionDigits: 2 })}</p>
      </div>

      {/* Mobile info — name + price inline */}
      <div className="md:hidden px-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-sm font-medium text-on-surface leading-snug">{product.name}</p>
          <p className="text-sm text-on-surface-muted flex-shrink-0">₦{product.price.toLocaleString("en-NG", { minimumFractionDigits: 2 })}</p>
        </div>
        {product.color && <p className="text-[11px] uppercase tracking-[0.08rem] text-on-surface-faint mt-0.5">{product.color}</p>}
      </div>
    </Link>
  );
}
