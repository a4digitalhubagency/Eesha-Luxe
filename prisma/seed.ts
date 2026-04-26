import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Ensure columns exist — safe to run multiple times
  await prisma.$executeRawUnsafe(`ALTER TABLE products ADD COLUMN IF NOT EXISTS color TEXT;`);
  await prisma.$executeRawUnsafe(`ALTER TABLE products ADD COLUMN IF NOT EXISTS sizes TEXT[] DEFAULT '{}';`);

  // Categories
  const silkEdit = await prisma.category.upsert({
    where: { slug: "silk-edit" },
    update: {},
    create: {
      name: "The Silk Edit",
      slug: "silk-edit",
      description: "A curated selection of ethically sourced mulberry silks, hand-tailored in our digital atelier to embody fluid elegance and timeless grace.",
      imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
    },
  });

  const eveningWear = await prisma.category.upsert({
    where: { slug: "evening-wear" },
    update: {},
    create: {
      name: "Evening Wear",
      slug: "evening-wear",
      description: "Refined pieces for after-dark occasions — fluid, luminous, unforgettable.",
      imageUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80",
    },
  });

  // Products — The Silk Edit
  const silkProducts = [
    {
      name: "Aurelia Silk Slip Dress",
      slug: "aurelia-silk-slip-dress",
      description: "A fluid silk slip cut on the bias for effortless movement. The Aurelia is finished with hand-rolled hems and delicate adjustable straps.",
      price: 420, color: "Champagne", stock: 24, featured: true,
      sizes: ["FR 34", "FR 36", "FR 38", "FR 40", "FR 42", "FR 44"],
      images: ["https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80"],
    },
    {
      name: "Atelier Structured Blazer",
      slug: "atelier-structured-blazer",
      description: "A sharp, sculptural blazer with extended shoulders and a clean notch lapel. Unlined for breathability, structured for precision.",
      price: 890, color: "Espresso", stock: 12,
      sizes: ["FR 34", "FR 36", "FR 38", "FR 40"],
      images: ["https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80"],
    },
    {
      name: "Pleated Wide-Leg Trousers",
      slug: "pleated-wide-leg-trousers",
      description: "High-waisted with deep front pleats and a wide, sweeping leg. Cut from a matte silk-wool blend with a draped fall.",
      price: 350, color: "Taupe", stock: 18,
      sizes: ["FR 34", "FR 36", "FR 38", "FR 40", "FR 42"],
      images: ["https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=600&q=80"],
    },
    {
      name: "Ether Blouse",
      slug: "ether-blouse",
      description: "A barely-there blouse in silk georgette with an open back and minimal V neckline. Light enough to feel like air.",
      price: 275, color: "Dusty Rose", stock: 20,
      sizes: ["FR 34", "FR 36", "FR 38", "FR 40", "FR 42", "FR 44"],
      images: ["https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=600&q=80"],
    },
    {
      name: "Essential Silk Cami",
      slug: "essential-silk-cami",
      description: "The foundation piece. Seamlessly transitions from day to evening with adjustable spaghetti straps and a relaxed silhouette.",
      price: 180, color: "Midnight", stock: 30,
      sizes: ["FR 34", "FR 36", "FR 38", "FR 40", "FR 42", "FR 44"],
      images: ["https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=600&q=80"],
    },
    {
      name: "Digital Print Silk Scarf",
      slug: "digital-print-silk-scarf",
      description: "A 90x90cm hand-rolled scarf printed with an original atelier motif on pure habotai silk. Wearable as a top, belt, or hair tie.",
      price: 120, color: "Ivory / Multi", stock: 40,
      sizes: ["FR 34", "FR 36", "FR 38", "FR 40", "FR 42", "FR 44"],
      images: ["https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=600&q=80"],
    },
    {
      name: "Luna Silk Maxi Skirt",
      slug: "luna-silk-maxi-skirt",
      description: "Floor-grazing with a subtle A-line flare and an invisible side zipper. Styled for both the studio and the soirée.",
      price: 310, color: "Sage", stock: 15,
      sizes: ["FR 34", "FR 36", "FR 38", "FR 40"],
      images: ["https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=600&q=80"],
    },
    {
      name: "Luxe Sleep Set",
      slug: "luxe-sleep-set",
      description: "A matching cami and wide-leg pant set in 22-momme mulberry silk. Designed for the bedroom and beyond.",
      price: 495, color: "Pearl", stock: 22,
      sizes: ["FR 34", "FR 36", "FR 38", "FR 40", "FR 42", "FR 44"],
      images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=80"],
    },
  ];

  for (const p of silkProducts) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { sizes, ...rest } = p;
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: { ...rest, categoryId: silkEdit.id },
    });
  }

  // Products — Evening Wear
  const eveningProducts = [
    {
      name: "The Aurelia Silk Draped Gown",
      slug: "aurelia-silk-draped-gown",
      description: "A floor-length draped gown in ivory silk charmeuse with an open back and a cascade detail at the hip.",
      price: 1850, color: "Ivory", stock: 8, featured: true,
      sizes: ["FR 34", "FR 36", "FR 38"],
      images: [
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80",
      ],
    },
  ];

  for (const p of eveningProducts) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { sizes, ...rest } = p;
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: { ...rest, categoryId: eveningWear.id },
    });
  }

  // Set sizes via raw SQL — safe once the column exists
  const sizesMap: Record<string, string[]> = {
    "aurelia-silk-slip-dress":    ["FR 34","FR 36","FR 38","FR 40","FR 42","FR 44"],
    "atelier-structured-blazer":  ["FR 34","FR 36","FR 38","FR 40"],
    "pleated-wide-leg-trousers":  ["FR 34","FR 36","FR 38","FR 40","FR 42"],
    "ether-blouse":               ["FR 34","FR 36","FR 38","FR 40","FR 42","FR 44"],
    "essential-silk-cami":        ["FR 34","FR 36","FR 38","FR 40","FR 42","FR 44"],
    "digital-print-silk-scarf":   ["FR 34","FR 36","FR 38","FR 40","FR 42","FR 44"],
    "luna-silk-maxi-skirt":       ["FR 34","FR 36","FR 38","FR 40"],
    "luxe-sleep-set":             ["FR 34","FR 36","FR 38","FR 40","FR 42","FR 44"],
    "aurelia-silk-draped-gown":   ["FR 34","FR 36","FR 38"],
  };

  for (const [slug, sizes] of Object.entries(sizesMap)) {
    const arr = `ARRAY[${sizes.map((s) => `'${s}'`).join(",")}]`;
    await prisma.$executeRawUnsafe(
      `UPDATE products SET sizes = ${arr}::TEXT[] WHERE slug = '${slug}'`
    );
  }

  console.log("✓ Seed complete");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
