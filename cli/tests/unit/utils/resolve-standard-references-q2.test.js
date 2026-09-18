/**
 * XSPEC adopter-report Q2 — resolveStandardReferences (integration-generator.js)
 * regressed when P2's dead-link fix landed in 6.10.0.
 *
 * Two separate defects, both inside the same function:
 *
 * 1. It compared a reference's stem only against the manifest's INSTALLED
 *    list, never against the legacy pre-6.0.0 filename → current-id mapping
 *    (STANDARD_ID_MAPPING, conversion-rules.js) that yaml-generator.js
 *    already uses elsewhere. A reference written against the old name
 *    (`commit-message-guide.md`) looked exactly like a retired, UDS-owned
 *    standard the project chose not to install, and got DELETED instead of
 *    rewritten to the installed one (`commit-message.ai.yaml`).
 *
 * 2. After deleting the first item on a "Reference:" line, the comma cleanup
 *    only handled a trailing comma, a doubled comma, or space-before-comma —
 *    not a comma left dangling right after the colon. Dropping the first of
 *    two references produced `參考:, .standards/other.ai.yaml`.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, rmSync, writeFileSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { writeIntegrationFile } from '../../../src/utils/integration-generator.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEST_DIR = join(__dirname, '../../temp/resolve-standard-references-q2');

const config = {
  categories: ['anti-hallucination'],
  installedStandards: ['anti-hallucination', 'commit-message'],
  contentMode: 'index',
  language: 'en',
  standardsFormat: 'ai',
  outputLanguage: 'english'
};

function setup(claudeMdBody) {
  rmSync(TEST_DIR, { recursive: true, force: true });
  mkdirSync(join(TEST_DIR, '.standards/options'), { recursive: true });
  writeFileSync(join(TEST_DIR, '.standards/anti-hallucination.ai.yaml'), 'id: anti-hallucination\n');
  writeFileSync(join(TEST_DIR, '.standards/commit-message.ai.yaml'), 'id: commit-message\n');
  writeFileSync(join(TEST_DIR, '.standards/options/traditional-chinese.ai.yaml'), 'id: traditional-chinese\n');
  writeFileSync(join(TEST_DIR, 'CLAUDE.md'), claudeMdBody);
}

describe('resolveStandardReferences — legacy filename mapping and comma cleanup (Q2)', () => {
  afterEach(() => rmSync(TEST_DIR, { recursive: true, force: true }));

  it('rewrites the exact reported line: legacy name first, an option second, no dangling comma', () => {
    setup([
      '# Project Guidelines',
      '',
      'Reference: .standards/commit-message-guide.md, .standards/options/traditional-chinese.ai.yaml',
      ''
    ].join('\n'));

    writeIntegrationFile('claude-code', config, TEST_DIR);
    const content = readFileSync(join(TEST_DIR, 'CLAUDE.md'), 'utf-8');
    const line = content.split('\n').find((l) => l.startsWith('Reference:'));

    expect(line).toBe(
      'Reference: .standards/commit-message.ai.yaml, .standards/options/traditional-chinese.ai.yaml'
    );
  });

  it('drops the first of three references without leaving a leading comma', () => {
    setup([
      '# Project Guidelines',
      '',
      'Reference: .standards/checkin-standards.md, .standards/anti-hallucination.md, .standards/commit-message-guide.md',
      ''
    ].join('\n'));

    writeIntegrationFile('claude-code', config, TEST_DIR);
    const content = readFileSync(join(TEST_DIR, 'CLAUDE.md'), 'utf-8');
    const line = content.split('\n').find((l) => l.startsWith('Reference:'));

    expect(line).not.toMatch(/Reference:,/);
    expect(line).not.toContain('checkin-standards');
    expect(line).toBe(
      'Reference: .standards/anti-hallucination.ai.yaml, .standards/commit-message.ai.yaml'
    );
  });

  it('drops the middle of three references without a doubled comma', () => {
    setup([
      '# Project Guidelines',
      '',
      'Reference: .standards/anti-hallucination.md, .standards/checkin-standards.md, .standards/commit-message-guide.md',
      ''
    ].join('\n'));

    writeIntegrationFile('claude-code', config, TEST_DIR);
    const content = readFileSync(join(TEST_DIR, 'CLAUDE.md'), 'utf-8');
    const line = content.split('\n').find((l) => l.startsWith('Reference:'));

    expect(line).not.toMatch(/,\s*,/);
    expect(line).not.toContain('checkin-standards');
    expect(line).toBe(
      'Reference: .standards/anti-hallucination.ai.yaml, .standards/commit-message.ai.yaml'
    );
  });

  it('drops the last of three references without a trailing comma', () => {
    setup([
      '# Project Guidelines',
      '',
      'Reference: .standards/anti-hallucination.md, .standards/commit-message-guide.md, .standards/checkin-standards.md',
      ''
    ].join('\n'));

    writeIntegrationFile('claude-code', config, TEST_DIR);
    const content = readFileSync(join(TEST_DIR, 'CLAUDE.md'), 'utf-8');
    const line = content.split('\n').find((l) => l.startsWith('Reference:'));

    expect(line).not.toMatch(/,\s*$/);
    expect(line).not.toContain('checkin-standards');
    expect(line).toBe(
      'Reference: .standards/anti-hallucination.ai.yaml, .standards/commit-message.ai.yaml'
    );
  });

  it('still keeps a reference the project added to a file of its own (regression guard)', () => {
    setup([
      '# Project Guidelines',
      '',
      'Reference: .standards/our-house-rule.md, .standards/anti-hallucination.md',
      ''
    ].join('\n'));
    writeFileSync(join(TEST_DIR, '.standards/our-house-rule.md'), 'house rule\n');

    writeIntegrationFile('claude-code', config, TEST_DIR);
    const content = readFileSync(join(TEST_DIR, 'CLAUDE.md'), 'utf-8');
    const line = content.split('\n').find((l) => l.startsWith('Reference:'));

    expect(line).toContain('.standards/our-house-rule.md');
    expect(line).toContain('.standards/anti-hallucination.ai.yaml');
  });
});
