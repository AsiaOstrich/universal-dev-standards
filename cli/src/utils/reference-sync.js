/**
 * Reference Sync Utilities
 *
 * Tools for synchronizing standard references between manifest and integration files.
 */

/**
 * Mapping from category ID to standard source paths
 * Based on standards-registry.json and RULE_TEMPLATES in integration-generator.js
 */
export const CATEGORY_TO_STANDARDS = {
  'anti-hallucination': ['core/anti-hallucination.md', 'core/guides/anti-hallucination-guide.md'],
  'commit-standards': ['core/commit-message-guide.md'],
  'code-review': ['core/code-review-checklist.md', 'core/checkin-standards.md'],
  'spec-driven-development': ['core/spec-driven-development.md', 'methodologies/guides/sdd-guide.md'],
  'testing': ['core/testing-standards.md', 'skills/testing-guide/testing-theory.md'],
  'documentation': ['core/documentation-structure.md'],
  'git-workflow': ['core/git-workflow.md', 'core/guides/git-workflow-guide.md'],
  'error-handling': ['core/error-code-standards.md', 'core/logging-standards.md'],
  'project-structure': ['core/project-structure.md'],
  'refactoring': ['core/refactoring-standards.md', 'core/guides/refactoring-guide.md'],
  'requirement': ['core/requirement-engineering.md', 'methodologies/guides/requirement-engineering-guide.md']
};

/**
 * Reverse mapping from standard filename to category ID
 */
export const STANDARD_TO_CATEGORY = {
  // Core Rules
  'anti-hallucination.md': 'anti-hallucination',
  'commit-message-guide.md': 'commit-standards',
  'code-review-checklist.md': 'code-review',
  'checkin-standards.md': 'code-review',
  'spec-driven-development.md': 'spec-driven-development',
  'testing-standards.md': 'testing',
  'documentation-structure.md': 'documentation',
  'git-workflow.md': 'git-workflow',
  'error-code-standards.md': 'error-handling',
  'logging-standards.md': 'error-handling',
  'project-structure.md': 'project-structure',
  'refactoring-standards.md': 'refactoring',
  'requirement-engineering.md': 'requirement',
  // Guides (educational content)
  'anti-hallucination-guide.md': 'anti-hallucination',
  'sdd-guide.md': 'spec-driven-development',
  'testing-theory.md': 'testing',
  'git-workflow-guide.md': 'git-workflow',
  'refactoring-guide.md': 'refactoring',
  'requirement-engineering-guide.md': 'requirement'
};

/**
 * Parse Reference: lines from integration file content
 *
 * Matches patterns like:
 * - Reference: .standards/anti-hallucination.md
 * - 參考: .standards/anti-hallucination.md (Chinese)
 *
 * @param {string} content - Integration file content
 * @returns {string[]} - Array of referenced standard filenames (e.g., ['anti-hallucination.md'])
 */
export function parseReferences(content) {
  // Match both English and Chinese reference patterns
  const referencePattern = /(?:Reference|參考):\s*\.standards\/([^\s\n)]+)/gi;
  const references = new Set();
  let match;

  while ((match = referencePattern.exec(content)) !== null) {
    references.add(match[1]);
  }

  return Array.from(references);
}

/**
 * Get standard source paths for a category
 *
 * @param {string} categoryId - Category ID (e.g., 'anti-hallucination')
 * @returns {string[]} - Array of standard source paths
 */
export function getCategoryStandardPaths(categoryId) {
  return CATEGORY_TO_STANDARDS[categoryId] || [];
}

/**
 * Get the category ID for a standard source path
 *
 * @param {string} sourcePath - Standard source path (e.g., 'core/anti-hallucination.md')
 * @returns {string|null} - Category ID or null if not mapped
 */
export function getStandardCategory(sourcePath) {
  const fileName = sourcePath.split('/').pop();
  return STANDARD_TO_CATEGORY[fileName] || null;
}

/**
 * Compare manifest standards with integration file references
 *
 * @param {string[]} manifestStandards - Array of standard source paths from manifest
 * @param {string[]} integrationReferences - Array of filenames parsed from integration file
 * @returns {{orphanedRefs: string[], missingRefs: string[], syncedRefs: string[]}}
 *   - orphanedRefs: References in integration file but not in manifest
 *   - missingRefs: Standards in manifest but not referenced in integration file
 *   - syncedRefs: Standards that are properly synced
 */
export function compareStandardsWithReferences(manifestStandards, integrationReferences) {
  // Get filenames from manifest standards (only those that have category mappings)
  const manifestFileNames = new Set();
  for (const std of manifestStandards) {
    const fileName = std.split('/').pop();
    // Only include standards that are part of the category system
    if (STANDARD_TO_CATEGORY[fileName]) {
      manifestFileNames.add(fileName);
    }
  }

  const refSet = new Set(integrationReferences);

  // References in integration file but not in manifest
  const orphanedRefs = integrationReferences.filter(ref => !manifestFileNames.has(ref));

  // Standards in manifest but not referenced
  const missingRefs = [...manifestFileNames].filter(fileName => !refSet.has(fileName));

  // Properly synced references
  const syncedRefs = integrationReferences.filter(ref => manifestFileNames.has(ref));

  return { orphanedRefs, missingRefs, syncedRefs };
}

/**
 * Calculate which categories should be included based on manifest standards
 *
 * @param {string[]} standards - Array of standard source paths from manifest
 * @returns {string[]} - Array of category IDs
 */
export function calculateCategoriesFromStandards(standards) {
  const categories = new Set();

  for (const std of standards) {
    const category = getStandardCategory(std);
    if (category) {
      categories.add(category);
    }
  }

  return Array.from(categories);
}

/**
 * Get all standard filenames that should be referenced for given categories
 *
 * @param {string[]} categories - Array of category IDs
 * @returns {string[]} - Array of standard filenames
 */
export function getStandardsForCategories(categories) {
  const standards = new Set();

  for (const category of categories) {
    const paths = getCategoryStandardPaths(category);
    for (const path of paths) {
      standards.add(path.split('/').pop());
    }
  }

  return Array.from(standards);
}

/**
 * Check if two arrays have the same elements (order independent)
 *
 * @param {string[]} arr1
 * @param {string[]} arr2
 * @returns {boolean}
 */
export function arraysEqual(arr1, arr2) {
  if (arr1.length !== arr2.length) return false;
  const sorted1 = [...arr1].sort();
  const sorted2 = [...arr2].sort();
  return sorted1.every((val, idx) => val === sorted2[idx]);
}

/**
 * Get tool name from integration file path
 *
 * @param {string} integrationPath - Path like '.cursorrules' or 'CLAUDE.md'
 * @returns {string|null} - Tool name like 'cursor' or 'claude-code'
 */
export function getToolFromPath(integrationPath) {
  const pathToTool = {
    '.cursorrules': 'cursor',
    '.windsurfrules': 'windsurf',
    '.clinerules': 'cline',
    '.github/copilot-instructions.md': 'copilot',
    'INSTRUCTIONS.md': 'antigravity',
    'CLAUDE.md': 'claude-code',
    '.standards/CLAUDE.md': 'claude-code'
  };

  return pathToTool[integrationPath] || null;
}
