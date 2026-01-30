import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { installIntegrations, generateClaudeMd, INTEGRATION_MAPPINGS } from '../../src/installers/integration-installer.js';

// Mock dependencies
vi.mock('ora', () => ({
  default: vi.fn(() => ({
    start: vi.fn().mockReturnThis(),
    succeed: vi.fn().mockReturnThis(),
    warn: vi.fn().mockReturnThis(),
    fail: vi.fn().mockReturnThis()
  }))
}));

vi.mock('../../src/utils/integration-generator.js', () => ({
  writeIntegrationFile: vi.fn(),
  integrationFileExists: vi.fn(),
  getToolFilePath: vi.fn()
}));

vi.mock('../../src/utils/copier.js', () => ({
  copyIntegration: vi.fn()
}));

vi.mock('../../src/i18n/messages.js', () => ({
  t: vi.fn(() => ({
    commands: {
      init: {
        generatingIntegrations: 'Generating integration files...',
        generatedIntegrations: 'Generated {count} integration file(s)',
        failedToGenerateIntegrations: 'Failed to generate integration files',
        generatingClaudeMd: 'Generating CLAUDE.md...',
        generatedClaudeMd: 'Generated CLAUDE.md',
        couldNotGenerateClaudeMd: 'Could not generate CLAUDE.md'
      }
    }
  }))
}));

// Import mocked modules
import ora from 'ora';
import { writeIntegrationFile, integrationFileExists, getToolFilePath } from '../../src/utils/integration-generator.js';
import { copyIntegration } from '../../src/utils/copier.js';

