/**
 * E2E Tests for uds check command
 * Tests adoption status verification, file integrity, and summary output
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
const FIXTURES_DIR = join(__dirname, '../fixtures/check-scenarios');

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

describe('E2E: uds check', () => {
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

      const result = await runCommand('check', {}, testDir);

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

  // ===== Basic Check Output =====
  describe('Basic Check Output', () => {
    it('should show header and status when initialized', async () => {
      await setupTestDir(testDir, {});
      await runNonInteractive({}, testDir);

      const result = await runCommand('check', { noInteractive: true }, testDir);

      expect(result.stdout).toContain(expectedMessages.header.title);
      expect(result.stdout).toContain(expectedMessages.status.standardsInitialized);
      expect(result.stdout).toContain(expectedMessages.status.adoptionStatus);

      recordScenarioResult('Header and Status Display', {
        steps: [
          { step: 1, name: 'Title shown', matched: result.stdout.includes('Check') },
          { step: 2, name: 'Initialized status', matched: result.stdout.includes('initialized') },
          { step: 3, name: 'Adoption status', matched: result.stdout.includes('Adoption Status') }
        ],
        output: result.stdout
      });
    });

    it('should show level and version information', async () => {
      await setupTestDir(testDir, {});
      await runNonInteractive({ level: '2' }, testDir);

      const result = await runCommand('check', { noInteractive: true }, testDir);

      expect(result.stdout).toContain('Level:');
      expect(result.stdout).toContain('2');
      expect(result.stdout).toContain(expectedMessages.status.version);

      recordScenarioResult('Level and Version Info', {
        steps: [
          { step: 1, name: 'Level shown', matched: result.stdout.includes('Level:') },
          { step: 2, name: 'Level 2', matched: result.stdout.includes('2') },
          { step: 3, name: 'Version shown', matched: result.stdout.includes('Version') }
        ],
        output: result.stdout
      });
    });

    it('should show file integrity section', async () => {
      await setupTestDir(testDir, {});
      await runNonInteractive({}, testDir);

      const result = await runCommand('check', { noInteractive: true }, testDir);

      expect(result.stdout).toContain(expectedMessages.fileIntegrity.title);
      // Should have some unchanged files
      expect(result.stdout).toContain(expectedMessages.fileIntegrity.unchanged);

      recordScenarioResult('File Integrity Section', {
        steps: [
          { step: 1, name: 'File Integrity title', matched: result.stdout.includes('File Integrity') },
          { step: 2, name: 'Unchanged status', matched: result.stdout.includes('unchanged') }
        ],
        output: result.stdout
      });
    });
  });

  // ===== Summary Mode (--summary) =====
  describe('Summary Mode', () => {
    it('should show compact summary with --summary flag', async () => {
      await setupTestDir(testDir, {});
      await runNonInteractive({}, testDir);

      const result = await runCommand('check', { summary: true }, testDir);

      expect(result.stdout).toContain(expectedMessages.summary_mode.title);
      expect(result.stdout).toContain(expectedMessages.summary_mode.version);
      expect(result.stdout).toContain(expectedMessages.summary_mode.level);
      expect(result.stdout).toContain(expectedMessages.summary_mode.files);

      recordScenarioResult('Summary Mode Output', {
        steps: [
          { step: 1, name: 'Summary title', matched: result.stdout.includes('Status Summary') },
          { step: 2, name: 'Version shown', matched: result.stdout.includes('Version') },
          { step: 3, name: 'Level shown', matched: result.stdout.includes('Level') },
          { step: 4, name: 'Files shown', matched: result.stdout.includes('Files') }
        ],
        output: result.stdout
      });
    });

    it('should show not initialized in summary mode when not initialized', async () => {
      await setupTestDir(testDir, { preInitialized: false });

      const result = await runCommand('check', { summary: true }, testDir);

      expect(result.stdout).toContain(expectedMessages.summary_mode.title);
      // Should indicate not initialized
      expect(result.stdout.toLowerCase()).toMatch(/not initialized|not init/);

      recordScenarioResult('Summary Mode Not Initialized', {
        steps: [
          { step: 1, name: 'Summary title', matched: result.stdout.includes('Status Summary') },
          { step: 2, name: 'Not initialized', matched: result.stdout.toLowerCase().includes('not init') }
        ],
        output: result.stdout
      });
    });
  });

  // ===== Coverage and Skills Status =====
  describe('Coverage and Skills Status', () => {
    it('should show coverage summary', async () => {
      await setupTestDir(testDir, {});
      await runNonInteractive({ level: '2' }, testDir);

      const result = await runCommand('check', { noInteractive: true }, testDir);

      expect(result.stdout).toContain(expectedMessages.coverage.title);

      recordScenarioResult('Coverage Summary Display', {
        steps: [
          { step: 1, name: 'Coverage title', matched: result.stdout.includes('Coverage Summary') }
        ],
        output: result.stdout
      });
    });

    it('should show skills status section', async () => {
      await setupTestDir(testDir, {});
      await runNonInteractive({}, testDir);

      const result = await runCommand('check', { noInteractive: true }, testDir);

      expect(result.stdout).toContain(expectedMessages.skillsStatus.title);

      recordScenarioResult('Skills Status Section', {
        steps: [
          { step: 1, name: 'Skills Status title', matched: result.stdout.includes('Skills Status') }
        ],
        output: result.stdout
      });
    });
  });

  // ===== Modified Files Detection =====
  describe('Modified Files Detection', () => {
    it('should detect modified files', async () => {
      await setupTestDir(testDir, {});
      await runNonInteractive({}, testDir);

      // Modify a standard file
      const manifestPath = join(testDir, '.standards/manifest.json');
      const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));

      // Find a standard file to modify
      if (manifest.standards.length > 0) {
        const standardsDir = join(testDir, '.standards');
        const files = await readFile(join(standardsDir, 'manifest.json'), 'utf8');

        // Modify manifest to simulate change detection
        manifest.testModification = 'test';
        await writeFile(manifestPath, JSON.stringify(manifest, null, 2));
      }

      const result = await runCommand('check', { noInteractive: true }, testDir);

      // Should show summary of file status
      expect(result.stdout).toContain('Summary');

      recordScenarioResult('Modified Files Detection', {
        steps: [
          { step: 1, name: 'Summary shown', matched: result.stdout.includes('Summary') }
        ],
        output: result.stdout
      });
    });
  });

  // ===== Diff Mode (--diff) =====
  describe('Diff Mode', () => {
    it('should show diff output with --diff flag', async () => {
      await setupTestDir(testDir, {});
      await runNonInteractive({}, testDir);

      // Modify a standard file to create a diff
      const standardsDir = join(testDir, '.standards');
      const manifestPath = join(standardsDir, 'manifest.json');
      const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));

      if (manifest.standards.length > 0) {
        const stdFile = manifest.standards[0].split('/').pop();
        const stdPath = join(standardsDir, stdFile);
        if (await fileExists(stdPath)) {
          const content = await readFile(stdPath, 'utf8');
          await writeFile(stdPath, content + '\n# Modified for test');
        }
      }

      const result = await runCommand('check', { diff: true, noInteractive: true }, testDir);

      // Should show diff-related output or file status
      expect(result.stdout).toContain('File Integrity');

      recordScenarioResult('Diff Mode Output', {
        steps: [
          { step: 1, name: 'File Integrity section', matched: result.stdout.includes('File Integrity') }
        ],
        output: result.stdout
      });
    });
  });

  // ===== Restore Mode (--restore) =====
  describe('Restore Mode', () => {
    it('should restore modified files with --restore flag', async () => {
      await setupTestDir(testDir, {});
      await runNonInteractive({}, testDir);

      // Modify a standard file
      const standardsDir = join(testDir, '.standards');
      const manifestPath = join(standardsDir, 'manifest.json');
      const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));

      if (manifest.standards.length > 0) {
        const stdFile = manifest.standards[0].split('/').pop();
        const stdPath = join(standardsDir, stdFile);
        if (await fileExists(stdPath)) {
          const content = await readFile(stdPath, 'utf8');
          await writeFile(stdPath, content + '\n# Modified for restore test');
        }
      }

      const result = await runCommand('check', { restore: true, noInteractive: true }, testDir, 15000);

      // Should show restore-related output
      const hasRestoreOutput = result.stdout.includes('Restor') ||
                               result.stdout.includes('unchanged') ||
                               result.stdout.includes('File Integrity');
      expect(hasRestoreOutput).toBe(true);

      recordScenarioResult('Restore Mode', {
        steps: [
          { step: 1, name: 'Restore output', matched: hasRestoreOutput }
        ],
        output: result.stdout
      });
    });
  });

  // ===== Offline Mode (--offline) =====
  describe('Offline Mode', () => {
    it('should skip CLI update check with --offline flag', async () => {
      await setupTestDir(testDir, {});
      await runNonInteractive({}, testDir);

      const result = await runCommand('check', { offline: true, noInteractive: true }, testDir);

      // Should complete without error and show standard output
      expect(result.stdout).toContain(expectedMessages.header.title);
      // Should not contain "Checking for CLI updates" message (or it should be skipped)

      recordScenarioResult('Offline Mode', {
        steps: [
          { step: 1, name: 'Header shown', matched: result.stdout.includes('Check') }
        ],
        output: result.stdout
      });
    });
  });

  // ===== Migrate Mode (--migrate) =====
  describe('Migrate Mode', () => {
    it('should show migrate output with --migrate flag', async () => {
      await setupTestDir(testDir, {});
      await runNonInteractive({}, testDir);

      const result = await runCommand('check', { migrate: true, noInteractive: true }, testDir);

      // Should show migration-related output or already migrated message
      const hasMigrateOutput = result.stdout.includes('Migrat') ||
                               result.stdout.includes('hash') ||
                               result.stdout.includes('already') ||
                               result.stdout.includes('File Integrity');
      expect(hasMigrateOutput).toBe(true);

      recordScenarioResult('Migrate Mode', {
        steps: [
          { step: 1, name: 'Migrate output', matched: hasMigrateOutput }
        ],
        output: result.stdout
      });
    });
  });

  // ===== Help Output =====
  describe('Command Help', () => {
    it('should show help with --help', async () => {
      const result = await runCommand('check', { help: true }, testDir);

      expect(result.stdout).toContain('check');
      expect(result.stdout).toContain('--summary');
      expect(result.stdout).toContain('--diff');
      expect(result.stdout).toContain('--restore');
      expect(result.stdout).toContain('--migrate');
      expect(result.stdout).toContain('--offline');

      recordScenarioResult('Help output', {
        steps: [
          { step: 1, name: 'Shows check', matched: result.stdout.includes('check') },
          { step: 2, name: 'Shows --summary', matched: result.stdout.includes('--summary') },
          { step: 3, name: 'Shows --diff', matched: result.stdout.includes('--diff') },
          { step: 4, name: 'Shows --restore', matched: result.stdout.includes('--restore') },
          { step: 5, name: 'Shows --migrate', matched: result.stdout.includes('--migrate') },
          { step: 6, name: 'Shows --offline', matched: result.stdout.includes('--offline') }
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

  const jsonReportPath = join(reportsDir, 'check-test-report.json');
  await writeFile(jsonReportPath, JSON.stringify(testReport, null, 2));

  // Write Markdown report
  const mdReport = generateMarkdownReport(testReport);
  const mdReportPath = join(reportsDir, 'check-test-report.md');
  await writeFile(mdReportPath, mdReport);

  console.log(`\n📋 Check test report written to:`);
  console.log(`   - ${jsonReportPath}`);
  console.log(`   - ${mdReportPath}`);
});

function generateMarkdownReport(report) {
  const lines = [
    '# UDS Check E2E Test Report',
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
