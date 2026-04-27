import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleApiError, safeJson } from "@/lib/errors";
import bcrypt from "bcryptjs";

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await safeJson<{
      name?: string;
      currentPassword?: string;
      newPassword?: string;
    }>(req);

    if (!body) return NextResponse.json({ error: "Invalid request body." }, { status: 400 });

    const { name, currentPassword, newPassword } = body;

    if (!name?.trim()) return NextResponse.json({ error: "Name is required." }, { status: 400 });

    if (newPassword) {
      if (newPassword.length < 8) {
        return NextResponse.json({ error: "New password must be at least 8 characters." }, { status: 400 });
      }
      if (!currentPassword) {
        return NextResponse.json({ error: "Current password is required." }, { status: 400 });
      }
    }

    const user = await prisma.user.findUnique({ where: { id: session.sub } });
    if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

    if (newPassword && currentPassword) {
      const valid = await bcrypt.compare(currentPassword, user.password);
      if (!valid) return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: session.sub },
      data: {
        name: name.trim(),
        ...(newPassword ? { password: await bcrypt.hash(newPassword, 12) } : {}),
      },
      select: { id: true, name: true, email: true, role: true },
    });

    return NextResponse.json({
      user: { id: updated.id, name: updated.name, email: updated.email, role: updated.role },
    });
  } catch (err) {
    return handleApiError(err, "Failed to update settings.");
  }
}
