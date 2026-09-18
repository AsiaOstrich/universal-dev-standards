/**
 * E2E: integration files are tracked by their UDS block, not their whole
 * content (XSPEC-418 R6).
 *
 * Two real defects, both reproduced by hand in a scratch repo before this fix
 * (2026-09-18):
 *
 * 1. `uds update --integrations-only` wrote a whole-file hash for CLAUDE.md
 *    into `manifest.fileHashes` (a fresh `uds init` never did). Once that
 *    entry existed, ANY edit outside the UDS block — exactly the
 *    customization the marker-based update is supposed to preserve — made
 *    `uds check --ci` report "CLAUDE.md (modified)" and exit 1, while the
 *    SAME run's block-integrity check said the block was intact.
 * 2. `uds check --restore` regenerated the UDS block (correctly preserving
 *    content outside it) but only refreshed the whole-file hash, never the
 *    block hash — so the very next `uds check` reported "UDS block modified"
 *    for a block that had just been correctly restored.
 *
 * Two more gaps, found by main-session review of the first version of this
 * fix (2026-09-18) and closed here:
 *
 * 3. (gap 1) `check --restore` is driven entirely by `fileStatus` — built
 *    from `manifest.fileHashes` — and integration files are no longer in
 *    there at all (that is the whole point of defect 1's fix). So a UDS
 *    block reported as "modified" or "UDS markers removed" was invisible to
 *    `--restore`, which regenerated zero files and printed "Restored 0
 *    file(s)" while the damaged block sat untouched. The first version of
 *    this test suite injected a stale `fileHashes.CLAUDE.md` entry to make
 *    `--restore` reach the file via the OLD path, which accidentally masked
 *    this gap — reachability was never actually exercised through the block
 *    check on its own. See "R6 gap 1" below, which does not inject that
 *    entry.
 * 4. (gap 2) The pruning added for defect 1 only runs on a WRITE (`uds
 *    update`, `check --restore`, `check --migrate`). A project whose manifest
 *    already carries a stale `fileHashes.CLAUDE.md` entry (any manifest
 *    written before this fix existed) stayed red on `uds check --ci` forever
 *    — a plain, read-only `check` never had a chance to clean it up. See "R6
 *    gap 2" below.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'path';
import { mkdir, readFile, writeFile } from 'fs/promises';
import {
  runNonInteractive,
  runCommand,
  createTempDir,
  cleanupTempDir,
  setupTestDir
} from '../utils/cli-runner.js';
import { computeFileHash, computeIntegrationBlockHash } from '../../src/utils/hasher.js';

const MANIFEST = '.standards/manifest.json';
const START_MARKER = '<!-- UDS:STANDARDS:START -->';

async function readManifestJson(dir) {
  return JSON.parse(await readFile(join(dir, MANIFEST), 'utf8'));
}

async function writeManifestJson(dir, manifest) {
  await writeFile(join(dir, MANIFEST), JSON.stringify(manifest, null, 2), 'utf8');
}

/** Give a repo something for detectAll to recognize as claude-code so a bare
 * `uds init` (no pre-existing CLAUDE.md) still selects it. */
async function markClaudeCodeDetected(dir) {
  await mkdir(join(dir, '.claude'), { recursive: true });
}

