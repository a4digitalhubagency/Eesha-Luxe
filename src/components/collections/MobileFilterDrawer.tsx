"use client";

import { X, Check } from "lucide-react";

interface MobileFilterDrawerProps {
  open: boolean;
  onClose: () => void;
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
  onClearAll: () => void;
  activeFilterCount: number;
}

export function MobileFilterDrawer({
  open,
  onClose,
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
  onClearAll,
  activeFilterCount,
}: MobileFilterDrawerProps) {
  const pct = priceCeiling > priceFloor
    ? ((priceMax - priceFloor) / (priceCeiling - priceFloor)) * 100
    : 100;

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-on-surface/20 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full z-50 w-[90%] glass shadow-[0_0_32px_rgba(28,27,31,0.04)] transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 pt-10 pb-6 border-b border-outline/10">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-on-surface">Filters</p>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 flex items-center justify-center rounded-full bg-primary text-white text-[10px] font-medium">
                {activeFilterCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            {activeFilterCount > 0 && (
              <button
                onClick={onClearAll}
                className="text-xs text-primary hover:underline underline-offset-2 transition-colors"
              >
                Clear all
              </button>
            )}
            <button onClick={onClose} className="text-on-surface-muted hover:text-on-surface transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="px-6 overflow-y-auto h-[calc(100%-140px)] pb-6">

          {/* Colour */}
          {colors.length > 0 && (
            <div className="py-6 border-b border-outline/10">
              <p className="text-xs font-semibold text-on-surface mb-4 uppercase tracking-wider">Colour</p>
              <ul className="flex flex-col gap-4">
                {colors.map((color) => {
                  const checked = selectedColors.includes(color);
                  return (
                    <li key={color}>
                      <button onClick={() => onColorChange(color)} className="flex items-center gap-3">
                        <span className={`w-4 h-4 flex items-center justify-center shrink-0 border transition-all ${
                          checked ? "bg-secondary border-secondary" : "bg-surface-lowest border-outline/25"
                        }`}>
                          {checked && <Check size={10} strokeWidth={2.5} className="text-white" />}
                        </span>
                        <span className="text-sm text-on-surface-muted">{color}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Sizes */}
          {sizes.length > 0 && (
            <div className="py-6 border-b border-outline/10">
              <p className="text-xs font-semibold text-on-surface mb-4 uppercase tracking-wider">Size</p>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => {
                  const active = selectedSizes.includes(size);
                  return (
                    <button
                      key={size}
                      onClick={() => onSizeChange(size)}
                      className={`min-w-11 px-3 py-2 text-xs rounded-sm transition-all ${
                        active
                          ? "bg-primary-container text-primary"
                          : "bg-surface-lowest border border-outline/20 text-on-surface-muted"
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
          <div className="py-6">
            <p className="text-xs font-semibold text-on-surface mb-4 uppercase tracking-wider">Price Range</p>
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
              <span className="text-xs text-on-surface-faint">₦{priceFloor.toLocaleString("en-NG")}</span>
              <span className="text-xs text-on-surface-faint">₦{priceMax.toLocaleString("en-NG")}</span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 glass border-t border-outline/10">
          <button onClick={onClose} className="btn-primary w-full flex items-center justify-center">
            {activeFilterCount > 0 ? `Show Results` : "Apply Filters"}
          </button>
        </div>
      </div>
    </>
  );
}
