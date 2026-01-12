/**
 * Markdown Parser for AI-YAML Conversion
 *
 * Parses core standard Markdown files into a structured representation
 * that can be converted to AI-optimized YAML format.
 */

/**
 * Parse Markdown content into structured representation
 * @param {string} content - Raw Markdown content
 * @returns {Object} Parsed structure
 */
export function parseMarkdown(content) {
  const lines = content.split('\n');

  return {
    metadata: extractMetadata(lines),
    purpose: extractPurpose(content),
    sections: extractSections(content),
    tables: extractTables(content),
    codeBlocks: extractCodeBlocks(content),
    decisionPoints: extractDecisionPoints(content),
    relatedStandards: extractRelatedStandards(content),
    versionHistory: extractVersionHistory(content)
  };
}

/**
 * Extract metadata from the header lines
 * Format expected:
 *   Line 1: # Title
 *   Line 3: > **Language**: English | [繁體中文](...)
 *   Line 5: **Version**: X.Y.Z
 *   Line 6: **Last Updated**: YYYY-MM-DD
 *   Line 7: **Applicability**: ...
 */
function extractMetadata(lines) {
  const metadata = {
    title: '',
    version: '',
    updated: '',
    applicability: '',
    languageLink: null
  };

  for (let i = 0; i < Math.min(lines.length, 15); i++) {
    const line = lines[i];

    // Title: # Title
    if (line.startsWith('# ') && !metadata.title) {
      metadata.title = line.substring(2).trim();
    }

    // Language link: > **Language**: English | [繁體中文](...)
    const langMatch = line.match(/>\s*\*\*Language\*\*:\s*(.+)/);
    if (langMatch) {
      const linkMatch = langMatch[1].match(/\[(.+?)\]\((.+?)\)/);
      if (linkMatch) {
        metadata.languageLink = {
          text: linkMatch[1],
          path: linkMatch[2]
        };
      }
    }

    // Version: **Version**: X.Y.Z
    const versionMatch = line.match(/\*\*Version\*\*:\s*(.+)/);
    if (versionMatch) {
      metadata.version = versionMatch[1].trim();
    }

    // Last Updated: **Last Updated**: YYYY-MM-DD
    const updatedMatch = line.match(/\*\*Last Updated\*\*:\s*(.+)/);
    if (updatedMatch) {
      metadata.updated = updatedMatch[1].trim();
    }

    // Applicability: **Applicability**: ...
    const applicabilityMatch = line.match(/\*\*Applicability\*\*:\s*(.+)/);
    if (applicabilityMatch) {
      metadata.applicability = applicabilityMatch[1].trim();
    }
  }

  return metadata;
}

/**
 * Extract the Purpose section content
 */
function extractPurpose(content) {
  const purposeMatch = content.match(/## Purpose\s*\n+([\s\S]*?)(?=\n---|\n## )/);
  if (purposeMatch) {
    return purposeMatch[1].trim();
  }
  return '';
}

/**
 * Extract all ## sections with their content
 */
function extractSections(content) {
  const sections = [];
  const sectionRegex = /^## (.+)$/gm;
  const matches = [...content.matchAll(sectionRegex)];

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const name = match[1].trim();
    const startIdx = match.index + match[0].length;
    const endIdx = matches[i + 1] ? matches[i + 1].index : content.length;

    let sectionContent = content.substring(startIdx, endIdx).trim();

    // Remove leading --- if present
    sectionContent = sectionContent.replace(/^---\s*/, '').trim();

    // Classify section type
    const type = classifySectionType(name, sectionContent);

    sections.push({
      name,
      content: sectionContent,
      type,
      subsections: extractSubsections(sectionContent)
    });
  }

  return sections;
}

/**
 * Extract ### subsections from section content
 */
function extractSubsections(content) {
  const subsections = [];
  const subRegex = /^### (.+)$/gm;
  const matches = [...content.matchAll(subRegex)];

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const name = match[1].trim();
    const startIdx = match.index + match[0].length;
    const endIdx = matches[i + 1] ? matches[i + 1].index : content.length;

    subsections.push({
      name,
      content: content.substring(startIdx, endIdx).trim()
    });
  }

  return subsections;
}

