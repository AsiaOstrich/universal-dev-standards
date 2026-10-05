/**
 * E2E: the ai-response-navigation standard (Rule 12, controlled language) as an ADOPTER
 * receives it — through the product entry `uds init`, not by reading the repo's source files.
 *
 * Evidence for DEC-125-L3 / dev-platform XSPEC-449 R5.
 *
 * Why this exists next to tests/unit/standards/ai-response-navigation-controlled-language.test.js:
 * that test reads core/ and ai/standards/ straight off disk. It proves the SOURCE says the right
 * thing; it cannot tell whether an adopter ever receives it. This one spawns the real CLI
 * (`node cli/bin/uds.js init --yes`) in a throwaway project and reads back what landed in
 * `<project>/.standards/`. Cut the wire that copies the standard into the project and this goes red:
 *   - cli/src/installers/standards-installer.js  `copyStandard(sourcePath, '.standards', projectPath)`
 *
 * What is staged, and why (the one non-obvious part):
 *   `PathResolver.getStandardSource` looks in `cli/bundled/` BEFORE the repo root. `cli/bundled/` is a
 *   gitignored build product of `npm run prepack` — in a checkout where it exists but is older than
 *   the sources (the maintainer's, after any standards edit), the real CLI installs the OLD standard
 *   and a test of "what the adopter gets" measures the stale build, not the code under test. A clean
 *   checkout (CI) has no bundled/ and falls through to the repo root. To get the same answer in both,
 *   this test runs a staged copy of the CLI (cli/bin + cli/src, copied at test time, so a mutation of
 *   the source is what runs) whose repo root is the real repo (symlinks) and which has no bundled/.
 *
 * What is guarded, in plain words (all read back from the INSTALLED file):
 *   1. `uds init` exits 0 and reports copying standards (the entry ran).
 *   2. The installed file is byte-for-byte the shipped source (a stale or truncated copy shows up here
 *      with its own message, instead of as a mysterious "Rule 12 not found").
 *   3. Rule 12 is there: keep-uncertainty-markers (required) and controlled-language (optional).
 *   4. "Keep the hedges" really says do-not-turn-uncertain-into-certain.
 *   5. No English word dictionary; ASD-STE100's dictionary is disclaimed.
 *   6. Rule 10 (plain-language-is-the-subject) points to Rule 12.
 *   7. The manifest that `uds init` wrote lists the standard.
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
import * as yaml from 'js-yaml';
import { isolatedEnv } from '../../../scripts/lib/isolated-home.mjs';

const REAL_CLI_DIR = resolve(import.meta.dirname, '../..');
const REAL_REPO = resolve(REAL_CLI_DIR, '..');
const STANDARD = 'ai-response-navigation.ai.yaml';

let sandbox;
let projectDir;
let initRun;

/** A runnable copy of the CLI whose standards come from the real repo and which has no bundled/. */
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
  // (REPO_ROOT = <cli>/.. is where PathResolver looks once bundled/ misses.)
  for (const name of readdirSync(REAL_REPO)) {
    if (['cli', '.git', 'node_modules'].includes(name)) continue;
    symlinkSync(join(REAL_REPO, name), join(root, name));
  }
  return join(cli, 'bin', 'uds.js');
}

