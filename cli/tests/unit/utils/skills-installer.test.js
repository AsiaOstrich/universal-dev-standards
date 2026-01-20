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
  getInstalledCommandsForAgent
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

    it('should include known commands', () => {
      const commands = getAvailableCommandNames();

      expect(commands).toContain('commit');
      expect(commands).toContain('review');
      expect(commands).toContain('tdd');
    });

    it('should not include README', () => {
      const commands = getAvailableCommandNames();
      expect(commands).not.toContain('README');
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
    it('should fail for agent without commands support', async () => {
      const result = await installCommandsForAgent('cursor', 'project', null, TEST_DIR);

      expect(result.success).toBe(false);
      expect(result.error).toContain('does not support slash commands');
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
});
