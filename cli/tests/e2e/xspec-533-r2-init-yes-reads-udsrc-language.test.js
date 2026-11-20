/**
 * E2E: `uds init -y` picks its install language with the same chain as the CLI's interface language, and that
 * chain reads ~/.udsrc (dev-platform XSPEC-533 R2).
 *
 * Found on a real Windows machine (6.16.0-beta.2): ~/.udsrc said `ui.language: zh-tw`, the screens were all
 * Chinese, and the standards were installed in English - the interface read ~/.udsrc, `init -y` did not.
 *
 * Every test spawns the real CLI (no --ui-lang flag, so the interface language comes from the chain) in a
 * throwaway project with a throwaway HOME that holds a ~/.udsrc written BEFORE the run. LANG, LC_ALL,
 * LC_MESSAGES and UDS_LOCALE are set empty for the child, so the machine running the test cannot decide.
 * What is read back: the manifest's recorded language, the locale pack file on disk, the screen.
 *
 * Wires that make these red when cut (one line of CLI source each):
 *   cli/src/commands/init.js   const requestedLanguage = resolveLanguage({ explicit: options.locale, project: installYaml.locale });
 *   cli/bin/uds.js             setLanguage(resolveLanguage({ project: manifest?.options?.display_language }));
 */

import { it, expect, afterAll } from 'vitest';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { createHarness } from '../utils/staged-cli-harness.js';

const h = createHarness('xspec533-r2');
afterAll(() => h.cleanup());

/** Nothing in the environment may pick the language: the test's own inputs do. */
const NO_ENV_LANGUAGE = { LANG: '', LC_ALL: '', LC_MESSAGES: '', UDS_LOCALE: '' };

function homeWithUdsrc(language) {
  const home = h.makeDir('home');
  writeFileSync(join(home, '.udsrc'), `ui:\n  language: ${language}\n`);
  return home;
}

function project({ installYamlLocale = null } = {}) {
  const dir = h.makeDir('project');
  mkdirSync(join(dir, '.claude'), { recursive: true });
  if (installYamlLocale) {
    mkdirSync(join(dir, '.uds'), { recursive: true });
    writeFileSync(join(dir, '.uds', 'install.yaml'), `locale: ${installYamlLocale}\n`);
  }
  return dir;
}

/** The first non-empty line of the screen: the command's title, said in the interface language. */
const firstLine = (text) => text.split('\n').find((l) => l.trim() !== '') || '';

const manifestOf = (dir) => JSON.parse(readFileSync(join(dir, '.standards', 'manifest.json'), 'utf-8'));

async function initYes(dir, home, extraArgs = []) {
  const run = await h.runCli(['init', '-y', '--skills-location', 'project', ...extraArgs], dir, { ui: null, home, env: NO_ENV_LANGUAGE });
  expect(run.code, run.stdout + run.stderr).toBe(0);
  return run;
}

it('uds init -y with ~/.udsrc ui.language zh-tw and no LANG, UDS_LOCALE or install.yaml installs the standards in Traditional Chinese and says so (XSPEC-533 R2)', async () => {
  const dir = project();
  const run = await initYes(dir, homeWithUdsrc('zh-tw'));

  // Read back: what was recorded, what landed on disk, what the screen said.
  expect(manifestOf(dir).options.display_language).toBe('zh-tw');
  expect(existsSync(join(dir, '.standards', 'zh-tw.md'))).toBe(true);
  expect(run.stdout).toContain('繁體中文');
  expect(run.stdout).not.toMatch(/Display Language: English/);
}, 180000);

it('uds init -y: --locale beats install.yaml, install.yaml beats ~/.udsrc, and ~/.udsrc beats the environment (XSPEC-533 R2)', async () => {
  // --locale en wins over everything below it.
  const a = project({ installYamlLocale: 'zh-cn' });
  await initYes(a, homeWithUdsrc('zh-tw'), ['--locale', 'en']);
  expect(manifestOf(a).options.display_language).toBe('en');
  expect(existsSync(join(a, '.standards', 'zh-tw.md'))).toBe(false);

  // .uds/install.yaml wins over ~/.udsrc.
  const b = project({ installYamlLocale: 'zh-cn' });
  await initYes(b, homeWithUdsrc('zh-tw'));
  expect(manifestOf(b).options.display_language).toBe('zh-cn');
  expect(existsSync(join(b, '.standards', 'zh-cn.md'))).toBe(true);

  // ~/.udsrc wins over LANG (here LANG says Simplified, ~/.udsrc says Traditional).
  const c = project();
  const run = await h.runCli(['init', '-y', '--skills-location', 'project'], c, {
    ui: null, home: homeWithUdsrc('zh-tw'), env: { ...NO_ENV_LANGUAGE, LANG: 'zh_CN.UTF-8' }
  });
  expect(run.code, run.stdout + run.stderr).toBe(0);
  expect(manifestOf(c).options.display_language).toBe('zh-tw');
}, 300000);

it('without ~/.udsrc, init -y falls back to LANG, and then to English (XSPEC-533 R2: the new step must not change the old ones)', async () => {
  const emptyHome = h.makeDir('home');
  const withLang = project();
  const run = await h.runCli(['init', '-y', '--skills-location', 'project'], withLang, {
    ui: null, home: emptyHome, env: { ...NO_ENV_LANGUAGE, LANG: 'zh_TW.UTF-8' }
  });
  expect(run.code, run.stdout + run.stderr).toBe(0);
  expect(manifestOf(withLang).options.display_language).toBe('zh-tw');

  const nothing = project();
  await initYes(nothing, h.makeDir('home'));
  expect(manifestOf(nothing).options.display_language).toBe('en');
}, 300000);

it('the interface language still follows the project manifest first, then ~/.udsrc (XSPEC-533 R2: bin/uds.js uses the same function)', async () => {
  // A project initialised in English, a ~/.udsrc that says Traditional: the manifest wins, the screen is English.
  const dir = project();
  await initYes(dir, h.makeDir('home'), ['--locale', 'en']);
  const en = await h.runCli(['check', '--offline'], dir, { ui: null, home: homeWithUdsrc('zh-tw'), env: NO_ENV_LANGUAGE });
  expect(firstLine(en.stdout)).toMatch(/^Universal /);

  // The same project with no manifest language recorded would follow ~/.udsrc; a bare project does.
  const bare = project();
  const tw = await h.runCli(['check', '--offline'], bare, { ui: null, home: homeWithUdsrc('zh-tw'), env: NO_ENV_LANGUAGE });
  expect(firstLine(tw.stdout), tw.stdout).toMatch(/[㐀-鿿]/);
}, 300000);
