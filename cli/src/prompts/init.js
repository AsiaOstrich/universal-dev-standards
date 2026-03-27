import { select, checkbox, confirm as inquirerConfirm, Separator } from '@inquirer/prompts';
import chalk from 'chalk';
import os from 'os';
import { t, setLanguage, detectLanguage } from '../i18n/messages.js';
import {
  getAgentConfig,
  getAgentDisplayName
} from '../config/ai-agent-paths.js';


/**
 * Prompt for display language (first prompt in init flow)
 * This sets the language for CLI messages and AI Agent instructions.
 *
 * The prompt uses bilingual format since we don't know user's preferred
 * language at this point. After selection, the CLI language switches
 * immediately for all subsequent prompts.
 *
 * @returns {Promise<string>} Selected language code ('en', 'zh-tw', or 'zh-cn')
 */
export async function promptDisplayLanguage() {
  // Detect system language for smart default
  const systemLang = detectLanguage(null);

  // Use the message from current (initial) language - which is bilingual by design
  const msg = t().displayLanguage;

  console.log();
  console.log(chalk.cyan(msg.title));
  console.log(chalk.gray(`  ${msg.description}`));
  console.log(chalk.gray(`  ${t().listHint}`));
  console.log();

  const language = await select({
      message: msg.question,
      choices: [
        {
          name: `English ${chalk.gray('(Default for international teams)')}`,
          value: 'en'
        },
        {
          name: `繁體中文 ${chalk.gray('(Traditional Chinese)')}`,
          value: 'zh-tw'
        },
        {
          name: `简体中文 ${chalk.gray('(Simplified Chinese)')}`,
          value: 'zh-cn'
        }
      ],
      default: systemLang
  });

  // Immediately switch language for all subsequent prompts
  setLanguage(language);

  // Show confirmation in the selected language
  const selectedMsg = t().displayLanguage;
  console.log();
  console.log(chalk.gray(selectedMsg.explanations[language]));
  console.log();

  return language;
}

/**
 * Prompt for AI tools being used
 * @param {Object} detected - Detected AI tools from project
 * @returns {Promise<string[]>} Selected AI tools
 */
export async function promptAITools(detected = {}) {
  const msg = t().aiTools;
  const checkboxHint = t().checkboxHint;

  console.log();
  console.log(chalk.cyan(msg.title));
  console.log(chalk.gray(`  ${msg.description}`));
  console.log(chalk.gray(`  ${checkboxHint}`));
  console.log();

  const tools = await checkbox({
      message: msg.question,
      instructions: false,  // Hide default English hint, we show translated hint above
      choices: [
        {
          name: `Claude Code ${chalk.gray('(CLAUDE.md)')}`,
          value: 'claude-code',
          checked: detected.claudeCode || false
        },
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
          name: `Google Antigravity ${chalk.gray('(INSTRUCTIONS.md)')}`,
          value: 'antigravity',
          checked: detected.antigravity || false
        },
        {
          name: `OpenAI Codex ${chalk.gray('(AGENTS.md)')}`,
          value: 'codex',
          checked: detected.codex || false
        },
        {
          name: `OpenCode ${chalk.gray('(AGENTS.md)')}`,
          value: 'opencode',
          checked: detected.opencode || false
        },
        {
          name: `Gemini CLI ${chalk.gray('(GEMINI.md)')}`,
          value: 'gemini-cli',
          checked: detected.geminiCli || false
        }
      ]
  });

  // Filter out separators (keep only string values)
  const filtered = tools.filter(tool => typeof tool === 'string');
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

  // Check if Claude Code is selected (for marketplace info)
  const hasClaudeCode = skillsTools.includes('claude-code');

  // Get translated checkbox hint
  const checkboxHint = t().checkboxHint;
  const marketplaceMsg = t().marketplaceInstall || {};

  console.log();
  console.log(chalk.cyan(msg.title));
  console.log(chalk.gray(`  ${msg.description}`));
  console.log(chalk.gray(`  ${checkboxHint}`));

  // Show Marketplace info for Claude Code (not as a selectable option)
  if (hasClaudeCode) {
    console.log();
    console.log(chalk.yellow(`  💡 ${marketplaceMsg.claudeCodeTip || 'Claude Code can be installed via Marketplace:'}`));
    console.log(chalk.white('     /plugin install universal-dev-standards@asia-ostrich'));
    console.log(chalk.gray(`     → ${msg.choices.marketplace}`));
  }

  // Show git sharing hint for project-level installation
  if (msg.gitSharingHint) {
    console.log();
    console.log(chalk.gray(`  💡 ${msg.gitSharingHint}`));
  }
  console.log();

  // Build choices dynamically based on selected tools
  const choices = [];

  // Add options for each agent
  for (const tool of skillsTools) {
    const config = getAgentConfig(tool);
    const displayName = getAgentDisplayName(tool);

    // User level option
    choices.push({
      name: `${chalk.blue(displayName)} - ${msg.choices.userLevel} ${chalk.gray(`(${config.skills.user.replace(os.homedir(), '~')})`)}`,
      value: `${tool}:user`
    });

    // Project level option
    choices.push({
      name: `${chalk.blue(displayName)} - ${msg.choices.projectLevel} ${chalk.gray(`(${config.skills.project})`)}`,
      value: `${tool}:project`
    });
  }

  const locations = await checkbox({
      message: msg.questionMulti,
      choices,
      instructions: false  // Hide default English hint, we show translated hint above
  });

  // Handle empty selection (user chose to skip)
  if (locations.length === 0) {
    return [];
  }

  // Parse selections into agent:level pairs
  const installations = locations
    .filter(loc => loc !== 'none' && loc !== 'marketplace')
    .map(loc => {
      const [agent, level] = loc.split(':');
      return { agent, level };
    });

  // Deduplicate: if same agent selected at both user + project levels, keep project (shareable via Git)
  const seen = new Map();
  const deduped = [];
  for (const inst of installations) {
    const existing = seen.get(inst.agent);
    if (existing) {
      if (inst.level === 'project') {
        deduped[deduped.indexOf(existing)] = inst;
        seen.set(inst.agent, inst);
      }
      const displayName = getAgentDisplayName(inst.agent);
      console.log(chalk.yellow(`  ⚠ ${displayName}: ${msg.warnings?.duplicateLevel || 'Same agent selected at both levels, keeping project level'}`));
    } else {
      seen.set(inst.agent, inst);
      deduped.push(inst);
    }
  }

  if (deduped.length > 0) {
    console.log();
    console.log(chalk.gray(`  ${msg.installCount.replace('{count}', deduped.length)}`));
    console.log();
  }

  return deduped;
}

