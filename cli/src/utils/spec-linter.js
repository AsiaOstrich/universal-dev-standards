/**
 * Spec Linter — Stateless analysis functions for spec quality checks
 * @module utils/spec-linter
 * @see specs/superspec-borrowing-phase1-2-spec.md (AC-11, AC-12, AC-13)
 *
 * XSPEC-383 R5 (Option E): `checkACCoverage` / `collectTestFiles` / `scanDir`
 * were removed here. They shipped 2026-04-07, had passing unit tests, and were
 * never wired to any CLI command — `uds lint` did not exist. 2026-08-19,
 * registering `uds lint` and running it against VibeOps's 93 real specs
 * surfaced that the removed check would have reported 0/98 ACs covered on
 * every one of them, for two independent reasons: it derived AC identifiers
 * positionally (`AC-1`, `AC-2`, …) instead of reading the ones a spec
 * declares, and it hardcoded the `@AC-N` tag convention from this repo's own
 * `skills/ac-coverage`, while VibeOps's tests tag coverage as `AC-045-001`
 * without an `@` prefix. Neither project is "wrong" — they never agreed on a
 * convention — but a linter that always reports zero regardless of actual
 * coverage is worse than no linter: it looks like a working gate. Redoing AC
 * coverage requires deciding how identifiers are read and how conventions are
 * negotiated across adopters; that is a new design, not a patch, and is out
 * of scope for R5.
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, basename } from 'path';
import { StandardValidator } from './standard-validator.js';
import { MicroSpec } from '../vibe/micro-spec.js';

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
 * Run all lint checks (dependency validity + size) on specs in a project.
 *
 * `specsDirExists` is a three-state signal, not decoration: "no specs
 * directory" and "specs directory with zero problems" must not collapse into
 * the same `{ pass: 0, warn: 0, fail: 0 }` shape, or a caller cannot tell
 * "nothing was checked" from "everything is fine" (XSPEC-383 R4/R5's own
 * standing rule for this repo's gates — see check-module-reachability.mjs and
 * check-command-existence.mjs).
 *
 * @param {string} projectPath - Project root directory
 * @returns {{ results: Object[], summary: { pass: number, warn: number, fail: number }, specsDir: string, specsDirExists: boolean }}
 */
export function lintAll(projectPath) {
  const specsDir = join(projectPath, 'specs');
  if (!existsSync(specsDir)) {
    return { results: [], summary: { pass: 0, warn: 0, fail: 0 }, specsDir: 'specs', specsDirExists: false };
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
    // Dependencies for this spec
    const specBroken = depResults.broken.filter(b => b.spec === spec.id);
    const specValid = depResults.valid.filter(v => v.spec === spec.id);
    const deps = { valid: specValid, broken: specBroken };

    // Size
    const specPath = join(specsDir, `${spec.id}.md`);
    const size = checkSpecSize(specPath);

    // Determine worst status
    let status = 'pass';
    if (specBroken.length > 0 || size.status === 'fail') {
      status = 'fail';
    } else if (size.status === 'warn') {
      status = 'warn';
    }

    summary[status]++;

    results.push({
      spec: spec.id,
      status,
      deps,
      size: {
        effectiveLines: size.effectiveLines,
        status: size.status,
      },
    });
  }

  return { results, summary, specsDir: 'specs', specsDirExists: true };
}
