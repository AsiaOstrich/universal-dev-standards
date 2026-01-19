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

vi.mock('../../src/utils/skills-installer.js', () => ({
  installSkillsToMultipleAgents: vi.fn(() => ({ success: true, results: [] })),
  installCommandsToMultipleAgents: vi.fn(() => ({
    success: true,
    installations: [],
    totalInstalled: 0,
    totalErrors: 0
  })),
  getInstalledSkillsInfoForAgent: vi.fn(() => null)
}));

vi.mock('../../src/config/ai-agent-paths.js', () => ({
  getAgentConfig: vi.fn((agent) => {
    // Return commands config only for opencode (to test commands installation)
    const configs = {
      'opencode': { commands: { project: '.opencode/command/' } },
      'claude-code': { commands: null },
      'cursor': { commands: null },
      'copilot': { commands: { project: '.github/prompts/' } }
    };
    return configs[agent] || { commands: null };
  }),
  getAgentDisplayName: vi.fn((agent) => agent),
  getSkillsDirForAgent: vi.fn(() => '/test/skills'),
  getCommandsDirForAgent: vi.fn(() => '/test/commands')
}));

vi.mock('../../src/utils/registry.js', () => ({
  getStandardsByLevel: vi.fn(() => [
    { id: 'test-standard', category: 'reference', name: 'Test Standard' }
  ]),
  getRepositoryInfo: vi.fn(() => ({
    standards: { version: '3.0.0' },
    skills: { version: '1.0.0' }
  })),
  getSkillFiles: vi.fn(() => ({})),
  getStandardSource: vi.fn((std) => `core/${std.id}.md`),
  getOptionSource: vi.fn((opt) => `options/${opt.id}.md`),
  findOption: vi.fn(() => null)
}));

vi.mock('../../src/utils/detector.js', () => ({
  detectAll: vi.fn(() => ({
    languages: { javascript: true, typescript: false },
    frameworks: { react: false },
    aiTools: { claudeCode: false, cursor: false }
  }))
}));

vi.mock('../../src/utils/copier.js', () => ({
  copyStandard: vi.fn(() => ({ success: true, error: null, path: '/test/path' })),
  copyIntegration: vi.fn(() => ({ success: true, error: null, path: '/test/path' })),
  writeManifest: vi.fn(),
  isInitialized: vi.fn(() => false)
}));

vi.mock('../../src/utils/github.js', () => ({
  downloadSkillToLocation: vi.fn(() => ({ success: true, files: [] })),
  getInstalledSkillsInfo: vi.fn(() => null),
  getProjectInstalledSkillsInfo: vi.fn(() => null),
  writeSkillsManifest: vi.fn(),
  getSkillsDir: vi.fn(() => '/home/user/.claude/skills'),
  getProjectSkillsDir: vi.fn(() => '/project/.claude/skills')
}));

vi.mock('../../src/prompts/init.js', () => ({
  promptAITools: vi.fn(() => []),
  promptSkillsInstallLocation: vi.fn(() => 'none'),
  promptSkillsUpdate: vi.fn(() => ({ action: 'none', targets: [] })),
  promptStandardsScope: vi.fn(() => 'full'),
  promptLevel: vi.fn(() => 2),
  promptLanguage: vi.fn(() => []),
  promptFramework: vi.fn(() => []),
  promptLocale: vi.fn(() => null),
  promptConfirm: vi.fn(() => true),
  promptFormat: vi.fn(() => 'ai'),
  promptStandardOptions: vi.fn(() => ({})),
  promptContentMode: vi.fn(() => 'index'),
  promptMethodology: vi.fn(() => null),
  handleAgentsMdSharing: vi.fn((tools) => tools)
}));

vi.mock('../../src/prompts/integrations.js', () => ({
  promptIntegrationConfig: vi.fn(() => ({
    mergeStrategy: 'replace',
    config: {}
  }))
}));

