// XSPEC-460 (cross-project waiting; OWT-027, OWT-028) and XSPEC-461 (the next-action word list), open-work-tracking 1.3.0.
// What this file proves that the end-to-end tests (tests/e2e/xspec-460-*.test.js, xspec-461-*.test.js) do not:
//   1. OWT-015: every detection that was added has been observed RED. The mutation block edits the SOURCE TEXT of a
//      copy of cli/src/utils/open-work-tracking.mjs (one detection made weaker, or always-pass), runs the copy as a
//      real subprocess against the same cases, and requires the declared cases to go red. A replacement that does not
//      match exactly once fails, so a mutation that silently did nothing cannot pass for one that worked.
//   2. The cross-project cases run against REAL git repositories (a tag that exists, a tag that was deleted, a
//      directory that is not a repository), because the self-test arms use a fake environment and so cannot see a
//      weakened real lookup.
//   3. AC-2 of 461 and the arm check of 460: the checker's OWN self-test goes red under the mutants that have an arm.
//
// Every fixture is built under mkdtempSync(join(tmpdir(), ...)); nothing is written into the repo.

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync, readFileSync, mkdirSync, realpathSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';

import { makeProject, WAITING_HEAD, waitsFor, git } from '../../utils/xspec-460.js';

const REPO_ROOT = join(import.meta.dirname, '..', '..', '..', '..');
const SCRIPT = join(REPO_ROOT, 'cli', 'src', 'utils', 'open-work-tracking.mjs');

let dir;
let other;
let plain;
beforeEach(() => {
  dir = realpathSync(mkdtempSync(join(tmpdir(), 'uds-owt-cross-')));
  other = makeProject(dir, 'other', { files: { 'docs/a.md': '# a\n' }, tags: ['v1.0.0'] });
  plain = join(dir, 'plain');
  mkdirSync(plain);
});
afterEach(() => { rmSync(dir, { recursive: true, force: true }); });

const w = (name, content) => {
  const p = join(dir, name);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, content);
  return p;
};
function run(script, args) {
  const r = spawnSync('node', [script, ...args], { encoding: 'utf8', cwd: dir });
  return { status: r.status, out: `${r.stdout}${r.stderr}` };
}

const NOW = ['--now', '2026-10-07'];
const roots = () => ['--root', `other=${other}`, '--root', `plain=${plain}`, '--root', `missing=${join(dir, 'no-such')}`];
const wait = (name, rows, extra = roots()) => ['waiting', w(name, WAITING_HEAD + rows), ...NOW, ...extra];
const nextAction = (name, header, extra = []) => ['next-action', w(name, `| item | owner | ${header} |\n|---|---|---|\n| a | albert | edit scripts/foo.mjs |\n`), ...extra];

const nextCell = (name, cell, extra = []) => ['next-action', w(name, `| item | Next action |\n|---|---|\n| a | ${cell} |\n`), ...extra];
const draft = (name, text, extra = []) => ['waiting', w(name, `${WAITING_HEAD}| ask ops | not-yet-asked | ${text} | | | |\n`), ...NOW, ...extra];

