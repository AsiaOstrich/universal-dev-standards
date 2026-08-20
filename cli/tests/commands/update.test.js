import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock dependencies before importing the module
vi.mock('chalk', () => ({
  default: {
    bold: vi.fn((s) => s),
    gray: vi.fn((s) => s),
    green: vi.fn((s) => s),
    yellow: vi.fn((s) => s),
    red: vi.fn((s) => s),
    cyan: vi.fn((s) => s)
  }
}));

vi.mock('ora', () => ({
  default: vi.fn(() => ({
    start: vi.fn().mockReturnThis(),
    stop: vi.fn().mockReturnThis(),
    succeed: vi.fn().mockReturnThis(),
    warn: vi.fn().mockReturnThis(),
    fail: vi.fn().mockReturnThis()
  }))
}));

// Use hoisted to define mock before vi.mock
const { mockPrompt, mockExistsSync } = vi.hoisted(() => ({
  mockPrompt: vi.fn(() => Promise.resolve(true)),
  mockExistsSync: vi.fn(() => true)
}));

vi.mock('fs', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    existsSync: mockExistsSync,
    unlinkSync: vi.fn()
  };
});

vi.mock('../../src/utils/hasher.js', () => ({
  computeFileHash: vi.fn(() => ({ hash: 'abc123', algorithm: 'sha256' })),
  scanForUntrackedFiles: vi.fn(() => []),
  refreshIntegrationBlockHashes: vi.fn()
}));

// Bypass DEC-044 / XSPEC-071 self-adoption guard in unit tests — these
// tests mock `fs.existsSync` to return true for everything, which would
// otherwise trigger the real guard and refuse the command under test.
vi.mock('../../src/utils/detect-self-adoption.js', () => ({
  detectSelfAdoption: vi.fn(() => false),
  detectSelfAdoptionDetailed: vi.fn(() => ({ isSelfAdoption: false, signals: [] })),
  guardAgainstSelfAdoption: vi.fn(() => true),
  formatSelfAdoptionRefuseMessage: vi.fn(() => []),
  formatSelfAdoptionForceWarning: vi.fn(() => [])
}));

vi.mock('@inquirer/prompts', () => ({
  select: mockPrompt,
  checkbox: mockPrompt,
  confirm: mockPrompt,
  input: mockPrompt,
  Separator: class Separator { constructor(t) { this.text = t; } }
}));

vi.mock('../../src/utils/copier.js', () => ({
  copyStandard: vi.fn(() => ({ success: true, error: null, path: '/test/path' })),
  copyIntegration: vi.fn(() => ({ success: true, error: null, path: '/test/path' })),
  readManifest: vi.fn(() => ({
    upstream: { version: '2.0.0' },
    standards: ['core/test.md'],
    extensions: [],
    integrations: [],
    skills: { installed: false }
  })),
  writeManifest: vi.fn(),
  isInitialized: vi.fn(() => true)
}));

vi.mock('../../src/utils/registry.js', () => ({
  getRepositoryInfo: vi.fn(() => ({
    standards: { version: '3.0.0' },
    skills: { version: '1.0.0' }
  })),
  getAllStandards: vi.fn(() => []),
  getStandardSource: vi.fn((std, format) => {
    if (typeof std.source === 'string') return std.source;
    return std.source?.[format] || std.source?.human || null;
  })
}));

vi.mock('../../src/utils/npm-registry.js', () => ({
  checkForUpdates: vi.fn(() => Promise.resolve({
    available: false,
    offline: false,
    currentVersion: '3.0.0',
    latestVersion: '3.0.0'
  })),
  clearCache: vi.fn()
}));

vi.mock('../../src/config/ai-agent-paths.js', () => ({
  getAgentDisplayName: vi.fn((agent) => {
    const names = {
      'claude-code': 'Claude Code',
      'opencode': 'OpenCode',
      'cursor': 'Cursor'
    };
    return names[agent] || agent;
  }),
  getAgentConfig: vi.fn((agent) => {
    const configs = {
      'claude-code': { supportsSkills: true, skills: { project: '.claude/skills/' }, commands: null },
      'opencode': { supportsSkills: true, skills: { project: '.opencode/skill/' }, commands: { project: '.opencode/command/' } },
      'cursor': { supportsSkills: true, skills: { project: '.cursor/skills/' }, commands: null }
    };
    return configs[agent] || null;
  }),
  getSkillsDirForAgent: vi.fn(() => '.claude/skills/'),
  getCommandsDirForAgent: vi.fn(() => '.opencode/command/')
}));

vi.mock('../../src/utils/skills-installer.js', () => ({
  // Mirrors the real implementation: dedupe by agent, preferring project level.
  // Four manifest writers route appends through this (XSPEC-343 R2).
  deduplicateInstallations: (list) => {
    const seen = new Map();
    const out = [];
    for (const inst of list || []) {
      const prev = seen.get(inst.agent);
      if (prev) {
        if (inst.level === 'project') {
          out[out.indexOf(prev)] = inst;
          seen.set(inst.agent, inst);
        }
      } else {
        seen.set(inst.agent, inst);
        out.push(inst);
      }
    }
    return out;
  },
  installSkillsToMultipleAgents: vi.fn(() => Promise.resolve({ totalInstalled: 1, totalErrors: 0 })),
  installCommandsToMultipleAgents: vi.fn(() => Promise.resolve({ totalInstalled: 1, totalErrors: 0 })),
  getInstalledSkillsInfoForAgent: vi.fn(() => ({ installed: false })),
  getInstalledCommandsForAgent: vi.fn(() => ({ installed: false })),
  cleanupDuplicateSkills: vi.fn(() => ({ cleaned: [], errors: [] })),
  cleanupLegacyCommands: vi.fn(() => ({ cleaned: [], errors: [] }))
}));

vi.mock('../../src/utils/integration-generator.js', () => ({
  writeIntegrationFile: vi.fn(() => ({ success: true, path: 'CLAUDE.md' })),
  getToolFilePath: vi.fn(() => 'CLAUDE.md'),
  resolveContentModeForTool: vi.fn((tool, userMode) => {
    if (userMode && userMode !== 'auto') return { contentMode: userMode, level: undefined };
    return { contentMode: 'index', level: 2 };
  }),
  // Shared by `uds update` and the reconciler so both emit the same block
  // (XSPEC-343 R2). Mirrors the real derivation rather than returning a stub, so
  // a test cannot pass on a config shape the generator would never receive.
  buildToolIntegrationConfig: vi.fn((manifest, tool) => {
    const selected = manifest.options?.output_language || manifest.options?.commit_language || 'english';
    return {
      tool,
      categories: ['anti-hallucination', 'commit-standards', 'code-review'],
      language: selected === 'bilingual' ? 'bilingual' : selected === 'traditional-chinese' ? 'zh-tw' : 'en',
      installedStandards: (manifest.standards || []).map(s => s.split('/').pop()),
      contentMode: manifest.contentMode || 'index',
      level: 2,
      outputLanguage: selected,
      methodology: manifest.methodology
    };
  })
}));

