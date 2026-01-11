import inquirer from 'inquirer';
import chalk from 'chalk';

/**
 * All available rule categories for integration files
 */
const RULE_CATEGORIES = {
  'anti-hallucination': {
    name: 'Anti-Hallucination Protocol',
    nameZh: '反幻覺協議',
    description: 'Evidence-based analysis and source attribution',
    default: true
  },
  'commit-standards': {
    name: 'Commit Message Standards',
    nameZh: '提交訊息標準',
    description: 'Conventional commits format and guidelines',
    default: true
  },
  'code-review': {
    name: 'Code Review Checklist',
    nameZh: '程式碼審查清單',
    description: 'Pre-commit quality verification',
    default: true
  },
  'testing': {
    name: 'Testing Standards',
    nameZh: '測試標準',
    description: 'Test pyramid and coverage requirements',
    default: false
  },
  'documentation': {
    name: 'Documentation Standards',
    nameZh: '文件標準',
    description: 'README and API documentation guidelines',
    default: false
  },
  'git-workflow': {
    name: 'Git Workflow',
    nameZh: 'Git 工作流程',
    description: 'Branch naming and merge strategies',
    default: false
  },
  'error-handling': {
    name: 'Error Handling',
    nameZh: '錯誤處理',
    description: 'Error codes and logging standards',
    default: false
  },
  'project-structure': {
    name: 'Project Structure',
    nameZh: '專案結構',
    description: 'Directory conventions and organization',
    default: false
  }
};

/**
 * Language-specific rule options
 */
const LANGUAGE_RULES = {
  javascript: {
    name: 'JavaScript/TypeScript',
    rules: ['ES6+ syntax', 'Async/await patterns', 'Type safety (TS)']
  },
  python: {
    name: 'Python',
    rules: ['PEP 8 style', 'Type hints', 'Docstrings']
  },
  csharp: {
    name: 'C#',
    rules: ['.NET naming conventions', 'LINQ usage', 'Async patterns']
  },
  php: {
    name: 'PHP',
    rules: ['PSR-12 style', 'Type declarations', 'Namespace usage']
  },
  go: {
    name: 'Go',
    rules: ['Go idioms', 'Error handling', 'Package structure']
  },
  java: {
    name: 'Java',
    rules: ['Java conventions', 'Stream API', 'Dependency injection']
  }
};

/**
 * Prompt for integration customization mode
 * @returns {Promise<string>} 'default', 'custom', or 'merge'
 */
export async function promptIntegrationMode() {
  console.log();
  console.log(chalk.cyan('Integration Configuration:'));
  console.log(chalk.gray('  Configure how AI tool rules are generated'));
  console.log();

  const { mode } = await inquirer.prompt([
    {
      type: 'list',
      name: 'mode',
      message: 'How would you like to configure integration files?',
      choices: [
        {
          name: `${chalk.green('Default')} ${chalk.gray('(推薦)')} - Use standard rule set`,
          value: 'default'
        },
        {
          name: `${chalk.blue('Custom')} - Select specific rules to include`,
          value: 'custom'
        },
        {
          name: `${chalk.yellow('Merge')} - Merge with existing rules file`,
          value: 'merge'
        }
      ],
      default: 'default'
    }
  ]);

  return mode;
}

/**
 * Prompt for selecting rule categories
 * @param {Object} _detected - Detected project characteristics (for future use)
 * @returns {Promise<string[]>} Selected rule category IDs
 */
// eslint-disable-next-line no-unused-vars
export async function promptRuleCategories(_detected = {}) {
  console.log();
  console.log(chalk.cyan('Rule Categories:'));
  console.log(chalk.gray('  Select which standards to include in integration files'));
  console.log();

  const choices = Object.entries(RULE_CATEGORIES).map(([id, cat]) => ({
    name: `${cat.name} ${chalk.gray(`(${cat.nameZh})`)} - ${cat.description}`,
    value: id,
    checked: cat.default
  }));

  const { categories } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'categories',
      message: 'Select rule categories:',
      choices,
      validate: (answer) => {
        if (answer.length === 0) {
          return 'Please select at least one category';
        }
        return true;
      }
    }
  ]);

  return categories;
}

