/**
 * UDS Constants Registry
 * Centralized management of all constants used across the UDS CLI
 */

/**
 * UDS markers for different file formats
 * Used to identify UDS-managed sections in integration files
 */
export const UDS_MARKERS = {
  markdown: {
    start: '<!-- UDS:STANDARDS:START -->',
    end: '<!-- UDS:STANDARDS:END -->'
  },
  plaintext: {
    start: '# === UDS:STANDARDS:START ===',
    end: '# === UDS:STANDARDS:END ==='
  },
  // Additional marker variants for future use
  yaml: {
    start: '# === UDS:START ===',
    end: '# === UDS:END ==='
  },
  json: {
    start: '/* === UDS:START === */',
    end: '/* === UDS:END === */'
  }
};

/**
 * UDS block markers for content integration
 * Used to mark different types of content blocks
 */
export const UDS_BLOCKS = {
  INTRO: 'INTRO',
  STANDARDS: 'STANDARDS',
  COMMANDS: 'COMMANDS',
  SKILLS: 'SKILLS',
  AGENTS: 'AGENTS',
  WORKFLOWS: 'WORKFLOWS',
  REFERENCES: 'REFERENCES'
};

/**
 * Supported AI tools and their configurations
 */
export const SUPPORTED_AI_TOOLS = {
  'claude-code': {
    name: 'Claude Code',
    file: 'CLAUDE.md',
    format: 'markdown',
    category: 'primary',
    supports: ['skills', 'commands', 'agents', 'workflows']
  },
  'opencode': {
    name: 'OpenCode',
    file: 'AGENTS.md',
    format: 'markdown',
    category: 'primary',
    supports: ['skills', 'commands']
  },
  'cursor': {
    name: 'Cursor',
    file: '.cursorrules',
    format: 'plaintext',
    category: 'secondary',
    supports: ['skills']
  },
  'windsurf': {
    name: 'Windsurf',
    file: '.windsurfrules',
    format: 'plaintext',
    category: 'secondary',
    supports: ['skills']
  },
  'cline': {
    name: 'Cline',
    file: '.clinerules',
    format: 'plaintext',
    category: 'secondary',
    supports: ['skills']
  },
  'github-copilot': {
    name: 'GitHub Copilot',
    file: '.github/copilot-instructions.md',
    format: 'markdown',
    category: 'secondary',
    supports: ['skills', 'commands']
  },
  'aider': {
    name: 'Aider',
    file: '.aider.conf.yml',
    format: 'yaml',
    category: 'secondary',
    supports: ['skills']
  },
  'roo': {
    name: 'Roo',
    file: 'ROO.md',
    format: 'markdown',
    category: 'secondary',
    supports: ['skills', 'workflows']
  },
  'antigravity': {
    name: 'Antigravity',
    file: 'INSTRUCTIONS.md',
    format: 'markdown',
    category: 'secondary',
    supports: ['skills', 'workflows']
  }
};

/**
 * Legacy tool name mappings (for backward compatibility)
 */
export const LEGACY_TOOL_MAPPINGS = {
  'codex': 'opencode',
  'gemini-cli': 'opencode',
  'copilot': 'github-copilot'
};

/**
 * File format extensions
 */
export const FILE_EXTENSIONS = {
  MARKDOWN: '.md',
  AI_YAML: '.ai.yaml',
  YAML: '.yaml',
  YML: '.yml',
  JSON: '.json',
  WORKFLOW: '.workflow.yaml',
  AGENT: '.md'
};

/**
 * Content modes for integration files
 */
export const CONTENT_MODES = {
  MINIMAL: 'minimal',    // Reference-only content
  INDEX: 'index',        // Standard index with descriptions
  FULL: 'full'          // Full standard content embedded
};

/**
 * Standards scope options
 */
export const STANDARDS_SCOPES = {
  MINIMAL: 'minimal',    // Core standards only
  FULL: 'full'          // All standards including extensions
};

/**
 * Standard file formats
 */
export const STANDARD_FORMATS = {
  AI: 'ai',          // AI-optimized format (.ai.yaml)
  HUMAN: 'human',     // Human-readable format (.md)
  BOTH: 'both'        // Both formats installed
};

/**
 * Adoption levels
 */
export const ADOPTION_LEVELS = {
  LEVEL_1: 1,  // Core standards only
  LEVEL_2: 2,  // Core + workflow standards
  LEVEL_3: 3   // Full standards suite
};

/**
 * Git workflow types
 */
export const GIT_WORKFLOWS = {
  GITHUB_FLOW: 'github-flow',
  GITFLOW: 'gitflow',
  TRUNK_BASED: 'trunk-based'
};

/**
 * Merge strategies
 */
