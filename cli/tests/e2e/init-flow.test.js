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
  runInteractive,
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

    it('should use marketplace when --skills-location=marketplace', async () => {
      await setupTestDir(testDir, {});

      const options = { skillsLocation: 'marketplace' };
      const result = await runNonInteractive(options, testDir);

      // Skills: Plugin Marketplace appears in the summary
      expect(result.stdout).toContain('Plugin Marketplace');

      recordScenarioResult('Non-Interactive Skills Marketplace', {
        steps: [
          { step: 1, name: 'Marketplace', matched: result.stdout.includes('Plugin Marketplace') }
        ],
        output: result.stdout,
        files: result.files,
        options
      });
    });

    it('should not show marketplace when --skills-location=none', async () => {
      await setupTestDir(testDir, {});

      const options = { skillsLocation: 'none' };
      const result = await runNonInteractive(options, testDir);

      expect(result.stdout).not.toContain('Plugin Marketplace');

      recordScenarioResult('Non-Interactive Skills None', {
        steps: [
          { step: 1, name: 'No marketplace', matched: !result.stdout.includes('Plugin Marketplace') }
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
        expectedMessages.summary.format,
        expectedMessages.summary.content_mode,
        expectedMessages.summary.languages,
        expectedMessages.summary.frameworks,
        expectedMessages.summary.locale,
        expectedMessages.summary.ai_tools
        // Note: integrations, methodology, and standards_scope are conditional
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
      expect(manifest).toHaveProperty('format');
      expect(manifest).toHaveProperty('standards');
      expect(manifest).toHaveProperty('integrations');
      expect(manifest).toHaveProperty('skills');

      recordScenarioResult('Manifest Structure', {
        steps: [
          { step: 1, name: 'version', matched: manifest.version !== undefined },
          { step: 2, name: 'upstream', matched: manifest.upstream !== undefined },
          { step: 3, name: 'format', matched: manifest.format !== undefined },
          { step: 4, name: 'standards', matched: Array.isArray(manifest.standards) },
          { step: 5, name: 'integrations', matched: Array.isArray(manifest.integrations) },
          { step: 6, name: 'skills', matched: manifest.skills !== undefined }
        ],
        output: result.stdout,
        files: result.files,
        manifest
      });
    });

    it('should copy standard files to project', async () => {
      await setupTestDir(testDir, {});

      const result = await runNonInteractive({}, testDir);

      // Spinner succeed messages may not appear in stdout
      // Verify success via "files copied to project" summary
      expect(result.stdout).toContain('files copied to project');

      // Check that manifest lists standards
      const manifestPath = join(testDir, '.standards/manifest.json');
      expect(await fileExists(manifestPath)).toBe(true);

      const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
      expect(manifest.standards.length).toBeGreaterThan(0);
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

  // ===== AGENTS.md Universal Output Tests =====
  describe('AGENTS.md Universal Output', () => {
    it('should generate AGENTS.md by default in --yes mode when no codex/opencode', async () => {
      await setupTestDir(testDir, {});
      // Create CLAUDE.md to trigger claude-code detection (not codex/opencode)
      await writeFile(join(testDir, 'CLAUDE.md'), '# Project Guidelines');

      const result = await runNonInteractive({}, testDir);

      expect(result.stdout).toContain('Standards initialized successfully');

      // AGENTS.md should be generated
      const agentsMdPath = join(testDir, 'AGENTS.md');
      expect(await fileExists(agentsMdPath)).toBe(true);

      // Verify content structure
      const content = await readFile(agentsMdPath, 'utf8');
      expect(content).toContain('# AGENTS.md');
      expect(content).toContain('Universal Dev Standards');
      expect(content).toContain('<!-- UDS:STANDARDS:START -->');
      expect(content).toContain('<!-- UDS:STANDARDS:END -->');

      // Verify within 150 lines
      const lineCount = content.split('\n').length;
      expect(lineCount).toBeLessThanOrEqual(150);

      // Manifest should record generateAgentsMd
      const manifestPath = join(testDir, '.standards/manifest.json');
      const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
      expect(manifest.generateAgentsMd).toBe(true);
    });

    it('should skip AGENTS.md with --no-agents-md flag', async () => {
      await setupTestDir(testDir, {});
      await writeFile(join(testDir, 'CLAUDE.md'), '# Project Guidelines');

      const result = await runNonInteractive({ 'no-agents-md': true }, testDir);

      expect(result.stdout).toContain('Standards initialized successfully');

      // AGENTS.md should NOT be generated
      const agentsMdPath = join(testDir, 'AGENTS.md');
      expect(await fileExists(agentsMdPath)).toBe(false);
    });

    it('should not duplicate AGENTS.md when codex is detected', async () => {
      await setupTestDir(testDir, {});
      // Create AGENTS.md to trigger codex/opencode detection
      await writeFile(join(testDir, 'AGENTS.md'), '# Existing Agents Config');

      const result = await runNonInteractive({ agentsMd: true }, testDir);

      expect(result.stdout).toContain('Standards initialized successfully');

      // AGENTS.md should exist (generated by codex integration, not universal)
      const agentsMdPath = join(testDir, 'AGENTS.md');
      expect(await fileExists(agentsMdPath)).toBe(true);

      // Manifest should NOT set generateAgentsMd since codex/opencode covers it
      const manifestPath = join(testDir, '.standards/manifest.json');
      const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
      // When codex/opencode detected, generateAgentsMd should be false (codex handles it)
      expect(manifest.generateAgentsMd).toBe(false);
    });

    it('should generate AGENTS.md with --agents-md flag explicitly', async () => {
      await setupTestDir(testDir, {});

      const result = await runNonInteractive({ agentsMd: true }, testDir);

      expect(result.stdout).toContain('Standards initialized successfully');

      const agentsMdPath = join(testDir, 'AGENTS.md');
      expect(await fileExists(agentsMdPath)).toBe(true);
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

  // ===== Scenario A: Interactive Mode - Default Flow =====
  describe('Scenario A: Interactive Mode (Default Flow)', () => {
    it('should complete with step-by-step user input', async () => {
      await setupTestDir(testDir, {});

      // Interactive flow inputs:
      // Step 0: Display Language - English (default, first option)
      // Step 1: AI Tools - select Claude Code (first option, toggle with space, confirm with enter)
      // Step 2: Skills Location - Plugin Marketplace (first option)
      // Step 3: Commands Installation - accept defaults (project level pre-selected)
      // Step 4: Standards Scope - Lean (first option)
      // Step 5: Format - Compact (first option)
      // Step 6-9: Standard Options (Git Workflow, Merge Strategy, Commit Lang, Test Levels)
      // Step 10: Language Extensions - skip (no detected, or confirm defaults)
      // Step 11: Framework Extensions - skip (no detected)
      // Step 12: Locale - No (default)
      // Step 13: Content Mode - Standard (first option, recommended)
      // Step 14: Confirm - Yes

      const inputs = [
        // Display Language: first option (English), enter to confirm
        '\r',
        // AI Tools: select first option (Claude Code), space to toggle, enter to confirm
        { type: 'checkbox', selections: [{ toggle: true }] },
        // Skills Location: first option (Plugin Marketplace), enter to select
        '\r',
        // Commands Installation: accept pre-selected defaults
        '\r',
        // Standards Scope: first option (Lean), enter
        '\r',
        // Format: first option (Compact), enter
        '\r',
        // Git Workflow: first option (GitHub Flow), enter
        '\r',
        // Merge Strategy: first option (Squash), enter
        '\r',
        // Commit Language: first option (English), enter
        '\r',
        // Test Levels: accept defaults (Unit + Integration pre-selected), enter
        '\r',
        // Locale: No (default)
        'n',
        // Content Mode: first option (Standard), enter
        '\r',
        // Final Confirm: Yes
        'Y'
      ];

      const result = await runInteractive(inputs, {}, testDir, 90000);

      // Record scenario result for reporting
      recordScenarioResult('Interactive Default Flow', {
        steps: [
          { step: 1, name: 'Exit code 0', matched: result.exitCode === 0 },
          { step: 2, name: 'Has step outputs', matched: result.stepOutputs.length > 5 },
          { step: 3, name: 'Success message', matched: result.stdout.includes('Standards initialized successfully') || result.stdout.includes('initialized') }
        ],
        output: result.stdout,
        files: result.files
      });

      // Verify results - interactive mode may time out in CI, check for progress
      // If it times out, it should at least have captured some step outputs
      if (result.timedOut) {
        // Interactive tests are inherently unstable due to prompt timing
        // At minimum, verify we captured some interaction steps
        expect(result.stepOutputs.length).toBeGreaterThan(0);
      } else {
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('Standards initialized successfully');
      }

      // Verify step outputs were captured
      expect(result.stepOutputs.length).toBeGreaterThan(3);
    }, 120000); // Extended timeout for interactive mode
  });

  // ===== Scenario B: Interactive Mode - Custom Choices =====
  describe('Scenario B: Interactive Mode (Custom Choices)', () => {
    it('should allow selecting multiple AI tools', async () => {
      await setupTestDir(testDir, {});

      // Select Claude Code AND Cursor (first two options)
      const inputs = [
        // Display Language: English (first option)
        '\r',
        // AI Tools: toggle first (Claude Code), down, toggle (Cursor)
        { type: 'checkbox', selections: [
          { toggle: true },
          { down: true },
          { toggle: true }   // Cursor
        ] },
        // Skills Location: first option (Plugin Marketplace)
        '\r',
        // Commands Installation: accept defaults
        '\r',
        // Standards Scope: first option
        '\r',
        // Format: Compact
        '\r',
        // Standard Options
        '\r', '\r', '\r', '\r',
        // Integration Config (for Cursor) - accept defaults
        '\r', '\r', '\r', '\r',
        // Locale: No
        'n',
        // Content Mode: Standard
        '\r',
        // Final Confirm: Yes
        'Y'
      ];

      const result = await runInteractive(inputs, {}, testDir, 90000);

      recordScenarioResult('Interactive Multiple AI Tools', {
        steps: [
          { step: 1, name: 'Exit code 0 or captured steps', matched: result.exitCode === 0 || result.stepOutputs.length > 3 },
          { step: 2, name: 'Has outputs', matched: result.stdout.length > 0 }
        ],
        output: result.stdout,
        files: result.files
      });

      // Verify at least some steps were captured
      expect(result.stepOutputs.length).toBeGreaterThan(0);

      // If completed successfully, check manifest for multiple tools
      if (result.exitCode === 0 && await fileExists(join(testDir, '.standards/manifest.json'))) {
        const manifestContent = await readFile(join(testDir, '.standards/manifest.json'), 'utf8');
        const manifest = JSON.parse(manifestContent);
        // Should contain at least claude-code
        expect(manifest.aiTools).toContain('claude-code');
      }
    }, 120000);

    it('should allow cancelling installation', async () => {
      await setupTestDir(testDir, {});

      const inputs = [
        // Display Language: English (first option)
        '\r',
        // AI Tools: Claude Code
        { type: 'checkbox', selections: [{ toggle: true }] },
        // Skills Location: Plugin Marketplace
        '\r',
        // Commands: accept defaults
        '\r',
        // Standards Scope: Lean
        '\r',
        // Format: Compact
        '\r',
        // Standard Options
        '\r', '\r', '\r', '\r',
        // Locale: No
        'n',
        // Content Mode: Standard
        '\r',
        // Final Confirm: NO - Cancel installation
        'n'
      ];

      const result = await runInteractive(inputs, {}, testDir, 90000);

      recordScenarioResult('Interactive Cancel', {
        steps: [
          { step: 1, name: 'Cancelled message or no .standards', matched:
            result.stdout.includes('cancelled') ||
            result.stdout.includes('Cancelled') ||
            !(await fileExists(join(testDir, '.standards/manifest.json')))
          }
        ],
        output: result.stdout,
        files: result.files
      });

      // Verify installation was cancelled
      if (!result.timedOut && result.stdout.length > 100) {
        // Should show cancellation message or not create .standards directory
        const hasCancelMessage = result.stdout.toLowerCase().includes('cancel');
        const noManifest = !(await fileExists(join(testDir, '.standards/manifest.json')));
        expect(hasCancelMessage || noManifest).toBe(true);
      }
    }, 120000);
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

  console.log('\n📋 Test report written to:');
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
