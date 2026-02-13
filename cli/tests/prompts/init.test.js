import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock dependencies before importing the module
vi.mock('chalk', () => {
  // Create a chainable mock that works both as function and object
  const createChainableMock = () => {
    const fn = (s) => s;
    fn.bold = (s) => s;
    return fn;
  };

  return {
    default: {
      bold: (s) => s,
      gray: (s) => s,
      green: (s) => s,
      yellow: (s) => s,
      red: (s) => s,
      cyan: (s) => s,
      blue: (s) => s,
      // Support chalk.white and chalk.white.bold
      white: createChainableMock()
    }
  };
});

// Use hoisted to define mock before vi.mock
const { mockPrompt } = vi.hoisted(() => ({
  mockPrompt: vi.fn()
}));

// Create a class-like function for Separator
function MockSeparator(text) {
  this.text = text;
  this.type = 'separator';
}

vi.mock('inquirer', () => ({
  default: {
    prompt: mockPrompt,
    Separator: MockSeparator
  }
}));

import {
  promptAITools,
  promptSkillsInstallLocation,
  promptCommandsInstallation,
  promptSkillsUpdate,
  promptStandardsScope,
  promptFormat,
  promptGitWorkflow,
  promptMergeStrategy,
  promptCommitLanguage,
  promptTestLevels,
  promptStandardOptions,
  promptInstallMode,
  promptSkillsUpgrade,
  promptLevel,
  promptLanguage,
  promptFramework,
  promptLocale,
  promptIntegrations,
  promptConfirm
} from '../../src/prompts/init.js';

