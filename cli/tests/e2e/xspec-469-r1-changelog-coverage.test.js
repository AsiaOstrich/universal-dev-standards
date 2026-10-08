/**
 * E2E: every CHANGELOG `Unreleased` entry has an acceptance step, or says why not (dev-platform XSPEC-469 R1).
 *
 * `node scripts/beta-acceptance/check-steps.mjs` is the entry (CI runs it in the job "Beta Acceptance Coverage").
 * The real repository is measured by the first test, with the number of entries counted here by a different
 * reading of the CHANGELOG than the program uses. The others hand the program a CHANGELOG with one more entry (an
 * Added, a Changed and a Fixed one, so no section is skipped) and a steps file with or without a step for it.
 *
 * "Weakening the check turns the property red": copies of the program with one decision made wrong (only the first
 * entries read, one section ignored, a reason not required, a dangling anchor allowed) must each fail the same
 * property the real program passes.
 *
 * Wire that makes these red when cut (one line of source):
 *   scripts/beta-acceptance/check-steps.mjs   const verdict = judgeCoverage({ blocks, doc });
 */

import { it, expect, afterAll } from 'vitest';
import { spawnSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { ACCEPT_DIR, REPO, copyProgram, scratch, weaken } from '../utils/xspec-469.js';

const tmp = scratch('uds-xspec469-r1-');
afterAll(() => tmp.cleanup());

const CHECK = join(ACCEPT_DIR, 'check-steps.mjs');
const run = (args, script = CHECK) => {
  const r = spawnSync(process.execPath, [script, ...args], { encoding: 'utf-8', timeout: 60000 });
  return { code: r.status, stdout: r.stdout, stderr: r.stderr, out: `${r.stdout}${r.stderr}` };
};

const realSteps = () => JSON.parse(readFileSync(join(ACCEPT_DIR, 'steps.json'), 'utf-8'));
const realChangelog = () => readFileSync(join(REPO, 'CHANGELOG.md'), 'utf-8');

/** Entries under Unreleased, counted line by line: a different reading from the one the program uses. */
function countUnreleasedBullets(text) {
  let inside = false;
  let n = 0;
  for (const line of text.split(/\r?\n/)) {
    if (/^## \[/.test(line)) inside = /^## \[Unreleased\]/i.test(line);
    else if (inside && /^- /.test(line)) n += 1;
  }
  return n;
}

/** The real CHANGELOG with one extra entry appended to the named section of Unreleased. */
function withEntry(section, text) {
  const lines = realChangelog().split('\n');
  const start = lines.findIndex((l) => /^## \[Unreleased\]/i.test(l));
  const heading = lines.findIndex((l, i) => i > start && l.trim() === `### ${section}`);
  expect(heading, `fixture: the real CHANGELOG has a ### ${section} section under Unreleased`).toBeGreaterThan(start);
  let end = heading + 1;
  while (end < lines.length && !/^(### |## \[)/.test(lines[end])) end += 1;
  // insert after the last bullet of the section (before the blank line that ends it)
  let at = end;
  while (at > heading + 1 && lines[at - 1].trim() === '') at -= 1;
  lines.splice(at, 0, `- ${text}`);
  const file = tmp.next('CHANGELOG.md');
  writeFileSync(file, lines.join('\n'));
  return file;
}

const writeJson = (name, value) => {
  const file = tmp.next(name);
  writeFileSync(file, JSON.stringify(value, null, 2));
  return file;
};

const NEW_ENTRIES = {
  Added: '**`uds frobnicate` prints the frobnication report (XSPEC-999 R1).** A made-up entry that the real steps file knows nothing about.',
  Changed: 'The `uds frobnicate` report now sorts its rows by name (XSPEC-999 R2); a made-up entry for the Changed section.',
  Fixed: '**`uds frobnicate` no longer crashes on an empty report (XSPEC-999 R3).** A made-up entry for the Fixed section.',
};
const ANCHORS = {
  Added: 'uds frobnicate prints the frobnication report',
  Changed: 'The uds frobnicate report now sorts its rows',
  Fixed: 'uds frobnicate no longer crashes on an empty report',
};
const stepFor = (anchor) => ({
  id: 'frobnicate', title: 'frobnicate prints its report', titleZh: 'frobnicate 印出報告', platform: 'all', changelog: [anchor],
  uds: ['frobnicate'], expect: { contains: ['report'] },
});

it('the CHANGELOG of this repository is covered: the program counts the same Unreleased entries as a line-by-line reading and every one has a step or an exemption with a reason (XSPEC-469 R1)', () => {
  const expected = countUnreleasedBullets(realChangelog());
  expect(expected, 'control: the real Unreleased block holds entries').toBeGreaterThan(10);

  const r = run([]);
  expect(r.code, r.out).toBe(0);
  expect(r.stdout).toContain(`Unreleased entries: ${expected}; covered: ${expected}`);
  expect(r.stdout).toContain('OK: every Unreleased entry is covered.');

  // and the steps file is not mostly exemptions: most entries are tested by a command
  const doc = realSteps();
  expect(doc.exemptions.length, 'exemptions are the exception').toBeLessThan(expected / 3);
  for (const x of doc.exemptions) expect(x.reason.length, `the reason for ${x.changelog}`).toBeGreaterThan(40);
});

it('a new Added, Changed or Fixed entry with no step turns the check red and names that entry; the same entry with a step turns it green (XSPEC-469 R1)', () => {
  for (const section of ['Added', 'Changed', 'Fixed']) {
    const changelog = withEntry(section, NEW_ENTRIES[section]);

    const red = run(['--changelog', changelog]);
    expect(red.code, `${section}: ${red.out}`).toBe(1);
    expect(red.stdout, section).toContain(`FAIL no acceptance step for the ${section} entry at CHANGELOG line`);
    expect(red.stdout, section).toContain(ANCHORS[section]);
    // only that entry is named: the 23 covered ones are not
    expect(red.stdout.match(/FAIL no acceptance step/g), section).toHaveLength(1);

    const doc = realSteps();
    doc.steps.push(stepFor(ANCHORS[section]));
    const green = run(['--changelog', changelog, '--steps', writeJson('steps.json', doc)]);
    expect(green.code, `${section}: ${green.out}`).toBe(0);
    expect(green.stdout, section).toContain('OK: every Unreleased entry is covered.');
  }
});

it('an entry that has no user-visible behaviour is accepted only with an exemption that gives a reason; a missing or one-word reason is red (XSPEC-469 R1)', () => {
  const changelog = withEntry('Added', NEW_ENTRIES.Added);
  const exempt = (reason) => {
    const doc = realSteps();
    doc.exemptions.push({ changelog: ANCHORS.Added, ...(reason === undefined ? {} : { reason }) });
    return run(['--changelog', changelog, '--steps', writeJson('steps.json', doc)]);
  };

  // how many entries are covered by an exemption alone, before and after adding one more
  const before = Number(/by an exemption that gives a reason: (\d+)\)/.exec(run([]).stdout)[1]);
  const ok = exempt('A made-up internal change: it only renames a private function and no command prints anything different.');
  expect(ok.code, ok.out).toBe(0);
  expect(ok.stdout).toContain(`by an exemption that gives a reason: ${before + 1})`);

  for (const bad of [undefined, '', 'n/a', 'internal']) {
    const r = exempt(bad);
    expect(r.code, `reason ${JSON.stringify(bad)}: ${r.out}`).toBe(1);
    expect(r.stdout).toContain('needs a "reason" of at least 20 characters');
  }
});

it('a step that names an entry which does not exist, matches several entries, or quotes too little is red, each named (XSPEC-469 R1)', () => {
  const dangling = realSteps();
  dangling.steps.push(stepFor('uds frobnicate prints the frobnication report'));
  const a = run(['--steps', writeJson('steps.json', dangling)]);
  expect(a.code, a.out).toBe(1);
  expect(a.stdout).toContain('FAIL step frobnicate names a CHANGELOG entry that does not exist: "uds frobnicate prints the frobnication report"');

  const many = realSteps();
  many.steps.push(stepFor('open-work-tracking 1.')); // the start of four entries
  const b = run(['--steps', writeJson('steps.json', many)]);
  expect(b.code, b.out).toBe(1);
  expect(b.stdout).toContain('FAIL step frobnicate matches');
  expect(b.stdout).toContain('quote more of the start of the entry');

  const short = realSteps();
  short.steps.push(stepFor('uds update'));
  const c = run(['--steps', writeJson('steps.json', short)]);
  expect(c.code, c.out).toBe(1);
  expect(c.stdout).toContain('quotes too little to identify an entry (at least 20 characters): "uds update"');
});

it('the check exits 2, not 0 and not 1, when it cannot measure: no Unreleased heading, an unreadable file, a steps file that is not JSON (XSPEC-469 R1)', () => {
  const noHeading = tmp.next('CHANGELOG.md');
  writeFileSync(noHeading, '# Changelog\n\n## [1.0.0] - 2026-01-01\n\n### Added\n\n- **A thing that shipped.** Nothing is unreleased here.\n');
  const a = run(['--changelog', noHeading]);
  expect(a.code, a.out).toBe(2);
  expect(a.stderr).toContain('has no "## [Unreleased]" heading');

  const b = run(['--changelog', join(tmp.dir, 'does-not-exist.md')]);
  expect(b.code, b.out).toBe(2);
  expect(b.stderr).toContain('cannot read the CHANGELOG');

  const notJson = tmp.next('steps.json');
  writeFileSync(notJson, '{ not json');
  const c = run(['--steps', notJson]);
  expect(c.code, c.out).toBe(2);
  expect(c.stderr).toContain('as JSON');
});

it('an Unreleased block with no entries (just after a release) is green, but a CHANGELOG from which nothing could be read at all is not (XSPEC-469 R1)', () => {
  const empty = tmp.next('CHANGELOG.md');
  writeFileSync(empty, '# Changelog\n\n## [Unreleased]\n\n## [1.0.0] - 2026-01-01\n\n### Added\n\n- **The first release of a thing.** It is long enough to be an entry.\n');
  const ok = run(['--changelog', empty, '--steps', writeJson('steps.json', { schema: 1, steps: [stepFor('The first release of a thing')] })]);
  expect(ok.code, ok.out).toBe(0);
  expect(ok.stdout).toContain('Unreleased entries: 0');

  const unreadable = tmp.next('CHANGELOG.md');
  writeFileSync(unreadable, '# Changelog\n\n## [Unreleased]\n\nSome prose, and no bullet lists in any section.\n');
  const bad = run(['--changelog', unreadable, '--steps', writeJson('steps.json', { schema: 1, steps: [] })]);
  expect(bad.code, bad.out).toBe(1);
});

it('weakening the check turns the property red: reading only the first entries, ignoring a section, not requiring a reason, or letting a dangling anchor pass each make a copy of the program miss what the real one catches (XSPEC-469 R1)', () => {
  // The property, as one function of a program directory: the five red samples must each exit 1.
  const samples = () => {
    const out = [];
    for (const section of ['Added', 'Changed', 'Fixed']) out.push({ what: `an unmatched ${section} entry`, args: ['--changelog', withEntry(section, NEW_ENTRIES[section])], names: ANCHORS[section] });
    const noReason = realSteps();
    noReason.exemptions.push({ changelog: 'Docs: "How to install skills"', reason: 'x' });
    out.push({ what: 'an exemption without a reason', args: ['--changelog', join(REPO, 'CHANGELOG.md'), '--steps', writeJson('steps.json', noReason)], names: 'needs a "reason"' });
    const dangling = realSteps();
    dangling.steps.push(stepFor('uds frobnicate prints the frobnication report'));
    out.push({ what: 'a step for an entry that does not exist', args: ['--changelog', join(REPO, 'CHANGELOG.md'), '--steps', writeJson('steps.json', dangling)], names: 'names a CHANGELOG entry that does not exist' });
    return out;
  };
  // A sample is caught when the program exits 1 AND says the thing that is wrong: an exit 1 for some other reason does not count.
  const holds = (dir) => samples().filter((s) => {
    const r = run(s.args, join(dir, 'check-steps.mjs'));
    return !(r.code === 1 && r.stdout.includes(s.names));
  }).map((s) => s.what);

  const real = copyProgram(tmp.next('real'));
  expect(holds(real), 'control: the unmodified program catches every red sample').toEqual([]);

  const onlyAdded = copyProgram(tmp.next('only-added'));
  weaken(join(onlyAdded, 'lib', 'changelog.mjs'), 'if (bullet && section) {', "if (bullet && section === 'Added') {");
  expect(holds(onlyAdded), 'only the Added section is read').toEqual(expect.arrayContaining(['an unmatched Changed entry', 'an unmatched Fixed entry']));

  const firstFew = copyProgram(tmp.next('first-few'));
  weaken(join(firstFew, 'lib', 'coverage.mjs'), 'for (const entry of unreleased.entries) {', 'for (const entry of unreleased.entries.slice(0, 20)) {');
  expect(holds(firstFew), 'only the first 20 entries are judged').not.toEqual([]);

  const noReasonNeeded = copyProgram(tmp.next('no-reason'));
  weaken(join(noReasonNeeded, 'lib', 'steps.mjs'), 'export const MIN_REASON_LENGTH = 20;', 'export const MIN_REASON_LENGTH = 0;');
  expect(holds(noReasonNeeded), 'a reason is not required').toContain('an exemption without a reason');

  const danglingOk = copyProgram(tmp.next('dangling-ok'));
  weaken(join(danglingOk, 'lib', 'coverage.mjs'), '    && result.danglingAnchors.length === 0\n', '');
  expect(holds(danglingOk), 'a dangling anchor is allowed').toContain('a step for an entry that does not exist');
});