/**
 * Prompt for language-specific rules
 * @param {Object} detected - Detected languages
 * @returns {Promise<string[]>} Selected language IDs
 */
export async function promptLanguageRules(detected = {}) {
  const detectedLanguages = Object.entries(detected)
    .filter(([, v]) => v)
    .map(([k]) => k);

  if (detectedLanguages.length === 0) {
    return [];
  }

  console.log();
  console.log(chalk.cyan('Language-Specific Rules:'));
  console.log(chalk.gray('  Include language-specific coding standards'));
  console.log();

  const choices = detectedLanguages
    .filter(lang => LANGUAGE_RULES[lang])
    .map(lang => ({
      name: `${LANGUAGE_RULES[lang].name} - ${LANGUAGE_RULES[lang].rules.join(', ')}`,
      value: lang,
      checked: true
    }));

  if (choices.length === 0) {
    return [];
  }

  const { languages } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'languages',
      message: 'Include language-specific rules:',
      choices
    }
  ]);

  return languages;
}

/**
 * Prompt for custom exclusion rules
 * @returns {Promise<string[]>} List of patterns/rules to exclude
 */
export async function promptExclusions() {
  console.log();
  console.log(chalk.cyan('Custom Exclusions:'));
  console.log(chalk.gray('  Specify patterns or rules to exclude from enforcement'));
  console.log();

  const { hasExclusions } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'hasExclusions',
      message: 'Do you want to add custom exclusions?',
      default: false
    }
  ]);

  if (!hasExclusions) {
    return [];
  }

  const { exclusions } = await inquirer.prompt([
    {
      type: 'input',
      name: 'exclusions',
      message: 'Enter exclusion patterns (comma-separated):',
      filter: (input) => input.split(',').map(s => s.trim()).filter(s => s.length > 0)
    }
  ]);

  return exclusions;
}

/**
 * Prompt for project-specific custom rules
 * @returns {Promise<string[]>} List of custom rules to add
 */
export async function promptCustomRules() {
  console.log();
  console.log(chalk.cyan('Project-Specific Rules:'));
  console.log(chalk.gray('  Add custom rules specific to your project'));
  console.log();

  const { hasCustomRules } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'hasCustomRules',
      message: 'Do you want to add project-specific custom rules?',
      default: false
    }
  ]);

  if (!hasCustomRules) {
    return [];
  }

  const customRules = [];
  let addMore = true;

  while (addMore) {
    const { rule } = await inquirer.prompt([
      {
        type: 'input',
        name: 'rule',
        message: 'Enter custom rule (or empty to finish):',
      }
    ]);

    if (rule.trim()) {
      customRules.push(rule.trim());
    } else {
      addMore = false;
    }
  }

  return customRules;
}

/**
 * Prompt for merge conflict resolution strategy
 * @param {string} toolName - Name of the AI tool
 * @returns {Promise<string>} 'keep', 'overwrite', or 'append'
 */
export async function promptMergeStrategy(toolName) {
  console.log();
  console.log(chalk.cyan(`Existing ${toolName} Rules Detected:`));
  console.log(chalk.gray('  Choose how to handle existing rules'));
  console.log();

  const { strategy } = await inquirer.prompt([
    {
      type: 'list',
      name: 'strategy',
      message: `How should we handle the existing ${toolName} rules?`,
      choices: [
        {
          name: `${chalk.green('Append')} ${chalk.gray('(推薦)')} - Add new rules after existing ones`,
          value: 'append'
        },
        {
          name: `${chalk.blue('Merge')} - Intelligently merge (avoid duplicates)`,
          value: 'merge'
        },
        {
          name: `${chalk.yellow('Overwrite')} - Replace with new rules`,
          value: 'overwrite'
        },
        {
          name: `${chalk.gray('Keep')} - Keep existing, skip installation`,
          value: 'keep'
        }
      ],
      default: 'append'
    }
  ]);

  return strategy;
}

