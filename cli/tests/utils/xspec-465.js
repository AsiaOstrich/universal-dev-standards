/**
 * Shared pieces for the XSPEC-465 end-to-end tests ("a personal skill with the same name as a UDS skill").
 *
 * - `personalHome(h, skills, opts)`: a throwaway HOME whose `~/.claude/skills/` holds the given personal skills.
 *   The tests pass the returned `env` to `runCli(..., { env })`, which is applied after the harness's own
 *   isolation, so the CLI reads THIS home and never the real one.
 * - `COLLISION_OFF`: source text for a CLI whose collision check finds nothing and prints nothing. Run the same
 *   commands on it and on the real CLI: what differs is exactly this feature, which is how a test proves
 *   "information only" (same text apart from the warning block, same verdict, same exit code).
 */

import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

/** The first line of the warning (English); every later line of the block is indented. */
export const WARNING_TITLE = /^⚠ \d+ UDS skill\(s\) installed in this project share a name with a personal skill/;
export const hasWarning = (stdout) => /share a name with a personal skill/.test(stdout);

/**
 * @param {{ makeDir: Function }} h - a harness from createHarness
 * @param {{ folder: string, name?: string, raw?: string }[]} [skills] - one personal skill each. `name` becomes
 *   the frontmatter `name:`; `raw` replaces the whole SKILL.md text (for "no frontmatter" and "broken" arms).
 * @param {{ skillsDir?: boolean, manifest?: object }} [opts] - skillsDir:false = no ~/.claude/skills at all;
 *   manifest = content of `~/.claude/skills/.manifest.json`
 * @returns {{ home: string, skillsDir: string, env: Record<string,string> }}
 */
export function personalHome(h, skills = [], { skillsDir = true, manifest } = {}) {
  const home = h.makeDir('personal-home');
  const dir = join(home, '.claude', 'skills');
  if (skillsDir) {
    mkdirSync(dir, { recursive: true });
    for (const { folder, name, raw } of skills) {
      mkdirSync(join(dir, folder), { recursive: true });
      const text = raw ?? `---\n${name ? `name: ${name}\n` : ''}description: my own skill\n---\n\n# ${folder}\n`;
      writeFileSync(join(dir, folder, 'SKILL.md'), text);
    }
    if (manifest) writeFileSync(join(dir, '.manifest.json'), JSON.stringify(manifest));
  }
  return { home, skillsDir: dir, env: { HOME: home, USERPROFILE: home } };
}

/** `src/utils/skill-name-collision.js` as a feature that finds nothing and prints nothing. */
export const COLLISION_OFF = `
export const skillCommandNames = () => null;
export const findSkillNameCollisions = () => [];
export const printSkillNameCollisionWarning = () => false;
export default { findSkillNameCollisions, printSkillNameCollisionWarning, skillCommandNames };
`;

export const OFF_OVERRIDES = { 'src/utils/skill-name-collision.js': COLLISION_OFF };
