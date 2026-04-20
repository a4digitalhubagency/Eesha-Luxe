import Image from "next/image";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative w-full h-[78vh] min-h-[520px] overflow-hidden">
      <Image
        src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1600&q=85"
        alt="The Modern Muse"
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

      <div className="absolute bottom-12 left-8 md:left-14">
        <h1
          className="text-5xl md:text-7xl text-white leading-[1.05] mb-6"
          style={{ fontFamily: "var(--font-serif)", letterSpacing: "-0.02em" }}
        >
          The Modern<br />Muse
        </h1>
        <Link href="/collections" className="btn-primary inline-flex items-center gap-2">
          Shop the Collection
          <span className="text-sm leading-none">→</span>
        </Link>
      </div>
    </section>
  );
}
