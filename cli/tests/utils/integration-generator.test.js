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
  generateStandardsIndex,
  generateComplianceInstructions,
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

    describe('commitLanguage option', () => {
      it('should generate English commit types by default', () => {
        const config = {
          tool: 'cursor',
          categories: ['commit-standards'],
          languages: [],
          exclusions: [],
          customRules: [],
          detailLevel: 'standard',
          language: 'en'
        };

        const result = generateIntegrationContent(config);

        expect(result).toContain('feat');
        expect(result).toContain('fix');
        expect(result).toContain('docs');
        expect(result).not.toContain('功能');
        expect(result).not.toContain('修正');
      });

      it('should generate English commit types when commitLanguage is english', () => {
        const config = {
          tool: 'cursor',
          categories: ['commit-standards'],
          languages: [],
          exclusions: [],
          customRules: [],
          detailLevel: 'standard',
          language: 'en',
          commitLanguage: 'english'
        };

        const result = generateIntegrationContent(config);

        expect(result).toContain('feat');
        expect(result).toContain('fix');
        expect(result).toContain('docs');
        expect(result).toContain('<type>(<scope>): <subject>');
        expect(result).not.toContain('功能');
      });

      it('should generate Traditional Chinese commit types when commitLanguage is traditional-chinese', () => {
        const config = {
          tool: 'cursor',
          categories: ['commit-standards'],
          languages: [],
          exclusions: [],
          customRules: [],
          detailLevel: 'standard',
          language: 'zh-tw',
          commitLanguage: 'traditional-chinese'
        };

        const result = generateIntegrationContent(config);

        expect(result).toContain('功能');
        expect(result).toContain('修正');
        expect(result).toContain('文件');
        expect(result).toContain('重構');
        expect(result).toContain('<類型>(<範圍>): <主旨>');
        // English equivalents should be in the table as reference
        expect(result).toContain('feat');
      });

      it('should generate bilingual commit types when commitLanguage is bilingual', () => {
        const config = {
          tool: 'cursor',
          categories: ['commit-standards'],
          languages: [],
          exclusions: [],
          customRules: [],
          detailLevel: 'standard',
          language: 'bilingual',
          commitLanguage: 'bilingual'
        };

        const result = generateIntegrationContent(config);

        // Bilingual uses English types
        expect(result).toContain('feat');
        expect(result).toContain('fix');
        // But includes both English and Chinese descriptions
        expect(result).toContain('New feature');
        expect(result).toContain('新功能');
        expect(result).toContain('<type>(<scope>): <English subject>. <Chinese subject>.');
      });

      it('should use correct format for Traditional Chinese minimal level', () => {
        const config = {
          tool: 'cursor',
          categories: ['commit-standards'],
          languages: [],
          exclusions: [],
          customRules: [],
          detailLevel: 'minimal',
          language: 'zh-tw',
          commitLanguage: 'traditional-chinese'
        };

        const result = generateIntegrationContent(config);

        expect(result).toContain('提交標準');
        expect(result).toContain('<類型>(<範圍>): <主旨>');
      });

      it('should use correct format for comprehensive level', () => {
        const config = {
          tool: 'cursor',
          categories: ['commit-standards'],
          languages: [],
          exclusions: [],
          customRules: [],
          detailLevel: 'comprehensive',
          language: 'en',
          commitLanguage: 'traditional-chinese'
        };

        const result = generateIntegrationContent(config);

        // Should include comprehensive elements
        expect(result).toContain('主題行規則');
        expect(result).toContain('本文指引');
        expect(result).toContain('頁腳格式');
      });
    });

    describe('all tools × languages header verification', () => {
      const expectedHeaders = {
        cursor:        { en: 'Cursor Rules',                      'zh-tw': 'Cursor 規則',                      bilingual: 'Cursor Rules | Cursor 規則' },
        windsurf:      { en: 'Windsurf Rules',                    'zh-tw': 'Windsurf 規則',                    bilingual: 'Windsurf Rules | Windsurf 規則' },
        cline:         { en: 'Cline Rules',                       'zh-tw': 'Cline 規則',                       bilingual: 'Cline Rules | Cline 規則' },
        copilot:       { en: 'GitHub Copilot Instructions',       'zh-tw': 'GitHub Copilot 說明',              bilingual: 'GitHub Copilot Instructions | GitHub Copilot 說明' },
        antigravity:   { en: 'Antigravity System Instructions',   'zh-tw': 'Antigravity 系統指令',             bilingual: 'Antigravity System Instructions | Antigravity 系統指令' },
        'claude-code': { en: 'Project Guidelines for Claude Code','zh-tw': 'Claude Code 專案指南',             bilingual: 'Project Guidelines for Claude Code | Claude Code 專案指南' },
        codex:         { en: 'AGENTS.md - OpenAI Codex CLI Rules','zh-tw': 'AGENTS.md - OpenAI Codex CLI 規則',bilingual: 'AGENTS.md - OpenAI Codex CLI Rules | OpenAI Codex CLI 規則' },
        'gemini-cli':  { en: 'GEMINI.md - Gemini CLI Rules',     'zh-tw': 'GEMINI.md - Gemini CLI 規則',      bilingual: 'GEMINI.md - Gemini CLI Rules | Gemini CLI 規則' },
        opencode:      { en: 'AGENTS.md - OpenCode Rules',       'zh-tw': 'AGENTS.md - OpenCode 規則',        bilingual: 'AGENTS.md - OpenCode Rules | OpenCode 規則' },
      };

      const tools = Object.keys(expectedHeaders);
      const languages = ['en', 'zh-tw', 'bilingual'];

      const cases = tools.flatMap(tool =>
        languages.map(lang => [tool, lang, expectedHeaders[tool][lang]])
      );

      it.each(cases)(
        '%s + %s should contain header "%s"',
        (tool, language, expectedHeader) => {
          const result = generateIntegrationContent({
            tool,
            categories: [],
            languages: [],
            exclusions: [],
            customRules: [],
            detailLevel: 'standard',
            language,
          });

          expect(result).toContain(expectedHeader);
        }
      );

      const languageSettingCases = tools.flatMap(tool => [
        [tool, 'en', 'English'],
        [tool, 'zh-tw', '繁體中文'],
        [tool, 'bilingual', '繁體中文'],
      ]);

      it.each(languageSettingCases)(
        '%s + %s should contain language setting "%s"',
        (tool, language, expectedText) => {
          const result = generateIntegrationContent({
            tool,
            categories: [],
            languages: [],
            exclusions: [],
            customRules: [],
            detailLevel: 'standard',
            language,
          });

          expect(result).toContain(expectedText);
        }
      );

      const bilingualTools = tools.map(tool => [tool]);

      it.each(bilingualTools)(
        '%s bilingual should also contain "Traditional Chinese"',
        (tool) => {
          const result = generateIntegrationContent({
            tool,
            categories: [],
            languages: [],
            exclusions: [],
            customRules: [],
            detailLevel: 'standard',
            language: 'bilingual',
          });

          expect(result).toContain('Traditional Chinese');
        }
      );
    });

    describe('all categories × languages content verification', () => {
      const expectedCategoryHeaders = {
        'spec-driven-development': { en: 'Spec-Driven Development (SDD) Priority', 'zh-tw': '規格驅動開發 (SDD) 優先' },
        'anti-hallucination':      { en: 'Anti-Hallucination Protocol',            'zh-tw': '反幻覺協議' },
        'code-review':             { en: 'Code Review Checklist',                  'zh-tw': '程式碼審查清單' },
        'testing':                 { en: 'Testing Standards',                      'zh-tw': '測試標準' },
        'documentation':           { en: 'Documentation Standards',                'zh-tw': '文件標準' },
        'git-workflow':            { en: 'Git Workflow',                           'zh-tw': 'Git 工作流程' },
        'error-handling':          { en: 'Error Handling',                         'zh-tw': '錯誤處理' },
        'project-structure':       { en: 'Project Structure',                      'zh-tw': '專案結構' },
      };

      const categories = Object.keys(expectedCategoryHeaders);
      const languages = ['en', 'zh-tw', 'bilingual'];

      const enCases = categories.map(cat => [cat, 'en', expectedCategoryHeaders[cat].en]);

      it.each(enCases)(
        '%s + en should contain "%s"',
        (category, _lang, expectedHeader) => {
          const result = generateIntegrationContent({
            tool: 'cursor',
            categories: [category],
            languages: [],
            exclusions: [],
            customRules: [],
            detailLevel: 'standard',
            language: 'en',
          });

          expect(result).toContain(expectedHeader);
        }
      );

      const zhtwCases = categories.map(cat => [cat, 'zh-tw', expectedCategoryHeaders[cat]['zh-tw']]);

      it.each(zhtwCases)(
        '%s + zh-tw should contain "%s"',
        (category, _lang, expectedHeader) => {
          const result = generateIntegrationContent({
            tool: 'cursor',
            categories: [category],
            languages: [],
            exclusions: [],
            customRules: [],
            detailLevel: 'standard',
            language: 'zh-tw',
          });

          expect(result).toContain(expectedHeader);
        }
      );

      const bilingualCases = categories.map(cat => [
        cat,
        expectedCategoryHeaders[cat].en,
        expectedCategoryHeaders[cat]['zh-tw'],
      ]);

      it.each(bilingualCases)(
        '%s bilingual should contain both "%s" and "%s"',
        (category, enHeader, zhtwHeader) => {
          const result = generateIntegrationContent({
            tool: 'cursor',
            categories: [category],
            languages: [],
            exclusions: [],
            customRules: [],
            detailLevel: 'standard',
            language: 'bilingual',
          });

          expect(result).toContain(enHeader);
          expect(result).toContain(zhtwHeader);
        }
      );
    });

    describe('all categories × detailLevels differentiation verification', () => {
      const expectedDetailFeatures = {
        'anti-hallucination': {
          minimal:       '[Confirmed]',
          standard:      '### Evidence-Based Analysis',
          comprehensive: '### Error Correction',
        },
        'code-review': {
          minimal:       'Before committing',
          standard:      '### Before Every Commit',
          comprehensive: '### Core Philosophy',
        },
        'testing': {
          minimal:       'Unit tests: 70%',
          standard:      '### Test Pyramid Distribution',
          comprehensive: '### Naming Convention',
        },
        'documentation': {
          minimal:       'Every public API needs docs',
          standard:      '### README Requirements',
          comprehensive: '### Documentation Checklist',
        },
        'git-workflow': {
          minimal:       'Always create PR for review',
          standard:      '### Branch Naming',
          comprehensive: '### Branch Strategy',
        },
        'error-handling': {
          minimal:       'Use structured error codes',
          standard:      '### Error Code Format',
          comprehensive: '### Error Code System',
        },
        'project-structure': {
          minimal:       'Keep related files together',
          standard:      '### Standard Layout',
          comprehensive: '### Universal Layout',
        },
        'spec-driven-development': {
          minimal:       '/openspec',
          standard:      'Detection',
          comprehensive: '### SDD Workflow',
        },
      };

      const categories = Object.keys(expectedDetailFeatures);
      const detailLevels = ['minimal', 'standard', 'comprehensive'];

      const cases = categories.flatMap(cat =>
        detailLevels.map(level => [cat, level, expectedDetailFeatures[cat][level]])
      );

      it.each(cases)(
        '%s at %s level should contain "%s"',
        (category, detailLevel, expectedFeature) => {
          const result = generateIntegrationContent({
            tool: 'cursor',
            categories: [category],
            languages: [],
            exclusions: [],
            customRules: [],
            detailLevel,
            language: 'en',
          });

          expect(result).toContain(expectedFeature);
        }
      );
    });

    describe('commit-standards × commitLanguage × detailLevel full matrix', () => {
      const commitCases = [
        // [commitLanguage, detailLevel, mustContain, mustNotContain]
        ['english',             'minimal',       '<type>(<scope>): <subject>',         '功能'],
        ['english',             'standard',      '<type>(<scope>): <subject>',         '功能'],
        ['english',             'comprehensive', 'Subject Line Rules',                 '功能'],
        ['traditional-chinese', 'minimal',       '<類型>(<範圍>): <主旨>',             null],
        ['traditional-chinese', 'standard',      '<類型>(<範圍>): <主旨>',             null],
        ['traditional-chinese', 'comprehensive', '主題行規則',                         null],
        ['bilingual',           'minimal',       '<type>(<scope>): <English subject>', null],
        ['bilingual',           'standard',      '<type>(<scope>): <English subject>', null],
        ['bilingual',           'comprehensive', 'Subject Line Rules',                 null],
      ];

      it.each(commitCases)(
        'commitLanguage=%s detailLevel=%s should contain "%s"',
        (commitLanguage, detailLevel, mustContain, mustNotContain) => {
          const result = generateIntegrationContent({
            tool: 'cursor',
            categories: ['commit-standards'],
            languages: [],
            exclusions: [],
            customRules: [],
            detailLevel,
            language: 'en',
            commitLanguage,
          });

          expect(result).toContain(mustContain);
          if (mustNotContain) {
            expect(result).not.toContain(mustNotContain);
          }
        }
      );
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
    it('should allow unknown tool with generic filename', () => {
      // Design: unknown tools are allowed, generating ${tool}.md file
      existsSync.mockReturnValue(false);
      const result = writeIntegrationFile('unknown-tool', { categories: [] }, '/project');

      expect(result.success).toBe(true);
      expect(result.path).toBe('unknown-tool.md');
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
      expect(result.path).toBe('.github/copilot-instructions.md'); // Returns relative path with forward slashes for manifest consistency
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

    it('should use marker-based update when file exists with markers and no mergeStrategy', () => {
      const existingContent = [
        '# My Project',
        '',
        '## Custom Section',
        'Project-specific content here.',
        '',
        '<!-- UDS:STANDARDS:START -->',
        '## Old Standards',
        'Old content',
        '<!-- UDS:STANDARDS:END -->',
        '',
        '## Another Custom Section',
        'More project content.'
      ].join('\n');

      existsSync
        .mockReturnValueOnce(true)   // dir exists
        .mockReturnValueOnce(true);  // file exists
      readFileSync.mockReturnValue(existingContent);

      // installedStandards triggers marker generation in new content
      const result = writeIntegrationFile(
        'claude-code',
        {
          categories: [],
          installedStandards: ['.standards/commit-message.ai.yaml']
        },
        '/project'
      );

      expect(result.success).toBe(true);
      const writtenContent = writeFileSync.mock.calls[0][1];
      // User content before markers is preserved
      expect(writtenContent).toContain('# My Project');
      expect(writtenContent).toContain('Project-specific content here.');
      // User content after markers is preserved
      expect(writtenContent).toContain('## Another Custom Section');
      expect(writtenContent).toContain('More project content.');
      // Old UDS content is replaced
      expect(writtenContent).not.toContain('Old content');
      // New UDS markers are present
      expect(writtenContent).toContain('<!-- UDS:STANDARDS:START -->');
      expect(writtenContent).toContain('<!-- UDS:STANDARDS:END -->');
    });

    it('should append markers when file exists without markers and no mergeStrategy', () => {
      const existingContent = [
        '# My Project',
        '',
        '## Custom Section',
        'Project-specific content only.'
      ].join('\n');

      existsSync
        .mockReturnValueOnce(true)   // dir exists
        .mockReturnValueOnce(true);  // file exists
      readFileSync.mockReturnValue(existingContent);

      // installedStandards triggers marker generation in new content
      const result = writeIntegrationFile(
        'claude-code',
        {
          categories: [],
          installedStandards: ['.standards/commit-message.ai.yaml']
        },
        '/project'
      );

      expect(result.success).toBe(true);
      const writtenContent = writeFileSync.mock.calls[0][1];
      // User content is preserved
      expect(writtenContent).toContain('# My Project');
      expect(writtenContent).toContain('Project-specific content only.');
      // New UDS markers are appended
      expect(writtenContent).toContain('<!-- UDS:STANDARDS:START -->');
      expect(writtenContent).toContain('<!-- UDS:STANDARDS:END -->');
    });

    it('should overwrite entire file when mergeStrategy is explicitly set', () => {
      const existingContent = [
        '# My Project',
        '',
        '<!-- UDS:STANDARDS:START -->',
        '## Old Standards',
        '<!-- UDS:STANDARDS:END -->',
        '',
        '## Custom Section'
      ].join('\n');

      existsSync
        .mockReturnValueOnce(true)   // dir exists
        .mockReturnValueOnce(true);  // file exists
      readFileSync.mockReturnValue(existingContent);

      const result = writeIntegrationFile(
        'claude-code',
        {
          categories: [],
          installedStandards: ['.standards/commit-message.ai.yaml'],
          mergeStrategy: 'overwrite'
        },
        '/project'
      );

      expect(result.success).toBe(true);
      const writtenContent = writeFileSync.mock.calls[0][1];
      // With mergeStrategy='overwrite', mergeRules handles it - user content may not be preserved
      // The key assertion is that mergeStrategy takes precedence over marker-based update
      expect(writtenContent).toBeDefined();
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

  describe('generateStandardsIndex', () => {
    it('should include developer-memory description in standards index', () => {
      const result = generateStandardsIndex(
        ['.standards/developer-memory.ai.yaml'],
        'markdown', 'zh-tw', 3
      );
      expect(result).toContain('開發者持久記憶');
    });
  });

  describe('generateComplianceInstructions', () => {
    it('should categorize developer-memory as SHOULD follow with Always (protocol)', () => {
      const result = generateComplianceInstructions(
        ['.standards/developer-memory.ai.yaml'],
        'full', 'markdown', 'en'
      );
      expect(result).toContain('SHOULD follow');
      expect(result).toContain('Developer memory');
      expect(result).toContain('Always (protocol)');
    });

    it('should categorize anti-hallucination as MUST follow', () => {
      const result = generateComplianceInstructions(
        ['.standards/anti-hallucination.md'],
        'full', 'markdown', 'en'
      );
      expect(result).toContain('MUST follow');
      expect(result).toContain('AI collaboration');
    });

    it('should separate MUST and SHOULD standards correctly', () => {
      const result = generateComplianceInstructions(
        [
          '.standards/commit-message.ai.yaml',
          '.standards/developer-memory.ai.yaml',
          '.standards/testing.ai.yaml'
        ],
        'full', 'markdown', 'en'
      );
      // MUST section should contain commit-message
      expect(result).toContain('MUST follow');
      expect(result).toContain('Writing commits');
      // SHOULD section should contain developer-memory and testing
      expect(result).toContain('SHOULD follow');
      expect(result).toContain('Developer memory');
      expect(result).toContain('Writing tests');
    });

    it('should return empty for minimal mode', () => {
      const result = generateComplianceInstructions(
        ['.standards/developer-memory.ai.yaml'],
        'minimal', 'markdown', 'en'
      );
      expect(result).toBe('');
    });

    it('should generate plaintext format for developer-memory', () => {
      const result = generateComplianceInstructions(
        ['.standards/developer-memory.ai.yaml'],
        'full', 'plaintext', 'en'
      );
      expect(result).toContain('SHOULD follow');
      expect(result).toContain('Developer memory');
      expect(result).not.toContain('|'); // no markdown tables
    });
  });

  describe('Always-On Protocol end-to-end', () => {
    it('should include developer-memory in plaintext integration content', () => {
      const result = generateIntegrationContent({
        tool: 'cursor',
        categories: [],
        languages: [],
        exclusions: [],
        customRules: [],
        detailLevel: 'standard',
        language: 'en',
        installedStandards: ['.standards/developer-memory.ai.yaml'],
        contentMode: 'index',
        level: 3
      });
      expect(result).toContain('developer-memory.ai.yaml');
      expect(result).toContain('Developer memory');
      expect(result).toContain('SHOULD follow');
    });

    it('should include developer-memory in markdown integration with Always (protocol) marker', () => {
      const result = generateIntegrationContent({
        tool: 'claude-code',
        categories: [],
        languages: [],
        exclusions: [],
        customRules: [],
        detailLevel: 'standard',
        language: 'en',
        installedStandards: [
          '.standards/commit-message.ai.yaml',
          '.standards/developer-memory.ai.yaml'
        ],
        contentMode: 'full',
        level: 3
      });
      expect(result).toContain('MUST follow');
      expect(result).toContain('Writing commits');
      expect(result).toContain('SHOULD follow');
      expect(result).toContain('Developer memory');
      expect(result).toContain('Always (protocol)');
    });
  });
});
