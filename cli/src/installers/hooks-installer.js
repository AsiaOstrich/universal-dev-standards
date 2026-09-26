/**
 * UDS Hook Installer
 *
 * Copies hook scripts and merges .claude/settings.json with hook configurations
 * derived from the `enforcement:` blocks of the shipped standards.
 *
 * Key constraints:
 * - MUST merge, never overwrite existing settings.json
 * - MUST be idempotent (no duplicate hooks on re-install)
 * - MUST emit the hook handler shape Claude Code actually executes
 *
 * 🔴 Three defects fixed here on 2026-09-08, each of which failed silently and
 * all three of which were present at once:
 *
 *   1. Hook entries were written as bare strings (`hooks: ['node x.js']`).
 *      Measured with a two-arm run — a bare-string entry and an object entry
 *      side by side in the same event of the same session: the object ran, the
 *      bare string did not. Claude Code dispatches on `type`, and an entry
 *      without one is skipped. settings.json stays valid JSON, the install
 *      reports success, and nothing ever runs.
 *   2. The hook scripts were resolved from `<repo>/scripts/hooks`, which is
 *      outside the published package (`npm pack` listed 1 file matching
 *      "hooks": this installer). Adopters installing from npm copied zero
 *      scripts and still got `installed: true`.
 *   3. The event/script list was hardcoded here, so a standard declaring an
 *      `enforcement:` block got no hook unless someone also remembered to edit
 *      this file. It is now derived by walking the standards.
 *
 * @module installers/hooks-installer
 * @see docs/specs/SPEC-HOOKS-001-core-standard-hooks.md (REQ-4)
 * @see core/turn-completion-integrity.md
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync, cpSync, readdirSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';
import { load as parseYaml } from 'js-yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Prefer the bundled copy (present in the npm package), fall back to the repo. */
function resolveDir(bundledRel, repoRel) {
  const bundled = join(__dirname, '..', '..', 'bundled', ...bundledRel);
  if (existsSync(bundled)) return bundled;
  const repo = join(__dirname, '..', '..', '..', ...repoRel);
  return existsSync(repo) ? repo : null;
}

export const standardsSourceDir = () => resolveDir(['ai', 'standards'], ['ai', 'standards']);
export const hooksSourceDir = () => resolveDir(['hooks'], ['scripts', 'hooks']);

/**
 * Claude Code's matcher is a string. Some standards declare it as an object
 * (`matcher: { tool: Bash }`), which would be written into settings.json
 * verbatim and never match anything.
 */
function normalizeMatcher(matcher) {
  if (typeof matcher === 'string') return matcher;
  if (matcher && typeof matcher === 'object' && typeof matcher.tool === 'string') return matcher.tool;
  return '';
}

/**
 * Walk the shipped standards and build the hook configuration from every
 * complete `enforcement:` block.
 *
 * @param {string|null} stdDir - directory of *.ai.yaml standards
 * @param {string|null} hookDir - directory the hook scripts live in
 * @returns {{ configs: Object, scripts: string[], skipped: Array<{id: string, why: string}> }}
 */
