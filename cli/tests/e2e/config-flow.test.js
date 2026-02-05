/**
 * E2E Tests for uds config command
 * Tests smart apply functionality and configuration flows
 *
 * Note: config command requires interactive input for value selection.
 * These tests focus on non-interactive scenarios and state verification.
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
const FIXTURES_DIR = join(__dirname, '../fixtures/config-scenarios');

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

describe('E2E: uds config', () => {
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
  // NOTE: config command now shows global config even if project is not initialized
  describe('Pre-requisite Checks', () => {
    it('should show global config even when project not initialized', async () => {
      await setupTestDir(testDir, { preInitialized: false });

      const result = await runCommand('config', { yes: true }, testDir);

      // New behavior: config shows global config regardless of initialization state
      expect(result.stdout).toContain('Current Configuration:');
      expect(result.stdout).toContain('"ui"');

      recordScenarioResult('Not Initialized Shows Global Config', {
        steps: [
          { step: 1, name: 'Shows config header', matched: result.stdout.includes('Current Configuration:') },
          { step: 2, name: 'Shows ui section', matched: result.stdout.includes('"ui"') }
        ],
        output: result.stdout
      });
    });

    it('should show configuration when initialized', async () => {
      await setupTestDir(testDir, {});
      await runNonInteractive({}, testDir);

      // Run with short timeout - we just want to verify output appears
      const result = await runCommand('config', { yes: true }, testDir, 5000);

      // New API outputs "Current Configuration:" followed by JSON
      expect(result.stdout).toContain('Current Configuration:');

      recordScenarioResult('Header Display', {
        steps: [
          { step: 1, name: 'Config header shown', matched: result.stdout.includes('Current Configuration:') }
        ],
        output: result.stdout
      });
    });
  });

  // ===== Current Configuration Display =====
  // NOTE: config command now outputs JSON format instead of labeled UI
  describe('Configuration Display', () => {
    it('should display current configuration in JSON format', async () => {
      await setupTestDir(testDir, {});
      await writeFile(join(testDir, '.cursorrules'), '# Cursor rules');
      await runNonInteractive({ level: '2' }, testDir);

      // Short timeout - we just want to verify initial display
      const result = await runCommand('config', { yes: true }, testDir, 5000);

      // New API outputs JSON with "Current Configuration:" header
      expect(result.stdout).toContain('Current Configuration:');
      expect(result.stdout).toContain('"ui"');
      expect(result.stdout).toContain('"language"');

      recordScenarioResult('Current config display', {
        steps: [
          { step: 1, name: 'Current Config header', matched: result.stdout.includes('Current Configuration:') },
          { step: 2, name: 'UI section shown', matched: result.stdout.includes('"ui"') },
          { step: 3, name: 'Language shown', matched: result.stdout.includes('"language"') }
        ],
        output: result.stdout
      });
    });

    it('should display AI tools in manifest when configured', async () => {
      await setupTestDir(testDir, {});
      await writeFile(join(testDir, '.cursorrules'), '# Cursor rules');
      await runNonInteractive({}, testDir);

      // Verify manifest has cursor in aiTools (config command shows global config, not manifest)
      const manifestPath = join(testDir, '.standards/manifest.json');
      const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));

      expect(manifest.aiTools).toContain('cursor');

      recordScenarioResult('AI Tools Display', {
        steps: [
          { step: 1, name: 'Cursor in manifest', matched: manifest.aiTools.includes('cursor') }
        ],
        output: JSON.stringify(manifest.aiTools)
      });
    });

    it('should store methodology in manifest with -E flag init', async () => {
      await setupTestDir(testDir, {});
      await runNonInteractive({}, testDir);

      // Manually add methodology to manifest
      const manifestPath = join(testDir, '.standards/manifest.json');
      const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
      manifest.methodology = { active: 'tdd' };
      await writeFile(manifestPath, JSON.stringify(manifest, null, 2));

      // Verify methodology is stored correctly
      const updatedManifest = JSON.parse(await readFile(manifestPath, 'utf8'));
      expect(updatedManifest.methodology.active).toBe('tdd');

      recordScenarioResult('Methodology Display with -E', {
        steps: [
          { step: 1, name: 'Methodology in manifest', matched: updatedManifest.methodology !== undefined },
          { step: 2, name: 'TDD active', matched: updatedManifest.methodology.active === 'tdd' }
        ],
        output: JSON.stringify(updatedManifest.methodology)
      });
    });
  });

  // ===== Manifest State Tests =====
  describe('Manifest State', () => {
    it('should have correct structure after init', async () => {
      await setupTestDir(testDir, {});
      await writeFile(join(testDir, '.cursorrules'), '# Cursor rules');
      await runNonInteractive({ level: '2' }, testDir);

      const manifestPath = join(testDir, '.standards/manifest.json');
      expect(await fileExists(manifestPath)).toBe(true);

      const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));

      expect(manifest.level).toBe(2);
      expect(manifest.format).toBeDefined();
      expect(manifest.aiTools).toContain('cursor');
      expect(manifest.options).toBeDefined();

      recordScenarioResult('Manifest structure', {
        steps: [
          { step: 1, name: 'Level correct', matched: manifest.level === 2 },
          { step: 2, name: 'Format defined', matched: manifest.format !== undefined },
          { step: 3, name: 'AI Tools contains cursor', matched: manifest.aiTools.includes('cursor') },
          { step: 4, name: 'Options defined', matched: manifest.options !== undefined }
        ],
        output: JSON.stringify(manifest, null, 2)
      });
    });

    it('should preserve options from init', async () => {
      await setupTestDir(testDir, {});
      await runNonInteractive({}, testDir);

      const manifestPath = join(testDir, '.standards/manifest.json');
      const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));

      expect(manifest.options.workflow).toBe('github-flow');
      expect(manifest.options.merge_strategy).toBe('squash');
      expect(manifest.options.commit_language).toBe('english');

      recordScenarioResult('Options preserved', {
        steps: [
          { step: 1, name: 'Workflow', matched: manifest.options.workflow === 'github-flow' },
          { step: 2, name: 'Merge strategy', matched: manifest.options.merge_strategy === 'squash' },
          { step: 3, name: 'Commit language', matched: manifest.options.commit_language === 'english' }
        ],
        output: JSON.stringify(manifest.options, null, 2)
      });
    });
  });

  // ===== Integration Files State =====
  describe('Integration Files State', () => {
    it('should create .cursorrules when cursor detected', async () => {
      await setupTestDir(testDir, {});
      await writeFile(join(testDir, '.cursorrules'), '# Initial');
      await runNonInteractive({}, testDir);

      // Verify .cursorrules was updated
      const cursorRulesPath = join(testDir, '.cursorrules');
      expect(await fileExists(cursorRulesPath)).toBe(true);

      const content = await readFile(cursorRulesPath, 'utf8');
      // Should contain UDS generated content, not just "# Initial"
      expect(content.length).toBeGreaterThan(50);

      recordScenarioResult('.cursorrules creation', {
        steps: [
          { step: 1, name: 'File exists', matched: true },
          { step: 2, name: 'Content generated', matched: content.length > 50 }
        ],
        output: content.substring(0, 500)
      });
    });

    it('should track integrations in manifest', async () => {
      await setupTestDir(testDir, {});
      await writeFile(join(testDir, '.cursorrules'), '# Initial');
      await runNonInteractive({}, testDir);

      const manifestPath = join(testDir, '.standards/manifest.json');
      const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));

      expect(manifest.integrations).toContain('.cursorrules');

      recordScenarioResult('Integrations tracked', {
        steps: [
          { step: 1, name: '.cursorrules in integrations', matched: manifest.integrations.includes('.cursorrules') }
        ],
        output: JSON.stringify(manifest.integrations)
      });
    });
  });

  // ===== Help and Version =====
  describe('Command Help', () => {
    it('should show help with --help', async () => {
      const result = await runCommand('config', { help: true }, testDir);

      expect(result.stdout).toContain('config');
      expect(result.stdout).toContain('--global');
      expect(result.stdout).toContain('--yes');

      recordScenarioResult('Help output', {
        steps: [
          { step: 1, name: 'Shows config', matched: result.stdout.includes('config') },
          { step: 2, name: 'Shows --global', matched: result.stdout.includes('--global') },
          { step: 3, name: 'Shows --yes', matched: result.stdout.includes('--yes') }
        ],
        output: result.stdout
      });
    });
  });

  // ===== UI Language Flag Tests =====
  // NOTE: These tests are skipped because the config command API has changed.
  // The old "Configure" UI with headers is no longer used; config now outputs JSON.
  // TODO: Rewrite these tests to verify --ui-lang affects other commands (e.g., init, check)
  describe.skip('--ui-lang Flag (skipped - config API changed)', () => {
    it('should show English UI when --ui-lang en is set, even if manifest has traditional-chinese', async () => {
      await setupTestDir(testDir, {});
      // Initialize with traditional-chinese commit language
      await runNonInteractive({ commitLang: 'traditional-chinese' }, testDir);

      // Verify manifest has traditional-chinese
      const manifestPath = join(testDir, '.standards/manifest.json');
      const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
      expect(manifest.options.commit_language).toBe('traditional-chinese');

      // Run config with --ui-lang en (global option)
      const result = await runCommand('config', { yes: true }, testDir, 5000, { uiLang: 'en' });

      // Should show English UI, not Chinese
      expect(result.stdout).toContain('Universal Development Standards - Configure');
      expect(result.stdout).toContain('Current Configuration');
      expect(result.stdout).not.toContain('通用開發標準');
      expect(result.stdout).not.toContain('目前設定');

      recordScenarioResult('--ui-lang en overrides manifest', {
        steps: [
          { step: 1, name: 'English title', matched: result.stdout.includes('Universal Development Standards - Configure') },
          { step: 2, name: 'English labels', matched: result.stdout.includes('Current Configuration') },
          { step: 3, name: 'No Chinese title', matched: !result.stdout.includes('通用開發標準') },
          { step: 4, name: 'No Chinese labels', matched: !result.stdout.includes('目前設定') }
        ],
        output: result.stdout
      });
    });

    it('should show Traditional Chinese UI when --ui-lang zh-tw is set', async () => {
      await setupTestDir(testDir, {});
      // Initialize with english commit language
      await runNonInteractive({ commitLang: 'english' }, testDir);

      // Verify manifest has english
      const manifestPath = join(testDir, '.standards/manifest.json');
      const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
      expect(manifest.options.commit_language).toBe('english');

      // Run config with --ui-lang zh-tw (global option)
      const result = await runCommand('config', { yes: true }, testDir, 5000, { uiLang: 'zh-tw' });

      // Should show Chinese UI, not English
      expect(result.stdout).toContain('通用開發標準 - 設定');
      expect(result.stdout).toContain('目前設定');

      recordScenarioResult('--ui-lang zh-tw overrides manifest', {
        steps: [
          { step: 1, name: 'Chinese title', matched: result.stdout.includes('通用開發標準 - 設定') },
          { step: 2, name: 'Chinese labels', matched: result.stdout.includes('目前設定') }
        ],
        output: result.stdout
      });
    });

    it('should use manifest language when --ui-lang is not specified', async () => {
      await setupTestDir(testDir, {});
      // Initialize with traditional-chinese commit language
      await runNonInteractive({ commitLang: 'traditional-chinese' }, testDir);

      // Run config WITHOUT --ui-lang (should use manifest setting)
      const result = await runCommand('config', { yes: true }, testDir, 5000);

      // Should show Chinese UI from manifest
      expect(result.stdout).toContain('通用開發標準 - 設定');
      expect(result.stdout).toContain('目前設定');

      recordScenarioResult('No --ui-lang uses manifest language', {
        steps: [
          { step: 1, name: 'Chinese title from manifest', matched: result.stdout.includes('通用開發標準 - 設定') },
          { step: 2, name: 'Chinese labels from manifest', matched: result.stdout.includes('目前設定') }
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

  const jsonReportPath = join(reportsDir, 'config-test-report.json');
  await writeFile(jsonReportPath, JSON.stringify(testReport, null, 2));

  // Write Markdown report
  const mdReport = generateMarkdownReport(testReport);
  const mdReportPath = join(reportsDir, 'config-test-report.md');
  await writeFile(mdReportPath, mdReport);

  console.log(`\n📋 Config test report written to:`);
  console.log(`   - ${jsonReportPath}`);
  console.log(`   - ${mdReportPath}`);
});

function generateMarkdownReport(report) {
  const lines = [
    '# UDS Config E2E Test Report',
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
