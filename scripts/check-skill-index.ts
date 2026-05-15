/**
 * check-skill-index.ts
 *
 * Pre-commit guard: verifies docs/user/SKILLS-INDEX.md and COMMANDS-INDEX.md
 * are up to date. Exits with code 1 if they're stale.
 *
 * Run: npm run docs:check-index
 * Called by: .git/hooks/pre-commit (via setup-hooks.sh)
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const FILES_TO_CHECK = [
  path.join(ROOT, 'docs', 'user', 'SKILLS-INDEX.md'),
  path.join(ROOT, 'docs', 'user', 'COMMANDS-INDEX.md'),
];

// Check if any files exist
const missing = FILES_TO_CHECK.filter(f => !fs.existsSync(f));
if (missing.length > 0) {
  console.error('❌ Missing generated docs (run `npm run docs:generate-index` first):');
  missing.forEach(f => console.error(`   ${path.relative(ROOT, f)}`));
  process.exit(1);
}

// Snapshot current state
const before = FILES_TO_CHECK.map(f => fs.readFileSync(f, 'utf8'));

// Regenerate
try {
  execSync('npm run docs:generate-index --silent', { cwd: ROOT, stdio: 'pipe' });
} catch (err) {
  console.error('❌ docs:generate-index failed:', err);
  process.exit(1);
}

// Compare
const after = FILES_TO_CHECK.map(f => fs.readFileSync(f, 'utf8'));
const stale = FILES_TO_CHECK.filter((_, i) => before[i] !== after[i]);

if (stale.length > 0) {
  console.error('❌ Generated docs are out of sync with manifest/SKILL.md files.');
  console.error('   Stale files (now updated — please re-stage and commit):');
  stale.forEach(f => console.error(`   ${path.relative(ROOT, f)}`));
  console.error('\n   Run: npm run docs:generate-index && git add docs/user/');
  process.exit(1);
}

console.log('✅ docs/user/SKILLS-INDEX.md and COMMANDS-INDEX.md are up to date.');
