/**
 * E2E: `uds list` shows every standard it counts (dev-platform XSPEC-471 R4, found while writing its acceptance steps).
 *
 * The defect: the "Total" line counted every standard in the registry (163) but the listing walked a fixed list of
 * five categories, so 82 standards (categories core, testing, security, deployment, operations) were counted and never
 * shown, and `uds list --category core` was refused as an unknown category.
 *
 * Every test spawns the real CLI and reads the printed list back. The expected numbers are read from the registry
 * file with a plain loop, not from the code under test.
 *
 * Wire that makes these red when cut (one line of CLI source):
 *   cli/src/commands/list.js   const categoryOrder = [...CATEGORY_ORDER, ...Object.keys(grouped)
 */

import { it, expect, afterAll } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { createHarness, REAL_CLI_DIR } from '../utils/staged-cli-harness.js';

const h = createHarness('xspec471-r4-list');
afterAll(() => h.cleanup());

/** standards-registry.json read as a person would count it: how many standards each category holds. */
function registryCounts() {
  const registry = JSON.parse(readFileSync(join(REAL_CLI_DIR, 'standards-registry.json'), 'utf8'));
  const counts = {};
  let total = 0;
  for (const standard of registry.standards) {
    counts[standard.category] = (counts[standard.category] || 0) + 1;
    total += 1;
  }
  return { counts, total };
}

/** The category headings of the listing: "Core Standard (59)" -> { 'Core Standard': 59 }. Standards are indented, headings are not. */
function headings(stdout) {
  const found = {};
  for (const line of stdout.split('\n')) {
    const m = /^([A-Z][A-Za-z ]*) \((\d+)\)$/.exec(line.trimEnd());
    if (m) found[m[1]] = Number(m[2]);
  }
  return found;
}

it('uds list shows every standard it counts: the numbers in the category headings add up to the Total line and to the registry (XSPEC-471 R4)', async () => {
  const dir = h.makeDir('list');
  const run = await h.runCli(['list'], dir);
  expect(run.code, run.stdout + run.stderr).toBe(0);

  const total = Number(/Total: (\d+) standards/.exec(run.stdout)[1]);
  const shown = Object.values(headings(run.stdout)).reduce((a, b) => a + b, 0);
  const registry = registryCounts();

  expect(total).toBe(registry.total);
  expect(shown).toBe(total);

  // The five categories that used to be left out are in the list, each with the count the registry holds.
  const byName = headings(run.stdout);
  expect(byName['Core Standard']).toBe(registry.counts.core);
  expect(byName['Testing Standard']).toBe(registry.counts.testing);
  expect(byName['Security Standard']).toBe(registry.counts.security);
  expect(byName['Deployment Standard']).toBe(registry.counts.deployment);
  expect(byName['Operations Standard']).toBe(registry.counts.operations);
  // and a standard of one of them is there by name
  expect(run.stdout).toContain('Governance Layer Standard');
  expect(run.stdout).toContain('Disaster Recovery Drill Standards');
});

it('uds list --category core lists only the core standards, and an unknown category names the valid ones including core (XSPEC-471 R4)', async () => {
  const dir = h.makeDir('list');
  const core = await h.runCli(['list', '--category', 'core'], dir);
  expect(core.code, core.stdout + core.stderr).toBe(0);
  expect(core.stdout).toContain('Category: Core Standard');
  expect(headings(core.stdout)).toEqual({ 'Core Standard': registryCounts().counts.core });
  expect(core.stdout).not.toContain('Disaster Recovery Drill Standards');

  const unknown = await h.runCli(['list', '--category', 'no-such-category'], dir);
  expect(unknown.code).toBe(1);
  expect(unknown.stdout).toContain("Unknown category 'no-such-category'");
  expect(unknown.stdout).toMatch(/Valid categories: skill, reference, core, testing, security, deployment, operations, extension, integration, template/);
});
