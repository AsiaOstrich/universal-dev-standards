#!/usr/bin/env node
/**
 * Generate E2E Test Cases Specification from test files
 *
 * This script parses all E2E test files and generates a markdown specification
 * document that stays in sync with the actual test code.
 *
 * Usage:
 *   node scripts/generate-e2e-spec.mjs           # Generate spec
 *   node scripts/generate-e2e-spec.mjs --check   # Verify spec is up-to-date
 */

import { readdir, readFile, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const E2E_DIR = join(__dirname, '../tests/e2e');
const OUTPUT_FILE = join(__dirname, '../tests/E2E-TEST-CASES.md');
const TRANSLATIONS_FILE = join(__dirname, 'e2e-translations.json');

// Load translations
let translations = { sections: {}, tests: {} };
try {
  const content = await readFile(TRANSLATIONS_FILE, 'utf8');
  translations = JSON.parse(content);
} catch (err) {
  console.warn('⚠️ Translation file not found, using English');
}

/**
 * Translate text using the translation mapping
 * Falls back to original text if no translation found
 * @param {string} text - Original text to translate
 * @param {string} type - 'sections' or 'tests'
 * @returns {string} Translated name
 */
function translate(text, type = 'tests') {
  const dict = type === 'sections' ? translations.sections : translations.tests;
  const entry = dict[text];
  if (!entry) return text;
  // Support both string format and object format { name, expected }
  return typeof entry === 'string' ? entry : entry.name || text;
}

/**
 * Get expected result for a test
 * @param {string} testName - Original test name
 * @returns {string|null} Expected result or null if not defined
 */
function getExpected(testName) {
  const entry = translations.tests[testName];
  if (!entry || typeof entry === 'string') return null;
  return entry.expected || null;
}

/**
 * Parse a test file and extract structure
 */
async function parseTestFile(filePath) {
  const content = await readFile(filePath, 'utf8');
  const fileName = filePath.split('/').pop();

  // Extract command name from top-level describe
  const commandMatch = content.match(/describe\s*\(\s*['"`]E2E:\s*uds\s+(\w+)['"`]/);
  const command = commandMatch ? commandMatch[1] : fileName.replace('-flow.test.js', '');

  // Extract all describe blocks (sections)
  const sections = [];
  const describeRegex = /describe\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*\(\s*\)\s*=>\s*\{/g;
  let match;

  // Find all describes and their positions
  const describes = [];
  while ((match = describeRegex.exec(content)) !== null) {
    if (!match[1].startsWith('E2E:')) {
      describes.push({
        name: match[1],
        position: match.index
      });
    }
  }

  // For each describe, find the it() blocks within it
  for (let i = 0; i < describes.length; i++) {
    const section = describes[i];
    const startPos = section.position;
    const endPos = describes[i + 1]?.position || content.length;
    const sectionContent = content.substring(startPos, endPos);

    // Extract it() blocks
    const tests = [];
    const itRegex = /it\s*\(\s*['"`]([^'"`]+)['"`]/g;
    let itMatch;

    while ((itMatch = itRegex.exec(sectionContent)) !== null) {
      const testName = itMatch[1];

      // Try to extract options from the test - look for a larger block
      const testStartPos = itMatch.index;
      // Find the matching closing by counting braces
      let braceCount = 0;
      let testEndPos = testStartPos;
      let foundStart = false;
      for (let j = testStartPos; j < sectionContent.length && j < testStartPos + 2000; j++) {
        const char = sectionContent[j];
        if (char === '{') {
          foundStart = true;
          braceCount++;
        } else if (char === '}') {
          braceCount--;
          if (foundStart && braceCount === 0) {
            testEndPos = j + 1;
            break;
          }
        }
      }
      const testContent = sectionContent.substring(testStartPos, testEndPos || testStartPos + 1000);

      // Extract options object
      const options = extractOptions(testContent);

      tests.push({
        name: testName,
        options
      });
    }

    if (tests.length > 0) {
      sections.push({
        name: section.name,
        tests
      });
    }
  }

  return {
    command,
    fileName,
    sections,
    totalTests: sections.reduce((sum, s) => sum + s.tests.length, 0)
  };
}

/**
 * Extract CLI options from test content
 */
function extractOptions(testContent) {
  const options = [];

  // Define option patterns and their CLI equivalents
  const optionDefs = [
    { pattern: /level:\s*['"`]?(\d+)['"`]?/, format: (m) => `--level=${m[1]}` },
    { pattern: /skillsLocation:\s*['"`](\w+)['"`]/, format: (m) => `--skills-location=${m[1]}` },
    { pattern: /contentMode:\s*['"`](\w+)['"`]/, format: (m) => `--content-mode=${m[1]}` },
    { pattern: /format:\s*['"`](\w+)['"`]/, format: (m) => `--format=${m[1]}` },
    { pattern: /category:\s*['"`](\w+)['"`]/, format: (m) => `--category=${m[1]}` },
    { pattern: /type:\s*['"`](\w+)['"`]/, format: (m) => `--type=${m[1]}` },
    { pattern: /\byes:\s*true/, format: () => '--yes' },
    { pattern: /\boffline:\s*true/, format: () => '--offline' },
    { pattern: /\bsummary:\s*true/, format: () => '--summary' },
    { pattern: /\bdiff:\s*true/, format: () => '--diff' },
    { pattern: /\brestore:\s*true/, format: () => '--restore' },
    { pattern: /\bmigrate:\s*true/, format: () => '--migrate' },
    { pattern: /\bintegrationsOnly:\s*true/, format: () => '--integrations-only' },
    { pattern: /\bstandardsOnly:\s*true/, format: () => '--standards-only' },
    { pattern: /\bsyncRefs:\s*true/, format: () => '--sync-refs' },
    { pattern: /\bskills:\s*true/, format: () => '--skills' },
    { pattern: /\bcommands:\s*true/, format: () => '--commands' },
    { pattern: /\bhelp:\s*true/, format: () => '--help' },
    { pattern: /\bexperimental:\s*true/, format: () => '-E' },
    { pattern: /\bnoInteractive:\s*true/, format: () => '--no-interactive' }
  ];

  for (const { pattern, format } of optionDefs) {
    const match = testContent.match(pattern);
    if (match) {
      options.push(format(match));
    }
  }

  return options.length > 0 ? options.join(' ') : null;
}

/**
 * Generate markdown content
 */
function generateMarkdown(parsedFiles) {
  const totalTests = parsedFiles.reduce((sum, f) => sum + f.totalTests, 0);
  const timestamp = new Date().toISOString().split('T')[0];

  let md = `# UDS CLI E2E 測試案例規格

> **自動生成文件** - 由 \`npm run generate:e2e-spec\` 從測試程式碼生成
>
> 最後更新: ${timestamp} | 總測試數: ${totalTests}

此文件記錄 UDS CLI 的端對端（E2E）測試案例，作為測試的永久規格文件與程式碼審查依據。

## 總覽

### 測試統計

| 指令 | 測試數量 | 檔案 |
|------|----------|------|
`;

  for (const file of parsedFiles) {
    md += `| \`uds ${file.command}\` | ${file.totalTests} | \`e2e/${file.fileName}\` |\n`;
  }
  md += `| **總計** | **${totalTests}** | |\n`;

  md += `
---

## 測試案例詳情

`;

  for (const file of parsedFiles) {
    md += `### uds ${file.command}（${file.totalTests} tests）\n\n`;

    for (const section of file.sections) {
      // Translate section name
      md += `#### ${translate(section.name, 'sections')}（${section.tests.length} test${section.tests.length > 1 ? 's' : ''}）\n\n`;

      // Check if any test has options or expected results
      const hasOptions = section.tests.some(t => t.options);
      const hasExpected = section.tests.some(t => getExpected(t.name));

      if (hasOptions && hasExpected) {
        md += '| # | 測試案例 | 選項 | 預期結果 |\n';
        md += '|---|----------|------|----------|\n';
        section.tests.forEach((test, i) => {
          const options = test.options || '-';
          const expected = getExpected(test.name) || '-';
          md += `| ${i + 1} | ${translate(test.name, 'tests')} | \`${options}\` | ${expected} |\n`;
        });
      } else if (hasOptions) {
        md += '| # | 測試案例 | 選項 |\n';
        md += '|---|----------|------|\n';
        section.tests.forEach((test, i) => {
          const options = test.options || '-';
          md += `| ${i + 1} | ${translate(test.name, 'tests')} | \`${options}\` |\n`;
        });
      } else if (hasExpected) {
        md += '| # | 測試案例 | 預期結果 |\n';
        md += '|---|----------|----------|\n';
        section.tests.forEach((test, i) => {
          const expected = getExpected(test.name) || '-';
          md += `| ${i + 1} | ${translate(test.name, 'tests')} | ${expected} |\n`;
        });
      } else {
        md += '| # | 測試案例 |\n';
        md += '|---|----------|\n';
        section.tests.forEach((test, i) => {
          md += `| ${i + 1} | ${translate(test.name, 'tests')} |\n`;
        });
      }
      md += '\n';
    }
    md += '---\n\n';
  }

  // Add option coverage matrix
  md += generateOptionMatrix(parsedFiles);

  // Add maintenance section
  md += `
## 維護指引

### 自動同步機制

此文件由腳本自動生成，確保與測試程式碼同步：

\`\`\`bash
# 重新生成規格文件
npm run generate:e2e-spec

# 檢查規格文件是否最新（用於 CI）
npm run generate:e2e-spec -- --check
\`\`\`

### 新增測試時

1. 在對應的 \`e2e/*-flow.test.js\` 檔案中新增測試
2. 執行 \`npm run generate:e2e-spec\` 更新此文件
3. 提交測試程式碼與更新後的規格文件

### 測試檔案結構

\`\`\`
cli/tests/
├── e2e/
│   ├── init-flow.test.js
│   ├── config-flow.test.js
│   ├── check-flow.test.js
│   ├── update-flow.test.js
│   ├── list-flow.test.js
│   └── skills-flow.test.js
├── fixtures/
│   └── *-scenarios/
│       └── expected-messages.json
└── E2E-TEST-CASES.md  ← 本文件（自動生成）
\`\`\`
`;

  return md;
}

/**
 * Generate option coverage matrix
 */
function generateOptionMatrix(parsedFiles) {
  let md = `## 選項覆蓋矩陣

`;

  // Define known options per command
  const commandOptions = {
    init: ['--yes', '--level', '--skills-location', '--content-mode', '--format', '--locale'],
    config: ['--type', '--yes', '--help', '-E'],
    check: ['--summary', '--diff', '--restore', '--migrate', '--offline', '--help', '--no-interactive'],
    update: ['--yes', '--integrations-only', '--standards-only', '--sync-refs', '--skills', '--commands', '--offline', '--help'],
    list: ['--level', '--category', '--help'],
    skills: ['--help']
  };

  for (const file of parsedFiles) {
    const knownOptions = commandOptions[file.command] || [];
    if (knownOptions.length === 0) continue;

    md += `### uds ${file.command}\n\n`;
    md += '| 選項 | 有測試 | 測試案例 |\n';
    md += '|------|--------|----------|\n';

    // Collect all tested options
    const testedOptions = new Map();
    for (const section of file.sections) {
      for (const test of section.tests) {
        if (test.options) {
          const opts = test.options.split(' ');
          for (const opt of opts) {
            const optName = opt.split('=')[0];
            if (!testedOptions.has(optName)) {
              testedOptions.set(optName, []);
            }
            testedOptions.get(optName).push(test.name);
          }
        }
      }
    }

    for (const opt of knownOptions) {
      const tests = testedOptions.get(opt);
      if (tests && tests.length > 0) {
        const testName = tests[0].length > 40 ? tests[0].substring(0, 37) + '...' : tests[0];
        md += `| \`${opt}\` | ✅ | ${testName} |\n`;
      } else {
        md += `| \`${opt}\` | ❌ | 待新增 |\n`;
      }
    }
    md += '\n';
  }

  return md;
}

/**
 * Main function
 */
async function main() {
  const isCheck = process.argv.includes('--check');

  // Read all test files
  const files = await readdir(E2E_DIR);
  const testFiles = files
    .filter(f => f.endsWith('.test.js'))
    .sort((a, b) => {
      // Sort by command priority
      const order = ['init', 'config', 'check', 'update', 'list', 'skills'];
      const aCmd = a.replace('-flow.test.js', '');
      const bCmd = b.replace('-flow.test.js', '');
      return order.indexOf(aCmd) - order.indexOf(bCmd);
    });

  // Parse all files
  const parsedFiles = [];
  for (const file of testFiles) {
    const parsed = await parseTestFile(join(E2E_DIR, file));
    parsedFiles.push(parsed);
  }

  // Generate markdown
  const newContent = generateMarkdown(parsedFiles);

  if (isCheck) {
    // Check mode: verify content matches
    try {
      const existingContent = await readFile(OUTPUT_FILE, 'utf8');
      // Compare ignoring the date line
      const normalizeForCompare = (s) => s.replace(/最後更新: \d{4}-\d{2}-\d{2}/, '最後更新: DATE');

      if (normalizeForCompare(existingContent) !== normalizeForCompare(newContent)) {
        console.error('❌ E2E-TEST-CASES.md is out of date!');
        console.error('   Run `npm run generate:e2e-spec` to update.');
        process.exit(1);
      }
      console.log('✅ E2E-TEST-CASES.md is up to date.');
    } catch (err) {
      console.error('❌ E2E-TEST-CASES.md does not exist!');
      console.error('   Run `npm run generate:e2e-spec` to generate.');
      process.exit(1);
    }
  } else {
    // Generate mode: write file
    await writeFile(OUTPUT_FILE, newContent);

    // Count stats
    const totalTests = parsedFiles.reduce((sum, f) => sum + f.totalTests, 0);
    const totalCommands = parsedFiles.length;

    console.log('✅ Generated E2E-TEST-CASES.md');
    console.log(`   Commands: ${totalCommands}`);
    console.log(`   Total tests: ${totalTests}`);
    console.log(`   Output: ${OUTPUT_FILE}`);
  }
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
