/**
 * Audit Command - UDS Health & Feedback System
 *
 * Three-layer diagnostic and feedback system:
 * - Layer 1: Health Check (installation integrity)
 * - Layer 2a: Pattern Detection (standardization opportunities)
 * - Layer 2b: Friction Detection (impractical standards)
 * - Layer 3: Feedback Reporter (GitHub issue submission)
 *
 * @module commands/audit
 * @see docs/specs/system/SPEC-AUDIT-01-standards-audit.md
 */

import chalk from 'chalk';
import { checkbox, input } from '@inquirer/prompts';
import { createRequire } from 'node:module';
import { readManifest, isInitialized } from '../utils/copier.js';
import { runHealthCheck } from '../utils/health-checker.js';
import { runHealthScore, saveScoreSnapshot, loadTrend } from '../utils/health-scorer.js';
import { analyzePatterns } from '../utils/pattern-analyzer.js';
import { detectFrictions } from '../utils/friction-detector.js';
import {
  formatIssueContent,
  submitFeedback,
  copyToClipboard,
  generateReportUrl
} from '../utils/feedback-reporter.js';
import { t, setLanguage, isLanguageExplicitlySet } from '../i18n/messages.js';

const require = createRequire(import.meta.url);
const pkg = require('../../package.json');

/**
 * Execute the audit command
 * @param {Object} options - Command options
 * @param {boolean} options.health - Health check only
 * @param {boolean} options.patterns - Pattern detection only
 * @param {boolean} options.friction - Friction detection only
 * @param {boolean} options.report - Interactive feedback submission
 * @param {boolean} options.dryRun - Preview report without submitting
 * @param {boolean} options.gh - Force gh CLI for submission
 * @param {string} options.format - Output format (json)
 * @param {boolean} options.quiet - Summary only
 * @param {boolean} options.score - Run health score analysis
 * @param {boolean} options.self - Self mode (UDS repo)
 * @param {boolean} options.save - Save score snapshot
 * @param {boolean} options.trend - Show score trend
 * @param {boolean} options.ci - CI mode (exit code based on threshold)
 * @param {number} options.threshold - Score threshold for CI mode
 */
export async function auditCommand(options = {}) {
  const projectPath = process.cwd();
  const isJson = options.format === 'json';
  const isQuiet = options.quiet || false;
  const isReport = options.report || false;

  // Handle --score mode
  if (options.score) {
    return handleScoreMode(projectPath, options);
  }

  // Determine which layers to run
  const hasLayerFlag = options.health || options.patterns || options.friction;
  const runHealth = hasLayerFlag ? !!options.health : true;
  const runPatterns = hasLayerFlag ? !!options.patterns : true;
  const runFriction = hasLayerFlag ? !!options.friction : true;

  // Read manifest and set language
  const initialized = isInitialized(projectPath);
  let manifest = null;
  if (initialized) {
    manifest = readManifest(projectPath);
    if (manifest && !isLanguageExplicitlySet()) {
      const uiLang = manifest.options?.display_language || 'en';
      setLanguage(uiLang);
    }
  }

  const messages = t();
  const msg = messages.commands?.audit || {};

  // Run audit layers
  const auditResult = {
    timestamp: new Date().toISOString(),
    udsVersion: pkg.version,
    nodeVersion: process.version,
    health: null,
    patterns: null,
    frictions: null
  };

  // Layer 1: Health Check
  if (runHealth) {
    if (initialized) {
      auditResult.health = runHealthCheck(projectPath);
    } else {
      auditResult.health = {
        status: 'ERROR',
        issues: [{
          severity: 'ERROR',
          component: '.standards/',
          message: msg.notInitialized || 'UDS not initialized in this project',
          fix: msg.suggestInit || 'Run `uds init` to install standards'
        }]
      };
    }
  }

  // Layer 2a: Pattern Detection
  if (runPatterns) {
    auditResult.patterns = analyzePatterns(projectPath);
  }

  // Layer 2b: Friction Detection
  if (runFriction && initialized && manifest) {
    auditResult.frictions = detectFrictions(projectPath, manifest);
  } else if (runFriction) {
    auditResult.frictions = [];
  }

  // Generate report URL
  auditResult.reportUrl = generateReportUrl(auditResult);

  // Output
  if (isJson) {
    outputJson(auditResult);
    return;
  }

  if (isQuiet) {
    outputQuiet(auditResult, msg);
    return;
  }

  outputTerminal(auditResult, msg);

  // Layer 3: Feedback Report
  if (isReport) {
    await handleReport(auditResult, options, msg);
  }
}

/**
 * Output full terminal report
 * @param {Object} auditResult
 * @param {Object} msg - i18n messages
 */
