#!/usr/bin/env node
/**
 * fetch-ci-reports — bring the reports of the post-publish acceptance into scripts/beta-acceptance/reports/<version>/
 * (dev-platform XSPEC-471 R1; XSPEC-471 R5 reads that folder).
 *
 * The post-publish workflow uploads one artifact per job, named `acceptance-<label>-<version>` (for example
 * `acceptance-ci-windows-6.14.0-beta.7`). CI never commits anything to main. This downloads the newest artifact of each label
 * with `gh`, checks that every report really is a report of THIS version installed from the npm registry, copies the
 * `.json` and `.md` files into the folder, and (when the version is the one in cli/package.json) regenerates
 * docs/PRE-RELEASE.md so the CI check "docs/PRE-RELEASE.md is what the list and the reports produce" stays green.
 * You then review `git status` and commit the files yourself.
 *
 * Usage: node scripts/beta-acceptance/fetch-ci-reports.mjs --version <x.y.z[-pre]> [--repo OWNER/REPO] [--dest <dir>] [--no-generate]
 *   needs the GitHub CLI (`gh`), logged in (`gh auth status`). --repo defaults to the repository of the current directory.
 *   --gh-js <file>   (for tests) run `node <file> <gh arguments>` instead of the `gh` program
 *
 * Exit codes: 0 at least one report was placed and none was refused; 1 nothing found, or a report was refused (wrong version,
 * not from the registry, unreadable) — what was valid is still placed; 2 could not run (no gh, gh failed, bad arguments).
 *
 * Standard library only.
 */

import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, realpathSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runProcess } from './lib/process.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..', '..');
const PLATFORMS = ['windows', 'macos', 'linux'];
const MAX_PAGES = 10;

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function parse(argv) {
  const opts = { version: null, repo: null, dest: null, generate: true, ghJs: null };
  for (let i = 0; i < argv.length; i += 1) {
    const name = argv[i];
    if (name === '--no-generate') { opts.generate = false; continue; }
    const key = { '--version': 'version', '--repo': 'repo', '--dest': 'dest', '--gh-js': 'ghJs' }[name];
    if (!key) throw new Error(`unknown option: ${name}`);
    const value = argv[(i += 1)];
    if (value === undefined || value === '') throw new Error(`${name} needs a value`);
    opts[key] = value;
  }
  if (!opts.version) throw new Error('--version is required');
  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z][0-9A-Za-z.-]*)?$/.test(opts.version)) throw new Error(`"${opts.version}" is not one exact version such as 6.14.0-beta.7`);
  if (opts.repo && !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(opts.repo)) throw new Error(`"${opts.repo}" is not OWNER/REPO`);
  opts.dest = resolve(opts.dest || join(HERE, 'reports', opts.version));
  return opts;
}

/** The newest non-expired artifact per name, for the names that belong to this version. */
export function pickArtifacts(artifacts, version) {
  const pattern = new RegExp(`^acceptance-(ci-[a-z0-9-]+)-${escapeRegExp(version)}$`);
  const newest = new Map();
  let expired = 0;
  for (const a of artifacts) {
    const m = pattern.exec(a.name || '');
    if (!m) continue;
    if (a.expired) { expired += 1; continue; }
    const have = newest.get(a.name);
    if (!have || String(a.created_at) > String(have.created_at)) newest.set(a.name, { ...a, label: m[1] });
  }
  return { picked: [...newest.values()].sort((x, y) => x.label.localeCompare(y.label)), expired };
}

/** Why a downloaded report must not be placed in the folder; empty = fine. */
export function refusalsOf(report, version) {
  const out = [];
  if (!report || report.tool !== 'uds-beta-acceptance') out.push('it is not an acceptance report (tool field)');
  else {
    if (!report.uds || report.uds.version !== version) out.push(`it is a report for ${JSON.stringify(report.uds && report.uds.version)}, not ${version}`);
    if (!report.uds || report.uds.installKind !== 'npm-registry') out.push(`the package was not installed from the npm registry (${report.uds && report.uds.installKind})`);
    if (!report.environment || typeof report.environment.platform !== 'string') out.push('it names no platform');
  }
  return out;
}

