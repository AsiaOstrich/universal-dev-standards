/**
 * Markdown Parser for Universal Dev Standards
 *
 * Parses Markdown files and extracts structured data including:
 * - Metadata (version, updated, description)
 * - Sections and subsections
 * - Rules (MUST, SHOULD, MAY patterns)
 * - Examples (good/bad code blocks)
 * - Tables
 * - Decision trees and matrices
 */

/**
 * Parse a Markdown file into structured data
 * @param {string} content - Markdown content
 * @param {string} filename - Source filename for metadata
 * @returns {Object} Parsed structure
 */
export function parseMarkdown(content, filename) {
  const lines = content.split('\n');

  const result = {
    meta: extractMetadata(lines, filename),
    sections: [],
    rules: [],
    examples: [],
    tables: [],
    decisionTree: null
  };

  let currentSection = null;
  let currentSubsection = null;
  let inCodeBlock = false;
  let codeBlockContent = [];
  let codeBlockLang = '';
  let codeBlockType = null; // 'good' or 'bad' or null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Track code blocks
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        // End of code block
        const example = {
          language: codeBlockLang,
          code: codeBlockContent.join('\n'),
          type: codeBlockType,
          section: currentSection?.title,
          subsection: currentSubsection?.title
        };
        result.examples.push(example);
        inCodeBlock = false;
        codeBlockContent = [];
        codeBlockType = null;
      } else {
        // Start of code block
        inCodeBlock = true;
        codeBlockLang = line.slice(3).trim();

        // Check if previous lines indicate good/bad example
        const prevLines = lines.slice(Math.max(0, i - 3), i).join('\n').toLowerCase();
        if (prevLines.includes('good') || prevLines.includes('correct') || prevLines.includes('recommended')) {
          codeBlockType = 'good';
        } else if (prevLines.includes('bad') || prevLines.includes('incorrect') || prevLines.includes('avoid')) {
          codeBlockType = 'bad';
        }
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      continue;
    }

    // Parse headers
    if (line.startsWith('# ')) {
      result.meta.title = line.slice(2).trim();
      continue;
    }

    if (line.startsWith('## ')) {
      currentSection = {
        title: line.slice(3).trim(),
        level: 2,
        content: [],
        subsections: []
      };
      result.sections.push(currentSection);
      currentSubsection = null;
      continue;
    }

    if (line.startsWith('### ')) {
      currentSubsection = {
        title: line.slice(4).trim(),
        level: 3,
        content: []
      };
      if (currentSection) {
        currentSection.subsections.push(currentSubsection);
      }
      continue;
    }

    // Extract rules (MUST, SHOULD, MAY patterns)
    const ruleMatch = extractRule(line, currentSection, currentSubsection);
    if (ruleMatch) {
      result.rules.push(ruleMatch);
    }

    // Extract tables
    if (line.startsWith('|') && lines[i + 1]?.includes('|---')) {
      const table = extractTable(lines, i);
      if (table) {
        result.tables.push({
          ...table,
          section: currentSection?.title,
          subsection: currentSubsection?.title
        });
        i += table.rowCount + 1; // Skip table rows
      }
      continue;
    }

    // Add content to current section/subsection
    if (currentSubsection) {
      currentSubsection.content.push(line);
    } else if (currentSection) {
      currentSection.content.push(line);
    }
  }

  // Extract decision tree if present
  result.decisionTree = extractDecisionTree(content);

  return result;
}

/**
 * Extract metadata from Markdown front matter or header
 */
function extractMetadata(lines, filename) {
  const meta = {
    id: filename
      .replace(/^.*\//, '')
      .replace(/\.md$/, '')
      .replace(/-guide$/, '')
      .replace(/-standards$/, ''),
    version: '1.0.0',
    updated: new Date().toISOString().split('T')[0],
    source: filename,
    description: ''
  };

  for (const line of lines.slice(0, 20)) {
    // Look for version
    const versionMatch = line.match(/\*\*Version\*\*:\s*(.+)/);
    if (versionMatch) {
      meta.version = versionMatch[1].trim();
    }

    // Look for date
    const dateMatch = line.match(/\*\*Last Updated\*\*:\s*(.+)/);
    if (dateMatch) {
      meta.updated = dateMatch[1].trim();
    }

    // Look for purpose/description section
    if (line.startsWith('## Purpose')) {
      const nextLineIdx = lines.indexOf(line) + 2;
      if (lines[nextLineIdx]) {
        meta.description = lines[nextLineIdx].trim();
      }
    }
  }

  return meta;
}

/**
 * Extract a rule from a line
 */
function extractRule(line, section, subsection) {
  // Match MUST, SHOULD, MAY patterns
  const mustMatch = line.match(/\bMUST\b\s+(.+)/i);
  const shouldMatch = line.match(/\bSHOULD\b\s+(.+)/i);
  const mayMatch = line.match(/\bMAY\b\s+(.+)/i);

  let priority = null;
  let instruction = null;

  if (mustMatch) {
    priority = 'required';
    instruction = mustMatch[1];
  } else if (shouldMatch) {
    priority = 'recommended';
    instruction = shouldMatch[1];
  } else if (mayMatch) {
    priority = 'optional';
    instruction = mayMatch[1];
  }

  if (!priority) return null;

  // Generate rule ID from content
  const id = instruction
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 30)
    .replace(/-$/, '');

  // Try to infer trigger from section context
  let trigger = 'always';
  if (section?.title) {
    trigger = `when ${section.title.toLowerCase()}`;
  }

  return {
    id,
    trigger,
    instruction: instruction.trim(),
    priority,
    section: section?.title,
    subsection: subsection?.title
  };
}

/**
 * Extract a table from lines
 */
function extractTable(lines, startIdx) {
  const headerLine = lines[startIdx];
  const separatorLine = lines[startIdx + 1];

  if (!headerLine || !separatorLine) return null;

  const headers = headerLine
    .split('|')
    .map(h => h.trim())
    .filter(h => h);

  const rows = [];
  let rowIdx = startIdx + 2;

  while (lines[rowIdx]?.startsWith('|')) {
    const cells = lines[rowIdx]
      .split('|')
      .map(c => c.trim())
      .filter(c => c);

    if (cells.length === headers.length) {
      const row = {};
      headers.forEach((h, i) => {
        row[h] = cells[i];
      });
      rows.push(row);
    }
    rowIdx++;
  }

  return {
    headers,
    rows,
    rowCount: rows.length
  };
}

/**
 * Extract decision tree from content
 */
function extractDecisionTree(content) {
  // Look for decision matrix section
  const matrixMatch = content.match(/### Selection Matrix[\s\S]*?\|[\s\S]*?(?=\n##|\n---|\Z)/);

  if (!matrixMatch) return null;

  const matrixContent = matrixMatch[0];
  const lines = matrixContent.split('\n');

  // Find the table
  const tableStart = lines.findIndex(l => l.startsWith('|'));
  if (tableStart === -1) return null;

  const table = extractTable(lines, tableStart);
  if (!table) return null;

  // Convert to decision matrix format
  return {
    question: 'Which workflow strategy should you choose?',
    matrix: table.rows.map(row => ({
      factor: row[table.headers[0]],
      options: table.headers.slice(1).reduce((acc, h) => {
        acc[h] = row[h];
        return acc;
      }, {})
    }))
  };
}
