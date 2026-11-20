/**
 * E2E: `uds update` decides its language with the same shared chain as `uds init -y` and the CLI interface, so a
 * machine whose ~/.udsrc says `ui.language: zh-tw` gets the same language from all three - while an update never
 * silently switches the language of a project that already has one (dev-platform XSPEC-533 R2, decision 625B).
 *
 * Before this, update.js had its own chain (--locale > install.yaml > UDS_LOCALE > manifest > .standards detection
 * > en) that never read ~/.udsrc or LANG, and set the screen language to `manifest display_language || 'en'`.
 *
 * Every test spawns the real CLI in a throwaway project with a throwaway HOME holding a ~/.udsrc written BEFORE
 * the run; LANG, LC_ALL, LC_MESSAGES and UDS_LOCALE are set empty unless the test sets one. What is read back: the
 * manifest, the locale pack on disk, and the `Locale that would be used:` line that `update --plan --skills`
 * prints (it is resolveLocale()'s answer, the one skills and commands are installed with).
 *
 * Wire that makes these red when cut (one line of CLI source):
 *   cli/src/commands/update.js   return displayLanguageToLocale(udsrcLanguage());   // wire:update-uses-shared-language-chain
 *   cli/src/commands/update.js   setLanguage(resolveLanguage({ ... }));             // wire:update-screen-uses-shared-chain
 *
 * Final order for `uds update` (first that is set wins):
 *   --locale > .uds/install.yaml locale: > UDS_LOCALE > manifest display_language ('en' included: an installed
 *   English project stays English) > installed .standards/<lang>.md > ~/.udsrc ui.language > en
 * LANG is deliberately not read by update (init -y reads it after ~/.udsrc): the OS locale must not switch an
 * installed project's skills.
 */

