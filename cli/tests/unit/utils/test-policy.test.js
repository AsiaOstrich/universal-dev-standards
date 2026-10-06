/**
 * Unit tests for the test/code classification and the staged-change judgement
 * (XSPEC-444 R2). The product-entry evidence is tests/e2e/test-discipline-gates.test.js;
 * these pin the table itself, language by language, including the answer for a language
 * UDS has never heard of.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { classifyPath, loadPolicy, globToRegex, DEFAULT_POLICY } from '../../../src/utils/test-policy.js';
import { judgeChanges, parseNameStatusZ } from '../../../src/utils/test-change-check.js';

const kind = (p, policy = DEFAULT_POLICY) => classifyPath(p, policy).kind;

describe('classifyPath: defaults for the common ecosystems', () => {
  const tests = [
    'src/app.test.ts', 'src/app.spec.js', 'tests/helper.js', '__tests__/a.js', 'pkg/user_test.go', 'tests/test_user.py',
    'pkg/test_user.py', 'src/test/java/com/x/UserTest.java', 'app/UserTests.cs', 'spec/user_spec.rb', 'lib/user_spec.rb',
    'src/main/scala/UserSpec.scala', 'e2e/login.cy.ts', 'tests/conftest.py'
  ];
  for (const p of tests) it(`${p} is a test file`, () => expect(kind(p)).toBe('test'));

  const sources = [
    'src/app.ts', 'main.go', 'lib/user.py', 'src/main/java/com/x/User.java', 'app/User.cs', 'lib/user.rb', 'src/lib.rs',
    'app/Models/User.php', 'Sources/App/main.swift', 'lib/main.dart', 'src/main.c', 'scripts/deploy.sh', 'src/Component.vue'
  ];
  for (const p of sources) it(`${p} is a code file`, () => expect(kind(p)).toBe('source'));

  const noncode = ['README.md', 'docs/guide.md', 'package.json', 'config/app.yaml', 'logo.png', 'LICENSE', 'Dockerfile', '.gitignore', '.eslintrc.js', 'styles/app.css', 'db/schema.sql'];
  for (const p of noncode) it(`${p} is not code`, () => expect(['noncode', 'ignored']).toContain(kind(p)));

  it('node_modules, dist and .github are ignored whatever is inside', () => {
    expect(kind('node_modules/x/index.js')).toBe('ignored');
    expect(kind('dist/app.js')).toBe('ignored');
    expect(kind('.github/workflows/ci.yml')).toBe('ignored');
    expect(kind('src/vendor/x.js')).toBe('ignored');
    expect(kind('web/app.min.js')).toBe('ignored');
  });

  it('a README inside a tests directory is documentation, a JSON fixture there is test data', () => {
    expect(kind('tests/README.md')).toBe('noncode');
    expect(kind('tests/fixtures/data.json')).toBe('test');
  });
});

describe('classifyPath: a language UDS does not know is unclassified — never assumed fine, never assumed code', () => {
  for (const p of ['lib/engine.zig', 'src/main.nim', 'app/Main.hs.orig', 'prog.f90', 'x.weird']) {
    it(`${p}`, () => expect(kind(p)).toBe('unclassified'));
  }
  it('extending the policy changes the answer (the "say what it is" path)', () => {
    const { policy } = loadPolicyFrom({ sourceExtensions: ['.zig'], nonCodeExtensions: ['weird'], testPatterns: ['*.itest.*'] });
    expect(kind('lib/engine.zig', policy)).toBe('source');
    expect(kind('x.weird', policy)).toBe('noncode');
    expect(kind('lib/a.itest.zig', policy)).toBe('test');
  });
});

describe('globToRegex', () => {
  it('* stays inside a segment, ** crosses them', () => {
    expect(globToRegex('src/*.js').test('src/a.js')).toBe(true);
    expect(globToRegex('src/*.js').test('src/x/a.js')).toBe(false);
    expect(globToRegex('src/**').test('src/x/y/a.js')).toBe(true);
    expect(globToRegex('**/*.min.js').test('a.min.js')).toBe(true);
    expect(globToRegex('**/*.min.js').test('x/y/a.min.js')).toBe(true);
    expect(globToRegex('a.b').test('aXb')).toBe(false);
  });
});

function loadPolicyFrom(json, raw) {
  const dir = mkdtempSync(join(tmpdir(), 'uds-policy-'));
  dirs.push(dir);
  mkdirSync(join(dir, '.standards'));
  writeFileSync(join(dir, '.standards', 'test-policy.json'), raw ?? JSON.stringify(json));
  return loadPolicy(dir);
}
const dirs = [];
afterEach(() => { for (const d of dirs.splice(0)) rmSync(d, { recursive: true, force: true }); });

