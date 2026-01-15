import inquirer from 'inquirer';
import chalk from 'chalk';
import { t } from '../i18n/messages.js';
import {
  getAgentConfig,
  getAgentDisplayName
} from '../config/ai-agent-paths.js';
import { getMarketplaceSkillsInfo } from '../utils/github.js';

/**
 * Prompt for AI tools being used
 * @param {Object} detected - Detected AI tools from project
 * @returns {Promise<string[]>} Selected AI tools
 */
export async function promptAITools(detected = {}) {
  const msg = t().aiTools;

  console.log();
  console.log(chalk.cyan(msg.title));
  console.log(chalk.gray(`  ${msg.description}`));
  console.log();

  const { tools } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'tools',
      message: msg.question,
      choices: [
        new inquirer.Separator(chalk.gray(msg.separators.dynamicSkills)),
        {
          name: `${chalk.green('Claude Code')} ${chalk.gray(`(${t().recommended})`)} - ${msg.choices.claudeCode}`,
          value: 'claude-code',
          checked: detected.claudeCode || false
        },
        new inquirer.Separator(chalk.gray(msg.separators.staticRules)),
        {
          name: `Cursor ${chalk.gray('(.cursorrules)')}`,
          value: 'cursor',
          checked: detected.cursor || false
        },
        {
          name: `Windsurf ${chalk.gray('(.windsurfrules)')}`,
          value: 'windsurf',
          checked: detected.windsurf || false
        },
        {
          name: `Cline ${chalk.gray('(.clinerules)')}`,
          value: 'cline',
          checked: detected.cline || false
        },
        {
          name: `GitHub Copilot ${chalk.gray('(.github/copilot-instructions.md)')}`,
          value: 'copilot',
          checked: detected.copilot || false
        },
        {
          name: `Google Antigravity ${chalk.gray('(INSTRUCTIONS.md)')} - Gemini Agent`,
          value: 'antigravity',
          checked: detected.antigravity || false
        },
        new inquirer.Separator(chalk.gray(msg.separators.agentsMd)),
        {
          name: `OpenAI Codex ${chalk.gray('(AGENTS.md)')} - OpenAI Codex CLI`,
          value: 'codex',
          checked: detected.codex || false
        },
        {
          name: `OpenCode ${chalk.gray('(AGENTS.md)')} - Open-source AI coding agent`,
          value: 'opencode',
          checked: detected.opencode || false
        },
        new inquirer.Separator(chalk.gray(msg.separators.gemini)),
        {
          name: `Gemini CLI ${chalk.gray('(GEMINI.md)')} - Google Gemini CLI`,
          value: 'gemini-cli',
          checked: detected.geminiCli || false
        },
        new inquirer.Separator(),
        {
          name: chalk.gray(msg.choices.none),
          value: 'none'
        }
      ]
    }
  ]);

  // Filter out 'none' and separators
  const filtered = tools.filter(tool => tool !== 'none' && typeof tool === 'string');
  return filtered;
}

/**
 * Prompt for Skills installation location (unified for all AI agents)
 * @param {string[]} selectedTools - Selected AI tools
 * @returns {Promise<Array<{agent: string, level: string}>>} Array of installation targets
 */
