#!/usr/bin/env node

import { createRequire } from 'node:module';
import { program } from 'commander';
import { listCommand } from '../src/commands/list.js';
import { initCommand } from '../src/commands/init.js';
import { checkCommand } from '../src/commands/check.js';
import { updateCommand } from '../src/commands/update.js';
import { configureCommand } from '../src/commands/configure.js';
import { skillsCommand } from '../src/commands/skills.js';
import { agentListCommand, agentInstallCommand, agentInfoCommand } from '../src/commands/agent.js';
import { workflowListCommand, workflowInstallCommand, workflowInfoCommand } from '../src/commands/workflow.js';
import { aiContextInitCommand, aiContextValidateCommand, aiContextGraphCommand } from '../src/commands/ai-context.js';
import { setLanguage, setLanguageExplicit, detectLanguage } from '../src/i18n/messages.js';

const require = createRequire(import.meta.url);
const pkg = require('../package.json');

program
  .name('uds')
  .description('CLI tool for adopting Universal Development Standards')
  .version(pkg.version)
  .option('--ui-lang <lang>', 'UI language (en, zh-tw, auto) [default: auto]')
  .hook('preAction', (thisCommand) => {
    const opts = thisCommand.opts();
    const uiLang = opts.uiLang || 'auto';
    if (uiLang === 'auto') {
      // Auto-detect: can be overridden by manifest settings later
      setLanguage(detectLanguage(null));
    } else {
      // Explicit setting: mark as explicitly set to prevent override
      setLanguageExplicit(uiLang);
    }
  });

program
  .command('list')
  .description('List available standards')
  .option('-l, --level <level>', 'Filter by adoption level (1, 2, or 3)')
  .option('-c, --category <category>', 'Filter by category (skill, reference, extension, integration, template)')
  .action(listCommand);

program
  .command('init')
  .description('Initialize standards in current project')
  .option('-m, --mode <mode>', 'Installation mode (skills, full)')
  .option('-l, --level <level>', 'Adoption level (1=Essential, 2=Recommended, 3=Enterprise)')
  .option('-f, --format <format>', 'Standards format (ai, human, both)')
  .option('--workflow <workflow>', 'Git workflow (github-flow, gitflow, trunk-based)')
  .option('--merge-strategy <strategy>', 'Merge strategy (squash, merge-commit, rebase-ff)')
  .option('--commit-lang <lang>', 'Commit message language (english, traditional-chinese, bilingual)')
  .option('--test-levels <levels>', 'Test levels, comma-separated (unit-testing,integration-testing,...)')
  .option('--lang <language>', 'Language extension (csharp, php)')
  .option('--framework <framework>', 'Framework extension (fat-free)')
  .option('--locale <locale>', 'Locale extension (zh-tw)')
  .option('--skills-location <location>', 'Skills location (marketplace, user, project, none) [default: marketplace]')
  .option('--content-mode <mode>', 'Content mode for integration files (minimal, index, full) [default: index]')
  .option('-y, --yes', 'Use defaults, skip interactive prompts')
  .option('-E, --experimental', 'Enable experimental features (methodology)')
  .action(initCommand);

program
  .command('configure')
  .alias('config')
  .description('Modify options for initialized project')
  .option('-t, --type <type>', 'Option type to configure (format, workflow, merge_strategy, commit_language, test_levels, skills, commands, all)')
  .option('--ai-tool <tool>', 'Specific AI tool to configure (claude-code, opencode, copilot, etc.) - enables non-interactive mode')
  .option('--skills-location <location>', 'Skills installation location (project, user) for non-interactive mode')
  .option('-y, --yes', 'Apply changes immediately without prompting')
  .option('-E, --experimental', 'Enable experimental features (methodology)')
  .action(configureCommand);

program
  .command('check')
  .description('Check adoption status of current project')
  .option('--summary', 'Show compact status summary (for use by other commands)')
  .option('--diff', 'Show diff for modified files')
  .option('--restore', 'Restore all modified and missing files')
  .option('--restore-missing', 'Restore only missing files')
  .option('--no-interactive', 'Disable interactive mode')
  .option('--migrate', 'Migrate legacy manifest to hash-based tracking')
  .option('--offline', 'Skip npm registry check for CLI updates')
  .action(checkCommand);

program
  .command('update')
  .description('Update standards to latest version')
  .option('-y, --yes', 'Skip confirmation prompts')
  .option('--sync-refs', 'Sync integration file references with manifest standards')
  .option('--integrations-only', 'Only regenerate integration files (CLAUDE.md, etc.)')
  .option('--standards-only', 'Only update standards, skip integration files')
  .option('--offline', 'Skip npm registry check for CLI updates')
  .option('--beta', 'Check for beta version updates')
  .option('--skills', 'Install/update Skills for configured AI tools')
  .option('--commands', 'Install/update slash commands for configured AI tools')
  .option('--debug', 'Show debug output for Skills/Commands detection')
  .action(updateCommand);

program
  .command('skills')
  .description('List installed Claude Code skills')
  .action(skillsCommand);

// Agent command with subcommands
const agentCommand = program
  .command('agent')
  .description('Manage UDS agents for AI tools');

agentCommand
  .command('list')
  .description('List available and installed agents')
  .option('--installed', 'Show installation status for all AI tools')
  .action(agentListCommand);

agentCommand
  .command('install [agent-name]')
  .description('Install agents (specify name or "all" for all agents)')
  .option('-t, --tool <tool>', 'Target AI tool (default: claude-code)')
  .option('-g, --global', 'Install to user level instead of project level')
  .option('-y, --yes', 'Skip confirmation prompts')
  .action(agentInstallCommand);

agentCommand
  .command('info <agent-name>')
  .description('Show detailed information about an agent')
  .action(agentInfoCommand);

// Workflow command with subcommands
const workflowCommand = program
  .command('workflow')
  .description('Manage UDS workflows for AI tools');

workflowCommand
  .command('list')
  .description('List available and installed workflows')
  .option('--installed', 'Show installation status for all AI tools')
  .action(workflowListCommand);

workflowCommand
  .command('install [workflow-name]')
  .description('Install workflows (specify name or "all" for all workflows)')
  .option('-t, --tool <tool>', 'Target AI tool (default: claude-code)')
  .option('-g, --global', 'Install to user level instead of project level')
  .option('-y, --yes', 'Skip confirmation prompts')
  .action(workflowInstallCommand);

workflowCommand
  .command('info <workflow-name>')
  .description('Show detailed information about a workflow')
  .action(workflowInfoCommand);

// AI Context command with subcommands
const aiContextCommand = program
  .command('ai-context')
  .description('Manage .ai-context.yaml configuration for AI-friendly architecture');

aiContextCommand
  .command('init')
  .description('Generate .ai-context.yaml configuration file')
  .option('-f, --force', 'Overwrite existing configuration')
  .option('-y, --yes', 'Use defaults, skip interactive prompts')
  .action(aiContextInitCommand);

aiContextCommand
  .command('validate')
  .description('Validate .ai-context.yaml configuration')
  .option('-v, --verbose', 'Show full configuration')
  .action(aiContextValidateCommand);

aiContextCommand
  .command('graph')
  .description('Show module dependency graph')
  .option('-m, --mermaid', 'Output Mermaid diagram format')
  .action(aiContextGraphCommand);

program.parse();
