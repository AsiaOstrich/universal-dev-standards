// `uds update --with-hooks` — enforcement hooks for a project that is ALREADY initialized.
//
// Found 2026-09-29 installing the 6.14.0-beta.1 package into a fresh project: hooks
// were only ever wired by `uds init --with-hooks`, `uds init` refuses to run twice
// ("Standards already initialized"), and `uds update` had no hook option. An existing
// adopter could never receive the hook for a tool UDS started supporting after they
// initialized. Antigravity was also detected only by `.agents/AGENTS.md`.
//
// Everything here runs the real CLI as a subprocess in a temp project. HOME is
// already a throwaway (tests/setup.js), and UDS_NO_UPDATE_CHECK keeps it off the network.
//
// MUTATION at the end: a copy of the CLI with the backfill removed — three different
// ways — must fail the SAME assertion the real CLI passes.

import { describe, it, expect, afterEach } from 'vitest';
import { spawnSync } from 'node:child_process';
import {
  mkdtempSync, rmSync, mkdirSync, writeFileSync, readFileSync, existsSync, cpSync, symlinkSync, realpathSync, readdirSync, statSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';

import { detectAITools, detectAntigravity, ANTIGRAVITY_MARKERS } from '../../../src/utils/detector.js';
import {
  AGY_HOOK_NAME, AGY_HOOK_COMMAND, AGY_HOOK_COMMAND_LEGACY, HOOK_CAPABLE_TOOLS,
  resolveHookTools, hookStatus,
} from '../../../src/installers/hooks-installer.js';

const CLI_ROOT = join(import.meta.dirname, '..', '..', '..');
const UDS = join(CLI_ROOT, 'bin', 'uds.js');

const temps = [];
const tmp = (p) => { const d = realpathSync(mkdtempSync(join(tmpdir(), p))); temps.push(d); return d; };
afterEach(() => { while (temps.length) rmSync(temps.pop(), { recursive: true, force: true }); });

const put = (root, rel, content = '') => {
  const p = join(root, rel);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, content);
  return p;
};
const read = (root, rel) => readFileSync(join(root, rel), 'utf8');
const json = (root, rel) => JSON.parse(read(root, rel));

/** A project that `uds init` already ran in: what `isInitialized` and `update` need, nothing more. */
function initializedProject(files = [], { integrations = [], aiTools = [] } = {}) {
  const root = tmp('uds-with-hooks-');
  put(root, '.standards/manifest.json', JSON.stringify({
    version: '3.3.0',
    upstream: { repo: 'AsiaOstrich/universal-dev-standards', version: '6.13.1', installed: '2026-09-01T00:00:00.000Z' },
    format: 'ai', standards: [], extensions: [], integrations, aiTools, options: {},
  }, null, 2));
  for (const f of files) put(root, f);
  return root;
}

function uds(root, args, { bin = UDS } = {}) {
  const r = spawnSync(process.execPath, [bin, 'update', ...args], {
    cwd: root, encoding: 'utf8', env: { ...process.env, UDS_NO_UPDATE_CHECK: '1' },
  });
  return { status: r.status, out: `${r.stdout}${r.stderr}` };
}

const agyHandlers = (root) => json(root, '.agents/hooks.json')[AGY_HOOK_NAME]?.Stop ?? [];

