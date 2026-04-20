import Image from "next/image";
import Link from "next/link";

const ITEMS = [
  {
    id: "1",
    name: "Aura Heel",
    price: 440,
    slug: "aura-heel",
    image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "2",
    name: "Eclipse Hoops",
    price: 60,
    slug: "eclipse-hoops",
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "3",
    name: "Tapered Waist Belt",
    price: 70,
    slug: "tapered-waist-belt",
    image: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "4",
    name: "Atelier N°5 Fragrance",
    price: 90,
    slug: "atelier-no5-fragrance",
    image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=500&q=80",
  },
];

export function BestSellers() {
  return (
    <section className="bg-surface py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="text-center mb-12">
          <p className="label mb-3">Iconic Pieces</p>
          <h2
            className="text-4xl md:text-5xl text-on-surface"
            style={{ fontFamily: "var(--font-serif)", letterSpacing: "-0.02em" }}
          >
            The Best Sellers
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {ITEMS.map((item) => (
            <Link key={item.id} href={`/products/${item.slug}`} className="group">
              <div className="bg-surface-lowest rounded-[4px] overflow-hidden">
                <div className="relative w-full aspect-square overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.02]"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-primary-container/0 group-hover:bg-primary-container/20 transition-colors duration-500" />
                </div>
                <div className="p-4">
                  <p className="label mb-1">{item.name}</p>
                  <p className="text-xs text-on-surface-muted">${item.price}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
