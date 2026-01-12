#!/usr/bin/env node
/**
 * Markdown to AI-YAML Conversion Script
 * 將 Markdown 標準文件轉換為 AI 優化 YAML 格式
 *
 * Usage:
 *   node scripts/convert-md-to-yaml.mjs [options] [file...]
 *
 * Options:
 *   --all           Convert all core/*.md files
 *   --locales       Also convert all locale versions
 *   --preview       Preview without writing files
 *   --preserve      Preserve manual sections in existing YAML
 *   --help          Show help
 *
 * Examples:
 *   node scripts/convert-md-to-yaml.mjs core/commit-message-guide.md
 *   node scripts/convert-md-to-yaml.mjs --all
 *   node scripts/convert-md-to-yaml.mjs --all --locales
 *   node scripts/convert-md-to-yaml.mjs --all --preview
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from 'fs';
import { dirname, join, basename } from 'path';
import { fileURLToPath } from 'url';

// Import conversion utilities
import { parseMarkdown } from '../cli/src/utils/md-parser.js';
import { generateAiYaml, toYamlString, extractManualSections, mergeManualSections } from '../cli/src/utils/yaml-generator.js';
import { getOutputDir, getOutputFilename, getSupportedLocales } from '../cli/src/utils/conversion-rules.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = dirname(__dirname);

// ANSI colors for terminal output
const colors = {
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`,
  gray: (text) => `\x1b[90m${text}\x1b[0m`,
  bold: (text) => `\x1b[1m${text}\x1b[0m`
};

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    all: false,
    locales: false,
    preview: false,
    preserve: true, // Default to preserve
    help: false,
    files: []
  };

  for (const arg of args) {
    if (arg === '--all' || arg === '-a') {
      options.all = true;
    } else if (arg === '--locales' || arg === '-l') {
      options.locales = true;
    } else if (arg === '--preview' || arg === '-p') {
      options.preview = true;
    } else if (arg === '--preserve') {
      options.preserve = true;
    } else if (arg === '--no-preserve') {
      options.preserve = false;
    } else if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (!arg.startsWith('-')) {
      options.files.push(arg);
    }
  }

  return options;
}

/**
 * Show help message
 */
function showHelp() {
  console.log(`
${colors.bold('Markdown to AI-YAML Conversion Tool')}

${colors.cyan('Usage:')}
  node scripts/convert-md-to-yaml.mjs [options] [file...]

${colors.cyan('Options:')}
  --all, -a       Convert all core/*.md files
  --locales, -l   Also convert all locale versions
  --preview, -p   Preview without writing files
  --preserve      Preserve manual sections (default: on)
  --no-preserve   Overwrite without preserving manual sections
  --help, -h      Show this help message

${colors.cyan('Examples:')}
  # Convert a single file
  node scripts/convert-md-to-yaml.mjs core/commit-message-guide.md

  # Convert all core standards
  node scripts/convert-md-to-yaml.mjs --all

  # Convert all standards including locales
  node scripts/convert-md-to-yaml.mjs --all --locales

  # Preview conversion without writing
  node scripts/convert-md-to-yaml.mjs --all --preview

${colors.cyan('Output:')}
  core/*.md           → ai/standards/*.ai.yaml
  locales/*/core/*.md → locales/*/ai/standards/*.ai.yaml
`);
}

/**
 * Get all core Markdown files
 */
function getCoreFiles() {
  const coreDir = join(rootDir, 'core');
  if (!existsSync(coreDir)) {
    return [];
  }

  return readdirSync(coreDir)
    .filter(f => f.endsWith('.md'))
    .map(f => join('core', f));
}

/**
 * Get all locale Markdown files
 */
function getLocaleFiles() {
  const files = [];
  const localesDir = join(rootDir, 'locales');

  if (!existsSync(localesDir)) {
    return files;
  }

  const locales = readdirSync(localesDir);
  for (const locale of locales) {
    const coreDir = join(localesDir, locale, 'core');
    if (existsSync(coreDir)) {
      const mdFiles = readdirSync(coreDir)
        .filter(f => f.endsWith('.md'))
        .map(f => join('locales', locale, 'core', f));
      files.push(...mdFiles);
    }
  }

  return files;
}

/**
 * Convert a single Markdown file to AI-YAML
 */
