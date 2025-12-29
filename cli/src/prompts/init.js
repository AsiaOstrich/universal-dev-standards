import inquirer from 'inquirer';
import chalk from 'chalk';

/**
 * Prompt for output format (AI or Human-readable)
 * @returns {Promise<string>} 'ai', 'human', or 'both'
 */
export async function promptFormat() {
  const { format } = await inquirer.prompt([
    {
      type: 'list',
      name: 'format',
      message: 'Select standards format:',
      choices: [
        {
          name: `${chalk.green('AI-Optimized')} ${chalk.gray('(推薦)')} - Token-efficient YAML for AI assistants`,
          value: 'ai'
        },
        {
          name: `${chalk.blue('Human-Readable')} - Full Markdown documentation`,
          value: 'human'
        },
        {
          name: `${chalk.yellow('Both')} - Include both formats`,
          value: 'both'
        }
      ],
      default: 'ai'
    }
  ]);

  return format;
}

/**
 * Prompt for Git workflow strategy
 * @returns {Promise<string>} Selected workflow ID
 */
export async function promptGitWorkflow() {
  const { workflow } = await inquirer.prompt([
    {
      type: 'list',
      name: 'workflow',
      message: 'Select Git branching strategy:',
      choices: [
        {
          name: `${chalk.green('GitHub Flow')} ${chalk.gray('(推薦)')} - Simple, continuous deployment`,
          value: 'github-flow'
        },
        {
          name: `${chalk.blue('GitFlow')} - Structured releases with develop/release branches`,
          value: 'gitflow'
        },
        {
          name: `${chalk.yellow('Trunk-Based')} - Direct commits to main, feature flags`,
          value: 'trunk-based'
        }
      ],
      default: 'github-flow'
    }
  ]);

  return workflow;
}

/**
 * Prompt for merge strategy
 * @returns {Promise<string>} Selected merge strategy ID
 */
export async function promptMergeStrategy() {
  const { strategy } = await inquirer.prompt([
    {
      type: 'list',
      name: 'strategy',
      message: 'Select merge strategy:',
      choices: [
        {
          name: `${chalk.green('Squash Merge')} ${chalk.gray('(推薦)')} - Clean history, one commit per PR`,
          value: 'squash'
        },
        {
          name: `${chalk.blue('Merge Commit')} - Preserve full branch history`,
          value: 'merge-commit'
        },
        {
          name: `${chalk.yellow('Rebase + Fast-Forward')} - Linear history, advanced`,
          value: 'rebase-ff'
        }
      ],
      default: 'squash'
    }
  ]);

  return strategy;
}

/**
 * Prompt for commit message language
 * @returns {Promise<string>} Selected language ID
 */
export async function promptCommitLanguage() {
  const { language } = await inquirer.prompt([
    {
      type: 'list',
      name: 'language',
      message: 'Select commit message language:',
      choices: [
        {
          name: `${chalk.green('English')} ${chalk.gray('(推薦)')} - Standard international format`,
          value: 'english'
        },
        {
          name: `${chalk.blue('Traditional Chinese')} ${chalk.gray('(繁體中文)')} - For Chinese-speaking teams`,
          value: 'traditional-chinese'
        },
        {
          name: `${chalk.yellow('Bilingual')} ${chalk.gray('(雙語)')} - Both English and Chinese`,
          value: 'bilingual'
        }
      ],
      default: 'english'
    }
  ]);

  return language;
}

/**
 * Prompt for test levels to include
 * @returns {Promise<string[]>} Selected test level IDs
 */
export async function promptTestLevels() {
  const { levels } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'levels',
      message: 'Select test levels to include:',
      choices: [
        {
          name: `Unit Testing ${chalk.gray('(70% pyramid base)')}`,
          value: 'unit-testing',
          checked: true
        },
        {
          name: `Integration Testing ${chalk.gray('(20%)')}`,
          value: 'integration-testing',
          checked: true
        },
        {
          name: `System Testing ${chalk.gray('(7%)')}`,
          value: 'system-testing',
          checked: false
        },
        {
          name: `E2E Testing ${chalk.gray('(3% pyramid top)')}`,
          value: 'e2e-testing',
          checked: false
        }
      ]
    }
  ]);

  return levels;
}

/**
 * Prompt for all standard options
 * @param {number} level - Adoption level
 * @returns {Promise<Object>} Selected options
 */
export async function promptStandardOptions(level) {
  const options = {};

  console.log();
  console.log(chalk.cyan('Standard Options:'));
  console.log(chalk.gray('  Configure your preferred options for each standard'));
  console.log();

  // Git workflow options (level 2+)
  if (level >= 2) {
    options.workflow = await promptGitWorkflow();
    options.merge_strategy = await promptMergeStrategy();
  }

  // Commit message options (level 1+)
  options.commit_language = await promptCommitLanguage();

  // Testing options (level 2+)
  if (level >= 2) {
    options.test_levels = await promptTestLevels();
  }

  return options;
}

/**
 * Prompt for installation mode
 * @returns {Promise<string>} 'skills' or 'full'
 */
