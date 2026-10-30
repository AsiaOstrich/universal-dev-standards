// The table that lets `uds update --with-hooks` tell "an old UDS script nobody touched" from "a script
// the adopter edited" (cli/src/installers/hook-script-fingerprints.json).
//
// A wrong entry has one of two costs: a missing one makes an old UDS copy look edited (the security fix
// is withheld, with only a warning); an invented one would make an adopter's edit look like UDS's and
// overwrite it. So the table is generated from git (scripts/generate-hook-fingerprints.mjs), and these
// tests pin the two things a person can get wrong by hand:
//   1. a script under scripts/hooks/ whose content the table does not know (someone changed a hook and
//      forgot to regenerate — the NEXT release would then withhold the fix from this version's adopters)
//   2. the matching rule itself (path-keyed, line-ending-tolerant, byte-exact otherwise)

import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { readFileSync, readdirSync, mkdtempSync, rmSync, realpathSync, writeFileSync, chmodSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, delimiter } from 'node:path';
import { hashHookScript, loadFingerprints, shippedBefore } from '../../../src/installers/hook-script-fingerprint.js';
import { missing } from '../../../../scripts/generate-hook-fingerprints.mjs';

const CLI_ROOT = join(import.meta.dirname, '..', '..', '..');
const HOOKS = join(CLI_ROOT, '..', 'scripts', 'hooks');
const OLD = readFileSync(join(CLI_ROOT, 'tests', 'fixtures', 'hook-scripts-v6.14.0', 'check-dangerous-cmd.mjs'));

function shippedScripts() {
  const out = {};
  const walk = (dir, rel = '') => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const r = rel ? `${rel}/${e.name}` : e.name;
      if (e.isDirectory()) walk(join(dir, e.name), r); else out[r] = readFileSync(join(dir, e.name));
    }
  };
  walk(HOOKS);
  return out;
}

