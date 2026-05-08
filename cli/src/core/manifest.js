import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname, basename } from 'path';
import { getAllStandards } from '../utils/registry.js';

/**
 * UDS Manifest Schema v3.4.0
 * Central configuration and state tracking for UDS installations
 */

/**
 * Supported manifest schema versions
 */
export const SUPPORTED_SCHEMA_VERSIONS = ['3.0.0', '3.1.0', '3.2.0', '3.3.0', '3.4.0'];

/**
 * Current manifest schema version
 */
export const CURRENT_SCHEMA_VERSION = '3.4.0';

/**
 * Default manifest values
 */
export const DEFAULT_MANIFEST = {
  version: CURRENT_SCHEMA_VERSION,
  upstream: {
    repo: 'AsiaOstrich/universal-dev-standards',
    version: null,
    installed: new Date().toISOString()
  },
  format: 'ai',
  contentMode: 'index',
  standards: [],
  extensions: [],
  integrations: [],
  integrationConfigs: {},
  options: {},
  aiTools: [],
  skills: {
    installed: false,
    location: 'marketplace',
    names: [],
    version: null,
    installations: []
  },
  commands: {
    installed: false,
    names: [],
    version: null,
    installations: []
  },
  methodology: null,
  fileHashes: {},
  skillHashes: {},
  commandHashes: {},
  integrationBlockHashes: {}
};

/**
 * Validation schema for manifest
 */
const MANIFEST_SCHEMA = {
  required: ['version', 'upstream', 'format', 'contentMode'],
  properties: {
    version: { type: 'string', pattern: '^\\d+\\.\\d+\\.\\d+$' },
    format: { type: 'string', enum: ['ai', 'human', 'both'] },
    contentMode: { type: 'string', enum: ['minimal', 'index', 'full'] }
  }
};

/**
 * Get manifest file path for a project
 * @param {string} projectPath - Project root path
 * @returns {string} Absolute path to manifest.json
 */
export function getManifestPath(projectPath) {
  return join(projectPath, '.standards', 'manifest.json');
}

/**
 * Check if manifest exists for a project
 * @param {string} projectPath - Project root path
 * @returns {boolean} True if manifest exists
 */
export function manifestExists(projectPath) {
  return existsSync(getManifestPath(projectPath));
}

/**
 * Read manifest from file system
 * @param {string} projectPath - Project root path
 * @returns {Object|null} Manifest data or null if not found/invalid
 */
export function readManifest(projectPath) {
  const manifestPath = getManifestPath(projectPath);

  if (!existsSync(manifestPath)) {
    return null;
  }

  try {
    const content = readFileSync(manifestPath, 'utf-8');
    let manifest = JSON.parse(content);

    // Auto-migrate before validation. Always run migration regardless of
    // version field, because older CLIs may have set version to CURRENT but
    // omitted fields introduced in that schema (e.g., contentMode, skillHashes).
    if (manifest && typeof manifest === 'object' && manifest.version) {
      manifest = migrateManifest(manifest);
    }

    // Validate basic structure
    if (!validateManifest(manifest)) {
      console.warn('Invalid manifest structure detected');
      return null;
    }

    return manifest;
  } catch (error) {
    console.warn(`Failed to read manifest: ${error.message}`);
    return null;
  }
}

/**
 * Write manifest to file system
 * @param {Object} manifest - Manifest data
 * @param {string} projectPath - Project root path
 * @returns {string} Path to written manifest file
 */
export function writeManifest(manifest, projectPath) {
  const manifestPath = getManifestPath(projectPath);
  const manifestDir = dirname(manifestPath);

  // Ensure .standards directory exists
  if (!existsSync(manifestDir)) {
    mkdirSync(manifestDir, { recursive: true });
  }

  // Validate before writing
  if (!validateManifest(manifest)) {
    throw new Error('Invalid manifest structure');
  }

  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  return manifestPath;
}

/**
 * Validate manifest structure
 * @param {Object} manifest - Manifest data to validate
 * @returns {boolean} True if valid
 */