const CASES = {
  // ── 460: where another project stands ──
  'cross: a tag that exists in the other project is released': {
    args: () => wait('c1.md', waitsFor('x', 'other:v1.0.0')), code: 0, out: /released=1 not-yet-released=0 not-visible-from-here=0 needs-a-person=0/,
  },
  'cross: a tag that is not there is not yet released': {
    args: () => wait('c2.md', waitsFor('x', 'other:v9.9.9')), code: 0, out: /released=0 not-yet-released=1 not-visible-from-here=0 needs-a-person=0/,
  },
  'cross: a path that exists in the other project is released': {
    args: () => wait('c3.md', waitsFor('x', 'other:docs/a.md')), code: 0, out: /released=1 not-yet-released=0/,
  },
  'cross: a path that is not there is not yet released': {
    args: () => wait('c4.md', waitsFor('x', 'other:docs/none.md')), code: 0, out: /released=0 not-yet-released=1/,
  },
  'cross: a project with no declared directory is not visible and not released': {
    args: () => wait('c5.md', waitsFor('x', 'stranger:v1.0.0')), code: 0,
    out: /released=0 not-yet-released=0 not-visible-from-here=1[\s\S]*NOT VISIBLE FROM HERE stranger:v1\.0\.0[^\n]*no directory on this machine is declared/,
  },
  'cross: a declared directory that does not exist is not visible, for a path as for a tag': {
    args: () => wait('c6.md', waitsFor('x', 'missing:docs/a.md')), code: 0,
    out: /released=0 not-yet-released=0 not-visible-from-here=1[\s\S]*does not exist on this machine/,
  },
  'cross: a directory that is not a git repository cannot say whether a tag exists, so it is not visible': {
    args: () => wait('c7.md', waitsFor('x', 'plain:v1.0.0')), code: 0,
    out: /released=0 not-yet-released=0 not-visible-from-here=1[\s\S]*cannot be read here \(not a git repository, or git failed\)/,
  },
  'cross: a requirement identifier in another project needs a person and is never released': {
    args: () => wait('c8.md', waitsFor('x', 'other:XSPEC-460')), code: 0,
    out: /released=0 not-yet-released=0 not-visible-from-here=0 needs-a-person=1/,
  },
  'cross: a machine-specific absolute path is a violation': {
    args: () => wait('c9.md', waitsFor('x', '/Users/someone/other/docs/a.md')), code: 1, out: /VIOLATION OWT-027: .*names a machine-specific absolute path/,
  },
  'cross: a path that leaves the other project is a violation': {
    args: () => wait('c10.md', waitsFor('x', 'other:../secret.md')), code: 1, out: /VIOLATION OWT-027: .*a path that leaves project "other"/,
  },
  'cross: an item that waits for another project is not asked whether it was asked': {
    args: () => wait('c11.md', waitsFor('x', 'other:v1.0.0')), code: 0, out: /waiting-unspecified=0 [^\n]*waiting-cross-project=1/, notOut: /VIOLATION/,
  },
  'cross: a plain waiting item is still named by OWT-020': {
    args: () => wait('c12.md', waitsFor('x', 'the reply arrives')), code: 1, out: /VIOLATION OWT-020/,
  },
  'cross: --root given twice without a name is refused': {
    args: () => ['waiting', w('c13.md', WAITING_HEAD + waitsFor('x', 'other:v1.0.0')), ...NOW, '--root', dir, '--root', other], code: 2, out: /--root DIR was given more than once/,
  },
  'cross: a project name that is not a logical name is refused': {
    args: () => ['waiting', w('c14.md', WAITING_HEAD + waitsFor('x', 'other:v1.0.0')), ...NOW, '--root', `Other=${other}`], code: 2, out: /is not a logical name/,
  },
  'cross: a URL and a sentence are not read as a project reference': {
    args: () => wait('c15.md', waitsFor('x', 'see https://example.com/a; notes: later')), code: 1, out: /VIOLATION OWT-020/, notOut: /OWT-027\/028/,
  },
  // ── 461: the next-action word list ──
  'vocab: 下一個動作 is read by default': { args: () => nextAction('v1.md', '下一個動作'), code: 0, out: /walked 1 next-action field/ },
  'vocab: 待辦 is not read by default': { args: () => nextAction('v2.md', '待辦'), code: 2, out: /CANNOT DECIDE: no next-action field found/ },
  // ── 461 R5: command words ──
  'cmd: glab is a built-in command': { args: () => nextCell('m1.md', '`glab mr merge 486`'), code: 0, out: /<- command:glab mr merge 486/ },
  'cmd: an undeclared kubectl names nothing': { args: () => nextCell('m2.md', 'kubectl rollout restart'), code: 1, out: /unnamed=1/ },
  'cmd: a declared kubectl is read by next-action': { args: () => nextCell('m3.md', 'kubectl rollout restart', ['--command-word', 'kubectl']), code: 0, out: /unnamed=0[\s\S]*<- command:kubectl rollout/ },
  'cmd: waiting does not know an undeclared command': { args: () => draft('m4.md', 'kubectl rollout restart'), code: 1, out: /VIOLATION OWT-021/ },
  'cmd: waiting reads a declared command': { args: () => draft('m5.md', 'kubectl rollout restart', ['--command-word', 'kubectl']), code: 0, notOut: /VIOLATION/ },
  'cmd: go, make and sh are not commands': { args: () => nextCell('m6.md', 'go test the thing, make all of it, sh run later'), code: 1, out: /unnamed=1/ },
  'cmd: a blank command word is refused': { args: () => nextCell('m7.md', 'kubectl rollout restart', ['--command-word', ' ']), code: 2, out: /a declared command word is empty or blank/ },
  'cmd: a command word with a space is refused': { args: () => draft('m8.md', 'kubectl rollout restart', ['--command-word', 'git lfs']), code: 2, out: /one program name/ },
  // ── 461 R6: what resolved means ──
  'resolve: the split of named-unresolved is printed and sums to the old number': {
    args: () => nextCell('r1.md', 'edit src/none.js and `glab mr merge 486`'), code: 0, out: /named-unresolved=1 [^\n]*\n\[owt\]   of the named-unresolved \(1\): path-missing=1 not-resolvable=0/,
  },
  'resolve: a command alone is not-resolvable, not a missing path': {
    args: () => nextCell('r2.md', '`glab mr merge 486`'), code: 0, out: /of the named-unresolved \(1\): path-missing=0 not-resolvable=1/,
  },
  'resolve: the root is said, with where it came from': {
    args: () => nextCell('r3.md', 'edit src/none.js'), code: 0, out: /RESOLUTION: a path is looked up under .* \(the current directory: no --root was given\)\. Only a PATH is looked up/,
  },
  'resolve: a carrier outside any git repository is said to be': {
    args: () => nextCell('r4.md', 'edit src/none.js'), code: 0, out: /is outside any git repository, so its paths are resolved against/,
  },
  'resolve: --root says it came from --root and drops the outside-repository line': {
    args: () => nextCell('r5.md', 'edit src/none.js', ['--root', dir]), code: 0, out: /\(from --root\)/, notOut: /outside any git repository/,
  },
  'vocab: a declared 待辦 is read': { args: () => nextAction('v3.md', '待辦', ['--next-action-word', '待辦']), code: 0, out: /walked 1 next-action field/ },
  'vocab: a declared word is plain text, not a pattern': { args: () => nextAction('v4.md', 'ToXDo', ['--next-action-word', 'to.do']), code: 2, out: /CANNOT DECIDE/ },
  'vocab: a blank declared word is refused': { args: () => nextAction('v5.md', 'Next action', ['--next-action-word', ' ']), code: 2, out: /is empty or blank/ },
  'vocab: the exit-2 text lists the headers the carrier showed': { args: () => nextAction('v6.md', '待辦'), code: 2, out: /table headers \(3 distinct\): "item", "owner", "待辦"/ },
  'vocab: the exit-2 text says a carrier with a table has a table and no matching header': { args: () => nextAction('v8.md', '待辦'), code: 2, out: /v8\.md: has 1 table\(s\), but no table header matches a recognised word/ },
  'vocab: the exit-2 text tells a carrier with nothing to read from one with a table': {
    args: () => ['next-action', w('v7.md', 'only words\n')], code: 2, out: /has no table and no heading to read/,
  },
};

