import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { verifyTransaction } from "@/lib/paystack";
import { prisma } from "@/lib/prisma";
import { sendCustomerConfirmation, sendAdminNotification } from "@/lib/email";
import { handleApiError, safeJson } from "@/lib/errors";

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface ShippingInput {
  firstName: string;
  lastName: string;
  line1: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
}

interface VerifyBody {
  reference: string;
  items: CartItem[];
  shipping: ShippingInput;
  subtotal: number;
  tax: number;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await safeJson<VerifyBody>(req);
    if (!body) {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const { reference, items, shipping, subtotal, tax } = body;

    if (!reference || !items?.length || !shipping?.line1 || !shipping?.city) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    // Verify payment with PayStack
    let payment;
    try {
      payment = await verifyTransaction(reference);
    } catch (err) {
      console.error("[PayStack verify]", err);
      return NextResponse.json({ error: "Payment verification failed. Please contact support." }, { status: 502 });
    }

    if (payment.status !== "success") {
      return NextResponse.json(
        { error: `Payment was not completed (status: ${payment.status}).` },
        { status: 402 }
      );
    }

    const total = subtotal + tax;

    // Create address + order atomically
    const order = await prisma.$transaction(async (tx) => {
      const address = await tx.address.create({
        data: {
          line1: shipping.line1,
          city: shipping.city,
          state: shipping.state,
          postalCode: shipping.postalCode,
          country: shipping.country ?? "Nigeria",
          userId: session.sub,
        },
      });

      return tx.order.create({
        data: {
          userId: session.sub,
          addressId: address.id,
          subtotal,
          tax,
          shipping: 0,
          total,
          status: "CONFIRMED",
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.price,
              total: item.price * item.quantity,
            })),
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

    const orderRef = `LX-${order.id.slice(-8).toUpperCase()}`;

    // Send emails non-blocking — never fail the order response over email
    Promise.all([
      sendCustomerConfirmation({
        customerEmail: order.user.email,
        customerName: order.user.name ?? shipping.firstName,
        orderRef,
        items: items.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price })),
        subtotal,
        tax,
        total,
        shipping: { ...shipping, country: shipping.country ?? "Nigeria" },
      }),
      sendAdminNotification({
        customerEmail: order.user.email,
        customerName: order.user.name ?? shipping.firstName,
        orderRef,
        items: items.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price })),
        subtotal,
        tax,
        total,
        shipping: { ...shipping, country: shipping.country ?? "Nigeria" },
      }),
    ]).catch((err) => console.error("[Email send]", err));

    return NextResponse.json({ orderId: order.id, orderRef });
  } catch (err) {
    return handleApiError(err, "Failed to create order. Please contact support.");
  }
}