export function validateManifest(manifest) {
  if (!manifest || typeof manifest !== 'object') {
    return false;
  }

  // Check required fields
  for (const field of MANIFEST_SCHEMA.required) {
    if (!(field in manifest)) {
      return false;
    }
  }

  // Check property types and enums
  for (const [key, schema] of Object.entries(MANIFEST_SCHEMA.properties)) {
    const value = manifest[key];
    
    if (schema.type === 'string') {
      if (typeof value !== 'string') return false;
      if (schema.pattern && !new RegExp(schema.pattern).test(value)) return false;
      if (schema.enum && !schema.enum.includes(value)) return false;
    }
    
    if (schema.type === 'number') {
      if (typeof value !== 'number') return false;
      if (schema.enum && !schema.enum.includes(value)) return false;
    }
  }

  // Validate nested objects
  if (manifest.upstream && typeof manifest.upstream !== 'object') {
    return false;
  }

  return true;
}

/**
 * Create new manifest with default values
 * @param {Object} overrides - Override specific fields
 * @returns {Object} New manifest object
 */
export function createManifest(overrides = {}) {
  return {
    ...DEFAULT_MANIFEST,
    ...overrides,
    upstream: {
      ...DEFAULT_MANIFEST.upstream,
      ...(overrides.upstream || {})
    },
    options: {
      ...DEFAULT_MANIFEST.options,
      ...(overrides.options || {})
    },
    skills: {
      ...DEFAULT_MANIFEST.skills,
      ...(overrides.skills || {})
    },
    commands: {
      ...DEFAULT_MANIFEST.commands,
      ...(overrides.commands || {})
    }
  };
}

/**
 * Merge updates into existing manifest
 * @param {Object} baseManifest - Base manifest
 * @param {Object} updates - Updates to apply
 * @returns {Object} Merged manifest
 */
export function mergeManifest(baseManifest, updates) {
  if (!baseManifest) {
    return createManifest(updates);
  }

  const merged = {
    ...baseManifest,
    ...updates,
    upstream: {
      ...baseManifest.upstream,
      ...(updates.upstream || {})
    },
    options: {
      ...baseManifest.options,
      ...(updates.options || {})
    },
    skills: {
      ...baseManifest.skills,
      ...(updates.skills || {})
    },
    commands: {
      ...baseManifest.commands,
      ...(updates.commands || {})
    }
  };

  // Validate merged manifest
  if (!validateManifest(merged)) {
    throw new Error('Merged manifest is invalid');
  }

  return merged;
}

/**
 * Migrate manifest to current schema version
 * @param {Object} manifest - Manifest to migrate
 * @returns {Object} Migrated manifest
 */
export function migrateManifest(manifest) {
  if (!manifest) {
    return createManifest();
  }

  const currentVersion = manifest.version || '1.0.0';

  // Even at current version, ensure all required fields exist.
  // Older CLIs may have stamped the version without writing all fields.
  if (currentVersion === CURRENT_SCHEMA_VERSION) {
    return ensureRequiredFields(manifest);
  }

  let migrated = { ...manifest };

  // Migration logic for each version
  if (currentVersion < '3.0.0') {
    // Migrate from 2.x to 3.0.0
    migrated = migrateToV300(migrated);
  }

  if (currentVersion < '3.1.0') {
    // Migrate to 3.1.0 - add fileHashes
    migrated = migrateToV310(migrated);
  }

  if (currentVersion < '3.2.0') {
    // Migrate to 3.2.0 - add standardsScope, contentMode
    migrated = migrateToV320(migrated);
  }

  if (currentVersion < '3.3.0') {
    // Migrate to 3.3.0 - add skillHashes, commandHashes, integrationBlockHashes
    migrated = migrateToV330(migrated);
  }

  if (currentVersion < '3.4.0') {
    // Migrate to 3.4.0 - convert standards array from path format to ID format
    migrated = migrateToV340(migrated);
  }

  // Update schema version
  migrated.version = CURRENT_SCHEMA_VERSION;

  // Always ensure all required fields exist after migration.
  // Version-specific migrations may be skipped when the version number
  // matches but fields were never written (e.g. 3.5.0-beta.4 stamped
  // version 3.2.0 without writing contentMode).
  return ensureRequiredFields(migrated);
}

/**
 * Migration to version 3.0.0
 * @param {Object} manifest - Pre-3.0.0 manifest
 * @returns {Object} V3.0.0 compatible manifest
 */