/**
 * Prompt for rule detail level
 * @returns {Promise<string>} 'minimal', 'standard', or 'comprehensive'
 */
export async function promptDetailLevel() {
  console.log();
  console.log(chalk.cyan('Rule Detail Level:'));
  console.log(chalk.gray('  Choose how detailed the generated rules should be'));
  console.log();

  const { level } = await inquirer.prompt([
    {
      type: 'list',
      name: 'level',
      message: 'Select rule detail level:',
      choices: [
        {
          name: `${chalk.gray('Minimal')} - Essential rules only (~50 lines)`,
          value: 'minimal'
        },
        {
          name: `${chalk.green('Standard')} ${chalk.gray('(推薦)')} - Balanced coverage (~150 lines)`,
          value: 'standard'
        },
        {
          name: `${chalk.yellow('Comprehensive')} ${chalk.gray('(完整)')} - Full documentation (~300+ lines)`,
          value: 'comprehensive'
        }
      ],
      default: 'standard'
    }
  ]);

  return level;
}

/**
 * Prompt for output language preference
 * @returns {Promise<string>} 'en', 'zh-tw', or 'bilingual'
 */
export async function promptRuleLanguage() {
  const { language } = await inquirer.prompt([
    {
      type: 'list',
      name: 'language',
      message: 'Select rule documentation language:',
      choices: [
        {
          name: `${chalk.green('English')} ${chalk.gray('(推薦)')}`,
          value: 'en'
        },
        {
          name: `${chalk.blue('繁體中文')} (Traditional Chinese)`,
          value: 'zh-tw'
        },
        {
          name: `${chalk.yellow('Bilingual')} (雙語)`,
          value: 'bilingual'
        }
      ],
      default: 'en'
    }
  ]);

  return language;
}

/**
 * Get all rule categories
 * @returns {Object} Rule categories configuration
 */
export function getRuleCategories() {
  return RULE_CATEGORIES;
}

/**
 * Get all language rules
 * @returns {Object} Language rules configuration
 */
export function getLanguageRules() {
  return LANGUAGE_RULES;
}

/**
 * Prompt for complete integration configuration
 * @param {string} tool - AI tool name
 * @param {Object} detected - Detected project characteristics
 * @param {boolean} existingRulesFound - Whether existing rules file was found
 * @returns {Promise<Object>} Complete integration configuration
 */
export async function promptIntegrationConfig(tool, detected, existingRulesFound = false) {
  const config = {
    tool,
    mode: 'default',
    categories: Object.keys(RULE_CATEGORIES).filter(k => RULE_CATEGORIES[k].default),
    languages: [],
    exclusions: [],
    customRules: [],
    mergeStrategy: null,
    detailLevel: 'standard',
    language: 'en'
  };

  // If existing rules found, ask about merge strategy first
  if (existingRulesFound) {
    config.mergeStrategy = await promptMergeStrategy(tool);
    if (config.mergeStrategy === 'keep') {
      return config;
    }
  }

  // Ask for configuration mode
  config.mode = await promptIntegrationMode();

  if (config.mode === 'custom') {
    // Custom mode: detailed configuration
    config.categories = await promptRuleCategories(detected);
    config.languages = await promptLanguageRules(detected.languages || {});
    config.detailLevel = await promptDetailLevel();
    config.language = await promptRuleLanguage();
    config.exclusions = await promptExclusions();
    config.customRules = await promptCustomRules();
  } else if (config.mode === 'merge' && !existingRulesFound) {
    // Merge mode selected but no existing file
    console.log(chalk.yellow('  No existing rules file found. Using default mode.'));
    config.mode = 'default';
  }

  return config;
}