export async function main(argv) {
  let opts;
  try {
    opts = parse(argv);
  } catch (e) {
    console.error(`[fetch-ci-reports] ${e.message}`);
    return 2;
  }
  const gh = async (args) => {
    const r = opts.ghJs
      ? await runProcess({ file: process.execPath, args: [resolve(opts.ghJs), ...args], timeoutMs: 120000 })
      : await runProcess({ file: 'gh', args, timeoutMs: 120000 });
    return { ...r, text: `${r.stdout || ''}${r.stderr || ''}`.trim() };
  };

  let repo = opts.repo;
  if (!repo) {
    const r = await gh(['repo', 'view', '--json', 'nameWithOwner', '--jq', '.nameWithOwner']);
    if (r.spawnError || r.exitCode !== 0 || !/^[^/\s]+\/[^/\s]+$/.test(r.stdout.trim())) {
      console.error(`[fetch-ci-reports] cannot tell which repository to ask (gh repo view: ${r.spawnError || r.text || `exit ${r.exitCode}`}). Pass --repo OWNER/REPO, and check that gh is installed and logged in (gh auth status).`);
      return 2;
    }
    repo = r.stdout.trim();
  }

  const all = [];
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const r = await gh(['api', '--method', 'GET', `repos/${repo}/actions/artifacts?per_page=100&page=${page}`]);
    if (r.spawnError || r.exitCode !== 0) {
      console.error(`[fetch-ci-reports] gh api failed for ${repo}: ${r.spawnError || r.text}`);
      return 2;
    }
    let body;
    try { body = JSON.parse(r.stdout); } catch (e) {
      console.error(`[fetch-ci-reports] gh api answered something that is not JSON (${e.message}): ${r.stdout.slice(0, 200)}`);
      return 2;
    }
    const batch = Array.isArray(body.artifacts) ? body.artifacts : [];
    all.push(...batch);
    if (batch.length < 100) break;
  }

  const { picked, expired } = pickArtifacts(all, opts.version);
  if (picked.length === 0) {
    console.error(`[fetch-ci-reports] no artifact named acceptance-ci-<label>-${opts.version} in ${repo} (looked at ${all.length} artifacts; ${expired} matching but expired). Did the "Post-publish acceptance" workflow run for this version, and is it older than the artifact retention (90 days)?`);
    return 1;
  }

  const tmp = realpathSync(mkdtempSync(join(tmpdir(), 'uds-ci-reports-')));
  let refused = 0;
  const placed = [];
  try {
    mkdirSync(opts.dest, { recursive: true });
    for (const art of picked) {
      const dir = join(tmp, art.label);
      mkdirSync(dir, { recursive: true });
      const r = await gh(['run', 'download', String(art.workflow_run.id), '-R', repo, '-n', art.name, '-D', dir]);
      if (r.spawnError || r.exitCode !== 0) {
        console.error(`[fetch-ci-reports] gh run download ${art.name} (run ${art.workflow_run.id}) failed: ${r.spawnError || r.text}`);
        return 2;
      }
      const jsons = readdirSync(dir).filter((n) => n.endsWith('.json'));
      if (jsons.length === 0) {
        console.error(`[fetch-ci-reports] REFUSED ${art.name}: the artifact holds no .json report`);
        refused += 1;
      }
      for (const name of jsons) {
        let report;
        try { report = JSON.parse(readFileSync(join(dir, name), 'utf-8')); } catch (e) {
          console.error(`[fetch-ci-reports] REFUSED ${art.name}/${name}: not valid JSON (${e.message})`);
          refused += 1;
          continue;
        }
        const reasons = refusalsOf(report, opts.version);
        if (reasons.length) {
          console.error(`[fetch-ci-reports] REFUSED ${art.name}/${name}: ${reasons.join('; ')}`);
          refused += 1;
          continue;
        }
        for (const file of [name, name.replace(/\.json$/, '.md')]) {
          if (!existsSync(join(dir, file))) continue;
          const target = join(opts.dest, file);
          copyFileSync(join(dir, file), target);
        }
        placed.push({ label: art.label, file: name, report });
      }
    }
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }

  console.log(`[fetch-ci-reports] ${repo}: ${placed.length} report(s) for ${opts.version} placed in ${opts.dest}`);
  for (const p of placed) {
    const c = p.report.counts || {};
    console.log(`  ${p.label.padEnd(18)} ${String(p.report.environment.platform).padEnd(8)} ${String(p.report.verdict).padEnd(22)} passed ${c.passed}, failed ${c.failed}, manual not confirmed ${c.humanUnconfirmed}  ${p.file}`);
  }
  const have = new Set(readdirSync(opts.dest).filter((n) => n.endsWith('.json')).map((n) => {
    try { return JSON.parse(readFileSync(join(opts.dest, n), 'utf-8')).environment.platform; } catch { return null; }
  }));
  for (const p of PLATFORMS) console.log(`  platform ${p}: ${have.has(p) ? 'has a report' : 'NO report in the folder'}`);

  let version = null;
  try { version = JSON.parse(readFileSync(join(ROOT, 'cli', 'package.json'), 'utf-8')).version; } catch { /* reported below */ }
  if (opts.generate && version === opts.version) {
    const g = await runProcess({ file: process.execPath, args: [join(HERE, 'generate-pre-release.mjs')], cwd: ROOT, timeoutMs: 60000 });
    console.log(`${g.stdout || ''}${g.stderr || ''}`.trim());
    if (g.exitCode !== 0) {
      console.error('[fetch-ci-reports] the reports are placed, but docs/PRE-RELEASE.md could not be regenerated; fix that before committing.');
      return 2;
    }
  } else if (opts.generate) {
    console.log(`[fetch-ci-reports] docs/PRE-RELEASE.md was not regenerated: cli/package.json says ${version}, these reports are for ${opts.version}.`);
  }
  console.log('[fetch-ci-reports] review with `git status`, then commit the files yourself; this program commits nothing.');
  return refused > 0 || placed.length === 0 ? 1 : 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).then((code) => { process.exitCode = code; }, (e) => {
    console.error(`[fetch-ci-reports] unexpected failure: ${e.stack || e.message}`);
    process.exitCode = 2;
  });
}
