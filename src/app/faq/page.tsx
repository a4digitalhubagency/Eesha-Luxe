import type { Metadata } from "next";
import { FaqAccordion } from "@/components/faq/FaqAccordion";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about ordering, shipping, returns, and care for Eesha Luxe pieces.",
};

const FAQ_SECTIONS = [
  {
    section: "Orders",
    items: [
      {
        q: "How do I place an order?",
        a: "Browse our collections, select your size and quantity, and add to your bag. From the cart, proceed to checkout — you may check out as a guest or sign in to your account.",
      },
      {
        q: "Can I make changes to my order after placing it?",
        a: "We process orders quickly to ensure timely dispatch. If you need to change or cancel an order, please contact us within 1 hour of placing it.",
      },
      {
        q: "How do I track my order?",
        a: "Once your order has been dispatched, you will receive an email with tracking details. You can also view your order status in your account under My Orders.",
      },
      {
        q: "What payment methods do you accept?",
        a: "All payments are processed securely via PayStack. We accept all major debit and credit cards.",
      },
    ],
  },
  {
    section: "Shipping & Delivery",
    items: [
      {
        q: "Where do you ship to?",
        a: "We currently ship within Nigeria. International shipping will be available soon — please contact us for trade enquiries.",
      },
      {
        q: "How long does delivery take?",
        a: "Orders are dispatched within 1–2 business days. Delivery typically takes 3–5 business days from dispatch, depending on your location.",
      },
      {
        q: "Is shipping free?",
        a: "Yes — complimentary express shipping is included on all orders.",
      },
    ],
  },
  {
    section: "Returns & Exchanges",
    items: [
      {
        q: "What is your return policy?",
        a: "We accept returns within 14 days of delivery. Items must be unworn, unwashed, and returned in their original packaging with all tags attached. Final sale items are excluded.",
      },
      {
        q: "How do I initiate a return?",
        a: "Please contact our atelier team via the Contact page with your order code (LX-XXXXXXXX) and reason for return. We will guide you through the process.",
      },
      {
        q: "When will I receive my refund?",
        a: "Once we receive and inspect your return, refunds are processed within 5–7 business days back to your original payment method.",
      },
    ],
  },
  {
    section: "Sizing & Care",
    items: [
      {
        q: "How do your sizes run?",
        a: "We use international sizing (XS – XL). Each product page includes specific measurements. For personalised fit advice, please contact us.",
      },
      {
        q: "How should I care for my pieces?",
        a: "Care instructions are listed on each product page under Composition & Care. Many of our pieces are dry-clean only — please follow the guidance to preserve the integrity of the fabric.",
      },
    ],
  },
  {
    section: "Account",
    items: [
      {
        q: "Do I need an account to shop?",
        a: "No — you may check out as a guest. However, creating an account allows you to track orders, save addresses, and access your order history.",
      },
      {
        q: "I forgot my password. What do I do?",
        a: "Click \"Forgot your password?\" on the sign-in page and we will email you a reset link. The link expires in 1 hour.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <div className="bg-surface min-h-screen">
      <div className="max-w-3xl mx-auto px-6 lg:px-10 py-16 md:py-24">
        <p className="label text-primary mb-4">Help & Support</p>
        <h1
          className="text-4xl md:text-5xl text-on-surface mb-4 leading-tight"
          style={{ fontFamily: "var(--font-serif)", letterSpacing: "-0.02em" }}
        >
          Frequently Asked Questions
        </h1>
        <p className="text-sm text-on-surface-muted mb-12">
          Can&apos;t find what you&apos;re looking for? Our atelier team is happy to help — please get in touch via our Contact page.
        </p>

        <div className="space-y-12">
          {FAQ_SECTIONS.map((section) => (
            <section key={section.section}>
              <h2 className="text-xs uppercase tracking-widest text-on-surface-faint border-b border-outline/15 pb-3 mb-2">
                {section.section}
              </h2>
              <FaqAccordion items={section.items} />
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}