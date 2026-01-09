import inquirer from 'inquirer';
import chalk from 'chalk';

/**
 * Prompt for AI tools being used
 * @param {Object} detected - Detected AI tools from project
 * @returns {Promise<string[]>} Selected AI tools
 */
export async function promptAITools(detected = {}) {
  console.log();
  console.log(chalk.cyan('AI Development Tools:'));
  console.log(chalk.gray('  Select the AI coding assistants you use with this project'));
  console.log();

  const { tools } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'tools',
      message: 'Which AI tools are you using?',
      choices: [
        new inquirer.Separator(chalk.gray('── Dynamic Skills ──')),
        {
          name: `${chalk.green('Claude Code')} ${chalk.gray('(推薦)')} - Anthropic CLI with dynamic Skills`,
          value: 'claude-code',
          checked: detected.claudeCode || false
        },
        new inquirer.Separator(chalk.gray('── Static Rule Files ──')),
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
        new inquirer.Separator(chalk.gray('── AGENTS.md Tools ──')),
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
        new inquirer.Separator(chalk.gray('── Gemini Tools ──')),
        {
          name: `Gemini CLI ${chalk.gray('(GEMINI.md)')} - Google Gemini CLI`,
          value: 'gemini-cli',
          checked: detected.geminiCli || false
        },
        new inquirer.Separator(),
        {
          name: chalk.gray('None / Skip'),
          value: 'none'
        }
      ]
    }
  ]);

  // Filter out 'none' and separators
  const filtered = tools.filter(t => t !== 'none' && typeof t === 'string');
  return filtered;
}

/**
 * Prompt for Skills installation location
 * @returns {Promise<string>} 'user', 'project', or 'none'
 */
export async function promptSkillsInstallLocation() {
  console.log();
  console.log(chalk.cyan('Skills Installation:'));
  console.log(chalk.gray('  Choose where to install Claude Code Skills'));
  console.log();

  const { location } = await inquirer.prompt([
    {
      type: 'list',
      name: 'location',
      message: 'Where should Skills be installed?',
      choices: [
        {
          name: `${chalk.green('Plugin Marketplace')} ${chalk.gray('(推薦)')} - Already installed via /plugin install`,
          value: 'marketplace'
        },
        {
          name: `${chalk.blue('User Level')} - ~/.claude/skills/ (shared across projects)`,
          value: 'user'
        },
        {
          name: `${chalk.blue('Project Level')} - .claude/skills/ (project-specific)`,
          value: 'project'
        },
        {
          name: `${chalk.gray('Skip')} - Do not install Skills`,
          value: 'none'
        }
      ],
      default: 'marketplace'
    }
  ]);

  // Show explanation
  console.log();
  if (location === 'marketplace') {
    console.log(chalk.gray('  → Skills managed by Claude Code Plugin system'));
    console.log(chalk.gray('  → Automatic updates when new versions are released'));
    console.log(chalk.gray('  → If not installed yet, run:'));
    console.log(chalk.gray('      /plugin marketplace add AsiaOstrich/universal-dev-standards'));
    console.log(chalk.gray('      /plugin install universal-dev-standards@asia-ostrich'));
  } else if (location === 'user') {
    console.log(chalk.gray('  → Skills will be installed to ~/.claude/skills/'));
    console.log(chalk.gray('  → Available across all your projects'));
  } else if (location === 'project') {
    console.log(chalk.gray('  → Skills will be installed to .claude/skills/'));
    console.log(chalk.gray('  → Only available in this project'));
    console.log(chalk.gray('  → Consider adding .claude/skills/ to .gitignore'));
  } else {
    console.log(chalk.gray('  → No Skills will be installed'));
    console.log(chalk.gray('  → Full standards will be copied to .standards/'));
  }
  console.log();

  return location;
}

/**
 * Prompt for Skills update (dual-level check)
 * @param {Object|null} projectInfo - Project-level Skills info
 * @param {Object|null} userInfo - User-level Skills info
 * @param {string} latestVersion - Latest available version
 * @returns {Promise<Object>} Update decision { action: 'both'|'project'|'user'|'none', targets: string[] }
 */
