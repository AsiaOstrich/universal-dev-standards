/**
 * Layered CLAUDE.md Generator
 *
 * Generates subdirectory CLAUDE.md files based on directory-to-standard mappings.
 * Root CLAUDE.md gets a minimal summary; subdirectories get domain-specific full content.
 *
 * @module generators/layered-claudemd
 * @see docs/specs/SPEC-LAYERED-001-layered-claudemd.md (REQ-2)
 */

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { mapStandardsToDirectories } from '../utils/directory-mapper.js';

const UDS_BEGIN = '<!-- UDS:STANDARDS:BEGIN -->';
const UDS_END = '<!-- UDS:STANDARDS:END -->';

/**
 * Replace content between UDS markers, preserving content outside markers.
 * @param {string} existing - Existing file content
 * @param {string} newUdsContent - New UDS content to insert between markers
 * @returns {string} Updated content
 */
function replaceUdsBlock(existing, newUdsContent) {
  const beginIdx = existing.indexOf(UDS_BEGIN);
  const endIdx = existing.indexOf(UDS_END);

  if (beginIdx === -1 || endIdx === -1) {
    // No markers found — append UDS block
    return existing + '\n\n' + wrapWithMarkers(newUdsContent);
  }

  const before = existing.substring(0, beginIdx);
  const after = existing.substring(endIdx + UDS_END.length);
  return before + wrapWithMarkers(newUdsContent) + after;
}

/**
 * Wrap content with UDS markers.
 * @param {string} content
 * @returns {string}
 */
function wrapWithMarkers(content) {
  return `${UDS_BEGIN}\n${content}\n${UDS_END}`;
}

/**
 * Generate a subdirectory CLAUDE.md content for matched standards.
 * @param {string} standardId - The standard identifier
 * @param {string} dirPath - The relative directory path
 * @returns {string}
 */
function generateSubdirContent(standardId, dirPath) {
  return [
    `# ${dirPath} — UDS Standards`,
    '',
    `This directory follows the **${standardId}** standard.`,
    '',
    'Standards loaded via UDS layered CLAUDE.md.',
    'See root CLAUDE.md for project-wide standards.',
  ].join('\n');
}

/**
 * Generate root CLAUDE.md content for layered mode (minimal summary).
 * @param {Object} mapping - The standards-to-directory mapping result
 * @returns {string}
 */
function generateRootContent(mapping) {
  const lines = [
    '# UDS Standards (Layered Mode)',
    '',
    'This project uses **layered CLAUDE.md** for context-aware standard loading.',
    'Domain-specific standards are in subdirectory CLAUDE.md files.',
    '',
    '## Subdirectory Standards',
    '',
  ];

  for (const [standardId, dirs] of Object.entries(mapping)) {
    if (standardId === '_root') continue;
    for (const dir of dirs) {
      lines.push(`- \`${dir}/\` — ${standardId}`);
    }
  }

  if (mapping._root && mapping._root.length > 0) {
    lines.push('', '## Root Standards', '');
    for (const std of mapping._root) {
      lines.push(`- ${std}`);
    }
  }

  return lines.join('\n');
}

/**
 * Generate layered CLAUDE.md files for a project.
 *
 * @param {string} projectPath - Project root path
 * @param {Object} [options] - Options
 * @param {boolean} [options.update] - If true, preserve user content outside UDS markers
 * @returns {{ mode: string, fallback: boolean, generatedFiles: string[] }}
 */
export function generateLayeredClaudeMd(projectPath, options = {}) {
  const mapping = mapStandardsToDirectories(projectPath);

  // Check if any standards matched to subdirectories
  const mappedStandards = Object.keys(mapping).filter((k) => k !== '_root');
  if (mappedStandards.length === 0) {
    return { mode: 'flat', fallback: true, generatedFiles: [] };
  }

  const generatedFiles = [];

  // Generate subdirectory CLAUDE.md files
  for (const [standardId, dirs] of Object.entries(mapping)) {
    if (standardId === '_root') continue;

    for (const dir of dirs) {
      const dirFullPath = join(projectPath, dir);
      const claudePath = join(dirFullPath, 'CLAUDE.md');
      const udsContent = generateSubdirContent(standardId, dir);

      if (options.update && existsSync(claudePath)) {
        // Preserve user content outside markers
        const existing = readFileSync(claudePath, 'utf-8');
        const updated = replaceUdsBlock(existing, udsContent);
        writeFileSync(claudePath, updated);
      } else {
        writeFileSync(claudePath, wrapWithMarkers(udsContent) + '\n');
      }

      generatedFiles.push(claudePath);
    }
  }

  // Generate root CLAUDE.md
  const rootClaudePath = join(projectPath, 'CLAUDE.md');
  const rootContent = generateRootContent(mapping);

  if (options.update && existsSync(rootClaudePath)) {
    const existing = readFileSync(rootClaudePath, 'utf-8');
    const updated = replaceUdsBlock(existing, rootContent);
    writeFileSync(rootClaudePath, updated);
  } else {
    writeFileSync(rootClaudePath, wrapWithMarkers(rootContent) + '\n');
  }
  generatedFiles.push(rootClaudePath);

  return { mode: 'layered', fallback: false, generatedFiles };
}
