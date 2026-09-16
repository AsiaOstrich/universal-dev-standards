/**
 * P1 — `update --apply` must not forget the commands it did not touch.
 *
 * Measured on 6.9.0 (2026-09-16, temp project, 51 opencode commands): drifting
 * three files produced a plan with three `update` actions; after `--apply` the
 * manifest held three `commandHashes` and the other 48 files — still on disk —
 * were no longer covered by anything. `uds check` then printed
 * "Commands: 51 installed" and "✓ All command files intact (3 files)" in the
 * same run, and tampering with one of the 48 changed neither line.
 *
 * The skills path merges (plan-executor.js, executeSkillBatch); the commands
 * path deleted every key for the agent before merging the subset back.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mkdirSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEST_DIR = join(__dirname, '../../temp/command-hash-preservation');

vi.mock('../../../src/reconciler/backup-manager.js', () => ({
  createBackup: vi.fn(() => ({ backupId: null, backupDir: TEST_DIR, backedUp: [], errors: [] })),
  cleanupBackups: vi.fn(() => ({ removed: [], errors: [] }))
}));

vi.mock('../../../src/utils/skills-installer.js', () => ({
  installSkillsToMultipleAgents: vi.fn(async () => ({ success: true, allFileHashes: {} })),
  // Installs only the commands the plan named — exactly what the real installer
  // does when `commandNames` is a subset.
  installCommandsToMultipleAgents: vi.fn(async (_installations, commandNames) => ({
    success: true,
    allFileHashes: Object.fromEntries(
      (commandNames || []).map(n => [`opencode/${n}.md`, { hash: 'sha256:new', size: 10 }])
    )
  }))
}));

const { executePlan } = await import('../../../src/reconciler/plan-executor.js');

function commandAction(type, name) {
  return {
    type,
    category: 'command',
    path: `.opencode/command/${name}.md`,
    details: { metadata: { commandName: name } }
  };
}

describe('P1: commandHashes survive a partial apply', () => {
  beforeEach(() => { mkdirSync(TEST_DIR, { recursive: true }); });
  afterEach(() => { rmSync(TEST_DIR, { recursive: true, force: true }); });

  const baseManifest = () => ({
    commands: { installed: true, installations: [{ agent: 'opencode', level: 'project' }] },
    commandHashes: {
      'opencode/ac-coverage.md': { hash: 'sha256:old', size: 10 },
      'opencode/api-design.md': { hash: 'sha256:old', size: 10 },
      'opencode/atdd.md': { hash: 'sha256:old', size: 10 },
      'opencode/checkin.md': { hash: 'sha256:old', size: 10 },
      'opencode/commit.md': { hash: 'sha256:old', size: 10 }
    }
  });

  it('keeps the entries for commands the plan never mentioned', async () => {
    const plan = { actions: [commandAction('update', 'ac-coverage'), commandAction('update', 'api-design')] };

    const result = await executePlan(TEST_DIR, plan, baseManifest(), { backup: false });

    const keys = Object.keys(result.updatedManifest.commandHashes).sort();
    expect(keys).toEqual([
      'opencode/ac-coverage.md',
      'opencode/api-design.md',
      'opencode/atdd.md',
      'opencode/checkin.md',
      'opencode/commit.md'
    ]);
    // The two it did touch carry the fresh hash, not the stale one.
    expect(result.updatedManifest.commandHashes['opencode/ac-coverage.md'].hash).toBe('sha256:new');
    expect(result.updatedManifest.commandHashes['opencode/checkin.md'].hash).toBe('sha256:old');
  });

  it('drops the entry for a command the plan deletes', async () => {
    const plan = { actions: [commandAction('delete', 'commit'), commandAction('update', 'atdd')] };

    const result = await executePlan(TEST_DIR, plan, baseManifest(), { backup: false });

    expect(Object.keys(result.updatedManifest.commandHashes).sort()).toEqual([
      'opencode/ac-coverage.md',
      'opencode/api-design.md',
      'opencode/atdd.md',
      'opencode/checkin.md'
    ]);
  });
});
