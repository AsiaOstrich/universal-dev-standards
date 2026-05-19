#!/usr/bin/env tsx
/**
 * Skill Structural Integrity Checker (XSPEC-223)
 * Skill 結構完整性檢查器
 *
 * Validates every skills/<name>/SKILL.md:
 *   1. SKILL.md exists in each skill directory
 *   2. SKILL.md contains ## Workflow / ## 工作流程 section
 *   3. Skill id is registered in uds-manifest.json
 *   4. (Advisory) AC count change >30% vs. last git tag → warning only
 *
 * Usage:
 *   tsx scripts/check-skill-structural-integrity.ts
 *   tsx scripts/check-skill-structural-integrity.ts --skills-dir /tmp/test-skills
 *   tsx scripts/check-skill-structural-integrity.ts --skills-dir /tmp/s --manifest /tmp/m.json
 *   tsx scripts/check-skill-structural-integrity.ts --skills-dir /tmp/s --skip-manifest
 *
 * Exit codes:
 *   0 — all checks passed (warnings may still be printed)
 *   1 — one or more blocking failures
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const SCRIPT_DIR = dirname(__filename);
const ROOT_DIR = dirname(SCRIPT_DIR);

// ANSI colours
const RED    = '\x1b[0;31m';
const GREEN  = '\x1b[0;32m';
const YELLOW = '\x1b[1;33m';
const CYAN   = '\x1b[0;36m';
const NC     = '\x1b[0m';

// Directories inside skills/ that are NOT individual skills
const NON_SKILL_DIRS = new Set([
  '_shared', 'agents', 'ai', 'commands', 'tools', 'workflows',
]);

// Blocking: SKILL.md must have at least one level-2 heading (has structure)
const HAS_SECTIONS_PATTERN = /^## /m;
// Advisory: preferred workflow section names
const WORKFLOW_PATTERNS = [
  /^## 工作流程/m,
  /^## Workflow/im,
  /^## 執行流程/m,
];

// ── CLI argument parsing ──────────────────────────────────────────────────────

const args = process.argv.slice(2);
let skillsDir    = join(ROOT_DIR, 'skills');
let manifestPath = join(ROOT_DIR, 'uds-manifest.json');
let skipManifest = false;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--skills-dir' && args[i + 1]) {
    skillsDir = args[++i];
  } else if (args[i] === '--manifest' && args[i + 1]) {
    manifestPath = args[++i];
  } else if (args[i] === '--skip-manifest') {
    skipManifest = true;
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function isDir(p: string): boolean {
  try { return statSync(p).isDirectory(); } catch { return false; }
}

function loadManifestIds(): Set<string> {
  if (!existsSync(manifestPath)) return new Set();
  try {
    const raw = JSON.parse(readFileSync(manifestPath, 'utf8')) as { skills?: { id: string }[] };
    return new Set((raw.skills ?? []).map(s => s.id));
  } catch {
    return new Set();
  }
}

/** Count AC lines (- [ ] or numbered AC-NNN) in a file */
function countACs(content: string): number {
  const matches = content.match(/^[-*]\s+\[[ xX]\]|^\s*AC-\d+/gm);
  return matches ? matches.length : 0;
}

/** Get SKILL.md content at last git tag for a given skill path (empty string if unavailable) */
function contentAtLastTag(skillRelPath: string): string {
  try {
    const lastTag = execSync('git describe --tags --abbrev=0 2>/dev/null', {
      cwd: ROOT_DIR, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
    if (!lastTag) return '';
    return execSync(`git show ${lastTag}:${skillRelPath} 2>/dev/null`, {
      cwd: ROOT_DIR, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'],
    });
  } catch {
    return '';
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

const manifestIds = skipManifest ? new Set<string>() : loadManifestIds();

let failures  = 0;
let warnings  = 0;
let checked   = 0;

// Collect all skill directories
const entries = readdirSync(skillsDir);

for (const entry of entries) {
  const fullPath = join(skillsDir, entry);

  if (!isDir(fullPath) || NON_SKILL_DIRS.has(entry)) continue;

  const skillMdPath = join(fullPath, 'SKILL.md');

  // AC-223-01/AC-223-03: SKILL.md must exist
  if (!existsSync(skillMdPath)) {
    console.error(`${RED}✗ Missing SKILL.md:${NC} ${entry}`);
    failures++;
    continue;
  }

  const content = readFileSync(skillMdPath, 'utf8');

  // AC-223-04: Must have at least one level-2 heading (has structure)
  if (!HAS_SECTIONS_PATTERN.test(content)) {
    console.error(`${RED}✗ No level-2 headings (## ...) found:${NC} ${entry}/SKILL.md`);
    failures++;
  } else {
    // Advisory: preferred workflow section
    const hasWorkflow = WORKFLOW_PATTERNS.some(p => p.test(content));
    if (!hasWorkflow) {
      console.warn(`${YELLOW}⚠ No workflow section in ${entry}/SKILL.md${NC} (consider adding "## Workflow" or "## 工作流程")`);
      warnings++;
    }
  }

  // AC-223-05: Manifest registration
  if (!skipManifest && !manifestIds.has(entry)) {
    console.error(`${RED}✗ Not registered in manifest:${NC} ${entry}`);
    failures++;
  }

  // AC-223-06: Semantic drift detection (advisory)
  const relPath = `skills/${entry}/SKILL.md`;
  const oldContent = contentAtLastTag(relPath);
  if (oldContent) {
    const oldACs = countACs(oldContent);
    const newACs = countACs(content);
    if (oldACs > 0) {
      const pct = Math.abs(newACs - oldACs) / oldACs;
      if (pct > 0.3) {
        console.warn(
          `${YELLOW}⚠ Semantic drift detected in ${entry}:${NC} ` +
          `AC count changed from ${oldACs} to ${newACs} (${Math.round(pct * 100)}%)`
        );
        warnings++;
      }
    }
  }

  checked++;
}

// ── Summary ───────────────────────────────────────────────────────────────────

console.log('');
if (failures === 0) {
  console.log(`${GREEN}✓ Skill structural integrity passed${NC} (${checked} skills checked${warnings > 0 ? `, ${warnings} warning(s)` : ''})`);
  process.exit(0);
} else {
  console.error(`${RED}✗ Skill structural integrity FAILED${NC}: ${failures} issue(s) found`);
  process.exit(1);
}
