/**
 * Skills and Commands Installer
 *
 * High-level orchestration layer for installing Skills and slash commands
 * across multiple AI agents (Claude Code, OpenCode, Cursor, etc.).
 *
 * Architecture:
 * - Coordinates between low-level installers (utils/skills-installer.js)
 * - Handles remote downloads (utils/github.js)
 * - Aggregates results from multiple agent installations
 * - Provides user feedback via ora spinners
 *
 * @version 1.0.0
 */

import ora from 'ora';
import chalk from 'chalk';
import {
  installSkillsToMultipleAgents,
  installCommandsToMultipleAgents,
  getAvailableSkillNames,
  getAvailableCommandNames
} from '../utils/skills-installer.js';
import {
  downloadSkillToLocation,
  getSkillsDir,
  getProjectSkillsDir,
  writeSkillsManifest
} from '../utils/github.js';
import {
  getAgentDisplayName,
  getSkillsDirForAgent,
  getCommandsDirForAgent
} from '../config/ai-agent-paths.js';
import { getRepositoryInfo } from '../utils/registry.js';

/**
 * Get all skill files mapping (skill name -> file paths)
 * Used for remote download fallback
 * @returns {Object} Mapping of skill names to file paths
 */
function getSkillFiles() {
  const skills = getAvailableSkillNames();
  const mapping = {};

  for (const skillName of skills) {
    // Default files in each skill directory
    mapping[skillName] = [
      `skills/claude-code/${skillName}/SKILL.md`,
      `skills/claude-code/${skillName}/README.md`
    ];
  }

  return mapping;
}

/**
 * Install Skills to multiple AI agents
 *
 * Unified installation flow:
 * 1. Determines installation targets (agents + levels)
 * 2. Calls unified installer for local/bundled skills
 * 3. Falls back to remote download if needed
 * 4. Aggregates results and provides user feedback
 *
 * @param {Object} skillsConfig - Skills configuration
 * @param {boolean} skillsConfig.needsInstall - Whether skills installation is needed
 * @param {Array} skillsConfig.skillsInstallations - Array of {agent, level} objects
 * @param {Array} skillsConfig.updateTargets - Legacy: array of 'user'/'project' strings
 * @param {string} projectPath - Project root path
 * @param {Object} messages - i18n messages object
 * @param {Object} results - Results object to populate
 * @returns {Promise<void>}
 */
export async function installSkills(skillsConfig, projectPath, messages, results) {
  // Modern unified multi-agent installation
  if (skillsConfig.needsInstall && skillsConfig.skillsInstallations?.length > 0) {
    const skillSpinner = ora(messages.installingSkills).start();

    // Use new unified installer for multi-agent support
    const installResult = await installSkillsToMultipleAgents(
      skillsConfig.skillsInstallations,
      null, // Install all skills
      projectPath
    );

    // Collect results
    for (const agentResult of installResult.installations) {
      if (agentResult.installed.length > 0) {
        for (const skillName of agentResult.installed) {
          if (!results.skills.includes(skillName)) {
            results.skills.push(skillName);
          }
        }
      }
      for (const err of agentResult.errors) {
        results.errors.push(`${agentResult.agent} - ${err.skill}: ${err.error}`);
      }
    }

    // Collect skill file hashes for integrity tracking
    if (installResult.allFileHashes) {
      Object.assign(results.skillHashes, installResult.allFileHashes);
    }

    // Build location summary for display
    const targetLocations = skillsConfig.skillsInstallations.map(inst => {
      const displayName = getAgentDisplayName(inst.agent);
      const dir = getSkillsDirForAgent(inst.agent, inst.level, projectPath);
      return `${displayName} (${dir})`;
    }).join(', ');

    if (installResult.totalErrors === 0) {
      skillSpinner.succeed(messages.installedSkills
        .replace('{count}', installResult.totalInstalled)
        .replace('{locations}', targetLocations));
    } else {
      skillSpinner.warn(messages.installedSkillsWithErrors
        .replace('{count}', installResult.totalInstalled)
        .replace('{errors}', installResult.totalErrors));
    }
  } else if (skillsConfig.needsInstall && skillsConfig.updateTargets?.length > 0) {
    // Legacy fallback for backward compatibility (remote download)
    await installSkillsLegacy(skillsConfig, projectPath, messages, results);
  }
}

/**
 * Legacy skills installation (remote download)
 * Used for backward compatibility with older configurations
 *
 * @param {Object} skillsConfig - Skills configuration
 * @param {string} projectPath - Project root path
 * @param {Object} messages - i18n messages object
 * @param {Object} results - Results object to populate
 * @returns {Promise<void>}
 */
