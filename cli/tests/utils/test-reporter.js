/**
 * Test Reporter - Generates structured test reports
 * Supports JSON and Markdown output formats
 */

import { writeFile, readFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { platform, version as nodeVersion } from 'os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPORTS_DIR = join(__dirname, '../reports');

/**
 * Create a new test report instance
 */
export function createReport() {
  return {
    testRun: {
      timestamp: new Date().toISOString(),
      duration: null,
      environment: {
        node: process.version,
        os: platform(),
        cwd: process.cwd()
      }
    },
    scenarios: [],
    summary: {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      coverage: {
        steps: { tested: 0, total: 23 },
        messages: { tested: 0, total: 47 },
        branches: { tested: 0, total: 4 }
      }
    },
    _startTime: Date.now()
  };
}

/**
 * Add a scenario result to the report
 * @param {Object} report - Report instance
 * @param {Object} scenario - Scenario data
 */
export function addScenario(report, scenario) {
  const status = scenario.steps.every(s => s.matched) ? 'passed' : 'failed';

  report.summary.total++;
  report.summary[status]++;
  report.summary.coverage.steps.tested += scenario.steps.length;

  report.scenarios.push({
    name: scenario.name,
    description: scenario.description || '',
    status,
    steps: scenario.steps.map(step => ({
      step: step.step,
      name: step.name,
      input: step.input || null,
      expectedOutput: step.expectedOutput || null,
      actualOutput: step.actualOutput || null,
      matched: step.matched
    })),
    outputs: {
      files: scenario.files || [],
      consoleLog: scenario.consoleLog || '',
      errors: scenario.errors || []
    },
    metadata: {
      duration: scenario.duration || null,
      options: scenario.options || {}
    }
  });

  return status;
}

/**
 * Finalize the report with summary statistics
 * @param {Object} report - Report instance
 */
export function finalizeReport(report) {
  report.testRun.duration = `${((Date.now() - report._startTime) / 1000).toFixed(2)}s`;
  delete report._startTime;

  // Calculate coverage percentages
  const { steps, messages, branches } = report.summary.coverage;
  steps.percentage = `${Math.round((steps.tested / steps.total) * 100)}%`;
  messages.percentage = `${Math.round((messages.tested / messages.total) * 100)}%`;
  branches.percentage = `${Math.round((branches.tested / branches.total) * 100)}%`;

  return report;
}

/**
 * Write report to files
 * @param {Object} report - Finalized report
 * @param {string} baseName - Base filename (without extension)
 */
export async function writeReport(report, baseName = 'init-test-report') {
  await mkdir(REPORTS_DIR, { recursive: true });

  // Write JSON
  const jsonPath = join(REPORTS_DIR, `${baseName}.json`);
  await writeFile(jsonPath, JSON.stringify(report, null, 2));

  // Write Markdown
  const mdPath = join(REPORTS_DIR, `${baseName}.md`);
  await writeFile(mdPath, generateMarkdown(report));

  return { jsonPath, mdPath };
}

/**
 * Generate Markdown report
 * @param {Object} report - Report data
 * @returns {string} Markdown content
 */
export function generateMarkdown(report) {
  const lines = [];

  // Header
  lines.push('# UDS Init E2E Test Report');
  lines.push('');
  lines.push(`**Generated**: ${report.testRun.timestamp}`);
  lines.push(`**Duration**: ${report.testRun.duration}`);
  lines.push(`**Node.js**: ${report.testRun.environment.node}`);
  lines.push(`**OS**: ${report.testRun.environment.os}`);
  lines.push('');

  // Summary Table
  lines.push('## Test Summary');
  lines.push('');
  lines.push('| Metric | Result |');
  lines.push('|--------|--------|');
  lines.push(`| Total Scenarios | ${report.summary.total} |`);
  lines.push(`| Passed | ${report.summary.passed} |`);
  lines.push(`| Failed | ${report.summary.failed} |`);
  lines.push(`| Skipped | ${report.summary.skipped} |`);
  lines.push('');

  // Coverage Table
  lines.push('## Coverage');
  lines.push('');
  lines.push('| Category | Tested | Total | Coverage |');
  lines.push('|----------|--------|-------|----------|');
  const { steps, messages, branches } = report.summary.coverage;
  lines.push(`| Steps | ${steps.tested} | ${steps.total} | ${steps.percentage} |`);
  lines.push(`| Messages | ${messages.tested} | ${messages.total} | ${messages.percentage} |`);
  lines.push(`| Branches | ${branches.tested} | ${branches.total} | ${branches.percentage} |`);
  lines.push('');

  // Detailed Results
  lines.push('## Detailed Results');
  lines.push('');

  for (const scenario of report.scenarios) {
    const icon = scenario.status === 'passed' ? '✅' : '❌';
    lines.push(`### ${icon} ${scenario.name}`);
    lines.push('');

    if (scenario.description) {
      lines.push(`> ${scenario.description}`);
      lines.push('');
    }

    // Steps Table
    lines.push('| Step | Name | Input | Output Match |');
    lines.push('|------|------|-------|--------------|');

    for (const step of scenario.steps) {
      const matchIcon = step.matched ? '✅' : '❌';
      const input = step.input
        ? (typeof step.input === 'object' ? JSON.stringify(step.input) : step.input)
        : '-';
      lines.push(`| ${step.step} | ${step.name} | ${input} | ${matchIcon} |`);
    }
    lines.push('');

    // Generated Files
    if (scenario.outputs.files.length > 0) {
      lines.push('**Generated Files:**');
      lines.push('');
      for (const file of scenario.outputs.files) {
        const filePath = typeof file === 'object' ? file.path : file;
        lines.push(`- \`${filePath}\``);
      }
      lines.push('');
    }

    // Errors
    if (scenario.outputs.errors.length > 0) {
      lines.push('**Errors:**');
      lines.push('');
      for (const error of scenario.outputs.errors) {
        lines.push(`- ${error}`);
      }
      lines.push('');
    }
  }

  // Footer
  lines.push('---');
  lines.push('');
  lines.push('*Report generated by UDS CLI E2E Test Suite*');

  return lines.join('\n');
}

/**
 * Read and parse existing report
 * @param {string} baseName - Base filename
 * @returns {Object|null} Parsed report or null
 */
export async function readExistingReport(baseName = 'init-test-report') {
  try {
    const jsonPath = join(REPORTS_DIR, `${baseName}.json`);
    const content = await readFile(jsonPath, 'utf8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

/**
 * Merge multiple test reports
 * @param {Array<Object>} reports - Array of reports to merge
 * @returns {Object} Merged report
 */
export function mergeReports(reports) {
  const merged = createReport();
  merged.testRun.timestamp = new Date().toISOString();

  for (const report of reports) {
    merged.scenarios.push(...report.scenarios);
    merged.summary.total += report.summary.total;
    merged.summary.passed += report.summary.passed;
    merged.summary.failed += report.summary.failed;
    merged.summary.skipped += report.summary.skipped;

    merged.summary.coverage.steps.tested += report.summary.coverage.steps.tested;
    merged.summary.coverage.messages.tested += report.summary.coverage.messages.tested;
    merged.summary.coverage.branches.tested += report.summary.coverage.branches.tested;
  }

  return finalizeReport(merged);
}

/**
 * Print report summary to console
 * @param {Object} report - Report to print
 */
export function printSummary(report) {
  console.log('\n' + '='.repeat(50));
  console.log('UDS Init E2E Test Report Summary');
  console.log('='.repeat(50));
  console.log(`Total: ${report.summary.total}`);
  console.log(`Passed: ${report.summary.passed}`);
  console.log(`Failed: ${report.summary.failed}`);
  console.log(`Skipped: ${report.summary.skipped}`);
  console.log('-'.repeat(50));
  console.log(`Steps Coverage: ${report.summary.coverage.steps.tested}/${report.summary.coverage.steps.total}`);
  console.log(`Messages Coverage: ${report.summary.coverage.messages.tested}/${report.summary.coverage.messages.total}`);
  console.log(`Branches Coverage: ${report.summary.coverage.branches.tested}/${report.summary.coverage.branches.total}`);
  console.log('='.repeat(50) + '\n');
}

export default {
  createReport,
  addScenario,
  finalizeReport,
  writeReport,
  generateMarkdown,
  readExistingReport,
  mergeReports,
  printSummary
};