import { it, expect, afterAll } from 'vitest';
import { mkdirSync, readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { createHarness } from '../utils/staged-cli-harness.js';

const h = createHarness('xspec533-r2-update');
afterAll(() => h.cleanup());

const NO_ENV_LANGUAGE = { LANG: '', LC_ALL: '', LC_MESSAGES: '', UDS_LOCALE: '' };

function homeWithUdsrc(language) {
  const home = h.makeDir('home');
  if (language) writeFileSync(join(home, '.udsrc'), `ui:\n  language: ${language}\n`);
  return home;
}

function project() {
  const dir = h.makeDir('project');
  mkdirSync(join(dir, '.claude'), { recursive: true });
  return dir;
}

const manifestPath = (dir) => join(dir, '.standards', 'manifest.json');
const manifestOf = (dir) => JSON.parse(readFileSync(manifestPath(dir), 'utf-8'));

async function initYes(dir, home, extraArgs = [], env = NO_ENV_LANGUAGE) {
  const run = await h.runCli(['init', '-y', '--skills-location', 'project', ...extraArgs], dir, { ui: null, home, env });
  expect(run.code, run.stdout + run.stderr).toBe(0);
  return run;
}

/** The locale update would install skills with, as `update --plan --skills` prints it. */
async function plannedLocale(dir, home, env = NO_ENV_LANGUAGE) {
  const run = await h.runCli(['update', '--plan', '--skills'], dir, { ui: null, home, env });
  expect(run.code, run.stdout + run.stderr).toBe(0);
  const m = run.stdout.match(/Locale that would be used: (\S+)/);
  expect(m, run.stdout).not.toBeNull();
  return { locale: m[1], run };
}

/** Every installed SKILL.md of a project: relative path -> text. */
function skillFiles(dir) {
  const files = new Map();
  const root = join(dir, '.claude', 'skills');
  const walk = (d) => {
    for (const entry of readdirSync(d, { withFileTypes: true })) {
      const full = join(d, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name === 'SKILL.md') files.set(full.slice(root.length), readFileSync(full, 'utf-8'));
    }
  };
  walk(root);
  return files;
}

/** How many SKILL.md files of `dir` differ from the same file in `other` (the same skills, another language). */
function skillFilesDifferingFrom(dir, other) {
  const theirs = skillFiles(other);
  return [...skillFiles(dir)].filter(([rel, text]) => theirs.get(rel) !== text).length;
}

/** An older project: the manifest has no recorded display language (what UDS before 4.x wrote). */
function forgetRecordedLanguage(dir) {
  const manifest = manifestOf(dir);
  delete manifest.options.display_language;
  writeFileSync(manifestPath(dir), JSON.stringify(manifest, null, 2));
}

it('~/.udsrc zh-tw, no LANG or UDS_LOCALE: init -y and then update agree on Traditional Chinese, and update keeps the standards in it (XSPEC-533 R2)', async () => {
  const dir = project();
  const home = homeWithUdsrc('zh-tw');
  await initYes(dir, home);
  expect(manifestOf(dir).options.display_language).toBe('zh-tw');
  expect(existsSync(join(dir, '.standards', 'zh-tw.md'))).toBe(true);

  expect((await plannedLocale(dir, home)).locale).toBe('zh-TW');

  const update = await h.runCli(['update', '--yes'], dir, { ui: null, home, env: NO_ENV_LANGUAGE });
  expect(update.code, update.stdout + update.stderr).toBe(0);
  expect(manifestOf(dir).options.display_language).toBe('zh-tw');
  expect(existsSync(join(dir, '.standards', 'zh-tw.md'))).toBe(true);
}, 300000);

it('a project installed in English keeps English when ~/.udsrc says zh-tw: update never switches an installed project (XSPEC-533 R2)', async () => {
  const dir = project();
  await initYes(dir, h.makeDir('home'), ['--locale', 'en']); // installed in English, while ~/.udsrc did not exist
  expect(manifestOf(dir).options.display_language).toBe('en');

  const home = homeWithUdsrc('zh-tw'); // the machine's preference changes afterwards
  expect((await plannedLocale(dir, home)).locale).toBe('en');

  const update = await h.runCli(['update', '--yes'], dir, { ui: null, home, env: NO_ENV_LANGUAGE });
  expect(update.code, update.stdout + update.stderr).toBe(0);
  expect(manifestOf(dir).options.display_language).toBe('en');
  expect(existsSync(join(dir, '.standards', 'zh-tw.md'))).toBe(false);
  expect(update.stdout).not.toMatch(/migrated from ~\/\.udsrc/);
}, 300000);

it('a project with no recorded language follows ~/.udsrc in update, as init -y does: skills locale and screen language (XSPEC-533 R2)', async () => {
  const dir = project();
  await initYes(dir, h.makeDir('home'), ['--locale', 'en']);
  forgetRecordedLanguage(dir);

  const home = homeWithUdsrc('zh-tw');
  const { locale, run } = await plannedLocale(dir, home);
  expect(locale).toBe('zh-TW');
  // The screen is in Chinese too: its first line is the command's title, said in the interface language.
  const firstLine = run.stdout.split('\n').find((l) => l.trim() !== '') || '';
  expect(firstLine, run.stdout).toMatch(/[㐀-鿿]/);
}, 300000);

it('a real `update --skills --apply --yes` on a project with no recorded language installs the skills in the ~/.udsrc language and records it (XSPEC-533 R2)', async () => {
  const english = project();
  await initYes(english, h.makeDir('home'), ['--locale', 'en']);
  forgetRecordedLanguage(english);
  const baseline = project(); // an untouched English twin to compare the skill files with
  await initYes(baseline, h.makeDir('home'), ['--locale', 'en']);

  // Without ~/.udsrc the skills stay what they were: English, identical to the twin.
  const same = await h.runCli(['update', '--skills', '--apply', '--yes'], english, { ui: null, home: homeWithUdsrc(null), env: NO_ENV_LANGUAGE });
  expect(same.code, same.stdout + same.stderr).toBe(0);
  expect(manifestOf(english).skills.locale).toBe('en');
  expect(skillFilesDifferingFrom(english, baseline)).toBe(0);

  // With ~/.udsrc zh-tw the same update installs the Traditional Chinese skills and records the locale.
  const dir = project();
  await initYes(dir, h.makeDir('home'), ['--locale', 'en']);
  forgetRecordedLanguage(dir);
  const run = await h.runCli(['update', '--skills', '--apply', '--yes'], dir, { ui: null, home: homeWithUdsrc('zh-tw'), env: NO_ENV_LANGUAGE });
  expect(run.code, run.stdout + run.stderr).toBe(0);
  expect(manifestOf(dir).skills.locale).toBe('zh-TW');
  expect(skillFilesDifferingFrom(dir, baseline)).toBeGreaterThan(0);
}, 300000);

it('update does not let LANG switch a project that recorded no language: without ~/.udsrc it stays English (XSPEC-533 R2: init -y reads LANG, update on purpose does not)', async () => {
  const withLang = project();
  await initYes(withLang, h.makeDir('home'), ['--locale', 'en']);
  forgetRecordedLanguage(withLang);
  expect((await plannedLocale(withLang, homeWithUdsrc(null), { ...NO_ENV_LANGUAGE, LANG: 'zh_TW.UTF-8' })).locale).toBe('en');

  const nothing = project();
  await initYes(nothing, h.makeDir('home'), ['--locale', 'en']);
  forgetRecordedLanguage(nothing);
  expect((await plannedLocale(nothing, homeWithUdsrc(null))).locale).toBe('en');
}, 300000);

it('update: UDS_LOCALE keeps the place XSPEC-239 gave it, above what the project recorded and above ~/.udsrc (unchanged by XSPEC-533 R2)', async () => {
  const dir = project();
  await initYes(dir, h.makeDir('home'), ['--locale', 'zh-tw']);
  const home = homeWithUdsrc('zh-tw');
  expect((await plannedLocale(dir, home, { ...NO_ENV_LANGUAGE, UDS_LOCALE: 'zh-cn' })).locale).toBe('zh-CN');

  // The one place where init -y and update still differ for the same inputs: with ~/.udsrc zh-tw and
  // UDS_LOCALE zh-cn, init -y installs zh-tw (~/.udsrc beats UDS_LOCALE there) and update plans zh-CN.
  const both = project();
  await initYes(both, home, [], { ...NO_ENV_LANGUAGE, UDS_LOCALE: 'zh-cn' });
  expect(manifestOf(both).options.display_language).toBe('zh-tw');
  forgetRecordedLanguage(both);
  expect((await plannedLocale(both, home, { ...NO_ENV_LANGUAGE, UDS_LOCALE: 'zh-cn' })).locale).toBe('zh-CN');
}, 300000);

it('update: --locale beats everything, and the recorded project language beats ~/.udsrc and LANG (XSPEC-533 R2)', async () => {
  const dir = project();
  await initYes(dir, h.makeDir('home'), ['--locale', 'zh-cn']);
  const home = homeWithUdsrc('zh-tw');
  const lang = { ...NO_ENV_LANGUAGE, LANG: 'zh_TW.UTF-8' };

  // The manifest says zh-cn; ~/.udsrc and LANG say zh-tw: the project keeps zh-cn.
  expect((await plannedLocale(dir, home, lang)).locale).toBe('zh-CN');

  // --locale en beats the manifest.
  const run = await h.runCli(['update', '--plan', '--skills', '--locale', 'en'], dir, { ui: null, home, env: lang });
  expect(run.stdout).toMatch(/Locale that would be used: en\b/);
}, 300000);
