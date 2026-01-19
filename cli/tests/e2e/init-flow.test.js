/**
 * E2E Tests for uds init command
 * Tests complete flows including all steps, messages, and outputs
 */

import { describe, it, expect, beforeEach, afterEach, beforeAll } from 'vitest';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFile, writeFile, mkdir } from 'fs/promises';
import {
  runNonInteractive,
  createTempDir,
  cleanupTempDir,
  setupTestDir,
  verifyOutput,
  fileExists
} from '../utils/cli-runner.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = join(__dirname, '../fixtures/init-scenarios');

// Test report accumulator
const testReport = {
  timestamp: new Date().toISOString(),
  scenarios: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    steps: { tested: 0, total: 23 },
    messages: { tested: 0, total: 47 }
  }
};

// Load expected messages
let expectedMessages = {};
beforeAll(async () => {
  const messagesPath = join(FIXTURES_DIR, 'expected-messages.json');
  const content = await readFile(messagesPath, 'utf8');
  expectedMessages = JSON.parse(content).messages;
});

describe('E2E: uds init', () => {
  let testDir;

  beforeEach(async () => {
    testDir = await createTempDir();
  });

  afterEach(async () => {
    if (testDir) {
      await cleanupTempDir(testDir);
    }
  });

  // ===== Scenario D: Already Initialized =====
  describe('Scenario D: Already Initialized Project', () => {
    it('should show warning when .standards/ already exists', async () => {
      // Setup pre-initialized project
      await setupTestDir(testDir, { preInitialized: true });

      const result = await runNonInteractive({}, testDir);

      // Verify output messages
      const verification = verifyOutput(result.stdout, [
        expectedMessages.header.title,
        expectedMessages.step1_initialization_check.already_initialized,
        expectedMessages.step1_initialization_check.already_initialized_hint
      ]);

      // Record test result
      recordScenarioResult('Already Initialized', {
        steps: [
          { step: 1, name: 'Header', matched: result.stdout.includes(expectedMessages.header.title) },
          { step: 2, name: 'Warning', matched: result.stdout.includes('already initialized') },
          { step: 3, name: 'Hint', matched: result.stdout.includes('uds update') }
        ],
        output: result.stdout,
        files: result.files
      });

      expect(verification.allMatched).toBe(true);

      // Should NOT contain installation messages
      expect(result.stdout).not.toContain('Standards initialized successfully');
      expect(result.stdout).not.toContain('Detecting project characteristics');
    });
  });

  // ===== Scenario C: Non-Interactive Mode =====
  describe('Scenario C: Non-Interactive Mode (--yes)', () => {
    it('should complete with default settings', async () => {
      await setupTestDir(testDir, {});

      const result = await runNonInteractive({}, testDir);

      // Note: ora spinner text may not appear in stdout (uses terminal cursor control)
      // So we check for the messages that DO appear in captured stdout
      const expectedPatterns = [
        expectedMessages.header.title,
        expectedMessages.summary.title,
        'Level: 2',
        'Format: Compact',
        expectedMessages.success.message
      ];

      const verification = verifyOutput(result.stdout, expectedPatterns);

      recordScenarioResult('Non-Interactive Basic', {
        steps: expectedPatterns.map((p, i) => ({
          step: i + 1,
          name: typeof p === 'string' ? p.substring(0, 30) : p.toString(),
          matched: verification.results[i].matched
        })),
        output: result.stdout,
        files: result.files
      });

      expect(verification.allMatched).toBe(true);

      // Verify files were created
      expect(await fileExists(join(testDir, '.standards/manifest.json'))).toBe(true);
    });

    it('should respect --level option', async () => {
      await setupTestDir(testDir, {});

      const options = { level: '3' };
      const result = await runNonInteractive(options, testDir);

      expect(result.stdout).toContain('Level: 3');
      expect(result.stdout).toContain(expectedMessages.success.message);

      recordScenarioResult('Non-Interactive Level 3', {
        steps: [
          { step: 1, name: 'Level option', matched: result.stdout.includes('Level: 3') }
        ],
        output: result.stdout,
        files: result.files,
        options
      });
    });

    it('should use marketplace when --skills-location=marketplace', async () => {
      await setupTestDir(testDir, {});

      const options = { skillsLocation: 'marketplace' };
      const result = await runNonInteractive(options, testDir);

      // Skills: Plugin Marketplace appears in the summary
      expect(result.stdout).toContain('Plugin Marketplace');
      // Scope should be Lean when using marketplace
      expect(result.stdout).toContain('Lean');

      recordScenarioResult('Non-Interactive Skills Marketplace', {
        steps: [
          { step: 1, name: 'Marketplace', matched: result.stdout.includes('Plugin Marketplace') },
          { step: 2, name: 'Lean scope', matched: result.stdout.includes('Lean') }
        ],
        output: result.stdout,
        files: result.files,
        options
      });
    });

    it('should use complete scope when --skills-location=none', async () => {
      await setupTestDir(testDir, {});

      const options = { skillsLocation: 'none' };
      const result = await runNonInteractive(options, testDir);

      expect(result.stdout).toContain('Complete');
      expect(result.stdout).not.toContain('Plugin Marketplace');

      recordScenarioResult('Non-Interactive Skills None', {
        steps: [
          { step: 1, name: 'Complete scope', matched: result.stdout.includes('Complete') },
          { step: 2, name: 'No marketplace', matched: !result.stdout.includes('Plugin Marketplace') }
        ],
        output: result.stdout,
        files: result.files,
        options
      });
    });

    it('should respect --content-mode=full', async () => {
      await setupTestDir(testDir, {});

      const options = { contentMode: 'full' };
      const result = await runNonInteractive(options, testDir);

      expect(result.stdout).toContain(expectedMessages.summary.mode_full);

      recordScenarioResult('Non-Interactive Content Mode Full', {
        steps: [
          { step: 1, name: 'Full embed', matched: result.stdout.includes('Full Embed') }
        ],
        output: result.stdout,
        files: result.files,
        options
      });
    });

    it('should respect --content-mode=minimal', async () => {
      await setupTestDir(testDir, {});

      const options = { contentMode: 'minimal' };
      const result = await runNonInteractive(options, testDir);

      expect(result.stdout).toContain('Minimal');

      recordScenarioResult('Non-Interactive Content Mode Minimal', {
        steps: [
          { step: 1, name: 'Minimal', matched: result.stdout.includes('Minimal') }
        ],
        output: result.stdout,
        files: result.files,
        options
      });
    });

    it('should generate .md files when --format=human', async () => {
      await setupTestDir(testDir, {});

      const options = { format: 'human' };
      const result = await runNonInteractive(options, testDir);

      expect(result.stdout).toContain('Format: Detailed');
      expect(result.stdout).toContain('Standards initialized successfully');

      // Verify .md files were generated (not .ai.yaml)
      const hasMdFiles = result.files.some(f => f.path.endsWith('.md') && f.path.includes('.standards/'));
      const hasYamlFiles = result.files.some(f => f.path.endsWith('.ai.yaml'));

      expect(hasMdFiles).toBe(true);
      expect(hasYamlFiles).toBe(false);

      recordScenarioResult('Non-Interactive Format Human', {
        steps: [
          { step: 1, name: 'Format Detailed', matched: result.stdout.includes('Format: Detailed') },
          { step: 2, name: 'Has .md files', matched: hasMdFiles },
          { step: 3, name: 'No .ai.yaml files', matched: !hasYamlFiles }
        ],
        output: result.stdout,
        files: result.files,
        options
      });
    });

    it('should generate both formats when --format=both', async () => {
      await setupTestDir(testDir, {});

      const options = { format: 'both' };
      const result = await runNonInteractive(options, testDir);

      expect(result.stdout).toContain('Format: Both');
      expect(result.stdout).toContain('Standards initialized successfully');

      // Verify both .md and .ai.yaml files were generated
      const hasMdFiles = result.files.some(f => f.path.endsWith('.md') && f.path.includes('.standards/'));
      const hasYamlFiles = result.files.some(f => f.path.endsWith('.ai.yaml'));

      expect(hasMdFiles).toBe(true);
      expect(hasYamlFiles).toBe(true);

      recordScenarioResult('Non-Interactive Format Both', {
        steps: [
          { step: 1, name: 'Format Both', matched: result.stdout.includes('Format: Both') },
          { step: 2, name: 'Has .md files', matched: hasMdFiles },
          { step: 3, name: 'Has .ai.yaml files', matched: hasYamlFiles }
        ],
        output: result.stdout,
        files: result.files,
        options
      });
    });

    it('should generate .ai.yaml files when --format=ai (default)', async () => {
      await setupTestDir(testDir, {});

      const options = { format: 'ai' };
      const result = await runNonInteractive(options, testDir);

      expect(result.stdout).toContain('Format: Compact');

      // Verify .ai.yaml files were generated (not .md standard files)
      const hasYamlFiles = result.files.some(f => f.path.endsWith('.ai.yaml'));
      // Note: some .md files like requirement-template.md are always generated
      const hasStandardMdFiles = result.files.some(f =>
        f.path.endsWith('.md') &&
        f.path.includes('.standards/') &&
        !f.path.includes('requirement') // exclude requirement templates
      );

      expect(hasYamlFiles).toBe(true);
      expect(hasStandardMdFiles).toBe(false);

      recordScenarioResult('Non-Interactive Format AI', {
        steps: [
          { step: 1, name: 'Format Compact', matched: result.stdout.includes('Format: Compact') },
          { step: 2, name: 'Has .ai.yaml files', matched: hasYamlFiles },
          { step: 3, name: 'No standard .md files', matched: !hasStandardMdFiles }
        ],
        output: result.stdout,
        files: result.files,
        options
      });
    });
  });

  // ===== Output Message Coverage Tests =====
  describe('Output Message Coverage', () => {
    it('should show all header messages', async () => {
      await setupTestDir(testDir, {});

      const result = await runNonInteractive({}, testDir);

      expect(result.stdout).toContain(expectedMessages.header.title);
      expect(result.stdout).toContain(expectedMessages.header.separator);

      testReport.summary.messages.tested += 2;
    });

    it('should show detected languages in output', async () => {
      await setupTestDir(testDir, {});

      const result = await runNonInteractive({}, testDir);

      // Spinner messages may not appear in stdout, but detection results should show
      // The output shows "Languages: javascript" after detection
      expect(result.stdout).toContain('Languages:');

      testReport.summary.messages.tested += 1;
    });

    it('should show all summary section labels', async () => {
      await setupTestDir(testDir, {});

      const result = await runNonInteractive({}, testDir);

      const summaryLabels = [
        expectedMessages.summary.title,
        expectedMessages.summary.level,
        expectedMessages.summary.format,
        expectedMessages.summary.standards_scope,
        expectedMessages.summary.content_mode,
        expectedMessages.summary.languages,
        expectedMessages.summary.frameworks,
        expectedMessages.summary.locale,
        expectedMessages.summary.ai_tools,
        expectedMessages.summary.integrations,
        expectedMessages.summary.methodology
      ];

      for (const label of summaryLabels) {
        expect(result.stdout).toContain(label);
      }

      testReport.summary.messages.tested += summaryLabels.length;
    });

    it('should show success and next steps messages', async () => {
      await setupTestDir(testDir, {});

      const result = await runNonInteractive({}, testDir);

      expect(result.stdout).toContain(expectedMessages.success.message);
      expect(result.stdout).toContain(expectedMessages.next_steps.title);
      expect(result.stdout).toContain(expectedMessages.next_steps.step1);
      expect(result.stdout).toContain(expectedMessages.next_steps.step2);

      testReport.summary.messages.tested += 4;
    });
  });

  // ===== File Output Verification =====
  describe('File Output Verification', () => {
    it('should create .standards/manifest.json with correct structure', async () => {
      await setupTestDir(testDir, {});

      const result = await runNonInteractive({}, testDir);

      const manifestPath = join(testDir, '.standards/manifest.json');
      expect(await fileExists(manifestPath)).toBe(true);

      const manifestContent = await readFile(manifestPath, 'utf8');
      const manifest = JSON.parse(manifestContent);

      expect(manifest).toHaveProperty('version');
      expect(manifest).toHaveProperty('upstream');
      expect(manifest).toHaveProperty('level');
      expect(manifest).toHaveProperty('format');
      expect(manifest).toHaveProperty('standards');
      expect(manifest).toHaveProperty('integrations');
      expect(manifest).toHaveProperty('skills');

      recordScenarioResult('Manifest Structure', {
        steps: [
          { step: 1, name: 'version', matched: manifest.version !== undefined },
          { step: 2, name: 'upstream', matched: manifest.upstream !== undefined },
          { step: 3, name: 'level', matched: manifest.level !== undefined },
          { step: 4, name: 'format', matched: manifest.format !== undefined },
          { step: 5, name: 'standards', matched: Array.isArray(manifest.standards) },
          { step: 6, name: 'integrations', matched: Array.isArray(manifest.integrations) },
          { step: 7, name: 'skills', matched: manifest.skills !== undefined }
        ],
        output: result.stdout,
        files: result.files,
        manifest
      });
    });

    it('should copy standard files based on level', async () => {
      await setupTestDir(testDir, {});

      const result = await runNonInteractive({ level: '2' }, testDir);

      // Spinner succeed messages may not appear in stdout
      // Verify success via "files copied to project" summary
      expect(result.stdout).toContain('files copied to project');

      // Check that manifest lists standards
      const manifestPath = join(testDir, '.standards/manifest.json');
      expect(await fileExists(manifestPath)).toBe(true);

      const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
      expect(manifest.standards.length).toBeGreaterThan(0);
      expect(manifest.level).toBe(2);
    });

    it('should record content mode in manifest', async () => {
      await setupTestDir(testDir, {});

      const result = await runNonInteractive({ contentMode: 'full' }, testDir);

      // Verify initialization succeeded
      expect(result.stdout).toContain('Standards initialized successfully');

      const manifestPath = join(testDir, '.standards/manifest.json');
      expect(await fileExists(manifestPath)).toBe(true);

      const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
      expect(manifest.contentMode).toBe('full');
    });

    it('should save standard options to manifest in non-interactive mode', async () => {
      await setupTestDir(testDir, {});

      const result = await runNonInteractive({}, testDir);

      // Verify initialization succeeded
      expect(result.stdout).toContain('Standards initialized successfully');

      const manifestPath = join(testDir, '.standards/manifest.json');
      const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));

      // Options should be saved with default values
      expect(manifest.options).toBeDefined();
      expect(manifest.options.workflow).toBe('github-flow');
      expect(manifest.options.merge_strategy).toBe('squash');
      expect(manifest.options.commit_language).toBe('english');
      expect(manifest.options.test_levels).toContain('unit-testing');
    });

    it('should save detected aiTools to manifest when CLAUDE.md exists', async () => {
      await setupTestDir(testDir, {});
      // Create CLAUDE.md to trigger Claude Code detection
      await writeFile(join(testDir, 'CLAUDE.md'), '# Project Guidelines');

      const result = await runNonInteractive({}, testDir);

      // Verify initialization succeeded
      expect(result.stdout).toContain('Standards initialized successfully');

      const manifestPath = join(testDir, '.standards/manifest.json');
      const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));

      // aiTools should contain claude-code
      expect(manifest.aiTools).toBeDefined();
      expect(manifest.aiTools).toContain('claude-code');
    });

    it('should auto-install commands when AGENTS.md exists (OpenCode detection)', async () => {
      await setupTestDir(testDir, {});
      // Create AGENTS.md to trigger OpenCode detection
      await writeFile(join(testDir, 'AGENTS.md'), '# Agents Configuration');

      const result = await runNonInteractive({}, testDir);

      // Verify initialization succeeded
      expect(result.stdout).toContain('Standards initialized successfully');

      const manifestPath = join(testDir, '.standards/manifest.json');
      const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));

      // Commands should be installed for opencode
      expect(manifest.commands).toBeDefined();
      expect(manifest.commands.installed).toBe(true);
      // Commands installations now use {agent, level} format
      expect(manifest.commands.installations.some(i => i.agent === 'opencode')).toBe(true);

      // Verify commands directory was created
      const commandsDir = join(testDir, '.opencode/command');
      expect(await fileExists(commandsDir)).toBe(true);
    });
  });

  // ===== UI Language Flag Tests =====
  describe('--ui-lang Flag', () => {
    it('should show English UI when --ui-lang en is set', async () => {
      await setupTestDir(testDir, {});

      // Run init with --ui-lang en (global option)
      const result = await runNonInteractive({}, testDir, 30000, { uiLang: 'en' });

      // Should show English UI
      expect(result.stdout).toContain('Universal Development Standards');
      expect(result.stdout).toContain('Configuration Summary');
      expect(result.stdout).not.toContain('通用開發標準');
      expect(result.stdout).not.toContain('設定摘要');

      recordScenarioResult('--ui-lang en shows English', {
        steps: [
          { step: 1, name: 'English title', matched: result.stdout.includes('Universal Development Standards') },
          { step: 2, name: 'English summary', matched: result.stdout.includes('Configuration Summary') },
          { step: 3, name: 'No Chinese title', matched: !result.stdout.includes('通用開發標準') }
        ],
        output: result.stdout,
        files: result.files
      });
    });

    it('should show Traditional Chinese UI when --ui-lang zh-tw is set', async () => {
      await setupTestDir(testDir, {});

      // Run init with --ui-lang zh-tw (global option)
      const result = await runNonInteractive({}, testDir, 30000, { uiLang: 'zh-tw' });

      // Should show Chinese UI
      expect(result.stdout).toContain('通用開發標準');
      expect(result.stdout).toContain('設定摘要');

      recordScenarioResult('--ui-lang zh-tw shows Chinese', {
        steps: [
          { step: 1, name: 'Chinese title', matched: result.stdout.includes('通用開發標準') },
          { step: 2, name: 'Chinese summary', matched: result.stdout.includes('設定摘要') }
        ],
        output: result.stdout,
        files: result.files
      });
    });
  });
});

