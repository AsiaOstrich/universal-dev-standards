/**
 * E2E: the body of `uds check` in the display languages (dev-platform #302 B, decision 665甲).
 *
 * 6.16.0-beta.3 translated the headings of `uds check` and left sentences of the body in English under `--ui-lang zh-tw`:
 * "All skill files intact (N files)", "All UDS blocks intact", "User customizations outside UDS blocks are preserved",
 * "AGENTS.md standards synced (N/N)" (printed with a warning mark), and the two test-gate lines "nothing found" and
 * "no test files found — nothing was measured". The strings were `msg.key || 'English'` with the key missing from every language, so
 * no language had them and nothing noticed.
 *
 * The AGENTS.md line is the one that was wrong, not only untranslated: it carried a warning mark and the word "synced". The mark
 * is deliberate when manifest entries were skipped, so the words changed: with nothing skipped it is a tick and "synced", with
 * something skipped it is a warning mark and says so.
 *
 * Wire that makes these red when cut (one line of CLI source each):
 *   cli/src/commands/check.js          `unresolvedEntries.length === 0 ? msg.standardsSynced : msg.standardsSyncedSkipped`
 *   cli/src/utils/gate-scripts.js      `localizeScriptLine(l, msg)` (the `·` line of the anti-fake-test script)
 *   cli/src/i18n/messages.js           the `allSkillsIntact` key of the language under test
 */

import { it, expect, afterAll } from 'vitest';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { createHarness } from '../utils/staged-cli-harness.js';

const h = createHarness('body6161');
afterAll(() => h.cleanup());

const ENGLISH_BODY = [
  'All skill files intact', 'All UDS blocks intact', 'User customizations outside UDS blocks are preserved',
  'standards synced', 'nothing found', 'nothing was measured', 'Tracked installations'
];

async function checkIn(ui, { extraEntry } = {}) {
  const dir = await h.newProject();
  if (extraEntry) {
    const manifestPath = join(dir, '.standards', 'manifest.json');
    const m = JSON.parse(readFileSync(manifestPath, 'utf8'));
    m.standards = [...m.standards, extraEntry];
    writeFileSync(manifestPath, JSON.stringify(m, null, 2));
  }
  const run = await h.runCli(['check'], dir, { ui });
  return run.stdout + run.stderr;
}

it('uds check --ui-lang zh-tw says the body sentences in Traditional Chinese and ticks the synced line (#302)', async () => {
  const out = await checkIn('zh-tw');
  for (const english of ENGLISH_BODY) expect(out, `still English: ${english}`).not.toContain(english);
  expect(out).toMatch(/✓ 所有 Skills 檔案完整 \(\d+ 個檔案\)/);
  expect(out).toMatch(/✓ 所有 UDS 區塊完整 \(\d+ 個檔案\)/);
  expect(out).toContain('UDS 區塊以外的使用者自訂內容會被保留');
  expect(out).toMatch(/✓ AGENTS\.md 標準已同步 \(\d+\/\d+\)/);
  expect(out).toMatch(/\[anti-fake-test\] scripts\/check-anti-fake-tests\.mjs: 沒有發現問題/);
  expect(out).toContain('找不到測試檔——沒有量到任何東西');
}, 180000);

it('uds check --ui-lang zh-tw does not put "synced" next to a warning mark when manifest entries were skipped (#302)', async () => {
  const out = await checkIn('zh-tw', { extraEntry: 'typo-standard' });
  expect(out).toMatch(/⚠ AGENTS\.md 標準已同步，另有 manifest 條目未計入 \(\d+\/\d+\)/);
  expect(out).not.toMatch(/✓ AGENTS\.md 標準已同步/);
  expect(out).not.toContain('standards synced');
}, 180000);

it('uds check --ui-lang zh-cn says the same body sentences in Simplified Chinese (#302)', async () => {
  const out = await checkIn('zh-cn');
  for (const english of ENGLISH_BODY) expect(out, `still English: ${english}`).not.toContain(english);
  expect(out).toMatch(/✓ 所有 Skills 文件完整 \(\d+ 个文件\)/);
  expect(out).toMatch(/✓ AGENTS\.md 标准已同步 \(\d+\/\d+\)/);
  expect(out).toContain('找不到测试文件——没有量到任何东西');
}, 180000);

it('uds check in English keeps the English sentences (#302)', async () => {
  const out = await checkIn('en');
  expect(out).toMatch(/✓ All skill files intact \(\d+ files\)/);
  expect(out).toMatch(/✓ AGENTS\.md standards synced \(\d+\/\d+\)/);
  expect(out).toContain('nothing found');
}, 180000);
