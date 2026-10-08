/**
 * Read the entries of a CHANGELOG.md (dev-platform XSPEC-469 R1).
 *
 * An entry is one top-level bullet (`- ...` at column 0) under a `### <Section>` heading of a `## [<version>]`
 * block, together with its continuation lines. The text is normalised (markdown emphasis and backticks removed,
 * whitespace collapsed) because that is what the acceptance steps refer to it by: a step names the START of an
 * entry (see `entryMatchesAnchor`), not a hash of it and not a number, so
 *   - rewording the tail of an entry does not break its step, and
 *   - a new entry with no step cannot hide: it has no anchor anywhere.
 *
 * Standard library only.
 */

/** Strip markdown emphasis and code ticks, collapse whitespace. */
export function normalizeText(text) {
  return String(text)
    .replace(/\*\*/g, '')
    .replace(/`/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * @param {string} changelogText
 * @returns {{ version: string, entries: Array<{ section: string, text: string, line: number, normalized: string }> }[]}
 *   one block per `## [x]` heading, in file order
 */
export function parseChangelog(changelogText) {
  const lines = String(changelogText).replace(/\r\n/g, '\n').split('\n');
  const blocks = [];
  let block = null;
  let section = null;
  let entry = null;
  const flush = () => {
    if (entry && block) {
      entry.normalized = normalizeText(entry.text);
      block.entries.push(entry);
    }
    entry = null;
  };
  lines.forEach((raw, index) => {
    const heading = /^## \[([^\]]+)\]/.exec(raw);
    if (heading) {
      flush();
      block = { version: heading[1], entries: [] };
      blocks.push(block);
      section = null;
      return;
    }
    if (!block) return;
    const sub = /^### (.+?)\s*$/.exec(raw);
    if (sub) {
      flush();
      section = sub[1];
      return;
    }
    if (/^#{1,6} /.test(raw) || /^---+\s*$/.test(raw)) {
      flush();
      section = null;
      return;
    }
    const bullet = /^[-*] (.*)$/.exec(raw);
    if (bullet && section) {
      flush();
      entry = { section, text: bullet[1], line: index + 1 };
      return;
    }
    if (entry) {
      if (raw.trim() === '') {
        flush();
      } else {
        entry.text += ` ${raw.trim()}`;
      }
    }
  });
  flush();
  return blocks;
}

/** The entries under `## [Unreleased]` (empty array when the heading is missing). Returns null when it is missing. */
export function unreleasedEntries(changelogText) {
  const block = parseChangelog(changelogText).find((b) => /^unreleased$/i.test(b.version));
  return block ? block.entries : null;
}

/** Shortest anchor a step may use. A shorter one would match unrelated entries and prove nothing. */
export const MIN_ANCHOR_LENGTH = 20;

/** True when the normalised `anchor` is the start of the entry's normalised text. */
export function entryMatchesAnchor(entry, anchor) {
  const a = normalizeText(anchor);
  return a.length >= MIN_ANCHOR_LENGTH && entry.normalized.startsWith(a);
}
