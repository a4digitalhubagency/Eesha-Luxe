import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getSession, signToken, cookieOptions } from "@/lib/auth";
import { verifyTransaction } from "@/lib/paystack";
import { prisma } from "@/lib/prisma";
import { sendCustomerConfirmation, sendAdminNotification } from "@/lib/email";
import { handleApiError, safeJson } from "@/lib/errors";
import { hash } from "bcryptjs";

interface CartItemInput {
  productId: string;
  quantity: number;
}

interface ShippingInput {
  firstName: string;
  lastName: string;
  line1: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  phone?: string;
}

interface VerifyBody {
  reference: string;
  items: CartItemInput[];
  shipping: ShippingInput;
  guestEmail?: string;
}

const TAX_RATE = 0.075;

function randomPassword() {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

function isEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const body = await safeJson<VerifyBody>(req);
    if (!body) {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const { reference, items, shipping, guestEmail } = body;

    // Basic input validation
    if (!reference || typeof reference !== "string") {
      return NextResponse.json({ error: "Missing payment reference." }, { status: 400 });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
    }
    for (const item of items) {
      if (!item.productId || !Number.isInteger(item.quantity) || item.quantity <= 0 || item.quantity > 100) {
        return NextResponse.json({ error: "Invalid cart item." }, { status: 400 });
      }
    }
    if (!shipping?.firstName?.trim() || !shipping?.lastName?.trim() || !shipping?.line1?.trim() ||
        !shipping?.city?.trim() || !shipping?.state?.trim() || !shipping?.postalCode?.trim()) {
      return NextResponse.json({ error: "Incomplete shipping address." }, { status: 400 });
    }

    // ── Idempotency: if this reference is already processed, return existing order
    const existing = await prisma.order.findUnique({
      where: { paystackRef: reference },
      select: { id: true },
    });
    if (existing) {
      const orderRef = `LX-${existing.id.slice(-8).toUpperCase()}`;
      return NextResponse.json({ orderId: existing.id, orderRef, idempotent: true });
    }

    // ── Resolve user (session or guest)
    let userId: string;
    let userEmail: string;
    let userName: string;
    let issuedToken: string | null = null;

    if (session) {
      userId = session.sub;
      userEmail = session.email;
      userName = session.name ?? `${shipping.firstName} ${shipping.lastName}`;
    } else {
      const email = guestEmail?.trim().toLowerCase();
      if (!email || !isEmail(email)) {
        return NextResponse.json({ error: "A valid email is required to checkout as guest." }, { status: 400 });
      }

      let user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        user = await prisma.user.create({
          data: {
            email,
            name: `${shipping.firstName.trim()} ${shipping.lastName.trim()}`,
            password: await hash(randomPassword(), 12),
          },
        });
      }
      userId = user.id;
      userEmail = user.email;
      userName = user.name ?? `${shipping.firstName} ${shipping.lastName}`;

      issuedToken = await signToken({
        sub: user.id,
        email: user.email,
        name: user.name ?? "",
        role: user.role,
      });
    }

    // ── Look up products server-side (NEVER trust client prices)
    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, published: true },
      select: { id: true, name: true, price: true, stock: true, images: true },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json({ error: "One or more products are no longer available." }, { status: 400 });
    }

    const productMap = new Map(products.map((p) => [p.id, p]));

    // Validate stock availability before involving payment data
    for (const item of items) {
      const p = productMap.get(item.productId);
      if (!p) {
        return NextResponse.json({ error: "Product not found." }, { status: 400 });
      }
      if (p.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for "${p.name}" (only ${p.stock} available).` },
          { status: 409 }
        );
      }
    }

    // Compute authoritative totals from DB prices
    const subtotal = items.reduce((sum, item) => {
      const p = productMap.get(item.productId)!;
      return sum + Number(p.price) * item.quantity;
    }, 0);
    const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
    const total = Math.round((subtotal + tax) * 100) / 100;
    const expectedKobo = Math.round(total * 100);

    // ── Verify with PayStack (source of truth for payment status + amount)
    let payment;
    try {
      payment = await verifyTransaction(reference);
    } catch (err) {
      console.error("[PayStack verify]", err);
      return NextResponse.json(
        { error: "Payment verification failed. Please contact support." },
        { status: 502 }
      );
    }

    if (payment.status !== "success") {
      return NextResponse.json(
        { error: `Payment was not completed (status: ${payment.status}).` },
        { status: 402 }
      );
    }

    // ── CRITICAL: Verify the amount PayStack confirmed matches our computed total.
    // Without this, a tampered client could pay a fraction of the cart value.
    if (payment.amount !== expectedKobo) {
      console.error(
        `[PayStack amount mismatch] ref=${reference} paid=${payment.amount} expected=${expectedKobo}`
      );
      return NextResponse.json(
        { error: "Payment amount does not match order total. Please contact support." },
        { status: 400 }
      );
    }

    // ── Atomic transaction: create address + order, decrement stock with stock guard
    let order;
    try {
      order = await prisma.$transaction(async (tx) => {
        // Decrement stock with conditional update — fails if stock < quantity (race-safe)
        for (const item of items) {
          const result = await tx.product.updateMany({
            where: { id: item.productId, stock: { gte: item.quantity } },
            data: { stock: { decrement: item.quantity } },
          });
          if (result.count === 0) {
            const p = productMap.get(item.productId)!;
            throw new Error(`OUT_OF_STOCK:${p.name}`);
          }
        }

        const address = await tx.address.create({
          data: {
            line1: shipping.line1.trim(),
            city: shipping.city.trim(),
            state: shipping.state.trim(),
            postalCode: shipping.postalCode.trim(),
            country: shipping.country?.trim() || "Nigeria",
            phone: shipping.phone?.trim() || null,
            userId,
          },
        });

        return tx.order.create({
          data: {
            userId,
            addressId: address.id,
            paystackRef: reference,
            subtotal,
            tax,
            shipping: 0,
            total,
            status: "CONFIRMED",
            items: {
              create: items.map((item) => {
                const p = productMap.get(item.productId)!;
                const unitPrice = Number(p.price);
                return {
                  productId: item.productId,
                  quantity: item.quantity,
                  unitPrice,
                  total: unitPrice * item.quantity,
                };
              }),
            },
          },
          include: {
            address: true,
            user: { select: { name: true, email: true } },
            items: {
              include: { product: { select: { name: true } } },
            },
          },
        });
      });
    } catch (err) {
      // Race: another concurrent verify already created the order
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        const dup = await prisma.order.findUnique({
          where: { paystackRef: reference },
          select: { id: true },
        });
        if (dup) {
          const orderRef = `LX-${dup.id.slice(-8).toUpperCase()}`;
          return NextResponse.json({ orderId: dup.id, orderRef, idempotent: true });
        }
      }
      if (err instanceof Error && err.message.startsWith("OUT_OF_STOCK:")) {
        const productName = err.message.split(":")[1];
        return NextResponse.json(
          { error: `Sold out: "${productName}" was purchased by another customer just now. Please contact support — your payment was received.` },
          { status: 409 }
        );
      }
      throw err;
    }

    const orderRef = `LX-${order.id.slice(-8).toUpperCase()}`;

    // Build email items from authoritative DB data (not client)
    const emailItems = items.map((item) => {
      const p = productMap.get(item.productId)!;
      return { name: p.name, quantity: item.quantity, price: Number(p.price) };
    });

    // Fire-and-forget — never block the order response on email
    Promise.all([
      sendCustomerConfirmation({
        customerEmail: userEmail,
        customerName: userName,
        orderRef,
        items: emailItems,
        subtotal,
        tax,
        total,
        shipping: { ...shipping, country: shipping.country ?? "Nigeria", phone: shipping.phone ?? "" },
      }),
      sendAdminNotification({
        customerEmail: userEmail,
        customerName: userName,
        orderRef,
        items: emailItems,
        subtotal,
        tax,
        total,
        shipping: { ...shipping, country: shipping.country ?? "Nigeria", phone: shipping.phone ?? "" },
      }),
    ]).catch((err) => console.error("[Email send]", err));

    const res = NextResponse.json({ orderId: order.id, orderRef });
    if (issuedToken) {
      const opts = cookieOptions(60 * 60 * 24 * 7);
      res.cookies.set({ ...opts, value: issuedToken });
    }
    return res;
  } catch (err) {
    return handleApiError(err, "Failed to create order. Please contact support.");
  }
}
