/**
 * Unified Skills and Commands Installer
 *
 * Provides a unified interface for installing skills and slash commands
 * across all supported AI coding assistants.
 *
 * @version 1.0.0
 */

import { mkdirSync, writeFileSync, existsSync, readFileSync, readdirSync, copyFileSync, statSync, rmSync, unlinkSync } from 'fs';
import { dirname, join, basename } from 'path';
import { createHash } from 'crypto';
import { fileURLToPath } from 'url';
import {
  getAgentConfig,
  getSkillsDirForAgent,
  getCommandsDirForAgent,
  getSkillsSupportedAgents,
  getCommandsSupportedAgents,
  getCommandFileExtension
} from '../config/ai-agent-paths.js';
import { computeDirectoryHashes, computeFileHash } from './hasher.js';
import { isLocalizedLocale } from './locale.js';
import { getSkillsSourceDir } from './skills-source.js';

// Get the CLI package root directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const CLI_ROOT = join(__dirname, '..', '..');
const BUNDLED_DIR = join(CLI_ROOT, 'bundled');

// getSkillsSourceDir now lives in skills-source.js so github.js resolves the same path.
// Its previous private copy here was the half that worked; the copy in github.js was not.

/**
 * Get the localized Skills source directory for a given locale.
 * Falls back to the English source directory if the localized path does not exist.
 * @param {string} locale - Locale identifier (e.g., 'zh-TW', 'zh-CN', 'en')
 * @returns {string} Path to skills source directory for the locale
 */
function getLocalizedSkillsSourceDir(locale) {
  const enDir = getSkillsSourceDir();
  if (!isLocalizedLocale(locale)) {
    return enDir;
  }

  // Try bundled path first (npm install)
  const bundledPath = join(BUNDLED_DIR, 'locales', locale, 'skills');
  if (existsSync(bundledPath)) {
    return bundledPath;
  }

  // Development environment fallback
  const devPath = join(CLI_ROOT, '..', 'locales', locale, 'skills');
  if (existsSync(devPath)) {
    return devPath;
  }

  // Locale directory not found, fall back to English
  return enDir;
}

/**
 * Get the localized Commands source directory for a given locale.
 * Falls back to the English commands directory if the localized path does not exist.
 * @param {string} locale - Locale identifier (e.g., 'zh-TW', 'zh-CN', 'en')
 * @returns {string} Path to commands source directory for the locale
 */
function getLocalizedCommandsSourceDir(locale) {
  const enDir = join(getSkillsSourceDir(), 'commands');
  if (!isLocalizedLocale(locale)) {
    return enDir;
  }

  // Try bundled path first (npm install)
  const bundledPath = join(BUNDLED_DIR, 'locales', locale, 'skills', 'commands');
  if (existsSync(bundledPath)) {
    return bundledPath;
  }

  // Development environment fallback
  const devPath = join(CLI_ROOT, '..', 'locales', locale, 'skills', 'commands');
  if (existsSync(devPath)) {
    return devPath;
  }

  // Locale directory not found, fall back to English
  return enDir;
}

const SKILLS_LOCAL_DIR = getSkillsSourceDir();
const COMMANDS_LOCAL_DIR = join(SKILLS_LOCAL_DIR, 'commands');

/**
 * Get list of available skill names from local directory
 * @returns {string[]} Array of skill names
 */
export function getAvailableSkillNames() {
  if (!existsSync(SKILLS_LOCAL_DIR)) {
    return [];
  }

  try {
    return readdirSync(SKILLS_LOCAL_DIR)
      .filter(item => {
        const itemPath = join(SKILLS_LOCAL_DIR, item);
        if (!statSync(itemPath).isDirectory()) return false;
        // A skill is a directory containing SKILL.md. Defining it positively rather than
        // by a deny-list matters: `skills/` also holds agents/, workflows/, ai/, tools/
        // and _shared/, which belong to other installers. The old deny-list named only
        // some of them, so the rest were treated as skills whose SKILL.md "failed to
        // install" — 5 phantom failures that failed the whole install transaction.
        // A new sibling directory now costs nothing; under a deny-list it would break
        // installation until someone remembered to add it.
        return existsSync(join(itemPath, 'SKILL.md'));
      });
  } catch {
    return [];
  }
}

