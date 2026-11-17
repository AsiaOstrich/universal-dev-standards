/**
 * E2E: XSPEC-357 R8 compatibility matrix, cell 4: a violation of what was installed is detected.
 *
 * This file is PARTIAL evidence for cell 4, and the matrix records the cell as not verified for that reason. What
 * XSPEC-357 R8 AC-8.4 asks for is that a violation of an installed standard, its own example being a malformed commit
 * message, is caught by UDS itself, the same way for every tool. What exists today:
 *   - `uds check --ci` (the native pre-commit hook `uds init` writes runs it): catches an edited installed standard
 *     and a deleted UDS block in a tool's rules file, for every tool. It does NOT look at commit messages.
 *   - `uds simulate -s commit-message -i <message>`: judges a message against the installed standard, but only when
 *     someone runs it. Nothing runs it on `git commit` by default.
 *   - the PreToolUse hook that `uds init --with-hooks` wires for Claude Code: refuses a commit with a malformed
 *     message. Claude Code only, and off unless asked for.
 * So "a malformed commit message is refused at commit time" holds for one tool behind one opt-in flag, not for the
 * others: `uds init` installs no git commit-msg hook. The cases below pin exactly that, so the cell can be flipped the
 * day a default entry exists, or when it is decided that the integrity check alone counts.
 *
 * The first block runs the same violation over three differently-tooled projects (Cursor, Claude Code, Codex): the
 * checks belong to UDS, not to an AI tool, so they must judge them the same way.
 *
 * Each case does what an adopter's project does: set up by the real `uds init --yes`, make a change that breaks what
 * was installed, run the entry UDS gives for it, read back the verdict (exit code and the line naming the problem).
 * Every violation has a control: the same project, untouched, is judged compliant. Without the control a check that
 * fails for any reason at all would pass these tests.
 *
 * Wires that make these red when cut (one line of CLI source each; see the report for the measured run):
 *   cli/src/commands/check.js                    fileStatus.modified.length === 0 &&   (verdict ignores an edited standard)
 *   cli/src/commands/check.js                    integrationBlockStatus.noMarkers.length === 0 &&
 *   cli/src/commands/check.js                    process.exitCode = 1;                 (--ci never fails)
 *   cli/src/utils/commit-message-judge.js        the header-format verdict of the judge
 *   cli/src/installers/hooks-installer.js        settings.hooks[event] = mergeHookArray(...)   (the hook is never registered)
 *   scripts/hooks/validate-commit-msg.mjs        the exit-2 block
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join, dirname } from 'path';
import { spawnSync } from 'child_process';
import { readFile, writeFile, mkdir } from 'fs/promises';
import {
  runNonInteractive,
  runCommand,
  createTempDir,
  cleanupTempDir,
  setupTestDir
} from '../utils/cli-runner.js';

const STANDARD = '.standards/commit-message.ai.yaml';
const BAD_MESSAGE = 'fixed stuff';
const GOOD_MESSAGE = 'feat(auth): add token refresh. 新增 token 更新。';

/** A project of an adopter of one tool: the tool's own rules file is already there with a line of theirs. */
const PROJECTS = [
  { tool: 'cursor', file: '.cursorrules' },
  { tool: 'claude-code', file: 'CLAUDE.md' },
  { tool: 'codex', file: 'AGENTS.md' }
];

async function initProject(dir, files, extraOptions = {}) {
  await setupTestDir(dir, {});
  for (const rel of files) {
    const full = join(dir, rel);
    await mkdir(dirname(full), { recursive: true });
    await writeFile(full, 'MY OWN TEAM RULE: keep this line\n');
  }
  const init = await runNonInteractive(extraOptions, dir, 120000);
  expect(init.timedOut, 'uds init did not finish').toBe(false);
  expect(init.exitCode, `uds init failed:\n${init.stdout}\n${init.stderr}`).toBe(0);
}

const check = (dir) => runCommand('check', { ci: true, offline: true }, dir, 120000);

