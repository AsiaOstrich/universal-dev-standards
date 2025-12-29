#!/usr/bin/env node

/**
 * Universal Dev Standards - Markdown to AI YAML Transformer
 *
 * Transforms human-readable Markdown standards into token-optimized
 * YAML format for AI assistants.
 *
 * Usage:
 *   node scripts/transform/index.js --input core/git-workflow.md
 *   node scripts/transform/index.js --all
 *   node scripts/transform/index.js --validate ai/
 */

import { parseArgs } from 'node:util';
import { readFile, writeFile, mkdir, readdir, stat } from 'node:fs/promises';
import { join, dirname, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { parseMarkdown } from './md-parser.js';
import { generateYaml } from './yaml-generator.js';
import { extractOptions } from './option-extractor.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = join(__dirname, '../..');

// Standards with configurable options
const STANDARDS_WITH_OPTIONS = {
  'git-workflow': {
    options: ['workflow', 'merge_strategy'],
    optionPatterns: {
      workflow: /## Strategy [ABC]: (.+)/g,
      merge_strategy: /### (Merge Commit|Squash Merge|Rebase \+ Fast-Forward)/g
    }
  },
  'commit-message-guide': {
    options: ['commit_language'],
    optionPatterns: {
      commit_language: /### Option [ABC]: (.+)/g
    }
  },
  'testing-standards': {
    options: ['test_level'],
    optionPatterns: {
      test_level: /## (Unit|Integration|System|E2E) Testing/g
    }
  }
};

async function main() {
  const { values } = parseArgs({
    options: {
      input: { type: 'string', short: 'i' },
      all: { type: 'boolean', short: 'a' },
      validate: { type: 'string', short: 'v' },
      output: { type: 'string', short: 'o' },
      help: { type: 'boolean', short: 'h' }
    }
  });

  if (values.help) {
    printHelp();
    return;
  }

  if (values.validate) {
    await validateOutput(values.validate);
    return;
  }

  if (values.all) {
    await transformAll();
    return;
  }

  if (values.input) {
    await transformSingle(values.input, values.output);
    return;
  }

  printHelp();
}

function printHelp() {
  console.log(`
Universal Dev Standards - Markdown to AI YAML Transformer

Usage:
  node scripts/transform/index.js [options]

Options:
  -i, --input <file>     Transform a single Markdown file
  -a, --all              Transform all standards in core/
  -v, --validate <dir>   Validate YAML files in directory
  -o, --output <dir>     Output directory (default: ai/)
  -h, --help             Show this help message

Examples:
  node scripts/transform/index.js --input core/git-workflow.md
  node scripts/transform/index.js --all
  node scripts/transform/index.js --validate ai/
`);
}

/**
 * Transform a single Markdown file to AI YAML format
 */
async function transformSingle(inputPath, outputDir = 'ai') {
  const absoluteInput = join(ROOT_DIR, inputPath);
  const content = await readFile(absoluteInput, 'utf-8');

  console.log(`Transforming: ${inputPath}`);

  // Parse Markdown
  const parsed = parseMarkdown(content, inputPath);

  // Get standard ID from filename
  const standardId = basename(inputPath, extname(inputPath))
    .replace('-guide', '')
    .replace('-standards', '');

  // Check if this standard has options
  const optionConfig = STANDARDS_WITH_OPTIONS[standardId];

  if (optionConfig) {
    // Extract options and generate multiple files
    const options = extractOptions(parsed, optionConfig);

    // Generate base standard file
    const baseYaml = generateYaml(parsed, { excludeOptions: true });
    const baseOutputPath = join(ROOT_DIR, outputDir, 'standards', `${standardId}.ai.yaml`);
    await ensureDir(dirname(baseOutputPath));
    await writeFile(baseOutputPath, baseYaml);
    console.log(`  Created: ${baseOutputPath}`);

    // Generate option files
    for (const [category, categoryOptions] of Object.entries(options)) {
      for (const option of categoryOptions) {
        const optionYaml = generateYaml(option.content, {
          isOption: true,
          parent: standardId,
          optionId: option.id
        });
        const optionPath = join(
          ROOT_DIR,
          outputDir,
          'options',
          standardId,
          `${option.id}.ai.yaml`
        );
        await ensureDir(dirname(optionPath));
        await writeFile(optionPath, optionYaml);
        console.log(`  Created: ${optionPath}`);
      }
    }
  } else {
    // No options, generate single file
    const yaml = generateYaml(parsed);
    const outputPath = join(ROOT_DIR, outputDir, 'standards', `${standardId}.ai.yaml`);
    await ensureDir(dirname(outputPath));
    await writeFile(outputPath, yaml);
    console.log(`  Created: ${outputPath}`);
  }

  console.log(`Done: ${inputPath}`);
}

/**
 * Transform all standards in core/ directory
 */
async function transformAll() {
  const coreDir = join(ROOT_DIR, 'core');
  const files = await readdir(coreDir);

  console.log('Transforming all standards...\n');

  for (const file of files) {
    if (file.endsWith('.md')) {
      await transformSingle(join('core', file));
      console.log('');
    }
  }

  console.log('All transformations complete!');
}

/**
 * Validate YAML files in a directory
 */
async function validateOutput(dir) {
  const absoluteDir = join(ROOT_DIR, dir);

  console.log(`Validating YAML files in: ${dir}\n`);

  let valid = 0;
  let invalid = 0;

  async function validateDir(currentDir) {
    const entries = await readdir(currentDir);

    for (const entry of entries) {
      const fullPath = join(currentDir, entry);
      const stats = await stat(fullPath);

      if (stats.isDirectory()) {
        await validateDir(fullPath);
      } else if (entry.endsWith('.ai.yaml')) {
        try {
          const content = await readFile(fullPath, 'utf-8');
          // Basic YAML validation (would use yaml library in production)
          if (content.includes('id:') && content.includes('meta:')) {
            console.log(`  ✓ ${fullPath}`);
            valid++;
          } else {
            console.log(`  ✗ ${fullPath} - Missing required fields`);
            invalid++;
          }
        } catch (err) {
          console.log(`  ✗ ${fullPath} - ${err.message}`);
          invalid++;
        }
      }
    }
  }

  await validateDir(absoluteDir);

  console.log(`\nValidation complete: ${valid} valid, ${invalid} invalid`);
}

/**
 * Ensure directory exists
 */
async function ensureDir(dir) {
  try {
    await mkdir(dir, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
}

// Run main
main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
