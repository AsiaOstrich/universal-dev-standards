#!/usr/bin/env tsx
/**
 * Integration Commands Sync Checker
 * 整合命令同步檢查器
 *
 * Cross-platform TypeScript implementation. Run with `tsx`.
 * Replaces check-integration-commands-sync.sh.
 *
 * Checks if AI Agent integration files reference all required slash commands
 * based on their tier level and COMMAND-INDEX.json registry.
 *
 * Usage: tsx scripts/check-integration-commands-sync.ts [options]
 *
 * Options:
 *   --verbose    Show detailed matching per agent
 *   --json       Output in JSON format
 *   --help       Show this help message
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const SCRIPT_DIR = dirname(__filename);
const ROOT_DIR = dirname(SCRIPT_DIR);
const REGISTRY_FILE = join(ROOT_DIR, 'integrations', 'REGISTRY.json');
const INDEX_FILE = join(ROOT_DIR, 'skills', 'commands', 'COMMAND-INDEX.json');
const COMMANDS_DIR = join(ROOT_DIR, 'skills', 'commands');

// ANSI colors
const RED = '\x1b[0;31m';
const GREEN = '\x1b[0;32m';
const YELLOW = '\x1b[1;33m';
const BLUE = '\x1b[0;34m';
const CYAN = '\x1b[0;36m';
const BOLD = '\x1b[1m';
const NC = '\x1b[0m';

interface CliOptions {
  verbose: boolean;
  jsonOutput: boolean;
}

interface CommandIndexCategory {
  commands: string[];
  [key: string]: unknown;
}

interface CommandIndex {
  categories: Record<string, CommandIndexCategory>;
  excluded: string[];
  [key: string]: unknown;
}

interface RegistryTier {
  requiredCategories?: string[];
  [key: string]: unknown;
}

interface RegistryAgent {
  tier: string;
  instructionFile?: string;
  [key: string]: unknown;
}

interface Registry {
  tiers: Record<string, RegistryTier>;
  agents: Record<string, RegistryAgent>;
  [key: string]: unknown;
}

function parseArgs(argv: string[]): CliOptions {
  let verbose = false;
  let jsonOutput = false;
  for (const arg of argv) {
    switch (arg) {
      case '--verbose':
        verbose = true;
        break;
      case '--json':
        jsonOutput = true;
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
  return { verbose, jsonOutput };
}

function printHelp(): void {
  process.stdout.write('Usage: tsx scripts/check-integration-commands-sync.ts [options]\n');
  process.stdout.write('\n');
  process.stdout.write('Options:\n');
  process.stdout.write('  --verbose    Show detailed matching per agent\n');
  process.stdout.write('  --json       Output in JSON format\n');
  process.stdout.write('  --help       Show this help message\n');
}

function loadJson<T>(file: string): T {
  return JSON.parse(readFileSync(file, 'utf8')) as T;
}

/**
 * Strict /command match: `/command` followed by a non-[a-z0-9-] char or end of line.
 * Mirrors `grep -qE "/${cmd}([^a-z0-9-]|$)"` from the original bash.
 */
function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function hasStrictCommandReference(content: string, cmd: string): boolean {
  // Multiline so `$` matches end of line, not end of string only.
  const re = new RegExp(`/${escapeRegExp(cmd)}([^a-z0-9-]|$)`, 'm');
  return re.test(content);
}

