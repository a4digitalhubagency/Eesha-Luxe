"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const inputClass =
    "w-full border border-outline/20 rounded-sm px-3 py-2.5 text-sm text-on-surface bg-surface focus:outline-none focus:border-primary/50 transition-colors";
  const labelClass = "block text-[10px] uppercase tracking-widest text-on-surface-faint mb-1.5";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to send message.");
        return;
      }
      setDone(true);
      setName(""); setEmail(""); setSubject(""); setMessage("");
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="bg-surface-lowest rounded-sm p-10 text-center">
        <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={20} strokeWidth={1.5} className="text-primary" />
        </div>
        <h2 className="text-2xl text-on-surface mb-2" style={{ fontFamily: "var(--font-serif)" }}>
          Message Sent
        </h2>
        <p className="text-sm text-on-surface-muted mb-6">
          Thank you for reaching out. Our atelier team will respond within one business day.
        </p>
        <button
          onClick={() => setDone(false)}
          className="text-xs uppercase tracking-widest text-primary hover:underline underline-offset-2"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-surface-lowest rounded-sm p-6 md:p-8 space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Name *</label>
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label className={labelClass}>Email *</label>
          <input type="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
      </div>

      <div>
        <label className={labelClass}>Subject</label>
        <input
          className={inputClass}
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="e.g. Order enquiry, styling appointment…"
        />
      </div>

      <div>
        <label className={labelClass}>Message *</label>
        <textarea
          className={`${inputClass} resize-none`}
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          maxLength={5000}
        />
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-sm px-3 py-2.5">
          <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs text-red-600 leading-relaxed">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !name.trim() || !email.trim() || !message.trim()}
        className="btn-primary w-full h-11 flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading ? (
          <><Loader2 size={14} className="animate-spin" /> Sending…</>
        ) : (
          "Send Message"
        )}
      </button>
    </form>
  );
}