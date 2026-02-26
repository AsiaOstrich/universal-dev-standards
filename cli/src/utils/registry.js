import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

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
 * @param {number} level - Adoption level (1, 2, or 3)
 * @returns {Array} Standards at or below the specified level
 */
export function getStandardsByLevel(level) {
  const registry = loadRegistry();
  return registry.standards.filter(s => s.level <= level);
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
 * @param {number} level - Adoption level
 * @returns {Object} Level information
 */
export function getLevelInfo(level) {
  const registry = loadRegistry();
  return registry.adoptionLevels[String(level)];
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
