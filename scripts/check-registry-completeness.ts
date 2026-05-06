#!/usr/bin/env tsx
/**
 * Registry Completeness Checker
 * 註冊表完整性檢查器
 *
 * Cross-platform TypeScript implementation. Run with `tsx`.
 * Replaces check-registry-completeness.sh.
 *
 * Ensures every core standard has all required sync artifacts:
 *   1. core/*.md exists → ai/standards/*.ai.yaml exists
 *   2. core/*.md exists → standards-registry.json has entry
 *   3. ai/standards/*.ai.yaml → .standards/*.ai.yaml (installed copy)
 *
 * Usage: tsx scripts/check-registry-completeness.ts
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const SCRIPT_DIR = dirname(__filename);
const ROOT_DIR = dirname(SCRIPT_DIR);

const CORE_DIR = join(ROOT_DIR, 'core');
const AI_STANDARDS_DIR = join(ROOT_DIR, 'ai', 'standards');
const DOT_STANDARDS_DIR = join(ROOT_DIR, '.standards');
const REGISTRY_FILE = join(ROOT_DIR, 'cli', 'standards-registry.json');

// ANSI colors
const RED = '\x1b[0;31m';
const GREEN = '\x1b[0;32m';
const YELLOW = '\x1b[1;33m';
const BLUE = '\x1b[0;34m';
const NC = '\x1b[0m';

const NAME_MAP: Record<string, string> = {
  'changelog-standards': 'changelog',
  'code-review-checklist': 'code-review',
  'commit-message-guide': 'commit-message',
  'error-code-standards': 'error-codes',
  'logging-standards': 'logging',
  'testing-standards': 'testing',
};

const REFERENCE_ONLY: ReadonlyArray<string> = [
  'requirement-checklist',
  'requirement-template',
  'requirement-document-template',
];

function mapCoreToAi(coreName: string): string {
  return NAME_MAP[coreName] ?? coreName;
}

function isReferenceOnly(name: string): boolean {
  return REFERENCE_ONLY.includes(name);
}

function listCoreMd(): string[] {
  if (!existsSync(CORE_DIR)) return [];
  return readdirSync(CORE_DIR)
    .filter((f) => f.endsWith('.md'))
    .sort();
}

function main(): void {
  let errors = 0;
  let warnings = 0;

  process.stdout.write('\n');
  process.stdout.write('==========================================\n');
  process.stdout.write('  Registry Completeness Checker\n');
  process.stdout.write('  註冊表完整性檢查器\n');
  process.stdout.write('==========================================\n');
  process.stdout.write('\n');

  // ───────────────────────────────────────────────────────────
  // Check 1: core/*.md → ai/standards/*.ai.yaml
  // ───────────────────────────────────────────────────────────
  process.stdout.write(
    `${BLUE}[1/3] Checking core/ → ai/standards/ completeness${NC}\n`,
  );
  process.stdout.write('----------------------------------------\n');

  let coreCount = 0;
  let aiMissing = 0;

  const coreFiles = listCoreMd();
  for (const filename of coreFiles) {
    const coreBasename = filename.replace(/\.md$/, '');
    if (isReferenceOnly(coreBasename)) continue;

    coreCount += 1;

    const aiName = mapCoreToAi(coreBasename);
    const aiFile = join(AI_STANDARDS_DIR, `${aiName}.ai.yaml`);

    if (existsSync(aiFile)) {
      process.stdout.write(
        `  ${GREEN}[OK]${NC}      ${coreBasename}.md → ${aiName}.ai.yaml\n`,
      );
    } else {
      process.stdout.write(
        `  ${RED}[MISSING]${NC} ${coreBasename}.md → ${aiName}.ai.yaml (not found)\n`,
      );
      errors += 1;
      aiMissing += 1;
    }
  }

  process.stdout.write('\n');
  process.stdout.write(`  Core standards: ${coreCount} | AI YAML missing: ${aiMissing}\n`);
  process.stdout.write('\n');

  // ───────────────────────────────────────────────────────────
  // Check 2: core/*.md → standards-registry.json
  // ───────────────────────────────────────────────────────────
  process.stdout.write(
    `${BLUE}[2/3] Checking core/ → standards-registry.json completeness${NC}\n`,
  );
  process.stdout.write('----------------------------------------\n');

  let registryMissing = 0;
  let registryContent = '';
  if (existsSync(REGISTRY_FILE)) {
    registryContent = readFileSync(REGISTRY_FILE, 'utf8');
  }

  for (const filename of coreFiles) {
    const coreBasename = filename.replace(/\.md$/, '');
    if (isReferenceOnly(coreBasename)) continue;

    const aiName = mapCoreToAi(coreBasename);
    const humanKey = `"core/${coreBasename}.md"`;
    const aiKey = `"ai/standards/${aiName}.ai.yaml"`;

    if (registryContent.includes(humanKey) || registryContent.includes(aiKey)) {
      process.stdout.write(
        `  ${GREEN}[OK]${NC}      ${coreBasename}.md → registry entry found\n`,
      );
    } else {
      process.stdout.write(
        `  ${RED}[MISSING]${NC} ${coreBasename}.md → no registry entry\n`,
      );
      errors += 1;
      registryMissing += 1;
    }
  }

  process.stdout.write('\n');
  process.stdout.write(`  Registry missing: ${registryMissing}\n`);
  process.stdout.write('\n');

  // ───────────────────────────────────────────────────────────
  // Check 3: ai/standards/*.ai.yaml → .standards/*.ai.yaml
  // ───────────────────────────────────────────────────────────
  process.stdout.write(
    `${BLUE}[3/3] Checking ai/standards/ → .standards/ installed copies${NC}\n`,
  );
  process.stdout.write('----------------------------------------\n');

  let dotMissing = 0;
  let dotTotal = 0;

  let aiFiles: string[] = [];
  if (existsSync(AI_STANDARDS_DIR)) {
    aiFiles = readdirSync(AI_STANDARDS_DIR)
      .filter((f) => f.endsWith('.ai.yaml'))
      .sort();
  }

  for (const aiBasename of aiFiles) {
    dotTotal += 1;
    const dotFile = join(DOT_STANDARDS_DIR, aiBasename);
    if (existsSync(dotFile)) {
      process.stdout.write(
        `  ${GREEN}[OK]${NC}      ${aiBasename} → .standards/ installed\n`,
      );
    } else {
      process.stdout.write(
        `  ${YELLOW}[WARN]${NC}    ${aiBasename} → not in .standards/ (run 'uds update' to sync)\n`,
      );
      warnings += 1;
      dotMissing += 1;
    }
  }

  process.stdout.write('\n');
  process.stdout.write(`  AI standards: ${dotTotal} | .standards/ missing: ${dotMissing}\n`);
  process.stdout.write('\n');

  // ───────────────────────────────────────────────────────────
  // Summary
  // ───────────────────────────────────────────────────────────
  process.stdout.write('==========================================\n');
  process.stdout.write('  Summary | 摘要\n');
  process.stdout.write('==========================================\n');

  if (errors > 0) {
    process.stdout.write(
      `${RED}Errors: ${errors}${NC} (Missing AI files or registry entries)\n`,
    );
    process.stdout.write('\n');
    process.stdout.write('To fix errors:\n');
    process.stdout.write('  - Create missing .ai.yaml files in ai/standards/\n');
    process.stdout.write('  - Add missing entries to cli/standards-registry.json\n');
    process.stdout.write(
      '  - Run: ./scripts/check-standards-sync.sh for detailed sync info\n',
    );
  }

  if (warnings > 0) {
    process.stdout.write(
      `${YELLOW}Warnings: ${warnings}${NC} (Missing .standards/ copies)\n`,
    );
    process.stdout.write('\n');
    process.stdout.write('To fix warnings:\n');
    process.stdout.write("  - Run 'uds update' in this project to sync .standards/\n");
    process.stdout.write('  - Or manually copy ai/standards/*.ai.yaml to .standards/\n');
  }

  if (errors === 0 && warnings === 0) {
    process.stdout.write(`${GREEN}All checks passed! ✓${NC}\n`);
    process.stdout.write(`  Core standards: ${coreCount}\n`);
    process.stdout.write(`  AI YAML files: ${dotTotal}\n`);
    process.stdout.write('  Registry entries: complete\n');
    process.stdout.write('  .standards/ copies: complete\n');
  }

  process.stdout.write('\n');

  // Exit with error if there are errors (not warnings)
  if (errors > 0) {
    process.exit(1);
  }
  process.exit(0);
}

main();
