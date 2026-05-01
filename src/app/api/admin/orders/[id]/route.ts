import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleApiError, safeJson } from "@/lib/errors";
import { sendOrderStatusUpdate } from "@/lib/email";

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
    const newStatus = status as (typeof VALID_STATUSES)[number];

    // Fetch current order so we can detect a real status change and email if so
    const current = await prisma.order.findUnique({
      where: { id },
      select: { status: true, user: { select: { name: true, email: true } } },
    });
    if (!current) return NextResponse.json({ error: "Order not found." }, { status: 404 });

    const order = await prisma.order.update({
      where: { id },
      data: { status: newStatus },
      select: { id: true, status: true },
    });

    // Fire-and-forget email — only if status actually changed
    if (current.status !== newStatus) {
      sendOrderStatusUpdate({
        customerEmail: current.user.email,
        customerName: current.user.name ?? "Valued Customer",
        orderRef: `LX-${order.id.slice(-8).toUpperCase()}`,
        status: newStatus,
      }).catch((err) => console.error("[Status email]", err));
    }

    return NextResponse.json(order);
  } catch (err) {
    return handleApiError(err, "Failed to update order.");
  }
}
