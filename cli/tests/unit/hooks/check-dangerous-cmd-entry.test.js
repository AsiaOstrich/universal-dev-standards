// check-dangerous-cmd.mjs as Claude Code runs it: a PreToolUse/Bash hook that gets the
// payload on stdin and blocks the tool call ONLY by exiting 2.
//
// Measured 2026-10-27 on 11,617 real shell calls: the hook exited 1 (a non-blocking hook
// error, so the command ran anyway), matched the whole stdin JSON instead of
// tool_input.command, and `rm\s+-rf\s+\/` fired 26 times, 25 of them harmless temp cleanups
// such as `rm -rf /tmp/x`. It also missed `rm -fr /`, `rm -r -f /`, and its fork-bomb
// pattern (`:()\{`, where `()` is an empty regex group) matched nothing.
//
// Every case here spawns the real script with the stdin shape Claude Code sends and reads
// back the exit code and stderr. Nothing calls the module's functions directly.

import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

const SCRIPT = join(import.meta.dirname, '..', '..', '..', '..', 'scripts', 'hooks', 'check-dangerous-cmd.mjs');

const BLOCKS = 2;
const ALLOWS = 0;

/** Run the hook with `stdin`; returns { status, stderr, stdout }. */
function run({ stdin, argv = [] }) {
  const r = spawnSync(process.execPath, [SCRIPT, ...argv], { input: stdin, encoding: 'utf8', timeout: 10000 });
  return { status: r.status, stderr: r.stderr, stdout: r.stdout };
}

/** The exact payload shape of a Claude Code PreToolUse call on the Bash tool. */
const payload = (command, extra = {}) =>
  JSON.stringify({ hook_event_name: 'PreToolUse', tool_name: 'Bash', tool_input: { command, ...extra } });

const callBash = (command, extra) => run({ stdin: payload(command, extra) });

describe('check-dangerous-cmd as a Claude Code PreToolUse hook', () => {
  describe('blocks with exit 2 (the only code Claude Code treats as a block)', () => {
    const DANGEROUS = [
      ['rm -rf /', 'rm-recursive-root-or-home'],
      ['sudo rm -rf / --no-preserve-root', 'rm-recursive-root-or-home'],
      ['rm -fr /', 'rm-recursive-root-or-home'],
      ['rm -r -f /', 'rm-recursive-root-or-home'],
      ['rm -Rf /', 'rm-recursive-root-or-home'],
      ['rm --recursive --force /', 'rm-recursive-root-or-home'],
      ['rm -rf /*', 'rm-recursive-root-or-home'],
      ['rm -rf ~', 'rm-recursive-root-or-home'],
      ['rm -rf ~/', 'rm-recursive-root-or-home'],
      ['rm -rf $HOME', 'rm-recursive-root-or-home'],
      ['rm -rf "$HOME"', 'rm-recursive-root-or-home'],
      ['echo start && sudo rm -rf / ; echo done', 'rm-recursive-root-or-home'],
      ['bash -c "rm -rf /"', 'rm-recursive-root-or-home'],
      ['mkfs.ext4 /dev/sdb1', 'mkfs'],
      ['dd if=/dev/zero of=/dev/sda', 'dd-to-device'],
      ['dd of=/dev/sda bs=1M', 'dd-to-device'],
      ['chmod -R 777 /', 'chmod-recursive-777-root'],
      ['echo wipe > /dev/sda', 'redirect-to-disk'],
      [':(){ :|:& };:', 'fork-bomb'],
      [':(){ : | : & };:', 'fork-bomb'],
    ];

    for (const [command, rule] of DANGEROUS) {
      it(`${command}  ->  exit 2, stderr names ${rule}`, () => {
        const r = callBash(command);
        expect(r.status).toBe(BLOCKS);
        expect(r.stderr).toContain(rule);
        expect(r.stdout).toBe('');
      });
    }
  });

  describe('allows with exit 0', () => {
    const SAFE = [
      'rm -rf /tmp/x',
      'rm -rf /private/tmp/uds-probe',
      'rm -rf "$SP/probe"',
      'rm -rf ./dist',
      'rm -rf node_modules',
      'rm -rf ~/proj/build',
      'rm -rf /home/user/old-build',
      'rm -f /tmp/lock',
      'git status',
      'ls -la /',
      'npm test',
      'dd if=/dev/urandom of=/dev/null bs=1M count=1',
      'chmod -R 755 /srv/site',
      'chmod -R 777 /tmp/shared',
      'echo "to wipe a disk run mkfs on it"',
      'git commit -m "never run rm -rf /"',
    ];

    for (const command of SAFE) {
      it(`${command}  ->  exit 0, silent`, () => {
        const r = callBash(command);
        expect(r.status).toBe(ALLOWS);
        expect(r.stderr).toBe('');
      });
    }
  });

  describe('judges tool_input.command, not the rest of the payload', () => {
    it('a dangerous string only in the description field does not block a harmless command', () => {
      const r = callBash('ls -la', { description: ':(){ :|:& };: and echo x > /dev/sda' });
      expect(r.status).toBe(ALLOWS);
      expect(r.stderr).toBe('');
    });

    it('a dangerous string in another top-level field does not block', () => {
      const stdin = JSON.stringify({
        hook_event_name: 'PreToolUse',
        tool_name: 'Bash',
        session_id: ':(){ :|:& };:',
        tool_input: { command: 'git status' },
      });
      expect(run({ stdin }).status).toBe(ALLOWS);
    });

    it('a payload without tool_input.command is not judged', () => {
      const stdin = JSON.stringify({ hook_event_name: 'PreToolUse', tool_name: 'Read', tool_input: { file_path: '/etc/passwd' } });
      expect(run({ stdin }).status).toBe(ALLOWS);
    });

    it('the dangerous command is still caught when the description is harmless', () => {
      expect(callBash('rm -rf /', { description: 'clean up' }).status).toBe(BLOCKS);
    });
  });

  describe('input that is not a Claude Code payload', () => {
    it('empty stdin allows', () => {
      expect(run({ stdin: '' }).status).toBe(ALLOWS);
    });

    it('a raw command line on stdin is judged as the command', () => {
      expect(run({ stdin: 'rm -rf /\n' }).status).toBe(BLOCKS);
      expect(run({ stdin: 'rm -rf /tmp/x\n' }).status).toBe(ALLOWS);
    });

    it('a command line in argv is judged as the command', () => {
      expect(run({ argv: ['rm -rf /'], stdin: '' }).status).toBe(BLOCKS);
      expect(run({ argv: ['rm -rf /tmp/x'], stdin: '' }).status).toBe(ALLOWS);
    });
  });
});