describe('Init Prompts', () => {
  let consoleLogs = [];

  beforeEach(() => {
    consoleLogs = [];
    vi.spyOn(console, 'log').mockImplementation((...args) => {
      consoleLogs.push(args.join(' '));
    });
    mockPrompt.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  describe('promptAITools', () => {
    it('should return selected AI tools', async () => {
      mockPrompt.mockResolvedValue({ tools: ['claude-code', 'cursor'] });

      const result = await promptAITools({});

      expect(result).toEqual(['claude-code', 'cursor']);
    });

    it('should return empty array when nothing selected', async () => {
      mockPrompt.mockResolvedValue({ tools: [] });

      const result = await promptAITools({});

      expect(result).toEqual([]);
    });
  });

  describe('promptSkillsInstallLocation', () => {
    it('should show marketplace tip for Claude Code', async () => {
      mockPrompt.mockResolvedValue({ locations: ['claude-code:user'] });

      await promptSkillsInstallLocation(['claude-code']);

      // Verify marketplace tip is shown in console output
      const output = consoleLogs.join('\n');
      expect(output).toContain('/plugin install universal-dev-standards@asia-ostrich');
    });

    it('should return user location', async () => {
      mockPrompt.mockResolvedValue({ locations: ['claude-code:user'] });

      const result = await promptSkillsInstallLocation(['claude-code']);

      expect(result).toEqual([{ agent: 'claude-code', level: 'user' }]);
    });

    it('should return project location', async () => {
      mockPrompt.mockResolvedValue({ locations: ['claude-code:project'] });

      const result = await promptSkillsInstallLocation(['claude-code']);

      expect(result).toEqual([{ agent: 'claude-code', level: 'project' }]);
    });

    it('should return empty array when none selected', async () => {
      mockPrompt.mockResolvedValue({ locations: ['none'] });

      const result = await promptSkillsInstallLocation(['claude-code']);

      expect(result).toEqual([]);
    });

    it('should prompt for Cursor skills installation (added Jan 2026, v2.3.35)', async () => {
      // Cursor now supports SKILL.md as of v2.3.35 (Jan 2026)
      mockPrompt.mockResolvedValue({ locations: ['cursor:project'] });

      const result = await promptSkillsInstallLocation(['cursor']);

      expect(result).toEqual([{ agent: 'cursor', level: 'project' }]);
    });

    it('should support multi-agent selection', async () => {
      mockPrompt.mockResolvedValue({ locations: ['claude-code:user', 'opencode:project'] });

      const result = await promptSkillsInstallLocation(['claude-code', 'opencode']);

      expect(result).toEqual([
        { agent: 'claude-code', level: 'user' },
        { agent: 'opencode', level: 'project' }
      ]);
    });
  });

  describe('promptCommandsInstallation', () => {
    it('should return user level location', async () => {
      mockPrompt.mockResolvedValue({ locations: ['opencode:user'] });

      const result = await promptCommandsInstallation(['opencode']);

      expect(result).toEqual([{ agent: 'opencode', level: 'user' }]);
    });

    it('should return project level location', async () => {
      mockPrompt.mockResolvedValue({ locations: ['opencode:project'] });

      const result = await promptCommandsInstallation(['opencode']);

      expect(result).toEqual([{ agent: 'opencode', level: 'project' }]);
    });

    it('should prompt for Cursor commands installation (added Jan 2026, v2.3.35)', async () => {
      // Cursor now supports commands as of v2.3.35 (Jan 2026)
      mockPrompt.mockResolvedValue({ locations: ['cursor:project'] });

      const result = await promptCommandsInstallation(['cursor']);

      expect(result).toEqual([{ agent: 'cursor', level: 'project' }]);
    });

    it('should return empty array when empty selection', async () => {
      mockPrompt.mockResolvedValue({ locations: [] });

      const result = await promptCommandsInstallation(['opencode']);

      expect(result).toEqual([]);
    });

    it('should support multi-agent selection with different levels', async () => {
      mockPrompt.mockResolvedValue({ locations: ['opencode:user', 'copilot:project'] });

      const result = await promptCommandsInstallation(['opencode', 'copilot']);

      expect(result).toEqual([
        { agent: 'opencode', level: 'user' },
        { agent: 'copilot', level: 'project' }
      ]);
    });

    it('should deduplicate same agent with both levels, keeping project', async () => {
      mockPrompt.mockResolvedValue({ locations: ['opencode:user', 'opencode:project'] });

      const result = await promptCommandsInstallation(['opencode']);

      expect(result).toEqual([
        { agent: 'opencode', level: 'project' }
      ]);
    });
  });

  describe('promptSkillsInstallLocation deduplication', () => {
    it('should deduplicate same agent selected at both levels, keeping project', async () => {
      mockPrompt.mockResolvedValue({ locations: ['claude-code:user', 'claude-code:project'] });

      const result = await promptSkillsInstallLocation(['claude-code']);

      expect(result).toEqual([
        { agent: 'claude-code', level: 'project' }
      ]);
    });

    it('should show warning when deduplicating', async () => {
      mockPrompt.mockResolvedValue({ locations: ['claude-code:user', 'claude-code:project'] });

      await promptSkillsInstallLocation(['claude-code']);

      const output = consoleLogs.join('\n');
      expect(output).toContain('Claude Code');
    });

    it('should not deduplicate different agents', async () => {
      mockPrompt.mockResolvedValue({ locations: ['claude-code:user', 'opencode:project'] });

      const result = await promptSkillsInstallLocation(['claude-code', 'opencode']);

      expect(result).toEqual([
        { agent: 'claude-code', level: 'user' },
        { agent: 'opencode', level: 'project' }
      ]);
    });
  });

  describe('promptSkillsUpdate', () => {
    it('should return none when nothing needs update', async () => {
      const result = await promptSkillsUpdate(
        { installed: true, version: '1.0.0' },
        { installed: true, version: '1.0.0' },
        '1.0.0'
      );

      expect(result).toEqual({ action: 'none', targets: [] });
    });

    it('should prompt for update when project needs update', async () => {
      mockPrompt.mockResolvedValue({ action: 'project' });

      const result = await promptSkillsUpdate(
        { installed: true, version: '0.9.0' },
        null,
        '1.0.0'
      );

      expect(result).toEqual({ action: 'project', targets: ['project'] });
    });

    it('should prompt for update when user needs update', async () => {
      mockPrompt.mockResolvedValue({ action: 'user' });

      const result = await promptSkillsUpdate(
        null,
        { installed: true, version: '0.9.0' },
        '1.0.0'
      );

      expect(result).toEqual({ action: 'user', targets: ['user'] });
    });

    it('should return both targets when both selected', async () => {
      mockPrompt.mockResolvedValue({ action: 'both' });

      const result = await promptSkillsUpdate(
        { installed: true, version: '0.9.0' },
        { installed: true, version: '0.8.0' },
        '1.0.0'
      );

      expect(result).toEqual({ action: 'both', targets: ['project', 'user'] });
    });
  });

  describe('promptStandardsScope', () => {
    it('should return full when no skills', async () => {
      const result = await promptStandardsScope(false);

      expect(result).toBe('full');
    });

    it('should prompt when skills installed', async () => {
      mockPrompt.mockResolvedValue({ scope: 'minimal' });

      const result = await promptStandardsScope(true);

      expect(result).toBe('minimal');
    });
  });

  describe('promptFormat', () => {
    it('should return selected format', async () => {
      mockPrompt.mockResolvedValue({ format: 'ai' });

      const result = await promptFormat();

      expect(result).toBe('ai');
    });

    it('should return human format', async () => {
      mockPrompt.mockResolvedValue({ format: 'human' });

      const result = await promptFormat();

      expect(result).toBe('human');
    });

    it('should return both format', async () => {
      mockPrompt.mockResolvedValue({ format: 'both' });

      const result = await promptFormat();

      expect(result).toBe('both');
    });
  });

  describe('promptGitWorkflow', () => {
    it('should return github-flow', async () => {
      mockPrompt.mockResolvedValue({ workflow: 'github-flow' });

      const result = await promptGitWorkflow();

      expect(result).toBe('github-flow');
    });

    it('should return gitflow', async () => {
      mockPrompt.mockResolvedValue({ workflow: 'gitflow' });

      const result = await promptGitWorkflow();

      expect(result).toBe('gitflow');
    });
  });

  describe('promptMergeStrategy', () => {
    it('should return squash', async () => {
      mockPrompt.mockResolvedValue({ strategy: 'squash' });

      const result = await promptMergeStrategy();

      expect(result).toBe('squash');
    });

    it('should return merge-commit', async () => {
      mockPrompt.mockResolvedValue({ strategy: 'merge-commit' });

      const result = await promptMergeStrategy();

      expect(result).toBe('merge-commit');
    });
  });

  describe('promptCommitLanguage', () => {
    it('should return english', async () => {
      mockPrompt.mockResolvedValue({ language: 'english' });

      const result = await promptCommitLanguage();

      expect(result).toBe('english');
    });

    it('should return bilingual when displayLanguage is zh-tw', async () => {
      mockPrompt.mockResolvedValue({ language: 'bilingual' });

      const result = await promptCommitLanguage('zh-tw');

      expect(result).toBe('bilingual');
    });

    it('should return bilingual when displayLanguage is zh-cn', async () => {
      mockPrompt.mockResolvedValue({ language: 'bilingual' });

      const result = await promptCommitLanguage('zh-cn');

      expect(result).toBe('bilingual');
    });

    it('should work with default displayLanguage (en)', async () => {
      mockPrompt.mockResolvedValue({ language: 'traditional-chinese' });

      const result = await promptCommitLanguage();

      expect(result).toBe('traditional-chinese');
    });

    it('should accept displayLanguage parameter', async () => {
      mockPrompt.mockResolvedValue({ language: 'english' });

      // Should not throw when displayLanguage is provided
      const result = await promptCommitLanguage('en');

      expect(result).toBe('english');
    });
  });

  describe('promptTestLevels', () => {
    it('should return selected test levels', async () => {
      mockPrompt.mockResolvedValue({ levels: ['unit-testing', 'integration-testing'] });

      const result = await promptTestLevels();

      expect(result).toEqual(['unit-testing', 'integration-testing']);
    });
  });

  describe('promptStandardOptions', () => {
    it('should return options for level 1', async () => {
      mockPrompt.mockResolvedValue({ language: 'english' });

      const result = await promptStandardOptions(1);

      expect(result).toHaveProperty('commit_language');
    });

    it('should return more options for level 2+', async () => {
      mockPrompt
        .mockResolvedValueOnce({ workflow: 'github-flow' })
        .mockResolvedValueOnce({ strategy: 'squash' })
        .mockResolvedValueOnce({ language: 'english' })
        .mockResolvedValueOnce({ levels: ['unit-testing'] });

      const result = await promptStandardOptions(2);

      expect(result).toHaveProperty('workflow');
      expect(result).toHaveProperty('merge_strategy');
      expect(result).toHaveProperty('commit_language');
      expect(result).toHaveProperty('test_levels');
    });

    it('should pass displayLanguage to promptCommitLanguage', async () => {
      mockPrompt.mockResolvedValue({ language: 'bilingual' });

      const result = await promptStandardOptions(1, 'zh-cn');

      expect(result.commit_language).toBe('bilingual');
    });

    it('should use default displayLanguage when not provided', async () => {
      mockPrompt.mockResolvedValue({ language: 'english' });

      const result = await promptStandardOptions(1);

      expect(result.commit_language).toBe('english');
    });
  });

  describe('promptInstallMode', () => {
    it('should return skills mode', async () => {
      mockPrompt.mockResolvedValue({ mode: 'skills' });

      const result = await promptInstallMode();

      expect(result).toBe('skills');
    });

    it('should return full mode', async () => {
      mockPrompt.mockResolvedValue({ mode: 'full' });

      const result = await promptInstallMode();

      expect(result).toBe('full');
    });
  });

  describe('promptSkillsUpgrade', () => {
    it('should return upgrade action', async () => {
      mockPrompt.mockResolvedValue({ action: 'upgrade' });

      const result = await promptSkillsUpgrade('0.9.0', '1.0.0');

      expect(result).toBe('upgrade');
    });

    it('should return keep action', async () => {
      mockPrompt.mockResolvedValue({ action: 'keep' });

      const result = await promptSkillsUpgrade('0.9.0', '1.0.0');

      expect(result).toBe('keep');
    });
  });

  describe('promptLevel', () => {
    it('should return level 1', async () => {
      mockPrompt.mockResolvedValue({ level: 1 });

      const result = await promptLevel();

      expect(result).toBe(1);
    });

    it('should return level 2', async () => {
      mockPrompt.mockResolvedValue({ level: 2 });

      const result = await promptLevel();

      expect(result).toBe(2);
    });

    it('should return level 3', async () => {
      mockPrompt.mockResolvedValue({ level: 3 });

      const result = await promptLevel();

      expect(result).toBe(3);
    });
  });

  describe('promptLanguage', () => {
    it('should return null when no languages detected', async () => {
      const result = await promptLanguage({});

      expect(result).toBeNull();
    });

    it('should return selected languages', async () => {
      mockPrompt.mockResolvedValue({ languages: ['csharp'] });

      const result = await promptLanguage({ csharp: true });

      expect(result).toEqual(['csharp']);
    });
  });

  describe('promptFramework', () => {
    it('should return null when no frameworks detected', async () => {
      const result = await promptFramework({});

      expect(result).toBeNull();
    });

    it('should return selected frameworks', async () => {
      mockPrompt.mockResolvedValue({ frameworks: ['fat-free'] });

      const result = await promptFramework({ 'fat-free': true });

      expect(result).toEqual(['fat-free']);
    });
  });

  describe('promptLocale', () => {
    it('should return zh-tw when confirmed', async () => {
      mockPrompt.mockResolvedValue({ useLocale: true });

      const result = await promptLocale();

      expect(result).toBe('zh-tw');
    });

    it('should return null when not confirmed', async () => {
      mockPrompt.mockResolvedValue({ useLocale: false });

      const result = await promptLocale();

      expect(result).toBeNull();
    });
  });

  describe('promptIntegrations', () => {
    it('should return selected integrations', async () => {
      mockPrompt.mockResolvedValue({ integrations: ['cursor', 'copilot'] });

      const result = await promptIntegrations({});

      expect(result).toEqual(['cursor', 'copilot']);
    });
  });

  describe('promptConfirm', () => {
    it('should return true when confirmed', async () => {
      mockPrompt.mockResolvedValue({ confirmed: true });

      const result = await promptConfirm('Proceed?');

      expect(result).toBe(true);
    });

    it('should return false when not confirmed', async () => {
      mockPrompt.mockResolvedValue({ confirmed: false });

      const result = await promptConfirm('Proceed?');

      expect(result).toBe(false);
    });
  });
});
