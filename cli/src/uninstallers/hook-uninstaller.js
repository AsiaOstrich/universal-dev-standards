import { existsSync, readFileSync, writeFileSync, unlinkSync, readdirSync, rmdirSync } from 'fs';
import { join, basename } from 'path';
import { proveUnchanged, RECORD_KINDS, RECORDS_KEY, isRealDirectory } from '../core/install-records.js';
import { stripUdsHookBlock } from '../utils/git-hooks.js';
import {
  collectHookConfigs, standardsSourceDir, hooksSourceDir,
  CODEX_HOOK_SCRIPT, GEMINI_HOOK_SCRIPT, AGY_HOOK_SCRIPT,
} from '../installers/hooks-installer.js';

/**
 * Every UDS-installed hook entry — in .claude/settings.json, .codex/hooks.json
 * and .gemini/settings.json alike — runs a command of the shape
 * `node scripts/hooks/<script>` (see installHooks/installCodexHooks/
 * installGeminiHooks in ../installers/hooks-installer.js). That path alone is
 * NOT a safe signature, though: `scripts/hooks/` is a directory UDS itself
 * scaffolds inside the adopter's project, so an adopter's own hook script can
 * live at the exact same path and be indistinguishable by path alone
 * (verified: an earlier version of this file matched on path only, and a
 * test placing a user hook at `scripts/hooks/my-own-hook.mjs` lost it).
 * The safe signature is path *and* a script basename UDS is actually known to
 * ship right now — the same set collectHookConfigs() derives for install,
 * plus the three fixed Codex/Gemini/agy script names.
 *
 * 🔴 Until this file added the three functions below, uninstall only ever
 * touched .husky/pre-commit and .git/hooks/pre-commit — the settings.json /
 * hooks.json files installHooks() etc. actually write were never cleaned up,
 * so `uds uninstall` silently left every enforcement hook running (Claude
 * Code included, not just Codex/Gemini).
 */
const UDS_HOOK_COMMAND_PATTERN = /^node scripts\/hooks\//;

/** The command string a hook entry runs, mirroring hooks-installer.js's own commandOf(). */
function commandOf(entry) {
  const h = entry && entry.hooks && entry.hooks[0];
  if (typeof h === 'string') return h;
  return h && typeof h.command === 'string' ? h.command : undefined;
}

/** Script basenames UDS currently ships and would install a hook entry for. */
function knownUdsHookScripts() {
  const { scripts } = collectHookConfigs(standardsSourceDir(), hooksSourceDir());
  return new Set([...scripts.map((s) => basename(s)), CODEX_HOOK_SCRIPT, GEMINI_HOOK_SCRIPT, AGY_HOOK_SCRIPT]);
}

function isUdsHookEntry(entry, knownScripts) {
  const cmd = commandOf(entry);
  if (typeof cmd !== 'string' || !UDS_HOOK_COMMAND_PATTERN.test(cmd)) return false;
  return knownScripts.has(basename(cmd));
}

/**
 * Strip UDS-installed entries out of a `{ event: entry[] }` map, dropping any
 * event key left with zero entries. An adopter's own hooks on the same event
 * (or even the same array, or the same `scripts/hooks/` directory) are never
 * touched — only entries whose command names a script UDS is known to ship
 * are removed.
 */
function stripUdsEntries(hooksMap) {
  const knownScripts = knownUdsHookScripts();
  let removedCount = 0;
  const nextMap = {};
  for (const [event, entries] of Object.entries(hooksMap || {})) {
    const kept = (entries || []).filter((entry) => {
      if (isUdsHookEntry(entry, knownScripts)) {
        removedCount += 1;
        return false;
      }
      return true;
    });
    if (kept.length > 0) nextMap[event] = kept;
  }
  return { nextMap, removedCount };
}

/** Put a stripped hooks map back onto a config object, dropping the `hooks` key entirely if empty. */
function applyHooksMap(config, nextMap) {
  const updated = { ...config };
  if (Object.keys(nextMap).length > 0) {
    updated.hooks = nextMap;
  } else {
    delete updated.hooks;
  }
  return updated;
}

