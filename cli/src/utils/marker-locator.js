/**
 * Shared marker-block location logic for UDS-managed sections in integration
 * files (CLAUDE.md, AGENTS.md, etc.).
 *
 * XSPEC adopter-report Q5 (v3.5.0–6.10.0): every call site that located the
 * `<!-- UDS:STANDARDS:START -->` / `<!-- UDS:STANDARDS:END -->` pair used
 * `content.indexOf(markers.start)` / `.indexOf(markers.end)` directly. That
 * matches the marker text anywhere in the file — including inside a sentence
 * that merely *mentions* it (this project's own CLAUDE.md explains the marker
 * syntax in prose, `<!-- UDS:STANDARDS:START -->`, inline) or inside a fenced
 * code sample quoting it. A write path built on that wrong index then treated
 * everything between the mention and the real END marker as "the UDS block"
 * and deleted it — including the user's own content in between.
 *
 * The fix: a marker only counts when, after trimming, it occupies an entire
 * line by itself, and that line is not inside a fenced code block (``` or
 * ~~~). Every reader of a marker pair in this codebase must go through
 * `locateMarkerBlock`/`tryLocateMarkerBlock` instead of indexOf/includes —
 * enforced by a static-scan guard test.
 */

/**
 * @typedef {Object} MarkerLine
 * @property {number} offset - Character offset of the marker text itself
 *   within `content` (not the start of the line — leading whitespace before
 *   the marker, if any, is excluded).
 * @property {number} line - 1-based line number.
 */

/**
 * Find every standalone-line, non-fenced-code occurrence of `markerText`.
 * @param {string} content
 * @param {string} markerText
 * @returns {MarkerLine[]}
 */
function findMarkerLines(content, markerText) {
  const lines = content.split('\n');
  const occurrences = [];
  let offset = 0;
  let inFence = false;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (/^(`{3,}|~{3,})/.test(trimmed)) {
      // Fenced code block delimiter (``` or ```lang, closing ``` too) — a
      // marker string appearing between a pair of these is a documentation
      // sample, not a real boundary. This intentionally does not try to
      // distinguish open/close by matching fence characters or length; any
      // triple-backtick-or-tilde line toggles the state, matching how
      // Markdown renderers treat fences in practice.
      inFence = !inFence;
    } else if (!inFence && trimmed === markerText) {
      const leading = rawLine.length - rawLine.trimStart().length;
      occurrences.push({ offset: offset + leading, line: i + 1 });
    }

    offset += rawLine.length + 1; // +1 for the '\n' that split('\n') consumed
  }

  return occurrences;
}

/**
 * Thrown when a marker's start or end text has more than one standalone,
 * non-fenced occurrence in a file — the file is ambiguous and no caller
 * should guess which one is the real boundary.
 */
export class AmbiguousMarkerError extends Error {
  /**
   * @param {string} markerText
   * @param {number[]} lines - 1-based line numbers of every occurrence found.
   */
  constructor(markerText, lines) {
    super(
      `Found ${lines.length} standalone occurrences of marker "${markerText}" ` +
      `on line(s) ${lines.join(', ')} — expected exactly one. Refusing to guess ` +
      'which one bounds the UDS-managed block.'
    );
    this.name = 'AmbiguousMarkerError';
    this.markerText = markerText;
    this.lines = lines;
  }
}

/**
 * Locate the single UDS marker block in `content`.
 *
 * @param {string} content
 * @param {{start: string, end: string}} markers
 * @returns {{startIdx: number, endIdx: number, startLine: number, endLine: number} | null}
 *   `null` means "this file has no UDS block" — the same meaning the old
 *   `startIdx === -1` check carried. This is not an error.
 * @throws {AmbiguousMarkerError} when more than one valid START or END line
 *   exists — the file has two or more marker pairs, or a corrupted one.
 */
export function locateMarkerBlock(content, markers) {
  const starts = findMarkerLines(content, markers.start);
  const ends = findMarkerLines(content, markers.end);

  if (starts.length > 1) {
    throw new AmbiguousMarkerError(markers.start, starts.map((s) => s.line));
  }
  if (ends.length > 1) {
    throw new AmbiguousMarkerError(markers.end, ends.map((e) => e.line));
  }
  if (starts.length === 0 || ends.length === 0) {
    return null;
  }

  const startIdx = starts[0].offset;
  const endIdx = ends[0].offset;
  if (endIdx <= startIdx) {
    return null;
  }

  return { startIdx, endIdx, startLine: starts[0].line, endLine: ends[0].line };
}

/**
 * Non-throwing variant of `locateMarkerBlock` for callers that must not
 * crash a broader scan on one ambiguous file (e.g. a full-project state
 * scan reconciling many files at once). Ambiguity is reported through the
 * return value instead of an exception.
 *
 * @param {string} content
 * @param {{start: string, end: string}} markers
 * @returns {{ok: true, block: ReturnType<typeof locateMarkerBlock>} | {ok: false, error: AmbiguousMarkerError}}
 */
export function tryLocateMarkerBlock(content, markers) {
  try {
    return { ok: true, block: locateMarkerBlock(content, markers) };
  } catch (error) {
    if (error instanceof AmbiguousMarkerError) {
      return { ok: false, error };
    }
    throw error;
  }
}