describe('agy detection: what marks a project as Antigravity', () => {
  it.each(ANTIGRAVITY_MARKERS.map((m) => [m]))('.agents/%s is a marker', (marker) => {
    const root = tmp('uds-detect-');
    put(root, `.agents/${marker}/x.md`); // works for both a file marker (parent dir) and a dir marker
    if (marker === 'AGENTS.md' || marker === 'hooks.json') { rmSync(join(root, '.agents', marker), { recursive: true }); put(root, `.agents/${marker}`, '{}'); }
    expect(detectAntigravity(root)).toBe(true);
    expect(detectAITools(root).antigravity).toBe(true);
  });

  it('a project with rules or workflows but NO .agents/AGENTS.md is detected (the old rule missed it)', () => {
    const root = tmp('uds-detect-');
    put(root, '.agents/rules/style.md');
    expect(existsSync(join(root, '.agents', 'AGENTS.md'))).toBe(false);
    expect(detectAntigravity(root)).toBe(true);
  });

  it('Codex\'s .agents/skills/ is NOT agy: root AGENTS.md + .agents/skills stays Codex', () => {
    const root = tmp('uds-detect-');
    put(root, 'AGENTS.md', '# agents');
    put(root, '.agents/skills/some-skill/SKILL.md', '---\nname: x\n---');
    const d = detectAITools(root);
    expect(d.antigravity).toBe(false);
    expect(d.codex).toBe(true);
  });

  it('.agents/skills/ alone (no root AGENTS.md) is neither', () => {
    const root = tmp('uds-detect-');
    put(root, '.agents/skills/some-skill/SKILL.md');
    expect(detectAITools(root).antigravity).toBe(false);
  });

  it('no .agents/ at all, and an empty .agents/, are not agy', () => {
    const a = tmp('uds-detect-');
    expect(detectAntigravity(a)).toBe(false);
    mkdirSync(join(a, '.agents'));
    expect(detectAntigravity(a)).toBe(false);
  });
});

describe('resolveHookTools: manifest ∪ detected, or exactly what --ai-tool says', () => {
  it('a project whose manifest predates agy support still resolves antigravity from its files', () => {
    const root = initializedProject(['.agents/rules/r.md'], { integrations: ['claude-code'] });
    const r = resolveHookTools(root, JSON.parse(read(root, '.standards/manifest.json')));
    expect(r.tools).toEqual(['claude-code', 'antigravity']);
    expect(r.sources.antigravity).toEqual(['detected in the project']);
    expect(r.sources['claude-code']).toEqual(['manifest']);
  });

  it('a tool in the manifest whose marker files are gone is still resolved', () => {
    const root = initializedProject([], { integrations: ['gemini-cli'] });
    expect(resolveHookTools(root, JSON.parse(read(root, '.standards/manifest.json'))).tools).toEqual(['gemini-cli']);
  });

  it('tools without a hook installer (cursor, windsurf, ...) are never resolved', () => {
    const root = initializedProject(['.cursorrules'], { integrations: ['cursor', 'windsurf'] });
    expect(resolveHookTools(root, JSON.parse(read(root, '.standards/manifest.json'))).tools).toEqual([]);
  });

  it('--ai-tool wins over everything, keeps canonical order, and reports unknown names', () => {
    const root = initializedProject(['.agents/rules/r.md']);
    const r = resolveHookTools(root, null, { aiTool: 'codex, antigravity,nope' });
    expect(r.tools).toEqual(['codex', 'antigravity']);
    expect(r.unknown).toEqual(['nope']);
    expect(r.explicit).toBe(true);
  });
});

