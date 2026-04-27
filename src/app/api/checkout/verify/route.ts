import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { verifyTransaction } from "@/lib/paystack";
import { prisma } from "@/lib/prisma";
import { sendCustomerConfirmation, sendAdminNotification } from "@/lib/email";

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

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { reference, items, shipping, subtotal, tax } = body as {
    reference: string;
    items: CartItem[];
    shipping: ShippingInput;
    subtotal: number;
    tax: number;
  };

  if (!reference || !items?.length || !shipping) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  // Verify with PayStack
  let payment;
  try {
    payment = await verifyTransaction(reference);
  } catch (err) {
    console.error("PayStack verify error:", err);
    return NextResponse.json({ error: "Payment verification failed." }, { status: 502 });
  }

  if (payment.status !== "success") {
    return NextResponse.json({ error: "Payment was not completed." }, { status: 402 });
  }

  const total = subtotal + tax;

  // Create address + order in a transaction
  let order;
  try {
    order = await prisma.$transaction(async (tx) => {
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
            include: { product: { select: { name: true, images: true } } },
          },
        },
      });
    });
  } catch (err) {
    console.error("Order creation error:", err);
    return NextResponse.json({ error: "Failed to save order. Please contact support." }, { status: 500 });
  }

  const orderRef = `LX-${order.id.slice(-8).toUpperCase()}`;

  // Send emails — don't block the response
  const emailItems = items.map((item) => ({
    name: item.name,
    quantity: item.quantity,
    price: item.price,
  }));

  const emailParams = {
    customerEmail: order.user.email,
    customerName: order.user.name ?? shipping.firstName,
    orderRef,
    items: emailItems,
    subtotal,
    tax,
    total,
    shipping: {
      firstName: shipping.firstName,
      lastName: shipping.lastName,
      line1: shipping.line1,
      city: shipping.city,
      state: shipping.state,
      postalCode: shipping.postalCode,
      country: shipping.country ?? "Nigeria",
    },
  };

  Promise.all([
    sendCustomerConfirmation(emailParams),
    sendAdminNotification(emailParams),
  ]).catch((err) => console.error("Email send error:", err));

  return NextResponse.json({ orderId: order.id, orderRef });
}
