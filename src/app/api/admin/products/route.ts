import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleApiError, safeJson } from "@/lib/errors";

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function uniqueSlug(base: string) {
  let slug = base;
  let n = 1;
  while (await prisma.product.findUnique({ where: { slug } })) {
    slug = `${base}-${n++}`;
  }
  return slug;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await safeJson<{
      name?: string;
      description?: string;
      price?: number;
      compareAt?: number | null;
      stock?: number;
      images?: string[];
      categoryId?: string;
      color?: string;
      sizes?: string[];
      composition?: string;
      featured?: boolean;
      published?: boolean;
    }>(req);

    if (!body) return NextResponse.json({ error: "Invalid request body." }, { status: 400 });

    const { name, description, price, compareAt, stock, images, categoryId, color, sizes, composition, featured, published } = body;

    if (!name?.trim()) return NextResponse.json({ error: "Product name is required." }, { status: 400 });
    if (!categoryId) return NextResponse.json({ error: "Category is required." }, { status: 400 });
    if (!price || price <= 0) return NextResponse.json({ error: "Valid price is required." }, { status: 400 });
    if (!images?.length) return NextResponse.json({ error: "At least one image URL is required." }, { status: 400 });

    const slug = await uniqueSlug(slugify(name.trim()));

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        slug,
        description: description?.trim() ?? null,
        price,
        compareAt: compareAt ?? null,
        stock: stock ?? 0,
        images: images.filter(Boolean),
        categoryId,
        color: color?.trim() ?? null,
        sizes: sizes ?? [],
        composition: composition?.trim() ?? null,
        featured: featured ?? false,
        published: published ?? true,
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (err) {
    return handleApiError(err, "Failed to create product.");
  }
}
