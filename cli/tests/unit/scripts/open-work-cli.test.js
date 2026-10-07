// `uds open-work` — the open-work-tracking reference checks (OWT-017/018/019) as a
// command an adopter can run from the npm package.
//
// Background (found 2026-09-29 installing 6.14.0-beta.1 into a fresh project):
// the checks lived only in <repo>/scripts/, which the npm package does not
// contain, so no adopter could run them. They now live once, in
// cli/src/utils/open-work-tracking.mjs, and there are two front doors:
//   uds open-work ...                          (ships in the package)
//   node scripts/check-open-work-tracking.mjs  (repo shim, no rules of its own)
//
// What this file proves that open-work-tracking-intent-and-next-action.test.js does
// not: (1) the COMMAND, run as a real subprocess, exits 1 on a violating sample
// and 0 on a clean one and keeps 2 ("cannot decide") distinct; (2) the shim and the
// command are the same body, not two copies; (3) the body is inside the npm package.
// The rule-level mutation matrix (17 mutants) stays in the other file; here the
// mutations are the ones that only exist at the CLI layer, plus one on the shared
// body to show BOTH doors move with it.
//
// Every fixture is built under mkdtempSync(join(tmpdir(), ...)); nothing is
// written into the repo.

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync, readFileSync, mkdirSync, cpSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parsePackFiles } from '../../../../scripts/npm-pack-files.mjs';

const CLI_ROOT = join(import.meta.dirname, '..', '..', '..');
const REPO_ROOT = join(CLI_ROOT, '..');
const UDS = join(CLI_ROOT, 'bin', 'uds.js');
const SHIM = join(REPO_ROOT, 'scripts', 'check-open-work-tracking.mjs');
const BODY_REL = join('src', 'utils', 'open-work-tracking.mjs');

let dir;
beforeAll(() => { dir = mkdtempSync(join(tmpdir(), 'uds-owt-cli-')); });
afterAll(() => { rmSync(dir, { recursive: true, force: true }); });

const w = (name, content) => {
  const p = join(dir, name);
  mkdirSync(join(p, '..'), { recursive: true });
  writeFileSync(p, content);
  return p;
};

// UDS_NO_UPDATE_CHECK: the command must not reach for the network.
const ENV = { ...process.env, UDS_NO_UPDATE_CHECK: '1' };

function uds(args, { bin = UDS, cwd = dir } = {}) {
  const r = spawnSync(process.execPath, [bin, 'open-work', ...args], { encoding: 'utf8', cwd, env: ENV });
  return { status: r.status, out: `${r.stdout}${r.stderr}` };
}
function shim(args, script = SHIM) {
  const r = spawnSync(process.execPath, [script, ...args], { encoding: 'utf8', cwd: dir, env: ENV });
  return { status: r.status, out: `${r.stdout}${r.stderr}` };
}

const table = (rows) => `| Change | Approver | Reason |\n|---|---|---|\n${rows}`;
const spec = (ac, rev) => `# Spec\n\n## Acceptance criteria\n\n${ac}\n\n## Revisions\n\n${rev}\n`;

const VAGUE = '# Work log\n\n## Next action\n\n- Continue implementation and handle the rest\n';
const NAMED = '# Work log\n\n## Next action\n\n- Run `npm test` in cli/ and fix src/utils/open-work-tracking.mjs\n';
const BOTH = '# X\n\n## Acceptance criteria\n\n- it works\n\n## Next action\n\n- Run `npm test`\n';
const INTENT_ONLY = '# X\n\n## Acceptance criteria\n\n- it works\n';
const V1 = spec('- the export finishes', table(''));
const V2_NO_RECORD = spec('- the export finishes\n- the export is idempotent', table(''));
const V2_APPROVED = spec('- the export finishes\n- the export is idempotent', table('| added idempotence | albert | reviewers asked |\n'));