describe('uds update --with-hooks', () => {
  it('installs the agy hook into an initialized project that has none', () => {
    const root = initializedProject(['.agents/rules/style.md']);
    expect(existsSync(join(root, '.agents', 'hooks.json'))).toBe(false);
    const r = uds(root, ['--with-hooks', '--yes']);
    expect(r.status, r.out).toBe(0);
    expect(existsSync(join(root, '.agents', 'hooks.json'))).toBe(true);
    expect(agyHandlers(root)).toEqual([{ type: 'command', command: AGY_HOOK_COMMAND, timeout: 30 }]);
    expect(existsSync(join(root, 'scripts', 'hooks', 'check-turn-completion-agy.mjs'))).toBe(true);
    expect(r.out).toMatch(/antigravity: installed/);
  });

  it('running it again does not duplicate the hook, and does not rewrite the file', () => {
    const root = initializedProject(['.agents/rules/style.md']);
    uds(root, ['--with-hooks']);
    const first = read(root, '.agents/hooks.json');
    const again = uds(root, ['--with-hooks']);
    expect(again.status, again.out).toBe(0);
    expect(agyHandlers(root)).toHaveLength(1);
    expect(read(root, '.agents/hooks.json')).toBe(first);
    expect(again.out).toMatch(/antigravity: already installed, not touched/);
    expect(again.out).toMatch(/Nothing to add/);
  });

  it("keeps the adopter's own hooks — under another name, and under UDS's own name", () => {
    const own = {
      'my-formatter': { PostToolUse: [{ type: 'command', command: 'prettier --write .' }] },
      [AGY_HOOK_NAME]: { Stop: [{ type: 'command', command: 'echo the-adopter-put-this-here', timeout: 5 }] },
    };
    const root = initializedProject(['.agents/rules/style.md']);
    put(root, '.agents/hooks.json', JSON.stringify(own, null, 2));
    const r = uds(root, ['--with-hooks']);
    expect(r.status, r.out).toBe(0);
    const after = json(root, '.agents/hooks.json');
    expect(after['my-formatter']).toEqual(own['my-formatter']);
    expect(after[AGY_HOOK_NAME].Stop.map((h) => h.command)).toEqual(['echo the-adopter-put-this-here', AGY_HOOK_COMMAND]);
  });

  it('keeps existing Claude and Codex entries the adopter wrote, adding only ours', () => {
    const root = initializedProject([], { integrations: ['claude-code', 'codex'] });
    put(root, 'AGENTS.md', '# a');
    const claude = { hooks: { Stop: [{ matcher: '', hooks: [{ type: 'command', command: 'echo claude-mine' }] }] }, permissions: { allow: ['Bash(ls)'] } };
    const codex = { hooks: { Stop: [{ hooks: [{ type: 'command', command: 'echo codex-mine' }] }] } };
    put(root, '.claude/settings.json', JSON.stringify(claude));
    put(root, '.codex/hooks.json', JSON.stringify(codex));
    const r = uds(root, ['--with-hooks']);
    expect(r.status, r.out).toBe(0);
    const c = json(root, '.claude/settings.json');
    expect(c.permissions).toEqual(claude.permissions);
    expect(c.hooks.Stop[0]).toEqual(claude.hooks.Stop[0]);
    expect(JSON.stringify(c.hooks)).toMatch(/check-turn-completion\.mjs/);
    const x = json(root, '.codex/hooks.json');
    expect(x.hooks.Stop[0]).toEqual(codex.hooks.Stop[0]);
    expect(JSON.stringify(x.hooks)).toMatch(/check-turn-completion-codex\.mjs/);
  });

  it('--plan reads and reports, and writes nothing', () => {
    const root = initializedProject(['.agents/rules/style.md', 'AGENTS.md', 'GEMINI.md'], { integrations: ['claude-code'] });
    const before = tree(root);
    const r = uds(root, ['--with-hooks', '--plan']);
    expect(r.status, r.out).toBe(0);
    expect(tree(root)).toEqual(before);
    expect(r.out).toMatch(/plan \(nothing is written\)/);
    expect(r.out).toMatch(/antigravity: would install/);
  });

  it('--ai-tool installs for a tool that detection cannot see', () => {
    const root = initializedProject();
    const r = uds(root, ['--with-hooks', '--ai-tool', 'antigravity']);
    expect(r.status, r.out).toBe(0);
    expect(agyHandlers(root)).toHaveLength(1);
  });

  it('with no tool it can find, says how to specify one and exits 1 — and writes nothing', () => {
    const root = initializedProject();
    const before = tree(root);
    const r = uds(root, ['--with-hooks', '--yes']);
    expect(r.status).toBe(1);
    expect(r.out).toMatch(/Could not tell which AI tool/);
    expect(r.out).toMatch(/uds update --with-hooks --ai-tool <tool>/);
    for (const t of HOOK_CAPABLE_TOOLS) expect(r.out).toContain(t);
    expect(r.out).toMatch(/\.agents\/skills\/ is shared with Codex/);
    expect(tree(root)).toEqual(before);
  });

  it('an unknown --ai-tool exits 1 and lists the tools that have hooks', () => {
    const root = initializedProject();
    const r = uds(root, ['--with-hooks', '--ai-tool', 'cursor']);
    expect(r.status).toBe(1);
    expect(r.out).toMatch(/No hook installer for: cursor/);
    expect(r.out).toMatch(/antigravity/);
  });

  it('a hooks.json that is not valid JSON is left untouched and reported, exit 1', () => {
    const root = initializedProject(['.agents/rules/style.md']);
    put(root, '.agents/hooks.json', '{ not json');
    const r = uds(root, ['--with-hooks']);
    expect(r.status).toBe(1);
    expect(read(root, '.agents/hooks.json')).toBe('{ not json');
    expect(r.out).toMatch(/left untouched/);
  });

  it("replaces agy's pre-fix command (which does not resolve from agy's cwd) instead of adding a second one", () => {
    const root = initializedProject();
    put(root, '.agents/hooks.json', JSON.stringify({ [AGY_HOOK_NAME]: { Stop: [{ type: 'command', command: AGY_HOOK_COMMAND_LEGACY, timeout: 30 }] } }));
    expect(hookStatus(root, 'antigravity').status).toBe('stale');
    const r = uds(root, ['--with-hooks']);
    expect(r.status, r.out).toBe(0);
    expect(agyHandlers(root).map((h) => h.command)).toEqual([AGY_HOOK_COMMAND]);
    expect(r.out).toMatch(/replaced an out-of-date UDS entry/);
  });

  it('a hook script the adopter edited is kept unless --force', () => {
    const root = initializedProject(['.agents/rules/style.md']);
    put(root, 'scripts/hooks/check-turn-completion-agy.mjs', '// edited by the adopter\n');
    const r = uds(root, ['--with-hooks']);
    expect(r.status, r.out).toBe(0);
    expect(read(root, 'scripts/hooks/check-turn-completion-agy.mjs')).toBe('// edited by the adopter\n');
    expect(r.out).toMatch(/differ from this UDS version and were kept/);
    expect(r.out).toMatch(/--force/);
    // and the hook itself was still added
    expect(agyHandlers(root)).toHaveLength(1);

    const root2 = initializedProject(['.agents/rules/style.md']);
    put(root2, 'scripts/hooks/check-turn-completion-agy.mjs', '// edited by the adopter\n');
    expect(uds(root2, ['--with-hooks', '--force']).status).toBe(0);
    expect(read(root2, 'scripts/hooks/check-turn-completion-agy.mjs')).not.toBe('// edited by the adopter\n');
  });

  it('says so when combined with a flag that does not compose', () => {
    const root = initializedProject(['.agents/rules/style.md']);
    const r = uds(root, ['--with-hooks', '--skills']);
    expect(r.out).toMatch(/does not compose; --skills ignored/);
  });

  it('`uds init --with-hooks` in an initialized project points at this command instead of silently doing nothing', () => {
    const root = initializedProject();
    const r = spawnSync(process.execPath, [UDS, 'init', '-y', '--with-hooks'], { cwd: root, encoding: 'utf8', env: { ...process.env, UDS_NO_UPDATE_CHECK: '1' } });
    expect(`${r.stdout}${r.stderr}`).toMatch(/uds update --with-hooks/);
  });
});