export async function promptSkillsInstallLocation(selectedTools = []) {
  const msg = t().skillsLocation;

  // Filter to only skills-supported tools
  const skillsTools = selectedTools.filter(tool => {
    const config = getAgentConfig(tool);
    return config?.supportsSkills && config?.skills;
  });

  if (skillsTools.length === 0) {
    return [];
  }

  console.log();
  console.log(chalk.cyan(msg.title));
  console.log(chalk.gray(`  ${msg.description}`));

  // Check Claude Code Marketplace status
  const hasClaudeCode = skillsTools.includes('claude-code');
  if (hasClaudeCode) {
    const marketplaceInfo = getMarketplaceSkillsInfo();
    if (marketplaceInfo && marketplaceInfo.version) {
      console.log();
      console.log(chalk.yellow(`  ⚠ ${msg.marketplaceWarning || 'Claude Code Skills 已透過 Marketplace 安裝'}`));
      console.log(chalk.gray(`    ${msg.coexistNote || '檔案安裝將與 Marketplace 版本並存'}`));
    }
  }
  console.log();

  // Build choices dynamically based on selected tools
  const choices = [];

  // Add Marketplace option for Claude Code (recommended)
  if (hasClaudeCode) {
    choices.push({
      name: `${chalk.green('Plugin Marketplace')} ${chalk.gray(`(${t().recommended})`)} - ${msg.choices.marketplace}`,
      value: 'marketplace'
    });
    choices.push(new inquirer.Separator(chalk.gray('── 或選擇檔案安裝位置 ──')));
  }

  // Add options for each agent
  for (const tool of skillsTools) {
    const config = getAgentConfig(tool);
    const displayName = getAgentDisplayName(tool);

    // User level option
    choices.push({
      name: `${chalk.blue(displayName)} - ${msg.choices?.userLevel || '使用者層級'} ${chalk.gray(`(${config.skills.user.replace(require('os').homedir(), '~')})`)}`,
      value: `${tool}:user`
    });

    // Project level option
    choices.push({
      name: `${chalk.blue(displayName)} - ${msg.choices?.projectLevel || '專案層級'} ${chalk.gray(`(${config.skills.project})`)}`,
      value: `${tool}:project`
    });
  }

  // Add skip option
  choices.push(new inquirer.Separator());
  choices.push({
    name: `${chalk.gray('Skip')} - ${msg.choices.none}`,
    value: 'none'
  });

  const { locations } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'locations',
      message: msg.questionMulti || '選擇要安裝 Skills 的位置（可多選）',
      choices,
      validate: (answer) => {
        // If 'none' is selected, ensure it's the only selection
        if (answer.includes('none') && answer.length > 1) {
          return '選擇「跳過」時不能同時選擇其他選項';
        }
        return true;
      }
    }
  ]);

  // Handle 'none' selection
  if (locations.includes('none') || locations.length === 0) {
    return [];
  }

  // Handle marketplace selection
  if (locations.includes('marketplace')) {
    console.log();
    console.log(chalk.gray(msg.explanations?.marketplace || '透過 Claude Code Marketplace 安裝，自動更新'));
    console.log();
    return [{ agent: 'claude-code', level: 'marketplace' }];
  }

  // Parse selections into agent:level pairs
  const installations = locations
    .filter(loc => loc !== 'none' && loc !== 'marketplace')
    .map(loc => {
      const [agent, level] = loc.split(':');
      return { agent, level };
    });

  if (installations.length > 0) {
    console.log();
    console.log(chalk.gray(`  將安裝 Skills 到 ${installations.length} 個位置`));
    console.log();
  }

  return installations;
}

/**
 * Prompt for slash commands installation
 * @param {string[]} selectedTools - Selected AI tools
 * @returns {Promise<string[]>} Array of agent identifiers to install commands for
 */
export async function promptCommandsInstallation(selectedTools = []) {
  const msg = t().commandsInstallation || {};

  // Filter to only commands-supported tools
  const commandsSupportedTools = selectedTools.filter(tool => {
    const config = getAgentConfig(tool);
    return config?.commands !== null;
  });

  if (commandsSupportedTools.length === 0) {
    return [];
  }

  console.log();
  console.log(chalk.cyan(msg.title || '斜線命令安裝'));
  console.log(chalk.gray(`  ${msg.description || '以下 AI Agent 支援斜線命令：'}`));

  // Show supported tools
  for (const tool of commandsSupportedTools) {
    const config = getAgentConfig(tool);
    const displayName = getAgentDisplayName(tool);
    console.log(chalk.gray(`    • ${displayName} → ${config.commands.project}`));
  }
  console.log();

  const choices = commandsSupportedTools.map(tool => ({
    name: getAgentDisplayName(tool),
    value: tool,
    checked: true // Default to installing commands
  }));

  choices.push(new inquirer.Separator());
  choices.push({
    name: chalk.gray(msg.choices?.skip || '跳過（使用 Skills 替代）'),
    value: 'none'
  });

  const { agents } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'agents',
      message: msg.question || '選擇要安裝斜線命令的 AI Agent',
      choices
    }
  ]);

  // Filter out 'none'
  const selected = agents.filter(a => a !== 'none');

  if (selected.length > 0) {
    console.log();
    console.log(chalk.gray(`  將為 ${selected.length} 個 AI Agent 安裝 15 個斜線命令`));
    console.log();
  }

  return selected;
}

