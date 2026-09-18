/**
 * XSPEC adopter-report Q5 — `uds check --restore` (via `restoreSingleFile`)
 * is one of the four write paths that locate the UDS marker block before
 * replacing it. Before the fix, a sentence merely mentioning the marker text
 * (e.g. this project's own CLAUDE.md, which explains the marker syntax by
 * quoting it) was mistaken for the real boundary, and everything between the
 * mention and the real END marker — including the adopter's own content —
 * was deleted. A file with two genuine marker pairs must be refused rather
 * than guessed at.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdirSync, rmSync, writeFileSync, readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import { restoreSingleFile } from '../../../src/commands/check.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEST_DIR = join(__dirname, '../../temp/check-restore-marker-q5');

const START = '<!-- UDS:STANDARDS:START -->';
const END = '<!-- UDS:STANDARDS:END -->';

function manifestFor(relativePath) {
  return {
    standards: ['commit-message'],
    integrationConfigs: {
      [relativePath]: {
        tool: 'claude-code',
        categories: [],
        installedStandards: ['.standards/commit-message.ai.yaml']
      }
    }
  };
}

describe('restoreSingleFile — marker location (Q5)', () => {
  beforeEach(() => {
    if (existsSync(TEST_DIR)) rmSync(TEST_DIR, { recursive: true, force: true });
    mkdirSync(TEST_DIR, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(TEST_DIR)) rmSync(TEST_DIR, { recursive: true, force: true });
  });

  it('preserves user content sitting between a prose mention of the marker and the real block', async () => {
    const relativePath = 'CLAUDE.md';
    const filePath = join(TEST_DIR, relativePath);
    const content = [
      `那段文字提到 \`${START}\` 這個標記的用途，不是真正的區塊邊界。`,
      '',
      'user content that must survive a restore',
      '',
      START,
      'stale content to be restored',
      END,
      '',
      '## user section after the block',
      'more user content'
    ].join('\n');
    writeFileSync(filePath, content);

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const ok = await restoreSingleFile(TEST_DIR, manifestFor(relativePath), relativePath, {});
    logSpy.mockRestore();

    expect(ok).toBe(true);
    const written = readFileSync(filePath, 'utf-8');
    expect(written).toContain('那段文字提到');
    expect(written).toContain('user content that must survive a restore');
    expect(written).toContain('## user section after the block');
    expect(written).toContain('more user content');
  });

  it('refuses to restore (rather than guess) a file with two real marker pairs, and reports both lines', async () => {
    const relativePath = 'CLAUDE.md';
    const filePath = join(TEST_DIR, relativePath);
    const content = [START, 'first', END, 'gap', START, 'second', END].join('\n');
    writeFileSync(filePath, content);
    const before = readFileSync(filePath, 'utf-8');

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const ok = await restoreSingleFile(TEST_DIR, manifestFor(relativePath), relativePath, {});
    const loggedText = logSpy.mock.calls.map((c) => c.join(' ')).join('\n');
    logSpy.mockRestore();

    expect(ok).toBe(false);
    // Refused to write — file on disk is untouched.
    expect(readFileSync(filePath, 'utf-8')).toBe(before);
    expect(loggedText).toMatch(/Found 2 standalone occurrences/);
    expect(loggedText).toMatch(/line\(s\) 1, 5/);
  });
});
