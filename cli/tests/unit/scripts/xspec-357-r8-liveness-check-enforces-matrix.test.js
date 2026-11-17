/**
 * `npm run check:liveness` (scripts/check-integration-liveness.ts) holds the XSPEC-357 R8 matrix to its rules.
 * AC-8.6: README's Verified column shows ✅ only when all five cells passed. AC-8.7: nothing is shown as verified
 * without evidence.
 *
 * The maintainer's entry is that script, so it is what runs here: the real script, in a throwaway tree that holds
 * only the files it reads, with one thing made wrong at a time. The first case is the control: the same tree,
 * untouched, passes. Without it a script that fails for any reason would satisfy every case below.
 *
 * Wires that make these red when cut (one line each; see the report for the measured run):
 *   scripts/check-integration-liveness.ts   if (shown !== expected) {        (the README row is never compared)
 *   scripts/check-integration-liveness.ts   } else if (readFileSync(full, 'utf8') ... !== renderMatrixPage(registry)
 *   scripts/lib/integration-verification-matrix.mjs   if (v.status !== derived) {   (the overall status is taken as given)
 *
 * Needs the repo-root packages (tsx). Without them it is skipped, and says so.
 */

import { describe, it, expect, afterAll } from 'vitest';
import { spawnSync } from 'child_process';
import { cpSync, mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync, existsSync } from 'fs';
import { tmpdir } from 'os';
import { dirname, join } from 'path';
import { REAL_REPO } from '../../utils/staged-cli-harness.js';

const TSX = join(REAL_REPO, 'node_modules', 'tsx', 'dist', 'cli.mjs');
const roots = [];
afterAll(() => { for (const r of roots) rmSync(r, { recursive: true, force: true }); });

const FILES = [
  'package.json', // "type": "module": the script uses top-level await
  'scripts/check-integration-liveness.ts',
  'scripts/lib/integration-verification-matrix.mjs',
  'scripts/check-ai-agent-sync.sh',
  'integrations',
  'cli/standards-registry.json',
  'cli/src/config/ai-agent-paths.js',
  'cli/src/installers/integration-installer.js',
  'README.md',
  'locales/zh-TW/README.md',
  'locales/zh-CN/README.md',
  'docs/reference/INTEGRATION-VERIFICATION-MATRIX.md',
  'cli/tests/e2e/xspec-357-r8-install-and-update-matrix.test.js',
  'cli/tests/e2e/xspec-357-r8-violation-detected.test.js'
];

/** The files the script reads, copied. The script finds its root from its own location, so this tree is its world. */
function tree() {
  const root = mkdtempSync(join(tmpdir(), 'uds-test-liveness-'));
  roots.push(root);
  for (const rel of FILES) {
    mkdirSync(dirname(join(root, rel)), { recursive: true });
    cpSync(join(REAL_REPO, rel), join(root, rel), { recursive: true });
  }
  return root;
}

