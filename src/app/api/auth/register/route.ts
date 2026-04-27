import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken, cookieOptions } from "@/lib/auth";
import { handleApiError, safeJson } from "@/lib/errors";
import { Prisma } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const body = await safeJson<{
      firstName?: string;
      lastName?: string;
      email?: string;
      password?: string;
    }>(req);

    if (!body) {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const { firstName, lastName, email, password } = body;

    if (!firstName?.trim() || !lastName?.trim() || !email?.trim() || !password) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const hashed = await hash(password, 12);

    let user;
    try {
      user = await prisma.user.create({
        data: { name: `${firstName.trim()} ${lastName.trim()}`, email: email.trim(), password: hashed },
      });
    } catch (err) {
      // P2002 = unique constraint — email already registered (handles race condition)
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        return NextResponse.json(
          { error: "An account with this email already exists." },
          { status: 409 }
        );
      }
      throw err; // re-throw to outer catch for generic handling
    }

    const token = await signToken({
      sub: user.id,
      email: user.email,
      name: user.name ?? "",
      role: user.role,
    });
    const opts = cookieOptions(60 * 60 * 24 * 7);

    const res = NextResponse.json({ ok: true, id: user.id, email: user.email, name: user.name });
    res.cookies.set({ ...opts, value: token });
    return res;
  } catch (err) {
    return handleApiError(err, "Registration failed. Please try again.");
  }
}
