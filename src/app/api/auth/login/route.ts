import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken, cookieOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const valid = await compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const token = await signToken({ sub: user.id, email: user.email, name: user.name ?? "" });
    const opts = cookieOptions(60 * 60 * 24 * 7);

    const res = NextResponse.json({ ok: true, id: user.id, name: user.name, email: user.email });
    res.cookies.set({ ...opts, value: token });
    return res;
  } catch {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
