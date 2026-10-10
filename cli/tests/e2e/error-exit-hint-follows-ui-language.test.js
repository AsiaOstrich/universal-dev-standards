/**
 * E2E: the error-exit gate hints in `uds check` and `uds update` are said in the interface language
 * (found in the 6.14.0-beta.8 Mac manual acceptance, 2026-10-10: an English UI printed them in Chinese only).
 *
 * Every test spawns the real CLI in a throwaway project that has a src/ folder and no scripts/check-error-exit.mjs,
 * which is exactly when the hints are shown.
 *
 * Wires that make these red when cut (one line each):
 *   cli/src/commands/check.js    const m = t().commands.check.errorExitGate;
 *   cli/src/commands/update.js   const m = t().commands.update.errorExitOffer;
 */

import { it, expect, afterAll } from 'vitest';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { createHarness } from '../utils/staged-cli-harness.js';

const h = createHarness('error-exit-hint-lang');
afterAll(() => h.cleanup());

const CJK = /[㐀-鿿]/;

async function projectWithSource() {
  const dir = await h.newProject();
  mkdirSync(join(dir, 'src'), { recursive: true });
  writeFileSync(join(dir, 'src', 'index.js'), 'export const x = 1;\n');
  return dir;
}

const hintLines = (out) => out.split('\n').filter((l) => l.includes('[error-exit]'));

it('uds check says the missing error-exit gate in English, Traditional and Simplified Chinese by the UI language', async () => {
  const dir = await projectWithSource();
  const en = await h.runCli(['check', '--offline'], dir, { ui: 'en' });
  const tw = await h.runCli(['check', '--offline'], dir, { ui: 'zh-tw' });
  const cn = await h.runCli(['check', '--offline'], dir, { ui: 'zh-cn' });

  expect(en.stdout).toContain('[error-exit] No single-exit check for error messages (scripts/check-error-exit.mjs).');
  expect(en.stdout).toContain('`uds update` shows its content and asks before writing it.');
  expect(hintLines(en.stdout).some((l) => CJK.test(l)), en.stdout).toBe(false);
  expect(tw.stdout).toContain('[error-exit] 沒有錯誤訊息單一出口檢查');
  expect(cn.stdout).toContain('[error-exit] 没有错误信息单一出口检查');
});

it('uds update offers the error-exit gate in English when the UI is English, and with --yes writes it and says so in English', async () => {
  const dir = await projectWithSource();
  // `uds update` only reaches its offers when there is something to update, so the project is made to look
  // like one initialised by an older UDS (same fixture as test-discipline-gates.test.js).
  const manifestPath = join(dir, '.standards', 'manifest.json');
  const m = JSON.parse(readFileSync(manifestPath, 'utf8'));
  m.upstream.version = '6.13.0';
  writeFileSync(manifestPath, JSON.stringify(m, null, 2));

  const run = await h.runCli(['update', '--yes'], dir, { ui: 'en' });
  const out = run.stdout + run.stderr;
  expect(out).toContain('Single exit for error messages (gate)');
  expect(out).toContain('Will write: scripts/check-error-exit.mjs (plain Node, no dependencies,');
  expect(out).toContain('✓ Wrote scripts/check-error-exit.mjs');
  expect(out).not.toContain('錯誤訊息單一出口閘門');
  expect(existsSync(join(dir, 'scripts', 'check-error-exit.mjs'))).toBe(true);
});
