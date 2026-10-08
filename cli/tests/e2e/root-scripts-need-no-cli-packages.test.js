/**
 * E2E: the repo-root scripts that CI runs without installing the CLI's packages really run without them.
 * Evidence for the CI fix after XSPEC-468 (run 37749469850).
 *
 * What broke: `scripts/generate-adoption-skills.mjs` imported `parseFrontmatter` from
 * `cli/src/utils/skills-installer.js`. When XSPEC-468 made that file import `chalk`, the "Self-Adoption Skill
 * Drift Gate" (which installs nothing) and "Bump/Sync Roundtrip" (which installs only the root packages) died with
 * ERR_MODULE_NOT_FOUND. Every local run passed, because `cli/node_modules` exists here. The coupling was hidden
 * for the same reason: a root script reaching into `cli/src` is fine only while everything it reaches imports
 * Node built-ins alone.
 *
 * What this runs: the script's own `--self-test` in a throwaway tree that holds the script, `cli/src` and the
 * data it reads — and NO node_modules anywhere above it. It is the CI job's situation, reproduced locally.
 *
 * Wire that makes it red when cut (one line of source):
 *   scripts/generate-adoption-skills.mjs   } from '../cli/src/utils/skill-frontmatter.js';
 * (pointing it back at skills-installer.js makes the child die with ERR_MODULE_NOT_FOUND for 'chalk').
 */

import { it, expect, afterAll } from 'vitest';
import { spawnSync } from 'child_process';
import { cpSync, mkdtempSync, mkdirSync, rmSync, existsSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import { join, resolve } from 'path';
import { REAL_REPO } from '../utils/staged-cli-harness.js';

const roots = [];
afterAll(() => { for (const r of roots) rmSync(r, { recursive: true, force: true }); });

/** The minimum tree `generate-adoption-skills.mjs --self-test` reads — and no node_modules. */
function bareTree() {
  const root = mkdtempSync(join(tmpdir(), 'uds-test-bare-root-'));
  roots.push(root);
  const copy = (rel) => { mkdirSync(resolve(root, rel, '..'), { recursive: true }); cpSync(join(REAL_REPO, rel), join(root, rel), { recursive: true }); };
  copy('scripts/generate-adoption-skills.mjs');
  copy('cli/src');
  copy('cli/package.json');
  copy('package.json');
  copy('skills');
  copy('locales/zh-TW/skills');
  copy('integrations/REGISTRY.json');
  return root;
}

it('scripts/generate-adoption-skills.mjs --self-test runs and passes in a tree with no node_modules, as in the CI jobs that install nothing', () => {
  const root = bareTree();
  // control: this tree really has nothing installed, so a missing package cannot be rescued from above
  expect(existsSync(join(root, 'node_modules')) || existsSync(join(root, 'cli', 'node_modules'))).toBe(false);
  expect(existsSync(join(tmpdir(), 'node_modules')), 'control: nothing above the temp tree either').toBe(false);

  const r = spawnSync(process.execPath, [join(root, 'scripts', 'generate-adoption-skills.mjs'), '--self-test'], { cwd: root, encoding: 'utf-8', timeout: 120000 });
  const out = `${r.stdout}\n${r.stderr}`;
  expect(out).not.toMatch(/ERR_MODULE_NOT_FOUND|Cannot find package/);
  expect(r.status, out.slice(-1500)).toBe(0);
  expect(out).toMatch(/9\/9|all .*arm/i);
}, 180000);

it('the root script imports the frontmatter helpers from a file that imports Node built-ins only', () => {
  const leaf = readFileSync(join(REAL_REPO, 'cli', 'src', 'utils', 'skill-frontmatter.js'), 'utf-8');
  const imports = [...leaf.matchAll(/^\s*import\s[^;]*?from\s+['"]([^'"]+)['"]/gm)].map((m) => m[1]);
  expect(imports.filter((i) => !/^(node:|fs$|path$|url$|os$|crypto$)/.test(i)), 'the leaf module imports nothing but Node built-ins').toEqual([]);
  const script = readFileSync(join(REAL_REPO, 'scripts', 'generate-adoption-skills.mjs'), 'utf-8');
  expect(script).toContain("from '../cli/src/utils/skill-frontmatter.js'");
  expect(script).not.toContain("from '../cli/src/utils/skills-installer.js'");
});
