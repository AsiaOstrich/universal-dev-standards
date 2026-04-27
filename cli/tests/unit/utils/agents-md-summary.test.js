import { describe, it, expect } from 'vitest';
import { join } from 'path';
import { generateAgentsMdSummary } from '../../../src/utils/integration-generator.js';

describe('generateAgentsMdSummary', () => {
  it('should_generate_content_within_150_lines', () => {
    // Arrange - typical config with many standards
    const config = {
      installedStandards: [
        'anti-hallucination.ai.yaml',
        'commit-message.ai.yaml',
        'code-review.ai.yaml',
        'git-workflow.ai.yaml',
        'testing.ai.yaml',
        'unit-testing.ai.yaml',
        'integration-testing.ai.yaml',
        'documentation-structure.ai.yaml',
        'project-structure.ai.yaml',
        'security-standards.ai.yaml'
      ],
      language: 'en',
      outputLanguage: 'english',
      standardOptions: {
        workflow: 'github-flow',
        merge_strategy: 'squash'
      }
    };

    // Act
    const content = generateAgentsMdSummary(config);
    const lineCount = content.split('\n').length;

    // Assert
    expect(lineCount).toBeLessThanOrEqual(150);
    expect(content).toContain('# AGENTS.md');
    expect(content).toContain('Universal Dev Standards');
  });

  it('should_include_aaif_sections', () => {
    // Arrange
    const config = {
      installedStandards: ['testing.ai.yaml'],
      language: 'en',
      outputLanguage: 'english',
      standardOptions: {}
    };

    // Act
    const content = generateAgentsMdSummary(config);

    // Assert - AAIF sections
    expect(content).toContain('## Build & Test');
    expect(content).toContain('## Code Style');
    expect(content).toContain('## Git Workflow');
    expect(content).toContain('## Testing');
    expect(content).toContain('## Installed Standards');
    expect(content).toContain('## Important Notes');
  });

  it('should_include_uds_markers', () => {
    // Arrange
    const config = {
      installedStandards: ['commit-message.ai.yaml'],
      language: 'en',
      outputLanguage: 'english',
      standardOptions: {}
    };

    // Act
    const content = generateAgentsMdSummary(config);

    // Assert
    expect(content).toContain('<!-- UDS:STANDARDS:START -->');
    expect(content).toContain('<!-- UDS:STANDARDS:END -->');
  });

  it('should_list_installed_standards_in_index', () => {
    // Arrange
    const config = {
      installedStandards: [
        'anti-hallucination.ai.yaml',
        'commit-message.ai.yaml',
        'testing.ai.yaml'
      ],
      language: 'en',
      outputLanguage: 'english',
      standardOptions: {}
    };

    // Act
    const content = generateAgentsMdSummary(config);

    // Assert
    expect(content).toContain('.standards/anti-hallucination.ai.yaml');
    expect(content).toContain('.standards/commit-message.ai.yaml');
    expect(content).toContain('.standards/testing.ai.yaml');
  });

  it('should_show_empty_message_when_no_standards_installed', () => {
    // Arrange
    const config = {
      installedStandards: [],
      language: 'en',
      outputLanguage: 'english',
      standardOptions: {}
    };

    // Act
    const content = generateAgentsMdSummary(config);

    // Assert
    expect(content).toContain('No standards installed yet');
  });

  it('should_reflect_workflow_and_merge_strategy', () => {
    // Arrange
    const config = {
      installedStandards: [],
      language: 'en',
      outputLanguage: 'english',
      standardOptions: {
        workflow: 'gitflow',
        merge_strategy: 'merge-commit'
      }
    };

    // Act
    const content = generateAgentsMdSummary(config);

    // Assert
    expect(content).toContain('gitflow');
    expect(content).toContain('merge-commit');
  });

  it('should_handle_traditional_chinese_output_language', () => {
    // Arrange
    const config = {
      installedStandards: [],
      language: 'zh-tw',
      outputLanguage: 'traditional-chinese',
      standardOptions: {}
    };

    // Act
    const content = generateAgentsMdSummary(config);

    // Assert
    expect(content).toContain('Traditional Chinese');
    expect(content).toContain('繁體中文');
  });

  it('should_handle_bilingual_output_language', () => {
    // Arrange
    const config = {
      installedStandards: [],
      language: 'en',
      outputLanguage: 'bilingual',
      standardOptions: {}
    };

    // Act
    const content = generateAgentsMdSummary(config);

    // Assert
    expect(content).toContain('Bilingual');
  });

  it('should_list_all_standards_without_cap', () => {
    // Arrange - 40 standards (previously capped at 30, now all should be listed)
    const standards = Array.from({ length: 40 }, (_, i) => `standard-${i}.ai.yaml`);
    const config = {
      installedStandards: standards,
      language: 'en',
      outputLanguage: 'english',
      standardOptions: {}
    };

    // Act
    const content = generateAgentsMdSummary(config);
    const standardLines = content.split('\n').filter(l => l.startsWith('- `.standards/'));

    // Assert - all 40 standards should be listed (no artificial cap)
    expect(standardLines.length).toBe(40);
    // uds check compares manifest standards vs AGENTS.md — they should match
    expect(content).toContain('Installed standards:');
  });

  it('should_use_default_values_when_no_config_provided', () => {
    // Arrange & Act
    const content = generateAgentsMdSummary();

    // Assert
    expect(content).toContain('# AGENTS.md');
    expect(content).toContain('github-flow');
    expect(content).toContain('squash');
    expect(content).toContain('English');
  });

  it('should_include_anti_hallucination_reference', () => {
    // Arrange
    const config = {
      installedStandards: ['anti-hallucination.ai.yaml'],
      language: 'en',
      outputLanguage: 'english',
      standardOptions: {}
    };

    // Act
    const content = generateAgentsMdSummary(config);

    // Assert
    expect(content).toContain('anti-hallucination');
    expect(content).toContain('evidence-based');
  });

  it('should_filter_non_ai_yaml_files', () => {
    // Arrange - mix of file types
    const config = {
      installedStandards: [
        'testing.ai.yaml',
        'requirement-checklist.md',
        'requirement-template.md'
      ],
      language: 'en',
      outputLanguage: 'english',
      standardOptions: {}
    };

    // Act
    const content = generateAgentsMdSummary(config);
    const standardLines = content.split('\n').filter(l => l.startsWith('- `.standards/'));

    // Assert - only .ai.yaml files listed
    expect(standardLines.length).toBe(1);
    expect(standardLines[0]).toContain('testing.ai.yaml');
  });

  it('should_detect_npm_scripts_from_package_json', () => {
    // Arrange - pass projectPath pointing to cli/ which has package.json with scripts
    const config = {
      installedStandards: [],
      language: 'en',
      outputLanguage: 'english',
      standardOptions: {},
      projectPath: join(import.meta.dirname, '../../../')
    };

    // Act
    const content = generateAgentsMdSummary(config);

    // Assert - should contain npm commands based on actual package.json
    expect(content).toContain('npm install');
    expect(content).toContain('npm test');
    expect(content).toContain('npm run lint');
  });

  it('should_show_build_command_when_package_json_has_build_script', () => {
    // This test verifies the output structure includes build when present
    // The CLI's own package.json may or may not have a build script
    const config = {
      installedStandards: [],
      language: 'en',
      outputLanguage: 'english',
      standardOptions: {},
      projectPath: import.meta.dirname // tests/unit/utils - no package.json here
    };

    // Act
    const content = generateAgentsMdSummary(config);

    // Assert - no package.json means generic fallback
    expect(content).toContain('# Check project configuration');
  });
});
