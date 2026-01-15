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
 * @param {string[]} selectedTools - Selected AI tools (for displaying compatibility info)
 * @returns {Promise<string>} 'user', 'project', or 'none'
 */
export async function promptSkillsInstallLocation(selectedTools = []) {
  const hasClaudeCode = selectedTools.includes('claude-code');
  const hasOpenCode = selectedTools.includes('opencode');

  // Build compatible tools list
  const compatibleTools = [];
  if (hasClaudeCode) compatibleTools.push('Claude Code');
  if (hasOpenCode) compatibleTools.push('OpenCode');

  console.log();
  console.log(chalk.cyan('Skills Installation:'));
  if (compatibleTools.length > 1) {
    console.log(chalk.gray(`  Skills will work with: ${compatibleTools.join(' and ')}`));
  } else if (compatibleTools.length === 1) {
    console.log(chalk.gray(`  Choose where to install ${compatibleTools[0]} Skills`));
  } else {
    console.log(chalk.gray('  Choose where to install Skills'));
  }
  console.log();

  const { location } = await inquirer.prompt([
    {
      type: 'list',
      name: 'location',
      message: 'Where should Skills be installed?',
      choices: [
        {
          name: `${chalk.green('Plugin Marketplace')} ${chalk.gray('(推薦)')} - Auto-managed by Claude Code`,
          value: 'marketplace'
        },
        {
          name: `${chalk.blue('User Level')} ${chalk.gray('(~/.claude/skills/)')} - Shared across all projects`,
          value: 'user'
        },
        {
          name: `${chalk.blue('Project Level')} ${chalk.gray('(.claude/skills/)')} - This project only`,
          value: 'project'
        },
        {
          name: `${chalk.gray('Skip')} - No Skills installation`,
          value: 'none'
        }
      ],
      default: 'marketplace'
    }
  ]);

  // Simplified single-line explanations
  console.log();
  const explanations = {
    marketplace: '  → Run: /plugin install universal-dev-standards@asia-ostrich',
    user: '  → Skills available in all your projects',
    project: '  → Consider adding .claude/skills/ to .gitignore',
    none: '  → Full standards will be copied to .standards/'
  };
  console.log(chalk.gray(explanations[location]));
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

  console.log();
  console.log(chalk.cyan('Standards Installation:'));
  console.log(chalk.gray('  選擇要安裝多少標準檔案到專案中'));
  console.log(chalk.gray('  （已安裝 Skills，可選擇精簡安裝）'));
  console.log();

  const { scope } = await inquirer.prompt([
    {
      type: 'list',
      name: 'scope',
      message: '選擇安裝範圍 / Select installation scope:',
      choices: [
        {
          name: `${chalk.green('Lean')} ${chalk.gray('(推薦)')} - 只裝參考文件，Skills 即時提供任務導向指引`,
          value: 'minimal'
        },
        {
          name: `${chalk.blue('Complete')} - 安裝全部標準檔案，不依賴 Skills`,
          value: 'full'
        }
      ],
      default: 'minimal'
    }
  ]);

  // Show scope implications
  console.log();
  if (scope === 'minimal') {
    console.log(chalk.gray('  → .standards/ 只包含參考文件（約 6 個檔案）'));
    console.log(chalk.gray('  → Skills 會在你執行任務時提供即時指引'));
  } else {
    console.log(chalk.gray('  → .standards/ 包含全部標準（約 16 個檔案）'));
    console.log(chalk.gray('  → 即使 Skills 不可用也能查閱完整規範'));
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
  console.log();
  console.log(chalk.cyan('Standards Format:'));
  console.log(chalk.gray('  選擇標準檔案的格式，影響 AI 讀取效率和人類可讀性'));
  console.log();

  const { format } = await inquirer.prompt([
    {
      type: 'list',
      name: 'format',
      message: '選擇標準格式 / Select standards format:',
      choices: [
        {
          name: `${chalk.green('Compact')} ${chalk.gray('(推薦)')} - YAML 格式，token 少，AI 解析快`,
          value: 'ai'
        },
        {
          name: `${chalk.blue('Detailed')} - 完整 Markdown，含範例說明，適合團隊學習`,
          value: 'human'
        },
        {
          name: `${chalk.yellow('Both')} ${chalk.gray('(進階)')} - 兩種都裝，AI 用 YAML，人用 Markdown`,
          value: 'both'
        }
      ],
      default: 'ai'
    }
  ]);

  // Show format implications
  console.log();
  const formatDetails = {
    ai: '  → 檔案較小（約 50% token），AI 處理效率高',
    human: '  → 包含完整範例和說明，適合新成員學習規範',
    both: '  → 檔案數量加倍，但兼顧 AI 效率和人類可讀性'
  };
  console.log(chalk.gray(formatDetails[format]));
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
  console.log();
  console.log(chalk.cyan('Git Workflow:'));
  console.log(chalk.gray('  選擇分支策略，影響團隊協作和發布流程'));
  console.log();

  const { workflow } = await inquirer.prompt([
    {
      type: 'list',
      name: 'workflow',
      message: '選擇 Git 分支策略 / Select Git branching strategy:',
      choices: [
        {
          name: `${chalk.green('GitHub Flow')} ${chalk.gray('(推薦)')} - 簡單 PR 流程，適合持續部署`,
          value: 'github-flow'
        },
        {
          name: `${chalk.blue('GitFlow')} - develop/release 分支，適合定期發布`,
          value: 'gitflow'
        },
        {
          name: `${chalk.yellow('Trunk-Based')} - 直接提交 main + feature flags，適合成熟 CI/CD`,
          value: 'trunk-based'
        }
      ],
      default: 'github-flow'
    }
  ]);

  // Show workflow details
  console.log();
  const workflowDetails = {
    'github-flow': [
      '  → main + feature branches，透過 PR 合併',
      '  → 適合：小團隊、持續部署、Web 應用'
    ],
    gitflow: [
      '  → main + develop + feature/release/hotfix branches',
      '  → 適合：大型專案、排程發布、需要多版本維護'
    ],
    'trunk-based': [
      '  → 主要在 main 開發，用 feature flags 控制功能',
      '  → 適合：成熟 CI/CD、高頻部署、資深團隊'
    ]
  };
  for (const line of workflowDetails[workflow]) {
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
  console.log();
  console.log(chalk.cyan('Merge Strategy:'));
  console.log(chalk.gray('  選擇合併策略，影響 Git 歷史紀錄的呈現方式'));
  console.log();

  const { strategy } = await inquirer.prompt([
    {
      type: 'list',
      name: 'strategy',
      message: '選擇合併策略 / Select merge strategy:',
      choices: [
        {
          name: `${chalk.green('Squash Merge')} ${chalk.gray('(推薦)')} - 每個 PR 一個 commit，歷史乾淨`,
          value: 'squash'
        },
        {
          name: `${chalk.blue('Merge Commit')} - 保留完整分支歷史，建立合併 commit`,
          value: 'merge-commit'
        },
        {
          name: `${chalk.yellow('Rebase + Fast-Forward')} - 線性歷史，需要 rebase，進階`,
          value: 'rebase-ff'
        }
      ],
      default: 'squash'
    }
  ]);

  // Show strategy implications
  console.log();
  const strategyDetails = {
    squash: [
      '  ✓ 歷史乾淨，容易回滾',
      '  ✗ 遺失分支中的個別 commit 細節'
    ],
    'merge-commit': [
      '  ✓ 保留完整開發歷史，可追溯',
      '  ✗ 歷史較複雜，有合併分岔'
    ],
    'rebase-ff': [
      '  ✓ 完全線性歷史，最乾淨',
      '  ✗ 需要團隊熟悉 rebase 操作'
    ]
  };
  for (const line of strategyDetails[strategy]) {
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
  console.log();
  console.log(chalk.cyan('Commit Message Language:'));
  console.log(chalk.gray('  What language for commit messages?'));
  console.log();

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
  console.log();
  console.log(chalk.cyan('Test Coverage:'));
  console.log(chalk.gray('  選擇要包含的測試層級（測試金字塔）'));
  console.log(chalk.gray('  百分比為建議的覆蓋率比例'));
  console.log();

  const { levels } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'levels',
      message: '選擇測試層級 / Select test levels:',
      choices: [
        {
          name: `Unit Testing ${chalk.gray('(70%)')} - 測試個別函式，快速回饋`,
          value: 'unit-testing',
          checked: true
        },
        {
          name: `Integration Testing ${chalk.gray('(20%)')} - 測試元件互動、API 呼叫`,
          value: 'integration-testing',
          checked: true
        },
        {
          name: `System Testing ${chalk.gray('(7%)')} - 測試完整系統行為`,
          value: 'system-testing',
          checked: false
        },
        {
          name: `E2E Testing ${chalk.gray('(3%)')} - 測試使用者流程（透過 UI）`,
          value: 'e2e-testing',
          checked: false
        }
      ]
    }
  ]);

  // Show test pyramid visualization
  if (levels.length > 0) {
    console.log();
    console.log(chalk.gray('  測試金字塔 (Test Pyramid):'));
    console.log(chalk.gray('        /\\         ← E2E (少量，慢)'));
    console.log(chalk.gray('       /  \\        ← System'));
    console.log(chalk.gray('      /────\\       ← Integration'));
    console.log(chalk.gray('     /──────\\      ← Unit (大量，快)'));
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
 *
 * Adoption levels determine how many standards are installed:
 * - Level 1 (Starter): 6 core standards - commit, anti-hallucination, checkin, etc.
 * - Level 2 (Professional): 12 standards - adds testing, git workflow, error handling
 * - Level 3 (Complete): All 16 standards - includes versioning, logging, SDD
 *
 * @returns {Promise<number>} Selected level
 */
export async function promptLevel() {
  console.log();
  console.log(chalk.cyan('Adoption Level:'));
  console.log(chalk.gray('  選擇要採用的標準數量，等級越高涵蓋越完整'));
  console.log();

  const { level } = await inquirer.prompt([
    {
      type: 'list',
      name: 'level',
      message: '選擇採用等級 / Select adoption level:',
      choices: [
        {
          name: `${chalk.blue('Level 1: Starter')} ${chalk.gray('(基本)')} - 提交規範、反幻覺、簽入檢查等 6 項核心`,
          value: 1
        },
        {
          name: `${chalk.green('Level 2: Professional')} ${chalk.gray('(推薦)')} - 加入測試、Git 流程、錯誤處理共 12 項`,
          value: 2
        },
        {
          name: `${chalk.yellow('Level 3: Complete')} ${chalk.gray('(完整)')} - 含版本控制、日誌、SDD 全部 16 項`,
          value: 3
        }
      ],
      default: 2
    }
  ]);

  // Show what's included in selected level
  console.log();
  const levelDetails = {
    1: [
      '  包含：commit-message, anti-hallucination, checkin-standards,',
      '        code-review-checklist, changelog, versioning'
    ],
    2: [
      '  包含 Level 1 全部，加上：',
      '        testing, git-workflow, error-code, logging, documentation, naming'
    ],
    3: [
      '  包含 Level 1+2 全部，加上：',
      '        spec-driven-development, test-completeness, api-design, security'
    ]
  };
  for (const line of levelDetails[level]) {
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
  console.log();
  console.log(chalk.cyan('Content Mode:'));
  console.log(chalk.gray('  控制 AI 工具設定檔中嵌入多少規範內容'));
  console.log(chalk.gray('  這會影響 AI Agent 的執行行為和合規程度'));
  console.log();

  const { mode } = await inquirer.prompt([
    {
      type: 'list',
      name: 'mode',
      message: '選擇內容模式 / Select content mode:',
      choices: [
        {
          name: `${chalk.green('Standard')} ${chalk.gray('(推薦)')} - 摘要 + 任務對照表，AI 知道何時讀哪個規範`,
          value: 'index'
        },
        {
          name: `${chalk.blue('Full Embed')} - 完整嵌入所有規則，AI 立即可用但檔案較大`,
          value: 'full'
        },
        {
          name: `${chalk.gray('Minimal')} - 僅檔案參考，適合搭配 Skills 使用`,
          value: 'minimal'
        }
      ],
      default: 'index'
    }
  ]);

  // Detailed explanations based on selection
  console.log();
  const explanations = {
    index: [
      '  → 包含規則摘要 + MUST/SHOULD 任務對照表',
      '  → AI 能判斷「做什麼任務時要讀哪個規範」',
      '  → 平衡 Context 使用量和合規程度'
    ],
    full: [
      '  → 所有規則直接嵌入設定檔（檔案約 10-15 KB）',
      '  → AI 無需額外讀檔，合規率最高',
      '  → 適合短期任務或需要嚴格遵循的專案'
    ],
    minimal: [
      '  → 僅包含 .standards/ 檔案清單',
      '  → AI 需要主動讀取規範檔案',
      '  → 適合搭配 Skills（Skills 會提供即時指引）'
    ]
  };

  for (const line of explanations[mode]) {
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
          name: `${chalk.blue('Level 1: Starter')} ${chalk.gray('(基本)')} - 6 core standards`,
          value: 1
        },
        {
          name: `${chalk.green('Level 2: Professional')} ${chalk.gray('(推薦)')} - 12 standards`,
          value: 2
        },
        {
          name: `${chalk.yellow('Level 3: Complete')} ${chalk.gray('(完整)')} - All 16 standards`,
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
 * Prompt for content mode change (used in uds configure)
 * @param {string} currentMode - Current content mode
 * @returns {Promise<string>} New content mode
 */
export async function promptContentModeChange(currentMode) {
  const modeLabels = {
    index: 'Standard（摘要 + 任務對照表）',
    full: 'Full Embed（完整嵌入）',
    minimal: 'Minimal（僅檔案參考）'
  };

  console.log();
  console.log(chalk.cyan('Content Mode:'));
  console.log(chalk.gray(`  目前模式: ${modeLabels[currentMode] || currentMode || 'minimal'}`));
  console.log(chalk.gray('  這會影響 AI Agent 的執行行為和合規程度'));
  console.log();

  const { mode } = await inquirer.prompt([
    {
      type: 'list',
      name: 'mode',
      message: '選擇內容模式 / Select content mode:',
      choices: [
        {
          name: `${chalk.green('Standard')} ${chalk.gray('(推薦)')} - 摘要 + 任務對照表，AI 知道何時讀哪個規範`,
          value: 'index'
        },
        {
          name: `${chalk.blue('Full Embed')} - 完整嵌入所有規則，AI 立即可用但檔案較大`,
          value: 'full'
        },
        {
          name: `${chalk.gray('Minimal')} - 僅檔案參考，適合搭配 Skills 使用`,
          value: 'minimal'
        }
      ],
      default: currentMode === 'full' ? 1 : currentMode === 'minimal' ? 2 : 0
    }
  ]);

  if (mode !== currentMode) {
    console.log();
    console.log(chalk.yellow('⚠ 變更 Content Mode 將重新生成所有 AI 工具設定檔'));

    // Show what the new mode does
    const explanations = {
      index: '  → AI 會根據任務對照表判斷何時讀取規範',
      full: '  → 所有規則直接嵌入，AI 合規率最高',
      minimal: '  → AI 需主動讀取規範，建議搭配 Skills'
    };
    console.log(chalk.gray(explanations[mode]));
  }

  return mode;
}

/**
 * Prompt for development methodology selection
 * @returns {Promise<string|null>} Selected methodology ID or null
 */
export async function promptMethodology() {
  console.log();
  console.log(chalk.cyan('Development Methodology:'));
  console.log(chalk.yellow('  ⚠️  [Experimental] This feature will be redesigned in v4.0'));
  console.log(chalk.gray('  Select a methodology to guide your development workflow.'));
  console.log();

  const { methodology } = await inquirer.prompt([
    {
      type: 'list',
      name: 'methodology',
      message: 'Which development methodology do you want to use?',
      choices: [
        {
          name: `${chalk.red('TDD')} ${chalk.gray('- Test-Driven Development (Red → Green → Refactor)')}`,
          value: 'tdd'
        },
        {
          name: `${chalk.green('BDD')} ${chalk.gray('- Behavior-Driven Development (Given-When-Then)')}`,
          value: 'bdd'
        },
        {
          name: `${chalk.blue('SDD')} ${chalk.gray('- Spec-Driven Development (Spec First, Code Second)')}`,
          value: 'sdd'
        },
        {
          name: `${chalk.yellow('ATDD')} ${chalk.gray('- Acceptance Test-Driven Development')}`,
          value: 'atdd'
        },
        new inquirer.Separator(),
        {
          name: `${chalk.gray('None')} - No specific methodology`,
          value: null
        }
      ],
      default: null
    }
  ]);

  return methodology;
}
