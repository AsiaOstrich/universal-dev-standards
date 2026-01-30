import chalk from 'chalk';
import ora from 'ora';
import {
  manifestExists as isInitialized
} from '../core/manifest.js';
import { t, detectLanguage } from '../i18n/messages.js';
import { detectAll } from '../utils/detector.js';
import { promptConfirm } from '../prompts/init.js';
import { runInitFlow } from '../flows/init-flow.js';
import { installStandards } from '../installers/standards-installer.js';
import { installIntegrations } from '../installers/integration-installer.js';
import { installSkills, installCommands } from '../installers/skills-installer.js';
import { writeFinalManifest } from '../installers/manifest-installer.js';
import {
  getInstalledSkillsInfo,
  getProjectInstalledSkillsInfo,
  getAgentConfig
} from '../utils/github.js';

/**
 * Init command - initialize standards in current project
 * @param {Object} options - Command options
 */
export async function initCommand(options) {
  const projectPath = process.cwd();
  let msg = t().commands.init;
  let common = t().commands.common;

  console.log();
  console.log(chalk.bold(msg.title));
  console.log(chalk.gray('─'.repeat(50)));

  // STEP 1: Check if already initialized
  if (isInitialized(projectPath)) {
    console.log(chalk.yellow(msg.alreadyInitialized));
    console.log(chalk.gray(`  ${msg.useUpdateOrDelete}`));
    return;
  }

  // STEP 2: Detect project characteristics
  const spinner = ora(msg.detectingProject).start();
  const detected = detectAll(projectPath);
  spinner.succeed(msg.analysisComplete);

  // Show detected info
  const detectedLangs = Object.entries(detected.languages).filter(([, v]) => v).map(([k]) => k);
  const detectedFrameworks = Object.entries(detected.frameworks).filter(([, v]) => v).map(([k]) => k);
  const detectedTools = Object.entries(detected.aiTools).filter(([, v]) => v).map(([k]) => k);

  if (detectedLangs.length > 0) console.log(chalk.gray(`  ${msg.languages}: ${detectedLangs.join(', ')}`));
  if (detectedFrameworks.length > 0) console.log(chalk.gray(`  ${msg.frameworks}: ${detectedFrameworks.join(', ')}`));
  if (detectedTools.length > 0) console.log(chalk.gray(`  ${msg.aiTools}: ${detectedTools.join(', ')}`));
  console.log();

  // Configuration object
  let config = {};

  if (!options.yes) {
    // Interactive Mode
    config = await runInitFlow(options, detected, projectPath);
    if (!config) return; // Flow cancelled or exited
    // Re-fetch translations after language selection in flow
    msg = t().commands.init;
    common = t().commands.common;
  } else {
    // Non-interactive Mode (Defaults/Flags)
    config = buildNonInteractiveConfig(options, detected, projectPath);
  }

  // Show Configuration Summary
  displaySummary(config, msg, common);

  // Confirm Installation
  if (!options.yes) {
    const confirmed = await promptConfirm(msg.proceedInstall);
    if (!confirmed) {
      console.log(chalk.yellow(msg.installCancelled));
      return;
    }
  }

  // ===== Execute Installation =====
  console.log();
  
  // 1. Install Standards
  const standardsResults = await installStandards(config, projectPath);

  // 2. Install Integrations
  const integrationResults = await installIntegrations(config, projectPath);

  // 3. Install Skills & Commands
  const skillsResults = {
    skills: [],
    commands: [],
    errors: [],
    skillHashes: {},
    commandHashes: {}
  };
  await installSkills(config.skillsConfig, projectPath, msg, skillsResults);
  await installCommands(config.skillsConfig, projectPath, msg, skillsResults);

  // Combine results
  const combinedResults = {
    standards: standardsResults.standards,
    extensions: standardsResults.extensions,
    integrations: integrationResults.integrations,
    skills: skillsResults.skills,
    commands: skillsResults.commands,
    errors: [
      ...standardsResults.errors,
      ...integrationResults.errors,
      ...skillsResults.errors
    ],
    fileHashes: standardsResults.fileHashes,
    skillHashes: skillsResults.skillHashes,
    commandHashes: skillsResults.commandHashes,
    integrationBlockHashes: integrationResults.integrationBlockHashes,
    manifestIntegrationConfigs: integrationResults.manifestIntegrationConfigs
  };

  // 4. Write Manifest & Display Summary
  writeFinalManifest(config, combinedResults, projectPath);
}

