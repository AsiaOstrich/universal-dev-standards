/**
 * Project Command Contract — reads and validates uds.project.yaml
 * XSPEC-029
 */
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import * as yaml from 'js-yaml';

const CONFIG_FILENAME = 'uds.project.yaml';

/** Sections whose entries are `intent: command` pairs. */
const COMMAND_SECTIONS = ['commands', 'custom'];

/**
 * Parse uds.project.yaml from the given project path.
 * Returns null if the file does not exist.
 * Throws if the file exists but is invalid.
 *
 * XSPEC-456 R1: the file is read as YAML. It used to go through a hand-written line parser that
 * kept everything after the first colon as the value, so a trailing comment
 * (`test: dotnet test X.csproj  # 90 tests pass`) became part of the command. A POSIX shell hides
 * that (an unquoted `#` starts a comment), `cmd.exe` does not - the comment reached MSBuild as
 * arguments. Reading the value the way YAML defines it removes the comment before anything is run.
 */
export function loadProjectConfig(projectPath = '.') {
  const configPath = join(projectPath, CONFIG_FILENAME);
  if (!existsSync(configPath)) return null;

  const raw = readFileSync(configPath, 'utf8');

  const config = parseProjectYaml(raw, configPath);
  validateConfig(config, configPath);
  return config;
}

/**
 * Parse the file with a real YAML parser and normalise it to the shape callers use:
 * top-level scalars and the `commands` / `custom` sections are strings.
 */
function parseProjectYaml(raw, filePath) {
  let doc;
  try {
    doc = yaml.load(raw);
  } catch (err) {
    const line = err?.mark ? ` (line ${err.mark.line + 1})` : '';
    const reason = err?.reason || err?.message || String(err);
    // A double-quoted YAML value reads backslashes as escapes. Windows paths written that way
    // used to work (the old parser kept them verbatim), so say what to do instead of only failing.
    const hint = /escape|hexadecimal/i.test(reason)
      ? ' Inside double quotes a backslash starts an escape sequence; write Windows paths in single quotes or without quotes.'
      : '';
    throw new Error(`${filePath}: not valid YAML${line}: ${reason}.${hint}`);
  }
  if (doc === null || doc === undefined) return {};
  if (typeof doc !== 'object' || Array.isArray(doc)) {
    throw new Error(`${filePath}: the file must be a mapping of keys to values.`);
  }

  const result = {};
  for (const [key, value] of Object.entries(doc)) {
    if (COMMAND_SECTIONS.includes(key)) {
      result[key] = normaliseCommandSection(key, value, filePath);
    } else if (value !== null && typeof value === 'object') {
      result[key] = value;
    } else if (value !== null && value !== undefined) {
      result[key] = String(value);
    }
  }
  return result;
}

function normaliseCommandSection(name, value, filePath) {
  if (value === null || value === undefined) return {};
  if (typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${filePath}: "${name}" must be a mapping of intent: command pairs.`);
  }
  const out = {};
  for (const [intent, command] of Object.entries(value)) {
    if (command === null || command === undefined) continue;
    if (typeof command === 'object') {
      throw new Error(`${filePath}: "${name}.${intent}" must be a single command string, not a list or mapping.`);
    }
    const text = String(command).trim();
    if (text) out[intent] = text;
  }
  return out;
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
  const own = (section) => (section && Object.prototype.hasOwnProperty.call(section, intent) ? section[intent] : undefined);
  return own(config.commands) ?? own(config.custom);
}

export { CONFIG_FILENAME };