describe('uds open-work: exit codes on violating and clean samples (a real subprocess)', () => {
  it('next-action: a vague next action exits 1', () => {
    const r = uds(['next-action', w('na/vague.md', VAGUE)]);
    expect(r.status).toBe(1);
    expect(r.out).toMatch(/VIOLATION OWT-019/);
  });
  it('next-action: a named next action exits 0', () => {
    const r = uds(['next-action', w('na/named.md', NAMED)]);
    expect(r.status).toBe(0);
    expect(r.out).not.toMatch(/VIOLATION/);
  });
  it('next-action: --root and --id-pattern reach the checker (a custom identifier names an object)', () => {
    const f = w('na/custom.md', '# L\n\n## Next action\n\n- finish TICKET_42\n');
    expect(uds(['next-action', f]).status).toBe(1);
    expect(uds(['next-action', f, '--id-pattern', 'TICKET_\\d+']).status).toBe(0);
    w('root/scripts/present.mjs', 'x');
    const g = w('na/path.md', '# L\n\n## Next action\n\n- edit scripts/present.mjs\n');
    expect(uds(['next-action', g, '--root', join(dir, 'root')]).out).toMatch(/named-resolved=1/);
  });

  it('revision: a changed acceptance criterion with no revision record exits 1', () => {
    const r = uds(['revision', '--before', w('rv/v1.md', V1), '--after', w('rv/v2.md', V2_NO_RECORD)]);
    expect(r.status).toBe(1);
    expect(r.out).toMatch(/VIOLATION OWT-018/);
  });
  it('revision: a change with a complete, approved record exits 0', () => {
    const r = uds(['revision', '--before', w('rv/a1.md', V1), '--after', w('rv/a2.md', V2_APPROVED)]);
    expect(r.status).toBe(0);
    expect(r.out).not.toMatch(/VIOLATION/);
  });

  it('separation: one carrier holding intent and progress exits 1; separate carriers exit 0', () => {
    const bad = uds(['separation', w('sp/both.md', BOTH)]);
    expect(bad.status).toBe(1);
    expect(bad.out).toMatch(/VIOLATION OWT-017/);
    const ok = uds(['separation', w('sp/spec.md', INTENT_ONLY), w('sp/log.md', NAMED)]);
    expect(ok.status).toBe(0);
  });

  it('self-test exits 0', () => {
    expect(uds(['self-test']).status).toBe(0);
  });

  it('exit 2 is kept distinct from 0 and 1: no files, and a file with no structure to read', () => {
    expect(uds(['next-action']).status).toBe(2);
    expect(uds(['separation']).status).toBe(2);
    expect(uds(['revision']).status).toBe(2);
    const none = uds(['next-action', w('none/log.md', '# Notes\n\nnothing here\n')]);
    expect(none.status).toBe(2);
    expect(none.out).toMatch(/CANNOT DECIDE/);
  });

  it('keeps the two statements every run must make: coverage unknown, vocabulary uncalibrated', () => {
    const r = uds(['next-action', w('st/named.md', NAMED)]);
    expect(r.out).toMatch(/COVERAGE UNKNOWN \(OWT-011\)/);
    expect(r.out).toMatch(/UNCALIBRATED \(OWT-016\)/);
  });
});

describe('one body of the rules: the command and the repo shim are the same code', () => {
  it('the shim holds no rules: it imports the module and defines none of them', () => {
    const src = readFileSync(SHIM, 'utf8');
    expect(src).toMatch(/from '\.\.\/cli\/src\/utils\/open-work-tracking\.mjs'/);
    for (const rule of ['OWT-019', 'classifyNextAction', 'checkIntentRevision', 'checkSeparation', 'VOCAB']) {
      expect(src, `the shim must not define ${rule}`).not.toMatch(new RegExp(`function ${rule}|const ${rule} `));
    }
    expect(src.split('\n').length).toBeLessThan(40);
  });

  it('the command and the shim print the same thing and exit the same way on the same input', () => {
    const cases = [
      ['next-action', w('same/vague.md', VAGUE)],
      ['next-action', w('same/named.md', NAMED)],
      ['separation', w('same/both.md', BOTH)],
      ['revision', '--before', w('same/v1.md', V1), '--after', w('same/v2.md', V2_NO_RECORD)],
    ];
    for (const args of cases) {
      const a = uds(args);
      const b = shim(args);
      expect(a.status, args.join(' ')).toBe(b.status);
      expect(a.out, args.join(' ')).toBe(b.out);
    }
  });

  it('re-exports the module, so importing from the old path still works', async () => {
    const old = await import(SHIM);
    const body = await import(join(CLI_ROOT, BODY_REL));
    expect(old.classifyNextAction).toBe(body.classifyNextAction);
    expect(old.main).toBe(body.main);
  });
});

describe('the body is inside the npm package', () => {
  it('`npm pack --dry-run` lists the module and the command', () => {
    // `npm` is `npm.cmd` on Windows: without a shell, spawnSync cannot start it
    // (status null, `error` set), which is how this failed on windows-latest.
    const r = spawnSync('npm', ['pack', '--dry-run', '--json', '--ignore-scripts'], { cwd: CLI_ROOT, encoding: 'utf8', env: ENV, timeout: 60000, shell: process.platform === 'win32' });
    expect(r.status, `${r.error ?? ''}${r.stderr}`).toBe(0);
    // stdout is not just the JSON, and its shape depends on the npm version
    // (array for npm <= 11, object keyed by package name for npm 12 — what the
    // publish job installs). parsePackFiles handles both.
    const files = parsePackFiles(r.stdout);
    expect(files).toContain('src/utils/open-work-tracking.mjs');
    expect(files).toContain('src/commands/open-work.js');
  }, 90000);
});

