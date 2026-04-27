import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM ?? "orders@eeshaluxe.com";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL!;

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface ShippingAddress {
  firstName: string;
  lastName: string;
  line1: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface EmailOrderParams {
  customerEmail: string;
  customerName: string;
  orderRef: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  shipping: ShippingAddress;
}

function fmt(amount: number) {
  return `₦${amount.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
}

function itemRows(items: OrderItem[]) {
  return items
    .map(
      (item) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #f0ebe4;font-size:13px;color:#1a1a1a;">${item.name}</td>
        <td style="padding:12px 0;border-bottom:1px solid #f0ebe4;font-size:13px;color:#6b6560;text-align:center;">${item.quantity}</td>
        <td style="padding:12px 0;border-bottom:1px solid #f0ebe4;font-size:13px;color:#1a1a1a;text-align:right;">${fmt(item.price * item.quantity)}</td>
      </tr>`
    )
    .join("");
}

function baseLayout(content: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#faf9f7;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf9f7;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;max-width:600px;width:100%;">
        <!-- Header -->
        <tr>
          <td style="background:#0a0908;padding:28px 40px;text-align:center;">
            <p style="margin:0;color:#c9b99a;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;">Eesha Luxe</p>
            <p style="margin:4px 0 0;color:#f5f0e8;font-size:22px;letter-spacing:-0.02em;">The Digital Atelier</p>
          </td>
        </tr>
        <!-- Body -->
        <tr><td style="padding:40px;">${content}</td></tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f5f0e8;padding:20px 40px;text-align:center;">
            <p style="margin:0;font-size:10px;color:#9c9189;letter-spacing:0.15em;text-transform:uppercase;">
              © ${new Date().getFullYear()} Eesha Luxe · The Digital Atelier
            </p>
            <p style="margin:6px 0 0;font-size:10px;color:#9c9189;">
              For assistance, reply to this email or contact our atelier team.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendCustomerConfirmation(params: EmailOrderParams) {
  const { customerEmail, customerName, orderRef, items, subtotal, tax, total, shipping } = params;

  const html = baseLayout(`
    <p style="margin:0 0 4px;font-size:11px;color:#c9b99a;letter-spacing:0.15em;text-transform:uppercase;">Order Confirmed</p>
    <h1 style="margin:0 0 24px;font-size:28px;color:#0a0908;letter-spacing:-0.02em;">Thank You, ${shipping.firstName}.</h1>

    <p style="margin:0 0 24px;font-size:14px;color:#6b6560;line-height:1.7;">
      Your order has been received and is being prepared with care.
      We will notify you once it has been dispatched.
    </p>

    <div style="background:#faf9f7;padding:16px 20px;margin-bottom:32px;">
      <p style="margin:0;font-size:11px;color:#9c9189;letter-spacing:0.1em;text-transform:uppercase;">Order Reference</p>
      <p style="margin:4px 0 0;font-size:20px;color:#0a0908;letter-spacing:0.05em;">${orderRef}</p>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <thead>
        <tr>
          <th style="text-align:left;font-size:10px;color:#9c9189;letter-spacing:0.1em;text-transform:uppercase;padding-bottom:8px;border-bottom:2px solid #f0ebe4;">Item</th>
          <th style="text-align:center;font-size:10px;color:#9c9189;letter-spacing:0.1em;text-transform:uppercase;padding-bottom:8px;border-bottom:2px solid #f0ebe4;">Qty</th>
          <th style="text-align:right;font-size:10px;color:#9c9189;letter-spacing:0.1em;text-transform:uppercase;padding-bottom:8px;border-bottom:2px solid #f0ebe4;">Price</th>
        </tr>
      </thead>
      <tbody>${itemRows(items)}</tbody>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
      <tr>
        <td style="font-size:13px;color:#6b6560;padding:4px 0;">Subtotal</td>
        <td style="font-size:13px;color:#6b6560;text-align:right;padding:4px 0;">${fmt(subtotal)}</td>
      </tr>
      <tr>
        <td style="font-size:13px;color:#6b6560;padding:4px 0;">Shipping</td>
        <td style="font-size:13px;color:#6b6560;text-align:right;padding:4px 0;">Complimentary</td>
      </tr>
      <tr>
        <td style="font-size:13px;color:#6b6560;padding:4px 0;">Tax</td>
        <td style="font-size:13px;color:#6b6560;text-align:right;padding:4px 0;">${fmt(tax)}</td>
      </tr>
      <tr>
        <td style="font-size:15px;color:#0a0908;font-weight:bold;padding:12px 0 4px;border-top:1px solid #f0ebe4;">Total</td>
        <td style="font-size:15px;color:#0a0908;font-weight:bold;text-align:right;padding:12px 0 4px;border-top:1px solid #f0ebe4;">${fmt(total)}</td>
      </tr>
    </table>

    <div style="background:#faf9f7;padding:20px;margin-bottom:32px;">
      <p style="margin:0 0 8px;font-size:11px;color:#9c9189;letter-spacing:0.1em;text-transform:uppercase;">Shipping Address</p>
      <p style="margin:0;font-size:13px;color:#1a1a1a;line-height:1.8;">
        ${shipping.firstName} ${shipping.lastName}<br>
        ${shipping.line1}<br>
        ${shipping.city}, ${shipping.state} ${shipping.postalCode}<br>
        ${shipping.country}
      </p>
    </div>

    <div style="border-left:3px solid #c9b99a;padding:12px 16px;background:#fdf9f4;">
      <p style="margin:0;font-size:12px;color:#6b6560;line-height:1.6;">
        <strong style="color:#0a0908;">Expected Delivery:</strong> 3–5 business days after dispatch.<br>
        You will receive a shipping confirmation with tracking details.
      </p>
    </div>
  `);

  return resend.emails.send({
    from: FROM,
    to: customerEmail,
    subject: `Order Confirmed · ${orderRef} — Eesha Luxe`,
    html,
  });
}

export async function sendAdminNotification(params: EmailOrderParams) {
  const { customerEmail, customerName, orderRef, items, subtotal, tax, total, shipping } = params;

  const html = baseLayout(`
    <p style="margin:0 0 4px;font-size:11px;color:#c9b99a;letter-spacing:0.15em;text-transform:uppercase;">New Order Received</p>
    <h1 style="margin:0 0 24px;font-size:28px;color:#0a0908;letter-spacing:-0.02em;">${orderRef}</h1>

    <div style="background:#faf9f7;padding:20px;margin-bottom:24px;">
      <p style="margin:0 0 8px;font-size:11px;color:#9c9189;letter-spacing:0.1em;text-transform:uppercase;">Customer</p>
      <p style="margin:0;font-size:13px;color:#1a1a1a;line-height:1.8;">
        <strong>${customerName}</strong><br>
        ${customerEmail}<br><br>
        ${shipping.firstName} ${shipping.lastName}<br>
        ${shipping.line1}<br>
        ${shipping.city}, ${shipping.state} ${shipping.postalCode}<br>
        ${shipping.country}
      </p>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <thead>
        <tr>
          <th style="text-align:left;font-size:10px;color:#9c9189;letter-spacing:0.1em;text-transform:uppercase;padding-bottom:8px;border-bottom:2px solid #f0ebe4;">Item</th>
          <th style="text-align:center;font-size:10px;color:#9c9189;letter-spacing:0.1em;text-transform:uppercase;padding-bottom:8px;border-bottom:2px solid #f0ebe4;">Qty</th>
          <th style="text-align:right;font-size:10px;color:#9c9189;letter-spacing:0.1em;text-transform:uppercase;padding-bottom:8px;border-bottom:2px solid #f0ebe4;">Price</th>
        </tr>
      </thead>
      <tbody>${itemRows(items)}</tbody>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="font-size:13px;color:#6b6560;padding:4px 0;">Subtotal</td>
        <td style="font-size:13px;color:#6b6560;text-align:right;">${fmt(subtotal)}</td>
      </tr>
      <tr>
        <td style="font-size:13px;color:#6b6560;padding:4px 0;">Tax</td>
        <td style="font-size:13px;color:#6b6560;text-align:right;">${fmt(tax)}</td>
      </tr>
      <tr>
        <td style="font-size:15px;color:#0a0908;font-weight:bold;padding:12px 0 4px;border-top:1px solid #f0ebe4;"><strong>Total</strong></td>
        <td style="font-size:15px;color:#0a0908;font-weight:bold;text-align:right;padding:12px 0 4px;border-top:1px solid #f0ebe4;">${fmt(total)}</td>
      </tr>
    </table>
  `);

  return resend.emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `[New Order] ${orderRef} · ${fmt(total)} from ${customerName}`,
    html,
  });
}
