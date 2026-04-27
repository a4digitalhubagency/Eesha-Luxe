import Image from "next/image";
import Link from "next/link";

interface Product {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
}

export function BestSellers({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

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
                  <div className="absolute inset-0 bg-primary-container/0 group-hover:bg-primary-container/20 transition-colors duration-500" />
                </div>
                <div className="p-4">
                  <p className="label mb-1">{item.name}</p>
                  <p className="text-xs text-on-surface-muted">₦{item.price.toLocaleString("en-NG", { minimumFractionDigits: 2 })}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
