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
import { isInitialized } from '../../src/utils/copier.js';
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
      // Default skills location should be marketplace
      expect(output).toContain('Plugin Marketplace');
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
});
