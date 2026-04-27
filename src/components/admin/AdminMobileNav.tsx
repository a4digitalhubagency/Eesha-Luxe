"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TrendingUp, Package, ShoppingBag, Users } from "lucide-react";

const NAV = [
  { label: "Analytics",  href: "/admin",           icon: TrendingUp },
  { label: "Inventory",  href: "/admin/products",  icon: Package },
  { label: "Orders",     href: "/admin/orders",    icon: ShoppingBag },
  { label: "Customers",  href: "/admin/customers", icon: Users },
];

export function AdminMobileNav() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-lowest border-t border-outline/10 flex">
      {NAV.map(({ label, href, icon: Icon }) => {
        const active = isActive(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-colors ${
              active ? "text-primary" : "text-on-surface-faint"
            }`}
          >
            <div className={`p-1.5 rounded-lg transition-colors ${active ? "bg-primary-container" : ""}`}>
              <Icon size={18} strokeWidth={active ? 2 : 1.5} />
            </div>
            <span className={`text-[9px] uppercase tracking-widest ${active ? "text-primary" : "text-on-surface-faint"}`}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
