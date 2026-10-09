#!/usr/bin/env node
/**
 * wait-for-npm — wait until a published UDS version can be resolved from the registry (dev-platform XSPEC-471 R1).
 *
 * The post-publish acceptance starts after the publish workflow finished, and the registry (and the CDN in front of the
 * tarball) can still answer 404 for a few minutes after `npm publish` returned. This asks until it answers, so that the
 * acceptance run never meets "the version is not there yet" as a platform failure. It polls for as long as the limit
 * allows; it does NOT sleep a fixed time first (EngramGraph's compatibility check waited a fixed 10 minutes from the
 * release event, the publish itself took 8 and npm needed more, and it went red twice for a package that was fine).
 *
 * Usage: node scripts/beta-acceptance/wait-for-npm.mjs --version <x.y.z[-pre]> [--package universal-dev-standards]
 *          [--registry <url>] [--timeout-sec 1200] [--interval-sec 15]
 *   Registry: --registry, else the npm_config_registry variable (what `npm install` itself honours), else https://registry.npmjs.org
 *
 * "Resolvable" means what `npm install` itself needs, asked in the order `npm install` meets it:
 *   1. the package document (`GET <registry>/<package>`, the one `npm install` reads; it does NOT read the per-version
 *      document `<registry>/<package>/<version>`) lists this exact version under `versions`;
 *   2. the tarball that entry names answers 2xx;
 *   3. `npm view <package>@<version> version`, run through the same npm and registry setting the install uses, prints
 *      this version. This last question is the final judge: the first two are asked by this program's own HTTP client
 *      and can be answered by another registry edge or cache than the one npm gets.
 * Why not the per-version document: on 2026-10-10 (6.14.0-beta.8, run 37969191195) it answered 200 with a reachable
 * tarball on the 8th poll while `npm install` of the same version still failed in three jobs, because install reads the
 * package document, which was not yet updated. A condition that install does not read cannot say install will work.
 *
 * Exit codes (three states; "it is not there" and "I could not ask" must differ):
 *   0  the version resolves
 *   1  NOT PUBLISHED: at the limit the registry's last answer was "no such version" (404, a different version, or a
 *      tarball that is not there). The message says it is not a platform failure.
 *   2  could not tell: bad arguments, or at the limit the registry's last answer was an error (5xx, refused, timed out).
 *      This is not proof that the package is absent.
 *
 * Standard library only (Node 20+, global fetch); the one question to npm reuses lib/install.mjs and lib/process.mjs, which start npm
 * without a shell on every platform.
 */

import { appendFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isVersionNotVisibleYet, resolveNpm } from './lib/install.mjs';
import { runProcess } from './lib/process.mjs';

const DEFAULT_REGISTRY = 'https://registry.npmjs.org';
const REQUEST_TIMEOUT_MS = 20000;
const NPM_VIEW_TIMEOUT_MS = 60000;

function parse(argv, env) {
  const opts = { version: null, pkg: 'universal-dev-standards', registry: env.npm_config_registry || env.NPM_CONFIG_REGISTRY || DEFAULT_REGISTRY, timeoutSec: 1200, intervalSec: 15 };
  const names = { '--version': 'version', '--package': 'pkg', '--registry': 'registry', '--timeout-sec': 'timeoutSec', '--interval-sec': 'intervalSec' };
  for (let i = 0; i < argv.length; i += 1) {
    const key = names[argv[i]];
    if (!key) throw new Error(`unknown option: ${argv[i]}`);
    const value = argv[(i += 1)];
    if (value === undefined || value === '') throw new Error(`${argv[i - 1]} needs a value`);
    opts[key] = value;
  }
  for (const k of ['timeoutSec', 'intervalSec']) {
    const n = Number(opts[k]);
    if (!Number.isFinite(n) || n < 0) throw new Error(`--${k === 'timeoutSec' ? 'timeout-sec' : 'interval-sec'} must be a number of seconds, got "${opts[k]}"`);
    opts[k] = n;
  }
  if (!opts.version) throw new Error('--version is required');
  if (!/^[A-Za-z0-9][A-Za-z0-9._+-]*$/.test(opts.version)) throw new Error(`"${opts.version}" is not a version (letters, digits, . _ + - only)`);
  if (!/^[a-z0-9@][a-z0-9._/@-]*$/.test(opts.pkg)) throw new Error(`"${opts.pkg}" is not a package name`);
  opts.registry = opts.registry.replace(/\/+$/, '');
  return opts;
}

