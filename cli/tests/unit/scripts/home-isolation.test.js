// Nothing that runs the UDS CLI in a subprocess may write to the real HOME.
//
// 2026-09-29: `bash scripts/pre-release-check.sh` wrote 54 skill folders and a
// `.manifest.json` into the maintainer's real ~/.claude/skills. A user-level skill
// shadows the project-level one, so his zh-TW project silently ran the English test
// build. Every step was green; the steps that did it ran in a mkdtemp() directory,
// which isolates the PROJECT, not the user — `uds init -y` / `uds update` write
// user-level files wherever they run.
//
// Three layers, and this file holds the first two:
//   1. A walk of every script that spawns the CLI: each spawn passes an isolated
//      environment. Walked, not listed — a new caller is checked without anyone
//      remembering to add it. (Mutation: strip the isolation from a real call
//      site's text and the walk goes red.)
//   2. The test suite itself: tests/setup.js replaces HOME before any test runs.
//      (Mutation: run the same probe test with and without that setup.)
//   3. scripts/check-home-untouched.mjs, wired into pre-release-check.sh: what
//      actually happened to the real home over a whole run. Its own end-to-end
//      mutation is below (a real `uds init` with and without the isolation).
//
// Every fixture is under mkdtempSync(join(tmpdir(), ...)); the real HOME is never
// touched — where "the real home" is needed it is a temp directory standing in.

import { describe, it, expect, afterEach } from 'vitest';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync, realpathSync, cpSync } from 'node:fs';
import { tmpdir, homedir } from 'node:os';
import path, { join, relative } from 'node:path';

import { isolatedEnv, isolatedHome, HOME_ENV_KEYS } from '../../../../scripts/lib/isolated-home.mjs';

const CLI_ROOT = join(import.meta.dirname, '..', '..', '..');
const REPO_ROOT = join(CLI_ROOT, '..');
const UDS = join(CLI_ROOT, 'bin', 'uds.js');
const GUARD = join(REPO_ROOT, 'scripts', 'check-home-untouched.mjs');

const temps = [];
const tmp = (p) => { const d = realpathSync(mkdtempSync(join(tmpdir(), p))); temps.push(d); return d; };
afterEach(() => { while (temps.length) rmSync(temps.pop(), { recursive: true, force: true }); });

// ── layer 1: the walk ───────────────────────────────────────────────────────

/** Every script that could run the CLI: scripts/ and cli/scripts/, not node_modules, not this helper's own lib. */
function walkScripts() {
  const out = [];
  const visit = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (e.name === 'node_modules' || e.name === 'bundled') continue;
      const p = join(dir, e.name);
      if (e.isDirectory()) visit(p);
      else if (/\.(mjs|js|ts|sh)$/.test(e.name)) out.push(p);
    }
  };
  for (const d of [join(REPO_ROOT, 'scripts'), join(CLI_ROOT, 'scripts')]) visit(d);
  return out.filter((p) => !p.includes(`${join('scripts', 'lib')}`));
}