// ===== Report Generation =====

/**
 * Record a scenario result for the test report
 */
function recordScenarioResult(name, data) {
  testReport.summary.total++;
  const allPassed = data.steps.every(s => s.matched);

  if (allPassed) {
    testReport.summary.passed++;
  } else {
    testReport.summary.failed++;
  }

  testReport.summary.steps.tested += data.steps.length;

  testReport.scenarios.push({
    name,
    status: allPassed ? 'passed' : 'failed',
    steps: data.steps,
    outputs: {
      files: data.files?.map(f => f.path) || [],
      consoleLog: data.output || '', // Store full console output
      manifest: data.manifest || null
    },
    // Store input options used for this scenario
    options: data.options || {}
  });
}

// Export report for external use
export { testReport };

// After all tests, write report
afterAll(async () => {
  // Calculate coverage
  testReport.summary.steps.coverage =
    `${testReport.summary.steps.tested}/${testReport.summary.steps.total}`;
  testReport.summary.messages.coverage =
    `${testReport.summary.messages.tested}/${testReport.summary.messages.total}`;

  // Write JSON report
  const reportsDir = join(__dirname, '../reports');
  await mkdir(reportsDir, { recursive: true });

  const jsonReportPath = join(reportsDir, 'init-test-report.json');
  await writeFile(jsonReportPath, JSON.stringify(testReport, null, 2));

  // Write Markdown report
  const mdReport = generateMarkdownReport(testReport);
  const mdReportPath = join(reportsDir, 'init-test-report.md');
  await writeFile(mdReportPath, mdReport);

  console.log(`\n📋 Test report written to:`);
  console.log(`   - ${jsonReportPath}`);
  console.log(`   - ${mdReportPath}`);
});

