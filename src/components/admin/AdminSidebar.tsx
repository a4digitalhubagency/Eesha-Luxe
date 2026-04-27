"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingBag, Users, BarChart2, ExternalLink } from "lucide-react";

const NAV = [
  { label: "Dashboard",  href: "/admin",           icon: LayoutDashboard },
  { label: "Products",   href: "/admin/products",  icon: Package },
  { label: "Orders",     href: "/admin/orders",    icon: ShoppingBag },
  { label: "Customers",  href: "/admin/customers", icon: Users },
  { label: "Analytics",  href: "/admin/analytics", icon: BarChart2 },
];

export function AdminSidebar() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  return (
    <aside className="w-[200px] shrink-0 border-r border-outline/10 bg-surface-lowest flex flex-col min-h-[calc(100vh-64px)] sticky top-16">
      {/* Brand */}
      <div className="px-6 py-6 border-b border-outline/10">
        <p className="text-base text-on-surface" style={{ fontFamily: "var(--font-serif)" }}>The Atelier</p>
        <p className="text-[9px] uppercase tracking-[0.18em] text-on-surface-faint mt-0.5">Admin Console</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        {NAV.map(({ label, href, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-6 py-3 text-sm transition-colors relative ${
                active
                  ? "text-on-surface bg-surface"
                  : "text-on-surface-faint hover:text-on-surface hover:bg-surface/50"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-2 bottom-2 w-[3px] bg-primary rounded-r-full" />
              )}
              <Icon size={15} strokeWidth={active ? 2 : 1.5} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* View storefront */}
      <div className="px-6 py-5 border-t border-outline/10">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-on-surface-faint hover:text-primary transition-colors"
        >
          <ExternalLink size={11} />
          View Storefront
        </Link>
      </div>
    </aside>
  );
}
