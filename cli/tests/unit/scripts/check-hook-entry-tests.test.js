// scripts/check-hook-entry-tests.mjs, run as the CI job runs it (a separate node process),
// against small throwaway trees. Each case builds a tree with a hook the installer wires,
// plus whichever tests we want to show the gate judging, then reads back the exit code
// and the lines it printed.

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';

const GATE = join(import.meta.dirname, '..', '..', '..', '..', 'scripts', 'check-hook-entry-tests.mjs');

let root;
beforeEach(() => { root = mkdtempSync(join(tmpdir(), 'uds-hook-gate-fixture-')); });
afterEach(() => { rmSync(root, { recursive: true, force: true }); });

const put = (rel, text) => {
  const p = join(root, ...rel.split('/'));
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, text);
};

/** A standard whose `enforcement:` block wires scripts/hooks/<script> to <event>. */
const wire = (id, script, event, matcher = 'Bash') =>
  put(`ai/standards/${id}.ai.yaml`, [
    `id: ${id}`,
    'enforcement:',
    `  trigger: ${event}`,
    `  matcher: ${matcher}`,
    `  hook_script: scripts/hooks/${script}`,
    '',
  ].join('\n'));

const HOOK_SRC = 'process.exit(2);\n';

/** What check-dangerous-cmd.mjs got before #281: tests that import and call the matcher. */
const FUNCTION_CALL_TEST = `
import { describe, it, expect } from 'vitest';
import { findDangerous } from '../../../../scripts/hooks/guard.mjs';
describe('guard', () => { it('matches', () => { expect(findDangerous('rm -rf /')).toBe('rm'); }); });
`;

/** The shape the gate asks for: spawn the script, host payload on stdin, assert exit 2. */
const entryTest = (assertion = 'expect(r.status).toBe(BLOCKS);', blocks = 2) => `
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
const SCRIPT = join(import.meta.dirname, '..', '..', '..', '..', 'scripts', 'hooks', 'guard.mjs');
const BLOCKS = ${blocks};
const payload = JSON.stringify({ hook_event_name: 'PreToolUse', tool_name: 'Bash', tool_input: { command: 'rm -rf /' } });
const r = spawnSync(process.execPath, [SCRIPT], { input: payload, encoding: 'utf8' });
${assertion}
`;

const gate = () => {
  const r = spawnSync(process.execPath, [GATE, '--root', root], { encoding: 'utf8', timeout: 30000 });
  return { status: r.status, out: r.stdout, err: r.stderr };
};