describe('E2E: integration files tracked by block, not whole file (XSPEC-418 R6)', () => {
  let dir;

  beforeEach(async () => {
    dir = await createTempDir();
  });

  afterEach(async () => {
    await cleanupTempDir(dir);
  });

  it('R6 Scenario 1: content added outside the UDS block after `update --integrations-only` does not fail `check --ci` (AC-7)', async () => {
    await setupTestDir(dir, {});
    await markClaudeCodeDetected(dir);

    const init = await runNonInteractive({}, dir, 60000);
    expect(init.exitCode).toBe(0);

    // A fresh init never tracked CLAUDE.md by whole file — this was already
    // true before the fix (the bug needed a regeneration to trigger).
    let manifest = await readManifestJson(dir);
    expect(manifest.fileHashes?.['CLAUDE.md']).toBeUndefined();
    expect(manifest.integrationBlockHashes?.['CLAUDE.md']).toBeTruthy();

    // This is the actual repro step: regenerate the integration file.
    const update = await runCommand('update', { integrationsOnly: true, yes: true }, dir, 60000);
    expect(update.exitCode).toBe(0);

    manifest = await readManifestJson(dir);
    expect(manifest.fileHashes?.['CLAUDE.md']).toBeUndefined();
    expect(manifest.integrationBlockHashes?.['CLAUDE.md']).toBeTruthy();

    // Add content OUTSIDE the UDS block — exactly the customization the
    // marker-based update preserves.
    const claudePath = join(dir, 'CLAUDE.md');
    const original = await readFile(claudePath, 'utf8');
    await writeFile(claudePath, `${original}\n\n## My own notes\nSomething I wrote myself.\n`, 'utf8');

    const check = await runCommand('check', { ci: true, noInteractive: true }, dir, 60000);
    expect(check.exitCode).toBe(0);
    expect(check.stdout).not.toMatch(/CLAUDE\.md[^\n]*modified/i);
  }, 120000);

  it('R6 Scenario 3: a pre-existing whole-file fileHashes.CLAUDE.md entry (legacy/pre-fix manifest) is removed by the next `update`, block hash kept (AC-7)', async () => {
    await setupTestDir(dir, {});
    await markClaudeCodeDetected(dir);

    const init = await runNonInteractive({}, dir, 60000);
    expect(init.exitCode).toBe(0);

    // Simulate a manifest a pre-R6 CLI left behind.
    const claudePath = join(dir, 'CLAUDE.md');
    let manifest = await readManifestJson(dir);
    manifest.fileHashes = {
      ...(manifest.fileHashes || {}),
      'CLAUDE.md': { ...computeFileHash(claudePath), installedAt: new Date().toISOString() }
    };
    await writeManifestJson(dir, manifest);

    const update = await runCommand('update', { integrationsOnly: true, yes: true }, dir, 60000);
    expect(update.exitCode).toBe(0);

    manifest = await readManifestJson(dir);
    expect(manifest.fileHashes?.['CLAUDE.md']).toBeUndefined();
    // Block hash is kept (regenerated fresh by `--integrations-only`, as it
    // always is — R6 does not change that), and matches the file on disk.
    expect(manifest.integrationBlockHashes?.['CLAUDE.md']?.blockHash).toBeTruthy();

    const check = await runCommand('check', { ci: true, noInteractive: true }, dir, 60000);
    expect(check.exitCode).toBe(0);
  }, 120000);

  it('R6 Scenario 2: `check --restore` refreshes the BLOCK hash after rewriting the block; content outside it survives byte-for-byte (AC-7)', async () => {
    await setupTestDir(dir, {});
    await markClaudeCodeDetected(dir);

    const init = await runNonInteractive({}, dir, 60000);
    expect(init.exitCode).toBe(0);

    const claudePath = join(dir, 'CLAUDE.md');
    const original = await readFile(claudePath, 'utf8');

    // Legacy manifest state (R6 bug #1) — not required for `--restore` to
    // reach CLAUDE.md any more (gap 1 below fixed that independently of
    // fileHashes), but kept here to also exercise the "old-shaped manifest"
    // arm: a whole-file entry alongside a genuinely corrupted block.
    let manifest = await readManifestJson(dir);
    manifest.fileHashes = {
      ...(manifest.fileHashes || {}),
      'CLAUDE.md': { ...computeFileHash(claudePath), installedAt: new Date().toISOString() }
    };
    // Deliberately wrong stored block hash — regenerating the SAME config
    // reproduces byte-identical content, so a real drift wouldn't reliably
    // distinguish "restore refreshed the block hash" from "restore never
    // touched it and it happened to already match." Injecting a sentinel that
    // is provably wrong makes the assertion below unambiguous: after restore,
    // it must no longer be this value.
    const WRONG_SENTINEL = 'sha256:deliberately-wrong-must-be-replaced-by-restore';
    manifest.integrationBlockHashes['CLAUDE.md'] = {
      ...manifest.integrationBlockHashes['CLAUDE.md'],
      blockHash: WRONG_SENTINEL
    };
    await writeManifestJson(dir, manifest);

    // GIVEN: the UDS block itself was hand-edited, AND the adopter separately
    // wrote something outside it that must survive the restore.
    const outsideContent = '## My own notes\nSomething I wrote myself.';
    const corrupted = original.replace(
      START_MARKER,
      `${START_MARKER}\nHAND-EDITED CONTENT THAT MUST NOT SURVIVE RESTORE.`
    ) + `\n\n${outsideContent}\n`;
    await writeFile(claudePath, corrupted, 'utf8');

    const restore = await runCommand('check', { restore: true, noInteractive: true }, dir, 60000);
    expect(restore.exitCode).toBe(0);
    expect(restore.stdout).toMatch(/CLAUDE\.md/);

    // Restore rewrote the block (hand edit gone) and kept the outside content.
    const afterRestore = await readFile(claudePath, 'utf8');
    expect(afterRestore).not.toContain('HAND-EDITED CONTENT THAT MUST NOT SURVIVE RESTORE');
    expect(afterRestore).toContain(outsideContent);

    manifest = await readManifestJson(dir);
    expect(manifest.fileHashes?.['CLAUDE.md']).toBeUndefined();

    // The actual R6 bug #2 assertion: restore must refresh the stored BLOCK
    // hash to match what it just wrote — not leave the stale (here,
    // deliberately wrong) value in place.
    expect(manifest.integrationBlockHashes?.['CLAUDE.md']?.blockHash).not.toBe(WRONG_SENTINEL);
    const freshBlockHash = computeIntegrationBlockHash(claudePath);
    expect(manifest.integrationBlockHashes['CLAUDE.md'].blockHash).toBe(freshBlockHash.blockHash);

    // ...and the very next check must not report it modified again despite
    // having just been correctly restored.
    const check = await runCommand('check', { ci: true, noInteractive: true }, dir, 60000);
    expect(check.exitCode).toBe(0);
    expect(check.stdout).not.toMatch(/CLAUDE\.md[^\n]*(modified|UDS block)/i);
  }, 120000);

  it('R6 gap 1: `check --restore` regenerates a UDS block reported as modified, through the full CLI flow, with NO fileHashes entry involved', async () => {
    await setupTestDir(dir, {});
    await markClaudeCodeDetected(dir);

    const init = await runNonInteractive({}, dir, 60000);
    expect(init.exitCode).toBe(0);

    const update = await runCommand('update', { integrationsOnly: true, yes: true }, dir, 60000);
    expect(update.exitCode).toBe(0);

    // Exactly the coordinator's repro: insert a line INSIDE the UDS block.
    const claudePath = join(dir, 'CLAUDE.md');
    const content = await readFile(claudePath, 'utf8');
    const corrupted = content.replace(START_MARKER, `${START_MARKER}\nHAND-EDITED LINE INSIDE THE BLOCK.`);
    await writeFile(claudePath, corrupted, 'utf8');

    // Confirm nothing is tracking this file by whole-file hash going in —
    // this restore can only work through the block-status path (gap 1).
    let manifest = await readManifestJson(dir);
    expect(manifest.fileHashes?.['CLAUDE.md']).toBeUndefined();

    const preCheck = await runCommand('check', { ci: true, noInteractive: true }, dir, 60000);
    expect(preCheck.exitCode).toBe(1);
    expect(preCheck.stdout).toMatch(/CLAUDE\.md[^\n]*UDS block modified/);

    const restore = await runCommand('check', { restore: true, noInteractive: true }, dir, 60000);
    expect(restore.exitCode).toBe(0);
    expect(restore.stdout).not.toMatch(/Restored 0 file/);

    const afterRestore = await readFile(claudePath, 'utf8');
    expect(afterRestore).not.toContain('HAND-EDITED LINE INSIDE THE BLOCK');

    const postCheck = await runCommand('check', { ci: true, noInteractive: true }, dir, 60000);
    expect(postCheck.exitCode).toBe(0);
    expect(postCheck.stdout).not.toMatch(/CLAUDE\.md[^\n]*(modified|UDS block)/i);
  }, 180000);

  it('R6 gap 2: `check --ci` does not report a pre-existing fileHashes.CLAUDE.md entry as modified, without needing a prior `update` (read-time skip, manifest untouched)', async () => {
    await setupTestDir(dir, {});
    await markClaudeCodeDetected(dir);

    const init = await runNonInteractive({}, dir, 60000);
    expect(init.exitCode).toBe(0);

    // Simulate an existing (pre-R6) manifest — inject the stale entry WITHOUT
    // ever running `update`, so the write-side prune never gets a chance to
    // run. This is the exact shape a real adopter manifest was found in.
    const claudePath = join(dir, 'CLAUDE.md');
    let manifest = await readManifestJson(dir);
    manifest.fileHashes = {
      ...(manifest.fileHashes || {}),
      'CLAUDE.md': { ...computeFileHash(claudePath), installedAt: new Date().toISOString() }
    };
    await writeManifestJson(dir, manifest);

    // Content outside the block, same customization as Scenario 1.
    const original = await readFile(claudePath, 'utf8');
    await writeFile(claudePath, `${original}\n\n## My own notes\nSomething I wrote myself.\n`, 'utf8');

    const check = await runCommand('check', { ci: true, noInteractive: true }, dir, 60000);
    expect(check.exitCode).toBe(0);
    expect(check.stdout).not.toMatch(/CLAUDE\.md[^\n]*modified/i);

    // Read-time skip only — a plain `check` must not write the manifest.
    const manifestAfter = await readManifestJson(dir);
    expect(manifestAfter.fileHashes?.['CLAUDE.md']).toBeTruthy();
  }, 120000);
});
