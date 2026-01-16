import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { join } from 'path';

// Mock fs module
vi.mock('fs', () => ({
  existsSync: vi.fn(),
  mkdirSync: vi.fn(),
  writeFileSync: vi.fn(),
  readFileSync: vi.fn()
}));

// Mock the integrations prompts module
vi.mock('../../src/prompts/integrations.js', () => ({
  getLanguageRules: vi.fn(() => ({
    javascript: {
      name: 'JavaScript/TypeScript',
      rules: ['ES6+ syntax', 'Async/await patterns']
    },
    python: {
      name: 'Python',
      rules: ['PEP 8 style', 'Type hints']
    }
  }))
}));

import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import {
  generateIntegrationContent,
  mergeRules,
  writeIntegrationFile,
  integrationFileExists
} from '../../src/utils/integration-generator.js';

describe('Integration Generator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('generateIntegrationContent', () => {
    it('should generate content with header for cursor', () => {
      const config = {
        tool: 'cursor',
        categories: [],
        languages: [],
        exclusions: [],
        customRules: [],
        detailLevel: 'standard',
        language: 'en'
      };

      const result = generateIntegrationContent(config);

      expect(result).toContain('Cursor Rules');
      expect(result).toContain('Universal Dev Standards');
    });

    it('should include selected categories', () => {
      const config = {
        tool: 'cursor',
        categories: ['anti-hallucination', 'commit-standards'],
        languages: [],
        exclusions: [],
        customRules: [],
        detailLevel: 'standard',
        language: 'en'
      };

      const result = generateIntegrationContent(config);

      expect(result).toContain('Anti-Hallucination');
      expect(result).toContain('Commit');
    });

    it('should include language rules', () => {
      const config = {
        tool: 'cursor',
        categories: [],
        languages: ['javascript'],
        exclusions: [],
        customRules: [],
        detailLevel: 'standard',
        language: 'en'
      };

      const result = generateIntegrationContent(config);

      expect(result).toContain('JavaScript/TypeScript');
    });

    it('should include custom rules', () => {
      const config = {
        tool: 'cursor',
        categories: [],
        languages: [],
        exclusions: [],
        customRules: ['My custom rule 1', 'My custom rule 2'],
        detailLevel: 'standard',
        language: 'en'
      };

      const result = generateIntegrationContent(config);

      expect(result).toContain('Project-Specific Rules');
      expect(result).toContain('My custom rule 1');
      expect(result).toContain('My custom rule 2');
    });

    it('should include exclusions', () => {
      const config = {
        tool: 'cursor',
        categories: [],
        languages: [],
        exclusions: ['*.test.js', 'node_modules'],
        customRules: [],
        detailLevel: 'standard',
        language: 'en'
      };

      const result = generateIntegrationContent(config);

      expect(result).toContain('Exclusions');
      expect(result).toContain('*.test.js');
      expect(result).toContain('node_modules');
    });

    it('should generate zh-tw content', () => {
      const config = {
        tool: 'cursor',
        categories: ['anti-hallucination'],
        languages: [],
        exclusions: [],
        customRules: [],
        detailLevel: 'standard',
        language: 'zh-tw'
      };

      const result = generateIntegrationContent(config);

      expect(result).toContain('反幻覺');
    });

    it('should generate bilingual content', () => {
      const config = {
        tool: 'cursor',
        categories: ['anti-hallucination'],
        languages: [],
        exclusions: [],
        customRules: [],
        detailLevel: 'standard',
        language: 'bilingual'
      };

      const result = generateIntegrationContent(config);

      expect(result).toContain('Anti-Hallucination');
      expect(result).toContain('反幻覺');
    });

    it('should generate minimal content', () => {
      const config = {
        tool: 'cursor',
        categories: ['commit-standards'],
        languages: [],
        exclusions: [],
        customRules: [],
        detailLevel: 'minimal',
        language: 'en'
      };

      const result = generateIntegrationContent(config);

      expect(result).toContain('Commit Standards');
      expect(result.length).toBeLessThan(1000); // minimal should be shorter
    });

    it('should generate comprehensive content', () => {
      const config = {
        tool: 'cursor',
        categories: ['commit-standards'],
        languages: [],
        exclusions: [],
        customRules: [],
        detailLevel: 'comprehensive',
        language: 'en'
      };

      const result = generateIntegrationContent(config);

      expect(result).toContain('Commit');
      expect(result).toContain('perf');  // comprehensive includes more types
    });

    it('should handle different tools', () => {
      const tools = ['windsurf', 'cline', 'copilot', 'antigravity'];

      for (const tool of tools) {
        const config = {
          tool,
          categories: [],
          languages: [],
          exclusions: [],
          customRules: [],
          detailLevel: 'standard',
          language: 'en'
        };

        const result = generateIntegrationContent(config);

        expect(result).toContain('Universal Dev Standards');
      }
    });
  });

  describe('mergeRules', () => {
    it('should return new content for overwrite strategy', () => {
      const existing = '# Existing content';
      const newContent = '# New content';

      const result = mergeRules(existing, newContent, 'overwrite');

      expect(result).toBe(newContent);
    });

    it('should return existing content for keep strategy', () => {
      const existing = '# Existing content';
      const newContent = '# New content';

      const result = mergeRules(existing, newContent, 'keep');

      expect(result).toBe(existing);
    });

    it('should append new content for append strategy', () => {
      const existing = '# Existing content';
      const newContent = '# New content';

      const result = mergeRules(existing, newContent, 'append');

      expect(result).toContain('# Existing content');
      expect(result).toContain('# New content');
      expect(result).toContain('Added by Universal Dev Standards');
    });

    it('should filter duplicate sections for merge strategy', () => {
      const existing = '## Anti-Hallucination\nExisting rules';
      const newContent = '## Anti-Hallucination\nNew rules\n\n## Commit Standards\nNew commit rules';

      const result = mergeRules(existing, newContent, 'merge');

      // Should not duplicate Anti-Hallucination, should add Commit Standards
      expect(result).toContain('Existing rules');
      expect(result).toContain('Commit Standards');
    });

    it('should return existing content when all sections already exist', () => {
      const existing = '## Anti-Hallucination\nExisting rules\n## Commit Standards\nExisting commit';
      const newContent = '## Anti-Hallucination\nNew rules\n## Commit Standards\nNew commit';

      const result = mergeRules(existing, newContent, 'merge');

      expect(result).toBe(existing);
    });
  });

  describe('writeIntegrationFile', () => {
    it('should return error for unknown tool', () => {
      const result = writeIntegrationFile('unknown-tool', {}, '/project');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unknown tool');
    });

    it('should create directory if it does not exist', () => {
      existsSync.mockReturnValue(false);

      writeIntegrationFile('cursor', { categories: [] }, '/project');

      expect(mkdirSync).toHaveBeenCalledWith(
        expect.any(String),
        { recursive: true }
      );
    });

    it('should write file for cursor', () => {
      existsSync.mockReturnValue(false);

      const result = writeIntegrationFile('cursor', { categories: [] }, '/project');

      expect(result.success).toBe(true);
      expect(result.path).toBe('.cursorrules'); // Returns relative path for manifest consistency
      expect(result.absolutePath).toBe(join('/project', '.cursorrules')); // Absolute path also available
      expect(writeFileSync).toHaveBeenCalled();
    });

    it('should write file for windsurf', () => {
      existsSync.mockReturnValue(false);

      const result = writeIntegrationFile('windsurf', { categories: [] }, '/project');

      expect(result.success).toBe(true);
      expect(result.path).toBe('.windsurfrules'); // Returns relative path for manifest consistency
    });

    it('should write file for copilot in .github directory', () => {
      existsSync.mockReturnValue(false);

      const result = writeIntegrationFile('copilot', { categories: [] }, '/project');

      expect(result.success).toBe(true);
      expect(result.path).toBe(join('.github', 'copilot-instructions.md')); // Returns relative path for manifest consistency
    });

    it('should merge with existing file when strategy provided', () => {
      existsSync
        .mockReturnValueOnce(true)   // dir exists
        .mockReturnValueOnce(true);  // file exists
      readFileSync.mockReturnValue('# Existing rules');

      const result = writeIntegrationFile(
        'cursor',
        { categories: [], mergeStrategy: 'append' },
        '/project'
      );

      expect(result.success).toBe(true);
      const writtenContent = writeFileSync.mock.calls[0][1];
      expect(writtenContent).toContain('Existing rules');
    });

    it('should handle write errors', () => {
      existsSync.mockReturnValue(true);
      writeFileSync.mockImplementation(() => {
        throw new Error('Write failed');
      });

      const result = writeIntegrationFile('cursor', { categories: [] }, '/project');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Write failed');
    });
  });

  describe('integrationFileExists', () => {
    it('should return true when cursor rules exist', () => {
      existsSync.mockReturnValue(true);

      const result = integrationFileExists('cursor', '/project');

      expect(result).toBe(true);
      expect(existsSync).toHaveBeenCalledWith(join('/project', '.cursorrules'));
    });

    it('should return false when file does not exist', () => {
      existsSync.mockReturnValue(false);

      const result = integrationFileExists('cursor', '/project');

      expect(result).toBe(false);
    });

    it('should return false for unknown tool', () => {
      const result = integrationFileExists('unknown-tool', '/project');

      expect(result).toBeFalsy();
    });

    it('should check correct path for copilot', () => {
      existsSync.mockReturnValue(true);

      integrationFileExists('copilot', '/project');

      expect(existsSync).toHaveBeenCalledWith(
        join('/project', '.github', 'copilot-instructions.md')
      );
    });

    it('should check correct path for antigravity', () => {
      existsSync.mockReturnValue(true);

      integrationFileExists('antigravity', '/project');

      expect(existsSync).toHaveBeenCalledWith(
        join('/project', 'INSTRUCTIONS.md')
      );
    });
  });
});
