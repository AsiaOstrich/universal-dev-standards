/**
 * XSPEC-518 R2 and R3, tested the way an adopter meets them: the shipped script is run as a
 * script in a throwaway project, and what it prints and the exit code it returns are read back.
 *
 *   R2  a search that did not see the whole project — it stopped at the file limit, a directory
 *       could not be opened, a file could not be read — says "INCOMPLETE" and exits non-zero (2).
 *       It never reports a pass over a project it only partly read. The limit is hard: no more than
 *       N files are listed, even inside one directory.
 *   R3  one test can be exempted by a comment that gives a usable reason (at least 8 letters, digits
 *       or Chinese characters, not a placeholder); it reaches only the test it is attached to.
 *
 * Wires that make these red when cut (each is one line of templates/gates/check-anti-fake-tests.mjs):
 *   R2  `return r.incomplete ? 2 : 0;`   `result.incomplete = result.truncated || ...;`
 *       `if (out.length >= limit) { truncated = true; break; }`   `unreadable.push(`
 *   R3  `if (exemption && exemption.reason) {`   `return kept.length >= MIN_REASON_CHARS;`
 *       `if (casesOnLine.get(caseLine) !== 1) return null;`   `else break;`-style attachment (`break; // blank, or code`)
 */
import { describe, it, expect, afterEach } from 'vitest';
import { spawnSync } from 'child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, chmodSync } from 'fs';
import { tmpdir } from 'os';
import { join, resolve, dirname } from 'path';
import { walkFilesChecked, isUsableReason, MIN_REASON_CHARS, DEFAULT_POLICY } from '../../../../templates/gates/check-anti-fake-tests.mjs';

const REPO = resolve(import.meta.dirname, '../../../..');
const ANTI = join(REPO, 'templates/gates/check-anti-fake-tests.mjs');
const STUBS = join(REPO, 'templates/gates/check-stubs.mjs');

const dirs = [];
const locked = [];
afterEach(() => {
  for (const l of locked.splice(0)) { try { chmodSync(l, 0o755); } catch { /* already gone */ } }
  for (const d of dirs.splice(0)) rmSync(d, { recursive: true, force: true });
});
// chmod 000 only keeps a process out when it is not root and the file system honours modes.
const canLock = process.platform !== 'win32' && typeof process.getuid === 'function' && process.getuid() !== 0;

function project(files) {
  const dir = mkdtempSync(join(tmpdir(), 'uds-x518-'));
  dirs.push(dir);
  for (const [rel, text] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, rel)), { recursive: true });
    writeFileSync(join(dir, rel), text);
  }
  return dir;
}
const run = (script, args, cwd) => {
  const r = spawnSync(process.execPath, [script, ...args], { cwd, encoding: 'utf8' });
  return { code: r.status, out: r.stdout || '', err: r.stderr || '' };
};

const GOOD = "it('adds', () => { expect(add(1, 2)).toBe(3); });\n";
const FAKE = "it('does nothing', () => { const a = 1; });\n";
/**
 * The walk reads one directory whole and checks its limit between directories, so a project
 * needs several directories before a limit can cut it. Six directories, one test file each; the
 * walk takes them last-in first-out, so the fake in p1 is the last one it would reach.
 */
const sixDirs = () => project({
  'p1/a.test.js': FAKE, 'p2/b.test.js': GOOD, 'p3/c.test.js': GOOD,
  'p4/d.test.js': GOOD, 'p5/e.test.js': GOOD, 'p6/f.test.js': GOOD
});
const fourCleanDirs = () => project({ 'p1/a.test.js': GOOD, 'p2/b.test.js': GOOD, 'p3/c.test.js': GOOD, 'p4/d.test.js': GOOD });

