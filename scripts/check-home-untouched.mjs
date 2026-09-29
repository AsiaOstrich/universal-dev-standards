#!/usr/bin/env node
/**
 * check-home-untouched — did this run write anywhere UDS writes under HOME?
 * 這次執行有沒有在 HOME 底下「UDS 會寫的位置」留下痕跡。
 *
 * 🔴 Why (2026-09-29): `bash scripts/pre-release-check.sh` wrote 54 skill folders
 * and a `.manifest.json` into the maintainer's real `~/.claude/skills/`. A
 * user-level skill shadows the project-level one, so his zh-TW project silently
 * ran the English test build. Nothing noticed: every step was green, and the
 * steps that did it had been written to run in a temp directory — which isolates
 * the PROJECT, not the user.
 *
 * Isolating each call site (scripts/lib/isolated-home.*) is the fix. THIS is the
 * check that the fix is still there: a call site added next month that forgets
 * to isolate is exactly the bug again, and nothing else would say so.
 *
 * Usage:
 *   node scripts/check-home-untouched.mjs snapshot <file>   record the watched paths now
 *   node scripts/check-home-untouched.mjs compare  <file>   fail if any of them changed since
 *   node scripts/check-home-untouched.mjs --self-test       prove it can go red and green
 *
 * Exit: 0 nothing added or modified · 1 something was (paths listed) ·
 *       2 could not measure (snapshot unreadable, nothing to watch, self-test failed).
 *       2 is NOT a pass.
 *
 * ── What is watched, and where the list comes from ─────────────────────────
 * Not hand-listed. It is walked out of UDS's own installer code:
 *   1. every user-level path in cli/src/config/ai-agent-paths.js (the table the
 *      skills / commands / agents / workflows installers write to), found by
 *      walking the table for absolute paths under HOME;
 *   2. every `homedir()`-rooted path the rest of cli/src names literally
 *      (`join(homedir(), '.claude', 'skills')`, `~/.uds`, `~/.udsrc`, ...), found
 *      by scanning the source. A new installer that writes somewhere new is picked
 *      up by (2) without anyone editing this file.
 * Only those paths are watched, not `~/.claude` as a whole: a running Claude Code
 * session rewrites its own history there all day and would make this always red.
 *
 * ── What it cannot see ─────────────────────────────────────────────────────
 *   - A write to a path no installer names (a new tool writing outside the
 *     source's `homedir()` calls, e.g. through an environment variable it reads).
 *   - A write that was made and then undone before `compare`.
 *   - Another process of the same user writing into a watched path during the run
 *     (running `uds update` in another terminal while this runs is a false red).
 * "Nothing changed" means nothing changed in the watched set; the denominator is
 * printed so a set that shrank to nothing cannot pass.
 */

