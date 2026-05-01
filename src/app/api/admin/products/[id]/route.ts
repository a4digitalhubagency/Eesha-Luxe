import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleApiError, safeJson } from "@/lib/errors";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
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

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Product not found." }, { status: 404 });

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(body.name ? { name: body.name.trim() } : {}),
        ...(body.description !== undefined ? { description: body.description?.trim() ?? null } : {}),
        ...(body.price !== undefined ? { price: body.price } : {}),
        ...(body.compareAt !== undefined ? { compareAt: body.compareAt } : {}),
        ...(body.stock !== undefined ? { stock: body.stock } : {}),
        ...(body.images ? { images: body.images.filter(Boolean) } : {}),
        ...(body.categoryId ? { categoryId: body.categoryId } : {}),
        ...(body.color !== undefined ? { color: body.color?.trim() ?? null } : {}),
        ...(body.sizes ? { sizes: body.sizes } : {}),
        ...(body.composition !== undefined ? { composition: body.composition?.trim() ?? null } : {}),
        ...(body.featured !== undefined ? { featured: body.featured } : {}),
        ...(body.published !== undefined ? { published: body.published } : {}),
      },
    });

    return NextResponse.json({ product });
  } catch (err) {
    return handleApiError(err, "Failed to update product.");
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Product not found." }, { status: 404 });

    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err, "Failed to delete product.");
  }
}
