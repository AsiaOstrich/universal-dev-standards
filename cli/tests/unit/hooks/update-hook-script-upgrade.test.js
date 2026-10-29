// `uds update --with-hooks` on a project whose hooks are ALREADY installed.
//
// Found 2026-10-29 shipping 6.14.1-beta.1, whose one fix is that check-dangerous-cmd.mjs finally
// blocks (exit 2; the 6.14.0 script exited 1, which Claude Code treats as "carry on"). Measured on a
// project that already had the hooks: `uds update --with-hooks`, `--with-hooks --force` and `--apply`
// all left the old script in place. `installMissingHooks` saw the hook config "present", reported
// "already installed, not touched", and never looked at the script beside it. An adopter who ran every
// documented upgrade command was still unprotected, and nothing said so.
//
// What these tests pin:
//   - an UNMODIFIED copy of an older UDS script is replaced (byte-identical to what some earlier UDS shipped)
//   - an EDITED copy is kept, and the output says so and says how to force it
//   - --force replaces an edited copy too, also when the hook config is already present
//   - --plan reports what would change and writes nothing
//
// Everything runs the real CLI as a subprocess in a temp project. The "old script" is a real file from the
// v6.14.0 tag (tests/fixtures/hook-scripts-v6.14.0/), not something invented here; its first assertion is
// that it really is the vulnerable one. HOME is already a throwaway (tests/setup.js).
//
// MUTATION at the end: a copy of the CLI with the refresh cut out must fail the same assertions.

import { describe, it, expect, afterEach } from 'vitest';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  mkdtempSync, rmSync, mkdirSync, writeFileSync, readFileSync, cpSync, symlinkSync, realpathSync, existsSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';

const CLI_ROOT = join(import.meta.dirname, '..', '..', '..');
const REPO_ROOT = join(CLI_ROOT, '..');
const UDS = join(CLI_ROOT, 'bin', 'uds.js');
const OLD_SCRIPT = readFileSync(join(CLI_ROOT, 'tests', 'fixtures', 'hook-scripts-v6.14.0', 'check-dangerous-cmd.mjs'));
const SHIPPED = join(REPO_ROOT, 'scripts', 'hooks', 'check-dangerous-cmd.mjs');
const REL = 'scripts/hooks/check-dangerous-cmd.mjs';

const temps = [];
const tmp = (p) => { const d = realpathSync(mkdtempSync(join(tmpdir(), p))); temps.push(d); return d; };
afterEach(() => { while (temps.length) rmSync(temps.pop(), { recursive: true, force: true }); });

const put = (root, rel, content = '') => {
  const p = join(root, rel);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, content);
};
const readBytes = (root, rel) => readFileSync(join(root, rel));