/**
 * Every directory name in the skills source tree, including the ones that are not
 * skills (`_shared`, `agents`, `ai`, `commands`, `tools`, `workflows`).
 *
 * Used as a provenance test: if a directory in an adopter's skills folder has a
 * counterpart here, UDS put it there. If it does not, UDS did not — it is either
 * an adopter's own skill or an artefact of a UDS version too old to reason about,
 * and deleting it is not this tool's call to make.
 *
 * The distinction matters because an older CLI copied the non-skill siblings in
 * by mistake, so a strict "is it a skill we ship" test would leave those behind
 * while a naive "is it in the skills folder" test deletes hand-written skills.
 * dev-platform has fourteen of those. (XSPEC-343 R2)
 *
 * @returns {Set<string>} Directory names present in the skills source tree
 */
export function getSkillsSourceEntryNames() {
  if (!existsSync(SKILLS_LOCAL_DIR)) {
    return new Set();
  }
  try {
    return new Set(
      readdirSync(SKILLS_LOCAL_DIR, { withFileTypes: true })
        .filter((e) => e.isDirectory())
        .map((e) => e.name)
    );
  } catch {
    return new Set();
  }
}

/**
 * Get list of available command names from local directory
 * @returns {string[]} Array of command names (without .md extension)
 */
export function getAvailableCommandNames() {
  if (!existsSync(COMMANDS_LOCAL_DIR)) {
    return [];
  }

  // Files to exclude from command list
  const EXCLUDED_FILES = ['README.md', 'COMMAND-FAMILY-OVERVIEW.md'];

  try {
    return readdirSync(COMMANDS_LOCAL_DIR)
      .filter(file => file.endsWith('.md') && !EXCLUDED_FILES.includes(file))
      .map(file => basename(file, '.md'));
  } catch {
    return [];
  }
}

/**
 * Install skills for a specific AI agent
 * @param {string} agent - Agent identifier (e.g., 'opencode', 'cursor')
 * @param {string} level - 'user' or 'project'
 * @param {string[]} skillNames - Array of skill names to install (null = all)
 * @param {string} projectPath - Project root path (required for project level)
 * @param {string} locale - Locale for skill content (default: 'en')
 * @returns {Object} Installation result
 */
export async function installSkillsForAgent(agent, level, skillNames = null, projectPath = null, locale = 'en') {
  const config = getAgentConfig(agent);
  if (!config || !config.skills) {
    return {
      success: false,
      agent,
      level,
      error: `Agent '${agent}' does not support skills installation`,
      installed: [],
      errors: []
    };
  }

  // Get target directory
  const targetDir = getSkillsDirForAgent(agent, level, projectPath);
  if (!targetDir) {
    return {
      success: false,
      agent,
      level,
      error: `Could not determine target directory for ${agent} at ${level} level`,
      installed: [],
      errors: []
    };
  }

  // Ensure target directory exists
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true });
  }

  // Get skills to install
  const availableSkills = getAvailableSkillNames();
  const toInstall = skillNames || availableSkills;

  const results = {
    success: true,
    agent,
    level,
    targetDir,
    installed: [],
    errors: [],
    fileHashes: {}, // New: file hashes for installed skills
    // List of skill names that requested a localized variant but fell back to
    // the English source because no locale variant exists for them.
    // Populated only when `locale` is a localized locale (not 'en').
    localeFallbacks: []
  };

  for (const skillName of toInstall) {
    const result = installSingleSkill(skillName, targetDir, locale);
    if (result.success) {
      results.installed.push(skillName);
      if (result.fallbackToEn) {
        results.localeFallbacks.push(skillName);
      }
    } else {
      results.errors.push({ skill: skillName, error: result.error });
      results.success = false;
    }
  }

  // Write manifest
  if (results.installed.length > 0) {
    writeSkillsManifestForAgent(agent, level, targetDir, locale);

    // Compute file hashes for tracking
    // Key format: agent/level/skillName/filename (e.g., "opencode/project/commit-standards/SKILL.md")
    const baseKey = `${agent}/${level}`;
    results.fileHashes = computeDirectoryHashes(targetDir, baseKey);
  }

  return results;
}

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

/**
 * Merge required Claude Code frontmatter fields from the English source
 * into an installed localized SKILL.md.
 *
 * The English source contains fields like `name`, `allowed-tools`, `scope`,
 * `argument-hint`, and `disable-model-invocation` that Claude Code needs
 * to function. Translated SKILL.md files typically lack these fields.
 *
 * @param {string} enSourceDir - English source directory for the skill
 * @param {string} targetDir - Target directory where translated SKILL.md is installed
 */
