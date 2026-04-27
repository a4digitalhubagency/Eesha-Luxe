import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("eesha_token")?.value;
  const session = token ? await verifyToken(token) : null;

  // Admin routes — require ADMIN role
  if (pathname.startsWith("/admin")) {
    if (!session) {
      return NextResponse.redirect(new URL(`/login?from=${encodeURIComponent(pathname)}`, req.url));
    }
    if (session.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  // Protected user routes
  if (pathname.startsWith("/account") || pathname.startsWith("/checkout")) {
    if (!session) {
      return NextResponse.redirect(new URL(`/login?from=${encodeURIComponent(pathname)}`, req.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/checkout/:path*", "/admin/:path*"],
};
