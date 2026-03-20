import { describe, it, expect } from 'vitest';
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
      commitLanguage: 'english',
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
      commitLanguage: 'english',
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
      commitLanguage: 'english',
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
      commitLanguage: 'english',
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
      commitLanguage: 'english',
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
      commitLanguage: 'english',
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

  it('should_handle_traditional_chinese_commit_language', () => {
    // Arrange
    const config = {
      installedStandards: [],
      language: 'zh-tw',
      commitLanguage: 'traditional-chinese',
      standardOptions: {}
    };

    // Act
    const content = generateAgentsMdSummary(config);

    // Assert
    expect(content).toContain('Traditional Chinese');
    expect(content).toContain('繁體中文');
  });

  it('should_handle_bilingual_commit_language', () => {
    // Arrange
    const config = {
      installedStandards: [],
      language: 'en',
      commitLanguage: 'bilingual',
      standardOptions: {}
    };

    // Act
    const content = generateAgentsMdSummary(config);

    // Assert
    expect(content).toContain('Bilingual');
  });

  it('should_limit_standards_to_30_entries_max', () => {
    // Arrange - 40 standards to test limit
    const standards = Array.from({ length: 40 }, (_, i) => `standard-${i}.ai.yaml`);
    const config = {
      installedStandards: standards,
      language: 'en',
      commitLanguage: 'english',
      standardOptions: {}
    };

    // Act
    const content = generateAgentsMdSummary(config);
    const standardLines = content.split('\n').filter(l => l.startsWith('- `.standards/'));

    // Assert - should be limited to 30
    expect(standardLines.length).toBeLessThanOrEqual(30);
    // And still within 150 lines total
    expect(content.split('\n').length).toBeLessThanOrEqual(150);
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
      commitLanguage: 'english',
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
      commitLanguage: 'english',
      standardOptions: {}
    };

    // Act
    const content = generateAgentsMdSummary(config);
    const standardLines = content.split('\n').filter(l => l.startsWith('- `.standards/'));

    // Assert - only .ai.yaml files listed
    expect(standardLines.length).toBe(1);
    expect(standardLines[0]).toContain('testing.ai.yaml');
  });
});
