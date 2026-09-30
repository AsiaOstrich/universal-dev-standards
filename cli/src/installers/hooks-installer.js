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

import { existsSync, readFileSync, writeFileSync, copyFileSync, readdirSync } from 'fs';
import { join, dirname, basename, relative } from 'path';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';
import { load as parseYaml } from 'js-yaml';
import { detectAITools } from '../utils/detector.js';
import { newRecorder, mkdirTracked, recordFile, RECORD_KINDS } from '../core/install-records.js';

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

/**
 * Copy the shipped hook scripts (recursively — a hook may ship a directory beside
 * it: locale packs, fixtures) into `<project>/scripts/hooks`, and RECORD every
 * file this call actually wrote and every directory it had to create.
 *
 * `cpSync` did the copy before and returns nothing, which is why `uds uninstall`
 * had no way to know which of the files under `scripts/hooks/` were UDS's — a
 * directory an adopter's own hook scripts may share. A file that already exists
 * and is byte-identical is not recorded (this call did not write it, so it
 * proves nothing about who did); a file that exists, differs, and is not
 * overwritten is left alone and not recorded.
 *
 * @param {string} srcDir  Shipped hooks directory
 * @param {string} destDir Destination directory (absolute)
 * @param {{ overwrite: boolean, recorder: object, projectPath: string }} ctx
 */
function copyTreeRecorded(srcDir, destDir, ctx) {
  mkdirTracked(ctx.recorder, ctx.projectPath, destDir);
  for (const entry of readdirSync(srcDir, { withFileTypes: true })) {
    const src = join(srcDir, entry.name);
    const dest = join(destDir, entry.name);
    if (entry.isDirectory()) {
      copyTreeRecorded(src, dest, ctx);
      continue;
    }
    if (existsSync(dest)) {
      if (!ctx.overwrite) continue;
      if (readFileSync(src).equals(readFileSync(dest))) continue;
    }
    copyFileSync(src, dest);
    recordFile(ctx.recorder, ctx.projectPath, relative(ctx.projectPath, dest), RECORD_KINDS.HOOK_SCRIPT);
  }
}

export function installHooks(projectPath, { overwriteScripts = true, recorder = newRecorder() } = {}) {
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

  mkdirTracked(recorder, projectPath, claudeDir);
  copyTreeRecorded(hookDir, hooksDir, { overwrite: overwriteScripts, recorder, projectPath });

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
    artifacts: recorder,
  };
}

/**
 * turn-completion-integrity is the only standard extended to Codex, Gemini
 * CLI and Antigravity CLI so far (2026-09-25; agy 2026-09-29). Unlike
 * installHooks() above, these three functions do
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
export const AGY_HOOK_SCRIPT = 'check-turn-completion-agy.mjs';
// agy's hooks.json is keyed by hook NAME, and this is the one UDS owns. The
// uninstaller removes only handlers under this key that also run a script UDS
// ships, so a user's own hook (under any name, or even under this name with a
// different command) is never touched.
export const AGY_HOOK_NAME = 'uds-turn-completion-integrity';
// 🔴 agy runs a hook with the working directory set to `.agents/` (measured
// 2026-09-29 on agy 1.2.12, PC15: the project-root-relative command
// `node scripts/hooks/...` failed with "Cannot find module
// '<project>/.agents/scripts/hooks/...'", and agy lets a failed hook through
// silently). The command therefore climbs out of `.agents/` first. It is
// deliberately relative, not absolute: hooks.json is meant to be committed and
// shared, and an absolute path is one machine's. It is also deliberately not
// `sh -c` / `$(git rev-parse ...)`: whether agy runs `command` through a shell
// has no evidence behind it.
export const AGY_HOOK_COMMAND = `node ../scripts/hooks/${AGY_HOOK_SCRIPT}`;
// The first form this installer wrote (never released); recognised only so a
// re-install repairs it and uninstall still removes it.
export const AGY_HOOK_COMMAND_LEGACY = `node scripts/hooks/${AGY_HOOK_SCRIPT}`;

/**
 * Copy the shared hook scripts into the project, same as installHooks() does.
 * `overwrite: false` keeps a script that already exists (an adopter may have
 * edited it); it is what `uds update --with-hooks` uses unless `--force` is given.
 */
