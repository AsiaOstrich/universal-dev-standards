/**
 * Plugin settings vs the skills the plugin loads (dev-platform XSPEC-462 R3).
 *
 * `.claude-plugin/plugin.json` said "Supports 25 comprehensive skills" and `marketplace.json` said "23 skills"
 * while the plugin loads 56: a number written into a description is a claim nothing keeps true. The fix is
 * either no number or a number a check holds to the count of skill folders (a folder directly under `skills/`
 * that holds a SKILL.md, the same definition `uds check` and `uds skills` use for "a skill UDS ships").
 *
 * What counts as "a skill count in a description": a number followed by the word skill or skills, with at most
 * two plain words between ("25 skills", "25 comprehensive skills", "23 core skills"), or a number followed by
 * 個技能 / 个技能 (`56 個技能`). Numbers anywhere else in the text (a version, a year) are not counts.
 *
 * @module scripts/lib/plugin-manifest
 */

import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const COUNT_PATTERNS = [
  /(\d+)\s+(?:[A-Za-z-]+\s+){0,2}skills?\b/gi,
  /(\d+)\s*[個个]\s*技能/g
];

/**
 * @param {string} skillsDir - the `skills/` folder
 * @returns {number} how many folders directly under it hold a SKILL.md
 */
export function countShippedSkills(skillsDir) {
  if (!existsSync(skillsDir)) return 0;
  return readdirSync(skillsDir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && existsSync(join(skillsDir, e.name, 'SKILL.md')))
    .length;
}

/**
 * @param {string} text
 * @returns {{ text: string, number: number }[]} every skill count the text claims
 */
export function skillCountClaims(text) {
  const claims = [];
  for (const pattern of COUNT_PATTERNS) {
    for (const m of String(text ?? '').matchAll(pattern)) claims.push({ text: m[0], number: Number(m[1]) });
  }
  return claims;
}

/**
 * @param {{ label: string, text: string }[]} descriptions - where each piece of text came from, and the text
 * @param {number} shipped - the number of skill folders
 * @returns {{ ok: boolean, claims: { label: string, text: string, number: number }[], problems: string[] }}
 */
export function judgePluginDescriptions(descriptions, shipped) {
  const claims = [];
  const problems = [];
  for (const { label, text } of descriptions) {
    for (const claim of skillCountClaims(text)) {
      claims.push({ label, ...claim });
      if (claim.number !== shipped) {
        problems.push(`${label} says "${claim.text}" but skills/ holds ${shipped} skills (folders with a SKILL.md)`);
      }
    }
  }
  return { ok: problems.length === 0, claims, problems };
}
