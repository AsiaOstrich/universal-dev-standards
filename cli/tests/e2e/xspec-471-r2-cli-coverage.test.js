/**
 * E2E: every command, subcommand and option of the uds CLI has an acceptance step, an exemption with a reason, or a place in
 * the shrinking baseline (dev-platform XSPEC-471 R2).
 *
 * `node scripts/beta-acceptance/check-cli-coverage.mjs` is the entry (CI runs it in the job "Beta Acceptance Coverage"). Every test
 * starts it as CI does, in a real child process, and reads what it prints and its exit code.
 *
 * - The real repository: the program lists the commands and options of the real `cli/bin/uds.js`, and that list is compared with two
 *   other readings (the `Commands:` block of `uds --help`, and the text of `bin/uds.js`), one of which shows why the list is read
 *   from the running program: `mcp` and `mcp serve` are registered by another module and the source text of the binary does not name them.
 * - A fake CLI (tests/utils/xspec-471.js, built with the real commander; a hidden command, a hidden option, an alias, a short flag and a
 *   subcommand with its own option) is the input for the red and green samples, so they do not move when the real CLI gets a command.
 *   The program reads it through the same dump step it uses on the real CLI (`--cli <dir>`).
 * - Weakening the check turns the property red: copies of the program with one decision made wrong (subcommands ignored, options ignored,
 *   hidden items dropped, an alias not read, a short flag not read, a `run` step's arguments not read, an empty reason accepted, a new gap
 *   allowed, a stale baseline entry allowed) must each fail a sample the real program passes.
 *
 * Wire that makes these red when cut (one line of source):
 *   scripts/beta-acceptance/check-cli-coverage.mjs   const verdict = judgeSurface({ tree, doc, baseline });
 */

import { it, expect, afterAll } from 'vitest';
import { spawnSync } from 'child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { ACCEPT_DIR, REPO, copyProgram, scratch, weaken } from '../utils/xspec-469.js';
import { FAKE_ITEMS, makeFakeCli, stepRunning } from '../utils/xspec-471.js';

const tmp = scratch('uds-xspec471-r2-');
afterAll(() => tmp.cleanup());

const CHECK = join(ACCEPT_DIR, 'check-cli-coverage.mjs');
// GIT_* variables leak in when the tests run inside a git hook; the program runs `git show` in the baseline test, so start it without them
const cleanEnv = () => Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith('GIT_')));
const run = (args, script = CHECK, cwd = REPO) => {
  const r = spawnSync(process.execPath, [script, ...args], { encoding: 'utf-8', timeout: 120000, cwd, env: cleanEnv() });
  return { code: r.status, stdout: r.stdout, stderr: r.stderr, out: `${r.stdout}${r.stderr}` };
};

const writeJson = (name, value) => {
  const file = tmp.next(name);
  writeFileSync(file, JSON.stringify(value, null, 2));
  return file;
};

// the real binary is started by two tests below; it gets a throwaway home so that loading it can never touch the real one
const HOME_ENV = { HOME: tmp.dir, USERPROFILE: tmp.dir, XDG_CONFIG_HOME: tmp.dir, APPDATA: tmp.dir };
const FAKE_CLI = makeFakeCli(tmp.next('fake-cli'));
const EMPTY_BASELINE = { schema: 1, commands: [], options: [] };

/** Steps that use every item of the fake CLI, written by hand. `--help` on a command uses the command and nothing else. */
const ALL_STEPS = [
  stepRunning('v', ['--version']),
  stepRunning('ui', ['--ui-lang', 'zh-tw', 'foo', '--bar', '--baz', 'x']),
  stepRunning('ls', ['ls', '--all']),
  stepRunning('secret', ['secret', '--quiet']),
  stepRunning('sub', ['grp', 'sub', '--deep', '--hid']),
];
const doc = (steps, exemptions) => ({ schema: 1, ...(exemptions ? { exemptions } : {}), steps });
/** Run the check against the fake CLI with the given steps, exemptions and baseline. */
const check = ({ steps = ALL_STEPS, exemptions, baseline = EMPTY_BASELINE, extra = [] } = {}, script = CHECK) => run(
  ['--cli', FAKE_CLI, '--steps', writeJson('steps.json', doc(steps, exemptions)), '--baseline', writeJson('baseline.json', baseline), ...extra],
  script,
);
const without = (...ids) => ALL_STEPS.filter((s) => !ids.includes(s.id));

