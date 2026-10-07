/**
 * Shared pieces for the XSPEC-462 end-to-end tests ("two ways to install UDS skills").
 *
 * - `pluginHome(h, opts)`: a throwaway HOME that looks like one where the UDS plugin was installed from the
 *   Claude Code marketplace. `getMarketplaceSkillsInfo()` (cli/src/utils/github.js) reads TWO things, and the
 *   plugin counts as installed only when both are there: `~/.claude/plugins/installed_plugins.json` with a
 *   `universal-dev-standards@<marketplace>` key, and the folder
 *   `~/.claude/plugins/cache/<marketplace>/universal-dev-standards/` (a record whose cache folder is gone
 *   means "uninstalled, record left behind" and reads as not installed). The tests pass the returned `env` to
 *   `runCli(..., { env })`, which is applied after the harness's own isolation, so the CLI sees this HOME.
 * - `SKILLS_PATHS_OFF`: source text for a CLI whose "both ways" output and "installed twice" warning do
 *   nothing. Run the same commands on it and on the real CLI: what differs is exactly this feature, which is
 *   how a test proves "information only" - same text apart from the warning, same verdict, same exit code.
 */

import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

export const PLUGIN_KEY = 'universal-dev-standards@asia-ostrich';

/**
 * @param {{ makeDir: Function }} h - a harness from createHarness
 * @param {{ record?: 'ok'|'missing'|'broken'|'other-plugin', cache?: boolean, skillDirs?: string[] }} [opts]
 *   record: what installed_plugins.json holds ('missing' = the file is not there; 'broken' = not JSON;
 *   'other-plugin' = valid JSON with a different plugin); cache: whether the cache folder exists;
 *   skillDirs: folder names created inside the plugin install path (what `uds skills` lists for the plugin)
 * @returns {{ home: string, env: Record<string,string> }}
 */
export function pluginHome(h, { record = 'ok', cache = true, skillDirs = [] } = {}) {
  const home = h.makeDir('plugin-home');
  const plugins = join(home, '.claude', 'plugins');
  const installPath = join(plugins, 'cache', 'asia-ostrich', 'universal-dev-standards', '6.13.1');
  mkdirSync(plugins, { recursive: true });
  if (cache) mkdirSync(installPath, { recursive: true });
  for (const name of skillDirs) mkdirSync(join(installPath, name), { recursive: true });

  const file = join(plugins, 'installed_plugins.json');
  if (record === 'ok') {
    writeFileSync(file, JSON.stringify({
      version: 2,
      plugins: { [PLUGIN_KEY]: [{ scope: 'user', installPath, version: '6.13.1', installedAt: '2026-10-01T00:00:00.000Z', lastUpdated: '2026-10-01T00:00:00.000Z' }] }
    }, null, 2));
  } else if (record === 'broken') {
    writeFileSync(file, '{ this is not json');
  } else if (record === 'other-plugin') {
    writeFileSync(file, JSON.stringify({ version: 2, plugins: { 'some-other-plugin@elsewhere': [{ scope: 'user', installPath: join(plugins, 'x'), version: '1.0.0' }] } }, null, 2));
  }
  return { home, installPath, env: { HOME: home, USERPROFILE: home } };
}

/** `src/utils/skills-install-paths.js` as a feature that prints nothing and finds nothing. */
export const SKILLS_PATHS_OFF = `
export const printInstallPathComparison = () => {};
export const projectUdsSkillNames = () => [];
export const printDoubleInstallWarning = () => false;
`;

export const OFF_OVERRIDES = { 'src/utils/skills-install-paths.js': SKILLS_PATHS_OFF };
