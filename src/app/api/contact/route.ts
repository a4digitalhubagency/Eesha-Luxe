import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { handleApiError, safeJson } from "@/lib/errors";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM ?? "onboarding@resend.dev";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL!;

export async function POST(req: NextRequest) {
  try {
    const body = await safeJson<{ name?: string; email?: string; subject?: string; message?: string }>(req);
    if (!body) return NextResponse.json({ error: "Invalid request body." }, { status: 400 });

    const name = body.name?.trim();
    const email = body.email?.trim();
    const subject = body.subject?.trim();
    const message = body.message?.trim();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email, and message are required." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }
    if (message.length > 5000) {
      return NextResponse.json({ error: "Message is too long." }, { status: 400 });
    }

    await resend.emails.send({
      from: FROM,
      to: ADMIN_EMAIL,
      replyTo: email,
      subject: `[Contact] ${subject || "New message"} — from ${name}`,
      html: `
        <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:24px;">
          <p style="font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#9c9189;">New Contact Message</p>
          <h2 style="margin:8px 0 24px;color:#0a0908;">From ${name}</h2>
          <p style="margin:0 0 4px;font-size:11px;color:#9c9189;text-transform:uppercase;letter-spacing:0.1em;">Email</p>
          <p style="margin:0 0 16px;color:#1a1a1a;">${email}</p>
          ${subject ? `<p style="margin:0 0 4px;font-size:11px;color:#9c9189;text-transform:uppercase;letter-spacing:0.1em;">Subject</p><p style="margin:0 0 16px;color:#1a1a1a;">${subject}</p>` : ""}
          <p style="margin:0 0 4px;font-size:11px;color:#9c9189;text-transform:uppercase;letter-spacing:0.1em;">Message</p>
          <p style="margin:0;color:#1a1a1a;line-height:1.7;white-space:pre-wrap;">${message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err, "Failed to send message. Please try again or email us directly.");
  }
}