/**
 * E2E: where another project lives, and what the checker proves about itself
 * (dev-platform XSPEC-460 R4; open-work-tracking 1.3.0, OWT-027 and OWT-028).
 *
 * Three readings, all from the real CLI entry:
 *   1. The single `--root DIR` that `uds open-work waiting` always had behaves exactly as before: a frozen
 *      capture of what the 1.2.0 module printed (tests/fixtures/open-work-tracking/baseline-1.2.0-waiting-golden.json)
 *      is compared byte for byte, exit code included. `--root` given twice without a name is refused, not guessed.
 *   2. `open_work.projects` in uds.project.yaml says the same thing as `--root NAME=DIR`; the command line wins for a
 *      name given in both; a malformed open_work section stops the command with exit 2 instead of running without it.
 *   3. `uds open-work self-test` carries a violating and a satisfying sample for each new check, and with any one
 *      detection removed from a copy of the checker its own self-test exits 2 naming the sample that went unnoticed.
 *
 * Wires that make these red when cut (one line of CLI source each):
 *   cli/src/commands/open-work.js   const declared = readOpenWorkDeclarations(process.cwd()); // wire:declarations
 *   cli/src/commands/open-work.js   const rootArgv = rootArguments(options.root, declared.projects); // wire:roots
 *   cli/src/commands/open-work.js   process.exitCode = main(argv);
 */

import { it, expect, afterAll } from 'vitest';
import { spawnSync } from 'child_process';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync, realpathSync } from 'fs';
import { tmpdir } from 'os';
import { dirname, join } from 'path';
import { createHarness, REAL_CLI_DIR } from '../utils/staged-cli-harness.js';
import { makeProject, WAITING_HEAD, waitsFor } from '../utils/xspec-460.js';

const h = createHarness('xspec460-r4');
const scratch = realpathSync(mkdtempSync(join(tmpdir(), 'uds-xspec460-r4-')));
afterAll(() => { h.cleanup(); rmSync(scratch, { recursive: true, force: true }); });

const GOLDEN = JSON.parse(readFileSync(join(REAL_CLI_DIR, 'tests', 'fixtures', 'open-work-tracking', 'baseline-1.2.0-waiting-golden.json'), 'utf8'));
const asCli = (args) => (args[0] === '--self-test' ? ['open-work', 'self-test'] : ['open-work', ...args]);

it('uds open-work waiting with a single --root DIR, or none, prints on a carrier that names no other project exactly what the 1.2.0 checker printed, exit code included (XSPEC-460 R4)', async () => {
  expect(GOLDEN.cases.length).toBeGreaterThanOrEqual(14);
  expect(new Set(GOLDEN.cases.map((c) => c.status))).toEqual(new Set([0, 1, 2]));
  expect(GOLDEN.cases.filter((c) => c.args.includes('--root')).length).toBeGreaterThanOrEqual(2);
  const dir = h.makeDir('r4-golden');
  for (const [name, content] of Object.entries(GOLDEN.files)) writeFileSync(join(dir, name), content);
  for (const c of GOLDEN.cases) {
    const r = await h.runCli(asCli(c.args), dir);
    expect(r.code, c.name).toBe(c.status);
    expect(r.stdout + r.stderr, c.name).toBe(c.out);
  }
});

it('uds open-work waiting refuses a second plain --root and a --root whose project name is not a logical name, exits 2, and never guesses (XSPEC-460 R4)', async () => {
  const dir = h.makeDir('r4-refuse');
  writeFileSync(join(dir, 'w.md'), `${WAITING_HEAD}${waitsFor('wait', 'other:v1.0.0')}`);
  const twice = await h.runCli(['open-work', 'waiting', 'w.md', '--root', 'a', '--root', 'b'], dir);
  expect(twice.code, twice.stdout + twice.stderr).toBe(2);
  expect(twice.stdout + twice.stderr).toMatch(/--root DIR was given more than once/);
  const badName = await h.runCli(['open-work', 'waiting', 'w.md', '--root', 'Other=./x'], dir);
  expect(badName.code).toBe(2);
  expect(badName.stdout + badName.stderr).toMatch(/the project name "Other" is not a logical name/);
  const empty = await h.runCli(['open-work', 'waiting', 'w.md', '--root', 'other='], dir);
  expect(empty.code).toBe(2);
  expect(empty.stdout + empty.stderr).toMatch(/the directory is empty/);
});