/**
 * Prompt for Skills update (dual-level check)
 * @param {Object|null} projectInfo - Project-level Skills info
 * @param {Object|null} userInfo - User-level Skills info
 * @param {string} latestVersion - Latest available version
 * @returns {Promise<Object>} Update decision { action: 'both'|'project'|'user'|'none', targets: string[] }
 */
export async function promptSkillsUpdate(projectInfo, userInfo, latestVersion) {
  const msg = t().skillsUpdate;
  const choices = [];
  const needsUpdate = [];

  // Check project-level
  if (projectInfo?.installed) {
    const projectVersion = projectInfo.version || 'unknown';
    const projectNeedsUpdate = projectVersion !== latestVersion;
    if (projectNeedsUpdate) {
      needsUpdate.push('project');
    }
  }

  // Check user-level
  if (userInfo?.installed) {
    const userVersion = userInfo.version || 'unknown';
    const userNeedsUpdate = userVersion !== latestVersion;
    if (userNeedsUpdate) {
      needsUpdate.push('user');
    }
  }

  // If nothing needs update
  if (needsUpdate.length === 0) {
    console.log(chalk.green(msg.upToDate));
    return { action: 'none', targets: [] };
  }

  // Build choices based on what needs updating
  console.log();
  console.log(chalk.cyan(msg.title));

  if (projectInfo?.installed) {
    const pVer = projectInfo.version || 'unknown';
    const pStatus = pVer === latestVersion
      ? chalk.green('✓ up to date')
      : chalk.yellow(`v${pVer} → v${latestVersion}`);
    console.log(chalk.gray(`  ${msg.projectLevel} ${pStatus}`));
  }

  if (userInfo?.installed) {
    const uVer = userInfo.version || 'unknown';
    const uStatus = uVer === latestVersion
      ? chalk.green('✓ up to date')
      : chalk.yellow(`v${uVer} → v${latestVersion}`);
    console.log(chalk.gray(`  ${msg.userLevel} ${uStatus}`));
  }
  console.log();

  // Build update choices
  if (needsUpdate.includes('project') && needsUpdate.includes('user')) {
    choices.push({
      name: `${chalk.green('Update Both')} - ${msg.choices.both}`,
      value: 'both'
    });
  }

  if (needsUpdate.includes('project')) {
    choices.push({
      name: `${chalk.blue('Update Project Level')} - ${msg.choices.project}`,
      value: 'project'
    });
  }

  if (needsUpdate.includes('user')) {
    choices.push({
      name: `${chalk.blue('Update User Level')} - ${msg.choices.user}`,
      value: 'user'
    });
  }

  choices.push({
    name: `${chalk.gray('Skip')} - ${msg.choices.skip}`,
    value: 'none'
  });

  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: msg.question,
      choices,
      default: needsUpdate.length === 2 ? 'both' : needsUpdate[0]
    }
  ]);

  // Determine targets
  let targets = [];
  if (action === 'both') {
    targets = ['project', 'user'];
  } else if (action === 'project' || action === 'user') {
    targets = [action];
  }

  return { action, targets };
}

/**
 * Prompt for standards scope when Skills are installed
 *
 * When Skills are installed, users can choose:
 * - minimal (Lean): Only reference docs, Skills provide real-time task-oriented guidance
 * - full (Complete): All standards as local files, doesn't rely on Skills
 *
 * @param {boolean} hasSkills - Whether Skills are installed
 * @returns {Promise<string>} 'full' or 'minimal'
 */
