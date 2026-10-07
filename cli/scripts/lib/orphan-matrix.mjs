/**
 * Orphan matrix for the standards registry (dev-platform XSPEC-458 R4, first half).
 *
 * The question: for every standard UDS ships, does ANYTHING reach it? A standard that nothing installs,
 * indexes, wraps in a skill, checks, or calls is shipped and invisible — which is exactly how
 * `open-work-tracking` reached an adopter's registry without reaching the adopter (and how 82 other entries
 * were never installed by `uds init` at all). Nothing was red, because every command was right about
 * what it was asked.
 *
 * Five columns per registry entry:
 *   a. installedByInit    a real `uds init --yes` puts its file in `.standards/`
 *   b. inIndex            the CLAUDE.md / AGENTS.md that init generates names its file
 *   c. hasSkill           the registry names a skill folder that exists, or a SKILL.md names its file
 *   d. hasCheck           its ai.yaml declares a `physical_spec` (`uds check --standard <id>` runs it), or a
 *                         `check-<id>*` script exists in scripts/ or cli/scripts/
 *   e. calledByHookCiSkill a workflow, git hook, hook installer or skill names its file, or that check
 *                         script has a caller
 * A standard with all five empty is an ORPHAN.
 *
 * Second rule: a CHECK COMMAND (`scripts/check-*`, `cli/scripts/check-*`) that no workflow, hook, script,
 * skill or integration file calls is a command that checks nothing, whatever its tests say.
 *
 * Both rules fail CI unless the finding is on the allowlist with a reason, an owner and an expiry. The
 * allowlist is a debt register, not an exemption: an entry that is no longer a finding is itself a failure
 * (so a check that was weakened to find nothing turns the allowlist stale and goes red), and an expired
 * list fails too.
 *
 * Reference matching is by FILE NAME, boundary-checked (`testing.ai.yaml` does not match inside
 * `unit-testing.ai.yaml`), never by bare id: an id like `circuit-breaker` appears in prose everywhere, and a
 * match on prose is not a call.
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, basename, relative } from 'node:path';

const TEXT_EXT = /\.(md|yaml|yml|json|js|mjs|cjs|ts|sh|ps1|bats|txt)$/i;
const SKIP_DIRS = new Set(['node_modules', '.git', '.vitest', 'bundled', 'coverage']);

/** Every text file under `dir` (relative paths, '/'-separated). */
export function walk(root, dir, out = []) {
  const abs = join(root, dir);
  if (!existsSync(abs)) return out;
  for (const entry of readdirSync(abs, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const rel = dir ? `${dir}/${entry.name}` : entry.name;
    if (entry.isDirectory()) walk(root, rel, out);
    else if (entry.isFile() && (TEXT_EXT.test(entry.name) || !entry.name.includes('.'))) out.push(rel);
  }
  return out;
}

const read = (root, rel) => {
  try { return readFileSync(join(root, rel), 'utf-8'); } catch { return ''; }
};

/** Names a file with a boundary on its left, so `testing.ai.yaml` is not found inside `unit-testing.ai.yaml`. */
export function mentionsFile(text, fileName) {
  const escaped = fileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?<![\\w-])${escaped}(?![\\w-])`).test(text);
}

/** The file names a registry entry can be referred to by (its ai and human sources). */
export function sourceFileNames(entry) {
  const sources = typeof entry.source === 'string' ? [entry.source] : Object.values(entry.source || {});
  return [...new Set(sources.filter((s) => typeof s === 'string' && s).map((s) => basename(s.replace(/\/$/, ''))))];
}

/**
 * Where "something calls it" is looked for. Three groups, because the three columns ask different things.
 */
export function collectEvidence(root) {
  const group = (dirsAndFiles) => {
    const files = new Map();
    for (const entry of dirsAndFiles) {
      const abs = join(root, entry);
      if (!existsSync(abs)) continue;
      const rels = statSync(abs).isDirectory() ? walk(root, entry) : [entry];
      for (const rel of rels) files.set(rel, read(root, rel));
    }
    return files;
  };
  // A mention in prose (a README listing the scripts) or in this tool's own files (the allowlist names every
  // finding) is not a call.
  const notACall = (rel) => /\.md$/i.test(rel) || /^cli\/scripts\/(lib\/orphan-matrix\.mjs|orphan-matrix-allowlist\.json|check-standards-orphan-matrix\.mjs)$/.test(rel);
  const callerScope = group([
    '.github/workflows', 'cli/.husky', '.husky', '.githooks', 'scripts', 'cli/scripts', 'skills', 'integrations',
    'tests/scripts', 'cli/src'
  ]);
  for (const rel of [...callerScope.keys()]) if (notACall(rel)) callerScope.delete(rel);
  return {
    ci: group(['.github/workflows']),
    hooks: group([
      'cli/.husky', '.husky', '.githooks', 'scripts/hooks',
      'cli/src/installers/hooks-installer.js', 'cli/src/utils/git-hooks.js', 'cli/src/utils/gate-scripts.js',
      'cli/src/commands/compile.js'
    ]),
    skills: group(['skills']),
    // Where a check script's callers are looked for (a script naming itself is not a caller).
    callerScope
  };
}

/** Script stems `check-*` in scripts/ and cli/scripts/ (a .sh and its .ps1 twin are one command). */
export function listCheckCommands(root) {
  const stems = new Map();
  for (const dir of ['scripts', 'cli/scripts']) {
    const abs = join(root, dir);
    if (!existsSync(abs)) continue;
    for (const entry of readdirSync(abs, { withFileTypes: true })) {
      const m = entry.isFile() && entry.name.match(/^(check-[\w-]+)\.(sh|ps1|ts|mjs|js)$/);
      if (m) {
        if (!stems.has(m[1])) stems.set(m[1], []);
        stems.get(m[1]).push(`${dir}/${entry.name}`);
      }
    }
  }
  return stems; // stem -> files
}

/** npm aliases (`check:foo` -> ...scripts/check-foo.ts) so `npm run check:foo` counts as a call of the script. */
export function npmAliases(root) {
  const aliases = new Map();
  for (const pkg of ['package.json', 'cli/package.json']) {
    let scripts = {};
    try { scripts = JSON.parse(read(root, pkg)).scripts || {}; } catch { /* unreadable: no aliases */ }
    for (const [name, command] of Object.entries(scripts)) {
      for (const m of String(command).matchAll(/(check-[\w-]+)\.(?:sh|ps1|ts|mjs|js)/g)) {
        if (!aliases.has(m[1])) aliases.set(m[1], []);
        aliases.get(m[1]).push(name);
      }
    }
  }
  return aliases;
}

/** Files that call a check command: any file in the caller scope, other than the command's own files. */
export function callersOf(stem, ownFiles, evidence, aliases) {
  const named = new RegExp(`(?<![\\w-])${stem}(?![\\w-])`);
  const aliasCalls = (aliases.get(stem) || []).map((a) => `npm run ${a}`);
  const own = new Set(ownFiles);
  const callers = [];
  for (const [rel, text] of evidence.callerScope) {
    if (own.has(rel)) continue;
    if (named.test(text) || aliasCalls.some((c) => text.includes(c))) callers.push(rel);
  }
  return callers;
}

/**
 * @param {Object} args
 * @param {string} args.root - Repo root
 * @param {Array}  args.registry - `standards` array of the registry
 * @param {Set<string>} args.installedFiles - basenames in `.standards/` after a real `uds init --yes`
 * @param {string} args.indexText - CLAUDE.md + AGENTS.md text that init generated
 * @returns {{rows: Array, checkCommands: Array}}
 */
export function buildMatrix({ root, registry, installedFiles, indexText }) {
  const evidence = collectEvidence(root);
  const stems = listCheckCommands(root);
  const aliases = npmAliases(root);
  const checkCommands = [...stems.entries()].map(([stem, files]) => ({
    name: stem, files, callers: callersOf(stem, files, evidence, aliases)
  }));
  const callersByStem = new Map(checkCommands.map((c) => [c.name, c.callers]));

  const rows = registry.map((entry) => {
    const names = sourceFileNames(entry);
    const aiRel = typeof entry.source === 'object' ? entry.source?.ai : null;
    const aiYaml = aiRel ? read(root, aiRel) : '';

    const installedByInit = names.some((n) => installedFiles.has(n));
    const inIndex = names.some((n) => mentionsFile(indexText, n));

    const skillDir = entry.skillName && existsSync(join(root, 'skills', entry.skillName, 'SKILL.md'));
    const skillNamesIt = [...evidence.skills].some(([rel, text]) => /SKILL\.md$/.test(rel) && names.some((n) => mentionsFile(text, n)));
    const hasSkill = Boolean(skillDir) || skillNamesIt;

    const checkStems = [...stems.keys()].filter((s) => s === `check-${entry.id}` || s.startsWith(`check-${entry.id}-`));
    const hasCheck = /^physical_spec:/m.test(aiYaml) || checkStems.length > 0;

    const named = (group) => [...group].some(([, text]) => names.some((n) => mentionsFile(text, n)));
    const checkIsCalled = checkStems.some((s) => (callersByStem.get(s) || []).length > 0);
    const calledByHookCiSkill = named(evidence.ci) || named(evidence.hooks) || named(evidence.skills) || checkIsCalled;

    const columns = { installedByInit, inIndex, hasSkill, hasCheck, calledByHookCiSkill };
    return { id: entry.id, category: entry.category, ...columns, orphan: Object.values(columns).every((v) => !v) };
  });

  return { rows, checkCommands };
}

/**
 * Findings, then the allowlist applied to them.
 *
 * @param {{rows: Array, checkCommands: Array}} matrix
 * @param {Object} allowlist - { expires, standards: [{id, reason, owner}], checkCommands: [{name, reason, owner}] }
 * @param {Date} now
 */
export function judge(matrix, allowlist, now = new Date()) {
  const orphans = matrix.rows.filter((r) => r.orphan).map((r) => r.id);
  const callerless = matrix.checkCommands.filter((c) => c.callers.length === 0).map((c) => c.name);

  const problems = [];
  const entries = [
    ...(allowlist.standards || []).map((e) => ({ kind: 'standard', key: e.id, entry: e })),
    ...(allowlist.checkCommands || []).map((e) => ({ kind: 'check command', key: e.name, entry: e }))
  ];
  for (const { kind, key, entry } of entries) {
    for (const field of ['reason', 'owner']) {
      if (!entry[field] || String(entry[field]).trim().length < 10) problems.push(`allowlist ${kind} "${key}" has no real ${field}`);
    }
  }
  const expires = allowlist.expires ? new Date(allowlist.expires) : null;
  if (!expires || Number.isNaN(expires.getTime())) problems.push('allowlist has no valid "expires" date');
  else if (expires < now) problems.push(`allowlist expired on ${allowlist.expires}: decide each entry again (wire it, retire it, or re-justify it with a new date)`);

  const allowedStandards = new Set((allowlist.standards || []).map((e) => e.id));
  const allowedChecks = new Set((allowlist.checkCommands || []).map((e) => e.name));

  const newOrphans = orphans.filter((id) => !allowedStandards.has(id));
  const newCallerless = callerless.filter((name) => !allowedChecks.has(name));
  const staleStandards = [...allowedStandards].filter((id) => !orphans.includes(id));
  const staleChecks = [...allowedChecks].filter((name) => !callerless.includes(name));

  return {
    orphans, callerless, newOrphans, newCallerless, staleStandards, staleChecks, problems,
    ok: newOrphans.length === 0 && newCallerless.length === 0 && staleStandards.length === 0
      && staleChecks.length === 0 && problems.length === 0
  };
}

export const relativeTo = (root, p) => relative(root, p).replace(/\\/g, '/');
