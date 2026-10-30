// `uds update` / `uds update --apply` replace the hook scripts an older UDS installed, with a backup first.
// (dev-platform decision 212甲, 2026-10-30.)
//
// Before this, only `uds update --with-hooks` replaced them. The other forms printed one line saying so, and
// most adopters type `uds update`: the 6.14.1 security fix (check-dangerous-cmd.mjs finally blocks) reached
// only those who knew the extra flag. The replacement also ran with no way back: the reconciler's backup did
// not cover scripts/hooks/, and `--with-hooks --force` overwrote an edited script without keeping a copy.
//
// What these tests pin, all through the real CLI (bin/uds.js as a subprocess) in a throwaway project:
//   - `--apply --yes` and plain `uds update` replace an UNMODIFIED older script, whether or not the project's
//     version record is current (a current record is the very adopter this is for), and the replaced script
//     really blocks `rm -rf /` when run the way Claude Code runs it
//   - an EDITED script is kept byte-for-byte and the output says so
//   - the script is copied to .uds-backups/ BEFORE it is rewritten: the copy exists and equals the original,
//     and `uds update --rollback` puts the original back
//   - `--with-hooks --force` keeps a copy of the edited script it overwrites, and prints where
//   - a write that fails part-way is undone: no script is left half-replaced
//   - no backup possible -> nothing is written
//   - `--plan` and the narrowed forms (`--skills`, ...) write nothing and say so
//
// Each test builds its own project; none depends on another. The "old scripts" are real files from the
// v6.14.0 tag (tests/fixtures/hook-scripts-v6.14.0/). HOME is a throwaway (tests/setup.js) and git reads an
// empty config, so nothing here touches the keychain, the real home or the global git configuration.
//
// MUTATION at the end: copies of the CLI with one wire cut each must fail the assertion that guards that wire.

import { describe, it, expect, afterEach, beforeAll, afterAll } from 'vitest';
import { spawnSync } from 'node:child_process';
import {
  mkdtempSync, rmSync, mkdirSync, writeFileSync, readFileSync, cpSync, symlinkSync, realpathSync, existsSync,
  readdirSync, chmodSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';

const CLI_ROOT = join(import.meta.dirname, '..', '..', '..');
const REPO_ROOT = join(CLI_ROOT, '..');
const UDS = join(CLI_ROOT, 'bin', 'uds.js');
const FIXTURES = join(CLI_ROOT, 'tests', 'fixtures', 'hook-scripts-v6.14.0');
const OLD_DANGEROUS = readFileSync(join(FIXTURES, 'check-dangerous-cmd.mjs'));
const OLD_LOGGING = readFileSync(join(FIXTURES, 'check-logging-standard.mjs'));
const SHIPPED_DANGEROUS = readFileSync(join(REPO_ROOT, 'scripts', 'hooks', 'check-dangerous-cmd.mjs'));
const SHIPPED_LOGGING = readFileSync(join(REPO_ROOT, 'scripts', 'hooks', 'check-logging-standard.mjs'));
const BUNDLED_VERSION = JSON.parse(readFileSync(join(REPO_ROOT, 'uds-manifest.json'), 'utf8')).version;
const DANGEROUS = 'scripts/hooks/check-dangerous-cmd.mjs';
const LOGGING = 'scripts/hooks/check-logging-standard.mjs';

const temps = [];
const tmp = (p) => { const d = realpathSync(mkdtempSync(join(tmpdir(), p))); temps.push(d); return d; };
afterEach(() => {
  while (temps.length) {
    const d = temps.pop();
    rmSync(d, { recursive: true, force: true });
    // A temp dir that survives is a leak the next run inherits: say so instead of passing.
    expect(existsSync(d), `temp dir removed: ${d}`).toBe(false);
  }
});

// git reads an empty file as every config level, so no test sees (or writes) the machine's git identity.
// Created before the tests and removed after them (a temp dir that survives is a leak).
let emptyGitConfig;
let emptyGitConfigDir;
beforeAll(() => {
  emptyGitConfigDir = realpathSync(mkdtempSync(join(tmpdir(), 'uds-empty-gitconfig-')));
  emptyGitConfig = join(emptyGitConfigDir, 'gitconfig');
  writeFileSync(emptyGitConfig, '');
});
afterAll(() => {
  rmSync(emptyGitConfigDir, { recursive: true, force: true });
  expect(existsSync(emptyGitConfigDir), 'empty git config dir removed').toBe(false);
});

const put = (root, rel, content = '') => {
  const p = join(root, rel);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, content);
};
const bytes = (root, rel) => readFileSync(join(root, rel));