it('the real CLI is listed whole: its top-level commands are the ones `uds --help` prints, its options are the ones the binary declares, and the commands another module registers (mcp, mcp serve) are in it (XSPEC-471 R2)', () => {
  // reading 1: the Commands block of the real `uds --help`
  const help = spawnSync(process.execPath, [join(REPO, 'cli', 'bin', 'uds.js'), '--help'], { encoding: 'utf-8', timeout: 60000, env: { ...cleanEnv(), ...HOME_ENV } });
  expect(help.status, help.stderr).toBe(0);
  const block = help.stdout.split(/^Commands:\s*$/m)[1];
  expect(block, 'control: --help has a Commands block').toBeTruthy();
  const helpNames = block.split('\n').map((l) => /^ {2}([a-z][a-z-]*)\b/.exec(l)).filter(Boolean).map((m) => m[1]).filter((n) => n !== 'help');
  expect(helpNames.length, 'control: that reading found the commands').toBeGreaterThan(10);

  // the program's own list
  const tree = spawnSync(process.execPath, [join(ACCEPT_DIR, 'dump-cli-tree.mjs'), join(REPO, 'cli')], { encoding: 'utf-8', timeout: 120000, maxBuffer: 64 * 1024 * 1024, env: { ...cleanEnv(), ...HOME_ENV } });
  expect(tree.status, tree.stderr).toBe(0);
  const root = JSON.parse(tree.stdout);
  expect(root.commands.map((c) => c.name), 'the top-level commands, in the order `--help` prints them').toEqual(helpNames);

  // reading 2: the text of the binary. Every command it names and every option it declares is in the list...
  const source = readFileSync(join(REPO, 'cli', 'bin', 'uds.js'), 'utf-8');
  const namedInSource = [...source.matchAll(/\.command\(['"]([a-z][a-z-]*)/g)].map((m) => m[1]);
  const names = [];
  const walk = (c) => c.commands.forEach((s) => { names.push(s.name); walk(s); });
  walk(root);
  expect(namedInSource.length, 'control: the text reading found commands').toBeGreaterThan(20);
  for (const n of namedInSource) expect(names, `the binary names ${n}`).toContain(n);
  // ...and the list holds what the text does not show: mcpCommand(program) registers `mcp` and `mcp serve` from another module
  expect(namedInSource).not.toContain('mcp');
  expect(root.commands.find((c) => c.name === 'mcp').commands.map((c) => c.name)).toContain('serve');

  const declared = (source.match(/\.option\(/g) || []).length;
  let listed = 0;
  const count = (c) => { listed += c.options.length; c.commands.forEach(count); };
  count(root);
  // every declared option, plus --version (added by .version(), not by .option()), plus the options the mcp module declares
  const mcpOptions = root.commands.find((c) => c.name === 'mcp').commands.reduce((n, c) => n + c.options.length, 0) + root.commands.find((c) => c.name === 'mcp').options.length;
  expect(listed).toBe(declared + 1 + mcpOptions);
});

it('the real repository passes: the numbers it prints add up, and the baseline holds exactly the gaps (XSPEC-471 R2)', () => {
  const r = run([]);
  expect(r.code, r.out).toBe(0);
  const baseline = JSON.parse(readFileSync(join(ACCEPT_DIR, 'coverage-baseline.json'), 'utf-8'));
  const gaps = baseline.commands.length + baseline.options.length;
  expect(r.stdout).toContain(`known gaps (in the baseline, not red): ${gaps}; NEW gaps: 0; stale baseline entries: 0`);
  expect(r.stdout).toMatch(/commands: \d+ of \d+ used by a step; exempt \d+; gaps \d+/);
  expect(r.stdout).toMatch(/top-level commands: \d+ of \d+ used by a step/);
  expect(r.stdout).toMatch(/subcommands: \d+ of \d+ used by a step/);
  expect(r.stdout).toMatch(/options: \d+ of \d+ used by a step; exempt \d+; gaps \d+/);
  // used + exempt + gaps = total, for commands and for options
  for (const kind of ['commands', 'options']) {
    const m = new RegExp(`CLI surface — ${kind}: (\\d+) of (\\d+) used by a step; exempt (\\d+); gaps (\\d+)`).exec(r.stdout);
    expect(m, kind).not.toBeNull();
    expect(Number(m[1]) + Number(m[3]) + Number(m[4]), kind).toBe(Number(m[2]));
  }
});

it('an option no step uses turns the check red and names it; a step that uses it turns it green (XSPEC-471 R2)', () => {
  const red = check({ steps: without('ui') }); // the step that used `foo --bar`, `foo --baz` and `--ui-lang`
  expect(red.code, red.out).toBe(1);
  for (const id of ['foo --bar', 'foo --baz', 'uds --ui-lang', 'foo']) expect(red.stdout, id).toContain(`FAIL no acceptance step uses ${id === 'foo' ? 'command' : 'option'} "${id}"`);
  // only what that step used is named
  expect(red.stdout.match(/FAIL no acceptance step uses/g)).toHaveLength(4);

  const green = check();
  expect(green.code, green.out).toBe(0);
  expect(green.stdout).toContain('NEW gaps: 0');
  expect(green.stdout).toContain('options: 8 of 8 used by a step; exempt 0; gaps 0');
  expect(green.stdout).toContain('commands: 5 of 5 used by a step; exempt 0; gaps 0');
});

it('a command and a subcommand are listed apart: a group is used when a step runs one of its subcommands, a subcommand needs its own step (XSPEC-471 R2)', () => {
  const r = check({ steps: ALL_STEPS.map((s) => (s.id === 'sub' ? stepRunning('sub', ['grp', '--help']) : s)) });
  expect(r.code, r.out).toBe(1);
  expect(r.stdout).toContain('FAIL no acceptance step uses command "grp sub"');
  expect(r.stdout).not.toContain('FAIL no acceptance step uses command "grp"');
  // the options of the subcommand are named too, with the subcommand in front
  expect(r.stdout).toContain('FAIL no acceptance step uses option "grp sub --deep"');
  expect(r.stdout).toContain('top-level commands: 4 of 4 used by a step');
  expect(r.stdout).toContain('subcommands: 0 of 1 used by a step');
});

it('a hidden command, a hidden option, an alias and a short flag are read: help does not print the first two, and the last two are other names for an item (XSPEC-471 R2)', () => {
  // the fake CLI's own help leaves the hidden command out, so a reader of help text could not list it
  const help = spawnSync(process.execPath, [join(FAKE_CLI, 'bin', 'uds.js'), '--help'], { encoding: 'utf-8' });
  expect(help.stdout, 'control: help does not show the hidden command').not.toContain('secret');

  const red = check({ steps: without('secret', 'sub') });
  expect(red.code, red.out).toBe(1);
  expect(red.stdout).toContain('FAIL no acceptance step uses command "secret"');
  expect(red.stdout).toContain('FAIL no acceptance step uses option "secret --quiet"');
  expect(red.stdout).toContain('FAIL no acceptance step uses option "grp sub --hid"');

  // `ls` (alias of list) uses `list`; `-b` (short of --baz) uses `foo --baz`; `--baz=x` also does
  const byOtherNames = ALL_STEPS.map((s) => (s.id === 'ui' ? stepRunning('ui', ['--ui-lang=zh-tw', 'foo', '--bar', '-b', 'x']) : s));
  const green = check({ steps: byOtherNames });
  expect(green.code, green.out).toBe(0);
  const inline = ALL_STEPS.map((s) => (s.id === 'ui' ? stepRunning('ui', ['--ui-lang', 'zh-tw', 'foo', '--bar', '--baz=x']) : s));
  expect(check({ steps: inline }).code).toBe(0);
});

it('a step that starts uds through `run` ({bin}) or the installed command (shim) uses what it names; a step that runs another program uses nothing (XSPEC-471 R2)', () => {
  const viaRun = ALL_STEPS.map((s) => (s.id === 'secret' ? { id: 'secret', title: 'via run', run: ['{node}', '--require', 'x.cjs', '{bin}', 'secret', '--quiet'], expect: { contains: ['ok'] } } : s));
  expect(check({ steps: viaRun }).code).toBe(0);
  const viaShim = ALL_STEPS.map((s) => (s.id === 'secret' ? { id: 'secret', title: 'via shim', shim: ['secret', '--quiet'], expect: { contains: ['ok'] } } : s));
  expect(check({ steps: viaShim }).code).toBe(0);
  const otherProgram = ALL_STEPS.map((s) => (s.id === 'secret' ? { id: 'secret', title: 'git', run: ['git', 'secret', '--quiet'], expect: { contains: ['ok'] } } : s));
  const r = check({ steps: otherProgram });
  expect(r.code, r.out).toBe(1);
  expect(r.stdout).toContain('FAIL no acceptance step uses command "secret"');
});

it('an item with an exemption that gives a reason is green and counted as exempt, not as used; a blank, one-word or missing reason leaves it red (XSPEC-471 R2)', () => {
  const steps = without('secret');
  const exemptBoth = [
    { command: 'secret', reason: 'It only prints its own help text and has no behaviour a step could read back.' },
    { option: 'secret --quiet', reason: 'The option has no effect while the command only prints help text.' },
  ];
  const green = check({ steps, exemptions: exemptBoth });
  expect(green.code, green.out).toBe(0);
  expect(green.stdout).toContain('commands: 4 of 5 used by a step; exempt 1; gaps 0');
  expect(green.stdout).toContain('options: 7 of 8 used by a step; exempt 1; gaps 0');

  for (const bad of [undefined, '', '   ', 'internal', 'n/a']) {
    const r = check({ steps, exemptions: [{ command: 'secret', ...(bad === undefined ? {} : { reason: bad }) }, exemptBoth[1]] });
    expect(r.code, `reason ${JSON.stringify(bad)}: ${r.out}`).toBe(1);
    // the item is named as a gap again, and the exemption is named as the problem
    expect(r.stdout, JSON.stringify(bad)).toContain('FAIL no acceptance step uses command "secret"');
    expect(r.stdout, JSON.stringify(bad)).toContain('FAIL the exemption for command "secret" needs a "reason" of at least 20 characters');
    expect(r.stdout, JSON.stringify(bad)).toContain('commands: 4 of 5 used by a step; exempt 0; gaps 1');
  }
});

it('an exemption for something the CLI does not have, or that a step already uses, is red, so exemptions cannot pile up (XSPEC-471 R2)', () => {
  const reason = 'A reason that is long enough to count, for a test about exemptions that point at nothing.';
  const gone = check({ exemptions: [{ command: 'frobnicate', reason }] });
  expect(gone.code, gone.out).toBe(1);
  expect(gone.stdout).toContain('FAIL the exemption for command "frobnicate" names something the CLI does not have');

  const needless = check({ exemptions: [{ option: 'foo --bar', reason }] });
  expect(needless.code, needless.out).toBe(1);
  expect(needless.stdout).toContain('FAIL the exemption for option "foo --bar" is not needed: a step already uses it');
});

it('the baseline: a known gap is green and counted; a gap that is not in it is red as NEW; an entry a step now uses, an exemption now covers, or that the CLI no longer has is red (XSPEC-471 R2)', () => {
  const steps = without('secret');
  const known = { schema: 1, commands: ['secret'], options: ['secret --quiet'] };
  const ok = check({ steps, baseline: known });
  expect(ok.code, ok.out).toBe(0);
  expect(ok.stdout).toContain('known gaps (in the baseline, not red): 2; NEW gaps: 0; stale baseline entries: 0');

  // a gap that is not in the baseline
  const fresh = check({ steps, baseline: { schema: 1, commands: ['secret'], options: [] } });
  expect(fresh.code, fresh.out).toBe(1);
  expect(fresh.stdout).toContain('FAIL no acceptance step uses option "secret --quiet"');
  expect(fresh.stdout).toContain('NEW gaps: 1');

  // an entry that is now covered by a step
  const covered = check({ baseline: { schema: 1, commands: ['secret'], options: [] } });
  expect(covered.code, covered.out).toBe(1);
  expect(covered.stdout).toContain('FAIL baseline entry command "secret" must be removed: a step now uses it');

  // an entry that is now exempt
  const exempt = check({ steps, baseline: known, exemptions: [{ command: 'secret', reason: 'It only prints its own help text and has no behaviour a step could read back.' }] });
  expect(exempt.code, exempt.out).toBe(1);
  expect(exempt.stdout).toContain('FAIL baseline entry command "secret" must be removed: it now has an exemption');

  // an entry for something that is gone
  const gone = check({ baseline: { schema: 1, commands: [], options: ['foo --removed-long-ago'] } });
  expect(gone.code, gone.out).toBe(1);
  expect(gone.stdout).toContain('FAIL baseline entry option "foo --removed-long-ago" must be removed: the CLI no longer has it');
});

it('--shrink-baseline removes the entries that are covered, exempt or gone and never adds one; --init-baseline refuses to overwrite (XSPEC-471 R2)', () => {
  const steps = without('secret');
  const file = writeJson('baseline.json', { schema: 1, note: 'keep this', commands: ['secret', 'grp'], options: ['secret --quiet', 'foo --bar'] });
  const stepsFile = writeJson('steps.json', doc(steps));
  const r = run(['--cli', FAKE_CLI, '--steps', stepsFile, '--baseline', file, '--shrink-baseline']);
  expect(r.code, r.out).toBe(0);
  const after = JSON.parse(readFileSync(file, 'utf-8'));
  expect(after.note).toBe('keep this');
  // `grp` and `foo --bar` are used by steps; `secret` and `secret --quiet` are still gaps and stay; nothing new (`list --all` is used) appears
  expect(after.commands).toEqual(['secret']);
  expect(after.options).toEqual(['secret --quiet']);

  // a fresh gap does not get into the file by shrinking
  const stepsWithMoreGaps = writeJson('steps2.json', doc(without('secret', 'sub')));
  run(['--cli', FAKE_CLI, '--steps', stepsWithMoreGaps, '--baseline', file, '--shrink-baseline']);
  expect(JSON.parse(readFileSync(file, 'utf-8')).commands).toEqual(['secret']);

  const refuse = run(['--cli', FAKE_CLI, '--steps', stepsFile, '--baseline', file, '--init-baseline']);
  expect(refuse.code, refuse.out).toBe(2);
  expect(refuse.stderr).toContain('already exists');

  const missing = tmp.next('no-baseline-yet.json');
  const made = run(['--cli', FAKE_CLI, '--steps', stepsFile, '--baseline', missing, '--init-baseline']);
  expect(made.code, made.out).toBe(0);
  const init = JSON.parse(readFileSync(missing, 'utf-8'));
  expect(init.commands).toEqual(['secret']);
  expect(init.options).toEqual(['secret --quiet']);
});

it('--baseline-not-larger-than <ref> is red when the baseline holds an entry the file at that ref did not (XSPEC-471 R2)', () => {
  // a throwaway repository that holds a copy of the program and its baseline, so the program finds `git show <ref>:<baseline>` where it expects it
  const root = tmp.next('git-repo');
  const dir = copyProgram(root);
  const program = join(dir, 'check-cli-coverage.mjs');
  const git = (...args) => spawnSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@example.com', '-c', 'commit.gpgsign=false', ...args], { cwd: root, encoding: 'utf-8', env: cleanEnv() });
  const baselineFile = join(dir, 'coverage-baseline.json');
  const setBaseline = (commands) => writeFileSync(baselineFile, JSON.stringify({ schema: 1, commands, options: [] }));
  const commit = (message) => {
    expect(git('add', '-A').status).toBe(0);
    const r = git('commit', '-q', '-m', message);
    expect(r.status, r.stderr).toBe(0);
  };
  // three commands: foo is used by a step, bar and baz are gaps
  const node = (name) => ({ name, aliases: [], options: [], commands: [] });
  const tree = writeJson('tree.json', { name: 'uds', aliases: [], options: [], commands: ['foo', 'bar', 'baz'].map(node) });
  const steps = writeJson('steps.json', doc([stepRunning('a', ['foo'])]));
  const args = ['--tree', tree, '--steps', steps];
  const against = (ref) => run([...args, '--baseline-not-larger-than', ref], program, root);

  expect(git('init', '-q').status).toBe(0);
  expect(git('commit', '-q', '--allow-empty', '-m', 'before the baseline existed').status).toBe(0);
  expect(git('tag', 'first').status).toBe(0);
  setBaseline(['bar', 'baz']);
  commit('two gaps');

  const same = against('HEAD');
  expect(same.code, same.out).toBe(0);
  expect(same.stdout).not.toContain('is new');

  // a ref that has no such file is not an error: the change creates it
  const created = against('first');
  expect(created.code, created.out).toBe(0);
  expect(created.stdout).toContain('this change creates it');

  // the baseline shrinks in one commit and an entry is added back in the working copy: the entry is not in the file at HEAD
  setBaseline(['bar']);
  commit('one gap');
  setBaseline(['bar', 'baz']);
  const grown = against('HEAD');
  expect(grown.code, grown.out).toBe(1);
  expect(grown.stdout).toContain('FAIL baseline entry command "baz" is new: the baseline may only shrink');
  expect(grown.stdout, 'it is the only complaint: the check itself is green').not.toContain('FAIL no acceptance step');

  // a ref that is not a ref cannot be measured
  const bad = against('no-such-ref');
  expect(bad.code, bad.out).toBe(2);
});

it('the check exits 2, not 0 and not 1, when it cannot measure: a CLI that cannot be loaded, a tree with no commands, a file that is not JSON (XSPEC-471 R2)', () => {
  // a folder with a bin and without node_modules: the dump step says what is missing instead of listing nothing
  const bare = tmp.next('bare-cli');
  mkdirSync(join(bare, 'bin'), { recursive: true });
  writeFileSync(join(bare, 'bin', 'uds.js'), '');
  const a = run(['--cli', bare, '--steps', writeJson('steps.json', doc([])), '--baseline', writeJson('b.json', EMPTY_BASELINE)]);
  expect(a.code, a.out).toBe(2);
  expect(a.stderr).toContain('CANNOT MEASURE');
  expect(a.stderr).toContain('npm ci');

  const emptyTree = writeJson('tree.json', { name: 'uds', aliases: [], options: [], commands: [] });
  const b = run(['--tree', emptyTree, '--steps', writeJson('steps.json', doc([])), '--baseline', writeJson('b.json', EMPTY_BASELINE)]);
  expect(b.code, b.out).toBe(2);
  expect(b.stderr).toContain('the command tree has no commands');

  const notJson = tmp.next('steps.json');
  writeFileSync(notJson, '{ not json');
  const c = run(['--cli', FAKE_CLI, '--steps', notJson, '--baseline', writeJson('b.json', EMPTY_BASELINE)]);
  expect(c.code, c.out).toBe(2);
  expect(c.stderr).toContain('as JSON');
});

it('weakening the check turns the property red: ignoring subcommands, subcommand options, options, hidden items, aliases, short flags, `run` steps, a reason, a new gap or a stale baseline entry each make a copy of the program miss what the real one catches (XSPEC-471 R2)', { timeout: 280000 }, () => {
  // Samples: each is a call and what the real program must do with it. A sample is held when the program exits as expected AND says the thing.
  const samples = () => [
    { what: 'a subcommand no step uses is named', call: { steps: without('sub').concat(stepRunning('grp', ['grp', '--help'])) }, code: 1, says: 'FAIL no acceptance step uses command "grp sub"' },
    { what: 'an option no step uses is named', call: { steps: ALL_STEPS.map((s) => (s.id === 'ui' ? stepRunning('ui', ['--ui-lang', 'x', 'foo', '--bar']) : s)) }, code: 1, says: 'FAIL no acceptance step uses option "foo --baz"' },
    { what: 'a hidden command and a hidden option are named', call: { steps: without('secret', 'sub').concat(stepRunning('grp', ['grp', 'sub'])) }, code: 1, says: 'FAIL no acceptance step uses command "secret"' },
    { what: 'a hidden option is named', call: { steps: ALL_STEPS.map((s) => (s.id === 'sub' ? stepRunning('sub', ['grp', 'sub', '--deep']) : s)) }, code: 1, says: 'FAIL no acceptance step uses option "grp sub --hid"' },
    { what: 'an alias uses the command', call: { steps: ALL_STEPS }, code: 0, says: 'NEW gaps: 0' },
    { what: 'a short flag uses the long option', call: { steps: ALL_STEPS.map((s) => (s.id === 'ui' ? stepRunning('ui', ['--ui-lang', 'x', 'foo', '--bar', '-b', 'v']) : s)) }, code: 0, says: 'NEW gaps: 0' },
    { what: 'a run step with {bin} uses the command', call: { steps: ALL_STEPS.map((s) => (s.id === 'secret' ? { id: 'secret', title: 'via run', run: ['{node}', '{bin}', 'secret', '--quiet'], expect: { contains: ['ok'] } } : s)) }, code: 0, says: 'NEW gaps: 0' },
    { what: 'an empty reason does not exempt', call: { steps: without('secret'), exemptions: [{ command: 'secret', reason: '' }, { option: 'secret --quiet', reason: 'Long enough to count, but the command above has none.' }] }, code: 1, says: 'FAIL no acceptance step uses command "secret"' },
    { what: 'a gap that is not in the baseline is red', call: { steps: without('secret') }, code: 1, says: 'NEW gaps: 2' },
    { what: 'a stale baseline entry is red', call: { baseline: { schema: 1, commands: ['foo'], options: [] } }, code: 1, says: 'FAIL baseline entry command "foo" must be removed' },
  ];
  const holds = (dir) => samples().filter((s) => {
    const r = check(s.call, join(dir, 'check-cli-coverage.mjs'));
    return !(r.code === s.code && r.stdout.includes(s.says));
  }).map((s) => s.what);

  const real = copyProgram(tmp.next('real'));
  expect(holds(real), 'control: the unmodified program holds every sample').toEqual([]);

  const weakened = (name, file, from, to) => {
    const dir = copyProgram(tmp.next(name));
    weaken(join(dir, file), from, to);
    return holds(dir);
  };

  expect(weakened('only-top-level', 'lib/cli-surface.mjs', '      commands.push({', '      if (p.length === 1) commands.push({'), 'only top-level commands are listed')
    .toEqual(expect.arrayContaining(['a subcommand no step uses is named']));
  expect(weakened('no-subcommand-options', 'lib/cli-surface.mjs', '      visit(c, p);', '      if (path.length === 0) visit(c, p);'), 'the options of a subcommand are not listed')
    .toEqual(expect.arrayContaining(['a hidden option is named']));
  expect(weakened('no-options', 'lib/cli-surface.mjs', 'for (const o of node.options || []) {', 'for (const o of []) {'), 'options are not listed')
    .toEqual(expect.arrayContaining(['an option no step uses is named', 'a hidden option is named']));
  expect(weakened('no-hidden', 'dump-cli-tree.mjs', 'commands: c.commands.map(describe),', 'commands: c.commands.filter((x) => !x._hidden).map(describe),'), 'hidden commands are dropped')
    .toEqual(expect.arrayContaining(['a hidden command and a hidden option are named']));
  expect(weakened('no-hidden-options', 'dump-cli-tree.mjs', 'options: c.options.map(describeOption),', 'options: c.options.filter((o) => !o.hidden).map(describeOption),'), 'hidden options are dropped')
    .toEqual(expect.arrayContaining(['a hidden option is named']));
  expect(weakened('no-alias', 'lib/cli-surface.mjs', 'c.name === a || (c.aliases || []).includes(a)', 'c.name === a'), 'an alias is not read')
    .toEqual(expect.arrayContaining(['an alias uses the command']));
  expect(weakened('no-short', 'lib/cli-surface.mjs', 'const hit = findShort(`-${a[j]}`);', 'const hit = null;'), 'a short flag is not read')
    .toEqual(expect.arrayContaining(['a short flag uses the long option']));
  expect(weakened('no-run', 'lib/cli-surface.mjs', "return at === -1 ? null : step.run.slice(at + 1);", 'return null;'), 'a run step is not read')
    .toEqual(expect.arrayContaining(['a run step with {bin} uses the command']));
  expect(weakened('empty-reason', 'lib/cli-surface.mjs', "const hasReason = (x) => typeof x.reason === 'string' && x.reason.trim().length >= MIN_REASON_LENGTH;", 'const hasReason = () => true;'), 'a reason is not required')
    .toEqual(expect.arrayContaining(['an empty reason does not exempt']));
  expect(weakened('new-gap-ok', 'lib/cli-surface.mjs', 'result.ok = result.newGaps.length === 0 && ', 'result.ok = '), 'a new gap is allowed')
    .toEqual(expect.arrayContaining(['a gap that is not in the baseline is red']));
  expect(weakened('stale-ok', 'lib/cli-surface.mjs', ' && result.staleBaseline.length === 0', ''), 'a stale baseline entry is allowed')
    .toEqual(expect.arrayContaining(['a stale baseline entry is red']));
});

it('the baseline file in the repository is well formed: sorted by nothing in particular, but every entry is a string, there are no duplicates, and the file says what it is (XSPEC-471 R2)', () => {
  const file = join(ACCEPT_DIR, 'coverage-baseline.json');
  expect(existsSync(file)).toBe(true);
  const b = JSON.parse(readFileSync(file, 'utf-8'));
  expect(b.schema).toBe(1);
  for (const key of ['commands', 'options']) {
    expect(Array.isArray(b[key]), key).toBe(true);
    expect(new Set(b[key]).size, `${key}: no duplicates`).toBe(b[key].length);
    for (const id of b[key]) expect(typeof id, id).toBe('string');
  }
  expect(b.note).toContain('only shrinks');
});
