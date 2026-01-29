/**
 * Auto-Sweep Module for Vibe Coding Integration
 *
 * Applies refactoring standards automatically to clean up code
 * after vibe coding sessions. Integrates with HITL for safety.
 *
 * @module vibe/auto-sweep
 * @see docs/specs/system/vibe-coding-integration.md (AC-2)
 */

// Note: execSync is used here with hardcoded git commands only (no user input).
// This is safe from command injection as the commands are fully controlled.
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, extname } from 'node:path';
import { hitl } from '../hitl/manager.js';
import { config } from '../utils/config-manager.js';

/**
 * Sweep action types with their risk levels
 */
export const SweepActions = {
  REMOVE_CONSOLE_LOG: {
    id: 'remove-console-log',
    name: 'Remove console.log statements',
    risk: 1, // Standard - modifies code
    pattern: /console\.(log|debug|info|warn|error)\s*\([^)]*\);?\s*\n?/g
  },
  REMOVE_DEBUGGER: {
    id: 'remove-debugger',
    name: 'Remove debugger statements',
    risk: 1,
    pattern: /debugger\s*;?\s*\n?/g
  },
  FLAG_TODO_FIXME: {
    id: 'flag-todo-fixme',
    name: 'Flag TODO/FIXME comments',
    risk: 0, // Routine - read-only detection
    pattern: /\/\/\s*(TODO|FIXME|XXX|HACK):?\s*.*/gi
  },
  FLAG_DEAD_CODE: {
    id: 'flag-dead-code',
    name: 'Flag potential dead code',
    risk: 0, // Detection only
    patterns: {
      unusedVariables: /^\s*(?:const|let|var)\s+(\w+)\s*=(?:(?!.*\1).)*$/gm,
      unreachableReturn: /return\s+[^;]+;\s*\n\s*[^}]/g
    }
  },
  SUGGEST_TYPES: {
    id: 'suggest-types',
    name: 'Suggest TypeScript type annotations',
    risk: 0, // Suggestion only
    applicable: ['.ts', '.tsx']
  }
};

/**
 * AutoSweep class for code cleanup operations
 */
export class AutoSweep {
  constructor(options = {}) {
    this.cwd = options.cwd || process.cwd();
    this.dryRun = options.dryRun ?? true;
    this.verbose = options.verbose ?? false;
    this.config = config.get('vibe-coding.auto-sweep', {
      enabled: true,
      actions: ['remove-console-logs', 'flag-dead-code', 'suggest-types']
    });
  }

  /**
   * Get changed files from git
   * @returns {string[]} Array of changed file paths
   */
  getChangedFiles() {
    try {
      // Hardcoded git commands - safe from injection
      const staged = execSync('git diff --cached --name-only', {
        cwd: this.cwd,
        encoding: 'utf-8'
      }).trim();

      const unstaged = execSync('git diff --name-only', {
        cwd: this.cwd,
        encoding: 'utf-8'
      }).trim();

      const files = new Set([
        ...staged.split('\n').filter(Boolean),
        ...unstaged.split('\n').filter(Boolean)
      ]);

      // Filter to only code files
      const codeExtensions = ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs', '.vue', '.svelte'];
      return [...files].filter(f => codeExtensions.includes(extname(f)));
    } catch {
      return [];
    }
  }

  /**
   * Scan a file for issues
   * @param {string} filePath - Path to the file
   * @returns {Object} Scan results with issues found
   */
  scanFile(filePath) {
    const fullPath = join(this.cwd, filePath);
    if (!existsSync(fullPath)) {
      return { file: filePath, issues: [], error: 'File not found' };
    }

    const content = readFileSync(fullPath, 'utf-8');
    const ext = extname(filePath);
    const issues = [];

    // Check for console statements
    const consoleMatches = content.match(SweepActions.REMOVE_CONSOLE_LOG.pattern);
    if (consoleMatches) {
      issues.push({
        type: 'console-log',
        action: SweepActions.REMOVE_CONSOLE_LOG,
        count: consoleMatches.length,
        fixable: true,
        matches: consoleMatches.map(m => m.trim().substring(0, 50))
      });
    }

    // Check for debugger statements
    const debuggerMatches = content.match(SweepActions.REMOVE_DEBUGGER.pattern);
    if (debuggerMatches) {
      issues.push({
        type: 'debugger',
        action: SweepActions.REMOVE_DEBUGGER,
        count: debuggerMatches.length,
        fixable: true
      });
    }

    // Check for TODO/FIXME comments
    const todoMatches = content.match(SweepActions.FLAG_TODO_FIXME.pattern);
    if (todoMatches) {
      issues.push({
        type: 'todo-comments',
        action: SweepActions.FLAG_TODO_FIXME,
        count: todoMatches.length,
        fixable: false,
        matches: todoMatches.map(m => m.trim())
      });
    }

    // TypeScript type suggestions (for .ts/.tsx files without explicit types)
    if (SweepActions.SUGGEST_TYPES.applicable.includes(ext)) {
      const anyTypeMatches = content.match(/:\s*any\b/g);
      if (anyTypeMatches) {
        issues.push({
          type: 'any-types',
          action: SweepActions.SUGGEST_TYPES,
          count: anyTypeMatches.length,
          fixable: false,
          suggestion: 'Consider replacing `any` with specific types'
        });
      }
    }

    return { file: filePath, issues, content };
  }

