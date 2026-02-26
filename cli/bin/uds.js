#!/usr/bin/env node

import { createRequire } from 'node:module';
import { program } from 'commander';
import { listCommand } from '../src/commands/list.js';
import { initCommand } from '../src/commands/init.js';
import { checkCommand } from '../src/commands/check.js';
import { simulateCommand } from '../src/commands/simulate.js';
import { fixCommand } from '../src/commands/fix.js';
import { updateCommand } from '../src/commands/update.js';
import { configureCommand } from '../src/commands/configure.js';
import { configCommand } from '../src/commands/config.js';
import { hitlCommand } from '../src/commands/hitl.js';
import { skillsCommand } from '../src/commands/skills.js';
import { agentListCommand, agentInstallCommand, agentInfoCommand } from '../src/commands/agent.js';
import { workflowListCommand, workflowInstallCommand, workflowInfoCommand, workflowExecuteCommand, workflowStatusCommand } from '../src/commands/workflow.js';
import { aiContextInitCommand, aiContextValidateCommand, aiContextGraphCommand } from '../src/commands/ai-context.js';
import { sweepCommand } from '../src/commands/sweep.js';
import { uninstallCommand } from '../src/commands/uninstall.js';
import { specCreateCommand, specListCommand, specShowCommand, specConfirmCommand, specArchiveCommand, specDeleteCommand } from '../src/commands/spec.js';
import { startCommand, missionStatusCommand, missionPauseCommand, missionResumeCommand, missionCancelCommand, missionListCommand } from '../src/commands/start.js';
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
  .command('config [action] [key] [value]')
  .description('Manage UDS configuration and project settings')
  .option('-g, --global', 'Use global configuration')
  .option('--vibe-mode', 'Initialize vibe coding mode (use with init action)')
  .option('-y, --yes', 'Skip confirmation prompts')
  .option('-t, --type <type>', 'Option type to configure (format, workflow, merge_strategy, commit_language, test_levels, skills, commands, all)')
  .option('--ai-tool <tool>', 'Specific AI tool to configure (claude-code, opencode, copilot, etc.)')
  .option('--skills-location <location>', 'Skills installation location (project, user)')
  .option('-E, --experimental', 'Enable experimental features (methodology)')
  .action(configCommand);

program
  .command('hitl')
  .description('Human-in-the-Loop controls')
  .command('check')
  .description('Check if an operation is allowed')
  .option('--op <operation>', 'Operation description')
  .action(hitlCommand);

program
  .command('configure')
  .description('Alias for "uds config" — Modify project settings')
  .option('-t, --type <type>', 'Option type to configure (format, workflow, merge_strategy, commit_language, test_levels, skills, commands, all)')
  .option('--ai-tool <tool>', 'Specific AI tool to configure (claude-code, opencode, copilot, etc.)')
  .option('--skills-location <location>', 'Skills installation location (project, user)')
  .option('-y, --yes', 'Apply changes immediately without prompting')
  .option('-E, --experimental', 'Enable experimental features (methodology)')
  .action(configureCommand);

program
  .command('check')
  .description('Check adoption status of current project')
  .option('-s, --standard <id>', 'Validate against a specific standard physical spec')
  .option('--json', 'Output result in JSON format')
  .option('--summary', 'Show compact status summary (for use by other commands)')
  .option('--diff', 'Show diff for modified files')
  .option('--restore', 'Restore all modified and missing files')
  .option('--restore-missing', 'Restore only missing files')
  .option('--no-interactive', 'Disable interactive mode')
  .option('--migrate', 'Migrate legacy manifest to hash-based tracking')
  .option('--offline', 'Skip npm registry check for CLI updates')
  .action(checkCommand);

program
  .command('simulate')
  .description('Simulate a standard check with input (Predictive Validation)')
  .option('-s, --standard <id>', 'Standard to simulate against')
  .option('-i, --input <string>', 'Input string to test')
  .option('--json', 'Output result in JSON format')
  .action(simulateCommand);

program
  .command('fix')
  .description('Auto-fix standard violations (Self-Healing)')
  .option('-s, --standard <id>', 'Standard to fix')
  .option('--json', 'Output result in JSON format')
  .action(fixCommand);

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

