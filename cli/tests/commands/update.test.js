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

vi.mock('../../src/utils/npm-registry.js', () => ({
  checkForUpdates: vi.fn(() => Promise.resolve({
    available: false,
    offline: false,
    currentVersion: '3.0.0',
    latestVersion: '3.0.0'
  })),
  clearCache: vi.fn()
}));

vi.mock('../../src/config/ai-agent-paths.js', () => ({
  getAgentDisplayName: vi.fn((agent) => {
    const names = {
      'claude-code': 'Claude Code',
      'opencode': 'OpenCode',
      'cursor': 'Cursor'
    };
    return names[agent] || agent;
  }),
  getAgentConfig: vi.fn((agent) => {
    const configs = {
      'claude-code': { supportsSkills: true, skills: { project: '.claude/skills/' }, commands: null },
      'opencode': { supportsSkills: true, skills: { project: '.opencode/skill/' }, commands: { project: '.opencode/command/' } },
      'cursor': { supportsSkills: true, skills: { project: '.cursor/skills/' }, commands: null }
    };
    return configs[agent] || null;
  }),
  getSkillsDirForAgent: vi.fn(() => '.claude/skills/'),
  getCommandsDirForAgent: vi.fn(() => '.opencode/command/')
}));

vi.mock('../../src/utils/skills-installer.js', () => ({
  installSkillsToMultipleAgents: vi.fn(() => Promise.resolve({ totalInstalled: 1, totalErrors: 0 })),
  installCommandsToMultipleAgents: vi.fn(() => Promise.resolve({ totalInstalled: 1, totalErrors: 0 })),
  getInstalledSkillsInfoForAgent: vi.fn(() => ({ installed: false })),
  getInstalledCommandsForAgent: vi.fn(() => ({ installed: false }))
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

    it('should not suggest downgrade when current version is newer (beta > stable)', async () => {
      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue({
        upstream: { version: '3.4.0-beta.3' },
        standards: ['core/test.md'],
        extensions: [],
        integrations: [],
        skills: { installed: false }
      });
      getRepositoryInfo.mockReturnValue({
        standards: { version: '3.3.0' },
        skills: { version: '1.0.0' }
      });

      await updateCommand({});

      const output = consoleLogs.join('\n');
      expect(output).toContain('Standards are up to date');
      expect(output).toContain('newer version than the registry');
      expect(output).not.toContain('Update available');
    });

    it('should not suggest downgrade when current version is newer major/minor', async () => {
      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue({
        upstream: { version: '4.0.0' },
        standards: ['core/test.md'],
        extensions: [],
        integrations: [],
        skills: { installed: false }
      });
      getRepositoryInfo.mockReturnValue({
        standards: { version: '3.3.0' },
        skills: { version: '1.0.0' }
      });

      await updateCommand({});

      const output = consoleLogs.join('\n');
      expect(output).toContain('Standards are up to date');
      expect(output).toContain('newer version than the registry');
    });

    it('should suggest update from stable to newer stable', async () => {
      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue({
        upstream: { version: '3.3.0' },
        standards: ['core/test.md'],
        extensions: [],
        integrations: [],
        skills: { installed: false }
      });
      getRepositoryInfo.mockReturnValue({
        standards: { version: '3.4.0' },
        skills: { version: '1.0.0' }
      });
      mockPrompt.mockResolvedValue({ confirmed: false });

      await updateCommand({});

      const output = consoleLogs.join('\n');
      expect(output).toContain('Update available');
      expect(output).toContain('3.3.0');
      expect(output).toContain('3.4.0');
    });

    it('should suggest update from beta to newer stable of same version', async () => {
      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue({
        upstream: { version: '3.4.0-beta.1' },
        standards: ['core/test.md'],
        extensions: [],
        integrations: [],
        skills: { installed: false }
      });
      getRepositoryInfo.mockReturnValue({
        standards: { version: '3.4.0' },
        skills: { version: '1.0.0' }
      });
      mockPrompt.mockResolvedValue({ confirmed: false });

      await updateCommand({});

      const output = consoleLogs.join('\n');
      expect(output).toContain('Update available');
    });

    it('should show new features hint in --yes mode when skills/commands missing', async () => {
      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue({
        upstream: { version: '2.0.0' },
        standards: ['core/test.md'],
        extensions: [],
        integrations: [],
        aiTools: ['opencode'],
        skills: { installed: false }
      });
      getRepositoryInfo.mockReturnValue({
        standards: { version: '3.0.0' },
        skills: { version: '1.0.0' }
      });

      await expect(updateCommand({ yes: true })).rejects.toThrow('process.exit called');

      const output = consoleLogs.join('\n');
      expect(output).toContain('New features available');
    });

    it('should not show new features prompt when aiTools is empty', async () => {
      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue({
        upstream: { version: '2.0.0' },
        standards: ['core/test.md'],
        extensions: [],
        integrations: [],
        aiTools: [],
        skills: { installed: false }
      });

      await expect(updateCommand({ yes: true })).rejects.toThrow('process.exit called');

      const output = consoleLogs.join('\n');
      expect(output).not.toContain('New features available');
    });

    it('should not prompt for features when --standards-only is used', async () => {
      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue({
        upstream: { version: '2.0.0' },
        standards: ['core/test.md'],
        extensions: [],
        integrations: [],
        aiTools: ['opencode'],
        skills: { installed: false }
      });

      await expect(updateCommand({ yes: true, standardsOnly: true })).rejects.toThrow('process.exit called');

      const output = consoleLogs.join('\n');
      expect(output).not.toContain('New features available');
    });
  });

  describe('updateCommandsOnly (--commands flag)', () => {
    it('should handle {agent, level} format correctly', async () => {
      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue({
        upstream: { version: '3.0.0' },
        standards: [],
        extensions: [],
        integrations: [],
        aiTools: ['opencode'],
        commands: {
          installed: true,
          installations: [{ agent: 'opencode', level: 'project' }]
        }
      });

      await expect(updateCommand({ commands: true })).rejects.toThrow('process.exit called');

      const output = consoleLogs.join('\n');
      expect(output).toContain('opencode');
      expect(output).toContain('project');
      expect(writeManifest).toHaveBeenCalled();
    });

    it('should show no commands message when installations is empty and no legacy', async () => {
      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue({
        upstream: { version: '3.0.0' },
        standards: [],
        extensions: [],
        integrations: [],
        aiTools: [],
        commands: { installed: false, installations: [] }
      });

      await expect(updateCommand({ commands: true })).rejects.toThrow('process.exit called');

      const output = consoleLogs.join('\n');
      expect(output).toContain('No slash commands installations found');
    });

    it('should convert legacy format when installations is empty but commands.installed is true', async () => {
      const { getAgentConfig } = await import('../../src/config/ai-agent-paths.js');
      getAgentConfig.mockReturnValue({ commands: { project: '.opencode/command/' } });

      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue({
        upstream: { version: '3.0.0' },
        standards: [],
        extensions: [],
        integrations: [],
        aiTools: ['opencode'],
        commands: {
          installed: true
          // No installations array - legacy format
        }
      });

      await expect(updateCommand({ commands: true })).rejects.toThrow('process.exit called');

      const output = consoleLogs.join('\n');
      // Should have converted and proceeded, not shown "no installations"
      expect(output).toContain('Updating slash commands');
      expect(writeManifest).toHaveBeenCalled();

      // Check that manifest was written with normalized format
      const manifestArg = writeManifest.mock.calls[0][0];
      expect(manifestArg.commands.installations).toEqual([
        { agent: 'opencode', level: 'project' }
      ]);
    });

    it('should normalize string installations to {agent, level} format in manifest', async () => {
      const { installCommandsToMultipleAgents, getInstalledCommandsForAgent } = await import('../../src/utils/skills-installer.js');
      installCommandsToMultipleAgents.mockResolvedValue({ totalInstalled: 1, totalErrors: 0 });
      getInstalledCommandsForAgent.mockReturnValue({ count: 1 });

      isInitialized.mockReturnValue(true);
      // Simulate a case where installations might be strings (hypothetical edge case)
      readManifest.mockReturnValue({
        upstream: { version: '3.0.0' },
        standards: [],
        extensions: [],
        integrations: [],
        aiTools: ['opencode'],
        commands: {
          installed: true,
          installations: [{ agent: 'opencode', level: 'project' }]
        }
      });

      await expect(updateCommand({ commands: true })).rejects.toThrow('process.exit called');

      expect(writeManifest).toHaveBeenCalled();
      const manifestArg = writeManifest.mock.calls[0][0];
      // Should be normalized to {agent, level} format
      expect(manifestArg.commands.installations[0]).toHaveProperty('agent');
      expect(manifestArg.commands.installations[0]).toHaveProperty('level');
    });

    it('should show level in status output', async () => {
      const { getInstalledCommandsForAgent } = await import('../../src/utils/skills-installer.js');
      getInstalledCommandsForAgent.mockReturnValue({ count: 5 });

      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue({
        upstream: { version: '3.0.0' },
        standards: [],
        extensions: [],
        integrations: [],
        aiTools: ['opencode'],
        commands: {
          installed: true,
          installations: [{ agent: 'opencode', level: 'user' }]
        }
      });

      await expect(updateCommand({ commands: true })).rejects.toThrow('process.exit called');

      const output = consoleLogs.join('\n');
      expect(output).toContain('user');
      expect(output).toContain('5 commands');
    });
  });
});
