import Link from "next/link";
import { Lock } from "lucide-react";

export function CheckoutHeader() {
  return (
    <header className="bg-surface-lowest border-b border-outline/10">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-14 flex items-center justify-between">
        <Link href="/" className="text-xs font-semibold tracking-[0.25em] uppercase text-on-surface">
          Eesha Luxe
        </Link>
        <span className="flex items-center gap-1.5 label text-on-surface-faint">
          <Lock size={11} /> Secure Checkout
        </span>
      </div>
    </header>
  );
}