program
  .command('sweep')
  .description('Auto-cleanup code after vibe coding sessions')
  .option('--fix', 'Apply fixes instead of dry-run preview')
  .option('--report', 'Save report to .uds/reports/')
  .option('-v, --verbose', 'Show detailed output')
  .action(sweepCommand);

program
  .command('uninstall')
  .description('Remove UDS standards, integrations, skills, and hooks')
  .option('--all', 'Remove everything including user-level installations')
  .option('--standards-only', 'Remove only .standards/ directory')
  .option('--skills-only', 'Remove only skills and commands')
  .option('--integrations-only', 'Remove only UDS blocks from integration files')
  .option('--dry-run', 'Preview mode, no files modified')
  .option('-y, --yes', 'Skip confirmation prompts')
  .action(uninstallCommand);

// Spec command with subcommands (Vibe Coding)
const specCommand = program
  .command('spec')
  .description('Manage micro-specs for vibe coding');

specCommand
  .command('create <intent>')
  .alias('new')
  .description('Create a micro-spec from natural language intent')
  .option('-s, --scope <scope>', 'Scope (frontend, backend, fullstack)')
  .option('-o, --output <path>', 'Output directory (default: specs/)')
  .option('-y, --yes', 'Auto-confirm without prompting')
  .action(specCreateCommand);

specCommand
  .command('list')
  .alias('ls')
  .description('List all micro-specs')
  .option('--status <status>', 'Filter by status (draft, confirmed, archived)')
  .option('-o, --output <path>', 'Specs directory (default: specs/)')
  .action(specListCommand);

specCommand
  .command('show <id>')
  .description('Show a specific micro-spec')
  .option('-o, --output <path>', 'Specs directory (default: specs/)')
  .action(specShowCommand);

specCommand
  .command('confirm <id>')
  .description('Confirm a micro-spec for implementation')
  .option('-o, --output <path>', 'Specs directory (default: specs/)')
  .action(specConfirmCommand);

specCommand
  .command('archive <id>')
  .description('Archive a completed micro-spec')
  .option('-o, --output <path>', 'Specs directory (default: specs/)')
  .action(specArchiveCommand);

specCommand
  .command('delete <id>')
  .alias('rm')
  .description('Delete a micro-spec')
  .option('-y, --yes', 'Skip confirmation')
  .option('-o, --output <path>', 'Specs directory (default: specs/)')
  .action(specDeleteCommand);

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

workflowCommand
  .command('execute <workflow-name>')
  .alias('run')
  .description('Execute a workflow step by step')
  .option('-t, --tool <tool>', 'Target AI tool (default: claude-code)')
  .option('--resume', 'Resume from saved state')
  .option('--restart', 'Restart from beginning (discard saved state)')
  .option('-v, --verbose', 'Show detailed output')
  .option('--dry-run', 'Show steps without executing')
  .option('-y, --yes', 'Skip confirmation prompts')
  .action(workflowExecuteCommand);

workflowCommand
  .command('status [workflow-name]')
  .description('Show execution status of workflows')
  .action(workflowStatusCommand);

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

// Start command for mission-oriented development
program
  .command('start [mission-type] [intent]')
  .description('Start a new development mission')
  .option('-y, --yes', 'Skip confirmation prompts')
  .option('--skip-planning', 'Skip automatic transition to planning phase')
  .action(startCommand);

// Mission command with subcommands
const missionCommand = program
  .command('mission')
  .description('Manage development missions');

missionCommand
  .command('status')
  .description('Show current mission status')
  .action(missionStatusCommand);

missionCommand
  .command('pause')
  .description('Pause current mission')
  .option('-r, --reason <reason>', 'Reason for pausing')
  .action(missionPauseCommand);

missionCommand
  .command('resume')
  .description('Resume paused mission')
  .action(missionResumeCommand);

missionCommand
  .command('cancel')
  .description('Cancel current mission')
  .option('-r, --reason <reason>', 'Reason for cancellation')
  .option('-y, --yes', 'Skip confirmation')
  .action(missionCancelCommand);

missionCommand
  .command('list')
  .alias('ls')
  .description('List all missions')
  .option('-t, --type <type>', 'Filter by mission type')
  .option('-s, --state <state>', 'Filter by state')
  .action(missionListCommand);

program.parse();
