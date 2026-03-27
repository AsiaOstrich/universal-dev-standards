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

// Use hoisted to define mocks before vi.mock
const { mockSelect, mockCheckbox, mockConfirm, mockInput } = vi.hoisted(() => ({
  mockSelect: vi.fn(),
  mockCheckbox: vi.fn(),
  mockConfirm: vi.fn(),
  mockInput: vi.fn()
}));

vi.mock('@inquirer/prompts', () => ({
  select: mockSelect,
  checkbox: mockCheckbox,
  confirm: mockConfirm,
  input: mockInput,
  Separator: class Separator { constructor(t) { this.text = t; } }
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
    mockSelect.mockReset(); mockCheckbox.mockReset(); mockConfirm.mockReset(); mockInput.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  describe('promptIntegrationMode', () => {
    it('should return default mode', async () => {
      mockSelect.mockResolvedValue('default');

      const result = await promptIntegrationMode();

      expect(result).toBe('default');
    });

    it('should return custom mode', async () => {
      mockSelect.mockResolvedValue('custom');

      const result = await promptIntegrationMode();

      expect(result).toBe('custom');
    });

    it('should return merge mode', async () => {
      mockSelect.mockResolvedValue('merge');

      const result = await promptIntegrationMode();

      expect(result).toBe('merge');
    });
  });

  describe('promptRuleCategories', () => {
    it('should return selected categories', async () => {
      mockCheckbox.mockResolvedValue(['anti-hallucination', 'commit-standards']);

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
      mockCheckbox.mockResolvedValue(['javascript', 'python']);

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
      mockConfirm.mockResolvedValue(false);

      const result = await promptExclusions();

      expect(result).toEqual([]);
    });

    it('should return exclusion patterns', async () => {
      mockConfirm.mockResolvedValueOnce(true);
      mockInput.mockResolvedValueOnce('*.test.js, node_modules');

      const result = await promptExclusions();

      expect(result).toEqual(['*.test.js', 'node_modules']);
    });
  });

  describe('promptCustomRules', () => {
    it('should return empty array when no custom rules wanted', async () => {
      mockConfirm.mockResolvedValue(false);

      const result = await promptCustomRules();

      expect(result).toEqual([]);
    });

    it('should return custom rules', async () => {
      mockConfirm.mockResolvedValueOnce(true);
      mockInput
        .mockResolvedValueOnce('Custom rule 1')
        .mockResolvedValueOnce('Custom rule 2')
        .mockResolvedValueOnce('');

      const result = await promptCustomRules();

      expect(result).toEqual(['Custom rule 1', 'Custom rule 2']);
    });
  });

  describe('promptMergeStrategy', () => {
    it('should return append strategy', async () => {
      mockSelect.mockResolvedValue('append');

      const result = await promptMergeStrategy('cursor');

      expect(result).toBe('append');
    });

    it('should return overwrite strategy', async () => {
      mockSelect.mockResolvedValue('overwrite');

      const result = await promptMergeStrategy('cursor');

      expect(result).toBe('overwrite');
    });

    it('should return keep strategy', async () => {
      mockSelect.mockResolvedValue('keep');

      const result = await promptMergeStrategy('windsurf');

      expect(result).toBe('keep');
    });
  });

  describe('promptDetailLevel', () => {
    it('should return minimal level', async () => {
      mockSelect.mockResolvedValue('minimal');

      const result = await promptDetailLevel();

      expect(result).toBe('minimal');
    });

    it('should return standard level', async () => {
      mockSelect.mockResolvedValue('standard');

      const result = await promptDetailLevel();

      expect(result).toBe('standard');
    });

    it('should return comprehensive level', async () => {
      mockSelect.mockResolvedValue('comprehensive');

      const result = await promptDetailLevel();

      expect(result).toBe('comprehensive');
    });
  });

  describe('promptRuleLanguage', () => {
    it('should return en', async () => {
      mockSelect.mockResolvedValue('en');

      const result = await promptRuleLanguage();

      expect(result).toBe('en');
    });

    it('should return zh-tw', async () => {
      mockSelect.mockResolvedValue('zh-tw');

      const result = await promptRuleLanguage();

      expect(result).toBe('zh-tw');
    });

    it('should return bilingual', async () => {
      mockSelect.mockResolvedValue('bilingual');

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
      mockSelect.mockResolvedValue('keep');

      const result = await promptIntegrationConfig('cursor', {}, true);

      expect(result.mergeStrategy).toBe('keep');
      expect(result.tool).toBe('cursor');
    });

    it('should prompt for mode when no existing rules', async () => {
      mockSelect.mockResolvedValue('default');

      const result = await promptIntegrationConfig('cursor', {}, false);

      expect(result.mode).toBe('default');
    });

    it('should use default mode when merge selected but no existing file', async () => {
      mockSelect.mockResolvedValueOnce('merge');

      const result = await promptIntegrationConfig('cursor', {}, false);

      expect(result.mode).toBe('default');
    });

    it('should prompt for all options in custom mode', async () => {
      mockSelect
        .mockResolvedValueOnce('overwrite')
        .mockResolvedValueOnce('custom')
        .mockResolvedValueOnce('standard')
        .mockResolvedValueOnce('en');
      mockCheckbox
        .mockResolvedValueOnce(['anti-hallucination'])
        .mockResolvedValueOnce([]);
      mockConfirm
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(false);

      const result = await promptIntegrationConfig('cursor', { languages: {} }, true);

      expect(result.mode).toBe('custom');
      expect(result.categories).toEqual(['anti-hallucination']);
    });
  });
});