export async function promptSkillsUpdate(projectInfo, userInfo, latestVersion) {
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
    console.log(chalk.green('✓ All Skills installations are up to date'));
    return { action: 'none', targets: [] };
  }

  // Build choices based on what needs updating
  console.log();
  console.log(chalk.cyan('Skills Update Available:'));

  if (projectInfo?.installed) {
    const pVer = projectInfo.version || 'unknown';
    const pStatus = pVer === latestVersion
      ? chalk.green('✓ up to date')
      : chalk.yellow(`v${pVer} → v${latestVersion}`);
    console.log(chalk.gray(`  Project level (.claude/skills/): ${pStatus}`));
  }

  if (userInfo?.installed) {
    const uVer = userInfo.version || 'unknown';
    const uStatus = uVer === latestVersion
      ? chalk.green('✓ up to date')
      : chalk.yellow(`v${uVer} → v${latestVersion}`);
    console.log(chalk.gray(`  User level (~/.claude/skills/): ${uStatus}`));
  }
  console.log();

  // Build update choices
  if (needsUpdate.includes('project') && needsUpdate.includes('user')) {
    choices.push({
      name: `${chalk.green('Update Both')} - Update all Skills installations`,
      value: 'both'
    });
  }

  if (needsUpdate.includes('project')) {
    choices.push({
      name: `${chalk.blue('Update Project Level')} - Only update .claude/skills/`,
      value: 'project'
    });
  }

  if (needsUpdate.includes('user')) {
    choices.push({
      name: `${chalk.blue('Update User Level')} - Only update ~/.claude/skills/`,
      value: 'user'
    });
  }

  choices.push({
    name: `${chalk.gray('Skip')} - Keep current versions`,
    value: 'none'
  });

  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
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
 * @param {boolean} hasSkills - Whether Skills are installed
 * @returns {Promise<string>} 'full' or 'minimal'
 */
export async function promptStandardsScope(hasSkills) {
  if (!hasSkills) {
    return 'full';
  }

  console.log();
  console.log(chalk.cyan('Standards Scope:'));
  console.log(chalk.gray('  Skills cover some standards dynamically. Choose what to install:'));
  console.log();

  const { scope } = await inquirer.prompt([
    {
      type: 'list',
      name: 'scope',
      message: 'Select standards installation scope:',
      choices: [
        {
          name: `${chalk.green('Minimal')} ${chalk.gray('(推薦)')} - Only static standards (Skills cover the rest)`,
          value: 'minimal'
        },
        {
          name: `${chalk.blue('Full')} - Install all standards (includes Skills-covered)`,
          value: 'full'
        }
      ],
      default: 'minimal'
    }
  ]);

  // Show explanation
  console.log();
  if (scope === 'minimal') {
    console.log(chalk.gray('  → Only reference standards will be copied'));
    console.log(chalk.gray('  → Skills provide dynamic guidance for covered standards'));
  } else {
    console.log(chalk.gray('  → All standards will be copied to .standards/'));
    console.log(chalk.gray('  → Includes both static files and Skills-covered content'));
  }
  console.log();

  return scope;
}

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

/**
 * Prompt for integration file content mode
 * @returns {Promise<string>} 'full', 'index', or 'minimal'
 */
