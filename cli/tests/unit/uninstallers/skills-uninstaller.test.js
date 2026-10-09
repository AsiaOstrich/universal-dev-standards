import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { uninstallSkills } from '../../../src/uninstallers/skills-uninstaller.js';
import { computeFileHash } from '../../../src/utils/hasher.js';

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

  /** Write a file UDS "installed" and return its manifest record the way the installers key it. */
  function installFile(rel, content = '# installed by UDS') {
    const file = join(testDir, ...rel.split('/'));
    mkdirSync(join(file, '..'), { recursive: true });
    writeFileSync(file, content);
    return { file, hash: computeFileHash(file) };
  }

  const makeManifest = ({ skillInstalls = [], cmdInstalls = [], location = 'project', skillHashes = {}, commandHashes = {} } = {}) => ({
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
    },
    skillHashes,
    commandHashes
  });

  const claudeProject = { agent: 'claude-code', level: 'project', path: '.claude/skills/', status: 'success' };

  describe('project-level skills', () => {
    it('should remove the skills UDS wrote and the folder it emptied', () => {
      const a = installFile('.claude/skills/test-skill/SKILL.md');
      const manifest = makeManifest({
        skillInstalls: [claudeProject],
        skillHashes: { 'claude-code/project/test-skill/SKILL.md': a.hash }
      });

      const result = uninstallSkills(testDir, manifest);

      expect(result.removed).toHaveLength(1);
      expect(result.removed[0]).toContain('skills/claude-code');
      expect(existsSync(join(testDir, '.claude', 'skills'))).toBe(false);
    });

    it('should leave a skill the adopter wrote themselves, and the folder that holds it', () => {
      const a = installFile('.claude/skills/test-skill/SKILL.md');
      installFile('.claude/skills/my-own/SKILL.md', '# my own skill');
      const manifest = makeManifest({
        skillInstalls: [claudeProject],
        skillHashes: { 'claude-code/project/test-skill/SKILL.md': a.hash }
      });

      const result = uninstallSkills(testDir, manifest);

      expect(result.errors).toHaveLength(0);
      expect(existsSync(join(testDir, '.claude', 'skills', 'test-skill'))).toBe(false);
      expect(readFileSync(join(testDir, '.claude', 'skills', 'my-own', 'SKILL.md'), 'utf-8')).toBe('# my own skill');
    });

    it('should keep a UDS skill file the adopter edited, and say so', () => {
      const a = installFile('.claude/skills/test-skill/SKILL.md');
      const b = installFile('.claude/skills/test-skill/guide.md', '# guide');
      writeFileSync(join(testDir, '.claude', 'skills', 'test-skill', 'guide.md'), '# guide, edited by me');
      const manifest = makeManifest({
        skillInstalls: [claudeProject],
        skillHashes: {
          'claude-code/project/test-skill/SKILL.md': a.hash,
          'claude-code/project/test-skill/guide.md': b.hash
        }
      });

      const result = uninstallSkills(testDir, manifest);

      expect(existsSync(join(testDir, '.claude', 'skills', 'test-skill', 'SKILL.md'))).toBe(false);
      expect(readFileSync(join(testDir, '.claude', 'skills', 'test-skill', 'guide.md'), 'utf-8')).toBe('# guide, edited by me');
      expect(result.skipped.join('\n')).toContain('changed since UDS wrote');
    });

    it('should remove UDS bookkeeping (.manifest.json) together with the last skill', () => {
      const a = installFile('.claude/skills/test-skill/SKILL.md');
      writeFileSync(join(testDir, '.claude', 'skills', '.manifest.json'), '{"source":"universal-dev-standards"}');
      const manifest = makeManifest({
        skillInstalls: [claudeProject],
        skillHashes: { 'claude-code/project/test-skill/SKILL.md': a.hash }
      });

      uninstallSkills(testDir, manifest);

      expect(existsSync(join(testDir, '.claude', 'skills'))).toBe(false);
    });

    it('should delete nothing when the manifest records no file UDS wrote there', () => {
      installFile('.claude/skills/someone-elses/SKILL.md');
      const manifest = makeManifest({ skillInstalls: [claudeProject] });

      const result = uninstallSkills(testDir, manifest);

      expect(result.removed).toHaveLength(0);
      expect(result.skipped.join('\n')).toContain('cannot prove');
      expect(existsSync(join(testDir, '.claude', 'skills', 'someone-elses', 'SKILL.md'))).toBe(true);
    });

    it('should remove opencode project skills', () => {
      const a = installFile('.opencode/skill/test-skill/SKILL.md');
      const manifest = makeManifest({
        skillInstalls: [{ agent: 'opencode', level: 'project', path: '.opencode/skill/', status: 'success' }],
        skillHashes: { 'opencode/project/test-skill/SKILL.md': a.hash }
      });

      const result = uninstallSkills(testDir, manifest);

      expect(result.removed).toHaveLength(1);
      expect(existsSync(join(testDir, '.opencode', 'skill'))).toBe(false);
    });
  });

  describe('project-level commands', () => {
    it('should remove the commands UDS wrote, not the adopter\'s own', () => {
      const a = installFile('.opencode/command/test-cmd.md');
      installFile('.opencode/command/mine.md', '# my command');
      const manifest = makeManifest({
        cmdInstalls: [{ agent: 'opencode', level: 'project', path: '.opencode/command/', status: 'success' }],
        commandHashes: { 'opencode/test-cmd.md': a.hash }
      });

      const result = uninstallSkills(testDir, manifest);

      expect(result.removed).toHaveLength(1);
      expect(result.removed[0]).toContain('commands/opencode');
      expect(existsSync(join(testDir, '.opencode', 'command', 'test-cmd.md'))).toBe(false);
      expect(readFileSync(join(testDir, '.opencode', 'command', 'mine.md'), 'utf-8')).toBe('# my command');
    });
  });

  describe('user-level installations', () => {
    it('should skip user-level by default', () => {
      const manifest = makeManifest({
        skillInstalls: [{ agent: 'claude-code', level: 'user', status: 'success' }]
      });

      const result = uninstallSkills(testDir, manifest);

      expect(result.removed).toHaveLength(0);
      expect(result.skipped).toHaveLength(1);
      expect(result.skipped[0]).toContain('user-level');
    });

    it('should include user-level when includeUserLevel is true', () => {
      // Use dryRun to avoid touching real home dirs
      const manifest = makeManifest({
        skillInstalls: [{ agent: 'claude-code', level: 'user', status: 'success' }]
      });

      const result = uninstallSkills(testDir, manifest, { includeUserLevel: true, dryRun: true });

      // Should NOT be skipped for being user-level
      expect(result.skipped.some(s => s.includes('user-level'))).toBe(false);
      // Should either be in removed (dryRun preview) or skipped with 'not found' / no record
      const wasProcessed = result.removed.length > 0 ||
                           result.skipped.some(s => s.includes('not found') || s.includes('cannot prove'));
      expect(wasProcessed).toBe(true);
    });
  });

  describe('marketplace skills', () => {
    it('should warn about marketplace skills', () => {
      const manifest = makeManifest({ location: 'marketplace' });

      const result = uninstallSkills(testDir, manifest);

      expect(result.marketplaceWarnings).toHaveLength(1);
      expect(result.marketplaceWarnings[0]).toContain('Marketplace');
    });
  });

  describe('edge cases', () => {
    it('should handle empty installations array', () => {
      const manifest = makeManifest();

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
      const manifest = makeManifest({ skillInstalls: [claudeProject] });

      const result = uninstallSkills(testDir, manifest);

      expect(result.removed).toHaveLength(0);
      expect(result.skipped).toHaveLength(1);
      expect(result.skipped[0]).toContain('not found');
    });

    it('should preview in dry-run mode without deleting', () => {
      const a = installFile('.claude/skills/test-skill/SKILL.md');
      const manifest = makeManifest({
        skillInstalls: [claudeProject],
        skillHashes: { 'claude-code/project/test-skill/SKILL.md': a.hash }
      });

      const result = uninstallSkills(testDir, manifest, { dryRun: true });

      expect(result.removed).toHaveLength(1);
      expect(existsSync(a.file)).toBe(true);
    });

    it('should handle multiple agents simultaneously', () => {
      const a = installFile('.claude/skills/test-skill/SKILL.md');
      const b = installFile('.opencode/skill/test-skill/SKILL.md');
      const manifest = makeManifest({
        skillInstalls: [
          claudeProject,
          { agent: 'opencode', level: 'project', path: '.opencode/skill/', status: 'success' }
        ],
        skillHashes: {
          'claude-code/project/test-skill/SKILL.md': a.hash,
          'opencode/project/test-skill/SKILL.md': b.hash
        }
      });

      const result = uninstallSkills(testDir, manifest);

      expect(result.removed).toHaveLength(2);
      expect(existsSync(join(testDir, '.claude', 'skills'))).toBe(false);
      expect(existsSync(join(testDir, '.opencode', 'skill'))).toBe(false);
    });
  });
});
