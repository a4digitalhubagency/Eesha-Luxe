import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken, cookieOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { firstName, lastName, email, password } = await req.json();

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const hashed = await hash(password, 12);
    const user = await prisma.user.create({
      data: { name: `${firstName} ${lastName}`, email, password: hashed },
    });

    const token = await signToken({ sub: user.id, email: user.email, name: user.name ?? "" });
    const opts = cookieOptions(60 * 60 * 24 * 7);

    const res = NextResponse.json({ ok: true });
    res.cookies.set({ ...opts, value: token });
    return res;
  } catch {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
