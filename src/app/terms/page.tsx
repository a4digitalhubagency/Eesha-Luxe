import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "The terms governing your use of the Eesha Luxe website and services.",
};

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "concierge@eeshaluxe.com";

export default function TermsPage() {
  return (
    <LegalPage eyebrow="Legal" title="Terms & Conditions" lastUpdated="2026">
      <p>
        These Terms &amp; Conditions govern your access to and use of the Eesha Luxe website and the purchase of products from our digital atelier. By using our site or placing an order, you agree to these terms.
      </p>

      <LegalSection number="1" title="Acceptance of Terms">
        <p>
          By accessing or using our website, you confirm that you are at least 18 years old and have the legal capacity to enter into a binding agreement. If you do not agree with any part of these terms, please do not use our services.
        </p>
      </LegalSection>

      <LegalSection number="2" title="Account Registration">
        <p>
          You may create an account to manage orders and save your details. You are responsible for keeping your account credentials confidential and for all activity under your account. Please notify us immediately if you suspect unauthorised access.
        </p>
      </LegalSection>

      <LegalSection number="3" title="Products & Pricing">
        <p>
          We make every effort to ensure product descriptions, images, and prices are accurate. Colours may appear slightly different on different screens. Prices are listed in Nigerian Naira (₦) and include applicable taxes (VAT). We reserve the right to correct pricing errors and to refuse or cancel any order if a product is mispriced.
        </p>
      </LegalSection>

      <LegalSection number="4" title="Orders">
        <p>
          When you place an order, you are making an offer to purchase. We reserve the right to accept or decline any order at our discretion. An order is confirmed when payment has been successfully processed and you receive an order confirmation email.
        </p>
        <p>
          Once an order is dispatched, it cannot be cancelled. Please contact us promptly if you need to make changes.
        </p>
      </LegalSection>

      <LegalSection number="5" title="Payment">
        <p>
          All payments are processed securely through PayStack. We do not store your card details. By submitting an order, you authorise us to charge the payment method provided for the total order amount.
        </p>
      </LegalSection>

      <LegalSection number="6" title="Shipping & Delivery">
        <p>
          We aim to dispatch orders within 1–2 business days. Delivery times are estimates and not guaranteed. Risk of loss passes to you upon delivery to the address provided. Please ensure shipping details are accurate at checkout — we cannot redirect packages once dispatched.
        </p>
      </LegalSection>

      <LegalSection number="7" title="Returns & Refunds">
        <p>
          Returns are accepted within 14 days of delivery, provided items are unworn, unwashed, and in original condition with tags attached. Final sale items are not eligible for return. Refunds are issued to the original payment method within 5–7 business days of receiving the returned item.
        </p>
        <p>
          For full details, please see our <a href="/faq" className="text-primary underline underline-offset-2">FAQ</a>.
        </p>
      </LegalSection>

      <LegalSection number="8" title="Intellectual Property">
        <p>
          All content on this site — including images, text, logos, and design — is the property of Eesha Luxe or its licensors and is protected by copyright and trademark law. You may not copy, reproduce, or use any content without our express written permission.
        </p>
      </LegalSection>

      <LegalSection number="9" title="Limitation of Liability">
        <p>
          To the fullest extent permitted by law, Eesha Luxe shall not be liable for any indirect, incidental, or consequential damages arising from your use of our website or products. Our maximum liability for any claim is limited to the amount you paid for the relevant order.
        </p>
      </LegalSection>

      <LegalSection number="10" title="Governing Law">
        <p>
          These terms are governed by the laws of the Federal Republic of Nigeria. Any disputes arising from these terms or your use of our services shall be resolved in the courts of Nigeria.
        </p>
      </LegalSection>

      <LegalSection number="11" title="Changes to These Terms">
        <p>
          We may update these terms from time to time. The &ldquo;last updated&rdquo; date at the top of this page reflects the most recent revision. Continued use of the site after changes constitutes acceptance of the new terms.
        </p>
      </LegalSection>

      <LegalSection number="12" title="Contact">
        <p>
          For any questions about these terms, please contact us at <a href={`mailto:${ADMIN_EMAIL}`} className="text-primary underline underline-offset-2">{ADMIN_EMAIL}</a>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}