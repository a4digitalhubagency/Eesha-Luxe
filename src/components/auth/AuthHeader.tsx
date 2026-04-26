import Link from "next/link";

export function AuthHeader() {
  return (
    <header className="flex items-center justify-center h-14">
      <Link
        href="/"
        className="text-xs font-semibold tracking-[0.25em] uppercase text-on-surface"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        Eesha Luxe
      </Link>
    </header>
  );
}