function uds(root, args, { bin = UDS } = {}) {
  expect(process.env.HOME, 'the CLI must run under the throwaway HOME').not.toBe(process.env.UDS_TEST_REAL_HOME);
  const r = spawnSync(process.execPath, [bin, 'update', ...args], {
    cwd: root, encoding: 'utf8', timeout: 90000,
    env: {
      ...process.env, UDS_NO_UPDATE_CHECK: '1',
      GIT_CONFIG_GLOBAL: emptyGitConfig, GIT_CONFIG_SYSTEM: emptyGitConfig, GIT_CONFIG_NOSYSTEM: '1',
    },
  });
  return { status: r.status, out: `${r.stdout}${r.stderr}` };
}

/** Claude Code's PreToolUse/Bash stdin, the script run as a process, the exit code read back. */
function runHook(scriptPath, command) {
  const r = spawnSync(process.execPath, [scriptPath], {
    input: JSON.stringify({ hook_event_name: 'PreToolUse', tool_name: 'Bash', tool_input: { command } }),
    encoding: 'utf8', timeout: 10000,
  });
  return { status: r.status, stderr: r.stderr };
}

/**
 * A project that has had `uds update --with-hooks` run once (hook config AND scripts installed - the state of every
 * adopter who installed hooks under an earlier version), then `scripts` are put over the installed ones to stand
 * for what that older install left behind.
 *
 * @param {Record<string, Buffer>} scripts  project-relative path -> content
 * @param {{ version?: string, standards?: string[], settled?: boolean }} [opts]  `version` is the standards version the
 *   manifest records. `settled`: `uds update --apply --yes` has already run once, so the reconciler has nothing left to
 *   do and the version record is current - the state of an adopter who followed the documented upgrade on 6.14.1.
 */
function projectWithInstalledHooks(scripts, { version = '6.14.0', standards = [], settled = false } = {}) {
  const root = tmp('uds-replace-hooks-');
  put(root, '.standards/manifest.json', JSON.stringify({
    version: '3.3.0',
    upstream: { repo: 'AsiaOstrich/universal-dev-standards', version, installed: '2026-10-01T00:00:00.000Z' },
    format: 'ai', standards, extensions: [], integrations: ['claude-code'], aiTools: [], options: {},
  }, null, 2));
  put(root, 'CLAUDE.md', '# project\n');
  const first = uds(root, ['--with-hooks', '--yes']);
  expect(first.status, first.out).toBe(0);
  expect(existsSync(join(root, '.claude', 'settings.json')), 'setup: the hook config is installed').toBe(true);
  if (settled) {
    const first = uds(root, ['--apply', '--yes']);
    expect(first.status, first.out).toBe(0);
    const again = uds(root, ['--plan']);
    expect(again.out, 'setup: the reconciler has nothing left to do').toMatch(/No changes needed/);
    expect(backupsOf(root).length, 'setup: forget the backups of the settling run').toBeGreaterThan(0);
    rmSync(join(root, '.uds-backups'), { recursive: true, force: true });
  }
  for (const [rel, content] of Object.entries(scripts)) put(root, rel, content);
  return root;
}

/** The backups UDS took, newest last: [{ id, dir, manifest }]. */
function backupsOf(root) {
  const base = join(root, '.uds-backups');
  if (!existsSync(base)) return [];
  return readdirSync(base, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name).sort()
    .map((name) => {
      const dir = join(base, name);
      return { id: `.uds-backups/${name}`, dir, manifest: JSON.parse(readFileSync(join(dir, 'backup-manifest.json'), 'utf8')) };
    });
}
const hookBackups = (root) => backupsOf(root).filter((b) => b.manifest.label === 'hooks');

