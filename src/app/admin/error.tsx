"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Admin Error]", error.digest ?? error.message);
  }, [error]);

  const isDbError =
    error.message?.includes("reach database") ||
    error.message?.includes("connection pool") ||
    error.message?.includes("temporarily unavailable");

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-8">
      <div className="text-center max-w-sm">
        <div className="w-12 h-12 rounded-sm bg-red-50 flex items-center justify-center mx-auto mb-5">
          <AlertTriangle size={20} className="text-red-500" />
        </div>
        <p className="text-[10px] uppercase tracking-widest text-on-surface-faint mb-2">
          {isDbError ? "Database Unavailable" : "Page Error"}
        </p>
        <h2
          className="text-2xl text-on-surface mb-3"
          style={{ fontFamily: "var(--font-serif)", letterSpacing: "-0.02em" }}
        >
          {isDbError ? "Can't reach the database." : "Something went wrong."}
        </h2>
        <p className="text-sm text-on-surface-muted leading-relaxed mb-6">
          {isDbError
            ? "The database is temporarily unreachable. Check your connection settings or try again in a moment."
            : "An error occurred while loading this page. Please retry or navigate to another section."}
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="btn-primary h-10 px-5 text-sm flex items-center gap-2"
          >
            <RefreshCw size={13} /> Retry
          </button>
          <Link href="/admin" className="btn-ghost h-10 px-5 text-sm">
            Dashboard
          </Link>
        </div>
        {error.digest && (
          <p className="text-[10px] text-on-surface-faint mt-6 font-mono">
            {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
