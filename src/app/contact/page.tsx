import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/ContactForm";
import { Mail, AtSign } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the Eesha Luxe atelier.",
};

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "concierge@eeshaluxe.com";

export default function ContactPage() {
  return (
    <div className="bg-surface min-h-screen">
      <div className="max-w-5xl mx-auto px-6 lg:px-10 py-16 md:py-24">
        <p className="label text-primary mb-4">Get in Touch</p>
        <h1
          className="text-4xl md:text-5xl text-on-surface mb-4 leading-tight"
          style={{ fontFamily: "var(--font-serif)", letterSpacing: "-0.02em" }}
        >
          Speak with the Atelier
        </h1>
        <p className="text-sm text-on-surface-muted mb-12 max-w-xl">
          Whether you have a question about an order, need styling guidance, or want to discuss a private appointment — we&apos;re here.
        </p>

        <div className="grid md:grid-cols-[1fr_280px] gap-12">
          <ContactForm />

          <aside className="flex flex-col gap-8">
            <div>
              <p className="label text-on-surface-faint mb-3">Direct</p>
              <a
                href={`mailto:${ADMIN_EMAIL}`}
                className="flex items-start gap-2 text-sm text-on-surface hover:text-primary transition-colors"
              >
                <Mail size={14} strokeWidth={1.5} className="mt-0.5 shrink-0" />
                <span>{ADMIN_EMAIL}</span>
              </a>
            </div>

            <div>
              <p className="label text-on-surface-faint mb-3">Hours</p>
              <p className="text-sm text-on-surface">Monday – Friday</p>
              <p className="text-sm text-on-surface-muted">9:00am – 6:00pm WAT</p>
            </div>

            <div>
              <p className="label text-on-surface-faint mb-3">Social</p>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-on-surface hover:text-primary transition-colors"
              >
                <AtSign size={14} strokeWidth={1.5} />
                <span>eeshaluxe on Instagram</span>
              </a>
            </div>

            <div>
              <p className="label text-on-surface-faint mb-3">Response Time</p>
              <p className="text-xs text-on-surface-muted leading-relaxed">
                We aim to reply within one business day. For urgent order matters, please reference your order code (LX-XXXXXXXX).
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}