function convertFile(relativePath, options) {
  const fullPath = join(rootDir, relativePath);
  const filename = basename(relativePath);

  // Determine locale from path
  let locale = null;
  const localeMatch = relativePath.match(/locales\/([^/]+)\//);
  if (localeMatch) {
    locale = localeMatch[1];
  }

  // Read source file
  if (!existsSync(fullPath)) {
    return { success: false, error: `File not found: ${relativePath}` };
  }

  let content;
  try {
    content = readFileSync(fullPath, 'utf-8');
  } catch (err) {
    return { success: false, error: `Could not read file: ${err.message}` };
  }

  // Parse Markdown
  let parsed;
  try {
    parsed = parseMarkdown(content);
  } catch (err) {
    return { success: false, error: `Parse error: ${err.message}` };
  }

  // Generate YAML structure
  let yamlObj;
  try {
    yamlObj = generateAiYaml(parsed, { filename, locale });
  } catch (err) {
    return { success: false, error: `Generation error: ${err.message}` };
  }

  // Convert to YAML string
  let yamlContent;
  try {
    yamlContent = toYamlString(yamlObj);
  } catch (err) {
    return { success: false, error: `YAML serialization error: ${err.message}` };
  }

  // Determine output path
  const outputDir = join(rootDir, getOutputDir(relativePath));
  const outputFilename = getOutputFilename(filename);
  const outputPath = join(outputDir, outputFilename);
  const relativeOutput = join(getOutputDir(relativePath), outputFilename);

  // Handle preservation of manual sections
  if (options.preserve && existsSync(outputPath)) {
    try {
      const existingContent = readFileSync(outputPath, 'utf-8');
      const { hasManualSections, manualContent } = extractManualSections(existingContent);
      if (hasManualSections) {
        yamlContent = mergeManualSections(yamlContent, manualContent);
      }
    } catch {
      // Ignore errors reading existing file
    }
  }

  // Preview mode - don't write
  if (options.preview) {
    return {
      success: true,
      preview: true,
      input: relativePath,
      output: relativeOutput,
      content: yamlContent
    };
  }

  // Ensure output directory exists
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  // Write output file
  try {
    writeFileSync(outputPath, yamlContent, 'utf-8');
  } catch (err) {
    return { success: false, error: `Write error: ${err.message}` };
  }

  return {
    success: true,
    input: relativePath,
    output: relativeOutput
  };
}

/**
 * Main function
 */
async function main() {
  const options = parseArgs();

  // Show help
  if (options.help) {
    showHelp();
    process.exit(0);
  }

  console.log();
  console.log(colors.bold('Markdown → AI-YAML Conversion Tool'));
  console.log(colors.gray('─'.repeat(50)));
  console.log();

  // Collect files to convert
  let files = [];

  if (options.all) {
    files.push(...getCoreFiles());
    if (options.locales) {
      files.push(...getLocaleFiles());
    }
  } else if (options.files.length > 0) {
    files = options.files;
  } else {
    console.log(colors.yellow('No files specified. Use --all or provide file paths.'));
    console.log(colors.gray('Run with --help for usage information.'));
    console.log();
    process.exit(1);
  }

  if (files.length === 0) {
    console.log(colors.yellow('No Markdown files found to convert.'));
    process.exit(1);
  }

  console.log(colors.cyan(`Converting ${files.length} file(s)...`));
  if (options.preview) {
    console.log(colors.yellow('Preview mode - no files will be written'));
  }
  console.log();

  // Process files
  let successCount = 0;
  let errorCount = 0;

  for (const file of files) {
    const result = convertFile(file, options);

    if (result.success) {
      successCount++;
      if (result.preview) {
        console.log(colors.cyan(`  ○ ${result.input}`));
        console.log(colors.gray(`    → ${result.output} (preview)`));
      } else {
        console.log(colors.green(`  ✓ ${result.input}`));
        console.log(colors.gray(`    → ${result.output}`));
      }
    } else {
      errorCount++;
      console.log(colors.red(`  ✗ ${file}`));
      console.log(colors.red(`    Error: ${result.error}`));
    }
  }

  // Summary
  console.log();
  console.log(colors.gray('─'.repeat(50)));
  console.log();

  if (errorCount === 0) {
    console.log(colors.green(`✓ Successfully converted ${successCount} file(s)`));
  } else {
    console.log(colors.yellow(`Converted ${successCount} file(s), ${errorCount} error(s)`));
  }

  if (options.preview) {
    console.log(colors.gray('  (Preview mode - no files were written)'));
  }

  console.log();

  process.exit(errorCount > 0 ? 1 : 0);
}

// Run
main().catch(err => {
  console.error(colors.red(`Fatal error: ${err.message}`));
  process.exit(1);
});