/**
 * Shared machinery for the three "remove UDS entries from a hooks config
 * file" functions below. Handles the missing-file, invalid-JSON, and
 * nothing-to-remove cases identically for all three, so their only
 * difference is which file and which key they look at.
 */
function uninstallHookConfigFile({ configPath, label, dryRun, deleteEmptyFile }) {
  const result = { removed: [], skipped: [], errors: [], deletedPaths: [] };
  if (!existsSync(configPath)) return result; // nothing installed here — nothing to report

  let config;
  try {
    config = JSON.parse(readFileSync(configPath, 'utf-8'));
  } catch (error) {
    result.errors.push(`${label} — could not parse (${error.message}); left untouched`);
    return result;
  }

  const { nextMap, removedCount } = stripUdsEntries(config.hooks);
  if (removedCount === 0) {
    result.skipped.push(`${label} (no UDS hook entries found)`);
    return result;
  }

  const entryLabel = `${label} (${removedCount} UDS hook ${removedCount === 1 ? 'entry' : 'entries'})`;
  const updatedConfig = applyHooksMap(config, nextMap);
  const willDeleteFile = deleteEmptyFile && Object.keys(updatedConfig).length === 0;
  // Decided BEFORE the dry-run return: the preview must say the file goes away,
  // and the folder-cleanup step needs to know the folder will be empty.
  if (dryRun) {
    result.removed.push(willDeleteFile ? `${entryLabel}, file removed — created by UDS, now empty` : entryLabel);
    if (willDeleteFile) result.deletedPaths.push(label);
    return result;
  }

  try {
    if (willDeleteFile) {
      unlinkSync(configPath);
      result.removed.push(`${entryLabel}, file removed — created by UDS, now empty`);
      result.deletedPaths.push(label);
    } else {
      writeFileSync(configPath, JSON.stringify(updatedConfig, null, 2) + '\n');
      result.removed.push(entryLabel);
    }
  } catch (error) {
    result.errors.push(`${label} — ${error.message}`);
  }

  return result;
}

/** Remove UDS's Stop/PreToolUse/etc. entries from .claude/settings.json (installHooks()'s output). */
export function uninstallClaudeCodeHooks(projectPath, options = {}) {
  return uninstallHookConfigFile({
    configPath: join(projectPath, '.claude', 'settings.json'),
    label: '.claude/settings.json',
    dryRun: options.dryRun || false,
    deleteEmptyFile: true,
  });
}

/** Remove UDS's Stop entry from .codex/hooks.json (installCodexHooks()'s output). */
export function uninstallCodexHooks(projectPath, options = {}) {
  return uninstallHookConfigFile({
    configPath: join(projectPath, '.codex', 'hooks.json'),
    label: '.codex/hooks.json',
    dryRun: options.dryRun || false,
    deleteEmptyFile: true,
  });
}

/** Remove UDS's AfterAgent entry from .gemini/settings.json (installGeminiHooks()'s output). */
export function uninstallGeminiHooks(projectPath, options = {}) {
  return uninstallHookConfigFile({
    configPath: join(projectPath, '.gemini', 'settings.json'),
    label: '.gemini/settings.json',
    dryRun: options.dryRun || false,
    deleteEmptyFile: true,
  });
}

/**
 * A bare `{ type, command }` handler (agy's shape — no `hooks[]` wrapper) that
 * runs one of the scripts UDS ships.
 */
function isUdsAgyHandler(handler, knownScripts) {
  const cmd = handler && typeof handler.command === 'string' ? handler.command : undefined;
  // agy's hook cwd is `.agents/`, so the installed command climbs out first
  // (`node ../scripts/hooks/...`); the earlier `node scripts/hooks/...` form
  // is still recognised so an install made before that fix can be removed.
  return typeof cmd === 'string' && /^node (?:\.\.\/)?scripts\/hooks\//.test(cmd) && knownScripts.has(basename(cmd));
}

