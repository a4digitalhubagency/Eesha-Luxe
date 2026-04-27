import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

// Maps Prisma error codes → { user-safe message, HTTP status }
const PRISMA_MESSAGES: Record<string, { message: string; status: number }> = {
  P1001: { message: "Service temporarily unavailable. Please try again shortly.", status: 503 },
  P1002: { message: "Database connection timed out. Please try again.", status: 503 },
  P2002: { message: "That value already exists.", status: 409 },
  P2003: { message: "Invalid reference.", status: 400 },
  P2025: { message: "Record not found.", status: 404 },
  P2024: { message: "Service is under heavy load. Please try again in a moment.", status: 503 },
};

export function mapPrismaError(err: unknown): { message: string; status: number } {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    return PRISMA_MESSAGES[err.code] ?? { message: "Database error.", status: 500 };
  }
  if (
    err instanceof Prisma.PrismaClientInitializationError ||
    err instanceof Prisma.PrismaClientRustPanicError
  ) {
    return { message: "Service temporarily unavailable. Please try again shortly.", status: 503 };
  }
  return { message: "Something went wrong.", status: 500 };
}

export function apiError(message: string, status = 500) {
  return NextResponse.json({ error: message }, { status });
}

// Logs the raw error and returns a safe API response.
// Use this as the catch handler in every API route.
export function handleApiError(err: unknown, fallback = "Something went wrong."): NextResponse {
  console.error("[API Error]", err);
  if (
    err instanceof Prisma.PrismaClientKnownRequestError ||
    err instanceof Prisma.PrismaClientInitializationError ||
    err instanceof Prisma.PrismaClientRustPanicError ||
    err instanceof Prisma.PrismaClientUnknownRequestError
  ) {
    const { message, status } = mapPrismaError(err);
    return apiError(message, status);
  }
  return apiError(fallback, 500);
}

// Safely parse JSON from a request body. Returns null if body is malformed.
export async function safeJson<T>(req: Request): Promise<T | null> {
  try {
    return (await req.json()) as T;
  } catch {
    return null;
  }
}

// True when the error clearly indicates the DB server is unreachable.
export function isDbUnavailable(err: unknown): boolean {
  if (err instanceof Prisma.PrismaClientInitializationError) return true;
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    return ["P1001", "P1002", "P2024"].includes(err.code);
  }
  return false;
}
