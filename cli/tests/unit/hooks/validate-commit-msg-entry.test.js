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

  // Every way git takes a message on the command line. `wip` is the bad message, and the stderr line must
  // quote it back: that shows the hook extracted the right text, not merely that it blocked something.
  describe('blocks a bad message however git is given it', () => {
    const FORMS = [
      ['combined short flags ending in m', 'git commit -am "wip"'],
      ['three combined short flags', 'git commit -vam wip'],
      ['another combined flag set', 'git commit -sam "wip"'],
      ['-m with the value attached (quoted)', 'git commit -m"wip"'],
      ['-m with the value attached (bare)', 'git commit -mwip'],
      ['combined flags with the value attached', 'git commit -am"wip"'],
      ['--message=value', 'git commit --message=wip'],
      ['--message value', 'git commit --message wip'],
      ['an abbreviated long option, as git accepts', 'git commit --mess=wip'],
      ['a value that begins with a dash', 'git commit -m -wip'],
      ['options with their own values before it', 'git commit --author "A B <a@b.c>" -am wip'],
      ['environment variables in front', 'GIT_AUTHOR_NAME=x git commit -m wip'],
      ['the second commit of a chain', 'git commit -m "feat: ok" && git commit -m wip'],
      ['single quotes, where $ is literal text', "git commit -m 'wip $HOME'"],
      ['a heredoc body', "git commit -m \"$(cat <<'EOF'\nwip, don't\nEOF\n)\""],
    ];

    for (const [form, command] of FORMS) {
      it(`${form}: ${JSON.stringify(command)}  ->  exit 2, quotes the message`, () => {
        const r = callBash(command);
        expect(r.status).toBe(BLOCKS);
        expect(r.stderr).toMatch(/Invalid commit message format: "-?wip\b/);
        expect(r.stdout).toBe('');
      });
    }

    it('several -m: the first one is the subject, so a bad subject blocks even with a good body', () => {
      const r = callBash('git commit -m "wip" -m "feat: this is the body"');
      expect(r.status).toBe(BLOCKS);
      expect(r.stderr).toContain('Invalid commit message format: "wip\n\nfeat: this is the body"');
    });
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
    ];

    for (const command of FINE) {
      it(`${command}  ->  exit 0, silent`, () => {
        const r = callBash(command);
        expect(r.status).toBe(ALLOWS);
        expect(r.stderr).toBe('');
      });
    }
  });

  describe('allows a good message however git is given it', () => {
    const FORMS = [
      ['combined short flags ending in m', 'git commit -am "feat(core): add hook support"'],
      ['three combined short flags', 'git commit -vam "fix: resolve crash"'],
      ['another combined flag set', 'git commit -sam "docs: update guide"'],
      ['-m with the value attached (quoted)', 'git commit -m"fix: resolve crash"'],
      ['-m with the value attached (bare)', 'git commit -mfix:\\ crash'],
      ['--message=value', 'git commit --message="feat: add hook support"'],
      ['--message value', 'git commit --message "feat: add hook support"'],
      ['an abbreviated long option', 'git commit --mess="fix: resolve crash"'],
      ['options with their own values before it', 'git commit --author "A B <a@b.c>" -am "fix: resolve crash"'],
      ['environment variables in front', 'GIT_AUTHOR_NAME=x git commit -m "fix: resolve crash"'],
      ['several -m: the subject is good, the body may be anything', 'git commit -m "fix: resolve crash" -m "wip notes"'],
      ['; && | and a newline inside the quotes are message text', 'git commit -m "feat: a; b && c | d\ne"'],
      ['escaped quotes inside the message', 'git commit -m "fix: say \\"hi\\""'],
      ['a chain where every commit is good', 'git commit -m "fix: a" && git commit -am "feat: b"'],
      ['a heredoc body (the form Claude Code writes most)', "git commit -m \"$(cat <<'EOF'\nfeat(core): add hook support\n\nBody that doesn't parse as shell.\nEOF\n)\""],
    ];

    for (const [form, command] of FORMS) {
      it(`${form}: ${JSON.stringify(command)}  ->  exit 0, silent`, () => {
        const r = callBash(command);
        expect(r.status).toBe(ALLOWS);
        expect(r.stderr).toBe('');
      });
    }
  });

  // No message text on the command line means nothing to judge, so the hook stays out of the way.
  describe('allows a commit whose message is not in the command', () => {
    const NOT_JUDGEABLE = [
      ['a message file', 'git commit -F message.txt'],
      ['a message file after combined flags', 'git commit -aF message.txt'],
      ['a message from stdin', 'git commit -F -'],
      ['--file=', 'git commit --file=message.txt'],
      ['reusing a commit message', 'git commit -C HEAD'],
      ['reusing and editing one', 'git commit -c HEAD'],
      ['--reuse-message', 'git commit --reuse-message=HEAD'],
      ['--amend --no-edit', 'git commit --amend --no-edit'],
      ['the editor', 'git commit'],
      ['--fixup (git writes the "fixup!" subject; -m becomes the body)', 'git commit --fixup HEAD -m wip'],
      ['--squash (same)', 'git commit --squash=HEAD -m wip'],
      ['a message the shell computes', 'git commit -m "$MSG"'],
      ['a command substitution', 'git commit -m "$(date)"'],
      ['a message after the end of options is a pathspec', 'git commit -- -m wip'],
      ['a commit in an unterminated quote (the shell would not run it)', 'git commit -m "wip'],
    ];

    for (const [form, command] of NOT_JUDGEABLE) {
      it(`${form}: ${command}  ->  exit 0, silent`, () => {
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
