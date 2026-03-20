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
  handleAgentsMdSharing: vi.fn((tools) => tools),
  promptAgentsMd: vi.fn(() => false),
  promptSkillsInstallLocation: vi.fn(() => []),
  promptCommandsInstallation: vi.fn(() => []),
  promptDisplayLanguage: vi.fn(() => 'zh-tw')
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

vi.mock('../../src/commands/update.js', () => ({
  regenerateIntegrations: vi.fn(() => ({
    success: true,
    updated: ['CLAUDE.md'],
    errors: []
  }))
}));

vi.mock('../../src/utils/skills-installer.js', () => ({
  installSkillsToMultipleAgents: vi.fn(() => ({ success: true, totalInstalled: 0, totalErrors: 0 })),
  installCommandsToMultipleAgents: vi.fn(() => ({ success: true, totalInstalled: 0, totalErrors: 0 })),
  getInstalledSkillsInfoForAgent: vi.fn(() => null),
  getInstalledCommandsForAgent: vi.fn(() => null)
}));

vi.mock('../../src/config/ai-agent-paths.js', () => ({
  getAgentConfig: vi.fn(() => ({ supportsSkills: true, commands: null })),
  getAgentDisplayName: vi.fn((tool) => tool)
}));

vi.mock('../../src/utils/github.js', () => ({
  getMarketplaceSkillsInfo: vi.fn(() => null)
}));

vi.mock('../../src/utils/config-manager.js', () => ({
  config: {
    init: vi.fn(() => ({})),
    get: vi.fn(),
    set: vi.fn()
  }
}));