describe('check-hook-entry-tests gate', () => {
  beforeEach(() => {
    wire('guard-std', 'guard.mjs', 'PreToolUse');
    put('scripts/hooks/guard.mjs', HOOK_SRC);
  });

  it('FAILS a blocking hook that only has a function-call unit test, and names the hook and the missing kind', () => {
    put('cli/tests/unit/hooks/guard.test.js', FUNCTION_CALL_TEST);
    const r = gate();
    expect(r.status).toBe(1);
    expect(r.out).toContain('[FAIL] scripts/hooks/guard.mjs');
    expect(r.out).toContain('spawn the hook with a host-shaped JSON payload on stdin and assert exit status 2');
    expect(r.out).toContain('guard.test.js names it but does not satisfy: runs the hook as a process (it only imports the hook and calls its functions)');
  });

  it('FAILS a blocking hook that no test names at all', () => {
    put('cli/tests/unit/other.test.js', 'export {};\n');
    const r = gate();
    expect(r.status).toBe(1);
    expect(r.out).toContain('[FAIL] scripts/hooks/guard.mjs');
    expect(r.out).toContain('no test file under cli/tests/ names guard.mjs');
  });

  it('PASSES when a test spawns the hook with a host payload and asserts exit 2', () => {
    put('cli/tests/unit/hooks/guard-entry.test.js', entryTest());
    const r = gate();
    expect(r.status).toBe(0);
    expect(r.out).toContain('[ok]   scripts/hooks/guard.mjs');
    expect(r.out).toContain('guard-entry.test.js');
  });

  it('PASSES with a literal 2 as well as a constant bound to 2', () => {
    put('cli/tests/unit/hooks/guard-entry.test.js', entryTest('expect(r.status).toBe(2);'));
    expect(gate().status).toBe(0);
  });

  it('FAILS when the entry test asserts exit 1 (the bug this gate exists for)', () => {
    put('cli/tests/unit/hooks/guard-entry.test.js', entryTest('expect(r.status).toBe(BLOCKS);', 1));
    const r = gate();
    expect(r.status).toBe(1);
    expect(r.out).toContain('asserts the exit status equals 2');
  });

  it('FAILS when the only mention of the hook is in a comment', () => {
    put('cli/tests/unit/hooks/guard-entry.test.js', entryTest().replace(/guard\.mjs/g, 'other.mjs') + '\n// covers guard.mjs\n');
    const r = gate();
    expect(r.status).toBe(1);
    expect(r.out).toContain('no test file under cli/tests/ names guard.mjs');
  });

  it('does not require an entry test of a shipped script classified as never blocking', () => {
    put('cli/tests/unit/hooks/guard-entry.test.js', entryTest());
    put('scripts/hooks/inject-standards.mjs', 'process.exit(0);\n');
    const r = gate();
    expect(r.status).toBe(0);
    expect(r.out).toContain('[skip] scripts/hooks/inject-standards.mjs');
  });

  it('FAILS a classified-as-never-blocking script whose source can exit 2', () => {
    put('cli/tests/unit/hooks/guard-entry.test.js', entryTest());
    put('scripts/hooks/inject-standards.mjs', 'process.exit(2);\n');
    const r = gate();
    expect(r.status).toBe(1);
    expect(r.out).toContain('inject-standards.mjs is listed in NOT_A_HOOK_ENTRY as never blocking');
  });

  it('FAILS a new shipped script nobody classified, so a new hook cannot slip past by not being wired yet', () => {
    put('cli/tests/unit/hooks/guard-entry.test.js', entryTest());
    put('scripts/hooks/brand-new-hook.mjs', 'process.exit(2);\n');
    const r = gate();
    expect(r.status).toBe(1);
    expect(r.out).toContain('brand-new-hook.mjs is shipped in scripts/hooks/ but is neither wired');
  });

  it('FAILS a hook wired to an event nobody has classified', () => {
    put('cli/tests/unit/hooks/guard-entry.test.js', entryTest());
    wire('odd-std', 'odd.mjs', 'SessionStart', '');
    put('scripts/hooks/odd.mjs', 'process.exit(0);\n');
    const r = gate();
    expect(r.status).toBe(1);
    expect(r.out).toContain('odd.mjs is wired to event "SessionStart", which EVENT_CONTRACT does not classify');
  });

  it('holds a Stop hook (blocks by stdout JSON, exit 0) to the stdout contract, not to exit 2', () => {
    put('cli/tests/unit/hooks/guard-entry.test.js', entryTest());
    wire('stop-std', 'stopper.mjs', 'Stop', '');
    put('scripts/hooks/stopper.mjs', 'console.log(JSON.stringify({ decision: "block" }));\n');
    const without = gate();
    expect(without.status).toBe(1);
    expect(without.out).toContain('[FAIL] scripts/hooks/stopper.mjs');
    expect(without.out).toContain('assert the stdout JSON block decision');

    put('cli/tests/unit/hooks/stopper.test.js', `
import { spawnSync } from 'node:child_process';
const r = spawnSync(process.execPath, ['scripts/hooks/stopper.mjs'], { input: '{}', encoding: 'utf8' });
expect(JSON.parse(r.stdout).decision).toBe('block');
`);
    expect(gate().status).toBe(0);
  });

  it('reports unmeasurable (exit 2), not a pass, when there are no test files to read', () => {
    const r = gate();
    expect(r.status).toBe(2);
    expect(r.out).toContain('UNMEASURABLE');
  });

  it('reports unmeasurable (exit 2) when the tree has no scripts/hooks', () => {
    rmSync(join(root, 'scripts'), { recursive: true, force: true });
    expect(gate().status).toBe(2);
  });
});
