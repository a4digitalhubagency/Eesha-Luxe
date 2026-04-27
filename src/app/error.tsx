"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Global Error]", error.digest ?? error.message);
  }, [error]);

  const isDbError =
    error.message?.includes("reach database") ||
    error.message?.includes("connection pool") ||
    error.message?.includes("temporarily unavailable");

  return (
    <div className="bg-surface min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <p className="text-[10px] uppercase tracking-widest text-on-surface-faint mb-3">
          {isDbError ? "Service Unavailable" : "Unexpected Error"}
        </p>
        <h1
          className="text-4xl text-on-surface mb-4"
          style={{ fontFamily: "var(--font-serif)", letterSpacing: "-0.02em" }}
        >
          {isDbError ? "We'll be right back." : "Something went wrong."}
        </h1>
        <p className="text-sm text-on-surface-muted leading-relaxed mb-8">
          {isDbError
            ? "Our servers are momentarily unavailable. Please try again in a few seconds."
            : "An unexpected error occurred. Please try again or contact support if the issue persists."}
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="btn-primary h-10 px-6 text-sm"
          >
            Try Again
          </button>
          <Link href="/" className="btn-ghost h-10 px-6 text-sm">
            Go Home
          </Link>
        </div>
        {error.digest && (
          <p className="text-[10px] text-on-surface-faint mt-8 font-mono">
            Ref: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
