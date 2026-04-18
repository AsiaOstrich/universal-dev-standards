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
const { mockPrompt, mockExistsSync } = vi.hoisted(() => ({
  mockPrompt: vi.fn(() => Promise.resolve(true)),
  mockExistsSync: vi.fn(() => true)
}));

vi.mock('fs', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    existsSync: mockExistsSync,
    unlinkSync: vi.fn()
  };
});

vi.mock('../../src/utils/hasher.js', () => ({
  computeFileHash: vi.fn(() => ({ hash: 'abc123', algorithm: 'sha256' })),
  scanForUntrackedFiles: vi.fn(() => []),
  refreshIntegrationBlockHashes: vi.fn()
}));

// Bypass DEC-044 / XSPEC-071 self-adoption guard in unit tests — these
// tests mock `fs.existsSync` to return true for everything, which would
// otherwise trigger the real guard and refuse the command under test.
vi.mock('../../src/utils/detect-self-adoption.js', () => ({
  detectSelfAdoption: vi.fn(() => false),
  detectSelfAdoptionDetailed: vi.fn(() => ({ isSelfAdoption: false, signals: [] })),
  guardAgainstSelfAdoption: vi.fn(() => true),
  formatSelfAdoptionRefuseMessage: vi.fn(() => []),
  formatSelfAdoptionForceWarning: vi.fn(() => [])
}));

vi.mock('@inquirer/prompts', () => ({
  select: mockPrompt,
  checkbox: mockPrompt,
  confirm: mockPrompt,
  input: mockPrompt,
  Separator: class Separator { constructor(t) { this.text = t; } }
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
  })),
  getAllStandards: vi.fn(() => []),
  getStandardSource: vi.fn((std, format) => {
    if (typeof std.source === 'string') return std.source;
    return std.source?.[format] || std.source?.human || null;
  })
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
  getInstalledCommandsForAgent: vi.fn(() => ({ installed: false })),
  cleanupDuplicateSkills: vi.fn(() => ({ cleaned: [], errors: [] })),
  cleanupLegacyCommands: vi.fn(() => ({ cleaned: [], errors: [] }))
}));

vi.mock('../../src/utils/integration-generator.js', () => ({
  writeIntegrationFile: vi.fn(() => ({ success: true, path: 'CLAUDE.md' })),
  getToolFilePath: vi.fn(() => 'CLAUDE.md'),
  resolveContentModeForTool: vi.fn((tool, userMode) => {
    if (userMode && userMode !== 'auto') return { contentMode: userMode, level: undefined };
    return { contentMode: 'index', level: 2 };
  })
}));

vi.mock('../../src/commands/check.js', () => ({
  restoreSingleFile: vi.fn(() => Promise.resolve(true)),
  updateFileHash: vi.fn(),
  getSourcePathFromRelative: vi.fn(() => 'core/test.md')
}));

