import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { handleApiError, safeJson } from "@/lib/errors";

export async function POST(req: NextRequest) {
  try {
    const body = await safeJson<{ token?: string; password?: string }>(req);
    const token = body?.token?.trim();
    const password = body?.password;

    if (!token) {
      return NextResponse.json({ error: "Reset token is required." }, { status: 400 });
    }
    if (!password || password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { passwordResetToken: token },
      select: { id: true, passwordResetExpiry: true },
    });

    if (!user || !user.passwordResetExpiry || user.passwordResetExpiry < new Date()) {
      return NextResponse.json(
        { error: "This reset link is invalid or has expired. Please request a new one." },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: await hash(password, 12),
        passwordResetToken: null,
        passwordResetExpiry: null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err, "Failed to reset password.");
  }
}