/**
 * Remove UDS's Stop handler from .agents/hooks.json (installAgyHooks()'s output).
 *
 * agy's file is `{ "<hook name>": { "<Event>": handler[] } }`, not the
 * `{ hooks: { <Event>: entry[] } }` the other three share, so the generic
 * stripper cannot be used. Only handlers that run a UDS-shipped script are
 * removed, and from ANY hook name (an adopter may have renamed our key); a
 * user's own handler, even inside the same name or the same event array, stays.
 * A name left with no event after removal is dropped, and a file left empty is
 * deleted.
 */
export function uninstallAgyHooks(projectPath, options = {}) {
  const configPath = join(projectPath, '.agents', 'hooks.json');
  const label = '.agents/hooks.json';
  const dryRun = options.dryRun || false;
  const result = { removed: [], skipped: [], errors: [], deletedPaths: [] };
  if (!existsSync(configPath)) return result;

  let config;
  try {
    config = JSON.parse(readFileSync(configPath, 'utf-8'));
  } catch (error) {
    result.errors.push(`${label} — could not parse (${error.message}); left untouched`);
    return result;
  }
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    result.skipped.push(`${label} (no UDS hook entries found)`);
    return result;
  }

  const knownScripts = knownUdsHookScripts();
  let removedCount = 0;
  const next = {};
  for (const [name, def] of Object.entries(config)) {
    if (!def || typeof def !== 'object' || Array.isArray(def)) {
      next[name] = def;
      continue;
    }
    const nextDef = {};
    let touched = false;
    let eventsLeft = 0;
    for (const [key, value] of Object.entries(def)) {
      if (!Array.isArray(value)) {
        nextDef[key] = value; // e.g. `enabled`
        continue;
      }
      const kept = value.filter((h) => {
        if (isUdsAgyHandler(h, knownScripts)) {
          removedCount += 1;
          touched = true;
          return false;
        }
        return true;
      });
      if (kept.length > 0) {
        nextDef[key] = kept;
        eventsLeft += 1;
      }
    }
    // A name we emptied is dropped (nothing but `enabled` would remain);
    // a name we did not touch is kept exactly as found.
    if (touched && eventsLeft === 0) continue;
    next[name] = touched ? nextDef : def;
  }

  if (removedCount === 0) {
    result.skipped.push(`${label} (no UDS hook entries found)`);
    return result;
  }

  const entryLabel = `${label} (${removedCount} UDS hook ${removedCount === 1 ? 'entry' : 'entries'})`;
  const willDeleteFile = Object.keys(next).length === 0;
  if (dryRun) {
    result.removed.push(willDeleteFile ? `${entryLabel}, file removed — created by UDS, now empty` : entryLabel);
    if (willDeleteFile) result.deletedPaths.push(label);
    return result;
  }
  try {
    if (willDeleteFile) {
      unlinkSync(configPath);
      result.removed.push(`${entryLabel}, file removed — created by UDS, now empty`);
      result.deletedPaths.push(label);
    } else {
      writeFileSync(configPath, JSON.stringify(next, null, 2) + '\n');
      result.removed.push(entryLabel);
    }
  } catch (error) {
    result.errors.push(`${label} — ${error.message}`);
  }
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// Proof of authorship — "only delete what UDS can prove it wrote, unchanged".
//
// A record in `manifest.installedArtifacts` (core/install-records.js) says UDS
// wrote a file; a matching hash says nobody has changed it since. Both are
// required to delete a whole file. Anything else is KEPT, and the reason is
// printed, because "not provably ours" is the honest state of a file from an
// older UDS (no record) or one an adopter has edited (hash differs) — and
// guessing "probably ours" is how an adopter's own hook script gets deleted.
// ─────────────────────────────────────────────────────────────────────────────

/** Relative paths (forward slashes) of every file under `dir`, or [] if it is not there. */
function listFiles(dir, rel = '') {
  if (!dir || !existsSync(dir)) return [];
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const r = rel ? `${rel}/${e.name}` : e.name;
    if (e.isDirectory()) out.push(...listFiles(join(dir, e.name), r));
    else out.push(r);
  }
  return out;
}