/**
 * Build configuration for non-interactive mode
 */
function buildNonInteractiveConfig(options, detected, projectPath) {
  const displayLanguage = options.locale || detectLanguage(null);
  
  // Determine AI tools
  const detectedAiTools = Object.keys(detected.aiTools).filter(k => detected.aiTools[k]);
  const aiToolsNormalized = detectedAiTools.map(k => {
    if (k === 'claudeCode') return 'claude-code';
    if (k === 'geminiCli') return 'gemini-cli';
    return k;
  });

  // Skills Configuration Logic
  const hasSkillsCompatibleTool = aiToolsNormalized.some(t => t === 'claude-code' || t === 'opencode');
  const onlySkillsCompatibleTools = aiToolsNormalized.every(t => t === 'claude-code' || t === 'opencode');
  
  let skillsLocationFlag = options.skillsLocation;
  if (!skillsLocationFlag) {
    skillsLocationFlag = (hasSkillsCompatibleTool && onlySkillsCompatibleTools) ? 'marketplace' : 'none';
  }

  const contentModeFlag = options.contentMode || 'index';
  let skillsConfig = {};

  if (skillsLocationFlag === 'marketplace') {
    skillsConfig = {
      installed: true,
      location: 'marketplace',
      needsInstall: false,
      updateTargets: [],
      standardsScope: 'minimal',
      contentMode: contentModeFlag
    };
  } else if (skillsLocationFlag === 'none') {
    skillsConfig = {
      installed: false,
      location: null,
      needsInstall: false,
      updateTargets: [],
      standardsScope: 'full',
      contentMode: contentModeFlag
    };
  } else {
    // Determine location (project vs user)
    const userSkillsInfo = getInstalledSkillsInfo();
    const projectSkillsInfo = getProjectInstalledSkillsInfo(projectPath);
    let location = 'user';
    
    if (skillsLocationFlag === 'project' || projectSkillsInfo?.installed) {
      location = 'project';
    }

    skillsConfig = {
      installed: true,
      location,
      needsInstall: skillsLocationFlag === 'project' || skillsLocationFlag === 'user' || (!userSkillsInfo?.installed && !projectSkillsInfo?.installed),
      updateTargets: [location],
      standardsScope: 'minimal',
      contentMode: contentModeFlag
    };
  }

  // Auto-install commands
  const commandsSupportedAgents = aiToolsNormalized.filter(tool => {
    const config = getAgentConfig(tool);
    return config?.commands !== null;
  });

  if (commandsSupportedAgents.length > 0) {
    skillsConfig.commandsInstallations = commandsSupportedAgents.map(agent => ({
      agent,
      level: 'project'
    }));
  }

  return {
    level: options.level ? parseInt(options.level, 10) : 2,
    languages: options.lang ? [options.lang] : Object.keys(detected.languages).filter(k => detected.languages[k]),
    frameworks: options.framework ? [options.framework] : Object.keys(detected.frameworks).filter(k => detected.frameworks[k]),
    displayLanguage,
    format: options.format || 'ai',
    standardOptions: {
      workflow: options.workflow || 'github-flow',
      merge_strategy: options.mergeStrategy || 'squash',
      commit_language: options.commitLang || 'english',
      test_levels: options.testLevels ? options.testLevels.split(',') : ['unit-testing', 'integration-testing']
    },
    skillsConfig,
    aiTools: aiToolsNormalized,
    integrations: Object.keys(detected.aiTools).filter(k => detected.aiTools[k] && k !== 'claudeCode'),
    contentMode: skillsConfig.contentMode || 'minimal',
    standardsScope: skillsConfig.standardsScope || 'full',
    methodology: null
  };
}

/**
 * Get label for a value from translation labels object
 * @param {string} key - The translation key (e.g., 'gitWorkflow', 'mergeStrategy')
 * @param {string} value - The value to look up
 * @returns {string} The label or the original value if not found
 */
