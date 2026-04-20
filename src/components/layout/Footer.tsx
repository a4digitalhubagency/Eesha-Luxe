import Link from "next/link";

const LINKS = {
  "Customer Care": [
    { label: "Shipping", href: "/shipping" },
    { label: "Returns", href: "/returns" },
    { label: "Sizing", href: "/sizing" },
    { label: "Track Order", href: "/track" },
  ],
  "The Brand": [
    { label: "Sustainability", href: "/sustainability" },
    { label: "Privacy", href: "/privacy" },
    { label: "Contact", href: "/contact" },
  ],
  "Follow Us": [
    { label: "Instagram", href: "https://instagram.com" },
    { label: "Pinterest", href: "https://pinterest.com" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-on-surface text-on-surface-faint">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 grid grid-cols-2 md:grid-cols-4 gap-10">
        <div>
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-surface-lowest mb-4">
            Eesha Luxe
          </p>
          <p className="text-xs leading-relaxed text-on-surface-faint/70">
            Curated luxury goods for the modern connoisseur.
          </p>
          <p className="text-xs leading-relaxed text-on-surface-faint/50 mt-1">
            Atelier · Editorial
          </p>
        </div>
        {Object.entries(LINKS).map(([section, links]) => (
          <div key={section}>
            <p className="label text-surface-low/60 mb-5">{section}</p>
            <ul className="flex flex-col gap-3">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs text-on-surface-faint/60 hover:text-primary-container transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="px-6 py-5 text-center text-[10px] tracking-widest uppercase text-on-surface-faint/30">
        © {new Date().getFullYear()} Eesha Luxe. All rights reserved.
      </div>
    </footer>
  );
}
