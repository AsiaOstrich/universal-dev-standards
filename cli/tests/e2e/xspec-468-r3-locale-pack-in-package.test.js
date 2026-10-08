/**
 * E2E: the Chinese skill texts are in the npm package and install with the network cut; a copy of UDS that
 * lacks them installs English and SAYS so (dev-platform XSPEC-468 R3).
 *
 * What the spec assumed, and what was measured: XSPEC-468 R3 was written on the belief that the Traditional and
 * Simplified Chinese texts (about 4.6 MB and 4.1 MB) are not in the npm package, so an offline install could
 * only produce English. They are in it: `cli/scripts/prepack.mjs` bundles `locales/` into `bundled/locales/`
 * and the `files` list of `package.json` ships `bundled`. This test measures the PACKAGE, not a checkout:
 *   1. a staging copy of the sources is made (real files, no symlinks) and `npm pack` really runs in it;
 *   2. the tarball is extracted like `npm install <tgz>` lays it down, with nothing above it that could rescue
 *      a missing file (`PathResolver` also looks in `<package>/..`);
 *   3. the CLI that runs is `node <extracted package>/bin/uds.js`, every https/http/fetch call fails at once
 *      and is logged, and any logged call is a failure.
 * All of that is the shared helper `cli/tests/utils/packaged-cli.js`; this file does not start `npm` itself.
 *
 * The one thing that CAN produce English by accident is a copy of UDS whose locale pack is absent (a partial or
 * damaged install). The installer used to fall back to English there with exit 0 and no word about it, the same
 * shape as `zh-CN` becoming English in XSPEC-451. The second and third tests remove the pack from a copy of the
 * installed package and read what `uds init` and `uds update` say.
 *
 * Wire that makes these red when cut (one line of CLI source):
 *   cli/src/commands/init.js   await installSkills(config.skillsConfig, projectPath, msg, skillsResults);
 * Mutations done by hand (not a cut line), each seen red:
 *   - findLocalePackSkillsDir() made to answer with the English folder when the pack is absent (the old silent
 *     fallback): the "says so" tests go red;
 *   - `{ src: 'locales', dest: 'locales' }` taken out of BUNDLE_DIRS in prepack.mjs: the "installs with the
 *     network cut" test goes red (the package has no pack, so the install says it is English).
 *
 * Each `it` builds only what it needs (lazily, once), so each also passes when selected on its own.
 */

import { it, expect, afterAll } from 'vitest';
import { mkdirSync, readFileSync, existsSync, rmSync } from 'fs';
import { join } from 'path';
import { createPackagedWorld } from '../utils/packaged-cli.js';

// The packed-and-extracted package, the copies that must be broken, the blocked network and the throwaway homes
// all come from the shared helper (cli/tests/utils/packaged-cli.js); this file only says what is checked.
const world = createPackagedWorld('uds-test-locale-pack');
afterAll(() => world.dispose());

const CHINESE_HEADING = '# Commit Message 助手';

let counter = 0;
/** A throwaway project with Claude Code's marker, so the skills go to .claude/skills. */
function newProject(label) {
  const project = join(world.sandboxDir(), 'projects', `${label}-${++counter}`);
  mkdirSync(join(project, '.claude'), { recursive: true });
  return project;
}

/** A copy of the installed package, without one locale pack (`bundled/locales/<name>`) when asked. */
async function copyOfPackage(label, withoutPack = null) {
  const copyDir = await world.copyPackage(label);
  if (withoutPack) rmSync(join(copyDir, 'bundled', 'locales', withoutPack), { recursive: true, force: true });
  return copyDir;
}

/** One CLI run of an installed package, network blocked and logged (English output). */
function runPackaged(pkgDir, args, project) {
  return world.uds(pkgDir, ['--ui-lang', 'en', ...args], project, `run-${++counter}`);
}

const skillText = (project) => readFileSync(join(project, '.claude', 'skills', 'commit-standards', 'SKILL.md'), 'utf-8');

// No describe wrapper on purpose: the full test name is the it() title.