function runCli(cliPath, args, cwd, env, timeoutMs = 60000) {
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

/** Does this text carry an English word dictionary (an approved/unapproved table or a long bare word list)? */
function looksLikeEnglishDictionary(text) {
  const lines = text.split('\n');
  const tableHeader = lines.some(
    (l) => /^\s*\|/.test(l) && /\b(approved|unapproved|not approved|preferred word|replace(ment)? with|allowed word)\b/i.test(l)
  );
  const entry = /^\s*(?:[-*]\s+|\|\s*)?[A-Za-z][A-Za-z-]{1,24}(?:\s*(?:\||->|→|=>|:|–|-)\s*[A-Za-z][A-Za-z -]{0,30})?\s*\|?\s*$/;
  let run = 0;
  let longest = 0;
  for (const l of lines) {
    run = entry.test(l) ? run + 1 : 0;
    longest = Math.max(longest, run);
  }
  return tableHeader || longest >= 6;
}

// No describe wrapper on purpose: the full test name is then just the it() title, which is what
// both vitest -t (joins parents with " > ") and the JSON reporter (joins with " ") agree on.
beforeAll(async () => {
  // Everything this test needs is set up here, so it also passes when selected on its own.
  sandbox = mkdtempSync(join(tmpdir(), 'uds-test-arn-installed-'));
  const cliPath = stageCli(join(sandbox, 'stage'));
  const home = join(sandbox, 'home');
  mkdirSync(home, { recursive: true });
  projectDir = join(sandbox, 'project');
  mkdirSync(projectDir, { recursive: true });
  const env = {
    ...isolatedEnv(home, process.env),
    FORCE_COLOR: '0',
    UDS_NO_UPDATE_CHECK: '1'
  };
  initRun = await runCli(cliPath, ['init', '--yes', '--skills-location', 'none'], projectDir, env);
}, 120000);

afterAll(() => {
  if (sandbox && sandbox.includes('uds-test-arn-installed-')) {
    rmSync(sandbox, { recursive: true, force: true });
  }
});

it('uds init installs ai-response-navigation with the Rule 12 hedge clause required, no English dictionary, and Rule 10 pointing to Rule 12 (installed-copy)', () => {
  // 1. The entry ran. (Only the exit code and a fixed phrase are asserted; no stderr is echoed.)
  expect(initRun.code, 'uds init exit code').toBe(0);
  expect(initRun.stdout).toMatch(/Copied \d+ standard files/);

  // Read back what landed in the adopter project.
  const installedPath = join(projectDir, '.standards', STANDARD);
  expect(existsSync(installedPath), 'the standard was installed into .standards/').toBe(true);
  const installedText = readFileSync(installedPath, 'utf-8');

  // 2. It is the shipped source, not a stale or partial copy.
  const sourceText = readFileSync(join(REAL_REPO, 'ai', 'standards', STANDARD), 'utf-8');
  expect(installedText === sourceText, 'installed file is byte-identical to ai/standards/' + STANDARD).toBe(true);

  const doc = yaml.load(installedText);
  const rules = doc.rules;

  // 3. Rule 12 is present, and the hedge-keeping half is the required one.
  const hedgeRule = rules.find((r) => r.id === 'keep-uncertainty-markers');
  const styleRule = rules.find((r) => r.id === 'controlled-language');
  expect(hedgeRule, 'installed yaml has keep-uncertainty-markers').toBeDefined();
  expect(styleRule, 'installed yaml has controlled-language').toBeDefined();
  expect(hedgeRule.priority).toBe('required');
  expect(styleRule.priority).toBe('optional');

  // 4. The required clause actually forbids turning uncertainty into certainty.
  expect(hedgeRule.instruction).toMatch(/do not turn an uncertain claim into a certain one/i);
  expect(hedgeRule.instruction).toMatch(/Keep the writer's hedges/);

  // 5. No English dictionary; the STE dictionary is disclaimed. The detector must prove it can fire
  //    first, otherwise "not found" below would prove nothing.
  const dictionarySample = ['| Approved word | Unapproved word |', '|---|---|', '| zorp | blik |', '| frum | glap |'].join('\n');
  const wordListSample = ['zorp', 'blik', 'frum', 'glap', 'quen', 'vosk', 'drel'].join('\n');
  expect(looksLikeEnglishDictionary(dictionarySample)).toBe(true);
  expect(looksLikeEnglishDictionary(wordListSample)).toBe(true);
  expect(looksLikeEnglishDictionary(hedgeRule.instruction + '\n' + styleRule.instruction)).toBe(false);
  expect(styleRule.instruction).toMatch(/Do NOT use ASD-STE100's approved dictionary/);
  expect(styleRule.instruction).toMatch(/do not apply to Chinese or other non-English text/);

  // 6. Rule 10 points to Rule 12.
  const rule10 = rules.find((r) => r.id === 'plain-language-is-the-subject');
  expect(rule10, 'installed yaml has plain-language-is-the-subject').toBeDefined();
  expect(rule10.instruction).toMatch(/keep-uncertainty-markers/);

  // 7. The manifest `uds init` wrote lists this standard.
  const manifest = JSON.parse(readFileSync(join(projectDir, '.standards', 'manifest.json'), 'utf-8'));
  expect(manifest.standards).toContain('ai/standards/' + STANDARD);
});