/** { relative path: size } for every file under root — what "wrote nothing" is measured against. */
function tree(root) {
  const out = {};
  const walk = (dir, rel = '') => {
    for (const name of readdirSyncSafe(dir)) {
      const p = join(dir, name);
      const r = rel ? `${rel}/${name}` : name;
      if (isDir(p)) walk(p, r); else out[r] = readFileSync(p).length;
    }
  };
  walk(root);
  return out;
}
const readdirSyncSafe = (d) => readdirSync(d);
const isDir = (p) => statSync(p).isDirectory();

// ── mutation ────────────────────────────────────────────────────────────────

describe('MUTATION: the backfill removed, three ways, each turns the assertion red', () => {
  let n = 0;
  function mutantCli(edits) {
    const root = tmp(`uds-with-hooks-mutant-${n++}-`);
    cpSync(join(CLI_ROOT, 'bin'), join(root, 'bin'), { recursive: true });
    cpSync(join(CLI_ROOT, 'src'), join(root, 'src'), { recursive: true });
    cpSync(join(CLI_ROOT, 'package.json'), join(root, 'package.json'));
    symlinkSync(join(CLI_ROOT, 'node_modules'), join(root, 'node_modules'));
    for (const [file, from, to] of edits) {
      const p = join(root, file);
      const src = readFileSync(p, 'utf8');
      expect(src.split(from).length - 1, `mutation anchor must match exactly once in ${file}`).toBe(1);
      writeFileSync(p, src.replace(from, () => to));
    }
    return join(root, 'bin', 'uds.js');
  }

  // NB: the mutant CLI lives in a temp dir, so hooksSourceDir()/standardsSourceDir() fall back
  // to `<cli>/bundled/...` or `<cli>/../scripts/hooks`. Point them at the real ones.
  const pointAtRealHooks = [
    ['src/installers/hooks-installer.js',
      "const bundled = join(__dirname, '..', '..', 'bundled', ...bundledRel);",
      `const bundled = join(${JSON.stringify(CLI_ROOT)}, 'bundled', ...bundledRel);`],
    ['src/installers/hooks-installer.js',
      "const repo = join(__dirname, '..', '..', '..', ...repoRel);",
      `const repo = join(${JSON.stringify(join(CLI_ROOT, '..'))}, ...repoRel);`],
  ];

  const project = () => initializedProject(['.agents/rules/style.md']);
  const installedBy = (bin) => {
    const root = project();
    const r = uds(root, ['--with-hooks'], { bin });
    return { root, r, wrote: existsSync(join(root, '.agents', 'hooks.json')) };
  };

  it('control: the copy with only the path fix installs the hook (so the mutations below are what turn it red)', () => {
    const bin = mutantCli(pointAtRealHooks);
    const { wrote, r } = installedBy(bin);
    expect(wrote, r.out).toBe(true);
  }, 60000);

  it('the --with-hooks branch removed: no hook is installed', () => {
    const bin = mutantCli([...pointAtRealHooks, ['src/commands/update.js', 'await updateHooksOnly(projectPath, manifest, options);', 'void 0;']]);
    expect(installedBy(bin).wrote).toBe(false);
  }, 60000);

  it('the installer that reports success and writes nothing (the worst shape): the file is still absent', () => {
    const bin = mutantCli([...pointAtRealHooks, ['src/installers/hooks-installer.js', "antigravity: (p, o) => installAgyHooks(p, o),", "antigravity: () => ({ installed: true, settingsPath: '' }),"]]);
    const { wrote, r } = installedBy(bin);
    expect(r.out).toMatch(/antigravity: installed/); // it SAYS it worked
    expect(wrote).toBe(false); // and did not — which is what the file assertion above exists to catch
  }, 60000);

  it('detection narrowed back to .agents/AGENTS.md alone: a project with .agents/rules/ is not found', () => {
    const bin = mutantCli([...pointAtRealHooks, ['src/utils/detector.js', "['AGENTS.md', 'hooks.json', 'rules', 'workflows', 'plugins']", "['AGENTS.md']"]]);
    const { wrote, r } = installedBy(bin);
    expect(wrote).toBe(false);
    expect(r.status).toBe(1);
  }, 60000);
});
