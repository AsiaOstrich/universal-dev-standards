import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import {
  getAvailableWorkflowNames,
  getWorkflowContent,
  parseWorkflow,
  validateWorkflow,
  getWorkflowFeatures,
  getWorkflowSummary,
  installWorkflowsForTool,
  getInstalledWorkflowsForTool,
  installWorkflowsToMultipleTools
} from '../../../src/utils/workflows-installer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const TEST_DIR = join(__dirname, '../../temp/workflows-installer-test');

describe('Workflows Installer', () => {
  beforeEach(() => {
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
    mkdirSync(TEST_DIR, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  describe('getAvailableWorkflowNames', () => {
    it('should return array of workflow names', () => {
      const workflows = getAvailableWorkflowNames();

      expect(Array.isArray(workflows)).toBe(true);
      expect(workflows.length).toBeGreaterThan(0);
    });

    it('should include known workflows', () => {
      const workflows = getAvailableWorkflowNames();

      expect(workflows).toContain('integrated-flow');
      expect(workflows).toContain('feature-dev');
      expect(workflows).toContain('code-review');
    });

    it('should not include non-workflow items', () => {
      const workflows = getAvailableWorkflowNames();

      expect(workflows).not.toContain('README');
      expect(workflows).not.toContain('.DS_Store');
      expect(workflows).not.toContain('.manifest');
    });
  });

  describe('getWorkflowContent', () => {
    it('should return content for valid workflow', () => {
      const content = getWorkflowContent('feature-dev');

      expect(content).not.toBeNull();
      expect(content).toContain('name: feature-dev');
      expect(content).toContain('steps:');
    });

    it('should return null for non-existent workflow', () => {
      const content = getWorkflowContent('non-existent-workflow');
      expect(content).toBeNull();
    });
  });

  describe('parseWorkflow', () => {
    it('should parse YAML content', () => {
      const yamlContent = `
name: test-workflow
version: 1.0.0
description: Test workflow description
metadata:
  category: development
  difficulty: beginner
steps:
  - id: step1
    name: First Step
    type: manual
`;

      const parsed = parseWorkflow(yamlContent);

      expect(parsed.name).toBe('test-workflow');
      expect(parsed.version).toBe('1.0.0');
      expect(parsed.description).toBe('Test workflow description');
      expect(parsed.metadata.category).toBe('development');
      expect(parsed.metadata.difficulty).toBe('beginner');
      expect(parsed.steps).toHaveLength(1);
      expect(parsed.steps[0].id).toBe('step1');
    });

    it('should return empty object for invalid YAML', () => {
      const invalidYaml = 'invalid: yaml: content: [broken';
      const parsed = parseWorkflow(invalidYaml);

      expect(parsed).toEqual({});
    });

    it('should return empty object for empty content', () => {
      const parsed = parseWorkflow('');
      expect(parsed).toEqual({});
    });

    it('should parse real workflow files', () => {
      const content = getWorkflowContent('code-review');
      const parsed = parseWorkflow(content);

      expect(parsed.name).toBe('code-review');
      expect(parsed.steps).toBeDefined();
      expect(Array.isArray(parsed.steps)).toBe(true);
    });
  });

  describe('validateWorkflow', () => {
    it('should validate valid workflow', () => {
      const workflow = {
        name: 'test-workflow',
        version: '1.0.0',
        steps: [
          { id: 'step1', type: 'manual', name: 'Manual Step' }
        ]
      };

      const result = validateWorkflow(workflow);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should report missing required fields', () => {
      const workflow = { steps: [] };

      const result = validateWorkflow(workflow);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing required field: name');
      expect(result.errors).toContain('Missing required field: version');
    });

    it('should report invalid steps array', () => {
      const workflow = {
        name: 'test',
        version: '1.0.0',
        steps: 'not-an-array'
      };

      const result = validateWorkflow(workflow);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('steps'))).toBe(true);
    });

    it('should validate step type', () => {
      const workflow = {
        name: 'test',
        version: '1.0.0',
        steps: [
          { id: 'step1', type: 'invalid-type' }
        ]
      };

      const result = validateWorkflow(workflow);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('invalid type'))).toBe(true);
    });

    it('should validate agent step requires agent field', () => {
      const workflow = {
        name: 'test',
        version: '1.0.0',
        steps: [
          { id: 'step1', type: 'agent' }
        ]
      };

      const result = validateWorkflow(workflow);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes("requires 'agent' field"))).toBe(true);
    });

    // RLM-specific validation tests
    it('should validate parallel-agents step requires foreach', () => {
      const workflow = {
        name: 'test',
        version: '1.0.0',
        steps: [
          { id: 'step1', type: 'parallel-agents', agent: 'code-architect' }
        ]
      };

      const result = validateWorkflow(workflow);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes("parallel-agents requires 'foreach'"))).toBe(true);
    });

    it('should validate parallel-agents with valid configuration', () => {
      const workflow = {
        name: 'test',
        version: '1.0.0',
        steps: [
          {
            id: 'parallel-step',
            type: 'parallel-agents',
            agent: 'code-architect',
            foreach: '${modules}',
            'context-mode': 'focused',
            'merge-strategy': 'aggregate'
          }
        ]
      };

      const result = validateWorkflow(workflow);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid context-mode', () => {
      const workflow = {
        name: 'test',
        version: '1.0.0',
        steps: [
          {
            id: 'step1',
            type: 'parallel-agents',
            agent: 'code-architect',
            foreach: '${items}',
            'context-mode': 'invalid-mode'
          }
        ]
      };

      const result = validateWorkflow(workflow);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('invalid context-mode'))).toBe(true);
    });

    it('should reject invalid merge-strategy', () => {
      const workflow = {
        name: 'test',
        version: '1.0.0',
        steps: [
          {
            id: 'step1',
            type: 'parallel-agents',
            agent: 'code-architect',
            foreach: '${items}',
            'merge-strategy': 'invalid-strategy'
          }
        ]
      };

      const result = validateWorkflow(workflow);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('invalid merge-strategy'))).toBe(true);
    });

    it('should validate context-strategy configuration', () => {
      const workflow = {
        name: 'test',
        version: '1.0.0',
        'context-strategy': {
          'enable-rlm': true,
          'max-context-per-step': 100000,
          'context-inheritance': 'selective'
        },
        steps: [
          { id: 'step1', type: 'manual' }
        ]
      };

      const result = validateWorkflow(workflow);

      expect(result.valid).toBe(true);
    });

    it('should reject invalid context-inheritance', () => {
      const workflow = {
        name: 'test',
        version: '1.0.0',
        'context-strategy': {
          'context-inheritance': 'invalid-mode'
        },
        steps: [
          { id: 'step1', type: 'manual' }
        ]
      };

      const result = validateWorkflow(workflow);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('invalid context-inheritance'))).toBe(true);
    });

    it('should warn about non-numeric max-context-per-step', () => {
      const workflow = {
        name: 'test',
        version: '1.0.0',
        'context-strategy': {
          'max-context-per-step': 'not-a-number'
        },
        steps: [
          { id: 'step1', type: 'manual' }
        ]
      };

      const result = validateWorkflow(workflow);

      expect(result.warnings.some(w => w.includes('max-context-per-step'))).toBe(true);
    });

    it('should validate real large-codebase-analysis workflow', () => {
      const content = getWorkflowContent('large-codebase-analysis');
      if (content) {
        const workflow = parseWorkflow(content);
        const result = validateWorkflow(workflow);

        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      }
    });
  });

  describe('getWorkflowFeatures', () => {
    it('should detect RLM enabled workflow', () => {
      const workflow = {
        name: 'test',
        'context-strategy': {
          'enable-rlm': true
        },
        steps: []
      };

      const features = getWorkflowFeatures(workflow);

      expect(features.hasRlm).toBe(true);
    });

    it('should detect non-RLM workflow', () => {
      const workflow = {
        name: 'test',
        steps: [
          { id: 'step1', type: 'manual' }
        ]
      };

      const features = getWorkflowFeatures(workflow);

      expect(features.hasRlm).toBe(false);
    });

    it('should detect parallel-agents steps', () => {
      const workflow = {
        name: 'test',
        steps: [
          { id: 'step1', type: 'manual' },
          { id: 'step2', type: 'parallel-agents', agent: 'code-architect', foreach: '${items}' }
        ]
      };

      const features = getWorkflowFeatures(workflow);

      expect(features.hasParallelAgents).toBe(true);
      expect(features.stepTypes).toContain('parallel-agents');
      expect(features.stepTypes).toContain('manual');
    });

    it('should collect context modes', () => {
      const workflow = {
        name: 'test',
        steps: [
          { id: 'step1', type: 'agent', agent: 'a', 'context-mode': 'minimal' },
          { id: 'step2', type: 'agent', agent: 'b', 'context-mode': 'focused' },
          { id: 'step3', type: 'agent', agent: 'c', 'context-mode': 'minimal' }
        ]
      };

      const features = getWorkflowFeatures(workflow);

      expect(features.contextModes).toContain('minimal');
      expect(features.contextModes).toContain('focused');
      expect(features.contextModes).toHaveLength(2); // Deduped
    });

    it('should collect merge strategies', () => {
      const workflow = {
        name: 'test',
        steps: [
          { id: 'step1', type: 'parallel-agents', agent: 'a', foreach: '${x}', 'merge-strategy': 'aggregate' },
          { id: 'step2', type: 'parallel-agents', agent: 'b', foreach: '${y}', 'merge-strategy': 'summary' }
        ]
      };

      const features = getWorkflowFeatures(workflow);

      expect(features.mergeStrategies).toContain('aggregate');
      expect(features.mergeStrategies).toContain('summary');
    });

    it('should collect all agents used', () => {
      const workflow = {
        name: 'test',
        steps: [
          { id: 'step1', type: 'agent', agent: 'code-architect' },
          { id: 'step2', type: 'agent', agent: 'doc-writer' },
          { id: 'step3', type: 'parallel-agents', agent: 'code-architect', foreach: '${x}' }
        ]
      };

      const features = getWorkflowFeatures(workflow);

      expect(features.agents).toContain('code-architect');
      expect(features.agents).toContain('doc-writer');
      expect(features.agents).toHaveLength(2); // Deduped
    });

    it('should extract features from large-codebase-analysis', () => {
      const content = getWorkflowContent('large-codebase-analysis');
      if (content) {
        const workflow = parseWorkflow(content);
        const features = getWorkflowFeatures(workflow);

        expect(features.hasRlm).toBe(true);
        expect(features.hasParallelAgents).toBe(true);
        expect(features.stepTypes).toContain('parallel-agents');
        expect(features.contextModes).toContain('minimal');
        expect(features.contextModes).toContain('focused');
        expect(features.agents).toContain('code-architect');
      }
    });
  });

  describe('getWorkflowSummary', () => {
    it('should return null for non-existent workflow', () => {
      const summary = getWorkflowSummary('non-existent-workflow');
      expect(summary).toBeNull();
    });

    it('should return summary for valid workflow', () => {
      const summary = getWorkflowSummary('feature-dev');

      expect(summary).not.toBeNull();
      expect(summary.name).toBe('feature-dev');
      expect(summary.version).toBeDefined();
      expect(summary.stepCount).toBeGreaterThan(0);
      expect(summary.features).toBeDefined();
      expect(summary.validation).toBeDefined();
      expect(summary.validation.valid).toBe(true);
    });

    it('should include RLM features in summary', () => {
      const summary = getWorkflowSummary('large-codebase-analysis');

      if (summary) {
        expect(summary.features.hasRlm).toBe(true);
        expect(summary.features.hasParallelAgents).toBe(true);
      }
    });

    it('should include metadata category and difficulty', () => {
      const summary = getWorkflowSummary('code-review');

      expect(summary).not.toBeNull();
      expect(summary.category).toBe('review');
      expect(summary.difficulty).toBeDefined();
    });

    it('should include validation status', () => {
      const summary = getWorkflowSummary('integrated-flow');

      expect(summary).not.toBeNull();
      expect(summary.validation.valid).toBe(true);
      expect(typeof summary.validation.errorCount).toBe('number');
      expect(typeof summary.validation.warningCount).toBe('number');
    });
  });

  describe('installWorkflowsForTool', () => {
    it('should fail for tool that does not support workflows', async () => {
      const result = await installWorkflowsForTool('cursor', 'project', null, TEST_DIR);

      expect(result.success).toBe(false);
      expect(result.error).toContain('does not support workflows');
    });

    it('should install workflows to project directory for Claude Code', async () => {
      const result = await installWorkflowsForTool('claude-code', 'project', ['feature-dev'], TEST_DIR);

      expect(result.success).toBe(true);
      expect(result.installed).toContain('feature-dev');
      expect(result.targetDir).toBe(join(TEST_DIR, '.claude/workflows/'));

      // Verify files exist
      expect(existsSync(result.targetDir)).toBe(true);
      expect(existsSync(join(result.targetDir, 'feature-dev.workflow.yaml'))).toBe(true);
    });

    it('should install workflows to project directory for OpenCode', async () => {
      const result = await installWorkflowsForTool('opencode', 'project', ['code-review'], TEST_DIR);

      expect(result.success).toBe(true);
      expect(result.installed).toContain('code-review');
      expect(result.targetDir).toBe(join(TEST_DIR, '.opencode/workflows/'));

      // Verify files exist
      expect(existsSync(join(result.targetDir, 'code-review.workflow.yaml'))).toBe(true);
    });

    it('should create manifest file after installation', async () => {
      const result = await installWorkflowsForTool('claude-code', 'project', ['feature-dev'], TEST_DIR);

      expect(result.success).toBe(true);

      const manifestPath = join(result.targetDir, '.manifest.json');
      expect(existsSync(manifestPath)).toBe(true);

      const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
      expect(manifest.source).toBe('universal-dev-standards');
      expect(manifest.type).toBe('workflows');
      expect(manifest.aiTool).toBe('claude-code');
      expect(manifest.workflows).toContain('feature-dev');
    });

    it('should handle installation of multiple workflows', async () => {
      const result = await installWorkflowsForTool(
        'claude-code',
        'project',
        ['feature-dev', 'code-review', 'integrated-flow'],
        TEST_DIR
      );

      expect(result.success).toBe(true);
      expect(result.installed).toHaveLength(3);
      expect(result.installed).toContain('feature-dev');
      expect(result.installed).toContain('code-review');
      expect(result.installed).toContain('integrated-flow');
    });

    it('should install all available workflows when workflowNames is null', async () => {
      const result = await installWorkflowsForTool('claude-code', 'project', null, TEST_DIR);

      expect(result.success).toBe(true);
      expect(result.installed.length).toBeGreaterThanOrEqual(3);
      expect(result.installed).toContain('feature-dev');
      expect(result.installed).toContain('code-review');
    });

    it('should return file hashes after installation', async () => {
      const result = await installWorkflowsForTool('claude-code', 'project', ['feature-dev'], TEST_DIR);

      expect(result.success).toBe(true);
      expect(result.fileHashes).toBeDefined();
      expect(Object.keys(result.fileHashes).length).toBeGreaterThan(0);
    });

    it('should report error for non-existent workflow', async () => {
      const result = await installWorkflowsForTool('claude-code', 'project', ['non-existent'], TEST_DIR);

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].workflow).toBe('non-existent');
    });
  });

  describe('getInstalledWorkflowsForTool', () => {
    it('should return null when no workflows installed', () => {
      const info = getInstalledWorkflowsForTool('claude-code', 'project', TEST_DIR);
      expect(info).toBeNull();
    });

    it('should return info after installation', async () => {
      await installWorkflowsForTool('claude-code', 'project', ['feature-dev', 'code-review'], TEST_DIR);

      const info = getInstalledWorkflowsForTool('claude-code', 'project', TEST_DIR);

      expect(info).not.toBeNull();
      expect(info.installed).toBe(true);
      expect(info.aiTool).toBe('claude-code');
      expect(info.level).toBe('project');
      expect(info.count).toBe(2);
      expect(info.workflows).toContain('feature-dev');
      expect(info.workflows).toContain('code-review');
    });

    it('should return info even without manifest', async () => {
      // Create workflows directory without manifest
      const workflowsDir = join(TEST_DIR, '.claude/workflows/');
      mkdirSync(workflowsDir, { recursive: true });
      writeFileSync(join(workflowsDir, 'test.workflow.yaml'), 'name: test\nversion: 1.0.0');

      const info = getInstalledWorkflowsForTool('claude-code', 'project', TEST_DIR);

      expect(info).not.toBeNull();
      expect(info.installed).toBe(true);
      expect(info.version).toBeNull();
      expect(info.workflows).toContain('test');
    });

    it('should return null for empty workflows directory', () => {
      const workflowsDir = join(TEST_DIR, '.claude/workflows/');
      mkdirSync(workflowsDir, { recursive: true });

      const info = getInstalledWorkflowsForTool('claude-code', 'project', TEST_DIR);

      expect(info).toBeNull();
    });
  });

  describe('installWorkflowsToMultipleTools', () => {
    it('should install to multiple tools at once', async () => {
      const installations = [
        { agent: 'claude-code', level: 'project' },
        { agent: 'opencode', level: 'project' }
      ];

      const result = await installWorkflowsToMultipleTools(installations, ['feature-dev'], TEST_DIR);

      expect(result.success).toBe(true);
      expect(result.installations).toHaveLength(2);
      expect(result.totalInstalled).toBe(2);

      // Verify both directories have files
      expect(existsSync(join(TEST_DIR, '.claude/workflows/feature-dev.workflow.yaml'))).toBe(true);
      expect(existsSync(join(TEST_DIR, '.opencode/workflows/feature-dev.workflow.yaml'))).toBe(true);
    });

    it('should track partial failures', async () => {
      const installations = [
        { agent: 'claude-code', level: 'project' },
        { agent: 'cursor', level: 'project' }  // Does not support workflows
      ];

      const result = await installWorkflowsToMultipleTools(installations, ['feature-dev'], TEST_DIR);

      expect(result.success).toBe(false);  // One failed
      expect(result.totalInstalled).toBe(1);  // Only claude-code succeeded
      // The cursor installation fails at tool support level, not individual workflow level
      // So totalErrors is 0 but success is false
      expect(result.installations[1].success).toBe(false);
      expect(result.installations[1].error).toContain('does not support workflows');
    });

    it('should merge file hashes from all installations', async () => {
      const installations = [
        { agent: 'claude-code', level: 'project' },
        { agent: 'opencode', level: 'project' }
      ];

      const result = await installWorkflowsToMultipleTools(installations, ['feature-dev'], TEST_DIR);

      expect(result.allFileHashes).toBeDefined();
      expect(Object.keys(result.allFileHashes).length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Workflow File Format', () => {
    it('should preserve YAML format when installing', async () => {
      const result = await installWorkflowsForTool('claude-code', 'project', ['feature-dev'], TEST_DIR);

      expect(result.success).toBe(true);
      const content = readFileSync(join(result.targetDir, 'feature-dev.workflow.yaml'), 'utf-8');

      // Should be valid YAML
      const parsed = parseWorkflow(content);
      expect(parsed.name).toBe('feature-dev');
      expect(parsed.steps).toBeDefined();
    });

    it('should include metadata in installed workflows', async () => {
      const result = await installWorkflowsForTool('claude-code', 'project', ['code-review'], TEST_DIR);

      expect(result.success).toBe(true);
      const content = readFileSync(join(result.targetDir, 'code-review.workflow.yaml'), 'utf-8');
      const parsed = parseWorkflow(content);

      expect(parsed.metadata).toBeDefined();
      expect(parsed.metadata.category).toBe('review');
      expect(parsed.metadata.difficulty).toBeDefined();
    });
  });
});