import { configureCommand } from '../../src/commands/configure.js';
import { configCommand, runProjectConfiguration } from '../../src/commands/config.js';
import { regenerateIntegrations } from '../../src/commands/update.js';
import { isInitialized, readManifest, writeManifest } from '../../src/utils/copier.js';
import { promptConfirm, promptDisplayLanguage, promptCommitLanguage } from '../../src/prompts/init.js';
import { config } from '../../src/utils/config-manager.js';

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

  describe('configureCommand (alias)', () => {
    it('should delegate to runProjectConfiguration', async () => {
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
  });

  describe('runProjectConfiguration', () => {
    it('should show error if not initialized', async () => {
      isInitialized.mockReturnValue(false);

      await runProjectConfiguration({});

      const output = consoleLogs.join('\n');
      expect(output).toContain('Standards not initialized');
      expect(output).toContain('uds init');
    });

    it('should show error if manifest cannot be read', async () => {
      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue(null);

      await runProjectConfiguration({});

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

      await expect(runProjectConfiguration({ type: 'format' })).rejects.toThrow('process.exit called');

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

      await expect(runProjectConfiguration({ type: 'format' })).rejects.toThrow('process.exit called');

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

      await expect(runProjectConfiguration({ type: 'format' })).rejects.toThrow('process.exit called');

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

      await expect(runProjectConfiguration({ type: 'format' })).rejects.toThrow('process.exit called');

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

      await expect(runProjectConfiguration({ type: 'workflow' })).rejects.toThrow('process.exit called');

      const output = consoleLogs.join('\n');
      expect(output).toContain('Configuration updated');
    });

    describe('Smart Apply', () => {
      it('should prompt to apply changes when format changed with AI tools configured', async () => {
        const inquirer = await import('inquirer');
        isInitialized.mockReturnValue(true);
        readManifest.mockReturnValue({
          format: 'human',
          level: 2,
          contentMode: 'minimal',
          aiTools: ['claude-code'],
          options: {}
        });
        promptConfirm.mockResolvedValue(true);
        // User declines to apply
        inquirer.default.prompt.mockResolvedValueOnce({ type: 'format' });
        inquirer.default.prompt.mockResolvedValueOnce({ apply: false });

        await expect(runProjectConfiguration({ type: 'format' })).rejects.toThrow('process.exit called');

        const output = consoleLogs.join('\n');
        expect(output).toContain('uds update --integrations-only');
      });

      it('should auto-apply changes with --yes flag', async () => {
        isInitialized.mockReturnValue(true);
        readManifest.mockReturnValue({
          format: 'human',
          level: 2,
          contentMode: 'minimal',
          aiTools: ['claude-code'],
          options: {}
        });
        promptConfirm.mockResolvedValue(true);

        await expect(runProjectConfiguration({ type: 'format', yes: true })).rejects.toThrow('process.exit called');

        expect(regenerateIntegrations).toHaveBeenCalled();
      });

      it('should skip first confirmation prompt with --yes flag', async () => {
        isInitialized.mockReturnValue(true);
        readManifest.mockReturnValue({
          format: 'human',
          level: 2,
          contentMode: 'minimal',
          aiTools: ['claude-code'],
          options: {}
        });
        // Reset the mock to track calls
        promptConfirm.mockClear();
        promptConfirm.mockResolvedValue(true);

        await expect(runProjectConfiguration({ type: 'format', yes: true })).rejects.toThrow('process.exit called');

        // promptConfirm should NOT have been called because --yes skips it
        expect(promptConfirm).not.toHaveBeenCalled();
      });

      it('should not prompt for skills configuration type', async () => {
        isInitialized.mockReturnValue(true);
        readManifest.mockReturnValue({
          format: 'human',
          level: 2,
          contentMode: 'minimal',
          aiTools: ['claude-code'],
          options: {}
        });

        // Skills config has its own exit path
        const { promptSkillsInstallLocation } = await import('../../src/prompts/init.js');
        promptSkillsInstallLocation.mockResolvedValue([]);

        await expect(runProjectConfiguration({ type: 'skills' })).rejects.toThrow('process.exit called');

        // regenerateIntegrations should not have been called for skills config
        expect(regenerateIntegrations).not.toHaveBeenCalled();
      });

      it('should not prompt when no AI tools are configured', async () => {
        isInitialized.mockReturnValue(true);
        readManifest.mockReturnValue({
          format: 'human',
          level: 2,
          contentMode: 'minimal',
          aiTools: [],
          options: {}
        });
        promptConfirm.mockResolvedValue(true);

        await expect(runProjectConfiguration({ type: 'format' })).rejects.toThrow('process.exit called');

        // Should not call regenerateIntegrations when no AI tools
        expect(regenerateIntegrations).not.toHaveBeenCalled();
      });
    });
  });

  describe('Display Language', () => {
    it('should include display_language choice in limited menu when not initialized', async () => {
      const inquirer = await import('inquirer');
      // handleLimitedConfig shows limited menu with display_language
      inquirer.default.prompt
        .mockResolvedValueOnce({ initType: 'display_language' });

      // promptDisplayLanguage returns same lang → no change
      promptDisplayLanguage.mockResolvedValue('en');
      isInitialized.mockReturnValue(false);

      await configCommand(undefined, null, null, { vibeMode: false });

      // Verify limited menu was shown with display_language as a choice
      const firstCall = inquirer.default.prompt.mock.calls[0][0][0];
      const choiceValues = firstCall.choices.map(c => c.value).filter(v => v !== undefined);
      expect(choiceValues).toContain('display_language');
    });

    it('should save to manifest when project initialized and language changed via flat menu', async () => {
      const inquirer = await import('inquirer');
      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue({
        format: 'human',
        level: 2,
        contentMode: 'minimal',
        aiTools: [],
        options: { display_language: 'en', commit_language: 'english' }
      });

      // Flat menu → choose display_language → handleDisplayLanguageChange runs
      inquirer.default.prompt
        .mockResolvedValueOnce({ type: 'display_language' });

      promptDisplayLanguage.mockResolvedValue('zh-tw');
      promptCommitLanguage.mockResolvedValue('bilingual');

      await expect(configCommand(undefined, null, null, {})).rejects.toThrow('process.exit called');

      expect(writeManifest).toHaveBeenCalled();
      const manifestArg = writeManifest.mock.calls[0][0];
      expect(manifestArg.options.display_language).toBe('zh-tw');
    });

    it('should not write manifest when language unchanged', async () => {
      const inquirer = await import('inquirer');
      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue({
        format: 'human',
        level: 2,
        contentMode: 'minimal',
        aiTools: [],
        options: { display_language: 'en' }
      });

      // Flat menu → display_language
      inquirer.default.prompt
        .mockResolvedValueOnce({ type: 'display_language' });

      promptDisplayLanguage.mockResolvedValue('en');

      await expect(configCommand(undefined, null, null, {})).rejects.toThrow('process.exit called');

      expect(writeManifest).not.toHaveBeenCalled();
      const output = consoleLogs.join('\n');
      expect(output).toContain('unchanged');
    });

    it('should save to global config when project not initialized and language changed', async () => {
      const inquirer = await import('inquirer');
      isInitialized.mockReturnValue(false);

      inquirer.default.prompt
        .mockResolvedValueOnce({ initType: 'display_language' });

      promptDisplayLanguage.mockResolvedValue('zh-cn');

      await configCommand(undefined, null, null, {});

      // Should save to global config
      expect(config.set).toHaveBeenCalledWith('ui.language', 'zh-cn', 'global');
    });

    it('should offer integration regeneration when AI tools configured', async () => {
      const inquirer = await import('inquirer');
      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue({
        format: 'human',
        level: 2,
        contentMode: 'minimal',
        aiTools: ['claude-code'],
        options: { display_language: 'en', commit_language: 'english' }
      });

      // Flat menu → display_language
      inquirer.default.prompt
        .mockResolvedValueOnce({ type: 'display_language' })
        .mockResolvedValueOnce({ confirm: false }); // decline regeneration

      promptDisplayLanguage.mockResolvedValue('zh-tw');
      promptCommitLanguage.mockResolvedValue('bilingual');

      await expect(configCommand(undefined, null, null, {})).rejects.toThrow('process.exit called');

      expect(writeManifest).toHaveBeenCalled();
    });
  });

  describe('configCommand (unified entry)', () => {
    it('should show JSON config with "list" action', async () => {
      await configCommand('list', null, null, {});

      const output = consoleLogs.join('\n');
      expect(output).toContain('Current Configuration');
    });

    it('should route to flat menu (runProjectConfiguration) when initialized with no action', async () => {
      const inquirer = await import('inquirer');
      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue({
        format: 'human',
        level: 2,
        contentMode: 'minimal',
        aiTools: [],
        options: {}
      });
      // Flat menu → choose 'show' to exit
      inquirer.default.prompt.mockResolvedValueOnce({ type: 'show' });

      await expect(configCommand(undefined, null, null, {})).rejects.toThrow('process.exit called');

      const output = consoleLogs.join('\n');
      expect(output).toContain('Current Configuration');
    });

    it('should forward to project configuration when --type is provided', async () => {
      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue({
        format: 'human',
        level: 2,
        contentMode: 'minimal',
        aiTools: [],
        options: {}
      });
      promptConfirm.mockResolvedValue(true);

      await expect(configCommand(undefined, null, null, { type: 'format' })).rejects.toThrow('process.exit called');

      const output = consoleLogs.join('\n');
      expect(output).toContain('Configuration updated successfully');
    });

    it('should show limited menu when not initialized', async () => {
      const inquirer = await import('inquirer');
      isInitialized.mockReturnValue(false);
      // Limited menu → choose 'show'
      inquirer.default.prompt.mockResolvedValueOnce({ initType: 'show' });

      await configCommand(undefined, null, null, {});

      // Verify limited menu was shown (has display_language, vibe, show — no project choices)
      const promptCall = inquirer.default.prompt.mock.calls[0][0][0];
      const choiceValues = promptCall.choices.map(c => c.value).filter(v => v !== undefined);
      expect(choiceValues).toContain('display_language');
      expect(choiceValues).toContain('vibe');
      expect(choiceValues).toContain('show');
      expect(choiceValues).not.toContain('format');
      expect(choiceValues).not.toContain('workflow');
    });

    it('should show flat menu without advanced options when initialized (no -E)', async () => {
      const inquirer = await import('inquirer');
      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue({
        format: 'human',
        level: 2,
        contentMode: 'minimal',
        aiTools: [],
        options: {}
      });
      // Flat menu → choose 'show'
      inquirer.default.prompt.mockResolvedValueOnce({ type: 'show' });

      await expect(configCommand(undefined, null, null, {})).rejects.toThrow('process.exit called');

      // Verify flat menu contains standard options but hides advanced ones
      const promptCall = inquirer.default.prompt.mock.calls[0][0][0];
      const choiceValues = promptCall.choices.map(c => c.value).filter(v => v !== undefined);
      expect(choiceValues).toContain('display_language');
      expect(choiceValues).toContain('workflow');
      expect(choiceValues).toContain('ai_tools');
      expect(choiceValues).toContain('vibe_coding');
      expect(choiceValues).toContain('show');
      expect(choiceValues).toContain('all');
      // Advanced options hidden without -E
      expect(choiceValues).not.toContain('format');
      expect(choiceValues).not.toContain('merge_strategy');
      expect(choiceValues).not.toContain('content_mode');
    });

    it('should show advanced options in flat menu with -E flag', async () => {
      const inquirer = await import('inquirer');
      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue({
        format: 'human',
        level: 2,
        contentMode: 'minimal',
        aiTools: [],
        options: {}
      });
      inquirer.default.prompt.mockResolvedValueOnce({ type: 'show' });

      await expect(configCommand(undefined, null, null, { experimental: true })).rejects.toThrow('process.exit called');

      const promptCall = inquirer.default.prompt.mock.calls[0][0][0];
      const choiceValues = promptCall.choices.map(c => c.value).filter(v => v !== undefined);
      expect(choiceValues).toContain('format');
      expect(choiceValues).toContain('merge_strategy');
      expect(choiceValues).toContain('content_mode');
      expect(choiceValues).toContain('methodology');
    });
  });
});
