import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, currentPassword, newPassword } = await req.json();

  if (!name?.trim()) return NextResponse.json({ error: "Name is required." }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id: session.sub } });
  if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

  if (newPassword) {
    if (!currentPassword) return NextResponse.json({ error: "Current password is required." }, { status: 400 });
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
}
