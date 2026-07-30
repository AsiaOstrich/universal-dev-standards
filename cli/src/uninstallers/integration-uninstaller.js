import { existsSync, readFileSync, writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { extractMarkedContent } from '../utils/integration-generator.js';
import { SUPPORTED_AI_TOOLS } from '../core/constants.js';
import { resolveIntegrationFile } from '../core/constants.js';

/**
 * Get the format for a given integration file name
 * @param {string} fileName - Integration file name (e.g. 'CLAUDE.md', '.cursorrules')
 * @returns {string} Format identifier ('markdown', 'plaintext', 'yaml', 'json')
 */
function getFormatForFile(fileName) {
  for (const tool of Object.values(SUPPORTED_AI_TOOLS)) {
    if (tool.file === fileName) {
      return tool.format;
    }
  }
  // Default to markdown
  return 'markdown';
}

/**
 * Uninstall UDS content from integration files
 * @param {string} projectPath - Project root path
 * @param {Object} manifest - Parsed manifest object
 * @param {Object} options - { dryRun, interactive, promptFn, yes }
 *   promptFn(filePath, hasUserContent): Promise<'remove-block'|'delete-file'|'skip'>
 * @returns {Promise<Object>} { removed: string[], skipped: string[], errors: string[] }
 */
export async function uninstallIntegrations(projectPath, manifest, options = {}) {
  const { dryRun = false, interactive = false, promptFn = null } = options;
  const result = { removed: [], skipped: [], errors: [] };

  const integrations = manifest?.integrations || [];
  if (integrations.length === 0) {
    result.skipped.push('integrations (none recorded in manifest)');
    return result;
  }

  for (const entry of integrations) {
    // Accept both shapes: this uninstaller was written against file names,
    // while the reconciler reads the same field as tool keys. Normalising the
    // manifest to one shape fixes one consumer and breaks the other, so both
    // resolve through the shared helper instead. (XSPEC-343 R1)
    const fileName = resolveIntegrationFile(entry) || entry;
    const filePath = join(projectPath, fileName);

    if (!existsSync(filePath)) {
      result.skipped.push(`${fileName} (not found)`);
      continue;
    }

    try {
      const content = readFileSync(filePath, 'utf-8');
      const format = getFormatForFile(fileName);
      const parts = extractMarkedContent(content, format);

      // No UDS markers found
      if (!parts.content) {
        result.skipped.push(`${fileName} (no UDS markers found)`);
        continue;
      }

      const userContent = (parts.before.trim() + parts.after.trim()).trim();
      const hasUserContent = userContent.length > 0;

      if (dryRun) {
        if (hasUserContent) {
          result.removed.push(`${fileName} (remove UDS block, keep user content)`);
        } else {
          result.removed.push(`${fileName} (delete file)`);
        }
        continue;
      }

      if (!hasUserContent) {
        // 100% UDS-generated → delete entire file
        unlinkSync(filePath);
        result.removed.push(`${fileName} (deleted)`);
      } else if (interactive && promptFn) {
        // Ask user what to do
        const action = await promptFn(fileName, hasUserContent);
        if (action === 'delete-file') {
          unlinkSync(filePath);
          result.removed.push(`${fileName} (deleted)`);
        } else if (action === 'remove-block') {
          const cleaned = (parts.before + parts.after).trim() + '\n';
          writeFileSync(filePath, cleaned, 'utf-8');
          result.removed.push(`${fileName} (UDS block removed)`);
        } else {
          result.skipped.push(`${fileName} (user skipped)`);
        }
      } else {
        // Non-interactive (--yes): remove UDS block only, preserve user content
        const cleaned = (parts.before + parts.after).trim() + '\n';
        writeFileSync(filePath, cleaned, 'utf-8');
        result.removed.push(`${fileName} (UDS block removed)`);
      }
    } catch (error) {
      result.errors.push(`${fileName} — ${error.message}`);
    }
  }

  return result;
}
