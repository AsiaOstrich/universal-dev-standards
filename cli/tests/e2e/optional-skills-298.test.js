/**
 * E2E: optional skills are optional, and one skill can be added or removed (issue #298).
 *
 * Reported: `open-work` calls itself optional (changelog and skill text), yet `uds update --apply`
 * installed it into every tool folder of a project that never chose it. There was also no way to take one
 * skill out: a hand-deleted skill came back on the next update, because the desired set is "what UDS ships".
 *
 * These tests run the real CLI (`bin/uds.js init` / `update`) in a throwaway git project and read the
 * effect back from disk: the skill folders of two AI tools (Cursor and Claude Code) and
 * `.standards/manifest.json`. HOME and git's global config point at throwaway places.
 *
 * The expected values are written down here (folder names, the manifest keys, the sentences the output must
 * say), not computed with the code under test.
 *
 * Cut points (each one makes a specific test below go red when the line is removed; see the report):
 *   cli/src/reconciler/desired-state-calculator.js  ... // wire:plan-uses-skill-selection
 *   cli/src/utils/skills-installer.js               ... // wire:install-uses-skill-selection
 *   cli/src/utils/skill-selection.js                ... // wire:optional-skill-kept-on-disk
 *   cli/src/commands/update.js                      ... // wire:add-skill-installs
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir, devNull } from 'node:os';
import { join, resolve } from 'node:path';
import { isolatedHome } from '../../../scripts/lib/isolated-home.mjs';
import { stripAnsi } from '../utils/cli-runner.js';

const CLI = resolve(import.meta.dirname, '../../bin/uds.js');
const MANIFEST = join('.standards', 'manifest.json');

// Two tools, so "every tool folder" is more than one folder.
const TOOL_SKILL_DIRS = [join('.cursor', 'skills'), join('.claude', 'skills')];

const OPEN_WORK = 'open-work-assistant'; // the optional skill's folder; its name is `open-work`
const COMMIT = 'commit-standards'; // an ordinary skill; its name is `commit`
const TDD = 'tdd-assistant'; // another ordinary skill, used as the control

let root;
let home;
let template; // an initialised project, copied for each case

function run(args, cwd) {
  const r = spawnSync(process.execPath, [CLI, ...args], {
    cwd,
    encoding: 'utf8',
    timeout: 120000,
    env: { ...home.env, FORCE_COLOR: '0', NO_COLOR: '1', GIT_CONFIG_GLOBAL: devNull, GIT_CONFIG_NOSYSTEM: '1' }
  });
  return { status: r.status, text: stripAnsi(`${r.stdout}\n${r.stderr}`) };
}

const manifestOf = (dir) => JSON.parse(readFileSync(join(dir, MANIFEST), 'utf8'));
const hasSkill = (dir, tool, folder) => existsSync(join(dir, tool, folder, 'SKILL.md'));
const everyTool = (dir, folder) => TOOL_SKILL_DIRS.map((tool) => hasSkill(dir, tool, folder));

/** A fresh copy of the initialised project. */
function project(name) {
  const dir = join(root, name);
  cpSync(template, dir, { recursive: true });
  return dir;
}

beforeAll(() => {
  root = mkdtempSync(join(tmpdir(), 'uds-test-298-'));
  home = isolatedHome({ prefix: 'uds-test-298-home-' });
  template = join(root, 'template');
  mkdirSync(template, { recursive: true });
  expect(spawnSync('git', ['init', '-q'], { cwd: template, env: { ...home.env, GIT_CONFIG_GLOBAL: devNull } }).status).toBe(0);
  writeFileSync(join(template, '.cursorrules'), '# my own Cursor rules\n'); // makes Cursor the detected tool
  mkdirSync(join(template, '.claude'), { recursive: true }); // and Claude Code
  writeFileSync(join(template, 'CLAUDE.md'), '# my own Claude instructions\n');
  writeFileSync(join(template, 'package.json'), JSON.stringify({ name: 'fixture-298', version: '1.0.0' }));
  const init = run(['init', '-y', '--skills-location', 'project', '--format', 'ai'], template);
  expect(init.status).toBe(0);
  // The harness must be able to fail: two tools, and ordinary skills are on disk in both.
  expect(manifestOf(template).skills.installations).toEqual([
    { agent: 'cursor', level: 'project' },
    { agent: 'claude-code', level: 'project' }
  ]);
  expect(everyTool(template, COMMIT)).toEqual([true, true]);
}, 240000);

