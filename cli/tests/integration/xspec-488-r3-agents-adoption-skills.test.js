/**
 * Integration (the real script as a child process, not mocks): the self-adoption skill generator derives and gates `.agents/skills/` (Google Antigravity, shared with
 * Codex) as well as `.claude/skills/` — XSPEC-488 R3.
 *
 * Why this exists: a copy installed once with `uds config --type skills --ai-tool antigravity` sits outside the
 * "Self-Adoption Skill Drift Gate" and goes stale without anything turning red. The generator
 * (`scripts/generate-adoption-skills.mjs`, `npm run docs:adoption-skills` / `check:adoption-skills`) now derives
 * both copies from `skills/` + `locales/`, and `--check` fails when either one differs from its sources.
 *
 * This lives in tests/integration/ and not tests/e2e/ on purpose: tests/unit/testing/test-strategy.test.js caps the
 * e2e share of test files at 30%, and the e2e directory was already at 29.8%, so one more file there fails it.
 *
 * Every test runs the REAL script as a child process in a throwaway copy of the tree it reads (the script is
 * copied at test time, so a mutation of the source is what runs) and reads back its exit code, its output and
 * the files it wrote. Each test builds its own tree, so each passes when selected on its own.
 *
 * Wires that make these red when cut (one line of source each):
 *   scripts/generate-adoption-skills.mjs   return { targets: oneTargetPerDirectory(targets, excluded), excluded };
 *     // cutting it derives `.agents/skills` twice (antigravity and codex) -> the clean tree no longer checks clean
 *   scripts/generate-adoption-skills.mjs   targets.push({ agent: agentKey, dir: rel, abs });
 *     // cutting it leaves `.agents/skills` (and every other copy) un-derived -> removal and drift go unreported
 */

import { it, expect, afterAll } from 'vitest';
import { spawnSync } from 'child_process';
import {
  cpSync, mkdtempSync, mkdirSync, rmSync, existsSync, readFileSync, readdirSync, statSync, writeFileSync
} from 'fs';
import { tmpdir } from 'os';
import { join, relative, resolve } from 'path';
import { REAL_REPO, stripAnsi } from '../utils/staged-cli-harness.js';
import { installSkillsForAgent } from '../../src/utils/skills-installer.js';

const made = [];
afterAll(() => { for (const d of made) rmSync(d, { recursive: true, force: true }); });

const SCRIPT = join('scripts', 'generate-adoption-skills.mjs');

/** A throwaway copy of the files the generator reads and writes (no node_modules anywhere). */
function tree() {
  const root = mkdtempSync(join(tmpdir(), 'uds-xspec488-r3-'));
  made.push(root);
  const copy = (rel) => { mkdirSync(resolve(root, rel, '..'), { recursive: true }); cpSync(join(REAL_REPO, rel), join(root, rel), { recursive: true }); };
  for (const rel of [
    SCRIPT, 'cli/src', 'cli/package.json', 'package.json', 'skills', 'locales/zh-TW/skills',
    'integrations/REGISTRY.json', '.claude/skills', '.agents/skills'
  ]) copy(rel);
  return root;
}

function run(root, ...args) {
  const r = spawnSync(process.execPath, [join(root, SCRIPT), ...args], { cwd: root, encoding: 'utf-8', timeout: 120000 });
  return { status: r.status, out: stripAnsi(`${r.stdout}\n${r.stderr}`) };
}

/** Skill directory names under `dir`: the directories holding a SKILL.md. */
function skillIds(dir) {
  return readdirSync(dir).filter((d) => statSync(join(dir, d)).isDirectory() && existsSync(join(dir, d, 'SKILL.md'))).sort();
}

/** Every file under `dir` as a relative path with `/`, sorted. */
function filesUnder(dir) {
  const out = [];
  const walk = (d) => {
    for (const e of readdirSync(d)) {
      const p = join(d, e);
      if (statSync(p).isDirectory()) walk(p); else out.push(relative(dir, p).split('\\').join('/'));
    }
  };
  walk(dir);
  return out.sort();
}

/** A skill whose SKILL.md carries a `name:` line and a `Use when:` line; any skill would do. */
const SAMPLE = 'commit-standards';

it('check on the committed tree is green for BOTH copies, naming .agents/skills as antigravity and covering every skill', () => {
  const root = tree();
  const r = run(root, '--check');
  expect(r.status, r.out.slice(-1500)).toBe(0);
  expect(r.out).toMatch(/\.agents\/skills — agent antigravity, locale zh-TW, \d+ skill\(s\)/);
  expect(r.out).toMatch(/\.claude\/skills — agent claude-code, locale zh-TW, \d+ skill\(s\)/);
  expect(r.out).toContain('2 target(s) match their sources');
  // The directory is read by two registry agents; it must be derived once, not once per agent.
  expect(r.out.match(/\.agents\/skills — agent /g)).toHaveLength(1);
  // Read back: the copy holds exactly the skills the source ships (the expected set comes from skills/, not from the script).
  const expected = skillIds(join(root, 'skills'));
  expect(expected).toContain(SAMPLE);
  expect(skillIds(join(root, '.agents', 'skills'))).toEqual(expected);
});

