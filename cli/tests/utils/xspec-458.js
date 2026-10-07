/**
 * Shared pieces for the XSPEC-458 end-to-end tests ("available upstream, not installed").
 *
 * - `makeUpgradeProject(h)`: a throwaway project set up the way UDS 6.11.0 set one up. The manifest is the
 *   real one in tests/fixtures/upgrade-from-6.11.0 (see its README); the standard files the manifest names
 *   are copied from this repo's sources, so the project looks like an installed one whose version is behind.
 * - `expectedAvailableIds(manifest)`: what the answer SHOULD be, worked out from standards-registry.json by
 *   its own code, never by calling the CLI's `getAvailableStandards` (a test that asks the code under test
 *   for its expected value can only ever agree with it).
 * - `AVAILABLE_STANDARDS_OFF`: source text for a CLI whose "available standards" answer is always empty. Run
 *   the same command on it and on the real CLI: what differs is exactly this feature, which is how a test
 *   proves "information only" — same plan counts, same verdict, same exit code, same score.
 */

import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { basename, join, resolve } from 'path';
import { REAL_CLI_DIR, REAL_REPO } from './staged-cli-harness.js';

export const FIXTURE_DIR = resolve(REAL_CLI_DIR, 'tests/fixtures/upgrade-from-6.11.0');
export const FIXTURE_MANIFEST = join(FIXTURE_DIR, 'manifest.json');

export const readFixtureManifest = () => JSON.parse(readFileSync(FIXTURE_MANIFEST, 'utf-8'));
const registry = () => JSON.parse(readFileSync(join(REAL_CLI_DIR, 'standards-registry.json'), 'utf-8')).standards;

/**
 * A project the way 6.11.0 left it: real manifest, `.claude/` (so Claude Code is the detected tool), and the
 * `.standards/` files the manifest lists.
 */
export function makeUpgradeProject(h, name = 'upgrade') {
  const dir = h.makeDir(name);
  mkdirSync(join(dir, '.claude'), { recursive: true });
  mkdirSync(join(dir, '.standards', 'options'), { recursive: true });
  cpSync(FIXTURE_MANIFEST, join(dir, '.standards', 'manifest.json'));

  for (const entry of readFixtureManifest().standards) {
    const source = join(REAL_REPO, entry);
    if (!existsSync(source)) continue; // a standard that no longer ships: the plan will say so
    const target = entry.includes('/options/')
      ? join(dir, '.standards', 'options', basename(entry))
      : join(dir, '.standards', basename(entry));
    cpSync(source, target);
  }
  return dir;
}

/**
 * Registry ids a project with this manifest could still install by default: category reference or skill, a
 * source file in the project's format, and no file of that name already in `manifest.standards`.
 */
export function expectedAvailableIds(manifest) {
  const format = manifest.format || 'ai';
  const installed = new Set();
  for (const entry of manifest.standards) {
    if (entry.includes('/options/')) continue;
    if (entry.includes('/') || entry.includes('.')) installed.add(basename(entry));
    else {
      const found = registry().find((s) => s.id === entry);
      const src = found && (typeof found.source === 'string' ? found.source : found.source[format] || found.source.human);
      if (src) installed.add(basename(src));
    }
  }
  return registry()
    .filter((s) => s.category === 'reference' || s.category === 'skill')
    .filter((s) => {
      const src = typeof s.source === 'string' ? s.source : s.source?.[format] || s.source?.human;
      return src && !installed.has(basename(src));
    })
    .map((s) => s.id)
    .sort();
}

/** The registry's non-offered categories (everything outside reference and skill) with a source file. */
export function expectedOtherCategoryCount(manifest) {
  const format = manifest.format || 'ai';
  const installed = new Set(manifest.standards.map((e) => basename(e)));
  return registry().filter((s) => {
    if (s.category === 'reference' || s.category === 'skill') return false;
    const src = typeof s.source === 'string' ? s.source : s.source?.[format] || s.source?.human;
    return src && !installed.has(basename(src));
  }).length;
}

/** `src/utils/available-standards.js` as a feature that always answers "nothing is available". */
export const AVAILABLE_STANDARDS_OFF = `
export const OFFERED_CATEGORIES = [];
export const INSTALLED_BY_OTHER_MEANS = [];
export const CATEGORY_NOTES = {};
export const installedStandardFileNames = () => new Set();
export const oneLineDescription = () => '';
export const getAvailableStandards = () => ({ offered: [], notOffered: [], notOfferedByCategory: {} });
export const closestStandardIds = () => [];
export const judgeAddStandard = (id) => ({ status: 'unknown', id, closest: [] });
`;

export const OFF_OVERRIDES = { 'src/utils/available-standards.js': AVAILABLE_STANDARDS_OFF };

/** The ids a "Available upstream, not installed" section lists (the `    <id> — <description>` lines). */
export function idsInAvailableSection(stdout) {
  const start = stdout.indexOf('Available upstream, not installed (');
  if (start === -1) return [];
  const rest = stdout.slice(start).split('\n').slice(1);
  const ids = [];
  for (const line of rest) {
    const m = line.match(/^ {4}(\S+) — /);
    if (m) ids.push(m[1]);
    else if (/^ {2}Install one:/.test(line)) break;
  }
  return ids.sort();
}

/** The `Summary:` counts block of a plan, as an object. */
export function planCounts(stdout) {
  const block = stdout.split('Summary:')[1];
  if (!block) return null;
  const out = {};
  for (const line of block.split('\n').slice(1, 8)) {
    const m = line.match(/^\s+(Create|Update|Migrate Block|Delete|Unchanged): (\d+)/);
    if (m) out[m[1]] = Number(m[2]);
  }
  return out;
}

/**
 * Make a project that `uds init` just set up look like one that never got `open-work-tracking`: nothing else
 * differs from a clean install, so the one available standard is the only thing any command has to say.
 */
export function removeOpenWorkTracking(dir) {
  const mPath = join(dir, '.standards', 'manifest.json');
  const m = JSON.parse(readFileSync(mPath, 'utf-8'));
  m.standards = m.standards.filter((s) => !s.includes('open-work-tracking'));
  delete m.fileHashes['.standards/open-work-tracking.ai.yaml'];
  writeFileSync(mPath, JSON.stringify(m, null, 2));
  rmSync(join(dir, '.standards', 'open-work-tracking.ai.yaml'));
}
