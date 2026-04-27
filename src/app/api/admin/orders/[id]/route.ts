import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleApiError, safeJson } from "@/lib/errors";

interface Props {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: Props) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true } },
        address: true,
        items: {
          include: { product: { select: { name: true, images: true, slug: true } } },
        },
      },
    });

    if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
    return NextResponse.json(order);
  } catch (err) {
    return handleApiError(err, "Failed to fetch order.");
  }
}

const VALID_STATUSES = [
  "PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED",
] as const;

export async function PATCH(req: NextRequest, { params }: Props) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await safeJson<{ status?: string }>(req);
    if (!body) return NextResponse.json({ error: "Invalid request body." }, { status: 400 });

    const { status } = body;
    if (!status || !VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number])) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}.` },
        { status: 400 }
      );
    }

    const { id } = await params;
    const order = await prisma.order.update({
      where: { id },
      data: { status: status as (typeof VALID_STATUSES)[number] },
      select: { id: true, status: true },
    });

    return NextResponse.json(order);
  } catch (err) {
    return handleApiError(err, "Failed to update order.");
  }
}
