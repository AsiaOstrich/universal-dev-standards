/**
 * The one rule for "a baseline list with an expiry date" (dev-platform decision 616乙, 2026-11-20).
 *
 * A baseline is a list of things somebody chose NOT to fix yet. The expiry date is the clock on THAT
 * list, not the clock on the gate. So:
 *
 *   - empty list                        -> `empty`      pass; the date is not looked at at all
 *   - non-empty, date present, not past -> `ok`         pass
 *   - non-empty, date past              -> `expired`    FAIL
 *   - non-empty, no (valid) date        -> `no-expiry`  FAIL (an exception list with no clock is a polite delete key)
 *
 * Why the empty case does not look at the date: a gate that turns red because a list of nothing has
 * a date in the past is red for a thing that does not exist. Long-red gates get switched off, and
 * the switch-off takes the half of the gate that still works with it.
 *
 * Why `no-expiry` fails instead of passing: `undefined < '2026-11-20'` is `false`, so "no date"
 * used to read as "not expired". That is the opposite of what an absent clock means.
 *
 * "Valid date" means `YYYY-MM-DD` and a real calendar day. Anything else counts as no date.
 *
 * Dates are compared as strings; `today` is injected so tests never depend on the day they run.
 */

const DATE_SHAPE = /^\d{4}-\d{2}-\d{2}$/;

/** @param {unknown} s */
export function isValidIsoDate(s) {
  if (typeof s !== 'string' || !DATE_SHAPE.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

/**
 * @param {{ size: number, expires: unknown, today: string }} input
 * @returns {{ state: 'empty' | 'ok' | 'expired' | 'no-expiry', failed: boolean }}
 */
export function judgeBaselineExpiry({ size, expires, today }) {
  if (!isValidIsoDate(today)) throw new Error(`judgeBaselineExpiry: today is not YYYY-MM-DD: '${today}'`);
  if (!Number.isInteger(size) || size < 0) throw new Error(`judgeBaselineExpiry: size must be a count, got '${size}'`);
  if (size === 0) return { state: 'empty', failed: false };
  if (!isValidIsoDate(expires)) return { state: 'no-expiry', failed: true };
  if (expires < today) return { state: 'expired', failed: true };
  return { state: 'ok', failed: false };
}
