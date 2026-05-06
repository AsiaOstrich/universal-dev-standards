#!/usr/bin/env tsx
/**
 * AI Agent Behavior Sync Checker
 * AI Agent Behavior 覆蓋率檢查器
 *
 * Cross-platform TypeScript implementation. Run with `tsx`.
 * Replaces check-ai-behavior-sync.sh.
 *
 * This script checks that all multi-step command definition files
 * include an "AI Agent Behavior" section.
 *
 * Usage: tsx scripts/check-ai-behavior-sync.ts [options]
 *
 * Options:
 *   --verbose    Show details for each file
 *   --help       Show this help message
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const SCRIPT_DIR = dirname(__filename);
const ROOT_DIR = dirname(SCRIPT_DIR);
const COMMANDS_DIR = join(ROOT_DIR, 'skills', 'commands');

// ANSI colors
const RED = '\x1b[0;31m';
const GREEN = '\x1b[0;32m';
const YELLOW = '\x1b[1;33m';
// CYAN reserved (kept for parity with original script)
const BOLD = '\x1b[1m';
const NC = '\x1b[0m';

// Whitelist: files that do NOT need AI Agent Behavior
const WHITELIST: ReadonlyArray<string> = [
  'README.md',
  'COMMAND-FAMILY-OVERVIEW.md',
  'guide.md',
];

interface CliOptions {
  verbose: boolean;
}

function parseArgs(argv: string[]): CliOptions {
  let verbose = false;
  for (const arg of argv) {
    switch (arg) {
      case '--verbose':
        verbose = true;
        break;
      case '--help':
        printHelp();
        process.exit(0);
      // eslint-disable-next-line no-fallthrough
      default:
        process.stdout.write(`${RED}Unknown option: ${arg}${NC}\n`);
        process.stdout.write('Use --help for usage information\n');
        process.exit(1);
    }
  }
  return { verbose };
}

function printHelp(): void {
  process.stdout.write('Usage: tsx scripts/check-ai-behavior-sync.ts [options]\n');
  process.stdout.write('\n');
  process.stdout.write("Checks that all multi-step command definition files include\n");
  process.stdout.write("an 'AI Agent Behavior' section.\n");
  process.stdout.write('\n');
  process.stdout.write('Options:\n');
  process.stdout.write('  --verbose    Show details for each file\n');
  process.stdout.write('  --help       Show this help message\n');
}

function main(): void {
  const opts = parseArgs(process.argv.slice(2));

  let total = 0;
  let covered = 0;
  let missing = 0;
  let skipped = 0;
  const missingFiles: string[] = [];

  process.stdout.write('\n');
  process.stdout.write(`${BOLD}AI Agent Behavior Coverage Check${NC}\n`);
  process.stdout.write(`${BOLD}AI Agent Behavior 覆蓋率檢查${NC}\n`);
  process.stdout.write('==========================================\n');

  if (!existsSync(COMMANDS_DIR)) {
    process.stdout.write(`${RED}Commands directory not found: ${COMMANDS_DIR}${NC}\n`);
    process.exit(1);
  }

  const entries = readdirSync(COMMANDS_DIR)
    .filter((f) => f.endsWith('.md'))
    .sort();

  for (const filename of entries) {
    const filePath = join(COMMANDS_DIR, filename);

    if (WHITELIST.includes(filename)) {
      skipped += 1;
      if (opts.verbose) {
        process.stdout.write(`  ${YELLOW}⏭ ${filename} (whitelisted)${NC}\n`);
      }
      continue;
    }

    total += 1;

    const content = readFileSync(filePath, 'utf8');
    if (content.includes('## AI Agent Behavior')) {
      covered += 1;
      if (opts.verbose) {
        process.stdout.write(`  ${GREEN}✓ ${filename}${NC}\n`);
      }
    } else {
      missing += 1;
      missingFiles.push(filename);
      if (opts.verbose) {
        process.stdout.write(`  ${RED}✗ ${filename} (missing AI Agent Behavior)${NC}\n`);
      }
    }
  }

  process.stdout.write('\n');

  let coverage = 0;
  if (total > 0) {
    coverage = Math.floor((covered * 100) / total);
  }

  process.stdout.write(`Coverage: ${BOLD}${covered}/${total}${NC} (${coverage}%)\n`);
  process.stdout.write(`  Covered:  ${GREEN}${covered}${NC}\n`);
  process.stdout.write(`  Missing:  ${RED}${missing}${NC}\n`);
  process.stdout.write(`  Skipped:  ${YELLOW}${skipped}${NC} (whitelisted)\n`);

  if (missing > 0) {
    process.stdout.write('\n');
    process.stdout.write(`${RED}Missing AI Agent Behavior section:${NC}\n`);
    // Bash original prepends an empty line (MISSING_FILES starts with "\n").
    process.stdout.write('\n');
    for (const f of missingFiles) {
      process.stdout.write(`  - ${f}\n`);
    }
    process.stdout.write('\n');
    process.stdout.write(`${YELLOW}These command files need an 'AI Agent Behavior' section.${NC}\n`);
    process.stdout.write(`${YELLOW}See core/ai-command-behavior.md for the required format.${NC}\n`);
    process.exit(1);
  } else {
    process.stdout.write('\n');
    process.stdout.write(`${GREEN}✓ All command files have AI Agent Behavior sections${NC}\n`);
    process.exit(0);
  }
}

main();