function assertCase(r, c) {
  expect(r.status).toBe(c.code);
  if (c.out) expect(r.out).toMatch(c.out);
  if (c.notOut) expect(r.out).not.toMatch(c.notOut);
}

describe('the 1.3.0 checks behave as declared on the real script, against real git repositories', () => {
  it('passes its own self-test arms, now including OWT-027, OWT-028 and the next-action word list', () => {
    expect(run(SCRIPT, ['--self-test']).status).toBe(0);
  });
  it('every case in the table behaves as declared', () => {
    for (const [name, c] of Object.entries(CASES)) {
      const r = run(SCRIPT, c.args());
      try { assertCase(r, c); } catch (e) { throw new Error(`case "${name}": ${e.message}`); }
    }
  });
  it('a tag deleted after the first run is not released on the second', () => {
    const args = wait('again.md', waitsFor('x', 'other:v1.0.0'));
    expect(run(SCRIPT, args).out).toMatch(/released=1 not-yet-released=0/);
    git(other, ['tag', '-d', 'v1.0.0']);
    expect(run(SCRIPT, args).out).toMatch(/released=0 not-yet-released=1/);
  });
});

// ── OWT-015: the new detections have been observed red ──────────────────────
const NEUTRALISE_SELF_TEST = ['const selfTest = runSelfTest();', 'const selfTest = { ok: true, failures: [] };'];
const ONE_LIST_LINE = (word) => `  ['${word}', '${word}'],\n`;

