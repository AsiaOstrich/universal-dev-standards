import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock dependencies before importing the module
vi.mock('chalk', () => ({
  default: {
    bold: vi.fn((s) => s),
    gray: vi.fn((s) => s),
    green: vi.fn((s) => s),
    yellow: vi.fn((s) => s),
    red: vi.fn((s) => s),
    cyan: vi.fn((s) => s)
  }
}));

vi.mock('ora', () => ({
  default: vi.fn(() => ({
    start: vi.fn().mockReturnThis(),
    succeed: vi.fn().mockReturnThis(),
    warn: vi.fn().mockReturnThis(),
    fail: vi.fn().mockReturnThis()
  }))
}));

// Use hoisted to define mock before vi.mock
const { mockPrompt } = vi.hoisted(() => ({
  mockPrompt: vi.fn(() => Promise.resolve({ confirmed: true }))
}));

vi.mock('inquirer', () => ({
  default: {
    prompt: mockPrompt
  }
}));

vi.mock('../../src/utils/copier.js', () => ({
  copyStandard: vi.fn(() => ({ success: true, error: null, path: '/test/path' })),
  copyIntegration: vi.fn(() => ({ success: true, error: null, path: '/test/path' })),
  readManifest: vi.fn(() => ({
    upstream: { version: '2.0.0' },
    standards: ['core/test.md'],
    extensions: [],
    integrations: [],
    skills: { installed: false }
  })),
  writeManifest: vi.fn(),
  isInitialized: vi.fn(() => true)
}));

vi.mock('../../src/utils/registry.js', () => ({
  getRepositoryInfo: vi.fn(() => ({
    standards: { version: '3.0.0' },
    skills: { version: '1.0.0' }
  }))
}));

import { updateCommand } from '../../src/commands/update.js';
import { isInitialized, readManifest, writeManifest, copyStandard } from '../../src/utils/copier.js';
import { getRepositoryInfo } from '../../src/utils/registry.js';

describe('Update Command', () => {
  let consoleLogs = [];
  let exitSpy;

  beforeEach(() => {
    consoleLogs = [];
    vi.spyOn(console, 'log').mockImplementation((...args) => {
      consoleLogs.push(args.join(' '));
    });
    exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });
    vi.spyOn(process, 'cwd').mockReturnValue('/test/project');
    // Reset the mock before each test
    mockPrompt.mockReset();
    mockPrompt.mockResolvedValue({ confirmed: true });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  describe('updateCommand', () => {
    it('should show error if not initialized', async () => {
      isInitialized.mockReturnValue(false);

      await updateCommand({});

      const output = consoleLogs.join('\n');
      expect(output).toContain('Standards not initialized');
      expect(output).toContain('uds init');
    });

    it('should show error if manifest cannot be read', async () => {
      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue(null);

      await updateCommand({});

      const output = consoleLogs.join('\n');
      expect(output).toContain('Could not read manifest');
    });

    it('should show up to date message when versions match', async () => {
      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue({
        upstream: { version: '3.0.0' },
        standards: [],
        extensions: [],
        integrations: [],
        skills: { installed: false }
      });
      getRepositoryInfo.mockReturnValue({
        standards: { version: '3.0.0' },
        skills: { version: '1.0.0' }
      });

      await updateCommand({});

      const output = consoleLogs.join('\n');
      expect(output).toContain('Standards are up to date');
    });

    it('should show update available message', async () => {
      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue({
        upstream: { version: '2.0.0' },
        standards: ['core/test.md'],
        extensions: [],
        integrations: [],
        skills: { installed: false }
      });
      getRepositoryInfo.mockReturnValue({
        standards: { version: '3.0.0' },
        skills: { version: '1.0.0' }
      });
      mockPrompt.mockResolvedValue({ confirmed: false });

      await updateCommand({});

      const output = consoleLogs.join('\n');
      expect(output).toContain('Update available');
      expect(output).toContain('2.0.0');
      expect(output).toContain('3.0.0');
    });

    it('should cancel update when user declines', async () => {
      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue({
        upstream: { version: '2.0.0' },
        standards: ['core/test.md'],
        extensions: [],
        integrations: [],
        skills: { installed: false }
      });
      mockPrompt.mockResolvedValue({ confirmed: false });

      await updateCommand({});

      const output = consoleLogs.join('\n');
      expect(output).toContain('Update cancelled');
    });

    it('should perform update when confirmed', async () => {
      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue({
        upstream: { version: '2.0.0' },
        standards: ['core/test.md'],
        extensions: [],
        integrations: [],
        skills: { installed: false }
      });
      mockPrompt.mockResolvedValue({ confirmed: true });

      await expect(updateCommand({})).rejects.toThrow('process.exit called');

      expect(copyStandard).toHaveBeenCalled();
      expect(writeManifest).toHaveBeenCalled();
    });

    it('should skip confirmation with --yes flag', async () => {
      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue({
        upstream: { version: '2.0.0' },
        standards: ['core/test.md'],
        extensions: [],
        integrations: [],
        skills: { installed: false }
      });

      await expect(updateCommand({ yes: true })).rejects.toThrow('process.exit called');

      expect(mockPrompt).not.toHaveBeenCalled();
      expect(copyStandard).toHaveBeenCalled();
    });

    it('should show success message after update', async () => {
      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue({
        upstream: { version: '2.0.0' },
        standards: ['core/test.md'],
        extensions: [],
        integrations: [],
        skills: { installed: false }
      });

      await expect(updateCommand({ yes: true })).rejects.toThrow('process.exit called');

      const output = consoleLogs.join('\n');
      expect(output).toContain('Standards updated successfully');
    });

    it('should show skills update reminder when available', async () => {
      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue({
        upstream: { version: '2.0.0' },
        standards: [],
        extensions: [],
        integrations: [],
        skills: { installed: true, version: '0.9.0' }
      });
      getRepositoryInfo.mockReturnValue({
        standards: { version: '3.0.0' },
        skills: { version: '1.0.0' }
      });

      await expect(updateCommand({ yes: true })).rejects.toThrow('process.exit called');

      const output = consoleLogs.join('\n');
      expect(output).toContain('Skills update available');
    });

    it('should list files to update', async () => {
      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue({
        upstream: { version: '2.0.0' },
        standards: ['core/test.md'],
        extensions: ['extensions/lang.md'],
        integrations: ['.cursorrules'],
        skills: { installed: false }
      });
      mockPrompt.mockResolvedValue({ confirmed: false });

      await updateCommand({});

      const output = consoleLogs.join('\n');
      expect(output).toContain('Files to update');
      expect(output).toContain('test.md');
    });
  });
});