function outputTerminal(auditResult, msg) {
  console.log();
  console.log(chalk.bold(msg.title || 'UDS Audit Report'));
  console.log(chalk.gray('═'.repeat(50)));

  // Health Check section
  if (auditResult.health) {
    console.log();
    console.log(chalk.bold(msg.healthTitle || 'Health Check'));
    console.log(chalk.gray('─'.repeat(40)));

    const health = auditResult.health;
    if (health.status === 'OK') {
      const fileCount = health.issues.find(i => i.severity === 'INFO')?.message || '';
      console.log(chalk.green(`  ✓ ${msg.allHealthy?.replace('{count}', fileCount) || 'All files intact'}`));
    } else {
      for (const issue of health.issues) {
        if (issue.severity === 'INFO') continue;
        const icon = issue.severity === 'ERROR' ? chalk.red('✗') : chalk.yellow('⚠');
        console.log(`  ${icon} ${issue.component}: ${issue.message}`);
        if (issue.fix) {
          console.log(chalk.gray(`       Fix: ${issue.fix}`));
        }
      }
    }
  }

  // Patterns section
  if (auditResult.patterns && auditResult.patterns.length > 0) {
    console.log();
    console.log(chalk.bold(`${msg.patternsTitle || 'Patterns Detected'} (${auditResult.patterns.length})`));
    console.log(chalk.gray('─'.repeat(40)));

    for (const pattern of auditResult.patterns) {
      const severityColor = pattern.severity === 'HIGH' ? chalk.red : chalk.yellow;
      console.log(`  ${severityColor(`[${pattern.severity}]`)}   ${pattern.name}`);
      console.log(chalk.gray(`           Evidence: ${pattern.evidence.join(', ')}`));
      console.log(chalk.gray(`           Suggested: ${pattern.suggestion}`));
    }
  }

  // Frictions section
  if (auditResult.frictions && auditResult.frictions.length > 0) {
    console.log();
    console.log(chalk.bold(`${msg.frictionsTitle || 'Friction Points'} (${auditResult.frictions.length})`));
    console.log(chalk.gray('─'.repeat(40)));

    for (const friction of auditResult.frictions) {
      const severityColor = friction.severity === 'HIGH' ? chalk.red
        : friction.severity === 'MEDIUM' ? chalk.yellow
          : chalk.gray;
      console.log(`  ${severityColor(`[${friction.severity}]`)} ${friction.standard} — ${capitalizeFirst(friction.type)}`);
      if (friction.diff) {
        console.log(chalk.gray(`         ${friction.diff}`));
      }
      console.log(chalk.gray(`         ${friction.suggestion}`));
    }
  }

  // No findings
  const totalFindings =
    (auditResult.health?.issues.filter(i => i.severity !== 'INFO').length || 0) +
    (auditResult.patterns?.length || 0) +
    (auditResult.frictions?.length || 0);

  if (totalFindings === 0 && auditResult.health?.status === 'OK') {
    console.log();
    console.log(chalk.green(msg.noFindings || 'No issues found. Your UDS installation is healthy!'));
  }

  // Report hint
  if (totalFindings > 0 && !auditResult._isReport) {
    console.log();
    console.log(chalk.gray('Submit feedback: uds audit --report'));
  }

  console.log();
}

/**
 * Output JSON
 * @param {Object} auditResult
 */
function outputJson(auditResult) {
  // Remove internal fields
  const output = { ...auditResult };
  delete output._isReport;
  console.log(JSON.stringify(output, null, 2));
}

/**
 * Output quiet summary
 * @param {Object} auditResult
 * @param {Object} msg
 */
function outputQuiet(auditResult, msg) {
  const healthStatus = auditResult.health?.status || 'N/A';
  const patternCount = auditResult.patterns?.length || 0;
  const frictionCount = auditResult.frictions?.length || 0;

  const summary = (msg.quietSummary || 'Health: {health} | Patterns: {patterns} | Frictions: {frictions}')
    .replace('{health}', healthStatus)
    .replace('{patterns}', patternCount)
    .replace('{frictions}', frictionCount);

  console.log(summary);
}

/**
 * Handle Layer 3: interactive feedback submission
 * @param {Object} auditResult
 * @param {Object} options
 * @param {Object} msg
 */
