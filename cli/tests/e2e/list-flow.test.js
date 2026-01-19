/**
 * E2E Tests for uds list command
 * Tests standards listing, filtering by level/category, and output format
 */

import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFile, writeFile, mkdir } from 'fs/promises';
import {
  runCommand,
  createTempDir,
  cleanupTempDir,
  setupTestDir
} from '../utils/cli-runner.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = join(__dirname, '../fixtures/list-scenarios');

// Test report accumulator
const testReport = {
  timestamp: new Date().toISOString(),
  scenarios: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0
  }
};

// Load expected messages
let expectedMessages = {};
beforeAll(async () => {
  const messagesPath = join(FIXTURES_DIR, 'expected-messages.json');
  const content = await readFile(messagesPath, 'utf8');
  expectedMessages = JSON.parse(content).messages;
});

describe('E2E: uds list', () => {
  let testDir;

  beforeEach(async () => {
    testDir = await createTempDir();
  });

  afterEach(async () => {
    if (testDir) {
      await cleanupTempDir(testDir);
    }
  });

  // ===== Basic List Output =====
  describe('Basic List Output', () => {
    it('should show header and version', async () => {
      await setupTestDir(testDir, {});

      const result = await runCommand('list', {}, testDir);

      expect(result.stdout).toContain(expectedMessages.header.title);
      expect(result.stdout).toContain(expectedMessages.version.label);

      recordScenarioResult('Header and Version Display', {
        steps: [
          { step: 1, name: 'Title shown', matched: result.stdout.includes('Universal Development Standards') },
          { step: 2, name: 'Version shown', matched: result.stdout.includes('Version') }
        ],
        output: result.stdout
      });
    });

    it('should show standards categories', async () => {
      await setupTestDir(testDir, {});

      const result = await runCommand('list', {}, testDir);

      // Should show category headers
      expect(result.stdout).toContain(expectedMessages.categories.skill);
      expect(result.stdout).toContain(expectedMessages.categories.reference);

      recordScenarioResult('Categories Display', {
        steps: [
          { step: 1, name: 'Skill category', matched: result.stdout.includes('Skill') },
          { step: 2, name: 'Reference category', matched: result.stdout.includes('Reference') }
        ],
        output: result.stdout
      });
    });

    it('should show summary at bottom', async () => {
      await setupTestDir(testDir, {});

      const result = await runCommand('list', {}, testDir);

      expect(result.stdout).toContain(expectedMessages.summary.total);
      expect(result.stdout).toContain(expectedMessages.summary.standards);

      recordScenarioResult('Summary Display', {
        steps: [
          { step: 1, name: 'Total shown', matched: result.stdout.includes('Total') },
          { step: 2, name: 'Standards label', matched: result.stdout.includes('standards') }
        ],
        output: result.stdout
      });
    });

    it('should show init hint at bottom', async () => {
      await setupTestDir(testDir, {});

      const result = await runCommand('list', {}, testDir);

      expect(result.stdout).toContain(expectedMessages.hints.runInit);

      recordScenarioResult('Init Hint Display', {
        steps: [
          { step: 1, name: 'Init hint', matched: result.stdout.includes('uds init') }
        ],
        output: result.stdout
      });
    });
  });

  // ===== Level Filtering =====
  describe('Level Filtering', () => {
    it('should filter by level 1', async () => {
      await setupTestDir(testDir, {});

      const result = await runCommand('list', { level: '1' }, testDir);

      expect(result.stdout).toContain(expectedMessages.filters.showingLevel);
      expect(result.stdout).toContain('1');

      recordScenarioResult('Level 1 Filter', {
        steps: [
          { step: 1, name: 'Showing Level', matched: result.stdout.includes('Showing Level') },
          { step: 2, name: 'Level 1', matched: result.stdout.includes('1') }
        ],
        output: result.stdout
      });
    });

    it('should filter by level 2', async () => {
      await setupTestDir(testDir, {});

      const result = await runCommand('list', { level: '2' }, testDir);

      expect(result.stdout).toContain(expectedMessages.filters.showingLevel);
      expect(result.stdout).toContain('2');

      recordScenarioResult('Level 2 Filter', {
        steps: [
          { step: 1, name: 'Showing Level', matched: result.stdout.includes('Showing Level') },
          { step: 2, name: 'Level 2', matched: result.stdout.includes('2') }
        ],
        output: result.stdout
      });
    });

    it('should show error for invalid level', async () => {
      await setupTestDir(testDir, {});

      const result = await runCommand('list', { level: '5' }, testDir);

      expect(result.stdout).toContain(expectedMessages.errors.levelRange);

      recordScenarioResult('Invalid Level Error', {
        steps: [
          { step: 1, name: 'Level range error', matched: result.stdout.includes('Level must be') }
        ],
        output: result.stdout
      });
    });
  });

  // ===== Category Filtering =====
  describe('Category Filtering', () => {
    it('should filter by skill category', async () => {
      await setupTestDir(testDir, {});

      const result = await runCommand('list', { category: 'skill' }, testDir);

      expect(result.stdout).toContain('Category');
      expect(result.stdout).toContain('Skill');

      recordScenarioResult('Skill Category Filter', {
        steps: [
          { step: 1, name: 'Category label', matched: result.stdout.includes('Category') },
          { step: 2, name: 'Skill shown', matched: result.stdout.includes('Skill') }
        ],
        output: result.stdout
      });
    });

    it('should filter by reference category', async () => {
      await setupTestDir(testDir, {});

      const result = await runCommand('list', { category: 'reference' }, testDir);

      expect(result.stdout).toContain('Category');
      expect(result.stdout).toContain('Reference');

      recordScenarioResult('Reference Category Filter', {
        steps: [
          { step: 1, name: 'Category label', matched: result.stdout.includes('Category') },
          { step: 2, name: 'Reference shown', matched: result.stdout.includes('Reference') }
        ],
        output: result.stdout
      });
    });

    it('should show error for invalid category', async () => {
      await setupTestDir(testDir, {});

      const result = await runCommand('list', { category: 'invalid' }, testDir);

      expect(result.stdout).toContain(expectedMessages.errors.unknownCategory);

      recordScenarioResult('Invalid Category Error', {
        steps: [
          { step: 1, name: 'Unknown category error', matched: result.stdout.includes('Unknown category') }
        ],
        output: result.stdout
      });
    });
  });

  // ===== Help Output =====
  describe('Command Help', () => {
    it('should show help with --help', async () => {
      const result = await runCommand('list', { help: true }, testDir);

      expect(result.stdout).toContain('list');
      expect(result.stdout).toContain('--level');
      expect(result.stdout).toContain('--category');

      recordScenarioResult('Help output', {
        steps: [
          { step: 1, name: 'Shows list', matched: result.stdout.includes('list') },
          { step: 2, name: 'Shows --level', matched: result.stdout.includes('--level') },
          { step: 3, name: 'Shows --category', matched: result.stdout.includes('--category') }
        ],
        output: result.stdout
      });
    });
  });

  // ===== UI Language Flag Tests =====
  describe('--ui-lang Flag', () => {
    it('should show English UI when --ui-lang en is set', async () => {
      await setupTestDir(testDir, {});

      // Run list with --ui-lang en (global option)
      const result = await runCommand('list', {}, testDir, 30000, { uiLang: 'en' });

      // Should show English UI
      expect(result.stdout).toContain('Universal Development Standards');
      expect(result.stdout).toContain('Version');
      expect(result.stdout).toContain('Total');
      expect(result.stdout).not.toContain('通用開發標準');
      expect(result.stdout).not.toContain('版本');

      recordScenarioResult('--ui-lang en shows English', {
        steps: [
          { step: 1, name: 'English title', matched: result.stdout.includes('Universal Development Standards') },
          { step: 2, name: 'English Version label', matched: result.stdout.includes('Version') },
          { step: 3, name: 'No Chinese title', matched: !result.stdout.includes('通用開發標準') }
        ],
        output: result.stdout
      });
    });

    it('should show Traditional Chinese UI when --ui-lang zh-tw is set', async () => {
      await setupTestDir(testDir, {});

      // Run list with --ui-lang zh-tw (global option)
      const result = await runCommand('list', {}, testDir, 30000, { uiLang: 'zh-tw' });

      // Should show Chinese UI
      expect(result.stdout).toContain('通用開發標準');
      expect(result.stdout).toContain('版本');

      recordScenarioResult('--ui-lang zh-tw shows Chinese', {
        steps: [
          { step: 1, name: 'Chinese title', matched: result.stdout.includes('通用開發標準') },
          { step: 2, name: 'Chinese Version label', matched: result.stdout.includes('版本') }
        ],
        output: result.stdout
      });
    });

    it('should show Simplified Chinese UI when --ui-lang zh-cn is set', async () => {
      await setupTestDir(testDir, {});

      // Run list with --ui-lang zh-cn (global option)
      const result = await runCommand('list', {}, testDir, 30000, { uiLang: 'zh-cn' });

      // Should show Simplified Chinese UI
      expect(result.stdout).toContain('通用开发标准');
      expect(result.stdout).toContain('版本');

      recordScenarioResult('--ui-lang zh-cn shows Simplified Chinese', {
        steps: [
          { step: 1, name: 'Simplified Chinese title', matched: result.stdout.includes('通用开发标准') },
          { step: 2, name: 'Chinese Version label', matched: result.stdout.includes('版本') }
        ],
        output: result.stdout
      });
    });
  });
});