export async function promptStandardsScope(hasSkills) {
  if (!hasSkills) {
    return 'full';
  }

  const msg = t().scope;

  console.log();
  console.log(chalk.cyan(msg.title));
  console.log(chalk.gray(`  ${msg.description}`));
  console.log(chalk.gray(`  ${msg.description2}`));
  console.log();

  const { scope } = await inquirer.prompt([
    {
      type: 'list',
      name: 'scope',
      message: msg.question,
      choices: [
        {
          name: `${chalk.green('Lean')} ${chalk.gray(`(${t().recommended})`)} - ${msg.choices.minimal}`,
          value: 'minimal'
        },
        {
          name: `${chalk.blue('Complete')} - ${msg.choices.full}`,
          value: 'full'
        }
      ],
      default: 'minimal'
    }
  ]);

  // Show scope implications
  console.log();
  for (const line of msg.explanations[scope]) {
    console.log(chalk.gray(line));
  }
  console.log();

  return scope;
}

/**
 * Prompt for output format (AI or Human-readable)
 *
 * Format affects how standards files are structured:
 * - ai (Compact): YAML format, fewer tokens, faster AI parsing
 * - human (Detailed): Full Markdown with examples, better for team learning
 * - both: Install both formats, AI uses YAML, humans use Markdown
 *
 * @returns {Promise<string>} 'ai', 'human', or 'both'
 */
export async function promptFormat() {
  const msg = t().format;

  console.log();
  console.log(chalk.cyan(msg.title));
  console.log(chalk.gray(`  ${msg.description}`));
  console.log();

  const { format } = await inquirer.prompt([
    {
      type: 'list',
      name: 'format',
      message: msg.question,
      choices: [
        {
          name: `${chalk.green('Compact')} ${chalk.gray(`(${t().recommended})`)} - ${msg.choices.ai}`,
          value: 'ai'
        },
        {
          name: `${chalk.blue('Detailed')} - ${msg.choices.human}`,
          value: 'human'
        },
        {
          name: `${chalk.yellow('Both')} ${chalk.gray(`(${t().advanced})`)} - ${msg.choices.both}`,
          value: 'both'
        }
      ],
      default: 'ai'
    }
  ]);

  // Show format implications
  console.log();
  console.log(chalk.gray(msg.explanations[format]));
  console.log();

  return format;
}

/**
 * Prompt for Git workflow strategy
 *
 * Git workflows determine branching and release strategies:
 * - GitHub Flow: Simple, PR-based, good for continuous deployment
 * - GitFlow: Structured with develop/release branches, for scheduled releases
 * - Trunk-Based: Direct commits to main with feature flags, for mature CI/CD
 *
 * @returns {Promise<string>} Selected workflow ID
 */
export async function promptGitWorkflow() {
  const msg = t().gitWorkflow;

  console.log();
  console.log(chalk.cyan(msg.title));
  console.log(chalk.gray(`  ${msg.description}`));
  console.log();

  const { workflow } = await inquirer.prompt([
    {
      type: 'list',
      name: 'workflow',
      message: msg.question,
      choices: [
        {
          name: `${chalk.green('GitHub Flow')} ${chalk.gray(`(${t().recommended})`)} - ${msg.choices['github-flow']}`,
          value: 'github-flow'
        },
        {
          name: `${chalk.blue('GitFlow')} - ${msg.choices.gitflow}`,
          value: 'gitflow'
        },
        {
          name: `${chalk.yellow('Trunk-Based')} - ${msg.choices['trunk-based']}`,
          value: 'trunk-based'
        }
      ],
      default: 'github-flow'
    }
  ]);

  // Show workflow details
  console.log();
  for (const line of msg.details[workflow]) {
    console.log(chalk.gray(line));
  }
  console.log();

  return workflow;
}

/**
 * Prompt for merge strategy
 *
 * Merge strategies affect git history:
 * - Squash: One commit per PR, clean history, loses individual commits
 * - Merge Commit: Preserves full history, creates merge commit
 * - Rebase + FF: Linear history, requires rebasing, advanced
 *
 * @returns {Promise<string>} Selected merge strategy ID
 */
