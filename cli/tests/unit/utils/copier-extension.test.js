// XSPEC-452 R2 — extension files come from the installed package only; they are never downloaded.
// Other files keep their existing GitHub fallback (XSPEC-452 AC-3 only lists it; it is not changed here).
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, existsSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import { join, resolve } from 'path';

const download = vi.hoisted(() => vi.fn(async () => ({ success: false, error: 'GitHub returned 404', path: null })));
vi.mock('../../../src/utils/github.js', () => ({
  downloadStandard: download,
  downloadIntegration: vi.fn()
}));

import { copyExtension, copyStandard, isExtensionPath } from '../../../src/utils/copier.js';

let project;
beforeEach(() => {
  project = mkdtempSync(join(tmpdir(), 'uds-test-copier-ext-'));
  download.mockClear();
});
afterEach(() => rmSync(project, { recursive: true, force: true }));

describe('copier: extensions are package-only', () => {
  it('recognises extension paths (and only those)', () => {
    expect(isExtensionPath('extensions/locales/zh-tw.md')).toBe(true);
    expect(isExtensionPath('extensions\\locales\\zh-tw.md')).toBe(true);
    expect(isExtensionPath('core/anti-hallucination.md')).toBe(false);
    expect(isExtensionPath(undefined)).toBe(false);
  });

  it('copyExtension copies an existing extension file byte for byte', async () => {
    const r = await copyExtension('extensions/locales/zh-tw.md', '.standards', project);
    expect(r.success).toBe(true);
    const repoFile = resolve(import.meta.dirname, '../../../../extensions/locales/zh-tw.md');
    expect(readFileSync(join(project, '.standards', 'zh-tw.md')).equals(readFileSync(repoFile))).toBe(true);
    expect(download).not.toHaveBeenCalled();
  });

  it('copyExtension fails by name for a file the package does not have, without downloading', async () => {
    const r = await copyExtension('extensions/locales/nope.md', '.standards', project);
    expect(r.success).toBe(false);
    expect(r.error).toContain('extensions/locales/nope.md');
    expect(download).not.toHaveBeenCalled();
    expect(existsSync(join(project, '.standards', 'nope.md'))).toBe(false);
  });

  it('copyStandard hands extension paths to the package-only path (no download from any caller)', async () => {
    const r = await copyStandard('extensions/frameworks/nope.md', '.standards', project);
    expect(r.success).toBe(false);
    expect(r.error).toContain('extensions/frameworks/nope.md');
    expect(download).not.toHaveBeenCalled();
  });

  it('copyStandard still falls back to GitHub for a non-extension file (unchanged, listed in the XSPEC-452 AC-3 inventory)', async () => {
    await copyStandard('core/definitely-not-a-real-standard.md', '.standards', project);
    expect(download).toHaveBeenCalledTimes(1);
  });
});