describe('loadPolicy', () => {
  beforeEach(() => { dirs.length = 0; });

  it('no file: defaults, mode warn, no problems', () => {
    const dir = mkdtempSync(join(tmpdir(), 'uds-policy-'));
    dirs.push(dir);
    const r = loadPolicy(dir);
    expect(r.policy.mode).toBe('warn');
    expect(r.problems).toEqual([]);
    expect(r.source).toBeNull();
  });

  it('lists ADD to the defaults, they do not replace them', () => {
    const { policy } = loadPolicyFrom({ testDirs: ['integration'] });
    expect(policy.testDirs).toContain('integration');
    expect(policy.testDirs).toContain('tests');
  });

  it('mode block is read; an invalid mode is reported and warn stays in effect', () => {
    expect(loadPolicyFrom({ mode: 'block' }).policy.mode).toBe('block');
    const bad = loadPolicyFrom({ mode: 'strict' });
    expect(bad.policy.mode).toBe('warn');
    expect(bad.problems.join('\n')).toContain('"mode" must be "warn" or "block"');
  });

  it('an unreadable file is reported and the defaults are in effect', () => {
    const r = loadPolicyFrom(null, '{ nope');
    expect(r.policy.mode).toBe('warn');
    expect(r.problems[0]).toContain('cannot be read');
  });

  it('an exempt entry without a reason is not honored and is reported', () => {
    const r = loadPolicyFrom({ exempt: [{ pattern: 'src/a/**' }, { pattern: 'src/b/**', reason: ' ' }, { pattern: 'src/c/**', reason: 'generated' }] });
    expect(r.policy.exempt).toEqual([{ pattern: 'src/c/**', reason: 'generated' }]);
    expect(r.problems.filter((p) => p.includes('NOT honored')).length).toBe(2);
  });

  it('a list of the wrong type is reported and ignored', () => {
    const r = loadPolicyFrom({ testDirs: 'tests' });
    expect(r.problems.join('\n')).toContain('"testDirs" must be an array');
    expect(r.policy.testDirs).toEqual([...DEFAULT_POLICY.testDirs]);
  });
});

describe('parseNameStatusZ', () => {
  it('reads add, modify, delete, rename and copy records', () => {
    const out = ['A', 'a.js', 'M', 'b.js', 'D', 'c.js', 'R100', 'old.js', 'new.js', 'C75', 'x.js', 'y.js', ''].join('\0');
    expect(parseNameStatusZ(out)).toEqual([
      { status: 'A', path: 'a.js' }, { status: 'M', path: 'b.js' }, { status: 'D', path: 'c.js' },
      { status: 'R', oldPath: 'old.js', path: 'new.js', similarity: 100 },
      { status: 'C', oldPath: 'x.js', path: 'y.js', similarity: 75 }
    ]);
  });
  it('handles paths with spaces and non-ASCII characters', () => {
    expect(parseNameStatusZ(['A', 'src/我的 檔.js', ''].join('\0'))).toEqual([{ status: 'A', path: 'src/我的 檔.js' }]);
  });
});

describe('judgeChanges', () => {
  const j = (changes, policy = DEFAULT_POLICY) => judgeChanges(changes, policy);
  const A = (path) => ({ status: 'A', path });

  it('code without a test → warn, listing every code file', () => {
    const r = j([A('src/a.js'), A('src/b.py'), A('README.md')]);
    expect(r.verdict).toBe('warn');
    expect(r.source).toEqual(['src/a.js', 'src/b.py']);
  });
  it('code with a test → ok', () => {
    expect(j([A('src/a.js'), A('tests/a.test.js')]).verdict).toBe('ok');
  });
  it('a test file alone, docs alone, nothing → no warning', () => {
    expect(j([A('tests/a.test.js')]).verdict).toBe('ok');
    expect(j([A('README.md')]).verdict).toBe('ok');
    expect(j([]).verdict).toBe('none');
  });
  it('a deleted code file does not need a test', () => {
    expect(j([{ status: 'D', path: 'src/a.js' }]).verdict).toBe('ok');
  });
  it('a pure rename is exempt with a reason; a rename with edits is a code change', () => {
    const pure = j([{ status: 'R', oldPath: 'src/a.js', path: 'src/b.js', similarity: 100 }]);
    expect(pure.verdict).toBe('ok');
    expect(pure.exempt[0].reason).toContain('pure rename of src/a.js');
    expect(j([{ status: 'R', oldPath: 'src/a.js', path: 'src/b.js', similarity: 90 }]).verdict).toBe('warn');
  });
  it('an unknown file type is listed under unclassified and is not counted as code', () => {
    const r = j([A('lib/x.zig')]);
    expect(r.unclassified).toEqual(['lib/x.zig']);
    expect(r.source).toEqual([]);
    expect(r.verdict).toBe('ok');
  });
  it('a policy exemption with a reason removes the file from the list and records why', () => {
    const { policy } = loadPolicyFrom({ exempt: [{ pattern: 'src/gen/**', reason: 'generated' }] });
    const r = j([A('src/gen/a.js')], policy);
    expect(r.verdict).toBe('ok');
    expect(r.exempt[0].reason).toContain('generated');
  });
});
