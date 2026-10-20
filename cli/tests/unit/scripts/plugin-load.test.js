/**
 * Unit: resolvePluginLoad works out what a Claude Code marketplace install of the plugin loads (2026-10-20).
 *
 * The entry-level tests (the real repository, and the old `source: "./skills"` layout) are in
 * tests/e2e/xspec-462-r3-plugin-manifest.test.js. These cover the resolver's other rules on a small repository
 * built in a scratch folder: the new layout passes, and each wrong field is named.
 */

import { describe, it, expect, afterAll } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { resolvePluginLoad } from '../../../scripts/lib/plugin-manifest.mjs';

const scratch = mkdtempSync(join(tmpdir(), 'uds-plugin-load-unit-'));
afterAll(() => rmSync(scratch, { recursive: true, force: true }));

let counter = 0;
const description = 'Skills for development standards.';
const goodMarketplace = { name: 'm', owner: { name: 'o' }, metadata: { description }, plugins: [{ name: 'p', source: './', description }] };
const goodPlugin = { name: 'p', description, repository: 'https://example.com/p.git', agents: ['./skills/agents/reviewer.md'] };

function repo(plugin) {
  const root = join(scratch, `r${++counter}`);
  for (const s of ['commit-standards', 'testing-guide']) {
    mkdirSync(join(root, 'skills', s), { recursive: true });
    writeFileSync(join(root, 'skills', s, 'SKILL.md'), `---\nname: ${s}\ndescription: x\n---\n`);
  }
  mkdirSync(join(root, 'skills', 'commands'), { recursive: true });
  writeFileSync(join(root, 'skills', 'commands', 'README.md'), '# commands\n');
  mkdirSync(join(root, 'skills', 'agents'), { recursive: true });
  writeFileSync(join(root, 'skills', 'agents', 'reviewer.md'), '---\nname: reviewer\ndescription: x\n---\n');
  writeFileSync(join(root, 'skills', 'agents', 'README.md'), '# agents\n');
  mkdirSync(join(root, '.claude-plugin'), { recursive: true });
  writeFileSync(join(root, '.claude-plugin', 'plugin.json'), JSON.stringify(plugin));
  return root;
}

const resolve = (root, marketplace = goodMarketplace) =>
  resolvePluginLoad({ repoRoot: root, marketplace, shippedSkillsDir: join(root, 'skills') });

describe('resolvePluginLoad', () => {
  it('the new layout loads both skills, no command, the one listed agent, and reports no problem', () => {
    const r = resolve(repo(goodPlugin));
    expect(r.skills).toEqual(['commit-standards', 'testing-guide']);
    expect(r.commands).toEqual([]);
    expect(r.agents.map((p) => p.split('/').pop())).toEqual(['reviewer.md']);
    expect(r.problems).toEqual([]);
  });

  it('names repository written as an object', () => {
    const r = resolve(repo({ ...goodPlugin, repository: { type: 'git', url: 'https://example.com/p.git' } }));
    expect(r.problems.join('\n')).toContain('repository must be a string');
  });

  it('names an agents list that includes the README, a missing file, or a path that is not a .md file', () => {
    const r = resolve(repo({ ...goodPlugin, agents: ['./skills/agents/README.md', './skills/agents/gone.md', './skills/agents/'] }));
    const all = r.problems.join('\n');
    expect(all).toMatch(/documentation file is loaded as a command or agent: .*agents\/README\.md/);
    expect(all).toContain('agents entry points at a missing file');
    expect(all).toContain('agents entry must point at a .md file');
  });

  it('names marketplace metadata fields Claude Code does not read', () => {
    const r = resolve(repo(goodPlugin), { ...goodMarketplace, metadata: { description, homepage: 'https://example.com' } });
    expect(r.problems.join('\n')).toContain('metadata.homepage is not a field Claude Code reads');
  });

  it('without an agents list the default agents/ folder is used, and a README there is named', () => {
    const root = repo({ name: 'p', description });
    mkdirSync(join(root, 'agents'), { recursive: true });
    writeFileSync(join(root, 'agents', 'README.md'), '# agents\n');
    const r = resolve(root);
    expect(r.problems.join('\n')).toMatch(/documentation file is loaded as a command or agent: .*agents\/README\.md/);
  });
});