/**
 * Classify section type based on name and content
 */
function classifySectionType(name, content) {
  const nameLower = name.toLowerCase();

  if (nameLower === 'purpose') return 'purpose';
  if (nameLower.includes('version history')) return 'version-history';
  if (nameLower.includes('related standards')) return 'related-standards';
  if (nameLower.includes('references')) return 'references';
  if (nameLower === 'license') return 'license';
  if (nameLower.includes('anti-pattern')) return 'anti-patterns';
  if (nameLower.includes('example')) return 'examples';
  if (nameLower.includes('configuration') || nameLower.includes('template')) return 'configuration';

  // Check content for table presence
  if (content.includes('| ') && content.includes(' |')) {
    return 'table-content';
  }

  // Check for decision points
  if (content.includes('PROJECT MUST CHOOSE') || content.includes('MUST CHOOSE ONE')) {
    return 'decision-point';
  }

  return 'content';
}

/**
 * Extract all tables from content
 */
function extractTables(content) {
  const tables = [];
  // Match tables with header, separator, and rows
  const tableRegex = /(?:^|\n)((?:\|[^\n]+\|\n)+)/g;
  const matches = [...content.matchAll(tableRegex)];

  for (const match of matches) {
    const tableContent = match[1].trim();
    const lines = tableContent.split('\n').filter(l => l.trim());

    if (lines.length < 2) continue;

    // Parse header
    const headerLine = lines[0];
    const headers = parseTableRow(headerLine);

    // Skip separator line (|---|---|)
    const dataStartIdx = lines[1].includes('---') ? 2 : 1;

    // Parse data rows
    const rows = [];
    for (let i = dataStartIdx; i < lines.length; i++) {
      const row = parseTableRow(lines[i]);
      if (row.length > 0) {
        rows.push(row);
      }
    }

    // Try to find table context (previous heading or text)
    const tableStart = match.index;
    const precedingContent = content.substring(Math.max(0, tableStart - 200), tableStart);
    const contextMatch = precedingContent.match(/###?\s+([^\n]+)\s*$/);
    const context = contextMatch ? contextMatch[1].trim() : '';

    tables.push({
      headers,
      rows,
      context,
      raw: tableContent
    });
  }

  return tables;
}

/**
 * Parse a single table row
 */
function parseTableRow(line) {
  return line
    .split('|')
    .map(cell => cell.trim())
    .filter(cell => cell && !cell.match(/^-+$/));
}

/**
 * Extract code blocks from content
 */
function extractCodeBlocks(content) {
  const codeBlocks = [];
  const codeRegex = /```(\w*)\n([\s\S]*?)```/g;
  const matches = [...content.matchAll(codeRegex)];

  for (const match of matches) {
    const lang = match[1] || 'text';
    const code = match[2].trim();

    // Find context (preceding text)
    const blockStart = match.index;
    const precedingContent = content.substring(Math.max(0, blockStart - 300), blockStart);
    const contextMatch = precedingContent.match(/(?:^|\n)([^\n]+)\s*$/);
    const context = contextMatch ? contextMatch[1].trim() : '';

    codeBlocks.push({
      lang,
      content: code,
      context
    });
  }

  return codeBlocks;
}

/**
 * Extract decision points (PROJECT MUST CHOOSE patterns)
 */
function extractDecisionPoints(content) {
  const decisions = [];

  // Pattern: PROJECT MUST CHOOSE ONE
  const chooseOneRegex = /PROJECT MUST CHOOSE ONE\s+([A-Z]+)\s*/gi;
  const matches = [...content.matchAll(chooseOneRegex)];

  for (const match of matches) {
    const topic = match[1].toLowerCase();
    decisions.push({
      type: 'choose-one',
      topic,
      context: extractContextAround(content, match.index)
    });
  }

  // Pattern: ### Option A: / ### Option B: / ### Option C:
  const optionSections = content.match(/### Option [A-C]:?\s+([^\n]+)/g);
  if (optionSections && optionSections.length > 0) {
    const options = optionSections.map(opt => {
      const match = opt.match(/### Option ([A-C]):?\s+(.+)/);
      return match ? { id: match[1], label: match[2].trim() } : null;
    }).filter(Boolean);

    if (options.length > 0) {
      decisions.push({
        type: 'options',
        options
      });
    }
  }

  return decisions;
}

/**
 * Extract context around a match position
 */
function extractContextAround(content, position) {
  const start = Math.max(0, position - 100);
  const end = Math.min(content.length, position + 200);
  return content.substring(start, end).trim();
}

/**
 * Extract Related Standards section
 */
function extractRelatedStandards(content) {
  const relatedMatch = content.match(/## Related Standards\s*\n+([\s\S]*?)(?=\n---|\n## )/);
  if (!relatedMatch) return [];

  const links = [];
  const linkRegex = /\[(.+?)\]\((.+?)\)/g;
  const matches = [...relatedMatch[1].matchAll(linkRegex)];

  for (const match of matches) {
    links.push({
      name: match[1],
      path: match[2]
    });
  }

  return links;
}

/**
 * Extract Version History table
 */
function extractVersionHistory(content) {
  const historyMatch = content.match(/## Version History\s*\n+([\s\S]*?)(?=\n---|\n## |$)/);
  if (!historyMatch) return [];

  const tableContent = historyMatch[1];
  const lines = tableContent.split('\n').filter(l => l.includes('|'));

  if (lines.length < 3) return []; // Need header, separator, at least one row

  const history = [];
  // Skip header and separator
  for (let i = 2; i < lines.length; i++) {
    const row = parseTableRow(lines[i]);
    if (row.length >= 3) {
      history.push({
        version: row[0],
        date: row[1],
        changes: row[2]
      });
    }
  }

  return history;
}

/**
 * Extract rules from content based on imperative patterns
 * Finds statements with MUST, SHOULD, etc.
 */
export function extractRules(content) {
  const rules = [];

  // Pattern: statements containing MUST, SHOULD, CRITICAL, IMPORTANT
  const rulePatterns = [
    { regex: /\*\*CRITICAL\*\*:?\s*([^.\n]+)/gi, priority: 'required' },
    { regex: /\*\*IMPORTANT\*\*:?\s*([^.\n]+)/gi, priority: 'required' },
    { regex: /(?:^|\n)\s*-\s*MUST\s+([^.\n]+)/gi, priority: 'required' },
    { regex: /(?:^|\n)\s*-\s*SHOULD\s+([^.\n]+)/gi, priority: 'recommended' },
    { regex: /(?:^|\n)\s*-\s*Always\s+([^.\n]+)/gi, priority: 'required' },
    { regex: /(?:^|\n)\s*-\s*Never\s+([^.\n]+)/gi, priority: 'required' }
  ];

  for (const pattern of rulePatterns) {
    const matches = [...content.matchAll(pattern.regex)];
    for (const match of matches) {
      const instruction = match[1].trim();
      if (instruction.length > 10) { // Filter out too short matches
        rules.push({
          instruction,
          priority: pattern.priority,
          source: match[0].trim().substring(0, 50)
        });
      }
    }
  }

  return rules;
}

/**
 * Generate a kebab-case ID from filename or title
 */
export function generateId(filename) {
  // Remove .md extension
  let id = filename.replace(/\.md$/, '');

  // Remove common suffixes
  id = id.replace(/-?(guide|standards|standard|checklist)$/i, '');

  // Convert to kebab-case
  id = id
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  return id;
}

/**
 * Infer the source path for a standard
 */
export function inferSourcePath(filename, locale = null) {
  const cleanName = filename.replace(/\.md$/, '.md');

  if (locale) {
    return `locales/${locale}/core/${cleanName}`;
  }

  return `core/${cleanName}`;
}
