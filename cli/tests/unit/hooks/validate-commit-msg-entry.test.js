// validate-commit-msg.mjs as Claude Code runs it: a PreToolUse/Bash hook that gets the
// payload on stdin and blocks the tool call ONLY by exiting 2.
//
// validate-commit-msg.test.js calls validateCommitMessage() and commitMessageFrom()
// directly; none of it runs the script, so nothing there would notice if the script's
// own entry point stopped exiting 2 on a bad `git commit -m` (it used to exit 1, which
// Claude Code treats as a non-blocking hook error). scripts/check-hook-entry-tests.mjs
// requires a test of this shape for every hook that can block.
//
// Every case spawns the real script with the stdin shape Claude Code sends and reads
// back the exit code and stderr. CLAUDE_PROJECT_DIR points at an empty directory so the
// allowed commit types are the built-in Conventional Commits set, not this repo's
// installed options.

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const SCRIPT = join(import.meta.dirname, '..', '..', '..', '..', 'scripts', 'hooks', 'validate-commit-msg.mjs');

const BLOCKS = 2;
const ALLOWS = 0;

let projectDir;
beforeAll(() => { projectDir = mkdtempSync(join(tmpdir(), 'uds-vcm-entry-')); });
afterAll(() => { rmSync(projectDir, { recursive: true, force: true }); });

/** Run the hook with `stdin`; returns { status, stderr, stdout }. */
function run({ stdin, argv = [] }) {
  const r = spawnSync(process.execPath, [SCRIPT, ...argv], {
    input: stdin,
    encoding: 'utf8',
    timeout: 10000,
    env: { ...process.env, CLAUDE_PROJECT_DIR: projectDir },
    cwd: projectDir,
  });
  return { status: r.status, stderr: r.stderr, stdout: r.stdout };
}

/** The exact payload shape of a Claude Code PreToolUse call on the Bash tool. */
const payload = (command) =>
  JSON.stringify({ hook_event_name: 'PreToolUse', tool_name: 'Bash', tool_input: { command } });

const callBash = (command) => run({ stdin: payload(command) });

describe('validate-commit-msg as a Claude Code PreToolUse hook', () => {
  describe('blocks with exit 2 (the only code Claude Code treats as a block)', () => {
    const BAD = [
      'git commit -m "bad message"',
      "git commit -m 'fixed stuff'",
      'git -C /tmp/repo commit -m "no type here"',
      'git add . && git commit -m "Update things"',
    ];

    for (const command of BAD) {
      it(`${command}  ->  exit 2, stderr says the format is invalid`, () => {
        const r = callBash(command);
        expect(r.status).toBe(BLOCKS);
        expect(r.stderr).toContain('Invalid commit message format');
        expect(r.stdout).toBe('');
      });
    }
  });

  describe('allows with exit 0', () => {
    const FINE = [
      'git commit -m "feat(core): add hook support"',
      'git commit -m "fix: resolve crash on startup"',
      "git commit -m 'docs(readme): update installation guide'",
      'git status',
      'npm test',
      'echo "git commit -m fake"',
      'git commit -F message.txt',
      // KNOWN GAP, deliberately not asserted as correct: `git commit -am "wip"` is also let
      // through, because commitMessageFrom() only recognises a standalone `-m`. This entry test
      // found it (exit 0 where a bad message should exit 2); fixing the hook is a separate change.
    ];

    for (const command of FINE) {
      it(`${command}  ->  exit 0, silent`, () => {
        const r = callBash(command);
        expect(r.status).toBe(ALLOWS);
        expect(r.stderr).toBe('');
      });
    }
  });

  describe('input that is not a Claude Code payload keeps the git-hook contract (exit 1)', () => {
    it('a raw bad message on stdin exits 1', () => {
      const r = run({ stdin: 'bad message\n' });
      expect(r.status).toBe(1);
      expect(r.stderr).toContain('Invalid commit message format');
    });

    it('a raw good message on stdin exits 0', () => {
      expect(run({ stdin: 'feat: add a thing\n' }).status).toBe(ALLOWS);
    });

    it('a bad message in argv exits 1, a good one exits 0', () => {
      expect(run({ argv: ['bad message'], stdin: '' }).status).toBe(1);
      expect(run({ argv: ['fix: a thing'], stdin: '' }).status).toBe(ALLOWS);
    });

    it('empty stdin allows', () => {
      expect(run({ stdin: '' }).status).toBe(ALLOWS);
    });
  });
});
