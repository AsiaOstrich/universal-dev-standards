/**
 * E2E: `uds check` in Traditional Chinese prints its section headings in Chinese, and the product name is
 * "Development", not "Documentation" (dev-platform #302, seen on a Windows adopter machine with 6.16.0-beta.3).
 *
 * Four headings had no message key and printed in English in every language, and the check / update titles said
 * "Universal Documentation Standards" (通用文件標準) in all three languages.
 *
 * Wire that makes this red when cut: the zh-tw `skillsIntegrityCheck` entry in cli/src/i18n/messages.js.
 */

import { it, expect, afterAll } from 'vitest';
import { createHarness } from '../utils/staged-cli-harness.js';

const h = createHarness('issue302-headings');
afterAll(() => h.cleanup());

it('uds check in zh-TW prints translated headings and the right product name (#302)', async () => {
  const dir = await h.newProject();
  const zh = await h.runCli(['check', '--offline'], dir, { ui: 'zh-tw' });
  const out = zh.stdout + zh.stderr;
  expect(out).toContain('通用開發標準 - 檢查');
  expect(out).toContain('Skills 檔案完整性');
  expect(out).not.toContain('Skills File Integrity');
  expect(out).not.toContain('通用文件標準');
  expect(out).not.toMatch(/Total: \d+ standards/);

  const en = await h.runCli(['check', '--offline'], dir, { ui: 'en' });
  expect(en.stdout).toContain('Universal Development Standards - Check');
  expect(en.stdout).not.toContain('Universal Documentation Standards');
}, 180000);
