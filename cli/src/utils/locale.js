/**
 * Locale utilities for skills installation
 *
 * Provides unified locale mapping between display language codes
 * (lowercase, used in CLI options) and directory names (mixed case,
 * used in file system paths).
 *
 * @version 1.1.0
 */

import { existsSync } from 'fs';
import { join } from 'path';

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
 * Normalise a requested display language and say whether it is supported.
 *
 * `uds init --locale zh-CN` used to install English and exit 0: the value was compared case-sensitively
 * further down, so the upper-case spelling silently missed every Chinese branch. An unsupported value such
 * as `fr` did the same — English, exit 0, nothing said. The caller still falls back to English for an
 * unsupported value, but now it can say so.
 * @param {string|undefined|null} requested - what the user, install.yaml or the environment asked for
 * @returns {{ displayLanguage: string|undefined|null, supported: boolean }}
 */
export function normalizeRequestedLocale(requested) {
  if (typeof requested !== 'string' || requested.trim() === '') {
    return { displayLanguage: requested, supported: true };
  }
  const displayLanguage = requested.trim().toLowerCase();
  return { displayLanguage, supported: Object.prototype.hasOwnProperty.call(LOCALE_MAP, displayLanguage) };
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

/**
 * Detect locale from installed standards files when manifest lacks display_language.
 * Checks for locale-specific files (e.g., .standards/zh-tw.md) in the project.
 * @param {string} projectPath - Project root path
 * @returns {string|null} Detected locale directory name (e.g., 'zh-TW') or null
 */
export function detectLocaleFromStandards(projectPath) {
  if (!projectPath) return null;

  const standardsDir = join(projectPath, '.standards');
  if (!existsSync(standardsDir)) return null;

  for (const [displayLang, locale] of Object.entries(LOCALE_MAP)) {
    if (displayLang === 'en') continue;
    const localeFile = join(standardsDir, `${displayLang}.md`);
    if (existsSync(localeFile)) {
      return locale;
    }
  }

  return null;
}

export default {
  displayLanguageToLocale,
  normalizeRequestedLocale,
  isLocalizedLocale,
  detectLocaleFromStandards,
  LOCALE_MAP
};
