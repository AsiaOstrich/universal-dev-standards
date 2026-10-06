/**
 * The two scanners UDS ships into adopters' projects (XSPEC-444 R5), tested as the adopter runs
 * them: as scripts (exit code, what they print) and through the text analyzers they export. Every
 * language family has a fake that must be found and a real test/function that must not be — and
 * the "must not" arms matter as much: a scanner that cries wolf is switched off, and one that stays
 * silent is a green light over nothing. (The product-entry evidence — `uds init` then a real commit —
 * is tests/e2e/test-discipline-gates.test.js.)
 */
import { describe, it, expect, afterEach } from 'vitest';
import { spawnSync } from 'child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, copyFileSync } from 'fs';
import { tmpdir } from 'os';
import { join, resolve, dirname } from 'path';
import { analyzeTestText, selfTest as antiSelfTest, scan as antiScan } from '../../../../templates/gates/check-anti-fake-tests.mjs';
import { analyzeStubText, selfTest as stubSelfTest } from '../../../../templates/gates/check-stubs.mjs';

const REPO = resolve(import.meta.dirname, '../../../..');
const ANTI = join(REPO, 'templates/gates/check-anti-fake-tests.mjs');
const STUBS = join(REPO, 'templates/gates/check-stubs.mjs');

const rules = (text, ext) => analyzeTestText(text, ext).findings.map((f) => f.rule);
const names = (text, ext) => analyzeTestText(text, ext).findings.map((f) => f.name);

describe('check-anti-fake-tests: every language family finds its fake and spares its real test', () => {
  const cases = [
    // ext, fake source, expected rule(s), a real test that must stay clean
    ['js', "it('x', () => { const a = 1; });", ['no-assertion'], "it('x', () => { expect(f()).toBe(1); });"],
    ['ts', "test('x', async () => { await run(); });", ['no-assertion'], "test('x', async () => { await expect(run()).resolves.toBe(1); });"],
    ['js', "it('x', () => { expect(true).toBe(true); });", ['tautology'], "it('x', () => { expect(true).toBe(isReady()); });"],
    ['js', "it('x', () => { expect(1).toBe(1); expect('a').toEqual('a'); });", ['tautology'], "it('x', () => { expect(1).toBe(1); expect(f()).toBe(2); });"],
    ['py', 'def test_x():\n    x = 1\n', ['no-assertion'], 'def test_x():\n    assert f() == 1\n'],
    ['py', 'def test_x():\n    assert 200 == 200\n', ['tautology'], 'def test_x():\n    assert status() == 200\n'],
    ['py', 'class T(unittest.TestCase):\n    def test_x(self):\n        self.assertTrue(True)\n', ['tautology'], 'class T(unittest.TestCase):\n    def test_x(self):\n        self.assertEqual(f(), 1)\n'],
    ['java', 'class T {\n  @Test\n  void x() {\n    int a = 1;\n  }\n}\n', ['no-assertion'], 'class T {\n  @Test\n  void x() {\n    assertEquals(1, f());\n  }\n}\n'],
    ['kt', 'class T {\n  @Test\n  fun `does nothing`() {\n    val a = 1\n  }\n}\n', ['no-assertion'], 'class T {\n  @Test\n  fun `adds`() {\n    assertEquals(1, f())\n  }\n}\n'],
    ['cs', 'class T {\n  [Fact]\n  public void X() {\n    var a = 1;\n  }\n}\n', ['no-assertion'], 'class T {\n  [Fact]\n  public void X() {\n    Assert.Equal(1, F());\n  }\n}\n'],
    ['go', 'func TestX(t *testing.T) {\n\tx := 1\n\t_ = x\n}\n', ['no-assertion'], 'func TestX(t *testing.T) {\n\tif f() != 1 {\n\t\tt.Fatal("bad")\n\t}\n}\n'],
    ['rs', '#[test]\nfn x() {\n    let a = 1;\n}\n', ['no-assertion'], '#[test]\nfn x() {\n    assert_eq!(f(), 1);\n}\n'],
    ['rs', '#[test]\nfn x() {\n    assert!(true);\n}\n', ['tautology'], '#[test]\nfn x() {\n    assert!(f());\n}\n'],
    ['rb', "describe 'x' do\n  it 'does nothing' do\n    a = 1\n  end\nend\n", ['no-assertion'], "describe 'x' do\n  it 'adds' do\n    expect(f).to eq(1)\n  end\nend\n"],
    ['ex', 'defmodule T do\n  test "nothing" do\n    a = 1\n  end\nend\n', ['no-assertion'], 'defmodule T do\n  test "adds" do\n    assert f() == 1\n  end\nend\n'],
    ['php', "<?php\nclass T {\n  public function testX() {\n    $a = 1;\n  }\n}\n", ['no-assertion'], "<?php\nclass T {\n  public function testX() {\n    $this->assertSame(1, f());\n  }\n}\n"],
    ['swift', 'class T: XCTestCase {\n  func testX() {\n    let a = 1\n  }\n}\n', ['no-assertion'], 'class T: XCTestCase {\n  func testX() {\n    XCTAssertEqual(f(), 1)\n  }\n}\n'],
    ['dart', "void main() {\n  test('x', () {\n    var a = 1;\n  });\n}\n", ['no-assertion'], "void main() {\n  test('x', () {\n    expect(f(), 1);\n  });\n}\n"],
    ['lua', "describe('x', function()\n  it('nothing', function()\n    local a = 1\n  end)\nend)\n", ['no-assertion'], "describe('x', function()\n  it('adds', function()\n    assert.are.equal(1, f())\n  end)\nend)\n"],
    ['cpp', 'TEST(S, X) {\n  int a = 1;\n}\n', ['no-assertion'], 'TEST(S, X) {\n  EXPECT_EQ(1, F());\n}\n']
  ];
  for (const [ext, fake, want, real] of cases) {
    it(`.${ext}: finds ${want.join('+')} in "${fake.split('\n')[0].slice(0, 40)}" and stays silent on a real test`, () => {
      expect(rules(fake, ext)).toEqual(want);
      expect(rules(real, ext), 'the real test must not be flagged').toEqual([]);
    });
  }
});

