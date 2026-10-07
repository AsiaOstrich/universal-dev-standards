#!/usr/bin/env node
/**
 * check-plugin-manifest — dev-platform XSPEC-462 R3
 *
 * The Claude Code plugin settings (`.claude-plugin/plugin.json`, `marketplace.json`, `README.md`) must not
 * claim a number of skills that differs from the folders under `skills/` that hold a SKILL.md. A description
 * with no number passes: no number cannot be wrong. See scripts/lib/plugin-manifest.mjs for what counts as a
 * claim.
 *
 * Usage:
 *   node cli/scripts/check-plugin-manifest.mjs
 *   node cli/scripts/check-plugin-manifest.mjs --root <dir> --plugin <file> --marketplace <file> --readme <file> --skills-dir <dir>
 *     (the options exist so a test can inject a wrong number without touching the real tree)
 *
 * Exit codes (three states, "matches" and "could not measure" must differ):
 *   0  every skill count the settings claim equals the number of skill folders
 *   1  a claim is wrong
 *   2  could not measure (a settings file unreadable, no skill folder found) — NOT a pass
 */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { countShippedSkills, judgePluginDescriptions } from './lib/plugin-manifest.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const flag = (name) => {
  const i = argv.indexOf(name);
  return i === -1 ? null : argv[i + 1];
};

const ROOT = flag('--root') ? resolve(flag('--root')) : resolve(HERE, '..', '..');
const pluginPath = flag('--plugin') || join(ROOT, '.claude-plugin', 'plugin.json');
const marketplacePath = flag('--marketplace') || join(ROOT, '.claude-plugin', 'marketplace.json');
const readmePath = flag('--readme') || join(ROOT, '.claude-plugin', 'README.md');
const skillsDir = flag('--skills-dir') || join(ROOT, 'skills');

function cannotMeasure(why) {
  console.error(`[plugin-manifest] CANNOT MEASURE: ${why}`);
  process.exit(2);
}

const readJson = (path) => {
  try {
    return JSON.parse(readFileSync(path, 'utf-8'));
  } catch (e) {
    return cannotMeasure(`cannot read ${path}: ${e.message}`);
  }
};

const plugin = readJson(pluginPath);
const marketplace = readJson(marketplacePath);
const descriptions = [{ label: '.claude-plugin/plugin.json description', text: plugin.description }];
for (const [i, entry] of (marketplace.plugins || []).entries()) {
  descriptions.push({ label: `.claude-plugin/marketplace.json plugins[${i}].description`, text: entry.description });
}
descriptions.push({ label: '.claude-plugin/marketplace.json metadata.description', text: marketplace.metadata?.description });
if (existsSync(readmePath)) descriptions.push({ label: '.claude-plugin/README.md', text: readFileSync(readmePath, 'utf-8') });

const shipped = countShippedSkills(skillsDir);
if (shipped === 0) cannotMeasure(`no skill folder (a folder holding SKILL.md) found under ${skillsDir}`);
if (typeof plugin.description !== 'string' || plugin.description.length === 0) cannotMeasure(`${pluginPath} has no description`);

const verdict = judgePluginDescriptions(descriptions, shipped);

console.log('Plugin manifest vs shipped skills');
console.log(`  skill folders (with a SKILL.md): ${shipped}`);
console.log(`  texts examined: ${descriptions.length}   skill counts claimed: ${verdict.claims.length}`);
for (const claim of verdict.claims) console.log(`    ${claim.label}: "${claim.text}"`);
for (const problem of verdict.problems) console.log(`  ✗ ${problem}`);
if (verdict.ok) console.log('  ✓ no skill count in the plugin settings differs from the skills UDS ships');
process.exit(verdict.ok ? 0 : 1);
