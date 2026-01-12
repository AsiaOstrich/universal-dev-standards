/**
 * YAML Generator for AI-YAML Conversion
 *
 * Generates AI-optimized YAML from parsed Markdown structure.
 */

import { SECTION_MAPPINGS, STANDARD_ID_MAPPING } from './conversion-rules.js';

/**
 * Generate AI-YAML structure from parsed Markdown
 * @param {Object} parsed - Parsed Markdown structure from md-parser
 * @param {Object} options - Generation options
 * @returns {Object} AI-YAML structure
 */
export function generateAiYaml(parsed, options = {}) {
  const { filename = '', locale = null } = options;

  // Generate ID
  const id = generateStandardId(filename, parsed.metadata.title);

  // Build YAML structure
  const yaml = {
    id,
    meta: {
      version: parsed.metadata.version || '1.0.0',
      updated: parsed.metadata.updated || new Date().toISOString().split('T')[0],
      source: inferSourcePath(filename, locale),
      description: parsed.purpose || parsed.metadata.title || ''
    }
  };

  // Add language if locale specified
  if (locale) {
    yaml.meta.language = locale;
  }

  // Process sections to extract structured content
  const structuredContent = processStructuredContent(parsed);

  // Merge structured content
  Object.assign(yaml, structuredContent);

  // Generate rules from content
  const rules = generateRules(parsed);
  if (rules.length > 0) {
    yaml.rules = rules;
  }

  // Generate quick reference from tables
  const quickRef = generateQuickReference(parsed);
  if (Object.keys(quickRef).length > 0) {
    yaml.quick_reference = quickRef;
  }

  // Process decision points into options structure
  const decisionsAndOptions = processDecisions(parsed);
  if (decisionsAndOptions.decision) {
    yaml.decision = decisionsAndOptions.decision;
  }
  if (decisionsAndOptions.options) {
    yaml.options = decisionsAndOptions.options;
  }

  return yaml;
}

/**
 * Generate standard ID from filename or title
 */