/**
 * Prompt for slash commands installation
 * @param {string[]} selectedTools - Selected AI tools
 * @returns {Promise<Array<{agent: string, level: string}>>} Array of installation targets
 */
export async function promptCommandsInstallation(selectedTools = []) {
  const msg = t().commandsInstallation || {};
  const checkboxHint = t().checkboxHint;

  // Filter to only commands-supported tools
  const commandsSupportedTools = selectedTools.filter(tool => {
    const config = getAgentConfig(tool);
    return config?.commands !== null;
  });

  if (commandsSupportedTools.length === 0) {
    return [];
  }

  console.log();
  console.log(chalk.cyan(msg.title));
  console.log(chalk.gray(`  ${msg.description}`));
  console.log(chalk.gray(`  ${checkboxHint}`));

  // Show git sharing hint for project-level installation
  if (msg.gitSharingHint) {
    console.log();
    console.log(chalk.gray(`  💡 ${msg.gitSharingHint}`));
  }
  console.log();

  // Build choices dynamically - User Level + Project Level for each agent
  const choices = [];

  for (const tool of commandsSupportedTools) {
    const config = getAgentConfig(tool);
    const displayName = getAgentDisplayName(tool);

    // User level option (skip if user path is null - e.g., Copilot only supports VS Code IDE)
    if (config.commands.user) {
      choices.push({
        name: `${chalk.blue(displayName)} - ${msg.choices.userLevel} ${chalk.gray(`(${config.commands.user.replace(os.homedir(), '~')})`)}`,
        value: `${tool}:user`
      });
    }

    // Project level option
    choices.push({
      name: `${chalk.blue(displayName)} - ${msg.choices.projectLevel} ${chalk.gray(`(${config.commands.project})`)}`,
      value: `${tool}:project`,
      checked: true // Default to project level
    });
  }

  const locations = await checkbox({
      message: msg.questionMulti || msg.question,
      choices,
      instructions: false  // Hide default English hint, we show translated hint above
  });

  // Handle empty selection (user chose to skip)
  if (locations.length === 0) {
    return [];
  }

  // Parse selections into agent:level pairs
  const installations = locations.map(loc => {
      const [agent, level] = loc.split(':');
      return { agent, level };
    });

  // Deduplicate: if same agent selected at both user + project levels, keep project (shareable via Git)
  const seen = new Map();
  const deduped = [];
  for (const inst of installations) {
    const existing = seen.get(inst.agent);
    if (existing) {
      if (inst.level === 'project') {
        deduped[deduped.indexOf(existing)] = inst;
        seen.set(inst.agent, inst);
      }
      const displayName = getAgentDisplayName(inst.agent);
      console.log(chalk.yellow(`  ⚠ ${displayName}: ${msg.warnings?.duplicateLevel || 'Same agent selected at both levels, keeping project level'}`));
    } else {
      seen.set(inst.agent, inst);
      deduped.push(inst);
    }
  }

  // Show explanation
  if (deduped.length > 0) {
    console.log();
    // Group by level for explanation
    const hasUser = deduped.some(i => i.level === 'user');
    const hasProject = deduped.some(i => i.level === 'project');
    if (hasUser && msg.explanations?.user) {
      console.log(chalk.gray(msg.explanations.user));
    }
    if (hasProject && msg.explanations?.project) {
      console.log(chalk.gray(msg.explanations.project));
    }
    console.log();
  }

  return deduped;
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

  console.log(chalk.gray(`  ${t().listHint}`));

  const action = await select({
      message: msg.question,
      choices,
      default: needsUpdate.length === 2 ? 'both' : needsUpdate[0]
  });

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
  console.log(chalk.gray(`  ${t().listHint}`));
  console.log();

  const scope = await select({
      message: msg.question,
      choices: [
        {
          name: `${chalk.green(msg.labels.minimal)} ${chalk.gray(`(${t().recommended})`)} - ${msg.choices.minimal}`,
          value: 'minimal'
        },
        {
          name: `${chalk.blue(msg.labels.full)} - ${msg.choices.full}`,
          value: 'full'
        }
      ],
      default: 'minimal'
  });

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
  console.log(chalk.gray(`  ${t().listHint}`));
  console.log();

  const format = await select({
      message: msg.question,
      choices: [
        {
          name: `${chalk.green(msg.labels.ai)} ${chalk.gray(`(${t().recommended})`)} - ${msg.choices.ai}`,
          value: 'ai'
        },
        {
          name: `${chalk.blue(msg.labels.human)} - ${msg.choices.human}`,
          value: 'human'
        },
        {
          name: `${chalk.yellow(msg.labels.both)} ${chalk.gray(`(${t().advanced})`)} - ${msg.choices.both}`,
          value: 'both'
        }
      ],
      default: 'ai'
  });

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
  console.log(chalk.gray(`  ${t().listHint}`));
  console.log();

  const workflow = await select({
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
  });

  // Show workflow details
  console.log();
  for (const line of msg.details[workflow]) {
    console.log(chalk.gray(line));
  }
  console.log();

  return workflow;
}

