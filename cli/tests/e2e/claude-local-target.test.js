/**
 * E2E: --claude-target (XSPEC-418 R2–R4)
 *
 * The scenario this whole feature exists for: a team-owned, version-controlled
 * CLAUDE.md already sits in the repo, and an individual adopting UDS for
 * themselves must not touch it. `--claude-target local` redirects UDS's own
 * content to CLAUDE.local.md instead — check/update/uninstall must all follow
 * that same redirection, and the team's CLAUDE.md must be byte-for-byte
 * untouched through every one of them (R3). `--claude-target` on `uds update`
 * must also be able to move an EXISTING install's target without a reinstall,
 * whether or not the new target already holds a hand-moved block (R4).
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'path';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { execSync } from 'child_process';
import {
  runNonInteractive,
  runCommand,
  createTempDir,
  cleanupTempDir,
  setupTestDir,
  fileExists
} from '../utils/cli-runner.js';

const MANIFEST = '.standards/manifest.json';
const TEAM_CLAUDE_MD = [
  '# Team Project Instructions',
  '',
  'This file is owned by the whole team and lives in version control.',
  'Do not add personal UDS content here.',
  ''
].join('\n');

async function readManifestJson(dir) {
  return JSON.parse(await readFile(join(dir, MANIFEST), 'utf8'));
}

async function readIfExists(path) {
  try {
    return await readFile(path, 'utf8');
  } catch {
    return null;
  }
}

/** Give a repo something for detectAll to recognize as claude-code without
 * writing a real CLAUDE.md (used by the R4 arms, which start from a fresh,
 * default-target install). */
async function markClaudeCodeDetected(dir) {
  await mkdir(join(dir, '.claude'), { recursive: true });
}

