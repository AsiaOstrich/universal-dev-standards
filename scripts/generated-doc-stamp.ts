/**
 * The one definition of which line in a generated doc header is volatile.
 *
 * `docs/user/SKILLS-INDEX.md` and `COMMANDS-INDEX.md` carry a
 * `> Last regenerated: <date> | UDS v<version> | <n> skills` line. The date
 * changes every day; the version and the count do not, and those are the parts
 * a staleness gate exists to notice.
 *
 * `check-skill-index.ts` compared the two files byte for byte, so it reported
 * drift on any day that was not the day the index was last committed. Measured
 * on 2026-08-13: the twelve most recent commits touching SKILLS-INDEX.md each
 * changed exactly two lines, and in every one of them both were this stamp.
 * The gate fired on every commit and never once on real content — and had real
 * content drifted, it would have looked exactly like the noise, so the habit
 * the gate taught was to regenerate and commit without reading the diff.
 *
 * This lives in its own module because `generate-skill-index.ts` writes files
 * at import time: a checker importing the pattern from there would regenerate
 * the very files it is about to inspect.
 */

/** Prefix of the volatile header line, shared by both generated indexes. */
export const REGENERATION_STAMP_PREFIX = '> Last regenerated:';

const STAMP_LINE = /^> Last regenerated:.*$/gm;

/**
 * Replace the regeneration stamp with a fixed placeholder so two renderings of
 * the same content compare equal regardless of when each was produced.
 *
 * @param content - Full text of a generated index
 * @returns The same text with every stamp line normalised
 */
export function withoutRegenerationStamp(content: string): string {
  return content.replace(STAMP_LINE, `${REGENERATION_STAMP_PREFIX} <normalised>`);
}