function copyHookScripts(hookDir, hooksDir, { overwrite = true, recorder, projectPath } = {}) {
  copyTreeRecorded(hookDir, hooksDir, { overwrite, recorder, projectPath });
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
export function installCodexHooks(projectPath, { overwriteScripts = true, recorder = newRecorder() } = {}) {
  const hooksJsonPath = join(projectPath, '.codex', 'hooks.json');
  const hookDir = hooksSourceDir();

  if (!hookDir || !existsSync(join(hookDir, CODEX_HOOK_SCRIPT))) {
    return { installed: false, settingsPath: hooksJsonPath, reason: `hook script not found: ${CODEX_HOOK_SCRIPT}` };
  }

  mkdirTracked(recorder, projectPath, join(projectPath, '.codex'));
  copyHookScripts(hookDir, join(projectPath, 'scripts', 'hooks'), { overwrite: overwriteScripts, recorder, projectPath });

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
  return { installed: true, settingsPath: hooksJsonPath, event: 'Stop', artifacts: recorder };
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
export function installGeminiHooks(projectPath, { overwriteScripts = true, recorder = newRecorder() } = {}) {
  const settingsPath = join(projectPath, '.gemini', 'settings.json');
  const hookDir = hooksSourceDir();

  if (!hookDir || !existsSync(join(hookDir, GEMINI_HOOK_SCRIPT))) {
    return { installed: false, settingsPath, reason: `hook script not found: ${GEMINI_HOOK_SCRIPT}` };
  }

  mkdirTracked(recorder, projectPath, join(projectPath, '.gemini'));
  copyHookScripts(hookDir, join(projectPath, 'scripts', 'hooks'), { overwrite: overwriteScripts, recorder, projectPath });

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
  return { installed: true, settingsPath, event: 'AfterAgent', artifacts: recorder };
}

/**
 * Install the turn-completion-integrity Stop hook for Antigravity CLI (agy).
 *
 * Config lives at <project>/.agents/hooks.json. Its shape differs from every
 * other adapter's file: a top-level map of hook NAME -> { <Event>: handler[] },
 * with the handler written flat (`{type, command, timeout}`), no `hooks`
 * wrapper key and no `hooks[]` nesting (https://antigravity.google/docs/hooks/,
 * fetched 2026-09-29; the shape was also confirmed by a real agy 1.2.12 run).
 * So neither mergeHookArray nor the uninstaller's Claude-shaped stripping can
 * be reused here.
 *
 * - The command is `node ../scripts/hooks/...`, not `node scripts/hooks/...`:
 *   agy's hook working directory is `.agents/` (see AGY_HOOK_COMMAND).
 * - `timeout` is seconds (agy's default is 30), like Codex, unlike Gemini CLI.
 * - `enabled` is deliberately NOT written: an `enabled: false` there is a
 *   silent off switch, and omitting it is the documented default.
 * - A hooks.json that exists but cannot be parsed is NOT overwritten (the
 *   other installers fall back to `{}` and would discard the adopter's file);
 *   the install reports why and leaves the file alone.
 * - Whether agy runs a project `.agents/hooks.json` only for a registered
 *   Antigravity project (as it does for `.agents/skills/`) is not verified.
 *
 * @param {string} projectPath
 * @returns {{ installed: boolean, settingsPath: string, event?: string, reason?: string }}
 */
export function installAgyHooks(projectPath, { overwriteScripts = true, recorder = newRecorder() } = {}) {
  const hooksJsonPath = join(projectPath, '.agents', 'hooks.json');
  const hookDir = hooksSourceDir();

  if (!hookDir || !existsSync(join(hookDir, AGY_HOOK_SCRIPT))) {
    return { installed: false, settingsPath: hooksJsonPath, reason: `hook script not found: ${AGY_HOOK_SCRIPT}` };
  }

  let config = {};
  if (existsSync(hooksJsonPath)) {
    try {
      config = JSON.parse(readFileSync(hooksJsonPath, 'utf-8'));
    } catch {
      return { installed: false, settingsPath: hooksJsonPath, reason: '.agents/hooks.json exists but is not valid JSON; left untouched' };
    }
    if (!config || typeof config !== 'object' || Array.isArray(config)) {
      return { installed: false, settingsPath: hooksJsonPath, reason: '.agents/hooks.json is not a JSON object; left untouched' };
    }
  }

  mkdirTracked(recorder, projectPath, join(projectPath, '.agents'));
  copyHookScripts(hookDir, join(projectPath, 'scripts', 'hooks'), { overwrite: overwriteScripts, recorder, projectPath });

  const command = AGY_HOOK_COMMAND;
  const entry = config[AGY_HOOK_NAME];
  const mine = entry && typeof entry === 'object' && !Array.isArray(entry) ? entry : {};
  // A UDS handler written by an earlier install with the pre-fix command
  // (`node scripts/hooks/...`, which does not resolve from agy's cwd) is
  // replaced, not left beside the new one. Only that exact stale command is
  // touched; anything else the adopter put under this name stays.
  const stop = (Array.isArray(mine.Stop) ? mine.Stop : [])
    .filter((h) => !(h && h.command === AGY_HOOK_COMMAND_LEGACY));
  if (!stop.some((h) => h && h.command === command)) {
    stop.push({ type: 'command', command, timeout: 30 });
  }
  config[AGY_HOOK_NAME] = { ...mine, Stop: stop };

  writeFileSync(hooksJsonPath, JSON.stringify(config, null, 2) + '\n');
  return { installed: true, settingsPath: hooksJsonPath, event: 'Stop', artifacts: recorder };
}

// ─────────────────────────────────────────────────────────────────────────────
// `uds update --with-hooks` — hooks for a project that is already initialized.
//
// 🔴 Found 2026-09-29 installing the 6.14.0-beta.1 package into a fresh project:
// hooks were only ever wired by `uds init --with-hooks`, and `uds init` refuses to
// run twice ("Standards already initialized"). `uds update` had no hook option.
// So an existing adopter could NEVER receive the hook for a tool UDS started
// supporting after they initialized — and could not repair a hook file that was
// never written. This is that door.
// ─────────────────────────────────────────────────────────────────────────────

/** The tools that have a hook installer, in the order they are reported. */
export const HOOK_CAPABLE_TOOLS = ['claude-code', 'codex', 'gemini-cli', 'antigravity'];

/** detectAITools() keys are camelCase; manifests and flags use the kebab-case tool names. */
const DETECTED_KEY_TO_TOOL = { claudeCode: 'claude-code', geminiCli: 'gemini-cli' };

/**
 * Which tools to install hooks for.
 *
 *   --ai-tool given → exactly those (validated); nothing is detected or guessed.
 *   otherwise       → the manifest's tools ∪ what the project directory shows now.
 *
 * The union is the point: a project initialized before agy detection existed (or
 * before the adopter started using agy) has no `antigravity` in its manifest, and
 * detection alone finds it; a project whose marker files were deleted still has
 * the tool in its manifest. Either source is enough, neither is required.
 *
 * @param {string} projectPath
 * @param {object|null} manifest
 * @param {{ aiTool?: string }} [options]
 * @returns {{ tools: string[], explicit: boolean, unknown: string[], sources: Record<string,string[]> }}
 */
export function resolveHookTools(projectPath, manifest, options = {}) {
  if (options.aiTool) {
    const asked = String(options.aiTool).split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);
    const unknown = asked.filter((t) => !HOOK_CAPABLE_TOOLS.includes(t));
    const tools = HOOK_CAPABLE_TOOLS.filter((t) => asked.includes(t));
    return { tools, explicit: true, unknown, sources: Object.fromEntries(tools.map((t) => [t, ['--ai-tool']])) };
  }
  const sources = {};
  const add = (tool, why) => {
    if (!HOOK_CAPABLE_TOOLS.includes(tool)) return;
    (sources[tool] ||= []).push(why);
  };
  for (const t of [...(manifest?.integrations ?? []), ...(manifest?.aiTools ?? [])]) add(t, 'manifest');
  const detected = detectAITools(projectPath);
  for (const [k, on] of Object.entries(detected)) if (on) add(DETECTED_KEY_TO_TOOL[k] ?? k, 'detected in the project');
  for (const t of Object.keys(sources)) sources[t] = [...new Set(sources[t])];
  return { tools: HOOK_CAPABLE_TOOLS.filter((t) => sources[t]), explicit: false, unknown: [], sources };
}

function readJson(path) {
  if (!existsSync(path)) return { state: 'absent' };
  try {
    const value = JSON.parse(readFileSync(path, 'utf-8'));
    if (!value || typeof value !== 'object' || Array.isArray(value)) return { state: 'invalid', why: 'is not a JSON object' };
    return { state: 'ok', value };
  } catch {
    return { state: 'invalid', why: 'is not valid JSON' };
  }
}

const hasCommand = (entries, cmd) =>
  Array.isArray(entries) && entries.some((e) => commandOf(e) === cmd);

/**
 * Is the hook for `tool` already in the project's config? Read-only.
 *
 * @returns {{ status: 'present'|'missing'|'stale'|'blocked', path: string, why?: string }}
 *   present  every entry UDS would write is there — nothing to do
 *   missing  none (or only part) of it is there
 *   stale    agy's pre-fix command is there (does not resolve from agy's cwd)
 *   blocked  the config file exists but cannot be merged safely (invalid JSON)
 */
export function hookStatus(projectPath, tool) {
  if (tool === 'antigravity') {
    const path = join(projectPath, '.agents', 'hooks.json');
    const j = readJson(path);
    if (j.state === 'absent') return { status: 'missing', path };
    if (j.state === 'invalid') return { status: 'blocked', path, why: `.agents/hooks.json ${j.why}; left untouched` };
    const stop = j.value[AGY_HOOK_NAME]?.Stop;
    const cmds = Array.isArray(stop) ? stop.map((h) => h && h.command) : [];
    if (cmds.includes(AGY_HOOK_COMMAND) && !cmds.includes(AGY_HOOK_COMMAND_LEGACY)) return { status: 'present', path };
    return { status: cmds.includes(AGY_HOOK_COMMAND_LEGACY) ? 'stale' : 'missing', path };
  }
  if (tool === 'codex') {
    const path = join(projectPath, '.codex', 'hooks.json');
    const j = readJson(path);
    if (j.state === 'absent') return { status: 'missing', path };
    if (j.state === 'invalid') return { status: 'missing', path, why: 'unreadable; it would be rewritten by the installer' };
    return { status: hasCommand(j.value.hooks?.Stop, `node scripts/hooks/${CODEX_HOOK_SCRIPT}`) ? 'present' : 'missing', path };
  }
  if (tool === 'gemini-cli') {
    const path = join(projectPath, '.gemini', 'settings.json');
    const j = readJson(path);
    if (j.state === 'absent') return { status: 'missing', path };
    if (j.state === 'invalid') return { status: 'missing', path, why: 'unreadable; it would be rewritten by the installer' };
    return { status: hasCommand(j.value.hooks?.AfterAgent, `node scripts/hooks/${GEMINI_HOOK_SCRIPT}`) ? 'present' : 'missing', path };
  }
  if (tool === 'claude-code') {
    const path = join(projectPath, '.claude', 'settings.json');
    const { configs } = collectHookConfigs(standardsSourceDir(), hooksSourceDir());
    if (Object.keys(configs).length === 0) return { status: 'blocked', path, why: 'no standard produced a usable hook' };
    const j = readJson(path);
    if (j.state === 'absent') return { status: 'missing', path };
    if (j.state === 'invalid') return { status: 'missing', path, why: 'unreadable; it would be rewritten by the installer' };
    for (const [event, entries] of Object.entries(configs)) {
      const existing = j.value.hooks?.[event] ?? [];
      if (mergeHookArray(existing, entries).length !== existing.length) return { status: 'missing', path };
    }
    return { status: 'present', path };
  }
  return { status: 'blocked', path: '', why: `no hook installer for ${tool}` };
}

/** Hook scripts UDS ships vs what the project already has: how many are new, identical, or edited. */
function scriptDiff(projectPath) {
  const src = hooksSourceDir();
  const out = { added: 0, identical: 0, kept: [] };
  if (!src) return out;
  const walk = (dir, rel = '') => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const r = rel ? `${rel}/${e.name}` : e.name;
      if (e.isDirectory()) { walk(join(dir, e.name), r); continue; }
      const dest = join(projectPath, 'scripts', 'hooks', r);
      if (!existsSync(dest)) out.added++;
      else if (readFileSync(dest).equals(readFileSync(join(dir, e.name)))) out.identical++;
      else out.kept.push(r);
    }
  };
  walk(src);
  return out;
}

