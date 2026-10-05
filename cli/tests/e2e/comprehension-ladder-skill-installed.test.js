/**
 * E2E: the comprehension-ladder skill as an ADOPTER receives it — through the product entry
 * `uds init`, not by reading the repo's source files.
 * (An adopter with Claude Code reaches this as `uds init --skills-location project`; the default for a
 * Claude Code project is the plugin marketplace, which installs nothing into the repo.)
 *
 * Evidence for DEC-125-L6 / dev-platform XSPEC-450 R3 (and AC-1, AC-2 of that spec).
 *
 * Why this exists: a skill can be perfect in `skills/` and still never reach an adopter (not
 * registered, not copied, copied without its guards). This test spawns the real CLI
 * (`node cli/bin/uds.js init --yes --skills-location project --locale <l>`) in a throwaway project and
 * reads back what landed in `<project>/.claude/skills/comprehension-ladder/`. Cut the wire that writes
 * the skill into the adopter's project and this goes red:
 *   - cli/src/utils/skills-installer.js  `writeFileSync(join(targetDir, file.name), file.content, 'utf-8');`
 *
 * What is staged, and why (same reason as ai-response-navigation-installed.test.js):
 *   `PathResolver` and the skills installer look in `cli/bundled/` BEFORE the repo root. `cli/bundled/`
 *   is a gitignored build product of `npm run prepack`; where it exists but is older than the sources,
 *   the real CLI installs the OLD skills and a test of "what the adopter gets" measures the stale build.
 *   So this test runs a staged copy of the CLI (cli/bin + cli/src, copied at test time, so a mutation of
 *   the source is what runs) whose repo root is the real repo (symlinks) and which has no bundled/.
 *
 * What is guarded, in plain words (all read back from the INSTALLED files, in English, zh-TW and zh-CN, every one
 * of them through `uds init`; XSPEC-451 fixed `uds init --locale zh-cn`, which used to fail and roll back):
 *   1. `uds init` exits 0 and reports installing Skills (the entry ran).
 *   2. The skill's SKILL.md and its evaluation companion are on disk, and SKILL.md's body is
 *      byte-identical to the shipped source (a stale or truncated copy shows up here with its own message).
 *   3. The three guards exist (no-new-facts, keep-hedges, trace-and-gaps), each is marked REQUIRED both in
 *      the summary table and in its own heading, and each carries a good and a bad example.
 *   4. The substance of each guard is still in the text (English copy): no new facts, hedges kept
 *      ("might" stays "might"), every item has a source pointer and a "not covered" note.
 *   5. The HTML rung forbids external resources, and the HTML skeleton the skill ships passes that rule
 *      itself. The detector must prove it can fire first (control arm), otherwise "clean" proves nothing.
 *   6. The ladder has exactly three rungs and none of them is a video rung (same control-arm discipline).
 *
 * HOME and every XDG_* variable point to a throwaway directory; no network is needed (sources are
 * local, the update check is disabled).
 */

import { it, expect, beforeAll, afterAll } from 'vitest';
import { spawn } from 'child_process';
import {
  mkdtempSync, mkdirSync, cpSync, symlinkSync, readdirSync, readFileSync, existsSync, rmSync, realpathSync
} from 'fs';
import { tmpdir } from 'os';
import { join, resolve } from 'path';
import { isolatedEnv } from '../../../scripts/lib/isolated-home.mjs';

const REAL_CLI_DIR = resolve(import.meta.dirname, '../..');
const REAL_REPO = resolve(REAL_CLI_DIR, '..');
const SKILL = 'comprehension-ladder';

// Per-language labels. Everything language-specific lives here so the assertions below read the same.
const LOCALES = [
  {
    id: 'en',
    initArgs: [],
    sourceFile: (f) => join(REAL_REPO, 'skills', SKILL, f),
    guardsH2: 'The three guards',
    ladderH2: 'The ladder',
    rung3H4: 'Rung 3',
    good: '**Good**',
    bad: '**Bad**',
    required: /^Required$/,
    networkSentence: /must not load anything from the network/
  },
  {
    id: 'zh-TW',
    initArgs: ['--locale', 'zh-tw'],
    sourceFile: (f) => join(REAL_REPO, 'locales', 'zh-TW', 'skills', SKILL, f),
    guardsH2: '三條防護',
    ladderH2: '階梯',
    rung3H4: '第 3 階',
    good: '**正例**',
    bad: '**反例**',
    required: /^必須$/,
    networkSentence: /不得從網路載入任何東西/
  },
  {
    id: 'zh-CN',
    initArgs: ['--locale', 'zh-cn'],
    sourceFile: (f) => join(REAL_REPO, 'locales', 'zh-CN', 'skills', SKILL, f),
    guardsH2: '三条防护',
    ladderH2: '阶梯',
    rung3H4: '第 3 阶',
    good: '**正例**',
    bad: '**反例**',
    required: /^必须$/,
    networkSentence: /不得从网络加载任何东西/
  }
];

