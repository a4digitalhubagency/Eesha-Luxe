import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Validates the cart against current DB state. Returns latest stock and price
 * for each requested product so the cart UI can flag out-of-stock items
 * and price changes before the customer reaches checkout.
 *
 * Public — no auth required (cart is local to the browser).
 */
export async function GET(req: NextRequest) {
  try {
    const idsParam = req.nextUrl.searchParams.get("ids");
    if (!idsParam) {
      return NextResponse.json({ items: [] });
    }

    const ids = idsParam.split(",").filter(Boolean).slice(0, 50); // bound the lookup
    if (ids.length === 0) {
      return NextResponse.json({ items: [] });
    }

    const products = await prisma.product.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        name: true,
        slug: true,
        stock: true,
        price: true,
        published: true,
      },
    });

    return NextResponse.json({
      items: products.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        stock: p.stock,
        price: Number(p.price),
        available: p.published,
      })),
    });
  } catch (err) {
    console.error("[cart/validate]", err);
    return NextResponse.json({ items: [] });
  }
}