// ===== Report Generation =====

function recordScenarioResult(name, data) {
  testReport.summary.total++;
  const allPassed = data.steps.every(s => s.matched);

  if (allPassed) {
    testReport.summary.passed++;
  } else {
    testReport.summary.failed++;
  }

  testReport.scenarios.push({
    name,
    status: allPassed ? 'passed' : 'failed',
    steps: data.steps,
    output: data.output || ''
  });
}

export { testReport };

afterAll(async () => {
  // Write JSON report
  const reportsDir = join(__dirname, '../reports');
  await mkdir(reportsDir, { recursive: true });

  const jsonReportPath = join(reportsDir, 'list-test-report.json');
  await writeFile(jsonReportPath, JSON.stringify(testReport, null, 2));

  // Write Markdown report
  const mdReport = generateMarkdownReport(testReport);
  const mdReportPath = join(reportsDir, 'list-test-report.md');
  await writeFile(mdReportPath, mdReport);

  console.log(`\n📋 List test report written to:`);
  console.log(`   - ${jsonReportPath}`);
  console.log(`   - ${mdReportPath}`);
});

function generateMarkdownReport(report) {
  const lines = [
    '# UDS List E2E Test Report',
    '',
    `**Generated**: ${report.timestamp}`,
    '',
    '## Summary',
    '',
    '| Metric | Result |',
    '|--------|--------|',
    `| Total Scenarios | ${report.summary.total} |`,
    `| Passed | ${report.summary.passed} |`,
    `| Failed | ${report.summary.failed} |`,
    '',
    '## Scenario Results',
    ''
  ];

  for (const scenario of report.scenarios) {
    const icon = scenario.status === 'passed' ? '✅' : '❌';
    lines.push(`### ${icon} ${scenario.name}`);
    lines.push('');
    lines.push('| Step | Name | Result |');
    lines.push('|------|------|--------|');

    for (const step of scenario.steps) {
      const stepIcon = step.matched ? '✅' : '❌';
      lines.push(`| ${step.step} | ${step.name} | ${stepIcon} |`);
    }

    lines.push('');

    if (scenario.output) {
      lines.push('<details>');
      lines.push('<summary><strong>Output</strong></summary>');
      lines.push('');
      lines.push('```');
      lines.push(scenario.output.trim().substring(0, 2000));
      lines.push('```');
      lines.push('</details>');
      lines.push('');
    }
  }

  return lines.join('\n');
}
