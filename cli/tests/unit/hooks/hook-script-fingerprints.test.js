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
import { readFileSync, readdirSync, mkdtempSync, rmSync, realpathSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
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