describe('hook-script-fingerprints.json', () => {
  const table = loadFingerprints();

  it('knows the content of EVERY script under scripts/hooks/ right now', () => {
    const scripts = shippedScripts();
    expect(Object.keys(scripts).length, 'control: the walk found the scripts').toBeGreaterThan(5);
    for (const [rel, buf] of Object.entries(scripts)) {
      expect(shippedBefore(rel, buf, table), `${rel}: run  node scripts/generate-hook-fingerprints.mjs  and commit the result`).not.toBeNull();
    }
  });

  it('flags a changed hook script as missing (what the line above exists to catch)', () => {
    const changed = Buffer.concat([readFileSync(join(HOOKS, 'check-dangerous-cmd.mjs')), Buffer.from('\n// edit\n')]);
    const gaps = missing(table, { tags: [], tagsPrints: [], working: { 'check-dangerous-cmd.mjs': hashHookScript(changed) } });
    expect(gaps).toHaveLength(1);
    expect(shippedBefore('check-dangerous-cmd.mjs', changed, table)).toBeNull();
  });

  it('every entry is a 64-hex sha256 with a release label, and the file is path-keyed', () => {
    for (const [path, shas] of Object.entries(table.scripts)) {
      expect(path).not.toMatch(/\\|^\//);
      for (const [sha, label] of Object.entries(shas)) {
        expect(sha, path).toMatch(/^[0-9a-f]{64}$/);
        expect(label, path).toMatch(/^(v\d+\.\d+\.\d+(-[\w.]+)?|unreleased)$/);
      }
    }
  });
});

describe('shippedBefore: the rule that decides replace vs keep', () => {
  it('the v6.14.0 check-dangerous-cmd.mjs is a known older UDS copy', () => {
    expect(shippedBefore('check-dangerous-cmd.mjs', OLD)).toEqual({ since: expect.stringMatching(/^v6\./) });
  });
  it('one added byte makes it an edit', () => {
    expect(shippedBefore('check-dangerous-cmd.mjs', Buffer.concat([OLD, Buffer.from(' ')]))).toBeNull();
  });
  it('the same bytes under a different path are not UDS\'s', () => {
    expect(shippedBefore('inject-standards.mjs', OLD)).toBeNull();
    expect(shippedBefore('not-a-uds-script.mjs', OLD)).toBeNull();
  });
  it('CRLF line endings alone are not an edit', () => {
    const crlf = Buffer.from(OLD.toString('utf8').replace(/\n/g, '\r\n'));
    expect(crlf.equals(OLD)).toBe(false);
    expect(shippedBefore('check-dangerous-cmd.mjs', crlf)).not.toBeNull();
  });
});

describe('the generator', () => {
  it('--self-test passes (build/missing logic, plus a throwaway git repo with a tag)', () => {
    const r = spawnSync(process.execPath, [join(CLI_ROOT, '..', 'scripts', 'generate-hook-fingerprints.mjs'), '--self-test'], { encoding: 'utf8', timeout: 60000 });
    expect(r.status, `${r.stdout}${r.stderr}`).toBe(0);
  });

  // Red on windows-latest at 6.14.1-beta.2 and 6.14.1: the self-test handed git `os.devNull` as its global
  // config, which on Windows is `\\.\nul` and which Git for Windows cannot open ("fatal: unable to access
  // '//./nul': Invalid argument"). That cannot be reproduced on a Mac by running the script, because here
  // os.devNull is /dev/null. So put a `git` ahead of the real one that applies the Windows rule: a
  // GIT_CONFIG_GLOBAL that is not an existing regular file is refused with git's own message.
  it.skipIf(process.platform === 'win32')('--self-test gives git a real file as its global config, never a null device (Git for Windows cannot open \\.\nul)', () => {
    const which = spawnSync('sh', ['-c', 'command -v git'], { encoding: 'utf8' });
    expect(which.status, 'control: the real git was found').toBe(0);
    const realGit = which.stdout.trim();
    const shimDir = realpathSync(mkdtempSync(join(tmpdir(), 'uds-fp-gitshim-')));
    try {
      const shim = join(shimDir, 'git');
      writeFileSync(shim, `#!/bin/sh\nif [ -n "$GIT_CONFIG_GLOBAL" ] && [ ! -f "$GIT_CONFIG_GLOBAL" ]; then\n  echo "fatal: unable to access '$GIT_CONFIG_GLOBAL': Invalid argument" >&2\n  exit 128\nfi\nexec "${realGit}" "$@"\n`);
      chmodSync(shim, 0o755);
      // control: the shim does refuse a null device, so a pass below is not the shim being asleep
      const refused = spawnSync(shim, ['--version'], { encoding: 'utf8', env: { ...process.env, GIT_CONFIG_GLOBAL: '/dev/null' } });
      expect(refused.status, 'control: the shim refuses /dev/null as a config file').toBe(128);
      expect(statSync(shim).isFile()).toBe(true);
      const r = spawnSync(process.execPath, [join(CLI_ROOT, '..', 'scripts', 'generate-hook-fingerprints.mjs'), '--self-test'], {
        encoding: 'utf8', timeout: 60000, env: { ...process.env, PATH: `${shimDir}${delimiter}${process.env.PATH}` },
      });
      expect(r.status, `${r.stdout}${r.stderr}`).toBe(0);
      expect(r.stdout).toContain('all self-test arms passed');
    } finally {
      rmSync(shimDir, { recursive: true, force: true });
    }
  });

  it('does not touch the repository named by an inherited GIT_DIR (a git hook runs the tests with one)', () => {
    const decoy = realpathSync(mkdtempSync(join(tmpdir(), 'uds-fp-decoy-')));
    try {
      const git = (...a) => spawnSync('git', a, { cwd: decoy, encoding: 'utf8' });
      expect(git('init', '-q').status, 'setup: decoy repo').toBe(0);
      const r = spawnSync(process.execPath, [join(CLI_ROOT, '..', 'scripts', 'generate-hook-fingerprints.mjs'), '--self-test'], {
        encoding: 'utf8', timeout: 60000, env: { ...process.env, GIT_DIR: join(decoy, '.git'), GIT_WORK_TREE: decoy },
      });
      expect(r.status, `${r.stdout}${r.stderr}`).toBe(0);
      expect(git('tag', '--list').stdout, 'no tag was created in the decoy').toBe('');
      expect(git('log', '--oneline').stdout, 'no commit was made in the decoy').toBe('');
    } finally {
      rmSync(decoy, { recursive: true, force: true });
    }
  });
});
