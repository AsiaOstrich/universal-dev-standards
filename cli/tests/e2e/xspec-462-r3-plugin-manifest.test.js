/**
 * E2E: the Claude Code plugin settings do not claim a number of skills that differs from the skills UDS ships
 * (dev-platform XSPEC-462 R3).
 *
 * The report: `.claude-plugin/plugin.json` said "25 comprehensive skills" and `marketplace.json` said "23
 * skills" while the plugin loads 56. `cli/scripts/check-plugin-manifest.mjs` counts the folders under `skills/`
 * that hold a SKILL.md and fails when a description (or `.claude-plugin/README.md`) names another number. A
 * description with no number passes.
 *
 * The script is the entry (CI runs `npm run check:plugin-manifest` in its own job); every test here runs it as
 * CI does and reads its exit code and output. The real repository is measured by the first test; the others
 * hand it files with a wrong or right number through its --plugin / --marketplace / --readme / --skills-dir
 * options, so the red arms never touch the real settings.
 *
 * Wire that makes these red when cut (one line of CLI source):
 *   cli/scripts/check-plugin-manifest.mjs   const verdict = judgePluginDescriptions(descriptions, shipped);
 */

import { it, expect, afterAll } from 'vitest';
import { spawnSync } from 'child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join, resolve } from 'path';

const CLI = resolve(import.meta.dirname, '../..');
const REPO = resolve(CLI, '..');
const RUNNER = join(CLI, 'scripts', 'check-plugin-manifest.mjs');

const scratch = mkdtempSync(join(tmpdir(), 'uds-plugin-manifest-test-'));
afterAll(() => rmSync(scratch, { recursive: true, force: true }));

let counter = 0;
const write = (name, text) => {
  const path = join(scratch, `${++counter}-${name}`);
  writeFileSync(path, text);
  return path;
};
const json = (value) => JSON.stringify(value, null, 2);

function run(args = []) {
  const r = spawnSync('node', [RUNNER, ...args], { cwd: CLI, encoding: 'utf-8', timeout: 60000 });
  return { code: r.status, stdout: r.stdout, stderr: r.stderr, out: (r.stdout || '') + (r.stderr || '') };
}

/** The number of skills UDS ships, counted here (not by the script): folders directly under skills/ with a SKILL.md. */
const shippedCount = () => readdirSync(join(REPO, 'skills'), { withFileTypes: true })
  .filter((e) => e.isDirectory() && existsSync(join(REPO, 'skills', e.name, 'SKILL.md'))).length;

const realPlugin = () => JSON.parse(readFileSync(join(REPO, '.claude-plugin', 'plugin.json'), 'utf-8'));
const realMarketplace = () => JSON.parse(readFileSync(join(REPO, '.claude-plugin', 'marketplace.json'), 'utf-8'));

it('the plugin settings in this repository claim no skill count that differs from the skills UDS ships, and the script counted the same folders the test counted (XSPEC-462 R3)', () => {
  const n = shippedCount();
  expect(n, 'control: UDS ships far more than the 25 the old description claimed').toBeGreaterThan(40);

  const r = run();
  expect(r.code, r.out).toBe(0);
  expect(r.stdout).toContain(`skill folders (with a SKILL.md): ${n}`);
  expect(r.stdout).toMatch(/texts examined: 4 /);
  expect(r.stdout).toContain('no skill count in the plugin settings differs from the skills UDS ships');

  // And the real descriptions: whatever number they carry (none, today) is the shipped one.
  for (const text of [realPlugin().description, realMarketplace().plugins[0].description]) {
    for (const m of text.matchAll(/(\d+)\s+(?:[A-Za-z-]+\s+){0,2}skills?\b/gi)) expect(Number(m[1])).toBe(n);
  }
});

