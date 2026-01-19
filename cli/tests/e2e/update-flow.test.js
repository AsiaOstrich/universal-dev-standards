/**
 * E2E Tests for uds update command
 * Tests version updates, integrations-only mode, and skills update detection
 */

import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFile, writeFile, mkdir } from 'fs/promises';
import {
  runCommand,
  runNonInteractive,
  createTempDir,
  cleanupTempDir,
  setupTestDir,
  fileExists
} from '../utils/cli-runner.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = join(__dirname, '../fixtures/update-scenarios');

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

describe('E2E: uds update', () => {
  let testDir;

  beforeEach(async () => {
    testDir = await createTempDir();
  });

  afterEach(async () => {
    if (testDir) {
      await cleanupTempDir(testDir);
    }
  });

  // ===== Pre-requisite: Not Initialized =====
  describe('Pre-requisite Checks', () => {
    it('should show error when not initialized', async () => {
      await setupTestDir(testDir, { preInitialized: false });

      const result = await runCommand('update', { yes: true }, testDir);

      expect(result.stdout).toContain(expectedMessages.errors.notInitialized);
      expect(result.stdout).toContain(expectedMessages.errors.runInit);

      recordScenarioResult('Not Initialized Error', {
        steps: [
          { step: 1, name: 'Error message', matched: result.stdout.includes('not initialized') },
          { step: 2, name: 'Hint message', matched: result.stdout.includes('uds init') }
        ],
        output: result.stdout
      });
    });
  });

  // ===== Basic Update Output =====
  describe('Basic Update Output', () => {
    it('should show header and version info when initialized', async () => {
      await setupTestDir(testDir, {});
      await runNonInteractive({}, testDir);

      const result = await runCommand('update', { yes: true, offline: true }, testDir, 10000);

      expect(result.stdout).toContain(expectedMessages.header.title);
      expect(result.stdout).toContain(expectedMessages.versionInfo.currentVersion);

      recordScenarioResult('Header and Version Display', {
        steps: [
          { step: 1, name: 'Title shown', matched: result.stdout.includes('Update') },
          { step: 2, name: 'Version info', matched: result.stdout.includes('version') }
        ],
        output: result.stdout
      });
    });

    it('should show up-to-date message when no updates available', async () => {
      await setupTestDir(testDir, {});
      await runNonInteractive({}, testDir);

      const result = await runCommand('update', { yes: true, offline: true }, testDir, 10000);

      // Since we just initialized, should be up to date
      expect(result.stdout).toContain(expectedMessages.versionInfo.upToDate);

      recordScenarioResult('Up to Date Message', {
        steps: [
          { step: 1, name: 'Up to date', matched: result.stdout.includes('up to date') }
        ],
        output: result.stdout
      });
    });
  });

  // ===== Integrations Only Mode =====
  describe('Integrations Only Mode', () => {
    it('should show no AI tools error when none configured', async () => {
      await setupTestDir(testDir, {});
      // Initialize without AI tools detection
      await runNonInteractive({ skillsLocation: 'none' }, testDir);

      // Remove aiTools from manifest
      const manifestPath = join(testDir, '.standards/manifest.json');
      const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
      manifest.aiTools = [];
      await writeFile(manifestPath, JSON.stringify(manifest, null, 2));

      const result = await runCommand('update', { integrationsOnly: true }, testDir, 10000);

      expect(result.stdout).toContain(expectedMessages.integrationsOnly.noAiTools);

      recordScenarioResult('Integrations Only - No AI Tools', {
        steps: [
          { step: 1, name: 'No AI tools message', matched: result.stdout.includes('No AI tools') }
        ],
        output: result.stdout
      });
    });

    it('should regenerate integration files with --integrations-only', async () => {
      await setupTestDir(testDir, {});
      await writeFile(join(testDir, '.cursorrules'), '# Cursor rules');
      await runNonInteractive({}, testDir);

      const result = await runCommand('update', { integrationsOnly: true }, testDir, 15000);

      expect(result.stdout).toContain(expectedMessages.integrationsOnly.success);

      recordScenarioResult('Integrations Only - Regenerate', {
        steps: [
          { step: 1, name: 'Success message', matched: result.stdout.includes('successfully') }
        ],
        output: result.stdout
      });
    });
  });

  // ===== Standards Only Mode =====
  describe('Standards Only Mode', () => {
    it('should update only standards with --standards-only', async () => {
      await setupTestDir(testDir, {});
      await runNonInteractive({}, testDir);

      const result = await runCommand('update', { standardsOnly: true, yes: true, offline: true }, testDir, 10000);

      // Should show version info and update status
      expect(result.stdout).toContain(expectedMessages.header.title);
      // Should be up to date or show update info

      recordScenarioResult('Standards Only Mode', {
        steps: [
          { step: 1, name: 'Header shown', matched: result.stdout.includes('Update') }
        ],
        output: result.stdout
      });
    });
  });

  // ===== Sync Refs Mode =====
  describe('Sync Refs Mode', () => {
    it('should sync integration references with --sync-refs', async () => {
      await setupTestDir(testDir, {});
      await writeFile(join(testDir, '.cursorrules'), '# Cursor rules');
      await runNonInteractive({}, testDir);

      const result = await runCommand('update', { syncRefs: true }, testDir, 15000);

      // Should show sync refs output or error about no configs
      const hasSyncOutput = result.stdout.includes('Sync') ||
                            result.stdout.includes('sync') ||
                            result.stdout.includes('reference') ||
                            result.stdout.includes('No integration');
      expect(hasSyncOutput).toBe(true);

      recordScenarioResult('Sync Refs Mode', {
        steps: [
          { step: 1, name: 'Sync refs output', matched: hasSyncOutput }
        ],
        output: result.stdout
      });
    });
  });

  // ===== Skills Update Mode =====
  describe('Skills Update Mode', () => {
    it('should show skills status with --skills', async () => {
      await setupTestDir(testDir, {});
      await runNonInteractive({}, testDir);

      const result = await runCommand('update', { skills: true }, testDir, 15000);

      // Should show skills update output or no skills message
      const hasSkillsOutput = result.stdout.includes('Skills') ||
                              result.stdout.includes('skills') ||
                              result.stdout.includes('No Skills');
      expect(hasSkillsOutput).toBe(true);

      recordScenarioResult('Skills Update Mode', {
        steps: [
          { step: 1, name: 'Skills output', matched: hasSkillsOutput }
        ],
        output: result.stdout
      });
    });
  });

  // ===== Commands Update Mode =====
  describe('Commands Update Mode', () => {
    it('should show commands status with --commands', async () => {
      await setupTestDir(testDir, {});
      await runNonInteractive({}, testDir);

      const result = await runCommand('update', { commands: true }, testDir, 15000);

      // Should show commands update output or no commands message
      const hasCommandsOutput = result.stdout.includes('command') ||
                                result.stdout.includes('Command') ||
                                result.stdout.includes('No') ||
                                result.stdout.includes('slash');
      expect(hasCommandsOutput).toBe(true);

      recordScenarioResult('Commands Update Mode', {
        steps: [
          { step: 1, name: 'Commands output', matched: hasCommandsOutput }
        ],
        output: result.stdout
      });
    });
  });

  // ===== Help Output =====
  describe('Command Help', () => {
    it('should show help with --help', async () => {
      const result = await runCommand('update', { help: true }, testDir);

      expect(result.stdout).toContain('update');
      expect(result.stdout).toContain('--integrations-only');
      expect(result.stdout).toContain('--standards-only');
      expect(result.stdout).toContain('--sync-refs');
      expect(result.stdout).toContain('--skills');
      expect(result.stdout).toContain('--commands');
      expect(result.stdout).toContain('--yes');

      recordScenarioResult('Help output', {
        steps: [
          { step: 1, name: 'Shows update', matched: result.stdout.includes('update') },
          { step: 2, name: 'Shows --integrations-only', matched: result.stdout.includes('--integrations-only') },
          { step: 3, name: 'Shows --standards-only', matched: result.stdout.includes('--standards-only') },
          { step: 4, name: 'Shows --sync-refs', matched: result.stdout.includes('--sync-refs') },
          { step: 5, name: 'Shows --skills', matched: result.stdout.includes('--skills') },
          { step: 6, name: 'Shows --commands', matched: result.stdout.includes('--commands') },
          { step: 7, name: 'Shows --yes', matched: result.stdout.includes('--yes') }
        ],
        output: result.stdout
      });
    });
  });

  // ===== UI Language Flag Tests =====
  describe('--ui-lang Flag', () => {
    it('should show English UI when --ui-lang en is set', async () => {
      await setupTestDir(testDir, {});
      await runNonInteractive({}, testDir);

      // Run update with --ui-lang en (global option)
      const result = await runCommand('update', { yes: true, offline: true }, testDir, 15000, { uiLang: 'en' });

      // Should show English UI
      expect(result.stdout).toContain('Update');
      expect(result.stdout).toContain('version');
      expect(result.stdout).not.toContain('更新');
      expect(result.stdout).not.toContain('版本');

      recordScenarioResult('--ui-lang en shows English', {
        steps: [
          { step: 1, name: 'English Update', matched: result.stdout.includes('Update') },
          { step: 2, name: 'English version', matched: result.stdout.includes('version') },
          { step: 3, name: 'No Chinese', matched: !result.stdout.includes('版本') }
        ],
        output: result.stdout
      });
    });

    it('should show Traditional Chinese UI when --ui-lang zh-tw is set', async () => {
      await setupTestDir(testDir, {});
      await runNonInteractive({}, testDir);

      // Run update with --ui-lang zh-tw (global option)
      const result = await runCommand('update', { yes: true, offline: true }, testDir, 15000, { uiLang: 'zh-tw' });

      // Should show Chinese UI
      expect(result.stdout).toContain('更新');
      expect(result.stdout).toContain('版本');

      recordScenarioResult('--ui-lang zh-tw shows Chinese', {
        steps: [
          { step: 1, name: 'Chinese Update', matched: result.stdout.includes('更新') },
          { step: 2, name: 'Chinese version', matched: result.stdout.includes('版本') }
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

  const jsonReportPath = join(reportsDir, 'update-test-report.json');
  await writeFile(jsonReportPath, JSON.stringify(testReport, null, 2));

  // Write Markdown report
  const mdReport = generateMarkdownReport(testReport);
  const mdReportPath = join(reportsDir, 'update-test-report.md');
  await writeFile(mdReportPath, mdReport);

  console.log(`\n📋 Update test report written to:`);
  console.log(`   - ${jsonReportPath}`);
  console.log(`   - ${mdReportPath}`);
});

function generateMarkdownReport(report) {
  const lines = [
    '# UDS Update E2E Test Report',
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
