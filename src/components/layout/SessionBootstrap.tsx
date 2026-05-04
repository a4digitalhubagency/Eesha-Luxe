"use client";

import { useEffect } from "react";
import { useSessionStore } from "@/store/session";

/**
 * On mount, hydrates the client session store from the server-side cookie.
 * Without this, a logged-in user who refreshes the page sees the UI as if
 * they were logged out (cart shows guest tabs, navbar shows account icon
 * pointing to /account which then bounces, etc.).
 */
export function SessionBootstrap() {
  const setUser = useSessionStore((s) => s.setUser);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled) return;
        if (data?.user) setUser(data.user);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [setUser]);

  return null;
}
