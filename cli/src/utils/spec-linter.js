/**
 * Spec Linter — Stateless analysis functions for spec quality checks
 * @module utils/spec-linter
 * @see specs/superspec-borrowing-phase1-2-spec.md (AC-11, AC-12, AC-13)
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, basename } from 'path';
import { StandardValidator } from './standard-validator.js';
import { MicroSpec } from '../vibe/micro-spec.js';

/**
 * Check if a spec's ACs are referenced in test files
 * @param {string} specId - e.g. "SPEC-001"
 * @param {string[]} acIds - e.g. ["AC-1", "AC-2", "AC-3"]
 * @param {string} projectPath - Project root directory
 * @returns {{ covered: string[], orphans: string[], coverage: number }}
 */
export function checkACCoverage(specId, acIds, projectPath) {
  const covered = [];
  const orphans = [];

  // Collect all test file contents
  const testContent = collectTestFiles(projectPath);

  for (const acId of acIds) {
    // Search for @AC-N pattern in test files
    const pattern = new RegExp(`@${acId}\\b`);
    if (testContent.some(content => pattern.test(content))) {
      covered.push(acId);
    } else {
      orphans.push(acId);
    }
  }

  const coverage = acIds.length > 0 ? covered.length / acIds.length : 0;

  return { covered, orphans, coverage };
}

/**
 * Validate depends_on references exist
 * @param {Object[]} specs - Array of specs with { id, dependsOn }
 * @returns {{ valid: Object[], broken: Object[] }}
 */
export function checkDependencies(specs) {
  const idSet = new Set(specs.map(s => s.id));
  const valid = [];
  const broken = [];

  for (const spec of specs) {
    if (!Array.isArray(spec.dependsOn)) continue;
    for (const target of spec.dependsOn) {
      if (idSet.has(target)) {
        valid.push({ spec: spec.id, target });
      } else {
        broken.push({ spec: spec.id, target });
      }
    }
  }

  return { valid, broken };
}

/**
 * Check spec file size (delegates to StandardValidator.validateSpecSize)
 * @param {string} specFilePath - Absolute path to spec file
 * @param {Object} [options] - Threshold options
 * @returns {{ effectiveLines: number, status: string }}
 */
export function checkSpecSize(specFilePath, options = {}) {
  // Use a dummy project path since validateSpecSize only needs the file path
  const validator = new StandardValidator('.');
  return validator.validateSpecSize(specFilePath, options);
}

/**
 * Run all lint checks on specs in a project
 * @param {string} projectPath - Project root directory
 * @returns {{ results: Object[], summary: { pass: number, warn: number, fail: number } }}
 */
export function lintAll(projectPath) {
  const specsDir = join(projectPath, 'specs');
  if (!existsSync(specsDir)) {
    return { results: [], summary: { pass: 0, warn: 0, fail: 0 } };
  }

  // Load all specs
  const microSpec = new MicroSpec({ cwd: projectPath, output: 'specs' });
  const specFiles = readdirSync(specsDir).filter(f => f.endsWith('.md'));

  const allSpecs = specFiles.map(file => {
    const content = readFileSync(join(specsDir, file), 'utf-8');
    const id = basename(file, '.md');
    return microSpec.fromMarkdown(content, id);
  });

  // Check dependencies across all specs
  const depResults = checkDependencies(allSpecs);

  const results = [];
  const summary = { pass: 0, warn: 0, fail: 0 };

  for (const spec of allSpecs) {
    // AC coverage
    const acIds = (spec.acceptance || []).map((_, i) => `AC-${i + 1}`);
    const acCoverage = checkACCoverage(spec.id, acIds, projectPath);

    // Dependencies for this spec
    const specBroken = depResults.broken.filter(b => b.spec === spec.id);
    const specValid = depResults.valid.filter(v => v.spec === spec.id);
    const deps = { valid: specValid, broken: specBroken };

    // Size
    const specPath = join(specsDir, `${spec.id}.md`);
    const size = checkSpecSize(specPath);

    // Determine worst status
    let worstStatus = 'pass';
    if (specBroken.length > 0 || size.status === 'fail' || acCoverage.coverage === 0 && acIds.length > 0) {
      worstStatus = 'fail';
    } else if (size.status === 'warn' || acCoverage.coverage < 1) {
      worstStatus = 'warn';
    }

    summary[worstStatus]++;

    results.push({
      spec: spec.id,
      acCoverage: {
        covered: acCoverage.covered,
        orphans: acCoverage.orphans,
        coverage: acCoverage.coverage,
      },
      deps,
      size: {
        effectiveLines: size.effectiveLines,
        status: size.status,
      },
    });
  }

  return { results, summary };
}

// ─── Internal helpers ───

function collectTestFiles(projectPath) {
  const contents = [];
  const testDirs = ['tests', 'test', '__tests__', 'cli/tests'];

  for (const dir of testDirs) {
    const fullDir = join(projectPath, dir);
    if (existsSync(fullDir)) {
      scanDir(fullDir, contents);
    }
  }

  return contents;
}

function scanDir(dir, contents) {
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(fullPath, contents);
    } else if (entry.name.match(/\.(test|spec)\.(js|ts|mjs|cjs)$/)) {
      contents.push(readFileSync(fullPath, 'utf-8'));
    }
  }
}
