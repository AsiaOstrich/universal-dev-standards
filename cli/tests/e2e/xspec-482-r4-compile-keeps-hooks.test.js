/**
 * E2E: `uds compile` merges into .claude/settings.json the way `uds init --with-hooks` writes it, keeps the user's own
 * hooks, and writes nothing for a hook script that is not in the project (dev-platform XSPEC-482 R4, macOS N4).
 *
 *   (a) it replaced the whole entry list of every event it touched, so the user's own `Edit` hook was deleted;
 *   (b) it wrote the matcher as an object (`{"tool":"Bash"}`) where `init --with-hooks` writes the string `"Bash"`.
 *       Claude Code documents the matcher as a string: https://code.claude.com/docs/en/hooks ("Matcher patterns":
 *       `"Bash"`, `"Edit|Write"`, `"*"`/`""` for all; a regular expression when other characters appear). An object
 *       is not a documented form;
 *   (c) in a project with no scripts/hooks/ it still wrote entries that name scripts that are not there.
 *
 * Every test runs the real CLI in a throwaway project and reads settings.json and the printed lines back.
 *
 * Wires that make these red when cut (one line of CLI source each):
 *   cli/src/commands/compile.js                 settings.hooks[event] = mergeHookArray(settings.hooks[event] || [], incoming); // wire:compile-merges-hooks
 *   cli/src/compilers/claude-code-compiler.js   : normalizeMatcher(declared); // wire:compile-matcher-is-a-string
 *   cli/src/commands/compile.js                 ... existsSync(join(projectPath, script))) return true; // wire:compile-skips-missing-script
 */

import { it, expect, afterAll } from 'vitest';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { createHarness } from '../utils/staged-cli-harness.js';
import { out } from '../utils/xspec-482.js';

const h = createHarness('xspec482-r4');
afterAll(() => h.cleanup());

const SETTINGS = (dir) => join(dir, '.claude', 'settings.json');
const readSettings = (dir) => JSON.parse(readFileSync(SETTINGS(dir), 'utf-8'));
const MINE_EDIT = { matcher: 'Edit', hooks: [{ type: 'command', command: 'echo my-edit-hook' }] };
const MINE_BASH = { matcher: 'Bash', hooks: [{ type: 'command', command: 'echo my-bash-hook' }] };

async function projectWithHooks() {
  const dir = h.makeDir('hooks');
  mkdirSync(join(dir, '.claude'), { recursive: true });
  const init = await h.runCli(['init', '--yes', '--skills-location', 'project', '--with-hooks'], dir);
  expect(init.code, out(init)).toBe(0);
  expect(existsSync(SETTINGS(dir)), 'fixture: init --with-hooks wrote settings.json').toBe(true);
  return dir;
}

/** Every UDS entry as "event | matcher | command" lines, sorted: the shape that is compared between init and compile. */
const udsEntries = (settings) => Object.entries(settings.hooks).flatMap(([event, list]) => list
  .filter((e) => (e.hooks?.[0]?.command || '').startsWith('node scripts/hooks/'))
  .map((e) => `${event} | ${JSON.stringify(e.matcher)} | ${e.hooks[0].command}`)).sort();

it('uds compile after init --with-hooks keeps the user\'s own hooks and writes the same UDS entries init wrote, once, with string matchers (XSPEC-482 R4a, R4b)', async () => {
  const dir = await projectWithHooks();
  const initSettings = readSettings(dir);
  const fromInit = udsEntries(initSettings);
  expect(fromInit.length, 'fixture: several UDS hooks installed').toBeGreaterThan(3);
  // The user adds an Edit hook (an event UDS also uses) and a Bash hook next to UDS's.
  initSettings.hooks.PreToolUse.push(MINE_EDIT, MINE_BASH);
  writeFileSync(SETTINGS(dir), JSON.stringify(initSettings, null, 2));

  const run = await h.runCli(['compile'], dir);
  expect(run.code, out(run)).toBe(0);
  const after = readSettings(dir);
  // (a) the user's hooks are still there.
  expect(after.hooks.PreToolUse).toContainEqual(MINE_EDIT);
  expect(after.hooks.PreToolUse).toContainEqual(MINE_BASH);
  // (b) UDS entries are exactly what init wrote: nothing added, nothing duplicated, no object matcher anywhere.
  expect(udsEntries(after)).toEqual(fromInit);
  const matchers = Object.values(after.hooks).flat().map((e) => typeof e.matcher);
  expect(matchers.every((t) => t === 'string')).toBe(true);
}, 240000);

