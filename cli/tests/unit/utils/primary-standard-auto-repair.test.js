/**
 * XSPEC adopter-report — narrow auto-repair of a primary standard reference
 * deleted by the 6.10.0 `resolveStandardReferences` bug (user decision 1,
 * 2026-09-18).
 *
 * Real-world reproduction (`q14/proj/AGENTS.md`): the "## 提交訊息標準"
 * section — a UDS rule-template section, living outside the UDS markers —
 * originally read
 *   參考: .standards/commit-message-guide.md, .standards/options/traditional-chinese.ai.yaml
 * 6.10.0's resolveStandardReferences treated the old filename as a retired,
 * uninstalled UDS standard and deleted it, leaving
 *   參考:, .standards/options/traditional-chinese.ai.yaml
 * The Q2 fix (STANDARD_ID_MAPPING + comma rewrite) stops this deletion from
 * happening on FRESH content and cleans up the dangling comma on an already
 * damaged file — but it cannot bring back an item that is already gone from
 * an EXISTING file's line, because this whole section sits outside the UDS
 * markers and nothing else ever regenerates it.
 *
 * Scope is deliberately narrow — every one of these must hold before a
 * primary standard is restored:
 *   1. The line's heading matches a RULE_TEMPLATES heading EXACTLY (any
 *      language RULE_TEMPLATES ships — today that is 'en' and 'zh-tw').
 *   2. That template's PRIMARY standard (the first `.standards/...` item on
 *      its own Reference:/參考: line) is missing from the file's line.
 *   3. The primary standard is genuinely installed.
 * Never: rewriting the whole line, restoring a SECONDARY template item,
 * touching a section whose heading does not match, or adding anything when
 * the primary standard was never installed.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mkdirSync, rmSync, writeFileSync, readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { writeIntegrationFile } from '../../../src/utils/integration-generator.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEST_DIR = join(__dirname, '../../temp/primary-standard-auto-repair');

function setup(claudeMdBody, { installCommitMessage = true, installAntiHallucination = false } = {}) {
  rmSync(TEST_DIR, { recursive: true, force: true });
  mkdirSync(join(TEST_DIR, '.standards/options'), { recursive: true });
  if (installCommitMessage) {
    writeFileSync(join(TEST_DIR, '.standards/commit-message.ai.yaml'), 'id: commit-message\n');
  }
  if (installAntiHallucination) {
    writeFileSync(join(TEST_DIR, '.standards/anti-hallucination.ai.yaml'), 'id: anti-hallucination\n');
  }
  writeFileSync(join(TEST_DIR, '.standards/options/traditional-chinese.ai.yaml'), 'id: traditional-chinese\n');
  writeFileSync(join(TEST_DIR, 'CLAUDE.md'), claudeMdBody);
}

function config({ installCommitMessage = true, installAntiHallucination = false } = {}) {
  const standards = [];
  if (installCommitMessage) standards.push('commit-message');
  if (installAntiHallucination) standards.push('anti-hallucination');
  return {
    categories: ['anti-hallucination'],
    installedStandards: standards,
    contentMode: 'index',
    language: 'en',
    standardsFormat: 'ai',
    outputLanguage: 'english'
  };
}

function referenceLine(content, needle) {
  return content.split('\n').find((l) => l.startsWith('Reference:') || l.startsWith('參考:'));
}

describe('narrow auto-repair of a UDS rule-template primary reference', () => {
  afterEach(() => rmSync(TEST_DIR, { recursive: true, force: true }));

  it('reproduces q14/proj: restores the primary standard to the front, keeps the options item, no dangling comma', () => {
    setup([
      '# Project Guidelines',
      '',
      '## 提交訊息標準',
      '參考:, .standards/options/traditional-chinese.ai.yaml',
      '',
      '### 格式',
      '```',
      '<type>(<scope>): <subject>',
      '```',
      ''
    ].join('\n'));

    const result = writeIntegrationFile('claude-code', config(), TEST_DIR);
    expect(result.success).toBe(true);

    const content = readFileSync(join(TEST_DIR, 'CLAUDE.md'), 'utf-8');
    const line = referenceLine(content);
    expect(line).toBe('參考: .standards/commit-message.ai.yaml, .standards/options/traditional-chinese.ai.yaml');
  });

  it('does not touch a user-authored section whose heading does not match any template', () => {
    setup([
      '# Project Guidelines',
      '',
      '## My Own Commit Rules',
      '參考: .standards/options/traditional-chinese.ai.yaml',
      ''
    ].join('\n'));

    writeIntegrationFile('claude-code', config(), TEST_DIR);
    const content = readFileSync(join(TEST_DIR, 'CLAUDE.md'), 'utf-8');
    const line = content.split('\n').find((l) => l.includes('options/traditional-chinese'));

    expect(line).toBe('參考: .standards/options/traditional-chinese.ai.yaml');
    expect(line).not.toContain('commit-message');
  });

  it('does not restore the primary standard when it is not actually installed', () => {
    setup([
      '# Project Guidelines',
      '',
      '## 提交訊息標準',
      '參考: .standards/options/traditional-chinese.ai.yaml',
      ''
    ].join('\n'), { installCommitMessage: false });

    writeIntegrationFile('claude-code', config({ installCommitMessage: false }), TEST_DIR);
    const content = readFileSync(join(TEST_DIR, 'CLAUDE.md'), 'utf-8');
    const line = referenceLine(content);

    expect(line).toBe('參考: .standards/options/traditional-chinese.ai.yaml');
    expect(line).not.toContain('commit-message');
  });

  it('is idempotent: a line that already has the primary standard is left byte-identical, twice in a row', () => {
    setup([
      '# Project Guidelines',
      '',
      '## 提交訊息標準',
      '參考: .standards/commit-message.ai.yaml, .standards/options/traditional-chinese.ai.yaml',
      ''
    ].join('\n'));

    writeIntegrationFile('claude-code', config(), TEST_DIR);
    const first = referenceLine(readFileSync(join(TEST_DIR, 'CLAUDE.md'), 'utf-8'));
    writeIntegrationFile('claude-code', config(), TEST_DIR);
    const second = referenceLine(readFileSync(join(TEST_DIR, 'CLAUDE.md'), 'utf-8'));

    expect(first).toBe('參考: .standards/commit-message.ai.yaml, .standards/options/traditional-chinese.ai.yaml');
    expect(second).toBe(first);
  });

  it('repairs an English-heading template section too (anti-hallucination, "standard" detail level)', () => {
    setup([
      '# Project Guidelines',
      '',
      '## Anti-Hallucination Protocol',
      'Reference: .standards/options/traditional-chinese.ai.yaml',
      ''
    ].join('\n'), { installCommitMessage: false, installAntiHallucination: true });

    writeIntegrationFile(
      'claude-code',
      { ...config({ installCommitMessage: false, installAntiHallucination: true }) },
      TEST_DIR
    );
    const content = readFileSync(join(TEST_DIR, 'CLAUDE.md'), 'utf-8');
    const line = content.split('\n').find((l) => l.startsWith('Reference:'));

    expect(line).toBe('Reference: .standards/anti-hallucination.ai.yaml, .standards/options/traditional-chinese.ai.yaml');
  });

  it('repairs a zh-tw-heading template section for a second category too (code-review -> checkin-standards)', () => {
    rmSync(TEST_DIR, { recursive: true, force: true });
    mkdirSync(join(TEST_DIR, '.standards/options'), { recursive: true });
    writeFileSync(join(TEST_DIR, '.standards/checkin-standards.ai.yaml'), 'id: checkin-standards\n');
    writeFileSync(join(TEST_DIR, '.standards/options/traditional-chinese.ai.yaml'), 'id: traditional-chinese\n');
    writeFileSync(join(TEST_DIR, 'CLAUDE.md'), [
      '# Project Guidelines',
      '',
      '## 程式碼審查清單', // RULE_TEMPLATES['code-review'].standard['zh-tw']'s actual heading
      '參考: .standards/options/traditional-chinese.ai.yaml',
      ''
    ].join('\n'));

    writeIntegrationFile(
      'claude-code',
      { categories: [], installedStandards: ['checkin-standards'], contentMode: 'index', language: 'en', standardsFormat: 'ai', outputLanguage: 'english' },
      TEST_DIR
    );
    const content = readFileSync(join(TEST_DIR, 'CLAUDE.md'), 'utf-8');
    const line = content.split('\n').find((l) => l.startsWith('參考:'));

    expect(line).toBe('參考: .standards/checkin-standards.ai.yaml, .standards/options/traditional-chinese.ai.yaml');
  });
});
