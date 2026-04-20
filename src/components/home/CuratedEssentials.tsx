import Image from "next/image";
import Link from "next/link";

const CATEGORIES = [
  {
    label: "Clothing",
    href: "/collections/clothing",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80",
  },
  {
    label: "Handbags",
    href: "/collections/handbags",
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80",
  },
  {
    label: "Accessories",
    href: "/collections/accessories",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=600&q=80",
  },
];

export function CuratedEssentials() {
  const [clothing, ...right] = CATEGORIES;

  return (
    <section className="bg-surface py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <p className="label mb-3">Discovery</p>
        <h2
          className="text-4xl md:text-5xl text-on-surface mb-10"
          style={{ fontFamily: "var(--font-serif)", letterSpacing: "-0.02em" }}
        >
          Curated Essentials
        </h2>

        <div className="grid grid-cols-2 gap-3">
          {/* Left — tall */}
          <Link href={clothing.href} className="relative overflow-hidden group rounded-[4px]">
            <div className="relative w-full aspect-[3/4] bg-surface-low">
              <Image
                src={clothing.image}
                alt={clothing.label}
                fill
                className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.02]"
                sizes="(max-width: 768px) 50vw, 600px"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/40 to-transparent">
                <span
                  className="text-white text-xl"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  {clothing.label}
                </span>
              </div>
            </div>
          </Link>

          {/* Right — two stacked */}
          <div className="flex flex-col gap-3">
            {right.map((cat) => (
              <Link key={cat.label} href={cat.href} className="overflow-hidden group rounded-[4px]">
                <div className="relative w-full aspect-[3/2] bg-surface-low">
                  <Image
                    src={cat.image}
                    alt={cat.label}
                    fill
                    className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.02]"
                    sizes="(max-width: 768px) 50vw, 300px"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/35 to-transparent">
                    <span
                      className="text-white text-base"
                      style={{ fontFamily: "var(--font-serif)" }}
                    >
                      {cat.label}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