vi.mock('../../src/utils/integration-generator.js', () => ({
  writeIntegrationFile: vi.fn(() => ({ success: true, path: '/test/.cursorrules' })),
  integrationFileExists: vi.fn(() => false),
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
  }),
  getSupportedTools: vi.fn(() => ['cursor', 'windsurf', 'cline', 'copilot', 'antigravity', 'claude-code', 'codex', 'gemini-cli', 'opencode']),
  toolsShareFile: vi.fn((t1, t2) => (t1 === 'codex' && t2 === 'opencode') || (t1 === 'opencode' && t2 === 'codex')),
  generateComplianceInstructions: vi.fn(() => '## Standards Compliance'),
  generateStandardsIndex: vi.fn(() => '## Standards Index')
}));

import { initCommand } from '../../src/commands/init.js';
import { isInitialized, writeManifest } from '../../src/utils/copier.js';
import { detectAll } from '../../src/utils/detector.js';
import { promptConfirm } from '../../src/prompts/init.js';

describe('Init Command', () => {
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

  describe('initCommand', () => {
    it('should show warning if already initialized', async () => {
      isInitialized.mockReturnValue(true);

      await initCommand({});

      const output = consoleLogs.join('\n');
      expect(output).toContain('Standards already initialized');
    });

    it('should detect project characteristics', async () => {
      isInitialized.mockReturnValue(false);
      promptConfirm.mockResolvedValue(false);

      await initCommand({});

      expect(detectAll).toHaveBeenCalledWith('/test/project');
    });

    it('should show detected languages', async () => {
      isInitialized.mockReturnValue(false);
      promptConfirm.mockResolvedValue(false);

      await initCommand({});

      const output = consoleLogs.join('\n');
      expect(output).toContain('javascript');
    });

    it('should proceed with installation when confirmed', async () => {
      isInitialized.mockReturnValue(false);
      promptConfirm.mockResolvedValue(true);

      await expect(initCommand({})).rejects.toThrow('process.exit called');

      const output = consoleLogs.join('\n');
      expect(output).toContain('Standards initialized successfully');
    });

    it('should cancel installation when not confirmed', async () => {
      isInitialized.mockReturnValue(false);
      promptConfirm.mockResolvedValue(false);

      await initCommand({});

      const output = consoleLogs.join('\n');
      expect(output).toContain('Installation cancelled');
    });

    it('should use default options in non-interactive mode', async () => {
      isInitialized.mockReturnValue(false);

      await expect(initCommand({ yes: true })).rejects.toThrow('process.exit called');

      const output = consoleLogs.join('\n');
      expect(output).toContain('Level: 2');
      // When no skills-compatible tools are detected, skills default to 'none' (Complete standards)
      expect(output).toContain('Standards Scope: Complete');
    });

    it('should respect level option', async () => {
      isInitialized.mockReturnValue(false);

      await expect(initCommand({ yes: true, level: '3' })).rejects.toThrow('process.exit called');

      const output = consoleLogs.join('\n');
      expect(output).toContain('Level: 3');
    });

    it('should show configuration summary', async () => {
      isInitialized.mockReturnValue(false);
      promptConfirm.mockResolvedValue(true);

      await expect(initCommand({})).rejects.toThrow('process.exit called');

      const output = consoleLogs.join('\n');
      expect(output).toContain('Configuration Summary');
    });

    it('should show next steps after installation', async () => {
      isInitialized.mockReturnValue(false);
      promptConfirm.mockResolvedValue(true);

      await expect(initCommand({})).rejects.toThrow('process.exit called');

      const output = consoleLogs.join('\n');
      expect(output).toContain('Next steps');
      expect(output).toContain('.standards');
    });

    it('should use marketplace location when --skills-location=marketplace', async () => {
      isInitialized.mockReturnValue(false);

      await expect(initCommand({
        yes: true,
        skillsLocation: 'marketplace'
      })).rejects.toThrow('process.exit called');

      const output = consoleLogs.join('\n');
      expect(output).toContain('Plugin Marketplace');
    });

    it('should use full scope when --skills-location=none', async () => {
      isInitialized.mockReturnValue(false);

      await expect(initCommand({
        yes: true,
        skillsLocation: 'none'
      })).rejects.toThrow('process.exit called');

      const output = consoleLogs.join('\n');
      expect(output).toContain('Standards Scope: Complete');
    });

    it('should use minimal scope when --skills-location=marketplace', async () => {
      isInitialized.mockReturnValue(false);

      await expect(initCommand({
        yes: true,
        skillsLocation: 'marketplace'
      })).rejects.toThrow('process.exit called');

      const output = consoleLogs.join('\n');
      expect(output).toContain('Standards Scope: Lean');
    });

    it('should use project location when --skills-location=project', async () => {
      isInitialized.mockReturnValue(false);

      await expect(initCommand({
        yes: true,
        skillsLocation: 'project'
      })).rejects.toThrow('process.exit called');

      const output = consoleLogs.join('\n');
      expect(output).toContain('install/update to project');
    });
  });

  describe('OpenCode Skills Support', () => {
    it('should treat OpenCode as a skills-compatible tool', async () => {
      // In --yes mode, AI tools come from detectAll
      // Mock detectAll to return only opencode detected
      detectAll.mockReturnValue({
        languages: { javascript: true },
        frameworks: {},
        aiTools: { opencode: true, claudeCode: false, cursor: false }
      });

      isInitialized.mockReturnValue(false);

      await expect(initCommand({ yes: true })).rejects.toThrow('process.exit called');

      const output = consoleLogs.join('\n');
      // When only OpenCode is detected with --yes, skills should be offered
      // Default is marketplace for skills-compatible tools
      expect(output).toContain('Plugin Marketplace');
    });

    it('should offer skills when both Claude Code and OpenCode are selected', async () => {
      // Mock detectAll to return both claude-code and opencode detected
      detectAll.mockReturnValue({
        languages: { javascript: true },
        frameworks: {},
        aiTools: { claudeCode: true, opencode: true, cursor: false }
      });

      isInitialized.mockReturnValue(false);

      await expect(initCommand({ yes: true })).rejects.toThrow('process.exit called');

      const output = consoleLogs.join('\n');
      // Both tools support skills, so skills should be offered
      expect(output).toContain('Plugin Marketplace');
    });

    it('should NOT offer skills when OpenCode is selected with non-skills tools', async () => {
      // In --yes mode, AI tools come from detectAll, not promptAITools
      // Mock detectAll to return opencode + cursor detected
      detectAll.mockReturnValue({
        languages: { javascript: true },
        frameworks: {},
        aiTools: { opencode: true, cursor: true, claudeCode: false }
      });

      isInitialized.mockReturnValue(false);

      await expect(initCommand({ yes: true })).rejects.toThrow('process.exit called');

      // When non-skills tools (cursor) are included, skills should not be offered
      // and Standards Scope should be Complete (full standards)
      const output = consoleLogs.join('\n');
      expect(output).toContain('Standards Scope: Complete');
    });
  });

  describe('Manifest Generation in Non-Interactive Mode', () => {
    it('should save standard options to manifest in non-interactive mode', async () => {
      isInitialized.mockReturnValue(false);

      await expect(initCommand({ yes: true })).rejects.toThrow('process.exit called');

      // Verify writeManifest was called with correct options
      expect(writeManifest).toHaveBeenCalled();
      const manifestArg = writeManifest.mock.calls[0][0];

      expect(manifestArg.options).toEqual({
        workflow: 'github-flow',
        merge_strategy: 'squash',
        commit_language: 'english',
        test_levels: ['unit-testing', 'integration-testing']
      });
    });

    it('should save detected aiTools to manifest in non-interactive mode', async () => {
      // Mock detectAll to return Claude Code detected
      detectAll.mockReturnValue({
        languages: { javascript: true },
        frameworks: {},
        aiTools: { claudeCode: true, cursor: false }
      });

      isInitialized.mockReturnValue(false);

      await expect(initCommand({ yes: true })).rejects.toThrow('process.exit called');

      // Verify writeManifest was called with correct aiTools
      expect(writeManifest).toHaveBeenCalled();
      const manifestArg = writeManifest.mock.calls[0][0];

      expect(manifestArg.aiTools).toEqual(['claude-code']);
    });

    it('should save multiple detected aiTools to manifest', async () => {
      // Mock detectAll to return multiple AI tools detected
      detectAll.mockReturnValue({
        languages: { javascript: true },
        frameworks: {},
        aiTools: { claudeCode: true, opencode: true, cursor: false }
      });

      isInitialized.mockReturnValue(false);

      await expect(initCommand({ yes: true })).rejects.toThrow('process.exit called');

      // Verify writeManifest was called with correct aiTools
      expect(writeManifest).toHaveBeenCalled();
      const manifestArg = writeManifest.mock.calls[0][0];

      expect(manifestArg.aiTools).toContain('claude-code');
      expect(manifestArg.aiTools).toContain('opencode');
    });

    it('should respect custom options from CLI flags', async () => {
      isInitialized.mockReturnValue(false);

      await expect(initCommand({
        yes: true,
        workflow: 'gitflow',
        mergeStrategy: 'merge-commit',
        commitLang: 'traditional-chinese',
        testLevels: 'unit-testing,e2e-testing'
      })).rejects.toThrow('process.exit called');

      // Verify writeManifest was called with custom options
      expect(writeManifest).toHaveBeenCalled();
      const manifestArg = writeManifest.mock.calls[0][0];

      expect(manifestArg.options.workflow).toBe('gitflow');
      expect(manifestArg.options.merge_strategy).toBe('merge-commit');
      expect(manifestArg.options.commit_language).toBe('traditional-chinese');
      expect(manifestArg.options.test_levels).toEqual(['unit-testing', 'e2e-testing']);
    });

    it('should save options even when using minimal scope (Skills via marketplace)', async () => {
      // Mock detectAll to return Claude Code (triggers Skills/minimal scope)
      detectAll.mockReturnValue({
        languages: { javascript: true },
        frameworks: {},
        aiTools: { claudeCode: true }
      });

      isInitialized.mockReturnValue(false);

      await expect(initCommand({ yes: true })).rejects.toThrow('process.exit called');

      // Verify options are saved even with minimal scope
      expect(writeManifest).toHaveBeenCalled();
      const manifestArg = writeManifest.mock.calls[0][0];

      // Options should be saved regardless of standardsScope
      expect(manifestArg.options.workflow).toBe('github-flow');
      expect(manifestArg.options.merge_strategy).toBe('squash');
      expect(manifestArg.standardsScope).toBe('minimal');
    });

    it('should auto-install commands for detected commands-supported agents', async () => {
      // Mock detectAll to return opencode (supports commands)
      detectAll.mockReturnValue({
        languages: { javascript: true },
        frameworks: {},
        aiTools: { opencode: true, claudeCode: false }
      });

      isInitialized.mockReturnValue(false);

      await expect(initCommand({ yes: true })).rejects.toThrow('process.exit called');

      // Verify manifest includes commands installation
      expect(writeManifest).toHaveBeenCalled();
      const manifestArg = writeManifest.mock.calls[0][0];

      expect(manifestArg.commands.installed).toBe(true);
      // Commands installations now use {agent, level} format
      expect(manifestArg.commands.installations.some(i => i.agent === 'opencode')).toBe(true);
    });

    it('should not install commands for agents that do not support commands', async () => {
      // Mock detectAll to return only claude-code (no file-based commands)
      detectAll.mockReturnValue({
        languages: { javascript: true },
        frameworks: {},
        aiTools: { claudeCode: true, cursor: false }
      });

      isInitialized.mockReturnValue(false);

      await expect(initCommand({ yes: true })).rejects.toThrow('process.exit called');

      // Verify manifest does not include commands installation
      expect(writeManifest).toHaveBeenCalled();
      const manifestArg = writeManifest.mock.calls[0][0];

      expect(manifestArg.commands.installed).toBe(false);
      expect(manifestArg.commands.installations).toEqual([]);
    });

    it('should install commands for multiple commands-supported agents', async () => {
      // Mock detectAll to return opencode and copilot (both support commands)
      detectAll.mockReturnValue({
        languages: { javascript: true },
        frameworks: {},
        aiTools: { opencode: true, copilot: true }
      });

      isInitialized.mockReturnValue(false);

      await expect(initCommand({ yes: true })).rejects.toThrow('process.exit called');

      // Verify manifest includes both agents
      expect(writeManifest).toHaveBeenCalled();
      const manifestArg = writeManifest.mock.calls[0][0];

      expect(manifestArg.commands.installed).toBe(true);
      // Commands installations now use {agent, level} format
      expect(manifestArg.commands.installations.some(i => i.agent === 'opencode')).toBe(true);
      expect(manifestArg.commands.installations.some(i => i.agent === 'copilot')).toBe(true);
    });
  });
});
