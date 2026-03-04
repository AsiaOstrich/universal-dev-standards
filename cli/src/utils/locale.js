/**
 * Locale utilities for skills installation
 *
 * Provides unified locale mapping between display language codes
 * (lowercase, used in CLI options) and directory names (mixed case,
 * used in file system paths).
 *
 * @version 1.0.0
 */

/**
 * Map from display language code to locale directory name.
 * Display language uses lowercase (e.g., 'zh-tw'), while
 * locale directories use mixed case (e.g., 'zh-TW').
 */
const LOCALE_MAP = {
  'zh-tw': 'zh-TW',
  'zh-cn': 'zh-CN',
  'en': 'en'
};

/**
 * Convert display language code to locale directory name.
 * @param {string} displayLanguage - Display language code (e.g., 'zh-tw', 'en')
 * @returns {string} Locale directory name (e.g., 'zh-TW', 'en')
 */
export function displayLanguageToLocale(displayLanguage) {
  if (!displayLanguage) return 'en';
  return LOCALE_MAP[displayLanguage.toLowerCase()] || 'en';
}

/**
 * Check if a locale requires localized skill installation.
 * English locale uses the default source, no localization needed.
 * @param {string} locale - Locale directory name (e.g., 'zh-TW', 'en')
 * @returns {boolean} True if locale needs localized skills
 */
export function isLocalizedLocale(locale) {
  return locale && locale !== 'en';
}

export default {
  displayLanguageToLocale,
  isLocalizedLocale,
  LOCALE_MAP
};