const MUTANTS = [
  { name: 'OWT-027 lets a machine-specific path through', edits: [["if (waitingNow && (MACHINE_PATH.test(conditionText) || refs.some((x) => x.kind === 'absolute'))) {", 'if (false) {']], red: ['cross: a machine-specific absolute path is a violation'], arm: 'OWT-027 violating: a release condition holding' },
  { name: 'OWT-027 lets an object leave the other project', edits: [["if (x.kind === 'outside') { bad(", 'if (false) { bad(']], red: ['cross: a path that leaves the other project is a violation'], arm: 'OWT-027 violating: an object that leaves' },
  { name: 'OWT-027 accepts any --root name', edits: [['if (!PROJECT_NAME.test(m[1])) return {', 'if (false) return {']], red: ['cross: a project name that is not a logical name is refused'], arm: 'OWT-027 violating: a project name that is not a logical name' },
  { name: 'OWT-027 accepts a second plain --root', edits: [['if (plain !== undefined) return {', 'if (false) return {']], red: ['cross: --root given twice without a name is refused'] },
  { name: 'OWT-028 reads an unseen project as released', edits: [["if (dir === undefined) return { status: 'not-visible'", "if (dir === undefined) return { status: 'released'"]], red: ['cross: a project with no declared directory is not visible and not released'], arm: 'OWT-028 violating: a project this machine cannot see' },
  { name: 'OWT-028 does not look at whether the directory exists', edits: [['if (!env.dirExists(dir)) return {', 'if (false) return {']], red: ['cross: a declared directory that does not exist is not visible, for a path as for a tag'] },
  { name: 'OWT-028 reads an unreadable tag lookup as an absent tag', edits: [["if (t === 'unreadable') return {", 'if (false) return {']], red: ['cross: a directory that is not a git repository cannot say whether a tag exists, so it is not visible'] },
  { name: 'OWT-028 reads every tag as present', edits: [["return t === 'present' ? { status: 'released'", "return true ? { status: 'released'"]], red: ['cross: a tag that is not there is not yet released'], arm: 'OWT-028 violating: a tag that is not there' },
  { name: 'OWT-028 reads every tag as absent', edits: [["return t === 'present' ? { status: 'released'", "return false ? { status: 'released'"]], red: ['cross: a tag that exists in the other project is released'], arm: 'OWT-028 clean: a tag that exists' },
  { name: 'OWT-028 reads every path as present', edits: [["if (ref.kind === 'path') return env.pathExists(join(dir, ref.value.replace(/^\\.\\//, ''))) ? {", "if (ref.kind === 'path') return true ? {"]], red: ['cross: a path that is not there is not yet released'], arm: 'OWT-028 violating: a path that is not there' },
  { name: 'OWT-028 reads every path as absent', edits: [["if (ref.kind === 'path') return env.pathExists(join(dir, ref.value.replace(/^\\.\\//, ''))) ? {", "if (ref.kind === 'path') return false ? {"]], red: ['cross: a path that exists in the other project is released'], arm: 'OWT-028 clean: a path that exists' },
  { name: 'OWT-028 reads an identifier in another project as released', edits: [["return { status: 'needs-a-person', why:", "return { status: 'released', why:"]], red: ['cross: a requirement identifier in another project needs a person and is never released'], arm: 'OWT-028 violating: an identifier in another project' },
  { name: 'OWT-028 does not count the unseen apart', edits: [['res.cross.counts[got.status]++;', "res.cross.counts[got.status === 'not-visible' ? 'released' : got.status]++;"]], red: ['cross: a project with no declared directory is not visible and not released'], arm: 'OWT-028 violating: a project this machine cannot see' },
  { name: 'OWT-020 is waived for every waiting item, not only the ones that wait for another project', edits: [["refs.some((x) => x.kind !== 'absolute' && x.kind !== 'outside')) state =", 'true) state =']], red: ['cross: a plain waiting item is still named by OWT-020'], arm: 'OWT-020 violating: a plain waiting item is still named' },
  { name: 'OWT-020 is not waived for an item that waits for another project', edits: [["state = 'waiting-cross-project'; // [mutation-anchor:cross-project-exempt]", 'void 0;']], red: ['cross: an item that waits for another project is not asked whether it was asked'], arm: 'OWT-020 clean: a waiting item that waits for another project' },
  { name: '461 R5 ignores declared command words in next-action', edits: [['const commands = [...COMMANDS, ...(opts.extraCommands || [])];', 'const commands = [...COMMANDS];']], red: ['cmd: a declared kubectl is read by next-action', 'cmd: waiting reads a declared command'], arm: '461 R5 clean: a declared command is read by next-action' },
  { name: '461 R5 does not hand declared command words to waiting', edits: [[', extraCommands: opts.extraCommands }).status !== \'unnamed\'', ' }).status !== \'unnamed\'']], red: ['cmd: waiting reads a declared command'], arm: '461 R5 clean: the same row under waiting names a draft once the command is declared' },
  { name: '461 R5 drops glab from the built-in commands', edits: [["'gh', 'glab', 'bash'", "'gh', 'bash'"]], red: ['cmd: glab is a built-in command'], arm: '461 R5 clean: glab and dotnet are built-in commands' },
  { name: '461 R5 widens the built-in commands with go', edits: [["'cargo', 'dotnet', 'uds'", "'cargo', 'dotnet', 'go', 'uds'"]], red: ['cmd: go, make and sh are not commands'], arm: '461 R5 violating: a program that was not declared' },
  { name: '461 R5 accepts a blank command word', edits: [['if (!word) return { words: [], error: \'a declared command word', 'if (!word) continue; if (false) return { words: [], error: \'a declared command word']], red: ['cmd: a blank command word is refused'], arm: '461 R5 violating: a blank or spaced command word' },
  { name: '461 R5 accepts a command word with a space', edits: [['if (/\\s/.test(word)) return {', 'if (false) return {']], red: ['cmd: a command word with a space is refused'], arm: '461 R5 violating: a blank or spaced command word' },
  { name: '461 R6 counts every unresolved row as a missing path', edits: [["unresolved: resolved ? null : (lookedUp ? 'path-missing' : 'not-resolvable'),", "unresolved: resolved ? null : 'path-missing',"]], red: ['resolve: a command alone is not-resolvable, not a missing path'], arm: '461 R6 clean: a command and an identifier are not-resolvable' },
  { name: '461 R6 does not say which directory paths are looked up under', edits: [["out.push(`RESOLUTION: ${lookupSentence('a path',", "void (`RESOLUTION: ${lookupSentence('a path',"]], red: ['resolve: the root is said, with where it came from', 'resolve: --root says it came from --root and drops the outside-repository line'], arm: '461 R6 clean: the resolution lines' },
  { name: '461 R6 does not say a carrier is outside any repository', edits: [['if (!insideGitRepo(c.path)) {', 'if (false) {']], red: ['resolve: a carrier outside any git repository is said to be'] },
  { name: '461 R1 drops 下一個動作', edits: [[ONE_LIST_LINE('下一個動作'), '']], red: ['vocab: 下一個動作 is read by default'], arm: '461 R1 clean' },
  { name: '461 R1 widens the list with 待辦', edits: [[ONE_LIST_LINE('接下來要做什麼'), ONE_LIST_LINE('接下來要做什麼') + ONE_LIST_LINE('待辦')]], red: ['vocab: 待辦 is not read by default', 'vocab: the exit-2 text lists the headers the carrier showed'], arm: '461 R1 violating' },
  { name: '461 R2 does not merge a declared word into the list', edits: [["return new RegExp(`${VOCAB.nextAction.source}|${words.map(escapeRegExp).join('|')}`, 'i'); // [mutation-anchor:declared-merged]", 'return VOCAB.nextAction;']], red: ['vocab: a declared 待辦 is read'], arm: '461 R2 clean: a declared word is read' },
  { name: '461 R2 reads a declared word as a pattern', edits: [['words.map(escapeRegExp).join', 'words.join']], red: ['vocab: a declared word is plain text, not a pattern'], arm: '461 R2 clean: a declared word is plain text' },
  { name: '461 R2 drops a blank word instead of refusing it', edits: [["if (!word) return { words: [], error: 'a declared next-action word", "if (!word) continue; if (false) return { words: [], error: 'a declared next-action word"]], red: ['vocab: a blank declared word is refused'], arm: '461 R2 violating: a blank declared word' },
  { name: '461 R3 leaves out the list of headers', edits: [["show('table headers', d.headers);", 'void 0;']], red: ['vocab: the exit-2 text lists the headers the carrier showed'], arm: '461 R3 clean: exit-2 text names the headers' },
  { name: '461 R3 does not tell the two cases apart', edits: [['else if (d.tables > 0) verdict =', 'else if (false) verdict =']], red: ['vocab: the exit-2 text says a carrier with a table has a table and no matching header'], arm: '461 R3 clean: a carrier with a table and one with nothing to read' },
];

