#!/usr/bin/env tsx
/**
 * Workflow Compliance Check — WARNING ONLY (non-blocking)
 * 工作流程合規檢查（純警告，不阻擋）
 *
 * Cross-platform TypeScript implementation. Run with `tsx`.
 * Replaces check-workflow-compliance.sh.
 *
 * Checks for workflow compliance issues and prints warnings.
 * Designed to run in pre-commit hook. Never exits with non-zero status.
 *
 * Usage: tsx scripts/check-workflow-compliance.ts
 */

import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { basename, join } from 'node:path';

const STALE_THRESHOLD_SECONDS = 7 * 24 * 60 * 60;

function findRepoRoot(): string {
  try {
    const out = execFileSync('git', ['rev-parse', '--show-toplevel'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    return out.trim() || process.cwd();
  } catch {
    return process.cwd();
  }
}

function gitDiffCachedNames(extraArgs: string[] = []): string[] {
  try {
    const out = execFileSync(
      'git',
      ['diff', '--cached', '--name-only', ...extraArgs],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
    );
    return out
      .split(/\r?\n/)
      .filter((l) => l.length > 0);
  } catch {
    return [];
  }
}

/** Recursively find files matching predicate. */
function findFiles(
  dir: string,
  predicate: (entry: string) => boolean,
): string[] {
  const out: string[] = [];
  if (!existsSync(dir)) return out;
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = join(dir, entry);
    let stats;
    try {
      stats = statSync(full);
    } catch {
      continue;
    }
    if (stats.isDirectory()) {
      out.push(...findFiles(full, predicate));
    } else if (stats.isFile() && predicate(entry)) {
      out.push(full);
    }
  }
  return out;
}

function stripExt(name: string): string {
  // Mirror `sed 's/\.[^.]*$//'`
  return name.replace(/\.[^.]*$/, '');
}

function main(): void {
  const repoRoot = findRepoRoot();

  // Find workflow state directory (priority order)
  let workflowStateDir = '';
  const candidate1 = join(repoRoot, '.workflow-state');
  const candidate2 = join(repoRoot, '.standards', 'workflow-state');
  if (existsSync(candidate1) && statSync(candidate1).isDirectory()) {
    workflowStateDir = candidate1;
  } else if (existsSync(candidate2) && statSync(candidate2).isDirectory()) {
    workflowStateDir = candidate2;
  }

  const specsDir = join(repoRoot, 'docs', 'specs');
  let warnings = 0;
  const warn = (msg: string): void => {
    process.stdout.write(`[Workflow] ⚠️  ${msg}\n`);
    warnings += 1;
  };

  // ── Check 1: Active workflows ──
  if (workflowStateDir) {
    const activeWorkflows = findFiles(
      workflowStateDir,
      (e) => e.endsWith('.yaml') || e.endsWith('.json'),
    ).slice(0, 5);
    if (activeWorkflows.length > 0) {
      process.stdout.write('[Workflow] Active workflows detected:\n');
      for (const wf of activeWorkflows) {
        const wfName = stripExt(basename(wf));
        process.stdout.write(`  → ${wfName}\n`);
      }
      process.stdout.write(
        '[Workflow] Ensure your commit aligns with the active workflow phase.\n',
      );
      process.stdout.write('\n');
    }
  }

  // ── Check 2: feat/fix commits without spec reference ──
  const stagedFiles = gitDiffCachedNames();
  const stagedCount = stagedFiles.length;

  const newFilesList = gitDiffCachedNames(['--diff-filter=A']);
  const newFiles = newFilesList.length;

  if (stagedCount > 3 || newFiles > 0) {
    if (existsSync(specsDir)) {
      // Mirror `find ... -name "SPEC-*.md" | head -1`
      const specs = findFiles(specsDir, (e) => /^SPEC-.*\.md$/.test(e));
      if (specs.length > 0) {
        warn(
          `Significant change detected (${stagedCount} files staged). Consider adding 'Refs: SPEC-XXX' to your commit message.`,
        );
      }
    }
  }

  // ── Check 3: Stale workflow states ──
  if (workflowStateDir) {
    const now = Math.floor(Date.now() / 1000);
    // Mirror the bash glob: only top-level *.yaml / *.json
    let entries: string[] = [];
    try {
      entries = readdirSync(workflowStateDir);
    } catch {
      entries = [];
    }
    for (const entry of entries) {
      if (!(entry.endsWith('.yaml') || entry.endsWith('.json'))) continue;
      const stateFile = join(workflowStateDir, entry);
      let stats;
      try {
        stats = statSync(stateFile);
      } catch {
        continue;
      }
      if (!stats.isFile()) continue;
      const fileMod = Math.floor(stats.mtimeMs / 1000);
      if (fileMod <= 0) continue;
      const age = now - fileMod;
      if (age > STALE_THRESHOLD_SECONDS) {
        const wfName = stripExt(entry);
        const days = Math.floor(age / 86400);
        warn(
          `Stale workflow state: ${wfName} (last updated ${days} days ago). Consider closing or cleaning up.`,
        );
      }
    }
  }

  // ── Summary ──
  if (warnings > 0) {
    process.stdout.write('\n');
    process.stdout.write(
      `[Workflow] ${warnings} warning(s) found. These are advisory — your commit will proceed.\n`,
    );
  }

  // Always exit 0 — warnings never block commits
  process.exit(0);
}

main();