export async function promptContentMode() {
  console.log();
  console.log(chalk.cyan('Integration File Content Mode:'));
  console.log(chalk.gray('  Choose how much standards content to embed in AI tool integration files'));
  console.log();

  const { mode } = await inquirer.prompt([
    {
      type: 'list',
      name: 'mode',
      message: 'Select content mode for integration files:',
      choices: [
        {
          name: `${chalk.green('Index')} ${chalk.gray('(推薦)')} - Standards index + compliance instructions`,
          value: 'index'
        },
        {
          name: `${chalk.blue('Full')} - Embed all standards content (largest files, guaranteed visibility)`,
          value: 'full'
        },
        {
          name: `${chalk.gray('Minimal')} - Only core rules (current behavior, smallest files)`,
          value: 'minimal'
        }
      ],
      default: 'index'
    }
  ]);

  // Show explanation
  console.log();
  if (mode === 'index') {
    console.log(chalk.gray('  → Includes standards index with links and compliance instructions'));
    console.log(chalk.gray('  → AI will read relevant .standards/ files when needed'));
    console.log(chalk.gray('  → Best balance of file size and standards visibility'));
  } else if (mode === 'full') {
    console.log(chalk.gray('  → All standards content embedded in integration files'));
    console.log(chalk.gray('  → AI guaranteed to see all standards without reading files'));
    console.log(chalk.gray('  → Results in larger integration files'));
  } else {
    console.log(chalk.gray('  → Only anti-hallucination, commit-standards, code-review embedded'));
    console.log(chalk.gray('  → Smallest files, but AI may miss other standards'));
    console.log(chalk.gray('  → Legacy mode for backward compatibility'));
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
  console.log();
  console.log(chalk.cyan('AI Tools Management:'));
  console.log(chalk.gray(`  Currently installed: ${currentTools.length > 0 ? currentTools.join(', ') : 'none'}`));
  console.log();

  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        { name: 'Add new AI tools', value: 'add' },
        { name: 'Remove existing AI tools', value: 'remove' },
        { name: 'View current AI tools', value: 'view' },
        { name: chalk.gray('Cancel'), value: 'cancel' }
      ]
    }
  ]);

  if (action === 'view') {
    console.log();
    console.log(chalk.cyan('Installed AI Tools:'));
    if (currentTools.length === 0) {
      console.log(chalk.gray('  No AI tools installed'));
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
      console.log(chalk.yellow('  All AI tools are already installed!'));
      return { action: 'cancel', tools: [] };
    }

    const { toolsToAdd } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'toolsToAdd',
        message: 'Select AI tools to add:',
        choices: availableTools
      }
    ]);

    return { action: 'add', tools: toolsToAdd };
  }

  if (action === 'remove') {
    if (currentTools.length === 0) {
      console.log(chalk.yellow('  No AI tools to remove!'));
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
        message: 'Select AI tools to remove:',
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
  console.log();
  console.log(chalk.cyan('Adoption Level:'));
  console.log(chalk.gray(`  Current level: ${currentLevel}`));
  console.log();

  const { level } = await inquirer.prompt([
    {
      type: 'list',
      name: 'level',
      message: 'Select new adoption level:',
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
      default: currentLevel - 1  // 0-indexed
    }
  ]);

  if (level !== currentLevel) {
    console.log();
    if (level > currentLevel) {
      console.log(chalk.yellow('⚠ Upgrading level will add new standard files'));
    } else {
      console.log(chalk.yellow('⚠ Downgrading level will NOT remove existing files'));
      console.log(chalk.gray('  You may manually remove files from .standards/ if needed'));
    }
  }

  return level;
}

/**
 * Prompt for content mode change
 * @param {string} currentMode - Current content mode
 * @returns {Promise<string>} New content mode
 */
export async function promptContentModeChange(currentMode) {
  console.log();
  console.log(chalk.cyan('Content Mode:'));
  console.log(chalk.gray(`  Current mode: ${currentMode || 'minimal'}`));
  console.log();

  const { mode } = await inquirer.prompt([
    {
      type: 'list',
      name: 'mode',
      message: 'Select content mode for integration files:',
      choices: [
        {
          name: `${chalk.green('Index')} ${chalk.gray('(推薦)')} - Standards index + compliance instructions`,
          value: 'index'
        },
        {
          name: `${chalk.blue('Full')} - Embed all standards content (largest files)`,
          value: 'full'
        },
        {
          name: `${chalk.gray('Minimal')} - Only core rules (smallest files)`,
          value: 'minimal'
        }
      ],
      default: currentMode === 'full' ? 1 : currentMode === 'minimal' ? 2 : 0
    }
  ]);

  if (mode !== currentMode) {
    console.log();
    console.log(chalk.yellow('⚠ Changing content mode will regenerate all integration files'));
  }

  return mode;
}
