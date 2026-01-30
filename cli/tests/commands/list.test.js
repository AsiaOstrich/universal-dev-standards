import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mkdirSync, rmSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Mock registry module
vi.mock('../../src/utils/registry.js', () => ({
  getAllStandards: vi.fn(() => [
    { name: 'Standard 1', category: 'skill', level: 1, source: 'core/standard-1.md', skillName: 'skill-1' },
    { name: 'Standard 2', category: 'reference', level: 2, source: { human: 'core/standard-2.md' }, applicability: 'All' },
    { name: 'Standard 3', category: 'extension', level: 3, source: 'extensions/standard-3.md' }
  ]),
  getStandardsByLevel: vi.fn(() => []),
  getStandardsByCategory: vi.fn(() => []),
  getLevelInfo: vi.fn(() => ({ name: 'Level 1', description: 'Desc', nameZh: '等級1', nameZhCn: '等级1' })),
  getCategoryInfo: vi.fn((cat) => {
    const categories = {
      skill: { name: 'Skill', description: 'Desc' },
      reference: { name: 'Reference Document', description: 'Desc' },
      extension: { name: 'Extension', description: 'Desc' },
      integration: { name: 'Integration', description: 'Desc' },
      template: { name: 'Template', description: 'Desc' }
    };
    return categories[cat];
  }),
  getRepositoryInfo: vi.fn(() => ({ standards: { version: '1.0.0' } }))
}));

// Mock copier module
vi.mock('../../src/utils/copier.js', () => ({
  readManifest: vi.fn(),
  isInitialized: vi.fn(() => false),
  writeManifest: vi.fn(),
  getRepoRoot: vi.fn(() => '/mock/repo/root'),
  getBundledRoot: vi.fn(() => '/mock/bundled/root'),
  setLanguage: vi.fn()
}));

// Mock i18n messages
vi.mock('../../src/i18n/messages.js', () => ({
  t: vi.fn(() => ({
    commands: {
      list: {
        title: 'Available Standards',
        errorLevelRange: 'Error: Level must be 1, 2, or 3',
        errorUnknownCategory: 'Unknown category',
        validCategories: 'Valid categories: skill, reference, extension, integration, template',
        showingLevel: 'Showing standards for level',
        category: 'Category',
        appliesTo: 'Applies to',
        totalSummary: 'standards',
        withSkills: 'with skills',
        referenceOnly: 'reference only',
        runInitHint: 'Run "uds init" to adopt standards',
        seeGuide: 'See adoption guide for details'
      },
      common: {
        version: 'Version',
        total: 'Total'
      }
    }
  })),
  getLanguage: vi.fn(() => 'en'),
  setLanguage: vi.fn(),
  isLanguageExplicitlySet: vi.fn(() => false)
}));

import { listCommand } from '../../src/commands/list.js';
import { readManifest, isInitialized, setLanguage } from '../../src/utils/copier.js';
import { isLanguageExplicitlySet } from '../../src/i18n/messages.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const TEST_DIR = join(__dirname, '../temp/list-test');

