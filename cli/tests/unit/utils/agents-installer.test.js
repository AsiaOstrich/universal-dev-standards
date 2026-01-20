import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import {
  getAvailableAgentNames,
  getAgentContent,
  parseAgentFrontmatter,
  installAgentsForTool,
  getInstalledAgentsForTool,
  installAgentsToMultipleTools
} from '../../../src/utils/agents-installer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const TEST_DIR = join(__dirname, '../../temp/agents-installer-test');

describe('Agents Installer', () => {
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

  describe('getAvailableAgentNames', () => {
    it('should return array of agent names', () => {
      const agents = getAvailableAgentNames();

      expect(Array.isArray(agents)).toBe(true);
      expect(agents.length).toBeGreaterThan(0);
    });

    it('should include known agents', () => {
      const agents = getAvailableAgentNames();

      expect(agents).toContain('code-architect');
      expect(agents).toContain('test-specialist');
      expect(agents).toContain('reviewer');
      expect(agents).toContain('doc-writer');
      expect(agents).toContain('spec-analyst');
    });

    it('should not include non-agent items', () => {
      const agents = getAvailableAgentNames();

      expect(agents).not.toContain('README');
      expect(agents).not.toContain('.DS_Store');
      expect(agents).not.toContain('.manifest');
    });
  });

  describe('getAgentContent', () => {
    it('should return content for valid agent', () => {
      const content = getAgentContent('code-architect');

      expect(content).not.toBeNull();
      expect(content).toContain('name: code-architect');
      expect(content).toContain('role:');
    });

    it('should return null for non-existent agent', () => {
      const content = getAgentContent('non-existent-agent');
      expect(content).toBeNull();
    });
  });

  describe('parseAgentFrontmatter', () => {
    it('should parse frontmatter fields', () => {
      const content = `---
name: test-agent
version: 1.0.0
role: specialist
expertise: [design, testing]
---

# Test Agent Content
`;

      const parsed = parseAgentFrontmatter(content);

      expect(parsed.name).toBe('test-agent');
      expect(parsed.version).toBe('1.0.0');
      expect(parsed.role).toBe('specialist');
      expect(parsed.expertise).toEqual(['design', 'testing']);
    });

    it('should return empty object for content without frontmatter', () => {
      const content = '# Just a heading\n\nSome content';
      const parsed = parseAgentFrontmatter(content);

      expect(parsed).toEqual({});
    });

    it('should handle arrays with quotes', () => {
      const content = `---
name: agent
tools: ["Read", "Write", "Edit"]
---`;

      const parsed = parseAgentFrontmatter(content);
      expect(parsed.tools).toEqual(['Read', 'Write', 'Edit']);
    });
  });

  describe('installAgentsForTool', () => {
    it('should fail for tool that does not support agents', async () => {
      // antigravity is the only tool that doesn't support agents
      const result = await installAgentsForTool('antigravity', 'project', null, TEST_DIR);

      expect(result.success).toBe(false);
      expect(result.error).toContain('does not support agents');
    });

    it('should install agents to project directory for Claude Code', async () => {
      const result = await installAgentsForTool('claude-code', 'project', ['code-architect'], TEST_DIR);

      expect(result.success).toBe(true);
      expect(result.installed).toContain('code-architect');
      expect(result.targetDir).toBe(join(TEST_DIR, '.claude/agents/'));

      // Verify files exist
      const targetDir = result.targetDir;
      expect(existsSync(targetDir)).toBe(true);
      expect(existsSync(join(targetDir, 'code-architect.md'))).toBe(true);
    });

    it('should install agents to project directory for OpenCode', async () => {
      const result = await installAgentsForTool('opencode', 'project', ['reviewer'], TEST_DIR);

      expect(result.success).toBe(true);
      expect(result.installed).toContain('reviewer');
      expect(result.targetDir).toBe(join(TEST_DIR, '.opencode/agents/'));

      // Verify files exist
      expect(existsSync(join(result.targetDir, 'reviewer.md'))).toBe(true);
    });

    it('should create manifest file after installation', async () => {
      const result = await installAgentsForTool('claude-code', 'project', ['code-architect'], TEST_DIR);

      expect(result.success).toBe(true);

      const manifestPath = join(result.targetDir, '.manifest.json');
      expect(existsSync(manifestPath)).toBe(true);

      const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
      expect(manifest.source).toBe('universal-dev-standards');
      expect(manifest.type).toBe('agents');
      expect(manifest.aiTool).toBe('claude-code');
      expect(manifest.agents).toContain('code-architect');
    });

    it('should handle installation of multiple agents', async () => {
      const result = await installAgentsForTool(
        'claude-code',
        'project',
        ['code-architect', 'reviewer', 'test-specialist'],
        TEST_DIR
      );

      expect(result.success).toBe(true);
      expect(result.installed).toHaveLength(3);
      expect(result.installed).toContain('code-architect');
      expect(result.installed).toContain('reviewer');
      expect(result.installed).toContain('test-specialist');
    });

    it('should install all available agents when agentNames is null', async () => {
      const result = await installAgentsForTool('claude-code', 'project', null, TEST_DIR);

      expect(result.success).toBe(true);
      expect(result.installed.length).toBeGreaterThanOrEqual(5);
      expect(result.installed).toContain('code-architect');
      expect(result.installed).toContain('test-specialist');
    });

    it('should return file hashes after installation', async () => {
      const result = await installAgentsForTool('claude-code', 'project', ['code-architect'], TEST_DIR);

      expect(result.success).toBe(true);
      expect(result.fileHashes).toBeDefined();
      expect(Object.keys(result.fileHashes).length).toBeGreaterThan(0);
    });
  });

  describe('getInstalledAgentsForTool', () => {
    it('should return null when no agents installed', () => {
      const info = getInstalledAgentsForTool('claude-code', 'project', TEST_DIR);
      expect(info).toBeNull();
    });

    it('should return info after installation', async () => {
      await installAgentsForTool('claude-code', 'project', ['code-architect', 'reviewer'], TEST_DIR);

      const info = getInstalledAgentsForTool('claude-code', 'project', TEST_DIR);

      expect(info).not.toBeNull();
      expect(info.installed).toBe(true);
      expect(info.aiTool).toBe('claude-code');
      expect(info.level).toBe('project');
      expect(info.count).toBe(2);
      expect(info.agents).toContain('code-architect');
      expect(info.agents).toContain('reviewer');
    });

    it('should return info even without manifest', async () => {
      // Create agents directory without manifest
      const agentsDir = join(TEST_DIR, '.claude/agents/');
      mkdirSync(agentsDir, { recursive: true });
      writeFileSync(join(agentsDir, 'test-agent.md'), '---\nname: test-agent\n---\n# Test');

      const info = getInstalledAgentsForTool('claude-code', 'project', TEST_DIR);

      expect(info).not.toBeNull();
      expect(info.installed).toBe(true);
      expect(info.version).toBeNull();
      expect(info.agents).toContain('test-agent');
    });

    it('should return null for empty agents directory', () => {
      const agentsDir = join(TEST_DIR, '.claude/agents/');
      mkdirSync(agentsDir, { recursive: true });

      const info = getInstalledAgentsForTool('claude-code', 'project', TEST_DIR);

      expect(info).toBeNull();
    });
  });

  describe('installAgentsToMultipleTools', () => {
    it('should install to multiple tools at once', async () => {
      const installations = [
        { agent: 'claude-code', level: 'project' },
        { agent: 'opencode', level: 'project' }
      ];

      const result = await installAgentsToMultipleTools(installations, ['code-architect'], TEST_DIR);

      expect(result.success).toBe(true);
      expect(result.installations).toHaveLength(2);
      expect(result.totalInstalled).toBe(2);

      // Verify both directories have files
      expect(existsSync(join(TEST_DIR, '.claude/agents/code-architect.md'))).toBe(true);
      expect(existsSync(join(TEST_DIR, '.opencode/agents/code-architect.md'))).toBe(true);
    });

    it('should track partial failures', async () => {
      const installations = [
        { agent: 'claude-code', level: 'project' },
        { agent: 'antigravity', level: 'project' }  // Does not support agents
      ];

      const result = await installAgentsToMultipleTools(installations, ['code-architect'], TEST_DIR);

      expect(result.success).toBe(false);  // One failed
      expect(result.totalInstalled).toBe(1);  // Only claude-code succeeded
      // The antigravity installation fails at tool support level, not individual agent level
      // So totalErrors is 0 but success is false
      expect(result.installations[1].success).toBe(false);
      expect(result.installations[1].error).toContain('does not support agents');
    });

    it('should merge file hashes from all installations', async () => {
      const installations = [
        { agent: 'claude-code', level: 'project' },
        { agent: 'opencode', level: 'project' }
      ];

      const result = await installAgentsToMultipleTools(installations, ['code-architect'], TEST_DIR);

      expect(result.allFileHashes).toBeDefined();
      expect(Object.keys(result.allFileHashes).length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Agent Transformation', () => {
    it('should not add header for Claude Code (native Task support)', async () => {
      const result = await installAgentsForTool('claude-code', 'project', ['code-architect'], TEST_DIR);

      expect(result.success).toBe(true);
      const content = readFileSync(join(result.targetDir, 'code-architect.md'), 'utf-8');

      // Should NOT have the inline mode header since Claude Code supports Task tool
      expect(content).not.toContain('<!-- Execution Mode: inline');
    });

    it('should not add header for OpenCode (native Task support)', async () => {
      const result = await installAgentsForTool('opencode', 'project', ['code-architect'], TEST_DIR);

      expect(result.success).toBe(true);
      const content = readFileSync(join(result.targetDir, 'code-architect.md'), 'utf-8');

      // Should NOT have the inline mode header since OpenCode supports Task tool
      expect(content).not.toContain('<!-- Execution Mode: inline');
    });
  });
});
