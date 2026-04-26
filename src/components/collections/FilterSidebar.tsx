"use client";

import { Check } from "lucide-react";

interface FilterSidebarProps {
  colors: string[];
  selectedColors: string[];
  onColorChange: (color: string) => void;
  sizes: string[];
  selectedSizes: string[];
  onSizeChange: (size: string) => void;
  priceMax: number;
  onPriceChange: (val: number) => void;
  priceFloor: number;
  priceCeiling: number;
}

export function FilterSidebar({
  colors,
  selectedColors,
  onColorChange,
  sizes,
  selectedSizes,
  onSizeChange,
  priceMax,
  onPriceChange,
  priceFloor,
  priceCeiling,
}: FilterSidebarProps) {
  const pct = priceCeiling > priceFloor
    ? ((priceMax - priceFloor) / (priceCeiling - priceFloor)) * 100
    : 100;

  return (
    <aside className="w-52 shrink-0">

      {/* Color */}
      {colors.length > 0 && (
        <div className="mb-8">
          <p className="text-sm font-semibold text-on-surface mb-4">Colour</p>
          <ul className="flex flex-col gap-3">
            {colors.map((color) => {
              const checked = selectedColors.includes(color);
              return (
                <li key={color}>
                  <button
                    onClick={() => onColorChange(color)}
                    className="flex items-center gap-2.5 group"
                  >
                    <span
                      className={`w-4 h-4 flex items-center justify-center shrink-0 border transition-all duration-150 ${
                        checked
                          ? "bg-secondary border-secondary"
                          : "bg-surface-lowest border-outline/25 group-hover:border-primary/50"
                      }`}
                    >
                      {checked && <Check size={10} strokeWidth={2.5} className="text-white" />}
                    </span>
                    <span className="text-sm text-on-surface-muted group-hover:text-on-surface transition-colors">
                      {color}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Sizes */}
      {sizes.length > 0 && (
        <div className="mb-8">
          <p className="text-sm font-semibold text-on-surface mb-4">Size</p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              const active = selectedSizes.includes(size);
              return (
                <button
                  key={size}
                  onClick={() => onSizeChange(size)}
                  className={`min-w-11 px-2.5 py-1.5 text-xs rounded-sm transition-all duration-150 ${
                    active
                      ? "bg-primary-container text-primary"
                      : "bg-surface-lowest border border-outline/20 text-on-surface-muted hover:border-primary/40"
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Price Range */}
      <div>
        <p className="text-sm font-semibold text-on-surface mb-4">Price Range</p>
        <input
          type="range"
          min={priceFloor}
          max={priceCeiling}
          value={priceMax}
          onChange={(e) => onPriceChange(Number(e.target.value))}
          className="w-full h-0.5 appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${pct}%, rgba(112,88,98,0.2) ${pct}%, rgba(112,88,98,0.2) 100%)`,
          }}
        />
        <div className="flex justify-between mt-2">
          <span className="text-xs text-on-surface-faint">${priceFloor}</span>
          <span className="text-xs text-on-surface-faint">${priceMax.toLocaleString()}</span>
        </div>
      </div>
    </aside>
  );
}