function makeMutant(edits, { neutralise = true } = {}) {
  let src = readFileSync(SCRIPT, 'utf8');
  const all = neutralise ? [NEUTRALISE_SELF_TEST, ...edits] : edits;
  for (const [from, to] of all) {
    const n = src.split(from).length - 1;
    if (n !== 1) throw new Error(`mutation did not apply exactly once (${n}x): ${from.slice(0, 80)}`);
    src = src.replace(from, () => to);
  }
  const p = join(dir, `mutant-${Math.random().toString(36).slice(2)}.mjs`);
  writeFileSync(p, src);
  return p;
}

function redCasesUnder(mutantPath) {
  const red = [];
  for (const [name, c] of Object.entries(CASES)) {
    const r = run(mutantPath, c.args());
    try { assertCase(r, c); } catch { red.push(name); }
  }
  return red;
}

describe('OWT-015: the 1.3.0 detections have been observed red', () => {
  it.each(MUTANTS.map((m) => [m.name, m]))('mutant "%s" turns its declared cases red', (_n, m) => {
    const red = redCasesUnder(makeMutant(m.edits));
    expect(red.length, `the mutant "${m.name}" changed nothing any case can see`).toBeGreaterThan(0);
    for (const declared of m.red) expect(red, `declared case not red: ${declared}`).toContain(declared);
  });

  it.each(MUTANTS.filter((m) => m.arm).map((m) => [m.name, m]))('the checker\'s own self-test goes red under mutant "%s"', (_n, m) => {
    const r = run(makeMutant(m.edits, { neutralise: false }), ['--self-test']);
    expect(r.status, r.out).toBe(2);
    expect(r.out).toMatch(/self-test FAILED/);
    expect(r.out).toContain(m.arm);
  });

  it('refuses a mutation that does not apply exactly once, so a no-op mutant cannot pass for a red one', () => {
    expect(() => makeMutant([['this text is not in the script', 'x']])).toThrow(/did not apply exactly once/);
  });
});