export async function promptMergeStrategy() {
  const msg = t().mergeStrategy;

  console.log();
  console.log(chalk.cyan(msg.title));
  console.log(chalk.gray(`  ${msg.description}`));
  console.log();

  const { strategy } = await inquirer.prompt([
    {
      type: 'list',
      name: 'strategy',
      message: msg.question,
      choices: [
        {
          name: `${chalk.green('Squash Merge')} ${chalk.gray(`(${t().recommended})`)} - ${msg.choices.squash}`,
          value: 'squash'
        },
        {
          name: `${chalk.blue('Merge Commit')} - ${msg.choices['merge-commit']}`,
          value: 'merge-commit'
        },
        {
          name: `${chalk.yellow('Rebase + Fast-Forward')} ${chalk.gray(`(${t().advanced})`)} - ${msg.choices['rebase-ff']}`,
          value: 'rebase-ff'
        }
      ],
      default: 'squash'
    }
  ]);

  // Show strategy implications
  console.log();
  for (const line of msg.details[strategy]) {
    console.log(chalk.gray(line));
  }
  console.log();

  return strategy;
}

/**
 * Prompt for commit message language
 * @returns {Promise<string>} Selected language ID
 */
export async function promptCommitLanguage() {
  const msg = t().commitLanguage;

  console.log();
  console.log(chalk.cyan(msg.title));
  console.log(chalk.gray(`  ${msg.description}`));
  console.log();

  const { language } = await inquirer.prompt([
    {
      type: 'list',
      name: 'language',
      message: msg.question,
      choices: [
        {
          name: `${chalk.green(msg.labels.english)} ${chalk.gray(`(${t().recommended})`)} - ${msg.choices.english}`,
          value: 'english'
        },
        {
          name: `${chalk.blue(msg.labels.chinese)} - ${msg.choices.chinese}`,
          value: 'traditional-chinese'
        },
        {
          name: `${chalk.yellow(msg.labels.bilingual)} - ${msg.choices.bilingual}`,
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
 *
 * Test pyramid levels with recommended coverage ratios:
 * - Unit (70%): Test individual functions, fast feedback
 * - Integration (20%): Test component interactions, API calls
 * - System (7%): Test full system behavior
 * - E2E (3%): Test user workflows through UI
 *
 * @returns {Promise<string[]>} Selected test level IDs
 */
export async function promptTestLevels() {
  const msg = t().testLevels;

  console.log();
  console.log(chalk.cyan(msg.title));
  console.log(chalk.gray(`  ${msg.description}`));
  console.log(chalk.gray(`  ${msg.description2}`));
  console.log();

  const { levels } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'levels',
      message: msg.question,
      choices: [
        {
          name: `Unit Testing ${chalk.gray('(70%)')} - ${msg.choices.unit}`,
          value: 'unit-testing',
          checked: true
        },
        {
          name: `Integration Testing ${chalk.gray('(20%)')} - ${msg.choices.integration}`,
          value: 'integration-testing',
          checked: true
        },
        {
          name: `System Testing ${chalk.gray('(7%)')} - ${msg.choices.system}`,
          value: 'system-testing',
          checked: false
        },
        {
          name: `E2E Testing ${chalk.gray('(3%)')} - ${msg.choices.e2e}`,
          value: 'e2e-testing',
          checked: false
        }
      ]
    }
  ]);

  // Show test pyramid visualization
  if (levels.length > 0) {
    console.log();
    for (const line of msg.pyramid) {
      console.log(chalk.gray(line));
    }
    console.log();
  }

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
  const msg = t().installMode;

  const { mode } = await inquirer.prompt([
    {
      type: 'list',
      name: 'mode',
      message: msg.question,
      choices: [
        {
          name: `${chalk.green('Skills Mode')} ${chalk.gray(`(${t().recommended})`)} - ${msg.choices.skills}`,
          value: 'skills'
        },
        {
          name: `${chalk.yellow('Full Mode')} - ${msg.choices.full}`,
          value: 'full'
        }
      ],
      default: 'skills'
    }
  ]);

  // Show explanation based on selection
  console.log();
  for (const line of msg.explanations[mode]) {
    console.log(chalk.gray(line));
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
 *
 * Adoption levels determine how many standards are installed:
 * - Level 1 (Starter): 6 core standards - commit, anti-hallucination, checkin, etc.
 * - Level 2 (Professional): 12 standards - adds testing, git workflow, error handling
 * - Level 3 (Complete): All 16 standards - includes versioning, logging, SDD
 *
 * @returns {Promise<number>} Selected level
 */
export async function promptLevel() {
  const msg = t().level;

  console.log();
  console.log(chalk.cyan(msg.title));
  console.log(chalk.gray(`  ${msg.description}`));
  console.log();

  const { level } = await inquirer.prompt([
    {
      type: 'list',
      name: 'level',
      message: msg.question,
      choices: [
        {
          name: `${chalk.blue('Level 1: Starter')} - ${msg.choices[1]}`,
          value: 1
        },
        {
          name: `${chalk.green('Level 2: Professional')} ${chalk.gray(`(${t().recommended})`)} - ${msg.choices[2]}`,
          value: 2
        },
        {
          name: `${chalk.yellow('Level 3: Complete')} - ${msg.choices[3]}`,
          value: 3
        }
      ],
      default: 2
    }
  ]);

  // Show what's included in selected level
  console.log();
  for (const line of msg.details[level]) {
    console.log(chalk.gray(line));
  }
  console.log();

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

/**
 * Prompt for integration file content mode
 * @returns {Promise<string>} 'full', 'index', or 'minimal'
 */
/**
 * Prompt for integration file content mode
 *
 * Content Mode determines how much standards content is embedded in AI tool config files
 * (CLAUDE.md, .cursorrules, etc.) and affects AI Agent execution behavior:
 *
 * - minimal: Only file references. AI must read .standards/ files each time.
 *            Best with Skills (which provide real-time guidance).
 * - index:   Summary + MUST/SHOULD task mapping. AI knows when to read which file.
 *            Best balance of context usage and compliance.
 * - full:    All rules embedded. AI has everything in context immediately.
 *            Highest compliance but uses more context space.
 *
 * @returns {Promise<string>} 'full', 'index', or 'minimal'
 */
export async function promptContentMode() {
  const msg = t().contentMode;

  console.log();
  console.log(chalk.cyan(msg.title));
  console.log(chalk.gray(`  ${msg.description}`));
  console.log(chalk.gray(`  ${msg.description2}`));
  console.log();

  const { mode } = await inquirer.prompt([
    {
      type: 'list',
      name: 'mode',
      message: msg.question,
      choices: [
        {
          name: `${chalk.green('Standard')} ${chalk.gray(`(${t().recommended})`)} - ${msg.choices.index}`,
          value: 'index'
        },
        {
          name: `${chalk.blue('Full Embed')} - ${msg.choices.full}`,
          value: 'full'
        },
        {
          name: `${chalk.gray('Minimal')} - ${msg.choices.minimal}`,
          value: 'minimal'
        }
      ],
      default: 'index'
    }
  ]);

  // Detailed explanations based on selection
  console.log();
  for (const line of msg.explanations[mode]) {
    console.log(chalk.gray(line));
  }
  console.log();

  return mode;
}

/**
 * Handle AGENTS.md sharing notification
 * When both Codex and OpenCode are selected, inform user they share the same file
 * @param {string[]} selectedTools - List of selected AI tools
 * @returns {string[]} Deduplicated tools (keeps both, but will only generate one AGENTS.md)
 */
export function handleAgentsMdSharing(selectedTools) {
  const hasCodex = selectedTools.includes('codex');
  const hasOpencode = selectedTools.includes('opencode');

  if (hasCodex && hasOpencode) {
    console.log();
    console.log(chalk.yellow('Note: OpenAI Codex and OpenCode both use AGENTS.md'));
    console.log(chalk.gray('  → A single AGENTS.md file will be generated'));
    console.log(chalk.gray('  → Both tools are compatible with the same file format'));
    console.log();
  }

  return selectedTools;
}

/**
 * AI tool definitions for configure command
 */
const AI_TOOL_DEFINITIONS = {
  'claude-code': { name: 'Claude Code', file: 'CLAUDE.md' },
  cursor: { name: 'Cursor', file: '.cursorrules' },
  windsurf: { name: 'Windsurf', file: '.windsurfrules' },
  cline: { name: 'Cline', file: '.clinerules' },
  copilot: { name: 'GitHub Copilot', file: '.github/copilot-instructions.md' },
  antigravity: { name: 'Google Antigravity', file: 'INSTRUCTIONS.md' },
  codex: { name: 'OpenAI Codex', file: 'AGENTS.md' },
  'gemini-cli': { name: 'Gemini CLI', file: 'GEMINI.md' },
  opencode: { name: 'OpenCode', file: 'AGENTS.md' }
};

/**
 * Prompt for AI tools management action
 * @param {string[]} currentTools - Currently installed AI tools
 * @returns {Promise<Object>} Action and tools to modify
 */
export async function promptManageAITools(currentTools = []) {
  const msg = t().manageAITools;

  console.log();
  console.log(chalk.cyan(msg.title));
  console.log(chalk.gray(`  ${msg.currentlyInstalled} ${currentTools.length > 0 ? currentTools.join(', ') : msg.none}`));
  console.log();

  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: msg.question,
      choices: [
        { name: msg.choices.add, value: 'add' },
        { name: msg.choices.remove, value: 'remove' },
        { name: msg.choices.view, value: 'view' },
        { name: chalk.gray(msg.choices.cancel), value: 'cancel' }
      ]
    }
  ]);

  if (action === 'view') {
    console.log();
    console.log(chalk.cyan(msg.installedTitle));
    if (currentTools.length === 0) {
      console.log(chalk.gray(`  ${msg.noTools}`));
    } else {
      for (const tool of currentTools) {
        const def = AI_TOOL_DEFINITIONS[tool];
        console.log(chalk.gray(`  • ${def?.name || tool} (${def?.file || 'unknown'})`));
      }
    }
    console.log();
    return { action: 'view', tools: [] };
  }

  if (action === 'cancel') {
    return { action: 'cancel', tools: [] };
  }

  if (action === 'add') {
    // Show tools not yet installed
    const availableTools = Object.entries(AI_TOOL_DEFINITIONS)
      .filter(([id]) => !currentTools.includes(id))
      .map(([id, def]) => ({
        name: `${def.name} ${chalk.gray(`(${def.file})`)}`,
        value: id
      }));

    if (availableTools.length === 0) {
      console.log(chalk.yellow(`  ${msg.allInstalled}`));
      return { action: 'cancel', tools: [] };
    }

    const { toolsToAdd } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'toolsToAdd',
        message: msg.selectToAdd,
        choices: availableTools
      }
    ]);

    return { action: 'add', tools: toolsToAdd };
  }

  if (action === 'remove') {
    if (currentTools.length === 0) {
      console.log(chalk.yellow(`  ${msg.noToolsToRemove}`));
      return { action: 'cancel', tools: [] };
    }

    const installedChoices = currentTools.map(id => {
      const def = AI_TOOL_DEFINITIONS[id];
      return {
        name: `${def?.name || id} ${chalk.gray(`(${def?.file || 'unknown'})`)}`,
        value: id
      };
    });

    const { toolsToRemove } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'toolsToRemove',
        message: msg.selectToRemove,
        choices: installedChoices
      }
    ]);

    return { action: 'remove', tools: toolsToRemove };
  }

  return { action: 'cancel', tools: [] };
}