/**
 * Prompt for release mode
 *
 * Release modes determine how versions are published:
 * - ci-cd: Automatic publishing via CI/CD pipeline
 * - manual: Manual packaging and deployment with RC workflow
 * - hybrid: CI builds artifact, manual deployment
 *
 * @returns {Promise<string>} Selected release mode ID
 */
export async function promptReleaseMode() {
  const msg = t().releaseMode;

  console.log();
  console.log(chalk.cyan(msg.title));
  console.log(chalk.gray(`  ${msg.description}`));
  console.log();

  const mode = await select({
      message: msg.question,
      choices: [
        {
          name: `${chalk.green('CI/CD')} ${chalk.gray(`(${t().recommended})`)} - ${msg.choices['ci-cd']}`,
          value: 'ci-cd'
        },
        {
          name: `${chalk.blue('Manual')} - ${msg.choices.manual}`,
          value: 'manual'
        },
        {
          name: `${chalk.yellow('Hybrid')} - ${msg.choices.hybrid}`,
          value: 'hybrid'
        }
      ],
      default: 'ci-cd'
  });

  // Show mode details
  console.log();
  for (const line of msg.details[mode]) {
    console.log(chalk.gray(line));
  }
  console.log();

  return mode;
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
  console.log(chalk.gray(`  ${t().listHint}`));
  console.log();

  const strategy = await select({
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
  });

  // Show strategy implications
  console.log();
  for (const line of msg.details[strategy]) {
    console.log(chalk.gray(line));
  }
  console.log();

  return strategy;
}

/**
 * Prompt for output language
 *
 * The bilingual option is only shown when displayLanguage is Chinese (zh-tw or zh-cn),
 * as bilingual commits are primarily useful for Chinese-speaking teams who want both
 * English and Chinese in their commit messages.
 *
 * @param {string} displayLanguage - Display language ('en', 'zh-tw', or 'zh-cn')
 * @returns {Promise<string>} Selected language ID: 'english', 'traditional-chinese', or 'bilingual'
 */
