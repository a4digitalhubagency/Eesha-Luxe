export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { MapPin, ChevronLeft } from "lucide-react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "My Addresses" };

export default async function AddressesPage() {
  const session = await getSession();
  if (!session) redirect("/login?from=/account/addresses");

  const addresses = await prisma.address.findMany({
    where: { userId: session.sub },
    orderBy: { isDefault: "desc" },
  });

  return (
    <div className="bg-surface min-h-screen">
      <div className="max-w-3xl mx-auto px-5 md:px-6 py-10">

        <div className="flex items-center gap-3 mb-8">
          <Link href="/account" className="text-on-surface-faint hover:text-primary transition-colors">
            <ChevronLeft size={18} />
          </Link>
          <div>
            <p className="label text-on-surface-faint">My Atelier</p>
            <h1 className="text-3xl text-on-surface" style={{ fontFamily: "var(--font-serif)", letterSpacing: "-0.02em" }}>
              Shipping Addresses
            </h1>
          </div>
        </div>

        {addresses.length === 0 ? (
          <div className="flex flex-col items-center text-center py-20">
            <div className="w-14 h-14 rounded-sm bg-surface-low flex items-center justify-center mb-5">
              <MapPin size={22} strokeWidth={1.5} className="text-on-surface-faint" />
            </div>
            <p className="text-xl text-on-surface mb-2" style={{ fontFamily: "var(--font-serif)" }}>No addresses saved</p>
            <p className="text-sm text-on-surface-faint mb-6 max-w-xs leading-relaxed">
              Your shipping addresses will appear here. Addresses are saved automatically when you place an order.
            </p>
            <Link href="/collections" className="btn-primary inline-flex items-center gap-2 text-sm">
              Shop &amp; Save Address
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {addresses.map((address) => (
              <div
                key={address.id}
                className={`bg-surface-lowest rounded-sm p-5 border-l-2 ${address.isDefault ? "border-primary/60" : "border-outline/15"}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <MapPin size={13} className="text-on-surface-faint shrink-0 mt-0.5" />
                    {address.isDefault && (
                      <span className="text-[10px] uppercase tracking-widest text-primary font-medium">Default</span>
                    )}
                  </div>
                </div>
                <p className="text-sm font-medium text-on-surface mb-1">{address.line1}</p>
                {address.line2 && <p className="text-sm text-on-surface-muted">{address.line2}</p>}
                <p className="text-sm text-on-surface-muted">
                  {address.city}, {address.state} {address.postalCode}
                </p>
                <p className="text-sm text-on-surface-muted">{address.country}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