afterAll(() => {
  if (root) rmSync(root, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
  home?.cleanup();
});

describe('E2E: an optional skill is not installed unless the project asks (issue #298)', () => {
  it('(a) a clean init leaves open-work out of every tool folder and out of the manifest', () => {
    expect(everyTool(template, OPEN_WORK)).toEqual([false, false]);
    expect(manifestOf(template).skills.names).not.toContain(OPEN_WORK);
    expect(manifestOf(template).skills.names).toContain(COMMIT); // the ordinary ones are there
  });

  it('(a) --plan does not plan it, and says it is optional and how to add it', () => {
    const dir = project('a-plan');
    const run1 = run(['update', '--plan', '--offline'], dir);
    expect(run1.status).toBe(0);
    expect(run1.text).toContain('Reconciliation Plan'); // the plan ran
    const planPart = run1.text.split('Optional skills')[0]; // the plan itself; the section after it names the skill on purpose
    expect(planPart).not.toContain(OPEN_WORK);
    expect(planPart).toContain('No changes needed');
    expect(run1.text).toContain('Optional skills');
    expect(run1.text).toContain('uds update --add-skill open-work');
  }, 150000);

  it('(a) --apply and --skills do not install it either', () => {
    const dir = project('a-apply');
    // Make both runs have work to do: an ordinary skill is gone, so a real install happens.
    rmSync(join(dir, '.cursor', 'skills', TDD), { recursive: true, force: true });
    rmSync(join(dir, '.claude', 'skills', TDD), { recursive: true, force: true });
    expect(everyTool(dir, TDD)).toEqual([false, false]);

    const applied = run(['update', '--apply', '--yes', '--offline'], dir);
    expect(applied.status).toBe(0);
    expect(everyTool(dir, TDD)).toEqual([true, true]); // control: the apply wrote ordinary skills back
    expect(everyTool(dir, OPEN_WORK)).toEqual([false, false]);
    expect(applied.text, 'an apply that changed something still says what it leaves out').toContain('uds update --add-skill open-work');

    expect(run(['update', '--skills', '--offline'], dir).status).toBe(0);
    expect(everyTool(dir, OPEN_WORK)).toEqual([false, false]);
    expect(manifestOf(dir).skills.names).not.toContain(OPEN_WORK);
  }, 240000);
});

describe('E2E: --add-skill (issue #298)', () => {
  it('(b) installs the optional skill into every tool folder now, records the choice, and a later update keeps it', () => {
    const dir = project('b-add');
    const before = run(['update', '--add-skill', 'open-work', '--offline'], dir);
    expect(before.status).toBe(0);
    expect(everyTool(dir, OPEN_WORK)).toEqual([true, true]);
    expect(manifestOf(dir).skills.extra).toEqual([OPEN_WORK]);
    expect(manifestOf(dir).skills.names).toContain(OPEN_WORK);
    // `uds check` verifies skill files from the hashes: the new skill's files are recorded
    expect(Object.keys(manifestOf(dir).skillHashes).some((k) => k.startsWith(`cursor/project/${OPEN_WORK}/`))).toBe(true);

    expect(run(['update', '--apply', '--yes', '--offline'], dir).status).toBe(0);
    expect(run(['update', '--skills', '--offline'], dir).status).toBe(0);
    expect(everyTool(dir, OPEN_WORK)).toEqual([true, true]);
    expect(manifestOf(dir).skills.extra).toEqual([OPEN_WORK]);

    const plan = run(['update', '--plan', '--offline'], dir);
    expect(plan.text).not.toMatch(/Delete: [1-9]/);
  }, 300000);

  it('(b) accepts the folder name as well as the skill name', () => {
    const dir = project('b-folder-name');
    expect(run(['update', '--add-skill', OPEN_WORK, '--offline'], dir).status).toBe(0);
    expect(everyTool(dir, OPEN_WORK)).toEqual([true, true]);
  }, 150000);

  it('(b) --plan with --add-skill says what it would do and writes nothing', () => {
    const dir = project('b-plan');
    const manifestBefore = readFileSync(join(dir, MANIFEST), 'utf8');
    const res = run(['update', '--add-skill', 'open-work', '--plan', '--offline'], dir);
    expect(res.status).toBe(0);
    expect(res.text).toContain('would add open-work');
    expect(everyTool(dir, OPEN_WORK)).toEqual([false, false]);
    expect(readFileSync(join(dir, MANIFEST), 'utf8')).toBe(manifestBefore);
  }, 150000);

  it('(b) adding a skill does not make the other skills look up to date', () => {
    const dir = project('b-versions');
    const manifest = manifestOf(dir);
    manifest.skills.version = '6.11.0';
    writeFileSync(join(dir, MANIFEST), JSON.stringify(manifest, null, 2));
    const recorded = JSON.parse(readFileSync(join(dir, '.cursor', 'skills', '.manifest.json'), 'utf8')).version;

    expect(run(['update', '--add-skill', 'open-work', '--offline'], dir).status).toBe(0);
    expect(JSON.parse(readFileSync(join(dir, '.cursor', 'skills', '.manifest.json'), 'utf8')).version).toBe(recorded);
    expect(manifestOf(dir).skills.version).toBe('6.11.0');
  }, 150000);
});

describe('E2E: --remove-skill (issue #298)', () => {
  it('(c) removes an ordinary skill from every tool folder and records it; the plan and check leave it out', () => {
    const dir = project('c-remove');
    expect(everyTool(dir, COMMIT)).toEqual([true, true]);

    const res = run(['update', '--remove-skill', 'commit', '--offline'], dir);
    expect(res.status).toBe(0);
    expect(everyTool(dir, COMMIT)).toEqual([false, false]);
    expect(everyTool(dir, TDD)).toEqual([true, true]); // only that one
    const manifest = manifestOf(dir);
    expect(manifest.skills.excluded).toEqual([COMMIT]);
    expect(manifest.skills.names).not.toContain(COMMIT);
    expect(Object.keys(manifest.skillHashes).filter((k) => k.includes(`/${COMMIT}/`))).toEqual([]);

    // The plan does not plan to install it, and `uds check` does not call it missing.
    const plan = run(['update', '--plan', '--offline'], dir);
    expect(plan.text).toContain('Reconciliation Plan');
    const planPart = plan.text.split('Optional skills')[0]; // the plan itself; the section after it names the skill on purpose
    expect(planPart).not.toContain(COMMIT);
    expect(planPart).toContain('No changes needed');
    expect(plan.text).toContain(`${COMMIT}): removed by this project`);
    expect(run(['check', '--offline'], dir).status).toBe(0);
  }, 300000);

  it('(c) --apply --yes and --skills write ordinary skills back but not the removed one', () => {
    const dir = project('c-paths');
    expect(run(['update', '--remove-skill', 'commit', '--offline'], dir).status).toBe(0);
    rmSync(join(dir, '.cursor', 'skills', TDD), { recursive: true, force: true });
    rmSync(join(dir, '.claude', 'skills', TDD), { recursive: true, force: true });

    expect(run(['update', '--apply', '--yes', '--offline'], dir).status).toBe(0);
    expect(everyTool(dir, TDD)).toEqual([true, true]); // control: the apply did write skills
    expect(everyTool(dir, COMMIT)).toEqual([false, false]);

    rmSync(join(dir, '.cursor', 'skills', TDD), { recursive: true, force: true });
    expect(run(['update', '--skills', '--offline'], dir).status).toBe(0);
    expect(everyTool(dir, TDD)).toEqual([true, true]); // control: --skills wrote skills
    expect(everyTool(dir, COMMIT)).toEqual([false, false]);
    expect(manifestOf(dir).skills.names).not.toContain(COMMIT);
  }, 300000);

  it('(c) --add-skill puts a removed skill back and forgets the exclusion', () => {
    const dir = project('c-undo');
    expect(run(['update', '--remove-skill', 'commit', '--offline'], dir).status).toBe(0);
    expect(run(['update', '--add-skill', 'commit', '--offline'], dir).status).toBe(0);
    expect(everyTool(dir, COMMIT)).toEqual([true, true]);
    expect(manifestOf(dir).skills.excluded).toBeUndefined();
  }, 150000);

  it('(c) --remove-skill with --apply removes first and then applies, keeping the choice', () => {
    const dir = project('c-with-apply');
    const res = run(['update', '--remove-skill', 'commit', '--apply', '--yes', '--offline'], dir);
    expect(res.status).toBe(0);
    expect(everyTool(dir, COMMIT)).toEqual([false, false]);
    expect(manifestOf(dir).skills.excluded).toEqual([COMMIT]);
  }, 200000);
});

describe('E2E: an optional skill that is already installed stays (beta.1 projects)', () => {
  /** A project the way 6.15.0-beta.1 left it: open-work is in every tool folder and the manifest records no choice. */
  function beta1Project(name) {
    const dir = project(name);
    expect(run(['update', '--add-skill', 'open-work', '--offline'], dir).status).toBe(0);
    const manifest = manifestOf(dir);
    delete manifest.skills.extra;
    writeFileSync(join(dir, MANIFEST), JSON.stringify(manifest, null, 2));
    expect(everyTool(dir, OPEN_WORK)).toEqual([true, true]);
    expect(manifestOf(dir).skills.extra).toBeUndefined();
    return dir;
  }

  it('(d) --plan does not plan to delete it, and it is updated like any other skill', () => {
    const dir = beta1Project('d-plan');
    const file = join(dir, '.claude', 'skills', OPEN_WORK, 'SKILL.md');
    writeFileSync(file, `${readFileSync(file, 'utf8')}\nLOCAL DRIFT\n`);

    const plan = run(['update', '--plan', '--offline'], dir);
    expect(plan.text).toContain('Reconciliation Plan');
    expect(plan.text).not.toMatch(/Delete: [1-9]/);
    expect(plan.text).toContain(OPEN_WORK); // planned as an update of the skill that is there

    expect(run(['update', '--apply', '--yes', '--offline'], dir).status).toBe(0);
    expect(everyTool(dir, OPEN_WORK)).toEqual([true, true]);
    expect(readFileSync(file, 'utf8')).not.toContain('LOCAL DRIFT'); // and it was refreshed
  }, 300000);

  it('(d) --apply --yes keeps the folders on disk', () => {
    const dir = beta1Project('d-apply');
    const res = run(['update', '--apply', '--yes', '--offline'], dir);
    expect(res.status).toBe(0);
    expect(everyTool(dir, OPEN_WORK)).toEqual([true, true]);
  }, 200000);

  it('(d) --skills keeps it too', () => {
    const dir = beta1Project('d-skills');
    expect(run(['update', '--skills', '--offline'], dir).status).toBe(0);
    expect(everyTool(dir, OPEN_WORK)).toEqual([true, true]);
  }, 200000);

  it('(d) removing it is still possible, and the removal beats "already on disk"', () => {
    const dir = beta1Project('d-remove');
    expect(run(['update', '--remove-skill', 'open-work', '--offline'], dir).status).toBe(0);
    expect(everyTool(dir, OPEN_WORK)).toEqual([false, false]);
    expect(manifestOf(dir).skills.excluded).toEqual([OPEN_WORK]);
    expect(run(['update', '--apply', '--yes', '--offline'], dir).status).toBe(0);
    expect(run(['update', '--skills', '--offline'], dir).status).toBe(0);
    expect(everyTool(dir, OPEN_WORK)).toEqual([false, false]);
  }, 300000);
});

describe('E2E: a name UDS does not ship is an error (issue #298)', () => {
  it.each([
    ['--add-skill', 'no-such-skill'],
    ['--remove-skill', 'no-such-skill']
  ])('(e) %s %s exits non-zero, lists the names that work, and writes nothing', (flag, name) => {
    const dir = project(`e-${flag.slice(2)}`);
    const manifestBefore = readFileSync(join(dir, MANIFEST), 'utf8');
    const res = run(['update', flag, name, '--offline'], dir);
    expect(res.status).not.toBe(0);
    expect(res.text).toContain(`Unknown skill '${name}'`);
    expect(res.text).toContain('open-work (open-work-assistant)'); // the names you can use
    expect(res.text).toContain('commit (commit-standards)');
    expect(readFileSync(join(dir, MANIFEST), 'utf8')).toBe(manifestBefore);
    expect(everyTool(dir, COMMIT)).toEqual([true, true]);
  }, 150000);

  it('(e) one bad name stops the good one next to it from being applied', () => {
    const dir = project('e-mixed');
    const res = run(['update', '--remove-skill', 'commit', '--remove-skill', 'nope', '--offline'], dir);
    expect(res.status).not.toBe(0);
    expect(everyTool(dir, COMMIT)).toEqual([true, true]);
    expect(manifestOf(dir).skills.excluded).toBeUndefined();
  }, 150000);

  it('(e) the same skill named by both flags is refused', () => {
    const dir = project('e-both');
    const res = run(['update', '--add-skill', 'commit', '--remove-skill', 'commit-standards', '--offline'], dir);
    expect(res.status).not.toBe(0);
    expect(everyTool(dir, COMMIT)).toEqual([true, true]);
  }, 150000);
});