// The CLI entry point named in code: by path, or by the identifiers this repo's scripts give it.
const UDS_MENTION = /UDS_BIN|uds\.js|cliBin|DEV_CLI_BIN|\bconst CLI\s*=/;
// A call whose first argument is a literal name of an ordinary tool that cannot run the CLI.
const BENIGN_TOOL = /^\(\s*['"](?:mkdir|rm|cp|mv|ls|cat|which|tar)['"]/;

/** Does a non-comment line mention the CLI entry point? */
function namesTheCliInCode(text) {
  return text.split('\n').some((l) => {
    const t = l.trim();
    return t && !t.startsWith('//') && !t.startsWith('*') && !t.startsWith('/*') && UDS_MENTION.test(t);
  });
}

const ISOLATED_ENV_ARG = /\benv\s*:\s*[^,}\n]*(?:iso|ISO|homeEnv|probeEnv)/;

// Text of every spawn / exec call (spawn, spawnSync, execSync, execFileSync), by balanced parentheses.
function spawnCalls(text) {
  const calls = [];
  const re = /\b(execFileSync|execSync|spawnSync|spawn)\s*\(/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    let depth = 0;
    let i = m.index + m[0].length - 1;
    const start = i;
    for (; i < text.length; i++) {
      const c = text[i];
      if (c === '(') depth++;
      else if (c === ')') { depth--; if (depth === 0) break; }
    }
    calls.push({ at: m.index, body: text.slice(start, i + 1) });
  }
  return calls;
}

/**
 * Where a script runs the UDS CLI without an isolated environment.
 * JS/TS: a spawn or exec call whose arguments name the CLI must carry `env: <isolated>`.
 * bash:  a line that executes the CLI must go through `run_isolated`.
 * @returns {string[]} one description per violation
 */
export function findUnisolatedCliCalls(text, file) {
  const bad = [];
  if (file.endsWith('.sh')) {
    text.split('\n').forEach((line, i) => {
      const t = line.trim();
      if (!t || t.startsWith('#') || /^(echo|printf)\b/.test(t) || /\becho\b/.test(t)) return;
      if (/^\*npx\*|^--cli=|^case\b|^\*\)/.test(t)) return;
      const runsCli = /\bnode\s+["']?[^\n"']*uds\.js/.test(t) || /\$CLI_UNDER_TEST/.test(t) || /\bnpx\b[^\n]*universal-dev-standards/.test(t);
      if (runsCli && !/run_isolated/.test(t)) bad.push(`line ${i + 1}: ${t.slice(0, 90)}`);
    });
    return bad;
  }
  // A file that names the CLI in code: every spawn in it is judged, not only the ones whose
  // arguments spell the CLI out — `spawn(cmd, args)` in a helper that is later handed the CLI
  // is exactly the call a spelled-out match would miss (cli/scripts/test-upgrade-path.mjs).
  // Calls to a plain non-CLI tool by literal name are the only exception.
  if (!namesTheCliInCode(text)) return bad;
  for (const c of spawnCalls(text)) {
    if (BENIGN_TOOL.test(c.body)) continue;
    if (!ISOLATED_ENV_ARG.test(c.body)) bad.push(`offset ${c.at}: ${c.body.replace(/\s+/g, ' ').slice(0, 90)}`);
  }
  return bad;
}

/**
 * A repo-relative path with `/` separators on every platform. The lists in this file are
 * written with `/`; on Windows `relative()` returns `scripts\\check-upgrade-fidelity.sh`, so the
 * walk "did not reach" a file it had in fact found (windows-latest, 6.14.0-beta.2).
 * `pathMod` is a parameter only so the Windows behaviour can be exercised on any host.
 */
export const posixRel = (from, to, pathMod = path) => pathMod.relative(from, to).split(pathMod.sep).join('/');

const CANDIDATES = walkScripts().filter((p) => {
  const text = readFileSync(p, 'utf8');
  if (p.endsWith('.sh')) return /\bnode\s+["']?[^\n"']*uds\.js|\$CLI_UNDER_TEST|\bnpx\b[^\n]*universal-dev-standards@?/.test(text.split('\n').filter((l) => !l.trim().startsWith('#')).join('\n'));
  return namesTheCliInCode(text) && spawnCalls(text).some((c) => !BENIGN_TOOL.test(c.body));
});

describe('every script that runs the UDS CLI runs it under an isolated HOME', () => {
  it('the walk finds the call sites (a walk that finds nothing passes everything)', () => {
    const rels = CANDIDATES.map((p) => posixRel(REPO_ROOT, p)).sort();
    // The call sites known on 2026-09-29. New ones are found by the walk, not added here; this
    // list only proves the walk reaches each family (bash, mjs, ts, cli/scripts).
    for (const known of [
      'scripts/check-upgrade-fidelity.sh',
      'scripts/check-prompt-footprint.mjs',
      'scripts/check-adopter-instruction-files.ts',
      'scripts/check-skills-install-paths.ts',
      'scripts/generate-usage-docs.mjs',
      'scripts/pre-release-check.sh',
      'cli/scripts/check-command-existence.mjs',
      'cli/scripts/test-upgrade-path.mjs',
      'cli/scripts/test-refactoring.sh',
    ]) expect(rels, `the walk did not reach ${known}`).toContain(known);
    expect(CANDIDATES.length).toBeGreaterThanOrEqual(9);
  });

  it('compares repo-relative paths with "/" even where the separator is a backslash (Windows)', () => {
    const win = path.win32;
    // the premise: this is what `relative()` hands back on Windows, and why the walk missed
    expect(win.relative('C:\\r', 'C:\\r\\scripts\\check-upgrade-fidelity.sh')).toBe('scripts\\check-upgrade-fidelity.sh');
    expect(posixRel('C:\\r', 'C:\\r\\scripts\\check-upgrade-fidelity.sh', win)).toBe('scripts/check-upgrade-fidelity.sh');
    expect(posixRel('/r', '/r/cli/scripts/test-refactoring.sh', path.posix)).toBe('cli/scripts/test-refactoring.sh');
  });

  it.each(CANDIDATES.map((p) => [posixRel(REPO_ROOT, p), p]))('%s', (_rel, p) => {
    expect(findUnisolatedCliCalls(readFileSync(p, 'utf8'), p)).toEqual([]);
  });

  describe('MUTATION: strip the isolation from a real call site and the walk goes red', () => {
    const strip = {
      'scripts/check-adopter-instruction-files.ts': (t) => t.replace('env: ISO_HOME.env,', ''),
      'scripts/check-prompt-footprint.mjs': (t) => t.replace('env: iso.env,', ''),
      'scripts/check-skills-install-paths.ts': (t) => t.replace('env: { ...iso.env, CI: "1" }', 'env: { ...process.env, CI: "1" }'),
      'scripts/generate-usage-docs.mjs': (t) => t.replace('env: iso.env,', ''),
      'cli/scripts/check-command-existence.mjs': (t) => t.replace('env: probeEnv(),', ''),
      'cli/scripts/test-upgrade-path.mjs': (t) => t.replaceAll('env: homeEnv()', 'env: process.env').replaceAll('...homeEnv()', '...process.env'),
      'scripts/check-upgrade-fidelity.sh': (t) => t.replaceAll('run_isolated ', ''),
      'scripts/pre-release-check.sh': (t) => t.replaceAll('run_isolated ', ''),
      'cli/scripts/test-refactoring.sh': (t) => t.replaceAll('run_isolated ', ''),
    };
    it.each(Object.entries(strip))('%s', (rel, mutate) => {
      const p = join(REPO_ROOT, rel);
      const real = readFileSync(p, 'utf8');
      const mutant = mutate(real);
      expect(mutant, `the mutation of ${rel} changed nothing`).not.toBe(real);
      expect(findUnisolatedCliCalls(real, p)).toEqual([]);
      expect(findUnisolatedCliCalls(mutant, p).length, `stripping isolation from ${rel} was not caught`).toBeGreaterThan(0);
    });

    it('a NEW caller with no isolation is caught without being listed anywhere', () => {
      const fresh = "import { execFileSync } from 'node:child_process';\nconst UDS_BIN = 'x';\nexecFileSync('node', [UDS_BIN, 'init', '-y'], { cwd: dir });\n";
      expect(findUnisolatedCliCalls(fresh, 'new-check.mjs').length).toBe(1);
      expect(findUnisolatedCliCalls(fresh.replace('{ cwd: dir }', '{ cwd: dir, env: iso.env }'), 'new-check.mjs')).toEqual([]);
    });
  });
});

// ── the helper ──────────────────────────────────────────────────────────────

describe('isolated-home', () => {
  it('replaces every variable that decides where a per-user file lands', () => {
    const h = isolatedHome({ base: { HOME: '/real/home', PATH: process.env.PATH } });
    temps.push(h.home);
    for (const k of HOME_ENV_KEYS) expect(h.env[k], k).toBeDefined();
    expect(h.env.HOME).toBe(h.home);
    expect(h.env.USERPROFILE).toBe(h.home);
    expect(h.env.XDG_CONFIG_HOME.startsWith(h.home)).toBe(true);
    expect(h.env.PATH).toBe(process.env.PATH); // everything else is inherited
    expect(h.env.npm_config_cache).toBe(join('/real/home', '.npm')); // npx keeps its package cache
  });

  it('the bash helper reads the SAME list from the mjs (one list, not two)', () => {
    const dir = tmp('uds-iso-sh-');
    const r = spawnSync('bash', ['-c', `. "${join(REPO_ROOT, 'scripts', 'lib', 'isolated-home.sh')}"; uds_isolated_home_init || exit 3; run_isolated env; uds_isolated_home_cleanup`], { encoding: 'utf8', cwd: dir });
    expect(r.status, r.stderr).toBe(0);
    for (const k of ['HOME', 'USERPROFILE', 'XDG_CONFIG_HOME', 'XDG_DATA_HOME', 'CODEX_HOME', 'APPDATA']) {
      expect(r.stdout, k).toMatch(new RegExp(`^${k}=`, 'm'));
    }
    const home = /^HOME=(.*)$/m.exec(r.stdout)[1];
    expect(home).not.toBe(homedir());
    expect(existsSync(home)).toBe(false); // cleaned up
  });
});

// ── layer 2: the test suite ─────────────────────────────────────────────────

describe('the test suite runs under an isolated HOME', () => {
  it('HOME is not the real one, and lives under the temp directory', () => {
    const real = process.env.UDS_TEST_REAL_HOME;
    expect(real, 'tests/setup.js did not record the real HOME').toBeTruthy();
    expect(process.env.HOME).not.toBe(real);
    expect(homedir()).not.toBe(real);
    expect(homedir().startsWith(realpathSync(tmpdir()))).toBe(true);
    expect(process.env.USERPROFILE).toBe(process.env.HOME);
  });

  it('MUTATION: the same probe run WITHOUT tests/setup.js sees the real HOME; with it, it does not', () => {
    const fakeReal = tmp('uds-fake-real-home-');
    const root = tmp('uds-probe-root-');
    writeFileSync(join(root, 'probe.test.js'), "import { it, expect } from 'vitest';\nimport { homedir } from 'node:os';\nit('home is isolated', () => { expect(homedir()).not.toBe(process.env.UDS_TEST_REAL_HOME || process.env.PROBE_REAL_HOME); });\n");
    const cfg = (setup) => `export default { test: { include: ['probe.test.js'], globals: true, setupFiles: [${setup ? JSON.stringify(join(CLI_ROOT, 'tests', 'setup.js')) : ''}] } };\n`;
    const run = (setup) => {
      writeFileSync(join(root, 'vitest.config.js'), cfg(setup));
      return spawnSync(process.execPath, [join(CLI_ROOT, 'node_modules', 'vitest', 'vitest.mjs'), 'run', '--root', root, '--config', join(root, 'vitest.config.js')], {
        encoding: 'utf8', cwd: root, env: { ...process.env, HOME: fakeReal, USERPROFILE: fakeReal, PROBE_REAL_HOME: fakeReal, UDS_TEST_REAL_HOME: '', CI: '1' },
      });
    };
    expect(run(true).status, 'with the setup file the probe must pass').toBe(0);
    expect(run(false).status, 'without the setup file the probe must FAIL: that is the defect').not.toBe(0);
  }, 60000);

  it('tests/setup.js is what vitest.config.js loads (removing the line is removing the isolation)', () => {
    expect(readFileSync(join(CLI_ROOT, 'vitest.config.js'), 'utf8')).toMatch(/setupFiles:\s*\[\s*'\.\/tests\/setup\.js'\s*\]/);
    expect(readFileSync(join(CLI_ROOT, 'tests', 'setup.js'), 'utf8')).toMatch(/isolatedHome\(/);
  });
});

// ── layer 3: the guard, end to end ──────────────────────────────────────────

describe('check-home-untouched: end to end with the real CLI', () => {
  function project() {
    const p = tmp('uds-home-proj-');
    mkdirSync(join(p, '.claude'));
    return p;
  }
  const guard = (fakeReal, ...args) => spawnSync(process.execPath, [GUARD, ...args], { encoding: 'utf8', env: { ...process.env, HOME: fakeReal, USERPROFILE: fakeReal } });
  const writer = (cwd, env) => spawnSync(process.execPath, [UDS, 'init', '-y', '--skills-location', 'user'], { cwd, encoding: 'utf8', env: { ...process.env, ...env, UDS_NO_UPDATE_CHECK: '1' } });

  it('its own self-test passes', () => {
    const fakeReal = tmp('uds-fake-real-home-');
    const r = guard(fakeReal, '--self-test');
    expect(r.status, r.stdout + r.stderr).toBe(0);
  });

  it('GREEN: the CLI run under an isolated HOME leaves the (stand-in) real home untouched', () => {
    const fakeReal = tmp('uds-fake-real-home-');
    const snap = join(tmp('uds-snap-'), 's.json');
    expect(guard(fakeReal, 'snapshot', snap).status).toBe(0);
    const iso = isolatedHome();
    temps.push(iso.home);
    const w = writer(project(), iso.env);
    expect(w.status, w.stdout + w.stderr).toBe(0);
    // the run really did write user-level skills — into the isolated home, which is the point
    expect(existsSync(join(iso.home, '.claude', 'skills'))).toBe(true);
    const c = guard(fakeReal, 'compare', snap);
    expect(c.status, c.stdout).toBe(0);
  });

  it('MUTATION: the same run WITHOUT the isolation writes into the stand-in real home and the guard goes red, listing the path', () => {
    const fakeReal = tmp('uds-fake-real-home-');
    const snap = join(tmp('uds-snap-'), 's.json');
    expect(guard(fakeReal, 'snapshot', snap).status).toBe(0);
    const w = writer(project(), { HOME: fakeReal, USERPROFILE: fakeReal }); // isolation removed
    expect(w.status, w.stdout + w.stderr).toBe(0);
    const c = guard(fakeReal, 'compare', snap);
    expect(c.status, c.stdout).toBe(1);
    expect(c.stdout).toMatch(/~\/\.claude\/skills/);
    expect(c.stdout).toMatch(/FAIL: this run wrote into the real home/);
  });

  it('it watches what the installers name, walked from the source: the snapshot lists ~/.claude/skills, ~/.uds and ~/.agents/skills without anyone typing them', () => {
    const fakeReal = tmp('uds-fake-real-home-');
    const snap = join(tmp('uds-snap-'), 's.json');
    expect(guard(fakeReal, 'snapshot', snap).status).toBe(0);
    const watched = JSON.parse(readFileSync(snap, 'utf8')).watched.map((p) => relative(fakeReal, p).split('\\').join('/'));
    for (const w of ['.claude/skills', '.uds', '.udsrc', '.agents/skills', '.gemini/skills']) expect(watched, w).toContain(w);
    expect(watched.length).toBeGreaterThan(20);
  });

  it('a snapshot over an empty set is exit 2, not a pass (the source directory moved)', () => {
    // simulate: point discovery at nothing by running the guard from a copy with no cli/src
    const root = tmp('uds-guard-copy-');
    mkdirSync(join(root, 'scripts'));
    writeFileSync(join(root, 'scripts', 'check-home-untouched.mjs'), readFileSync(GUARD, 'utf8'));
    const fakeReal = tmp('uds-fake-real-home-');
    const r = spawnSync(process.execPath, [join(root, 'scripts', 'check-home-untouched.mjs'), 'snapshot', join(root, 's.json')], { encoding: 'utf8', env: { ...process.env, HOME: fakeReal, USERPROFILE: fakeReal } });
    expect(r.status).toBe(2);
    expect(r.stderr).toMatch(/CANNOT MEASURE/);
    expect(r.stderr).toMatch(/installer source directory was not found/);
  });
});

describe('check-home-untouched: the exclusion of ~/.claude/skills/synced (owned by Claude Code)', () => {
  // 2026-09-30: the first full run on a real HOME failed on ~/.claude/skills/synced/<id>/manifest.json
  // and .last-complete-round, written by the Claude Code session that ran the check.
  const SRC = readFileSync(GUARD, 'utf8');
  const EXCL = "{ rel: '.claude/skills/synced',";

  /** Run a copy of the guard (edited text) against a stand-in home; returns compare's exit + output. */
  function scenario(guardText, { touch }) {
    const root = tmp('uds-guard-mut-');
    mkdirSync(join(root, 'scripts'));
    cpSync(join(REPO_ROOT, 'cli', 'src'), join(root, 'cli', 'src'), { recursive: true });
    writeFileSync(join(root, 'scripts', 'check-home-untouched.mjs'), guardText);
    const home = tmp('uds-fake-real-home-');
    mkdirSync(join(home, '.claude', 'skills', 'synced', 'acct'), { recursive: true });
    writeFileSync(join(home, '.claude', 'skills', 'synced', 'acct', 'manifest.json'), '{}');
    const env = { ...process.env, HOME: home, USERPROFILE: home };
    const run = (...a) => spawnSync(process.execPath, [join(root, 'scripts', 'check-home-untouched.mjs'), ...a], { encoding: 'utf8', env });
    const snap = join(root, 's.json');
    expect(run('snapshot', snap).status).toBe(0);
    touch(home);
    return run('compare', snap);
  }
  const touchSynced = (h) => { writeFileSync(join(h, '.claude', 'skills', 'synced', 'acct', 'manifest.json'), '{"x":1}'); writeFileSync(join(h, '.claude', 'skills', 'synced', 'acct', '.last-complete-round'), '1'); };
  const touchSibling = (h) => { mkdirSync(join(h, '.claude', 'skills', 'plan'), { recursive: true }); writeFileSync(join(h, '.claude', 'skills', 'plan', 'SKILL.md'), 'x'); };

  it('the exclusion is one list, each entry with a stated reason', () => {
    expect(SRC.split(EXCL).length - 1).toBe(1);
    expect(SRC).toMatch(/rel: '\.claude\/skills\/synced', why: 'owned by Claude Code, never written by UDS/);
  });

  it('a change under synced/ is not a failure, and compare prints what it excluded', () => {
    const r = scenario(SRC, { touch: touchSynced });
    expect(r.status, r.stdout).toBe(0);
    expect(r.stdout).toMatch(/excluded 1 \(~\/\.claude\/skills\/synced — owned by Claude Code/);
  });

  it('a change anywhere else under ~/.claude/skills still fails', () => {
    const r = scenario(SRC, { touch: touchSibling });
    expect(r.status, r.stdout).toBe(1);
    expect(r.stdout).toMatch(/~\/\.claude\/skills\/plan/);
  });

  it('MUTATION: the exclusion removed -> a change under synced/ fails (this is the false red it fixes)', () => {
    const r = scenario(SRC.replace(EXCL, "{ rel: '.claude/skills/__nothing__',"), { touch: touchSynced });
    expect(r.status).toBe(1);
  });

  it('MUTATION: the exclusion widened to all of skills/ -> a stray UDS skill install goes unseen (the bug the guard exists for)', () => {
    const r = scenario(SRC.replace(EXCL, "{ rel: '.claude/skills',"), { touch: touchSibling });
    expect(r.status, 'a widened exclusion must NOT be tolerated: this run should have been red').toBe(0);
    // ... which is exactly why the real one is narrow: the same touch is red for the real guard
    expect(scenario(SRC, { touch: touchSibling }).status).toBe(1);
  });
});

describe('pre-release-check.sh carries the guard', () => {
  const text = readFileSync(join(REPO_ROOT, 'scripts', 'pre-release-check.sh'), 'utf8');
  it('snapshots before the first check, evaluates at the summary, and refuses to run if it cannot snapshot', () => {
    expect(text).toMatch(/check-home-untouched\.mjs" snapshot/);
    expect(text).toMatch(/check-home-untouched\.mjs" compare/);
    expect(text).toMatch(/check-home-untouched\.mjs" --self-test/);
    expect(text.indexOf('check-home-untouched.mjs" snapshot')).toBeLessThan(text.indexOf('run_check "2"'));
    expect(text).toMatch(/could not take its snapshot[\s\S]{0,200}exit 1/);
    expect(text).toMatch(/show_summary\(\) \{\s*\n\s*# Evaluate the HOME write guard/);
  });
});
