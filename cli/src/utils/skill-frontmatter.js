/**
 * Skill frontmatter: parse a SKILL.md's YAML header and rebuild a file with merged fields.
 *
 * Why this is its own file: `scripts/generate-adoption-skills.mjs` (run by the "Self-Adoption Skill Drift
 * Gate" and by `scripts/bump-version.mjs`) needs exactly these two functions, and those CI jobs install no CLI
 * packages. They used to be exported from skills-installer.js, so importing them also loaded `chalk` and the
 * rest of the installer; when XSPEC-468 made the installer import `chalk`, both jobs failed with
 * ERR_MODULE_NOT_FOUND. A module a root script reaches must import Node built-ins only — enforced by
 * cli/tests/e2e/root-scripts-need-no-cli-packages.test.js.
 */

/**
 * Parse YAML frontmatter from a markdown file content.
 * Handles multi-line values (e.g., `description: |`).
 * @param {string} content - File content with YAML frontmatter
 * @returns {{ frontmatter: Object, body: string } | null} Parsed result or null if no frontmatter
 */
export function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return null;

  const [, yamlText, body] = match;
  const frontmatter = {};

  const lines = yamlText.split('\n');
  let currentKey = null;
  let currentValue = '';
  let isMultiline = false;

  for (const line of lines) {
    if (isMultiline) {
      // Multi-line value: lines starting with spaces belong to current key
      if (line.match(/^\s/) || line === '') {
        currentValue += (currentValue ? '\n' : '') + line;
        continue;
      } else {
        // End of multi-line value
        frontmatter[currentKey] = currentValue.trimEnd();
        isMultiline = false;
      }
    }

    const keyMatch = line.match(/^([a-zA-Z_-]+):\s*(.*)$/);
    if (keyMatch) {
      currentKey = keyMatch[1];
      const value = keyMatch[2].trim();

      if (value === '|' || value === '>') {
        // Start of multi-line value
        isMultiline = true;
        currentValue = '';
      } else {
        frontmatter[currentKey] = value;
      }
    }
  }

  // Flush last multi-line value
  if (isMultiline && currentKey) {
    frontmatter[currentKey] = currentValue.trimEnd();
  }

  return { frontmatter, body };
}

/**
 * Rebuild file content with updated frontmatter fields.
 * Preserves existing frontmatter fields and adds/overrides with provided fields.
 * @param {string} content - Original file content
 * @param {Object} fieldsToMerge - Fields to add or override in frontmatter
 * @returns {string} Rebuilt content
 */
export function rebuildWithFrontmatter(content, fieldsToMerge) {
  const parsed = parseFrontmatter(content);
  if (!parsed) {
    // No existing frontmatter — create one
    const lines = ['---'];
    for (const [key, value] of Object.entries(fieldsToMerge)) {
      lines.push(`${key}: ${value}`);
    }
    lines.push('---');
    return lines.join('\n') + '\n' + content;
  }

  const merged = { ...parsed.frontmatter, ...fieldsToMerge };

  const lines = ['---'];
  for (const [key, value] of Object.entries(merged)) {
    if (value && value.includes('\n')) {
      // Multi-line value
      lines.push(`${key}: |`);
      for (const vline of value.split('\n')) {
        lines.push(vline);
      }
    } else {
      lines.push(`${key}: ${value}`);
    }
  }
  lines.push('---');

  return lines.join('\n') + '\n' + parsed.body;
}
