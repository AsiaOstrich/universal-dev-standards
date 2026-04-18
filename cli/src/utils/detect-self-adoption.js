/**
 * UDS Self-Adoption Detection
 *
 * Detect whether the current working directory is the UDS source repo itself.
 * When detected, adoption-oriented CLI commands (update / check / init) MUST
 * refuse to run — otherwise the CLI would overwrite source-of-truth
 * `.standards/` with its own npm-bundled copy (DEC-044 / XSPEC-071).
 *
 * Detection uses three independent heuristics. ANY one being true is
 * sufficient, but each is validated to reduce false positives:
 *
 *   1. `uds-manifest.json` in cwd whose `project === "Universal Development
 *      Standards"` (strong signal — bundled manifests are adopter-named).
 *   2. `cli/package.json` in cwd whose `name === "universal-dev-standards"`
 *      (strong signal — only the UDS source repo ships this package).
 *   3. `.uds-source-repo` marker file in cwd (explicit opt-in marker).
 *
 * The three signals are OR-combined: any single hit is enough. A consumer
 * (adopter project) will hit none of them even if they installed UDS.
 *
 * Related:
 *   - DEC-044: UDS Self-Adoption Bug
 *   - XSPEC-071: UDS Self-Adoption Protection
 */

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

/**
 * Indicator returned when detection matches, useful for diagnostics.
 *
 * @typedef {Object} SelfAdoptionResult
 * @property {boolean} isSelfAdoption - True when cwd is UDS source repo
 * @property {string[]} signals - Names of heuristics that matched
 */

/**
 * Check whether `uds-manifest.json` at `cwd` identifies UDS source repo.
 */
function hasSourceManifest(cwd) {
  const manifestPath = join(cwd, 'uds-manifest.json');
  if (!existsSync(manifestPath)) return false;
  try {
    const content = readFileSync(manifestPath, 'utf8');
    const manifest = JSON.parse(content);
    return manifest?.project === 'Universal Development Standards';
  } catch {
    // Malformed JSON: fall back to "not matched" rather than throwing;
    // the file alone is not strong enough proof without verified content.
    return false;
  }
}

/**
 * Check whether `cli/package.json` at `cwd` identifies UDS source repo.
 */
function hasSourceCliPackage(cwd) {
  const pkgPath = join(cwd, 'cli', 'package.json');
  if (!existsSync(pkgPath)) return false;
  try {
    const content = readFileSync(pkgPath, 'utf8');
    const pkg = JSON.parse(content);
    return pkg?.name === 'universal-dev-standards';
  } catch {
    return false;
  }
}

/**
 * Check whether the explicit marker file exists.
 */
function hasSourceMarker(cwd) {
  return existsSync(join(cwd, '.uds-source-repo'));
}

/**
 * Detect UDS self-adoption situation.
 *
 * @param {string} [cwd=process.cwd()] - Directory to inspect
 * @returns {boolean} True when cwd is (likely) the UDS source repo
 */
export function detectSelfAdoption(cwd = process.cwd()) {
  return detectSelfAdoptionDetailed(cwd).isSelfAdoption;
}

/**
 * Detect UDS self-adoption and return detailed signal breakdown.
 *
 * @param {string} [cwd=process.cwd()] - Directory to inspect
 * @returns {SelfAdoptionResult} Detection outcome with matched signals
 */
export function detectSelfAdoptionDetailed(cwd = process.cwd()) {
  const signals = [];
  if (hasSourceManifest(cwd)) signals.push('uds-manifest.json');
  if (hasSourceCliPackage(cwd)) signals.push('cli/package.json');
  if (hasSourceMarker(cwd)) signals.push('.uds-source-repo');
  return {
    isSelfAdoption: signals.length > 0,
    signals
  };
}

/**
 * Bilingual refuse message shown when self-adoption is detected and
 * `--force` is not passed. Kept inline (not in i18n bundle) to avoid
 * taking a translation dependency for a fail-safe error path.
 *
 * @param {string} commandName - e.g. 'update' / 'check' / 'init'
 * @returns {string[]} Lines to print
 */
export function formatSelfAdoptionRefuseMessage(commandName) {
  return [
    `偵測到 UDS source repo。此指令（uds ${commandName}）僅供採用專案使用。`,
    'Source repo 維護請使用 scripts/bump-version.sh 或 npm run docs:sync。',
    '詳見 DEC-044。',
    '',
    `Detected UDS source repo. This command (uds ${commandName}) is for`,
    'adopter projects only. For source-repo maintenance use',
    'scripts/bump-version.sh or npm run docs:sync. See DEC-044.',
    '',
    'Override with --force if you know what you are doing',
    '（若確定要執行可加上 --force 旗標繞過）.'
  ];
}

/**
 * Warning printed when `--force` bypasses the self-adoption guard.
 *
 * @param {string} commandName
 * @returns {string[]} Lines to print
 */
export function formatSelfAdoptionForceWarning(commandName) {
  return [
    `警告：偵測到 UDS source repo，但 --force 已指定，繼續執行 uds ${commandName}。`,
    `Warning: UDS source repo detected; --force was passed, continuing uds ${commandName}.`,
    '若非預期操作，請立即 Ctrl+C 並改用 scripts/bump-version.sh。',
    'If unintended, abort now (Ctrl+C) and use scripts/bump-version.sh.'
  ];
}

/**
 * Guard helper — prints refuse message and exits with non-zero code when
 * cwd is the UDS source repo and `--force` was not supplied.
 *
 * Does nothing when not self-adoption, or when `--force` is set (in which
 * case a warning is printed but execution proceeds).
 *
 * @param {string} commandName - CLI command being invoked (for message)
 * @param {Object} [options] - Caller options; inspected for `force`
 * @param {string} [cwd=process.cwd()]
 * @returns {boolean} True if command should continue (caller keeps running)
 */
export function guardAgainstSelfAdoption(commandName, options = {}, cwd = process.cwd()) {
  const { isSelfAdoption, signals } = detectSelfAdoptionDetailed(cwd);
  if (!isSelfAdoption) return true;

  const force = Boolean(options && options.force);
  if (force) {
    for (const line of formatSelfAdoptionForceWarning(commandName)) {
      console.warn(line);
    }
    console.warn(`Matched signals: ${signals.join(', ')}`);
    return true;
  }

  for (const line of formatSelfAdoptionRefuseMessage(commandName)) {
    console.error(line);
  }
  console.error(`Matched signals: ${signals.join(', ')}`);
  process.exit(1);
  // Unreachable, but for tests that stub process.exit:
  return false;
}
