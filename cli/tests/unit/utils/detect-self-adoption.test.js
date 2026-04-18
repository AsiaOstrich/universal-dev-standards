/**
 * Unit tests for detect-self-adoption utility.
 * Covers DEC-044 / XSPEC-071 self-adoption detection heuristics.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import {
  detectSelfAdoption,
  detectSelfAdoptionDetailed,
  formatSelfAdoptionRefuseMessage,
  formatSelfAdoptionForceWarning,
  guardAgainstSelfAdoption
} from '../../../src/utils/detect-self-adoption.js';

/**
 * Create an isolated temp directory for each test so we can synthesize
 * different combinations of marker files without polluting the real repo.
 */
function makeTempDir(label) {
  const dir = join(
    tmpdir(),
    `uds-self-adoption-${label}-${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  );
  mkdirSync(dir, { recursive: true });
  return dir;
}

function cleanup(dir) {
  if (dir && existsSync(dir)) {
    rmSync(dir, { recursive: true, force: true });
  }
}

describe('detectSelfAdoption', () => {
  let tempDir;

  afterEach(() => {
    cleanup(tempDir);
    tempDir = null;
  });

  it('returns false for a generic project directory (no UDS markers)', () => {
    tempDir = makeTempDir('generic');
    // Simulate a typical adopter project layout (no UDS source markers).
    writeFileSync(join(tempDir, 'package.json'), JSON.stringify({ name: 'my-app' }));
    expect(detectSelfAdoption(tempDir)).toBe(false);
  });

  it('returns true when uds-manifest.json has project === "Universal Development Standards"', () => {
    tempDir = makeTempDir('manifest-match');
    writeFileSync(
      join(tempDir, 'uds-manifest.json'),
      JSON.stringify({ project: 'Universal Development Standards', version: '5.1.0-beta.7' })
    );
    expect(detectSelfAdoption(tempDir)).toBe(true);
  });

  it('returns false when uds-manifest.json exists but project field differs (adopter project)', () => {
    tempDir = makeTempDir('manifest-adopter');
    // Adopter manifests have different `project` values (e.g. their own name).
    writeFileSync(
      join(tempDir, 'uds-manifest.json'),
      JSON.stringify({ project: 'dev-autopilot', version: '5.1.0-beta.7' })
    );
    expect(detectSelfAdoption(tempDir)).toBe(false);
  });

  it('returns true when cli/package.json name === "universal-dev-standards"', () => {
    tempDir = makeTempDir('cli-pkg-match');
    mkdirSync(join(tempDir, 'cli'), { recursive: true });
    writeFileSync(
      join(tempDir, 'cli', 'package.json'),
      JSON.stringify({ name: 'universal-dev-standards', version: '5.1.0-beta.7' })
    );
    expect(detectSelfAdoption(tempDir)).toBe(true);
  });

  it('returns false when cli/package.json has a different name (fork or lookalike)', () => {
    tempDir = makeTempDir('cli-pkg-fork');
    mkdirSync(join(tempDir, 'cli'), { recursive: true });
    writeFileSync(
      join(tempDir, 'cli', 'package.json'),
      JSON.stringify({ name: 'my-universal-dev-standards-fork', version: '0.1.0' })
    );
    expect(detectSelfAdoption(tempDir)).toBe(false);
  });

  it('returns true when .uds-source-repo marker file exists', () => {
    tempDir = makeTempDir('marker');
    writeFileSync(join(tempDir, '.uds-source-repo'), '# marker');
    expect(detectSelfAdoption(tempDir)).toBe(true);
  });

  it('is tolerant of malformed uds-manifest.json (treats as no match)', () => {
    tempDir = makeTempDir('malformed-manifest');
    writeFileSync(join(tempDir, 'uds-manifest.json'), '{ not-json');
    expect(detectSelfAdoption(tempDir)).toBe(false);
  });

  it('reports all matched signals in detailed result', () => {
    tempDir = makeTempDir('all-signals');
    writeFileSync(
      join(tempDir, 'uds-manifest.json'),
      JSON.stringify({ project: 'Universal Development Standards' })
    );
    mkdirSync(join(tempDir, 'cli'), { recursive: true });
    writeFileSync(
      join(tempDir, 'cli', 'package.json'),
      JSON.stringify({ name: 'universal-dev-standards' })
    );
    writeFileSync(join(tempDir, '.uds-source-repo'), '');
    const result = detectSelfAdoptionDetailed(tempDir);
    expect(result.isSelfAdoption).toBe(true);
    expect(result.signals).toEqual([
      'uds-manifest.json',
      'cli/package.json',
      '.uds-source-repo'
    ]);
  });

  it('returns empty signals for non-matching directory', () => {
    tempDir = makeTempDir('non-match');
    const result = detectSelfAdoptionDetailed(tempDir);
    expect(result.isSelfAdoption).toBe(false);
    expect(result.signals).toEqual([]);
  });
});

describe('formatSelfAdoptionRefuseMessage', () => {
  it('includes the command name, DEC-044 reference, and bilingual content', () => {
    const lines = formatSelfAdoptionRefuseMessage('update');
    const joined = lines.join('\n');
    expect(joined).toContain('uds update');
    expect(joined).toContain('DEC-044');
    expect(joined).toContain('偵測到 UDS source repo');
    expect(joined).toContain('Detected UDS source repo');
  });
});

describe('formatSelfAdoptionForceWarning', () => {
  it('mentions --force and the command name', () => {
    const lines = formatSelfAdoptionForceWarning('check');
    const joined = lines.join('\n');
    expect(joined).toContain('--force');
    expect(joined).toContain('uds check');
  });
});

describe('guardAgainstSelfAdoption', () => {
  let tempDir;
  let exitSpy;
  let errorSpy;
  let warnSpy;

  beforeEach(() => {
    // Stub process.exit so tests don't actually kill the Vitest worker.
    exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => undefined);
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    exitSpy.mockRestore();
    errorSpy.mockRestore();
    warnSpy.mockRestore();
    cleanup(tempDir);
    tempDir = null;
  });

  it('returns true (proceeds) when cwd is not UDS source repo', () => {
    tempDir = makeTempDir('guard-non-match');
    const result = guardAgainstSelfAdoption('update', {}, tempDir);
    expect(result).toBe(true);
    expect(exitSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('refuses (calls process.exit(1)) when self-adoption detected and no --force', () => {
    tempDir = makeTempDir('guard-refuse');
    writeFileSync(join(tempDir, '.uds-source-repo'), '');
    guardAgainstSelfAdoption('update', {}, tempDir);
    expect(exitSpy).toHaveBeenCalledWith(1);
    // Verify a refuse message was emitted to stderr
    const errorCalls = errorSpy.mock.calls.flat().join('\n');
    expect(errorCalls).toContain('DEC-044');
  });

  it('bypasses with a warning when --force is passed', () => {
    tempDir = makeTempDir('guard-force');
    writeFileSync(join(tempDir, '.uds-source-repo'), '');
    const result = guardAgainstSelfAdoption('update', { force: true }, tempDir);
    expect(result).toBe(true);
    expect(exitSpy).not.toHaveBeenCalled();
    const warnCalls = warnSpy.mock.calls.flat().join('\n');
    expect(warnCalls).toContain('--force');
  });
});
