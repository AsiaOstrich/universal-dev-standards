import chalk from 'chalk';
import { t } from '../i18n/messages.js';
import {
  promptDisplayLanguage,
  promptAITools,
  promptSkillsInstallLocation,
  promptLanguage,
  promptFramework,
  promptFormat,
  promptStandardOptions,
  promptContentMode,
  promptMethodology,
  promptCommandsInstallation,
  handleAgentsMdSharing,
  promptAgentsMd,
  promptReleaseMode
} from '../prompts/init.js';
import {
  promptIntegrationConfig
} from '../prompts/integrations.js';
import {
  getAgentConfig,
  getAgentDisplayName
} from '../utils/github.js';
import { getInstalledSkillsInfoForAgent } from '../utils/skills-installer.js';
import { integrationFileExists } from '../utils/integration-generator.js';
import { displayLanguageToLocale } from '../utils/locale.js';

/**
 * Execute the interactive initialization flow
 * @param {Object} options - CLI options
 * @param {Object} detected - Detected project environment
 * @param {string} projectPath - Current project path
 * @returns {Promise<Object|null>} Configuration object or null if cancelled
 */
export async function runInitFlow(options, detected, projectPath) {
  let msg = t().commands.init;
  
  // Initialize configuration variables
  let languages = options.lang ? [options.lang] : null;
  let frameworks = options.framework ? [options.framework] : null;
  let displayLanguage = options.locale || null;
  let format = options.format || null;
  let standardOptions = {};
  
  // Skills configuration
  let skillsConfig = {
    installed: false,
    location: null,
    needsInstall: false,
    updateTargets: [],
    skillsInstallations: [],
    commandsInstallations: []
  };

  let aiTools = [];
  let integrations = [];

  // === STEP 1: Display Language ===
  displayLanguage = await promptDisplayLanguage();
  msg = t().commands.init; // Re-fetch after language change
  const msgAfterLang = msg;

  // === STEP 2: AI Tools Selection ===
  aiTools = await promptAITools({
    claudeCode: detected.aiTools.claudeCode || false,
    cursor: detected.aiTools.cursor || false,
    windsurf: detected.aiTools.windsurf || false,
    cline: detected.aiTools.cline || false,
    copilot: detected.aiTools.copilot || false,
    antigravity: detected.aiTools.antigravity || false,
    codex: detected.aiTools.codex || false,
    opencode: detected.aiTools.opencode || false,
    geminiCli: detected.aiTools.geminiCli || false
  });

  if (aiTools.length === 0) {
    console.log();
    console.log(chalk.yellow(msgAfterLang.noAiToolsSelected || 'No AI tools selected.'));
    console.log(chalk.gray(msgAfterLang.noAiToolsExplanation || '  UDS provides development standards for AI coding assistants.'));
    console.log(chalk.gray(msgAfterLang.noAiToolsExplanation2 || '  Without an AI tool, there is nothing to install.'));
    console.log();
    process.exit(0);
  }

  // === STEP 3: Handle AGENTS.md sharing ===
  aiTools = handleAgentsMdSharing(aiTools);

  // === STEP 3.5: AGENTS.md universal output ===
  let generateAgentsMd = false;
  if (!options.agentsMd && options.agentsMd !== false) {
    // No explicit flag — prompt user (only if codex/opencode not selected)
    generateAgentsMd = await promptAgentsMd(aiTools);
  } else {
    generateAgentsMd = !!options.agentsMd;
  }

  const skillsSupportedTools = aiTools.filter(tool => {
    const config = getAgentConfig(tool);
    return config?.supportsSkills && config?.skills;
  });
  const hasSkillsTools = skillsSupportedTools.length > 0;

  // === STEP 4: Skills Installation ===
  if (hasSkillsTools) {
    const { getMarketplaceSkillsInfo } = await import('../utils/github.js');
    const marketplaceInfo = getMarketplaceSkillsInfo();

    console.log();
    console.log(chalk.cyan(msgAfterLang.skillsStatus));

    let hasAnyExisting = false;

    if (marketplaceInfo && marketplaceInfo.version) {
      hasAnyExisting = true;
      console.log(chalk.gray(`  ${msgAfterLang.skillsMarketplaceInstalled || 'Marketplace'}: v${marketplaceInfo.version}`));
    }

    for (const tool of skillsSupportedTools) {
      const displayName = getAgentDisplayName(tool);
      const projectInfo = getInstalledSkillsInfoForAgent(tool, 'project', projectPath);
      const userInfo = getInstalledSkillsInfoForAgent(tool, 'user');

      if (projectInfo || userInfo) {
        hasAnyExisting = true;
        if (projectInfo) {
          console.log(chalk.gray(`  ${displayName} ${msgAfterLang.projectLevel}: v${projectInfo.version || 'unknown'}`));
        }
        if (userInfo) {
          console.log(chalk.gray(`  ${displayName} ${msgAfterLang.userLevel}: v${userInfo.version || 'unknown'}`));
        }
      }
    }

    if (!hasAnyExisting) {
      console.log(chalk.gray(`  ${msgAfterLang.noSkillsDetected}`));
    }

    const installations = await promptSkillsInstallLocation(aiTools);

    if (installations.length > 0) {
      const isMarketplace = installations.some(i => i.level === 'marketplace');

      if (isMarketplace) {
        skillsConfig = {
          ...skillsConfig,
          installed: true,
          location: 'marketplace',
          needsInstall: false,
          updateTargets: [],
          skillsInstallations: installations
        };
      } else {
        skillsConfig = {
          ...skillsConfig,
          installed: true,
          location: installations.length === 1 ? installations[0].level : 'multiple',
          needsInstall: true,
          updateTargets: installations.map(i => i.level),
          skillsInstallations: installations
        };
      }
    }

    // === STEP 5: Slash Commands ===
    const commandsAgents = await promptCommandsInstallation(aiTools);
    if (commandsAgents.length > 0) {
      skillsConfig.commandsInstallations = commandsAgents;
    }
  }

  // === STEP 6: Standards Format ===
  // Default to 'ai'; only prompt when --experimental flag is used
  if (!format) {
    if (options.experimental) {
      format = await promptFormat();
    } else {
      format = 'ai';
    }
  }

  // === STEP 7: Standard Options ===
  standardOptions = await promptStandardOptions(3, displayLanguage, { experimental: options.experimental });

  // === STEP 7.5: Release Mode ===
  const releaseMode = await promptReleaseMode();

  // === STEP 8: Language Extensions ===
  if (!languages) {
    languages = await promptLanguage(detected.languages) || [];
  }

  // === STEP 9: Framework Extensions ===
  if (!frameworks) {
    frameworks = await promptFramework(detected.frameworks) || [];
  }

  // === STEP 10: Integrations ===
  integrations = [...aiTools];
  const integrationConfigs = {};
  
  if (integrations.length > 0) {
    const existingFiles = {};
    for (const tool of integrations) {
      existingFiles[tool] = integrationFileExists(tool, projectPath);
    }

    const hasAnyExisting = Object.values(existingFiles).some(v => v);
    const toolNames = integrations.length === 1
      ? integrations[0]
      : `${integrations.slice(0, -1).join(', ')} & ${integrations[integrations.length - 1]}`;

    const sharedConfig = await promptIntegrationConfig(toolNames, detected, hasAnyExisting);

    if (sharedConfig.mergeStrategy !== 'keep') {
      for (const tool of integrations) {
        integrationConfigs[tool] = { ...sharedConfig, tool };
      }
    }
  }

  skillsConfig.integrationConfigs = integrationConfigs;

  // === STEP 11: Content Mode ===
  // Default to 'index'; only prompt when --experimental flag is used
  let contentMode = 'index';
  if (aiTools.length > 0 && options.experimental) {
    contentMode = await promptContentMode();
  }
  skillsConfig.contentMode = contentMode;

  // === STEP 12: Methodology ===
  let methodology = null;
  if (options.experimental) {
    methodology = await promptMethodology();
  }
  skillsConfig.methodology = methodology;
  skillsConfig.locale = displayLanguageToLocale(displayLanguage);

  return {
    languages,
    frameworks,
    displayLanguage,
    format,
    standardOptions,
    skillsConfig,
    aiTools,
    integrations,
    contentMode,
    generateAgentsMd,
    releaseMode
  };
}