function mergeSkillFrontmatter(enSourceDir, targetDir) {
  const enSkillPath = join(enSourceDir, 'SKILL.md');
  const targetSkillPath = join(targetDir, 'SKILL.md');

  if (!existsSync(enSkillPath) || !existsSync(targetSkillPath)) {
    return;
  }

  const enContent = readFileSync(enSkillPath, 'utf-8');
  const enParsed = parseFrontmatter(enContent);
  if (!enParsed) return;

  // Fields required by Claude Code that must come from English source
  const REQUIRED_FIELDS = ['name', 'allowed-tools', 'scope', 'argument-hint', 'disable-model-invocation'];

  const fieldsToMerge = {};
  for (const field of REQUIRED_FIELDS) {
    if (enParsed.frontmatter[field] !== undefined) {
      fieldsToMerge[field] = enParsed.frontmatter[field];
    }
  }

  if (Object.keys(fieldsToMerge).length === 0) return;

  const targetContent = readFileSync(targetSkillPath, 'utf-8');
  const rebuilt = rebuildWithFrontmatter(targetContent, fieldsToMerge);
  writeFileSync(targetSkillPath, rebuilt);
}

/**
 * Install a single skill to a target directory.
 *
 * When `locale` requests a localized variant but no localized directory exists
 * for the requested skill, the function silently copies the English source and
 * sets `fallbackToEn: true` on the result so callers can surface a WARN at the
 * end of the install run (XSPEC-239 §Req-3 / P1-CLI-1).
 *
 * @param {string} skillName - Skill name
 * @param {string} targetBaseDir - Target base directory
 * @param {string} locale - Locale for skill content (default: 'en')
 * @returns {{success: boolean, skillName: string, path?: string, error?: string, fallbackToEn?: boolean}} Result
 */
/**
 * Resolve what installing a skill would put on disk, without writing anything.
 *
 * This is THE definition of a skill's installed content, and it exists as one
 * function because both the installer and the reconciler need that answer.
 * XSPEC-382 R1 originally proposed hashing the source directory on both sides
 * and letting the existing comparison work. Measurement killed that: installing
 * is not a verbatim copy. Three things sit in between, any one of them fatal to
 * a source-directory hash —
 *
 *   1. a localized SKILL.md gets English frontmatter fields merged in, so the
 *      installed file matches no source file (measured: brainstorm-assistant is
 *      23,866 bytes installed against a 23,753-byte zh-TW source);
 *   2. the source directory is chosen at runtime by locale with fallback to
 *      English per skill, so there is no single path to hash;
 *   3. subdirectories are skipped, making the install a strict subset.
 *
 * The alternative was a second copy of this logic inside the planner. That is
 * the arrangement this file has already been bitten by twice; two copies answer
 * differently the first time one changes, and a planner that disagrees with the
 * installer reports every skill as changed on every upgrade — worse than the
 * no-signal it replaced, because a false signal is indistinguishable from a
 * real one.
 *
 * All 514 installable files are UTF-8 text (508 .md, 5 .yaml, 1 .json), checked
 * by decoding every one of them, so reading content as a string is lossless.
 *
 * @param {string} skillName
 * @param {string} locale
 * @returns {{files: Array<{name: string, content: string}>, fallbackToEn: boolean, error: string|null}}
 */
export function resolveSkillFiles(skillName, locale = 'en') {
  const enSourceDir = join(SKILLS_LOCAL_DIR, skillName);

  let sourceDir = enSourceDir;
  let needsFrontmatterMerge = false;
  let fallbackToEn = false;

  if (isLocalizedLocale(locale)) {
    const localizedSkillDir = join(getLocalizedSkillsSourceDir(locale), skillName);
    if (existsSync(localizedSkillDir)) {
      sourceDir = localizedSkillDir;
      needsFrontmatterMerge = true;
    } else {
      fallbackToEn = true;
    }
  }

  if (!existsSync(sourceDir)) {
    return { files: [], fallbackToEn, error: `Skill not found: ${skillName}` };
  }

  const files = [];
  for (const fileName of readdirSync(sourceDir)) {
    const sourcePath = join(sourceDir, fileName);
    // Subdirectories are skipped — matching what the installer has always done.
    if (statSync(sourcePath).isDirectory()) continue;
    files.push({ name: fileName, content: readFileSync(sourcePath, 'utf-8') });
  }

  if (needsFrontmatterMerge) {
    const skill = files.find((f) => f.name === 'SKILL.md');
    if (skill) {
      const merged = mergeFrontmatterContent(enSourceDir, skill.content);
      if (merged !== null) skill.content = merged;
    }
  }

  // Sorted so a hash over this list depends on content, not on directory order.
  files.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  return { files, fallbackToEn, error: null };
}