import { updateCommand } from '../../src/commands/update.js';
import { isInitialized, readManifest, writeManifest, copyStandard } from '../../src/utils/copier.js';
import { getRepositoryInfo, getAllStandards } from '../../src/utils/registry.js';
import { refreshIntegrationBlockHashes } from '../../src/utils/hasher.js';
import { writeIntegrationFile } from '../../src/utils/integration-generator.js';
import { restoreSingleFile } from '../../src/commands/check.js';
import { getInstalledSkillsInfoForAgent } from '../../src/utils/skills-installer.js';

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
    mockPrompt.mockResolvedValue(true);
    mockExistsSync.mockReset();
    mockExistsSync.mockReturnValue(true);
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
      mockPrompt.mockResolvedValue(false);

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
      mockPrompt.mockResolvedValue(false);

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
      mockPrompt.mockResolvedValue(true);

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
      mockPrompt.mockResolvedValue(false);

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
      mockPrompt.mockResolvedValue(false);

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
      mockPrompt.mockResolvedValue(false);

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

  describe('new standards detection', () => {
    beforeEach(() => {
      isInitialized.mockReturnValue(true);
      getRepositoryInfo.mockReturnValue({
        standards: { version: '3.0.0' },
        skills: { version: '1.0.0' }
      });
    });

    it('should auto-install new standards in --yes mode', async () => {
      readManifest.mockReturnValue({
        upstream: { version: '2.0.0' },
        standards: ['ai/commit-message.ai.yaml'],
        extensions: [],
        integrations: [],
        format: 'ai',
        skills: { installed: false }
      });

      // Registry returns standards including one not yet installed
      getAllStandards.mockReturnValue([
        { name: 'commit-message', category: 'reference', source: { ai: 'ai/commit-message.ai.yaml' } },
        { name: 'testing', category: 'reference', source: { ai: 'ai/testing.ai.yaml' } }
      ]);

      await expect(updateCommand({ yes: true })).rejects.toThrow('process.exit called');

      const output = consoleLogs.join('\n');
      expect(output).toContain('new standard');
      expect(output).toContain('testing.ai.yaml');
      // copyStandard should be called for existing + new standard
      expect(copyStandard).toHaveBeenCalledWith('ai/testing.ai.yaml', '.standards', '/test/project');
    });

    it('should install new standards when user confirms in interactive mode', async () => {
      readManifest.mockReturnValue({
        upstream: { version: '2.0.0' },
        standards: ['ai/commit-message.ai.yaml'],
        extensions: [],
        integrations: [],
        format: 'ai',
        skills: { installed: false }
      });

      getAllStandards.mockReturnValue([
        { name: 'commit-message', category: 'reference', source: { ai: 'ai/commit-message.ai.yaml' } },
        { name: 'testing', category: 'reference', source: { ai: 'ai/testing.ai.yaml' } }
      ]);

      // First prompt: confirm update, Second prompt: confirm install new
      mockPrompt
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true);

      await expect(updateCommand({})).rejects.toThrow('process.exit called');

      expect(copyStandard).toHaveBeenCalledWith('ai/testing.ai.yaml', '.standards', '/test/project');
    });

    it('should skip new standards when user declines in interactive mode', async () => {
      readManifest.mockReturnValue({
        upstream: { version: '2.0.0' },
        standards: ['ai/commit-message.ai.yaml'],
        extensions: [],
        integrations: [],
        format: 'ai',
        skills: { installed: false }
      });

      getAllStandards.mockReturnValue([
        { name: 'commit-message', category: 'reference', source: { ai: 'ai/commit-message.ai.yaml' } },
        { name: 'testing', category: 'reference', source: { ai: 'ai/testing.ai.yaml' } }
      ]);

      // First prompt: confirm update, Second prompt: decline new standards
      mockPrompt
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);

      await expect(updateCommand({})).rejects.toThrow('process.exit called');

      // copyStandard called for existing standard but NOT for the new one
      expect(copyStandard).toHaveBeenCalledWith('ai/commit-message.ai.yaml', '.standards', '/test/project');
      expect(copyStandard).not.toHaveBeenCalledWith('ai/testing.ai.yaml', '.standards', '/test/project');
    });

    it('should copy options standards to .standards/options directory', async () => {
      readManifest.mockReturnValue({
        upstream: { version: '2.0.0' },
        standards: ['ai/testing.ai.yaml', 'options/unit-testing.ai.yaml'],
        extensions: [],
        integrations: [],
        format: 'ai',
        skills: { installed: false }
      });

      getAllStandards.mockReturnValue([
        { name: 'testing', category: 'reference', source: { ai: 'ai/testing.ai.yaml' } },
        { name: 'unit-testing', category: 'reference', source: { ai: 'options/unit-testing.ai.yaml' } }
      ]);

      await expect(updateCommand({ yes: true })).rejects.toThrow('process.exit called');

      // Regular standards go to .standards
      expect(copyStandard).toHaveBeenCalledWith('ai/testing.ai.yaml', '.standards', '/test/project');
      // Options standards go to .standards/options
      expect(copyStandard).toHaveBeenCalledWith('options/unit-testing.ai.yaml', '.standards/options', '/test/project');
    });

    it('should install new options standards to .standards/options directory', async () => {
      readManifest.mockReturnValue({
        upstream: { version: '2.0.0' },
        standards: ['ai/testing.ai.yaml'],
        extensions: [],
        integrations: [],
        format: 'ai',
        skills: { installed: false }
      });

      getAllStandards.mockReturnValue([
        { name: 'testing', category: 'reference', source: { ai: 'ai/testing.ai.yaml' } },
        { name: 'unit-testing', category: 'reference', source: { ai: 'options/unit-testing.ai.yaml' } }
      ]);

      await expect(updateCommand({ yes: true })).rejects.toThrow('process.exit called');

      // New options standard should go to .standards/options
      expect(copyStandard).toHaveBeenCalledWith('options/unit-testing.ai.yaml', '.standards/options', '/test/project');
    });

    it('should include both reference and skill categories as new standards', async () => {
      readManifest.mockReturnValue({
        upstream: { version: '2.0.0' },
        standards: ['ai/commit-message.ai.yaml'],
        extensions: [],
        integrations: [],
        format: 'ai',
        skills: { installed: false }
      });

      // Registry returns both reference and skill category standards
      getAllStandards.mockReturnValue([
        { name: 'commit-message', category: 'reference', source: { ai: 'ai/commit-message.ai.yaml' } },
        { name: 'testing', category: 'reference', source: { ai: 'ai/testing.ai.yaml' } },
        { name: 'sdd', category: 'skill', source: { ai: 'ai/sdd.ai.yaml' } }
      ]);

      await expect(updateCommand({ yes: true })).rejects.toThrow('process.exit called');

      const output = consoleLogs.join('\n');
      // Both reference and skill categories should be detected as new
      expect(output).toContain('testing.ai.yaml');
      expect(output).toContain('sdd.ai.yaml');
    });

    it('should not show new standards prompt when all standards are already installed', async () => {
      readManifest.mockReturnValue({
        upstream: { version: '2.0.0' },
        standards: ['ai/commit-message.ai.yaml', 'ai/testing.ai.yaml'],
        extensions: [],
        integrations: [],
        format: 'ai',
        skills: { installed: false }
      });

      // Registry has same standards as installed
      getAllStandards.mockReturnValue([
        { name: 'commit-message', category: 'reference', source: { ai: 'ai/commit-message.ai.yaml' } },
        { name: 'testing', category: 'reference', source: { ai: 'ai/testing.ai.yaml' } }
      ]);

      await expect(updateCommand({ yes: true })).rejects.toThrow('process.exit called');

      const output = consoleLogs.join('\n');
      expect(output).not.toContain('new standard');
    });

    it('should skip standards with null source (skill-only like project-discovery)', async () => {
      readManifest.mockReturnValue({
        upstream: { version: '2.0.0' },
        standards: ['ai/commit-message.ai.yaml'],
        extensions: [],
        integrations: [],
        format: 'ai',
        skills: { installed: false }
      });

      // project-discovery has source: { human: null, ai: null }
      getAllStandards.mockReturnValue([
        { name: 'commit-message', category: 'reference', source: { ai: 'ai/commit-message.ai.yaml' } },
        { name: 'project-discovery', category: 'skill', source: { human: null, ai: null } },
        { name: 'testing', category: 'reference', source: { ai: 'ai/testing.ai.yaml' } }
      ]);

      await expect(updateCommand({ yes: true })).rejects.toThrow('process.exit called');

      const output = consoleLogs.join('\n');
      // Should not crash and should still detect testing as new
      expect(output).toContain('testing.ai.yaml');
      // project-discovery should be silently skipped
      expect(output).not.toContain('project-discovery');
    });

    it('should exclude non-reference non-skill categories from new standards', async () => {
      readManifest.mockReturnValue({
        upstream: { version: '2.0.0' },
        standards: ['ai/commit-message.ai.yaml'],
        extensions: [],
        integrations: [],
        format: 'ai',
        skills: { installed: false }
      });

      getAllStandards.mockReturnValue([
        { name: 'commit-message', category: 'reference', source: { ai: 'ai/commit-message.ai.yaml' } },
        { name: 'sdd', category: 'skill', source: { ai: 'ai/sdd.ai.yaml' } },
        { name: 'internal-tool', category: 'internal', source: { ai: 'ai/internal-tool.ai.yaml' } }
      ]);

      await expect(updateCommand({ yes: true })).rejects.toThrow('process.exit called');

      const output = consoleLogs.join('\n');
      // skill category should be included
      expect(output).toContain('sdd.ai.yaml');
      // non-reference/non-skill category should be excluded
      expect(output).not.toContain('internal-tool.ai.yaml');
    });
  });

  describe('post-update integrity check', () => {
    it('should detect and auto-restore missing files in --yes mode', async () => {
      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue({
        upstream: { version: '2.0.0' },
        standards: ['core/test.ai.yaml', 'core/commit.ai.yaml'],
        extensions: [],
        integrations: [],
        skills: { installed: false }
      });

      // Mock existsSync: second file is missing
      mockExistsSync.mockImplementation((filePath) => {
        if (typeof filePath === 'string' && filePath.includes('commit.ai.yaml')) {
          return false;
        }
        return true;
      });

      await expect(updateCommand({ yes: true })).rejects.toThrow('process.exit called');

      const output = consoleLogs.join('\n');
      expect(output).toContain('missing after update');
      expect(restoreSingleFile).toHaveBeenCalled();
      // writeManifest should be called at least twice (initial + after restore)
      expect(writeManifest.mock.calls.length).toBeGreaterThanOrEqual(2);
    });

    it('should prompt user for batch restore in interactive mode', async () => {
      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue({
        upstream: { version: '2.0.0' },
        standards: ['core/test.ai.yaml', 'core/missing.ai.yaml'],
        extensions: [],
        integrations: [],
        skills: { installed: false }
      });

      mockExistsSync.mockImplementation((filePath) => {
        if (typeof filePath === 'string' && filePath.includes('missing.ai.yaml')) {
          return false;
        }
        return true;
      });

      // First prompt: confirm update, second prompt: confirm restore
      mockPrompt
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true)
        .mockResolvedValue(true);

      await expect(updateCommand({})).rejects.toThrow('process.exit called');

      const output = consoleLogs.join('\n');
      expect(output).toContain('missing after update');
      // Verify restore was offered (prompt was called at least twice)
      expect(mockPrompt.mock.calls.length).toBeGreaterThanOrEqual(2);
    });

    it('should re-run integration generation after restoring missing files', async () => {
      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue({
        upstream: { version: '2.0.0' },
        standards: ['core/test.ai.yaml', 'core/commit.ai.yaml'],
        extensions: [],
        integrations: [],
        aiTools: ['claude-code'],
        skills: { installed: false }
      });

      // Mock existsSync: second file is missing
      mockExistsSync.mockImplementation((filePath) => {
        if (typeof filePath === 'string' && filePath.includes('commit.ai.yaml')) {
          return false;
        }
        return true;
      });

      // Clear call counts before test
      writeIntegrationFile.mockClear();
      refreshIntegrationBlockHashes.mockClear();
      writeManifest.mockClear();

      await expect(updateCommand({ yes: true })).rejects.toThrow('process.exit called');

      // Integration should be regenerated after restore
      expect(writeIntegrationFile).toHaveBeenCalled();
      // refreshIntegrationBlockHashes called at least twice: initial + post-restore
      expect(refreshIntegrationBlockHashes.mock.calls.length).toBeGreaterThanOrEqual(2);
      // writeManifest called at least 3 times: initial + post-restore + post-regen
      expect(writeManifest.mock.calls.length).toBeGreaterThanOrEqual(3);
    });

    it('should not re-run integration generation when no aiTools configured', async () => {
      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue({
        upstream: { version: '2.0.0' },
        standards: ['core/test.ai.yaml', 'core/commit.ai.yaml'],
        extensions: [],
        integrations: [],
        skills: { installed: false }
        // No aiTools
      });

      mockExistsSync.mockImplementation((filePath) => {
        if (typeof filePath === 'string' && filePath.includes('commit.ai.yaml')) {
          return false;
        }
        return true;
      });

      writeIntegrationFile.mockClear();

      await expect(updateCommand({ yes: true })).rejects.toThrow('process.exit called');

      // Integration should NOT be regenerated (no aiTools)
      expect(writeIntegrationFile).not.toHaveBeenCalled();
    });

    it('should skip restore when no files are missing', async () => {
      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue({
        upstream: { version: '2.0.0' },
        standards: ['core/test.ai.yaml'],
        extensions: [],
        integrations: [],
        skills: { installed: false }
      });

      // All files exist
      mockExistsSync.mockReturnValue(true);

      await expect(updateCommand({ yes: true })).rejects.toThrow('process.exit called');

      const output = consoleLogs.join('\n');
      expect(output).not.toContain('missing after update');
      expect(restoreSingleFile).not.toHaveBeenCalled();
    });

    it('should derive skills location from installations when reminder triggers', async () => {
      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue({
        upstream: { version: '2.0.0' },
        standards: [],
        extensions: [],
        integrations: [],
        aiTools: ['claude-code'],
        skills: {
          installed: true,
          version: '0.9.0',
          // location is NOT set (legacy manifest)
          installations: [{ agent: 'claude-code', level: 'project' }]
        }
      });
      getRepositoryInfo.mockReturnValue({
        standards: { version: '3.0.0' },
        skills: { version: '1.0.0' }
      });

      await expect(updateCommand({ yes: true })).rejects.toThrow('process.exit called');

      const output = consoleLogs.join('\n');
      // Should show project-level update instructions (not legacy/unknown)
      expect(output).toContain('Skills update available');
      // Should contain manual update hint for project level
      expect(output).toContain('.claude/skills/universal-dev-standards');
    });

    it('should fall back to file-system detection when location and installations are missing', async () => {
      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue({
        upstream: { version: '2.0.0' },
        standards: [],
        extensions: [],
        integrations: [],
        aiTools: ['claude-code'],
        skills: {
          installed: true,
          version: '0.9.0'
          // No location, no installations
        }
      });
      getRepositoryInfo.mockReturnValue({
        standards: { version: '3.0.0' },
        skills: { version: '1.0.0' }
      });

      // File-system detection: skills exist at project level
      getInstalledSkillsInfoForAgent.mockImplementation((agent, level) => {
        if (level === 'project') return { installed: true, version: null };
        return null;
      });

      await expect(updateCommand({ yes: true })).rejects.toThrow('process.exit called');

      const output = consoleLogs.join('\n');
      expect(output).toContain('Skills update available');
      // Should detect project level via file system and show project-level instructions
      expect(output).toContain('.claude/skills/universal-dev-standards');
    });
  });
});
