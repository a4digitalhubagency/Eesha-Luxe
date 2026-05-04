import Link from "next/link";

const LINKS = {
  "Customer Care": [
    { label: "FAQ", href: "/faq" },
    { label: "Contact", href: "/contact" },
    { label: "Track Order", href: "/account/orders" },
  ],
  "The Brand": [
    { label: "About", href: "/about" },
    { label: "Collections", href: "/collections" },
  ],
  "Legal": [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms & Conditions", href: "/terms" },
  ],
};

const SOCIAL = [
  { label: "Instagram", href: "https://instagram.com" },
  { label: "Pinterest", href: "https://pinterest.com" },
];

export function Footer() {
  return (
    <footer className="bg-on-surface text-on-surface-faint">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 grid grid-cols-2 md:grid-cols-5 gap-10">
        <div className="col-span-2">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-surface-lowest mb-4">
            Eesha Luxe
          </p>
          <p className="text-xs leading-relaxed text-on-surface-faint/70 max-w-xs">
            Curated luxury goods for the modern connoisseur — a digital atelier of considered pieces.
          </p>
          <div className="flex items-center gap-4 mt-6">
            {SOCIAL.map((s) => (
              <a
                key={s.href}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-on-surface-faint/60 hover:text-primary-container transition-colors"
              >
                {s.label}
              </a>
            ))}
          </div>
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