/**
 * Content hash of a resolved skill, over names and contents.
 *
 * Names are included: two skills with the same bodies under different filenames
 * are different installs, and a hash over contents alone would call a rename
 * "unchanged".
 *
 * @param {Array<{name: string, content: string}>} files
 * @returns {string|null} `sha256:<hex>`, or null for an empty resolution
 */
export function computeSkillContentHash(files) {
  if (!files?.length) return null;
  const h = createHash('sha256');
  for (const f of files) {
    h.update(f.name);
    h.update('\0');
    h.update(f.content);
    h.update('\0');
  }
  return `sha256:${h.digest('hex')}`;
}

/**
 * The in-memory half of `mergeSkillFrontmatter`, so resolution and installation
 * agree by construction rather than by both being kept up to date.
 *
 * @returns {string|null} merged content, or null when there is nothing to merge
 */
function mergeFrontmatterContent(enSourceDir, targetContent) {
  const enSkillPath = join(enSourceDir, 'SKILL.md');
  if (!existsSync(enSkillPath)) return null;

  const enParsed = parseFrontmatter(readFileSync(enSkillPath, 'utf-8'));
  if (!enParsed) return null;

  const REQUIRED_FIELDS = ['name', 'allowed-tools', 'scope', 'argument-hint', 'disable-model-invocation'];
  const fieldsToMerge = {};
  for (const field of REQUIRED_FIELDS) {
    if (enParsed.frontmatter[field] !== undefined) {
      fieldsToMerge[field] = enParsed.frontmatter[field];
    }
  }
  if (Object.keys(fieldsToMerge).length === 0) return null;

  return rebuildWithFrontmatter(targetContent, fieldsToMerge);
}

function installSingleSkill(skillName, targetBaseDir, locale = 'en') {
  const targetDir = join(targetBaseDir, skillName);

  const resolved = resolveSkillFiles(skillName, locale);
  const { fallbackToEn } = resolved;

  if (resolved.error) {
    return {
      success: false,
      skillName,
      error: resolved.error
    };
  }

  // Ensure target directory exists
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true });
  }

  try {
    // Write what `resolveSkillFiles` says this install is. The planner asks the
    // same function what it WOULD be, so the two cannot disagree — which is the
    // whole point of routing installation through it. (XSPEC-382 R1)
    for (const file of resolved.files) {
      writeFileSync(join(targetDir, file.name), file.content, 'utf-8');
    }

    return { success: true, skillName, path: targetDir, fallbackToEn };
  } catch (error) {
    return {
      success: false,
      skillName,
      error: error.message,
      fallbackToEn
    };
  }
}

/**
 * Write skills manifest for an agent
 * @param {string} agent - Agent identifier
 * @param {string} level - 'user' or 'project'
 * @param {string} targetDir - Target directory
 * @param {string} locale - Locale used for installation (default: 'en')
 */
function writeSkillsManifestForAgent(agent, level, targetDir, locale = 'en') {
  const manifestPath = join(targetDir, '.manifest.json');
  const { version } = JSON.parse(
    readFileSync(join(CLI_ROOT, 'package.json'), 'utf-8')
  );

  const manifest = {
    version,
    source: 'universal-dev-standards',
    agent,
    level,
    locale,
    installedDate: new Date().toISOString().split('T')[0]
  };

  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
}

/**
 * Install slash commands for a specific AI agent
 * @param {string} agent - Agent identifier (e.g., 'opencode', 'copilot')
 * @param {string} level - 'user' or 'project'
 * @param {string[]} commandNames - Array of command names to install (null = all)
 * @param {string} projectPath - Project root path (required for project level)
 * @param {string} locale - Locale for command content (default: 'en')
 * @returns {Object} Installation result
 */
