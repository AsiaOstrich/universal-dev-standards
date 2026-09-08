#!/usr/bin/env tsx
/**
 * Hook delivery gate — does an adopter get hooks that actually run?
 *
 * Three defects shipped at once before this existed, and every one of them was
 * silent (2026-09-08):
 *
 *   1. Entries written as bare strings. Claude Code dispatches on `type`; an
 *      entry without one is skipped with no error. Measured with both shapes in
 *      the same event of the same session — the object ran, the string did not.
 *   2. `scripts/hooks` was not in the npm package, so adopters installing from
 *      npm copied zero scripts and still got `installed: true`.
 *   3. Every hook was an ESM `.js`. An adopter whose package.json declares
 *      `"type": "commonjs"` got `SyntaxError: Cannot use import statement
 *      outside a module` from all six; one with no `type` field got a warning
 *      on stderr on every single turn.
 *
 * Defect 3 is why this gate EXECUTES each installed hook instead of checking
 * that the file exists. "The file is there" was true in every one of the three.
 *
 * The set of hooks is walked from the installer, never listed here — a gate
 * that enumerates its own scope stops covering the thing it was built for the
 * moment someone adds a hook.
 *
 * Usage: tsx scripts/check-hook-delivery.ts [--with-pack]
 *   --with-pack  also build the npm tarball and assert the scripts are in it
 *                (slow; run in pre-release, not pre-commit)
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync, existsSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
let failures = 0;
const fail = (m: string) => { console.log(`  \x1b[31m[FAIL]\x1b[0m ${m}`); failures++; };
const ok = (m: string) => console.log(`  \x1b[32m[OK]\x1b[0m   ${m}`);

/** A project whose package.json declares the given module type (or none). */
function makeProject(type: string | null): string {
  const dir = mkdtempSync(join(tmpdir(), 'uds-hook-gate-'));
  const pkg: Record<string, unknown> = { name: 'adopter', version: '0.0.0' };
  if (type) pkg.type = type;
  writeFileSync(join(dir, 'package.json'), JSON.stringify(pkg, null, 2));
  mkdirSync(join(dir, '.claude'), { recursive: true });
  return dir;
}

/** Every hook command the installer wrote, flattened across events. */
function installedCommands(settings: any): Array<{ event: string; entry: any; hook: any }> {
  const out: Array<{ event: string; entry: any; hook: any }> = [];
  for (const [event, entries] of Object.entries<any>(settings.hooks ?? {})) {
    for (const entry of entries as any[]) {
      for (const hook of entry.hooks ?? []) out.push({ event, entry, hook });
    }
  }
  return out;
}

async function main() {
  const mod = await import(join(ROOT, 'cli/src/installers/hooks-installer.js'));
  const { installHooks, standardsSourceDir, hooksSourceDir } = mod;

  // 🔴 cli/bundled/ is an untracked prepack artifact that the installer PREFERS
  // over the repo. A stale one silently serves whatever the last `npm pack`
  // produced — which is how this gate first went red: renamed hooks in the
  // repo, old names in bundled. Print the resolved source so a stale snapshot
  // is visible instead of merely wrong.
  console.log(`standards source: ${String(standardsSourceDir()).replace(ROOT + '/', '')}`);
  console.log(`hooks source:     ${String(hooksSourceDir()).replace(ROOT + '/', '')}`);

  for (const type of [null, 'commonjs', 'module']) {
    const label = type ? `"type": "${type}"` : 'no type field';
    console.log(`\n\x1b[34mAdopter package.json: ${label}\x1b[0m`);
    console.log('----------------------------------------');
    const dir = makeProject(type);
    try {
      const result = installHooks(dir);
      if (!result.installed) { fail(`install reported installed: false (${JSON.stringify(result.skipped)})`); continue; }

      const settings = JSON.parse(readFileSync(join(dir, '.claude/settings.json'), 'utf8'));
      const cmds = installedCommands(settings);
      if (cmds.length === 0) { fail('settings.json carries no hook entries'); continue; }
      ok(`${cmds.length} hook entr${cmds.length === 1 ? 'y' : 'ies'} across ${Object.keys(settings.hooks).length} event(s)`);

      for (const { event, entry, hook } of cmds) {
        // Shape: Claude Code skips an entry with no `type`, in silence.
        if (typeof hook !== 'object' || hook === null) { fail(`${event}: hook entry is ${typeof hook}, must be an object`); continue; }
        if (hook.type !== 'command') { fail(`${event}: hook.type is ${JSON.stringify(hook.type)}, must be "command"`); continue; }
        if (typeof hook.command !== 'string' || !hook.command) { fail(`${event}: hook.command missing`); continue; }
        if (typeof entry.matcher !== 'string') { fail(`${event}: matcher is ${typeof entry.matcher}, Claude Code requires a string`); continue; }

        const rel = hook.command.replace(/^node\s+/, '');
        const abs = join(dir, rel);
        if (!existsSync(abs)) { fail(`${event}: ${rel} was not copied into the project`); continue; }

        // Execute it. Existence was true in all three shipped defects.
        let stderr = '';
        let code = 0;
        try {
          execFileSync(process.execPath, [abs], { cwd: dir, input: '{}', stdio: ['pipe', 'pipe', 'pipe'] });
        } catch (e: any) {
          code = e.status ?? 1;
          stderr = String(e.stderr ?? '');
        }
        if (/Cannot use import statement|ERR_REQUIRE_ESM|Unexpected token 'export'/.test(stderr)) {
          fail(`${event}: ${rel} does not load under ${label} — ${stderr.split('\n').find((l) => l.includes('Error')) ?? 'module error'}`);
        } else if (code !== 0 && code !== 2) {
          // 2 is a legitimate "blocked" exit for some hook events.
          fail(`${event}: ${rel} exited ${code} on empty input — a hook must not crash on input it does not understand`);
        } else {
          ok(`${event}: ${rel} runs under ${label}`);
        }
      }
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }

  if (process.argv.includes('--with-pack')) {
    console.log('\n\x1b[34mnpm package contents\x1b[0m');
    console.log('----------------------------------------');
    const raw = execFileSync('npm', ['pack', '--dry-run', '--json'], { cwd: join(ROOT, 'cli'), encoding: 'utf8' });
    const files: string[] = JSON.parse(raw.slice(raw.indexOf('[')))[0].files.map((f: any) => f.path);
    const hooks = files.filter((f) => /(^|\/)hooks\//.test(f));
    if (hooks.length === 0) fail('the tarball contains no hook scripts — adopters installing from npm copy nothing');
    else ok(`${hooks.length} hook file(s) in the tarball`);
  }

  console.log('\n==========================================');
  if (failures === 0) { console.log('\x1b[32mHook delivery OK ✓\x1b[0m'); process.exit(0); }
  console.log(`\x1b[31m${failures} failure(s)\x1b[0m`);
  process.exit(1);
}

main();
