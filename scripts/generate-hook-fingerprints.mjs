#!/usr/bin/env node
// SPDX-License-Identifier: MIT
//
// Builds cli/src/installers/hook-script-fingerprints.json: the sha256 of every hook script
// content UDS has shipped, so `uds update --with-hooks` can tell an OLD UDS COPY (safe to replace)
// from an ADOPTER-EDITED one (must be kept).
//
// WHY A GENERATOR, NOT A HAND-WRITTEN LIST
//   A fingerprint typed by hand is a claim nobody checked. Every entry here is computed from a
//   git object: a release tag's tree, or the working tree. The table is append-only -- an entry is
//   never dropped, because an adopter can still be running a copy from two years ago.
//
// WHERE ENTRIES COME FROM
//   1. every `v*` tag: the blobs under scripts/hooks/ in that tag's tree (first tag wins as the label)
//   2. the working tree's scripts/hooks/ (labelled "unreleased" until a tag containing it exists)
//   3. what the file already holds (kept)
//
// THE GUARD AGAINST FORGETTING A NEW VERSION
//   When a hook script changes, the version that adopters now have becomes the "old" one on the
//   next release. This script is how its fingerprint gets in -- and
//   cli/tests/unit/hooks/hook-script-fingerprints.test.js fails if any script under scripts/hooks/
//   has content the table lacks, so the change cannot be committed without regenerating.
//
// Usage
//   node scripts/generate-hook-fingerprints.mjs            write the file (merge: tags + working tree + existing)
//   node scripts/generate-hook-fingerprints.mjs --check    exit 1 if the file lacks anything the working tree
//                                                          or any release tag has (what pre-release-check runs;
//                                                          tags are skipped, loudly, in a clone that has none)
//   node scripts/generate-hook-fingerprints.mjs --self-test
//
// Node built-ins only (CI jobs that run root scripts install no packages).

/**
 * Generate the table of hook script contents UDS has shipped (for telling an old UDS copy from an edit).
 */

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdtempSync, rmSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FINGERPRINT_FILE, hashHookScript } from '../cli/src/installers/hook-script-fingerprint.js';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const HOOKS_DIR = 'scripts/hooks';
export const UNRELEASED = 'unreleased';

// Run git without any GIT_* variable from the caller. Inside a git hook (husky runs the tests from one)
// GIT_DIR / GIT_INDEX_FILE point at the hook's repository, and they win over `cwd`: the self-test's
// throwaway repo would then be commits and a tag in the REAL one.
const cleanEnv = (extra = {}) => ({ ...Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith('GIT_'))), ...extra });
const git = (args, cwd = ROOT) => execFileSync('git', args, { cwd, encoding: 'buffer', maxBuffer: 64 * 1024 * 1024, env: cleanEnv() });
const gitText = (args, cwd = ROOT) => git(args, cwd).toString('utf-8');

/** { relPath -> sha256 } of the files under scripts/hooks in a directory. */
function walkWorkingTree(root) {
  const base = join(root, HOOKS_DIR);
  const out = {};
  if (!existsSync(base)) return out;
  const walk = (dir, rel = '') => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const r = rel ? `${rel}/${e.name}` : e.name;
      if (e.isDirectory()) walk(join(dir, e.name), r);
      else out[r] = hashHookScript(readFileSync(join(dir, e.name)));
    }
  };
  walk(base);
  return out;
}

/** Release tags, oldest first. */
function releaseTags(cwd = ROOT) {
  return gitText(['tag', '--list', 'v*', '--sort=creatordate'], cwd).split('\n').map((s) => s.trim()).filter(Boolean);
}

