import { ReactNode } from "react";

interface Props {
  eyebrow: string;
  title: string;
  lastUpdated: string;
  children: ReactNode;
}

export function LegalPage({ eyebrow, title, lastUpdated, children }: Props) {
  return (
    <div className="bg-surface min-h-screen">
      <div className="max-w-3xl mx-auto px-6 lg:px-10 py-16 md:py-24">
        <p className="label text-primary mb-4">{eyebrow}</p>
        <h1
          className="text-4xl md:text-5xl text-on-surface mb-3 leading-tight"
          style={{ fontFamily: "var(--font-serif)", letterSpacing: "-0.02em" }}
        >
          {title}
        </h1>
        <p className="text-xs uppercase tracking-widest text-on-surface-faint mb-12">
          Last updated · {lastUpdated}
        </p>

        <article className="prose-legal text-sm text-on-surface-muted leading-relaxed space-y-8">
          {children}
        </article>

        <div className="mt-16 pt-8 border-t border-outline/10 text-xs text-on-surface-faint italic">
          This document is provided for informational purposes. We recommend reviewing it with qualified legal counsel before relying on it for your business.
        </div>
      </div>
    </div>
  );
}

interface SectionProps {
  number: string;
  title: string;
  children: ReactNode;
}

export function LegalSection({ number, title, children }: SectionProps) {
  return (
    <section>
      <h2 className="text-base text-on-surface mb-3" style={{ fontFamily: "var(--font-serif)" }}>
        {number}. {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}