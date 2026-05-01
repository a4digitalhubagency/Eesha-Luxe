import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

// PayStack sends webhooks for events like charge.success.
// This is a safety net for cases where the user closes their browser
// after paying but before the verify endpoint runs.
//
// We DO NOT create orders from the webhook. The verify route is the
// source of truth — orders without shipping info cannot exist.
// The webhook only logs events for reconciliation and flags
// successful payments without orders for manual follow-up.

export async function POST(req: NextRequest) {
  const SECRET = process.env.PAYSTACK_SECRET_KEY;
  if (!SECRET) {
    console.error("[PayStack webhook] PAYSTACK_SECRET_KEY not set");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  // Read raw body — must be the exact bytes PayStack signed
  const rawBody = await req.text();

  // Verify signature
  const signature = req.headers.get("x-paystack-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 401 });
  }

  const expected = crypto.createHmac("sha512", SECRET).update(rawBody).digest("hex");

  // Constant-time comparison to prevent timing attacks
  const sigBuf = Buffer.from(signature, "hex");
  const expBuf = Buffer.from(expected, "hex");
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: { event: string; data: { reference?: string; status?: string; amount?: number; customer?: { email?: string } } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // Only handle charge.success — other events (charge.failed, etc.) are ignored for now
  if (event.event !== "charge.success") {
    return NextResponse.json({ ok: true, ignored: event.event });
  }

  const reference = event.data.reference;
  if (!reference) {
    return NextResponse.json({ error: "Missing reference" }, { status: 400 });
  }

  // Check if an order already exists for this reference (verify route already ran)
  const existing = await prisma.order.findUnique({
    where: { paystackRef: reference },
    select: { id: true },
  });

  if (existing) {
    return NextResponse.json({ ok: true, status: "order_already_created" });
  }

  // Order doesn't exist — log for manual reconciliation.
  // We can't create the order from here because we don't have shipping info.
  console.warn(
    `[PayStack webhook] Successful payment without order — needs manual review. ` +
    `ref=${reference} amount=${event.data.amount} email=${event.data.customer?.email}`
  );

  // Always 200 to PayStack so they don't retry indefinitely
  return NextResponse.json({ ok: true, status: "logged_for_review" });
}