  /**
   * Apply fixes to a file
   * @param {string} filePath - Path to the file
   * @param {Object[]} issues - Issues to fix
   * @returns {Promise<Object>} Result of fix operation
   */
  async applyFixes(filePath, issues) {
    const fullPath = join(this.cwd, filePath);
    let content = readFileSync(fullPath, 'utf-8');
    const fixableIssues = issues.filter(i => i.fixable);

    if (fixableIssues.length === 0) {
      return { file: filePath, fixed: 0, skipped: issues.length };
    }

    // HITL check for code modification
    const operation = `Modify file: ${filePath} (remove ${fixableIssues.length} debug statements)`;
    const allowed = await hitl.enforce(operation, {
      reason: 'Auto-sweep cleanup',
      issues: fixableIssues.map(i => `${i.type}: ${i.count} occurrences`)
    });

    if (!allowed) {
      return { file: filePath, fixed: 0, blocked: true };
    }

    let fixCount = 0;

    // Apply fixes
    for (const issue of fixableIssues) {
      if (issue.type === 'console-log') {
        content = content.replace(SweepActions.REMOVE_CONSOLE_LOG.pattern, '');
        fixCount += issue.count;
      }
      if (issue.type === 'debugger') {
        content = content.replace(SweepActions.REMOVE_DEBUGGER.pattern, '');
        fixCount += issue.count;
      }
    }

    if (!this.dryRun) {
      writeFileSync(fullPath, content, 'utf-8');
    }

    return { file: filePath, fixed: fixCount, dryRun: this.dryRun };
  }

  /**
   * Run sweep on all changed files
   * @returns {Promise<Object>} Sweep results
   */
  async sweep() {
    const files = this.getChangedFiles();
    const results = {
      timestamp: new Date().toISOString(),
      filesScanned: files.length,
      totalIssues: 0,
      totalFixed: 0,
      files: [],
      summary: {
        consoleLogs: 0,
        debuggers: 0,
        todoComments: 0,
        anyTypes: 0
      }
    };

    if (files.length === 0) {
      results.message = 'No changed files to sweep';
      return results;
    }

    for (const file of files) {
      const scanResult = this.scanFile(file);

      if (scanResult.issues.length > 0) {
        results.totalIssues += scanResult.issues.reduce((sum, i) => sum + i.count, 0);

        // Update summary counts
        for (const issue of scanResult.issues) {
          if (issue.type === 'console-log') results.summary.consoleLogs += issue.count;
          if (issue.type === 'debugger') results.summary.debuggers += issue.count;
          if (issue.type === 'todo-comments') results.summary.todoComments += issue.count;
          if (issue.type === 'any-types') results.summary.anyTypes += issue.count;
        }

        // Apply fixes if not dry-run
        if (!this.dryRun) {
          const fixResult = await this.applyFixes(file, scanResult.issues);
          results.totalFixed += fixResult.fixed || 0;
          scanResult.fixResult = fixResult;
        }

        results.files.push(scanResult);
      }
    }

    return results;
  }

  /**
   * Generate markdown report
   * @param {Object} results - Sweep results
   * @returns {string} Markdown report
   */
  generateReport(results) {
    const lines = [
      '# Auto-Sweep Report',
      '',
      `**Generated**: ${results.timestamp}`,
      `**Mode**: ${this.dryRun ? 'Dry Run (Preview)' : 'Applied'}`,
      '',
      '## Summary',
      '',
      '| Metric | Count |',
      '|--------|-------|',
      `| Files Scanned | ${results.filesScanned} |`,
      `| Total Issues | ${results.totalIssues} |`,
      `| Fixed | ${results.totalFixed} |`,
      '',
      '## Issues by Type',
      '',
      '| Type | Count |',
      '|------|-------|',
      `| Console Logs | ${results.summary.consoleLogs} |`,
      `| Debugger Statements | ${results.summary.debuggers} |`,
      `| TODO/FIXME Comments | ${results.summary.todoComments} |`,
      `| TypeScript \`any\` Types | ${results.summary.anyTypes} |`,
      ''
    ];

    if (results.files.length > 0) {
      lines.push('## Details by File', '');

      for (const file of results.files) {
        lines.push(`### \`${file.file}\``, '');

        for (const issue of file.issues) {
          const status = issue.fixable
            ? (this.dryRun ? '[ ] Fixable' : '[x] Fixed')
            : '[-] Info only';
          lines.push(`- ${status}: ${issue.action.name} (${issue.count})`);

          if (issue.matches && this.verbose) {
            for (const match of issue.matches.slice(0, 3)) {
              lines.push(`  - \`${match}\``);
            }
            if (issue.matches.length > 3) {
              lines.push(`  - ... and ${issue.matches.length - 3} more`);
            }
          }
        }
        lines.push('');
      }
    }

    return lines.join('\n');
  }

  /**
   * Save report to .uds/reports/
   * @param {string} report - Report content
   * @returns {string} Path to saved report
   */
  saveReport(report) {
    const reportsDir = join(this.cwd, '.uds', 'reports');
    if (!existsSync(reportsDir)) {
      mkdirSync(reportsDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `sweep-${timestamp}.md`;
    const filepath = join(reportsDir, filename);

    writeFileSync(filepath, report, 'utf-8');
    return filepath;
  }
}

// Export singleton instance for simple usage
export const autoSweep = new AutoSweep();
