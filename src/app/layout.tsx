import type { Metadata } from "next";
import { Manrope, Noto_Serif } from "next/font/google";
import "./globals.css";
import { ConditionalLayout } from "@/components/layout/ConditionalLayout";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const notoSerif = Noto_Serif({
  subsets: ["latin"],
  variable: "--font-noto-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Eesha Luxe — The Digital Atelier",
    template: "%s | Eesha Luxe",
  },
  description: "A curated editorial experience. Luxury goods for the modern connoisseur.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${manrope.variable} ${notoSerif.variable}`}>
      <body suppressHydrationWarning>
        <ConditionalLayout>{children}</ConditionalLayout>
      </body>
    </html>
  );
}
