import { Resend } from 'resend';

const apiKey = process.env.RESEND_API_KEY;
// Gracefully skip sending if key is missing or still a placeholder
const resend = apiKey && !apiKey.startsWith('re_placeholder') ? new Resend(apiKey) : null;

const FROM = 'RallyPoint <onboarding@resend.dev>';
const APP_URL = process.env.NEXTAUTH_URL ?? 'https://rallypoint-pickleball-hub.vercel.app';

// ─── Booking confirmation ─────────────────────────────────────────────────

export async function sendBookingConfirmation(opts: {
  to: string;
  name: string;
  courtName: string;
  date: string;
  startTime: string;
  totalAmount: number;
}) {
  if (!resend) return;
  await resend.emails
    .send({
      from: FROM,
      to: opts.to,
      subject: `Booking confirmed — ${opts.courtName} on ${opts.date}`,
      html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#fff">
        <h2 style="color:#15803d;margin:0 0 8px">Booking Confirmed</h2>
        <p style="color:#374151;margin:0 0 24px">Hi ${opts.name}, your court is booked!</p>
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;margin:0 0 24px">
          <p style="margin:0 0 6px;font-size:14px;color:#166534"><strong>Court:</strong> ${opts.courtName}</p>
          <p style="margin:0 0 6px;font-size:14px;color:#166534"><strong>Date:</strong> ${opts.date}</p>
          <p style="margin:0 0 6px;font-size:14px;color:#166534"><strong>Time:</strong> ${opts.startTime}</p>
          <p style="margin:0;font-size:14px;color:#166534"><strong>Amount:</strong> USD $${opts.totalAmount.toFixed(2)}</p>
        </div>
        <p style="font-size:13px;color:#6b7280">You earned <strong>50 points</strong> for this booking.</p>
        <a href="${APP_URL}/dashboard/orders" style="display:inline-block;margin-top:16px;background:#15803d;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600">View Booking History</a>
        <p style="margin-top:32px;font-size:12px;color:#9ca3af">RallyPoint Pickleball Hub &bull; Trinidad and Tobago</p>
      </div>
    `,
    })
    .catch(() => {
      // Non-fatal — log and continue
      console.warn('Failed to send booking confirmation email');
    });
}

// ─── Order confirmation ───────────────────────────────────────────────────

export async function sendOrderConfirmation(opts: {
  to: string;
  name: string;
  orderId: string;
  items: { name: string; quantity: number; unitPrice: number }[];
  totalAmount: number;
}) {
  if (!resend) return;
  const itemRows = opts.items
    .map(
      (i) =>
        `<tr><td style="padding:6px 0;font-size:14px;color:#374151">${i.name}${i.quantity > 1 ? ` x${i.quantity}` : ''}</td><td style="padding:6px 0;font-size:14px;color:#374151;text-align:right">$${(i.unitPrice * i.quantity).toFixed(2)}</td></tr>`,
    )
    .join('');

  await resend.emails
    .send({
      from: FROM,
      to: opts.to,
      subject: `Order confirmed — USD $${opts.totalAmount.toFixed(2)}`,
      html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#fff">
        <h2 style="color:#15803d;margin:0 0 8px">Order Confirmed</h2>
        <p style="color:#374151;margin:0 0 24px">Hi ${opts.name}, your equipment order is on its way!</p>
        <table style="width:100%;border-collapse:collapse;margin:0 0 16px">
          ${itemRows}
          <tr style="border-top:2px solid #f3f4f6">
            <td style="padding:10px 0 4px;font-weight:700;color:#111827">Total</td>
            <td style="padding:10px 0 4px;font-weight:700;color:#15803d;text-align:right">USD $${opts.totalAmount.toFixed(2)}</td>
          </tr>
        </table>
        <p style="font-size:13px;color:#6b7280">You earned <strong>${Math.floor(opts.totalAmount)} points</strong> for this order. Free local delivery on orders over $100.</p>
        <a href="${APP_URL}/dashboard/orders" style="display:inline-block;margin-top:16px;background:#15803d;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600">View Order History</a>
        <p style="margin-top:32px;font-size:12px;color:#9ca3af">RallyPoint Pickleball Hub &bull; Trinidad and Tobago</p>
      </div>
    `,
    })
    .catch(() => {
      console.warn('Failed to send order confirmation email');
    });
}

// ─── Cancellation notice ──────────────────────────────────────────────────

export async function sendCancellationNotice(opts: {
  to: string;
  name: string;
  type: 'booking' | 'order';
  detail: string; // e.g. "Court 1 on 2026-04-20 at 09:00" or "Equipment order #abc"
}) {
  if (!resend) return;
  await resend.emails
    .send({
      from: FROM,
      to: opts.to,
      subject: `${opts.type === 'booking' ? 'Booking' : 'Order'} cancelled`,
      html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#fff">
        <h2 style="color:#dc2626;margin:0 0 8px">${opts.type === 'booking' ? 'Booking' : 'Order'} Cancelled</h2>
        <p style="color:#374151;margin:0 0 24px">Hi ${opts.name}, your ${opts.type} has been cancelled.</p>
        <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:20px;margin:0 0 24px">
          <p style="margin:0;font-size:14px;color:#991b1b">${opts.detail}</p>
        </div>
        ${opts.type === 'booking' ? '<p style="font-size:13px;color:#6b7280">50 points have been deducted from your account. The court slot has been released.</p>' : '<p style="font-size:13px;color:#6b7280">Your purchase points have been reversed. Stock has been restored.</p>'}
        <a href="${APP_URL}/dashboard/orders" style="display:inline-block;margin-top:16px;background:#374151;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600">View History</a>
        <p style="margin-top:32px;font-size:12px;color:#9ca3af">RallyPoint Pickleball Hub &bull; Trinidad and Tobago</p>
      </div>
    `,
    })
    .catch(() => {
      console.warn('Failed to send cancellation email');
    });
}

// ─── Welcome email ─────────────────────────────────────────────────────────

export async function sendWelcomeEmail(opts: { to: string; name: string }) {
  if (!resend) return;
  await resend.emails
    .send({
      from: FROM,
      to: opts.to,
      subject: 'Welcome to RallyPoint Pickleball Hub!',
      html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#fff">
        <h2 style="color:#15803d;margin:0 0 8px">Welcome to RallyPoint!</h2>
        <p style="color:#374151;margin:0 0 24px">Hi ${opts.name}, your account is ready. You have <strong>1,000 welcome points</strong> waiting in your account.</p>
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;margin:0 0 24px">
          <p style="margin:0 0 6px;font-size:14px;color:#166534">Book a court and earn <strong>50 points</strong></p>
          <p style="margin:0 0 6px;font-size:14px;color:#166534">Shop equipment and earn <strong>1 pt per $1</strong></p>
          <p style="margin:0;font-size:14px;color:#166534">Refer a friend and earn <strong>250 points</strong></p>
        </div>
        <a href="${APP_URL}/dashboard" style="display:inline-block;background:#15803d;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600">Go to My Dashboard</a>
        <p style="margin-top:32px;font-size:12px;color:#9ca3af">RallyPoint Pickleball Hub &bull; Trinidad and Tobago</p>
      </div>
    `,
    })
    .catch(() => {
      console.warn('Failed to send welcome email');
    });
}
