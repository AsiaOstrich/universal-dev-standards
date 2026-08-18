/**
 * XSPEC-382 R6 — the rollback point did not cover the largest part of the change.
 *
 * Skills are directories (`.claude/skills/<name>`), and the backup called
 * `copyFileSync` on them. That throws on every platform — ENOTSUP on macOS,
 * EISDIR on Linux — so no skill was ever backed up.
 *
 * The failure was invisible twice over. The executor aborted only when
 * `backedUp.length === 0`, so a run that backed up the standards and failed on
 * every skill proceeded and overwrote them all; and the backup manifest had no
 * errors field, so on disk a partial backup was indistinguishable from a
 * complete one.
 *
 * Measured on a real repo before the fix — a vibeops backup manifest recorded
 * 74 backed-up paths for a plan of 129 actions, with 0 of the 55 skill
 * directories among them.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, existsSync, rmSync, readFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { createBackup } from '../../../src/reconciler/backup-manager.js';

const planFor = (paths) => ({
  actions: paths.map((p) => ({ type: 'update', category: 'skill', path: p, reason: 'test' })),
  summary: { create: 0, update: paths.length, delete: 0, unchanged: 0, migrate_block: 0 },
  warnings: []
});

describe('createBackup — directories (XSPEC-382 R6)', () => {
  let project;

  beforeEach(() => {
    project = mkdtempSync(join(tmpdir(), 'uds-backup-test-'));
  });
  afterEach(() => {
    rmSync(project, { recursive: true, force: true });
  });

  it('backs up a directory with its contents', () => {
    const skillDir = join(project, '.claude/skills/demo');
    mkdirSync(skillDir, { recursive: true });
    writeFileSync(join(skillDir, 'SKILL.md'), 'body');
    writeFileSync(join(skillDir, 'guide.md'), 'more');

    const result = createBackup(project, planFor(['.claude/skills/demo']));

    expect(result.errors).toEqual([]);
    expect(result.backedUp).toEqual(['.claude/skills/demo']);
    // Contents, not just the directory entry — a backup of an empty directory
    // restores nothing.
    expect(existsSync(join(result.backupDir, '.claude/skills/demo/SKILL.md'))).toBe(true);
    expect(existsSync(join(result.backupDir, '.claude/skills/demo/guide.md'))).toBe(true);
    expect(readFileSync(join(result.backupDir, '.claude/skills/demo/SKILL.md'), 'utf8')).toBe('body');
  });

  it('still backs up plain files', () => {
    // Regression arm: a fix that handled directories by breaking files would
    // pass the case above.
    mkdirSync(join(project, '.standards'), { recursive: true });
    writeFileSync(join(project, '.standards/a.ai.yaml'), 'x');

    const result = createBackup(project, planFor(['.standards/a.ai.yaml']));

    expect(result.errors).toEqual([]);
    expect(readFileSync(join(result.backupDir, '.standards/a.ai.yaml'), 'utf8')).toBe('x');
  });

  it('records coverage so a partial backup is legible on disk', () => {
    mkdirSync(join(project, '.claude/skills/demo'), { recursive: true });
    writeFileSync(join(project, '.claude/skills/demo/SKILL.md'), 'body');
    mkdirSync(join(project, '.standards'), { recursive: true });
    writeFileSync(join(project, '.standards/a.ai.yaml'), 'x');

    const result = createBackup(project, planFor(['.claude/skills/demo', '.standards/a.ai.yaml']));
    const m = JSON.parse(readFileSync(join(result.backupDir, 'backup-manifest.json'), 'utf8'));

    // The denominator has to be in the file. Without it, a backup covering 74
    // of 129 paths looks exactly like one covering all of them.
    expect(m.coverage).toEqual({ planned: 2, backedUp: 2, failed: 0 });
    expect(m.failedToBackUp).toEqual([]);
    expect(m.backedUpFiles).toContain('.claude/skills/demo');
  });

  it('counts a path that vanished before the copy as not backed up', () => {
    // Negative control: coverage must reflect what is actually in the backup.
    // A `planned === backedUp` that is computed rather than observed would
    // report full coverage for a backup missing a file.
    mkdirSync(join(project, '.standards'), { recursive: true });
    writeFileSync(join(project, '.standards/a.ai.yaml'), 'x');

    const result = createBackup(project, planFor(['.standards/a.ai.yaml', '.standards/gone.ai.yaml']));
    const m = JSON.parse(readFileSync(join(result.backupDir, 'backup-manifest.json'), 'utf8'));

    expect(m.coverage.planned).toBe(2);
    expect(m.coverage.backedUp).toBe(1);
    expect(m.coverage.failed).toBe(1);
  });
});
