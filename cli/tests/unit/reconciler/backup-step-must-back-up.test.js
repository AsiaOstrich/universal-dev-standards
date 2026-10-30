/**
 * A step that writes outside the reconciler can name the files it is about to OVERWRITE (`mustBackUp`), not
 * only the folders it writes into (`paths`). The hook scripts in scripts/hooks/ are named this way (decision 212甲):
 * the backup copies exactly those, `coverage` counts them so a copy that did not happen shows as a gap, and
 * `rollback` puts them back byte for byte. tests/unit/hooks/update-replaces-hook-scripts.test.js drives the
 * same thing through the CLI.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { createStepBackup, finalizeBackup, rollback } from '../../../src/reconciler/backup-manager.js';

const put = (root, rel, text) => {
  mkdirSync(join(root, rel, '..'), { recursive: true });
  writeFileSync(join(root, rel), text);
};
const get = (root, rel) => readFileSync(join(root, rel), 'utf8');

describe('createStepBackup mustBackUp', () => {
  let project;
  beforeEach(() => {
    project = mkdtempSync(join(tmpdir(), 'uds-step-must-'));
    put(project, '.standards/manifest.json', '{"v":"old"}');
    put(project, 'scripts/hooks/a.mjs', 'a-old');
    put(project, 'scripts/hooks/b.mjs', 'b-edited-by-user');
    put(project, 'scripts/hooks/untouched.mjs', 'untouched');
  });
  afterEach(() => rmSync(project, { recursive: true, force: true }));

  it('copies exactly the named files, counts them in coverage, and rollback restores them', () => {
    const b = createStepBackup(project, { label: 'hooks', mustBackUp: ['scripts/hooks/a.mjs', 'scripts/hooks/b.mjs'] });
    expect(b.errors).toEqual([]);
    expect(b.backedUp).toEqual(expect.arrayContaining(['scripts/hooks/a.mjs', 'scripts/hooks/b.mjs']));
    expect(existsSync(join(project, b.backupId, 'scripts/hooks/untouched.mjs')), 'only what will be rewritten is copied').toBe(false);
    const bm = JSON.parse(readFileSync(join(project, b.backupId, 'backup-manifest.json'), 'utf8'));
    expect(bm.coverage).toEqual({ planned: 2, backedUp: 2, failed: 0 });

    writeFileSync(join(project, 'scripts/hooks/a.mjs'), 'a-NEW');
    writeFileSync(join(project, 'scripts/hooks/b.mjs'), 'b-NEW');
    finalizeBackup(project, b.backupId);

    const r = rollback(project, b.backupId);
    expect(r.errors).toEqual([]);
    expect(get(project, 'scripts/hooks/a.mjs')).toBe('a-old');
    expect(get(project, 'scripts/hooks/b.mjs')).toBe('b-edited-by-user');
    expect(get(project, 'scripts/hooks/untouched.mjs')).toBe('untouched');
  });

  it('a named file that does not exist shows as a coverage gap, not as nothing', () => {
    const b = createStepBackup(project, { label: 'hooks', mustBackUp: ['scripts/hooks/a.mjs', 'scripts/hooks/gone.mjs'] });
    const bm = JSON.parse(readFileSync(join(project, b.backupId, 'backup-manifest.json'), 'utf8'));
    expect(bm.coverage).toEqual({ planned: 2, backedUp: 1, failed: 1 });
    expect(b.backedUp).not.toContain('scripts/hooks/gone.mjs');
  });
});