it('uds init --locale zh-tw and --locale zh-cn from the packed tarball install the Chinese skill texts with the network cut, without any request or locale warning (XSPEC-468 R3)', async () => {
  const pkgDir = await copyOfPackage('complete');
  // The experiment's premise: the Chinese packs are in the tarball.
  expect(existsSync(join(pkgDir, 'bundled', 'locales', 'zh-TW', 'skills', 'commit-standards', 'SKILL.md'))).toBe(true);
  expect(existsSync(join(pkgDir, 'bundled', 'locales', 'zh-CN', 'skills', 'commit-standards', 'SKILL.md'))).toBe(true);

  for (const locale of ['zh-tw', 'zh-cn']) {
    const project = newProject(`complete-${locale}`);
    const r = await runPackaged(pkgDir, ['init', '--yes', '--skills-location', 'project', '--locale', locale], project);
    const out = r.output;
    expect(r.code, `[${locale}] ${out.slice(-600)}`).toBe(0);
    expect(r.attempts, `[${locale}] network requests`).toEqual([]);
    expect(skillText(project), `[${locale}] the installed skill is the Chinese text`).toContain(CHINESE_HEADING);
    expect(out, `[${locale}] no warning that the pack is missing`).not.toContain('skill texts are not in this copy of UDS');
    expect(out, `[${locale}] no per-skill fallback warning`).not.toContain('Locale fallback');
  }
}, 600000);

it('uds init --locale zh-tw from a copy of UDS that lacks the zh-TW skill texts installs English, says so, and does not blame the network (XSPEC-468 R3)', async () => {
  const brokenDir = await copyOfPackage('without-zh-tw', 'zh-TW');
  expect(existsSync(join(brokenDir, 'bundled', 'locales', 'zh-TW'))).toBe(false);

  const project = newProject('lacks-zh-tw');
  const r = await runPackaged(brokenDir, ['init', '--yes', '--skills-location', 'project', '--locale', 'zh-tw'], project);
  const out = r.output;
  // A fallback that is announced is not a failure: exit 0, English files, a message that names the cause.
  expect(r.code, out.slice(-600)).toBe(0);
  expect(r.attempts, 'network requests').toEqual([]);
  expect(skillText(project)).not.toContain(CHINESE_HEADING);
  expect(out).toContain('The zh-TW skill texts are not in this copy of UDS, so the skills were installed in English.');
  expect(out).toContain('this is not about your network');
  expect(out).toContain('npm install -g universal-dev-standards');
  expect(out).toContain('uds update --apply --skills --locale zh-tw');
  // Said once, not once per skill.
  expect(out.split('skill texts are not in this copy of UDS').length - 1).toBe(1);

  // Control arm, same copy: the zh-CN pack is still there, so zh-cn installs Chinese and says nothing.
  const cn = newProject('lacks-zh-tw-but-zh-cn');
  const rc = await runPackaged(brokenDir, ['init', '--yes', '--skills-location', 'project', '--locale', 'zh-cn'], cn);
  expect(rc.code, rc.output.slice(-600)).toBe(0);
  expect(skillText(cn)).toContain(CHINESE_HEADING);
  expect(rc.output).not.toContain('skill texts are not in this copy of UDS');
}, 600000);

it('uds update --apply --skills --locale zh-tw says the same from a copy that lacks the pack, and the command it names installs the Chinese texts from a complete copy (XSPEC-468 R3)', async () => {
  const brokenDir = await copyOfPackage('without-zh-tw-update', 'zh-TW');
  const completeDir = await copyOfPackage('complete-update');

  // A project that was installed in English from the broken copy (what the adopter has after the warning).
  const project = newProject('update-after-warning');
  const first = await runPackaged(brokenDir, ['init', '--yes', '--skills-location', 'project', '--locale', 'zh-tw'], project);
  expect(first.code, first.output.slice(-600)).toBe(0);
  expect(skillText(project)).not.toContain(CHINESE_HEADING);

  // update from the same broken copy: still English, and it says so again.
  const again = await runPackaged(brokenDir, ['update', '--apply', '--skills', '--yes', '--locale', 'zh-tw'], project);
  const againOut = again.output;
  expect(again.code, againOut.slice(-600)).toBe(0);
  expect(againOut).toContain('The zh-TW skill texts are not in this copy of UDS, so the skills were installed in English.');
  expect(skillText(project)).not.toContain(CHINESE_HEADING);

  // The fix the message names, run from a complete copy: Chinese texts, no warning.
  const fixed = await runPackaged(completeDir, ['update', '--apply', '--skills', '--yes', '--locale', 'zh-tw'], project);
  const fixedOut = fixed.output;
  expect(fixed.code, fixedOut.slice(-600)).toBe(0);
  expect(fixed.attempts, 'network requests').toEqual([]);
  expect(fixedOut).not.toContain('skill texts are not in this copy of UDS');
  expect(skillText(project)).toContain(CHINESE_HEADING);
}, 600000);
