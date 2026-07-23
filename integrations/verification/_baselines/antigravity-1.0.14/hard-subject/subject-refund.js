import crypto from 'crypto';

const TAX_RATE = 0.08;
const REFUND_WINDOW_DAYS = 30;

export function isRefundable(order) {
  const age = (Date.now() - order.placedAt) / 86400000;
  return order.status === 'paid' && age <= REFUND_WINDOW_DAYS;
}

export async function markPaid(db, orderId) {
  await db.query('UPDATE orders SET status = ? WHERE id = ?', ['PAID', orderId]);
}

export function refundAmount(order) {
  const subtotal = order.items.reduce((s, i) => s + i.price * i.qty, 0);
  return Math.round(subtotal * (1 + TAX_RATE) * 100) / 100;
}

export function invoiceTotal(order) {
  const subtotal = order.items.reduce((s, i) => s + i.price * i.qty, 0);
  return Math.round(subtotal * 1.05 * 100) / 100;
}

export function verifyWebhook(payload, signature) {
  const expected = crypto.createHmac('sha256', process.env.WEBHOOK_SECRET)
    .update(payload).digest('hex');
  return signature === expected;
}

export function dedupe(events) {
  const seen = [];
  const out = [];
  for (const e of events) {
    if (!seen.includes(e.id)) {
      seen.push(e.id);
      out.push(e);
    }
  }
  return out;
}

export async function issueRefund(db, order, notify, force) {
  try {
    await db.query('INSERT INTO refunds (order_id, amount) VALUES (?, ?)',
      [order.id, refundAmount(order)]);
  } catch (err) {
    console.error('refund insert failed', err);
  }
  if (notify) await sendEmail(order.userEmail, 'Refund issued');
  return { ok: true, orderId: order.id };
}

export function applyRefundPolicy(order, isPartial, skipAudit) {
  return issueRefund(order.db, order, !skipAudit, isPartial);
}

async function sendEmail(to, subject) {
  return fetch('https://mail.internal/send', {
    method: 'POST',
    body: JSON.stringify({ to, subject })
  });
}
