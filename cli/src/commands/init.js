import chalk from 'chalk';
import ora from 'ora';
import { basename, join } from 'path';
import {
  getStandardsByLevel,
  getRepositoryInfo,
  getSkillFiles,
  getStandardSource,
  getOptionSource,
  findOption
} from '../utils/registry.js';
import { detectAll } from '../utils/detector.js';
import {
  copyStandard,
  copyIntegration,
  writeManifest,
  isInitialized
} from '../utils/copier.js';
import { t } from '../i18n/messages.js';
import {
  downloadSkillToLocation,
  getInstalledSkillsInfo,
  getProjectInstalledSkillsInfo,
  writeSkillsManifest,
  getSkillsDir,
  getProjectSkillsDir
} from '../utils/github.js';
import {
  installSkillsToMultipleAgents,
  installCommandsToMultipleAgents,
  getInstalledSkillsInfoForAgent
} from '../utils/skills-installer.js';
import {
  getAgentConfig,
  getAgentDisplayName,
  getSkillsDirForAgent,
  getCommandsDirForAgent
} from '../config/ai-agent-paths.js';
import {
  promptAITools,
  promptSkillsInstallLocation,
  promptStandardsScope,
  promptLevel,
  promptLanguage,
  promptFramework,
  promptLocale,
  promptConfirm,
  promptFormat,
  promptStandardOptions,
  promptContentMode,
  promptMethodology,
  promptCommandsInstallation,
  handleAgentsMdSharing
} from '../prompts/init.js';
import {
  promptIntegrationConfig
} from '../prompts/integrations.js';
import {
  writeIntegrationFile,
  integrationFileExists,
  getToolFilePath
} from '../utils/integration-generator.js';
import { computeFileHash } from '../utils/hasher.js';

// Integration file mappings (legacy - for fallback)
const INTEGRATION_MAPPINGS = {
  cursor: {
    source: 'integrations/cursor/.cursorrules',
    target: '.cursorrules'
  },
  windsurf: {
    source: 'integrations/windsurf/.windsurfrules',
    target: '.windsurfrules'
  },
  cline: {
    source: 'integrations/cline/.clinerules',
    target: '.clinerules'
  },
  copilot: {
    source: 'integrations/github-copilot/copilot-instructions.md',
    target: '.github/copilot-instructions.md'
  },
  antigravity: {
    source: 'integrations/google-antigravity/INSTRUCTIONS.md',
    target: 'INSTRUCTIONS.md'
  },
  codex: {
    source: 'integrations/openai-codex/AGENTS.md',
    target: 'AGENTS.md'
  },
  'gemini-cli': {
    source: 'integrations/gemini-cli/GEMINI.md',
    target: 'GEMINI.md'
  },
  opencode: {
    source: 'integrations/opencode/AGENTS.md',
    target: 'AGENTS.md'
  }
};

// Extension file mappings
const EXTENSION_MAPPINGS = {
  csharp: 'extensions/languages/csharp-style.md',
  php: 'extensions/languages/php-style.md',
  'fat-free': 'extensions/frameworks/fat-free-patterns.md',
  'zh-tw': 'extensions/locales/zh-tw.md'
};

/**
 * Init command - initialize standards in current project
 * @param {Object} options - Command options
 */