/** Hash of every blob under scripts/hooks in a tag; `cache` avoids refetching a blob shared by many tags. */
function tagFingerprints(tag, cache, cwd = ROOT) {
  const out = {};
  const listing = gitText(['ls-tree', '-r', tag, '--', HOOKS_DIR], cwd).split('\n').filter(Boolean);
  for (const line of listing) {
    // "<mode> blob <sha>\t<path>"
    const [meta, path] = line.split('\t');
    const sha = meta.split(' ')[2];
    if (!cache.has(sha)) cache.set(sha, hashHookScript(git(['cat-file', 'blob', sha], cwd)));
    out[path.slice(HOOKS_DIR.length + 1)] = cache.get(sha);
  }
  return out;
}

/** Merge into `table` ({path: {sha: label}}); a real tag label replaces "unreleased"; an existing real label is never replaced. */
function add(table, path, sha, label) {
  const entry = (table[path] ||= {});
  if (!entry[sha] || (entry[sha] === UNRELEASED && label !== UNRELEASED)) entry[sha] = label;
}

export function readExisting(file = FINGERPRINT_FILE) {
  if (!existsSync(file)) return {};
  return JSON.parse(readFileSync(file, 'utf-8')).scripts ?? {};
}

/** Pure: existing + every tag + working tree. */
export function build({ existing, tags, tagsPrints, working }) {
  const table = {};
  for (const [p, shas] of Object.entries(existing)) for (const [sha, label] of Object.entries(shas)) add(table, p, sha, label);
  tags.forEach((tag, i) => { for (const [p, sha] of Object.entries(tagsPrints[i])) add(table, p, sha, tag); });
  for (const [p, sha] of Object.entries(working)) add(table, p, sha, UNRELEASED);
  return table;
}

export function serialize(table) {
  const scripts = {};
  for (const p of Object.keys(table).sort()) scripts[p] = table[p]; // within a path: insertion order = oldest first
  return JSON.stringify({
    _about: 'Generated by scripts/generate-hook-fingerprints.mjs from git tags. Do not edit by hand. Append-only: sha256 of each hook script content UDS has shipped (CRLF folded to LF), with the first release that carried it.',
    scripts,
  }, null, 2) + '\n';
}

/** What `table` lacks that the working tree / tags have: [{path, sha, from}] */
export function missing(table, { tagsPrints, tags, working }) {
  const out = [];
  const have = (p, sha) => Boolean(table[p]?.[sha]);
  for (const [p, sha] of Object.entries(working)) if (!have(p, sha)) out.push({ path: p, sha, from: 'working tree' });
  tags.forEach((tag, i) => { for (const [p, sha] of Object.entries(tagsPrints[i])) if (!have(p, sha)) out.push({ path: p, sha, from: tag }); });
  return out;
}

function gather(cwd = ROOT) {
  const tags = releaseTags(cwd);
  const cache = new Map();
  const tagsPrints = tags.map((t) => tagFingerprints(t, cache, cwd));
  return { tags, tagsPrints, working: walkWorkingTree(cwd) };
}

