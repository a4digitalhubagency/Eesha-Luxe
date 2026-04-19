"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, User, Search, Menu, X } from "lucide-react";
import { useState } from "react";
import { useCartStore } from "@/store/cart";

const NAV_LINKS = [
  { label: "Shop", href: "/products" },
  { label: "Collections", href: "/collections" },
  { label: "About", href: "/about" },
];

export function Navbar() {
  const pathname = usePathname();
  const itemCount = useCartStore((s) => s.itemCount);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-charcoal-100">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="font-serif text-xl tracking-widest uppercase text-charcoal-900">
          Eesha Luxe
        </Link>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`text-xs tracking-widest uppercase transition-colors duration-200 ${
                  pathname.startsWith(link.href)
                    ? "text-gold-600 border-b border-gold-600 pb-0.5"
                    : "text-charcoal-600 hover:text-charcoal-900"
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button aria-label="Search" className="text-charcoal-600 hover:text-charcoal-900 transition-colors">
            <Search size={18} />
          </button>
          <Link href="/account" aria-label="Account" className="text-charcoal-600 hover:text-charcoal-900 transition-colors">
            <User size={18} />
          </Link>
          <Link href="/cart" aria-label="Cart" className="relative text-charcoal-600 hover:text-charcoal-900 transition-colors">
            <ShoppingBag size={18} />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-gold-600 text-white text-[10px] flex items-center justify-center font-medium">
                {itemCount > 9 ? "9+" : itemCount}
              </span>
            )}
          </Link>
          {/* Mobile menu toggle */}
          <button
            className="md:hidden text-charcoal-600"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-charcoal-100 px-6 py-4">
          <ul className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm tracking-widest uppercase text-charcoal-700 hover:text-gold-600 transition-colors"
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