export async function installCommandsForAgent(agent, level = 'project', commandNames = null, projectPath = null, locale = 'en') {
  const config = getAgentConfig(agent);
  if (!config || !config.commands) {
    return {
      success: false,
      agent,
      level,
      error: `Agent '${agent}' does not support slash commands`,
      installed: [],
      errors: []
    };
  }

  // Get target directory
  const targetDir = getCommandsDirForAgent(agent, level, projectPath);
  if (!targetDir) {
    return {
      success: false,
      agent,
      level,
      error: `Could not determine commands directory for ${agent} at ${level} level`,
      installed: [],
      errors: []
    };
  }

  // Ensure target directory exists
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true });
  }

  // Get commands to install
  const availableCommands = getAvailableCommandNames();
  const toInstall = commandNames || availableCommands;

  const results = {
    success: true,
    agent,
    level,
    targetDir,
    installed: [],
    errors: [],
    fileHashes: {} // New: file hashes for installed commands
  };

  for (const cmdName of toInstall) {
    const result = installSingleCommand(cmdName, targetDir, agent, locale);
    if (result.success) {
      results.installed.push(cmdName);
    } else {
      results.errors.push({ command: cmdName, error: result.error });
      results.success = false;
    }
  }

  // Write manifest
  if (results.installed.length > 0) {
    writeCommandsManifest(agent, level, targetDir, results.installed);

    // Compute file hashes for tracking
    // Key format: agent/filename (e.g., "opencode/commit.md")
    const now = new Date().toISOString();
    for (const cmdName of results.installed) {
      const ext = getCommandFileExtension(agent);
      const filePath = join(targetDir, `${cmdName}${ext}`);
      const hashInfo = computeFileHash(filePath);
      if (hashInfo) {
        results.fileHashes[`${agent}/${cmdName}${ext}`] = {
          ...hashInfo,
          installedAt: now
        };
      }
    }
  }

  return results;
}

// getCommandFileExtension moved to config/ai-agent-paths.js — the reconciler's
// scanner needs the same mapping, and a second private copy is how the writer
// and the reader drift apart. It now reads `commandFormat` from the agent config
// instead of hard-coding one agent id. (XSPEC-343 R2)

/**
 * Install a single command to target directory
 * @param {string} cmdName - Command name (without .md)
 * @param {string} targetDir - Target directory
 * @param {string} agent - Agent identifier (for potential format transformation)
 * @param {string} locale - Locale for command content (default: 'en')
 * @returns {Object} Result
 */
function installSingleCommand(cmdName, targetDir, agent, locale = 'en') {
  let sourcePath = join(COMMANDS_LOCAL_DIR, `${cmdName}.md`);

  // Check for localized command file
  if (isLocalizedLocale(locale)) {
    const localizedDir = getLocalizedCommandsSourceDir(locale);
    const localizedPath = join(localizedDir, `${cmdName}.md`);
    if (existsSync(localizedPath)) {
      sourcePath = localizedPath;
    }
    // else: fall back to English source
  }

  const targetExt = getCommandFileExtension(agent);
  const targetPath = join(targetDir, `${cmdName}${targetExt}`);

  if (!existsSync(sourcePath)) {
    return {
      success: false,
      command: cmdName,
      error: `Command not found: ${cmdName}`
    };
  }

  try {
    let content = readFileSync(sourcePath, 'utf-8');

    // Transform content if needed for specific agents
    content = transformCommandForAgent(content, cmdName, agent);

    writeFileSync(targetPath, content);
    return { success: true, command: cmdName, path: targetPath };
  } catch (error) {
    return {
      success: false,
      command: cmdName,
      error: error.message
    };
  }
}

/**
 * Transform command content for a specific agent if needed
 * @param {string} content - Original command content
 * @param {string} cmdName - Command name
 * @param {string} agent - Agent identifier
 * @returns {string} Transformed content
 */
function transformCommandForAgent(content, cmdName, agent) {
  // Currently, most agents use the same format as Claude Code
  // This function can be extended for agent-specific transformations

  // Example: OpenCode might need different frontmatter fields
  if (agent === 'opencode') {
    // OpenCode uses the same YAML frontmatter format
    // No transformation needed currently
    return content;
  }

  if (agent === 'copilot') {
    // GitHub Copilot prompts might need different format
    // For now, keep the same format
    return content;
  }

  if (agent === 'gemini-cli') {
    // Gemini CLI uses TOML for commands
    return convertMarkdownToGeminiToml(content, cmdName);
  }

  return content;
}

/**
 * Convert markdown command with YAML frontmatter to Gemini CLI TOML format
 * @param {string} content - Markdown content with YAML frontmatter
 * @param {string} cmdName - Command name (for fallback description)
 * @returns {string} TOML formatted content
 */
