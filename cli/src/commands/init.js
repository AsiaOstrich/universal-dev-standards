import chalk from 'chalk';
import ora from 'ora';
import {
  getStandardsByLevel,
  getRepositoryInfo,
  getSkillFiles
} from '../utils/registry.js';
import { detectAll } from '../utils/detector.js';
import {
  copyStandard,
  copyIntegration,
  writeManifest,
  isInitialized
} from '../utils/copier.js';
import {
  downloadSkill,
  getInstalledSkillsInfo,
  writeSkillsManifest,
  getSkillsDir
} from '../utils/github.js';
import {
  promptInstallMode,
  promptSkillsUpgrade,
  promptLevel,
  promptLanguage,
  promptFramework,
  promptLocale,
  promptIntegrations,
  promptConfirm
} from '../prompts/init.js';

// Integration file mappings
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

  // Check if already initialized
  if (isInitialized(projectPath)) {
    console.log(chalk.yellow('⚠ Standards already initialized in this project.'));
    console.log(chalk.gray('  Use `uds update` to update, or delete .standards/ to reinitialize.'));
    return;
  }

  // Detect project characteristics
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

  // Gather options (interactive or from flags)
  let level = options.level ? parseInt(options.level, 10) : null;
  let languages = options.lang ? [options.lang] : null;
  let frameworks = options.framework ? [options.framework] : null;
  let locale = options.locale || null;
  let integrations = [];
  let installMode = options.mode || null; // 'skills' or 'full'
  let skillsAction = null; // 'upgrade', 'keep', 'reinstall', or null (fresh install)

  if (!options.yes) {
    // Interactive mode

    // Step 1: Ask for installation mode
    if (!installMode) {
      installMode = await promptInstallMode();
    }

    // Step 2: If skills mode, check for existing Skills installation
    if (installMode === 'skills') {
      const installedInfo = getInstalledSkillsInfo();
      const repoInfo = getRepositoryInfo();
      const latestVersion = repoInfo.skills.version;

      if (installedInfo && installedInfo.installed) {
        // Skills already exist - ask what to do
        skillsAction = await promptSkillsUpgrade(installedInfo.version, latestVersion);
      } else {
        // Fresh install
        skillsAction = 'install';
      }
    }

    // Step 3: Adoption level
    if (!level) {
      level = await promptLevel();
    }

    // Step 4: Language extensions
    if (!languages) {
      languages = await promptLanguage(detected.languages) || [];
    }

    // Step 5: Framework extensions
    if (!frameworks) {
      frameworks = await promptFramework(detected.frameworks) || [];
    }

    // Step 6: Locale
    if (!locale) {
      locale = await promptLocale();
    }

    // Step 7: AI tool integrations
    integrations = await promptIntegrations(detected.aiTools);
  } else {
    // Non-interactive mode with defaults
    installMode = installMode || 'skills';
    level = level || 2;
    languages = languages || Object.keys(detected.languages).filter(k => detected.languages[k]);
    frameworks = frameworks || Object.keys(detected.frameworks).filter(k => detected.frameworks[k]);
    integrations = Object.keys(detected.aiTools).filter(k => detected.aiTools[k]);

    // Auto-determine skills action
    if (installMode === 'skills') {
      const installedInfo = getInstalledSkillsInfo();
      skillsAction = installedInfo?.installed ? 'upgrade' : 'install';
    }
  }

  console.log();
  console.log(chalk.cyan('Configuration Summary:'));
  console.log(chalk.gray(`  Mode: ${installMode === 'skills' ? 'Skills Mode' : 'Full Mode'}`));
  console.log(chalk.gray(`  Level: ${level}`));
  console.log(chalk.gray(`  Languages: ${languages.length > 0 ? languages.join(', ') : 'none'}`));
  console.log(chalk.gray(`  Frameworks: ${frameworks.length > 0 ? frameworks.join(', ') : 'none'}`));
  console.log(chalk.gray(`  Locale: ${locale || 'default (English)'}`));
  console.log(chalk.gray(`  Integrations: ${integrations.length > 0 ? integrations.join(', ') : 'none'}`));
  if (installMode === 'skills') {
    const skillsStatus = skillsAction === 'keep' ? 'keep existing' :
                         skillsAction === 'upgrade' ? 'upgrade' :
                         skillsAction === 'reinstall' ? 'reinstall' : 'install';
    console.log(chalk.gray(`  Skills: ${skillsStatus}`));
  }
  console.log();

  if (!options.yes) {
    const confirmed = await promptConfirm('Proceed with installation?');
    if (!confirmed) {
      console.log(chalk.yellow('Installation cancelled.'));
      return;
    }
  }

  // Start installation
  console.log();
  const copySpinner = ora('Copying standards...').start();

  const results = {
    standards: [],
    extensions: [],
    integrations: [],
    errors: []
  };

  // Get standards for the selected level
  const standards = getStandardsByLevel(level);

  // Determine which standards to copy based on installation mode
  // Skills Mode: only copy reference standards (those without skill equivalents)
  // Full Mode: copy all standards
  const standardsToCopy = installMode === 'skills'
    ? standards.filter(s => s.category === 'reference')
    : standards.filter(s => s.category === 'reference' || s.category === 'skill');

  for (const std of standardsToCopy) {
    const result = await copyStandard(std.source, '.standards', projectPath);
    if (result.success) {
      results.standards.push(std.source);
    } else {
      results.errors.push(`${std.source}: ${result.error}`);
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

  // Copy integrations
  if (integrations.length > 0) {
    const intSpinner = ora('Copying integrations...').start();

    for (const int of integrations) {
      const mapping = INTEGRATION_MAPPINGS[int];
      if (mapping) {
        const result = await copyIntegration(mapping.source, mapping.target, projectPath);
        if (result.success) {
          results.integrations.push(mapping.target);
        } else {
          results.errors.push(`${mapping.source}: ${result.error}`);
        }
      }
    }

    intSpinner.succeed(`Copied ${results.integrations.length} integration files`);
  }

  // Install Skills if in skills mode and action is not 'keep'
  const skillsInstalled = [];
  if (installMode === 'skills' && skillsAction !== 'keep') {
    const skillSpinner = ora('Installing Claude Code Skills...').start();

    const skillFiles = getSkillFiles();
    const repoInfo = getRepositoryInfo();
    let successCount = 0;
    let errorCount = 0;

    for (const [skillName, files] of Object.entries(skillFiles)) {
      const result = await downloadSkill(skillName, files);
      if (result.success) {
        successCount++;
        skillsInstalled.push(skillName);
      } else {
        errorCount++;
        const failedFiles = result.files.filter(f => !f.success).map(f => f.file).join(', ');
        results.errors.push(`Skill ${skillName}: failed to download ${failedFiles}`);
      }
    }

    // Write skills manifest
    writeSkillsManifest(repoInfo.skills.version);

    if (errorCount === 0) {
      skillSpinner.succeed(`Installed ${successCount} Skills to ${getSkillsDir()}`);
    } else {
      skillSpinner.warn(`Installed ${successCount} Skills (${errorCount} failed)`);
    }
  }

  // Create manifest
  const repoInfo = getRepositoryInfo();
  const manifest = {
    version: '1.0.0',
    upstream: {
      repo: 'AsiaOstrich/universal-dev-standards',
      version: repoInfo.standards.version,
      installed: new Date().toISOString().split('T')[0]
    },
    level,
    installMode,
    standards: results.standards,
    extensions: results.extensions,
    integrations: results.integrations,
    skills: {
      installed: installMode === 'skills',
      action: skillsAction,
      names: skillsInstalled,
      version: installMode === 'skills' ? repoInfo.skills.version : null
    }
  };

  writeManifest(manifest, projectPath);

  // Summary
  console.log();
  console.log(chalk.green('✓ Standards initialized successfully!'));
  console.log();

  const totalFiles = results.standards.length + results.extensions.length + results.integrations.length;
  console.log(chalk.gray(`  ${totalFiles} files copied to project`));
  if (skillsInstalled.length > 0) {
    console.log(chalk.gray(`  ${skillsInstalled.length} Skills installed to ~/.claude/skills/`));
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
  if (installMode === 'skills') {
    console.log(chalk.gray('  3. Restart Claude Code to load new Skills'));
    console.log(chalk.gray('  4. Run `uds check` to verify adoption status'));
  } else {
    console.log(chalk.gray('  3. Run `uds check` to verify adoption status'));
  }
  console.log();
}