/** The last question: ask npm itself, the way the install does. @returns {Promise<{ kind: 'found'|'absent'|'error', detail: string }>} */
async function askNpm({ registry, pkg, version }, env, { run = runProcess, npm = resolveNpm({ env }) } = {}) {
  const spec = `${pkg}@${version}`;
  // --fetch-retries=0: this loop is the retry. --prefer-online: the registry lets a client keep a package document for
  // 5 minutes; `npm install` (not `npm view`) was observed on npm 10.9.8 to read such a cached document without asking
  // again, and so would any npm whose `view` caches. Insurance here: npm 10.9.8's `view` asked again without it.
  const args = [...npm.prefixArgs, 'view', spec, 'version', '--registry', registry, '--prefer-online', '--fetch-retries=0', '--fetch-timeout=20000', '--no-update-notifier', '--no-audit', '--no-fund', '--loglevel=error'];
  const r = await run({ file: npm.file, args, cwd: tmpdir(), env, shell: npm.shell, timeoutMs: NPM_VIEW_TIMEOUT_MS });
  const said = `${r.stdout || ''}${r.stderr || ''}`;
  if (r.spawnError) return { kind: 'error', detail: `could not start npm (${npm.how}): ${r.spawnError}` };
  if (r.timedOut) return { kind: 'error', detail: `npm view ${spec} did not finish in ${NPM_VIEW_TIMEOUT_MS / 1000} s` };
  if (r.exitCode === 0) {
    const printed = (r.stdout || '').trim();
    if (printed === version) return { kind: 'found', detail: `npm view ${spec} printed ${printed}` };
    return { kind: 'error', detail: `npm view ${spec} exited 0 but printed ${JSON.stringify(printed.slice(0, 80))}` };
  }
  const line = said.split(/\r?\n/).find((l) => /code|No match|not in this registry/.test(l)) || said.trim().split(/\r?\n/)[0] || '(no output)';
  if (isVersionNotVisibleYet(said)) return { kind: 'absent', detail: `npm view ${spec} exited ${r.exitCode}: ${line.trim()}` };
  return { kind: 'error', detail: `npm view ${spec} exited ${r.exitCode}: ${line.trim()}` };
}

/** One question to the registry. @returns {Promise<{ kind: 'found'|'absent'|'error', detail: string }>} */
async function ask(opts, env = process.env) {
  const { registry, pkg, version } = opts;
  const url = `${registry}/${pkg.replace('/', '%2f')}`;
  try {
    const res = await fetch(url, { headers: { accept: 'application/json' }, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
    if (res.status === 404) return { kind: 'absent', detail: `${url} answered 404` };
    if (res.status !== 200) return { kind: 'error', detail: `${url} answered ${res.status}` };
    const doc = await res.json();
    const entry = doc && doc.versions && doc.versions[version];
    if (!entry) return { kind: 'absent', detail: `the package document ${url} answered 200 but its versions do not include ${version}` };
    const tarball = entry.dist && entry.dist.tarball;
    if (typeof tarball !== 'string') return { kind: 'error', detail: `${url} lists ${version} with no dist.tarball` };
    const head = await fetch(tarball, { method: 'HEAD', signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
    if (head.status === 404) return { kind: 'absent', detail: `the package document lists ${version} but its tarball ${tarball} answered 404` };
    if (head.status < 200 || head.status > 299) return { kind: 'error', detail: `the tarball ${tarball} answered ${head.status}` };
    const npm = await askNpm(opts, env);
    if (npm.kind !== 'found') return npm;
    return { kind: 'found', detail: `${url} lists ${version}, ${tarball} answers ${head.status}, and ${npm.detail}` };
  } catch (e) {
    return { kind: 'error', detail: `${url}: ${e.cause && e.cause.code ? e.cause.code : e.name}: ${e.message}` };
  }
}

const sleep = (ms) => new Promise((done) => setTimeout(done, ms));

function writeSummary(env, markdown) {
  if (env.GITHUB_STEP_SUMMARY) appendFileSync(env.GITHUB_STEP_SUMMARY, `${markdown}\n`);
}

export async function main(argv, env = process.env) {
  let opts;
  try {
    opts = parse(argv, env);
  } catch (e) {
    console.error(`[wait-for-npm] ${e.message}`);
    return 2;
  }
  const label = `${opts.pkg}@${opts.version}`;
  const started = Date.now();
  const deadline = started + opts.timeoutSec * 1000;
  let attempts = 0;
  let last;
  for (;;) {
    attempts += 1;
    last = await ask(opts, env);
    console.log(`[wait-for-npm] attempt ${attempts}, ${Math.round((Date.now() - started) / 1000)}s: ${last.kind} — ${last.detail}`);
    if (last.kind === 'found') {
      console.log(`[wait-for-npm] OK: ${label} is on the registry.`);
      return 0;
    }
    const left = deadline - Date.now();
    if (left <= 0) break;
    await sleep(Math.min(opts.intervalSec * 1000, left));
  }
  const waited = Math.round((Date.now() - started) / 1000);
  if (last.kind === 'absent') {
    const text = `${label} did not appear on ${opts.registry} within ${waited} s (${attempts} attempts; last answer: ${last.detail}). 套件未上架，不是平台失敗：沒有測任何東西。`;
    console.error(`[wait-for-npm] NOT PUBLISHED: ${text}`);
    console.error('[wait-for-npm] The package is missing from the registry; this is a publish or registry problem, NOT a platform failure. No acceptance step was run.');
    if (env.GITHUB_ACTIONS) console.error(`::error title=Package not published, not a platform failure::${text}`);
    writeSummary(env, `### Package not published — not a platform failure | 套件未上架，不是平台失敗\n\n${text}\n\nNo acceptance step was run on this platform. Check the publish workflow and the registry. 這個平台沒有跑任何驗收步驟；請查發布流程與 registry。`);
    return 1;
  }
  const text = `could not tell whether ${label} is published: after ${waited} s (${attempts} attempts) the registry's last answer was an error (${last.detail}). This is not proof that the package is absent. 問不到 registry，不能據此說套件沒上架。`;
  console.error(`[wait-for-npm] COULD NOT ASK: ${text}`);
  if (env.GITHUB_ACTIONS) console.error(`::error title=Registry could not be queried::${text}`);
  writeSummary(env, `### Registry could not be queried | 問不到 registry\n\n${text}`);
  return 2;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).then((code) => { process.exitCode = code; }, (e) => {
    console.error(`[wait-for-npm] unexpected failure: ${e.stack || e.message}`);
    process.exitCode = 2;
  });
}
