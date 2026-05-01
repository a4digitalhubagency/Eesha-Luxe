import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { initializeTransaction } from "@/lib/paystack";
import { prisma } from "@/lib/prisma";
import { safeJson } from "@/lib/errors";

interface CartItemInput {
  productId: string;
  quantity: number;
}

const TAX_RATE = 0.075;

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();

    const body = await safeJson<{ items?: CartItemInput[]; guestEmail?: string }>(req);
    if (!body) {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const { items, guestEmail } = body;
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
    }
    for (const item of items) {
      if (!item.productId || !Number.isInteger(item.quantity) || item.quantity <= 0 || item.quantity > 100) {
        return NextResponse.json({ error: "Invalid cart item." }, { status: 400 });
      }
    }

    // Resolve email
    const email = session?.email ?? guestEmail?.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "A valid email is required to checkout." }, { status: 400 });
    }

    // Recompute amount server-side from DB prices (never trust client)
    const products = await prisma.product.findMany({
      where: { id: { in: items.map((i) => i.productId) }, published: true },
      select: { id: true, price: true, stock: true, name: true },
    });
    if (products.length !== items.length) {
      return NextResponse.json({ error: "One or more products are no longer available." }, { status: 400 });
    }
    const productMap = new Map(products.map((p) => [p.id, p]));

    // Stock pre-check (best-effort; final check is in verify route inside transaction)
    for (const item of items) {
      const p = productMap.get(item.productId)!;
      if (p.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for "${p.name}" (only ${p.stock} available).` },
          { status: 409 }
        );
      }
    }

    const subtotal = items.reduce((sum, item) => {
      const p = productMap.get(item.productId)!;
      return sum + Number(p.price) * item.quantity;
    }, 0);
    const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
    const total = Math.round((subtotal + tax) * 100) / 100;

    const data = await initializeTransaction({
      email,
      amount: Math.round(total * 100), // kobo
    });

    return NextResponse.json({
      reference: data.reference,
      publicKey: process.env.PAYSTACK_PUBLIC_KEY,
      total,
    });
  } catch (err) {
    console.error("[PayStack initialize]", err);
    return NextResponse.json(
      { error: "Payment initialization failed. Please try again." },
      { status: 502 }
    );
  }
}
