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
    const body = await safeJson<{ name?: string; description?: string; imageUrl?: string }>(req);
    if (!body) return NextResponse.json({ error: "Invalid request body." }, { status: 400 });

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Category not found." }, { status: 404 });

    const data: Record<string, unknown> = {};
    if (body.name?.trim()) {
      data.name = body.name.trim();
      data.slug = body.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    }
    if (body.description !== undefined) data.description = body.description?.trim() ?? null;
    if (body.imageUrl !== undefined) data.imageUrl = body.imageUrl?.trim() ?? null;

    const category = await prisma.category.update({ where: { id }, data });
    return NextResponse.json({ category });
  } catch (err) {
    return handleApiError(err, "Failed to update category.");
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const productCount = await prisma.product.count({ where: { categoryId: id } });
    if (productCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete: ${productCount} product${productCount === 1 ? "" : "s"} still in this category. Move or delete them first.` },
        { status: 400 }
      );
    }

    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err, "Failed to delete category.");
  }
}