const GUARD_IDS = ['no-new-facts', 'keep-hedges', 'trace-and-gaps'];

let sandbox;
const installs = {}; // locale id -> { run, skillDir }

/** A runnable copy of the CLI whose skills come from the real repo and which has no bundled/. */
function stageCli(root) {
  const cli = join(root, 'cli');
  mkdirSync(cli, { recursive: true });
  cpSync(join(REAL_CLI_DIR, 'bin'), join(cli, 'bin'), { recursive: true });
  cpSync(join(REAL_CLI_DIR, 'src'), join(cli, 'src'), { recursive: true });
  for (const f of ['package.json', 'standards-registry.json']) {
    cpSync(join(REAL_CLI_DIR, f), join(cli, f));
  }
  // Dependencies: the staged tree resolves bare imports through this link.
  symlinkSync(realpathSync(join(REAL_CLI_DIR, 'node_modules')), join(cli, 'node_modules'), 'dir');
  // The staged repo root: every top-level entry of the real repo except cli/ and VCS/dependency dirs.
  for (const name of readdirSync(REAL_REPO)) {
    if (['cli', '.git', 'node_modules'].includes(name)) continue;
    symlinkSync(join(REAL_REPO, name), join(root, name));
  }
  return join(cli, 'bin', 'uds.js');
}

