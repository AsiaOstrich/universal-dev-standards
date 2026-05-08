/**
 * Desired State Calculator
 * Computes the expected file state from manifest configuration + registry data.
 *
 * Given a manifest (what the user chose to install) and the standards registry
 * (what the current UDS version ships), this module produces a UDSState object
 * describing every file that should exist in the project.
 */

import { join, basename } from 'path';
import { getAllStandards, getStandardSource, findOption, getOptionSource } from '../utils/registry.js';
import { SUPPORTED_AI_TOOLS } from '../core/constants.js';
import { PathResolver } from '../core/paths.js';
import { computeFileHash } from '../utils/hasher.js';
import {
  getSkillsDirForAgent,
  getCommandsDirForAgent
} from '../config/ai-agent-paths.js';

/**
 * @typedef {Object} FileEntry
 * @property {string} relativePath - Path relative to project root
 * @property {string|null} hash - Expected sha256 hash (null if unknown)
 * @property {number|null} size - Expected file size (null if unknown)
 * @property {string} category - 'standard'|'option'|'integration'|'skill'|'command'|'hook'|'manifest'
 * @property {string|null} sourcePath - Absolute path to source file
 * @property {Object} metadata - Additional info (toolName, standardId, etc.)
 */

/**
 * @typedef {Object} UDSState
 * @property {Map<string, FileEntry>} standards - .standards/*.ai.yaml files
 * @property {Map<string, FileEntry>} options - .standards/options/**\/*.ai.yaml files
 * @property {Map<string, FileEntry>} integrations - CLAUDE.md, .cursorrules, etc.
 * @property {Map<string, FileEntry>} skills - .claude/skills/** etc.
 * @property {Map<string, FileEntry>} commands - .claude/commands/** etc.
 * @property {Map<string, FileEntry>} hook - .husky/pre-commit entries
 * @property {Object} manifest - Expected manifest content
 */

/**
 * Calculate the desired state for a project based on its manifest.
 *
 * @param {string} projectPath - Project root path
 * @param {Object} manifest - Migrated manifest (at latest schema)
 * @returns {UDSState}
 */
export function calculateDesiredState(projectPath, manifest) {
  const state = {
    standards: new Map(),
    options: new Map(),
    integrations: new Map(),
    skills: new Map(),
    commands: new Map(),
    hook: new Map(),
    manifest: manifest
  };

  // 1. Standards files
  calculateStandards(state, manifest);

  // 2. Option files
  calculateOptions(state, manifest);

  // 3. Integration files (CLAUDE.md, .cursorrules, etc.)
  calculateIntegrations(state, manifest);

  // 4. Skills
  calculateSkills(state, projectPath, manifest);

  // 5. Commands
  calculateCommands(state, projectPath, manifest);

  return state;
}

/**
 * Calculate expected standard files.
 */
function calculateStandards(state, manifest) {
  const format = manifest.format || 'ai';
  const allStandards = getAllStandards();

  for (const standardId of (manifest.standards || [])) {
    // Skip option file paths — they are handled by calculateOptions, not this function.
    // Option paths look like "ai/options/commit-message/english.ai.yaml".
    if (standardId.includes('/options/') || standardId.startsWith('options/')) continue;

    // Primary lookup: match by registry ID
    let registryEntry = allStandards.find(s => s.id === standardId);

    // Fallback: legacy path-format manifest entry (e.g. "ai/standards/foo.ai.yaml").
    // Handles manifests that have not yet been migrated to v3.4.0 ID format.
    if (!registryEntry && (standardId.includes('/') || standardId.includes('.'))) {
      registryEntry = allStandards.find(s => {
        const src = s.source;
        const paths = typeof src === 'string'
          ? [src]
          : Object.values(src || {}).filter(p => typeof p === 'string');
        return paths.some(p => p === standardId || basename(p) === basename(standardId));
      });
    }

    if (!registryEntry) continue;

    const source = getStandardSource(registryEntry, format);
    if (!source) continue;

    // Target path in .standards/
    const fileName = basename(source);
    const relativePath = `.standards/${fileName}`;

    // Resolve source to absolute path
    const absSource = PathResolver.getStandardSource(source);

    // Compute hash from source if available
    let hash = null;
    let size = null;
    if (absSource) {
      const hashInfo = computeFileHash(absSource);
      if (hashInfo) {
        hash = hashInfo.hash;
        size = hashInfo.size;
      }
    }

    state.standards.set(relativePath, {
      relativePath,
      hash,
      size,
      category: 'standard',
      sourcePath: absSource,
      metadata: { standardId, format, registryEntry }
    });
  }
}

