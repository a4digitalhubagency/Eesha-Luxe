import Link from "next/link";

const LINKS = {
  Shop: [
    { label: "All Products", href: "/products" },
    { label: "New Arrivals", href: "/products?sort=newest" },
    { label: "Sale", href: "/products?sale=true" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Press", href: "/press" },
  ],
  Support: [
    { label: "FAQ", href: "/faq" },
    { label: "Returns", href: "/returns" },
    { label: "Shipping", href: "/shipping" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-charcoal-900 text-charcoal-300 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-2 md:grid-cols-4 gap-10">
        <div>
          <p className="font-serif text-lg text-white tracking-widest uppercase mb-4">Eesha Luxe</p>
          <p className="text-sm leading-relaxed text-charcoal-400">
            Curated luxury goods for the modern connoisseur.
          </p>
        </div>
        {Object.entries(LINKS).map(([section, links]) => (
          <div key={section}>
            <p className="text-xs tracking-widest uppercase text-charcoal-200 mb-4">{section}</p>
            <ul className="flex flex-col gap-2">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-charcoal-400 hover:text-gold-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-charcoal-800 px-4 py-5 text-center text-xs text-charcoal-500">
        © {new Date().getFullYear()} Eesha Luxe. All rights reserved.
      </div>
    </footer>
  );
}
