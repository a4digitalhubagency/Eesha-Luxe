import Link from "next/link";

export default function NotFound() {
  return (
    <div className="bg-surface min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <p className="text-[10px] uppercase tracking-widest text-on-surface-faint mb-3">404</p>
        <h1
          className="text-5xl text-on-surface mb-4"
          style={{ fontFamily: "var(--font-serif)", letterSpacing: "-0.02em" }}
        >
          Not found.
        </h1>
        <p className="text-sm text-on-surface-muted leading-relaxed mb-8">
          The page you are looking for has moved, been removed, or never existed in the atelier.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/" className="btn-primary h-10 px-6 text-sm">
            Go Home
          </Link>
          <Link href="/collections" className="btn-ghost h-10 px-6 text-sm">
            Browse Collections
          </Link>
        </div>
      </div>
    </div>
  );
}
