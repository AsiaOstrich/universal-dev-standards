import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock node:fs
vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  mkdirSync: vi.fn(),
  readdirSync: vi.fn(),
  unlinkSync: vi.fn(),
  renameSync: vi.fn(),
}));

// Mock config-manager
vi.mock('../../src/utils/config-manager.js', () => ({
  config: {
    get: vi.fn((key, defaultValue) => {
      if (key === 'specs.path') return 'specs';
      return defaultValue;
    }),
  },
}));

// Mock chalk to pass through
vi.mock('chalk', () => {
  const passthrough = (s) => s;
  passthrough.red = passthrough;
  passthrough.green = passthrough;
  passthrough.yellow = passthrough;
  passthrough.cyan = passthrough;
  passthrough.gray = passthrough;
  passthrough.bold = passthrough;
  return { default: passthrough };
});

// Mock i18n
vi.mock('../../src/i18n/messages.js', () => ({
  msg: vi.fn(() => null),
}));

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { specSearchCommand } from '../../src/commands/spec.js';

describe('specSearchCommand', () => {
  let consoleSpy;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    // Default: specs dir exists, archive dir exists
    existsSync.mockReturnValue(true);
    readdirSync.mockReturnValue([]);
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  // AC-2: search active + archived specs
  describe('AC-2: search active + archived specs', () => {
    it('should find matching archived specs from index.json', () => {
      // Arrange
      const archiveIndex = [
        { id: 'SPEC-001-login', title: 'Login Feature', type: 'feature', archived_at: '2026-01-01', scope: 'frontend' },
        { id: 'SPEC-002-api', title: 'API Endpoint', type: 'feature', archived_at: '2026-01-02', scope: 'backend' },
      ];
      readFileSync.mockImplementation((path) => {
        if (path.includes('index.json')) return JSON.stringify(archiveIndex);
        return '';
      });
      readdirSync.mockReturnValue([]);

      // Act
      specSearchCommand('login', {});

      // Assert
      const output = consoleSpy.mock.calls.map(c => c[0]).join('\n');
      expect(output).toContain('SPEC-001-login');
      expect(output).not.toContain('SPEC-002-api');
    });

    it('should find matching active specs', () => {
      // Arrange
      existsSync.mockImplementation((path) => {
        if (path.includes('index.json')) return false;
        return true;
      });
      readdirSync.mockReturnValue(['SPEC-003-search.md']);
      readFileSync.mockReturnValue(
        '## Micro-Spec: Search Feature\n**Status**: draft\n**Created**: 2026-01-28\n**Type**: feature\n**Spec Mode**: standard\n**Depends On**: none\n**Intent**: Add search functionality\n**Scope**: fullstack\n**Acceptance**:\n- [ ] AC-1: done\n**Confirmed**: No'
      );

      // Act
      specSearchCommand('search', {});

      // Assert
      const output = consoleSpy.mock.calls.map(c => c[0]).join('\n');
      expect(output).toContain('SPEC-003-search');
    });

    it('should find both active and archived specs', () => {
      // Arrange
      const archiveIndex = [
        { id: 'SPEC-001-auth', title: 'Auth Module', type: 'feature', archived_at: '2026-01-01', scope: 'backend' },
      ];
      existsSync.mockReturnValue(true);
      readdirSync.mockReturnValue(['SPEC-005-auth-v2.md']);
      readFileSync.mockImplementation((path) => {
        if (path.includes('index.json')) return JSON.stringify(archiveIndex);
        return '## Micro-Spec: Auth V2\n**Status**: draft\n**Created**: 2026-02-01\n**Type**: feature\n**Spec Mode**: standard\n**Depends On**: none\n**Intent**: Auth version 2\n**Scope**: backend\n**Acceptance**:\n- [ ] AC-1: done\n**Confirmed**: No';
      });

      // Act
      specSearchCommand('auth', {});

      // Assert
      const output = consoleSpy.mock.calls.map(c => c[0]).join('\n');
      expect(output).toContain('SPEC-001-auth');
      expect(output).toContain('SPEC-005-auth-v2');
      expect(output).toContain('2'); // Found 2 spec(s)
    });

    it('should show "no specs found" when no match', () => {
      // Arrange
      existsSync.mockImplementation((path) => {
        if (path.includes('index.json')) return false;
        return true;
      });
      readdirSync.mockReturnValue([]);

      // Act
      specSearchCommand('nonexistent', {});

      // Assert
      const output = consoleSpy.mock.calls.map(c => c[0]).join('\n');
      expect(output).toContain('No specs found');
    });
  });

  // AC-3: --archived flag
  describe('AC-3: search --archived only', () => {
    it('should only search archived specs when --archived flag is set', () => {
      // Arrange
      const archiveIndex = [
        { id: 'SPEC-001-old', title: 'Old Feature', type: 'feature', archived_at: '2026-01-01', scope: 'general' },
      ];
      existsSync.mockReturnValue(true);
      readdirSync.mockReturnValue(['SPEC-010-active.md']);
      readFileSync.mockImplementation((path) => {
        if (path.includes('index.json')) return JSON.stringify(archiveIndex);
        return '## Micro-Spec: Active Feature\n**Status**: draft\n**Created**: 2026-02-01\n**Type**: feature\n**Spec Mode**: standard\n**Depends On**: none\n**Intent**: Active feature\n**Scope**: general\n**Acceptance**:\n- [ ] AC-1: done\n**Confirmed**: No';
      });

      // Act
      specSearchCommand('feature', { archived: true });

      // Assert — should only find archived spec, NOT active
      const output = consoleSpy.mock.calls.map(c => c[0]).join('\n');
      expect(output).toContain('SPEC-001-old');
      expect(output).not.toContain('SPEC-010-active');
    });
  });

  it('should exit with error when no query provided', () => {
    // Arrange
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {});

    // Act
    specSearchCommand('', {});

    // Assert
    expect(exitSpy).toHaveBeenCalledWith(1);
    exitSpy.mockRestore();
  });
});