it('uds open-work waiting takes where another project lives from open_work.projects in uds.project.yaml, lets --root NAME=DIR win for the same name, and stops with exit 2 on a malformed open_work section (XSPEC-460 R4)', async () => {
  const dir = h.makeDir('r4-config');
  makeProject(dir, 'other', { tags: ['v1.0.0'] });
  makeProject(dir, 'decoy');
  writeFileSync(join(dir, 'w.md'), `${WAITING_HEAD}${waitsFor('wait', 'other:v1.0.0')}`);

  // the file names the project by a relative directory; no flag is typed
  writeFileSync(join(dir, 'uds.project.yaml'), 'version: "1"\nopen_work:\n  projects:\n    other: ./other\n');
  const fromFile = await h.runCli(['open-work', 'waiting', 'w.md', '--now', '2026-10-07'], dir);
  expect(fromFile.code, fromFile.stdout + fromFile.stderr).toBe(0);
  expect(fromFile.stdout).toMatch(/released=1 not-yet-released=0 not-visible-from-here=0 needs-a-person=0/);

  // the same file, a name given on the command line too: the command line wins (the decoy has no tag)
  const overridden = await h.runCli(['open-work', 'waiting', 'w.md', '--now', '2026-10-07', '--root', 'other=./decoy'], dir);
  expect(overridden.code).toBe(0);
  expect(overridden.stdout).toMatch(/released=0 not-yet-released=1 not-visible-from-here=0 needs-a-person=0/);

  // and with no file at all the same carrier is not visible: the file really was what supplied it
  writeFileSync(join(dir, 'uds.project.yaml'), 'version: "1"\n');
  const none = await h.runCli(['open-work', 'waiting', 'w.md', '--now', '2026-10-07'], dir);
  expect(none.stdout).toMatch(/released=0 not-yet-released=0 not-visible-from-here=1 needs-a-person=0/);

  // a readable file whose open_work section is wrong: the command stops, because running without it would look cleaner than it is
  for (const [body, why] of [
    ['open_work:\n  - other\n', /open_work must be a mapping/],
    ['open_work:\n  projects:\n    Other: ./other\n', /"Other" is not a logical project name/],
    ['open_work:\n  projects:\n    other: 5\n', /\.projects\.other must be a directory/],
    ['open_work:\n  next_action_words: 待辦\n', /\.next_action_words must be a list of words/],
  ]) {
    writeFileSync(join(dir, 'uds.project.yaml'), `version: "1"\n${body}`);
    const r = await h.runCli(['open-work', 'waiting', 'w.md', '--now', '2026-10-07'], dir);
    expect(r.code, r.stdout + r.stderr).toBe(2);
    expect(r.stderr).toMatch(why);
    expect(r.stderr).toMatch(/Exit 2 is not a pass/);
  }

  // a file that cannot be read at all (no version) is not this command's business: say so, go on
  writeFileSync(join(dir, 'uds.project.yaml'), 'open_work:\n  projects:\n    other: ./other\n');
  const unreadable = await h.runCli(['open-work', 'waiting', 'w.md', '--now', '2026-10-07'], dir);
  expect(unreadable.code, unreadable.stdout + unreadable.stderr).toBe(0);
  expect(unreadable.stderr).toMatch(/NOTE: uds\.project\.yaml could not be read \(.*version.*\); the open_work declarations in it were not applied/);
  expect(unreadable.stdout).toMatch(/not-visible-from-here=1/);
});

// One removal per detection: the text that, taken out of a copy of the checker, leaves the red sample unnoticed.
const REMOVALS = [
  ['OWT-027 violating: a release condition holding a machine-specific absolute path', "if (waitingNow && (MACHINE_PATH.test(conditionText) || refs.some((x) => x.kind === 'absolute'))) {", 'if (false) {'],
  ['OWT-027 violating: an object that leaves the other project', "if (x.kind === 'outside') { bad(", "if (false) { bad("],
  ['OWT-027 violating: a project name that is not a logical name is refused', 'if (!PROJECT_NAME.test(m[1])) return {', 'if (false) return {'],
  ['OWT-028 violating: a project this machine cannot see is counted apart', "if (dir === undefined) return { status: 'not-visible'", "if (dir === undefined) return { status: 'released'"],
  ['OWT-028 violating: a tag that is not there is not released', "return t === 'present' ? { status: 'released'", "return true ? { status: 'released'"],
  ['OWT-028 violating: a path that is not there is not released', "if (ref.kind === 'path') return env.pathExists(join(dir, ref.value.replace(/^\\.\\//, ''))) ? {", "if (ref.kind === 'path') return true ? {"],
  ['OWT-028 violating: an identifier in another project needs a person', "return { status: 'needs-a-person', why:", "return { status: 'released', why:"],
  ['OWT-020 clean: a waiting item that waits for another project is not asked about a reply', "state = 'waiting-cross-project'; // [mutation-anchor:cross-project-exempt]", 'void 0; // [mutation-anchor:cross-project-exempt]'],
];

it('uds open-work self-test exits 0, and with any one cross-project detection removed its own self-test exits 2 naming the red sample that went unnoticed (XSPEC-460 R4)', async () => {
  const dir = h.makeDir('r4-selftest');
  const ok = await h.runCli(['open-work', 'self-test'], dir);
  expect(ok.code, ok.stdout + ok.stderr).toBe(0);
  expect(ok.stdout).toMatch(/self-test: OK/);

  const source = readFileSync(join(REAL_CLI_DIR, 'src', 'utils', 'open-work-tracking.mjs'), 'utf8');
  for (const [arm, from, to] of REMOVALS) {
    const n = source.split(from).length - 1;
    expect(n, `the removal for "${arm}" must apply exactly once`).toBe(1);
    const mutant = join(scratch, `mutant-${Math.random().toString(36).slice(2)}.mjs`);
    writeFileSync(mutant, source.replace(from, () => to));
    const r = spawnSync(process.execPath, [mutant, '--self-test'], { encoding: 'utf8' });
    const out = `${r.stdout}${r.stderr}`;
    expect(r.status, `${arm}: ${out}`).toBe(2);
    expect(out, arm).toMatch(/self-test FAILED/);
    expect(out, arm).toContain(arm);
  }
});
