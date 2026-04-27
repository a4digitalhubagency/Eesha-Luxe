"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Truck, Leaf } from "lucide-react";
import { ProductGallery } from "./ProductGallery";
import { SizeSelector } from "./SizeSelector";
import { QuantitySelector } from "./QuantitySelector";
import { AccordionItem } from "./AccordionItem";
import { MobileStickyBar } from "./MobileStickyBar";
import { useCartStore } from "@/store/cart";

interface ProductData {
  id: string;
  name: string;
  price: number;
  collection: string;
  category: string;
  description: string;
  composition?: string | null;
  images: { src: string; alt: string }[];
  sizes: { label: string; available: boolean }[];
  badges: { icon: "truck" | "leaf"; text: string }[];
  slug: string;
}

const BADGE_ICONS = {
  truck: Truck,
  leaf: Leaf,
};

export function ProductDetail({ product }: { product: ProductData }) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  function handleAddToBag() {
    if (!selectedSize) return;
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image: product.images[0].src,
      slug: product.slug,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  }

  return (
    <>
      {/* Desktop: 2-col | Mobile: stacked */}
      <div className="max-w-7xl mx-auto px-0 md:px-6 lg:px-10 py-0 md:py-10">
        <div className="md:grid md:grid-cols-[55fr_45fr] md:gap-12 lg:gap-16">

          {/* Gallery */}
          <ProductGallery images={product.images} />

          {/* Info panel */}
          <div className="px-5 pt-8 pb-28 md:px-0 md:pt-0 md:pb-0 md:sticky md:top-20 md:self-start">
            {/* Breadcrumb */}
            <nav className="hidden md:flex items-center gap-2 mb-6">
              <Link href="/atelier" className="label text-on-surface-faint hover:text-primary transition-colors">
                {product.collection}
              </Link>
              <span className="label text-on-surface-faint">/</span>
              <span className="label text-on-surface-faint">{product.category}</span>
            </nav>

            {/* Mobile label */}
            <p className="md:hidden label text-primary mb-2">New Collection</p>

            {/* Name */}
            <h1
              className="text-3xl md:text-4xl text-on-surface leading-tight mb-3"
              style={{ fontFamily: "var(--font-serif)", letterSpacing: "-0.02em" }}
            >
              {product.name}
            </h1>

            {/* Price */}
            <p className="text-base font-medium text-on-surface mb-6">
              ₦{product.price.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
            </p>

            {/* Description */}
            <p className="text-sm text-on-surface-muted leading-relaxed mb-8">
              {product.description}
            </p>

            {/* Size selector */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="label text-on-surface">Select Size (FR)</span>
                <button className="label text-primary hover:underline underline-offset-2 transition-colors">
                  Size Guide
                </button>
              </div>
              <SizeSelector
                sizes={product.sizes}
                selected={selectedSize}
                onChange={setSelectedSize}
              />
            </div>

            {/* Quantity */}
            <div className="mb-8">
              <span className="label text-on-surface block mb-3">Quantity</span>
              <QuantitySelector value={quantity} onChange={setQuantity} />
            </div>

            {/* Badges (mobile) */}
            {product.badges.length > 0 && (
              <div className="md:hidden flex flex-col gap-2 mb-8">
                {product.badges.map((badge) => {
                  const Icon = BADGE_ICONS[badge.icon];
                  return (
                    <div key={badge.text} className="flex items-center gap-2 text-xs text-on-surface-muted">
                      <Icon size={13} strokeWidth={1.5} className="text-primary flex-shrink-0" />
                      <span className="uppercase tracking-wide text-[11px]">{badge.text}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Desktop CTAs */}
            <div className="hidden md:flex flex-col gap-3 mb-8">
              <button
                onClick={handleAddToBag}
                disabled={!selectedSize || added}
                className="w-full h-12 btn-primary flex items-center justify-center disabled:opacity-40 transition-all"
              >
                {added ? "Added to Bag ✓" : selectedSize ? "Add to Bag" : "Select a Size"}
              </button>
              <button className="btn-ghost w-full h-11 flex items-center justify-center gap-2">
                <Heart size={14} strokeWidth={1.5} />
                Add to Wishlist
              </button>
            </div>

            {/* Desktop badges */}
            {product.badges.length > 0 && (
              <div className="hidden md:flex flex-col gap-2 mb-8">
                {product.badges.map((badge) => {
                  const Icon = BADGE_ICONS[badge.icon];
                  return (
                    <div key={badge.text} className="flex items-center gap-2">
                      <Icon size={13} strokeWidth={1.5} className="text-primary flex-shrink-0" />
                      <span className="text-[11px] uppercase tracking-[0.08rem] text-on-surface-muted">
                        {badge.text}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Accordions */}
            <div>
              <AccordionItem title="Composition & Care">
                <p>{product.composition ?? "Dry clean only. Store in the provided dust bag away from direct light. Do not wring or tumble dry."}</p>
              </AccordionItem>
              <AccordionItem title="Shipping & Returns">
                <p>Complimentary express shipping on all orders. Returns accepted within 14 days of delivery in original condition with tags attached. Final sale items are excluded.</p>
              </AccordionItem>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky bar */}
      <MobileStickyBar onAddToBag={handleAddToBag} disabled={!selectedSize} added={added} />
    </>
  );
}