export const MERGE_STRATEGIES = {
  MERGE: 'merge',
  SQUASH: 'squash',
  REBASE: 'rebase'
};

/**
 * Commit message languages
 */
export const COMMIT_LANGUAGES = {
  ENGLISH: 'english',
  CHINESE: 'chinese',
  BILINGUAL: 'bilingual'
};

/**
 * Test levels
 */
export const TEST_LEVELS = {
  UNIT_TESTING: 'unit-testing',
  INTEGRATION_TESTING: 'integration-testing',
  E2E_TESTING: 'e2e-testing'
};

/**
 * Installation locations
 */
export const INSTALLATION_LOCATIONS = {
  PROJECT: 'project',
  USER: 'user',
  MARKETPLACE: 'marketplace'
};

/**
 * Skill categories
 */
export const SKILL_CATEGORIES = {
  AGENTS: 'agents',
  WORKFLOWS: 'workflows',
  COMMANDS: 'commands',
  UTILITIES: 'utilities'
};

/**
 * Directory structure constants
 */
export const DIRECTORIES = {
  STANDARDS: '.standards',
  UDS: '.uds',
  CORE: 'core',
  AI: 'ai',
  LOCALES: 'locales',
  SKILLS: 'skills',
  AGENTS: 'agents',
  WORKFLOWS: 'workflows',
  TEMPLATES: 'templates',
  INTEGRATIONS: 'integrations',
  CONFIG: 'config',
  DOCS: 'docs'
};

/**
 * Standard file patterns
 */
export const FILE_PATTERNS = {
  STANDARDS: `${DIRECTORIES.CORE}/*.md`,
  AI_STANDARDS: `${DIRECTORIES.AI}/standards/*.ai.yaml`,
  LOCALES: `${DIRECTORIES.LOCALES}/*/**.md`,
  SKILLS: `${DIRECTORIES.SKILLS}/**`,
  WORKFLOWS: `${DIRECTORIES.WORKFLOWS}/**`,
  TEMPLATES: `${DIRECTORIES.TEMPLATES}/**`,
  CONFIG: `${DIRECTORIES.CONFIG}/**`
};

/**
 * HTTP configuration
 */
export const HTTP_CONFIG = {
  TIMEOUT: 30000, // 30 seconds
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
  USER_AGENT: 'UDS-CLI/4.1.0'
};

/**
 * GitHub configuration
 */
export const GITHUB_CONFIG = {
  REPO: 'AsiaOstrich/universal-dev-standards',
  API_BASE: 'https://api.github.com',
  RAW_BASE: 'https://raw.githubusercontent.com',
  DEFAULT_BRANCH: 'main'
};

/**
 * Hash algorithm and format
 */
export const HASH_CONFIG = {
  ALGORITHM: 'sha256',
  PREFIX: 'sha256:',
  ENCODING: 'hex'
};

/**
 * Validation patterns
 */
export const VALIDATION_PATTERNS = {
  SEMVER: '^\\d+\\.\\d+\\.\\d+(-[a-zA-Z0-9.-]+)?(\\+[a-zA-Z0-9.-]+)?$',
  EMAIL: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
  URL: '^https?://[^\\s/$.?#].[^\\s]*$',
  REPO: '^[\\w-]+/[\\w-]+$'
};

/**
 * UI configuration
 */
export const UI_CONFIG = {
  MAX_WIDTH: 80,
  INDENT_SIZE: 2,
  TABLE_MIN_WIDTH: 60,
  PROGRESS_BAR_WIDTH: 40,
  SPINNER_FRAMES: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
  COLORS: {
    SUCCESS: 'green',
    ERROR: 'red',
    WARNING: 'yellow',
    INFO: 'blue',
    HIGHLIGHT: 'magenta'
  }
};

/**
 * Default configuration values
 */
export const DEFAULTS = {
  LEVEL: ADOPTION_LEVELS.LEVEL_2,
  FORMAT: STANDARD_FORMATS.AI,
  STANDARDS_SCOPE: STANDARDS_SCOPES.MINIMAL,
  CONTENT_MODE: CONTENT_MODES.INDEX,
  WORKFLOW: GIT_WORKFLOWS.GITHUB_FLOW,
  MERGE_STRATEGY: MERGE_STRATEGIES.SQUASH,
  COMMIT_LANGUAGE: COMMIT_LANGUAGES.ENGLISH,
  TEST_LEVELS: [TEST_LEVELS.UNIT_TESTING, TEST_LEVELS.INTEGRATION_TESTING]
};

/**
 * Feature flags (for experimental features)
 */
export const FEATURE_FLAGS = {
  BETA_FEATURES: false,
  DEBUG_MODE: false,
  VERBOSE_LOGGING: false,
  FORCE_UPDATE: false
};