function run(root) {
  const r = spawnSync(process.execPath, [TSX, join(root, 'scripts/check-integration-liveness.ts')], { cwd: root, encoding: 'utf8', timeout: 60000 });
  return { code: r.status, out: `${r.stdout}\n${r.stderr}`.replace(/\x1B\[[0-9;]*m/g, '') };
}

const edit = (root, rel, fn) => {
  const p = join(root, rel);
  const before = readFileSync(p, 'utf8');
  const after = fn(before);
  expect(after, `fixture: the edit to ${rel} changed something`).not.toBe(before);
  writeFileSync(p, after);
};

const registryEdit = (root, fn) => edit(root, 'integrations/REGISTRY.json', (text) => {
  const reg = JSON.parse(text);
  fn(reg);
  return `${JSON.stringify(reg, null, 2)}\n`;
});

describe('check:liveness enforces the verification matrix', () => {
  it('control: the shipped files pass', (ctx) => {
    if (!existsSync(TSX)) ctx.skip();
    const r = run(tree());
    expect(r.code, r.out).toBe(0);
    expect(r.out).toContain('All liveness and consistency checks passed');
  }, 90000);

  it('Codex shown ✅ in the README while its cell 2 was never run: fails and names the row', (ctx) => {
    if (!existsSync(TSX)) ctx.skip();
    const root = tree();
    edit(root, 'README.md', (t) => t.replace(/(\| \*\*OpenAI Codex\*\* \|[^|]*\|)[^|]*\|/, '$1 ✅ 2026-07-23 |'));
    const r = run(root);
    expect(r.code, r.out).toBe(1);
    expect(r.out).toMatch(/README\.md: "OpenAI Codex" Verified column reads "✅ 2026-07-23"/);
  }, 90000);

  it('the same edit in the Chinese READMEs is caught too', (ctx) => {
    if (!existsSync(TSX)) ctx.skip();
    const root = tree();
    edit(root, 'locales/zh-TW/README.md', (t) => t.replace(/(\| \*\*OpenAI Codex\*\* \|[^|]*\|)[^|]*\|/, '$1 ✅ 2026-07-23 |'));
    const r = run(root);
    expect(r.code, r.out).toBe(1);
    expect(r.out).toMatch(/locales\/zh-TW\/README\.md: "OpenAI Codex" Verified column reads/);
  }, 90000);

  it('the overall status set to verified by hand over four cells: fails, because it is derived', (ctx) => {
    if (!existsSync(TSX)) ctx.skip();
    const root = tree();
    registryEdit(root, (reg) => { reg.agents.codex.verification.status = 'verified'; });
    const r = run(root);
    expect(r.code, r.out).toBe(1);
    expect(r.out).toMatch(/codex\.verification\.status is "verified" but its five cells add up to "unverified"/);
  }, 90000);

  it('cell 2 marked verified with no P7 run behind it: fails', (ctx) => {
    if (!existsSync(TSX)) ctx.skip();
    const root = tree();
    registryEdit(root, (reg) => {
      const m = reg.agents.codex.verification.matrix;
      m.agentReads = { status: 'verified', date: '2026-11-17', evidence: 'integrations/verification/codex/2026-07-23.md', probes: ['P2'] };
      reg.agents.codex.verification.status = 'verified';
    });
    const r = run(root);
    expect(r.code, r.out).toBe(1);
    expect(r.out).toMatch(/agentReads claims verified but names no P7 probe run/);
  }, 90000);

  it('a verified cell whose evidence file is gone: fails', (ctx) => {
    if (!existsSync(TSX)) ctx.skip();
    const root = tree();
    rmSync(join(root, 'cli/tests/e2e/xspec-357-r8-install-and-update-matrix.test.js'));
    const r = run(root);
    expect(r.code, r.out).toBe(1);
    expect(r.out).toMatch(/install\.evidence points at "cli\/tests\/e2e\/xspec-357-r8-install-and-update-matrix\.test\.js", which does not exist/);
  }, 90000);

  it('a not-verified cell whose partial evidence file is gone: fails too', (ctx) => {
    if (!existsSync(TSX)) ctx.skip();
    const root = tree();
    rmSync(join(root, 'cli/tests/e2e/xspec-357-r8-violation-detected.test.js'));
    const r = run(root);
    expect(r.code, r.out).toBe(1);
    expect(r.out).toMatch(/violationDetected\.partialEvidence points at "cli\/tests\/e2e\/xspec-357-r8-violation-detected\.test\.js", which does not exist/);
  }, 90000);

  it('the matrix page left behind after a registry edit: fails', (ctx) => {
    if (!existsSync(TSX)) ctx.skip();
    const root = tree();
    edit(root, 'docs/reference/INTEGRATION-VERIFICATION-MATRIX.md', (t) => `${t}\nstale\n`);
    const r = run(root);
    expect(r.code, r.out).toBe(1);
    expect(r.out).toContain('docs/reference/INTEGRATION-VERIFICATION-MATRIX.md is out of date with integrations/REGISTRY.json');
  }, 90000);
});