describe('integration-installer', () => {
  describe('installIntegrations', () => {
    const mockProjectPath = '/test/project';
    let mockSpinner;

    beforeEach(() => {
      vi.clearAllMocks();
      mockSpinner = {
        start: vi.fn().mockReturnThis(),
        succeed: vi.fn().mockReturnThis(),
        warn: vi.fn().mockReturnThis(),
        fail: vi.fn().mockReturnThis()
      };
      ora.mockReturnValue(mockSpinner);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should_return_empty_results_when_no_integrations_selected', async () => {
      // Arrange - Empty integrations array
      const config = {
        integrations: [],
        integrationConfigs: {},
        installedStandards: [],
        contentMode: 'minimal',
        level: 2,
        commonLanguage: 'en',
        commitLanguage: 'english'
      };

      // Act - Call with empty integrations
      const result = await installIntegrations(config, mockProjectPath);

      // Assert - Should return empty results without starting spinner
      expect(result).toEqual({
        integrations: [],
        errors: [],
        integrationBlockHashes: {}
      });
      expect(ora).not.toHaveBeenCalled();
    });

    it('should_install_multiple_tools_successfully_when_generator_succeeds', async () => {
      // Arrange - Multiple tools configuration
      const config = {
        integrations: ['cursor', 'windsurf', 'cline'],
        integrationConfigs: {
          cursor: { categories: ['anti-hallucination'] },
          windsurf: { categories: ['commit-standards'] },
          cline: { language: 'zh-tw' }
        },
        installedStandards: ['commit-message.ai.yaml', 'testing.ai.yaml'],
        contentMode: 'index',
        level: 3,
        commonLanguage: 'en',
        commitLanguage: 'english'
      };

      getToolFilePath.mockImplementation(tool => {
        const map = { cursor: '.cursorrules', windsurf: '.windsurfrules', cline: '.clinerules' };
        return map[tool];
      });

      writeIntegrationFile.mockImplementation((tool) => ({
        success: true,
        path: getToolFilePath(tool),
        blockHashInfo: {
          hash: `hash-${tool}`,
          startLine: 1,
          endLine: 10
        }
      }));

      // Act - Install multiple integrations
      const result = await installIntegrations(config, mockProjectPath);

      // Assert - All tools installed successfully
      expect(result.integrations).toEqual(['.cursorrules', '.windsurfrules', '.clinerules']);
      expect(result.errors).toEqual([]);
      expect(writeIntegrationFile).toHaveBeenCalledTimes(3);

      // Verify first tool config
      expect(writeIntegrationFile).toHaveBeenCalledWith(
        'cursor',
        expect.objectContaining({
          tool: 'cursor',
          categories: ['anti-hallucination'],
          installedStandards: ['commit-message.ai.yaml', 'testing.ai.yaml'],
          contentMode: 'index',
          level: 3,
          language: 'en',
          commitLanguage: 'english'
        }),
        mockProjectPath
      );

      // Verify block hashes captured
      expect(result.integrationBlockHashes).toHaveProperty('.cursorrules');
      expect(result.integrationBlockHashes['.cursorrules']).toMatchObject({
        hash: 'hash-cursor',
        startLine: 1,
        endLine: 10,
        installedAt: expect.any(String)
      });

      expect(mockSpinner.succeed).toHaveBeenCalledWith('Generated 3 integration file(s)');
    });

    it('should_handle_shared_files_correctly_when_multiple_tools_use_same_target', async () => {
      // Arrange - Two tools (codex, opencode) that both use AGENTS.md
      const config = {
        integrations: ['codex', 'opencode'],
        integrationConfigs: {},
        installedStandards: [],
        contentMode: 'minimal',
        level: 2,
        commonLanguage: 'en',
        commitLanguage: 'english'
      };

      // Both tools target AGENTS.md
      getToolFilePath.mockReturnValue('AGENTS.md');

      writeIntegrationFile.mockReturnValue({
        success: true,
        path: 'AGENTS.md',
        blockHashInfo: { hash: 'abc123', startLine: 1, endLine: 5 }
      });

      // Act - Install both tools
      const result = await installIntegrations(config, mockProjectPath);

      // Assert - Only one AGENTS.md generated (no duplicates)
      expect(result.integrations).toEqual(['AGENTS.md']);
      expect(result.integrations.length).toBe(1);
      expect(writeIntegrationFile).toHaveBeenCalledTimes(1);
      expect(writeIntegrationFile).toHaveBeenCalledWith('codex', expect.any(Object), mockProjectPath);
      expect(mockSpinner.succeed).toHaveBeenCalledWith('Generated 1 integration file(s)');
    });

    it('should_fallback_to_legacy_copy_when_generator_fails', async () => {
      // Arrange - Generator fails, fallback to static copy
      const config = {
        integrations: ['cursor'],
        integrationConfigs: {},
        installedStandards: [],
        contentMode: 'minimal',
        level: 2,
        commonLanguage: 'en',
        commitLanguage: 'english'
      };

      getToolFilePath.mockReturnValue('.cursorrules');

      // Generator fails
      writeIntegrationFile.mockReturnValue({
        success: false,
        error: 'Template not found'
      });

      // Fallback copy succeeds
      copyIntegration.mockResolvedValue({
        success: true,
        path: '.cursorrules'
      });

      // Act - Install with fallback
      const result = await installIntegrations(config, mockProjectPath);

      // Assert - Falls back to legacy copy
      expect(result.integrations).toEqual(['.cursorrules']);
      expect(result.errors).toEqual([]);
      expect(writeIntegrationFile).toHaveBeenCalledTimes(1);
      expect(copyIntegration).toHaveBeenCalledWith(
        'integrations/cursor/.cursorrules',
        '.cursorrules',
        mockProjectPath
      );
    });

    it('should_record_errors_when_both_generator_and_fallback_fail', async () => {
      // Arrange - Both generator and fallback fail
      const config = {
        integrations: ['cursor'],
        integrationConfigs: {},
        installedStandards: [],
        contentMode: 'minimal',
        level: 2,
        commonLanguage: 'en',
        commitLanguage: 'english'
      };

      getToolFilePath.mockReturnValue('.cursorrules');

      writeIntegrationFile.mockReturnValue({
        success: false,
        error: 'Generator error'
      });

      copyIntegration.mockResolvedValue({
        success: false,
        error: 'File not found'
      });

      // Act - Both methods fail
      const result = await installIntegrations(config, mockProjectPath);

      // Assert - Error recorded, no files installed
      expect(result.integrations).toEqual([]);
      expect(result.errors).toContain('cursor: Generator error');
      expect(mockSpinner.succeed).toHaveBeenCalledWith('Generated 0 integration file(s)');
    });

    it('should_record_error_when_tool_has_no_mapping_and_generator_fails', async () => {
      // Arrange - Unknown tool with no mapping
      const config = {
        integrations: ['unknown-tool'],
        integrationConfigs: {},
        installedStandards: [],
        contentMode: 'minimal',
        level: 2,
        commonLanguage: 'en',
        commitLanguage: 'english'
      };

      getToolFilePath.mockReturnValue('.unknownrules');

      writeIntegrationFile.mockReturnValue({
        success: false,
        error: 'Unknown tool'
      });

      // Act - Unknown tool fails
      const result = await installIntegrations(config, mockProjectPath);

      // Assert - Error recorded without fallback attempt
      expect(result.integrations).toEqual([]);
      expect(result.errors).toContain('unknown-tool: Unknown tool');
      expect(copyIntegration).not.toHaveBeenCalled();
    });

    it('should_use_default_categories_when_not_specified_in_config', async () => {
      // Arrange - Config without categories
      const config = {
        integrations: ['cursor'],
        integrationConfigs: {
          cursor: {} // No categories specified
        },
        installedStandards: [],
        contentMode: 'minimal',
        level: 2,
        commonLanguage: 'en',
        commitLanguage: 'english'
      };

      getToolFilePath.mockReturnValue('.cursorrules');
      writeIntegrationFile.mockReturnValue({ success: true, path: '.cursorrules' });

      // Act - Install without explicit categories
      await installIntegrations(config, mockProjectPath);

      // Assert - Default categories used
      expect(writeIntegrationFile).toHaveBeenCalledWith(
        'cursor',
        expect.objectContaining({
          categories: ['anti-hallucination', 'commit-standards', 'code-review']
        }),
        mockProjectPath
      );
    });

    it('should_merge_tool_config_with_enhanced_settings', async () => {
      // Arrange - Tool with specific config
      const config = {
        integrations: ['windsurf'],
        integrationConfigs: {
          windsurf: {
            categories: ['testing', 'documentation'],
            language: 'zh-tw',
            customField: 'custom-value'
          }
        },
        installedStandards: ['testing.ai.yaml'],
        contentMode: 'full',
        level: 3,
        commonLanguage: 'en',
        commitLanguage: 'traditional-chinese'
      };

      getToolFilePath.mockReturnValue('.windsurfrules');
      writeIntegrationFile.mockReturnValue({ success: true, path: '.windsurfrules' });

      // Act - Install with enhanced config
      await installIntegrations(config, mockProjectPath);

      // Assert - Config merged correctly
      expect(writeIntegrationFile).toHaveBeenCalledWith(
        'windsurf',
        expect.objectContaining({
          tool: 'windsurf',
          categories: ['testing', 'documentation'],
          language: 'zh-tw',
          customField: 'custom-value',
          installedStandards: ['testing.ai.yaml'],
          contentMode: 'full',
          level: 3,
          commitLanguage: 'traditional-chinese'
        }),
        mockProjectPath
      );
    });

    it('should_handle_mixed_success_and_failure_gracefully', async () => {
      // Arrange - Mix of success and failure
      const config = {
        integrations: ['cursor', 'windsurf', 'cline'],
        integrationConfigs: {},
        installedStandards: [],
        contentMode: 'minimal',
        level: 2,
        commonLanguage: 'en',
        commitLanguage: 'english'
      };

      getToolFilePath.mockImplementation(tool => {
        const map = { cursor: '.cursorrules', windsurf: '.windsurfrules', cline: '.clinerules' };
        return map[tool];
      });

      writeIntegrationFile.mockImplementation((tool) => {
        if (tool === 'cursor') {
          return { success: true, path: '.cursorrules' };
        } else if (tool === 'windsurf') {
          return { success: false, error: 'Template error' };
        } else {
          return { success: true, path: '.clinerules' };
        }
      });

      copyIntegration.mockResolvedValue({ success: false, error: 'Copy failed' });

      // Act - Mixed results
      const result = await installIntegrations(config, mockProjectPath);

      // Assert - Partial success recorded
      expect(result.integrations).toEqual(['.cursorrules', '.clinerules']);
      expect(result.errors).toContain('windsurf: Template error');
      expect(mockSpinner.succeed).toHaveBeenCalledWith('Generated 2 integration file(s)');
    });
  });

  describe('generateClaudeMd', () => {
    const mockProjectPath = '/test/project';
    let mockSpinner;

    beforeEach(() => {
      vi.clearAllMocks();
      mockSpinner = {
        start: vi.fn().mockReturnThis(),
        succeed: vi.fn().mockReturnThis(),
        warn: vi.fn().mockReturnThis(),
        fail: vi.fn().mockReturnThis()
      };
      ora.mockReturnValue(mockSpinner);
    });

    afterEach(() => {
      vi.resetAllMocks();
    });

    it('should_generate_claudemd_when_claude_code_selected_and_file_does_not_exist', async () => {
      // Arrange - Claude Code selected, file doesn't exist
      const config = {
        aiTools: ['claude-code', 'cursor'],
        installedStandards: ['commit-message.ai.yaml'],
        contentMode: 'index',
        level: 3,
        commonLanguage: 'zh-tw',
        commitLanguage: 'traditional-chinese'
      };

      integrationFileExists.mockReturnValue(false);
      writeIntegrationFile.mockReturnValue({
        success: true,
        path: 'CLAUDE.md'
      });

      // Act - Generate CLAUDE.md
      const result = await generateClaudeMd(config, mockProjectPath);

      // Assert - File generated successfully
      expect(result).toEqual({ path: 'CLAUDE.md', error: null });
      expect(integrationFileExists).toHaveBeenCalledWith('claude-code', mockProjectPath);
      expect(writeIntegrationFile).toHaveBeenCalledWith(
        'claude-code',
        expect.objectContaining({
          tool: 'claude-code',
          categories: ['anti-hallucination', 'commit-standards', 'code-review'],
          languages: [],
          exclusions: [],
          customRules: [],
          detailLevel: 'standard',
          language: 'zh-tw',
          installedStandards: ['commit-message.ai.yaml'],
          contentMode: 'index',
          level: 3,
          commitLanguage: 'traditional-chinese'
        }),
        mockProjectPath
      );
      expect(mockSpinner.succeed).toHaveBeenCalledWith('Generated CLAUDE.md');
    });

    it('should_skip_generation_when_claude_code_not_selected', async () => {
      // Arrange - Claude Code not in aiTools
      const config = {
        aiTools: ['cursor', 'windsurf'],
        installedStandards: [],
        contentMode: 'minimal',
        level: 2,
        commonLanguage: 'en',
        commitLanguage: 'english'
      };

      // Act - Skip generation
      const result = await generateClaudeMd(config, mockProjectPath);

      // Assert - No file generated
      expect(result).toEqual({ path: null, error: null });
      expect(integrationFileExists).not.toHaveBeenCalled();
      expect(writeIntegrationFile).not.toHaveBeenCalled();
      expect(ora).not.toHaveBeenCalled();
    });

    it('should_skip_generation_when_claudemd_already_exists', async () => {
      // Arrange - File already exists
      const config = {
        aiTools: ['claude-code'],
        installedStandards: [],
        contentMode: 'minimal',
        level: 2,
        commonLanguage: 'en',
        commitLanguage: 'english'
      };

      integrationFileExists.mockReturnValue(true);

      // Act - Skip existing file
      const result = await generateClaudeMd(config, mockProjectPath);

      // Assert - No file generated (already exists)
      expect(result).toEqual({ path: null, error: null });
      expect(integrationFileExists).toHaveBeenCalledWith('claude-code', mockProjectPath);
      expect(writeIntegrationFile).not.toHaveBeenCalled();
      expect(ora).not.toHaveBeenCalled();
    });

    it('should_return_error_when_generation_fails', async () => {
      // Arrange - Generation fails
      const config = {
        aiTools: ['claude-code'],
        installedStandards: [],
        contentMode: 'minimal',
        level: 2,
        commonLanguage: 'en',
        commitLanguage: 'english'
      };

      integrationFileExists.mockReturnValue(false);
      writeIntegrationFile.mockReturnValue({
        success: false,
        error: 'Template rendering failed'
      });

      // Act - Failed generation
      const result = await generateClaudeMd(config, mockProjectPath);

      // Assert - Error returned
      expect(result).toEqual({ path: null, error: 'Template rendering failed' });
      expect(mockSpinner.warn).toHaveBeenCalledWith('Could not generate CLAUDE.md');
    });

    it('should_use_default_values_when_config_fields_missing', async () => {
      // Arrange - Minimal config (missing optional fields)
      const config = {
        aiTools: ['claude-code']
        // All other fields omitted
      };

      integrationFileExists.mockReturnValue(false);
      writeIntegrationFile.mockReturnValue({ success: true, path: 'CLAUDE.md' });

      // Act - Generate with defaults
      await generateClaudeMd(config, mockProjectPath);

      // Assert - Default values used
      expect(writeIntegrationFile).toHaveBeenCalledWith(
        'claude-code',
        expect.objectContaining({
          installedStandards: [],
          contentMode: 'minimal',
          level: 2,
          language: 'en',
          commitLanguage: 'english'
        }),
        mockProjectPath
      );
    });

    it('should_pass_empty_arrays_for_languages_exclusions_customrules', async () => {
      // Arrange - Standard config
      const config = {
        aiTools: ['claude-code'],
        installedStandards: ['testing.ai.yaml'],
        contentMode: 'minimal',
        level: 2,
        commonLanguage: 'en',
        commitLanguage: 'english'
      };

      integrationFileExists.mockReturnValue(false);
      writeIntegrationFile.mockReturnValue({ success: true, path: 'CLAUDE.md' });

      // Act - Generate file
      await generateClaudeMd(config, mockProjectPath);

      // Assert - Empty arrays for optional fields
      expect(writeIntegrationFile).toHaveBeenCalledWith(
        'claude-code',
        expect.objectContaining({
          languages: [],
          exclusions: [],
          customRules: []
        }),
        mockProjectPath
      );
    });
  });

  describe('INTEGRATION_MAPPINGS', () => {
    it('should_export_correct_legacy_mappings', () => {
      // Assert - Legacy mappings defined
      expect(INTEGRATION_MAPPINGS).toBeDefined();
      expect(INTEGRATION_MAPPINGS.cursor).toEqual({
        source: 'integrations/cursor/.cursorrules',
        target: '.cursorrules'
      });
      expect(INTEGRATION_MAPPINGS.windsurf).toEqual({
        source: 'integrations/windsurf/.windsurfrules',
        target: '.windsurfrules'
      });
      expect(INTEGRATION_MAPPINGS.cline).toEqual({
        source: 'integrations/cline/.clinerules',
        target: '.clinerules'
      });
      expect(INTEGRATION_MAPPINGS.copilot).toEqual({
        source: 'integrations/github-copilot/copilot-instructions.md',
        target: '.github/copilot-instructions.md'
      });
      expect(INTEGRATION_MAPPINGS.antigravity).toEqual({
        source: 'integrations/google-antigravity/INSTRUCTIONS.md',
        target: 'INSTRUCTIONS.md'
      });
      expect(INTEGRATION_MAPPINGS.codex).toEqual({
        source: 'integrations/openai-codex/AGENTS.md',
        target: 'AGENTS.md'
      });
      expect(INTEGRATION_MAPPINGS['gemini-cli']).toEqual({
        source: 'integrations/gemini-cli/GEMINI.md',
        target: 'GEMINI.md'
      });
      expect(INTEGRATION_MAPPINGS.opencode).toEqual({
        source: 'integrations/opencode/AGENTS.md',
        target: 'AGENTS.md'
      });
    });
  });
});