it('uds compile --dry-run prints JSON whose matchers are strings, and writes nothing (XSPEC-482 R4b)', async () => {
  const dir = await projectWithHooks();
  const before = readFileSync(SETTINGS(dir), 'utf-8');
  const run = await h.runCli(['compile', '--dry-run'], dir);
  expect(run.code, out(run)).toBe(0);
  const printed = JSON.parse(run.stdout.slice(run.stdout.indexOf('{')));
  const all = Object.values(printed.hooks).flat();
  expect(all.length).toBeGreaterThanOrEqual(3);
  expect(all.every((e) => typeof e.matcher === 'string')).toBe(true);
  expect(readFileSync(SETTINGS(dir), 'utf-8')).toBe(before);
}, 240000);

it('uds compile repairs the entries an earlier compile wrote with object matchers instead of adding a second set (XSPEC-482 R4b)', async () => {
  const dir = await projectWithHooks();
  const s = readSettings(dir);
  const fromInit = udsEntries(s);
  // What the beta.12 compile left behind: the same entries, matcher as an object.
  for (const list of Object.values(s.hooks)) {
    for (const e of list) if (e.matcher === 'Bash' || e.matcher === 'Write') e.matcher = { tool: e.matcher };
  }
  writeFileSync(SETTINGS(dir), JSON.stringify(s, null, 2));
  expect(Object.values(readSettings(dir).hooks).flat().some((e) => typeof e.matcher === 'object'), 'fixture: object matchers are there').toBe(true);

  expect((await h.runCli(['compile'], dir)).code).toBe(0);
  const after = readSettings(dir);
  expect(Object.values(after.hooks).flat().every((e) => typeof e.matcher === 'string')).toBe(true);
  expect(udsEntries(after)).toEqual(fromInit);
}, 240000);

it('uds compile in a project that has no scripts/hooks/ writes no entry for a script that is not there, and says which were skipped (XSPEC-482 R4c)', async () => {
  const dir = h.makeDir('no-scripts');
  mkdirSync(join(dir, '.claude'), { recursive: true });
  const init = await h.runCli(['init', '--yes', '--skills-location', 'project'], dir); // no --with-hooks
  expect(init.code, out(init)).toBe(0);
  expect(existsSync(join(dir, 'scripts', 'hooks')), 'fixture: no hook scripts').toBe(false);
  // The user's settings.json has a hook of its own and nothing else.
  mkdirSync(join(dir, '.claude'), { recursive: true });
  writeFileSync(SETTINGS(dir), JSON.stringify({ hooks: { PreToolUse: [MINE_EDIT] } }, null, 2));
  const before = readFileSync(SETTINGS(dir), 'utf-8');

  const run = await h.runCli(['compile'], dir);
  expect(run.code, out(run)).toBe(0);
  expect(out(run)).toContain('Compiled 0 enforcement standard(s)');
  expect(out(run)).toMatch(/Skipped [\w-]+: hook script not found: scripts\/hooks\//);
  expect(out(run)).toContain('uds update --with-hooks');
  expect(readFileSync(SETTINGS(dir), 'utf-8'), 'settings.json is exactly as the user left it').toBe(before);

  // Control: once the scripts are installed the same command compiles them.
  const install = await h.runCli(['update', '--with-hooks', '--offline'], dir);
  expect(install.code, out(install)).toBe(0);
  expect(existsSync(join(dir, 'scripts', 'hooks'))).toBe(true);
  const again = await h.runCli(['compile'], dir);
  expect(out(again)).toMatch(/Compiled [1-9]\d* enforcement standard\(s\)/);
  expect(readSettings(dir).hooks.PreToolUse).toContainEqual(MINE_EDIT);
}, 240000);