it('a plugin.json description that says 25 skills fails the check, names the file and the number, and the same description with the true number passes (XSPEC-462 R3)', () => {
  const n = shippedCount();
  const base = realPlugin();

  const wrong = write('plugin.json', json({ ...base, description: 'Skills for development standards. Supports 25 comprehensive skills for the full development lifecycle.' }));
  const bad = run(['--plugin', wrong]);
  expect(bad.code, bad.out).toBe(1);
  expect(bad.stdout).toContain('.claude-plugin/plugin.json description says "25 comprehensive skills"');
  expect(bad.stdout).toContain(`skills/ holds ${n} skills`);

  const right = write('plugin.json', json({ ...base, description: `Skills for development standards. Supports ${n} comprehensive skills for the full development lifecycle.` }));
  const good = run(['--plugin', right]);
  expect(good.code, good.out).toBe(0);
  expect(good.stdout, 'control: the true number was seen as a claim, not skipped').toContain(`"${n} comprehensive skills"`);
  expect(good.stdout).toMatch(/skill counts claimed: 1\b/);

  // A number that is not a skill count (a version, a year) is not a claim.
  const notACount = write('plugin.json', json({ ...base, description: 'Skills for the 2026 standards, release 6.13 and later.' }));
  expect(run(['--plugin', notACount]).code).toBe(0);
});

it('a wrong skill count in marketplace.json, in its metadata, or in the plugin README fails the check, each naming where it is (XSPEC-462 R3)', () => {
  const market = realMarketplace();

  const inEntry = write('marketplace.json', json({ ...market, plugins: [{ ...market.plugins[0], description: '23 skills for development standards.' }] }));
  const a = run(['--marketplace', inEntry]);
  expect(a.code, a.out).toBe(1);
  expect(a.stdout).toContain('marketplace.json plugins[0].description says "23 skills"');

  const inMeta = write('marketplace.json', json({ ...market, metadata: { ...market.metadata, description: 'Official marketplace with 30 skills.' } }));
  const b = run(['--marketplace', inMeta]);
  expect(b.code, b.out).toBe(1);
  expect(b.stdout).toContain('marketplace.json metadata.description says "30 skills"');

  const readme = write('README.md', '# Plugin\n\nThe plugin includes 15 skills covering the full development lifecycle.\n');
  const c = run(['--readme', readme]);
  expect(c.code, c.out).toBe(1);
  expect(c.stdout).toContain('.claude-plugin/README.md says "15 skills"');
});

it('only a folder that holds a SKILL.md counts as a skill: three skill folders, a folder without SKILL.md and a loose file are three skills (XSPEC-462 R3)', () => {
  const skills = join(scratch, `skills-${++counter}`);
  for (const name of ['alpha', 'beta', 'gamma']) {
    mkdirSync(join(skills, name), { recursive: true });
    writeFileSync(join(skills, name, 'SKILL.md'), `# ${name}\n`);
  }
  mkdirSync(join(skills, 'commands'), { recursive: true });
  writeFileSync(join(skills, 'commands', 'init.md'), '# not a skill\n');
  writeFileSync(join(skills, 'README.md'), '# loose file\n');
  const base = realPlugin();

  const three = run(['--skills-dir', skills, '--plugin', write('plugin.json', json({ ...base, description: 'Includes 3 skills.' }))]);
  expect(three.code, three.out).toBe(0);
  expect(three.stdout).toContain('skill folders (with a SKILL.md): 3');

  const five = run(['--skills-dir', skills, '--plugin', write('plugin.json', json({ ...base, description: 'Includes 5 skills.' }))]);
  expect(five.code, five.out).toBe(1);
  expect(five.stdout).toContain('skills/ holds 3 skills');
});

it('the check exits 2, not 0 and not 1, when it cannot measure: a settings file that is not JSON, no skill folder at all, no description (XSPEC-462 R3)', () => {
  const notJson = run(['--plugin', write('plugin.json', '{ not json')]);
  expect(notJson.code, notJson.out).toBe(2);
  expect(notJson.stderr).toContain('CANNOT MEASURE');

  const empty = join(scratch, `empty-skills-${++counter}`);
  mkdirSync(empty, { recursive: true });
  const none = run(['--skills-dir', empty]);
  expect(none.code, none.out).toBe(2);
  expect(none.stderr).toContain('no skill folder');

  const noDescription = run(['--plugin', write('plugin.json', json({ name: 'x', version: '1.0.0' }))]);
  expect(noDescription.code, noDescription.out).toBe(2);
  expect(noDescription.stderr).toContain('has no description');
});
