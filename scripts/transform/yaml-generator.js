/**
 * YAML Generator for Universal Dev Standards
 *
 * Generates token-optimized YAML from parsed Markdown structure.
 * Uses the format combining Gemini's rules structure with
 * our options and workflow extensions.
 */

/**
 * Generate YAML from parsed Markdown structure
 * @param {Object} parsed - Parsed Markdown structure
 * @param {Object} options - Generation options
 * @returns {string} YAML content
 */
export function generateYaml(parsed, options = {}) {
  const {
    excludeOptions = false,
    isOption = false,
    parent = null,
    optionId = null
  } = options;

  const lines = [];

  // Add header comment
  lines.push('# Auto-generated from Markdown - Do not edit directly');
  lines.push('# Source: ' + parsed.meta.source);
  lines.push('');

  // Generate ID
  if (isOption) {
    lines.push(`id: ${optionId}`);
  } else {
    lines.push(`id: ${parsed.meta.id}`);
  }

  // Generate meta section
  lines.push('meta:');
  if (isOption && parent) {
    lines.push(`  parent: ${parent}`);
  }
  lines.push(`  version: "${parsed.meta.version}"`);
  lines.push(`  updated: "${parsed.meta.updated}"`);
  if (!isOption) {
    lines.push(`  source: ${parsed.meta.source}`);
  }
  if (parsed.meta.description) {
    lines.push(`  description: ${yamlString(parsed.meta.description)}`);
  }
  lines.push('');

  // Generate decision tree if present and not an option file
  if (parsed.decisionTree && !isOption && !excludeOptions) {
    lines.push('decision:');
    lines.push(`  question: ${yamlString(parsed.decisionTree.question)}`);
    lines.push('  matrix:');
    for (const item of parsed.decisionTree.matrix) {
      lines.push(`    - factor: ${yamlString(item.factor)}`);
      for (const [optionName, value] of Object.entries(item.options)) {
        lines.push(`      ${toSnakeCase(optionName)}: ${yamlString(value)}`);
      }
    }
    lines.push('');
  }

  // Generate rules section
  if (parsed.rules.length > 0) {
    lines.push('rules:');
    const seenRules = new Set();

    for (const rule of parsed.rules) {
      // Skip duplicate rules
      if (seenRules.has(rule.id)) continue;
      seenRules.add(rule.id);

      lines.push(`  - id: ${rule.id}`);
      lines.push(`    trigger: ${yamlString(rule.trigger)}`);
      lines.push(`    instruction: ${yamlString(rule.instruction)}`);
      lines.push(`    priority: ${rule.priority}`);

      // Add examples if available
      const relatedExamples = findRelatedExamples(parsed.examples, rule);
      if (relatedExamples.good.length > 0 || relatedExamples.bad.length > 0) {
        lines.push('    examples:');
        if (relatedExamples.good.length > 0) {
          lines.push('      good:');
          for (const ex of relatedExamples.good.slice(0, 2)) {
            lines.push(`        - ${yamlMultilineString(ex.code, 10)}`);
          }
        }
        if (relatedExamples.bad.length > 0) {
          lines.push('      bad:');
          for (const ex of relatedExamples.bad.slice(0, 2)) {
            lines.push(`        - ${yamlMultilineString(ex.code, 10)}`);
          }
        }
      }
      lines.push('');
    }
  }

  // Generate tables as quick_reference
  const significantTables = parsed.tables.filter(t => t.rows.length > 1);
  if (significantTables.length > 0) {
    lines.push('quick_reference:');
    for (const table of significantTables.slice(0, 3)) {
      const tableName = toSnakeCase(table.section || 'reference');
      lines.push(`  ${tableName}:`);
      lines.push(`    columns: [${table.headers.map(h => yamlString(h)).join(', ')}]`);
      lines.push('    rows:');
      for (const row of table.rows.slice(0, 10)) {
        const values = table.headers.map(h => yamlString(row[h] || ''));
        lines.push(`      - [${values.join(', ')}]`);
      }
    }
    lines.push('');
  }

  // Generate workflow steps if present
  const workflowSection = parsed.sections.find(s =>
    s.title.toLowerCase().includes('workflow') ||
    s.title.toLowerCase().includes('steps')
  );

  if (workflowSection && workflowSection.subsections.length > 0) {
    lines.push('workflow:');
    for (const step of workflowSection.subsections) {
      const stepName = step.title.replace(/^\d+\.\s*/, '');
      lines.push(`  - step: ${yamlString(stepName)}`);

      // Extract commands from code blocks in this subsection
      const commands = parsed.examples.filter(ex =>
        ex.section === workflowSection.title &&
        ex.language === 'bash'
      );

      if (commands.length > 0) {
        lines.push('    commands:');
        const cmdLines = commands[0].code.split('\n').filter(l =>
          l.trim() && !l.startsWith('#')
        );
        for (const cmd of cmdLines.slice(0, 5)) {
          lines.push(`      - ${yamlString(cmd.trim())}`);
        }
      }
    }
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Convert string to YAML safe format
 */
function yamlString(str) {
  if (!str) return '""';
  str = String(str).trim();

  // Check if string needs quoting
  const needsQuotes = /[:#\[\]{}|>&*!?@`'"]/.test(str) ||
    str.includes('\n') ||
    str.startsWith('-') ||
    str.startsWith(' ') ||
    /^\d/.test(str);

  if (needsQuotes) {
    // Use double quotes and escape
    return '"' + str.replace(/"/g, '\\"').replace(/\n/g, '\\n') + '"';
  }

  return str;
}

/**
 * Convert multiline string to YAML format
 */
function yamlMultilineString(str, indent = 0) {
  if (!str) return '""';

  const lines = str.split('\n');
  if (lines.length === 1) {
    return yamlString(str);
  }

  // Use literal block scalar for multiline
  const indentStr = ' '.repeat(indent);
  return '|\n' + lines.map(l => indentStr + l).join('\n');
}

/**
 * Convert string to snake_case
 */
function toSnakeCase(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

/**
 * Find examples related to a rule
 */
function findRelatedExamples(examples, rule) {
  const result = { good: [], bad: [] };

  for (const ex of examples) {
    // Match by section
    if (ex.section === rule.section || ex.subsection === rule.subsection) {
      if (ex.type === 'good') {
        result.good.push(ex);
      } else if (ex.type === 'bad') {
        result.bad.push(ex);
      }
    }
  }

  return result;
}
