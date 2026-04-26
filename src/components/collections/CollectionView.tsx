"use client";

import { useState, useMemo, useEffect } from "react";
import { SlidersHorizontal, ChevronDown, X } from "lucide-react";
import { FilterSidebar } from "./FilterSidebar";
import { MobileFilterDrawer } from "./MobileFilterDrawer";
import { ProductCard, type ProductCardData } from "./ProductCard";

const SORT_OPTIONS = ["Newest Arrivals", "Price: Low to High", "Price: High to Low", "Most Popular"];
const PAGE_SIZE = 8;

interface CollectionViewProps {
  title: string;
  description: string;
  breadcrumb: string;
  products: ProductCardData[];
}

export function CollectionView({ title, description, breadcrumb, products }: CollectionViewProps) {
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [priceMax, setPriceMax] = useState(0);
  const [sortBy, setSortBy] = useState("Newest Arrivals");
  const [sortOpen, setSortOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Derive filter options from actual product data — no hardcoded arrays
  const availableColors = useMemo(
    () => [...new Set(products.map((p) => p.color).filter((c): c is string => !!c))].sort(),
    [products]
  );

  const availableSizes = useMemo(
    () => [...new Set(products.flatMap((p) => p.sizes ?? []))].sort(),
    [products]
  );

  const priceCeiling = useMemo(
    () => Math.ceil(Math.max(...products.map((p) => p.price), 0) / 100) * 100,
    [products]
  );

  // Initialise price slider to actual ceiling once products load
  useEffect(() => {
    setPriceMax(priceCeiling);
  }, [priceCeiling]);

  const activeFilterCount = useMemo(
    () => selectedColors.length + selectedSizes.length + (priceMax < priceCeiling ? 1 : 0),
    [selectedColors, selectedSizes, priceMax, priceCeiling]
  );

  function toggleColor(color: string) {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
    setVisibleCount(PAGE_SIZE);
  }

  function toggleSize(size: string) {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
    setVisibleCount(PAGE_SIZE);
  }

  function handlePriceChange(val: number) {
    setPriceMax(val);
    setVisibleCount(PAGE_SIZE);
  }

  function clearAllFilters() {
    setSelectedColors([]);
    setSelectedSizes([]);
    setPriceMax(priceCeiling);
    setVisibleCount(PAGE_SIZE);
  }

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      if (p.price > priceMax) return false;
      if (selectedColors.length > 0 && (!p.color || !selectedColors.includes(p.color))) return false;
      if (selectedSizes.length > 0 && (!p.sizes?.length || !p.sizes.some((s) => selectedSizes.includes(s)))) return false;
      return true;
    });

    if (sortBy === "Price: Low to High") list = [...list].sort((a, b) => a.price - b.price);
    if (sortBy === "Price: High to Low") list = [...list].sort((a, b) => b.price - a.price);
    if (sortBy === "Most Popular") list = [...list].sort((a, b) => a.name.localeCompare(b.name));

    return list;
  }, [products, priceMax, selectedColors, selectedSizes, sortBy]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;
  const noResults = filtered.length === 0 && products.length > 0;

  return (
    <div className="bg-surface min-h-screen">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10">

        {/* Breadcrumb */}
        <nav className="hidden md:flex items-center gap-2 mb-8">
          {["Home", "Collections", breadcrumb].map((crumb, i, arr) => (
            <span key={crumb} className="flex items-center gap-2">
              <span className={`label ${i === arr.length - 1 ? "text-on-surface" : "text-on-surface-faint hover:text-primary cursor-pointer transition-colors"}`}>
                {crumb}
              </span>
              {i < arr.length - 1 && <span className="label text-on-surface-faint">/</span>}
            </span>
          ))}
        </nav>

        {/* Header */}
        <div className="mb-8 md:mb-10">
          <p className="md:hidden label text-primary mb-2">Curated Collection</p>
          <h1
            className="text-4xl md:text-5xl text-on-surface mb-3"
            style={{ fontFamily: "var(--font-serif)", letterSpacing: "-0.02em" }}
          >
            {title}
          </h1>
          <p className="text-sm text-on-surface-muted max-w-sm leading-relaxed">{description}</p>
        </div>

        {/* Desktop sort bar */}
        <div className="hidden md:flex items-center justify-between mb-6 relative">
          <p className="label text-on-surface-faint">
            {filtered.length} {filtered.length === 1 ? "style" : "styles"}
            {activeFilterCount > 0 && " · filtered"}
          </p>
          <div className="flex items-center gap-3">
            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-1 text-xs text-on-surface-muted hover:text-primary transition-colors"
              >
                <X size={11} /> Clear filters
              </button>
            )}
            <span className="label text-on-surface-faint">Sort By</span>
            <button
              onClick={() => setSortOpen((v) => !v)}
              className="flex items-center gap-2 text-sm text-on-surface border border-outline/20 px-3 py-1.5 rounded-sm hover:border-primary/40 transition-colors"
            >
              {sortBy}
              <ChevronDown size={14} className={`transition-transform ${sortOpen ? "rotate-180" : ""}`} />
            </button>
          </div>
          {sortOpen && (
            <div className="absolute top-full right-0 mt-1 bg-surface-lowest shadow-[0_4px_32px_rgba(28,27,31,0.08)] rounded-sm z-20 min-w-[180px]">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => { setSortBy(opt); setSortOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                    sortBy === opt ? "text-primary bg-primary-container/30" : "text-on-surface-muted hover:text-on-surface hover:bg-surface-low"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Mobile filter + sort bar */}
        <div className="md:hidden flex items-center justify-between mb-6">
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex items-center gap-2 text-xs text-on-surface-muted hover:text-on-surface transition-colors"
          >
            <SlidersHorizontal size={14} strokeWidth={1.5} />
            <span className="label">Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 flex items-center justify-center rounded-full bg-primary text-white text-[9px] font-medium">
                {activeFilterCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setSortOpen((v) => !v)}
            className="flex items-center gap-1.5 label text-on-surface-muted hover:text-on-surface transition-colors"
          >
            Sort By <ChevronDown size={13} />
          </button>
        </div>

        {/* Mobile sort dropdown */}
        {sortOpen && (
          <div className="md:hidden bg-surface-lowest rounded-sm mb-4 overflow-hidden shadow-[0_4px_16px_rgba(28,27,31,0.06)]">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() => { setSortBy(opt); setSortOpen(false); }}
                className={`w-full text-left px-4 py-3 text-sm border-b border-outline/10 last:border-0 ${
                  sortBy === opt ? "text-primary" : "text-on-surface-muted"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {/* Desktop: sidebar + grid */}
        <div className="hidden md:flex gap-10 lg:gap-14">
          <FilterSidebar
            colors={availableColors}
            selectedColors={selectedColors}
            onColorChange={toggleColor}
            sizes={availableSizes}
            selectedSizes={selectedSizes}
            onSizeChange={toggleSize}
            priceMax={priceMax}
            onPriceChange={handlePriceChange}
            priceFloor={0}
            priceCeiling={priceCeiling}
          />

          <div className="flex-1">
            {noResults ? (
              <NoResultsState onClear={clearAllFilters} />
            ) : (
              <>
                <div className="grid grid-cols-4 gap-5">
                  {visible.map((p) => <ProductCard key={p.id} product={p} />)}
                </div>
                {hasMore && (
                  <div className="flex justify-center mt-14">
                    <button
                      onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                      className="btn-ghost px-12"
                    >
                      Discover More
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Mobile: single-column */}
        <div className="md:hidden flex flex-col gap-0">
          {noResults ? (
            <NoResultsState onClear={clearAllFilters} />
          ) : (
            <>
              {visible.map((p) => (
                <div key={p.id} className="bg-surface-low mb-3 rounded-sm overflow-hidden">
                  <ProductCard product={p} />
                </div>
              ))}

              <p className="label text-on-surface-faint text-center mt-6 mb-4">
                Viewing {visible.length} of {filtered.length} {filtered.length === 1 ? "style" : "styles"}
              </p>

              {hasMore && (
                <button
                  onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                  className="btn-primary w-full flex items-center justify-center"
                >
                  Explore More
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <MobileFilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        colors={availableColors}
        selectedColors={selectedColors}
        onColorChange={toggleColor}
        sizes={availableSizes}
        selectedSizes={selectedSizes}
        onSizeChange={toggleSize}
        priceMax={priceMax}
        onPriceChange={handlePriceChange}
        priceFloor={0}
        priceCeiling={priceCeiling}
        onClearAll={clearAllFilters}
        activeFilterCount={activeFilterCount}
      />
    </div>
  );
}

function NoResultsState({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex flex-col items-center text-center py-20 px-4">
      <div className="w-12 h-12 rounded-sm bg-surface-low flex items-center justify-center mb-4">
        <SlidersHorizontal size={18} strokeWidth={1.5} className="text-on-surface-faint" />
      </div>
      <p
        className="text-xl text-on-surface mb-1"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        No styles match
      </p>
      <p className="text-xs text-on-surface-faint mb-5 max-w-[220px] leading-relaxed">
        Try adjusting your filters to see more pieces.
      </p>
      <button onClick={onClear} className="btn-ghost text-xs h-9 px-6 flex items-center gap-1.5">
        <X size={11} /> Clear all filters
      </button>
    </div>
  );
}
