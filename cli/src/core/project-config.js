/**
 * Project Command Contract — reads and validates uds.project.yaml
 * XSPEC-029
 */
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const CONFIG_FILENAME = 'uds.project.yaml';

/**
 * Parse uds.project.yaml from the given project path.
 * Returns null if the file does not exist.
 * Throws if the file exists but is invalid.
 */
export function loadProjectConfig(projectPath = '.') {
  const configPath = join(projectPath, CONFIG_FILENAME);
  if (!existsSync(configPath)) return null;

  const raw = readFileSync(configPath, 'utf8');

  // Minimal YAML parser for the simple key: value structure we need.
  // We deliberately avoid a heavy dependency — uds.project.yaml is intentionally simple.
  const config = parseMinimalYaml(raw, configPath);
  validateConfig(config, configPath);
  return config;
}

/**
 * Parse a minimal YAML subset sufficient for uds.project.yaml.
 * Supports: top-level scalars, one-level nested mappings (commands:, custom:).
 */
function parseMinimalYaml(raw, _filePath) {
  const lines = raw.split('\n');
  const result = {};
  let currentSection = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trimEnd();

    // Skip blank lines and comments
    if (!trimmed || trimmed.trimStart().startsWith('#')) continue;

    const indent = line.length - line.trimStart().length;

    if (indent === 0) {
      // Top-level key
      const match = trimmed.match(/^([a-zA-Z_][a-zA-Z0-9_-]*):\s*(.*)$/);
      if (!match) continue;
      const [, key, value] = match;
      if (value.trim()) {
        result[key] = value.trim().replace(/^["']|["']$/g, '');
        currentSection = null;
      } else {
        result[key] = {};
        currentSection = key;
      }
    } else if (currentSection && indent > 0) {
      // Nested key under current section
      const match = trimmed.trim().match(/^([a-zA-Z_][a-zA-Z0-9_-]*):\s*(.*)$/);
      if (!match) continue;
      const [, key, value] = match;
      result[currentSection][key] = value.trim().replace(/^["']|["']$/g, '');
    }
  }

  return result;
}

function validateConfig(config, filePath) {
  if (!config.version) {
    throw new Error(
      `${filePath}: missing required field "version". ` +
      'Add "version: \\"1\\"" at the top of the file.'
    );
  }
  if (config.commands && typeof config.commands !== 'object') {
    throw new Error(`${filePath}: "commands" must be a mapping of intent: command pairs.`);
  }
}

/**
 * Get a specific command intent from config.
 * Returns undefined if not configured.
 */
export function getCommand(config, intent) {
  if (!config) return undefined;
  return config.commands?.[intent] ?? config.custom?.[intent];
}

export { CONFIG_FILENAME };
