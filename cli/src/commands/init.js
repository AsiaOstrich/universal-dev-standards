import chalk from 'chalk';
import ora from 'ora';
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
import {
  downloadSkillToLocation,
  getInstalledSkillsInfo,
  getProjectInstalledSkillsInfo,
  writeSkillsManifest,
  getSkillsDir,
  getProjectSkillsDir
} from '../utils/github.js';
import {
  promptAITools,
  promptSkillsInstallLocation,
  promptSkillsUpdate,
  promptStandardsScope,
  promptLevel,
  promptLanguage,
  promptFramework,
  promptLocale,
  promptConfirm,
  promptFormat,
  promptStandardOptions
} from '../prompts/init.js';
import {
  promptIntegrationConfig
} from '../prompts/integrations.js';
import {
  writeIntegrationFile,
  integrationFileExists
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

  console.log();
  console.log(chalk.bold('Universal Development Standards - Initialize'));
  console.log(chalk.gray('─'.repeat(50)));

  // STEP 1: Check if already initialized
  if (isInitialized(projectPath)) {
    console.log(chalk.yellow('⚠ Standards already initialized in this project.'));
    console.log(chalk.gray('  Use `uds update` to update, or delete .standards/ to reinitialize.'));
    return;
  }

  // STEP 2: Detect project characteristics
  const spinner = ora('Detecting project characteristics...').start();
  const detected = detectAll(projectPath);
  spinner.succeed('Project analysis complete');

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
    console.log(chalk.gray(`  Languages: ${detectedLangs.join(', ')}`));
  }
  if (detectedFrameworks.length > 0) {
    console.log(chalk.gray(`  Frameworks: ${detectedFrameworks.join(', ')}`));
  }
  if (detectedTools.length > 0) {
    console.log(chalk.gray(`  AI Tools: ${detectedTools.join(', ')}`));
  }
  console.log();

  // Initialize configuration variables
  let level = options.level ? parseInt(options.level, 10) : null;
  let languages = options.lang ? [options.lang] : null;
  let frameworks = options.framework ? [options.framework] : null;
  let locale = options.locale || null;
  let format = options.format || null;
  let standardOptions = {};

  // Skills configuration
  let skillsConfig = {
    installed: false,
    location: null,
    needsInstall: false,
    updateTargets: []
  };

  // AI tools configuration
  let aiTools = [];
  let integrations = [];

  if (!options.yes) {
    // ===== Interactive mode =====

    // STEP 3: Ask for AI tools
    aiTools = await promptAITools({
      claudeCode: detected.aiTools.claudeCode || false,
      cursor: detected.aiTools.cursor || false,
      windsurf: detected.aiTools.windsurf || false,
      cline: detected.aiTools.cline || false,
      copilot: detected.aiTools.copilot || false
    });

    const useClaudeCode = aiTools.includes('claude-code');
    const onlyClaudeCode = aiTools.length === 1 && useClaudeCode;

    // STEP 4: Skills handling (only if Claude Code is the ONLY selected tool)
    // When other AI tools are also selected, they need full standards,
    // so we skip the Skills prompt to avoid minimal installation affecting them
    if (onlyClaudeCode) {
      const projectSkillsInfo = getProjectInstalledSkillsInfo(projectPath);
      const userSkillsInfo = getInstalledSkillsInfo();
      const repoInfo = getRepositoryInfo();
      const latestVersion = repoInfo.skills.version;

      const hasProjectSkills = projectSkillsInfo?.installed;
      const hasUserSkills = userSkillsInfo?.installed;

      if (hasProjectSkills && hasUserSkills) {
        // Case D: Both levels installed
        console.log();
        console.log(chalk.cyan('Skills Status:'));
        console.log(chalk.gray(`  Project level: v${projectSkillsInfo.version || 'unknown'}`));
        console.log(chalk.gray(`  User level: v${userSkillsInfo.version || 'unknown'}`));

        const updateResult = await promptSkillsUpdate(projectSkillsInfo, userSkillsInfo, latestVersion);
        skillsConfig = {
          installed: true,
          location: 'both',
          needsInstall: updateResult.action !== 'none',
          updateTargets: updateResult.targets
        };
      } else if (hasProjectSkills) {
        // Case C: Only project level installed
        console.log();
        console.log(chalk.cyan('Skills Status:'));
        console.log(chalk.gray(`  Project level: v${projectSkillsInfo.version || 'unknown'}`));
        console.log(chalk.gray('  User level: not installed'));

        const updateResult = await promptSkillsUpdate(projectSkillsInfo, null, latestVersion);
        skillsConfig = {
          installed: true,
          location: 'project',
          needsInstall: updateResult.action !== 'none',
          updateTargets: updateResult.targets
        };
      } else if (hasUserSkills) {
        // Case B: Only user level installed
        console.log();
        console.log(chalk.cyan('Skills Status:'));
        console.log(chalk.gray('  Project level: not installed'));
        console.log(chalk.gray(`  User level: v${userSkillsInfo.version || 'unknown'}`));

        const updateResult = await promptSkillsUpdate(null, userSkillsInfo, latestVersion);
        skillsConfig = {
          installed: true,
          location: 'user',
          needsInstall: updateResult.action !== 'none',
          updateTargets: updateResult.targets
        };
      } else {
        // Case A: Neither installed
        console.log();
        console.log(chalk.cyan('Skills Status:'));
        console.log(chalk.gray('  No Skills installation detected'));

        const location = await promptSkillsInstallLocation();
        if (location !== 'none') {
          skillsConfig = {
            installed: true,
            location,
            needsInstall: location !== 'marketplace', // marketplace doesn't need install via CLI
            updateTargets: location === 'marketplace' ? [] : [location]
          };
        }
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
      console.log(chalk.cyan('Integration Configuration:'));

      if (integrations.length > 1) {
        console.log(chalk.gray('  All selected tools will share the same rule configuration.'));
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

    // Handle Skills configuration based on CLI flag (default: marketplace)
    const skillsLocationFlag = options.skillsLocation || 'marketplace';

    if (skillsLocationFlag === 'marketplace') {
      skillsConfig = {
        installed: true,
        location: 'marketplace',
        needsInstall: false,
        updateTargets: [],
        standardsScope: 'minimal'
      };
    } else if (skillsLocationFlag === 'none') {
      skillsConfig = {
        installed: false,
        location: null,
        needsInstall: false,
        updateTargets: [],
        standardsScope: 'full'
      };
    } else if (skillsLocationFlag === 'project') {
      skillsConfig = {
        installed: true,
        location: 'project',
        needsInstall: true,
        updateTargets: ['project'],
        standardsScope: 'minimal'
      };
    } else if (skillsLocationFlag === 'user') {
      skillsConfig = {
        installed: true,
        location: 'user',
        needsInstall: true,
        updateTargets: ['user'],
        standardsScope: 'minimal'
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
          standardsScope: 'minimal'
        };
      } else {
        // Fallback to marketplace if nothing detected
        skillsConfig = {
          installed: true,
          location: 'marketplace',
          needsInstall: false,
          updateTargets: [],
          standardsScope: 'minimal'
        };
      }
    }
  }

  // Configuration summary
  console.log();
  console.log(chalk.cyan('Configuration Summary:'));
  console.log(chalk.gray(`  Level: ${level}`));
  console.log(chalk.gray(`  Format: ${format === 'ai' ? 'AI-Optimized' : format === 'human' ? 'Human-Readable' : 'Both'}`));
  console.log(chalk.gray(`  Standards Scope: ${skillsConfig.standardsScope === 'minimal' ? 'Minimal (Skills cover the rest)' : 'Full'}`));
  console.log(chalk.gray(`  Languages: ${languages.length > 0 ? languages.join(', ') : 'none'}`));
  console.log(chalk.gray(`  Frameworks: ${frameworks.length > 0 ? frameworks.join(', ') : 'none'}`));
  console.log(chalk.gray(`  Locale: ${locale || 'default (English)'}`));
  console.log(chalk.gray(`  AI Tools: ${aiTools.length > 0 ? aiTools.join(', ') : 'none'}`));
  console.log(chalk.gray(`  Integrations: ${integrations.length > 0 ? integrations.join(', ') : 'none'}`));

  if (skillsConfig.installed) {
    let skillsStatus;
    if (skillsConfig.location === 'marketplace') {
      skillsStatus = 'Plugin Marketplace (managed by Claude Code)';
    } else {
      skillsStatus = skillsConfig.needsInstall
        ? `install/update to ${skillsConfig.location}`
        : `using existing (${skillsConfig.location})`;
    }
    console.log(chalk.gray(`  Skills: ${skillsStatus}`));
  }

  // Show selected standard options
  if (standardOptions.workflow) {
    console.log(chalk.gray(`  Git Workflow: ${standardOptions.workflow}`));
  }
  if (standardOptions.merge_strategy) {
    console.log(chalk.gray(`  Merge Strategy: ${standardOptions.merge_strategy}`));
  }
  if (standardOptions.commit_language) {
    console.log(chalk.gray(`  Commit Language: ${standardOptions.commit_language}`));
  }
  if (standardOptions.test_levels && standardOptions.test_levels.length > 0) {
    console.log(chalk.gray(`  Test Levels: ${standardOptions.test_levels.join(', ')}`));
  }
  console.log();

  if (!options.yes) {
    const confirmed = await promptConfirm('Proceed with installation?');
    if (!confirmed) {
      console.log(chalk.yellow('Installation cancelled.'));
      return;
    }
  }

  // ===== Start installation =====
  console.log();
  const copySpinner = ora('Copying standards...').start();

  const results = {
    standards: [],
    extensions: [],
    integrations: [],
    skills: [],
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

  copySpinner.succeed(`Copied ${results.standards.length} standard files`);

  // Copy extensions
  if (languages.length > 0 || frameworks.length > 0 || locale) {
    const extSpinner = ora('Copying extensions...').start();

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

    extSpinner.succeed(`Copied ${results.extensions.length} extension files`);
  }

  // Generate and write integrations
  if (integrations.length > 0) {
    const intSpinner = ora('Generating integration files...').start();
    const integrationConfigs = skillsConfig.integrationConfigs || {};

    for (const tool of integrations) {
      // Check if we have a custom config for this tool
      if (integrationConfigs[tool]) {
        // Use dynamic generator with custom config
        const result = writeIntegrationFile(tool, integrationConfigs[tool], projectPath);
        if (result.success) {
          results.integrations.push(result.path);
        } else {
          results.errors.push(`${tool}: ${result.error}`);
        }
      } else {
        // Fall back to legacy static file copy
        const mapping = INTEGRATION_MAPPINGS[tool];
        if (mapping) {
          const result = await copyIntegration(mapping.source, mapping.target, projectPath);
          if (result.success) {
            results.integrations.push(mapping.target);
          } else {
            results.errors.push(`${mapping.source}: ${result.error}`);
          }
        }
      }
    }

    intSpinner.succeed(`Generated ${results.integrations.length} integration files`);
  }

  // Generate CLAUDE.md for Claude Code if selected
  const claudeCodeSelected = aiTools.includes('claude-code');
  if (claudeCodeSelected && !integrationFileExists('claude-code', projectPath)) {
    const claudeSpinner = ora('Generating CLAUDE.md...').start();

    // Determine language setting from locale or format
    let claudeLanguage = 'en';
    if (locale === 'zh-tw') {
      claudeLanguage = 'zh-tw';
    } else if (standardOptions?.commit_language === 'bilingual') {
      claudeLanguage = 'bilingual';
    } else if (standardOptions?.commit_language === 'traditional-chinese') {
      claudeLanguage = 'zh-tw';
    }

    const claudeConfig = {
      tool: 'claude-code',
      categories: ['anti-hallucination', 'commit-standards', 'code-review'],
      languages: [],
      exclusions: [],
      customRules: [],
      detailLevel: 'standard',
      language: claudeLanguage
    };

    const result = writeIntegrationFile('claude-code', claudeConfig, projectPath);
    if (result.success) {
      results.integrations.push(result.path);
      claudeSpinner.succeed('Generated CLAUDE.md');
    } else {
      claudeSpinner.warn('Could not generate CLAUDE.md');
      results.errors.push(`CLAUDE.md: ${result.error}`);
    }
  }

  // Install Skills if needed
  if (skillsConfig.needsInstall && skillsConfig.updateTargets.length > 0) {
    const skillSpinner = ora('Installing Claude Code Skills...').start();

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
      skillSpinner.succeed(`Installed ${successCount} Skills to ${targetLocations}`);
    } else {
      skillSpinner.warn(`Installed ${successCount} Skills with ${errorCount} errors`);
    }
  }

  // Compute file hashes for integrity checking
  const { join, basename } = await import('path');
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

  // Only record options for standards that were actually copied
  const standardsToCopyIds = new Set(standardsToCopy.map(s => s.id));
  const manifestOptions = {
    workflow: standardsToCopyIds.has('git-workflow') ? (standardOptions.workflow || null) : null,
    merge_strategy: standardsToCopyIds.has('git-workflow') ? (standardOptions.merge_strategy || null) : null,
    commit_language: standardsToCopyIds.has('commit-message') ? (standardOptions.commit_language || null) : null,
    test_levels: standardsToCopyIds.has('testing') ? (standardOptions.test_levels || []) : []
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
      // Determine language setting from locale or format
      let claudeLanguage = 'en';
      if (locale === 'zh-tw') {
        claudeLanguage = 'zh-tw';
      } else if (standardOptions?.commit_language === 'bilingual') {
        claudeLanguage = 'bilingual';
      } else if (standardOptions?.commit_language === 'traditional-chinese') {
        claudeLanguage = 'zh-tw';
      }
      config = {
        tool: 'claude-code',
        categories: ['anti-hallucination', 'commit-standards', 'code-review'],
        languages: [],
        exclusions: [],
        customRules: [],
        detailLevel: 'standard',
        language: claudeLanguage
      };
    }

    if (toolName && config) {
      manifestIntegrationConfigs[targetPath] = {
        tool: toolName,
        categories: config.categories || [],
        detailLevel: config.detailLevel || 'standard',
        language: config.language || 'en',
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
      version: skillsConfig.installed ? repoInfo.skills.version : null
    },
    fileHashes
  };

  writeManifest(manifest, projectPath);

  // Summary
  console.log();
  console.log(chalk.green('✓ Standards initialized successfully!'));
  console.log();

  const totalFiles = results.standards.length + results.extensions.length + results.integrations.length;
  console.log(chalk.gray(`  ${totalFiles} files copied to project`));

  if (skillsConfig.installed) {
    if (skillsConfig.location === 'marketplace') {
      console.log(chalk.gray('  Skills: Using Plugin Marketplace installation'));
    } else if (results.skills.length > 0) {
      const skillLocations = [];
      if (skillsConfig.updateTargets.includes('user')) {
        skillLocations.push('~/.claude/skills/');
      }
      if (skillsConfig.updateTargets.includes('project')) {
        skillLocations.push('.claude/skills/');
      }
      console.log(chalk.gray(`  ${results.skills.length} Skills installed to ${skillLocations.join(' and ')}`));
    }
  }
  console.log(chalk.gray('  Manifest created at .standards/manifest.json'));

  if (results.errors.length > 0) {
    console.log();
    console.log(chalk.yellow(`⚠ ${results.errors.length} error(s) occurred:`));
    for (const err of results.errors) {
      console.log(chalk.gray(`    ${err}`));
    }
  }

  console.log();
  console.log(chalk.gray('Next steps:'));
  console.log(chalk.gray('  1. Review .standards/ directory'));
  console.log(chalk.gray('  2. Add .standards/ to version control'));
  if (skillsConfig.installed) {
    console.log(chalk.gray('  3. Restart Claude Code to load new Skills'));
    console.log(chalk.gray('  4. Run `uds check` to verify adoption status'));
  } else {
    console.log(chalk.gray('  3. Run `uds check` to verify adoption status'));
  }
  console.log();

  // Exit explicitly to prevent hanging due to inquirer's readline interface
  process.exit(0);
}
