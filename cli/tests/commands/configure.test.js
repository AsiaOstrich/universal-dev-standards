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

vi.mock('inquirer', () => ({
  default: {
    prompt: vi.fn(() => Promise.resolve({ type: 'format' })),
    Separator: class Separator {}
  }
}));

vi.mock('../../src/utils/registry.js', () => ({
  getOptionSource: vi.fn((opt) => `options/${opt.id}.md`),
  findOption: vi.fn(() => null),
  getAllStandards: vi.fn(() => [
    { id: 'git-workflow', options: { workflow: [], merge_strategy: [] } },
    { id: 'commit-message', options: { commit_language: [] } },
    { id: 'testing', options: { test_level: [] } }
  ]),
  getStandardsByLevel: vi.fn(() => []),
  getStandardSource: vi.fn((std) => `core/${std.id}.md`)
}));

vi.mock('../../src/utils/copier.js', () => ({
  copyStandard: vi.fn(() => ({ success: true, error: null, path: '/test/path' })),
  readManifest: vi.fn(() => ({
    format: 'human',
    level: 2,
    contentMode: 'minimal',
    aiTools: ['claude-code'],
    options: {
      workflow: 'github-flow',
      merge_strategy: 'squash',
      commit_language: 'english',
      test_levels: ['unit-testing']
    }
  })),
  writeManifest: vi.fn(),
  isInitialized: vi.fn(() => true)
}));

vi.mock('../../src/prompts/init.js', () => ({
  promptFormat: vi.fn(() => 'ai'),
  promptGitWorkflow: vi.fn(() => 'gitflow'),
  promptMergeStrategy: vi.fn(() => 'rebase'),
  promptCommitLanguage: vi.fn(() => 'bilingual'),
  promptTestLevels: vi.fn(() => ['unit-testing', 'integration-testing']),
  promptConfirm: vi.fn(() => true),
  promptManageAITools: vi.fn(() => ({ action: 'cancel', tools: [] })),
  promptAdoptionLevel: vi.fn((current) => current),
  promptContentModeChange: vi.fn((current) => current),
  promptMethodology: vi.fn(() => null),
  handleAgentsMdSharing: vi.fn((tools) => tools)
}));

vi.mock('../../src/utils/integration-generator.js', () => ({
  writeIntegrationFile: vi.fn(() => ({ success: true, path: '/test/.cursorrules' })),
  getToolFilePath: vi.fn((tool) => {
    const files = {
      cursor: '.cursorrules',
      windsurf: '.windsurfrules',
      cline: '.clinerules',
      copilot: '.github/copilot-instructions.md',
      antigravity: 'INSTRUCTIONS.md',
      'claude-code': 'CLAUDE.md',
      codex: 'AGENTS.md',
      'gemini-cli': 'GEMINI.md',
      opencode: 'AGENTS.md'
    };
    return files[tool] || '';
  })
}));

import { configureCommand } from '../../src/commands/configure.js';
import { isInitialized, readManifest, writeManifest } from '../../src/utils/copier.js';
import { promptConfirm } from '../../src/prompts/init.js';

describe('Configure Command', () => {
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
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  describe('configureCommand', () => {
    it('should show error if not initialized', async () => {
      isInitialized.mockReturnValue(false);

      await configureCommand({});

      const output = consoleLogs.join('\n');
      expect(output).toContain('Standards not initialized');
      expect(output).toContain('uds init');
    });

    it('should show error if manifest cannot be read', async () => {
      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue(null);

      await configureCommand({});

      const output = consoleLogs.join('\n');
      expect(output).toContain('Could not read manifest');
    });

    it('should display current configuration', async () => {
      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue({
        format: 'human',
        level: 2,
        contentMode: 'minimal',
        aiTools: ['claude-code'],
        options: {
          workflow: 'github-flow',
          merge_strategy: 'squash',
          commit_language: 'english'
        }
      });
      promptConfirm.mockResolvedValue(false);

      await expect(configureCommand({ type: 'format' })).rejects.toThrow('process.exit called');

      const output = consoleLogs.join('\n');
      expect(output).toContain('Current Configuration');
      expect(output).toContain('human');
    });

    it('should cancel when user declines', async () => {
      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue({
        format: 'human',
        level: 2,
        contentMode: 'minimal',
        aiTools: [],
        options: {}
      });
      promptConfirm.mockResolvedValue(false);

      await expect(configureCommand({ type: 'format' })).rejects.toThrow('process.exit called');

      const output = consoleLogs.join('\n');
      expect(output).toContain('Configuration cancelled');
    });

    it('should update configuration when confirmed', async () => {
      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue({
        format: 'human',
        level: 2,
        contentMode: 'minimal',
        aiTools: [],
        options: {}
      });
      promptConfirm.mockResolvedValue(true);

      await expect(configureCommand({ type: 'format' })).rejects.toThrow('process.exit called');

      const output = consoleLogs.join('\n');
      expect(output).toContain('Configuration updated successfully');
      expect(writeManifest).toHaveBeenCalled();
    });

    it('should show new configuration summary', async () => {
      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue({
        format: 'human',
        level: 2,
        contentMode: 'minimal',
        aiTools: [],
        options: {}
      });
      promptConfirm.mockResolvedValue(true);

      await expect(configureCommand({ type: 'format' })).rejects.toThrow('process.exit called');

      const output = consoleLogs.join('\n');
      expect(output).toContain('New Configuration');
    });

    it('should accept type option directly', async () => {
      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue({
        format: 'human',
        level: 2,
        contentMode: 'minimal',
        aiTools: [],
        options: { workflow: 'github-flow' }
      });
      promptConfirm.mockResolvedValue(true);

      await expect(configureCommand({ type: 'workflow' })).rejects.toThrow('process.exit called');

      const output = consoleLogs.join('\n');
      expect(output).toContain('Configuration updated');
    });
  });
});
