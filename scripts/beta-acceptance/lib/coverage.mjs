/**
 * Does every CHANGELOG `Unreleased` entry have an acceptance step? (dev-platform XSPEC-469 R1)
 *
 * Pure: takes the parsed CHANGELOG and the parsed steps file, returns what is wrong. `check-steps.mjs` prints it
 * and sets the exit code; the tests call it with samples.
 *
 * Standard library only.
 */

import { entryMatchesAnchor, MIN_ANCHOR_LENGTH, normalizeText } from './changelog.mjs';
import { validateSteps } from './steps.mjs';

/** The sections whose entries must be covered. Every `###` section of Unreleased is read; this is only the names the spec lists. */
export const SPEC_SECTIONS = ['Added', 'Changed', 'Fixed'];

const short = (text) => (text.length > 110 ? `${text.slice(0, 107)}...` : text);

/**
 * @param {{ blocks: ReturnType<import('./changelog.mjs').parseChangelog>, doc: object }} input
 * @returns {{
 *   ok: boolean,
 *   schemaErrors: string[],
 *   unreleasedCount: number,
 *   uncovered: Array<{section: string, line: number, text: string}>,
 *   danglingAnchors: Array<{ where: string, anchor: string }>,
 *   ambiguousAnchors: Array<{ where: string, anchor: string, matches: number }>,
 *   shortAnchors: Array<{ where: string, anchor: string }>,
 *   covered: number,
 *   withStep: number,
 *   exempted: number,
 *   noUnreleasedHeading: boolean
 * }}
 */
export function judgeCoverage({ blocks, doc }) {
  const schemaErrors = validateSteps(doc);
  const result = {
    ok: false,
    schemaErrors,
    unreleasedCount: 0,
    uncovered: [],
    danglingAnchors: [],
    ambiguousAnchors: [],
    shortAnchors: [],
    covered: 0,
    withStep: 0,
    exempted: 0,
    noUnreleasedHeading: false,
  };
  const unreleased = blocks.find((b) => /^unreleased$/i.test(b.version));
  if (!unreleased) {
    result.noUnreleasedHeading = true;
    return result;
  }
  const allEntries = blocks.flatMap((b) => b.entries);
  const steps = Array.isArray(doc && doc.steps) ? doc.steps : [];
  const exemptions = Array.isArray(doc && doc.exemptions) ? doc.exemptions : [];

  /** every (anchor, where) pair in the file */
  const refs = [];
  steps.forEach((s, i) => (Array.isArray(s && s.changelog) ? s.changelog : []).forEach((a) => refs.push({ anchor: a, where: `step ${s.id || `#${i}`}`, kind: 'step' })));
  exemptions.forEach((x, i) => { if (x && typeof x.changelog === 'string') refs.push({ anchor: x.changelog, where: `exemption #${i}`, kind: 'exemption' }); });

  const coveredEntries = new Set();
  const stepEntries = new Set();
  for (const ref of refs) {
    if (normalizeText(ref.anchor).length < MIN_ANCHOR_LENGTH) {
      result.shortAnchors.push({ where: ref.where, anchor: ref.anchor });
      continue;
    }
    const matches = allEntries.filter((e) => entryMatchesAnchor(e, ref.anchor));
    if (matches.length === 0) result.danglingAnchors.push({ where: ref.where, anchor: ref.anchor });
    else if (matches.length > 1) result.ambiguousAnchors.push({ where: ref.where, anchor: ref.anchor, matches: matches.length });
    else {
      coveredEntries.add(matches[0]);
      if (ref.kind === 'step') stepEntries.add(matches[0]);
    }
  }

  result.unreleasedCount = unreleased.entries.length;
  for (const entry of unreleased.entries) {
    if (coveredEntries.has(entry)) {
      result.covered += 1;
    } else {
      result.uncovered.push({ section: entry.section, line: entry.line, text: short(entry.normalized) });
    }
  }
  // entries that have an exemption and no step: the summary says how many have no step on purpose
  result.withStep = unreleased.entries.filter((e) => stepEntries.has(e)).length;
  result.exempted = unreleased.entries.filter((e) => coveredEntries.has(e) && !stepEntries.has(e)).length;

  result.ok = schemaErrors.length === 0
    && result.uncovered.length === 0
    && result.danglingAnchors.length === 0
    && result.ambiguousAnchors.length === 0
    && result.shortAnchors.length === 0
    // an Unreleased block with no entries is fine (just after a release); a CHANGELOG with no entries at all is a parser that read nothing
    && allEntries.length > 0;
  return result;
}
