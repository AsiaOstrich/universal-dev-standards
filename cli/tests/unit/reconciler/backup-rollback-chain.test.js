/**
 * XSPEC-454 R1 — a rollback has to give back what the update changed, not just the files it overwrote.
 *
 * The old backup recorded only paths a plan said it would update or delete, so a rollback left behind
 * (a) every file the update created, (b) the manifest whose hashes describe the new files, and (c) any
 * step that ran outside the reconciler (`--skills`, `--commands`). These tests drive backup-manager
 * directly; tests/e2e/xspec-454-beta4-windows-report.test.js drives the same thing through the CLI.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync, readdirSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import {
  createBackup,
  createStepBackup,
  finalizeBackup,
  rollback,
  listBackups
} from '../../../src/reconciler/backup-manager.js';

const put = (root, rel, text) => {
  mkdirSync(join(root, rel, '..'), { recursive: true });
  writeFileSync(join(root, rel), text);
};
const get = (root, rel) => readFileSync(join(root, rel), 'utf8');

describe('backup-manager — rollback gives back what the update changed (XSPEC-454 R1)', () => {
  let project;

  beforeEach(() => {
    project = mkdtempSync(join(tmpdir(), 'uds-rollback-chain-'));
    put(project, '.standards/manifest.json', '{"v":"old"}');
    put(project, '.standards/a.ai.yaml', 'a-old');
    put(project, '.claude/skills/demo/SKILL.md', 'demo-old');
    put(project, '.claude/skills/.manifest.json', 'skills-manifest-old');
  });
  afterEach(() => {
    rmSync(project, { recursive: true, force: true });
  });

  const planOf = (actions) => ({ actions, summary: { create: 0, update: 0, delete: 0, unchanged: 0, migrate_block: 0 }, warnings: [] });

  it('removes the files the update created, restores the manifest, and removes the folders that became empty', () => {
    const b = createBackup(project, planOf([
      { type: 'update', category: 'standard', path: '.standards/a.ai.yaml', reason: 't' },
      { type: 'create', category: 'skill', path: '.claude/skills/new-skill', reason: 't' }
    ]));
    expect(b.errors).toEqual([]);

    // the update
    put(project, '.standards/a.ai.yaml', 'a-new');
    put(project, '.standards/manifest.json', '{"v":"new"}');
    put(project, '.claude/skills/new-skill/SKILL.md', 'created');
    put(project, '.claude/skills/new-skill/guide.md', 'created too');
    finalizeBackup(project, b.backupId);

    const r = rollback(project);

    expect(r.success, r.errors.join('\n')).toBe(true);
    expect(get(project, '.standards/a.ai.yaml')).toBe('a-old');
    expect(get(project, '.standards/manifest.json')).toBe('{"v":"old"}');
    expect(existsSync(join(project, '.claude/skills/new-skill'))).toBe(false);
    expect(r.removed.sort()).toEqual(['.claude/skills/new-skill/SKILL.md', '.claude/skills/new-skill/guide.md']);
    // what was already there is untouched
    expect(get(project, '.claude/skills/demo/SKILL.md')).toBe('demo-old');
  });

  it('restores a directory file by file, brings back a deleted file, and leaves a file the user added afterwards alone', () => {
    const b = createBackup(project, planOf([{ type: 'update', category: 'skill', path: '.claude/skills/demo', reason: 't' }]));
    put(project, '.claude/skills/demo/SKILL.md', 'demo-new');
    put(project, '.claude/skills/demo/extra.md', 'created by the update');
    finalizeBackup(project, b.backupId);
    put(project, '.claude/skills/demo/mine.md', 'written by the user after the update');

    const r = rollback(project);

    expect(r.success, r.errors.join('\n')).toBe(true);
    expect(get(project, '.claude/skills/demo/SKILL.md')).toBe('demo-old');
    expect(existsSync(join(project, '.claude/skills/demo/extra.md'))).toBe(false);
    expect(get(project, '.claude/skills/demo/mine.md')).toBe('written by the user after the update');
  });

  it('undoes a series of consecutive steps with one rollback, newest first, and stops where the series is broken', () => {
    // step 1: reconcile
    const b1 = createBackup(project, planOf([{ type: 'update', category: 'standard', path: '.standards/a.ai.yaml', reason: 't' }]));
    put(project, '.standards/a.ai.yaml', 'a-step1');
    put(project, '.standards/manifest.json', '{"v":"step1"}');
    finalizeBackup(project, b1.backupId);

    // step 2: --skills (outside the reconciler)
    const b2 = createStepBackup(project, { label: 'skills', paths: ['.claude/skills'] });
    put(project, '.claude/skills/demo/SKILL.md', 'demo-step2');
    put(project, '.claude/skills/added/SKILL.md', 'added in step 2');
    put(project, '.standards/manifest.json', '{"v":"step2"}');
    finalizeBackup(project, b2.backupId);

    const r = rollback(project);

    expect(r.success, r.errors.join('\n')).toBe(true);
    expect(r.steps.map((s) => s.label)).toEqual(['skills', 'reconcile']);
    expect(get(project, '.standards/a.ai.yaml')).toBe('a-old');
    expect(get(project, '.standards/manifest.json')).toBe('{"v":"old"}');
    expect(get(project, '.claude/skills/demo/SKILL.md')).toBe('demo-old');
    expect(existsSync(join(project, '.claude/skills/added'))).toBe(false);
  });

  it('does not chain across a change UDS did not make, and says how many older backups it left alone', () => {
    const b1 = createBackup(project, planOf([{ type: 'update', category: 'standard', path: '.standards/a.ai.yaml', reason: 't' }]));
    put(project, '.standards/manifest.json', '{"v":"step1"}');
    finalizeBackup(project, b1.backupId);

    // somebody edits the manifest by hand between the two updates
    put(project, '.standards/manifest.json', '{"v":"edited by hand"}');

    const b2 = createStepBackup(project, { label: 'commands', paths: [] });
    put(project, '.standards/manifest.json', '{"v":"step2"}');
    finalizeBackup(project, b2.backupId);

    const r = rollback(project);

    expect(r.steps.map((s) => s.label)).toEqual(['commands']);
    expect(r.olderBackups).toBe(1);
    expect(get(project, '.standards/manifest.json')).toBe('{"v":"edited by hand"}');
  });

  it('reports a backup it cannot read back as an error instead of success', () => {
    const b = createBackup(project, planOf([{ type: 'update', category: 'standard', path: '.standards/a.ai.yaml', reason: 't' }]));
    put(project, '.standards/a.ai.yaml', 'a-new');
    finalizeBackup(project, b.backupId);
    rmSync(join(project, b.backupId, '.standards', 'a.ai.yaml'));

    const r = rollback(project);

    expect(r.success).toBe(false);
    expect(r.errors.join('\n')).toMatch(/Backup file missing: \.standards\/a\.ai\.yaml/);
  });

  it('lists a path outside the project as not restored instead of reaching for it', () => {
    const b = createStepBackup(project, {
      label: 'skills',
      paths: ['.claude/skills'],
      notBackedUp: [{ path: '/home/someone/.claude/skills', reason: 'user-level, shared by every project' }]
    });
    finalizeBackup(project, b.backupId);

    const r = rollback(project);

    expect(r.success).toBe(true);
    expect(r.notRestored.join('\n')).toMatch(/\/home\/someone\/\.claude\/skills — user-level/);
  });

  it('treats an absolute plan path as outside the project rather than joining it onto the project root', () => {
    const b = createBackup(project, planOf([{ type: 'update', category: 'skill', path: '/elsewhere/.claude/skills/demo', reason: 't' }]));
    const bm = JSON.parse(readFileSync(join(project, b.backupId, 'backup-manifest.json'), 'utf8'));
    expect(bm.notBackedUp.map((n) => n.path)).toEqual(['/elsewhere/.claude/skills/demo']);
    expect(readdirSync(join(project, b.backupId)).sort()).toEqual(['.standards', 'backup-manifest.json']);
    // The hiding is done once, by the shared folder (XSPEC-456 R7), not by each backup.
    expect(readFileSync(join(project, '.uds-backups', '.gitignore'), 'utf8')).toBe('*\n');
  });

  it('records the manifest before and after, which is what chains consecutive backups', () => {
    const b = createStepBackup(project, { label: 'skills', paths: ['.claude/skills'] });
    put(project, '.standards/manifest.json', '{"v":"after"}');
    finalizeBackup(project, b.backupId);
    const [info] = listBackups(project);
    expect(info.preManifestHash).toMatch(/^[0-9a-f]{64}$/);
    expect(info.postManifestHash).toMatch(/^[0-9a-f]{64}$/);
    expect(info.postManifestHash).not.toBe(info.preManifestHash);
  });
});