/**
 * Remove the hook scripts UDS copied into `scripts/hooks/`.
 *
 * `scripts/hooks/` is a directory UDS scaffolds inside the adopter's project, so
 * an adopter's own scripts can sit beside ours (a test in hook-uninstaller.test.js
 * places one there and it must survive). Only files that have an install record
 * AND still match it are deleted.
 */
export function uninstallHookScripts(projectPath, manifest, { dryRun = false, blockedBy = null } = {}) {
  const result = { removed: [], skipped: [], errors: [], deletedPaths: [] };
  const files = manifest?.[RECORDS_KEY]?.files || {};
  const recorded = Object.entries(files)
    // gate-script: the scanners `uds init` writes to scripts/ (XSPEC-444 R5) — same proof rule as a hook script
    .filter(([, rec]) => rec && (rec.kind === RECORD_KINDS.HOOK_SCRIPT || rec.kind === RECORD_KINDS.GATE_SCRIPT))
    .map(([rel]) => rel)
    .sort();

  for (const rel of recorded) {
    const abs = join(projectPath, rel);
    if (!existsSync(abs)) continue; // already gone — nothing to remove, nothing to report
    if (blockedBy) {
      result.skipped.push(`${rel} (kept: ${blockedBy})`);
      continue;
    }
    const proof = proveUnchanged(manifest, projectPath, rel);
    if (proof.state !== 'proven') {
      result.skipped.push(`${rel} (kept: ${proof.why})`);
      continue;
    }
    try {
      if (!dryRun) unlinkSync(abs);
      result.removed.push(`${rel} (deleted — installed by UDS, ${proof.why})`);
      result.deletedPaths.push(rel);
    } catch (error) {
      result.errors.push(`${rel} — ${error.message}`);
    }
  }

  // Files that carry the name of a script UDS ships but have no record. Say so once,
  // so a leftover `scripts/hooks/` is an explained decision and not a silent gap.
  const recordedSet = new Set(recorded);
  const shipped = listFiles(hooksSourceDir());
  const unrecorded = shipped
    .map((f) => `scripts/hooks/${f}`)
    .filter((rel) => existsSync(join(projectPath, rel)) && !recordedSet.has(rel));
  if (unrecorded.length > 0) {
    result.skipped.push(
      `scripts/hooks/ (kept: ${unrecorded.length} file${unrecorded.length === 1 ? '' : 's'} carry the name of a UDS hook script, ` +
      'but the manifest has no record that UDS wrote them — installed by an older UDS, or by hand. ' +
      'Delete them yourself if you no longer want them)'
    );
  }
  return result;
}

// Line-level fallback, for the one-line form older UDS wrote and for a block whose
// end marker an adopter removed. The current block is removed whole, by its markers
// (stripUdsHookBlock) — its inner lines are not individually matchable.
const UDS_PRECOMMIT_LINE = /uds\s+check|universal-dev-standards\s+check|checkin-standards|^#\s*UDS Standard Check\s*$/;
const NATIVE_UDS_LINE = /uds\s+check|checkin-standards|UDS pre-commit hook/;