function selfTest() {
  let failed = 0;
  const check = (name, cond) => { console.log(`  ${cond ? 'ok  ' : 'FAIL'} ${name}`); if (!cond) failed++; };

  // Arm 1 (pure): a new content for a known path is reported missing, then covered after build().
  const existing = { 'a.mjs': { aaa: 'v1.0.0' } };
  const input = { tags: ['v1.0.0', 'v1.1.0'], tagsPrints: [{ 'a.mjs': 'aaa' }, { 'a.mjs': 'bbb' }], working: { 'a.mjs': 'ccc' } };
  check('control: a table that already holds everything reports nothing missing', missing(build({ existing, ...input }), input).length === 0);
  const gaps = missing(existing, input);
  check('a tag content absent from the table is reported', gaps.some((g) => g.sha === 'bbb' && g.from === 'v1.1.0'));
  check('a working-tree content absent from the table is reported', gaps.some((g) => g.sha === 'ccc' && g.from === 'working tree'));
  const built = build({ existing, ...input });
  check('after build() nothing is missing', missing(built, input).length === 0);
  check('append-only: the old entry keeps its label', built['a.mjs'].aaa === 'v1.0.0');
  check('a tag label replaces "unreleased"', build({ existing: { 'a.mjs': { zzz: UNRELEASED } }, tags: ['v2.0.0'], tagsPrints: [{ 'a.mjs': 'zzz' }], working: {} })['a.mjs'].zzz === 'v2.0.0');

  // Arm 2 (real git): a throwaway repo with one tag and a later edit.
  const base = mkdtempSync(join(tmpdir(), 'uds-fp-selftest-'));
  const dir = join(base, 'repo');
  // An empty file as the global git config, NOT os.devNull: on Windows that is `\\.\nul`, which Git for
  // Windows cannot open as a config file ("fatal: unable to access '//./nul': Invalid argument"; this
  // self-test failed on windows-latest at 6.14.1-beta.2 and 6.14.1). It sits beside the repo, not in it,
  // so `git add .` does not pick it up.
  const emptyConfig = join(base, 'gitconfig-empty');
  try {
    mkdirSync(dir);
    writeFileSync(emptyConfig, '');
    const run = (...a) => execFileSync('git', a, { cwd: dir, stdio: 'pipe', env: cleanEnv({ GIT_AUTHOR_NAME: 't', GIT_AUTHOR_EMAIL: 't@t', GIT_COMMITTER_NAME: 't', GIT_COMMITTER_EMAIL: 't@t', GIT_CONFIG_GLOBAL: emptyConfig, GIT_CONFIG_NOSYSTEM: '1' }) });
    mkdirSync(join(dir, HOOKS_DIR), { recursive: true });
    run('init', '-q');
    writeFileSync(join(dir, HOOKS_DIR, 'h.mjs'), 'old\r\n');
    run('add', '.'); run('commit', '-q', '-m', 'one'); run('tag', 'v1.0.0');
    writeFileSync(join(dir, HOOKS_DIR, 'h.mjs'), 'new\n');
    const g = gather(dir);
    const t = build({ existing: {}, ...g });
    const oldSha = hashHookScript(Buffer.from('old\n'));
    check('git arm: the tagged content is in the table under its tag (CRLF folded)', t['h.mjs'][oldSha] === 'v1.0.0');
    check('git arm: the edited working-tree content is "unreleased"', t['h.mjs'][hashHookScript(Buffer.from('new\n'))] === UNRELEASED);
    check('git arm: a table built from tags only is flagged as missing the working-tree edit', missing(build({ existing: {}, ...g, working: {} }), g).length === 1);
  } finally {
    rmSync(base, { recursive: true, force: true });
  }
  console.log(failed ? `\n${failed} self-test arm(s) FAILED` : '\nall self-test arms passed');
  process.exit(failed ? 1 : 0);
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes('--self-test')) return selfTest();

  const existing = readExisting();
  const g = gather();
  if (args.includes('--check')) {
    const noTags = g.tags.length === 0;
    if (noTags) console.log('  [WARN] no release tags in this clone: only the working tree was checked, history was NOT (fetch tags to check it)');
    const gaps = missing(existing, g);
    if (gaps.length) {
      console.log(`  [FAIL] hook-script-fingerprints.json lacks ${gaps.length} content(s) that UDS has shipped or now ships:`);
      for (const x of gaps.slice(0, 20)) console.log(`         ${x.path}  ${x.sha.slice(0, 12)}  (${x.from})`);
      console.log('         Fix: node scripts/generate-hook-fingerprints.mjs   and commit the result');
      process.exit(1);
    }
    console.log(`  [OK]   hook-script-fingerprints.json covers the working tree${noTags ? '' : ` and ${g.tags.length} release tags`}`);
    return;
  }
  const out = serialize(build({ existing, ...g }));
  writeFileSync(FINGERPRINT_FILE, out);
  const t = JSON.parse(out).scripts;
  console.log(`wrote ${FINGERPRINT_FILE}: ${Object.keys(t).length} paths, ${Object.values(t).reduce((n, v) => n + Object.keys(v).length, 0)} fingerprints from ${g.tags.length} tags + working tree`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