describe('XSPEC-518 R2: a search that hit the file limit says so', () => {
  it('walkFilesChecked lists at most `limit` files (a hard limit) and reports truncated only when a file was left out', () => {
    const dir = project({ 'a.txt': 'x', 'b.txt': 'x', 'sub/c.txt': 'x', 'sub/d.txt': 'x' });
    const cut = walkFilesChecked(dir, DEFAULT_POLICY, 2);
    expect(cut.truncated).toBe(true);
    expect(cut.files).toHaveLength(2);
    const exact = walkFilesChecked(dir, DEFAULT_POLICY, 4);
    expect(exact.truncated).toBe(false);
    expect(exact.files).toHaveLength(4);
    expect(walkFilesChecked(dir, DEFAULT_POLICY, 5).truncated).toBe(false);
    expect(walkFilesChecked(dir, DEFAULT_POLICY).unreadable).toEqual([]);
  });

  it('the limit holds inside one directory: five test files, --max-files 2 is INCOMPLETE and at most 2 are scanned', () => {
    const files = {};
    for (const n of ['a', 'b', 'c', 'd', 'e']) files[`tests/${n}.test.js`] = GOOD;
    const dir = project(files);
    const r = run(ANTI, ['--max-files', '2'], dir);
    expect(r.code).toBe(2);
    expect(r.out).toContain('scanned 2 test file(s)');
    expect(r.out).toContain('stopped after 2 files');
    expect(run(ANTI, ['--max-files', '5'], dir).code).toBe(0);
  });

  it('a clean-looking partial walk exits 2 and prints INCOMPLETE, never "no fake tests found"', () => {
    const dir = fourCleanDirs();
    const r = run(ANTI, ['--max-files', '2'], dir);
    expect(r.code).toBe(2);
    expect(r.out).toContain('INCOMPLETE');
    expect(r.out).toContain('NOT a pass');
    expect(r.out).not.toContain('no fake tests found');
    const j = JSON.parse(run(ANTI, ['--json', '--max-files=2'], dir).out);
    expect(j.incomplete).toBe(true);
    expect(j.walkLimit).toBe(2);
  });

  it('the same project with room to finish exits 0 and is not marked incomplete', () => {
    const dir = fourCleanDirs();
    const r = run(ANTI, [], dir);
    expect(r.code).toBe(0);
    expect(r.out).toContain('no fake tests found');
    expect(JSON.parse(run(ANTI, ['--json', '--max-files', '4'], dir).out).incomplete).toBe(false);
    expect(run(ANTI, ['--max-files', '4'], dir).code).toBe(0);
  });

  it('a fake test in the part the walk did not reach is why a partial pass is dangerous: full run exits 1, the cut run finds nothing yet does not exit 0', () => {
    const dir = sixDirs();
    expect(run(ANTI, [], dir).code).toBe(1);
    const cut = run(ANTI, ['--max-files', '3'], dir);
    expect(cut.out).not.toContain('does nothing');
    expect(cut.code).toBe(2);
    expect(cut.out).toContain('INCOMPLETE');
  });

  it('findings in the part that was read still exit 1, and the output also says the search was incomplete', () => {
    const dir = project({ 'p1/a.test.js': GOOD, 'p2/b.test.js': GOOD, 'p3/c.test.js': GOOD, 'p4/d.test.js': FAKE, 'p5/e.test.js': GOOD });
    const r = run(ANTI, ['--max-files', '1'], dir);
    // last-in first-out: p5 is read, then the limit is reached with p1..p4 unread
    expect(r.out).toContain('INCOMPLETE');
    expect(r.code).toBe(2);
    const readFake = project({ 'p1/a.test.js': GOOD, 'p2/b.test.js': GOOD, 'p3/c.test.js': GOOD, 'p4/d.test.js': GOOD, 'p5/e.test.js': FAKE });
    const s = run(ANTI, ['--max-files', '1'], readFake);
    expect(s.code).toBe(1);
    expect(s.out).toContain('p5/e.test.js:1');
    expect(s.out).toContain('and the search was INCOMPLETE');
  });

  it('the stub scanner shares the walk, so it says the same thing', () => {
    const dir = project({ 'a/a.js': 'export const a = 1;\n', 'b/b.js': 'export const b = 2;\n', 'c/c.js': 'export const c = 3;\n' });
    const cut = run(STUBS, ['--max-files', '2'], dir);
    expect(cut.code).toBe(2);
    expect(cut.out).toContain('INCOMPLETE');
    expect(cut.out).not.toContain('no stubs found');
    expect(run(STUBS, [], dir).code).toBe(0);
  });

  it.skipIf(!canLock)('a directory that cannot be opened makes the search INCOMPLETE (exit 2), in both scanners', () => {
    const dir = project({ 'tests/ok.test.js': GOOD, 'src/a.js': 'export const a = 1;\n', 'secret/inside.test.js': FAKE });
    locked.push(join(dir, 'secret'));
    chmodSync(join(dir, 'secret'), 0o000);
    const r = run(ANTI, [], dir);
    expect(r.code).toBe(2);
    expect(r.out).toContain('could not be opened');
    expect(r.out).toContain('secret (EACCES)');
    expect(r.out).toContain('NOT a pass');
    expect(r.out).not.toContain('no fake tests found');
    const j = JSON.parse(run(ANTI, ['--json'], dir).out);
    expect(j.incomplete).toBe(true);
    expect(j.unreadableDirs).toEqual(['secret (EACCES)']);
    const s = run(STUBS, [], dir);
    expect(s.code).toBe(2);
    expect(s.out).toContain('secret (EACCES)');
    chmodSync(join(dir, 'secret'), 0o755);
    expect(run(ANTI, [], dir).code).toBe(1); // the fake inside was there all along
  });

  it.skipIf(!canLock)('a test file that cannot be read makes the search INCOMPLETE; findings elsewhere still exit 1', () => {
    const dir = project({ 'tests/ok.test.js': GOOD, 'tests/locked.test.js': GOOD });
    locked.push(join(dir, 'tests/locked.test.js'));
    chmodSync(join(dir, 'tests/locked.test.js'), 0o000);
    const r = run(ANTI, [], dir);
    expect(r.code).toBe(2);
    expect(r.out).toContain('tests/locked.test.js (unreadable (EACCES))');
    expect(r.out).toContain('could not be read');
    expect(JSON.parse(run(ANTI, ['--json'], dir).out).readFailures).toBe(1);
    writeFileSync(join(dir, 'tests/fake.test.js'), FAKE);
    expect(run(ANTI, [], dir).code).toBe(1);
  });

  it('a test file over 2 MB is listed under NOT scanned and does not make the run INCOMPLETE (same as a language with no rule)', () => {
    const dir = project({ 'tests/big.test.js': `// ${'x'.repeat(2 * 1024 * 1024 + 10)}\n`, 'tests/ok.test.js': GOOD });
    const r = run(ANTI, [], dir);
    expect(r.code).toBe(0);
    expect(r.out).toContain('tests/big.test.js (larger than 2 MB)');
    expect(JSON.parse(run(ANTI, ['--json'], dir).out).incomplete).toBe(false);
  });

  it('a --max-files that is not a positive whole number is refused with exit 2', () => {
    const dir = project({ 'tests/a.test.js': GOOD });
    for (const bad of ['0', 'abc', '-3', '1.5']) {
      const r = run(ANTI, ['--max-files', bad], dir);
      expect(r.code, `--max-files ${bad}`).toBe(2);
      expect(r.err).toContain('--max-files needs a positive whole number');
    }
  });
});

