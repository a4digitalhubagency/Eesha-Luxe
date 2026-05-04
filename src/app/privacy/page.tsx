import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Eesha Luxe collects, uses, and protects your personal information.",
};

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "concierge@eeshaluxe.com";

export default function PrivacyPage() {
  return (
    <LegalPage eyebrow="Legal" title="Privacy Policy" lastUpdated="2026">
      <p>
        Eesha Luxe (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) respects your privacy and is committed to protecting the personal information you share with us. This Privacy Policy explains what data we collect, how we use it, and the choices you have.
      </p>

      <LegalSection number="1" title="Information We Collect">
        <p>We collect information you provide directly to us, including:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Name, email address, phone number, and shipping address when you create an account or place an order</li>
          <li>Payment information processed securely through our payment provider (PayStack) — we do not store card details on our servers</li>
          <li>Order history, preferences, and communications with our atelier team</li>
          <li>Technical data such as IP address, browser type, and pages visited (via standard server logs)</li>
        </ul>
      </LegalSection>

      <LegalSection number="2" title="How We Use Your Information">
        <p>We use your information to:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Process and fulfil your orders, including dispatch, delivery, and returns</li>
          <li>Send transactional emails (order confirmation, shipping updates, password resets)</li>
          <li>Respond to your enquiries and provide customer support</li>
          <li>Improve our products, services, and website experience</li>
          <li>Comply with legal obligations and prevent fraud</li>
        </ul>
      </LegalSection>

      <LegalSection number="3" title="Sharing Your Information">
        <p>We do not sell or rent your personal information. We share data only with:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Payment processors (PayStack) to process transactions</li>
          <li>Email service providers (Resend) to deliver transactional emails</li>
          <li>Image hosting (Cloudinary) for product photography</li>
          <li>Logistics partners to fulfil your delivery</li>
          <li>Authorities where required by law</li>
        </ul>
      </LegalSection>

      <LegalSection number="4" title="Data Retention">
        <p>
          We retain your personal information for as long as your account is active or as needed to provide our services, comply with legal obligations, resolve disputes, and enforce our agreements. You may request deletion of your account at any time by contacting us.
        </p>
      </LegalSection>

      <LegalSection number="5" title="Your Rights">
        <p>You have the right to:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Access the personal information we hold about you</li>
          <li>Request correction of inaccurate information</li>
          <li>Request deletion of your account and associated data</li>
          <li>Object to or restrict our processing of your data</li>
          <li>Withdraw consent for marketing communications at any time</li>
        </ul>
        <p>To exercise any of these rights, please contact us at <a href={`mailto:${ADMIN_EMAIL}`} className="text-primary underline underline-offset-2">{ADMIN_EMAIL}</a>.</p>
      </LegalSection>

      <LegalSection number="6" title="Cookies">
        <p>
          We use essential cookies to keep you signed in and remember your shopping cart. We do not currently use third-party tracking cookies. By using our site, you consent to the use of essential cookies.
        </p>
      </LegalSection>

      <LegalSection number="7" title="Security">
        <p>
          We use industry-standard measures to protect your data, including HTTPS encryption, secure password hashing, and signed payment requests. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
        </p>
      </LegalSection>

      <LegalSection number="8" title="Changes to This Policy">
        <p>
          We may update this policy from time to time. The &ldquo;last updated&rdquo; date at the top of this page reflects the most recent revision. We encourage you to review this policy periodically.
        </p>
      </LegalSection>

      <LegalSection number="9" title="Contact Us">
        <p>
          If you have any questions about this Privacy Policy or how we handle your data, please contact us at <a href={`mailto:${ADMIN_EMAIL}`} className="text-primary underline underline-offset-2">{ADMIN_EMAIL}</a>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}