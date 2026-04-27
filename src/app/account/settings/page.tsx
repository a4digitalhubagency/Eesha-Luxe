export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AccountSettingsForm } from "@/components/account/AccountSettingsForm";

export const metadata: Metadata = { title: "Account Settings" };

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect("/login?from=/account/settings");

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  if (!user) redirect("/login");

  return (
    <div className="bg-surface min-h-screen">
      <div className="max-w-xl mx-auto px-5 md:px-6 py-10">

        <div className="flex items-center gap-3 mb-8">
          <Link href="/account" className="text-on-surface-faint hover:text-primary transition-colors">
            <ChevronLeft size={18} />
          </Link>
          <div>
            <p className="label text-on-surface-faint">My Atelier</p>
            <h1 className="text-3xl text-on-surface" style={{ fontFamily: "var(--font-serif)", letterSpacing: "-0.02em" }}>
              Account Settings
            </h1>
          </div>
        </div>

        <AccountSettingsForm user={user} />
      </div>
    </div>
  );
}
