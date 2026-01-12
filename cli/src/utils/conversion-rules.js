/**
 * Conversion Rules for Markdown to AI-YAML
 *
 * Defines mappings, naming conventions, and transformation rules
 * for converting core standards to AI-optimized format.
 */

/**
 * Standard ID mappings
 * Maps source filename (without .md) to target YAML id
 */
export const STANDARD_ID_MAPPING = {
  'commit-message-guide': 'commit-message',
  'changelog-standards': 'changelog',
  'code-review-checklist': 'code-review',
  'testing-standards': 'testing',
  'git-workflow': 'git-workflow',
  'documentation-structure': 'documentation',
  'checkin-standards': 'checkin',
  'anti-hallucination': 'anti-hallucination',
  'versioning': 'versioning',
  'test-driven-development': 'tdd',
  'spec-driven-development': 'sdd',
  'test-completeness-dimensions': 'test-completeness',
  'logging-standards': 'logging',
  'error-code-standards': 'error-code',
  'refactoring-standards': 'refactoring',
  'graceful-failure': 'graceful-failure',
  'release-workflow': 'release-workflow'
};

/**
 * Section name mappings
 * Maps Markdown section headers to YAML keys
 */
export const SECTION_MAPPINGS = {
  'Purpose': 'meta.description',
  'Basic Format': 'format',
  'Type Classification': 'types',
  'Scope Guidelines': 'scopes',
  'Subject Line': 'subject',
  'Body': 'body',
  'Footer': 'footer',
  'Complete Examples': 'examples',
  'Anti-Patterns': 'anti_patterns',
  'Automation and Tooling': 'tooling',
  'Project Configuration Template': 'configuration',
  'Testing Pyramid': 'pyramid',
  'Test Categories': 'categories',
  'Commit Types': 'types',
  'Branch Naming': 'branches',
  'Merge Strategy': 'merge_strategy',
  'Quick Reference': 'quick_reference'
};

/**
 * Priority inference patterns
 * Maps text patterns to priority levels
 */
export const PRIORITY_PATTERNS = [
  { pattern: /\b(MUST|CRITICAL|REQUIRED|ALWAYS)\b/i, priority: 'required' },
  { pattern: /\b(SHOULD|RECOMMENDED|PREFER)\b/i, priority: 'recommended' },
  { pattern: /\b(MAY|OPTIONAL|CONSIDER)\b/i, priority: 'optional' },
  { pattern: /\b(NEVER|MUST NOT|DO NOT)\b/i, priority: 'required' }
];

/**
 * Infer priority from text content
 * @param {string} text - Text to analyze
 * @returns {string} Priority level (required, recommended, optional)
 */
export function inferPriority(text) {
  for (const { pattern, priority } of PRIORITY_PATTERNS) {
    if (pattern.test(text)) {
      return priority;
    }
  }
  return 'recommended'; // Default
}

/**
 * Trigger patterns by section type
 */
export const TRIGGER_MAPPINGS = {
  'commit-message': 'writing commit message',
  'testing': 'writing tests',
  'code-review': 'reviewing code',
  'git-workflow': 'managing branches',
  'documentation': 'writing documentation',
  'changelog': 'updating changelog',
  'versioning': 'determining version number',
  'checkin': 'committing code',
  'anti-hallucination': 'collaborating with AI',
  'tdd': 'developing with TDD',
  'sdd': 'developing with specs',
  'logging': 'adding logging',
  'error-code': 'defining error codes',
  'refactoring': 'refactoring code',
  'graceful-failure': 'handling failures'
};

/**
 * Get trigger text for a standard
 * @param {string} standardId - Standard identifier
 * @returns {string} Trigger description
 */
export function getTrigger(standardId) {
  return TRIGGER_MAPPINGS[standardId] || 'applying this standard';
}

/**
 * Sections to skip during conversion
 * These are metadata sections that don't need YAML representation
 */
export const SKIP_SECTIONS = [
  'Version History',
  'References',
  'License',
  'Related Standards'
];

/**
 * Check if a section should be skipped
 * @param {string} sectionName - Section name
 * @returns {boolean} Whether to skip
 */
export function shouldSkipSection(sectionName) {
  return SKIP_SECTIONS.some(skip =>
    sectionName.toLowerCase().includes(skip.toLowerCase())
  );
}

/**
 * Validator patterns for common rules
 */
export const VALIDATORS = {
  'commit-subject': '^.{1,72}$',
  'scope': '^[a-z][a-z0-9-]*$',
  'version': '^\\d+\\.\\d+\\.\\d+(-[a-zA-Z0-9.]+)?$',
  'branch-name': '^(feature|fix|docs|chore|hotfix)/[a-z0-9-]+$',
  'commit-type': '^(feat|fix|docs|style|refactor|test|perf|build|ci|chore|revert|security)$'
};

/**
 * Get validator for a rule type
 * @param {string} ruleType - Type of rule
 * @returns {string|null} Regex validator or null
 */
export function getValidator(ruleType) {
  return VALIDATORS[ruleType] || null;
}

/**
 * Locale configurations
 */
export const LOCALE_CONFIG = {
  'zh-TW': {
    name: 'Traditional Chinese',
    direction: 'ltr',
    coreDir: 'locales/zh-TW/core',
    aiDir: 'locales/zh-TW/ai/standards'
  },
  'zh-CN': {
    name: 'Simplified Chinese',
    direction: 'ltr',
    coreDir: 'locales/zh-CN/core',
    aiDir: 'locales/zh-CN/ai/standards'
  }
};

/**
 * Get locale configuration
 * @param {string} locale - Locale code
 * @returns {Object|null} Locale config or null
 */
export function getLocaleConfig(locale) {
  return LOCALE_CONFIG[locale] || null;
}

/**
 * Get all supported locales
 * @returns {string[]} Array of locale codes
 */
export function getSupportedLocales() {
  return Object.keys(LOCALE_CONFIG);
}

/**
 * Output path mappings
 * Maps source patterns to output directories
 */
export const OUTPUT_PATHS = {
  'core': 'ai/standards',
  'locales/zh-TW/core': 'locales/zh-TW/ai/standards',
  'locales/zh-CN/core': 'locales/zh-CN/ai/standards'
};

/**
 * Get output directory for a source path
 * @param {string} sourcePath - Source file path
 * @returns {string} Output directory
 */
export function getOutputDir(sourcePath) {
  // Check longer patterns first (locales before core)
  // Sort by pattern length descending to ensure more specific matches first
  const sortedEntries = Object.entries(OUTPUT_PATHS)
    .sort((a, b) => b[0].length - a[0].length);

  for (const [pattern, outputDir] of sortedEntries) {
    if (sourcePath.includes(pattern)) {
      return outputDir;
    }
  }
  return 'ai/standards';
}

/**
 * Generate output filename from source filename
 * @param {string} sourceFilename - Source .md filename
 * @returns {string} Output .ai.yaml filename
 */
export function getOutputFilename(sourceFilename) {
  // Get the base name without .md
  let baseName = sourceFilename.replace(/\.md$/, '');

  // Map to standard ID if available
  if (STANDARD_ID_MAPPING[baseName]) {
    baseName = STANDARD_ID_MAPPING[baseName];
  }

  return `${baseName}.ai.yaml`;
}
