import { existsSync, rmSync } from 'fs';
import {
  getSkillsDirForAgent,
  getCommandsDirForAgent,
  getAgentsDirForAgent,
  getWorkflowsDirForAgent
} from '../config/ai-agent-paths.js';

/**
 * Uninstall skills, commands, agents, and workflows
 * @param {string} projectPath - Project root path
 * @param {Object} manifest - Parsed manifest object
 * @param {Object} options - { dryRun, includeUserLevel }
 * @returns {Object} { removed: string[], skipped: string[], errors: string[], marketplaceWarnings: string[] }
 */
export function uninstallSkills(projectPath, manifest, options = {}) {
  const result = { removed: [], skipped: [], errors: [], marketplaceWarnings: [] };

  // Check for marketplace-only skills
  if (manifest?.skills?.location === 'marketplace') {
    result.marketplaceWarnings.push(
      'Skills installed via Marketplace must be removed manually in Claude Code.'
    );
  }

  // Process skill installations
  const skillInstalls = manifest?.skills?.installations || [];
  for (const install of skillInstalls) {
    processInstallation(install, 'skills', projectPath, options, result);
  }

  // Process command installations
  const cmdInstalls = manifest?.commands?.installations || [];
  for (const install of cmdInstalls) {
    processInstallation(install, 'commands', projectPath, options, result);
  }

  return result;
}

/**
 * Process a single skill/command/agent/workflow installation for removal
 */
function processInstallation(install, type, projectPath, options, result) {
  const { dryRun = false, includeUserLevel = false } = options;
  const { agent, level } = install;

  // Determine directory getter
  const getDirFn = type === 'skills' ? getSkillsDirForAgent :
                   type === 'commands' ? getCommandsDirForAgent :
                   type === 'agents' ? getAgentsDirForAgent :
                   getWorkflowsDirForAgent;

  const dir = getDirFn(agent, level || 'project', projectPath);
  if (!dir) {
    result.skipped.push(`${type}/${agent} (path not resolved)`);
    return;
  }

  const isUserLevel = level === 'user';
  const label = `${type}/${agent} [${level || 'project'}]`;

  // Skip user-level unless explicitly included
  if (isUserLevel && !includeUserLevel) {
    result.skipped.push(`${label} (user-level, use --all to include)`);
    return;
  }

  if (!existsSync(dir)) {
    result.skipped.push(`${label} (not found)`);
    return;
  }

  if (dryRun) {
    result.removed.push(`${label} → ${dir}`);
    return;
  }

  try {
    rmSync(dir, { recursive: true, force: true });
    result.removed.push(`${label} → ${dir}`);
  } catch (error) {
    result.errors.push(`${label} — ${error.message}`);
  }
}