describe('control: the fixtures are what the tests say they are', () => {
  it('the v6.14.0 dangerous-command script lets `rm -rf /` through (exit 1); the shipped one blocks (exit 2)', () => {
    const dir = tmp('uds-replace-hooks-ctrl-');
    put(dir, 'check-dangerous-cmd.mjs', OLD_DANGEROUS); // the script only acts when its file name is this one
    expect(runHook(join(dir, 'check-dangerous-cmd.mjs'), 'rm -rf /').status).toBe(1);
    expect(runHook(join(REPO_ROOT, 'scripts', 'hooks', 'check-dangerous-cmd.mjs'), 'rm -rf /').status).toBe(2);
  });

  it('the old logging script differs from the shipped one, so a replace is visible', () => {
    expect(OLD_LOGGING.equals(SHIPPED_LOGGING)).toBe(false);
  });
});

describe('uds update --apply replaces an unmodified older hook script', { timeout: 120000 }, () => {
  it('replaces it, the replaced script blocks `rm -rf /`, and the old bytes are in a backup', () => {
    const root = projectWithInstalledHooks({ [DANGEROUS]: OLD_DANGEROUS });
    expect(runHook(join(root, DANGEROUS), 'rm -rf /').status, 'precondition: the project runs the old script').toBe(1);

    const r = uds(root, ['--apply', '--yes']);

    expect(r.status, r.out).toBe(0);
    expect(bytes(root, DANGEROUS).equals(SHIPPED_DANGEROUS), 'the file on disk is now the shipped one').toBe(true);
    expect(runHook(join(root, DANGEROUS), 'rm -rf /').status, 'and it blocks').toBe(2);
    expect(runHook(join(root, DANGEROUS), 'ls -la').status, 'and still allows a harmless command').toBe(0);
    expect(r.out).toMatch(/replaced 1 out-of-date hook script\(s\) in scripts\/hooks\/: check-dangerous-cmd\.mjs/);

    const [backup, ...more] = hookBackups(root);
    expect(more, 'one backup for one step').toEqual([]);
    expect(backup, 'a backup labelled hooks exists').toBeTruthy();
    expect(readFileSync(join(backup.dir, DANGEROUS)).equals(OLD_DANGEROUS), 'the backup holds the original bytes').toBe(true);
    expect(backup.manifest.backedUpFiles).toContain(DANGEROUS);
    expect(r.out, 'the output says where the backup is').toContain(`Backup: ${backup.id}`);
  });

  it('does it also when the reconciler has nothing to do and the version record is current (the adopter 6.14.1 --apply left behind)', () => {
    const root = projectWithInstalledHooks({ [DANGEROUS]: OLD_DANGEROUS }, { settled: true });
    expect(runHook(join(root, DANGEROUS), 'rm -rf /').status, 'precondition: the project runs the old script').toBe(1);

    const r = uds(root, ['--apply', '--yes']);

    expect(r.status, r.out).toBe(0);
    expect(bytes(root, DANGEROUS).equals(SHIPPED_DANGEROUS)).toBe(true);
    expect(runHook(join(root, DANGEROUS), 'rm -rf /').status).toBe(2);
    expect(r.out).toMatch(/only hook scripts needed changes/);
    const [backup, ...more] = hookBackups(root);
    expect(more).toEqual([]);
    expect(readFileSync(join(backup.dir, DANGEROUS)).equals(OLD_DANGEROUS)).toBe(true);
  });

  it('does it in the same run that applies other changes, and says so before asking', () => {
    // A standard the manifest lists and the project lacks makes the reconciler's plan non-empty: this is the
    // path where the confirmation is asked, so the hook replacement has to be named in what is agreed to.
    const root = projectWithInstalledHooks({ [DANGEROUS]: OLD_DANGEROUS }, { standards: ['testing'] });
    const planned = uds(root, ['--plan']);
    expect(planned.out, 'precondition: the plan has actions of its own').toMatch(/create|update/i);

    const r = uds(root, ['--apply', '--yes']);

    expect(r.status, r.out).toBe(0);
    expect(r.out).toMatch(/will be replaced \(unmodified copies of an older UDS/);
    expect(bytes(root, DANGEROUS).equals(SHIPPED_DANGEROUS)).toBe(true);
    expect(existsSync(join(root, '.standards', 'testing.ai.yaml')), 'the reconciler\'s own change happened too').toBe(true);
    expect(hookBackups(root)).toHaveLength(1);
  });

  it('keeps an EDITED script byte-for-byte, says so, and takes no backup (nothing was rewritten)', () => {
    const edited = Buffer.concat([OLD_DANGEROUS, Buffer.from('\n// local change: also block "git push --force"\n')]);
    const root = projectWithInstalledHooks({ [DANGEROUS]: edited });

    const r = uds(root, ['--apply', '--yes']);

    expect(r.status, r.out).toBe(0);
    expect(bytes(root, DANGEROUS).equals(edited), 'the adopter\'s edit survives').toBe(true);
    expect(r.out).toMatch(/1 hook script\(s\) in scripts\/hooks\/ differ from this UDS version and were kept: check-dangerous-cmd\.mjs/);
    expect(r.out).toContain('uds update --with-hooks --force');
    expect(r.out).not.toMatch(/replaced \d+ out-of-date/);
    expect(hookBackups(root)).toEqual([]);
  });

  it('replaces the old one and keeps the edited one in the same run', () => {
    const edited = Buffer.concat([OLD_LOGGING, Buffer.from('\n// mine\n')]);
    const root = projectWithInstalledHooks({ [DANGEROUS]: OLD_DANGEROUS, [LOGGING]: edited });

    const r = uds(root, ['--apply', '--yes']);

    expect(r.status, r.out).toBe(0);
    expect(bytes(root, DANGEROUS).equals(SHIPPED_DANGEROUS)).toBe(true);
    expect(bytes(root, LOGGING).equals(edited), 'the edited one is untouched').toBe(true);
    const [backup] = hookBackups(root);
    expect(backup.manifest.backedUpFiles, 'only what was rewritten is backed up').toEqual(expect.arrayContaining([DANGEROUS]));
    expect(backup.manifest.backedUpFiles).not.toContain(LOGGING);
  });

  it('records the replaced script in the manifest with the hash of what is now on disk', async () => {
    const { createHash } = await import('node:crypto');
    const root = projectWithInstalledHooks({ [DANGEROUS]: OLD_DANGEROUS });
    const manifestPath = join(root, '.standards', 'manifest.json');
    const before = JSON.parse(readFileSync(manifestPath, 'utf8'));
    delete before.installedArtifacts.files[DANGEROUS]; // a record found afterwards can only come from the replace
    writeFileSync(manifestPath, JSON.stringify(before, null, 2));

    expect(uds(root, ['--apply', '--yes']).status).toBe(0);

    const record = JSON.parse(readFileSync(manifestPath, 'utf8')).installedArtifacts.files[DANGEROUS];
    expect(record, 'the replace re-recorded it').toBeTruthy();
    expect(record.hash).toBe('sha256:' + createHash('sha256').update(SHIPPED_DANGEROUS).digest('hex'));
  });

  it('a second run changes nothing and takes no second backup', () => {
    const root = projectWithInstalledHooks({ [DANGEROUS]: OLD_DANGEROUS });
    expect(uds(root, ['--apply', '--yes']).status).toBe(0);
    const after = bytes(root, DANGEROUS);
    const r = uds(root, ['--apply', '--yes']);
    expect(r.status, r.out).toBe(0);
    expect(bytes(root, DANGEROUS).equals(after)).toBe(true);
    expect(r.out).not.toMatch(/replaced \d+ out-of-date/);
    expect(hookBackups(root)).toHaveLength(1);
  });
});

describe('plain `uds update` replaces an unmodified older hook script', { timeout: 120000 }, () => {
  it('replaces it when the project is behind (the update path that rewrites standards)', () => {
    const root = projectWithInstalledHooks({ [DANGEROUS]: OLD_DANGEROUS }, { version: '6.0.0' });

    const r = uds(root, ['--yes', '--offline']);

    expect(r.status, r.out).toBe(0);
    expect(r.out, 'precondition: this run took the "update available" path').toMatch(/6\.0\.0/);
    expect(bytes(root, DANGEROUS).equals(SHIPPED_DANGEROUS)).toBe(true);
    expect(runHook(join(root, DANGEROUS), 'rm -rf /').status).toBe(2);
    expect(r.out).toMatch(/replaced 1 out-of-date hook script/);
    const [backup] = hookBackups(root);
    expect(readFileSync(join(backup.dir, DANGEROUS)).equals(OLD_DANGEROUS)).toBe(true);
  });

  it('replaces it when the version record is already current', () => {
    const root = projectWithInstalledHooks({ [DANGEROUS]: OLD_DANGEROUS }, { version: BUNDLED_VERSION });

    const r = uds(root, ['--yes', '--offline']);

    expect(r.status, r.out).toBe(0);
    expect(r.out, 'precondition: this run took the "up to date" path').toMatch(/up to date/i);
    expect(bytes(root, DANGEROUS).equals(SHIPPED_DANGEROUS)).toBe(true);
    expect(hookBackups(root)).toHaveLength(1);
  });

  it('keeps an edited script on both paths', () => {
    const edited = Buffer.concat([OLD_DANGEROUS, Buffer.from('\n// mine\n')]);
    for (const version of ['6.0.0', BUNDLED_VERSION]) {
      const root = projectWithInstalledHooks({ [DANGEROUS]: edited }, { version });
      const r = uds(root, ['--yes', '--offline']);
      expect(bytes(root, DANGEROUS).equals(edited), `version record ${version}`).toBe(true);
      expect(r.out, `version record ${version}`).toMatch(/were kept: check-dangerous-cmd\.mjs/);
    }
  });
});

describe('uds update --rollback undoes the hook step', { timeout: 120000 }, () => {
  it('puts the original script back', () => {
    const root = projectWithInstalledHooks({ [DANGEROUS]: OLD_DANGEROUS });
    expect(uds(root, ['--apply', '--yes']).status).toBe(0);
    expect(bytes(root, DANGEROUS).equals(SHIPPED_DANGEROUS), 'setup: it was replaced').toBe(true);

    const r = uds(root, ['--rollback']);

    expect(r.status, r.out).toBe(0);
    expect(bytes(root, DANGEROUS).equals(OLD_DANGEROUS), 'the original is back, byte for byte').toBe(true);
    expect(r.out).toMatch(/Rollback successful/);
  });
});

describe('uds update --with-hooks --force keeps a copy of what it overwrites', { timeout: 120000 }, () => {
  it('copies the edited script to .uds-backups/ first, prints where, and --rollback restores the edit', () => {
    const edited = Buffer.concat([OLD_DANGEROUS, Buffer.from('\n// local change\n')]);
    const root = projectWithInstalledHooks({ [DANGEROUS]: edited });

    const r = uds(root, ['--with-hooks', '--force']);

    expect(r.status, r.out).toBe(0);
    expect(bytes(root, DANGEROUS).equals(SHIPPED_DANGEROUS), 'the edited script was overwritten').toBe(true);
    expect(r.out).toMatch(/overwrote 1 edited hook script/);
    const [backup, ...more] = hookBackups(root);
    expect(more).toEqual([]);
    expect(backup, 'a backup exists').toBeTruthy();
    expect(readFileSync(join(backup.dir, DANGEROUS)).equals(edited), 'the backup holds the adopter\'s edit').toBe(true);
    expect(r.out, 'the output names the backup').toContain(`Backup: ${backup.id}`);

    const back = uds(root, ['--rollback']);
    expect(back.status, back.out).toBe(0);
    expect(bytes(root, DANGEROUS).equals(edited), 'the adopter\'s edit is restored').toBe(true);
  });

  it('without --force an edited script is not overwritten and nothing is backed up', () => {
    const edited = Buffer.concat([OLD_DANGEROUS, Buffer.from('\n// local change\n')]);
    const root = projectWithInstalledHooks({ [DANGEROUS]: edited });
    const r = uds(root, ['--with-hooks']);
    expect(r.status, r.out).toBe(0);
    expect(bytes(root, DANGEROUS).equals(edited)).toBe(true);
    expect(hookBackups(root)).toEqual([]);
  });

  it('--plan with --force names what it would overwrite and writes nothing, not even a backup', () => {
    const edited = Buffer.concat([OLD_DANGEROUS, Buffer.from('\n// local change\n')]);
    const root = projectWithInstalledHooks({ [DANGEROUS]: edited });
    const r = uds(root, ['--with-hooks', '--force', '--plan']);
    expect(r.status, r.out).toBe(0);
    expect(r.out).toMatch(/--force would overwrite 1 edited hook script/);
    expect(bytes(root, DANGEROUS).equals(edited)).toBe(true);
    expect(backupsOf(root)).toEqual([]);
  });
});

describe('a write that fails part-way is undone; no backup means no write', { timeout: 120000 }, () => {
  it('leaves no script half-replaced when the second write fails', (ctx) => {
    if (process.platform === 'win32') ctx.skip('read-only files cannot be unlinked by the restore on Windows; the failure is injected with chmod');
    if (typeof process.getuid === 'function' && process.getuid() === 0) ctx.skip('root ignores the read-only bit, so the failure cannot be injected');

    const root = projectWithInstalledHooks({ [DANGEROUS]: OLD_DANGEROUS, [LOGGING]: OLD_LOGGING });
    // The CLI writes the stale scripts in directory order; make the LAST one unwritable so an earlier one has already been replaced.
    const order = readdirSync(join(root, 'scripts', 'hooks')).filter((n) => [DANGEROUS, LOGGING].includes(`scripts/hooks/${n}`));
    expect(order, 'setup: both scripts are present').toHaveLength(2);
    const [first, last] = order.map((n) => `scripts/hooks/${n}`);
    const original = { [DANGEROUS]: OLD_DANGEROUS, [LOGGING]: OLD_LOGGING };
    chmodSync(join(root, last), 0o444);

    const r = uds(root, ['--apply', '--yes']);

    expect(r.status, r.out).toBe(1);
    expect(r.out).toMatch(/Replacing hook scripts failed/);
    expect(r.out).toMatch(/restored from the backup/);
    expect(bytes(root, first).equals(original[first]), `${first} was written, then put back from the backup`).toBe(true);
    expect(bytes(root, last).equals(original[last]), `${last} never changed`).toBe(true);
    expect(r.out, 'a failed step must not report a replacement').not.toMatch(/✓ replaced/);
    const [backup] = hookBackups(root);
    expect(readFileSync(join(backup.dir, first)).equals(original[first]), 'the backup still holds the original').toBe(true);
  });

  it('writes nothing when the backup cannot be taken', () => {
    const root = projectWithInstalledHooks({ [DANGEROUS]: OLD_DANGEROUS });
    writeFileSync(join(root, '.uds-backups'), 'not a directory'); // the backup folder cannot be created

    const r = uds(root, ['--apply', '--yes']);

    expect(r.status, r.out).toBe(1);
    expect(r.out).toMatch(/Could not take a backup before replacing hook scripts; nothing was changed/);
    expect(bytes(root, DANGEROUS).equals(OLD_DANGEROUS), 'the script was not touched').toBe(true);
  });
});

describe('--plan and the narrowed forms do not replace hook scripts, and say so', { timeout: 120000 }, () => {
  it('--plan names the script it would replace and writes nothing, not even a backup', () => {
    const root = projectWithInstalledHooks({ [DANGEROUS]: OLD_DANGEROUS });
    const r = uds(root, ['--plan']);
    expect(r.status, r.out).toBe(0);
    expect(r.out).toMatch(/would replace 1 out-of-date hook script\(s\) in scripts\/hooks\/: check-dangerous-cmd\.mjs/);
    expect(bytes(root, DANGEROUS).equals(OLD_DANGEROUS)).toBe(true);
    expect(backupsOf(root)).toEqual([]);
  });

  it('--plan --skills is narrowed: it leaves the script and names the command that replaces it', () => {
    const root = projectWithInstalledHooks({ [DANGEROUS]: OLD_DANGEROUS });
    const r = uds(root, ['--plan', '--skills']);
    expect(bytes(root, DANGEROUS).equals(OLD_DANGEROUS)).toBe(true);
    expect(r.out).toMatch(/1 hook script\(s\) in scripts\/hooks\/ are unmodified copies of an older UDS and are NOT updated by this command: check-dangerous-cmd\.mjs/);
    expect(r.out).toContain('uds update --apply');
    expect(backupsOf(root)).toEqual([]);
  });

  it('says nothing when the script is current', () => {
    const root = projectWithInstalledHooks({ [DANGEROUS]: SHIPPED_DANGEROUS });
    const r = uds(root, ['--plan']);
    expect(r.out).not.toMatch(/hook script/);
  });
});

// ── mutation ────────────────────────────────────────────────────────────────

describe('MUTATION: one wire cut at a time, the assertion that guards it turns red', { timeout: 120000 }, () => {
  let n = 0;
  /**
   * A copy of the CLI (bin, src) with `edits` applied. It sits at <tmp>/cli next to symlinks to every other
   * top-level entry of the repo, so the repo-relative lookups (scripts/hooks, ai/standards, core, the manifest)
   * resolve exactly as they do for the real CLI, with no path rewriting.
   */
  function mutantCli(edits) {
    const root = tmp(`uds-replace-hooks-mutant-${n++}-`);
    mkdirSync(join(root, 'cli'));
    for (const f of ['bin', 'src', 'package.json', 'standards-registry.json']) cpSync(join(CLI_ROOT, f), join(root, 'cli', f), { recursive: true });
    symlinkSync(join(CLI_ROOT, 'node_modules'), join(root, 'cli', 'node_modules'));
    for (const e of readdirSync(REPO_ROOT)) {
      if (['cli', '.git', 'node_modules'].includes(e)) continue;
      symlinkSync(join(REPO_ROOT, e), join(root, e));
    }
    for (const [file, from, to] of edits) {
      const p = join(root, 'cli', file);
      const src = readFileSync(p, 'utf8');
      expect(src.split(from).length - 1, `mutation anchor must match exactly once in ${file}`).toBe(1);
      writeFileSync(p, src.replace(from, () => to));
    }
    return join(root, 'cli', 'bin', 'uds.js');
  }

  it('control: the copy with only the path fix still replaces the script (so the cuts below are what turn it red)', () => {
    const bin = mutantCli([]);
    const root = projectWithInstalledHooks({ [DANGEROUS]: OLD_DANGEROUS });
    const r = uds(root, ['--apply', '--yes'], { bin });
    expect(bytes(root, DANGEROUS).equals(SHIPPED_DANGEROUS), r.out).toBe(true);
    expect(hookBackups(root)).toHaveLength(1);
  });

  it('--apply no longer calls the hook step (nothing-to-do path): the old script stays and nobody is told', () => {
    const bin = mutantCli([['src/commands/update.js', 'const hookStep = replacesHooks ? runHookScriptStep(projectPath) : { replaced: [] };', 'const hookStep = { replaced: [] };']]);
    const root = projectWithInstalledHooks({ [DANGEROUS]: OLD_DANGEROUS }, { settled: true });
    const r = uds(root, ['--apply', '--yes'], { bin });
    expect(bytes(root, DANGEROUS).equals(SHIPPED_DANGEROUS)).toBe(false);
    expect(r.out).not.toMatch(/replaced \d+ out-of-date/);
  });

  it('--apply no longer calls the hook step (plan-with-actions path): the old script stays', () => {
    const bin = mutantCli([['src/commands/update.js', "  if (replacesHooks) {\n    console.log();\n    runHookScriptStep(projectPath);\n  }", '  void replacesHooks;']]);
    const root = projectWithInstalledHooks({ [DANGEROUS]: OLD_DANGEROUS }, { standards: ['testing'] });
    uds(root, ['--apply', '--yes'], { bin });
    expect(bytes(root, DANGEROUS).equals(SHIPPED_DANGEROUS)).toBe(false);
  });

  it('the backup is not taken (a stub claims success): the copy of the original is missing', () => {
    const bin = mutantCli([['src/commands/update.js', 'const backup = createStepBackup(projectPath, {\n    label: \'hooks\',', "const backup = ((p, spec) => ({ backupId: '.uds-backups/none', backedUp: spec.mustBackUp, errors: [] }))(projectPath, {\n    label: 'hooks',"]]);
    const root = projectWithInstalledHooks({ [DANGEROUS]: OLD_DANGEROUS });
    uds(root, ['--apply', '--yes'], { bin });
    expect(hookBackups(root), 'no backup folder was written').toEqual([]);
  });

  it('the restore is cut out: a failed second write leaves the first script replaced', (ctx) => {
    if (process.platform === 'win32' || (typeof process.getuid === 'function' && process.getuid() === 0)) ctx.skip('failure injection needs chmod on a non-root POSIX user');
    const bin = mutantCli([['src/commands/update.js', 'const undo = rollbackLast(projectPath, backup.backupId);', 'const undo = { success: true, errors: [] };']]);
    const root = projectWithInstalledHooks({ [DANGEROUS]: OLD_DANGEROUS, [LOGGING]: OLD_LOGGING });
    const order = readdirSync(join(root, 'scripts', 'hooks')).filter((f) => ['check-dangerous-cmd.mjs', 'check-logging-standard.mjs'].includes(f));
    const [first, last] = order.map((f) => `scripts/hooks/${f}`);
    chmodSync(join(root, last), 0o444);
    uds(root, ['--apply', '--yes'], { bin });
    const old = { [DANGEROUS]: OLD_DANGEROUS, [LOGGING]: OLD_LOGGING };
    expect(bytes(root, first).equals(old[first]), 'the first script was left replaced').toBe(false);
  });

  it('"unmodified" judged weakly (every differing script counts as an old copy): the edited script is overwritten', () => {
    const bin = mutantCli([['src/installers/hooks-installer.js', 'const old = shippedBefore(r, have, table);', "const old = { since: 'mutant' };"]]);
    const edited = Buffer.concat([OLD_DANGEROUS, Buffer.from('\n// local change: also block "git push --force"\n')]);
    const root = projectWithInstalledHooks({ [DANGEROUS]: edited });
    uds(root, ['--apply', '--yes'], { bin });
    expect(bytes(root, DANGEROUS).equals(edited), 'the adopter\'s edit was lost').toBe(false);
  });

  it('plain `uds update` (up-to-date path) no longer calls the hook step', () => {
    const bin = mutantCli([['src/commands/update.js', 'const hooksOnLatest = hookStepApplies(options) ? runHookScriptStep(projectPath) : { failed: false };', 'const hooksOnLatest = { failed: false };']]);
    const root = projectWithInstalledHooks({ [DANGEROUS]: OLD_DANGEROUS }, { version: BUNDLED_VERSION });
    uds(root, ['--yes', '--offline'], { bin });
    expect(bytes(root, DANGEROUS).equals(SHIPPED_DANGEROUS)).toBe(false);
  });

  it('plain `uds update` (update-available path) no longer calls the hook step', () => {
    const bin = mutantCli([['src/commands/update.js', 'hookStepFailed = runHookScriptStep(projectPath).failed;', 'hookStepFailed = false;']]);
    const root = projectWithInstalledHooks({ [DANGEROUS]: OLD_DANGEROUS }, { version: '6.0.0' });
    uds(root, ['--yes', '--offline'], { bin });
    expect(bytes(root, DANGEROUS).equals(SHIPPED_DANGEROUS)).toBe(false);
  });

  it('`--with-hooks --force` no longer takes the backup: the adopter\'s edit has no copy', () => {
    const bin = mutantCli([['src/commands/update.js', ': withHookScriptBackup(projectPath, { overwrite: !!options.force, watchNew: true }, install);', ': { ok: true, value: install(), backupId: null };']]);
    const edited = Buffer.concat([OLD_DANGEROUS, Buffer.from('\n// local change\n')]);
    const root = projectWithInstalledHooks({ [DANGEROUS]: edited });
    const r = uds(root, ['--with-hooks', '--force'], { bin });
    expect(bytes(root, DANGEROUS).equals(SHIPPED_DANGEROUS), 'setup: it was overwritten').toBe(true);
    expect(hookBackups(root), r.out).toEqual([]);
  });
});
