import { describe, it, expect } from 'vitest';
import {
  parseReferences,
  getCategoryStandardPaths,
  getStandardCategory,
  compareStandardsWithReferences,
  calculateCategoriesFromStandards,
  getStandardsForCategories,
  arraysEqual,
  getToolFromPath,
  CATEGORY_TO_STANDARDS,
  STANDARD_TO_CATEGORY
} from '../../../src/utils/reference-sync.js';

describe('Reference Sync Utils', () => {
  describe('parseReferences', () => {
    it('should parse single English reference', () => {
      const content = `## Anti-Hallucination
Reference: .standards/anti-hallucination.md

Some content here.`;

      const refs = parseReferences(content);

      expect(refs).toHaveLength(1);
      expect(refs).toContain('anti-hallucination.md');
    });

    it('should parse single Chinese reference', () => {
      const content = `## 反幻覺協議
參考: .standards/anti-hallucination.md

一些內容。`;

      const refs = parseReferences(content);

      expect(refs).toHaveLength(1);
      expect(refs).toContain('anti-hallucination.md');
    });

    it('should parse multiple references', () => {
      const content = `## Section 1
Reference: .standards/anti-hallucination.md

## Section 2
Reference: .standards/commit-message-guide.md

## Section 3
Reference: .standards/code-review-checklist.md`;

      const refs = parseReferences(content);

      expect(refs).toHaveLength(3);
      expect(refs).toContain('anti-hallucination.md');
      expect(refs).toContain('commit-message-guide.md');
      expect(refs).toContain('code-review-checklist.md');
    });

    it('should deduplicate references', () => {
      const content = `## Section 1
Reference: .standards/anti-hallucination.md

## Section 2
Reference: .standards/anti-hallucination.md`;

      const refs = parseReferences(content);

      expect(refs).toHaveLength(1);
      expect(refs).toContain('anti-hallucination.md');
    });

    it('should return empty array when no references found', () => {
      const content = `## Some Header
No references here.

Just regular content.`;

      const refs = parseReferences(content);

      expect(refs).toHaveLength(0);
    });

    it('should handle mixed English and Chinese references', () => {
      const content = `## English Section
Reference: .standards/anti-hallucination.md

## 中文區塊
參考: .standards/commit-message-guide.md`;

      const refs = parseReferences(content);

      expect(refs).toHaveLength(2);
      expect(refs).toContain('anti-hallucination.md');
      expect(refs).toContain('commit-message-guide.md');
    });

    it('should handle case-insensitive Reference keyword', () => {
      const content = `REFERENCE: .standards/anti-hallucination.md
reference: .standards/commit-message-guide.md`;

      const refs = parseReferences(content);

      expect(refs).toHaveLength(2);
    });
  });

  describe('getCategoryStandardPaths', () => {
    it('should return paths for anti-hallucination category', () => {
      const paths = getCategoryStandardPaths('anti-hallucination');

      expect(paths).toHaveLength(2);
      expect(paths).toContain('core/anti-hallucination.md');
      expect(paths).toContain('core/guides/anti-hallucination-guide.md');
    });

    it('should return multiple paths for code-review category', () => {
      const paths = getCategoryStandardPaths('code-review');

      expect(paths).toHaveLength(2);
      expect(paths).toContain('core/code-review-checklist.md');
      expect(paths).toContain('core/checkin-standards.md');
    });

    it('should return empty array for unknown category', () => {
      const paths = getCategoryStandardPaths('unknown-category');

      expect(paths).toHaveLength(0);
    });
  });

  describe('getStandardCategory', () => {
    it('should return category for anti-hallucination.md', () => {
      const category = getStandardCategory('core/anti-hallucination.md');

      expect(category).toBe('anti-hallucination');
    });

    it('should return category for code-review-checklist.md', () => {
      const category = getStandardCategory('core/code-review-checklist.md');

      expect(category).toBe('code-review');
    });

    it('should return same category for checkin-standards.md', () => {
      const category = getStandardCategory('core/checkin-standards.md');

      expect(category).toBe('code-review');
    });

    it('should return null for unknown standard', () => {
      const category = getStandardCategory('core/unknown-standard.md');

      expect(category).toBeNull();
    });

    it('should work with just filename', () => {
      const category = getStandardCategory('commit-message-guide.md');

      expect(category).toBe('commit-standards');
    });
  });

  describe('compareStandardsWithReferences', () => {
    it('should detect orphaned references', () => {
      const manifestStandards = ['core/anti-hallucination.md'];
      const integrationRefs = ['anti-hallucination.md', 'old-removed-standard.md'];

      const result = compareStandardsWithReferences(manifestStandards, integrationRefs);

      expect(result.orphanedRefs).toContain('old-removed-standard.md');
      expect(result.syncedRefs).toContain('anti-hallucination.md');
    });

    it('should detect missing references', () => {
      const manifestStandards = ['core/anti-hallucination.md', 'core/commit-message-guide.md'];
      const integrationRefs = ['anti-hallucination.md'];

      const result = compareStandardsWithReferences(manifestStandards, integrationRefs);

      expect(result.missingRefs).toContain('commit-message-guide.md');
      expect(result.syncedRefs).toContain('anti-hallucination.md');
    });

    it('should report all synced when perfectly matched', () => {
      const manifestStandards = ['core/anti-hallucination.md', 'core/commit-message-guide.md'];
      const integrationRefs = ['anti-hallucination.md', 'commit-message-guide.md'];

      const result = compareStandardsWithReferences(manifestStandards, integrationRefs);

      expect(result.orphanedRefs).toHaveLength(0);
      expect(result.missingRefs).toHaveLength(0);
      expect(result.syncedRefs).toHaveLength(2);
    });

    it('should ignore standards without category mapping', () => {
      // Standards like 'versioning.md' that don't have category mappings
      // should not be included in the comparison
      const manifestStandards = ['core/anti-hallucination.md', 'core/versioning.md'];
      const integrationRefs = ['anti-hallucination.md'];

      const result = compareStandardsWithReferences(manifestStandards, integrationRefs);

      // versioning.md is not in STANDARD_TO_CATEGORY, so it should not be in missingRefs
      expect(result.missingRefs).not.toContain('versioning.md');
      expect(result.syncedRefs).toContain('anti-hallucination.md');
    });
  });

  describe('calculateCategoriesFromStandards', () => {
    it('should calculate categories from standards list', () => {
      const standards = [
        'core/anti-hallucination.md',
        'core/commit-message-guide.md'
      ];

      const categories = calculateCategoriesFromStandards(standards);

      expect(categories).toContain('anti-hallucination');
      expect(categories).toContain('commit-standards');
    });

    it('should deduplicate categories', () => {
      const standards = [
        'core/code-review-checklist.md',
        'core/checkin-standards.md' // Both map to 'code-review'
      ];

      const categories = calculateCategoriesFromStandards(standards);

      expect(categories.filter(c => c === 'code-review')).toHaveLength(1);
    });

    it('should return empty array for no matching standards', () => {
      const standards = ['core/unknown.md'];

      const categories = calculateCategoriesFromStandards(standards);

      expect(categories).toHaveLength(0);
    });

    it('should handle mixed known and unknown standards', () => {
      const standards = [
        'core/anti-hallucination.md',
        'core/unknown.md',
        'core/commit-message-guide.md'
      ];

      const categories = calculateCategoriesFromStandards(standards);

      expect(categories).toHaveLength(2);
      expect(categories).toContain('anti-hallucination');
      expect(categories).toContain('commit-standards');
    });
  });

  describe('getStandardsForCategories', () => {
    it('should return standards for single category', () => {
      const categories = ['anti-hallucination'];

      const standards = getStandardsForCategories(categories);

      expect(standards).toContain('anti-hallucination.md');
    });

    it('should return standards for multiple categories', () => {
      const categories = ['anti-hallucination', 'commit-standards'];

      const standards = getStandardsForCategories(categories);

      expect(standards).toContain('anti-hallucination.md');
      expect(standards).toContain('commit-message-guide.md');
    });

    it('should return multiple standards for category with multiple files', () => {
      const categories = ['code-review'];

      const standards = getStandardsForCategories(categories);

      expect(standards).toContain('code-review-checklist.md');
      expect(standards).toContain('checkin-standards.md');
    });

    it('should return empty array for unknown categories', () => {
      const categories = ['unknown'];

      const standards = getStandardsForCategories(categories);

      expect(standards).toHaveLength(0);
    });
  });

  describe('arraysEqual', () => {
    it('should return true for identical arrays', () => {
      expect(arraysEqual(['a', 'b', 'c'], ['a', 'b', 'c'])).toBe(true);
    });

    it('should return true for same elements in different order', () => {
      expect(arraysEqual(['a', 'b', 'c'], ['c', 'a', 'b'])).toBe(true);
    });

    it('should return false for different lengths', () => {
      expect(arraysEqual(['a', 'b'], ['a', 'b', 'c'])).toBe(false);
    });

    it('should return false for different elements', () => {
      expect(arraysEqual(['a', 'b', 'c'], ['a', 'b', 'd'])).toBe(false);
    });

    it('should return true for empty arrays', () => {
      expect(arraysEqual([], [])).toBe(true);
    });
  });

  describe('getToolFromPath', () => {
    it('should return cursor for .cursorrules', () => {
      expect(getToolFromPath('.cursorrules')).toBe('cursor');
    });

    it('should return windsurf for .windsurfrules', () => {
      expect(getToolFromPath('.windsurfrules')).toBe('windsurf');
    });

    it('should return cline for .clinerules', () => {
      expect(getToolFromPath('.clinerules')).toBe('cline');
    });

    it('should return copilot for GitHub path', () => {
      expect(getToolFromPath('.github/copilot-instructions.md')).toBe('copilot');
    });

    it('should return claude-code for CLAUDE.md', () => {
      expect(getToolFromPath('CLAUDE.md')).toBe('claude-code');
    });

    it('should return claude-code for .standards/CLAUDE.md', () => {
      expect(getToolFromPath('.standards/CLAUDE.md')).toBe('claude-code');
    });

    it('should return null for unknown path', () => {
      expect(getToolFromPath('unknown.md')).toBeNull();
    });
  });

  describe('CATEGORY_TO_STANDARDS mapping', () => {
    it('should have all expected categories', () => {
      const expectedCategories = [
        'anti-hallucination',
        'commit-standards',
        'code-review',
        'spec-driven-development',
        'testing',
        'documentation',
        'git-workflow',
        'error-handling',
        'project-structure'
      ];

      for (const category of expectedCategories) {
        expect(CATEGORY_TO_STANDARDS[category]).toBeDefined();
        expect(CATEGORY_TO_STANDARDS[category].length).toBeGreaterThan(0);
      }
    });
  });

  describe('STANDARD_TO_CATEGORY mapping', () => {
    it('should have bidirectional consistency with CATEGORY_TO_STANDARDS', () => {
      for (const [category, standards] of Object.entries(CATEGORY_TO_STANDARDS)) {
        for (const standard of standards) {
          const fileName = standard.split('/').pop();
          expect(STANDARD_TO_CATEGORY[fileName]).toBe(category);
        }
      }
    });
  });
});