function migrateToV300(manifest) {
  return {
    ...DEFAULT_MANIFEST,
    ...manifest,
    version: '3.0.0',
    // Preserve existing fields where possible
    upstream: {
      ...DEFAULT_MANIFEST.upstream,
      ...(manifest.upstream || {})
    },
    standards: manifest.standards || [],
    extensions: manifest.extensions || [],
    options: manifest.options || {},
    aiTools: manifest.aiTools || []
  };
}

/**
 * Migration to version 3.1.0
 * @param {Object} manifest - V3.0.x manifest
 * @returns {Object} V3.1.0 compatible manifest
 */
function migrateToV310(manifest) {
  return {
    ...manifest,
    version: '3.1.0',
    fileHashes: manifest.fileHashes || {}
  };
}

/**
 * Migration to version 3.2.0
 * @param {Object} manifest - V3.1.x manifest
 * @returns {Object} V3.2.0 compatible manifest
 */
function migrateToV320(manifest) {
  return {
    ...manifest,
    version: '3.2.0',
    contentMode: manifest.contentMode || 'index'
  };
}

/**
 * Migration to version 3.3.0
 * @param {Object} manifest - V3.2.x manifest
 * @returns {Object} V3.3.0 compatible manifest
 */
function migrateToV330(manifest) {
  return {
    ...manifest,
    version: '3.3.0',
    skillHashes: manifest.skillHashes || {},
    commandHashes: manifest.commandHashes || {},
    integrationBlockHashes: manifest.integrationBlockHashes || {}
  };
}

/**
 * Migration to version 3.4.0
 * Converts standards array from legacy path format ("ai/standards/foo.ai.yaml",
 * "core/foo.md") to registry ID format ("foo"). Deduplicates entries that
 * refer to the same standard via different format paths (ai vs human).
 * @param {Object} manifest - V3.3.x manifest
 * @returns {Object} V3.4.0 compatible manifest
 */
function migrateToV340(manifest) {
  return {
    ...manifest,
    version: '3.4.0',
    standards: migrateStandardsPathsToIds(manifest.standards || [])
  };
}

/**
 * Convert a standards array from legacy path format to registry ID format.
 * Entries that already look like IDs (no "/" or ".") are kept as-is.
 * Path entries are matched against the registry's source.ai / source.human
 * fields (exact path match or basename match), then replaced with the
 * registry ID. Entries that match no registry standard are dropped.
 *
 * @param {string[]} standards - Standards array (may be IDs or legacy paths)
 * @returns {string[]} Sorted, deduplicated array of registry IDs
 */
export function migrateStandardsPathsToIds(standards) {
  if (!standards || standards.length === 0) return [];

  const hasPathFormat = standards.some(
    s => typeof s === 'string' && (s.includes('/') || s.includes('.'))
  );
  if (!hasPathFormat) return standards;

  const allStandards = getAllStandards();
  const ids = new Set();
  // Option file paths (ai/options/...) have no short-ID equivalent; collect separately
  const optionPaths = [];

  for (const entry of standards) {
    if (typeof entry !== 'string') continue;

    // Already an ID (no path separators or extensions)
    if (!entry.includes('/') && !entry.includes('.')) {
      ids.add(entry);
      continue;
    }

    // Option file paths (e.g. ai/options/commit-message/english.ai.yaml):
    // no registry ID equivalent — preserve as-is so update/check can manage them
    if (entry.includes('/options/') || entry.includes('options/')) {
      optionPaths.push(entry);
      continue;
    }

    // Base-standard path format — find matching registry entry
    let matched = false;
    for (const s of allStandards) {
      const src = s.source;
      const paths = typeof src === 'string'
        ? [src]
        : Object.values(src || {}).filter(p => typeof p === 'string');

      if (paths.some(p => p === entry || basename(p) === basename(entry))) {
        ids.add(s.id);
        matched = true;
        break;
      }
    }
    // Unmatched non-option paths are silently dropped (standard removed from registry)
    void matched;
  }

  // Return: sorted IDs first, then option paths (preserving order)
  return [...ids].sort().concat(optionPaths);
}

/**
 * Ensure all required fields exist on a manifest that already has the current
 * schema version. Older CLIs may have stamped the version number without
 * actually writing every field introduced in that schema.
 * @param {Object} manifest
 * @returns {Object} manifest with missing fields filled in
 */