function generateStandardId(filename, _title) {
  // Check mapping first
  const cleanName = filename.replace(/\.md$/, '');
  if (STANDARD_ID_MAPPING[cleanName]) {
    return STANDARD_ID_MAPPING[cleanName];
  }

  // Generate from filename (title reserved for future use)
  let id = cleanName
    .toLowerCase()
    .replace(/-?(guide|standards|standard|checklist)$/i, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  return id || 'unknown';
}

/**
 * Infer source path
 */
function inferSourcePath(filename, locale) {
  const cleanName = filename || 'unknown.md';

  if (locale) {
    return `locales/${locale}/core/${cleanName}`;
  }

  return `core/${cleanName}`;
}

/**
 * Process sections into structured content
 */
function processStructuredContent(parsed) {
  const content = {};

  for (const section of parsed.sections) {
    const sectionKey = getSectionKey(section.name);

    // Skip metadata sections
    if (['version-history', 'references', 'license', 'related-standards'].includes(section.type)) {
      continue;
    }

    // Skip purpose (already in meta.description)
    if (section.type === 'purpose') {
      continue;
    }

    // Process based on section type
    if (section.type === 'table-content' && section.subsections.length === 0) {
      // Simple table section - will be in quick_reference
      continue;
    }

    // Handle sections with subsections
    if (section.subsections.length > 0) {
      const sectionData = {};

      for (const sub of section.subsections) {
        const subKey = toKebabCase(sub.name);
        sectionData[subKey] = extractSubsectionContent(sub);
      }

      if (Object.keys(sectionData).length > 0) {
        content[sectionKey] = sectionData;
      }
    }
  }

  return content;
}

/**
 * Get YAML key for a section
 */
function getSectionKey(sectionName) {
  // Check custom mappings
  if (SECTION_MAPPINGS[sectionName]) {
    return SECTION_MAPPINGS[sectionName];
  }

  return toKebabCase(sectionName);
}

/**
 * Convert string to kebab-case
 */
function toKebabCase(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Extract content from a subsection
 */
function extractSubsectionContent(subsection) {
  const content = subsection.content;

  // Check if it's primarily a list
  const listItems = content.match(/^[-*]\s+(.+)$/gm);
  if (listItems && listItems.length > 2) {
    return listItems.map(item => item.replace(/^[-*]\s+/, '').trim());
  }

  // Check if it's a code block
  const codeMatch = content.match(/```\w*\n([\s\S]*?)```/);
  if (codeMatch) {
    return codeMatch[1].trim();
  }

  // Return as text (truncated if too long)
  const text = content.replace(/\n+/g, ' ').trim();
  return text.length > 200 ? text.substring(0, 200) + '...' : text;
}

/**
 * Generate rules from parsed content
 */
function generateRules(parsed) {
  const rules = [];
  let ruleIndex = 1;

  // Extract rules from sections with imperative language
  for (const section of parsed.sections) {
    const sectionRules = extractRulesFromSection(section, ruleIndex);
    rules.push(...sectionRules);
    ruleIndex += sectionRules.length;
  }

  // Deduplicate similar rules
  const uniqueRules = deduplicateRules(rules);

  return uniqueRules.slice(0, 15); // Limit to 15 rules
}

/**
 * Extract rules from a section
 */
function extractRulesFromSection(section, startIndex) {
  const rules = [];
  const content = section.content;

  // Pattern: bullet points with action words
  const bulletPatterns = [
    { regex: /^[-*]\s+(?:\*\*)?([A-Z][^:.\n]{10,60})(?:\*\*)?[:.]/gm, priority: 'required' },
    { regex: /^[-*]\s+Must\s+([^.\n]{10,60})/gim, priority: 'required' },
    { regex: /^[-*]\s+Should\s+([^.\n]{10,60})/gim, priority: 'recommended' },
    { regex: /^[-*]\s+Always\s+([^.\n]{10,60})/gim, priority: 'required' },
    { regex: /^[-*]\s+Never\s+([^.\n]{10,60})/gim, priority: 'required' }
  ];

  for (const pattern of bulletPatterns) {
    const matches = [...content.matchAll(pattern.regex)];
    for (const match of matches) {
      const instruction = match[1].trim();
      if (instruction.length > 10 && instruction.length < 100) {
        const ruleId = `${toKebabCase(section.name)}-${startIndex + rules.length}`;
        rules.push({
          id: ruleId,
          trigger: inferTrigger(section.name),
          instruction: cleanInstruction(instruction),
          priority: pattern.priority
        });
      }
    }
  }

  return rules;
}

/**
 * Infer trigger from section name
 */
function inferTrigger(sectionName) {
  const nameLower = sectionName.toLowerCase();

  if (nameLower.includes('commit')) return 'writing commit message';
  if (nameLower.includes('scope')) return 'specifying scope';
  if (nameLower.includes('subject')) return 'writing subject line';
  if (nameLower.includes('body')) return 'writing commit body';
  if (nameLower.includes('footer')) return 'adding footer';
  if (nameLower.includes('type')) return 'choosing type';
  if (nameLower.includes('format')) return 'formatting';
  if (nameLower.includes('test')) return 'writing tests';
  if (nameLower.includes('review')) return 'reviewing code';
  if (nameLower.includes('branch')) return 'working with branches';

  return 'applying this standard';
}

/**
 * Clean instruction text
 */
function cleanInstruction(text) {
  return text
    .replace(/\*\*/g, '')
    .replace(/`/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Deduplicate similar rules
 */
function deduplicateRules(rules) {
  const seen = new Set();
  const unique = [];

  for (const rule of rules) {
    const normalized = rule.instruction.toLowerCase().substring(0, 30);
    if (!seen.has(normalized)) {
      seen.add(normalized);
      unique.push(rule);
    }
  }

  return unique;
}

/**
 * Generate quick reference from tables
 */
function generateQuickReference(parsed) {
  const quickRef = {};

  for (const table of parsed.tables) {
    if (table.headers.length < 2 || table.rows.length < 1) {
      continue;
    }

    // Generate table key from context or headers
    const tableKey = generateTableKey(table);

    quickRef[tableKey] = {
      columns: table.headers,
      rows: table.rows
    };
  }

  return quickRef;
}

/**
 * Generate a key for a table
 */
function generateTableKey(table) {
  // Use context if available
  if (table.context) {
    return toKebabCase(table.context);
  }

  // Use first header
  if (table.headers[0]) {
    return toKebabCase(table.headers[0]) + '-table';
  }

  return 'reference-table';
}

/**
 * Process decision points into options structure
 */
function processDecisions(parsed) {
  const result = {};

  if (parsed.decisionPoints.length === 0) {
    return result;
  }

  // Find option sections
  const optionDecision = parsed.decisionPoints.find(d => d.type === 'options');
  if (optionDecision) {
    result.decision = {
      question: 'Which option best fits your project?',
      matrix: optionDecision.options.map(opt => ({
        answer: opt.label,
        select: toKebabCase(opt.label)
      }))
    };

    // Generate options structure
    const optionCategory = inferOptionCategory(parsed.metadata.title);
    result.options = {
      [optionCategory]: {
        default: toKebabCase(optionDecision.options[0]?.label || 'default'),
        choices: optionDecision.options.map(opt => ({
          id: toKebabCase(opt.label),
          file: `options/${optionCategory}/${toKebabCase(opt.label)}.ai.yaml`
        }))
      }
    };
  }

  return result;
}

/**
 * Infer option category from title
 */
function inferOptionCategory(title) {
  const titleLower = title?.toLowerCase() || '';

  if (titleLower.includes('commit')) return 'commit_language';
  if (titleLower.includes('test')) return 'testing_approach';
  if (titleLower.includes('git')) return 'git_workflow';
  if (titleLower.includes('changelog')) return 'changelog_format';
  if (titleLower.includes('review')) return 'review_style';

  return 'default_option';
}

/**
 * Convert YAML object to formatted string
 * @param {Object} obj - YAML object
 * @returns {string} Formatted YAML string
 */
export function toYamlString(obj) {
  const lines = [];

  // Add header comment
  if (obj.meta?.source) {
    const title = obj.id || 'Standard';
    lines.push(`# ${title.charAt(0).toUpperCase() + title.slice(1).replace(/-/g, ' ')} - AI Optimized`);
    lines.push(`# Source: ${obj.meta.source}`);
    lines.push('');
  }

  // Serialize object
  serializeObject(obj, lines, 0);

  return lines.join('\n');
}

/**
 * Serialize a YAML value to string
 */
function serializeScalar(value, indent) {
  if (value === null || value === undefined) {
    return 'null';
  }

  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }

  if (typeof value === 'number') {
    return String(value);
  }

  if (typeof value === 'string') {
    // Check if multiline
    if (value.includes('\n')) {
      const prefix = '  '.repeat(indent + 1);
      return '|\n' + value.split('\n').map(line => prefix + line).join('\n');
    }

    // Check if needs quoting
    if (value === '' ||
        value.match(/^[\s]|[\s]$/) ||
        value.match(/^[#&*!|>'"%@`]/) ||
        value.match(/[:#{}[\],&*?|<>=!%@`]/) ||
        value.match(/^(true|false|null|yes|no|on|off)$/i) ||
        value.match(/^\d/)) {
      return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
    }

    return value;
  }

  return String(value);
}

/**
 * Serialize an object to YAML lines
 */
function serializeObject(obj, lines, indent) {
  const prefix = '  '.repeat(indent);

  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) {
      continue;
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        lines.push(`${prefix}${key}: []`);
      } else if (isSimpleArray(value)) {
        // Inline simple arrays
        const items = value.map(v => serializeScalar(v, indent));
        lines.push(`${prefix}${key}: [${items.join(', ')}]`);
      } else {
        // Block array
        lines.push(`${prefix}${key}:`);
        for (const item of value) {
          serializeArrayItem(item, lines, indent + 1);
        }
      }
    } else if (typeof value === 'object') {
      lines.push(`${prefix}${key}:`);
      serializeObject(value, lines, indent + 1);
    } else {
      lines.push(`${prefix}${key}: ${serializeScalar(value, indent)}`);
    }
  }
}

/**
 * Serialize an array item
 */
function serializeArrayItem(item, lines, indent) {
  const prefix = '  '.repeat(indent);

  if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
    const entries = Object.entries(item);
    if (entries.length === 0) {
      lines.push(`${prefix}- {}`);
      return;
    }

    // First key on same line as dash
    const [firstKey, firstVal] = entries[0];
    if (typeof firstVal === 'object' && firstVal !== null) {
      lines.push(`${prefix}- ${firstKey}:`);
      if (Array.isArray(firstVal)) {
        for (const subItem of firstVal) {
          serializeArrayItem(subItem, lines, indent + 2);
        }
      } else {
        serializeObject(firstVal, lines, indent + 2);
      }
    } else {
      lines.push(`${prefix}- ${firstKey}: ${serializeScalar(firstVal, indent)}`);
    }

    // Rest of keys indented
    for (let i = 1; i < entries.length; i++) {
      const [key, val] = entries[i];
      if (typeof val === 'object' && val !== null) {
        lines.push(`${prefix}  ${key}:`);
        if (Array.isArray(val)) {
          for (const subItem of val) {
            serializeArrayItem(subItem, lines, indent + 2);
          }
        } else {
          serializeObject(val, lines, indent + 2);
        }
      } else {
        lines.push(`${prefix}  ${key}: ${serializeScalar(val, indent + 1)}`);
      }
    }
  } else {
    lines.push(`${prefix}- ${serializeScalar(item, indent)}`);
  }
}

/**
 * Check if array contains only simple values
 */
function isSimpleArray(arr) {
  return arr.length <= 5 && arr.every(v =>
    (typeof v === 'string' && v.length < 50 && !v.includes('\n')) ||
    typeof v === 'number' ||
    typeof v === 'boolean'
  );
}

/**
 * Extract manual sections from existing YAML content
 * @param {string} content - Existing YAML content
 * @returns {Object} Extracted sections
 */
export function extractManualSections(content) {
  const result = {
    hasManualSections: false,
    manualContent: ''
  };

  const manualMatch = content.match(/# MANUAL ADDITIONS START\s*([\s\S]*?)# MANUAL ADDITIONS END/);
  if (manualMatch) {
    result.hasManualSections = true;
    result.manualContent = manualMatch[1].trim();
  }

  return result;
}

/**
 * Merge manual sections into generated YAML
 */
export function mergeManualSections(generatedYaml, manualContent) {
  if (!manualContent) {
    return generatedYaml;
  }

  // Add markers and manual content at the end
  return `${generatedYaml}

# MANUAL ADDITIONS START
# Add custom rules below this line
${manualContent}
# MANUAL ADDITIONS END
`;
}