function convertMarkdownToGeminiToml(content, cmdName) {
  // Parse YAML frontmatter
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

  if (!frontmatterMatch) {
    // No frontmatter, wrap entire content as prompt
    return `description = "${cmdName} command"\n\nprompt = """\n${content}\n"""`;
  }

  const [, frontmatterText, promptContent] = frontmatterMatch;

  // Parse frontmatter fields
  let description = `${cmdName} command`;
  let argumentHint = null;

  // Extract description from YAML
  const descMatch = frontmatterText.match(/^description:\s*(.+)$/m);
  if (descMatch) {
    description = descMatch[1].trim();
  }

  // Extract argument-hint from YAML
  const argHintMatch = frontmatterText.match(/^argument-hint:\s*(.+)$/m);
  if (argHintMatch) {
    argumentHint = argHintMatch[1].trim();
  }

  // Build TOML content
  let toml = `# ${cmdName} command - converted from UDS\n`;
  toml += `description = "${escapeTomlString(description)}"\n\n`;

  // Add argument placeholder if the command accepts arguments
  let prompt = promptContent.trim();
  if (argumentHint) {
    // Insert argument handling instruction at the beginning
    const argInstruction = '\n## Arguments\nUser provided: {{args}}\n';
    prompt = argInstruction + '\n' + prompt;
  }

  // Multi-line string in TOML uses triple quotes
  toml += `prompt = """\n${prompt}\n"""`;

  return toml;
}

/**
 * Escape special characters for TOML string
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
function escapeTomlString(str) {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

/**
 * Write commands manifest
 * @param {string} agent - Agent identifier
 * @param {string} level - 'user' or 'project'
 * @param {string} targetDir - Target directory
 * @param {string[]} commands - List of installed commands
 */
function writeCommandsManifest(agent, level, targetDir, commands) {
  const manifestPath = join(targetDir, '.manifest.json');
  const { version } = JSON.parse(
    readFileSync(join(CLI_ROOT, 'package.json'), 'utf-8')
  );

  const manifest = {
    version,
    source: 'universal-dev-standards',
    agent,
    level,
    commands,
    installedDate: new Date().toISOString().split('T')[0]
  };

  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
}

/**
 * Get installed skills info for an agent
 * @param {string} agent - Agent identifier
 * @param {string} level - 'user' or 'project'
 * @param {string} projectPath - Project root path (required for project level)
 * @returns {Object|null} Installed skills info or null
 */
export function getInstalledSkillsInfoForAgent(agent, level, projectPath = null) {
  const targetDir = getSkillsDirForAgent(agent, level, projectPath);
  if (!targetDir || !existsSync(targetDir)) {
    return null;
  }

  const manifestPath = join(targetDir, '.manifest.json');

  // Check if manifest exists
  if (!existsSync(manifestPath)) {
    // No manifest - check if there are actual skill files (SKILL.md in subdirectories)
    try {
      const entries = readdirSync(targetDir, { withFileTypes: true });
      const skillDirs = entries.filter(e => e.isDirectory() && !e.name.startsWith('.'));

      // Check if any subdirectory contains a SKILL.md file
      const hasSkillFiles = skillDirs.some(dir => {
        const skillFile = join(targetDir, dir.name, 'SKILL.md');
        return existsSync(skillFile);
      });

      if (!hasSkillFiles) {
        // Empty directory or no valid skills - not installed
        return null;
      }

      // Has skill files but no manifest
      return {
        installed: true,
        version: null,
        source: 'unknown',
        agent,
        level,
        path: targetDir
      };
    } catch {
      // Error reading directory - assume not installed
      return null;
    }
  }

  try {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
    return {
      installed: true,
      version: manifest.version || null,
      source: manifest.source || 'universal-dev-standards',
      agent,
      level,
      path: targetDir,
      installedDate: manifest.installedDate || null
    };
  } catch {
    return {
      installed: true,
      version: null,
      source: 'unknown',
      agent,
      level,
      path: targetDir
    };
  }
}

/**
 * Get installed commands info for an agent
 * @param {string} agent - Agent identifier
 * @param {string} level - 'user' or 'project'
 * @param {string} projectPath - Project root path (required for project level)
 * @returns {Object|null} Installed commands info or null
 */