export async function promptOutputLanguage(displayLanguage = 'en') {
  const msg = t().outputLanguage;

  console.log();
  console.log(chalk.cyan(msg.title));
  console.log(chalk.gray(`  ${msg.description}`));
  console.log(chalk.gray(`  ${t().listHint}`));
  console.log();

  // Build choices - bilingual option only for Chinese display languages
  const choices = [
    {
      name: `${chalk.green(msg.labels.english)} ${chalk.gray(`(${t().recommended})`)} - ${msg.choices.english}`,
      value: 'english'
    },
    {
      name: `${chalk.blue(msg.labels.chinese)} - ${msg.choices.chinese}`,
      value: 'traditional-chinese'
    }
  ];

  // Only show bilingual option for Chinese display languages
  // When zh-cn is selected, bilingual will use Simplified Chinese in the generated content
  if (displayLanguage === 'zh-tw' || displayLanguage === 'zh-cn') {
    choices.push({
      name: `${chalk.yellow(msg.labels.bilingual)} - ${msg.choices.bilingual}`,
      value: 'bilingual'
    });
  }

  const language = await select({
      message: msg.question,
      choices,
      default: 'english'
  });

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
  console.log(chalk.gray(`  ${t().checkboxHint}`));
  console.log();

  const levels = await checkbox({
      message: msg.question,
      instructions: false,
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
  });

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
 *
 * @param {number} level - Adoption level
 * @param {string} displayLanguage - Display language for bilingual commit option filtering
 * @returns {Promise<Object>} Selected options
 */
export async function promptStandardOptions(level, displayLanguage = 'en', opts = {}) {
  const options = {};

  // Git workflow options (level 2+)
  if (level >= 2) {
    options.workflow = await promptGitWorkflow();
    // Merge strategy: default to 'squash'; only prompt with --experimental
    if (opts.experimental) {
      options.merge_strategy = await promptMergeStrategy();
    } else {
      options.merge_strategy = 'squash';
    }
  }

  // Commit message options (level 1+)
  // Pass displayLanguage to filter bilingual option
  options.output_language = await promptOutputLanguage(displayLanguage);

  // Testing options (level 2+)
  // Default to all 4 levels; only prompt with --experimental
  if (level >= 2) {
    if (opts.experimental) {
      options.test_levels = await promptTestLevels();
    } else {
      options.test_levels = ['unit-testing', 'integration-testing', 'system-testing', 'e2e-testing'];
    }
  }

  return options;
}

/**
 * Prompt for installation mode
 * @returns {Promise<string>} 'skills' or 'full'
 */
export async function promptInstallMode() {
  const msg = t().installMode;

  console.log(chalk.gray(`  ${t().listHint}`));

  const mode = await select({
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
  });

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

  console.log(chalk.gray(`  ${t().listHint}`));

  const action = await select({
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
  });

  return action;
}

// promptLevel removed — Level system no longer exists, all standards are installed

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

  console.log(chalk.gray(`  ${t().checkboxHint}`));

  const languages = await checkbox({
      message: 'Detected language(s). Select style guides to include:',
      instructions: false,
      choices
  });

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

  console.log(chalk.gray(`  ${t().checkboxHint}`));

  const frameworks = await checkbox({
      message: 'Detected framework(s). Select patterns to include:',
      instructions: false,
      choices
  });

  return frameworks;
}

/**
 * Prompt for locale
 * @returns {Promise<string|null>} Selected locale or null
 */
export async function promptLocale() {
  const useLocale = await inquirerConfirm({
      message: 'Use Traditional Chinese (繁體中文) locale?',
      default: false
  });

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

  console.log(chalk.gray(`  ${t().checkboxHint}`));

  const integrations = await checkbox({
      message: 'Select AI tool integrations:',
      instructions: false,
      choices
  });

  return integrations;
}

/**
 * Prompt for confirmation
 * @param {string} message - Confirmation message
 * @returns {Promise<boolean>} True if confirmed
 */
export async function promptConfirm(message) {
  const confirmed = await inquirerConfirm({
      message,
      default: true
  });

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
  console.log(chalk.gray(`  ${t().listHint}`));
  console.log();

  const mode = await select({
      message: msg.question,
      choices: [
        {
          name: `${chalk.green(msg.labels.index)} ${chalk.gray(`(${t().recommended})`)} - ${msg.choices.index}`,
          value: 'index'
        },
        {
          name: `${chalk.blue(msg.labels.full)} - ${msg.choices.full}`,
          value: 'full'
        },
        {
          name: `${chalk.gray(msg.labels.minimal)} - ${msg.choices.minimal}`,
          value: 'minimal'
        }
      ],
      default: 'index'
  });

  // Detailed explanations based on selection
  console.log();
  for (const line of msg.explanations[mode]) {
    console.log(chalk.gray(line));
  }
  console.log();

  return mode;
}