it('the .agents/skills copy the generator writes equals what the real installer puts there for antigravity (zh-TW)', async () => {
  const root = tree();
  // Everything but the manifest (the adoption choice the script reads) is removed, then the script writes the copy.
  const dir = join(root, '.agents', 'skills');
  for (const e of readdirSync(dir)) if (e !== '.manifest.json') rmSync(join(dir, e), { recursive: true, force: true });
  expect(skillIds(dir), 'control: the copy is empty before the script runs').toEqual([]);
  const r = run(root);
  expect(r.status, r.out.slice(-1500)).toBe(0);

  // The other route: the CLI's own installer, which `uds config --type skills --ai-tool antigravity` calls.
  const project = mkdtempSync(join(tmpdir(), 'uds-xspec488-r3-install-'));
  made.push(project);
  const result = await installSkillsForAgent('antigravity', 'project', null, project, 'zh-TW');
  expect(result.success).toBe(true);
  expect(result.installed.length).toBeGreaterThan(40);
  const installed = join(project, '.agents', 'skills');

  const generated = filesUnder(dir).filter((f) => f !== '.manifest.json');
  const viaCli = filesUnder(installed).filter((f) => f !== '.manifest.json');
  expect(generated).toEqual(viaCli);
  for (const f of viaCli) {
    expect(readFileSync(join(dir, ...f.split('/')), 'utf8'), f).toBe(readFileSync(join(installed, ...f.split('/')), 'utf8'));
  }
});

it('a skill deleted from .agents/skills turns check red and names the missing file', () => {
  const root = tree();
  rmSync(join(root, '.agents', 'skills', SAMPLE), { recursive: true, force: true });
  expect(existsSync(join(root, '.agents', 'skills', SAMPLE)), 'control: the mutation really removed it').toBe(false);
  const r = run(root, '--check');
  expect(r.status, r.out.slice(-1500)).toBe(1);
  expect(r.out).toContain(`[MISSING] .agents/skills/${SAMPLE}/SKILL.md`);
  expect(r.out, 'the other copy is untouched and stays clean').not.toContain(`.claude/skills/${SAMPLE}/SKILL.md`);
});

it('a skills/ change that nobody regenerates turns check red for BOTH .claude/skills and .agents/skills', () => {
  const root = tree();
  const src = join(root, 'skills', SAMPLE, 'SKILL.md');
  const before = readFileSync(src, 'utf8');
  // `name:` is one of the frontmatter fields taken from skills/ even for a zh-TW copy, so this edit reaches both outputs.
  const after = before.replace(/^name:\s*(.+)$/m, 'name: $1-edited');
  expect(after, 'control: the mutation really changed the source').not.toBe(before);
  writeFileSync(src, after, 'utf8');
  const r = run(root, '--check');
  expect(r.status, r.out.slice(-1500)).toBe(1);
  expect(r.out).toContain(`[DIFFERS] .agents/skills/${SAMPLE}/SKILL.md`);
  expect(r.out).toContain(`[DIFFERS] .claude/skills/${SAMPLE}/SKILL.md`);
});

it('a hand edit inside .agents/skills is reported there and nowhere else', () => {
  const root = tree();
  const file = join(root, '.agents', 'skills', SAMPLE, 'SKILL.md');
  const before = readFileSync(file, 'utf8');
  const after = before.replace(/^\s*Use when:.*$/im, '  Use when: something else');
  expect(after, 'control: the mutation really changed the copy').not.toBe(before);
  writeFileSync(file, after, 'utf8');
  const r = run(root, '--check');
  expect(r.status, r.out.slice(-1500)).toBe(1);
  expect(r.out).toContain(`[DIFFERS] .agents/skills/${SAMPLE}/SKILL.md`);
  expect(r.out).not.toContain(`[DIFFERS] .claude/skills/`);
});

it('a shared directory whose manifest names none of its agents is "could not derive" (exit 2), not a guess', () => {
  const root = tree();
  const manifest = join(root, '.agents', 'skills', '.manifest.json');
  const m = JSON.parse(readFileSync(manifest, 'utf8'));
  expect(m.agent, 'control: the committed manifest names antigravity').toBe('antigravity');
  writeFileSync(manifest, JSON.stringify({ ...m, agent: 'claude-code' }, null, 2), 'utf8');
  const r = run(root, '--check');
  expect(r.status, r.out.slice(-1500)).toBe(2);
  expect(r.out).toContain('.agents/skills is read by antigravity and codex');
});
