/**
 * scheduler.mjs
 * Determine whether a scheduled publish_at time is within the trigger window.
 */

const WINDOW_MS = 15 * 60 * 1000; // ±15 minutes

/**
 * Returns true if publish_at is within ±WINDOW_MS of now.
 * @param {string} publishAt  ISO8601 UTC string
 * @param {Date}   [now]      override for testing
 */
export function isWithinWindow(publishAt, now = new Date()) {
  if (!publishAt) return false;
  const target = new Date(publishAt);
  if (isNaN(target.getTime())) {
    throw new Error(`Invalid publish_at timestamp: ${publishAt}`);
  }
  const diff = Math.abs(target.getTime() - now.getTime());
  return diff <= WINDOW_MS;
}

/**
 * Returns true if publish_at is in the past (missed window).
 * Useful for catching up on delayed cron runs.
 */
export function isPastDue(publishAt, now = new Date()) {
  if (!publishAt) return false;
  const target = new Date(publishAt);
  return target.getTime() < now.getTime() - WINDOW_MS;
}

/**
 * Format a UTC ISO string as Taiwan local time string for logging.
 */
export function toTaiwanTime(isoString) {
  return new Date(isoString).toLocaleString('zh-TW', {
    timeZone: 'Asia/Taipei',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}
