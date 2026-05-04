import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description: "Eesha Luxe — A digital atelier of curated luxury fashion and lifestyle pieces.",
};

export default function AboutPage() {
  return (
    <div className="bg-surface min-h-screen">
      <div className="max-w-3xl mx-auto px-6 lg:px-10 py-16 md:py-24">
        <p className="label text-primary mb-4">Our Story</p>
        <h1
          className="text-4xl md:text-5xl text-on-surface mb-10 leading-tight"
          style={{ fontFamily: "var(--font-serif)", letterSpacing: "-0.02em" }}
        >
          The Digital Atelier
        </h1>

        <div className="prose prose-sm md:prose-base max-w-none text-on-surface-muted space-y-6 leading-relaxed">
          <p>
            Eesha Luxe was founded with a single conviction — that luxury is found in restraint, in
            craftsmanship, and in the quiet authority of pieces designed to outlast trends. We are a
            digital atelier: a curated space for the modern woman who values intention over excess.
          </p>

          <p>
            Each piece in our collection is selected for its provenance, its construction, and its
            ability to slip seamlessly into a thoughtful wardrobe. From hand-finished silks to
            structured tailoring, we work with artisans who treat their craft as discipline.
          </p>

          <p>
            We believe in transparency, in the names of the hands that made what you wear, and in
            building a wardrobe of meaning rather than volume.
          </p>

          <h2
            className="text-2xl text-on-surface mt-12 mb-4"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            What we stand for
          </h2>

          <ul className="space-y-3">
            <li><strong className="text-on-surface">Provenance.</strong> Every piece carries the story of where, and by whom, it was made.</li>
            <li><strong className="text-on-surface">Craftsmanship.</strong> We work only with ateliers whose standards we have personally verified.</li>
            <li><strong className="text-on-surface">Longevity.</strong> Designed to be worn for years, not seasons.</li>
            <li><strong className="text-on-surface">Intention.</strong> A small collection, edited with care.</li>
          </ul>

          <h2
            className="text-2xl text-on-surface mt-12 mb-4"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Visit the atelier
          </h2>

          <p>
            Our pieces are available exclusively through our digital atelier. For private appointments,
            personal styling, or trade enquiries, please <Link href="/contact" className="text-primary underline underline-offset-2">contact us</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}