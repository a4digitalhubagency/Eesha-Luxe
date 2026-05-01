"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingBag, User, Search, Menu, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useCartStore, selectItemCount } from "@/store/cart";

const NAV_LINKS = [
  { label: "Collections", href: "/collections" },
  { label: "Atelier", href: "/atelier" },
  { label: "Archive", href: "/archive" },
  { label: "Editorial", href: "/editorial" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const itemCount = useCartStore(selectItemCount);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = searchValue.trim();
    if (!q) return;
    setSearchOpen(false);
    setSearchValue("");
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <header className="sticky top-0 z-50 glass">
      <nav className="max-w-7xl mx-auto px-6 lg:px-10 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="text-xs font-semibold tracking-[0.25em] uppercase text-on-surface"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          Eesha Luxe
        </Link>

        <ul className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`label transition-colors duration-200 ${
                  pathname.startsWith(link.href)
                    ? "text-primary border-b border-primary pb-px"
                    : "text-on-surface-muted hover:text-on-surface"
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-4">
          <button
            aria-label="Search"
            onClick={() => setSearchOpen((v) => !v)}
            className="text-on-surface-muted hover:text-primary transition-colors"
          >
            <Search size={16} strokeWidth={1.5} />
          </button>
          <Link href="/account" aria-label="Account" className="text-on-surface-muted hover:text-primary transition-colors">
            <User size={16} strokeWidth={1.5} />
          </Link>
          <Link href="/cart" aria-label="Cart" className="relative text-on-surface-muted hover:text-primary transition-colors">
            <ShoppingBag size={16} strokeWidth={1.5} />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-sm bg-primary text-white text-[9px] flex items-center justify-center">
                {itemCount > 9 ? "9+" : itemCount}
              </span>
            )}
          </Link>
          <button
            className="md:hidden text-on-surface-muted"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* Search bar — slides down below the nav */}
      {searchOpen && (
        <div className="border-t border-outline/10 glass px-6 lg:px-10 py-4">
          <form onSubmit={handleSearchSubmit} className="max-w-7xl mx-auto flex items-center gap-3">
            <Search size={16} strokeWidth={1.5} className="text-on-surface-faint shrink-0" />
            <input
              ref={searchRef}
              type="search"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search products…"
              className="flex-1 bg-transparent outline-none text-sm text-on-surface placeholder:text-on-surface-faint"
            />
            <button
              type="button"
              onClick={() => { setSearchOpen(false); setSearchValue(""); }}
              className="text-on-surface-faint hover:text-on-surface transition-colors"
              aria-label="Close search"
            >
              <X size={16} strokeWidth={1.5} />
            </button>
          </form>
        </div>
      )}

      {mobileOpen && (
        <div className="md:hidden glass px-6 py-6">
          <ul className="flex flex-col gap-6">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="label text-on-surface-muted hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