/**
 * Prompt for adoption level change
 * @param {number} currentLevel - Current adoption level
 * @returns {Promise<number>} New level
 */
export async function promptAdoptionLevel(currentLevel) {
  const msg = t().adoptionLevelConfig;

  console.log();
  console.log(chalk.cyan(msg.title));
  console.log(chalk.gray(`  ${msg.currentLevel} ${currentLevel}`));
  console.log();

  const { level } = await inquirer.prompt([
    {
      type: 'list',
      name: 'level',
      message: msg.question,
      choices: [
        {
          name: `${chalk.blue('Level 1: Starter')} - ${msg.choices[1]}`,
          value: 1
        },
        {
          name: `${chalk.green('Level 2: Professional')} ${chalk.gray(`(${t().recommended})`)} - ${msg.choices[2]}`,
          value: 2
        },
        {
          name: `${chalk.yellow('Level 3: Complete')} - ${msg.choices[3]}`,
          value: 3
        }
      ],
      default: currentLevel - 1  // 0-indexed
    }
  ]);

  if (level !== currentLevel) {
    console.log();
    if (level > currentLevel) {
      console.log(chalk.yellow(msg.warnings.upgrade));
    } else {
      console.log(chalk.yellow(msg.warnings.downgrade));
      console.log(chalk.gray(msg.warnings.downgradeHint));
    }
  }

  return level;
}