function uds(root, args, { bin = UDS } = {}) {
  const r = spawnSync(process.execPath, [bin, 'update', ...args], {
    cwd: root, encoding: 'utf8', env: { ...process.env, UDS_NO_UPDATE_CHECK: '1' },
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
 * A project that has had `uds update --with-hooks` run once, so the hook config AND the scripts are there
 * (the state of every adopter who installed hooks under an earlier version) — then `replaceWith` is put in
 * place of the dangerous-command script, to stand for what that older install left behind.
 */
function projectWithInstalledHooks(replaceWith) {
  const root = tmp('uds-hook-upgrade-');
  put(root, '.standards/manifest.json', JSON.stringify({
    version: '3.3.0',
    upstream: { repo: 'AsiaOstrich/universal-dev-standards', version: '6.14.0', installed: '2026-10-01T00:00:00.000Z' },
    format: 'ai', standards: [], extensions: [], integrations: ['claude-code'], aiTools: [], options: {},
  }, null, 2));
  put(root, 'CLAUDE.md', '# project\n');
  const first = uds(root, ['--with-hooks', '--yes']);
  expect(first.status, first.out).toBe(0);
  expect(existsSync(join(root, '.claude', 'settings.json')), 'setup: the hook config is installed').toBe(true);
  put(root, REL, replaceWith);
  return root;
}

describe('control: the fixture really is the vulnerable script, and the shipped one really blocks', { timeout: 60000 }, () => {
  it('the v6.14.0 script lets `rm -rf /` through with exit 1 (non-blocking); the shipped one exits 2', () => {
    const dir = tmp('uds-hook-old-');
    put(dir, 'check-dangerous-cmd.mjs', OLD_SCRIPT); // the script only acts when its file name is this one
    expect(runHook(join(dir, 'check-dangerous-cmd.mjs'), 'rm -rf /').status).toBe(1);
    expect(runHook(SHIPPED, 'rm -rf /').status).toBe(2);
  });
});

// Each case runs the CLI two or three times; Windows CI is slow at that (see the CHANGELOG "Testing" entry of 6.14.1-beta.1).
describe('uds update --with-hooks on a project whose hooks are already installed', { timeout: 60000 }, () => {
  it('replaces an UNMODIFIED older script, and the replaced script blocks `rm -rf /` with exit 2', () => {
    const root = projectWithInstalledHooks(OLD_SCRIPT);
    expect(runHook(join(root, REL), 'rm -rf /').status, 'precondition: the project is running the old script').toBe(1);

    const r = uds(root, ['--with-hooks']);

    expect(r.status, r.out).toBe(0);
    expect(readBytes(root, REL).equals(readFileSync(SHIPPED)), 'the file on disk is now the shipped one').toBe(true);
    expect(runHook(join(root, REL), 'rm -rf /').status, 'and it blocks').toBe(2);
    expect(runHook(join(root, REL), 'ls -la').status, 'and still allows a harmless command').toBe(0);
    expect(r.out).toMatch(/replaced 1 out-of-date hook script/);
    expect(r.out).toContain('check-dangerous-cmd.mjs');
    expect(r.out).not.toMatch(/Nothing to add/);
  });

  it('an unmodified older script whose line endings were converted to CRLF (autocrlf) is still not an edit', () => {
    const crlf = Buffer.from(OLD_SCRIPT.toString('utf8').replace(/\n/g, '\r\n'), 'utf8');
    expect(crlf.equals(OLD_SCRIPT), 'control: the bytes really differ').toBe(false);
    const root = projectWithInstalledHooks(crlf);
    const r = uds(root, ['--with-hooks']);
    expect(r.status, r.out).toBe(0);
    expect(readBytes(root, REL).equals(readFileSync(SHIPPED))).toBe(true);
  });

  it('keeps an EDITED script byte-for-byte, says it was kept, and says how to force', () => {
    const edited = Buffer.concat([OLD_SCRIPT, Buffer.from('\n// local change: also block "git push --force"\n')]);
    const root = projectWithInstalledHooks(edited);

    const r = uds(root, ['--with-hooks']);

    expect(r.status, r.out).toBe(0);
    expect(readBytes(root, REL).equals(edited), 'the adopter\'s edit survives').toBe(true);
    expect(r.out).toMatch(/1 hook script\(s\) in scripts\/hooks\/ differ from this UDS version and were kept: check-dangerous-cmd\.mjs/);
    expect(r.out).toMatch(/--force/);
    expect(r.out).not.toMatch(/replaced \d+ out-of-date/);
  });

  it('--force replaces an EDITED script even though the hook config is already present', () => {
    const edited = Buffer.concat([OLD_SCRIPT, Buffer.from('\n// local change\n')]);
    const root = projectWithInstalledHooks(edited);

    const r = uds(root, ['--with-hooks', '--force']);

    expect(r.status, r.out).toBe(0);
    expect(readBytes(root, REL).equals(readFileSync(SHIPPED))).toBe(true);
    expect(runHook(join(root, REL), 'rm -rf /').status).toBe(2);
    expect(r.out).toMatch(/overwrote 1 edited hook script/);
  });

  it('--plan names the script it would replace and writes nothing', () => {
    const root = projectWithInstalledHooks(OLD_SCRIPT);
    const r = uds(root, ['--with-hooks', '--plan']);
    expect(r.status, r.out).toBe(0);
    expect(r.out).toMatch(/would replace 1 out-of-date hook script/);
    expect(r.out).toContain('check-dangerous-cmd.mjs');
    expect(readBytes(root, REL).equals(OLD_SCRIPT), 'the plan left the old script alone').toBe(true);
  });

  it('a second run changes nothing and reports nothing to do', () => {
    const root = projectWithInstalledHooks(OLD_SCRIPT);
    expect(uds(root, ['--with-hooks']).status).toBe(0);
    const before = readBytes(root, REL);
    const r = uds(root, ['--with-hooks']);
    expect(r.status, r.out).toBe(0);
    expect(readBytes(root, REL).equals(before)).toBe(true);
    expect(r.out).not.toMatch(/replaced \d+ out-of-date/);
    expect(r.out).toMatch(/Nothing to add/);
  });

  it('records the replaced script in the manifest, with the hash of what is now on disk', () => {
    const root = projectWithInstalledHooks(OLD_SCRIPT);
    // The first install already recorded this path; forget it, so a record found afterwards can only come from the replace.
    const manifestPath = join(root, '.standards', 'manifest.json');
    const before = JSON.parse(readFileSync(manifestPath, 'utf8'));
    expect(before.installedArtifacts.files[REL], 'setup: the install recorded the script').toBeTruthy();
    delete before.installedArtifacts.files[REL];
    writeFileSync(manifestPath, JSON.stringify(before, null, 2));

    expect(uds(root, ['--with-hooks']).status).toBe(0);

    const record = JSON.parse(readFileSync(manifestPath, 'utf8')).installedArtifacts.files[REL];
    expect(record, 'the replace re-recorded it').toBeTruthy();
    expect(record.hash).toBe('sha256:' + createHash('sha256').update(readFileSync(SHIPPED)).digest('hex'));
  });
});

describe('the other `uds update` forms do not replace hook scripts, and say so', { timeout: 60000 }, () => {
  it('`uds update --plan` and `--apply` leave the old script and name the command that replaces it', () => {
    for (const args of [['--plan'], ['--apply', '--yes']]) {
      const root = projectWithInstalledHooks(OLD_SCRIPT);
      const r = uds(root, args);
      expect(readBytes(root, REL).equals(OLD_SCRIPT), `${args.join(' ')} does not manage hook scripts`).toBe(true);
      expect(r.out, args.join(' ')).toMatch(/1 hook script\(s\) in scripts\/hooks\/ are unmodified copies of an older UDS and are NOT updated by this command: check-dangerous-cmd\.mjs/);
      expect(r.out, args.join(' ')).toContain('uds update --with-hooks');
    }
  });

  it('says nothing when the script is current, and nothing when it is the adopter\'s own edit', () => {
    const current = projectWithInstalledHooks(readFileSync(SHIPPED));
    expect(uds(current, ['--plan']).out).not.toMatch(/unmodified copies of an older UDS/);
    const edited = projectWithInstalledHooks(Buffer.concat([OLD_SCRIPT, Buffer.from('\n// mine\n')]));
    expect(uds(edited, ['--plan']).out).not.toMatch(/unmodified copies of an older UDS/);
  });
});

// ── mutation ────────────────────────────────────────────────────────────────

describe('MUTATION: the refresh cut out, the replace assertions turn red', () => {
  let n = 0;
  function mutantCli(edits) {
    const root = tmp(`uds-hook-upgrade-mutant-${n++}-`);
    cpSync(join(CLI_ROOT, 'bin'), join(root, 'bin'), { recursive: true });
    cpSync(join(CLI_ROOT, 'src'), join(root, 'src'), { recursive: true });
    cpSync(join(CLI_ROOT, 'package.json'), join(root, 'package.json'));
    symlinkSync(join(CLI_ROOT, 'node_modules'), join(root, 'node_modules'));
    // The mutant lives in a temp dir: point its hook/standards lookup at the real ones.
    const all = [
      ['src/installers/hooks-installer.js', "const bundled = join(__dirname, '..', '..', 'bundled', ...bundledRel);", `const bundled = join(${JSON.stringify(CLI_ROOT)}, 'bundled', ...bundledRel);`],
      ['src/installers/hooks-installer.js', "const repo = join(__dirname, '..', '..', '..', ...repoRel);", `const repo = join(${JSON.stringify(REPO_ROOT)}, ...repoRel);`],
      ...edits,
    ];
    for (const [file, from, to] of all) {
      const p = join(root, file);
      const src = readFileSync(p, 'utf8');
      expect(src.split(from).length - 1, `mutation anchor must match exactly once in ${file}`).toBe(1);
      writeFileSync(p, src.replace(from, () => to));
    }
    return join(root, 'bin', 'uds.js');
  }

  const refreshedBy = (bin) => {
    const root = projectWithInstalledHooks(OLD_SCRIPT);
    const r = uds(root, ['--with-hooks'], { bin });
    return { r, replaced: readBytes(root, REL).equals(readFileSync(SHIPPED)) };
  };

  it('control: the copy with only the path fix still replaces the script (so the mutation below is what turns it red)', () => {
    const { replaced, r } = refreshedBy(mutantCli([]));
    expect(replaced, r.out).toBe(true);
  }, 60000);

  it('the refresh step removed: the old script stays and nobody is told', () => {
    const bin = mutantCli([['src/installers/hooks-installer.js', 'refreshScripts(projectPath, scripts, { recorder, force: overwriteScripts });', 'void 0;']]);
    const { replaced, r } = refreshedBy(bin);
    expect(replaced).toBe(false);
    expect(r.out).not.toMatch(/replaced \d+ out-of-date/);
  }, 60000);
});
