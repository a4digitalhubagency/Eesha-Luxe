"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { SessionBootstrap } from "./SessionBootstrap";

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isCheckout = pathname.startsWith("/checkout");
  const isAuth = pathname.startsWith("/login") || pathname.startsWith("/register");

  if (isCheckout || isAuth) {
    return (
      <>
        <SessionBootstrap />
        {children}
      </>
    );
  }

  return (
    <>
      <SessionBootstrap />
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
