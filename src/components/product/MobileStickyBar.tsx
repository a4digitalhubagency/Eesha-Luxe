"use client";

import { Heart } from "lucide-react";
import { useState } from "react";

interface MobileStickyBarProps {
  onAddToBag: () => void;
  disabled?: boolean;
  added?: boolean;
  outOfStock?: boolean;
}

export function MobileStickyBar({ onAddToBag, disabled = false, added = false, outOfStock = false }: MobileStickyBarProps) {
  const [wishlisted, setWishlisted] = useState(false);

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-outline/10 px-4 py-3 flex items-center gap-3">
      <button
        onClick={() => setWishlisted((v) => !v)}
        aria-label="Add to wishlist"
        className="w-11 h-11 flex items-center justify-center rounded-[4px] border border-outline/20 text-on-surface-muted hover:text-primary transition-colors flex-shrink-0"
      >
        <Heart
          size={18}
          strokeWidth={1.5}
          className={wishlisted ? "fill-primary text-primary" : ""}
        />
      </button>
      <button
        onClick={onAddToBag}
        disabled={disabled || added || outOfStock}
        className="flex-1 h-11 btn-primary flex items-center justify-center disabled:opacity-40"
      >
        {outOfStock ? "Sold Out" : added ? "Added to Bag ✓" : disabled ? "Select a Size" : "Add to Bag"}
      </button>
    </div>
  );
}
