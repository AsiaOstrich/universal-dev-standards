import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';

/**
 * UDS Manifest Schema v3.3.0
 * Central configuration and state tracking for UDS installations
 */

/**
 * Supported manifest schema versions
 */
export const SUPPORTED_SCHEMA_VERSIONS = ['3.0.0', '3.1.0', '3.2.0', '3.3.0'];

/**
 * Current manifest schema version
 */
export const CURRENT_SCHEMA_VERSION = '3.3.0';

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
  level: 2,
  format: 'ai',
  standardsScope: 'minimal',
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
  required: ['version', 'upstream', 'level', 'format', 'standardsScope', 'contentMode'],
  properties: {
    version: { type: 'string', pattern: '^\\d+\\.\\d+\\.\\d+$' },
    level: { type: 'number', enum: [1, 2, 3] },
    format: { type: 'string', enum: ['ai', 'human', 'both'] },
    standardsScope: { type: 'string', enum: ['minimal', 'full'] },
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
    const manifest = JSON.parse(content);
    
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
  
  // Already at current version
  if (currentVersion === CURRENT_SCHEMA_VERSION) {
    return manifest;
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

  // Update schema version
  migrated.version = CURRENT_SCHEMA_VERSION;
  
  return migrated;
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
    standardsScope: manifest.standardsScope || 'minimal',
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
  return {
    ...manifest,
    fileHashes: {
      ...manifest.fileHashes,
      [filePath]: {
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
 * Get adoption level
 * @param {Object} manifest - Manifest
 * @returns {number} Adoption level (1-3)
 */
export function getAdoptionLevel(manifest) {
  return manifest.level || 2;
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