export function getInstalledCommandsForAgent(agent, level = 'project', projectPath = null) {
  const targetDir = getCommandsDirForAgent(agent, level, projectPath);
  if (!targetDir || !existsSync(targetDir)) {
    return null;
  }

  const manifestPath = join(targetDir, '.manifest.json');

  // Count command files (handle both .md and .toml based on agent)
  let commandFiles = [];
  try {
    commandFiles = readdirSync(targetDir)
      .filter(f => {
        // For Gemini CLI, look for .toml files
        if (agent === 'gemini-cli') {
          return f.endsWith('.toml');
        }
        // For other agents, look for .md files (excluding README)
        return f.endsWith('.md') && f !== 'README.md';
      });
  } catch {
    return null;
  }

  if (commandFiles.length === 0) {
    return null;
  }

  // Get command names without extension
  const getCommandName = (filename) => {
    if (filename.endsWith('.toml')) return basename(filename, '.toml');
    return basename(filename, '.md');
  };

  if (!existsSync(manifestPath)) {
    return {
      installed: true,
      count: commandFiles.length,
      commands: commandFiles.map(getCommandName),
      version: null,
      agent,
      level,
      path: targetDir
    };
  }

  try {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
    return {
      installed: true,
      count: commandFiles.length,
      commands: manifest.commands || commandFiles.map(getCommandName),
      version: manifest.version || null,
      agent,
      level,
      path: targetDir,
      installedDate: manifest.installedDate || null
    };
  } catch {
    return {
      installed: true,
      count: commandFiles.length,
      commands: commandFiles.map(getCommandName),
      version: null,
      agent,
      level,
      path: targetDir
    };
  }
}

/**
 * Deduplicate installations: if same agent appears at both user + project levels, keep project level.
 * Project level is preferred because it can be shared via Git.
 * @param {Array<{agent: string, level: string}>} installations - Array of installation targets
 * @returns {Array<{agent: string, level: string}>} Deduplicated installations
 */
export function deduplicateInstallations(installations) {
  const seen = new Map();
  const deduped = [];
  for (const inst of installations) {
    const existing = seen.get(inst.agent);
    if (existing) {
      // Same agent at two levels — prefer project
      if (inst.level === 'project') {
        deduped[deduped.indexOf(existing)] = inst;
        seen.set(inst.agent, inst);
      }
      // else: already have project or user, skip this duplicate
    } else {
      seen.set(inst.agent, inst);
      deduped.push(inst);
    }
  }
  return deduped;
}

/**
 * Install skills to multiple agents at once
 * @param {Array<{agent: string, level: string}>} installations - Array of installation targets
 * @param {string[]} skillNames - Skills to install (null = all)
 * @param {string} projectPath - Project root path
 * @param {string} locale - Locale for skill content (default: 'en')
 * @returns {Object} Combined results
 */
export async function installSkillsToMultipleAgents(installations, skillNames = null, projectPath = null, locale = 'en') {
  // Deduplicate: same agent at both levels → keep project
  const uniqueInstallations = deduplicateInstallations(installations);

  const results = {
    success: true,
    installations: [],
    totalInstalled: 0,
    totalErrors: 0,
    allFileHashes: {}, // New: combined file hashes from all installations
    // Aggregated set of skill names that fell back to English across all
    // agents/levels. Used by the high-level installer to print a single WARN.
    localeFallbacks: []
  };

  const fallbackSet = new Set();

  for (const { agent, level } of uniqueInstallations) {
    const result = await installSkillsForAgent(agent, level, skillNames, projectPath, locale);
    results.installations.push(result);

    if (!result.success) {
      results.success = false;
    }
    results.totalInstalled += result.installed.length;
    results.totalErrors += result.errors.length;

    // Merge file hashes from this installation
    if (result.fileHashes) {
      Object.assign(results.allFileHashes, result.fileHashes);
    }

    // Merge locale fallbacks (dedupe across agents)
    if (Array.isArray(result.localeFallbacks)) {
      for (const name of result.localeFallbacks) {
        fallbackSet.add(name);
      }
    }
  }

  results.localeFallbacks = Array.from(fallbackSet).sort();

  return results;
}

/**
 * Install commands to multiple agents at once
 * @param {Array<{agent: string, level: string}> | string[]} installations - Array of installation targets
 *        Can be either [{agent, level}] objects or simple agent strings (defaults to 'project' level)
 * @param {string[]} commandNames - Commands to install (null = all)
 * @param {string} projectPath - Project root path (required for project level)
 * @param {string} locale - Locale for command content (default: 'en')
 * @returns {Object} Combined results
 */
