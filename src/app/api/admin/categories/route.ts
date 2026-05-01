import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleApiError, safeJson } from "@/lib/errors";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    });

    return NextResponse.json({ categories });
  } catch (err) {
    return handleApiError(err, "Failed to fetch categories.");
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await safeJson<{ name?: string; description?: string; imageUrl?: string }>(req);
    if (!body?.name?.trim()) {
      return NextResponse.json({ error: "Category name is required." }, { status: 400 });
    }

    const slug = body.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    const category = await prisma.category.create({
      data: {
        name: body.name.trim(),
        slug,
        description: body.description?.trim() ?? null,
        imageUrl: body.imageUrl?.trim() ?? null,
      },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (err) {
    return handleApiError(err, "Failed to create category.");
  }
}
