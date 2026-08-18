import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { MANIFEST_OPTION_BINDINGS } from '../core/constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to the standards registry (bundled with CLI package)
const REGISTRY_PATH = join(__dirname, '../../standards-registry.json');

let registryCache = null;

/**
 * Load the standards registry
 * @returns {Object} The standards registry
 */
export function loadRegistry() {
  if (registryCache) {
    return registryCache;
  }

  try {
    const content = readFileSync(REGISTRY_PATH, 'utf-8');
    registryCache = JSON.parse(content);
    return registryCache;
  } catch (error) {
    throw new Error(`Failed to load standards registry: ${error.message}`);
  }
}

/**
 * Get standards filtered by level
 * @deprecated Use getAllStandards() instead. Level system has been removed.
 * @param {number} _level - Ignored (kept for backward compatibility)
 * @returns {Array} All standards
 */
export function getStandardsByLevel(_level) {
  return getAllStandards();
}

/**
 * Get standards filtered by category
 * @param {string} category - Category name
 * @returns {Array} Standards matching the category
 */
export function getStandardsByCategory(category) {
  const registry = loadRegistry();
  return registry.standards.filter(s => s.category === category);
}

/**
 * Get all standards
 * @returns {Array} All standards
 */
export function getAllStandards() {
  const registry = loadRegistry();
  return registry.standards;
}

/**
 * Get adoption level info
 * @deprecated Level system has been removed.
 * @param {number} _level - Ignored
 * @returns {Object} Stub level info for backward compatibility
 */
export function getLevelInfo(_level) {
  return { name: 'All Standards', nameZh: '全部標準', nameZhCn: '全部标准', description: 'All available standards' };
}

/**
 * Get category info
 * @param {string} category - Category name
 * @returns {Object} Category information
 */
export function getCategoryInfo(category) {
  const registry = loadRegistry();
  return registry.categories[category];
}

/**
 * Get repository info
 * @returns {Object} Repository information
 */
export function getRepositoryInfo() {
  const registry = loadRegistry();
  return registry.repositories;
}

/**
 * Get standards that have skills
 * @returns {Array} Standards with skillName defined
 */
export function getSkillStandards() {
  const registry = loadRegistry();
  return registry.standards.filter(s => s.skillName);
}

/**
 * Get reference standards (no skills)
 * @returns {Array} Standards without skills that need to be copied
 */
export function getReferenceStandards() {
  const registry = loadRegistry();
  return registry.standards.filter(s => !s.skillName && s.category === 'reference');
}

/**
 * Get skill files mapping
 * @returns {Object} Mapping of skill names to their file paths
 */
export function getSkillFiles() {
  const registry = loadRegistry();
  return registry.skillFiles || {};
}

/**
 * Get all skill names
 * @returns {string[]} Array of skill names
 */
export function getAllSkillNames() {
  const registry = loadRegistry();
  return Object.keys(registry.skillFiles || {});
}

/**
 * Get standards that have options
 * @returns {Array} Standards with options defined
 */
export function getStandardsWithOptions() {
  const registry = loadRegistry();
  return registry.standards.filter(s => s.options);
}

/**
 * Get option categories
 * @returns {Object} Option categories
 */
export function getOptionCategories() {
  const registry = loadRegistry();
  return registry.optionCategories || {};
}

/**
 * Get source path for a standard based on format
 * @param {Object} standard - Standard object from registry
 * @param {string} format - 'ai' or 'human'
 * @returns {string|null} Source path, or null if no source available
 */
export function getStandardSource(standard, format = 'human') {
  if (typeof standard.source === 'string') {
    return standard.source;
  }
  return standard.source?.[format] || standard.source?.human || null;
}

/**
 * Get source path for an option based on format
 * @param {Object} option - Option object from registry
 * @param {string} format - 'ai' or 'human'
 * @returns {string} Source path
 */
export function getOptionSource(option, format = 'human') {
  if (typeof option.source === 'string') {
    return option.source;
  }
  return option.source[format] || option.source.human;
}

/**
 * Find option by ID within a standard
 * @param {Object} standard - Standard object
 * @param {string} categoryKey - Option category key (e.g., 'workflow')
 * @param {string} optionId - Option ID to find
 * @returns {Object|null} Option object or null
 */
export function findOption(standard, categoryKey, optionId) {
  if (!standard.options || !standard.options[categoryKey]) {
    return null;
  }
  return standard.options[categoryKey].choices.find(c => c.id === optionId) || null;
}

/**
 * Get default option for a category
 * @param {Object} standard - Standard object
 * @param {string} categoryKey - Option category key
 * @returns {string|null} Default option ID or null
 */
export function getDefaultOption(standard, categoryKey) {
  if (!standard.options || !standard.options[categoryKey]) {
    return null;
  }
  return standard.options[categoryKey].default;
}

/**
 * Check if option category supports multi-select
 * @param {Object} standard - Standard object
 * @param {string} categoryKey - Option category key
 * @returns {boolean} True if multi-select
 */
