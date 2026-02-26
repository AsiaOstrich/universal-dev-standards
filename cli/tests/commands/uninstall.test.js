import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { existsSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

// Mock inquirer before importing command
vi.mock('inquirer', () => ({
  default: {
    prompt: vi.fn()
  }
}));

import inquirer from 'inquirer';
import { uninstallCommand } from '../../src/commands/uninstall.js';

describe('uninstall command', () => {
  let testDir;
  let originalCwd;

  beforeEach(() => {
    testDir = join(tmpdir(), `uds-test-uninstall-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    mkdirSync(testDir, { recursive: true });
    originalCwd = process.cwd();
    process.chdir(testDir);
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    process.chdir(originalCwd);
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
    vi.restoreAllMocks();
  });

  /**
   * Helper to create a minimal UDS installation
   */
  function createTestInstallation(opts = {}) {
    const {
      withStandards = true,
      withIntegration = false,
      withSkills = false,
      withHook = false,
      integrations = [],
      skillInstalls = [],
      cmdInstalls = []
    } = opts;

    // .standards/ directory
    if (withStandards) {
      const stdDir = join(testDir, '.standards');
      mkdirSync(stdDir, { recursive: true });
      mkdirSync(join(stdDir, 'options'), { recursive: true });
      writeFileSync(join(stdDir, 'commit-message.ai.yaml'), 'content');
      writeFileSync(join(stdDir, 'testing.ai.yaml'), 'content');
    }

    // Integration files
    if (withIntegration) {
      const UDS_BLOCK = '<!-- UDS:STANDARDS:START -->\n## Standards\nContent\n<!-- UDS:STANDARDS:END -->';
      writeFileSync(join(testDir, 'CLAUDE.md'), UDS_BLOCK + '\n');
      integrations.push('CLAUDE.md');
    }

    // Skills
    if (withSkills) {
      const skillsDir = join(testDir, '.claude', 'skills');
      mkdirSync(skillsDir, { recursive: true });
      writeFileSync(join(skillsDir, 'SKILL.md'), '# Test skill');
      skillInstalls.push({ agent: 'claude-code', level: 'project', path: '.claude/skills/', status: 'success' });
    }

    // Hook
    if (withHook) {
      const huskyDir = join(testDir, '.husky');
      mkdirSync(huskyDir, { recursive: true });
      writeFileSync(join(huskyDir, 'pre-commit'), '#!/usr/bin/env sh\nuds check\nnpm test\n');
    }

    // Manifest
    const manifest = {
      version: '3.3.0',
      upstream: { repo: 'test', version: '1.0.0', installed: new Date().toISOString() },
      level: 2,
      format: 'ai',
      standardsScope: 'minimal',
      contentMode: 'index',
      standards: ['commit-message.ai.yaml'],
      extensions: [],
      integrations,
      integrationConfigs: {},
      options: {},
      aiTools: ['claude-code'],
      skills: {
        installed: withSkills,
        location: 'project',
        names: withSkills ? ['test-skill'] : [],
        version: '1.0.0',
        installations: skillInstalls
      },
      commands: {
        installed: cmdInstalls.length > 0,
        names: [],
        version: '1.0.0',
        installations: cmdInstalls
      },
      methodology: null,
      fileHashes: {},
      skillHashes: {},
      commandHashes: {},
      integrationBlockHashes: {}
    };

    const stdDir = join(testDir, '.standards');
    if (!existsSync(stdDir)) {
      mkdirSync(stdDir, { recursive: true });
    }
    writeFileSync(join(stdDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  }

  describe('when not initialized', () => {
    it('should show not-initialized message', async () => {
      await uninstallCommand({ yes: true });

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('not initialized')
      );
    });
  });

  describe('--all --yes (full uninstall)', () => {
    it('should remove everything', async () => {
      createTestInstallation({
        withStandards: true,
        withIntegration: true,
        withSkills: true,
        withHook: true
      });

      await uninstallCommand({ all: true, yes: true });

      // Standards removed
      expect(existsSync(join(testDir, '.standards'))).toBe(false);
      // Integration removed
      expect(existsSync(join(testDir, 'CLAUDE.md'))).toBe(false);
      // Skills removed
      expect(existsSync(join(testDir, '.claude', 'skills'))).toBe(false);
      // Hook cleaned
      const hookContent = readFileSync(join(testDir, '.husky', 'pre-commit'), 'utf-8');
      expect(hookContent).not.toContain('uds check');
      expect(hookContent).toContain('npm test');
    });
  });

  describe('--standards-only', () => {
    it('should remove only .standards/ directory', async () => {
      createTestInstallation({
        withStandards: true,
        withIntegration: true,
        withHook: true
      });

      await uninstallCommand({ standardsOnly: true, yes: true });

      expect(existsSync(join(testDir, '.standards'))).toBe(false);
      // Integration should still exist
      expect(existsSync(join(testDir, 'CLAUDE.md'))).toBe(true);
      // Hook should still have uds check
      const hookContent = readFileSync(join(testDir, '.husky', 'pre-commit'), 'utf-8');
      expect(hookContent).toContain('uds check');
    });
  });

  describe('--skills-only', () => {
    it('should remove only skills', async () => {
      createTestInstallation({
        withStandards: true,
        withSkills: true
      });

      await uninstallCommand({ skillsOnly: true, yes: true });

      expect(existsSync(join(testDir, '.claude', 'skills'))).toBe(false);
      // Standards should still exist
      expect(existsSync(join(testDir, '.standards'))).toBe(true);
    });
  });

  describe('--integrations-only', () => {
    it('should remove only integration files', async () => {
      createTestInstallation({
        withStandards: true,
        withIntegration: true
      });

      await uninstallCommand({ integrationsOnly: true, yes: true });

      expect(existsSync(join(testDir, 'CLAUDE.md'))).toBe(false);
      // Standards should still exist
      expect(existsSync(join(testDir, '.standards'))).toBe(true);
    });
  });

  describe('--dry-run', () => {
    it('should not delete any files', async () => {
      createTestInstallation({
        withStandards: true,
        withIntegration: true,
        withSkills: true,
        withHook: true
      });

      await uninstallCommand({ all: true, yes: true, dryRun: true });

      // Everything should still exist
      expect(existsSync(join(testDir, '.standards'))).toBe(true);
      expect(existsSync(join(testDir, 'CLAUDE.md'))).toBe(true);
      expect(existsSync(join(testDir, '.claude', 'skills'))).toBe(true);
      const hookContent = readFileSync(join(testDir, '.husky', 'pre-commit'), 'utf-8');
      expect(hookContent).toContain('uds check');
    });
  });

  describe('interactive mode', () => {
    it('should prompt for categories and confirmation', async () => {
      createTestInstallation({ withStandards: true });

      inquirer.prompt
        .mockResolvedValueOnce({ categories: ['standards'] })
        .mockResolvedValueOnce({ confirmed: true });

      await uninstallCommand({});

      expect(inquirer.prompt).toHaveBeenCalledTimes(2);
      expect(existsSync(join(testDir, '.standards'))).toBe(false);
    });

    it('should abort when user does not confirm', async () => {
      createTestInstallation({ withStandards: true });

      inquirer.prompt
        .mockResolvedValueOnce({ categories: ['standards'] })
        .mockResolvedValueOnce({ confirmed: false });

      await uninstallCommand({});

      // Standards should still exist
      expect(existsSync(join(testDir, '.standards'))).toBe(true);
    });

    it('should abort when no categories selected', async () => {
      createTestInstallation({ withStandards: true });

      inquirer.prompt.mockResolvedValueOnce({ categories: [] });

      await uninstallCommand({});

      expect(existsSync(join(testDir, '.standards'))).toBe(true);
    });
  });

  describe('partial uninstall manifest update', () => {
    it('should update manifest when only skills are removed', async () => {
      createTestInstallation({
        withStandards: true,
        withSkills: true
      });

      await uninstallCommand({ skillsOnly: true, yes: true });

      // Manifest should still exist but skills should be cleared
      const manifestPath = join(testDir, '.standards', 'manifest.json');
      expect(existsSync(manifestPath)).toBe(true);
      const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
      expect(manifest.skills.installed).toBe(false);
      expect(manifest.skills.installations).toHaveLength(0);
    });

    it('should update manifest when only integrations are removed', async () => {
      createTestInstallation({
        withStandards: true,
        withIntegration: true
      });

      await uninstallCommand({ integrationsOnly: true, yes: true });

      const manifestPath = join(testDir, '.standards', 'manifest.json');
      expect(existsSync(manifestPath)).toBe(true);
      const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
      expect(manifest.integrations).toHaveLength(0);
    });
  });
});
