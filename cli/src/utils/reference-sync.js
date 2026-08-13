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
  'requirement': ['core/requirement-engineering.md', 'methodologies/guides/requirement-engineering-guide.md'],
  'developer-memory': ['core/developer-memory.md'],
  'project-context-memory': ['core/project-context-memory.md']
};

/**
 * Reverse mapping from standard filename to category ID
 */
export const STANDARD_TO_CATEGORY = {
  // Core Rules (human .md format)
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
  'developer-memory.md': 'developer-memory',
  'project-context-memory.md': 'project-context-memory',
  // Core Rules (AI .ai.yaml format)
  'anti-hallucination.ai.yaml': 'anti-hallucination',
  'commit-message.ai.yaml': 'commit-standards',
  'code-review.ai.yaml': 'code-review',
  'checkin-standards.ai.yaml': 'code-review',
  'spec-driven-development.ai.yaml': 'spec-driven-development',
  'testing.ai.yaml': 'testing',
  'documentation-structure.ai.yaml': 'documentation',
  'git-workflow.ai.yaml': 'git-workflow',
  'error-codes.ai.yaml': 'error-handling',
  'logging.ai.yaml': 'error-handling',
  'project-structure.ai.yaml': 'project-structure',
  'refactoring-standards.ai.yaml': 'refactoring',
  'requirement-engineering.ai.yaml': 'requirement',
  'developer-memory.ai.yaml': 'developer-memory',
  'project-context-memory.ai.yaml': 'project-context-memory',
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
 * - Reference: .standards/a.ai.yaml, .standards/options/b.ai.yaml (more than one)
 * - Reference: `.standards/a.ai.yaml` (quoted, as markdown renders it)
 *
 * The first version anchored `.standards/` directly after the label and ran to
 * the first space, which made it see EXACTLY ONE path per line, keep whatever
 * punctuation followed it, and miss any path that was quoted. Measured on the
 * two telemetry repos: of three references it reported, one was a false
 * positive (`commit-message.ai.yaml,` — the file exists, the comma did not),
 * and it silently skipped two more, one of which
 * (`workflow-enforcement.ai.yaml`) does not exist in any repo or upstream.
 *
 * @param {string} content - Integration file content
 * @returns {string[]} - Array of referenced standard filenames (e.g., ['anti-hallucination.md'])
 */
export function parseReferences(content) {
  // Both English and Chinese labels, and both colon widths.
  const referenceLinePattern = /(?:Reference|參考)[:：][^\n]*/gi;
  // Every `.standards/` path on that line, stopping at anything that quotes or
  // separates rather than names: whitespace, brackets, backticks, quotes,
  // commas and semicolons.
  const pathPattern = /\.standards\/([^\s\n)\]`,;'"]+)/g;
  const references = new Set();

  for (const line of content.match(referenceLinePattern) ?? []) {
    for (const [, path] of line.matchAll(pathPattern)) {
      // Sentence punctuation is not part of a filename.
      const cleaned = path.replace(/[.,;:!?]+$/, '');
      if (cleaned) references.add(cleaned);
    }
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
 * Reduce a standard to the identity all three of its spellings share.
 *
 * The same standard appears as a manifest stem (`commit-message`), a shipped
 * file (`commit-message.ai.yaml`) and a human-readable reference
 * (`.standards/commit-message.md`). Comparing any two of those literally
 * fails, and it fails as "this standard is not adopted".
 *
 * @param {string} pathOrName - Any of the three spellings
 * @returns {string} - Bare stem, e.g. 'commit-message'
 */
export function standardStem(pathOrName) {
  return pathOrName
    .split('/')
    .pop()
    .replace(/\.(ai\.yaml|yaml|md)$/i, '');
}

/**
 * Category for a standard, accepting a manifest stem as well as a filename.
 *
 * {@link STANDARD_TO_CATEGORY} is keyed by filename; manifests store stems.
 * Looking a stem up directly always missed, which is what emptied
 * `manifestCategories`.
 *
 * @param {string} pathOrName - Manifest stem, filename or reference path
 * @returns {string|null} - Category ID, or null when the table does not cover it
 */
function categoryForStandard(pathOrName) {
  const fileName = pathOrName.split('/').pop();
  if (STANDARD_TO_CATEGORY[fileName]) return STANDARD_TO_CATEGORY[fileName];

  const stem = standardStem(pathOrName);
  return STANDARD_TO_CATEGORY[`${stem}.md`] || STANDARD_TO_CATEGORY[`${stem}.ai.yaml`] || null;
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
  // The manifest is the source of truth for what this project adopted, so ask
  // it directly. The category map below is a hand-written table covering a
  // small fraction of the standards UDS ships (compare its size against
  // `cli/standards-registry.json` — a count written here would go stale the
  // next time a standard lands); using it as the primary test reported every
  // standard outside the table as "not in manifest", which is a different
  // claim, and a false one.
  //
  // It was worse than partial coverage: manifest entries are bare stems
  // (`commit-message`) while the table is keyed by filename
  // (`commit-message.md`), so `manifestCategories` came out EMPTY on the
  // current manifest format and every reference fell through to orphaned.
  // Both halves were wrong at once, which is why the output still looked
  // plausible — three orphans reported on the telemetry repos, one of which
  // (`commit-message.ai.yaml`) is adopted, and the only genuinely dead one
  // (`workflow-enforcement.ai.yaml`) was not among them.
  const manifestStems = new Set(manifestStandards.map(standardStem));

  const manifestCategories = new Set();
  for (const std of manifestStandards) {
    const category = categoryForStandard(std);
    if (category) {
      manifestCategories.add(category);
    }
  }

  // A reference is orphaned when nothing in the manifest answers to it, by
  // stem (extension- and directory-insensitive) or by legacy category name.
  const orphanedRefs = integrationReferences.filter(ref => {
    if (manifestStems.has(standardStem(ref))) return false;
    const category = categoryForStandard(ref);
    return !category || !manifestCategories.has(category);
  });

  // Categories in manifest but not referenced in integration file
  const refCategories = new Set();
  for (const ref of integrationReferences) {
    const category = categoryForStandard(ref);
    if (category) {
      refCategories.add(category);
    }
  }
  const missingCategories = [...manifestCategories].filter(cat => !refCategories.has(cat));
  // Convert missing categories back to representative filenames for reporting
  const missingRefs = missingCategories.flatMap(cat => {
    const paths = CATEGORY_TO_STANDARDS[cat] || [];
    return paths.map(p => p.split('/').pop());
  });

  // Properly synced references
  const syncedRefs = integrationReferences.filter(ref => !orphanedRefs.includes(ref));

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
    '.standards/CLAUDE.md': 'claude-code',
    'AGENTS.md': 'codex'
  };

  return pathToTool[integrationPath] || null;
}
