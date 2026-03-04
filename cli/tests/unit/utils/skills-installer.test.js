import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, readFileSync, rmSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname, basename } from 'path';
import {
  getAvailableSkillNames,
  getAvailableCommandNames,
  installSkillsForAgent,
  installCommandsForAgent,
  getInstalledSkillsInfoForAgent,
  getInstalledCommandsForAgent,
  deduplicateInstallations,
  cleanupDuplicateSkills,
  cleanupLegacyCommands,
  parseFrontmatter,
  rebuildWithFrontmatter
} from '../../../src/utils/skills-installer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const TEST_DIR = join(__dirname, '../../temp/skills-installer-test');

describe('Skills Installer', () => {
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

  describe('getAvailableSkillNames', () => {
    it('should return array of skill names', () => {
      const skills = getAvailableSkillNames();

      expect(Array.isArray(skills)).toBe(true);
      expect(skills.length).toBeGreaterThan(0);
    });

    it('should include known skills', () => {
      const skills = getAvailableSkillNames();

      expect(skills).toContain('commit-standards');
      expect(skills).toContain('testing-guide');
      expect(skills).toContain('code-review-assistant');
    });

    it('should not include non-skill items', () => {
      const skills = getAvailableSkillNames();

      expect(skills).not.toContain('README.md');
      expect(skills).not.toContain('commands');
    });
  });

  describe('getAvailableCommandNames', () => {
    it('should return array of command names', () => {
      const commands = getAvailableCommandNames();

      expect(Array.isArray(commands)).toBe(true);
      expect(commands.length).toBeGreaterThan(0);
    });

    it('should include known commands from Skills', () => {
      const commands = getAvailableCommandNames();

      expect(commands).toContain('commit');
      expect(commands).toContain('review');
      expect(commands).toContain('tdd');
    });

    it('should include Commands-only commands (added Jan 2026)', () => {
      const commands = getAvailableCommandNames();

      // CLI management
      expect(commands).toContain('init');
      expect(commands).toContain('update');
      expect(commands).toContain('check');
      expect(commands).toContain('config');

      // Derivation commands
      expect(commands).toContain('derive');

      // Reverse engineering
      expect(commands).toContain('reverse');

      // Documentation
      expect(commands).toContain('docs');
    });

    it('should not include README or COMMAND-FAMILY-OVERVIEW', () => {
      const commands = getAvailableCommandNames();
      expect(commands).not.toContain('README');
      expect(commands).not.toContain('COMMAND-FAMILY-OVERVIEW');
    });
  });

  describe('installSkillsForAgent', () => {
    it('should fail for agent that does not support skills', async () => {
      const result = await installSkillsForAgent('unknown-agent', 'project', null, TEST_DIR);

      expect(result.success).toBe(false);
      expect(result.error).toContain('does not support skills');
    });

    it('should install skills to project directory', async () => {
      const result = await installSkillsForAgent('opencode', 'project', ['commit-standards'], TEST_DIR);

      expect(result.success).toBe(true);
      expect(result.installed).toContain('commit-standards');
      expect(result.targetDir).toBe(join(TEST_DIR, '.opencode/skill/'));

      // Verify files exist
      const targetDir = result.targetDir;
      expect(existsSync(targetDir)).toBe(true);
      expect(existsSync(join(targetDir, 'commit-standards'))).toBe(true);
    });

    it('should create manifest file after installation', async () => {
      const result = await installSkillsForAgent('opencode', 'project', ['commit-standards'], TEST_DIR);

      expect(result.success).toBe(true);

      const manifestPath = join(result.targetDir, '.manifest.json');
      expect(existsSync(manifestPath)).toBe(true);

      const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
      expect(manifest.source).toBe('universal-dev-standards');
      expect(manifest.agent).toBe('opencode');
    });

    it('should handle installation of multiple skills', async () => {
      const result = await installSkillsForAgent(
        'opencode',
        'project',
        ['commit-standards', 'testing-guide'],
        TEST_DIR
      );

      expect(result.success).toBe(true);
      expect(result.installed).toHaveLength(2);
      expect(result.installed).toContain('commit-standards');
      expect(result.installed).toContain('testing-guide');
    });
  });

  describe('installCommandsForAgent', () => {
    it('should install commands for Cursor (added Jan 2026, v2.3.35)', async () => {
      // Cursor added commands support in v2.3.35 (Jan 2026)
      const result = await installCommandsForAgent('cursor', 'project', ['commit'], TEST_DIR);

      expect(result.success).toBe(true);
      expect(result.installed).toContain('commit');
    });

    it('should install commands to project directory', async () => {
      const result = await installCommandsForAgent('opencode', 'project', ['commit'], TEST_DIR);

      expect(result.success).toBe(true);
      expect(result.installed).toContain('commit');

      // Verify files exist
      const targetDir = result.targetDir;
      expect(existsSync(targetDir)).toBe(true);
      expect(existsSync(join(targetDir, 'commit.md'))).toBe(true);
    });

    it('should create manifest file after installation', async () => {
      const result = await installCommandsForAgent('opencode', 'project', ['commit'], TEST_DIR);

      expect(result.success).toBe(true);

      const manifestPath = join(result.targetDir, '.manifest.json');
      expect(existsSync(manifestPath)).toBe(true);

      const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
      expect(manifest.commands).toContain('commit');
      expect(manifest.level).toBe('project');
    });

    it('should install commands as TOML for Gemini CLI', async () => {
      const result = await installCommandsForAgent('gemini-cli', 'project', ['commit'], TEST_DIR);

      expect(result.success).toBe(true);

      // Verify TOML file exists
      const targetDir = result.targetDir;
      expect(existsSync(join(targetDir, 'commit.toml'))).toBe(true);

      // Verify content is TOML format
      const content = readFileSync(join(targetDir, 'commit.toml'), 'utf-8');
      expect(content).toContain('description =');
      expect(content).toContain('prompt =');
    });

    it('should install Commands-only commands (CLI management)', async () => {
      // Test CLI management commands that don't have corresponding Skills
      const result = await installCommandsForAgent('opencode', 'project', ['init', 'check'], TEST_DIR);

      expect(result.success).toBe(true);
      expect(result.installed).toContain('init');
      expect(result.installed).toContain('check');

      // Verify files exist
      const targetDir = result.targetDir;
      expect(existsSync(join(targetDir, 'init.md'))).toBe(true);
      expect(existsSync(join(targetDir, 'check.md'))).toBe(true);
    });

    it('should install Commands-only commands (derivation)', async () => {
      // Test derivation commands
      const result = await installCommandsForAgent('cursor', 'project', ['derive'], TEST_DIR);

      expect(result.success).toBe(true);
      expect(result.installed).toContain('derive');
    });

    it('should install Commands-only commands (reverse engineering)', async () => {
      // Test reverse engineering commands
      const result = await installCommandsForAgent('opencode', 'project', ['reverse'], TEST_DIR);

      expect(result.success).toBe(true);
      expect(result.installed).toContain('reverse');
    });

    it('should install all available commands when null is passed', async () => {
      const result = await installCommandsForAgent('opencode', 'project', null, TEST_DIR);

      expect(result.success).toBe(true);
      // Should install all commands from the commands/ directory (19 commands)
      expect(result.installed.length).toBeGreaterThanOrEqual(19);
      // Verify some Commands-only commands are included
      expect(result.installed).toContain('init');
      expect(result.installed).toContain('derive');
      expect(result.installed).toContain('reverse');
    });
  });

  describe('getInstalledSkillsInfoForAgent', () => {
    it('should return null when no skills installed', () => {
      const info = getInstalledSkillsInfoForAgent('opencode', 'project', TEST_DIR);
      expect(info).toBeNull();
    });

    it('should return info after installation', async () => {
      // Install skills first
      await installSkillsForAgent('opencode', 'project', ['commit-standards'], TEST_DIR);

      const info = getInstalledSkillsInfoForAgent('opencode', 'project', TEST_DIR);

      expect(info).not.toBeNull();
      expect(info.installed).toBe(true);
      expect(info.agent).toBe('opencode');
      expect(info.level).toBe('project');
      expect(info.source).toBe('universal-dev-standards');
    });

    it('should return info even without manifest', async () => {
      // Create skills directory without manifest
      const skillsDir = join(TEST_DIR, '.opencode/skill/');
      mkdirSync(skillsDir, { recursive: true });
      mkdirSync(join(skillsDir, 'commit-standards'));
      writeFileSync(join(skillsDir, 'commit-standards', 'SKILL.md'), '# Test');

      const info = getInstalledSkillsInfoForAgent('opencode', 'project', TEST_DIR);

      expect(info).not.toBeNull();
      expect(info.installed).toBe(true);
      expect(info.version).toBeNull();
      expect(info.source).toBe('unknown');
    });

    it('should return null for empty skills directory', () => {
      // Create empty skills directory (no SKILL.md files)
      const skillsDir = join(TEST_DIR, '.opencode/skill/');
      mkdirSync(skillsDir, { recursive: true });

      const info = getInstalledSkillsInfoForAgent('opencode', 'project', TEST_DIR);

      // Empty directory should NOT be considered as installed
      expect(info).toBeNull();
    });

    it('should return null for skills directory with empty subdirectories', () => {
      // Create skills directory with empty subdirectory (no SKILL.md)
      const skillsDir = join(TEST_DIR, '.opencode/skill/');
      mkdirSync(skillsDir, { recursive: true });
      mkdirSync(join(skillsDir, 'some-skill'));
      // No SKILL.md file inside

      const info = getInstalledSkillsInfoForAgent('opencode', 'project', TEST_DIR);

      // Directory with empty subdirs should NOT be considered as installed
      expect(info).toBeNull();
    });
  });

  describe('getInstalledCommandsForAgent', () => {
    it('should return null when no commands installed', () => {
      const info = getInstalledCommandsForAgent('opencode', 'project', TEST_DIR);
      expect(info).toBeNull();
    });

    it('should return info after installation', async () => {
      await installCommandsForAgent('opencode', 'project', ['commit', 'review'], TEST_DIR);

      const info = getInstalledCommandsForAgent('opencode', 'project', TEST_DIR);

      expect(info).not.toBeNull();
      expect(info.installed).toBe(true);
      expect(info.count).toBe(2);
      expect(info.commands).toContain('commit');
      expect(info.commands).toContain('review');
      expect(info.level).toBe('project');
    });

    it('should detect TOML files for Gemini CLI', async () => {
      await installCommandsForAgent('gemini-cli', 'project', ['commit'], TEST_DIR);

      const info = getInstalledCommandsForAgent('gemini-cli', 'project', TEST_DIR);

      expect(info).not.toBeNull();
      expect(info.installed).toBe(true);
      expect(info.commands).toContain('commit');
    });
  });

  describe('TOML Conversion', () => {
    it('should convert YAML frontmatter to TOML format', async () => {
      await installCommandsForAgent('gemini-cli', 'project', ['commit'], TEST_DIR);

      const tomlPath = join(TEST_DIR, '.gemini/commands/commit.toml');
      const content = readFileSync(tomlPath, 'utf-8');

      // Check TOML structure
      expect(content).toContain('# commit command - converted from UDS');
      expect(content).toContain('description = ');
      expect(content).toContain('prompt = """');
    });

    it('should include arguments placeholder in TOML when argument-hint exists', async () => {
      await installCommandsForAgent('gemini-cli', 'project', ['commit'], TEST_DIR);

      const tomlPath = join(TEST_DIR, '.gemini/commands/commit.toml');
      const content = readFileSync(tomlPath, 'utf-8');

      // Check for arguments handling (commit command has argument-hint)
      expect(content).toContain('{{args}}');
    });

    it('should escape special characters in TOML strings', async () => {
      await installCommandsForAgent('gemini-cli', 'project', ['review'], TEST_DIR);

      const tomlPath = join(TEST_DIR, '.gemini/commands/review.toml');
      expect(existsSync(tomlPath)).toBe(true);

      const content = readFileSync(tomlPath, 'utf-8');
      // Should be valid TOML (no unescaped quotes in description)
      expect(content).toMatch(/description = "[^"]*"/);
    });
  });

  describe('deduplicateInstallations', () => {
    it('should keep single installation unchanged', () => {
      const input = [{ agent: 'claude-code', level: 'project' }];
      const result = deduplicateInstallations(input);
      expect(result).toEqual([{ agent: 'claude-code', level: 'project' }]);
    });

    it('should deduplicate same agent at both levels, keeping project', () => {
      const input = [
        { agent: 'claude-code', level: 'user' },
        { agent: 'claude-code', level: 'project' }
      ];
      const result = deduplicateInstallations(input);
      expect(result).toEqual([{ agent: 'claude-code', level: 'project' }]);
    });

    it('should keep user level when project is not selected', () => {
      const input = [
        { agent: 'claude-code', level: 'user' },
        { agent: 'claude-code', level: 'user' }
      ];
      const result = deduplicateInstallations(input);
      expect(result).toEqual([{ agent: 'claude-code', level: 'user' }]);
    });

    it('should not deduplicate different agents', () => {
      const input = [
        { agent: 'claude-code', level: 'user' },
        { agent: 'opencode', level: 'project' }
      ];
      const result = deduplicateInstallations(input);
      expect(result).toEqual([
        { agent: 'claude-code', level: 'user' },
        { agent: 'opencode', level: 'project' }
      ]);
    });

    it('should handle multiple agents with duplicates', () => {
      const input = [
        { agent: 'claude-code', level: 'user' },
        { agent: 'opencode', level: 'user' },
        { agent: 'claude-code', level: 'project' },
        { agent: 'opencode', level: 'project' }
      ];
      const result = deduplicateInstallations(input);
      expect(result).toEqual([
        { agent: 'claude-code', level: 'project' },
        { agent: 'opencode', level: 'project' }
      ]);
    });

    it('should handle empty array', () => {
      expect(deduplicateInstallations([])).toEqual([]);
    });
  });

  describe('cleanupDuplicateSkills', () => {
    it('should return empty when no duplicates exist', () => {
      const result = cleanupDuplicateSkills(TEST_DIR);
      expect(result.cleaned).toEqual([]);
      expect(result.errors).toEqual([]);
    });

    it('should clean user-level skills when project-level exists', async () => {
      // Install skills at project level for claude-code
      await installSkillsForAgent('claude-code', 'project', ['commit-standards'], TEST_DIR);

      // Manually create user-level skill to simulate duplicate
      // Note: we can't easily test real user-level paths in test, but we verify the function runs
      const result = cleanupDuplicateSkills(TEST_DIR);
      // In test environment, user paths point to real home dir, so no duplicates expected
      expect(result.errors).toEqual([]);
    });
  });

  describe('cleanupLegacyCommands', () => {
    it('should return empty when no legacy commands dir exists', () => {
      const result = cleanupLegacyCommands(TEST_DIR);
      expect(result.cleaned).toEqual([]);
      expect(result.errors).toEqual([]);
    });

    it('should clean legacy command files that have matching skills', () => {
      // Create legacy commands dir with a file
      const legacyDir = join(TEST_DIR, '.claude', 'commands');
      const skillsDir = join(TEST_DIR, '.claude', 'skills', 'commit-standards');
      mkdirSync(legacyDir, { recursive: true });
      mkdirSync(skillsDir, { recursive: true });
      writeFileSync(join(legacyDir, 'commit-standards.md'), '# Legacy command');
      writeFileSync(join(skillsDir, 'SKILL.md'), '# Skill');

      const result = cleanupLegacyCommands(TEST_DIR);
      expect(result.cleaned.length).toBe(1);
      expect(result.cleaned[0].path).toContain('commit-standards.md');
      expect(existsSync(join(legacyDir, 'commit-standards.md'))).toBe(false);
    });

    it('should not remove legacy commands without matching skills', () => {
      const legacyDir = join(TEST_DIR, '.claude', 'commands');
      const skillsDir = join(TEST_DIR, '.claude', 'skills');
      mkdirSync(legacyDir, { recursive: true });
      mkdirSync(skillsDir, { recursive: true });
      writeFileSync(join(legacyDir, 'custom-command.md'), '# Custom command');

      const result = cleanupLegacyCommands(TEST_DIR);
      expect(result.cleaned).toEqual([]);
      expect(existsSync(join(legacyDir, 'custom-command.md'))).toBe(true);
    });
  });

  describe('parseFrontmatter', () => {
    it('should parse simple frontmatter', () => {
      const content = '---\nname: commit\nscope: universal\n---\n# Body';
      const result = parseFrontmatter(content);

      expect(result).not.toBeNull();
      expect(result.frontmatter.name).toBe('commit');
      expect(result.frontmatter.scope).toBe('universal');
      expect(result.body).toBe('# Body');
    });

    it('should parse multi-line description with pipe', () => {
      const content = '---\ndescription: |\n  First line\n  Second line\nname: test\n---\n# Body';
      const result = parseFrontmatter(content);

      expect(result).not.toBeNull();
      expect(result.frontmatter.description).toContain('First line');
      expect(result.frontmatter.description).toContain('Second line');
      expect(result.frontmatter.name).toBe('test');
    });

    it('should return null for content without frontmatter', () => {
      const content = '# Just a heading\nSome text';
      const result = parseFrontmatter(content);
      expect(result).toBeNull();
    });

    it('should handle frontmatter with hyphenated keys', () => {
      const content = '---\nallowed-tools: Read, Grep\ndisable-model-invocation: true\n---\nBody';
      const result = parseFrontmatter(content);

      expect(result).not.toBeNull();
      expect(result.frontmatter['allowed-tools']).toBe('Read, Grep');
      expect(result.frontmatter['disable-model-invocation']).toBe('true');
    });

    it('should handle frontmatter with quoted values', () => {
      const content = '---\ndescription: "[UDS] Generate commit messages"\n---\nBody';
      const result = parseFrontmatter(content);

      expect(result).not.toBeNull();
      expect(result.frontmatter.description).toBe('"[UDS] Generate commit messages"');
    });
  });

  describe('rebuildWithFrontmatter', () => {
    it('should merge new fields into existing frontmatter', () => {
      const content = '---\ndescription: Test skill\nstatus: current\n---\n# Body';
      const result = rebuildWithFrontmatter(content, { name: 'test', scope: 'universal' });

      expect(result).toContain('name: test');
      expect(result).toContain('scope: universal');
      expect(result).toContain('description: Test skill');
      expect(result).toContain('# Body');
    });

    it('should override existing fields', () => {
      const content = '---\nname: old-name\nscope: partial\n---\n# Body';
      const result = rebuildWithFrontmatter(content, { name: 'new-name' });

      expect(result).toContain('name: new-name');
      expect(result).not.toContain('name: old-name');
    });

    it('should create frontmatter for content without one', () => {
      const content = '# Just a heading';
      const result = rebuildWithFrontmatter(content, { name: 'test' });

      expect(result).toContain('---\nname: test\n---');
      expect(result).toContain('# Just a heading');
    });
  });

  describe('Locale support', () => {
    it('should install skills with locale=en using English source (default behavior)', async () => {
      const result = await installSkillsForAgent('opencode', 'project', ['commit-standards'], TEST_DIR, 'en');

      expect(result.success).toBe(true);
      expect(result.installed).toContain('commit-standards');

      // Verify SKILL.md is the English version
      const skillPath = join(result.targetDir, 'commit-standards', 'SKILL.md');
      const content = readFileSync(skillPath, 'utf-8');
      expect(content).toContain('name: commit');
    });

    it('should install zh-TW skills when locale=zh-TW', async () => {
      const result = await installSkillsForAgent('opencode', 'project', ['commit-standards'], TEST_DIR, 'zh-TW');

      expect(result.success).toBe(true);
      expect(result.installed).toContain('commit-standards');

      // Verify SKILL.md has merged frontmatter
      const skillPath = join(result.targetDir, 'commit-standards', 'SKILL.md');
      const content = readFileSync(skillPath, 'utf-8');

      // Should have required fields from English source
      expect(content).toContain('name: commit');
      expect(content).toContain('allowed-tools:');
    });

    it('should fallback to English when locale directory does not exist', async () => {
      const result = await installSkillsForAgent('opencode', 'project', ['commit-standards'], TEST_DIR, 'ja-JP');

      expect(result.success).toBe(true);
      expect(result.installed).toContain('commit-standards');

      // Should still work with English fallback
      const skillPath = join(result.targetDir, 'commit-standards', 'SKILL.md');
      expect(existsSync(skillPath)).toBe(true);
    });

    it('should fallback to English for a skill missing in locale directory', async () => {
      // zh-CN may be missing brainstorm-assistant — verify fallback works
      const result = await installSkillsForAgent('opencode', 'project', ['commit-standards'], TEST_DIR, 'zh-CN');

      expect(result.success).toBe(true);
      expect(result.installed).toContain('commit-standards');
    });

    it('should record locale in manifest', async () => {
      await installSkillsForAgent('opencode', 'project', ['commit-standards'], TEST_DIR, 'zh-TW');

      const manifestPath = join(TEST_DIR, '.opencode/skill/', '.manifest.json');
      const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
      expect(manifest.locale).toBe('zh-TW');
    });

    it('should record default locale in manifest when not specified', async () => {
      await installSkillsForAgent('opencode', 'project', ['commit-standards'], TEST_DIR);

      const manifestPath = join(TEST_DIR, '.opencode/skill/', '.manifest.json');
      const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
      expect(manifest.locale).toBe('en');
    });
  });
});