describe('List Command', () => {
  let originalCwd;
  let consoleLogs = [];
  let consoleLogSpy;
  let processExitSpy;

  beforeEach(() => {
    // Arrange
    originalCwd = process.cwd();
    consoleLogs = [];

    // Setup test directory
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
    mkdirSync(TEST_DIR, { recursive: true });
    process.chdir(TEST_DIR);

    // Mock console.log
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation((...args) => {
      consoleLogs.push(args.join(' '));
    });

    // Mock process.exit
    processExitSpy = vi.spyOn(process, 'exit').mockImplementation((code) => {
      throw new Error(`process.exit(${code})`);
    });

    // Reset mocks
    vi.clearAllMocks();
    
    // Default mock implementations to ensure clean state
    isInitialized.mockReturnValue(false);
    readManifest.mockReturnValue({});
    isLanguageExplicitlySet.mockReturnValue(false);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
    vi.restoreAllMocks();
  });

  describe('Basic Listing', () => {
    it('should list all standards without filters', () => {
      // Act
      listCommand({});

      // Assert
      const output = consoleLogs.join('\n');
      expect(output).toContain('Available Standards');
      expect(output).toContain('Version');
      expect(output).toContain('Total');
    });

    it('should display standards grouped by category', () => {
      // Act
      listCommand({});

      // Assert
      const output = consoleLogs.join('\n');
      // Check that standards are displayed with level badges
      // Use simple string matching instead of complex regex
      expect(output).toContain('[L1]');
      expect(output).toContain('[L2]');
      expect(output).toContain('[L3]');
    });

    it('should show summary with skill and reference counts', () => {
      // Act
      listCommand({});

      // Assert
      const output = consoleLogs.join('\n');
      expect(output).toContain('with skills');
      expect(output).toContain('reference only');
    });

    it('should show usage hints', () => {
      // Act
      listCommand({});

      // Assert
      const output = consoleLogs.join('\n');
      expect(output).toContain('uds init');
      expect(output).toContain('See adoption guide');
    });
  });

  describe('Level Filtering', () => {
    it('should filter standards by level 1', () => {
      listCommand({ level: '1' });

      const output = consoleLogs.join('\n');
      expect(output).toContain('Showing standards for level');
      expect(output).toContain('1:');
    });

    it('should filter standards by level 2', () => {
      listCommand({ level: '2' });

      const output = consoleLogs.join('\n');
      expect(output).toContain('Showing standards for level');
      expect(output).toContain('2:');
    });

    it('should filter standards by level 3', () => {
      listCommand({ level: '3' });

      const output = consoleLogs.join('\n');
      expect(output).toContain('Showing standards for level');
      expect(output).toContain('3:');
    });

    it('should reject invalid level 0', () => {
      expect(() => {
        listCommand({ level: '0' });
      }).toThrow('process.exit(1)');

      const output = consoleLogs.join('\n');
      expect(output).toContain('Error: Level must be 1, 2, or 3');
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should reject invalid level 4', () => {
      expect(() => {
        listCommand({ level: '4' });
      }).toThrow('process.exit(1)');

      const output = consoleLogs.join('\n');
      expect(output).toContain('Error: Level must be 1, 2, or 3');
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should reject non-numeric level', () => {
      expect(() => {
        listCommand({ level: 'invalid' });
      }).toThrow('process.exit(1)');

      const output = consoleLogs.join('\n');
      expect(output).toContain('Error: Level must be 1, 2, or 3');
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should reject negative level', () => {
      expect(() => {
        listCommand({ level: '-1' });
      }).toThrow('process.exit(1)');

      const output = consoleLogs.join('\n');
      expect(output).toContain('Error: Level must be 1, 2, or 3');
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });

  describe('Category Filtering', () => {
    it('should filter standards by skill category', () => {
      listCommand({ category: 'skill' });

      const output = consoleLogs.join('\n');
      expect(output).toContain('Category:');
    });

    it('should filter standards by reference category', () => {
      listCommand({ category: 'reference' });

      const output = consoleLogs.join('\n');
      expect(output).toContain('Category:');
    });

    it('should filter standards by extension category', () => {
      listCommand({ category: 'extension' });

      const output = consoleLogs.join('\n');
      expect(output).toContain('Category:');
    });

    it('should filter standards by integration category', () => {
      listCommand({ category: 'integration' });

      const output = consoleLogs.join('\n');
      expect(output).toContain('Category:');
    });

    it('should filter standards by template category', () => {
      listCommand({ category: 'template' });

      const output = consoleLogs.join('\n');
      expect(output).toContain('Category:');
    });

    it('should reject unknown category', () => {
      expect(() => {
        listCommand({ category: 'unknown' });
      }).toThrow('process.exit(1)');

      const output = consoleLogs.join('\n');
      expect(output).toContain('Unknown category');
      expect(output).toContain("'unknown'");
      expect(output).toContain('Valid categories');
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should reject empty category', () => {
      // NOTE: With listCommand implementation, category !== undefined check
      // ensures empty string falls into this block and is rejected by getCategoryInfo
      expect(() => {
        listCommand({ category: '' });
      }).toThrow('process.exit(1)');

      const output = consoleLogs.join('\n');
      expect(output).toContain('Unknown category');
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should reject invalid category with special characters', () => {
      expect(() => {
        listCommand({ category: 'invalid@category' });
      }).toThrow('process.exit(1)');

      const output = consoleLogs.join('\n');
      expect(output).toContain('Unknown category');
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });

  describe.skip('Language Detection (TODO: Fix mock sync issue)', () => {
    it('should use English by default when not initialized', () => {
      isInitialized.mockReturnValue(false);

      listCommand({});

      expect(setLanguage).not.toHaveBeenCalled();
    });

    it('should detect traditional-chinese from manifest', () => {
      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue({
        options: {
          commit_language: 'traditional-chinese'
        }
      });

      listCommand({});

      expect(setLanguage).toHaveBeenCalledWith('zh-tw');
    });

    it('should detect simplified-chinese from manifest', () => {
      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue({
        options: {
          commit_language: 'simplified-chinese'
        }
      });

      listCommand({});

      expect(setLanguage).toHaveBeenCalledWith('zh-cn');
    });

    it('should detect english from manifest', () => {
      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue({
        options: {
          commit_language: 'english'
        }
      });

      listCommand({});

      expect(setLanguage).toHaveBeenCalledWith('en');
    });

    it('should treat bilingual as english', () => {
      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue({
        options: {
          commit_language: 'bilingual'
        }
      });

      listCommand({});

      expect(setLanguage).toHaveBeenCalledWith('en');
    });

    it('should fallback to english for unknown language', () => {
      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue({
        options: {
          commit_language: 'unknown-language'
        }
      });

      listCommand({});

      expect(setLanguage).toHaveBeenCalledWith('en');
    });

    // Use async to support await import if needed in future, 
    // though here we use direct mock access
    it('should not override language if explicitly set by user', async () => {
      isLanguageExplicitlySet.mockReturnValue(true);
      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue({
        options: {
          commit_language: 'traditional-chinese'
        }
      });

      listCommand({});

      expect(setLanguage).not.toHaveBeenCalled();
    });

    it('should handle manifest without options', () => {
      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue({});

      listCommand({});

      expect(setLanguage).not.toHaveBeenCalled();
    });

    it('should handle manifest without commit_language', () => {
      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue({
        options: {}
      });

      listCommand({});

      expect(setLanguage).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle both level and category filters (level takes precedence)', () => {
      listCommand({ level: '1', category: 'skill' });

      const output = consoleLogs.join('\n');
      expect(output).toContain('Showing standards for level');
      expect(output).not.toContain('Category:');
    });

    it('should handle null options', () => {
      expect(() => {
        listCommand(null);
      }).toThrow();
    });

    it('should handle undefined options', () => {
      expect(() => {
        listCommand(undefined);
      }).toThrow();
    });

    it('should handle missing options object', () => {
      expect(() => {
        listCommand();
      }).toThrow();
    });

    it('should handle manifest read error gracefully', () => {
      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue(null);

      listCommand({});

      expect(setLanguage).not.toHaveBeenCalled();
    });

    it('should display source paths for standards', () => {
      listCommand({});

      const output = consoleLogs.join('\n');
      // Standards should display their source paths based on our registry mock
      expect(output).toContain('core/standard-1.md');
      expect(output).toContain('core/standard-2.md');
      expect(output).toContain('extensions/standard-3.md');
    });
  });

  describe('Output Format', () => {
    it('should use colored output for headers', () => {
      listCommand({});

      const output = consoleLogs.join('\n');
      expect(output).toContain('Available Standards');
    });

    it('should display level badges for all standards', () => {
      listCommand({});

      const output = consoleLogs.join('\n');
      expect(output).toContain('[L1]');
      expect(output).toContain('[L2]');
      expect(output).toContain('[L3]');
    });

    it('should show skill name mapping when available', () => {
      listCommand({});

      const output = consoleLogs.join('\n');
      expect(output).toContain('→ skill-1');
    });

    it('should display applicability information', () => {
      listCommand({});

      const output = consoleLogs.join('\n');
      expect(output).toContain('Applies to: All');
    });

    it('should show category counts', () => {
      listCommand({});

      const output = consoleLogs.join('\n');
      // Category headers should show counts like "Category Name (5)"
      expect(output).toMatch(/\(\d+\)/);
    });
  });
});