/**
 * Prompt for content mode change (used in uds configure)
 * @param {string} currentMode - Current content mode
 * @returns {Promise<string>} New content mode
 */
export async function promptContentModeChange(currentMode) {
  const msg = t().contentMode;
  const changeMsg = t().contentModeChange;

  const modeLabels = {
    index: 'Standard',
    full: 'Full Embed',
    minimal: 'Minimal'
  };

  console.log();
  console.log(chalk.cyan(msg.title));
  console.log(chalk.gray(`  ${changeMsg.currentMode} ${modeLabels[currentMode] || currentMode || 'minimal'}`));
  console.log(chalk.gray(`  ${msg.description2}`));
  console.log();

  const { mode } = await inquirer.prompt([
    {
      type: 'list',
      name: 'mode',
      message: msg.question,
      choices: [
        {
          name: `${chalk.green('Standard')} ${chalk.gray(`(${t().recommended})`)} - ${msg.choices.index}`,
          value: 'index'
        },
        {
          name: `${chalk.blue('Full Embed')} - ${msg.choices.full}`,
          value: 'full'
        },
        {
          name: `${chalk.gray('Minimal')} - ${msg.choices.minimal}`,
          value: 'minimal'
        }
      ],
      default: currentMode === 'full' ? 1 : currentMode === 'minimal' ? 2 : 0
    }
  ]);

  if (mode !== currentMode) {
    console.log();
    console.log(chalk.yellow(`⚠ ${changeMsg.warning}`));
    console.log(chalk.gray(changeMsg.explanations[mode]));
  }

  return mode;
}