vi.mock('../../src/commands/check.js', () => ({
  restoreSingleFile: vi.fn(() => Promise.resolve(true)),
  updateFileHash: vi.fn(),
  getSourcePathFromRelative: vi.fn(() => 'core/test.md')
}));

// The reconciler is only reached by --plan/--apply/--force; plain `uds update`
// never touches it, which is the defect these tests pin.
vi.mock('../../src/reconciler/index.js', () => ({
  reconcile: vi.fn(async () => ({
    success: true,
    plan: { actions: [], summary: {} },
    execution: { summary: { succeeded: 0, failed: 0 }, backupId: null },
    manifest: {},
    errors: []
  })),
  plan: vi.fn(async () => ({
    plan: {
      actions: [{ type: 'delete', category: 'standard', path: '.standards/gone.ai.yaml', reason: 'x' }],
      summary: { create: 0, update: 0, delete: 1, unchanged: 0, migrate_block: 0 }
    },
    errors: []
  })),
  rollbackLast: vi.fn(() => ({ success: true, restored: [], errors: [] })),
  formatPlan: vi.fn(() => '=== Reconciliation Plan ==='),
  listBackups: vi.fn(() => [])
}));

import { readFileSync as realReadFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { updateCommand } from '../../src/commands/update.js';
import { reconcile as reconcilerReconcile, plan as reconcilerPlanMock } from '../../src/reconciler/index.js';
import { isInitialized, readManifest, writeManifest, copyStandard } from '../../src/utils/copier.js';
import { getRepositoryInfo, getAllStandards } from '../../src/utils/registry.js';
import { refreshIntegrationBlockHashes } from '../../src/utils/hasher.js';
import { writeIntegrationFile } from '../../src/utils/integration-generator.js';
import { restoreSingleFile } from '../../src/commands/check.js';
import { getInstalledSkillsInfoForAgent, installSkillsToMultipleAgents } from '../../src/utils/skills-installer.js';

describe('Update Command', () => {
  let consoleLogs = [];
  let exitSpy;

  beforeEach(() => {
    consoleLogs = [];
    vi.spyOn(console, 'log').mockImplementation((...args) => {
      consoleLogs.push(args.join(' '));
    });
    exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });
    vi.spyOn(process, 'cwd').mockReturnValue('/test/project');
    // Reset the mock before each test
    mockPrompt.mockReset();
    mockPrompt.mockResolvedValue(true);
    mockExistsSync.mockReset();
    mockExistsSync.mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  // `--plan` printed "Run `uds update` to apply these changes." and plain
  // `uds update` never reaches the reconciler — it runs the legacy path, which
  // reports success for refreshing existing standards. Upgrading one project it
  // printed "✓ 69 standards updated" while all 8 deletions and 2 creations in the
  // plan were skipped, and the files were still on disk afterwards. Nothing
  // failed; it succeeded at different work.
  describe('reconciler routing (XSPEC-343)', () => {
    const initialisedManifest = () => {
      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue({
        upstream: { version: '1.0.0' },
        standards: [], extensions: [], integrations: [],
        skills: { installed: false }, commands: { installations: [] }
      });
    };

    it('should apply the printed plan under --apply, not force mode', async () => {
      initialisedManifest();

      await updateCommand({ apply: true, yes: true });

      expect(reconcilerReconcile).toHaveBeenCalledTimes(1);
      expect(reconcilerReconcile.mock.calls[0][1]).toMatchObject({ force: false });
      // The plan it shows must be the same one it executes.
      expect(reconcilerPlanMock.mock.calls[0][1]).toMatchObject({ force: false });
    });

    it('should keep --force on the larger force-mode plan', async () => {
      initialisedManifest();

      await updateCommand({ force: true, yes: true });

      expect(reconcilerReconcile).toHaveBeenCalledTimes(1);
      expect(reconcilerReconcile.mock.calls[0][1]).toMatchObject({ force: true });
    });

    it('should not reach the reconciler at all without a flag', async () => {
      initialisedManifest();

      // The legacy path runs to completion and exits; this suite's exit spy
      // throws, so swallow it — what is under test is which path was taken.
      await updateCommand({ yes: true }).catch(() => {});

      expect(reconcilerReconcile).not.toHaveBeenCalled();
    });

    it('should point --plan at --apply, never at bare `uds update`', async () => {
      initialisedManifest();

      await updateCommand({ plan: true });

      const output = consoleLogs.join('\n');
      expect(output).toContain('uds update --apply');
      // The old hint. `Run \`uds update\` to apply` must not come back.
      expect(output).not.toContain('`uds update` to apply');
      expect(reconcilerReconcile).not.toHaveBeenCalled();
    });
  });

  describe('updateCommand', () => {
    it('should show error if not initialized', async () => {
      isInitialized.mockReturnValue(false);

      await updateCommand({});

      const output = consoleLogs.join('\n');
      expect(output).toContain('Standards not initialized');
      expect(output).toContain('uds init');
    });

    it('should show error if manifest cannot be read', async () => {
      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue(null);

      await updateCommand({});

      const output = consoleLogs.join('\n');
      expect(output).toContain('Could not read manifest');
    });

    it('should show up to date message when versions match', async () => {
      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue({
        upstream: { version: '3.0.0' },
        standards: [],
        extensions: [],
        integrations: [],
        skills: { installed: false }
      });
      getRepositoryInfo.mockReturnValue({
        standards: { version: '3.0.0' },
        skills: { version: '1.0.0' }
      });

      await updateCommand({});

      const output = consoleLogs.join('\n');
      expect(output).toContain('Standards are up to date');
    });

    it('should show update available message', async () => {
      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue({
        upstream: { version: '2.0.0' },
        standards: ['core/test.md'],
        extensions: [],
        integrations: [],
        skills: { installed: false }
      });
      getRepositoryInfo.mockReturnValue({
        standards: { version: '3.0.0' },
        skills: { version: '1.0.0' }
      });
      mockPrompt.mockResolvedValue(false);

      await updateCommand({});

      const output = consoleLogs.join('\n');
      expect(output).toContain('Update available');
      expect(output).toContain('2.0.0');
      expect(output).toContain('3.0.0');
    });

    it('should cancel update when user declines', async () => {
      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue({
        upstream: { version: '2.0.0' },
        standards: ['core/test.md'],
        extensions: [],
        integrations: [],
        skills: { installed: false }
      });
      mockPrompt.mockResolvedValue(false);

      await updateCommand({});

      const output = consoleLogs.join('\n');
      expect(output).toContain('Update cancelled');
    });

    it('should perform update when confirmed', async () => {
      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue({
        upstream: { version: '2.0.0' },
        standards: ['core/test.md'],
        extensions: [],
        integrations: [],
        skills: { installed: false }
      });
      mockPrompt.mockResolvedValue(true);

      await expect(updateCommand({})).rejects.toThrow('process.exit called');

      expect(copyStandard).toHaveBeenCalled();
      expect(writeManifest).toHaveBeenCalled();
    });

    it('should skip confirmation with --yes flag', async () => {
      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue({
        upstream: { version: '2.0.0' },
        standards: ['core/test.md'],
        extensions: [],
        integrations: [],
        skills: { installed: false }
      });

      await expect(updateCommand({ yes: true })).rejects.toThrow('process.exit called');

      expect(mockPrompt).not.toHaveBeenCalled();
      expect(copyStandard).toHaveBeenCalled();
    });

    it('should show success message after update', async () => {
      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue({
        upstream: { version: '2.0.0' },
        standards: ['core/test.md'],
        extensions: [],
        integrations: [],
        skills: { installed: false }
      });

      await expect(updateCommand({ yes: true })).rejects.toThrow('process.exit called');

      const output = consoleLogs.join('\n');
      expect(output).toContain('Standards updated successfully');
    });

    it('should show skills update reminder when available', async () => {
      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue({
        upstream: { version: '2.0.0' },
        standards: [],
        extensions: [],
        integrations: [],
        skills: { installed: true, version: '0.9.0' }
      });
      getRepositoryInfo.mockReturnValue({
        standards: { version: '3.0.0' },
        skills: { version: '1.0.0' }
      });

      await expect(updateCommand({ yes: true })).rejects.toThrow('process.exit called');

      const output = consoleLogs.join('\n');
      expect(output).toContain('Skills update available');
    });

    it('should list files to update', async () => {
      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue({
        upstream: { version: '2.0.0' },
        standards: ['core/test.md'],
        extensions: ['extensions/lang.md'],
        integrations: ['.cursorrules'],
        skills: { installed: false }
      });
      mockPrompt.mockResolvedValue(false);

      await updateCommand({});

      const output = consoleLogs.join('\n');
      expect(output).toContain('Files to update');
      expect(output).toContain('test.md');
    });

    it('should not suggest downgrade when current version is newer (beta > stable)', async () => {
      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue({
        upstream: { version: '3.4.0-beta.3' },
        standards: ['core/test.md'],
        extensions: [],
        integrations: [],
        skills: { installed: false }
      });
      getRepositoryInfo.mockReturnValue({
        standards: { version: '3.3.0' },
        skills: { version: '1.0.0' }
      });

      await updateCommand({});

      const output = consoleLogs.join('\n');
      expect(output).toContain('Standards are up to date');
      expect(output).toContain('newer version than the registry');
      expect(output).not.toContain('Update available');
    });

    it('should not suggest downgrade when current version is newer major/minor', async () => {
      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue({
        upstream: { version: '4.0.0' },
        standards: ['core/test.md'],
        extensions: [],
        integrations: [],
        skills: { installed: false }
      });
      getRepositoryInfo.mockReturnValue({
        standards: { version: '3.3.0' },
        skills: { version: '1.0.0' }
      });

      await updateCommand({});

      const output = consoleLogs.join('\n');
      expect(output).toContain('Standards are up to date');
      expect(output).toContain('newer version than the registry');
    });

    it('should suggest update from stable to newer stable', async () => {
      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue({
        upstream: { version: '3.3.0' },
        standards: ['core/test.md'],
        extensions: [],
        integrations: [],
        skills: { installed: false }
      });
      getRepositoryInfo.mockReturnValue({
        standards: { version: '3.4.0' },
        skills: { version: '1.0.0' }
      });
      mockPrompt.mockResolvedValue(false);

      await updateCommand({});

      const output = consoleLogs.join('\n');
      expect(output).toContain('Update available');
      expect(output).toContain('3.3.0');
      expect(output).toContain('3.4.0');
    });

    it('should suggest update from beta to newer stable of same version', async () => {
      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue({
        upstream: { version: '3.4.0-beta.1' },
        standards: ['core/test.md'],
        extensions: [],
        integrations: [],
        skills: { installed: false }
      });
      getRepositoryInfo.mockReturnValue({
        standards: { version: '3.4.0' },
        skills: { version: '1.0.0' }
      });
      mockPrompt.mockResolvedValue(false);

      await updateCommand({});

      const output = consoleLogs.join('\n');
      expect(output).toContain('Update available');
    });

    it('should auto-install Skills in --yes mode when skills/commands missing', async () => {
      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue({
        upstream: { version: '2.0.0' },
        standards: ['core/test.md'],
        extensions: [],
        integrations: [],
        aiTools: ['opencode'],
        skills: { installed: false }
      });
      getRepositoryInfo.mockReturnValue({
        standards: { version: '3.0.0' },
        skills: { version: '1.0.0' }
      });

      await expect(updateCommand({ yes: true })).rejects.toThrow('process.exit called');

      expect(installSkillsToMultipleAgents).toHaveBeenCalled();
    });

    // XSPEC-343 R2 wiring test. The manifest writers appended with
    // `[...existing, ...new]`, so an agent already recorded gained a second
    // entry each time. dev-platform's manifest read `['claude-code',
    // 'claude-code']`. Removing the dedupe call fails this.
    it('should not duplicate an installation entry for an already-recorded agent', async () => {
      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue({
        upstream: { version: '2.0.0' },
        standards: ['core/test.md'],
        extensions: [],
        integrations: [],
        aiTools: ['opencode'],
        skills: { installed: false, installations: [{ agent: 'opencode', level: 'project' }] }
      });
      getRepositoryInfo.mockReturnValue({
        standards: { version: '3.0.0' },
        skills: { version: '1.0.0' }
      });

      await expect(updateCommand({ yes: true })).rejects.toThrow('process.exit called');

      const written = writeManifest.mock.calls.at(-1)?.[0];
      const agents = (written?.skills?.installations || []).map(i => i.agent);
      expect(agents).toEqual(['opencode']);
    });

    it('should not show new features prompt when aiTools is empty', async () => {
      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue({
        upstream: { version: '2.0.0' },
        standards: ['core/test.md'],
        extensions: [],
        integrations: [],
        aiTools: [],
        skills: { installed: false }
      });

      await expect(updateCommand({ yes: true })).rejects.toThrow('process.exit called');

      const output = consoleLogs.join('\n');
      expect(output).not.toContain('New features available');
    });

    it('should not prompt for features when --standards-only is used', async () => {
      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue({
        upstream: { version: '2.0.0' },
        standards: ['core/test.md'],
        extensions: [],
        integrations: [],
        aiTools: ['opencode'],
        skills: { installed: false }
      });

      await expect(updateCommand({ yes: true, standardsOnly: true })).rejects.toThrow('process.exit called');

      const output = consoleLogs.join('\n');
      expect(output).not.toContain('New features available');
    });
  });

  describe('updateCommandsOnly (--commands flag)', () => {
    it('should handle {agent, level} format correctly', async () => {
      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue({
        upstream: { version: '3.0.0' },
        standards: [],
        extensions: [],
        integrations: [],
        aiTools: ['opencode'],
        commands: {
          installed: true,
          installations: [{ agent: 'opencode', level: 'project' }]
        }
      });

      await expect(updateCommand({ commands: true })).rejects.toThrow('process.exit called');

      const output = consoleLogs.join('\n');
      expect(output).toContain('opencode');
      expect(output).toContain('project');
      expect(writeManifest).toHaveBeenCalled();
    });

    it('should show no commands message when installations is empty and no legacy', async () => {
      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue({
        upstream: { version: '3.0.0' },
        standards: [],
        extensions: [],
        integrations: [],
        aiTools: [],
        commands: { installed: false, installations: [] }
      });

      await expect(updateCommand({ commands: true })).rejects.toThrow('process.exit called');

      const output = consoleLogs.join('\n');
      expect(output).toContain('No slash commands installations found');
    });

    it('should convert legacy format when installations is empty but commands.installed is true', async () => {
      const { getAgentConfig } = await import('../../src/config/ai-agent-paths.js');
      getAgentConfig.mockReturnValue({ commands: { project: '.opencode/command/' } });

      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue({
        upstream: { version: '3.0.0' },
        standards: [],
        extensions: [],
        integrations: [],
        aiTools: ['opencode'],
        commands: {
          installed: true
          // No installations array - legacy format
        }
      });

      await expect(updateCommand({ commands: true })).rejects.toThrow('process.exit called');

      const output = consoleLogs.join('\n');
      // Should have converted and proceeded, not shown "no installations"
      expect(output).toContain('Updating slash commands');
      expect(writeManifest).toHaveBeenCalled();

      // Check that manifest was written with normalized format
      const manifestArg = writeManifest.mock.calls[0][0];
      expect(manifestArg.commands.installations).toEqual([
        { agent: 'opencode', level: 'project' }
      ]);
    });

    it('should normalize string installations to {agent, level} format in manifest', async () => {
      const { installCommandsToMultipleAgents, getInstalledCommandsForAgent } = await import('../../src/utils/skills-installer.js');
      installCommandsToMultipleAgents.mockResolvedValue({ totalInstalled: 1, totalErrors: 0 });
      getInstalledCommandsForAgent.mockReturnValue({ count: 1 });

      isInitialized.mockReturnValue(true);
      // Simulate a case where installations might be strings (hypothetical edge case)
      readManifest.mockReturnValue({
        upstream: { version: '3.0.0' },
        standards: [],
        extensions: [],
        integrations: [],
        aiTools: ['opencode'],
        commands: {
          installed: true,
          installations: [{ agent: 'opencode', level: 'project' }]
        }
      });

      await expect(updateCommand({ commands: true })).rejects.toThrow('process.exit called');

      expect(writeManifest).toHaveBeenCalled();
      const manifestArg = writeManifest.mock.calls[0][0];
      // Should be normalized to {agent, level} format
      expect(manifestArg.commands.installations[0]).toHaveProperty('agent');
      expect(manifestArg.commands.installations[0]).toHaveProperty('level');
    });

    it('should show level in status output', async () => {
      const { getInstalledCommandsForAgent } = await import('../../src/utils/skills-installer.js');
      getInstalledCommandsForAgent.mockReturnValue({ count: 5 });

      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue({
        upstream: { version: '3.0.0' },
        standards: [],
        extensions: [],
        integrations: [],
        aiTools: ['opencode'],
        commands: {
          installed: true,
          installations: [{ agent: 'opencode', level: 'user' }]
        }
      });

      await expect(updateCommand({ commands: true })).rejects.toThrow('process.exit called');

      const output = consoleLogs.join('\n');
      expect(output).toContain('user');
      expect(output).toContain('5 commands');
    });
  });

  describe('new standards detection', () => {
    beforeEach(() => {
      isInitialized.mockReturnValue(true);
      getRepositoryInfo.mockReturnValue({
        standards: { version: '3.0.0' },
        skills: { version: '1.0.0' }
      });
    });

    it('should auto-install new standards in --yes mode', async () => {
      readManifest.mockReturnValue({
        upstream: { version: '2.0.0' },
        standards: ['ai/commit-message.ai.yaml'],
        extensions: [],
        integrations: [],
        format: 'ai',
        skills: { installed: false }
      });

      // Registry returns standards including one not yet installed
      getAllStandards.mockReturnValue([
        { name: 'commit-message', category: 'reference', source: { ai: 'ai/commit-message.ai.yaml' } },
        { name: 'testing', category: 'reference', source: { ai: 'ai/testing.ai.yaml' } }
      ]);

      await expect(updateCommand({ yes: true })).rejects.toThrow('process.exit called');

      const output = consoleLogs.join('\n');
      expect(output).toContain('new standard');
      expect(output).toContain('testing.ai.yaml');
      // copyStandard should be called for existing + new standard
      expect(copyStandard).toHaveBeenCalledWith('ai/testing.ai.yaml', '.standards', '/test/project');
    });

    it('should install new standards when user confirms in interactive mode', async () => {
      readManifest.mockReturnValue({
        upstream: { version: '2.0.0' },
        standards: ['ai/commit-message.ai.yaml'],
        extensions: [],
        integrations: [],
        format: 'ai',
        skills: { installed: false }
      });

      getAllStandards.mockReturnValue([
        { name: 'commit-message', category: 'reference', source: { ai: 'ai/commit-message.ai.yaml' } },
        { name: 'testing', category: 'reference', source: { ai: 'ai/testing.ai.yaml' } }
      ]);

      // First prompt: confirm update, Second prompt: confirm install new
      mockPrompt
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true);

      await expect(updateCommand({})).rejects.toThrow('process.exit called');

      expect(copyStandard).toHaveBeenCalledWith('ai/testing.ai.yaml', '.standards', '/test/project');
    });

    it('should skip new standards when user declines in interactive mode', async () => {
      readManifest.mockReturnValue({
        upstream: { version: '2.0.0' },
        standards: ['ai/commit-message.ai.yaml'],
        extensions: [],
        integrations: [],
        format: 'ai',
        skills: { installed: false }
      });

      getAllStandards.mockReturnValue([
        { name: 'commit-message', category: 'reference', source: { ai: 'ai/commit-message.ai.yaml' } },
        { name: 'testing', category: 'reference', source: { ai: 'ai/testing.ai.yaml' } }
      ]);

      // First prompt: confirm update, Second prompt: decline new standards
      mockPrompt
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);

      await expect(updateCommand({})).rejects.toThrow('process.exit called');

      // copyStandard called for existing standard but NOT for the new one
      expect(copyStandard).toHaveBeenCalledWith('ai/commit-message.ai.yaml', '.standards', '/test/project');
      expect(copyStandard).not.toHaveBeenCalledWith('ai/testing.ai.yaml', '.standards', '/test/project');
    });

    it('should copy options standards to .standards/options directory', async () => {
      readManifest.mockReturnValue({
        upstream: { version: '2.0.0' },
        standards: ['ai/testing.ai.yaml', 'options/unit-testing.ai.yaml'],
        extensions: [],
        integrations: [],
        format: 'ai',
        skills: { installed: false }
      });

      getAllStandards.mockReturnValue([
        { name: 'testing', category: 'reference', source: { ai: 'ai/testing.ai.yaml' } },
        { name: 'unit-testing', category: 'reference', source: { ai: 'options/unit-testing.ai.yaml' } }
      ]);

      await expect(updateCommand({ yes: true })).rejects.toThrow('process.exit called');

      // Regular standards go to .standards
      expect(copyStandard).toHaveBeenCalledWith('ai/testing.ai.yaml', '.standards', '/test/project');
      // Options standards go to .standards/options
      expect(copyStandard).toHaveBeenCalledWith('options/unit-testing.ai.yaml', '.standards/options', '/test/project');
    });

    it('should install new options standards to .standards/options directory', async () => {
      readManifest.mockReturnValue({
        upstream: { version: '2.0.0' },
        standards: ['ai/testing.ai.yaml'],
        extensions: [],
        integrations: [],
        format: 'ai',
        skills: { installed: false }
      });

      getAllStandards.mockReturnValue([
        { name: 'testing', category: 'reference', source: { ai: 'ai/testing.ai.yaml' } },
        { name: 'unit-testing', category: 'reference', source: { ai: 'options/unit-testing.ai.yaml' } }
      ]);

      await expect(updateCommand({ yes: true })).rejects.toThrow('process.exit called');

      // New options standard should go to .standards/options
      expect(copyStandard).toHaveBeenCalledWith('options/unit-testing.ai.yaml', '.standards/options', '/test/project');
    });

    it('should include both reference and skill categories as new standards', async () => {
      readManifest.mockReturnValue({
        upstream: { version: '2.0.0' },
        standards: ['ai/commit-message.ai.yaml'],
        extensions: [],
        integrations: [],
        format: 'ai',
        skills: { installed: false }
      });

      // Registry returns both reference and skill category standards
      getAllStandards.mockReturnValue([
        { name: 'commit-message', category: 'reference', source: { ai: 'ai/commit-message.ai.yaml' } },
        { name: 'testing', category: 'reference', source: { ai: 'ai/testing.ai.yaml' } },
        { name: 'sdd', category: 'skill', source: { ai: 'ai/sdd.ai.yaml' } }
      ]);

      await expect(updateCommand({ yes: true })).rejects.toThrow('process.exit called');

      const output = consoleLogs.join('\n');
      // Both reference and skill categories should be detected as new
      expect(output).toContain('testing.ai.yaml');
      expect(output).toContain('sdd.ai.yaml');
    });

    it('should not show new standards prompt when all standards are already installed', async () => {
      readManifest.mockReturnValue({
        upstream: { version: '2.0.0' },
        standards: ['ai/commit-message.ai.yaml', 'ai/testing.ai.yaml'],
        extensions: [],
        integrations: [],
        format: 'ai',
        skills: { installed: false }
      });

      // Registry has same standards as installed
      getAllStandards.mockReturnValue([
        { name: 'commit-message', category: 'reference', source: { ai: 'ai/commit-message.ai.yaml' } },
        { name: 'testing', category: 'reference', source: { ai: 'ai/testing.ai.yaml' } }
      ]);

      await expect(updateCommand({ yes: true })).rejects.toThrow('process.exit called');

      const output = consoleLogs.join('\n');
      expect(output).not.toContain('new standard');
    });

    it('should skip standards with null source (skill-only like project-discovery)', async () => {
      readManifest.mockReturnValue({
        upstream: { version: '2.0.0' },
        standards: ['ai/commit-message.ai.yaml'],
        extensions: [],
        integrations: [],
        format: 'ai',
        skills: { installed: false }
      });

      // project-discovery has source: { human: null, ai: null }
      getAllStandards.mockReturnValue([
        { name: 'commit-message', category: 'reference', source: { ai: 'ai/commit-message.ai.yaml' } },
        { name: 'project-discovery', category: 'skill', source: { human: null, ai: null } },
        { name: 'testing', category: 'reference', source: { ai: 'ai/testing.ai.yaml' } }
      ]);

      await expect(updateCommand({ yes: true })).rejects.toThrow('process.exit called');

      const output = consoleLogs.join('\n');
      // Should not crash and should still detect testing as new
      expect(output).toContain('testing.ai.yaml');
      // project-discovery should be silently skipped
      expect(output).not.toContain('project-discovery');
    });

    it('should exclude non-reference non-skill categories from new standards', async () => {
      readManifest.mockReturnValue({
        upstream: { version: '2.0.0' },
        standards: ['ai/commit-message.ai.yaml'],
        extensions: [],
        integrations: [],
        format: 'ai',
        skills: { installed: false }
      });

      getAllStandards.mockReturnValue([
        { name: 'commit-message', category: 'reference', source: { ai: 'ai/commit-message.ai.yaml' } },
        { name: 'sdd', category: 'skill', source: { ai: 'ai/sdd.ai.yaml' } },
        { name: 'internal-tool', category: 'internal', source: { ai: 'ai/internal-tool.ai.yaml' } }
      ]);

      await expect(updateCommand({ yes: true })).rejects.toThrow('process.exit called');

      const output = consoleLogs.join('\n');
      // skill category should be included
      expect(output).toContain('sdd.ai.yaml');
      // non-reference/non-skill category should be excluded
      expect(output).not.toContain('internal-tool.ai.yaml');
    });
  });

  describe('post-update integrity check', () => {
    it('should detect and auto-restore missing files in --yes mode', async () => {
      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue({
        upstream: { version: '2.0.0' },
        standards: ['core/test.ai.yaml', 'core/commit.ai.yaml'],
        extensions: [],
        integrations: [],
        skills: { installed: false }
      });

      // Mock existsSync: second file is missing
      mockExistsSync.mockImplementation((filePath) => {
        if (typeof filePath === 'string' && filePath.includes('commit.ai.yaml')) {
          return false;
        }
        return true;
      });

      await expect(updateCommand({ yes: true })).rejects.toThrow('process.exit called');

      const output = consoleLogs.join('\n');
      expect(output).toContain('missing after update');
      expect(restoreSingleFile).toHaveBeenCalled();
      // writeManifest should be called at least twice (initial + after restore)
      expect(writeManifest.mock.calls.length).toBeGreaterThanOrEqual(2);
    });

    it('should prompt user for batch restore in interactive mode', async () => {
      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue({
        upstream: { version: '2.0.0' },
        standards: ['core/test.ai.yaml', 'core/missing.ai.yaml'],
        extensions: [],
        integrations: [],
        skills: { installed: false }
      });

      mockExistsSync.mockImplementation((filePath) => {
        if (typeof filePath === 'string' && filePath.includes('missing.ai.yaml')) {
          return false;
        }
        return true;
      });

      // First prompt: confirm update, second prompt: confirm restore
      mockPrompt
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true)
        .mockResolvedValue(true);

      await expect(updateCommand({})).rejects.toThrow('process.exit called');

      const output = consoleLogs.join('\n');
      expect(output).toContain('missing after update');
      // Verify restore was offered (prompt was called at least twice)
      expect(mockPrompt.mock.calls.length).toBeGreaterThanOrEqual(2);
    });

    it('should re-run integration generation after restoring missing files', async () => {
      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue({
        upstream: { version: '2.0.0' },
        standards: ['core/test.ai.yaml', 'core/commit.ai.yaml'],
        extensions: [],
        integrations: [],
        aiTools: ['claude-code'],
        skills: { installed: false }
      });

      // Mock existsSync: second file is missing
      mockExistsSync.mockImplementation((filePath) => {
        if (typeof filePath === 'string' && filePath.includes('commit.ai.yaml')) {
          return false;
        }
        return true;
      });

      // Clear call counts before test
      writeIntegrationFile.mockClear();
      refreshIntegrationBlockHashes.mockClear();
      writeManifest.mockClear();

      await expect(updateCommand({ yes: true })).rejects.toThrow('process.exit called');

      // Integration should be regenerated after restore
      expect(writeIntegrationFile).toHaveBeenCalled();
      // refreshIntegrationBlockHashes called at least twice: initial + post-restore
      expect(refreshIntegrationBlockHashes.mock.calls.length).toBeGreaterThanOrEqual(2);
      // writeManifest called at least 3 times: initial + post-restore + post-regen
      expect(writeManifest.mock.calls.length).toBeGreaterThanOrEqual(3);
    });

    it('should not re-run integration generation when no aiTools configured', async () => {
      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue({
        upstream: { version: '2.0.0' },
        standards: ['core/test.ai.yaml', 'core/commit.ai.yaml'],
        extensions: [],
        integrations: [],
        skills: { installed: false }
        // No aiTools
      });

      mockExistsSync.mockImplementation((filePath) => {
        if (typeof filePath === 'string' && filePath.includes('commit.ai.yaml')) {
          return false;
        }
        return true;
      });

      writeIntegrationFile.mockClear();

      await expect(updateCommand({ yes: true })).rejects.toThrow('process.exit called');

      // Integration should NOT be regenerated (no aiTools)
      expect(writeIntegrationFile).not.toHaveBeenCalled();
    });

    it('should skip restore when no files are missing', async () => {
      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue({
        upstream: { version: '2.0.0' },
        standards: ['core/test.ai.yaml'],
        extensions: [],
        integrations: [],
        skills: { installed: false }
      });

      // All files exist
      mockExistsSync.mockReturnValue(true);

      await expect(updateCommand({ yes: true })).rejects.toThrow('process.exit called');

      const output = consoleLogs.join('\n');
      expect(output).not.toContain('missing after update');
      expect(restoreSingleFile).not.toHaveBeenCalled();
    });

    it('should derive skills location from installations when reminder triggers', async () => {
      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue({
        upstream: { version: '2.0.0' },
        standards: [],
        extensions: [],
        integrations: [],
        aiTools: ['claude-code'],
        skills: {
          installed: true,
          version: '0.9.0',
          // location is NOT set (legacy manifest)
          installations: [{ agent: 'claude-code', level: 'project' }]
        }
      });
      getRepositoryInfo.mockReturnValue({
        standards: { version: '3.0.0' },
        skills: { version: '1.0.0' }
      });

      await expect(updateCommand({ yes: true })).rejects.toThrow('process.exit called');

      const output = consoleLogs.join('\n');
      // Should show project-level update instructions (not legacy/unknown)
      expect(output).toContain('Skills update available');
      // Should contain manual update hint for project level
      expect(output).toContain('.claude/skills/universal-dev-standards');
    });

    it('should fall back to file-system detection when location and installations are missing', async () => {
      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue({
        upstream: { version: '2.0.0' },
        standards: [],
        extensions: [],
        integrations: [],
        aiTools: ['claude-code'],
        skills: {
          installed: true,
          version: '0.9.0'
          // No location, no installations
        }
      });
      getRepositoryInfo.mockReturnValue({
        standards: { version: '3.0.0' },
        skills: { version: '1.0.0' }
      });

      // File-system detection: skills exist at project level
      getInstalledSkillsInfoForAgent.mockImplementation((agent, level) => {
        if (level === 'project') return { installed: true, version: null };
        return null;
      });

      await expect(updateCommand({ yes: true })).rejects.toThrow('process.exit called');

      const output = consoleLogs.join('\n');
      expect(output).toContain('Skills update available');
      // Should detect project level via file system and show project-level instructions
      expect(output).toContain('.claude/skills/universal-dev-standards');
    });
  });

  describe('BUG-FIX: integration tool names in manifest.integrations must not be treated as file paths', () => {
    // Regression test for the bug where manifest.integrations entries like
    // "claude-code" and "opencode" were pushed directly into allTrackedFiles,
    // causing existsSync("claude-code") to return false and triggering a
    // spurious "missing file" restore attempt with "無法判斷來源" error.
    //
    // Fixed in update.js: use getToolFilePath(int) to resolve to actual file path
    // (e.g. "claude-code" → "CLAUDE.md") before pushing to allTrackedFiles.

    it('should NOT report claude-code or opencode as missing files after update', async () => {
      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue({
        upstream: { version: '2.0.0' },
        standards: ['core/test.md'],
        extensions: [],
        integrations: ['claude-code', 'opencode'],
        aiTools: ['claude-code', 'opencode'],
        skills: { installed: false }
      });

      // All files exist (default mock), including CLAUDE.md resolved by getToolFilePath
      mockExistsSync.mockReturnValue(true);
      // yes: true so the command runs to completion and calls process.exit
      await expect(updateCommand({ yes: true })).rejects.toThrow('process.exit called');

      // restoreSingleFile should NOT have been called with "claude-code" or "opencode"
      // as file paths — the fix converts these to actual paths via getToolFilePath
      expect(restoreSingleFile).not.toHaveBeenCalledWith(
        expect.stringContaining('claude-code'),
        expect.anything(),
        expect.anything()
      );
      expect(restoreSingleFile).not.toHaveBeenCalledWith(
        expect.stringContaining('opencode'),
        expect.anything(),
        expect.anything()
      );

      // No "missing" warning should appear in output
      const output = consoleLogs.join('\n');
      expect(output).not.toContain('still missing');
    });

    it('should resolve integration tool name to CLAUDE.md via getToolFilePath — no spurious missing-file restore', async () => {
      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue({
        upstream: { version: '2.0.0' },
        standards: ['core/test.md'],
        extensions: [],
        integrations: ['claude-code'],
        aiTools: ['claude-code'],
        skills: { installed: false }
      });

      // CLAUDE.md (resolved by getToolFilePath) exists; raw string "claude-code" does not
      mockExistsSync.mockImplementation((filePath) => {
        if (typeof filePath === 'string' && /[/\\]claude-code$/.test(filePath)) {
          return false; // raw "claude-code" path does not exist
        }
        return true; // CLAUDE.md and everything else exists
      });

      // yes: true so the command runs to completion
      await expect(updateCommand({ yes: true })).rejects.toThrow('process.exit called');

      // With fix: getToolFilePath("claude-code") → "CLAUDE.md" → existsSync → true → no restore
      expect(restoreSingleFile).not.toHaveBeenCalled();
    });
  });

  describe('XSPEC-208 BUG-208-02: orphan integrationBlockHashes cleanup', () => {
    // Regression for spurious "Integration UDS Block Integrity: GEMINI.md missing"
    // warning after manifest.aiTools shrinks. Before the fix, hashes from
    // previously-installed tools (e.g. gemini-cli, opencode) survived every
    // upgrade and triggered missing-file reports in `uds check`.

    it('prunes orphaned integrationBlockHashes whose file is no longer generated', async () => {
      isInitialized.mockReturnValue(true);

      // Manifest mirrors the machine-setup state observed in XSPEC-208:
      // aiTools shrank to ["claude-code"] but integrationBlockHashes still
      // contains stale GEMINI.md and AGENTS.md entries from a 2026-03 install.
      const testManifest = {
        upstream: { version: '2.0.0' },
        standards: ['core/test.md'],
        extensions: [],
        integrations: ['CLAUDE.md'],
        aiTools: ['claude-code'],
        integrationBlockHashes: {
          'CLAUDE.md': { blockHash: 'sha256:current', installedAt: '2026-05-14T01:15:51.772Z' },
          'GEMINI.md': { blockHash: 'sha256:stale-gemini', installedAt: '2026-03-23T13:34:40.525Z' },
          'AGENTS.md': { blockHash: 'sha256:stale-agents', installedAt: '2026-03-23T13:34:40.525Z' }
        },
        skills: { installed: false }
      };
      readManifest.mockReturnValue(testManifest);

      await expect(updateCommand({ yes: true })).rejects.toThrow('process.exit called');

      // After update: orphans pruned, CLAUDE.md retained.
      expect(Object.keys(testManifest.integrationBlockHashes).sort()).toEqual(['CLAUDE.md']);
      expect(testManifest.integrationBlockHashes['GEMINI.md']).toBeUndefined();
      expect(testManifest.integrationBlockHashes['AGENTS.md']).toBeUndefined();

      // Console should announce the prune so users see what changed.
      const output = consoleLogs.join('\n');
      expect(output).toMatch(/Pruned 2 orphaned integration hash|清除 2 個孤兒|清除 2 个孤儿/);
    });

    it('keeps hashes whose corresponding integration file is still generated', async () => {
      isInitialized.mockReturnValue(true);
      const testManifest = {
        upstream: { version: '2.0.0' },
        standards: ['core/test.md'],
        extensions: [],
        integrations: ['CLAUDE.md'],
        aiTools: ['claude-code'],
        integrationBlockHashes: {
          'CLAUDE.md': { blockHash: 'sha256:current', installedAt: '2026-05-14' }
        },
        skills: { installed: false }
      };
      readManifest.mockReturnValue(testManifest);

      await expect(updateCommand({ yes: true })).rejects.toThrow('process.exit called');

      // No orphans → no prune → CLAUDE.md hash retained.
      expect(Object.keys(testManifest.integrationBlockHashes)).toEqual(['CLAUDE.md']);
      const output = consoleLogs.join('\n');
      expect(output).not.toMatch(/Pruned \d+ orphaned/);
    });

    it('handles manifest without integrationBlockHashes (legacy / pre-3.3 manifest)', async () => {
      isInitialized.mockReturnValue(true);
      const testManifest = {
        upstream: { version: '2.0.0' },
        standards: ['core/test.md'],
        extensions: [],
        integrations: ['CLAUDE.md'],
        aiTools: ['claude-code'],
        // intentionally no integrationBlockHashes field
        skills: { installed: false }
      };
      readManifest.mockReturnValue(testManifest);

      // Must not throw on missing integrationBlockHashes
      await expect(updateCommand({ yes: true })).rejects.toThrow('process.exit called');
      expect(testManifest.integrationBlockHashes).toBeUndefined();
    });
  });

  // XSPEC-292 §9.2 (T11): transactional integrity — a partial failure must
  // NOT be recorded as a completed update. Before the fix, update.js bumped
  // manifest.upstream.version to the latest version and printed "success" even
  // when copyStandard() failed for some files, so the next `uds update`
  // believed the project was already up to date and never retried.
  describe('T11: partial failure must not record completion', () => {
    afterEach(() => {
      // copyStandard impl is set at module-mock level and survives clearAllMocks;
      // restore the default success behaviour so later suites are unaffected.
      copyStandard.mockReturnValue({ success: true, error: null, path: '/test/path' });
    });

    const partialFailureManifest = () => ({
      upstream: { version: '2.0.0' },
      standards: ['core/test.md'],
      extensions: [],
      integrations: [],
      skills: { installed: false }
    });

    it('does not advance manifest upstream.version when a standard copy fails', async () => {
      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue(partialFailureManifest());
      getRepositoryInfo.mockReturnValue({
        standards: { version: '3.0.0' },
        skills: { version: '1.0.0' }
      });
      copyStandard.mockReturnValue({ success: false, error: 'EPERM: operation not permitted' });

      await expect(updateCommand({ yes: true })).rejects.toThrow('process.exit called');

      expect(writeManifest).toHaveBeenCalled();
      // EVERY manifest write during a partial failure must keep the OLD version.
      for (const call of writeManifest.mock.calls) {
        expect(call[0].upstream.version).toBe('2.0.0');
      }
    });

    it('exits non-zero and does not claim success on a partial update', async () => {
      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue(partialFailureManifest());
      getRepositoryInfo.mockReturnValue({
        standards: { version: '3.0.0' },
        skills: { version: '1.0.0' }
      });
      copyStandard.mockReturnValue({ success: false, error: 'EPERM' });

      await expect(updateCommand({ yes: true })).rejects.toThrow('process.exit called');

      expect(exitSpy).toHaveBeenCalledWith(1);
      const output = consoleLogs.join('\n');
      expect(output).not.toContain('Standards updated successfully');
    });

    it('still advances version and exits 0 on a clean update (no regression)', async () => {
      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue(partialFailureManifest());
      getRepositoryInfo.mockReturnValue({
        standards: { version: '3.0.0' },
        skills: { version: '1.0.0' }
      });
      copyStandard.mockReturnValue({ success: true, error: null, path: '/test/path' });

      await expect(updateCommand({ yes: true })).rejects.toThrow('process.exit called');

      expect(exitSpy).toHaveBeenCalledWith(0);
      const versionWrites = writeManifest.mock.calls.map(c => c[0].upstream.version);
      expect(versionWrites).toContain('3.0.0');
    });
  });

  describe('XSPEC-372: mode flags must not be eaten by scope flags, and a prompt with nobody to answer it must fail', () => {
    const skillsManifest = () => ({
      upstream: { version: '2.0.0' },
      standards: ['core/test.md'],
      extensions: [],
      integrations: [],
      aiTools: ['claude-code'],
      skills: {
        installed: true,
        version: '0.9.0',
        installations: [{ agent: 'claude-code', level: 'project' }],
        names: []
      }
    });

    beforeEach(() => {
      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue(skillsManifest());
      getInstalledSkillsInfoForAgent.mockReturnValue({ installed: true, version: '0.9.0' });
      installSkillsToMultipleAgents.mockClear();
      writeManifest.mockClear();
      reconcilerReconcile.mockClear();
    });

    it('--plan --skills writes nothing', async () => {
      // The flag documented as "without executing" used to be dropped because
      // --skills was checked first in a first-match-wins chain. Measured
      // 2026-08-10: it installed Skills and said nothing about --plan.
      await updateCommand({ plan: true, skills: true });

      expect(installSkillsToMultipleAgents).not.toHaveBeenCalled();
      expect(writeManifest).not.toHaveBeenCalled();
      expect(consoleLogs.join('\n')).toContain('nothing is written');
    });

    it('--plan --skills reports what would change, not just that it is a dry run', async () => {
      await updateCommand({ plan: true, skills: true });

      const output = consoleLogs.join('\n');
      expect(output).toContain('v0.9.0');
      expect(output).toContain('1 installation(s) would be updated');
    });

    it('says the manifest records no installation rather than reporting up to date', async () => {
      // vibeops has 140 skill files on disk and installations: [] in the
      // manifest. "All up to date" would be the wrong answer to give it.
      readManifest.mockReturnValue({ ...skillsManifest(), skills: { installed: true, installations: [] } });

      await updateCommand({ plan: true, skills: true });

      expect(consoleLogs.join('\n')).toContain('nothing for --skills to update');
    });

    it('--apply --skills does BOTH the reconciliation and the Skills update', async () => {
      // The defect that mattered in practice: telemetry-client reported success
      // with its standards still on the old version, because --skills returned
      // before the reconciler ever ran.
      await expect(updateCommand({ apply: true, yes: true, skills: true }))
        .rejects.toThrow('process.exit called'); // updateSkillsOnly exits 0

      expect(reconcilerReconcile).toHaveBeenCalled();
      expect(installSkillsToMultipleAgents).toHaveBeenCalled();
    });

    it('--rollback --skills says the scope flag is ignored instead of appearing to honour it', async () => {
      await updateCommand({ rollback: true, skills: true });

      expect(consoleLogs.join('\n')).toContain('cannot narrow it and are ignored');
      expect(installSkillsToMultipleAgents).not.toHaveBeenCalled();
    });

    it('exits 2 without writing when the prompt cannot be answered', async () => {
      // Reproduced 2026-08-10: ExitPromptError, zero files written, exit 0 —
      // in CI indistinguishable from a successful update. The condition is the
      // prompt failing, not `isTTY`, so that is what the test induces.
      mockPrompt.mockRejectedValueOnce(
        Object.assign(new Error('User force closed the prompt with 0 null'), { name: 'ExitPromptError' })
      );

      await expect(updateCommand({ apply: true })).rejects.toThrow('process.exit called');

      expect(exitSpy).toHaveBeenCalledWith(2);
      expect(reconcilerReconcile).not.toHaveBeenCalled();
      expect(consoleLogs.join('\n')).toContain('Nothing has been written');
    });

    it('--yes never reaches the prompt, so unattended use keeps working', async () => {
      // The guard must not turn every CI run into a failure — only the ones
      // that would otherwise have silently done nothing.
      mockPrompt.mockRejectedValue(
        Object.assign(new Error('User force closed the prompt with 0 null'), { name: 'ExitPromptError' })
      );

      await updateCommand({ apply: true, yes: true });

      expect(reconcilerReconcile).toHaveBeenCalled();
      expect(exitSpy).not.toHaveBeenCalledWith(2);
    });

    it('does not swallow an unrelated prompt failure as "nobody can answer"', async () => {
      // Treating every prompt error as a missing TTY would hide real bugs
      // behind a friendly message and a fixed exit code.
      mockPrompt.mockRejectedValueOnce(new TypeError('something else broke'));

      await expect(updateCommand({ apply: true })).rejects.toThrow('something else broke');
      expect(exitSpy).not.toHaveBeenCalledWith(2);
    });
  });

  describe('XSPEC-372 class-level: --plan must write nothing, whatever it is combined with', () => {
    // The instance-level fix (--skills, --commands) is not the defect. The
    // defect is that a scope flag can reach a writing branch before --plan is
    // ever consulted, and 2026-07-30 c6409792 already fixed exactly this for
    // --integrations-only while leaving the other two — eleven days later they
    // were still writing. Enumerating the three that exist today would repeat
    // that mistake the moment a fourth is added.
    //
    // So this reads the flag list off the CLI definition and excludes the ones
    // that are not scopes. A new flag is in scope by default: it gets tested
    // without anyone remembering to add it, which is the whole point.
    const MODES = ['plan', 'apply', 'force', 'rollback'];
    const NOT_A_SCOPE = ['yes', 'offline', 'beta', 'debug', 'locale'];

    function updateFlagsFromCli() {
      const src = realReadFileSync(
        join(dirname(fileURLToPath(import.meta.url)), '../../bin/uds.js'),
        'utf8'
      );
      const block = src.slice(src.indexOf("command('update')"));
      const end = block.indexOf('.action(');
      const decl = block.slice(0, end);
      const names = [];
      for (const m of decl.matchAll(/\.option\('(?:-\w, )?--([a-z-]+)/g)) {
        const camel = m[1].replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        names.push(camel);
      }
      return names;
    }

    it('the flag list is read from the CLI and is not empty', () => {
      // Without this, a parser that silently matched nothing would make every
      // assertion below vacuous and the suite would still be green.
      const flags = updateFlagsFromCli();
      expect(flags.length).toBeGreaterThan(8);
      expect(flags).toContain('skills');
      expect(flags).toContain('plan');
    });

    it.each(
      updateFlagsFromCli().filter(f => !MODES.includes(f) && !NOT_A_SCOPE.includes(f))
    )('--plan --%s writes nothing', async (flag) => {
      isInitialized.mockReturnValue(true);
      readManifest.mockReturnValue({
        upstream: { version: '2.0.0' },
        standards: ['core/test.md'],
        extensions: [],
        integrations: [],
        aiTools: ['claude-code'],
        // Every scope's write path must be REACHABLE, or the test passes
        // because the code bailed out early rather than because --plan was
        // honoured. --sync-refs returns immediately without integrationConfigs,
        // and its assertions were vacuous until this was added.
        integrationConfigs: { 'CLAUDE.md': { tool: 'claude-code', categories: ['stale-category'] } },
        skills: { installed: true, version: '0.9.0', installations: [{ agent: 'claude-code', level: 'project' }], names: [] },
        commands: { installed: true, installations: [{ agent: 'opencode', level: 'project' }] }
      });
      writeManifest.mockClear();
      copyStandard.mockClear();
      writeIntegrationFile.mockClear();
      installSkillsToMultipleAgents.mockClear();
      reconcilerReconcile.mockClear();

      await updateCommand({ plan: true, [flag]: true }).catch(() => {});

      expect(writeManifest, `--plan --${flag} wrote the manifest`).not.toHaveBeenCalled();
      expect(copyStandard, `--plan --${flag} copied a standard`).not.toHaveBeenCalled();
      expect(writeIntegrationFile, `--plan --${flag} wrote an integration file`).not.toHaveBeenCalled();
      expect(installSkillsToMultipleAgents, `--plan --${flag} installed Skills`).not.toHaveBeenCalled();
      expect(reconcilerReconcile, `--plan --${flag} ran the reconciler`).not.toHaveBeenCalled();
    });
  });
});