/** True when nothing is left but a shebang and blank lines. */
function nothingButShebang(lines) {
  return lines.every((l) => !l.trim() || /^#!/.test(l.trim()));
}

/**
 * Remove UDS-related lines from .husky/pre-commit, the native
 * .git/hooks/pre-commit fallback, and the enforcement-hook entries UDS wrote
 * into .claude/settings.json, .codex/hooks.json, .gemini/settings.json and
 * .agents/hooks.json; and the hook scripts copied into scripts/hooks/.
 *
 * Whole-file deletion (a hook file, a script) needs proof — see proveUnchanged.
 * A hook file that is not provably wholly UDS's still has its UDS lines removed
 * (each is a line UDS wrote, and the rest of the file is untouched) and the
 * remainder is reported as kept, with the reason.
 *
 * @param {string} projectPath - Project root path
 * @param {Object} options - { dryRun: boolean, manifest: object|null }
 *   `manifest` must be read BEFORE `.standards/` is removed; it carries the install records.
 * @returns {Object} { removed: string[], skipped: string[], errors: string[], deletedPaths: string[] }
 */
export function uninstallHook(projectPath, options = {}) {
  const { dryRun = false, manifest = null } = options;
  const result = { removed: [], skipped: [], errors: [], deletedPaths: [] };
  const hookPath = join(projectPath, '.husky', 'pre-commit');

  if (!existsSync(hookPath)) {
    result.skipped.push('.husky/pre-commit (not found)');
  } else {
    try {
      const content = readFileSync(hookPath, 'utf-8');
      const proof = proveUnchanged(manifest, projectPath, '.husky/pre-commit');
      const lines = content.split('\n');
      const filteredLines = stripUdsHookBlock(content).content.split('\n')
        .filter(line => !UDS_PRECOMMIT_LINE.test(line));

      if (proof.state === 'proven') {
        // UDS created this file and nobody has touched it: nothing of the adopter's is in it.
        if (!dryRun) unlinkSync(hookPath);
        result.removed.push(`.husky/pre-commit (deleted — created by UDS, ${proof.why})`);
        result.deletedPaths.push('.husky/pre-commit');
      } else if (filteredLines.length === lines.length) {
        result.skipped.push('.husky/pre-commit (no UDS lines found)');
      } else if (nothingButShebang(filteredLines)) {
        // Only UDS's lines (and a shebang) were in it — removing them leaves nothing worth keeping.
        if (!dryRun) unlinkSync(hookPath);
        result.removed.push('.husky/pre-commit (UDS check lines; file removed — nothing else was in it)');
        result.deletedPaths.push('.husky/pre-commit');
      } else if (dryRun) {
        result.removed.push('.husky/pre-commit (UDS check lines)');
      } else {
        writeFileSync(hookPath, filteredLines.join('\n'), 'utf-8');
        result.removed.push('.husky/pre-commit (UDS check lines)');
      }
    } catch (error) {
      result.errors.push(`.husky/pre-commit — ${error.message}`);
    }
  }

  // Also handle native .git/hooks/pre-commit (installed by uds init for non-Node projects)
  const nativeHookPath = join(projectPath, '.git', 'hooks', 'pre-commit');
  if (existsSync(nativeHookPath)) {
    try {
      const content = readFileSync(nativeHookPath, 'utf-8');
      const proof = proveUnchanged(manifest, projectPath, '.git/hooks/pre-commit');

      if (proof.state === 'proven') {
        // The whole script is what `uds init` wrote — including the parts no line
        // pattern would ever match (its "Auto-generated by uds init" header, the
        // linter fallbacks, the closing echo). Deleting only the matching lines
        // used to leave that body behind, still executable, still claiming
        // "Pre-commit checks passed".
        if (!dryRun) unlinkSync(nativeHookPath);
        result.removed.push(`.git/hooks/pre-commit (UDS native hook, file removed — ${proof.why})`);
        result.deletedPaths.push('.git/hooks/pre-commit');
      } else if (!NATIVE_UDS_LINE.test(content) && !stripUdsHookBlock(content).removed) {
        result.skipped.push('.git/hooks/pre-commit (no UDS lines found)');
      } else {
        // The block the native hook carries is removed whole, by its markers — its
        // inner lines are not individually matchable (same as the husky path above).
        const filtered = stripUdsHookBlock(content).content.split('\n')
          .filter(line => !NATIVE_UDS_LINE.test(line));
        if (nothingButShebang(filtered)) {
          if (!dryRun) unlinkSync(nativeHookPath);
          result.removed.push('.git/hooks/pre-commit (UDS native hook, file removed)');
          result.deletedPaths.push('.git/hooks/pre-commit');
        } else {
          if (!dryRun) writeFileSync(nativeHookPath, filtered.join('\n'), 'utf-8');
          result.removed.push('.git/hooks/pre-commit (UDS lines removed)');
          result.skipped.push(`.git/hooks/pre-commit (kept: the rest of the script — ${proof.why})`);
        }
      }
    } catch (error) {
      result.errors.push(`.git/hooks/pre-commit — ${error.message}`);
    }
  }

  // Enforcement hooks written by installHooks()/installCodexHooks()/installGeminiHooks()
  // — the gap this function used to have entirely (see module doc comment above).
  const configResults = [
    uninstallClaudeCodeHooks(projectPath, { dryRun }),
    uninstallCodexHooks(projectPath, { dryRun }),
    uninstallGeminiHooks(projectPath, { dryRun }),
    uninstallAgyHooks(projectPath, { dryRun }),
  ];
  for (const sub of configResults) {
    result.removed.push(...sub.removed);
    result.skipped.push(...sub.skipped);
    result.errors.push(...sub.errors);
    result.deletedPaths.push(...sub.deletedPaths);
  }

  // The scripts those entries ran. If a config file could not be cleaned (it still
  // names a script), deleting the script would turn a working hook into a failing one.
  const configFailed = configResults.some((r) => r.errors.length > 0);
  const scripts = uninstallHookScripts(projectPath, manifest, {
    dryRun,
    blockedBy: configFailed ? 'a hook config file could not be cleaned (see the error above) and still runs this script' : null
  });
  result.removed.push(...scripts.removed);
  result.skipped.push(...scripts.skipped);
  result.errors.push(...scripts.errors);
  result.deletedPaths.push(...scripts.deletedPaths);

  return result;
}

/**
 * Remove the folders UDS had to create for its files (`.codex/`, `scripts/hooks/`, ...),
 * once they are empty.
 *
 * A folder is removed only if (a) the manifest recorded that UDS created it and
 * (b) nothing is left in it. An empty `.codex/` that the adopter made themselves is
 * indistinguishable by looking; the record is the only thing that tells them apart.
 * A folder that still holds anything — `.agents/rules/style.md` — is kept and
 * reported, so the adopter sees why it stayed.
 *
 * In a dry run nothing has been deleted yet, so `plannedDeletions` (relative paths
 * the run WOULD delete) stands in for the missing deletions when judging "empty".
 *
 * @param {string} projectPath
 * @param {Object|null} manifest - read before `.standards/` was removed
 * @param {{ dryRun?: boolean, plannedDeletions?: string[] }} [options]
 * @returns {{ removed: string[], skipped: string[], errors: string[], deletedPaths: string[] }}
 */
export function pruneCreatedDirs(projectPath, manifest, { dryRun = false, plannedDeletions = [] } = {}) {
  const result = { removed: [], skipped: [], errors: [], deletedPaths: [] };
  const dirs = manifest?.[RECORDS_KEY]?.createdDirs || [];
  const gone = new Set(plannedDeletions.map((p) => p.replace(/\\/g, '/')));
  // Deepest first: `scripts/hooks` must go before `scripts` can be seen as empty.
  const ordered = [...new Set(dirs)]
    .filter((d) => d && !d.startsWith('..') && !d.startsWith('/'))
    .sort((a, b) => b.split('/').length - a.split('/').length);

  for (const rel of ordered) {
    const abs = join(projectPath, rel);
    if (!existsSync(abs)) continue;
    if (!isRealDirectory(abs)) {
      result.skipped.push(`${rel}/ (kept: not a plain directory)`);
      continue;
    }
    try {
      const left = readdirSync(abs).filter((name) => !gone.has(`${rel}/${name}`));
      if (left.length > 0) {
        result.skipped.push(`${rel}/ (kept: created by UDS but not empty — still holds ${left.slice(0, 3).join(', ')}${left.length > 3 ? ', ...' : ''}, which UDS did not write)`);
        continue;
      }
      if (!dryRun) rmdirSync(abs);
      gone.add(rel);
      result.removed.push(`${rel}/ (empty folder created by UDS, removed)`);
      result.deletedPaths.push(rel);
    } catch (error) {
      result.errors.push(`${rel}/ — ${error.message}`);
    }
  }
  return result;
}
