import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/errors";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [orders, addresses] = await Promise.all([
      prisma.order.findMany({
        where: { userId: session.sub },
        orderBy: { createdAt: "desc" },
        take: 3,
        include: {
          items: {
            include: { product: { select: { name: true, images: true } } },
            take: 1,
          },
        },
      }),
      prisma.address.findMany({
        where: { userId: session.sub },
        orderBy: { isDefault: "desc" },
      }),
    ]);

    return NextResponse.json({ orders, addresses });
  } catch (err) {
    return handleApiError(err, "Failed to fetch account data.");
  }
}
