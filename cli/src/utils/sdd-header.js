/**
 * Read the header of a full SDD spec: title, status and type.
 * // implements XSPEC-456 R5
 *
 * `uds spec list` was built for micro-specs (`## Micro-Spec: ...` with `**Status**: draft`). A full SDD
 * spec states the same facts in its own header - a table (`| Status | Approved (2026-09-30) |`), field
 * lines (`- **Status**: Archived`, `> **Status**: Stable`) or a YAML front matter - and the reader that
 * found none of them filled in `draft` and an empty title. This module reads those layouts and reports
 * what it could not read as `null`, so a caller can say "not parsed" instead of printing a default.
 *
 * @module utils/sdd-header
 */

/** Where a status or type can be read in a header table: `| Status | Approved (2026-01-01) |`. */
const TABLE_FIELD = (name) => new RegExp(`^\\|\\s*\\**\\s*${name}\\s*\\**\\s*\\|\\s*(.+?)\\s*\\|?\\s*$`, 'i');
/** ...in a field line: `- **Status**: Archived`, `> **Status**: Stable`, `Status: Draft`. */
const LINE_FIELD = (name) => new RegExp(`^[\\s>*-]*\\**\\s*${name}\\s*\\**\\s*[:\uFF1A]\\s*\\**\\s*(.+?)\\s*$`, 'i');
const TABLE_SEPARATOR = /^\|[\s:|-]+\|?\s*$/;

/** First word of a header value, lower-cased (`Approved (2026-01-01)` -> `approved`); text it cannot split stays as written. */
function headerWord(value) {
  const cleaned = String(value).replace(/[*`_]/g, '').trim();
  const word = cleaned.match(/^[A-Za-z][A-Za-z-]*/);
  return (word ? word[0].toLowerCase() : cleaned) || null;
}

/**
 * Read title, status and type from the header of an SDD spec: its first 80 lines. Understands the header table, field lines, and a YAML front matter `status:`.
 * Whatever it cannot find is `null` / empty - never a default that looks like a result.
 *
 * @param {string} content - File content
 * @returns {{ title: string, status: string|null, type: string|null }}
 */
export function readSddHeader(content) {
  const all = content.replace(/\r\n/g, '\n').split('\n');
  let start = 0;
  let frontMatter = [];
  if (all[0]?.trim() === '---') {
    const close = all.findIndex((l, i) => i > 0 && l.trim() === '---');
    if (close > 0) {
      frontMatter = all.slice(1, close);
      start = close + 1;
    }
  }
  const lines = all.slice(start, start + 80);

  const title = (lines.find((l) => /^#\s+\S/.test(l)) || '').replace(/^#\s+/, '').replace(/\s+#+\s*$/, '').trim();

  const read = (name) => {
    for (let i = 0; i < lines.length; i++) {
      const row = TABLE_FIELD(name).exec(lines[i]);
      // A header row of a table (`| Status | Description |`) is followed by a separator row; a field row is not.
      if (row && !TABLE_SEPARATOR.test(lines[i + 1] || '')) return headerWord(row[1]);
      const field = LINE_FIELD(name).exec(lines[i]);
      if (field) return headerWord(field[1]);
    }
    for (const line of frontMatter) {
      const fm = new RegExp(`^${name}\\s*:\\s*(.+?)\\s*$`, 'i').exec(line);
      if (fm) return headerWord(fm[1]);
    }
    return null;
  };

  return { title, status: read('Status'), type: read('Type') };
}
