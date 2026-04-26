import type { Metadata } from "next";
import { AccountView } from "@/components/account/AccountView";

export const metadata: Metadata = { title: "My Atelier" };

export default function AccountPage() {
  return <AccountView />;
}