describe('check-anti-fake-tests: skipped and todo tests', () => {
  it('a file whose every test is skipped or todo is reported as all-skipped', () => {
    expect(rules("it.skip('a', () => { expect(1).toBe(2); });\nxit('b', () => {});\nit.todo('c');", 'js')).toEqual(['all-skipped']);
    expect(rules('@pytest.mark.skip\ndef test_a():\n    assert f()\n\n\ndef test_b():\n    pytest.skip("later")\n', 'py')).toEqual(['all-skipped']);
    expect(rules('class T {\n  @Disabled\n  @Test\n  void x() { assertTrue(f()); }\n}\n', 'java')).toEqual(['all-skipped']);
  });
  it('one live test in the file means the file is not all-skipped, and a skipped test is not reported as having no assertion', () => {
    expect(rules("it.skip('a', () => {});\nit('b', () => { expect(f()).toBe(1); });", 'js')).toEqual([]);
  });
});

describe('check-anti-fake-tests: things that look like assertions but are not', () => {
  it('an assertion in a comment or a string does not count', () => {
    expect(rules("it('x', () => {\n  // expect(a).toBe(b);\n  const s = 'expect(a).toBe(b)';\n});", 'js')).toEqual(['no-assertion']);
    expect(rules('def test_x():\n    # assert f() == 1\n    s = "assert f() == 1"\n', 'py')).toEqual(['no-assertion']);
  });
  it('a variable called `expected` is not an assertion', () => {
    expect(rules("it('x', () => { const expected = 1; run(expected); });", 'js')).toEqual(['no-assertion']);
  });
  it('a regex literal that holds a backtick or a quote does not swallow the rest of the file', () => {
    const text = "it('a', () => {\n  const m = s.match(/[`'\"]+/g);\n  expect(m).toEqual([]);\n});\nit('b', () => { const a = 1; });\n";
    expect(names(text, 'js')).toEqual(['b']); // a is real, b is fake — if the regex ate the file, b would be missed or a flagged
  });
  it('a Python test whose body holds a column-0 triple-quoted string still sees its assertion', () => {
    const text = 'def test_x(client):\n    body = b"""a,b\n1,2\n"""\n    assert client.post(body).status_code == 200\n';
    expect(rules(text, 'py')).toEqual([]);
  });
  it('a test that only delegates to a helper named assert*/verify* counts as asserting', () => {
    expect(rules("it('x', () => { assertShape(f()); });", 'js')).toEqual([]);
    expect(rules('def test_x():\n    check_invariants(f())\n', 'py')).toEqual([]);
  });
  it('extra assertion patterns from the project policy count (checked through the scanner)', () => {
    const dir = mkdtempSync(join(tmpdir(), 'uds-scan-'));
    dirs.push(dir);
    mkdirSync(join(dir, 'tests'));
    mkdirSync(join(dir, '.standards'));
    writeFileSync(join(dir, 'tests/a.test.js'), "it('x', () => { mustMatch(f(), 1); });\n");
    expect(antiScan(dir).findings.map((f) => f.rule)).toEqual(['no-assertion']);
    writeFileSync(join(dir, '.standards/test-policy.json'), JSON.stringify({ assertionPatterns: ['\\bmustMatch\\w*\\s*\\('] }));
    expect(antiScan(dir).findings).toEqual([]);
  });
});

