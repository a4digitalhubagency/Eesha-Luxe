export default function HomePage() {
  return (
    <section className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <p className="text-sm tracking-[0.3em] uppercase text-gold-600 mb-4">
        New Collection
      </p>
      <h1 className="text-5xl md:text-7xl font-serif text-charcoal-900 leading-tight mb-6">
        Refined Elegance,<br />Delivered.
      </h1>
      <p className="text-charcoal-500 max-w-md text-lg mb-10">
        Curated luxury goods for the modern connoisseur. Timeless pieces. Uncompromising quality.
      </p>
      <a
        href="/products"
        className="inline-block px-10 py-3.5 bg-charcoal-900 text-white text-sm tracking-widest uppercase hover:bg-gold-600 transition-colors duration-300"
      >
        Shop Now
      </a>
    </section>
  );
}