/**
 * Prompt for development methodology selection
 * @returns {Promise<string|null>} Selected methodology ID or null
 */
export async function promptMethodology() {
  const msg = t().methodology;

  console.log();
  console.log(chalk.cyan(msg.title));
  console.log(chalk.yellow(`  ${msg.experimental}`));
  console.log(chalk.gray(`  ${msg.description}`));
  console.log();

  const { methodology } = await inquirer.prompt([
    {
      type: 'list',
      name: 'methodology',
      message: msg.question,
      choices: [
        {
          name: `${chalk.red('TDD')} ${chalk.gray(`- ${msg.choices.tdd}`)}`,
          value: 'tdd'
        },
        {
          name: `${chalk.green('BDD')} ${chalk.gray(`- ${msg.choices.bdd}`)}`,
          value: 'bdd'
        },
        {
          name: `${chalk.blue('SDD')} ${chalk.gray(`- ${msg.choices.sdd}`)}`,
          value: 'sdd'
        },
        {
          name: `${chalk.yellow('ATDD')} ${chalk.gray(`- ${msg.choices.atdd}`)}`,
          value: 'atdd'
        },
        new inquirer.Separator(),
        {
          name: `${chalk.gray('None')} - ${msg.choices.none}`,
          value: null
        }
      ],
      default: null
    }
  ]);

  return methodology;
}