const INSTALLERS = {
  'claude-code': (p, o) => installHooks(p, o),
  codex: (p, o) => installCodexHooks(p, o),
  'gemini-cli': (p, o) => installGeminiHooks(p, o),
  antigravity: (p, o) => installAgyHooks(p, o),
};

/**
 * Add the hooks that are missing to an already-initialized project.
 *
 * - A hook that is already there is not touched, and nothing is written for it.
 * - The adopter's own hooks are never touched: every installer merges (Claude,
 *   Codex, Gemini) or writes only under the key UDS owns (agy).
 * - A hook script the project already has and that differs from this version is
 *   KEPT unless `overwriteScripts` — it may have been edited. It is reported.
 * - `plan: true` reads and reports, and writes nothing.
 *
 * @param {string} projectPath
 * @param {string[]} tools
 * @param {{ plan?: boolean, overwriteScripts?: boolean }} [opts]
 * @returns {{ results: Array<{tool:string, outcome:'installed'|'unchanged'|'would-install'|'blocked'|'failed', path:string, why?:string, repaired?:boolean}>, scripts: {added:number, identical:number, kept:string[]}, artifacts: object }}
 *   `artifacts` is the recorder of what this call wrote (see core/install-records.js);
 *   the caller persists it into the manifest so `uds uninstall` can remove exactly that.
 */
export function installMissingHooks(projectPath, tools, { plan = false, overwriteScripts = false, recorder = newRecorder() } = {}) {
  // Measured BEFORE anything is copied: afterwards every script would read "identical".
  const scripts = scriptDiff(projectPath);
  const results = [];
  for (const tool of tools) {
    const st = hookStatus(projectPath, tool);
    if (st.status === 'present') { results.push({ tool, outcome: 'unchanged', path: st.path }); continue; }
    if (st.status === 'blocked') { results.push({ tool, outcome: 'blocked', path: st.path, why: st.why }); continue; }
    if (plan) { results.push({ tool, outcome: 'would-install', path: st.path, repaired: st.status === 'stale' }); continue; }
    const r = INSTALLERS[tool](projectPath, { overwriteScripts, recorder });
    if (r.installed) results.push({ tool, outcome: 'installed', path: r.settingsPath ?? st.path, repaired: st.status === 'stale' });
    else results.push({ tool, outcome: 'failed', path: r.settingsPath ?? st.path, why: r.reason ?? 'no standard produced a usable hook' });
  }
  return { results, scripts, artifacts: recorder };
}
