import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { uninstallIntegrations } from '../../../src/uninstallers/integration-uninstaller.js';

describe('integration-uninstaller', () => {
  let testDir;

  beforeEach(() => {
    testDir = join(tmpdir(), `uds-test-integ-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  const makeManifest = (integrations) => ({ integrations });

  describe('markdown format (CLAUDE.md)', () => {
    const UDS_BLOCK = '<!-- UDS:STANDARDS:START -->\n## Standards\nSome UDS content\n<!-- UDS:STANDARDS:END -->';

    it('should delete file when 100% UDS-generated', async () => {
      writeFileSync(join(testDir, 'CLAUDE.md'), UDS_BLOCK + '\n');
      const manifest = makeManifest(['CLAUDE.md']);

      const result = await uninstallIntegrations(testDir, manifest);

      expect(result.removed).toHaveLength(1);
      expect(result.removed[0]).toContain('deleted');
      expect(existsSync(join(testDir, 'CLAUDE.md'))).toBe(false);
    });

    it('should remove UDS block but keep user content in --yes mode', async () => {
      const content = '# My Project\nCustom instructions\n\n' + UDS_BLOCK + '\n\n# More stuff\n';
      writeFileSync(join(testDir, 'CLAUDE.md'), content);
      const manifest = makeManifest(['CLAUDE.md']);

      const result = await uninstallIntegrations(testDir, manifest, { yes: true });

      expect(result.removed).toHaveLength(1);
      expect(result.removed[0]).toContain('UDS block removed');
      const updated = readFileSync(join(testDir, 'CLAUDE.md'), 'utf-8');
      expect(updated).toContain('My Project');
      expect(updated).toContain('More stuff');
      expect(updated).not.toContain('UDS:STANDARDS:START');
    });

    it('should skip file when no UDS markers found', async () => {
      writeFileSync(join(testDir, 'CLAUDE.md'), '# Just user content\n');
      const manifest = makeManifest(['CLAUDE.md']);

      const result = await uninstallIntegrations(testDir, manifest);

      expect(result.skipped).toHaveLength(1);
      expect(result.skipped[0]).toContain('no UDS markers found');
    });
  });

  describe('plaintext format (.cursorrules)', () => {
    const UDS_BLOCK = '# === UDS:STANDARDS:START ===\nUDS content here\n# === UDS:STANDARDS:END ===';

    it('should delete file when 100% UDS-generated', async () => {
      writeFileSync(join(testDir, '.cursorrules'), UDS_BLOCK + '\n');
      const manifest = makeManifest(['.cursorrules']);

      const result = await uninstallIntegrations(testDir, manifest);

      expect(result.removed).toHaveLength(1);
      expect(result.removed[0]).toContain('deleted');
      expect(existsSync(join(testDir, '.cursorrules'))).toBe(false);
    });

    it('should remove UDS block and keep user content', async () => {
      const content = 'My custom rules\n\n' + UDS_BLOCK + '\n\nMore rules\n';
      writeFileSync(join(testDir, '.cursorrules'), content);
      const manifest = makeManifest(['.cursorrules']);

      const result = await uninstallIntegrations(testDir, manifest);

      expect(result.removed).toHaveLength(1);
      const updated = readFileSync(join(testDir, '.cursorrules'), 'utf-8');
      expect(updated).toContain('My custom rules');
      expect(updated).not.toContain('UDS:STANDARDS:START');
    });
  });

  describe('interactive mode', () => {
    const UDS_BLOCK = '<!-- UDS:STANDARDS:START -->\nUDS content\n<!-- UDS:STANDARDS:END -->';

    it('should call promptFn for files with user content', async () => {
      const content = '# User\n' + UDS_BLOCK;
      writeFileSync(join(testDir, 'CLAUDE.md'), content);
      const manifest = makeManifest(['CLAUDE.md']);

      const promptFn = async () => 'remove-block';
      const result = await uninstallIntegrations(testDir, manifest, {
        interactive: true,
        promptFn
      });

      expect(result.removed).toHaveLength(1);
      expect(result.removed[0]).toContain('UDS block removed');
    });

    it('should skip file when user chooses skip', async () => {
      const content = '# User\n' + UDS_BLOCK;
      writeFileSync(join(testDir, 'CLAUDE.md'), content);
      const manifest = makeManifest(['CLAUDE.md']);

      const promptFn = async () => 'skip';
      const result = await uninstallIntegrations(testDir, manifest, {
        interactive: true,
        promptFn
      });

      expect(result.skipped).toHaveLength(1);
      expect(result.skipped[0]).toContain('user skipped');
    });

    it('should delete file when user chooses delete-file', async () => {
      const content = '# User\n' + UDS_BLOCK;
      writeFileSync(join(testDir, 'CLAUDE.md'), content);
      const manifest = makeManifest(['CLAUDE.md']);

      const promptFn = async () => 'delete-file';
      const result = await uninstallIntegrations(testDir, manifest, {
        interactive: true,
        promptFn
      });

      expect(result.removed).toHaveLength(1);
      expect(result.removed[0]).toContain('deleted');
      expect(existsSync(join(testDir, 'CLAUDE.md'))).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should skip when file does not exist', async () => {
      const manifest = makeManifest(['CLAUDE.md']);

      const result = await uninstallIntegrations(testDir, manifest);

      expect(result.skipped).toHaveLength(1);
      expect(result.skipped[0]).toContain('not found');
    });

    it('should skip when manifest has no integrations', async () => {
      const result = await uninstallIntegrations(testDir, { integrations: [] });

      expect(result.skipped).toHaveLength(1);
      expect(result.skipped[0]).toContain('none recorded');
    });

    it('should handle null manifest gracefully', async () => {
      const result = await uninstallIntegrations(testDir, null);

      expect(result.skipped).toHaveLength(1);
    });

    it('should preview in dry-run mode without modifying files', async () => {
      const UDS_BLOCK = '<!-- UDS:STANDARDS:START -->\ncontent\n<!-- UDS:STANDARDS:END -->';
      writeFileSync(join(testDir, 'CLAUDE.md'), UDS_BLOCK + '\n');
      const manifest = makeManifest(['CLAUDE.md']);

      const result = await uninstallIntegrations(testDir, manifest, { dryRun: true });

      expect(result.removed).toHaveLength(1);
      expect(result.removed[0]).toContain('delete file');
      expect(existsSync(join(testDir, 'CLAUDE.md'))).toBe(true);
    });

    it('should handle subdirectory paths like .github/copilot-instructions.md', async () => {
      const subDir = join(testDir, '.github');
      mkdirSync(subDir, { recursive: true });
      const UDS_BLOCK = '<!-- UDS:STANDARDS:START -->\ncontent\n<!-- UDS:STANDARDS:END -->';
      writeFileSync(join(subDir, 'copilot-instructions.md'), UDS_BLOCK + '\n');
      const manifest = makeManifest(['.github/copilot-instructions.md']);

      const result = await uninstallIntegrations(testDir, manifest);

      expect(result.removed).toHaveLength(1);
      expect(existsSync(join(subDir, 'copilot-instructions.md'))).toBe(false);
    });
  });
});