describe('XSPEC-357 R8 matrix cell 4, part one: `uds check --ci` detects a broken install, whichever tool the project uses', () => {
  let dir;

  beforeEach(async () => {
    dir = await createTempDir();
  });

  afterEach(async () => {
    await cleanupTempDir(dir);
  });

  describe.each(PROJECTS)('project of a $tool adopter using $file', ({ file }) => {
    it('control: the freshly installed project is judged compliant and exits 0', async () => {
      await initProject(dir, [file]);

      const result = await check(dir);

      expect(result.exitCode, `${result.stdout}\n${result.stderr}`).toBe(0);
      expect(result.stdout).toContain('Project is compliant with standards');
    }, 120000);

    it('an installed standard was edited by hand: exits 1 and names the file', async () => {
      await initProject(dir, [file]);
      const standardPath = join(dir, STANDARD);
      await writeFile(standardPath, `${await readFile(standardPath, 'utf8')}\n# loosened by hand\n`);

      const result = await check(dir);

      expect(result.exitCode, result.stdout).toBe(1);
      expect(result.stdout, 'the report names the edited file and says it was modified').toMatch(/commit-message\.ai\.yaml \(modified\)/);
      expect(result.stdout).not.toContain('Project is compliant with standards');
    }, 120000);

    it(`the UDS block was deleted from ${file}: exits 1 and names the file`, async () => {
      await initProject(dir, [file]);
      expect(await readFile(join(dir, file), 'utf8'), 'fixture: init wrote the block').toMatch(/UDS:STANDARDS:START/);
      await writeFile(join(dir, file), 'MY OWN TEAM RULE: keep this line\n');

      const result = await check(dir);

      expect(result.exitCode, result.stdout).toBe(1);
      expect(result.stdout, 'the report names the file whose block is gone').toContain(`${file} (UDS markers removed)`);
    }, 120000);
  });
});

describe('XSPEC-357 R8 matrix cell 4, part two: a malformed commit message is judged against the installed commit-message standard', () => {
  let dir;

  beforeEach(async () => {
    dir = await createTempDir();
  });

  afterEach(async () => {
    await cleanupTempDir(dir);
  });

  it('`uds simulate -s commit-message` fails a malformed message with exit 1 and says why, and passes a well-formed one with exit 0', async () => {
    await initProject(dir, ['.cursorrules']);

    const bad = await runCommand('simulate', { standard: 'commit-message', input: BAD_MESSAGE }, dir, 60000);
    const good = await runCommand('simulate', { standard: 'commit-message', input: GOOD_MESSAGE }, dir, 60000);

    expect(bad.exitCode, bad.stdout).toBe(1);
    expect(bad.stdout).toContain('Simulation Failed');
    expect(bad.stdout, 'it says what is wrong with the first line').toContain('The first line is not in the form <type>(<scope>): <subject>');
    expect(good.exitCode, good.stdout).toBe(0);
    expect(good.stdout).toContain('Simulation Passed');
  }, 120000);

  describe('the commit-time hook that `uds init --with-hooks` wires, for Claude Code only and off unless asked for', () => {
    /** The command init registered for the commit-message validator, read from the settings file Claude Code reads. */
    async function registeredValidatorCommand(root) {
      const settings = JSON.parse(await readFile(join(root, '.claude/settings.json'), 'utf8'));
      const entries = settings.hooks?.PreToolUse ?? [];
      const hit = entries.find((e) => e.matcher === 'Bash' && e.hooks?.some((h) => /validate-commit-msg\.mjs/.test(h.command)));
      return hit?.hooks.find((h) => /validate-commit-msg\.mjs/.test(h.command)).command;
    }

    /** Run that registered command the way Claude Code does: payload on stdin, project as the working directory. */
    function runRegistered(command, root, message) {
      const [, scriptRel] = command.split(' '); // "node scripts/hooks/validate-commit-msg.mjs"
      const payload = JSON.stringify({ hook_event_name: 'PreToolUse', tool_name: 'Bash', tool_input: { command: `git commit -m "${message}"` } });
      return spawnSync(process.execPath, [join(root, ...scriptRel.split('/'))], {
        input: payload,
        encoding: 'utf8',
        cwd: root,
        timeout: 20000,
        env: { ...process.env, CLAUDE_PROJECT_DIR: root }
      });
    }

    it('control: without --with-hooks nothing is registered, so no commit is judged at commit time', async () => {
      await initProject(dir, ['CLAUDE.md']);

      expect(await registeredValidatorCommand(dir).catch(() => undefined), 'no validator is wired by default').toBeUndefined();
    }, 120000);

    it('the registered validator refuses a malformed message with exit 2 and says why, and lets a well-formed one through', async () => {
      await initProject(dir, ['CLAUDE.md'], { withHooks: true });

      const command = await registeredValidatorCommand(dir);
      expect(command, 'init --with-hooks registered a PreToolUse/Bash hook for the commit-message validator').toBe('node scripts/hooks/validate-commit-msg.mjs');

      const bad = runRegistered(command, dir, BAD_MESSAGE);
      expect(bad.status, `${bad.stdout}\n${bad.stderr}`).toBe(2);
      expect(bad.stderr, 'it tells the author what the format is').toMatch(/<type>\(<scope>\): <subject>/);

      const good = runRegistered(command, dir, GOOD_MESSAGE);
      expect(good.status, `${good.stdout}\n${good.stderr}`).toBe(0);
    }, 120000);
  });
});
