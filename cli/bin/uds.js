#!/usr/bin/env node

import { createRequire } from 'node:module';
import { program } from 'commander';
import { listCommand } from '../src/commands/list.js';
import { initCommand } from '../src/commands/init.js';
import { checkCommand } from '../src/commands/check.js';
import { updateCommand } from '../src/commands/update.js';
import { configureCommand } from '../src/commands/configure.js';
import { skillsCommand } from '../src/commands/skills.js';

const require = createRequire(import.meta.url);
const pkg = require('../package.json');

program
  .name('uds')
  .description('CLI tool for adopting Universal Development Standards')
  .version(pkg.version);

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
  .option('--ui-lang <lang>', 'UI language for prompts (en, zh-tw, auto) [default: auto]')
  .option('-y, --yes', 'Use defaults, skip interactive prompts')
  .option('-E, --experimental', 'Enable experimental features (methodology)')
  .action(initCommand);

program
  .command('configure')
  .alias('config')
  .description('Modify options for initialized project')
  .option('-t, --type <type>', 'Option type to configure (format, workflow, merge_strategy, commit_language, test_levels, all)')
  .option('-E, --experimental', 'Enable experimental features (methodology)')
  .action(configureCommand);

program
  .command('check')
  .description('Check adoption status of current project')
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
  .action(updateCommand);

program
  .command('skills')
  .description('List installed Claude Code skills')
  .action(skillsCommand);

program.parse();