/**
 * Generate Markdown report from test results
 */
function generateMarkdownReport(report) {
  const lines = [
    '# UDS Init E2E Test Report',
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
    `| Steps Tested | ${report.summary.steps.coverage} |`,
    `| Messages Tested | ${report.summary.messages.coverage} |`,
    '',
    '## Scenario Results',
    ''
  ];

  for (const scenario of report.scenarios) {
    const icon = scenario.status === 'passed' ? '✅' : '❌';
    lines.push(`### ${icon} ${scenario.name}`);
    lines.push('');

    // Show CLI options used
    if (scenario.options && Object.keys(scenario.options).length > 0) {
      lines.push('**CLI Options:**');
      lines.push('```');
      lines.push(`uds init --yes ${Object.entries(scenario.options).map(([k, v]) => `--${k}=${v}`).join(' ')}`);
      lines.push('```');
      lines.push('');
    }

    lines.push('| Step | Name | Result |');
    lines.push('|------|------|--------|');

    for (const step of scenario.steps) {
      const stepIcon = step.matched ? '✅' : '❌';
      lines.push(`| ${step.step} | ${step.name} | ${stepIcon} |`);
    }

    lines.push('');

    // Show actual console output
    if (scenario.outputs.consoleLog) {
      lines.push('<details>');
      lines.push('<summary><strong>Console Output (click to expand)</strong></summary>');
      lines.push('');
      lines.push('```');
      lines.push(scenario.outputs.consoleLog.trim());
      lines.push('```');
      lines.push('</details>');
      lines.push('');
    }

    if (scenario.outputs.files.length > 0) {
      lines.push('<details>');
      lines.push(`<summary><strong>Generated Files (${scenario.outputs.files.length})</strong></summary>`);
      lines.push('');
      for (const file of scenario.outputs.files) {
        lines.push(`- \`${file}\``);
      }
      lines.push('</details>');
      lines.push('');
    }
  }

  return lines.join('\n');
}

// Import afterAll for report generation
import { afterAll } from 'vitest';
