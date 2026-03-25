/**
 * Tests for SPEC-RELEASE-01: Release Command (CLI Integration)
 * Tests the releaseCommand entry point and subcommand routing.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fs
vi.mock('fs', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    existsSync: vi.fn(() => false),
    readFileSync: vi.fn(() => '{}'),
    writeFileSync: vi.fn(),
  };
});

// Mock child_process
vi.mock('child_process', () => ({
  execSync: vi.fn((cmd) => {
    if (cmd.includes('user.name')) return 'test-user\n';
    if (cmd.includes('rev-parse --short')) return 'abc1234\n';
    if (cmd.includes('abbrev-ref')) return 'release/1.2.0\n';
    return '';
  }),
}));

// Mock js-yaml
vi.mock('js-yaml', () => ({
  default: {
    load: vi.fn((str) => JSON.parse(str)),
    dump: vi.fn((obj) => JSON.stringify(obj)),
  },
}));

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { releaseCommand } from '../../src/commands/release.js';

describe('Release Command', () => {
  let consoleLogs;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleLogs = [];
    vi.spyOn(console, 'log').mockImplementation((...args) => {
      consoleLogs.push(args.join(' '));
    });
    // Default: no release-config.yaml (ci-cd mode)
    existsSync.mockReturnValue(false);
  });

  // ============================================================
  // Mode-aware routing
  // ============================================================

  describe('Mode-aware routing', () => {
    it('should show help with ci-cd mode when no config exists', async () => {
      await releaseCommand(undefined, undefined, {});

      const output = consoleLogs.join('\n');
      expect(output).toContain('ci-cd');
    });

    it('should block promote in ci-cd mode', async () => {
      await releaseCommand('promote', '1.2.0', {});

      const output = consoleLogs.join('\n');
      expect(output).toContain('manual');
      expect(output).toContain('hybrid');
    });

    it('should block deploy in ci-cd mode', async () => {
      await releaseCommand('deploy', 'staging', {});

      const output = consoleLogs.join('\n');
      expect(output).toContain('manual');
    });

    it('should block manifest in ci-cd mode', async () => {
      await releaseCommand('manifest', null, {});

      const output = consoleLogs.join('\n');
      expect(output).toContain('manual');
    });

    it('should block verify in ci-cd mode', async () => {
      await releaseCommand('verify', null, {});

      const output = consoleLogs.join('\n');
      expect(output).toContain('manual');
    });
  });

  // ============================================================
  // Manual mode — promote
  // ============================================================

  describe('promote (manual mode)', () => {
    beforeEach(() => {
      // Mock release-config.yaml exists with manual mode
      existsSync.mockImplementation((path) => {
        if (path.includes('release-config.yaml')) return true;
        return false;
      });
      readFileSync.mockImplementation((path) => {
        if (path.includes('release-config.yaml')) {
          return JSON.stringify({ release: { mode: 'manual' } });
        }
        if (path.includes('package.json')) {
          return JSON.stringify({ version: '1.2.0-rc.2' });
        }
        return '{}';
      });
    });

    it('should show promotion plan', async () => {
      await releaseCommand('promote', '1.2.0', {});

      const output = consoleLogs.join('\n');
      expect(output).toContain('1.2.0');
      expect(output).toContain('v1.2.0');
    });

    it('should reject version with pre-release suffix', async () => {
      await releaseCommand('promote', '1.2.0-rc.2', {});

      const output = consoleLogs.join('\n');
      expect(output).toContain('pre-release');
    });

    it('should require version argument', async () => {
      await releaseCommand('promote', undefined, {});

      const output = consoleLogs.join('\n');
      expect(output).toContain('版本號');
    });
  });

  // ============================================================
  // Manual mode — deploy
  // ============================================================

  describe('deploy (manual mode)', () => {
    beforeEach(() => {
      existsSync.mockImplementation((path) => {
        if (path.includes('release-config.yaml')) return true;
        if (path.includes('package.json')) return true;
        return false;
      });
      readFileSync.mockImplementation((path) => {
        if (path.includes('release-config.yaml')) {
          return JSON.stringify({ release: { mode: 'manual' } });
        }
        if (path.includes('package.json')) {
          return JSON.stringify({ version: '1.2.0-rc.1' });
        }
        return '{}';
      });
    });

    it('should record staging deployment', async () => {
      await releaseCommand('deploy', 'staging', {});

      expect(writeFileSync).toHaveBeenCalled();
      const output = consoleLogs.join('\n');
      expect(output).toContain('staging');
      expect(output).toContain('1.2.0-rc.1');
    });

    it('should update result with --result flag', async () => {
      // Mock existing deployments
      existsSync.mockImplementation((path) => {
        if (path.includes('release-config.yaml')) return true;
        if (path.includes('deployments.yaml')) return true;
        if (path.includes('package.json')) return true;
        return false;
      });
      readFileSync.mockImplementation((path) => {
        if (path.includes('release-config.yaml')) {
          return JSON.stringify({ release: { mode: 'manual' } });
        }
        if (path.includes('deployments.yaml')) {
          return JSON.stringify({
            deployments: [{ version: '1.2.0-rc.1', environment: 'staging', result: null }]
          });
        }
        if (path.includes('package.json')) {
          return JSON.stringify({ version: '1.2.0-rc.1' });
        }
        return '{}';
      });

      await releaseCommand('deploy', 'staging', { result: 'passed' });

      expect(writeFileSync).toHaveBeenCalled();
      const output = consoleLogs.join('\n');
      expect(output).toContain('passed');
    });

    it('should warn on production deploy without staging pass', async () => {
      await releaseCommand('deploy', 'production', {});

      const output = consoleLogs.join('\n');
      expect(output).toContain('staging');
    });

    it('should require environment argument', async () => {
      await releaseCommand('deploy', undefined, {});

      const output = consoleLogs.join('\n');
      expect(output).toContain('環境');
    });
  });

  // ============================================================
  // Manual mode — manifest
  // ============================================================

  describe('manifest (manual mode)', () => {
    beforeEach(() => {
      existsSync.mockImplementation((path) => {
        if (path.includes('release-config.yaml')) return true;
        if (path.includes('package.json')) return true;
        return false;
      });
      readFileSync.mockImplementation((path) => {
        if (path.includes('release-config.yaml')) {
          return JSON.stringify({ release: { mode: 'manual' } });
        }
        if (path.includes('package.json')) {
          return JSON.stringify({ version: '1.2.0-rc.1' });
        }
        return '{}';
      });
    });

    it('should generate build-manifest.json', async () => {
      await releaseCommand('manifest', null, {});

      expect(writeFileSync).toHaveBeenCalled();
      const writeCall = writeFileSync.mock.calls[0];
      expect(writeCall[0]).toContain('build-manifest.json');

      const manifest = JSON.parse(writeCall[1]);
      expect(manifest.version).toBe('1.2.0-rc.1');
      expect(manifest.commit).toBe('abc1234');
      expect(manifest.builder).toBe('test-user');
    });

    it('should include custom checksum when provided', async () => {
      await releaseCommand('manifest', null, { checksum: 'sha256:custom' });

      const writeCall = writeFileSync.mock.calls[0];
      const manifest = JSON.parse(writeCall[1]);
      expect(manifest.checksum.package).toBe('sha256:custom');
    });
  });

  // ============================================================
  // Manual mode — verify
  // ============================================================

  describe('verify (manual mode)', () => {
    it('should pass when commit matches', async () => {
      existsSync.mockImplementation((path) => {
        if (path.includes('release-config.yaml')) return true;
        if (path.includes('build-manifest.json')) return true;
        return false;
      });
      readFileSync.mockImplementation((path) => {
        if (path.includes('release-config.yaml')) {
          return JSON.stringify({ release: { mode: 'manual' } });
        }
        if (path.includes('build-manifest.json')) {
          return JSON.stringify({ version: '1.2.0', commit: 'abc1234' });
        }
        return '{}';
      });

      await releaseCommand('verify', null, {});

      const output = consoleLogs.join('\n');
      expect(output).toContain('通過');
    });

    it('should fail when commit does not match', async () => {
      existsSync.mockImplementation((path) => {
        if (path.includes('release-config.yaml')) return true;
        if (path.includes('build-manifest.json')) return true;
        return false;
      });
      readFileSync.mockImplementation((path) => {
        if (path.includes('release-config.yaml')) {
          return JSON.stringify({ release: { mode: 'manual' } });
        }
        if (path.includes('build-manifest.json')) {
          return JSON.stringify({ version: '1.2.0', commit: 'different' });
        }
        return '{}';
      });

      await releaseCommand('verify', null, {});

      const output = consoleLogs.join('\n');
      expect(output).toContain('失敗');
    });

    it('should report missing manifest', async () => {
      existsSync.mockImplementation((path) => {
        if (path.includes('release-config.yaml')) return true;
        return false;
      });

      await releaseCommand('verify', null, {});

      const output = consoleLogs.join('\n');
      expect(output).toContain('build-manifest.json');
    });
  });
});
