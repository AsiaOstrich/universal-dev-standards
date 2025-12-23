import chalk from 'chalk';
import ora from 'ora';
import { execSync } from 'child_process';
import {
  getStandardsByLevel,
  getRepositoryInfo,
  getAllStandards
} from '../utils/registry.js';
import { detectAll } from '../utils/detector.js';
import {
  copyStandard,
  copyIntegration,
  writeManifest,
  isInitialized
} from '../utils/copier.js';
import {
  promptLevel,
  promptLanguage,
  promptFramework,
  promptLocale,
  promptIntegrations,
  promptSkills,
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
  console.log(chalk.bold('Universal Documentation Standards - Initialize'));
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
  let installSkills = options.skills !== false;

  if (!options.yes) {
    // Interactive mode
    if (!level) {
      level = await promptLevel();
    }

    if (!languages) {
      languages = await promptLanguage(detected.languages) || [];
    }

    if (!frameworks) {
      frameworks = await promptFramework(detected.frameworks) || [];
    }

    if (!locale) {
      locale = await promptLocale();
    }

    integrations = await promptIntegrations(detected.aiTools);

    if (installSkills) {
      installSkills = await promptSkills();
    }
  } else {
    // Non-interactive mode with defaults
    level = level || 2;
    languages = languages || Object.keys(detected.languages).filter(k => detected.languages[k]);
    frameworks = frameworks || Object.keys(detected.frameworks).filter(k => detected.frameworks[k]);
    integrations = Object.keys(detected.aiTools).filter(k => detected.aiTools[k]);
  }

  console.log();
  console.log(chalk.cyan('Configuration Summary:'));
  console.log(chalk.gray(`  Level: ${level}`));
  console.log(chalk.gray(`  Languages: ${languages.length > 0 ? languages.join(', ') : 'none'}`));
  console.log(chalk.gray(`  Frameworks: ${frameworks.length > 0 ? frameworks.join(', ') : 'none'}`));
  console.log(chalk.gray(`  Locale: ${locale || 'default (English)'}`));
  console.log(chalk.gray(`  Integrations: ${integrations.length > 0 ? integrations.join(', ') : 'none'}`));
  console.log(chalk.gray(`  Skills: ${installSkills ? 'yes' : 'no'}`));
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

  // Copy reference standards (those without skills)
  const referenceStandards = standards.filter(s =>
    s.category === 'reference' ||
    (s.category === 'skill' && !installSkills)
  );

  for (const std of referenceStandards) {
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

  // Create manifest
  const repoInfo = getRepositoryInfo();
  const manifest = {
    version: '1.0.0',
    upstream: {
      repo: 'AsiaOstrich/universal-doc-standards',
      version: repoInfo.standards.version,
      installed: new Date().toISOString().split('T')[0]
    },
    level,
    standards: results.standards,
    extensions: results.extensions,
    integrations: results.integrations,
    skills: {
      installed: installSkills,
      version: installSkills ? repoInfo.skills.version : null
    }
  };

  writeManifest(manifest, projectPath);

  // Install skills if requested
  if (installSkills) {
    console.log();
    console.log(chalk.cyan('To install Claude Code Skills, run:'));
    console.log(chalk.gray('  git clone https://github.com/AsiaOstrich/universal-dev-skills.git'));
    console.log(chalk.gray('  cd universal-dev-skills && ./install.sh'));
  }

  // Summary
  console.log();
  console.log(chalk.green('✓ Standards initialized successfully!'));
  console.log();

  const totalFiles = results.standards.length + results.extensions.length + results.integrations.length;
  console.log(chalk.gray(`  ${totalFiles} files copied to project`));
  console.log(chalk.gray(`  Manifest created at .standards/manifest.json`));

  if (results.errors.length > 0) {
    console.log();
    console.log(chalk.yellow(`⚠ ${results.errors.length} file(s) could not be copied:`));
    for (const err of results.errors) {
      console.log(chalk.gray(`    ${err}`));
    }
  }

  console.log();
  console.log(chalk.gray('Next steps:'));
  console.log(chalk.gray('  1. Review .standards/ directory'));
  console.log(chalk.gray('  2. Add .standards/ to version control'));
  console.log(chalk.gray('  3. Run `uds check` to verify adoption status'));
  console.log();
}