function ensureRequiredFields(manifest) {
  // Migrate commit_language → output_language (backward-compatible)
  const options = manifest.options ? { ...manifest.options } : {};
  if (options.commit_language && !options.output_language) {
    options.output_language = options.commit_language;
  }
  // Remove deprecated commit_language once output_language is set
  if (options.output_language && options.commit_language) {
    delete options.commit_language;
  }

  // Normalize fileHashes keys: deduplicate backslash vs forward-slash paths (Windows)
  const fileHashes = manifest.fileHashes || {};
  const normalizedHashes = {};
  for (const [key, value] of Object.entries(fileHashes)) {
    const normalizedKey = key.replace(/\\/g, '/');
    // Keep the newer entry (by installedAt) if both exist
    if (!normalizedHashes[normalizedKey] ||
        (value.installedAt && (!normalizedHashes[normalizedKey].installedAt ||
          value.installedAt > normalizedHashes[normalizedKey].installedAt))) {
      normalizedHashes[normalizedKey] = value;
    }
  }

  // Safety net: convert any remaining path-format standards to IDs.
  // Runs even at current schema version in case a manifest was written with
  // the wrong format by an older CLI or a partial migration.
  const standards = migrateStandardsPathsToIds(manifest.standards || []);

  return {
    ...manifest,
    options,
    standards,
    contentMode: manifest.contentMode || 'index',
    fileHashes: normalizedHashes,
    skillHashes: manifest.skillHashes || {},
    commandHashes: manifest.commandHashes || {},
    integrationBlockHashes: manifest.integrationBlockHashes || {},
  };
}

/**
 * Update upstream information
 * @param {Object} manifest - Manifest to update
 * @param {Object} upstream - New upstream info
 * @returns {Object} Updated manifest
 */
export function updateUpstream(manifest, upstream) {
  return {
    ...manifest,
    upstream: {
      ...manifest.upstream,
      ...upstream,
      installed: new Date().toISOString()
    }
  };
}

/**
 * Add file hash to manifest
 * @param {Object} manifest - Manifest to update
 * @param {string} filePath - File path (relative to project root)
 * @param {string} hash - SHA-256 hash with 'sha256:' prefix
 * @param {number} size - File size in bytes
 * @returns {Object} Updated manifest
 */
export function addFileHash(manifest, filePath, hash, size) {
  const normalizedPath = filePath.replace(/\\/g, '/');
  return {
    ...manifest,
    fileHashes: {
      ...manifest.fileHashes,
      [normalizedPath]: {
        hash,
        size,
        installedAt: new Date().toISOString()
      }
    }
  };
}

/**
 * Remove file hash from manifest
 * @param {Object} manifest - Manifest to update
 * @param {string} filePath - File path to remove
 * @returns {Object} Updated manifest
 */
export function removeFileHash(manifest, filePath) {
  const remainingHashes = Object.fromEntries(
    Object.entries(manifest.fileHashes).filter(([key]) => key !== filePath)
  );
  return {
    ...manifest,
    fileHashes: remainingHashes
  };
}

/**
 * Check if manifest needs migration
 * @param {Object} manifest - Manifest to check
 * @returns {boolean} True if migration is needed
 */
export function needsMigration(manifest) {
  if (!manifest) {
    return true;
  }
  
  return manifest.version !== CURRENT_SCHEMA_VERSION;
}

/**
 * Get all AI tools from manifest
 * @param {Object} manifest - Manifest
 * @returns {string[]} Array of AI tool names
 */
export function getAITools(manifest) {
  return manifest.aiTools || [];
}

/**
 * Get all installed standards paths
 * @param {Object} manifest - Manifest
 * @returns {string[]} Array of standard file paths
 */
export function getStandards(manifest) {
  return manifest.standards || [];
}

/**
 * Check if skills are installed
 * @param {Object} manifest - Manifest
 * @returns {boolean} True if skills are installed
 */
export function areSkillsInstalled(manifest) {
  return manifest.skills?.installed || false;
}

/**
 * Check if commands are installed
 * @param {Object} manifest - Manifest
 * @returns {boolean} True if commands are installed
 */
export function areCommandsInstalled(manifest) {
  return manifest.commands?.installed || false;
}