describe('check-stubs: markers, silent placeholders and empty functions', () => {
  const rulesOf = (text, ext) => analyzeStubText(text, ext).findings.map((f) => f.rule);
  it('a STUB marker is reported once, as its marker, and the function under it is not reported again', () => {
    expect(rulesOf('// WARNING: STUB — Remove before UAT\nasync function validatePayment(card) {}\n', 'js')).toEqual(['stub-marker']);
  });
  it('an empty function with no marker is reported; with COVERAGE_EXEMPT beside it, it is not', () => {
    expect(rulesOf('function save(order) {}\n', 'js')).toEqual(['empty-function']);
    expect(rulesOf('// COVERAGE_EXEMPT: hook point, nothing to do here\nfunction onTick() {}\n', 'js')).toEqual([]);
    expect(rulesOf('function noop() {}\n', 'js')).toEqual([]);
  });
  const cases = [
    ['py', 'def save(o):\n    pass\n', ['empty-function'], 'def save(o):\n    return o\n'],
    ['py', 'def charge(c):\n    raise NotImplementedError\n', ['not-implemented'], 'def charge(c):\n    return c\n'],
    ['go', 'func Save(o Order) error {}\n', ['empty-function'], 'func Save(o Order) error {\n\treturn nil\n}\n'],
    ['rs', 'fn save() {}\n', ['empty-function'], 'fn save() -> i32 {\n    1\n}\n'],
    ['rs', 'fn charge() {\n    todo!()\n}\n', ['not-implemented'], 'fn charge() {\n    run()\n}\n'],
    ['rb', 'def save(o)\nend\n', ['empty-function'], 'def save(o)\n  o\nend\n'],
    ['php', '<?php\nfunction save($o) {}\n', ['empty-function'], '<?php\nfunction save($o) { return $o; }\n'],
    ['ts', 'const save = async (o: Order): Promise<void> => {};\n', ['empty-function'], 'const save = async (o: Order) => { await db(o); };\n'],
    ['kt', 'fun charge() {\n    TODO()\n}\n', ['not-implemented'], 'fun charge() {\n    run()\n}\n'],
    ['js', "function f() {\n  throw new Error('not implemented');\n}\n", ['not-implemented'], "function f() {\n  throw new Error('bad input');\n}\n"]
  ];
  for (const [ext, fake, want, real] of cases) {
    it(`.${ext}: finds ${want.join('+')} and spares the real code`, () => {
      expect(rulesOf(fake, ext)).toEqual(want);
      expect(rulesOf(real, ext)).toEqual([]);
    });
  }
  it('an abstract method and a dunder method are not empty shells', () => {
    expect(rulesOf('class A:\n    @abstractmethod\n    def run(self):\n        raise NotImplementedError\n\n    def __init__(self):\n        pass\n', 'py')).toEqual([]);
  });
  it('in a language with no empty-function rule, markers and not-implemented bodies are still found and the analyzer says it had no rule', () => {
    const a = analyzeStubText('fn charge() void {\n    unimplemented!()\n}\nfn empty() void {}\n', 'zig');
    expect(a.findings.map((f) => f.rule)).toEqual(['not-implemented']);
    expect(a.emptyRule).toBe(false);
  });
});

const dirs = [];
afterEach(() => { for (const d of dirs.splice(0)) rmSync(d, { recursive: true, force: true }); });

function project(files) {
  const dir = mkdtempSync(join(tmpdir(), 'uds-scan-'));
  dirs.push(dir);
  for (const [rel, text] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, rel)), { recursive: true });
    writeFileSync(join(dir, rel), text);
  }
  return dir;
}
const node = (script, args, cwd) => {
  const r = spawnSync(process.execPath, [script, ...args], { cwd, encoding: 'utf8' });
  return { code: r.status, out: r.stdout || '', err: r.stderr || '' };
};