/**
 * Prompt for universal AGENTS.md generation
 * Shown when user has NOT selected codex/opencode (which already generate AGENTS.md)
 *
 * @param {string[]} selectedTools - Selected AI tools
 * @returns {Promise<boolean>} True if user wants AGENTS.md generated
 */
export async function promptAgentsMd(selectedTools) {
  const hasCodex = selectedTools.includes('codex');
  const hasOpencode = selectedTools.includes('opencode');

  // Skip if codex/opencode already selected (they generate AGENTS.md)
  if (hasCodex || hasOpencode) {
    return false;
  }

  const msg = t().agentsMdPrompt || {};

  console.log();
  console.log(chalk.cyan(msg.title || 'AGENTS.md (Universal Standard)'));
  console.log(chalk.gray(`  ${msg.description || 'AGENTS.md is an open standard supported by 60K+ projects.'}`));
  console.log(chalk.gray(`  ${msg.description2 || 'Generating it allows Copilot, Jules, Codex, and other tools to read your project standards.'}`));
  console.log();

  const generate = await inquirerConfirm({
      message: msg.question || 'Generate AGENTS.md as a universal standards summary?',
      default: true
  });

  return generate;
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
  console.log(chalk.gray(`  ${t().listHint}`));
  console.log();

  const action = await select({
      message: msg.question,
      choices: [
        { name: msg.choices.add, value: 'add' },
        { name: msg.choices.remove, value: 'remove' },
        { name: msg.choices.view, value: 'view' },
        { name: chalk.gray(msg.choices.cancel), value: 'cancel' }
      ]
  });

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

    console.log(chalk.gray(`  ${t().checkboxHint}`));

    const toolsToAdd = await checkbox({
        message: msg.selectToAdd,
        instructions: false,
        choices: availableTools
    });

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

    console.log(chalk.gray(`  ${t().checkboxHint}`));

    const toolsToRemove = await checkbox({
        message: msg.selectToRemove,
        instructions: false,
        choices: installedChoices
    });

    return { action: 'remove', tools: toolsToRemove };
  }

  return { action: 'cancel', tools: [] };
}

// promptAdoptionLevel removed — Level system no longer exists

/**
 * Prompt for content mode change (used in uds configure)
 * @param {string} currentMode - Current content mode
 * @returns {Promise<string>} New content mode
 */
export async function promptContentModeChange(currentMode) {
  const msg = t().contentMode;
  const changeMsg = t().contentModeChange;

  console.log();
  console.log(chalk.cyan(msg.title));
  console.log(chalk.gray(`  ${changeMsg.currentMode} ${msg.labels[currentMode] || currentMode || msg.labels.minimal}`));
  console.log(chalk.gray(`  ${msg.description2}`));
  console.log(chalk.gray(`  ${t().listHint}`));
  console.log();

  const mode = await select({
      message: msg.question,
      choices: [
        {
          name: `${chalk.green(msg.labels.index)} ${chalk.gray(`(${t().recommended})`)} - ${msg.choices.index}`,
          value: 'index'
        },
        {
          name: `${chalk.blue(msg.labels.full)} - ${msg.choices.full}`,
          value: 'full'
        },
        {
          name: `${chalk.gray(msg.labels.minimal)} - ${msg.choices.minimal}`,
          value: 'minimal'
        }
      ],
      default: currentMode === 'full' ? 1 : currentMode === 'minimal' ? 2 : 0
  });

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
  console.log(chalk.gray(`  ${t().listHint}`));
  console.log();

  const methodology = await select({
      message: msg.question,
      choices: [
        {
          name: `${chalk.red(msg.labels.tdd)} ${chalk.gray(`- ${msg.choices.tdd}`)}`,
          value: 'tdd'
        },
        {
          name: `${chalk.green(msg.labels.bdd)} ${chalk.gray(`- ${msg.choices.bdd}`)}`,
          value: 'bdd'
        },
        {
          name: `${chalk.blue(msg.labels.sdd)} ${chalk.gray(`- ${msg.choices.sdd}`)}`,
          value: 'sdd'
        },
        {
          name: `${chalk.yellow(msg.labels.atdd)} ${chalk.gray(`- ${msg.choices.atdd}`)}`,
          value: 'atdd'
        },
        new Separator(),
        {
          name: `${chalk.gray(msg.labels.none)} - ${msg.choices.none}`,
          value: null
        }
      ],
      default: null
  });

  return methodology;
}
