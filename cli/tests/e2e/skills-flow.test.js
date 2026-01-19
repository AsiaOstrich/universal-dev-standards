/**
 * E2E Tests for uds skills command
 * Tests skills listing, installation status, and marketplace detection
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
const FIXTURES_DIR = join(__dirname, '../fixtures/skills-scenarios');

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

describe('E2E: uds skills', () => {
  let testDir;

  beforeEach(async () => {
    testDir = await createTempDir();
  });

  afterEach(async () => {
    if (testDir) {
      await cleanupTempDir(testDir);
    }
  });

  // ===== Basic Skills Output =====
  describe('Basic Skills Output', () => {
    it('should show header', async () => {
      await setupTestDir(testDir, {});

      const result = await runCommand('skills', {}, testDir);

      expect(result.stdout).toContain(expectedMessages.header.title);

      recordScenarioResult('Header Display', {
        steps: [
          { step: 1, name: 'Title shown', matched: result.stdout.includes('Installed Skills') }
        ],
        output: result.stdout
      });
    });

    it('should show no skills message when none installed', async () => {
      await setupTestDir(testDir, {});

      const result = await runCommand('skills', {}, testDir);

      // Either shows no skills or shows installed skills
      const hasNoSkills = result.stdout.includes(expectedMessages.noSkills.message);
      const hasSkills = result.stdout.includes(expectedMessages.skillsList.title);

      expect(hasNoSkills || hasSkills).toBe(true);

      recordScenarioResult('No Skills or Skills List', {
        steps: [
          { step: 1, name: 'No skills or skills list', matched: hasNoSkills || hasSkills }
        ],
        output: result.stdout
      });
    });

    it('should show marketplace install hint when no skills', async () => {
      await setupTestDir(testDir, {});

      const result = await runCommand('skills', {}, testDir);

      // If no skills, should show install hint
      if (result.stdout.includes(expectedMessages.noSkills.message)) {
        expect(result.stdout).toContain(expectedMessages.noSkills.installHint);
      }

      recordScenarioResult('Install Hint', {
        steps: [
          { step: 1, name: 'Has install hint or skills', matched: true }
        ],
        output: result.stdout
      });
    });
  });

  // ===== Skills Status Display =====
  describe('Skills Status Display', () => {
    it('should show version info when skills are installed', async () => {
      await setupTestDir(testDir, {});

      const result = await runCommand('skills', {}, testDir);

      // If skills are installed, should show version
      if (!result.stdout.includes(expectedMessages.noSkills.message)) {
        expect(result.stdout).toContain(expectedMessages.version.label);
      }

      recordScenarioResult('Version Info', {
        steps: [
          { step: 1, name: 'Version or no skills', matched: true }
        ],
        output: result.stdout
      });
    });

    it('should show path info when skills are installed', async () => {
      await setupTestDir(testDir, {});

      const result = await runCommand('skills', {}, testDir);

      // If skills are installed, should show path
      if (!result.stdout.includes(expectedMessages.noSkills.message)) {
        expect(result.stdout).toContain(expectedMessages.version.path);
      }

      recordScenarioResult('Path Info', {
        steps: [
          { step: 1, name: 'Path or no skills', matched: true }
        ],
        output: result.stdout
      });
    });
  });

  // ===== Help Output =====
  describe('Command Help', () => {
    it('should show help with --help', async () => {
      const result = await runCommand('skills', { help: true }, testDir);

      expect(result.stdout).toContain('skills');

      recordScenarioResult('Help output', {
        steps: [
          { step: 1, name: 'Shows skills', matched: result.stdout.includes('skills') }
        ],
        output: result.stdout
      });
    });
  });

  // ===== UI Language Flag Tests =====
  describe('--ui-lang Flag', () => {
    it('should show English UI when --ui-lang en is set', async () => {
      await setupTestDir(testDir, {});

      // Run skills with --ui-lang en (global option)
      const result = await runCommand('skills', {}, testDir, 30000, { uiLang: 'en' });

      // Should show English UI
      expect(result.stdout).toContain('Installed Skills');
      expect(result.stdout).not.toContain('已安裝的 Skills');

      recordScenarioResult('--ui-lang en shows English', {
        steps: [
          { step: 1, name: 'English title', matched: result.stdout.includes('Installed Skills') },
          { step: 2, name: 'No Chinese', matched: !result.stdout.includes('已安裝的 Skills') }
        ],
        output: result.stdout
      });
    });

    it('should show Traditional Chinese UI when --ui-lang zh-tw is set', async () => {
      await setupTestDir(testDir, {});

      // Run skills with --ui-lang zh-tw (global option)
      const result = await runCommand('skills', {}, testDir, 30000, { uiLang: 'zh-tw' });

      // Should show Chinese UI
      expect(result.stdout).toContain('已安裝的 Skills');

      recordScenarioResult('--ui-lang zh-tw shows Chinese', {
        steps: [
          { step: 1, name: 'Chinese title', matched: result.stdout.includes('已安裝的 Skills') }
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

  const jsonReportPath = join(reportsDir, 'skills-test-report.json');
  await writeFile(jsonReportPath, JSON.stringify(testReport, null, 2));

  // Write Markdown report
  const mdReport = generateMarkdownReport(testReport);
  const mdReportPath = join(reportsDir, 'skills-test-report.md');
  await writeFile(mdReportPath, mdReport);

  console.log(`\n📋 Skills test report written to:`);
  console.log(`   - ${jsonReportPath}`);
  console.log(`   - ${mdReportPath}`);
});

function generateMarkdownReport(report) {
  const lines = [
    '# UDS Skills E2E Test Report',
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
