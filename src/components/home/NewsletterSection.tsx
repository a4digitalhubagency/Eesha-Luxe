"use client";

import { useState } from "react";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  }

  return (
    <section className="bg-surface-low py-24 px-6 text-center">
      <p className="label mb-4">The Inner Circle</p>
      <h2
        className="text-4xl md:text-5xl text-on-surface mb-4"
        style={{ fontFamily: "var(--font-serif)", letterSpacing: "-0.02em" }}
      >
        Join The Atelier
      </h2>
      <p className="text-sm text-on-surface-muted max-w-sm mx-auto mb-10 leading-relaxed">
        Be the first to experience our new seasonal archives, exclusive editorial drops, and private member events.
      </p>

      {submitted ? (
        <p className="label text-primary">Thank you — welcome to the circle.</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch justify-center gap-0 max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            required
            className="flex-1 px-4 py-3 text-sm bg-surface-lowest text-on-surface placeholder:text-on-surface-faint outline-none border-b-2 border-b-[rgba(112,88,98,0.2)] focus:border-b-primary transition-colors"
          />
          <button type="submit" className="btn-primary rounded-none sm:rounded-[4px] sm:ml-2 mt-3 sm:mt-0">
            Subscribe
          </button>
        </form>
      )}
    </section>
  );
}
