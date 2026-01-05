import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock dependencies before importing the module
vi.mock('chalk', () => ({
  default: {
    bold: vi.fn((s) => s),
    gray: vi.fn((s) => s),
    green: vi.fn((s) => s),
    yellow: vi.fn((s) => s),
    red: vi.fn((s) => s),
    cyan: vi.fn((s) => s),
    blue: vi.fn((s) => s)
  }
}));

// Use hoisted to define mock before vi.mock
const { mockPrompt } = vi.hoisted(() => ({
  mockPrompt: vi.fn()
}));

vi.mock('inquirer', () => ({
  default: {
    prompt: mockPrompt
  }
}));

import {
  promptIntegrationMode,
  promptRuleCategories,
  promptLanguageRules,
  promptExclusions,
  promptCustomRules,
  promptMergeStrategy,
  promptDetailLevel,
  promptRuleLanguage,
  getRuleCategories,
  getLanguageRules,
  promptIntegrationConfig
} from '../../src/prompts/integrations.js';

describe('Integration Prompts', () => {
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

  describe('promptIntegrationMode', () => {
    it('should return default mode', async () => {
      mockPrompt.mockResolvedValue({ mode: 'default' });

      const result = await promptIntegrationMode();

      expect(result).toBe('default');
    });

    it('should return custom mode', async () => {
      mockPrompt.mockResolvedValue({ mode: 'custom' });

      const result = await promptIntegrationMode();

      expect(result).toBe('custom');
    });

    it('should return merge mode', async () => {
      mockPrompt.mockResolvedValue({ mode: 'merge' });

      const result = await promptIntegrationMode();

      expect(result).toBe('merge');
    });
  });

  describe('promptRuleCategories', () => {
    it('should return selected categories', async () => {
      mockPrompt.mockResolvedValue({ categories: ['anti-hallucination', 'commit-standards'] });

      const result = await promptRuleCategories({});

      expect(result).toEqual(['anti-hallucination', 'commit-standards']);
    });
  });

  describe('promptLanguageRules', () => {
    it('should return empty array when no languages detected', async () => {
      const result = await promptLanguageRules({});

      expect(result).toEqual([]);
    });

    it('should return selected languages', async () => {
      mockPrompt.mockResolvedValue({ languages: ['javascript', 'python'] });

      const result = await promptLanguageRules({ javascript: true, python: true });

      expect(result).toEqual(['javascript', 'python']);
    });

    it('should filter out unsupported languages', async () => {
      const result = await promptLanguageRules({ unsupportedLang: true });

      expect(result).toEqual([]);
    });
  });

  describe('promptExclusions', () => {
    it('should return empty array when no exclusions wanted', async () => {
      mockPrompt.mockResolvedValue({ hasExclusions: false });

      const result = await promptExclusions();

      expect(result).toEqual([]);
    });

    it('should return exclusion patterns', async () => {
      mockPrompt
        .mockResolvedValueOnce({ hasExclusions: true })
        .mockResolvedValueOnce({ exclusions: ['*.test.js', 'node_modules'] });

      const result = await promptExclusions();

      expect(result).toEqual(['*.test.js', 'node_modules']);
    });
  });

  describe('promptCustomRules', () => {
    it('should return empty array when no custom rules wanted', async () => {
      mockPrompt.mockResolvedValue({ hasCustomRules: false });

      const result = await promptCustomRules();

      expect(result).toEqual([]);
    });

    it('should return custom rules', async () => {
      mockPrompt
        .mockResolvedValueOnce({ hasCustomRules: true })
        .mockResolvedValueOnce({ rule: 'Custom rule 1' })
        .mockResolvedValueOnce({ rule: 'Custom rule 2' })
        .mockResolvedValueOnce({ rule: '' });

      const result = await promptCustomRules();

      expect(result).toEqual(['Custom rule 1', 'Custom rule 2']);
    });
  });

  describe('promptMergeStrategy', () => {
    it('should return append strategy', async () => {
      mockPrompt.mockResolvedValue({ strategy: 'append' });

      const result = await promptMergeStrategy('cursor');

      expect(result).toBe('append');
    });

    it('should return overwrite strategy', async () => {
      mockPrompt.mockResolvedValue({ strategy: 'overwrite' });

      const result = await promptMergeStrategy('cursor');

      expect(result).toBe('overwrite');
    });

    it('should return keep strategy', async () => {
      mockPrompt.mockResolvedValue({ strategy: 'keep' });

      const result = await promptMergeStrategy('windsurf');

      expect(result).toBe('keep');
    });
  });

  describe('promptDetailLevel', () => {
    it('should return minimal level', async () => {
      mockPrompt.mockResolvedValue({ level: 'minimal' });

      const result = await promptDetailLevel();

      expect(result).toBe('minimal');
    });

    it('should return standard level', async () => {
      mockPrompt.mockResolvedValue({ level: 'standard' });

      const result = await promptDetailLevel();

      expect(result).toBe('standard');
    });

    it('should return comprehensive level', async () => {
      mockPrompt.mockResolvedValue({ level: 'comprehensive' });

      const result = await promptDetailLevel();

      expect(result).toBe('comprehensive');
    });
  });

  describe('promptRuleLanguage', () => {
    it('should return en', async () => {
      mockPrompt.mockResolvedValue({ language: 'en' });

      const result = await promptRuleLanguage();

      expect(result).toBe('en');
    });

    it('should return zh-tw', async () => {
      mockPrompt.mockResolvedValue({ language: 'zh-tw' });

      const result = await promptRuleLanguage();

      expect(result).toBe('zh-tw');
    });

    it('should return bilingual', async () => {
      mockPrompt.mockResolvedValue({ language: 'bilingual' });

      const result = await promptRuleLanguage();

      expect(result).toBe('bilingual');
    });
  });

  describe('getRuleCategories', () => {
    it('should return rule categories object', () => {
      const categories = getRuleCategories();

      expect(categories).toHaveProperty('anti-hallucination');
      expect(categories).toHaveProperty('commit-standards');
      expect(categories).toHaveProperty('code-review');
      expect(categories).toHaveProperty('testing');
    });

    it('should have required properties for each category', () => {
      const categories = getRuleCategories();

      for (const [, category] of Object.entries(categories)) {
        expect(category).toHaveProperty('name');
        expect(category).toHaveProperty('nameZh');
        expect(category).toHaveProperty('description');
        expect(category).toHaveProperty('default');
      }
    });
  });

  describe('getLanguageRules', () => {
    it('should return language rules object', () => {
      const rules = getLanguageRules();

      expect(rules).toHaveProperty('javascript');
      expect(rules).toHaveProperty('python');
      expect(rules).toHaveProperty('csharp');
      expect(rules).toHaveProperty('php');
    });

    it('should have required properties for each language', () => {
      const rules = getLanguageRules();

      for (const [, lang] of Object.entries(rules)) {
        expect(lang).toHaveProperty('name');
        expect(lang).toHaveProperty('rules');
        expect(Array.isArray(lang.rules)).toBe(true);
      }
    });
  });

  describe('promptIntegrationConfig', () => {
    it('should return config with keep strategy when existing rules and user chooses keep', async () => {
      mockPrompt.mockResolvedValue({ strategy: 'keep' });

      const result = await promptIntegrationConfig('cursor', {}, true);

      expect(result.mergeStrategy).toBe('keep');
      expect(result.tool).toBe('cursor');
    });

    it('should prompt for mode when no existing rules', async () => {
      mockPrompt.mockResolvedValue({ mode: 'default' });

      const result = await promptIntegrationConfig('cursor', {}, false);

      expect(result.mode).toBe('default');
    });

    it('should use default mode when merge selected but no existing file', async () => {
      mockPrompt
        .mockResolvedValueOnce({ mode: 'merge' });

      const result = await promptIntegrationConfig('cursor', {}, false);

      expect(result.mode).toBe('default');
    });

    it('should prompt for all options in custom mode', async () => {
      mockPrompt
        .mockResolvedValueOnce({ strategy: 'overwrite' })
        .mockResolvedValueOnce({ mode: 'custom' })
        .mockResolvedValueOnce({ categories: ['anti-hallucination'] })
        .mockResolvedValueOnce({ languages: [] })
        .mockResolvedValueOnce({ level: 'standard' })
        .mockResolvedValueOnce({ language: 'en' })
        .mockResolvedValueOnce({ hasExclusions: false })
        .mockResolvedValueOnce({ hasCustomRules: false });

      const result = await promptIntegrationConfig('cursor', { languages: {} }, true);

      expect(result.mode).toBe('custom');
      expect(result.categories).toEqual(['anti-hallucination']);
    });
  });
});
