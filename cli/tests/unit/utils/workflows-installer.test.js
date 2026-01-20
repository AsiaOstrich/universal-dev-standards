import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import {
  getAvailableWorkflowNames,
  getWorkflowContent,
  parseWorkflow,
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
