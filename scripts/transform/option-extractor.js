/**
 * Option Extractor for Universal Dev Standards
 *
 * Extracts configurable options from parsed Markdown structure.
 * Identifies option patterns like "Option A/B/C" or "Strategy A/B/C"
 * and splits them into separate option files.
 */

/**
 * Extract options from parsed Markdown
 * @param {Object} parsed - Parsed Markdown structure
 * @param {Object} config - Option configuration for this standard
 * @returns {Object} Extracted options by category
 */
export function extractOptions(parsed, config) {
  const result = {};

  for (const [category, pattern] of Object.entries(config.optionPatterns)) {
    result[category] = extractOptionCategory(parsed, category, pattern);
  }

  return result;
}

/**
 * Extract options for a specific category
 */
function extractOptionCategory(parsed, category, pattern) {
  const options = [];

  // Find sections matching the pattern
  for (const section of parsed.sections) {
    // Check main section title
    const match = matchOption(section.title, pattern, category);
    if (match) {
      options.push({
        id: match.id,
        name: match.name,
        content: extractOptionContent(section, parsed)
      });
      continue;
    }

    // Check subsections
    for (const subsection of section.subsections) {
      const subMatch = matchOption(subsection.title, pattern, category);
      if (subMatch) {
        options.push({
          id: subMatch.id,
          name: subMatch.name,
          content: extractSubsectionContent(subsection, section, parsed)
        });
      }
    }
  }

  return options;
}

/**
 * Match section title against option pattern
 */
function matchOption(title, pattern, category) {
  // Common option patterns
  const patterns = {
    workflow: [
      { regex: /Strategy [ABC]:\s*(.+)/i, extract: 1 },
      { regex: /^(GitFlow|GitHub Flow|Trunk-Based)/i, extract: 0 },
    ],
    merge_strategy: [
      { regex: /(Merge Commit|Squash Merge|Rebase)/i, extract: 0 },
    ],
    commit_language: [
      { regex: /Option [ABC]:\s*(.+)/i, extract: 1 },
      { regex: /^(English|Traditional Chinese|Bilingual)/i, extract: 0 },
    ],
    test_level: [
      { regex: /^(Unit|Integration|System|E2E|End-to-End) Testing/i, extract: 1 },
    ]
  };

  const categoryPatterns = patterns[category] || [];

  for (const p of categoryPatterns) {
    const match = title.match(p.regex);
    if (match) {
      const name = match[p.extract] || match[0];
      return {
        id: toKebabCase(name),
        name: name.trim()
      };
    }
  }

  return null;
}

/**
 * Extract content for an option from a section
 */
function extractOptionContent(section, parsed) {
  // Create a mini-parsed structure for this option
  const content = {
    meta: {
      ...parsed.meta,
      id: toKebabCase(section.title),
      description: extractDescription(section)
    },
    sections: [section],
    rules: parsed.rules.filter(r => r.section === section.title),
    examples: parsed.examples.filter(e => e.section === section.title),
    tables: parsed.tables.filter(t => t.section === section.title),
    decisionTree: null
  };

  // Extract "Best For" or "When to Use" info
  content.bestFor = extractBestFor(section);

  // Extract branches info for workflow options
  content.branches = extractBranches(section);

  // Extract workflow steps
  content.workflow = extractWorkflowSteps(section);

  return content;
}

/**
 * Extract content for an option from a subsection
 */
function extractSubsectionContent(subsection, parentSection, parsed) {
  const content = {
    meta: {
      ...parsed.meta,
      id: toKebabCase(subsection.title),
      description: extractDescription(subsection)
    },
    sections: [{
      ...parentSection,
      subsections: [subsection]
    }],
    rules: parsed.rules.filter(r =>
      r.section === parentSection.title &&
      r.subsection === subsection.title
    ),
    examples: parsed.examples.filter(e =>
      e.section === parentSection.title &&
      e.subsection === subsection.title
    ),
    tables: parsed.tables.filter(t =>
      t.section === parentSection.title &&
      t.subsection === subsection.title
    ),
    decisionTree: null
  };

  return content;
}

/**
 * Extract description from section content
 */
function extractDescription(section) {
  const content = section.content || [];
  const firstParagraph = content.find(line =>
    line.trim() && !line.startsWith('|') && !line.startsWith('-') && !line.startsWith('#')
  );
  return firstParagraph?.trim() || '';
}

/**
 * Extract "Best For" information
 */
function extractBestFor(section) {
  const result = [];
  const content = [...(section.content || [])];

  // Add subsection content
  for (const sub of section.subsections || []) {
    if (sub.title.toLowerCase().includes('best for') ||
        sub.title.toLowerCase().includes('when to use')) {
      content.push(...(sub.content || []));
    }
  }

  // Extract bullet points
  for (const line of content) {
    if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
      const item = line.trim().replace(/^[-*]\s*/, '');
      if (item) result.push(item);
    }
  }

  return result;
}

/**
 * Extract branch definitions
 */
function extractBranches(section) {
  const branches = [];

  // Look for branch table or list
  for (const sub of section.subsections || []) {
    if (sub.title.toLowerCase().includes('branch')) {
      // Extract from content
      for (const line of sub.content || []) {
        const branchMatch = line.match(/`([^`]+)`\s*[-–:]\s*(.+)/);
        if (branchMatch) {
          branches.push({
            name: branchMatch[1],
            purpose: branchMatch[2].trim()
          });
        }
      }
    }
  }

  return branches;
}

/**
 * Extract workflow steps
 */
function extractWorkflowSteps(section) {
  const steps = [];

  for (const sub of section.subsections || []) {
    // Match numbered steps like "1. Feature Development"
    const stepMatch = sub.title.match(/^\d+\.\s*(.+)/);
    if (stepMatch) {
      steps.push({
        step: stepMatch[1].trim(),
        content: sub.content?.join('\n') || ''
      });
    }
  }

  return steps;
}

/**
 * Convert string to kebab-case
 */
function toKebabCase(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
