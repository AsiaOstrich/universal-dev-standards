/**
 * Which file formats a manifest's `format` setting puts on disk.
 *
 * `both` is not a third kind of file: it is the human copy (.md) and the AI copy (.ai.yaml) of every standard and
 * every option, side by side. The installer copies once per entry of this list, and the reconciler has to expect
 * exactly the same set. When the reconciler read `both` as one format it resolved only the human copy and planned
 * to delete every AI copy the installer had just written (XSPEC-483).
 *
 * @param {string} [format] - 'ai', 'human' or 'both'. Anything else, including a missing value, is read as 'ai'.
 * @returns {string[]} The formats to resolve a source file in: ['ai', 'human'] for 'both', otherwise one entry.
 */
export function getInstalledFormats(format) {
  if (format === 'both') return ['ai', 'human'];
  return [format || 'ai'];
}
