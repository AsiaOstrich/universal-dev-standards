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
  .option('-y, --yes', 'Use defaults, skip interactive prompts')
  .action(initCommand);

program
  .command('configure')
  .alias('config')
  .description('Modify options for initialized project')
  .option('-t, --type <type>', 'Option type to configure (format, workflow, merge_strategy, commit_language, test_levels, all)')
  .action(configureCommand);

program
  .command('check')
  .description('Check adoption status of current project')
  .action(checkCommand);

program
  .command('update')
  .description('Update standards to latest version')
  .option('-y, --yes', 'Skip confirmation prompts')
  .action(updateCommand);

program
  .command('skills')
  .description('List installed Claude Code skills')
  .action(skillsCommand);

program.parse();