/**
 * Environment variable names
 */
export const ENV_VARS = {
  UDS_DEBUG: 'UDS_DEBUG',
  UDS_NO_COLOR: 'UDS_NO_COLOR',
  UDS_CACHE_DIR: 'UDS_CACHE_DIR',
  UDS_GITHUB_TOKEN: 'GITHUB_TOKEN',
  UDS_OFFLINE: 'UDS_OFFLINE'
};

/**
 * Cache configuration
 */
export const CACHE_CONFIG = {
  DEFAULT_TTL: 3600000, // 1 hour in milliseconds
  MAX_SIZE: 100 * 1024 * 1024, // 100MB
  CLEANUP_INTERVAL: 300000 // 5 minutes
};

/**
 * File size limits
 */
export const FILE_SIZE_LIMITS = {
  MAX_STANDARD_SIZE: 1024 * 1024, // 1MB
  MAX_INTEGRATION_SIZE: 512 * 1024, // 512KB
  MAX_MANIFEST_SIZE: 64 * 1024, // 64KB
  MAX_CACHE_FILE_SIZE: 10 * 1024 * 1024 // 10MB
};

/**
 * Timeout values (in milliseconds)
 */
export const TIMEOUTS = {
  FILE_OPERATION: 5000, // 5 seconds
  NETWORK_REQUEST: 30000, // 30 seconds
  PROMPT_RESPONSE: 120000, // 2 minutes
  CACHE_OPERATION: 1000, // 1 second
  VALIDATION: 5000 // 5 seconds
};

/**
 * Error severity levels
 */
export const ERROR_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

/**
 * Log levels
 */
export const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  FATAL: 4
};

/**
 * Permission flags
 */
export const PERMISSIONS = {
  READABLE: 1 << 0,    // 0b001 = 1
  WRITABLE: 1 << 1,    // 0b010 = 2
  EXECUTABLE: 1 << 2,  // 0b100 = 4
  ALL: (1 << 0) | (1 << 1) | (1 << 2)  // 0b111 = 7
};

/**
 * Character encodings
 */
export const ENCODINGS = {
  UTF8: 'utf8',
  ASCII: 'ascii',
  BASE64: 'base64',
  HEX: 'hex'
};

/**
 * Status codes
 */
export const STATUS_CODES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  SKIPPED: 'skipped',
  CANCELLED: 'cancelled',
  TIMEOUT: 'timeout',
  IN_PROGRESS: 'in_progress'
};

/**
 * Helper functions for constants
 */

/**
 * Check if a tool is supported
 * @param {string} tool - Tool name
 * @returns {boolean} True if supported
 */
export function isToolSupported(tool) {
  return Object.hasOwn(SUPPORTED_AI_TOOLS, tool) ||
         Object.hasOwn(SUPPORTED_AI_TOOLS, LEGACY_TOOL_MAPPINGS[tool]);
}

/**
 * Get normalized tool name
 * @param {string} tool - Tool name
 * @returns {string} Normalized tool name
 */
export function getNormalizedToolName(tool) {
  return LEGACY_TOOL_MAPPINGS[tool] || tool;
}

/**
 * Get tool configuration
 * @param {string} tool - Tool name
 * @returns {Object|null} Tool configuration or null
 */
export function getToolConfig(tool) {
  const normalizedName = getNormalizedToolName(tool);
  return SUPPORTED_AI_TOOLS[normalizedName] || null;
}

/**
 * Check if tool supports a specific feature
 * @param {string} tool - Tool name
 * @param {string} feature - Feature name
 * @returns {boolean} True if supported
 */
export function doesToolSupport(tool, feature) {
  const config = getToolConfig(tool);
  return config && config.supports && config.supports.includes(feature);
}

/**
 * Get file format for a tool
 * @param {string} tool - Tool name
 * @returns {string} File format ('markdown', 'plaintext', 'yaml', etc.)
 */
export function getToolFormat(tool) {
  const config = getToolConfig(tool);
  return config ? config.format : 'markdown';
}

/**
 * Get integration file name for a tool
 * @param {string} tool - Tool name
 * @returns {string} File name
 */
export function getToolFileName(tool) {
  const config = getToolConfig(tool);
  return config ? config.file : `${tool}.md`;
}

export default {
  UDS_MARKERS,
  SUPPORTED_AI_TOOLS,
  FILE_EXTENSIONS,
  CONTENT_MODES,
  STANDARDS_SCOPES,
  STANDARD_FORMATS,
  DEFAULTS,
  DIRECTORIES,
  VALIDATION_PATTERNS,
  ENV_VARS,
  // Helper functions
  isToolSupported,
  getNormalizedToolName,
  getToolConfig,
  doesToolSupport,
  getToolFormat,
  getToolFileName
};