/**
 * Calculate expected option files.
 */
function calculateOptions(state, manifest) {
  const format = manifest.format || 'ai';
  const allStandards = getAllStandards();

  if (!manifest.options) return;

  for (const [standardId, optionConfig] of Object.entries(manifest.options)) {
    if (!optionConfig) continue;

    const registryEntry = allStandards.find(s => s.id === standardId);
    if (!registryEntry) continue;

    for (const [categoryKey, selection] of Object.entries(optionConfig)) {
      const selections = Array.isArray(selection) ? selection : [selection];
      for (const optionId of selections) {
        if (typeof optionId !== 'string') continue;

        const option = findOption(registryEntry, categoryKey, optionId);
        if (!option) continue;

        const source = getOptionSource(option, format);
        if (!source) continue;

        const fileName = basename(source);
        const relativePath = `.standards/options/${standardId}/${categoryKey}/${fileName}`;
        const absSource = PathResolver.getStandardSource(source);

        let hash = null;
        let size = null;
        if (absSource) {
          const hashInfo = computeFileHash(absSource);
          if (hashInfo) {
            hash = hashInfo.hash;
            size = hashInfo.size;
          }
        }

        state.options.set(relativePath, {
          relativePath,
          hash,
          size,
          category: 'option',
          sourcePath: absSource,
          metadata: { standardId, categoryKey, optionId, format }
        });
      }
    }
  }
}

/**
 * Calculate expected integration files.
 * For integrations we track the UDS marker block, not the entire file.
 */
function calculateIntegrations(state, manifest) {
  for (const toolName of (manifest.integrations || [])) {
    const toolConfig = SUPPORTED_AI_TOOLS[toolName];
    if (!toolConfig) continue;

    const relativePath = toolConfig.file;

    state.integrations.set(relativePath, {
      relativePath,
      hash: null,  // Integration hashes are computed after generation
      size: null,
      category: 'integration',
      sourcePath: null,  // Generated, not copied from source
      metadata: {
        toolName,
        format: toolConfig.format,
        toolCategory: toolConfig.category,
        supports: toolConfig.supports
      }
    });
  }
}

/**
 * Calculate expected skill files.
 */
function calculateSkills(state, projectPath, manifest) {
  const skills = manifest.skills;
  if (!skills || !skills.installed) return;

  const skillNames = skills.names || [];
  if (skillNames.length === 0) return;

  const installations = skills.installations || [];

  for (const installation of installations) {
    const { agent, level } = installation;
    const skillsDir = getSkillsDirForAgent(agent, level, projectPath);
    if (!skillsDir) continue;

    for (const skillName of skillNames) {
      // Each skill is a directory containing files; we track the directory marker
      const relativeBase = level === 'project'
        ? getRelativePath(projectPath, join(skillsDir, skillName))
        : null;

      if (relativeBase) {
        state.skills.set(`skill:${agent}:${level}:${skillName}`, {
          relativePath: relativeBase,
          hash: null,  // Skill hashes are directory-level, tracked separately
          size: null,
          category: 'skill',
          sourcePath: null,
          metadata: { agent, level, skillName }
        });
      }
    }
  }
}

/**
 * Calculate expected command files.
 */
function calculateCommands(state, projectPath, manifest) {
  const commands = manifest.commands;
  if (!commands || !commands.installed) return;

  const commandNames = commands.names || [];
  if (commandNames.length === 0) return;

  const installations = commands.installations || [];

  for (const installation of installations) {
    const { agent, level } = installation;
    const commandsDir = getCommandsDirForAgent(agent, level, projectPath);
    if (!commandsDir) continue;

    for (const commandName of commandNames) {
      const relativeBase = level === 'project'
        ? getRelativePath(projectPath, join(commandsDir, commandName))
        : null;

      if (relativeBase) {
        state.commands.set(`command:${agent}:${level}:${commandName}`, {
          relativePath: relativeBase,
          hash: null,
          size: null,
          category: 'command',
          sourcePath: null,
          metadata: { agent, level, commandName }
        });
      }
    }
  }
}

/**
 * Get relative path from project root, converting absolute to relative.
 * @param {string} projectPath
 * @param {string} absPath
 * @returns {string}
 */
function getRelativePath(projectPath, absPath) {
  if (absPath.startsWith(projectPath)) {
    let rel = absPath.slice(projectPath.length);
    if (rel.startsWith('/') || rel.startsWith('\\')) {
      rel = rel.slice(1);
    }
    return rel;
  }
  return absPath;
}
