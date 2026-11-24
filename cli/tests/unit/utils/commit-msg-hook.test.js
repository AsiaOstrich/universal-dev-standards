/**
 * Unit: the pieces of the git commit-msg hook that do not need a git repository, and the one thing that must hold on
 * every platform: the hook text is plain POSIX `sh` (Git for Windows runs hooks with its own `sh`, not bash).
 * The behaviour of the installed hook in a real repository is tests/e2e/commit-msg-hook-225.test.js.
 */

import { describe, it, expect } from 'vitest';
import { mkdtempSync, writeFileSync, rmSync, mkdirSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { spawnSync } from 'child_process';
import {
  buildCommitMsgHook, isUdsCommitMsgHook, runsUdsCommitMsgCheck, messageForJudging, runCommitMsgCheck,
  gitHooksDisabled, recordGitHooksChoice, COMMIT_MSG_HOOK_MARKER, ensureCommitMsgHook, reportCommitMsgHook
} from '../../../src/utils/commit-msg-hook.js';

describe('the hook text', () => {
  const text = buildCommitMsgHook();

  it('starts with a shebang (Git for Windows cannot run a hook without one) and carries the marker on line 2', () => {
    expect(text.split('\n')[0]).toBe('#!/bin/sh');
    expect(text.split('\n')[1]).toBe(COMMIT_MSG_HOOK_MARKER);
    expect(text, 'LF only').not.toContain('\r');
  });

  it('uses no bash-only syntax', () => {
    for (const bashism of [/\[\[/, /\bfunction\s+\w+/, /\bsource\s/, /\blocal\s/, /<\(/, /\$\{[^}]*\/\/[^}]*\}/, /==/, /&>/]) {
      expect(text, `bash-ism ${bashism}`).not.toMatch(bashism);
    }
  });

  it('parses as shell (sh -n)', (ctx) => {
    if (process.platform === 'win32') ctx.skip('no sh on PATH in a plain Windows shell; the text rules above are what is checked there');
    const dir = mkdtempSync(join(tmpdir(), 'uds-test-cmh-'));
    try {
      const file = join(dir, 'commit-msg');
      writeFileSync(file, text);
      const r = spawnSync('sh', ['-n', file], { encoding: 'utf8' });
      expect(r.status, r.stderr).toBe(0);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('is recognised as UDS\'s, and a hand-wired call of the entry is recognised as running the check', () => {
    expect(isUdsCommitMsgHook(text)).toBe(true);
    expect(isUdsCommitMsgHook('#!/bin/sh\nexit 0\n')).toBe(false);
    expect(runsUdsCommitMsgCheck('#!/bin/sh\nuniversal-dev-standards check --commit-msg "$1"\n')).toBe(true);
    expect(runsUdsCommitMsgCheck('#!/bin/sh\nnpx commitlint --edit "$1"\n')).toBe(false);
  });
});

describe('messageForJudging', () => {
  it('drops comment lines and what follows the scissors line, and trims', () => {
    expect(messageForJudging('\nfeat(a): b. c.\n\n# comment\n')).toBe('feat(a): b. c.');
    expect(messageForJudging('feat(a): b\n# ------------------------ >8 ------------------------\ndiff --git')).toBe('feat(a): b');
    expect(messageForJudging('a\r\nb\r\n')).toBe('a\nb');
    expect(messageForJudging('# only a comment\n')).toBe('');
  });
});

describe('runCommitMsgCheck', () => {
  const judge = async (text) => {
    const dir = mkdtempSync(join(tmpdir(), 'uds-test-cmh-'));
    try {
      const file = join(dir, 'MSG');
      writeFileSync(file, text);
      return await runCommitMsgCheck(dir, file); // no .standards in dir: the Conventional Commits set
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  };

  it('passes a well-formed message and fails a malformed one, naming it', async () => {
    expect((await judge('feat(auth): add refresh. 新增更新。\n')).code).toBe(0);
    const bad = await judge('fixed stuff\n');
    expect(bad.code).toBe(1);
    expect(bad.lines.join('\n')).toContain('"fixed stuff"');
  });

  it('lets the subjects git writes itself through', async () => {
    for (const subject of ["Merge branch 'side'", 'Merge pull request #3 from x/y', 'Revert "feat(a): b"', 'fixup! feat(a): b', 'squash! feat(a): b', 'amend! feat(a): b']) {
      expect((await judge(`${subject}\n`)).code, subject).toBe(0);
    }
    expect((await judge('Mergefix: not a merge\n')).code, 'only "Merge " followed by a space is a merge').toBe(1);
  });

  it('cannot read the file: exit 2, not a pass', async () => {
    const r = await runCommitMsgCheck(tmpdir(), join(tmpdir(), 'uds-test-cmh-does-not-exist'));
    expect(r.code).toBe(2);
  });
});

describe('the opt-out record', () => {
  it('is read from manifest.gitHooks.commitMsg', () => {
    expect(gitHooksDisabled({ gitHooks: { commitMsg: 'off' } })).toBe(true);
    expect(gitHooksDisabled({})).toBe(false);
    expect(gitHooksDisabled(null)).toBe(false);
  });

  it('is written to and cleared from the raw manifest, leaving every other field as it was', () => {
    const dir = mkdtempSync(join(tmpdir(), 'uds-test-cmh-'));
    try {
      mkdirSync(join(dir, '.standards'), { recursive: true });
      const original = { version: '3.4.0', standards: ['x'], somethingNew: { keep: true } };
      writeFileSync(join(dir, '.standards', 'manifest.json'), JSON.stringify(original));
      const inMemory = { ...original };
      expect(recordGitHooksChoice(dir, true, inMemory)).toBe(true);
      const on = JSON.parse(readFileSync(join(dir, '.standards', 'manifest.json'), 'utf-8'));
      expect(on).toEqual({ ...original, gitHooks: { commitMsg: 'off' } });
      expect(inMemory.gitHooks).toEqual({ commitMsg: 'off' });
      recordGitHooksChoice(dir, false, inMemory);
      expect(JSON.parse(readFileSync(join(dir, '.standards', 'manifest.json'), 'utf-8'))).toEqual(original);
      expect(inMemory.gitHooks).toBeUndefined();
      expect(recordGitHooksChoice(join(dir, 'nowhere'), true)).toBe(false);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe('when the hook cannot be written', () => {
  it('says why, with the reason the file system gave, instead of a blank (write failure reaches the message)', () => {
    const dir = mkdtempSync(join(tmpdir(), 'uds-cmh-writefail-'));
    try {
      const env = { ...process.env };
      for (const k of Object.keys(env)) if (k.startsWith('GIT_')) delete env[k];
      expect(spawnSync('git', ['init', '-q'], { cwd: dir, env }).status).toBe(0);
      // .git/hooks is a plain file, so making the hooks directory and writing commit-msg inside it must fail, on every OS.
      rmSync(join(dir, '.git', 'hooks'), { recursive: true, force: true });
      writeFileSync(join(dir, '.git', 'hooks'), 'not a directory');

      const result = ensureCommitMsgHook(dir);
      expect(result.state).toBe('error');
      expect(typeof result.writeFailure).toBe('string');
      expect(result.writeFailure.length).toBeGreaterThan(0);

      const lines = [];
      reportCommitMsgHook(result, { commitMsgHookError: 'Could not write the git commit-msg hook ({file}): {error}' }, dir, (l) => lines.push(l));
      expect(lines.join('\n')).toContain(result.writeFailure);
      expect(lines.join('\n')).not.toMatch(/\): *$/m);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