export function isMultiSelectOption(standard, categoryKey) {
  if (!standard.options || !standard.options[categoryKey]) {
    return false;
  }
  return standard.options[categoryKey].multiSelect === true;
}

/**
 * Resolve the option source paths a manifest's `options` selection installs.
 *
 * `manifest.options` is the authoritative record of what the project chose;
 * `manifest.standards` records option files inconsistently — most repos list
 * them, machine-setup lists none — so anything counting options from
 * `manifest.standards` alone reported "0 options" for a project that has seven
 * of them on disk. (XSPEC-343 R2)
 *
 * @param {Object} manifestOptions - `manifest.options`
 * @param {string} [format='ai'] - Source format
 * @returns {string[]} Registry-relative source paths, e.g. ai/options/testing/unit-testing.ai.yaml
 */
export function resolveSelectedOptionSources(manifestOptions, format = 'ai') {
  if (!manifestOptions) return [];
  const all = getAllStandards();
  const paths = [];

  for (const binding of MANIFEST_OPTION_BINDINGS) {
    const key = binding.manifestKeys.find((k) => manifestOptions[k] != null);
    if (!key) continue;

    const standard = all.find((s) => s.id === binding.standardId);
    if (!standard) continue;

    const selection = manifestOptions[key];
    for (const optionId of Array.isArray(selection) ? selection : [selection]) {
      if (typeof optionId !== 'string') continue;
      const option = findOption(standard, binding.categoryKey, optionId);
      if (!option) continue;
      const source = getOptionSource(option, format);
      if (source) paths.push(source);
    }
  }

  return paths;
}

/**
 * The filename a manifest entry has on disk under `.standards/`.
 *
 * The `standards` array in a manifest is deliberately mixed: core standards are
 * stored as registry IDs (v3.4.0 onwards), option files as their upstream
 * source path, because options have no registry ID. Anything that turns those
 * entries into paths has to handle both, and three places in
 * integration-generator.js did not — each failing differently and silently:
 *
 *   - minimal mode printed `.standards/<id>`, and an ID is not a filename.
 *     `error-code-standards` installs as `error-codes.ai.yaml`, `ai-agreement`
 *     as `ai-agreement-standards.ai.yaml`. Seven of seventy paths in a real
 *     adopter's AGENTS.md pointed at nothing, in a block whose first line tells
 *     the agent it must read them.
 *   - the index block filtered entries by an `.ai.yaml` suffix, which no ID
 *     has, so every core standard was dropped. That is why the same adopter's
 *     previous block listed seven options and none of its sixty-three core
 *     standards.
 *   - the task-mapping lookup is keyed by filename, so an ID missed every
 *     time and the standard quietly got no mapping.
 *
 * Returns null when the entry cannot be resolved — a caller must not fall back
 * to printing the raw entry, which is the bug above.
 *
 * @param {string} entry - A manifest `standards` entry: registry ID or path
 * @param {string} format - Content format: 'ai' or 'human'
 * @returns {string|null} Basename as installed, or null if unresolvable
 */
/**
 * Resolve a manifest `standards` entry to the source path it was installed from.
 *
 * Manifests have stored IDs (`commit-message`) rather than paths since 3.4.0,
 * and four places in the CLI needed to turn one back into a path. Three of them
 * grew their own copy of the lookup; the fourth — the one `uds check --restore`
 * depends on — never did, and matched `entry.endsWith(fileName)` instead. That
 * cannot match an ID, so restore failed for **64 of 72** tracked standards with
 * "Could not determine source". Only the eight `options/` entries worked,
 * because those are still stored as paths. (XSPEC-382 R6)
 *
 * Paired with `resolveStandardFilename` on purpose: same input handling, same
 * registry lookup, one returns the path and the other its basename. Two
 * separately-written resolvers would answer differently the first time an entry
 * form changed, and neither would be obviously wrong.
 *
 * @param {string} entry - Manifest standards entry: an ID or a legacy path
 * @param {string} format - 'ai' or 'human'
 * @returns {string|null} Source path, or null when unresolvable
 */
export function resolveStandardSourcePath(entry, format = 'ai') {
  if (typeof entry !== 'string' || entry.length === 0) return null;

  // A path (option files, and legacy pre-3.4.0 manifests) already names itself.
  if (entry.includes('/') || entry.includes('.')) return entry;

  const found = getAllStandards().find((s) => s.id === entry);
  if (!found) return null;
  return getStandardSource(found, format) || null;
}

export function resolveStandardFilename(entry, format = 'ai') {
  if (typeof entry !== 'string' || entry.length === 0) return null;

  // A path (option files, and legacy pre-3.4.0 manifests) already names itself.
  if (entry.includes('/') || entry.includes('.')) {
    const parts = entry.split(/[/\\]/);
    return parts[parts.length - 1] || null;
  }

  const found = getAllStandards().find((s) => s.id === entry);
  if (!found) return null;
  const source = getStandardSource(found, format);
  if (!source) return null;
  const parts = source.split(/[/\\]/);
  return parts[parts.length - 1] || null;
}
