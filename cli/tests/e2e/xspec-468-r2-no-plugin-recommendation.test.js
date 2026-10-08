/**
 * E2E: nothing UDS ships or prints still recommends the Claude Code plugin marketplace over the project way
 * (dev-platform XSPEC-468 R2).
 *
 * XSPEC-462 settled it: installing the skills into the project is the main path, the plugin marketplace is an
 * alternative with limits. The spec's own inventory command found the documents and the prompt that still said
 * "Plugin Marketplace (Recommended)". This test is that inventory kept alive: it reads every Markdown file of the
 * repository and the CLI's own source (messages, prompts, option help), and fails naming the file and line of any
 * sentence that recommends the plugin.
 *
 * Left out on purpose, and named here so the exclusion is a decision and not an accident:
 *   - `CHANGELOG*.md`: a changelog quotes what an older version said ("the plugin no longer says (recommended)").
 *   - `.github/RELEASE_v*.md`: the release notes of 3.2.x say what 3.2.x said; rewriting them rewrites history.
 *   - `docs/archive/`: dated snapshots.
 *
 * It also asks the real CLI (`uds init --help`) what the default of `--skills-location` is.
 */

import { it, expect, afterAll } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'fs';
import { join, relative, sep } from 'path';
import { createHarness, REAL_REPO } from '../utils/staged-cli-harness.js';

const h = createHarness('xspec468-r2');
afterAll(() => h.cleanup());

// A sentence that puts the plugin first: "Plugin Marketplace (Recommended)", "Recommended: Plugin Marketplace",
// "推薦：Plugin Marketplace", "(recommended) ... plugin", "推薦 ... 外掛/插件".
const RECOMMENDS_PLUGIN = [
  /plugin\s+marketplace\s*[（(]\s*(recommended|推薦|推荐)/i,
  /(recommended|推薦|推荐)\s*[:：]\s*plugin\s+marketplace/i,
  /recommended[^\n]{0,40}\bplugin\b/i,
  /plugin\s+marketplace\s+as\s+the\s+recommended/i,
  /(推薦|推荐)[^\n]{0,12}(外掛|插件|plugin)/i
];

const SKIP_DIRS = new Set(['node_modules', '.git', 'bats', 'archive', 'bundled', '.uds-backups', '.vitest']);
const SKIP_FILES = [/^CHANGELOG(\.[\w-]+)?\.md$/, /^RELEASE_v[\w.-]+\.md$/];

function walk(dir, out) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const info = statSync(full);
    if (info.isDirectory()) {
      if (!SKIP_DIRS.has(name)) walk(full, out);
    } else if (name.endsWith('.md') && !SKIP_FILES.some(rx => rx.test(name))) {
      out.push(full);
    } else if (full.includes(`${sep}cli${sep}src${sep}`) && name.endsWith('.js')) {
      out.push(full);
    } else if (name === 'uds.js' && full.includes(`${sep}cli${sep}bin`)) {
      out.push(full);
    }
  }
  return out;
}

it('no Markdown file or CLI source text recommends the plugin marketplace over the project way, and the files really were read (XSPEC-468 R2)', () => {
  const files = walk(REAL_REPO, []);
  // Denominator: the walk reached the places the inventory is about. A walk that found nothing would pass.
  const rel = files.map(f => relative(REAL_REPO, f).split(sep).join('/'));
  expect(rel.length).toBeGreaterThan(200);
  for (const must of [
    'docs/CLI-INIT-OPTIONS.md', 'docs/WINDOWS-GUIDE.md', 'docs/USAGE-MODES-COMPARISON.md',
    'adoption/ADOPTION-GUIDE.md', 'adoption/checklists/minimal.md',
    'locales/zh-TW/docs/CLI-INIT-OPTIONS.md', 'locales/zh-CN/adoption/ADOPTION-GUIDE.md',
    'cli/src/prompts/init.js', 'cli/src/i18n/messages.js', 'cli/bin/uds.js'
  ]) {
    expect(rel, `the walk must reach ${must}`).toContain(must);
  }

  const hits = [];
  for (const [i, file] of files.entries()) {
    const lines = readFileSync(file, 'utf-8').split('\n');
    lines.forEach((line, n) => {
      if (RECOMMENDS_PLUGIN.some(rx => rx.test(line))) hits.push(`${rel[i]}:${n + 1}: ${line.trim().slice(0, 140)}`);
    });
  }
  expect(hits, `sentences that recommend the plugin:\n${hits.join('\n')}`).toEqual([]);
});

it('the matcher finds the sentences it is meant to find, in all three languages, and leaves the project way alone (XSPEC-468 R2)', () => {
  const recommends = [
    '# Plugin Marketplace (Recommended)',
    '**Recommended: Plugin Marketplace**',
    '### Option A: Plugin Marketplace (Recommended)',
    '**推薦：Plugin Marketplace**',
    '**推荐：Plugin Marketplace**',
    '### 選項 A：Plugin Marketplace（推薦）',
    '- Skills Location: Plugin Marketplace (recommended)',
    'Plugin Marketplace as the recommended installation method'
  ];
  const fine = [
    '**Main path: into the project**',
    '**Alternative, with limits: Claude Code plugin marketplace**',
    '### Option A: Into the project (the main path)',
    '**替代方式（有限制）：Claude Code 外掛市集**',
    '- Compact (Recommended) | `.ai.yaml`',
    'Claude Code (推薦) - 支援動態 Skills 載入'
  ];
  for (const text of recommends) expect(RECOMMENDS_PLUGIN.some(rx => rx.test(text)), `should match: ${text}`).toBe(true);
  for (const text of fine) expect(RECOMMENDS_PLUGIN.some(rx => rx.test(text)), `should not match: ${text}`).toBe(false);
});

it('uds init --help names the project as the default of --skills-location, and says nothing about the plugin being recommended (XSPEC-468 R2)', async () => {
  const dir = h.makeDir('help');
  const run = await h.runCli(['init', '--help'], dir);
  expect(run.code, run.stdout + run.stderr).toBe(0);
  const line = run.stdout.split('\n').join(' ').replace(/\s+/g, ' ');
  expect(line).toContain('--skills-location <location>');
  expect(line).toContain('Skills location (project, user, marketplace, none) [default: project]');
  expect(line).not.toContain('[default: marketplace]');
  expect(RECOMMENDS_PLUGIN.some(rx => rx.test(run.stdout))).toBe(false);
});
