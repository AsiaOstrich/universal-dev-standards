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

import { existsSync, readFileSync, readdirSync } from 'node:fs';
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

/**
 * What a Claude Code marketplace install actually loads, worked out from the files (2026-10-20).
 *
 * The count check above assumed the plugin ships the skill folders under `skills/`. It did not: the marketplace
 * entry said `source: "./skills"`, so the plugin root was `skills/`, Claude Code's default skill scan looked for
 * `skills/skills/*\/SKILL.md` (absent), and what users got was the 53 flat files under `skills/commands/`
 * (two of them README-type documents) plus `skills/agents/README.md` as an agent. Every description count still
 * matched 56, so that check stayed green over a plugin that shipped none of the 56.
 *
 * Layout rules followed here (Claude Code plugins reference; checked on Claude Code 2.1.304):
 *   - plugin root = the marketplace entry's `source`, relative to the repository root
 *   - manifest = `<root>/.claude-plugin/plugin.json` when present, else the marketplace entry
 *   - skills = `<root>/skills/<name>/SKILL.md`, plus any extra paths in manifest `skills`
 *   - commands = manifest `commands` when given (replaces the default), else `<root>/commands/*.md`
 *   - agents = manifest `agents` when given (replaces the default), else `<root>/agents/*.md`
 *
 * @param {{ repoRoot: string, marketplace: object, shippedSkillsDir: string }} input
 * @returns {{ pluginRoot: string, skills: string[], commands: string[], agents: string[], problems: string[] }}
 */
export function resolvePluginLoad({ repoRoot, marketplace, shippedSkillsDir }) {
  const problems = [];
  const entry = (marketplace.plugins || [])[0];
  if (!entry) return { pluginRoot: '', skills: [], commands: [], agents: [], problems: ['marketplace.json has no plugin entry'] };
  const pluginRoot = join(repoRoot, String(entry.source || ''));
  const manifestPath = join(pluginRoot, '.claude-plugin', 'plugin.json');
  let manifest = entry;
  if (existsSync(manifestPath)) {
    try {
      manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
    } catch (e) {
      problems.push(`cannot read ${manifestPath}: ${e.message}`);
    }
  }

  const skillDirs = (dir) => (existsSync(dir)
    ? readdirSync(dir, { withFileTypes: true }).filter((e) => e.isDirectory() && existsSync(join(dir, e.name, 'SKILL.md'))).map((e) => e.name)
    : []);
  const listMd = (dir) => (existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.md')).map((f) => join(dir, f)) : []);
  const asList = (v) => (v === undefined ? undefined : Array.isArray(v) ? v : [v]);

  const skills = skillDirs(join(pluginRoot, 'skills'));
  for (const extra of asList(manifest.skills) || []) skills.push(...skillDirs(join(pluginRoot, extra)));

  const commandsField = asList(manifest.commands);
  const commands = commandsField ? commandsField.map((p) => join(pluginRoot, p)) : listMd(join(pluginRoot, 'commands'));
  const agentsField = asList(manifest.agents);
  const agents = agentsField ? agentsField.map((p) => join(pluginRoot, p)) : listMd(join(pluginRoot, 'agents'));

  const shipped = skillDirs(shippedSkillsDir).sort();
  const loaded = [...new Set(skills)].sort();
  const missing = shipped.filter((s) => !loaded.includes(s));
  const extra = loaded.filter((s) => !shipped.includes(s));
  if (missing.length) problems.push(`the plugin does not load ${missing.length} of the ${shipped.length} skills UDS ships (e.g. ${missing.slice(0, 3).join(', ')}); plugin root is ${entry.source}`);
  if (extra.length) problems.push(`the plugin loads skills UDS does not ship: ${extra.slice(0, 3).join(', ')}`);
  for (const path of [...commands, ...agents]) {
    if (/(^|\/)(README|[A-Z-]*OVERVIEW)[^/]*\.md$/i.test(path)) problems.push(`a documentation file is loaded as a command or agent: ${path}`);
  }
  for (const path of agentsField ? agents : []) {
    if (!path.endsWith('.md')) problems.push(`agents entry must point at a .md file: ${path}`);
    else if (!existsSync(path)) problems.push(`agents entry points at a missing file: ${path}`);
  }
  if (manifest.repository !== undefined && typeof manifest.repository !== 'string') {
    problems.push('plugin.json repository must be a string (Claude Code rejects an object)');
  }
  const allowedMeta = ['description', 'version', 'pluginRoot'];
  for (const key of Object.keys(marketplace.metadata || {})) {
    if (!allowedMeta.includes(key)) problems.push(`marketplace.json metadata.${key} is not a field Claude Code reads`);
  }
  return { pluginRoot, skills: loaded, commands, agents, problems };
}
