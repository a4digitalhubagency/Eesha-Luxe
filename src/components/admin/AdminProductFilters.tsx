"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

interface Category { name: string; slug: string; }

interface Props {
  defaultSearch: string;
  defaultCategory: string;
  defaultStock: string;
  categories: Category[];
}

export function AdminProductFilters({ defaultSearch, defaultCategory, defaultStock, categories }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState(defaultSearch);
  const [category, setCategory] = useState(defaultCategory);
  const [stock, setStock] = useState(defaultStock);

  function apply(overrides: Partial<{ search: string; category: string; stock: string }>) {
    const params = new URLSearchParams();
    const s = overrides.search ?? search;
    const c = overrides.category ?? category;
    const st = overrides.stock ?? stock;
    if (s) params.set("search", s);
    if (c) params.set("category", c);
    if (st) params.set("stock", st);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex gap-3 flex-wrap">
      {/* Search */}
      <form
        onSubmit={(e) => { e.preventDefault(); apply({}); }}
        className="relative flex-1 min-w-52"
      >
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-faint" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, SKU, or category…"
          className="w-full bg-surface-lowest border border-outline/15 rounded-sm pl-9 pr-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-faint outline-none focus:border-primary transition-colors"
        />
      </form>

      {/* Category filter */}
      <select
        value={category}
        onChange={(e) => { setCategory(e.target.value); apply({ category: e.target.value }); }}
        className="bg-surface-lowest border border-outline/15 rounded-sm px-3 py-2.5 text-sm text-on-surface outline-none focus:border-primary transition-colors appearance-none pr-8"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%239c9189'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center" }}
      >
        <option value="">Category</option>
        {categories.map((c) => (
          <option key={c.slug} value={c.slug}>{c.name}</option>
        ))}
      </select>

      {/* Stock filter */}
      <select
        value={stock}
        onChange={(e) => { setStock(e.target.value); apply({ stock: e.target.value }); }}
        className="bg-surface-lowest border border-outline/15 rounded-sm px-3 py-2.5 text-sm text-on-surface outline-none focus:border-primary transition-colors appearance-none pr-8"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%239c9189'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center" }}
      >
        <option value="">Stock Status</option>
        <option value="in">In Stock</option>
        <option value="low">Low Stock</option>
        <option value="out">Out of Stock</option>
      </select>
    </div>
  );
}
