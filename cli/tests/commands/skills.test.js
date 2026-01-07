import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { homedir } from 'os';
import { skillsCommand, _testing } from '../../src/commands/skills.js';

const { findUdsPlugin, PLUGIN_KEY_NEW, PLUGIN_KEY_OLD } = _testing;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const TEST_DIR = join(__dirname, '../temp/skills-test');

describe('Skills Command', () => {
  let originalCwd;
  let consoleLogs = [];

  beforeEach(() => {
    originalCwd = process.cwd();
    consoleLogs = [];

    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
    mkdirSync(TEST_DIR, { recursive: true });
    process.chdir(TEST_DIR);

    vi.spyOn(console, 'log').mockImplementation((...args) => {
      consoleLogs.push(args.join(' '));
    });
  });

  afterEach(() => {
    process.chdir(originalCwd);
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
    vi.restoreAllMocks();
  });

  describe('skillsCommand', () => {
    it('should display header', () => {
      skillsCommand();

      const output = consoleLogs.join('\n');
      expect(output).toContain('Universal Dev Standards');
      expect(output).toContain('Installed Skills');
    });

    it('should check for Plugin Marketplace installation', () => {
      // The command should check the real plugins directory
      // If no plugins are installed, it should show installation instructions
      skillsCommand();

      const output = consoleLogs.join('\n');
      // Should contain either installed skills or installation instructions
      expect(
        output.includes('Plugin Marketplace') ||
        output.includes('/plugin marketplace add')
      ).toBe(true);
    });

    it('should detect project-level skills', () => {
      // Create project-level skills directory with a known skill
      const projectSkillsDir = join(TEST_DIR, '.claude', 'skills');
      mkdirSync(join(projectSkillsDir, 'commit-standards'), { recursive: true });
      writeFileSync(
        join(projectSkillsDir, 'commit-standards', 'SKILL.md'),
        '# Commit Standards'
      );

      skillsCommand();

      const output = consoleLogs.join('\n');
      expect(output).toContain('Project Level');
      expect(output).toContain('commit-standards');
    });

    it('should show deprecated warning for manual installations', () => {
      // Create project-level skills directory
      const projectSkillsDir = join(TEST_DIR, '.claude', 'skills');
      mkdirSync(join(projectSkillsDir, 'commit-standards'), { recursive: true });
      writeFileSync(
        join(projectSkillsDir, 'commit-standards', 'SKILL.md'),
        '# Commit Standards'
      );

      skillsCommand();

      const output = consoleLogs.join('\n');
      expect(output).toContain('deprecated');
    });

    it('should show skill count summary', () => {
      // Create project-level skills to trigger the summary display
      const projectSkillsDir = join(TEST_DIR, '.claude', 'skills');
      mkdirSync(join(projectSkillsDir, 'commit-standards'), { recursive: true });
      mkdirSync(join(projectSkillsDir, 'testing-guide'), { recursive: true });
      writeFileSync(
        join(projectSkillsDir, 'commit-standards', 'SKILL.md'),
        '# Commit Standards'
      );
      writeFileSync(
        join(projectSkillsDir, 'testing-guide', 'SKILL.md'),
        '# Testing Guide'
      );

      skillsCommand();

      const output = consoleLogs.join('\n');
      // Should show total count when skills are installed
      expect(output).toMatch(/Total unique skills: \d+ \/ \d+/);
    });

    it('should read version from manifest if available', () => {
      const projectSkillsDir = join(TEST_DIR, '.claude', 'skills');
      mkdirSync(join(projectSkillsDir, 'commit-standards'), { recursive: true });
      writeFileSync(
        join(projectSkillsDir, 'commit-standards', 'SKILL.md'),
        '# Commit Standards'
      );
      writeFileSync(
        join(projectSkillsDir, '.manifest.json'),
        JSON.stringify({ version: '3.2.0' })
      );

      skillsCommand();

      const output = consoleLogs.join('\n');
      expect(output).toContain('Version: 3.2.0');
    });

    it('should show unknown version when manifest is missing', () => {
      const projectSkillsDir = join(TEST_DIR, '.claude', 'skills');
      mkdirSync(join(projectSkillsDir, 'commit-standards'), { recursive: true });
      writeFileSync(
        join(projectSkillsDir, 'commit-standards', 'SKILL.md'),
        '# Commit Standards'
      );

      skillsCommand();

      const output = consoleLogs.join('\n');
      expect(output).toContain('Version: unknown');
    });

    it('should only show known UDS skills', () => {
      // Create project-level skills with both UDS and non-UDS skill
      const projectSkillsDir = join(TEST_DIR, '.claude', 'skills');
      mkdirSync(join(projectSkillsDir, 'commit-standards'), { recursive: true });
      mkdirSync(join(projectSkillsDir, 'custom-skill'), { recursive: true });
      writeFileSync(
        join(projectSkillsDir, 'commit-standards', 'SKILL.md'),
        '# Commit Standards'
      );
      writeFileSync(
        join(projectSkillsDir, 'custom-skill', 'SKILL.md'),
        '# Custom Skill'
      );

      skillsCommand();

      const output = consoleLogs.join('\n');
      expect(output).toContain('commit-standards');
      expect(output).not.toContain('custom-skill');
    });
  });

  describe('findUdsPlugin', () => {
    it('should return null when pluginsInfo is null', () => {
      expect(findUdsPlugin(null)).toBeNull();
    });

    it('should return null when plugins object is missing', () => {
      expect(findUdsPlugin({})).toBeNull();
      expect(findUdsPlugin({ version: 2 })).toBeNull();
    });

    it('should prioritize new asia-ostrich marketplace over legacy', () => {
      const pluginsInfo = {
        version: 2,
        plugins: {
          [PLUGIN_KEY_OLD]: [
            {
              scope: 'user',
              installPath: '/mock/old/path',
              version: '3.2.0'
            }
          ],
          [PLUGIN_KEY_NEW]: [
            {
              scope: 'user',
              installPath: '/mock/new/path',
              version: '3.3.0'
            }
          ]
        }
      };

      const result = findUdsPlugin(pluginsInfo);

      expect(result).not.toBeNull();
      expect(result.key).toBe(PLUGIN_KEY_NEW);
      expect(result.version).toBe('3.3.0');
      expect(result.isLegacyMarketplace).toBe(false);
    });

    it('should fallback to legacy marketplace when new is not available', () => {
      const pluginsInfo = {
        version: 2,
        plugins: {
          [PLUGIN_KEY_OLD]: [
            {
              scope: 'user',
              installPath: '/mock/old/path',
              version: '3.2.0'
            }
          ]
        }
      };

      const result = findUdsPlugin(pluginsInfo);

      expect(result).not.toBeNull();
      expect(result.key).toBe(PLUGIN_KEY_OLD);
      expect(result.version).toBe('3.2.0');
      expect(result.isLegacyMarketplace).toBe(true);
    });

    it('should return new marketplace info with isLegacyMarketplace=false', () => {
      const pluginsInfo = {
        version: 2,
        plugins: {
          [PLUGIN_KEY_NEW]: [
            {
              scope: 'user',
              installPath: '/mock/new/path',
              version: '3.3.0'
            }
          ]
        }
      };

      const result = findUdsPlugin(pluginsInfo);

      expect(result).not.toBeNull();
      expect(result.isLegacyMarketplace).toBe(false);
      expect(result.installPath).toBe('/mock/new/path');
    });

    it('should return null when no UDS plugin is installed', () => {
      const pluginsInfo = {
        version: 2,
        plugins: {
          'other-plugin@some-marketplace': [
            { scope: 'user', installPath: '/other', version: '1.0.0' }
          ]
        }
      };

      expect(findUdsPlugin(pluginsInfo)).toBeNull();
    });

    it('should return null when plugin array is empty', () => {
      const pluginsInfo = {
        version: 2,
        plugins: {
          [PLUGIN_KEY_NEW]: []
        }
      };

      expect(findUdsPlugin(pluginsInfo)).toBeNull();
    });
  });
});
