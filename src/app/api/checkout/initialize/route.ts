import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { initializeTransaction } from "@/lib/paystack";
import { safeJson } from "@/lib/errors";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "You must be signed in to checkout." }, { status: 401 });
    }

    const body = await safeJson<{ amount?: number }>(req);
    if (!body) {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const { amount } = body;
    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "Invalid order amount." }, { status: 400 });
    }

    const data = await initializeTransaction({
      email: session.email,
      amount: Math.round(amount * 100), // NGN → kobo
    });

    return NextResponse.json({
      reference: data.reference,
      publicKey: process.env.PAYSTACK_PUBLIC_KEY,
    });
  } catch (err) {
    console.error("[PayStack initialize]", err);
    return NextResponse.json(
      { error: "Payment initialization failed. Please try again." },
      { status: 502 }
    );
  }
}
