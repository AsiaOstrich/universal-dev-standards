/**
 * uninstall — behaviour when nobody can answer a prompt, and exit codes.
 *
 * Adopter reports (6.14.0-beta.2, Windows 11 and macOS):
 *
 *   1. `uds uninstall --dry-run` with stdin not a TTY printed the category
 *      checkbox, then died with `ExitPromptError: User force closed the prompt
 *      with 0 null` and a stack trace — and the process exited 0. A dry run has
 *      nothing to ask (it writes nothing), so it must never prompt.
 *   2. `uds uninstall` in a project that was never initialised printed
 *      "not initialized" and exited 0, indistinguishable from success in CI.
 *
 * Decision recorded here, because the reports left it open: with no `--yes` and
 * nothing attached to answer, a REAL run refuses (exit 2, nothing written)
 * instead of assuming "yes". Auto-confirming would give an unattended shell more
 * permission than an interactive one has. `--dry-run` instead lists every
 * category, so an unattended caller can still see what a run would do.
 *
 * "Nobody can answer" is decided by `process.stdin.isTTY`, up front, so the
 * prompt is never drawn — catching ExitPromptError alone (as `uds update` does)
 * still paints the checkbox on the terminal before failing.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { existsSync, mkdirSync, writeFileSync, rmSync, readFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

vi.mock('@inquirer/prompts', () => ({
  select: vi.fn(),
  checkbox: vi.fn(),
  confirm: vi.fn(),
  input: vi.fn(),
  Separator: class Separator { constructor(t) { this.text = t; } }
}));

import { select, checkbox, confirm } from '@inquirer/prompts';
import { uninstallCommand } from '../../src/commands/uninstall.js';
import { computeFileHash } from '../../src/utils/hasher.js';

function setTTY(value) {
  Object.defineProperty(process.stdin, 'isTTY', { value, configurable: true, writable: true });
}

function promptClosedError() {
  const err = new Error('User force closed the prompt with 0 null');
  err.name = 'ExitPromptError';
  return err;
}

describe('uninstall — non-interactive behaviour and exit codes', () => {
  let testDir;
  let originalCwd;
  let originalIsTTY;
  let out;

  const printed = () => out.mock.calls.map((c) => c.join(' ')).join('\n');

  beforeEach(() => {
    testDir = join(tmpdir(), `uds-test-uninstall-ni-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    mkdirSync(testDir, { recursive: true });
    originalCwd = process.cwd();
    process.chdir(testDir);
    originalIsTTY = process.stdin.isTTY;
    process.exitCode = undefined;
    out = vi.spyOn(console, 'log').mockImplementation(() => {});
    checkbox.mockReset();
    confirm.mockReset();
    select.mockReset();
  });

  afterEach(() => {
    process.chdir(originalCwd);
    setTTY(originalIsTTY);
    // vitest reads process.exitCode of the worker; a leaked non-zero value would
    // fail the whole run for a reason unrelated to the test that set it.
    process.exitCode = undefined;
    rmSync(testDir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  function installUds() {
    mkdirSync(join(testDir, '.standards'), { recursive: true });
    writeFileSync(join(testDir, '.standards', 'commit-message.ai.yaml'), 'content');
    writeFileSync(join(testDir, 'CLAUDE.md'), '<!-- UDS:STANDARDS:START -->\n## Standards\n<!-- UDS:STANDARDS:END -->\n');
    mkdirSync(join(testDir, '.husky'), { recursive: true });
    writeFileSync(join(testDir, '.husky', 'pre-commit'), '#!/bin/sh\nnpx uds check\nnpm test\n');
    writeFileSync(join(testDir, '.standards', 'manifest.json'), JSON.stringify({
      version: '3.3.0',
      upstream: { repo: 'test', version: '1.0.0', installed: new Date().toISOString() },
      format: 'ai', contentMode: 'index', standards: ['commit-message.ai.yaml'], extensions: [],
      integrations: ['CLAUDE.md'], integrationConfigs: {}, options: {}, aiTools: ['claude-code'],
      skills: { installed: false, location: 'project', names: [], version: null, installations: [] },
      commands: { installed: false, names: [], version: null, installations: [] },
      methodology: null, fileHashes: { '.standards/commit-message.ai.yaml': computeFileHash(join(testDir, '.standards', 'commit-message.ai.yaml')) }, skillHashes: {}, commandHashes: {}, integrationBlockHashes: {}
    }, null, 2));
  }

  const untouched = () =>
    existsSync(join(testDir, '.standards')) &&
    existsSync(join(testDir, 'CLAUDE.md')) &&
    readFileSync(join(testDir, '.husky', 'pre-commit'), 'utf-8').includes('uds check');

  describe('--dry-run', () => {
    it('never prompts when nothing is attached to answer, lists every category, exits 0', async () => {
      installUds();
      setTTY(false);

      await uninstallCommand({ dryRun: true });

      expect(checkbox).not.toHaveBeenCalled();
      expect(confirm).not.toHaveBeenCalled();
      expect(select).not.toHaveBeenCalled();
      // Every category is previewed — the point of a dry run is to show the full plan.
      const text = printed();
      expect(text).toContain('.standards/');
      expect(text).toContain('CLAUDE.md');
      expect(text).toContain('.husky/pre-commit');
      expect(untouched()).toBe(true);
      expect(process.exitCode ?? 0).toBe(0);
    });

    it('does not prompt on a terminal either — it writes nothing, so there is nothing to ask', async () => {
      installUds();
      setTTY(true);

      await uninstallCommand({ dryRun: true });

      expect(checkbox).not.toHaveBeenCalled();
      expect(confirm).not.toHaveBeenCalled();
      expect(untouched()).toBe(true);
    });
  });

  describe('a real run with nobody to answer and no --yes', () => {
    it('refuses without drawing a prompt: exit code 2, nothing changed, says how to proceed', async () => {
      installUds();
      setTTY(false);

      await uninstallCommand({});

      expect(checkbox).not.toHaveBeenCalled();
      expect(confirm).not.toHaveBeenCalled();
      expect(process.exitCode).toBe(2);
      expect(untouched()).toBe(true);
      expect(printed()).toContain('--yes');
    });

    it('also refuses when categories are chosen by flag but the confirmation cannot be asked', async () => {
      installUds();
      setTTY(false);

      await uninstallCommand({ standardsOnly: true });

      expect(confirm).not.toHaveBeenCalled();
      expect(process.exitCode).toBe(2);
      expect(existsSync(join(testDir, '.standards'))).toBe(true);
    });

    it('--yes still works without a terminal (that is what it is for)', async () => {
      installUds();
      setTTY(false);

      await uninstallCommand({ yes: true });

      expect(existsSync(join(testDir, '.standards'))).toBe(false);
      expect(process.exitCode ?? 0).toBe(0);
    });
  });

  describe('a prompt that is closed or fails', () => {
    it('a closed category prompt ends with a non-zero code and no stack trace, nothing changed', async () => {
      installUds();
      setTTY(true);
      checkbox.mockRejectedValueOnce(promptClosedError());

      await expect(uninstallCommand({})).resolves.toBeUndefined();

      expect(process.exitCode).not.toBe(0);
      expect(process.exitCode).toBeDefined();
      expect(untouched()).toBe(true);
    });

    it('a closed confirmation prompt ends with a non-zero code, nothing changed', async () => {
      installUds();
      setTTY(true);
      checkbox.mockResolvedValueOnce(['standards', 'integrations', 'hooks']);
      confirm.mockRejectedValueOnce(promptClosedError());

      await expect(uninstallCommand({})).resolves.toBeUndefined();

      // toBeDefined first: `undefined` is "not 0" too, and is exactly what a run that forgot to set a code leaves.
      expect(process.exitCode).toBeDefined();
      expect(process.exitCode).not.toBe(0);
      expect(untouched()).toBe(true);
    });

    it('an error that is not "the prompt was closed" is not swallowed', async () => {
      installUds();
      setTTY(true);
      checkbox.mockRejectedValueOnce(new Error('boom'));

      await expect(uninstallCommand({})).rejects.toThrow('boom');
    });
  });

  describe('a project that was never initialised', () => {
    it('exits non-zero, so CI can tell it from a completed uninstall', async () => {
      await uninstallCommand({ yes: true });

      expect(printed()).toContain('not initialized');
      expect(process.exitCode).toBe(1);
    });

    it('--dry-run in an uninitialised project is not a success either', async () => {
      await uninstallCommand({ dryRun: true });

      expect(process.exitCode).toBe(1);
    });
  });
});
