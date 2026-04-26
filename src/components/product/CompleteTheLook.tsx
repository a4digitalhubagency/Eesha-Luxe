import Image from "next/image";
import Link from "next/link";

interface Product {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
}

export function CompleteTheLook({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  return (
    <section className="bg-surface py-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex items-baseline justify-between mb-8">
          <h3
            className="text-2xl md:text-3xl text-on-surface"
            style={{ fontFamily: "var(--font-serif)", letterSpacing: "-0.02em" }}
          >
            Complete the Look
          </h3>
          <Link href="/collections" className="label text-on-surface-muted hover:text-primary transition-colors">
            View All
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((item) => (
            <Link key={item.id} href={`/products/${item.slug}`} className="group">
              <div className="bg-surface-lowest rounded-sm overflow-hidden">
                <div className="relative w-full aspect-square overflow-hidden">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.02]"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-surface-low" />
                  )}
                  <div className="absolute inset-0 bg-primary-container/0 group-hover:bg-primary-container/15 transition-colors duration-500" />
                </div>
                <div className="p-3 pb-4">
                  <p className="label mb-1">{item.name}</p>
                  <p className="text-xs text-on-surface-muted">${item.price.toLocaleString()}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