import { readdirSync, statSync, lstatSync, readFileSync, writeFileSync, mkdirSync, mkdtempSync, rmSync, realpathSync, existsSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { join, dirname, resolve, relative, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const CLI_SRC = join(ROOT, 'cli', 'src');

// ── discovery ───────────────────────────────────────────────────────────────

/** Walk any value; collect strings that are absolute paths inside `home`. */
function collectPaths(value, home, out) {
  if (typeof value === 'string') {
    if (value === home || value.startsWith(home + sep)) out.add(value);
  } else if (Array.isArray(value)) {
    for (const v of value) collectPaths(v, home, out);
  } else if (value && typeof value === 'object') {
    for (const v of Object.values(value)) collectPaths(v, home, out);
  }
}

function* walkJs(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* walkJs(p);
    else if (/\.(m?js|cjs)$/.test(e.name)) yield p;
  }
}

/**
 * `homedir()` / `os.homedir()` followed by literal segments:
 *   join(homedir(), '.claude', 'skills')   path.join(os.homedir(), '.uds')
 * Consecutive string literals after the call are the path.
 * Returns the paths relative to home, and how many source files were scanned.
 */
export function scanSourceForHomePaths(srcDir) {
  const found = new Set();
  let files = 0;
  for (const f of walkJs(srcDir)) {
    files++;
    const text = readFileSync(f, 'utf8');
    // Only a path being BUILT counts: `join(homedir(), '.uds')`. A bare
    // `.replace(homedir(), '~')` also has `homedir(), '<string>'` in it, and is
    // display code, not a location.
    const re = /(?:join|resolve)\(\s*(?:[\w.]*\.)?homedir\(\)\s*,\s*((?:['"][^'"\n]+['"]\s*,?\s*)+)/g;
    let m;
    while ((m = re.exec(text)) !== null) {
      const segs = [...m[1].matchAll(/['"]([^'"\n]+)['"]/g)].map((x) => x[1]);
      if (segs.length) found.add(join(...segs));
    }
  }
  return { rel: [...found].sort(), files };
}

/** The watched set for a HOME. Table-derived ∪ source-scanned. */
export async function discoverWatched(home, { cliSrc = CLI_SRC } = {}) {
  if (!existsSync(cliSrc)) throw new Unmeasurable(`the installer source directory was not found (${cliSrc}); the watched set is derived from it, so there is nothing to derive it from`);
  const abs = new Set();
  let tableCount = 0;
  const tablePath = join(cliSrc, 'config', 'ai-agent-paths.js');
  if (existsSync(tablePath)) {
    const mod = await import(`${pathToFileURL(tablePath).href}?t=${Date.now()}`);
    const t = new Set();
    collectPaths(mod.AI_AGENT_PATHS, home, t);
    tableCount = t.size;
    for (const p of t) abs.add(p);
  }
  const scan = scanSourceForHomePaths(cliSrc);
  for (const r of scan.rel) abs.add(join(home, r));
  return { watched: [...abs].sort(), tableCount, scannedFiles: scan.files, scannedPaths: scan.rel.length };
}

// ── snapshot ────────────────────────────────────────────────────────────────

/** path -> "d" | "f:<size>:<mtimeMs>" | "l" for every entry at or under `root`; "" when absent. */
function snapshotOne(root, into) {
  let st;
  try { st = lstatSync(root); } catch { into.set(root, 'absent'); return; }
  if (st.isSymbolicLink()) { into.set(root, 'l'); return; }
  if (st.isDirectory()) {
    into.set(root, 'd');
    let names = [];
    try { names = readdirSync(root); } catch { return; }
    for (const n of names) snapshotOne(join(root, n), into);
  } else {
    into.set(root, `f:${st.size}:${Math.trunc(st.mtimeMs)}`);
  }
}

export function takeSnapshot(watched) {
  const m = new Map();
  for (const w of watched) snapshotOne(w, m);
  return m;
}

/** What is new or different in `after` relative to `before` (removals are reported too). */
export function diffSnapshots(before, after) {
  const added = [];
  const modified = [];
  const removed = [];
  for (const [p, v] of after) {
    if (!before.has(p)) { if (v !== 'absent') added.push(p); continue; }
    const b = before.get(p);
    if (b === 'absent' && v !== 'absent') added.push(p);
    else if (b !== 'absent' && v === 'absent') removed.push(p);
    else if (b !== v) modified.push(p);
  }
  for (const [p, v] of before) if (!after.has(p) && v !== 'absent') removed.push(p);
  return { added: added.sort(), modified: modified.sort(), removed: removed.sort() };
}

// ── commands ────────────────────────────────────────────────────────────────

class Unmeasurable extends Error {}

async function cmdSnapshot(file) {
  const home = realpathOrSelf(homedir());
  const d = await discoverWatched(home);
  if (d.watched.length === 0 || d.tableCount === 0 || d.scannedPaths === 0) {
    throw new Unmeasurable(`nothing to watch (table paths ${d.tableCount}, source-scanned paths ${d.scannedPaths}, source files ${d.scannedFiles}); a guard over an empty set passes everything`);
  }
  const snap = takeSnapshot(d.watched);
  writeFileSync(file, JSON.stringify({ home, watched: d.watched, entries: [...snap] }));
  const present = [...snap.values()].filter((v) => v !== 'absent').length;
  console.log(`[home-guard] snapshot: HOME=${home}; watching ${d.watched.length} location(s) (${d.tableCount} from the installer path table, ${d.scannedPaths} scanned from ${d.scannedFiles} source files); ${present} existing entries recorded`);
  return 0;
}

async function cmdCompare(file) {
  let rec;
  try { rec = JSON.parse(readFileSync(file, 'utf8')); } catch (e) { throw new Unmeasurable(`cannot read the snapshot ${file}: ${e.message}`); }
  if (!rec || !Array.isArray(rec.watched) || !Array.isArray(rec.entries) || rec.watched.length === 0) throw new Unmeasurable('the snapshot is empty or malformed');
  const home = realpathOrSelf(homedir());
  if (home !== rec.home) throw new Unmeasurable(`HOME changed between snapshot and compare (${rec.home} -> ${home}); comparing two different homes says nothing`);
  const d = await discoverWatched(home);
  const watched = [...new Set([...rec.watched, ...d.watched])].sort();
  const after = takeSnapshot(watched);
  const before = new Map(rec.entries);
  const diff = diffSnapshots(before, after);
  const n = diff.added.length + diff.modified.length + diff.removed.length;
  console.log(`[home-guard] compare: HOME=${home}; watching ${watched.length} location(s); ${n} change(s)`);
  if (n === 0) return 0;
  const rel = (p) => `~/${relative(home, p).split(sep).join('/')}`;
  const show = (label, list) => {
    if (!list.length) return;
    console.log(`[home-guard] ${label} (${list.length}):`);
    for (const p of list.slice(0, 25)) console.log(`[home-guard]   ${rel(p)}`);
    if (list.length > 25) console.log(`[home-guard]   ... and ${list.length - 25} more`);
  };
  show('ADDED', diff.added);
  show('MODIFIED', diff.modified);
  show('REMOVED', diff.removed);
  console.log('[home-guard] FAIL: this run wrote into the real home directory. A subprocess that runs the UDS CLI (`uds init`, `uds update`, ...) inherited the real HOME. Give it scripts/lib/isolated-home.* — a temp cwd isolates the project, not the user.');
  return 1;
}

function realpathOrSelf(p) {
  try { return realpathSync(p); } catch { return p; }
}

/**
 * Prove this guard can go red AND green, in a throwaway HOME, through the same
 * code paths a real run uses (spawned as its own process with HOME replaced).
 */
async function selfTest() {
  const failures = [];
  const expect = (name, cond) => { if (!cond) failures.push(name); };
  const home = realpathSync(mkdtempSync(join(tmpdir(), 'uds-home-guard-self-')));
  const snap = join(home, '..', `snap-${process.pid}.json`);
  const run = (...args) => spawnSync(process.execPath, [fileURLToPath(import.meta.url), ...args], {
    encoding: 'utf8', env: { ...process.env, HOME: home, USERPROFILE: home },
  });
  try {
    mkdirSync(join(home, '.claude', 'skills', 'synced'), { recursive: true });
    writeFileSync(join(home, '.claude', 'skills', 'synced', 'keep.md'), 'user file');
    const s = run('snapshot', snap);
    expect('snapshot exits 0', s.status === 0);
    expect('snapshot watches ~/.claude/skills (derived from the installer table)', /watching \d+ location/.test(s.stdout));

    const clean = run('compare', snap);
    expect('GREEN: nothing changed -> exit 0', clean.status === 0);

    mkdirSync(join(home, '.claude', 'skills', 'plan'), { recursive: true });
    writeFileSync(join(home, '.claude', 'skills', 'plan', 'SKILL.md'), 'x');
    const added = run('compare', snap);
    expect('RED: a skill folder added under ~/.claude/skills -> exit 1', added.status === 1);
    expect('RED lists the added path', added.stdout.includes('~/.claude/skills/plan'));

    // same guard, modification instead of addition
    rmSync(join(home, '.claude', 'skills', 'plan'), { recursive: true });
    run('snapshot', snap);
    writeFileSync(join(home, '.claude', 'skills', 'synced', 'keep.md'), 'user file, edited by a stray uds');
    const modified = run('compare', snap);
    expect('RED: an existing file modified -> exit 1', modified.status === 1 && modified.stdout.includes('MODIFIED'));

    // a location UDS writes that did not exist at snapshot time
    rmSync(join(home, '.claude'), { recursive: true, force: true });
    run('snapshot', snap);
    mkdirSync(join(home, '.uds'), { recursive: true });
    writeFileSync(join(home, '.uds', 'update-check.json'), '{}');
    const uds = run('compare', snap);
    expect('RED: ~/.uds appearing (a location that was absent) -> exit 1', uds.status === 1 && uds.stdout.includes('~/.uds'));

    // a write OUTSIDE the watched set is not this guard's business
    run('snapshot', snap);
    mkdirSync(join(home, 'Documents'), { recursive: true });
    writeFileSync(join(home, 'Documents', 'note.txt'), 'x');
    expect('an unrelated file elsewhere in HOME does not trip it', run('compare', snap).status === 0);

    // cannot measure is 2, never a pass
    expect('an unreadable snapshot is exit 2', run('compare', join(home, 'no-such-snapshot.json')).status === 2);
    const other = realpathSync(mkdtempSync(join(tmpdir(), 'uds-home-guard-self-b-')));
    try {
      const moved = spawnSync(process.execPath, [fileURLToPath(import.meta.url), 'compare', snap], { encoding: 'utf8', env: { ...process.env, HOME: other, USERPROFILE: other } });
      expect('a different HOME at compare time is exit 2 (two homes say nothing)', moved.status === 2);
    } finally {
      rmSync(other, { recursive: true, force: true });
    }
  } finally {
    rmSync(home, { recursive: true, force: true });
    rmSync(snap, { force: true });
  }
  return { ok: failures.length === 0, failures };
}

async function main(argv) {
  const [cmd, file] = argv;
  try {
    if (cmd === '--self-test') {
      const r = await selfTest();
      console.log(r.ok ? '[home-guard] self-test: OK' : `[home-guard] self-test FAILED: ${r.failures.join('; ')}`);
      return r.ok ? 0 : 2;
    }
    if ((cmd === 'snapshot' || cmd === 'compare') && file) return cmd === 'snapshot' ? await cmdSnapshot(file) : await cmdCompare(file);
    console.error('usage: check-home-untouched.mjs snapshot <file> | compare <file> | --self-test');
    return 2;
  } catch (e) {
    if (e instanceof Unmeasurable) { console.error(`[home-guard] CANNOT MEASURE: ${e.message}. Exit 2 is not a pass.`); return 2; }
    console.error(`[home-guard] CANNOT MEASURE: ${e.stack || e.message}. Exit 2 is not a pass.`);
    return 2;
  }
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = await main(process.argv.slice(2));
}
