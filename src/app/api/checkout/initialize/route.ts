import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { initializeTransaction } from "@/lib/paystack";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "You must be signed in to checkout." }, { status: 401 });
  }

  const { amount } = await req.json();
  if (!amount || amount <= 0) {
    return NextResponse.json({ error: "Invalid order amount." }, { status: 400 });
  }

  try {
    const data = await initializeTransaction({
      email: session.email,
      amount: Math.round(amount * 100), // NGN → kobo
    });

    return NextResponse.json({
      reference: data.reference,
      publicKey: process.env.PAYSTACK_PUBLIC_KEY,
    });
  } catch (err) {
    console.error("PayStack initialize error:", err);
    return NextResponse.json({ error: "Payment initialization failed. Please try again." }, { status: 502 });
  }
}
