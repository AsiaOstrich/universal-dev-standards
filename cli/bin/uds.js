#!/usr/bin/env node

import { program } from 'commander';
import { listCommand } from '../src/commands/list.js';
import { initCommand } from '../src/commands/init.js';
import { checkCommand } from '../src/commands/check.js';
import { updateCommand } from '../src/commands/update.js';

program
  .name('uds')
  .description('CLI tool for adopting Universal Development Standards')
  .version('2.0.0');

program
  .command('list')
  .description('List available standards')
  .option('-l, --level <level>', 'Filter by adoption level (1, 2, or 3)')
  .option('-c, --category <category>', 'Filter by category (skill, reference, extension, integration, template)')
  .action(listCommand);

program
  .command('init')
  .description('Initialize standards in current project')
  .option('-l, --level <level>', 'Adoption level (1=Essential, 2=Recommended, 3=Enterprise)')
  .option('--lang <language>', 'Language extension (csharp, php)')
  .option('--framework <framework>', 'Framework extension (fat-free)')
  .option('--locale <locale>', 'Locale extension (zh-tw)')
  .option('--no-skills', 'Skip Claude Code Skills installation')
  .option('-y, --yes', 'Use defaults, skip interactive prompts')
  .action(initCommand);

program
  .command('check')
  .description('Check adoption status of current project')
  .action(checkCommand);

program
  .command('update')
  .description('Update standards to latest version')
  .option('-y, --yes', 'Skip confirmation prompts')
  .action(updateCommand);

program.parse();
