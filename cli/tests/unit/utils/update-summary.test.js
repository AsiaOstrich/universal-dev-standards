/**
 * XSPEC-454 R4 — the tool count and the command count are different numbers.
 */

import { describe, it, expect } from 'vitest';
import { commandsUpdatedMessage } from '../../../src/utils/update-summary.js';
import { setLanguage, t } from '../../../src/i18n/messages.js';

const where = 'OpenCode (project): .opencode/command/';

describe('commandsUpdatedMessage', () => {
  it.each([
    ['en', 'Updated 51 commands for 1 AI tool(s): ' + where],
    ['zh-tw', '已為 1 個 AI 工具更新 51 個斜線命令：' + where],
    ['zh-cn', '已为 1 个 AI 工具更新 51 个斜线命令：' + where]
  ])('says 1 tool and 51 commands in %s', (lang, expected) => {
    setLanguage(lang);
    const msg = t().commands.update;
    expect(commandsUpdatedMessage(msg, [{ agent: 'opencode', level: 'project' }], { totalInstalled: 51 }, where)).toBe(expected);
  });

  it('counts a tool once however many levels it is installed at, and accepts plain agent names', () => {
    setLanguage('en');
    const msg = t().commands.update;
    const s = commandsUpdatedMessage(msg, ['opencode', { agent: 'opencode', level: 'user' }, 'codex'], { totalInstalled: 102 }, 'x');
    expect(s).toBe('Updated 102 commands for 2 AI tool(s): x');
  });

  it('never reuses the "N AI tools" wording for a command count (the old key still counts tools)', () => {
    for (const lang of ['en', 'zh-tw', 'zh-cn']) {
      setLanguage(lang);
      const update = t().commands.update;
      expect(update.commandsUpdatedCounts, lang).toMatch(/\{tools\}/);
      expect(update.commandsUpdatedCounts, lang).toMatch(/\{commands\}/);
      expect(update.commandsUpdated, lang).toMatch(/\{count\}/);
    }
    setLanguage('en');
  });
});