async function installSkillsLegacy(skillsConfig, projectPath, messages, results) {
  const skillSpinner = ora(messages.installingSkills).start();

  const skillFiles = getSkillFiles();
  let successCount = 0;
  let errorCount = 0;

  const repoInfo = getRepositoryInfo();

  for (const target of skillsConfig.updateTargets) {
    for (const [skillName, files] of Object.entries(skillFiles)) {
      const result = await downloadSkillToLocation(
        skillName,
        files,
        target,
        target === 'project' ? projectPath : null
      );

      if (result.success) {
        successCount++;
        if (!results.skills.includes(skillName)) {
          results.skills.push(skillName);
        }
      } else {
        errorCount++;
        const failedFiles = result.files.filter(f => !f.success).map(f => f.file).join(', ');
        results.errors.push(`Skill ${skillName} (${target}): failed to install ${failedFiles}`);
      }
    }

    // Write manifest for each target location
    const targetDir = target === 'project'
      ? getProjectSkillsDir(projectPath)
      : getSkillsDir();
    writeSkillsManifest(repoInfo.skills.version, targetDir);
  }

  const targetLocations = skillsConfig.updateTargets.map(t =>
    t === 'project' ? getProjectSkillsDir(projectPath) : getSkillsDir()
  ).join(', ');

  if (errorCount === 0) {
    skillSpinner.succeed(messages.installedSkills
      .replace('{count}', successCount)
      .replace('{locations}', targetLocations));
  } else {
    skillSpinner.warn(messages.installedSkillsWithErrors
      .replace('{count}', successCount)
      .replace('{errors}', errorCount));
  }
}

/**
 * Install slash commands to multiple AI agents
 *
 * Supports agents that have separate command directories (OpenCode, Cursor, etc.)
 * Claude Code merged commands into Skills in v2.1.3+
 *
 * @param {Object} skillsConfig - Skills configuration
 * @param {Array} skillsConfig.commandsInstallations - Array of {agent, level} or agent strings
 * @param {string} projectPath - Project root path
 * @param {Object} messages - i18n messages object
 * @param {Object} results - Results object to populate
 * @returns {Promise<void>}
 */
export async function installCommands(skillsConfig, projectPath, messages, results) {
  if (!skillsConfig.commandsInstallations || skillsConfig.commandsInstallations.length === 0) {
    return;
  }

  const cmdSpinner = ora(messages.installingCommands || 'Installing slash commands...').start();

  const cmdResult = await installCommandsToMultipleAgents(
    skillsConfig.commandsInstallations,
    null, // Install all commands
    projectPath
  );

  // Initialize commands results array if not exists
  results.commands = results.commands || [];

  // Collect results
  for (const agentResult of cmdResult.installations) {
    if (agentResult.installed.length > 0) {
      for (const cmdName of agentResult.installed) {
        if (!results.commands.includes(cmdName)) {
          results.commands.push(cmdName);
        }
      }
    }
    for (const err of agentResult.errors) {
      results.errors.push(`${agentResult.agent} command - ${err.command}: ${err.error}`);
    }
  }

  // Collect command file hashes for integrity tracking
  if (cmdResult.allFileHashes) {
    Object.assign(results.commandHashes, cmdResult.allFileHashes);
  }

  // Build location summary
  const cmdLocations = skillsConfig.commandsInstallations.map(item => {
    // Support both {agent, level} objects and simple agent strings (backward compatibility)
    const agent = typeof item === 'string' ? item : item.agent;
    const level = typeof item === 'string' ? 'project' : (item.level || 'project');
    const displayName = getAgentDisplayName(agent);
    const dir = getCommandsDirForAgent(agent, level, projectPath);
    return `${displayName} (${dir})`;
  }).join(', ');

  if (cmdResult.totalErrors === 0) {
    cmdSpinner.succeed((messages.installedCommands || 'Installed {count} commands to: {locations}')
      .replace('{count}', cmdResult.totalInstalled)
      .replace('{locations}', cmdLocations));
  } else {
    cmdSpinner.warn((messages.installedCommandsWithErrors || 'Installed {count} commands with {errors} errors')
      .replace('{count}', cmdResult.totalInstalled)
      .replace('{errors}', cmdResult.totalErrors));
  }
}

/**
 * Get summary of installed skills and commands
 *
 * @param {Object} results - Installation results
 * @returns {Object} Summary object
 */
export function getInstallationSummary(results) {
  return {
    skills: {
      count: results.skills?.length || 0,
      names: results.skills || []
    },
    commands: {
      count: results.commands?.length || 0,
      names: results.commands || []
    },
    errors: {
      count: results.errors?.length || 0,
      messages: results.errors || []
    }
  };
}

export default {
  installSkills,
  installCommands,
  getInstallationSummary
};