describe('XSPEC-518 R3: one test, exempted with a reason', () => {
  const exempt = (comment, test = "it('hook runs', () => { runHook(); });") => project({ 'tests/h.test.js': `${comment}\n${test}\n` });
  const json = (dir) => JSON.parse(run(ANTI, ['--json'], dir).out);

  it('a comment with a usable reason above the test exempts it: exit 0, and the exemption is listed with its reason', () => {
    const dir = exempt('// ANTI_FAKE_EXEMPT: the hook only has to not throw on this platform');
    const r = run(ANTI, [], dir);
    expect(r.code).toBe(0);
    expect(r.out).toContain('exempted by an ANTI_FAKE_EXEMPT');
    expect(r.out).toContain('tests/h.test.js:2  "hook runs" — the hook only has to not throw on this platform');
    const j = json(dir);
    expect(j.findings).toEqual([]);
    expect(j.exempted).toEqual([{
      file: 'tests/h.test.js', rule: 'no-assertion', line: 2, name: 'hook runs', reason: 'the hook only has to not throw on this platform'
    }]);
  });

  it('a reason that is empty, a placeholder or too short does not exempt: the finding stays, and says why', () => {
    const bad = [
      '// ANTI_FAKE_EXEMPT:', '// ANTI_FAKE_EXEMPT', '// ANTI_FAKE_EXEMPT:   ', '/* ANTI_FAKE_EXEMPT: */', '// ANTI_FAKE_EXEMPT: ---',
      '// ANTI_FAKE_EXEMPT: x', '// ANTI_FAKE_EXEMPT: 1', '// ANTI_FAKE_EXEMPT: TODO', '// ANTI_FAKE_EXEMPT: todo todo todo', '// ANTI_FAKE_EXEMPT: TBD / FIXME / XXX',
      '// ANTI_FAKE_EXEMPT: N/A', '// ANTI_FAKE_EXEMPT: 待補', '// ANTI_FAKE_EXEMPT: smoke', '// ANTI_FAKE_EXEMPT: abcdefg', '// ANTI_FAKE_EXEMPT: 只驗證不拋例外'
    ];
    for (const comment of bad) {
      const dir = exempt(comment);
      const r = run(ANTI, [], dir);
      expect(r.code, comment).toBe(1);
      expect(r.out, comment).toContain('tests/h.test.js:2  no-assertion');
      expect(r.out, comment).toContain('gives no usable reason');
      expect(json(dir).exempted, comment).toEqual([]);
    }
  });

  it(`the shortest reason that counts is ${MIN_REASON_CHARS} letters, digits or Chinese characters, placeholders not counted`, () => {
    expect(MIN_REASON_CHARS).toBe(8);
    for (const ok of ['abcdefgh', 'smoke test only', '只驗證不會拋例外', 'TODO: check the exit code of the hook', 'run 12345678']) expect(isUsableReason(ok), ok).toBe(true);
    for (const no of ['', 'x', 'TODO', 'abcdefg', '只驗證不拋例外', 'TODO TODO TODO TODO', 'n/a', '--------']) expect(isUsableReason(no), no).toBe(false);
    for (const ok of ['abcdefgh', '只驗證不會拋例外']) expect(run(ANTI, [], exempt(`// ANTI_FAKE_EXEMPT: ${ok}`)).code, ok).toBe(0);
  });

  it('the reason can sit after a block comment opener, or on the same line as the test', () => {
    expect(run(ANTI, [], exempt('/* ANTI_FAKE_EXEMPT: smoke test only */')).code).toBe(0);
    const inline = project({ 'tests/h.test.js': "it('hook runs', () => { runHook(); }); // ANTI_FAKE_EXEMPT: smoke test only\n" });
    expect(run(ANTI, [], inline).code).toBe(0);
  });

  it('the marker inside a string is text, not a decision', () => {
    const dir = project({ 'tests/h.test.js': "const note = 'ANTI_FAKE_EXEMPT: not a comment at all';\nit('hook runs', () => { runHook(); });\n" });
    const r = run(ANTI, [], dir);
    expect(r.code).toBe(1);
    expect(r.out).toContain('tests/h.test.js:2  no-assertion');
  });

  it('it exempts the one test it is attached to: the next test, one line below, is still found', () => {
    const dir = project({
      'tests/h.test.js': "// ANTI_FAKE_EXEMPT: covers only the next test\nit('first', () => { runHook(); });\nit('second', () => { runHook(); });\n"
    });
    const j = json(dir);
    expect(j.exempted.map((x) => x.name)).toEqual(['first']);
    expect(j.findings.map((f) => f.name)).toEqual(['second']);
    expect(run(ANTI, [], dir).code).toBe(1);
  });

  it('a marker at the end of the PREVIOUS test does not exempt the test below it, and does not exempt the previous test either', () => {
    const dir = project({
      'tests/h.test.js': "it('first', () => {\n  runHook();\n  // ANTI_FAKE_EXEMPT: this belongs to nothing but is a long reason\n});\nit('second', () => { runHook(); });\n"
    });
    const j = json(dir);
    expect(j.exempted).toEqual([]);
    expect(j.findings.map((f) => f.name)).toEqual(['first', 'second']);
    // …and the same when the marker trails the closing line of the previous test: it is below that test's own line, and the line above 'second' holds code
    const closing = project({ 'tests/h.test.js': "it('first', () => {\n  runHook();\n}); // ANTI_FAKE_EXEMPT: smoke test of the first hook\nit('second', () => { runHook(); });\n" });
    expect(json(closing).findings.map((f) => f.name)).toEqual(['first', 'second']);
    expect(json(closing).exempted).toEqual([]);
  });

  it('a blank line or code between the marker and the test breaks the attachment', () => {
    expect(run(ANTI, [], project({ 'tests/h.test.js': "// ANTI_FAKE_EXEMPT: too far away from it\n\nit('hook runs', () => { runHook(); });\n" })).code).toBe(1);
    expect(run(ANTI, [], project({ 'tests/h.test.js': "// ANTI_FAKE_EXEMPT: too far away from it\nconst a = 1;\nit('hook runs', () => { runHook(); });\n" })).code).toBe(1);
  });

  it('a comment block directly above the test attaches, however many lines it has, and a decorator may sit between', () => {
    const block = project({ 'tests/h.test.js': "// ANTI_FAKE_EXEMPT: the hook only has to not throw\n// (see the tracking issue for the real assertion)\n// more words\nit('hook runs', () => { runHook(); });\n" });
    expect(run(ANTI, [], block).code).toBe(0);
    const py = project({ 'tests/test_h.py': "# ANTI_FAKE_EXEMPT: constructor must not raise\n@pytest.mark.slow\ndef test_builds():\n    build()\n" });
    expect(run(ANTI, [], py).code).toBe(0);
  });

  it('two tests that start on one line: the marker is ambiguous and exempts neither', () => {
    const dir = project({ 'tests/h.test.js': "it('a', () => { runHook(); }); it('b', () => { runHook(); }); // ANTI_FAKE_EXEMPT: smoke tests of the hook\n" });
    const j = json(dir);
    expect(j.exempted).toEqual([]);
    expect(j.findings.map((f) => f.name)).toEqual(['a', 'b']);
    const above = project({ 'tests/h.test.js': "// ANTI_FAKE_EXEMPT: smoke tests of the hook\nit('a', () => { runHook(); }); it('b', () => { runHook(); });\n" });
    expect(json(above).exempted).toEqual([]);
  });

  it('it works for a tautology as well, and an exemption does not hide the other fakes in the same file', () => {
    const taut = project({ 'tests/t.test.js': "// ANTI_FAKE_EXEMPT: placeholder kept while the feature is designed, see the tracking issue\nit('later', () => { expect(true).toBe(true); });\n" });
    const j = json(taut);
    expect(j.exempted).toHaveLength(1);
    expect(j.exempted[0].rule).toBe('tautology');
    expect(j.findings).toEqual([]);
    const dir = project({
      'tests/h.test.js': "// ANTI_FAKE_EXEMPT: smoke only, nothing to assert\nit('smoke', () => { runHook(); });\n\nit('real', () => { expect(f()).toBe(1); });\n\nit('forgotten', () => { const a = 1; });\n"
    });
    const k = json(dir);
    expect(k.findings.map((f) => f.name)).toEqual(['forgotten']);
    expect(k.exempted.map((x) => x.name)).toEqual(['smoke']);
  });
});
