/**
 * Helpers shared by the XSPEC-483 tests (`uds update --plan` on a `--format both` project).
 * Every test using them spawns the real CLI through tests/utils/staged-cli-harness.js.
 */

import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync } from 'fs';
import { basename, join, resolve } from 'path';
import { REAL_CLI_DIR, REAL_REPO } from './staged-cli-harness.js';

/** Versions of UDS whose real `--format both` manifest is stored in tests/fixtures/upgrade-from-both/ (see its README). */
export const BOTH_FIXTURE_VERSIONS = ['6.11.0', '6.14.0-beta.14'];

/**
 * The two files an old install holds for a standard UDS has stopped shipping: `open-work-tracking` became the optional skill
 * `open-work` (dev-platform XSPEC-427), so the registry no longer ships either copy and `uds update --apply` removes them, as
 * it does for any file UDS no longer ships. Every other file of these manifests is still shipped and must survive.
 * The AI copy is no longer in this repository; the copy a real UDS wrote is kept in tests/fixtures/open-work-tracking/retired-install/.
 */
export const RETIRED_STANDARD_FILES = ['.standards/open-work-tracking.ai.yaml', '.standards/open-work-tracking.md'];
const RETIRED_AI_COPY = resolve(REAL_CLI_DIR, 'tests/fixtures/open-work-tracking/retired-install/open-work-tracking.ai.yaml');

const fixtureManifestPath = (version) => resolve(REAL_CLI_DIR, 'tests/fixtures/upgrade-from-both', version, 'manifest.json');
export const readBothFixtureManifest = (version) => JSON.parse(readFileSync(fixtureManifestPath(version), 'utf-8'));

/**
 * Where a manifest entry in path form (`ai/standards/x.ai.yaml`, `core/x.md`, `ai/options/<std>/y.ai.yaml`,
 * `options/<std>/y.md`) lands inside a project, relative to the project root.
 */
export function installedPathOf(entry) {
  return entry.includes('/options/') || entry.startsWith('options/')
    ? `.standards/options/${basename(entry)}`
    : `.standards/${basename(entry)}`;
}

/**
 * The files the old UDS put on disk, read from its own manifest and nowhere else: one per path-form entry of
 * `standards`. This is the independent oracle for "nothing was lost" - it does not ask the reconciler what to expect.
 */
export function filesTheOldInstallWrote(version) {
  return [...new Set(readBothFixtureManifest(version).standards.map(installedPathOf))];
}

/**
 * A project the way an older UDS left a `uds init --format both` one: the real manifest of that version, `.claude/`
 * (so Claude Code is the detected tool) and the standard and option files that manifest names, copied from this
 * repository's sources (so the project looks like an installed one whose version is behind).
 */
export function makeBothUpgradeProject(h, version) {
  const dir = h.makeDir(`both-${version}`);
  mkdirSync(join(dir, '.claude'), { recursive: true });
  mkdirSync(join(dir, '.standards', 'options'), { recursive: true });
  cpSync(fixtureManifestPath(version), join(dir, '.standards', 'manifest.json'));
  for (const entry of readBothFixtureManifest(version).standards) {
    const source = entry === 'ai/standards/open-work-tracking.ai.yaml' ? RETIRED_AI_COPY : join(REAL_REPO, entry);
    if (!existsSync(source)) throw new Error(`fixture: ${entry} is named by the ${version} manifest but is not in this repository`);
    cpSync(source, join(dir, installedPathOf(entry)));
  }
  return dir;
}

/** Names of the files directly in `<dir>/.standards` and in `<dir>/.standards/options`, as project-relative paths. */
export function listedStandardFiles(dir) {
  const under = (rel) => (existsSync(join(dir, rel)) ? readdirSync(join(dir, rel), { withFileTypes: true }) : [])
    .filter((e) => e.isFile() && e.name !== 'manifest.json')
    .map((e) => `${rel}/${e.name}`);
  return [...under('.standards'), ...under('.standards/options')].sort();
}

/** The paths a printed plan lists under one section (`Create`, `Update`, `Migrate Block` or `Delete`); [] when it has no such section. */
export function planSectionPaths(planText, section) {
  const lines = planText.split('\n');
  const header = new RegExp(`^[+~-] ${section} \\(\\d+\\):`);
  const start = lines.findIndex((l) => header.test(l));
  if (start < 0) return [];
  const paths = [];
  for (const l of lines.slice(start + 1)) {
    const m = /^\s+[+~-] (\S+) \(/.exec(l);
    if (!m) break;
    paths.push(m[1]);
  }
  return paths;
}