async function handleReport(auditResult, options, msg) {
  const isDryRun = options.dryRun || false;
  const forceGh = options.gh || false;

  // Gather findings for selection
  const findings = [];

  if (auditResult.health?.issues) {
    for (const issue of auditResult.health.issues) {
      if (issue.severity === 'INFO') continue;
      findings.push({
        name: `[Health] ${issue.component}: ${issue.message}`,
        value: { type: 'health', data: issue },
        checked: true
      });
    }
  }

  if (auditResult.patterns) {
    for (const pattern of auditResult.patterns) {
      findings.push({
        name: `[Pattern] ${pattern.name} (${pattern.severity})`,
        value: { type: 'pattern', data: pattern },
        checked: true
      });
    }
  }

  if (auditResult.frictions) {
    for (const friction of auditResult.frictions) {
      findings.push({
        name: `[Friction] ${friction.standard} — ${friction.type}`,
        value: { type: 'friction', data: friction },
        checked: true
      });
    }
  }

  if (findings.length === 0) {
    console.log(chalk.gray(msg.noFindings || 'No findings to report.'));
    return;
  }

  // Interactive selection
  let selectedFindings = findings.map(f => f.value);
  let userComments = '';

  if (!isDryRun) {
    const selected = await checkbox({
      message: msg.submitPrompt || 'Select findings to submit:',
      choices: findings
    });

    const comments = await input({
      message: msg.userCommentsPrompt || 'Additional comments (optional):'
    });

    selectedFindings = selected;
    userComments = comments || '';

    if (selectedFindings.length === 0) {
      console.log(chalk.gray('No findings selected. Skipping submission.'));
      return;
    }
  }

  // Build filtered audit result based on selection
  const filteredResult = {
    ...auditResult,
    health: {
      ...auditResult.health,
      issues: selectedFindings
        .filter(f => f.type === 'health')
        .map(f => f.data)
    },
    patterns: selectedFindings
      .filter(f => f.type === 'pattern')
      .map(f => f.data),
    frictions: selectedFindings
      .filter(f => f.type === 'friction')
      .map(f => f.data)
  };

  const issue = formatIssueContent(filteredResult, userComments);

  if (isDryRun) {
    console.log();
    console.log(chalk.bold(msg.dryRunNotice || 'Dry run — no issue created'));
    console.log(chalk.gray('─'.repeat(40)));
    console.log(chalk.cyan(`Title: ${issue.title}`));
    console.log(chalk.cyan(`Labels: ${issue.labels.join(', ')}`));
    console.log(chalk.gray('─'.repeat(40)));
    console.log(issue.body);
    console.log();
    return;
  }

  // Submit
  const result = await submitFeedback(issue, { dryRun: isDryRun, forceGh });

  if (result.success) {
    if (result.method === 'gh') {
      console.log(chalk.green(`Issue created: ${result.url}`));
    } else if (result.method === 'deeplink') {
      console.log(chalk.green('Opening browser to create issue...'));
      if (result.truncated) {
        console.log(chalk.yellow(msg.urlTruncated || 'Report too long for URL, summary used. Full report on clipboard.'));
      }
    } else if (result.method === 'clipboard') {
      console.log(chalk.yellow(msg.copiedToClipboard || 'Full report copied to clipboard'));
      console.log(chalk.gray(`Create issue manually: ${result.url}`));
    }
  } else {
    console.log(chalk.red(`Failed to submit: ${result.error}`));
    // Last resort: copy to clipboard
    copyToClipboard(issue.body);
    console.log(chalk.yellow(msg.copiedToClipboard || 'Full report copied to clipboard'));
    console.log(chalk.gray(`Create issue: https://github.com/${REPO}/issues/new`));
  }
}

/**
 * Handle --score mode (SPEC-SELFDIAG-001)
 * @param {string} projectPath
 * @param {Object} options
 */
async function handleScoreMode(projectPath, options) {
  const isJson = options.format === 'json';
  const isCi = options.ci || false;
  const threshold = options.threshold ? Number(options.threshold) : 75;

  const result = runHealthScore(projectPath, { self: !!options.self });

  // Handle errors
  if (result.error) {
    if (isCi) {
      console.log('0');
      process.exit(1);
    }
    if (isJson) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(chalk.red(`Error: ${result.error}`));
    }
    process.exit(1);
  }

  // Save snapshot if requested
  if (options.save) {
    saveScoreSnapshot(projectPath, result);
  }

  // CI mode: just output score and exit
  if (isCi) {
    console.log(String(result.score));
    process.exit(result.score >= threshold ? 0 : 1);
  }

  // JSON output
  if (isJson) {
    const output = { ...result };
    if (options.trend) {
      output.trend = loadTrend(projectPath);
    }
    console.log(JSON.stringify(output, null, 2));
    return;
  }

  // Terminal output
  console.log();
  console.log(chalk.bold('Standards Health Score'));
  console.log(chalk.gray('═'.repeat(50)));
  console.log();

  const scoreColor = result.score >= 80 ? chalk.green
    : result.score >= 60 ? chalk.yellow
      : chalk.red;
  console.log(`  Overall: ${scoreColor(chalk.bold(`${result.score}/100`))}`);
  console.log(`  Mode:    ${result.mode}`);
  console.log();

  // Dimension details
  for (const [name, dim] of Object.entries(result.dimensions)) {
    const dimColor = dim.score >= 80 ? chalk.green
      : dim.score >= 60 ? chalk.yellow
        : chalk.red;
    const label = name.charAt(0).toUpperCase() + name.slice(1);
    console.log(`  ${label}: ${dimColor(`${dim.score}/100`)}`);
  }

  // Trend
  if (options.trend) {
    const trend = loadTrend(projectPath);
    console.log();
    console.log(chalk.bold('Trend'));
    console.log(chalk.gray('─'.repeat(40)));

    if (trend.entries.length === 0) {
      console.log(chalk.gray('  No history. Use --save to start tracking.'));
    } else {
      for (const entry of trend.entries) {
        console.log(`  ${entry.date}: ${entry.score}`);
      }
      if (trend.degraded) {
        console.log(chalk.red(`  ⚠ Degradation detected: ${trend.change} points`));
      }
    }
  }

  console.log();
}

/**
 * Capitalize first letter
 * @param {string} str
 * @returns {string}
 */
function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const REPO = 'AsiaOstrich/universal-dev-standards';
