import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync, mkdirSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { uninstallSkills } from '../../../src/uninstallers/skills-uninstaller.js';

describe('skills-uninstaller', () => {
  let testDir;

  beforeEach(() => {
    testDir = join(tmpdir(), `uds-test-skills-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  const makeManifest = (skillInstalls = [], cmdInstalls = [], location = 'project') => ({
    skills: {
      installed: true,
      location,
      names: ['test-skill'],
      version: '1.0.0',
      installations: skillInstalls
    },
    commands: {
      installed: cmdInstalls.length > 0,
      names: ['test-cmd'],
      version: '1.0.0',
      installations: cmdInstalls
    }
  });

  describe('project-level skills', () => {
    it('should remove project-level skills directory', () => {
      const skillsDir = join(testDir, '.claude', 'skills');
      mkdirSync(skillsDir, { recursive: true });
      writeFileSync(join(skillsDir, 'SKILL.md'), '# Test');

      const manifest = makeManifest([
        { agent: 'claude-code', level: 'project', path: '.claude/skills/', status: 'success' }
      ]);

      const result = uninstallSkills(testDir, manifest);

      expect(result.removed).toHaveLength(1);
      expect(result.removed[0]).toContain('skills/claude-code');
      expect(existsSync(skillsDir)).toBe(false);
    });

    it('should remove opencode project skills', () => {
      const skillsDir = join(testDir, '.opencode', 'skill');
      mkdirSync(skillsDir, { recursive: true });
      writeFileSync(join(skillsDir, 'SKILL.md'), '# Test');

      const manifest = makeManifest([
        { agent: 'opencode', level: 'project', path: '.opencode/skill/', status: 'success' }
      ]);

      const result = uninstallSkills(testDir, manifest);

      expect(result.removed).toHaveLength(1);
      expect(existsSync(skillsDir)).toBe(false);
    });
  });

  describe('project-level commands', () => {
    it('should remove project-level commands directory', () => {
      const cmdsDir = join(testDir, '.opencode', 'command');
      mkdirSync(cmdsDir, { recursive: true });
      writeFileSync(join(cmdsDir, 'test.md'), '# Test');

      const manifest = makeManifest([], [
        { agent: 'opencode', level: 'project', path: '.opencode/command/', status: 'success' }
      ]);

      const result = uninstallSkills(testDir, manifest);

      expect(result.removed).toHaveLength(1);
      expect(result.removed[0]).toContain('commands/opencode');
      expect(existsSync(cmdsDir)).toBe(false);
    });
  });

  describe('user-level installations', () => {
    it('should skip user-level by default', () => {
      const manifest = makeManifest([
        { agent: 'claude-code', level: 'user', status: 'success' }
      ]);

      const result = uninstallSkills(testDir, manifest);

      expect(result.removed).toHaveLength(0);
      expect(result.skipped).toHaveLength(1);
      expect(result.skipped[0]).toContain('user-level');
    });

    it('should include user-level when includeUserLevel is true', () => {
      // We can't easily test actual user-level removal without touching real home dirs,
      // but we can verify it's not skipped when flag is set
      const manifest = makeManifest([
        { agent: 'claude-code', level: 'user', status: 'success' }
      ]);

      const result = uninstallSkills(testDir, manifest, { includeUserLevel: true });

      // The dir probably doesn't exist in test env, so it will be 'not found'
      expect(result.skipped.some(s => s.includes('not found'))).toBe(true);
      // But it should NOT be skipped for being user-level
      expect(result.skipped.some(s => s.includes('user-level'))).toBe(false);
    });
  });

  describe('marketplace skills', () => {
    it('should warn about marketplace skills', () => {
      const manifest = makeManifest([], [], 'marketplace');

      const result = uninstallSkills(testDir, manifest);

      expect(result.marketplaceWarnings).toHaveLength(1);
      expect(result.marketplaceWarnings[0]).toContain('Marketplace');
    });
  });

  describe('edge cases', () => {
    it('should handle empty installations array', () => {
      const manifest = makeManifest([], []);

      const result = uninstallSkills(testDir, manifest);

      expect(result.removed).toHaveLength(0);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle missing manifest sections', () => {
      const result = uninstallSkills(testDir, {});

      expect(result.removed).toHaveLength(0);
      expect(result.errors).toHaveLength(0);
    });

    it('should skip when directory does not exist', () => {
      const manifest = makeManifest([
        { agent: 'claude-code', level: 'project', path: '.claude/skills/', status: 'success' }
      ]);

      const result = uninstallSkills(testDir, manifest);

      expect(result.removed).toHaveLength(0);
      expect(result.skipped).toHaveLength(1);
      expect(result.skipped[0]).toContain('not found');
    });

    it('should preview in dry-run mode without deleting', () => {
      const skillsDir = join(testDir, '.claude', 'skills');
      mkdirSync(skillsDir, { recursive: true });
      writeFileSync(join(skillsDir, 'SKILL.md'), '# Test');

      const manifest = makeManifest([
        { agent: 'claude-code', level: 'project', path: '.claude/skills/', status: 'success' }
      ]);

      const result = uninstallSkills(testDir, manifest, { dryRun: true });

      expect(result.removed).toHaveLength(1);
      expect(existsSync(skillsDir)).toBe(true);
    });

    it('should handle multiple agents simultaneously', () => {
      const claudeSkills = join(testDir, '.claude', 'skills');
      const opencodeSkills = join(testDir, '.opencode', 'skill');
      mkdirSync(claudeSkills, { recursive: true });
      mkdirSync(opencodeSkills, { recursive: true });
      writeFileSync(join(claudeSkills, 'SKILL.md'), '# Test');
      writeFileSync(join(opencodeSkills, 'SKILL.md'), '# Test');

      const manifest = makeManifest([
        { agent: 'claude-code', level: 'project', path: '.claude/skills/', status: 'success' },
        { agent: 'opencode', level: 'project', path: '.opencode/skill/', status: 'success' }
      ]);

      const result = uninstallSkills(testDir, manifest);

      expect(result.removed).toHaveLength(2);
      expect(existsSync(claudeSkills)).toBe(false);
      expect(existsSync(opencodeSkills)).toBe(false);
    });
  });
});