export async function promptInstallMode() {
  const { mode } = await inquirer.prompt([
    {
      type: 'list',
      name: 'mode',
      message: 'Select installation mode:',
      choices: [
        {
          name: `${chalk.green('Skills Mode')} ${chalk.gray('(推薦)')} - Use Claude Code Skills`,
          value: 'skills'
        },
        {
          name: `${chalk.yellow('Full Mode')} - Install all standards without Skills`,
          value: 'full'
        }
      ],
      default: 'skills'
    }
  ]);

  // Show explanation based on selection
  console.log();
  if (mode === 'skills') {
    console.log(chalk.gray('  → Skills will be installed to ~/.claude/skills/'));
    console.log(chalk.gray('  → Only static standards will be copied to .standards/'));
  } else {
    console.log(chalk.gray('  → All standards will be copied to .standards/'));
    console.log(chalk.gray('  → No Skills will be installed'));
  }
  console.log();

  return mode;
}

/**
 * Prompt for Skills upgrade action
 * @param {string} installedVersion - Currently installed version (may be null)
 * @param {string} latestVersion - Latest available version
 * @returns {Promise<string>} 'upgrade', 'keep', or 'reinstall'
 */
export async function promptSkillsUpgrade(installedVersion, latestVersion) {
  const versionDisplay = installedVersion
    ? `v${installedVersion} → v${latestVersion}`
    : `unknown → v${latestVersion}`;

  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: `Skills detected (${versionDisplay}). What would you like to do?`,
      choices: [
        {
          name: `${chalk.green('Upgrade')} - Update to latest version`,
          value: 'upgrade'
        },
        {
          name: `${chalk.gray('Keep')} - Keep current version`,
          value: 'keep'
        },
        {
          name: `${chalk.yellow('Reinstall')} - Fresh install (overwrites existing)`,
          value: 'reinstall'
        }
      ],
      default: 'upgrade'
    }
  ]);

  return action;
}

/**
 * Prompt for adoption level
 * @returns {Promise<number>} Selected level
 */
export async function promptLevel() {
  const { level } = await inquirer.prompt([
    {
      type: 'list',
      name: 'level',
      message: 'Select adoption level:',
      choices: [
        {
          name: `${chalk.green('Level 1: Essential')} ${chalk.gray('(基本)')} - Minimum viable standards`,
          value: 1
        },
        {
          name: `${chalk.yellow('Level 2: Recommended')} ${chalk.gray('(推薦)')} - Professional quality`,
          value: 2
        },
        {
          name: `${chalk.blue('Level 3: Enterprise')} ${chalk.gray('(企業)')} - Comprehensive standards`,
          value: 3
        }
      ],
      default: 1
    }
  ]);

  return level;
}

/**
 * Prompt for language extension
 * @param {Object} detected - Detected languages
 * @returns {Promise<string|null>} Selected language or null
 */
export async function promptLanguage(detected) {
  const choices = [];

  if (detected.csharp) {
    choices.push({ name: 'C# Style Guide', value: 'csharp', checked: true });
  }
  if (detected.php) {
    choices.push({ name: 'PHP Style Guide (PSR-12)', value: 'php', checked: true });
  }

  if (choices.length === 0) {
    return null;
  }

  const { languages } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'languages',
      message: 'Detected language(s). Select style guides to include:',
      choices
    }
  ]);

  return languages;
}

/**
 * Prompt for framework extension
 * @param {Object} detected - Detected frameworks
 * @returns {Promise<string|null>} Selected framework or null
 */
export async function promptFramework(detected) {
  const choices = [];

  if (detected['fat-free']) {
    choices.push({ name: 'Fat-Free Framework Patterns', value: 'fat-free', checked: true });
  }

  if (choices.length === 0) {
    return null;
  }

  const { frameworks } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'frameworks',
      message: 'Detected framework(s). Select patterns to include:',
      choices
    }
  ]);

  return frameworks;
}

/**
 * Prompt for locale
 * @returns {Promise<string|null>} Selected locale or null
 */
export async function promptLocale() {
  const { useLocale } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'useLocale',
      message: 'Use Traditional Chinese (繁體中文) locale?',
      default: false
    }
  ]);

  return useLocale ? 'zh-tw' : null;
}

/**
 * Prompt for AI tool integrations
 * @param {Object} detected - Detected AI tools
 * @returns {Promise<string[]>} Selected integrations
 */
export async function promptIntegrations(detected) {
  const choices = [];

  // Existing tools (checked if detected)
  choices.push({
    name: 'Cursor (.cursorrules)',
    value: 'cursor',
    checked: detected.cursor || false
  });
  choices.push({
    name: 'Windsurf (.windsurfrules)',
    value: 'windsurf',
    checked: detected.windsurf || false
  });
  choices.push({
    name: 'Cline (.clinerules)',
    value: 'cline',
    checked: detected.cline || false
  });
  choices.push({
    name: 'GitHub Copilot (.github/copilot-instructions.md)',
    value: 'copilot',
    checked: detected.copilot || false
  });

  const { integrations } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'integrations',
      message: 'Select AI tool integrations:',
      choices
    }
  ]);

  return integrations;
}

/**
 * Prompt for confirmation
 * @param {string} message - Confirmation message
 * @returns {Promise<boolean>} True if confirmed
 */
export async function promptConfirm(message) {
  const { confirmed } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirmed',
      message,
      default: true
    }
  ]);

  return confirmed;
}