export async function installCommandsToMultipleAgents(installations, commandNames = null, projectPath = null, locale = 'en') {
  // Normalize to {agent, level} objects first, then deduplicate
  const normalized = installations.map(item =>
    typeof item === 'string' ? { agent: item, level: 'project' } : { agent: item.agent, level: item.level || 'project' }
  );
  const uniqueInstallations = deduplicateInstallations(normalized);

  const results = {
    success: true,
    installations: [],
    totalInstalled: 0,
    totalErrors: 0,
    allFileHashes: {} // New: combined file hashes from all installations
  };

  for (const item of uniqueInstallations) {
    const agent = item.agent;
    const level = item.level;

    const config = getAgentConfig(agent);
    if (!config?.commands) continue; // Skip agents that don't support commands

    const result = await installCommandsForAgent(agent, level, commandNames, projectPath, locale);
    results.installations.push(result);

    if (!result.success) {
      results.success = false;
    }
    results.totalInstalled += result.installed.length;
    results.totalErrors += result.errors.length;

    // Merge file hashes from this installation
    if (result.fileHashes) {
      Object.assign(results.allFileHashes, result.fileHashes);
    }
  }

  return results;
}

/**
 * Cleanup duplicate Skills installations where the same agent has both user and project level.
 * Keeps project level (shareable via Git), removes user level duplicates.
 * @param {string} projectPath - Project root path
 * @returns {{cleaned: Array<{agent: string, level: string, path: string}>, errors: string[]}}
 */
export function cleanupDuplicateSkills(projectPath) {
  const cleaned = [];
  const errors = [];

  const agents = getSkillsSupportedAgents();
  for (const agent of agents) {
    const projectDir = getSkillsDirForAgent(agent, 'project', projectPath);
    const userDir = getSkillsDirForAgent(agent, 'user');

    // Only clean up if both levels have installations
    if (projectDir && userDir && existsSync(projectDir) && existsSync(userDir)) {
      const projectSkills = safeReaddir(projectDir);
      const userSkills = safeReaddir(userDir);

      // Find skills that exist at both levels
      const duplicates = userSkills.filter(s => projectSkills.includes(s));
      for (const skillName of duplicates) {
        const userSkillDir = join(userDir, skillName);
        try {
          if (existsSync(userSkillDir) && statSync(userSkillDir).isDirectory()) {
            rmSync(userSkillDir, { recursive: true, force: true });
            cleaned.push({ agent, level: 'user', path: userSkillDir });
          }
        } catch (err) {
          errors.push(`Failed to remove ${userSkillDir}: ${err.message}`);
        }
      }
    }
  }

  return { cleaned, errors };
}

/**
 * Cleanup legacy command files in .claude/commands/ that duplicate skills in .claude/skills/.
 * @param {string} projectPath - Project root path
 * @returns {{cleaned: Array<{agent: string, level: string, path: string}>, errors: string[]}}
 */
export function cleanupLegacyCommands(projectPath) {
  const cleaned = [];
  const errors = [];

  // Legacy commands path for Claude Code
  const legacyDir = join(projectPath, '.claude', 'commands');
  const skillsDir = join(projectPath, '.claude', 'skills');

  if (!existsSync(legacyDir) || !existsSync(skillsDir)) {
    return { cleaned, errors };
  }

  try {
    const legacyFiles = readdirSync(legacyDir).filter(f => f.endsWith('.md'));
    const skillFolders = safeReaddir(skillsDir);

    for (const file of legacyFiles) {
      const commandName = basename(file, '.md');
      // If there's a matching skill folder, the legacy command is redundant
      if (skillFolders.includes(commandName)) {
        const filePath = join(legacyDir, file);
        try {
          unlinkSync(filePath);
          cleaned.push({ agent: 'claude-code', level: 'project', path: filePath });
        } catch (err) {
          errors.push(`Failed to remove ${filePath}: ${err.message}`);
        }
      }
    }
  } catch (err) {
    errors.push(`Failed to scan legacy commands: ${err.message}`);
  }

  return { cleaned, errors };
}

/**
 * Safe readdir that returns empty array on error
 * @param {string} dir - Directory path
 * @returns {string[]} Directory entries
 */
function safeReaddir(dir) {
  try {
    return readdirSync(dir).filter(item => {
      try {
        return statSync(join(dir, item)).isDirectory();
      } catch {
        return false;
      }
    });
  } catch {
    return [];
  }
}

export default {
  installSkillsForAgent,
  installCommandsForAgent,
  getInstalledSkillsInfoForAgent,
  getInstalledCommandsForAgent,
  installSkillsToMultipleAgents,
  installCommandsToMultipleAgents,
  getAvailableSkillNames,
  getAvailableCommandNames,
  deduplicateInstallations,
  cleanupDuplicateSkills,
  cleanupLegacyCommands,
  parseFrontmatter,
  rebuildWithFrontmatter
};
