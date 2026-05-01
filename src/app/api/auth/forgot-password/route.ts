import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendPasswordReset } from "@/lib/email";
import { handleApiError, safeJson } from "@/lib/errors";

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function POST(req: NextRequest) {
  try {
    const body = await safeJson<{ email?: string }>(req);
    const email = body?.email?.trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // SECURITY: always return success even if no user — prevents email enumeration
    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      const expiry = new Date(Date.now() + TOKEN_TTL_MS);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordResetToken: token,
          passwordResetExpiry: expiry,
        },
      });

      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL ?? `${req.nextUrl.protocol}//${req.nextUrl.host}`;
      const resetUrl = `${baseUrl}/reset-password?token=${token}`;

      try {
        await sendPasswordReset({
          customerEmail: user.email,
          customerName: user.name ?? "Valued Customer",
          resetUrl,
        });
      } catch (err) {
        console.error("[Password reset email]", err);
      }
    }

    return NextResponse.json({
      ok: true,
      message: "If an account exists for that email, a reset link has been sent.",
    });
  } catch (err) {
    return handleApiError(err, "Failed to process request.");
  }
}
