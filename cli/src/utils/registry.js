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
