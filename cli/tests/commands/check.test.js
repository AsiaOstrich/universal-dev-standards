import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Mock npm-registry to avoid network requests during tests
vi.mock('../../src/utils/npm-registry.js', () => ({
  checkForUpdates: vi.fn(() => Promise.resolve({
    available: false,
    offline: true,
    message: 'Mocked for testing'
  })),
  clearCache: vi.fn()
}));

// Mock getMarketplaceSkillsInfo - use vi.hoisted for mock reference
const { mockGetMarketplaceSkillsInfo } = vi.hoisted(() => ({
  mockGetMarketplaceSkillsInfo: vi.fn(() => ({ installed: false }))
}));
vi.mock('../../src/utils/github.js', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    getMarketplaceSkillsInfo: mockGetMarketplaceSkillsInfo
  };
});

import { checkCommand } from '../../src/commands/check.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const TEST_DIR = join(__dirname, '../temp/check-test');

describe('Check Command', () => {
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

  describe('checkCommand', () => {
    it('should report not initialized for empty project', async () => {
      await checkCommand({ noInteractive: true });

      const output = consoleLogs.join('\n');
      expect(output).toContain('not initialized');
    });

    it('should report initialized status', async () => {
      // Create minimal manifest
      const manifest = {
        version: '1.0.0',
        upstream: {
          repo: 'AsiaOstrich/universal-dev-standards',
          version: '2.1.0',
          installed: '2024-01-01'
        },
        level: 2,
        standards: [],
        extensions: [],
        integrations: [],
        skills: { installed: false }
      };

      mkdirSync(join(TEST_DIR, '.standards'), { recursive: true });
      writeFileSync(
        join(TEST_DIR, '.standards', 'manifest.json'),
        JSON.stringify(manifest)
      );

      await checkCommand({ noInteractive: true });

      const output = consoleLogs.join('\n');
      expect(output).toContain('Standards initialized');
      expect(output).toContain('Level: 2');
    });

    it('should report missing files', async () => {
      const manifest = {
        version: '1.0.0',
        upstream: {
          repo: 'AsiaOstrich/universal-dev-standards',
          version: '2.1.0',
          installed: '2024-01-01'
        },
        level: 1,
        standards: ['core/anti-hallucination.md'],
        extensions: [],
        integrations: [],
        skills: { installed: false }
      };

      mkdirSync(join(TEST_DIR, '.standards'), { recursive: true });
      writeFileSync(
        join(TEST_DIR, '.standards', 'manifest.json'),
        JSON.stringify(manifest)
      );

      await checkCommand({ noInteractive: true });

      const output = consoleLogs.join('\n');
      expect(output).toContain('missing');
    });

    it('should report all files present when complete (legacy manifest)', async () => {
      const manifest = {
        version: '1.0.0',
        upstream: {
          repo: 'AsiaOstrich/universal-dev-standards',
          version: '2.1.0',
          installed: '2024-01-01'
        },
        level: 1,
        standards: ['core/anti-hallucination.md'],
        extensions: [],
        integrations: [],
        skills: { installed: false }
      };

      mkdirSync(join(TEST_DIR, '.standards'), { recursive: true });
      writeFileSync(
        join(TEST_DIR, '.standards', 'manifest.json'),
        JSON.stringify(manifest)
      );
      writeFileSync(join(TEST_DIR, '.standards', 'anti-hallucination.md'), '# Content');

      await checkCommand({ noInteractive: true });

      const output = consoleLogs.join('\n');
      // Legacy manifest shows "no hash" status
      expect(output).toContain('exists, no hash');
      expect(output).toContain('0 missing');
    });

    it('should report unchanged files with hash-based manifest', async () => {
      const fileContent = '# Anti-Hallucination Standard';
      const filePath = join(TEST_DIR, '.standards', 'anti-hallucination.md');

      mkdirSync(join(TEST_DIR, '.standards'), { recursive: true });
      writeFileSync(filePath, fileContent);

      // Compute actual hash
      const { computeFileHash } = await import('../../src/utils/hasher.js');
      const hashInfo = computeFileHash(filePath);

      const manifest = {
        version: '3.1.0',
        upstream: {
          repo: 'AsiaOstrich/universal-dev-standards',
          version: '3.3.0',
          installed: '2024-01-01'
        },
        level: 1,
        standards: ['core/anti-hallucination.md'],
        extensions: [],
        integrations: [],
        skills: { installed: false },
        fileHashes: {
          '.standards/anti-hallucination.md': hashInfo
        }
      };

      writeFileSync(
        join(TEST_DIR, '.standards', 'manifest.json'),
        JSON.stringify(manifest)
      );

      await checkCommand({ noInteractive: true });

      const output = consoleLogs.join('\n');
      expect(output).toContain('unchanged');
      expect(output).toContain('1 unchanged');
    });

    it('should detect modified files with hash-based manifest', async () => {
      const originalContent = '# Original Content';
      const filePath = join(TEST_DIR, '.standards', 'anti-hallucination.md');

      mkdirSync(join(TEST_DIR, '.standards'), { recursive: true });
      writeFileSync(filePath, originalContent);

      // Compute hash for original content
      const { computeFileHash } = await import('../../src/utils/hasher.js');
      const originalHash = computeFileHash(filePath);

      // Modify the file
      writeFileSync(filePath, '# Modified Content');

      const manifest = {
        version: '3.1.0',
        upstream: {
          repo: 'AsiaOstrich/universal-dev-standards',
          version: '3.3.0',
          installed: '2024-01-01'
        },
        level: 1,
        standards: ['core/anti-hallucination.md'],
        extensions: [],
        integrations: [],
        skills: { installed: false },
        fileHashes: {
          '.standards/anti-hallucination.md': originalHash
        }
      };

      writeFileSync(
        join(TEST_DIR, '.standards', 'manifest.json'),
        JSON.stringify(manifest)
      );

      await checkCommand({ noInteractive: true });

      const output = consoleLogs.join('\n');
      expect(output).toContain('modified');
      expect(output).toContain('1 modified');
    });

    it('should handle corrupted manifest', async () => {
      mkdirSync(join(TEST_DIR, '.standards'), { recursive: true });
      writeFileSync(
        join(TEST_DIR, '.standards', 'manifest.json'),
        'not valid json'
      );

      await checkCommand({ noInteractive: true });

      const output = consoleLogs.join('\n');
      expect(output).toContain('Could not read manifest');
    });

    it('should show skills status when installed', async () => {
      const manifest = {
        version: '1.0.0',
        upstream: {
          repo: 'AsiaOstrich/universal-dev-standards',
          version: '2.1.0',
          installed: '2024-01-01'
        },
        level: 1,
        standards: [],
        extensions: [],
        integrations: [],
        skills: { installed: true }
      };

      mkdirSync(join(TEST_DIR, '.standards'), { recursive: true });
      writeFileSync(
        join(TEST_DIR, '.standards', 'manifest.json'),
        JSON.stringify(manifest)
      );

      await checkCommand({ noInteractive: true });

      const output = consoleLogs.join('\n');
      expect(output).toContain('Skills Status');
    });

    it('should show coverage summary', async () => {
      const manifest = {
        version: '1.0.0',
        upstream: {
          repo: 'AsiaOstrich/universal-dev-standards',
          version: '2.1.0',
          installed: '2024-01-01'
        },
        level: 2,
        standards: ['core/anti-hallucination.md'],
        extensions: [],
        integrations: [],
        skills: { installed: false }
      };

      mkdirSync(join(TEST_DIR, '.standards'), { recursive: true });
      writeFileSync(
        join(TEST_DIR, '.standards', 'manifest.json'),
        JSON.stringify(manifest)
      );

      // Pass noInteractive to skip interactive mode for missing files
      await checkCommand({ noInteractive: true });

      const output = consoleLogs.join('\n');
      expect(output).toContain('Coverage Summary');
    });

    it('should show Plugin Marketplace message when marketplace detected', async () => {
      // Mock marketplace as installed for this test
      mockGetMarketplaceSkillsInfo.mockReturnValueOnce({
        installed: true,
        version: '3.5.0',
        lastUpdated: '2024-01-15T00:00:00Z'
      });

      const manifest = {
        version: '1.0.0',
        upstream: {
          repo: 'AsiaOstrich/universal-dev-standards',
          version: '3.0.0',
          installed: '2024-01-01'
        },
        level: 2,
        standards: [],
        extensions: [],
        integrations: [],
        aiTools: ['claude-code'],  // Need aiTools for Skills Status to show agents
        skills: {
          installed: true,
          location: 'marketplace',
          names: ['all-via-plugin']
        }
      };

      mkdirSync(join(TEST_DIR, '.standards'), { recursive: true });
      writeFileSync(
        join(TEST_DIR, '.standards', 'manifest.json'),
        JSON.stringify(manifest)
      );

      await checkCommand({ noInteractive: true });

      const output = consoleLogs.join('\n');
      expect(output).toContain('Plugin Marketplace');
      expect(output).toContain('Marketplace skills are not file-based');
      expect(output).not.toContain('Skills marked as installed but not found');
    });

    it('should not show file-not-found warning for marketplace skills', async () => {
      const manifest = {
        version: '1.0.0',
        upstream: {
          repo: 'AsiaOstrich/universal-dev-standards',
          version: '3.0.0',
          installed: '2024-01-01'
        },
        level: 2,
        standards: [],
        extensions: [],
        integrations: [],
        skills: {
          installed: true,
          location: 'marketplace',
          names: ['all-via-plugin']
        }
      };

      mkdirSync(join(TEST_DIR, '.standards'), { recursive: true });
      writeFileSync(
        join(TEST_DIR, '.standards', 'manifest.json'),
        JSON.stringify(manifest)
      );

      await checkCommand({ noInteractive: true });

      const output = consoleLogs.join('\n');
      // Should NOT show the warning about skills not found
      expect(output).not.toContain('Skills marked as installed but not found');
      expect(output).not.toContain('git clone');
    });

    it('should suggest migration for legacy manifests', async () => {
      const manifest = {
        version: '1.0.0',
        upstream: {
          repo: 'AsiaOstrich/universal-dev-standards',
          version: '2.1.0',
          installed: '2024-01-01'
        },
        level: 1,
        standards: ['core/anti-hallucination.md'],
        extensions: [],
        integrations: [],
        skills: { installed: false }
      };

      mkdirSync(join(TEST_DIR, '.standards'), { recursive: true });
      writeFileSync(
        join(TEST_DIR, '.standards', 'manifest.json'),
        JSON.stringify(manifest)
      );
      writeFileSync(join(TEST_DIR, '.standards', 'anti-hallucination.md'), '# Content');

      await checkCommand({ noInteractive: true });

      const output = consoleLogs.join('\n');
      expect(output).toContain('--migrate');
      expect(output).toContain('hash-based integrity checking');
    });

    it('should show AI Tool Integration Status when aiTools configured', async () => {
      const manifest = {
        version: '3.2.0',
        upstream: {
          repo: 'AsiaOstrich/universal-dev-standards',
          version: '3.5.0',
          installed: '2024-01-01'
        },
        level: 2,
        standards: ['core/anti-hallucination.md'],
        extensions: [],
        integrations: ['CLAUDE.md'],
        aiTools: ['claude-code'],
        skills: { installed: false }
      };

      mkdirSync(join(TEST_DIR, '.standards'), { recursive: true });
      writeFileSync(
        join(TEST_DIR, '.standards', 'manifest.json'),
        JSON.stringify(manifest)
      );
      writeFileSync(
        join(TEST_DIR, 'CLAUDE.md'),
        '# Project Guidelines\n## Anti-Hallucination Protocol\nContent'
      );

      await checkCommand({ noInteractive: true });

      const output = consoleLogs.join('\n');
      expect(output).toContain('AI Tool Integration Status');
      expect(output).toContain('CLAUDE.md');
    });

    it('should report missing integration file', async () => {
      const manifest = {
        version: '3.2.0',
        upstream: {
          repo: 'AsiaOstrich/universal-dev-standards',
          version: '3.5.0',
          installed: '2024-01-01'
        },
        level: 2,
        standards: [],
        extensions: [],
        integrations: ['CLAUDE.md'],
        aiTools: ['claude-code'],
        skills: { installed: false }
      };

      mkdirSync(join(TEST_DIR, '.standards'), { recursive: true });
      writeFileSync(
        join(TEST_DIR, '.standards', 'manifest.json'),
        JSON.stringify(manifest)
      );
      // Note: CLAUDE.md file is NOT created

      await checkCommand({ noInteractive: true });

      const output = consoleLogs.join('\n');
      expect(output).toContain('AI Tool Integration Status');
      expect(output).toContain('File not found');
    });

    it('should skip AI Tool Integration Status when no aiTools configured', async () => {
      const manifest = {
        version: '3.2.0',
        upstream: {
          repo: 'AsiaOstrich/universal-dev-standards',
          version: '3.5.0',
          installed: '2024-01-01'
        },
        level: 2,
        standards: [],
        extensions: [],
        integrations: [],
        skills: { installed: false }
        // Note: no aiTools field
      };

      mkdirSync(join(TEST_DIR, '.standards'), { recursive: true });
      writeFileSync(
        join(TEST_DIR, '.standards', 'manifest.json'),
        JSON.stringify(manifest)
      );

      await checkCommand({ noInteractive: true });

      const output = consoleLogs.join('\n');
      // Should not show AI Tool Integration Status section
      expect(output).not.toContain('AI Tool Integration Status');
    });

    it('should show OpenCode status when OpenCode configured', async () => {
      const manifest = {
        version: '3.2.0',
        upstream: {
          repo: 'AsiaOstrich/universal-dev-standards',
          version: '3.5.0',
          installed: '2024-01-01'
        },
        level: 2,
        standards: [],
        extensions: [],
        integrations: ['AGENTS.md'],
        aiTools: ['opencode'],
        skills: {
          installed: true,
          location: 'marketplace'
        }
      };

      mkdirSync(join(TEST_DIR, '.standards'), { recursive: true });
      writeFileSync(
        join(TEST_DIR, '.standards', 'manifest.json'),
        JSON.stringify(manifest)
      );
      writeFileSync(
        join(TEST_DIR, 'AGENTS.md'),
        '# Project Guidelines\nContent'
      );

      await checkCommand({ noInteractive: true });

      const output = consoleLogs.join('\n');
      expect(output).toContain('Skills Status');
      // New format shows each agent's status separately
      expect(output).toContain('OpenCode');
      expect(output).toContain('Skills');
      expect(output).toContain('Commands');
    });

    it('should show both Claude Code and OpenCode status when both configured', async () => {
      const manifest = {
        version: '3.2.0',
        upstream: {
          repo: 'AsiaOstrich/universal-dev-standards',
          version: '3.5.0',
          installed: '2024-01-01'
        },
        level: 2,
        standards: [],
        extensions: [],
        integrations: ['CLAUDE.md', 'AGENTS.md'],
        aiTools: ['claude-code', 'opencode'],
        skills: {
          installed: true,
          location: 'marketplace'
        }
      };

      mkdirSync(join(TEST_DIR, '.standards'), { recursive: true });
      writeFileSync(
        join(TEST_DIR, '.standards', 'manifest.json'),
        JSON.stringify(manifest)
      );

      await checkCommand({ noInteractive: true });

      const output = consoleLogs.join('\n');
      // New format shows each agent's status separately
      expect(output).toContain('Claude Code');
      expect(output).toContain('OpenCode');
      expect(output).toContain('Skills Status');
    });

    it('should show correct skills coverage when skills installed on disk but manifest says false', async () => {
      // Bug fix test: Coverage Summary should dynamically check disk, not rely on manifest.skills.installed
      // See: https://github.com/AsiaOstrich/universal-dev-standards/issues/xxx

      const manifest = {
        version: '3.5.0',
        upstream: {
          repo: 'AsiaOstrich/universal-dev-standards',
          version: '3.5.0',
          installed: '2024-01-01'
        },
        level: 3,
        standards: [],
        extensions: [],
        integrations: [],
        aiTools: ['claude-code'],
        skills: { installed: false }  // <-- manifest says false
      };

      // Create manifest
      mkdirSync(join(TEST_DIR, '.standards'), { recursive: true });
      writeFileSync(
        join(TEST_DIR, '.standards', 'manifest.json'),
        JSON.stringify(manifest)
      );

      // Simulate skills installed on disk (project level for claude-code)
      const skillsDir = join(TEST_DIR, '.claude', 'skills');
      mkdirSync(skillsDir, { recursive: true });
      writeFileSync(
        join(skillsDir, '.manifest.json'),
        JSON.stringify({
          version: '3.5.1-beta.13',
          source: 'universal-dev-standards',
          agent: 'claude-code',
          installedDate: '2024-01-01'
        })
      );

      await checkCommand({ noInteractive: true });

      const output = consoleLogs.join('\n');

      // Should show correct count (22 skill standards for Level 3)
      // Updated from 21 to 22 after adding refactoring-assistant skill
      expect(output).toContain('22 via Skills');

      // Should NOT show exactly "0 via Skills" as a standalone line
      // Note: We check for the regex pattern since "22 via Skills" contains "0 via Skills" as substring
      // The pattern matches "  0 via Skills" with leading spaces and NOT preceded by a digit
      expect(output).not.toMatch(/(?<!\d)\s+0 via Skills/);
    });

  });
});