describe('both scripts, run as scripts', () => {
  it('exit 1 with the findings listed when something is found, exit 0 when nothing is, and --json carries the same verdict', () => {
    const bad = project({ 'tests/a.test.js': "it('x', () => { const a = 1; });\n", 'src/a.js': 'function save() {}\n' });
    const a = node(ANTI, [], bad);
    expect(a.code).toBe(1);
    expect(a.out).toContain('tests/a.test.js:1  no-assertion  "x"');
    expect(JSON.parse(node(ANTI, ['--json'], bad).out).findings).toHaveLength(1);
    const s = node(STUBS, [], bad);
    expect(s.code).toBe(1);
    expect(s.out).toContain('src/a.js:1  empty-function  save');

    const good = project({ 'tests/a.test.js': "it('x', () => { expect(f()).toBe(1); });\n", 'src/a.js': 'export function f() { return 1; }\n' });
    expect(node(ANTI, [], good).code).toBe(0);
    expect(node(STUBS, [], good).code).toBe(0);
  });

  it('a test file in a language without rules is listed as NOT scanned, and a project with no test files says nothing was measured', () => {
    const dir = project({ 'tests/thing_test.zig': 'test "x" {}\n' });
    const r = node(ANTI, [], dir);
    expect(r.out).toContain('NOT scanned');
    expect(r.out).toContain('tests/thing_test.zig');
    const none = project({ 'src/a.js': 'export const a = 1;\n' });
    expect(node(ANTI, [], none).out).toContain('nothing was measured');
  });

  it('--staged scans only what is staged', () => {
    const dir = project({ 'tests/old.test.js': "it('old', () => { const a = 1; });\n" });
    const env = { ...process.env };
    for (const k of Object.keys(env)) if (k.startsWith('GIT_')) delete env[k];
    const git = (args) => spawnSync('git', args, { cwd: dir, encoding: 'utf8', env: { ...env, GIT_CONFIG_GLOBAL: '/dev/null' } });
    git(['init', '-q']);
    writeFileSync(join(dir, 'tests/new.test.js'), "it('new', () => { const b = 1; });\n");
    git(['add', 'tests/new.test.js']);
    const r = spawnSync(process.execPath, [ANTI, '--staged'], { cwd: dir, encoding: 'utf8', env });
    expect(r.status).toBe(1);
    expect(r.stdout).toContain('tests/new.test.js:1');
    expect(r.stdout).not.toContain('tests/old.test.js');
  });

  it('exit 2 — never a pass — when the scanner fails its own self-test; the control arm is a scanner made blind on purpose', () => {
    expect(antiSelfTest()).toEqual([]);
    expect(stubSelfTest()).toEqual([]);
    const dir = project({ 'tests/a.test.js': "it('x', () => { const a = 1; });\n" });
    // A copy of the real script in which the detection can never fire.
    const blind = join(dir, 'blind.mjs');
    const src = readFileSync(ANTI, 'utf8');
    expect(src).toContain('if (real > 0) continue;');
    writeFileSync(blind, src.replace('if (real > 0) continue;', 'continue;'));
    const r = node(blind, [], dir);
    expect(r.code).toBe(2);
    expect(r.err).toContain('failed its own self-test');
    // …and the stub scanner likewise
    const blindStubs = join(dir, 'blind-stubs.mjs');
    const stubsSrc = readFileSync(STUBS, 'utf8');
    expect(stubsSrc).toContain("if (IGNORED_NAMES.test(m[1]) || declaredNear(lines, line)) continue;");
    writeFileSync(blindStubs, stubsSrc.replace("if (IGNORED_NAMES.test(m[1]) || declaredNear(lines, line)) continue;", 'continue;'));
    expect(node(blindStubs, [], dir).code).toBe(2);
  });

  it('the stub scanner does not report its own text, and the anti-fake scanner is clean to the stub scanner', () => {
    const dir = project({});
    mkdirSync(join(dir, 'scripts'));
    copyFileSync(STUBS, join(dir, 'scripts/check-stubs.mjs'));
    copyFileSync(ANTI, join(dir, 'scripts/check-anti-fake-tests.mjs'));
    const r = node(join(dir, 'scripts/check-stubs.mjs'), [], dir);
    expect(r.out).toContain('RESULT: no stubs found');
    expect(r.code).toBe(0);
  });

  it('files under conftest.py and fixtures directories are not treated as tests', () => {
    const dir = project({
      'tests/conftest.py': 'def test_data_dir():\n    return 1\n',
      'tests/fixtures/sample.test.js': "it('x', () => { const a = 1; });\n"
    });
    expect(node(ANTI, [], dir).code).toBe(0);
  });
});
