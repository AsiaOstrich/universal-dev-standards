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
import { mkdtempSync, writeFileSync, mkdirSync, rmSync, existsSync, readFileSync, readdirSync } from 'node:fs';
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

/**
 * If the installer is serving cli/bundled/, is that snapshot the current source?
 *
 * 🔴 Printing the resolved path was this gate's original answer, and printing is
 * not enforcing. On 2026-09-10 the snapshot was two days and two commits behind
 * — `turn-completion/locales/zh-TW.mjs` was missing the fix that stops the hook
 * misreading a request to report back — and every arm below was green over it.
 * A green that does not cover the current source is worse than no gate, because
 * it is indistinguishable from one that does.
 *
 * The comparison walks the repo tree rather than listing files: a gate that
 * enumerates its own scope stops covering the thing it was built for the moment
 * someone adds a file.
 */
function assertBundledInSync(hooksSrc: string): void {
  if (!hooksSrc.includes('bundled')) { ok('installer serves the repo tree directly (no bundled snapshot)'); return; }
  const repo = join(ROOT, 'scripts/hooks');
  if (!existsSync(repo)) { fail('scripts/hooks is missing — cannot tell whether the snapshot is current'); return; }

  const walk = (base: string, rel = ''): string[] =>
    readdirSync(join(base, rel), { withFileTypes: true }).flatMap((d) =>
      d.isDirectory() ? walk(base, join(rel, d.name)) : [join(rel, d.name)]);

  const files = walk(repo);
  if (files.length === 0) { fail('scripts/hooks walked to zero files — the comparison is not running'); return; }

  const drift: string[] = [];
  for (const rel of files) {
    const a = join(repo, rel);
    const b = join(hooksSrc, rel);
    if (!existsSync(b)) { drift.push(`${rel} (absent from the snapshot)`); continue; }
    if (readFileSync(a, 'utf8') !== readFileSync(b, 'utf8')) drift.push(rel);
  }
  if (drift.length) {
    fail(`the bundled snapshot is stale — everything below would test yesterday's code: ${drift.join(', ')}`);
    fail('regenerate it (npm pack in cli/) or delete cli/bundled/ before trusting this run');
  } else {
    ok(`bundled snapshot matches all ${files.length} repo hook file(s)`);
  }
}

/**
 * Does the INSTALLED Stop hook actually block?
 *
 * Everything above proves a hook loads and survives input it does not
 * understand. None of it proves the hook does its job: one that always exits 0
 * passes every check above. That is the shape this repo keeps meeting — a
 * component that reports success while doing nothing — and for a Stop hook it
 * is the likely failure, because "allow" is what every error path returns.
 *
 * So: run the copy that landed in the adopter's project, on a transcript that
 * must be blocked and one that must not. The two arms differ only in the
 * assistant's sentence, so the allow arm cannot be green because the hook is
 * dead — the block arm would be green too, and it is not.
 *
 * HOME is redirected per invocation: the hook keeps a cooldown and a rolling
 * window under ~/.uds, and without isolation the second call of the day reads
 * the first one's stamp and returns "allow" for a reason that has nothing to do
 * with the transcript. It would also write into the developer's own state.
 */
function stopHookBehaviour(dir: string, abs: string): void {
  const arms = [
    {
      name: 'a stated next action with the turn ending',
      assistant: 'The remaining two items I will do next.',
      user: 'ok',
      mustBlock: true,
    },
    {
      name: 'an itemized blocker list (the ending R2 demands)',
      assistant: [
        'Nothing left to decide. Each remaining item and who it waits on:',
        '  1. Deploy on the server — waits on you running the setup script.',
        '  2. Credential renewal — waits on you, I cannot type it.',
      ].join('\n'),
      user: 'ok',
      mustBlock: false,
    },
  ];

  for (const arm of arms) {
    const home = mkdtempSync(join(tmpdir(), 'uds-hook-home-'));
    const tp = join(home, 'transcript.jsonl');
    writeFileSync(tp, [
      JSON.stringify({ message: { role: 'user', content: arm.user } }),
      JSON.stringify({ message: { role: 'assistant', content: arm.assistant } }),
    ].join('\n') + '\n');

    let stdout = '';
    try {
      stdout = String(execFileSync(process.execPath, [abs], {
        cwd: dir,
        env: { ...process.env, HOME: home },
        input: JSON.stringify({ session_id: `gate-${Math.random()}`, transcript_path: tp, stop_hook_active: false }),
        stdio: ['pipe', 'pipe', 'pipe'],
      }));
    } catch (e: any) {
      fail(`Stop behaviour (${arm.name}): hook exited ${e.status} — a Stop hook must exit 0 and speak through stdout`);
      rmSync(home, { recursive: true, force: true });
      continue;
    }

    let decision: string | undefined;
    if (stdout.trim()) {
      try { decision = JSON.parse(stdout).decision; }
      catch { fail(`Stop behaviour (${arm.name}): stdout is not JSON — ${stdout.slice(0, 80)}`); rmSync(home, { recursive: true, force: true }); continue; }
    }

    if (arm.mustBlock && decision !== 'block') {
      fail(`Stop behaviour (${arm.name}): expected decision "block", got ${JSON.stringify(decision ?? null)} — the hook is installed and inert`);
    } else if (!arm.mustBlock && decision === 'block') {
      fail(`Stop behaviour (${arm.name}): blocked a correct ending — a hook that punishes the required behaviour gets turned off`);
    } else {
      ok(`Stop behaviour: ${arm.name} → ${arm.mustBlock ? 'blocked' : 'allowed'}`);
    }
    rmSync(home, { recursive: true, force: true });
  }
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
  assertBundledInSync(String(hooksSourceDir()));

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

      // R8: a prose-reading hook must declare the languages it ships, at install
      // time. Nothing else in this gate would notice if that line disappeared —
      // the hook would still install, still run, and still be unable to fire in
      // an unlisted language, which is exactly the state R8 exists to name.
      const prose = (result.languageLimits ?? []).filter((l: any) => /turn-completion/.test(l.script));
      if (prose.length === 0) fail('the prose-reading hook declared no languages — an adopter working outside them is never told');
      else if (!/\ben\b/.test(prose[0].languages)) fail(`language declaration looks wrong: ${JSON.stringify(prose[0].languages).slice(0, 80)}`);
      else ok(`prose hook declares its languages (${prose[0].languages.split('\n')[0]}, ...)`);

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
          // Loading is not doing. Only the Stop hook has a decision to make.
          if (event === 'Stop') stopHookBehaviour(dir, abs);
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