export async function initCommand(options) {
  const projectPath = process.cwd();
  const msg = t().commands.init;
  const common = t().commands.common;

  // Note: UI language is now set globally in uds.js preAction hook

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
  const detectedLangs = Object.entries(detected.languages)
    .filter(([, v]) => v)
    .map(([k]) => k);
  const detectedFrameworks = Object.entries(detected.frameworks)
    .filter(([, v]) => v)
    .map(([k]) => k);
  const detectedTools = Object.entries(detected.aiTools)
    .filter(([, v]) => v)
    .map(([k]) => k);

  if (detectedLangs.length > 0) {
    console.log(chalk.gray(`  ${msg.languages}: ${detectedLangs.join(', ')}`));
  }
  if (detectedFrameworks.length > 0) {
    console.log(chalk.gray(`  ${msg.frameworks}: ${detectedFrameworks.join(', ')}`));
  }
  if (detectedTools.length > 0) {
    console.log(chalk.gray(`  ${msg.aiTools}: ${detectedTools.join(', ')}`));
  }
  console.log();

  // Initialize configuration variables
  let level = options.level ? parseInt(options.level, 10) : null;
  let languages = options.lang ? [options.lang] : null;
  let frameworks = options.framework ? [options.framework] : null;
  let locale = options.locale || null;
  let format = options.format || null;
  let standardOptions = {};

  // Skills configuration (unified for all AI agents)
  let skillsConfig = {
    installed: false,
    location: null,       // Legacy: single location for backward compatibility
    needsInstall: false,
    updateTargets: [],    // Legacy: array of 'user' or 'project'
    // New: multi-agent installations
    skillsInstallations: [],  // Array of {agent, level}
    commandsInstallations: [] // Array of agent identifiers
  };

  // AI tools configuration
  let aiTools = [];
  let integrations = [];

  if (!options.yes) {
    // ===== Interactive mode =====

    // STEP 3: Ask for AI tools (all 9 supported tools)
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

    // Handle AGENTS.md sharing notification (Codex + OpenCode)
    aiTools = handleAgentsMdSharing(aiTools);

    // Check which tools support skills
    const skillsSupportedTools = aiTools.filter(tool => {
      const config = getAgentConfig(tool);
      return config?.supportsSkills && config?.skills;
    });
    const hasSkillsTools = skillsSupportedTools.length > 0;

    // STEP 4: Skills handling (unified for all AI agents)
    // Now supports multiple agents with individual user/project level choices
    if (hasSkillsTools) {
      // Check existing installations for each skills-supported agent
      console.log();
      console.log(chalk.cyan(msg.skillsStatus));

      let hasAnyExisting = false;
      for (const tool of skillsSupportedTools) {
        const displayName = getAgentDisplayName(tool);
        const projectInfo = getInstalledSkillsInfoForAgent(tool, 'project', projectPath);
        const userInfo = getInstalledSkillsInfoForAgent(tool, 'user');

        if (projectInfo || userInfo) {
          hasAnyExisting = true;
          if (projectInfo) {
            console.log(chalk.gray(`  ${displayName} ${msg.projectLevel}: v${projectInfo.version || 'unknown'}`));
          }
          if (userInfo) {
            console.log(chalk.gray(`  ${displayName} ${msg.userLevel}: v${userInfo.version || 'unknown'}`));
          }
        }
      }

      if (!hasAnyExisting) {
        console.log(chalk.gray(`  ${msg.noSkillsDetected}`));
      }

      // Prompt for installation locations (multi-agent, multi-select)
      const installations = await promptSkillsInstallLocation(aiTools);

      if (installations.length > 0) {
        // Check if marketplace was selected
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
          // File-based installations
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

      // STEP 4.5: Slash commands installation (for supported agents)
      const commandsAgents = await promptCommandsInstallation(aiTools);
      if (commandsAgents.length > 0) {
        skillsConfig.commandsInstallations = commandsAgents;
      }
    }

    // STEP 5: Standards scope (if Skills are installed)
    const standardsScope = await promptStandardsScope(skillsConfig.installed);

    // STEP 6: Adoption level
    if (!level) {
      level = await promptLevel();
    }

    // STEP 7: Standards format
    if (!format) {
      format = await promptFormat();
    }

    // STEP 8: Standard options
    standardOptions = await promptStandardOptions(level);

    // STEP 9: Language extensions
    if (!languages) {
      languages = await promptLanguage(detected.languages) || [];
    }

    // STEP 10: Framework extensions
    if (!frameworks) {
      frameworks = await promptFramework(detected.frameworks) || [];
    }

    // STEP 11: Locale
    if (!locale) {
      locale = await promptLocale();
    }

    // Determine integrations from AI tools (excluding claude-code)
    integrations = aiTools.filter(t => t !== 'claude-code');

    // STEP 12: Integration configuration for non-Claude tools
    // All tools share the same configuration since they have identical functionality
    const integrationConfigs = {};
    if (integrations.length > 0) {
      console.log();
      console.log(chalk.cyan(msg.integrationConfig));

      if (integrations.length > 1) {
        console.log(chalk.gray(`  ${msg.sharedRuleConfig}`));
        console.log();
      }

      // Check if any existing files
      const existingFiles = {};
      for (const tool of integrations) {
        existingFiles[tool] = integrationFileExists(tool, projectPath);
      }

      const hasAnyExisting = Object.values(existingFiles).some(v => v);

      // Prompt configuration once for all tools
      // Use first tool as representative, but mention all tools
      const toolNames = integrations.length === 1
        ? integrations[0]
        : `${integrations.slice(0, -1).join(', ')} & ${integrations[integrations.length - 1]}`;

      const sharedConfig = await promptIntegrationConfig(toolNames, detected, hasAnyExisting);

      // Apply shared config to all tools (unless user chose to keep existing)
      if (sharedConfig.mergeStrategy !== 'keep') {
        for (const tool of integrations) {
          // Each tool gets the same config but with its specific tool name
          integrationConfigs[tool] = { ...sharedConfig, tool };
        }
      }
    }

    // Store integration configs for later use
    skillsConfig.integrationConfigs = integrationConfigs;

    // Store standards scope for later use
    skillsConfig.standardsScope = standardsScope;

    // STEP 13: Content mode for integration files (if any AI tools selected)
    let contentMode = 'minimal'; // default for backward compatibility
    if (aiTools.length > 0) {
      contentMode = await promptContentMode();
    }
    skillsConfig.contentMode = contentMode;

    // STEP 14: Development methodology (experimental - requires -E flag)
    let methodology = null;
    if (options.experimental) {
      methodology = await promptMethodology();
    }
    skillsConfig.methodology = methodology;

  } else {
    // ===== Non-interactive mode =====
    level = level || 2;
    format = format || 'ai';
    languages = languages || Object.keys(detected.languages).filter(k => detected.languages[k]);
    frameworks = frameworks || Object.keys(detected.frameworks).filter(k => detected.frameworks[k]);
    integrations = Object.keys(detected.aiTools).filter(k => detected.aiTools[k] && k !== 'claudeCode');

    // Default standard options
    standardOptions = {
      workflow: options.workflow || 'github-flow',
      merge_strategy: options.mergeStrategy || 'squash',
      commit_language: options.commitLang || 'english',
      test_levels: options.testLevels ? options.testLevels.split(',') : ['unit-testing', 'integration-testing']
    };

    // Determine AI tools from detection for skills compatibility check
    const detectedAiTools = Object.keys(detected.aiTools).filter(k => detected.aiTools[k]);
    // Map detected keys to standard tool names
    const aiToolsNormalized = detectedAiTools.map(k => {
      if (k === 'claudeCode') return 'claude-code';
      if (k === 'geminiCli') return 'gemini-cli';
      return k;
    });

    // Assign normalized AI tools to manifest variable
    aiTools = aiToolsNormalized;

    // Check if only skills-compatible tools are detected
    const hasSkillsCompatibleTool = aiToolsNormalized.some(t => t === 'claude-code' || t === 'opencode');
    const onlySkillsCompatibleTools = aiToolsNormalized.every(t => t === 'claude-code' || t === 'opencode');

    // Handle Skills configuration based on CLI flag
    // Default: marketplace only if all detected tools support skills
    // If non-skills tools are detected, default to 'none' (full standards)
    let skillsLocationFlag = options.skillsLocation;
    if (!skillsLocationFlag) {
      skillsLocationFlag = (hasSkillsCompatibleTool && onlySkillsCompatibleTools) ? 'marketplace' : 'none';
    }

    // Content mode from CLI flag (default: index for best balance)
    const contentModeFlag = options.contentMode || 'index';

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
    } else if (skillsLocationFlag === 'project') {
      skillsConfig = {
        installed: true,
        location: 'project',
        needsInstall: true,
        updateTargets: ['project'],
        standardsScope: 'minimal',
        contentMode: contentModeFlag
      };
    } else if (skillsLocationFlag === 'user') {
      skillsConfig = {
        installed: true,
        location: 'user',
        needsInstall: true,
        updateTargets: ['user'],
        standardsScope: 'minimal',
        contentMode: contentModeFlag
      };
    } else {
      // Fallback: auto-detect user/project installation
      const userSkillsInfo = getInstalledSkillsInfo();
      const projectSkillsInfo = getProjectInstalledSkillsInfo(projectPath);

      if (userSkillsInfo?.installed || projectSkillsInfo?.installed) {
        const location = projectSkillsInfo?.installed ? 'project' : 'user';
        skillsConfig = {
          installed: true,
          location,
          needsInstall: false,
          updateTargets: [],
          standardsScope: 'minimal',
          contentMode: contentModeFlag
        };
      } else {
        // Fallback to marketplace if nothing detected
        skillsConfig = {
          installed: true,
          location: 'marketplace',
          needsInstall: false,
          updateTargets: [],
          standardsScope: 'minimal',
          contentMode: contentModeFlag
        };
      }
    }

    // Auto-install commands for detected agents that support commands
    // This matches the interactive mode behavior where commands are checked by default
    const commandsSupportedAgents = aiToolsNormalized.filter(tool => {
      const config = getAgentConfig(tool);
      return config?.commands !== null;
    });

    if (commandsSupportedAgents.length > 0) {
      skillsConfig.commandsInstallations = commandsSupportedAgents;
    }
  }

  // Configuration summary
  console.log();
  console.log(chalk.cyan(msg.configSummary));
  console.log(chalk.gray(`  ${common.level}: ${level}`));
  console.log(chalk.gray(`  ${common.format}: ${format === 'ai' ? 'Compact' : format === 'human' ? 'Detailed' : 'Both'}`));
  console.log(chalk.gray(`  ${msg.standardsScope}: ${skillsConfig.standardsScope === 'minimal' ? msg.standardsScopeLean : msg.standardsScopeComplete}`));
  console.log(chalk.gray(`  ${msg.contentModeLabel}: ${skillsConfig.contentMode === 'full' ? msg.contentModeFull : skillsConfig.contentMode === 'index' ? msg.contentModeIndex : msg.contentModeMinimal}`));
  console.log(chalk.gray(`  ${msg.languages}: ${languages.length > 0 ? languages.join(', ') : common.none}`));
  console.log(chalk.gray(`  ${msg.frameworks}: ${frameworks.length > 0 ? frameworks.join(', ') : common.none}`));
  console.log(chalk.gray(`  ${msg.locale}: ${locale || msg.localeDefault}`));
  console.log(chalk.gray(`  ${common.aiTools}: ${aiTools.length > 0 ? aiTools.join(', ') : common.none}`));
  console.log(chalk.gray(`  ${msg.integrations}: ${integrations.length > 0 ? integrations.join(', ') : common.none}`));
  console.log(chalk.gray(`  ${common.methodology}: ${skillsConfig.methodology || common.none}${skillsConfig.methodology ? chalk.yellow(' [Experimental]') : ''}`));

  if (skillsConfig.installed) {
    let skillsStatusText;
    if (skillsConfig.location === 'marketplace') {
      skillsStatusText = msg.skillsMarketplace;
    } else {
      skillsStatusText = skillsConfig.needsInstall
        ? msg.skillsInstallTo.replace('{location}', skillsConfig.location)
        : msg.skillsUsingExisting.replace('{location}', skillsConfig.location);
    }
    console.log(chalk.gray(`  ${msg.skillsLabel}: ${skillsStatusText}`));
  }

  // Show selected standard options
  if (standardOptions.workflow) {
    console.log(chalk.gray(`  ${msg.gitWorkflow}: ${standardOptions.workflow}`));
  }
  if (standardOptions.merge_strategy) {
    console.log(chalk.gray(`  ${msg.mergeStrategy}: ${standardOptions.merge_strategy}`));
  }
  if (standardOptions.commit_language) {
    console.log(chalk.gray(`  ${msg.commitLanguage}: ${standardOptions.commit_language}`));
  }
  if (standardOptions.test_levels && standardOptions.test_levels.length > 0) {
    console.log(chalk.gray(`  ${msg.testLevels}: ${standardOptions.test_levels.join(', ')}`));
  }
  console.log();

  if (!options.yes) {
    const confirmed = await promptConfirm(msg.proceedInstall);
    if (!confirmed) {
      console.log(chalk.yellow(msg.installCancelled));
      return;
    }
  }

  // ===== Start installation =====
  console.log();
  const copySpinner = ora(msg.copyingStandards).start();

  const results = {
    standards: [],
    extensions: [],
    integrations: [],
    skills: [],
    commands: [],
    errors: []
  };

  // Get standards for the selected level
  const standards = getStandardsByLevel(level);

  // Determine which standards to copy based on scope
  const standardsToCopy = skillsConfig.standardsScope === 'minimal'
    ? standards.filter(s => s.category === 'reference')
    : standards.filter(s => s.category === 'reference' || s.category === 'skill');

  // Helper to copy standard with format awareness
  const copyStandardWithFormat = async (std, targetFormat) => {
    const sourcePath = getStandardSource(std, targetFormat);
    const result = await copyStandard(sourcePath, '.standards', projectPath);
    return { ...result, sourcePath };
  };

  // Helper to copy option files
  const copyOptionFiles = async (std, optionCategory, selectedOptionIds, targetFormat) => {
    const copiedOptions = [];
    if (!std.options || !std.options[optionCategory]) return copiedOptions;

    const optionIds = Array.isArray(selectedOptionIds) ? selectedOptionIds : [selectedOptionIds];
    for (const optionId of optionIds) {
      const option = findOption(std, optionCategory, optionId);
      if (option) {
        const sourcePath = getOptionSource(option, targetFormat);
        const result = await copyStandard(sourcePath, '.standards/options', projectPath);
        if (result.success) {
          copiedOptions.push(sourcePath);
        } else {
          results.errors.push(`${sourcePath}: ${result.error}`);
        }
      }
    }
    return copiedOptions;
  };

  // Copy standards based on format
  const formatsToUse = format === 'both' ? ['ai', 'human'] : [format];

  for (const std of standardsToCopy) {
    for (const targetFormat of formatsToUse) {
      const { success, sourcePath, error } = await copyStandardWithFormat(std, targetFormat);
      if (success) {
        results.standards.push(sourcePath);
      } else {
        results.errors.push(`${sourcePath}: ${error}`);
      }
    }

    // Copy selected options for this standard
    if (std.options) {
      for (const targetFormat of formatsToUse) {
        // Git workflow options
        if (std.id === 'git-workflow') {
          if (standardOptions.workflow) {
            const copied = await copyOptionFiles(std, 'workflow', standardOptions.workflow, targetFormat);
            results.standards.push(...copied);
          }
          if (standardOptions.merge_strategy) {
            const copied = await copyOptionFiles(std, 'merge_strategy', standardOptions.merge_strategy, targetFormat);
            results.standards.push(...copied);
          }
        }
        // Commit message options
        if (std.id === 'commit-message' && standardOptions.commit_language) {
          const copied = await copyOptionFiles(std, 'commit_language', standardOptions.commit_language, targetFormat);
          results.standards.push(...copied);
        }
        // Testing options
        if (std.id === 'testing' && standardOptions.test_levels) {
          const copied = await copyOptionFiles(std, 'test_level', standardOptions.test_levels, targetFormat);
          results.standards.push(...copied);
        }
      }
    }
  }

  copySpinner.succeed(msg.copiedStandards.replace('{count}', results.standards.length));

  // Copy extensions
  if (languages.length > 0 || frameworks.length > 0 || locale) {
    const extSpinner = ora(msg.copyingExtensions).start();

    for (const lang of languages) {
      if (EXTENSION_MAPPINGS[lang]) {
        const result = await copyStandard(EXTENSION_MAPPINGS[lang], '.standards', projectPath);
        if (result.success) {
          results.extensions.push(EXTENSION_MAPPINGS[lang]);
        } else {
          results.errors.push(`${EXTENSION_MAPPINGS[lang]}: ${result.error}`);
        }
      }
    }

    for (const fw of frameworks) {
      if (EXTENSION_MAPPINGS[fw]) {
        const result = await copyStandard(EXTENSION_MAPPINGS[fw], '.standards', projectPath);
        if (result.success) {
          results.extensions.push(EXTENSION_MAPPINGS[fw]);
        } else {
          results.errors.push(`${EXTENSION_MAPPINGS[fw]}: ${result.error}`);
        }
      }
    }

    if (locale && EXTENSION_MAPPINGS[locale]) {
      const result = await copyStandard(EXTENSION_MAPPINGS[locale], '.standards', projectPath);
      if (result.success) {
        results.extensions.push(EXTENSION_MAPPINGS[locale]);
      } else {
        results.errors.push(`${EXTENSION_MAPPINGS[locale]}: ${result.error}`);
      }
    }

    extSpinner.succeed(msg.copiedExtensions.replace('{count}', results.extensions.length));
  }

  // Build installed standards list for compliance instructions (used by all AI tools)
  const installedStandardsList = results.standards.map(s => basename(s));

  // Determine common language setting
  let commonLanguage = 'en';
  if (locale === 'zh-tw') {
    commonLanguage = 'zh-tw';
  } else if (standardOptions?.commit_language === 'bilingual') {
    commonLanguage = 'bilingual';
  } else if (standardOptions?.commit_language === 'traditional-chinese') {
    commonLanguage = 'zh-tw';
  }

  // Generate and write integrations
  if (integrations.length > 0) {
    const intSpinner = ora(msg.generatingIntegrations).start();
    const integrationConfigs = skillsConfig.integrationConfigs || {};

    // Track generated files to handle AGENTS.md sharing (codex + opencode)
    const generatedFiles = new Set();

    for (const tool of integrations) {
      // Check if this file was already generated (for AGENTS.md sharing)
      const targetFile = getToolFilePath(tool);
      if (generatedFiles.has(targetFile)) {
        // Skip - file already generated by another tool (e.g., codex generated AGENTS.md, skip opencode)
        continue;
      }

      // Build enhanced config with installed standards
      const enhancedConfig = {
        ...integrationConfigs[tool],
        tool,
        categories: integrationConfigs[tool]?.categories || ['anti-hallucination', 'commit-standards', 'code-review'],
        language: integrationConfigs[tool]?.language || commonLanguage,
        installedStandards: installedStandardsList,
        contentMode: skillsConfig.contentMode || 'minimal',
        level: level
      };

      // Use dynamic generator
      const result = writeIntegrationFile(tool, enhancedConfig, projectPath);
      if (result.success) {
        results.integrations.push(result.path);
        generatedFiles.add(targetFile);
      } else {
        // Fall back to legacy static file copy
        const mapping = INTEGRATION_MAPPINGS[tool];
        if (mapping) {
          const copyResult = await copyIntegration(mapping.source, mapping.target, projectPath);
          if (copyResult.success) {
            results.integrations.push(mapping.target);
            generatedFiles.add(targetFile);
          } else {
            results.errors.push(`${tool}: ${result.error || copyResult.error}`);
          }
        } else {
          results.errors.push(`${tool}: ${result.error}`);
        }
      }
    }

    intSpinner.succeed(msg.generatedIntegrations.replace('{count}', results.integrations.length));
  }

  // Generate CLAUDE.md for Claude Code if selected
  const claudeCodeSelected = aiTools.includes('claude-code');
  if (claudeCodeSelected && !integrationFileExists('claude-code', projectPath)) {
    const claudeSpinner = ora(msg.generatingClaudeMd).start();

    const claudeConfig = {
      tool: 'claude-code',
      categories: ['anti-hallucination', 'commit-standards', 'code-review'],
      languages: [],
      exclusions: [],
      customRules: [],
      detailLevel: 'standard',
      language: commonLanguage,
      // Enhanced standards compliance fields
      installedStandards: installedStandardsList,
      contentMode: skillsConfig.contentMode || 'minimal',
      level: level
    };

    const result = writeIntegrationFile('claude-code', claudeConfig, projectPath);
    if (result.success) {
      results.integrations.push(result.path);
      claudeSpinner.succeed(msg.generatedClaudeMd);
    } else {
      claudeSpinner.warn(msg.couldNotGenerateClaudeMd);
      results.errors.push(`CLAUDE.md: ${result.error}`);
    }
  }

  // Install Skills if needed (unified multi-agent installation)
  if (skillsConfig.needsInstall && skillsConfig.skillsInstallations?.length > 0) {
    const skillSpinner = ora(msg.installingSkills).start();

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

    // Build location summary for display
    const targetLocations = skillsConfig.skillsInstallations.map(inst => {
      const displayName = getAgentDisplayName(inst.agent);
      const dir = getSkillsDirForAgent(inst.agent, inst.level, projectPath);
      return `${displayName} (${dir})`;
    }).join(', ');

    if (installResult.totalErrors === 0) {
      skillSpinner.succeed(msg.installedSkills
        .replace('{count}', installResult.totalInstalled)
        .replace('{locations}', targetLocations));
    } else {
      skillSpinner.warn(msg.installedSkillsWithErrors
        .replace('{count}', installResult.totalInstalled)
        .replace('{errors}', installResult.totalErrors));
    }
  } else if (skillsConfig.needsInstall && skillsConfig.updateTargets.length > 0) {
    // Legacy fallback for backward compatibility
    const skillSpinner = ora(msg.installingSkills).start();

    const skillFiles = getSkillFiles();
    const repoInfo = getRepositoryInfo();
    let successCount = 0;
    let errorCount = 0;

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
      skillSpinner.succeed(msg.installedSkills.replace('{count}', successCount).replace('{locations}', targetLocations));
    } else {
      skillSpinner.warn(msg.installedSkillsWithErrors.replace('{count}', successCount).replace('{errors}', errorCount));
    }
  }

  // Install slash commands if requested
  if (skillsConfig.commandsInstallations?.length > 0) {
    const cmdSpinner = ora(msg.installingCommands || 'Installing slash commands...').start();

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

    // Build location summary
    const cmdLocations = skillsConfig.commandsInstallations.map(agent => {
      const displayName = getAgentDisplayName(agent);
      const dir = getCommandsDirForAgent(agent, projectPath);
      return `${displayName} (${dir})`;
    }).join(', ');

    if (cmdResult.totalErrors === 0) {
      cmdSpinner.succeed((msg.installedCommands || 'Installed {count} commands to: {locations}')
        .replace('{count}', cmdResult.totalInstalled)
        .replace('{locations}', cmdLocations));
    } else {
      cmdSpinner.warn((msg.installedCommandsWithErrors || 'Installed {count} commands with {errors} errors')
        .replace('{count}', cmdResult.totalInstalled)
        .replace('{errors}', cmdResult.totalErrors));
    }
  }

  // Compute file hashes for integrity checking
  const fileHashes = {};
  const now = new Date().toISOString();

  // Helper to compute and store hash
  const addFileHash = (relativePath) => {
    const fullPath = join(projectPath, relativePath);
    const hashInfo = computeFileHash(fullPath);
    if (hashInfo) {
      fileHashes[relativePath] = {
        ...hashInfo,
        installedAt: now
      };
    }
  };

  // Hash standards (stored as source paths, need to convert to target paths)
  for (const sourcePath of results.standards) {
    const fileName = basename(sourcePath);
    // Check if it's an option file (path contains 'options/')
    const relativePath = sourcePath.includes('options/')
      ? join('.standards', 'options', fileName)
      : join('.standards', fileName);
    addFileHash(relativePath);
  }

  // Hash extensions
  for (const sourcePath of results.extensions) {
    const fileName = basename(sourcePath);
    const relativePath = join('.standards', fileName);
    addFileHash(relativePath);
  }

  // Hash integrations (already stored as target paths)
  for (const targetPath of results.integrations) {
    addFileHash(targetPath);
  }

  // Create manifest
  const repoInfo = getRepositoryInfo();

  // Always record options as user preferences (for Skills and future updates)
  // Even when standards aren't copied locally (minimal scope), options should be preserved
  const manifestOptions = {
    workflow: standardOptions.workflow || null,
    merge_strategy: standardOptions.merge_strategy || null,
    commit_language: standardOptions.commit_language || null,
    test_levels: standardOptions.test_levels || []
  };

  // Build integrationConfigs for manifest
  // This allows uds update to regenerate integration files with the same settings
  const manifestIntegrationConfigs = {};
  const integrationConfigs = skillsConfig.integrationConfigs || {};

  for (const targetPath of results.integrations) {
    // Find the tool name for this integration
    let toolName = null;
    let config = null;

    // Check if this is from the integrationConfigs (dynamic generation)
    for (const [tool, toolConfig] of Object.entries(integrationConfigs)) {
      const mapping = INTEGRATION_MAPPINGS[tool];
      if (mapping && mapping.target === targetPath) {
        toolName = tool;
        config = toolConfig;
        break;
      }
    }

    // Check if this is CLAUDE.md
    if (targetPath === 'CLAUDE.md' || targetPath === '.standards/CLAUDE.md') {
      toolName = 'claude-code';
      config = {
        tool: 'claude-code',
        categories: ['anti-hallucination', 'commit-standards', 'code-review'],
        languages: [],
        exclusions: [],
        customRules: [],
        detailLevel: 'standard',
        language: commonLanguage
      };
    }

    if (toolName && config) {
      manifestIntegrationConfigs[targetPath] = {
        tool: toolName,
        categories: config.categories || [],
        detailLevel: config.detailLevel || 'standard',
        language: config.language || commonLanguage,
        contentMode: skillsConfig.contentMode || 'minimal',
        installedStandards: installedStandardsList,
        generatedAt: now
      };
    }
  }

  const manifest = {
    version: '3.2.0',
    upstream: {
      repo: 'AsiaOstrich/universal-dev-standards',
      version: repoInfo.standards.version,
      installed: new Date().toISOString().split('T')[0]
    },
    level,
    format,
    standardsScope: skillsConfig.standardsScope || 'full',
    contentMode: skillsConfig.contentMode || 'minimal',
    standards: results.standards,
    extensions: results.extensions,
    integrations: results.integrations,
    integrationConfigs: manifestIntegrationConfigs,
    options: manifestOptions,
    aiTools,
    skills: {
      installed: skillsConfig.installed,
      location: skillsConfig.location,
      names: skillsConfig.location === 'marketplace' ? ['all-via-plugin'] : results.skills,
      version: skillsConfig.installed ? repoInfo.skills.version : null,
      // New: multi-agent installations tracking
      installations: skillsConfig.skillsInstallations || []
    },
    commands: {
      installed: skillsConfig.commandsInstallations?.length > 0,
      names: results.commands || [],
      installations: skillsConfig.commandsInstallations || []
    },
    methodology: skillsConfig.methodology ? {
      active: skillsConfig.methodology,
      available: ['tdd', 'bdd', 'sdd', 'atdd'],
      config: {
        checkpointsEnabled: true,
        reminderIntensity: 'suggest',
        skipLimit: 3
      }
    } : null,
    fileHashes
  };

  writeManifest(manifest, projectPath);

  // Summary
  console.log();
  console.log(chalk.green(msg.initializedSuccess));
  console.log();

  const totalFiles = results.standards.length + results.extensions.length + results.integrations.length;
  console.log(chalk.gray(`  ${msg.filesCopied.replace('{count}', totalFiles)}`));

  if (skillsConfig.installed) {
    if (skillsConfig.location === 'marketplace') {
      console.log(chalk.gray(`  ${msg.skillsUsingMarketplace}`));
    } else if (results.skills.length > 0) {
      // Build location summary from skillsInstallations or legacy updateTargets
      const skillLocations = [];
      if (skillsConfig.skillsInstallations?.length > 0) {
        for (const inst of skillsConfig.skillsInstallations) {
          const displayName = getAgentDisplayName(inst.agent);
          const dir = getSkillsDirForAgent(inst.agent, inst.level, projectPath);
          skillLocations.push(`${displayName}: ${dir}`);
        }
      } else {
        // Legacy fallback
        if (skillsConfig.updateTargets.includes('user')) {
          skillLocations.push('~/.claude/skills/');
        }
        if (skillsConfig.updateTargets.includes('project')) {
          skillLocations.push('.claude/skills/');
        }
      }
      console.log(chalk.gray(`  ${msg.skillsInstalledTo.replace('{count}', results.skills.length).replace('{locations}', skillLocations.join(' and '))}`));
    }
  }

  // Show commands installation summary
  if (results.commands?.length > 0) {
    const cmdLocations = skillsConfig.commandsInstallations?.map(agent => {
      const displayName = getAgentDisplayName(agent);
      const dir = getCommandsDirForAgent(agent, projectPath);
      return `${displayName}: ${dir}`;
    }).join(' and ') || '';

    console.log(chalk.gray(`  ${(msg.commandsInstalledTo || 'Commands ({count}): {locations}').replace('{count}', results.commands.length).replace('{locations}', cmdLocations)}`));
  }
  console.log(chalk.gray(`  ${msg.manifestCreated}`));

  if (results.errors.length > 0) {
    console.log();
    console.log(chalk.yellow(msg.errorsOccurred.replace('{count}', results.errors.length)));
    for (const err of results.errors) {
      console.log(chalk.gray(`    ${err}`));
    }
  }

  console.log();
  console.log(chalk.gray(msg.nextSteps));
  console.log(chalk.gray(`  ${msg.reviewDirectory}`));
  console.log(chalk.gray(`  ${msg.addToVcs}`));
  if (skillsConfig.installed) {
    console.log(chalk.gray(`  ${msg.restartClaude}`));
    console.log(chalk.gray(`  4. ${msg.runCheck}`));
  } else {
    console.log(chalk.gray(`  3. ${msg.runCheck}`));
  }
  console.log();

  // Exit explicitly to prevent hanging due to inquirer's readline interface
  process.exit(0);
}