export function collectHookConfigs(stdDir, hookDir) {
  const configs = {};
  const scripts = [];
  const skipped = [];
  if (!stdDir) return { configs, scripts, skipped: [{ id: '*', why: 'standards directory not found' }] };

  for (const file of readdirSync(stdDir).filter((f) => f.endsWith('.ai.yaml')).sort()) {
    let std;
    try {
      std = parseYaml(readFileSync(join(stdDir, file), 'utf-8'));
    } catch {
      skipped.push({ id: file, why: 'unparseable YAML' });
      continue;
    }
    const e = std && std.enforcement;
    if (!e) continue;

    const id = (std && std.id) || file;
    if (typeof e.trigger !== 'string' || !e.trigger || typeof e.hook_script !== 'string' || !e.hook_script) {
      // A block missing either field used to compile to hooks["undefined"]:
      // [{ hooks: ["node undefined"] }] with no error at any layer.
      skipped.push({ id, why: 'enforcement block missing trigger or hook_script' });
      continue;
    }

    const rel = e.hook_script.replace(/^scripts\/hooks\//, '');
    if (hookDir && !existsSync(join(hookDir, rel))) {
      skipped.push({ id, why: `hook script not found: ${e.hook_script}` });
      continue;
    }

    (configs[e.trigger] ||= []).push({
      matcher: normalizeMatcher(e.matcher),
      hooks: [{ type: 'command', command: `node scripts/hooks/${rel}` }],
    });
    scripts.push(rel);
  }
  return { configs, scripts, skipped };
}

/** The command string an entry runs, whatever shape it is stored in. */
function commandOf(entry) {
  const h = entry && entry.hooks && entry.hooks[0];
  if (typeof h === 'string') return h;
  return h && typeof h.command === 'string' ? h.command : undefined;
}

/**
 * Merge hook arrays, deduplicating by (command, matcher).
 * Existing entries are never rewritten — an adopter may have edited them.
 */
export function mergeHookArray(existing, incoming) {
  const result = [...existing];
  for (const entry of incoming) {
    const cmd = commandOf(entry);
    const dup = result.some((e) => commandOf(e) === cmd && e.matcher === entry.matcher);
    if (!dup) result.push(entry);
  }
  return result;
}

/**
 * Install UDS hooks into a target project.
 *
 * @param {string} projectPath - Target project root path
 * @returns {{ installed: boolean, scriptsCount: number, settingsPath: string, events: string[], skipped: Array }}
 */
/**
 * Which installed hooks only work in some languages, asked of the hooks themselves.
 *
 * turn-completion-integrity R8 says an unsupported language must be declared,
 * and the hook already answers `--languages`. Restating that list here would
 * make a second hand-maintained copy of it, and the copy would drift — quietly,
 * because both halves keep looking like valid data.
 *
 * 🔴 Why it matters at all: a prose-reading hook in a language it does not ship
 * is installed, running, and structurally unable to fire. Its output is
 * byte-identical to a turn with nothing wrong. Without this line the adopter
 * has no way to tell those apart, ever.
 *
 * A hook with no such flag simply produces nothing here; failure is not an
 * error, because "cannot introspect" must not block an install.
 */
function probeLanguageLimits(hooksDir, scripts) {
  const out = [];
  for (const rel of new Set(scripts)) {
    const abs = join(hooksDir, basename(rel));
    if (!existsSync(abs)) continue;
    try {
      const text = execFileSync(process.execPath, [abs, '--languages'], {
        encoding: 'utf-8',
        timeout: 5000,
        stdio: ['ignore', 'pipe', 'ignore'],
      }).trim();
      if (text) out.push({ script: basename(rel), languages: text });
    } catch {
      // no --languages, or it refused: nothing to declare.
    }
  }
  return out;
}

export function installHooks(projectPath) {
  const claudeDir = join(projectPath, '.claude');
  const settingsPath = join(claudeDir, 'settings.json');
  const hooksDir = join(projectPath, 'scripts', 'hooks');

  const stdDir = standardsSourceDir();
  const hookDir = hooksSourceDir();
  const { configs, scripts, skipped } = collectHookConfigs(stdDir, hookDir);
  const events = Object.keys(configs);

  if (events.length === 0) {
    // Reporting success here is what let three separate breakages ship.
    return { installed: false, scriptsCount: 0, settingsPath, events, skipped };
  }

  if (!existsSync(claudeDir)) mkdirSync(claudeDir, { recursive: true });
  if (!existsSync(hooksDir)) mkdirSync(hooksDir, { recursive: true });

  // Recursive: a hook may ship a directory beside it (locale packs, fixtures).
  cpSync(hookDir, hooksDir, { recursive: true });

  let settings = {};
  if (existsSync(settingsPath)) {
    try {
      settings = JSON.parse(readFileSync(settingsPath, 'utf-8'));
    } catch {
      settings = {};
    }
  }
  if (!settings.hooks) settings.hooks = {};

  for (const [event, entries] of Object.entries(configs)) {
    if (!settings.hooks[event]) settings.hooks[event] = [];
    settings.hooks[event] = mergeHookArray(settings.hooks[event], entries);
  }

  writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n');

  return {
    installed: true,
    scriptsCount: new Set(scripts).size,
    settingsPath,
    events,
    skipped,
    languageLimits: probeLanguageLimits(hooksDir, scripts),
  };
}

/**
 * turn-completion-integrity is the only standard extended to Codex and Gemini
 * CLI so far (2026-09-25). Unlike installHooks() above, these two functions do
 * NOT walk every standard's `enforcement:` block — the other three shipped
 * standards declare Claude-Code-specific events (PreToolUse/PostToolUse with
 * a Bash/Write matcher) that Codex and Gemini CLI's hook models don't obviously
 * map onto, and generalizing that mapping is a separate piece of work. These
 * are narrowly scoped to the one hook that has been verified against each
 * tool's own docs.
 *
 * @see core/turn-completion-integrity.md
 */
// Exported so the uninstaller (../uninstallers/hook-uninstaller.js) can
// recognize exactly these two script names as UDS's own, rather than
// guessing from the shared `scripts/hooks/` directory path alone — a path
// an adopter's own hook could just as easily live under.
export const CODEX_HOOK_SCRIPT = 'check-turn-completion-codex.mjs';
export const GEMINI_HOOK_SCRIPT = 'check-turn-completion-gemini.mjs';

/** Copy the shared hook scripts into the project, same as installHooks() does. */
function copyHookScripts(hookDir, hooksDir) {
  if (!existsSync(hooksDir)) mkdirSync(hooksDir, { recursive: true });
  cpSync(hookDir, hooksDir, { recursive: true });
}

/**
 * Install the turn-completion-integrity Stop hook for Codex.
 *
 * Config lives at <project>/.codex/hooks.json — a dedicated file, NOT
 * config.toml's [hooks] table. Codex runs matching hooks from every file that
 * defines them (https://learn.chatgpt.com/docs/hooks, fetched 2026-09-25), so
 * writing only hooks.json here is a deliberate choice, not an oversight: it
 * does not need to also read or merge config.toml to avoid double-registering
 * the same hook, and an adopter who already has a Stop hook in config.toml
 * keeps it untouched.
 *
 * @param {string} projectPath
 * @returns {{ installed: boolean, settingsPath: string, event?: string, reason?: string }}
 */
export function installCodexHooks(projectPath) {
  const hooksJsonPath = join(projectPath, '.codex', 'hooks.json');
  const hookDir = hooksSourceDir();

  if (!hookDir || !existsSync(join(hookDir, CODEX_HOOK_SCRIPT))) {
    return { installed: false, settingsPath: hooksJsonPath, reason: `hook script not found: ${CODEX_HOOK_SCRIPT}` };
  }

  const codexDir = join(projectPath, '.codex');
  if (!existsSync(codexDir)) mkdirSync(codexDir, { recursive: true });
  copyHookScripts(hookDir, join(projectPath, 'scripts', 'hooks'));

  let config = {};
  if (existsSync(hooksJsonPath)) {
    try { config = JSON.parse(readFileSync(hooksJsonPath, 'utf-8')); } catch { config = {}; }
  }
  if (!config.hooks) config.hooks = {};
  if (!config.hooks.Stop) config.hooks.Stop = [];

  // Matcher is omitted, not empty-stringed: Codex ignores any matcher on Stop
  // ("any configured matcher is ignored"), and mergeHookArray's dedupe treats
  // undefined === undefined, so this still merges idempotently.
  config.hooks.Stop = mergeHookArray(config.hooks.Stop, [
    { hooks: [{ type: 'command', command: `node scripts/hooks/${CODEX_HOOK_SCRIPT}`, timeout: 30 }] },
  ]);

  writeFileSync(hooksJsonPath, JSON.stringify(config, null, 2) + '\n');
  return { installed: true, settingsPath: hooksJsonPath, event: 'Stop' };
}

/**
 * Install the turn-completion-integrity AfterAgent hook for Gemini CLI.
 *
 * Config lives at <project>/.gemini/settings.json — shared with the rest of
 * Gemini CLI's project settings, so only the `hooks.AfterAgent` key is ever
 * touched here (https://geminicli.com/docs/hooks/, fetched 2026-09-25).
 *
 * @param {string} projectPath
 * @returns {{ installed: boolean, settingsPath: string, event?: string, reason?: string }}
 */
export function installGeminiHooks(projectPath) {
  const settingsPath = join(projectPath, '.gemini', 'settings.json');
  const hookDir = hooksSourceDir();

  if (!hookDir || !existsSync(join(hookDir, GEMINI_HOOK_SCRIPT))) {
    return { installed: false, settingsPath, reason: `hook script not found: ${GEMINI_HOOK_SCRIPT}` };
  }

  const geminiDir = join(projectPath, '.gemini');
  if (!existsSync(geminiDir)) mkdirSync(geminiDir, { recursive: true });
  copyHookScripts(hookDir, join(projectPath, 'scripts', 'hooks'));

  let settings = {};
  if (existsSync(settingsPath)) {
    try { settings = JSON.parse(readFileSync(settingsPath, 'utf-8')); } catch { settings = {}; }
  }
  if (!settings.hooks) settings.hooks = {};
  if (!settings.hooks.AfterAgent) settings.hooks.AfterAgent = [];

  // AfterAgent does not use matchers either (matchers apply only to Tool
  // hooks); see the Codex function above for why matcher is omitted, not "".
  settings.hooks.AfterAgent = mergeHookArray(settings.hooks.AfterAgent, [
    { hooks: [{ type: 'command', command: `node scripts/hooks/${GEMINI_HOOK_SCRIPT}`, timeout: 5000 }] },
  ]);

  writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n');
  return { installed: true, settingsPath, event: 'AfterAgent' };
}