describe('E2E: --claude-target (XSPEC-418)', () => {
  let dir;

  beforeEach(async () => {
    dir = await createTempDir();
  });

  afterEach(async () => {
    await cleanupTempDir(dir);
  });

  // ===== R2 + R3: the full user-reported scenario, verbatim flags =====
  it(
    'init --claude-target local leaves a pre-existing team CLAUDE.md byte-for-byte unchanged through check/update/uninstall (AC-2, AC-3)',
    async () => {
      await setupTestDir(dir, { existingFiles: { 'CLAUDE.md': TEAM_CLAUDE_MD } });
      execSync('git init -q', { cwd: dir });

      // The user's original reported command, plus --claude-target local.
      const init = await runNonInteractive(
        {
          mode: 'full',
          format: 'ai',
          workflow: 'gitflow',
          mergeStrategy: 'merge-commit',
          outputLang: 'traditional-chinese',
          lang: 'php',
          framework: 'fat-free',
          locale: 'zh-tw',
          skillsLocation: 'project',
          agentsMd: true,
          claudeTarget: 'local'
        },
        dir,
        180000
      );
      expect(init.exitCode).toBe(0);
      expect(init.stdout + init.stderr).not.toMatch(/completed with errors/);

      // 1. The team's CLAUDE.md is untouched.
      const claudeMdAfterInit = await readIfExists(join(dir, 'CLAUDE.md'));
      expect(claudeMdAfterInit).toBe(TEAM_CLAUDE_MD);

      // 2. UDS content landed in CLAUDE.local.md instead.
      const localMd = await readIfExists(join(dir, 'CLAUDE.local.md'));
      expect(localMd).toBeTruthy();
      expect(localMd).toContain('<!-- UDS:STANDARDS:START -->');

      // 3. Manifest records the override, keyed by tool.
      let manifest = await readManifestJson(dir);
      expect(manifest.integrationTargets).toEqual({ 'claude-code': 'CLAUDE.local.md' });
      expect(manifest.integrations).toContain('CLAUDE.local.md');
      expect(manifest.integrations).not.toContain('CLAUDE.md');
      expect(Object.keys(manifest.integrationBlockHashes || {})).toContain('CLAUDE.local.md');
      expect(Object.keys(manifest.integrationBlockHashes || {})).not.toContain('CLAUDE.md');

      // 4. `uds update --integrations-only` regenerates CLAUDE.local.md only.
      const updateIntOnly = await runCommand('update', { integrationsOnly: true, yes: true }, dir, 60000);
      expect(updateIntOnly.exitCode).toBe(0);
      expect(await readIfExists(join(dir, 'CLAUDE.md'))).toBe(TEAM_CLAUDE_MD);
      expect(await readIfExists(join(dir, 'CLAUDE.local.md'))).toContain('<!-- UDS:STANDARDS:START -->');

      // 5. `uds update --force` (also touches integrations) — still untouched.
      const updateForce = await runCommand('update', { force: true, yes: true }, dir, 60000);
      expect(updateForce.exitCode).toBe(0);
      expect(await readIfExists(join(dir, 'CLAUDE.md'))).toBe(TEAM_CLAUDE_MD);

      // 6. `uds check --ci` passes — R1's stricter verdict must not fire on a
      // healthy local-target install, and R3 means it must be checking
      // CLAUDE.local.md, not reporting CLAUDE.md's markers as removed.
      const check = await runCommand('check', { ci: true, noInteractive: true }, dir, 60000);
      expect(check.exitCode).toBe(0);
      expect(check.stdout).not.toMatch(/CLAUDE\.md.*(missing|removed)/i);

      manifest = await readManifestJson(dir);

      // 7. Orphan cleanup (XSPEC-208 BUG-208-02, run inside `update`) must not
      // have deleted CLAUDE.local.md's own hash for being "unexpected".
      expect(Object.keys(manifest.integrationBlockHashes || {})).toContain('CLAUDE.local.md');

      // 8. `uds uninstall --integrations-only -y` removes the UDS block from
      // CLAUDE.local.md and never touches CLAUDE.md.
      const uninstall = await runCommand('uninstall', { integrationsOnly: true, yes: true }, dir, 60000);
      expect(uninstall.exitCode).toBe(0);
      expect(await readIfExists(join(dir, 'CLAUDE.md'))).toBe(TEAM_CLAUDE_MD);
      const localAfterUninstall = await readIfExists(join(dir, 'CLAUDE.local.md'));
      if (localAfterUninstall !== null) {
        expect(localAfterUninstall).not.toContain('<!-- UDS:STANDARDS:START -->');
      }
    },
    240000
  );

  // ===== AC-5: unspecified --claude-target leaves the manifest shape identical =====
  it('init without --claude-target never writes manifest.integrationTargets (AC-5)', async () => {
    await setupTestDir(dir, {});
    await markClaudeCodeDetected(dir);

    const init = await runNonInteractive({}, dir, 60000);
    expect(init.exitCode).toBe(0);

    const manifest = await readManifestJson(dir);
    expect(manifest.integrationTargets).toBeUndefined();
    expect(await fileExists(join(dir, 'CLAUDE.md'))).toBe(true);
    expect(await fileExists(join(dir, 'CLAUDE.local.md'))).toBe(false);
  }, 60000);

  it('init --claude-target project (explicit default) also never writes manifest.integrationTargets (AC-5)', async () => {
    await setupTestDir(dir, {});
    await markClaudeCodeDetected(dir);

    const init = await runNonInteractive({ claudeTarget: 'project' }, dir, 60000);
    expect(init.exitCode).toBe(0);

    const manifest = await readManifestJson(dir);
    expect(manifest.integrationTargets).toBeUndefined();
  }, 60000);

  // ===== R4: switching an EXISTING install's target =====
  describe('uds update --claude-target (R4)', () => {
    it('arm 1: target does not exist yet — moves the block, keeps team content, no reinstall', async () => {
      await setupTestDir(dir, { existingFiles: { 'CLAUDE.md': TEAM_CLAUDE_MD } });

      const init = await runNonInteractive({}, dir, 60000);
      expect(init.exitCode).toBe(0);
      const claudeMdBefore = await readIfExists(join(dir, 'CLAUDE.md'));
      expect(claudeMdBefore).toContain(TEAM_CLAUDE_MD.trim());
      expect(claudeMdBefore).toContain('<!-- UDS:STANDARDS:START -->');
      expect(await fileExists(join(dir, 'CLAUDE.local.md'))).toBe(false);

      const switchResult = await runCommand('update', { claudeTarget: 'local' }, dir, 60000);
      expect(switchResult.exitCode).toBe(0);

      // Team content survived in CLAUDE.md, UDS block is gone from it.
      const claudeMdAfter = await readIfExists(join(dir, 'CLAUDE.md'));
      expect(claudeMdAfter).toContain(TEAM_CLAUDE_MD.trim());
      expect(claudeMdAfter).not.toContain('<!-- UDS:STANDARDS:START -->');

      // Exactly one fresh block in the new target.
      const localMd = await readIfExists(join(dir, 'CLAUDE.local.md'));
      expect(localMd).toBeTruthy();
      expect((localMd.match(/<!-- UDS:STANDARDS:START -->/g) || []).length).toBe(1);

      const manifest = await readManifestJson(dir);
      expect(manifest.integrationTargets).toEqual({ 'claude-code': 'CLAUDE.local.md' });

      const check = await runCommand('check', { ci: true, noInteractive: true }, dir, 60000);
      expect(check.exitCode).toBe(0);
    }, 120000);

    it('arm 2: target already has a hand-moved block — updates in place, does not duplicate', async () => {
      await setupTestDir(dir, {});
      await markClaudeCodeDetected(dir);

      const init = await runNonInteractive({}, dir, 60000);
      expect(init.exitCode).toBe(0);
      const originalClaudeMd = await readIfExists(join(dir, 'CLAUDE.md'));
      expect(originalClaudeMd).toContain('<!-- UDS:STANDARDS:START -->');

      // Simulate the adopter hand-moving the file (mv CLAUDE.md CLAUDE.local.md).
      await writeFile(join(dir, 'CLAUDE.local.md'), originalClaudeMd, 'utf8');
      await writeFile(join(dir, 'CLAUDE.md'), '', 'utf8'); // left empty by the mv

      const switchResult = await runCommand('update', { claudeTarget: 'local' }, dir, 60000);
      expect(switchResult.exitCode).toBe(0);

      const localMd = await readIfExists(join(dir, 'CLAUDE.local.md'));
      expect((localMd.match(/<!-- UDS:STANDARDS:START -->/g) || []).length).toBe(1);

      const check = await runCommand('check', { ci: true, noInteractive: true }, dir, 60000);
      expect(check.exitCode).toBe(0);
    }, 120000);
  });
});
