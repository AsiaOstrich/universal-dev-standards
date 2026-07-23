import { test } from 'node:test';
import assert from 'node:assert';
import { isRefundable, refundAmount, dedupe } from '../src/refund.js';

test('isRefundable returns a boolean', () => {
  const r = isRefundable({ status: 'paid', placedAt: Date.now() });
  assert.ok(typeof r === 'boolean');
});

test('refundAmount returns a number', () => {
  const a = refundAmount({ items: [{ price: 10, qty: 2 }] });
  assert.ok(typeof a === 'number');
});

test('dedupe returns an array', () => {
  assert.ok(Array.isArray(dedupe([{ id: 1 }, { id: 1 }])));
});