// ── mutation: the command's own layer, and the shared body ──────────────────
// A copy of bin/ + src/ in a temp dir (node_modules linked), one edit each, and
// the same exit-code assertions must FAIL for that copy. An edit that does not
// match exactly once fails the test, so a no-op mutation cannot pass for a red one.

describe('MUTATION: the command is observed red', () => {
  let n = 0;
  function mutantCli(edits) {
    const root = join(dir, `mutant-${n++}`);
    mkdirSync(root);
    cpSync(join(CLI_ROOT, 'bin'), join(root, 'bin'), { recursive: true });
    cpSync(join(CLI_ROOT, 'src'), join(root, 'src'), { recursive: true });
    cpSync(join(CLI_ROOT, 'package.json'), join(root, 'package.json'));
    symlinkSync(join(CLI_ROOT, 'node_modules'), join(root, 'node_modules'));
    for (const [file, from, to] of edits) {
      const p = join(root, file);
      const src = readFileSync(p, 'utf8');
      expect(src.split(from).length - 1, `mutation anchor must match exactly once in ${file}`).toBe(1);
      writeFileSync(p, src.replace(from, () => to));
    }
    return { bin: join(root, 'bin', 'uds.js'), root };
  }
  const NEUTRALISE = [BODY_REL, 'const selfTest = runSelfTest();', 'const selfTest = { ok: true, failures: [] };'];

  it('a command that swallows the exit code (always exits 0) turns the violating samples green: the tests would catch it', () => {
    // `next-action` and `separation` call the checker on their own lines since 1.3.0 (each carries a declared-word argument list), so the always-exit-0 mutant covers all three call sites
    const { bin } = mutantCli([
      ['src/commands/open-work.js', 'process.exitCode = main(argv);', 'main(argv); process.exitCode = 0;'],
      ['src/commands/open-work.js', 'process.exitCode = main([...argv, ...wordArgv, ...commandArgv, ...files]); // wire:next-action', 'main([...argv, ...wordArgv, ...commandArgv, ...files]); process.exitCode = 0;'],
      ['src/commands/open-work.js', "process.exitCode = main(['separation', ...wordArgv, ...files]); // wire:separation", "main(['separation', ...wordArgv, ...files]); process.exitCode = 0;"],
    ]);
    const vague = w('mut/vague.md', VAGUE);
    expect(uds(['next-action', vague]).status).toBe(1); // real
    expect(uds(['next-action', vague], { bin }).status).toBe(0); // mutant: the assertion above would fail for it
    expect(uds(['separation', w('mut/both.md', BOTH)], { bin }).status).toBe(0);
    expect(uds(['next-action'], { bin }).status).toBe(0); // and exit 2 is no longer distinct
  });

  it('a command that turns every result into a failure turns the clean samples red', () => {
    const { bin } = mutantCli([
      ['src/commands/open-work.js', 'process.exitCode = main(argv);', 'main(argv); process.exitCode = 1;'],
      ['src/commands/open-work.js', 'process.exitCode = main([...argv, ...wordArgv, ...commandArgv, ...files]); // wire:next-action', 'main([...argv, ...wordArgv, ...commandArgv, ...files]); process.exitCode = 1;'],
    ]);
    expect(uds(['next-action', w('mut/named.md', NAMED)], { bin }).status).toBe(1);
  });

  it('the command that forgets to register a subcommand fails on it', () => {
    const { bin } = mutantCli([['bin/uds.js', ".action(openWorkSeparationCommand);", '.action(() => {});']]);
    // Without the action nothing runs and nothing is judged: a silent 0, which the violating sample below exposes.
    expect(uds(['separation', w('mut/both2.md', BOTH)], { bin }).status).toBe(0);
    expect(uds(['separation', w('mut/both2.md', BOTH)]).status).toBe(1);
  });

  it('the rule of the ONE body, made always-pass, changes BOTH doors together', () => {
    const { bin, root } = mutantCli([NEUTRALISE, [BODY_REL, 'const named = kinds.length > 0;', 'const named = true;']]);
    const vague = w('mut/vague2.md', VAGUE);
    expect(uds(['next-action', vague], { bin }).status).toBe(0);
    // the command run from the mutant tree and the module itself agree, because there is one body
    const direct = spawnSync(process.execPath, [join(root, BODY_REL), 'next-action', vague], { encoding: 'utf8', env: ENV });
    expect(direct.status).toBe(0);
    // and the real command still catches it
    expect(uds(['next-action', vague]).status).toBe(1);
  });
});