function runCli(cliPath, args, cwd, env, timeoutMs = 90000) {
  return new Promise((done) => {
    const proc = spawn('node', [cliPath, ...args], { cwd, env, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', (d) => { stdout += d.toString(); });
    proc.stderr.on('data', (d) => { stderr += d.toString(); });
    const timer = setTimeout(() => proc.kill('SIGTERM'), timeoutMs);
    proc.on('close', (code) => {
      clearTimeout(timer);
      done({ code, stdout, stderr });
    });
  });
}

/** Text of the `## <heading>` section (up to the next `## ` heading). */
function h2Section(text, heading) {
  const m = text.match(new RegExp('^## ' + heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*$([\\s\\S]*?)(?=^## |(?![\\s\\S]))', 'm'));
  return m ? m[1] : null;
}

/** Text of the `### G<n> ...` section for one guard (up to the next `### ` or `## ` heading). */
function guardSections(guardsText) {
  const out = {};
  const re = /^###\s+(G[123])\s+`([a-z-]+)`\s*[（(]([^）)\n]+)[）)]\s*$([\s\S]*?)(?=^###? |(?![\s\S]))/gm;
  let m;
  while ((m = re.exec(guardsText)) !== null) {
    out[m[1]] = { name: m[2], priority: m[3].trim(), body: m[4] };
  }
  return out;
}

/** Rows of the guard summary table: | G1 | `no-new-facts`: ... | **Required** |  */
function guardTableRows(guardsText) {
  const rows = {};
  for (const line of guardsText.split('\n')) {
    const m = line.match(/^\|\s*(G[123])\s*\|\s*`([a-z-]+)`[^|]*\|\s*([^|]*?)\s*\|\s*$/);
    if (m) rows[m[1]] = { name: m[2], priority: m[3].replace(/\*/g, '').replace(/[（(].*[）)]/, '').trim() };
  }
  return rows;
}

/** Rows of the ladder table: | 1 | Controlled text | ... |  */
function ladderRows(ladderText) {
  return ladderText.split('\n').filter((l) => /^\|\s*\d+\s*\|/.test(l));
}

/** Does this ladder carry a video rung? (English and Chinese words for video.) */
function hasVideoRung(rows) {
  return rows.some((r) => /video|影片|视频/i.test(r));
}

/** Does this HTML load anything from outside the file? Returns the list of reasons (empty = offline). */
function externalLoads(html) {
  const reasons = [];
  if (/<link\b/i.test(html)) reasons.push('<link> element');
  if (/<script\b[^>]*\bsrc\s*=/i.test(html)) reasons.push('<script src>');
  if (/\b(?:src|href|action|poster|data)\s*=\s*["']?\s*(?:https?:)?\/\//i.test(html)) reasons.push('URL attribute');
  if (/@import/i.test(html)) reasons.push('@import');
  if (/url\(\s*["']?\s*(?:https?:)?\/\//i.test(html)) reasons.push('css url()');
  if (/https?:\/\//i.test(html)) reasons.push('http(s):// anywhere');
  if (/\bfetch\s*\(|XMLHttpRequest|WebSocket|\bimport\s*\(/.test(html)) reasons.push('network API call');
  return reasons;
}

// No describe wrapper on purpose: the full test name is then just the it() title, which is what
// both vitest -t (joins parents with " > ") and the JSON reporter (joins with " ") agree on.
beforeAll(async () => {
  // Everything this test needs is set up here, so it also passes when selected on its own.
  sandbox = mkdtempSync(join(tmpdir(), 'uds-test-clad-installed-'));
  const cliPath = stageCli(join(sandbox, 'stage'));
  const home = join(sandbox, 'home');
  mkdirSync(home, { recursive: true });
  const env = { ...isolatedEnv(home, process.env), FORCE_COLOR: '0', UDS_NO_UPDATE_CHECK: '1' };
  for (const loc of LOCALES) {
    const projectDir = join(sandbox, 'project-' + loc.id);
    // `.claude/` is Claude Code's own detector marker. Without any detected tool, `uds init` takes the
    // legacy path, which ignores --locale; with it, the unified installer runs (the path adopters use).
    mkdirSync(join(projectDir, '.claude'), { recursive: true });
    const skillDir = join(projectDir, '.claude', 'skills', SKILL);
    const run = await runCli(cliPath, ['init', '--yes', '--skills-location', 'project', ...loc.initArgs], projectDir, env);
    installs[loc.id] = { run, skillDir };
  }
}, 240000);

afterAll(() => {
  if (sandbox && sandbox.includes('uds-test-clad-installed-')) {
    rmSync(sandbox, { recursive: true, force: true });
  }
});

it('uds installs the comprehension-ladder skill with its three guards: no new facts, hedges kept, every item traced to its source and what it does not cover (installed-skill)', () => {
  // Control arms first: prove each detector can fire, otherwise "not found" below would prove nothing.
  const dirtyHtml = [
    '<link rel="stylesheet" href="https://cdn.example.test/a.css">',
    '<script src="https://cdn.example.test/m.js"></script>',
    '<style>@import url("//cdn.example.test/f.css");</style>',
    '<img src="//cdn.example.test/x.png">',
    '<script>fetch("/data.json")</script>'
  ];
  for (const sample of dirtyHtml) {
    expect(externalLoads(sample).length, 'detector must fire on: ' + sample).toBeGreaterThan(0);
  }
  expect(externalLoads('<!doctype html><style>body{margin:0}</style><p id="O1">A</p><a href="#O1">top</a>')).toEqual([]);
  const videoLadder = ['| 1 | Controlled text |', '| 2 | Mermaid diagram |', '| 3 | HTML explainer |', '| 4 | Video explainer |'];
  expect(hasVideoRung(videoLadder), 'video detector must fire on a 4th video row').toBe(true);
  expect(hasVideoRung(videoLadder.slice(0, 3))).toBe(false);

  for (const loc of LOCALES) {
    const { run, skillDir } = installs[loc.id];
    const tag = `[${loc.id}] `;

    // 1. The entry ran.
    expect(run.code, tag + 'uds init exit code').toBe(0);
    expect(run.stdout, tag + 'init reports installing skills').toMatch(/Installed \d+ Skills/);

    // 2. Read back what landed in the adopter project.
    const installedPath = join(skillDir, 'SKILL.md');
    expect(existsSync(installedPath), tag + 'SKILL.md was installed into the adopter project').toBe(true);
    expect(existsSync(join(skillDir, 'eval-cases.md')), tag + 'the evaluation companion was installed').toBe(true);
    const installed = readFileSync(installedPath, 'utf-8');
    const source = readFileSync(loc.sourceFile('SKILL.md'), 'utf-8');
    const body = (t) => t.replace(/^---\n[\s\S]*?\n---\n/, '');
    expect(body(installed) === body(source), tag + 'installed body is byte-identical to the shipped source').toBe(true);
    expect(installed).toMatch(/^name: comprehend$/m);
    expect(installed).toMatch(/^\s+Use when:/m);
    expect(installed).toMatch(/^\s+Not for:/m);
    expect(installed, tag + 'SKILL.md points to its evaluation companion by full file name').toMatch(/\(eval-cases\.md\)/);

    // 3. The three guards: present, REQUIRED in the table and in their own heading, with a good and a bad example.
    const guards = h2Section(installed, loc.guardsH2);
    expect(guards, tag + 'the three-guards section exists').not.toBeNull();
    const rows = guardTableRows(guards);
    const sections = guardSections(guards);
    expect(Object.keys(rows).sort(), tag + 'exactly three guards in the table').toEqual(['G1', 'G2', 'G3']);
    expect(Object.keys(sections).sort(), tag + 'exactly three guard sections').toEqual(['G1', 'G2', 'G3']);
    ['G1', 'G2', 'G3'].forEach((g, i) => {
      expect(rows[g].name, tag + g + ' table name').toBe(GUARD_IDS[i]);
      expect(sections[g].name, tag + g + ' section name').toBe(GUARD_IDS[i]);
      expect(rows[g].priority, tag + g + ' is Required in the table').toMatch(loc.required);
      expect(sections[g].priority, tag + g + ' is Required in its heading').toMatch(loc.required);
      expect(sections[g].body, tag + g + ' has a good example').toContain(loc.good);
      expect(sections[g].body, tag + g + ' has a bad example').toContain(loc.bad);
      expect((sections[g].body.match(/```/g) || []).length, tag + g + ' shows both examples as code blocks').toBeGreaterThanOrEqual(4);
    });
    expect(guards, tag + 'nothing in the guards section makes a guard optional').not.toMatch(/\boptional\b|選用|选用/i);

    // 4. The substance of each guard is still in the text.
    if (loc.id === 'en') {
      expect(sections.G1.body).toMatch(/must come from the source/);
      expect(guards).toMatch(/add no fact the source does not state/);
      expect(sections.G2.body).toMatch(/If the source says "might", the rung says "might"/);
      expect(guards).toMatch(/Do not turn an uncertain claim into a certain one/);
      expect(sections.G3.body).toMatch(/\*\*Source\*\*/);
      expect(sections.G3.body).toMatch(/\*\*Not covered\*\*/);
      expect(sections.G3.body).toMatch(/Left out of this outline/);
    } else {
      expect(sections.G2.body, tag + 'G2 keeps the hedge word 可能').toMatch(/可能/);
      expect(sections.G3.body, tag + 'G3 names the source pointer').toMatch(/對應原文|对应原文/);
      expect(sections.G3.body, tag + 'G3 names the not-covered note').toMatch(/沒涵蓋|没涵盖/);
    }

    // 5. The HTML rung forbids external resources, and the skeleton it ships obeys its own rule.
    const rung3 = installed.match(new RegExp('^#### ' + loc.rung3H4 + '[^\\n]*\\n([\\s\\S]*?)(?=^#{2,4} |(?![\\s\\S]))', 'm'));
    expect(rung3, tag + 'the HTML rung section exists').not.toBeNull();
    expect(rung3[1], tag + 'it says nothing is loaded from the network').toMatch(loc.networkSentence);
    expect(rung3[1]).toContain('<link>');
    expect(rung3[1]).toContain('`https://`');
    expect(rung3[1]).toContain('fetch');
    expect(rung3[1]).toContain('XMLHttpRequest');
    const skeleton = rung3[1].match(/```html\n([\s\S]*?)```/);
    expect(skeleton, tag + 'the HTML skeleton is there').not.toBeNull();
    expect(externalLoads(skeleton[1]), tag + 'the shipped HTML skeleton loads nothing external').toEqual([]);

    // 6. Exactly three rungs, none of them video.
    const ladder = h2Section(installed, loc.ladderH2);
    expect(ladder, tag + 'the ladder section exists').not.toBeNull();
    const ladderTable = ladderRows(ladder);
    expect(ladderTable.length, tag + 'exactly three rungs').toBe(3);
    expect(ladderTable.map((r) => r.match(/^\|\s*(\d+)/)[1])).toEqual(['1', '2', '3']);
    expect(hasVideoRung(ladderTable), tag + 'no video rung').toBe(false);
  }
});
