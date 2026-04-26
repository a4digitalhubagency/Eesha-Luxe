import Image from "next/image";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
}

export function CuratedEssentials({ categories }: { categories: Category[] }) {
  const [first, ...rest] = categories;

  if (!first) return null;

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
          <Link href={`/collections/${first.slug}`} className="relative overflow-hidden group rounded-[4px]">
            <div className="relative w-full aspect-[3/4] bg-surface-low">
              {first.imageUrl && (
                <Image
                  src={first.imageUrl}
                  alt={first.name}
                  fill
                  className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.02]"
                  sizes="(max-width: 768px) 50vw, 600px"
                />
              )}
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/40 to-transparent">
                <span className="text-white text-xl" style={{ fontFamily: "var(--font-serif)" }}>
                  {first.name}
                </span>
              </div>
            </div>
          </Link>

          {/* Right — stacked */}
          <div className="flex flex-col gap-3">
            {rest.slice(0, 2).map((cat) => (
              <Link key={cat.id} href={`/collections/${cat.slug}`} className="overflow-hidden group rounded-[4px]">
                <div className="relative w-full aspect-[3/2] bg-surface-low">
                  {cat.imageUrl && (
                    <Image
                      src={cat.imageUrl}
                      alt={cat.name}
                      fill
                      className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.02]"
                      sizes="(max-width: 768px) 50vw, 300px"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/35 to-transparent">
                    <span className="text-white text-base" style={{ fontFamily: "var(--font-serif)" }}>
                      {cat.name}
                    </span>
                  </div>
                </div>
              </Link>
            ))}

            {/* Filler if fewer than 2 right categories */}
            {rest.length === 0 && (
              <Link href="/collections" className="overflow-hidden group rounded-[4px]">
                <div className="relative w-full aspect-[3/2] bg-surface-low flex items-center justify-center">
                  <span className="label text-on-surface-faint">More Collections</span>
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
