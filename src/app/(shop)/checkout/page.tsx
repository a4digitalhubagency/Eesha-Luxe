import type { Metadata } from "next";
import { CheckoutHeader } from "@/components/checkout/CheckoutHeader";
import { CheckoutView } from "@/components/checkout/CheckoutView";

export const metadata: Metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return (
    <div className="bg-surface min-h-screen">
      <CheckoutHeader />
      <CheckoutView />
    </div>
  );
}