function getValueLabel(key, value) {
  const labels = t()[key]?.labels;
  return labels?.[value] || value;
}

/**
 * Display configuration summary
 * Order follows init-flow.js question sequence for consistency
 */
function displaySummary(config, msg, common) {
  console.log(chalk.cyan(msg.configSummary));

  // 1. Display Language (STEP 1)
  const displayLangLabel = config.displayLanguage === 'zh-tw' ? '繁體中文' : config.displayLanguage === 'zh-cn' ? '简体中文' : 'English';
  console.log(chalk.gray(`  ${msg.displayLanguageLabel || 'Display Language'}: ${displayLangLabel}`));

  // 2. AI Tools (STEP 2)
  console.log(chalk.gray(`  ${common.aiTools}: ${config.aiTools.length > 0 ? config.aiTools.join(', ') : common.none}`));

  // 3. Skills Installation (STEP 4)
  if (config.skillsConfig.installed) {
    let skillsStatusText;
    if (config.skillsConfig.location === 'marketplace') {
      skillsStatusText = msg.skillsMarketplace;
    } else {
      skillsStatusText = config.skillsConfig.needsInstall
        ? msg.skillsInstallTo.replace('{location}', config.skillsConfig.location)
        : msg.skillsUsingExisting.replace('{location}', config.skillsConfig.location);
    }
    console.log(chalk.gray(`  ${msg.skillsLabel}: ${skillsStatusText}`));
  }

  // 4. Standards Scope (STEP 6)
  console.log(chalk.gray(`  ${msg.standardsScope}: ${config.skillsConfig.standardsScope === 'minimal' ? msg.standardsScopeLean : msg.standardsScopeComplete}`));

  // 5. Adoption Level (STEP 7)
  console.log(chalk.gray(`  ${common.level}: ${config.level}`));

  // 6. Standards Format (STEP 8)
  const formatLabels = t().format?.labels || { ai: 'Compact', human: 'Detailed', both: 'Both' };
  console.log(chalk.gray(`  ${common.format}: ${formatLabels[config.format]}`));

  // 7. Standard Options (STEP 9) - use labels for human-readable values
  if (config.standardOptions.workflow) {
    console.log(chalk.gray(`  ${msg.gitWorkflow}: ${getValueLabel('gitWorkflow', config.standardOptions.workflow)}`));
  }
  if (config.standardOptions.merge_strategy) {
    console.log(chalk.gray(`  ${msg.mergeStrategy}: ${getValueLabel('mergeStrategy', config.standardOptions.merge_strategy)}`));
  }
  if (config.standardOptions.commit_language) {
    console.log(chalk.gray(`  ${msg.commitLanguage}: ${getValueLabel('commitLanguage', config.standardOptions.commit_language)}`));
  }
  if (config.standardOptions.test_levels?.length > 0) {
    const testLabels = config.standardOptions.test_levels.map(level => getValueLabel('testLevels', level));
    console.log(chalk.gray(`  ${msg.testLevels}: ${testLabels.join(', ')}`));
  }

  // 8. Language Extensions (STEP 10)
  console.log(chalk.gray(`  ${msg.languages}: ${config.languages.length > 0 ? config.languages.join(', ') : common.none}`));

  // 9. Framework Extensions (STEP 11)
  console.log(chalk.gray(`  ${msg.frameworks}: ${config.frameworks.length > 0 ? config.frameworks.join(', ') : common.none}`));

  // 10. Integrations (STEP 12)
  console.log(chalk.gray(`  ${msg.integrations}: ${config.integrations.length > 0 ? config.integrations.join(', ') : common.none}`));

  // 11. Content Mode (STEP 13)
  const contentModeLabels = t().contentMode?.labels || { index: 'Standard', full: 'Full', minimal: 'Minimal' };
  console.log(chalk.gray(`  ${msg.contentModeLabel}: ${contentModeLabels[config.contentMode] || config.contentMode}`));

  // 12. Methodology (STEP 14, experimental)
  if (config.skillsConfig.methodology) {
    console.log(chalk.gray(`  ${common.methodology}: ${config.skillsConfig.methodology} ${chalk.yellow('[Experimental]')}`));
  }

  console.log();
}