function main(): void {
  const opts = parseArgs(process.argv.slice(2));

  let errors = 0;
  let warnings = 0;
  let passed = 0;
  let skipped = 0;

  if (!existsSync(REGISTRY_FILE)) {
    process.stdout.write(`${RED}ERROR: Registry file not found: ${REGISTRY_FILE}${NC}\n`);
    process.exit(1);
  }

  if (!existsSync(INDEX_FILE)) {
    process.stdout.write(`${RED}ERROR: Command index file not found: ${INDEX_FILE}${NC}\n`);
    process.exit(1);
  }

  const idx = loadJson<CommandIndex>(INDEX_FILE);
  const reg = loadJson<Registry>(REGISTRY_FILE);

  if (!opts.jsonOutput) {
    process.stdout.write('\n');
    process.stdout.write('==========================================\n');
    process.stdout.write('  Integration Commands Sync Checker\n');
    process.stdout.write('  整合命令同步檢查器\n');
    process.stdout.write('==========================================\n');
    process.stdout.write('\n');
  }

  // ── Phase 1: Check for unregistered commands ──
  if (!opts.jsonOutput) {
    process.stdout.write(`${BLUE}Phase 1: Checking for unregistered commands${NC}\n`);
    process.stdout.write(`${BLUE}階段 1: 檢查未登記的命令${NC}\n`);
    process.stdout.write('\n');
  }

  const indexedCommandsSet = new Set<string>(
    Object.values(idx.categories).flatMap((c) => c.commands ?? []),
  );
  const excludedSet = new Set<string>(idx.excluded ?? []);

  let unregisteredCount = 0;
  if (existsSync(COMMANDS_DIR)) {
    const mdFiles = readdirSync(COMMANDS_DIR)
      .filter((f) => f.endsWith('.md'))
      .sort();
    for (const filename of mdFiles) {
      if (excludedSet.has(filename)) continue;
      const cmdName = filename.replace(/\.md$/, '');
      if (!indexedCommandsSet.has(cmdName)) {
        if (!opts.jsonOutput) {
          process.stdout.write(
            `  ${YELLOW}⚠️  Unregistered command: ${BOLD}${cmdName}${NC}\n`,
          );
        }
        warnings += 1;
        unregisteredCount += 1;
      }
    }
  }

  if (unregisteredCount === 0 && !opts.jsonOutput) {
    process.stdout.write(
      `  ${GREEN}✅ All command files are registered in COMMAND-INDEX.json${NC}\n`,
    );
  }

  process.stdout.write('\n');

  // ── Phase 2: Check agent integration files for slash command references ──
  if (!opts.jsonOutput) {
    process.stdout.write(
      `${BLUE}Phase 2: Checking agent integration files for /command references${NC}\n`,
    );
    process.stdout.write(`${BLUE}階段 2: 檢查 Agent 整合檔的 /command 引用${NC}\n`);
    process.stdout.write('\n');
  }

  for (const [agentId, agent] of Object.entries(reg.agents)) {
    const tier = agent.tier;
    const tierDef = reg.tiers[tier] ?? {};
    const reqCats = tierDef.requiredCategories ?? [];
    const instrFile = agent.instructionFile ?? '';

    if (reqCats.length === 0) {
      if (!opts.jsonOutput) {
        process.stdout.write(
          `${CYAN}Checking ${BOLD}${agentId}${NC}${CYAN} (${tier})${NC}\n`,
        );
        process.stdout.write(
          `  ${BLUE}ℹ️  Skipped (no command requirements for ${tier} tier)${NC}\n`,
        );
        process.stdout.write('\n');
      }
      skipped += 1;
      continue;
    }

    const reqCommands: string[] = reqCats.flatMap(
      (cat) => idx.categories[cat]?.commands ?? [],
    );

    const fullPath = join(ROOT_DIR, instrFile);
    if (!instrFile || !existsSync(fullPath)) {
      if (!opts.jsonOutput) {
        process.stdout.write(
          `${CYAN}Checking ${BOLD}${agentId}${NC}${CYAN} (${tier})${NC}\n`,
        );
        process.stdout.write(`  ${YELLOW}[SKIP]${NC} File not found: ${instrFile}\n`);
        process.stdout.write('\n');
      }
      skipped += 1;
      continue;
    }

    const fileContent = readFileSync(fullPath, 'utf8');
    const agentMissing: string[] = [];
    let agentFound = 0;
    const agentTotal = reqCommands.length;

    for (const cmd of reqCommands) {
      if (hasStrictCommandReference(fileContent, cmd)) {
        agentFound += 1;
      } else {
        agentMissing.push(cmd);
      }
    }

    if (!opts.jsonOutput) {
      process.stdout.write(
        `${CYAN}Checking ${BOLD}${agentId}${NC}${CYAN} (${tier})${NC}\n`,
      );

      if (agentMissing.length === 0) {
        process.stdout.write(
          `  ${GREEN}✅ All ${agentTotal} commands referenced${NC}\n`,
        );
        passed += 1;
      } else {
        process.stdout.write(
          `  ${RED}❌ Missing ${agentMissing.length}/${agentTotal} commands:${NC}\n`,
        );
        for (const missingCmd of agentMissing) {
          process.stdout.write(`     ${RED}• /${missingCmd}${NC}\n`);
          // Original increments errors per missing command
          errors += 1;
        }

        if (opts.verbose) {
          process.stdout.write(
            `  ${GREEN}Found ${agentFound}/${agentTotal}:${NC}\n`,
          );
          for (const cmd of reqCommands) {
            if (!agentMissing.includes(cmd)) {
              process.stdout.write(`     ${GREEN}✓ /${cmd}${NC}\n`);
            }
          }
        }
      }
      process.stdout.write('\n');
    } else {
      if (agentMissing.length > 0) {
        // Original: in JSON-output branch, increments errors only once
        errors += 1;
      } else {
        passed += 1;
      }
    }
  }

  // ── Summary ──
  if (!opts.jsonOutput) {
    process.stdout.write('==========================================\n');
    process.stdout.write(`  ${GREEN}Passed: ${passed}${NC}\n`);
    process.stdout.write(`  ${RED}Errors: ${errors}${NC}\n`);
    process.stdout.write(`  ${YELLOW}Warnings: ${warnings}${NC}\n`);
    process.stdout.write(`  ${BLUE}Skipped: ${skipped}${NC}\n`);
    process.stdout.write('==========================================\n');
    process.stdout.write('\n');
  }

  if (errors > 0) {
    if (!opts.jsonOutput) {
      process.stdout.write(
        `${RED}FAIL: ${errors} missing command references found${NC}\n`,
      );
    }
    process.exit(1);
  }

  if (warnings > 0) {
    if (!opts.jsonOutput) {
      process.stdout.write(
        `${YELLOW}WARN: ${warnings} warnings found (unregistered commands)${NC}\n`,
      );
    }
    process.exit(0);
  }

  if (!opts.jsonOutput) {
    process.stdout.write(`${GREEN}PASS: All integration files are in sync${NC}\n`);
  }
  process.exit(0);
}

main();
