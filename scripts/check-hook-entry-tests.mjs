#!/usr/bin/env node
// SPDX-License-Identifier: MIT
//
// Hook entry-test gate: every hook UDS ships that can block must have a test that
// runs it the way the host (Claude Code) runs it.
//
// WHY THIS EXISTS
//   scripts/hooks/check-dangerous-cmd.mjs shipped for months and never blocked
//   anything: it exited 1, and Claude Code blocks a tool call only on exit 2. Its
//   unit tests were green the whole time because they imported the matcher
//   function and never ran the hook as a process. (Measured 2026-10-27 on 11,617
//   real shell calls; fixed in #281, which added the first two entry tests.)
//   A green component test says nothing about whether the component is wired to
//   the host's contract. This gate makes the NEXT hook unable to repeat that.
//
// WHAT IT CHECKS
//   1. Which hooks exist. Derived, never hand-listed:
//        - hooks the installer wires: cli/src/installers/hooks-installer.js
//          `collectHookConfigs()` run over ai/standards/*.ai.yaml `enforcement:`
//          blocks (gives script + event + matcher);
//        - the three harness-specific Stop adapters: the installer's exported
//          CODEX_/GEMINI_/AGY_HOOK_SCRIPT constants;
//        - every other top-level script in scripts/hooks/ -- these must be
//          classified in NOT_A_HOOK_ENTRY below or the gate fails ("unclassified"),
//          so a new hook cannot slip past by simply not being wired yet.
//   2. What "blocks" means for each hook (EVENT_CONTRACT, keyed by event):
//        exit2        PreToolUse / PostToolUse / UserPromptSubmit: the host reads
//                     the exit code; only 2 blocks (PostToolUse: feeds stderr to
//                     the model). Exit 1 is a silent non-blocking hook error.
//        stdout-json  Stop / SubagentStop / AfterAgent: the hook blocks with a
//                     {"decision":...} document on stdout and exit 0.
//   3. For each hook, at least ONE test file under cli/tests/ must satisfy ALL of
//      (static detection, see "HEURISTIC"):
//        a. names the hook script in a non-import string (it is the spawn target);
//        b. spawns a process (child_process spawn/exec family);
//        c. feeds stdin (`input:` option or `stdin.write/end`), and for `exit2`
//           hooks the file contains a host payload key (tool_name, tool_input,
//           hook_event_name);
//        d. asserts the host-facing block signal:
//             exit2        a status/exitCode/code assertion that equals 2
//                          (literal 2, or a const bound to 2);
//             stdout-json  the file mentions `decision` (WEAKER, see blind spots).
//
// HEURISTIC AND KNOWN BLIND SPOTS (read before trusting a green)
//   This is static text analysis. It proves a test of the right SHAPE exists. It
//   does NOT run the test and does NOT prove the test would go red if the hook
//   regressed -- CI's test job runs it, and the cut check in the PR that added
//   this gate shows the entry tests do go red when the hook's exit code changes.
//   - File-level, not call-level: if one test file spawns hook A and hook B, a
//     `toBe(2)` for B satisfies A too. Keep one entry test file per hook.
//   - Any `toBe(2)` on a line near `status`/`code` counts, even if it asserts the
//     wrong call. The assertion is not tied to the spawn that precedes it.
//   - The assertion value must be the literal 2 or a const bound to 2 in the same
//     file. A table-driven test asserting `toBe(expected)` does not count (false
//     FAIL; bind the constant, as check-dangerous-cmd-entry.test.js does).
//   - Spawn APIs other than child_process (execa, shelljs) are not recognised
//     (false FAIL).
//   - Comments and import statements are stripped before looking, so a comment
//     naming the hook or a function-call test importing it does not count. The
//     comment stripper is a small state machine; a regex literal holding an
//     unbalanced quote can confuse it for the rest of that line.
//   - stdout-json hooks: `decision` anywhere in the file satisfies it. Weak on
//     purpose -- those hooks are also run by scripts/check-hook-delivery.ts.
//   - A test file that is not matched by vitest's include (tests/**/*.test.js)
//     still counts here; the walker takes .js/.mjs/.cjs/.ts under cli/tests.
//   - It checks the unit that SHIPS (scripts/hooks). A hook that is wired by a
//     path the installer does not know about is only seen via the top-level
//     scan and must be classified by hand.
//
// USAGE
//   node scripts/check-hook-entry-tests.mjs             check this repo
//   node scripts/check-hook-entry-tests.mjs --root DIR  check another tree (tests use this)
//   node scripts/check-hook-entry-tests.mjs --self-test prove the detector can fail
//
// EXIT CODES: 0 pass | 1 violations | 2 unmeasurable (nothing to measure, installer
//   unreadable). 2 is a failure too: a gate that goes quiet when it cannot see is
//   a gate that is bypassed by breaking what it reads.

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, basename, resolve } from 'node:path';
import { dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const SELF = fileURLToPath(import.meta.url);
const REPO_ROOT = join(dirname(SELF), '..');

// ---------------------------------------------------------------------------
// Classification tables. The ONLY hand-written parts of the gate.
// ---------------------------------------------------------------------------

/**
 * What blocking looks like on each host event. Unknown event => the gate fails and
 * asks for a classification, instead of guessing that it cannot block.
 * (Claude Code: exit 2 blocks PreToolUse and UserPromptSubmit, and feeds a
 * PostToolUse hook's stderr to the model. UDS Stop-family hooks use the JSON
 * decision shape with exit 0 -- see core/turn-completion-integrity.md.)
 */
export const EVENT_CONTRACT = {
  PreToolUse: 'exit2',
  PostToolUse: 'exit2',
  UserPromptSubmit: 'exit2',
  Stop: 'stdout-json',
  SubagentStop: 'stdout-json',
  AfterAgent: 'stdout-json', // Gemini CLI's name for the end-of-turn event
};

/**
 * Event of each harness-specific adapter. The installer (installCodexHooks,
 * installGeminiHooks, installAgyHooks) hard-codes these events inside the function
 * bodies and does not export them, so they are restated here once; the same facts
 * are in ai/standards/turn-completion-integrity.ai.yaml `supported_harnesses`.
 * The script NAMES come from the installer's exports, not from this file.
 */
const HARNESS_EVENT = { codex: 'Stop', gemini: 'AfterAgent', agy: 'Stop' };

/**
 * Top-level files in scripts/hooks/ that are shipped but are not a blocking hook
 * entry, with the reason. A file listed here that is wired by the installer, or
 * whose source can exit 2, FAILS the gate: this table may not contradict the code.
 */
export const NOT_A_HOOK_ENTRY = {
  'inject-standards.mjs':
    'UserPromptSubmit-style context injector that no installer path wires; every code path exits 0 (failures are non-blocking by design)',
  'telemetry-wrapper.mjs':
    'library imported by callers to record hook telemetry; has no stdin entry point and no exit-code contract',
};

const SCRIPT_EXT = /\.(?:mjs|cjs|js|ts|sh|py)$/;
const TEST_EXT = /\.(?:mjs|cjs|js|ts)$/;
const HOST_PAYLOAD_KEY = /\b(?:tool_name|tool_input|hook_event_name)\b/;

// ---------------------------------------------------------------------------
// Source normalisation
// ---------------------------------------------------------------------------

/** Remove // and block comments, leaving string contents alone. */
export function stripComments(src) {
  let out = '';
  let i = 0;
  const n = src.length;
  while (i < n) {
    const c = src[i];
    const d = src[i + 1];
    if (c === '/' && d === '/') {
      while (i < n && src[i] !== '\n') i++;
      continue;
    }
    if (c === '/' && d === '*') {
      i += 2;
      while (i < n && !(src[i] === '*' && src[i + 1] === '/')) i++;
      i += 2;
      out += ' ';
      continue;
    }
    if (c === '"' || c === "'" || c === '`') {
      const q = c;
      out += c;
      i++;
      while (i < n) {
        const e = src[i];
        out += e;
        i++;
        if (e === '\\' && i < n) { out += src[i]; i++; continue; }
        if (e === q) break;
        if (e === '\n' && q !== '`') break; // an unterminated quote must not eat the file
      }
      continue;
    }
    out += c;
    i++;
  }
  return out;
}

/** Drop import/require specifiers: importing a hook is not running it. */
export function stripImports(src) {
  return src
    .replace(/^\s*import\s[^;'"]*?from\s*['"][^'"]+['"]/gm, '')
    .replace(/^\s*import\s*['"][^'"]+['"]/gm, '')
    .replace(/\bimport\s*\(\s*['"`][^'"`]+['"`]\s*\)/g, 'import(<static>)')
    .replace(/\brequire\s*\(\s*['"`][^'"`]+['"`]\s*\)/g, 'require(<static>)');
}

// ---------------------------------------------------------------------------
// Detector: does this test file run the hook the way the host does?
// ---------------------------------------------------------------------------

const SPAWN_CALL = /\b(?:spawnSync|execFileSync|execFile|execSync|spawn|fork)\s*\(|(?<![.\w$])exec\s*\(/;
const STDIN_FEED = /\binput\s*:|\bstdin\s*\.\s*(?:write|end)\s*\(/;

/** Names bound to the literal 2 (`const BLOCKS = 2;`). */
function namesBoundToTwo(src) {
  const names = new Set();
  const re = /\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*2\b(?!\s*[.\d+*/-])/g;
  for (let m; (m = re.exec(src)); ) names.add(m[1]);
  return names;
}

/** Does the source assert that an exit status / code equals 2? */
export function assertsExitTwo(src) {
  const flat = src.replace(/\s+/g, ' ');
  const twos = namesBoundToTwo(src);
  const isTwo = (tok) => tok === '2' || twos.has(tok);
  const status = String.raw`\b(?:status|exitCode|exit_code|code)\b`;
  const patterns = [
    // expect(r.status).toBe(2)   expect(run(x).status).toBe(BLOCKS)
    new RegExp(`${status}[^;]{0,80}?\\.(?:toBe|toEqual|toStrictEqual)\\(\\s*([\\w$]+)\\s*\\)`, 'g'),
    // assert.equal(r.status, 2)  assert.strictEqual(r.status, 2)
    new RegExp(`\\b(?:equal|strictEqual|deepEqual|deepStrictEqual)\\(\\s*[^;]{0,80}?${status}[^;,]{0,40},\\s*([\\w$]+)\\s*\\)`, 'g'),
    // assert.equal(2, r.status)
    new RegExp(`\\b(?:equal|strictEqual|deepEqual|deepStrictEqual)\\(\\s*([\\w$]+)\\s*,\\s*[^;,]{0,80}?${status}`, 'g'),
  ];
  for (const re of patterns) {
    for (let m; (m = re.exec(flat)); ) if (isTwo(m[1])) return true;
  }
  return false;
}

/**
 * Judge one test file against one hook.
 * @returns {{ ok: boolean, missing: string[], references: boolean }}
 */
export function judgeTestFile(rawSource, hookBase, contract) {
  const noComments = stripComments(rawSource);
  const referenceView = stripImports(noComments);
  const references = referenceView.includes(hookBase);
  const missing = [];
  if (!references) {
    // Naming the hook only in an import is the function-call unit test this gate rejects; say so.
    if (noComments.includes(hookBase)) {
      return { ok: false, references: true, missing: ['runs the hook as a process (it only imports the hook and calls its functions)'] };
    }
    return { ok: false, missing: ['names the hook as a spawn target'], references };
  }

  if (!(/\bchild_process\b/.test(noComments) && SPAWN_CALL.test(noComments))) {
    missing.push('spawns the hook as a separate process (child_process spawnSync/execFileSync/spawn)');
  }
  if (!STDIN_FEED.test(noComments)) {
    missing.push('writes a payload to the hook\'s stdin (`input:` option or stdin.write/end)');
  }
  if (contract === 'exit2') {
    if (!HOST_PAYLOAD_KEY.test(noComments)) {
      missing.push('uses a host-shaped payload (tool_name / tool_input / hook_event_name)');
    }
    if (!assertsExitTwo(noComments)) {
      missing.push('asserts the exit status equals 2 (the only code Claude Code treats as a block)');
    }
  } else if (!/\bdecision\b/.test(noComments)) {
    missing.push('asserts the stdout JSON block decision (`decision`)');
  }
  return { ok: missing.length === 0, missing, references };
}

// ---------------------------------------------------------------------------
// Enumeration
// ---------------------------------------------------------------------------

function walkFiles(dir, accept, skip = new Set(['node_modules', '.git'])) {
  const out = [];
  const visit = (d) => {
    let names;
    try { names = readdirSync(d); } catch { return; }
    for (const name of names) {
      const full = join(d, name);
      let st;
      try { st = statSync(full); } catch { continue; }
      if (st.isDirectory()) { if (!skip.has(name)) visit(full); continue; }
      if (accept(name)) out.push(full);
    }
  };
  visit(dir);
  return out.sort();
}

/**
 * Everything the installer wires, plus shipped-but-unwired top-level scripts.
 * @returns {Promise<{ hooks: Array, problems: string[] }>}
 */
export async function enumerateHooks(root) {
  const problems = [];
  const hooksDir = join(root, 'scripts', 'hooks');
  const stdDir = join(root, 'ai', 'standards');
  if (!existsSync(hooksDir)) return { hooks: [], problems: [`${relative(REPO_ROOT, hooksDir) || hooksDir} does not exist`], unmeasurable: true };

  const installerPath = join(REPO_ROOT, 'cli', 'src', 'installers', 'hooks-installer.js');
  let installer;
  try {
    installer = await import(pathToFileURL(installerPath).href);
  } catch (e) {
    return {
      hooks: [],
      problems: [`cannot load the installer (${e.message}); run \`npm ci\` in cli/ first`],
      unmeasurable: true,
    };
  }

  const { configs, skipped } = installer.collectHookConfigs(stdDir, hooksDir);
  for (const s of skipped) {
    problems.push(`a standard declares a hook the installer cannot install, so it would not be gated: ${s.id} (${s.why})`);
  }

  /** @type {Map<string, {rel:string, base:string, events:Set<string>, matchers:Set<string>, source:string}>} */
  const byRel = new Map();
  const add = (rel, event, matcher, source) => {
    const h = byRel.get(rel) || { rel, base: basename(rel), events: new Set(), matchers: new Set(), source };
    h.events.add(event);
    if (matcher) h.matchers.add(matcher);
    byRel.set(rel, h);
  };

  for (const [event, entries] of Object.entries(configs)) {
    for (const entry of entries) {
      const command = entry.hooks?.[0]?.command ?? '';
      const m = /scripts\/hooks\/(\S+)/.exec(command);
      if (m) add(m[1], event, entry.matcher, 'enforcement block');
    }
  }
  const harness = {
    [installer.CODEX_HOOK_SCRIPT]: HARNESS_EVENT.codex,
    [installer.GEMINI_HOOK_SCRIPT]: HARNESS_EVENT.gemini,
    [installer.AGY_HOOK_SCRIPT]: HARNESS_EVENT.agy,
  };
  for (const [script, event] of Object.entries(harness)) {
    if (script && existsSync(join(hooksDir, script))) add(script, event, '', 'harness installer');
  }

  const hooks = [];
  const topLevel = readdirSync(hooksDir).filter((n) => SCRIPT_EXT.test(n) && statSync(join(hooksDir, n)).isFile());
  for (const name of topLevel) {
    if (byRel.has(name)) continue;
    if (Object.hasOwn(NOT_A_HOOK_ENTRY, name)) {
      const text = readFileSync(join(hooksDir, name), 'utf8');
      if (/\bexit\s*\(\s*2\s*\)|\bexitCode\s*=\s*2\b/.test(stripComments(text))) {
        problems.push(`${name} is listed in NOT_A_HOOK_ENTRY as never blocking, but its source can exit 2 -- classify it as a hook`);
      }
      hooks.push({ rel: name, base: name, kind: 'exempt', reason: NOT_A_HOOK_ENTRY[name] });
      continue;
    }
    problems.push(`${name} is shipped in scripts/hooks/ but is neither wired by the installer nor listed in NOT_A_HOOK_ENTRY -- classify it (wire it via an \`enforcement:\` block, or add it to the table with a reason)`);
  }
  for (const name of Object.keys(NOT_A_HOOK_ENTRY)) {
    if (byRel.has(name)) problems.push(`${name} is wired by the installer but listed in NOT_A_HOOK_ENTRY -- remove it from the table`);
  }

  for (const h of byRel.values()) {
    const contracts = new Set();
    for (const ev of h.events) {
      if (!Object.hasOwn(EVENT_CONTRACT, ev)) {
        problems.push(`${h.rel} is wired to event "${ev}", which EVENT_CONTRACT does not classify -- say whether it can block and how`);
        continue;
      }
      contracts.add(EVENT_CONTRACT[ev]);
    }
    if (contracts.size === 0) continue;
    hooks.push({
      rel: h.rel,
      base: h.base,
      kind: 'hook',
      contract: contracts.has('exit2') ? 'exit2' : 'stdout-json',
      events: [...h.events],
      matchers: [...h.matchers],
      via: h.source,
    });
  }
  hooks.sort((a, b) => a.rel.localeCompare(b.rel));
  return { hooks, problems };
}

// ---------------------------------------------------------------------------
// Evaluation
// ---------------------------------------------------------------------------

const rel = (root, p) => relative(root, p).split('\\').join('/');

export async function evaluate(root) {
  const { hooks, problems, unmeasurable } = await enumerateHooks(root);
  const result = { hooks: [], problems: [...problems], unmeasurable: Boolean(unmeasurable), testFiles: 0 };
  if (unmeasurable) return result;

  const testsDir = join(root, 'cli', 'tests');
  const testFiles = walkFiles(testsDir, (n) => TEST_EXT.test(n));
  result.testFiles = testFiles.length;
  if (testFiles.length === 0) {
    result.unmeasurable = true;
    result.problems.push(`no test files found under ${rel(root, testsDir) || 'cli/tests'} -- zero files and "all covered" print the same`);
    return result;
  }
  if (hooks.filter((h) => h.kind === 'hook').length === 0) {
    result.unmeasurable = true;
    result.problems.push('no blocking hook was enumerated -- the installer walk is not seeing the standards');
    return result;
  }

  const sources = testFiles.map((f) => ({ path: rel(root, f), text: readFileSync(f, 'utf8') }));
  for (const h of hooks) {
    if (h.kind === 'exempt') { result.hooks.push({ ...h, status: 'exempt' }); continue; }
    const referencing = [];
    const passing = [];
    for (const s of sources) {
      const j = judgeTestFile(s.text, h.base, h.contract);
      if (j.ok) passing.push(s.path);
      else if (j.references) referencing.push({ path: s.path, missing: j.missing });
    }
    result.hooks.push({ ...h, status: passing.length > 0 ? 'covered' : 'uncovered', passing, referencing });
  }
  return result;
}

function describeContract(c) {
  return c === 'exit2'
    ? 'must spawn the hook with a host-shaped JSON payload on stdin and assert exit status 2'
    : 'must spawn the hook with a payload on stdin and assert the stdout JSON block decision';
}

export function render(result, root) {
  const lines = [];
  for (const h of result.hooks) {
    const where = `scripts/hooks/${h.rel}`;
    if (h.status === 'exempt') {
      lines.push(`  [skip] ${where}  not a hook entry: ${h.reason}`);
    } else if (h.status === 'covered') {
      lines.push(`  [ok]   ${where}  (${h.events.join('+')}, ${h.contract})  <- ${h.passing.join(', ')}`);
    } else {
      lines.push(`  [FAIL] ${where}  (${h.events.join('+')}${h.matchers.length ? `, matcher ${h.matchers.join('|')}` : ''}; blocks via ${h.contract})`);
      lines.push(`         no entry test: a test under cli/tests/ ${describeContract(h.contract)}.`);
      if (h.referencing.length === 0) {
        lines.push(`         no test file under cli/tests/ names ${h.base}.`);
      } else {
        for (const r of h.referencing) {
          lines.push(`         ${r.path} names it but does not satisfy: ${r.missing.join('; ')}`);
        }
      }
      lines.push('         A test that imports and calls the hook\'s functions does not count: that is exactly how a hook that never blocked shipped green.');
    }
  }
  for (const p of result.problems) lines.push(`  [FAIL] ${p}`);
  return lines;
}

// ---------------------------------------------------------------------------
// Self-test: a gate that was never seen failing cannot be told from one that cannot
// ---------------------------------------------------------------------------

const GOOD = `
import { spawnSync } from 'node:child_process';
const SCRIPT = join(dir, 'scripts', 'hooks', 'h.mjs');
const BLOCKS = 2;
const r = spawnSync(process.execPath, [SCRIPT], { input: JSON.stringify({ hook_event_name: 'PreToolUse', tool_name: 'Bash', tool_input: { command: 'x' } }) });
expect(r.status).toBe(BLOCKS);
`;

async function selfTest() {
  const arms = [
    ['spawn + host payload + exit 2 passes', () => judgeTestFile(GOOD, 'h.mjs', 'exit2').ok === true],
    ['literal 2 and assert.equal forms pass',
      () => judgeTestFile(GOOD.replace('toBe(BLOCKS)', 'toBe(2)'), 'h.mjs', 'exit2').ok === true &&
        judgeTestFile(GOOD.replace('expect(r.status).toBe(BLOCKS)', 'assert.strictEqual(r.status, 2)'), 'h.mjs', 'exit2').ok === true],
    ['FAIL arm: function-call unit test (import only) is rejected',
      () => judgeTestFile(`import { check } from '../../scripts/hooks/h.mjs';\nexpect(check('rm -rf /')).toBe(true);`, 'h.mjs', 'exit2').ok === false],
    ['FAIL arm: hook named only in a comment is rejected',
      () => judgeTestFile(`// covers h.mjs\n${GOOD.replace(/h\.mjs/g, 'other.mjs')}`, 'h.mjs', 'exit2').ok === false],
    ['FAIL arm: asserting exit 1 instead of 2 is rejected',
      () => judgeTestFile(GOOD.replace('BLOCKS = 2', 'BLOCKS = 1'), 'h.mjs', 'exit2').ok === false],
    ['FAIL arm: not(0) alone is not an exit-2 assertion',
      () => judgeTestFile(GOOD.replace('toBe(BLOCKS)', 'not.toBe(0)').replace('const BLOCKS = 2;', ''), 'h.mjs', 'exit2').ok === false],
    ['FAIL arm: RegExp.exec is not a process spawn',
      () => judgeTestFile(`const SCRIPT = 'h.mjs'; const x = /a/.exec('a'); const o = { input: 'tool_name' }; expect(r.status).toBe(2);`, 'h.mjs', 'exit2').ok === false],
    ['FAIL arm: no stdin payload is rejected',
      () => judgeTestFile(GOOD.replace(/input: JSON\.stringify\(.*?\) \}\)/s, '})'), 'h.mjs', 'exit2').ok === false],
    ['stdout-json contract needs spawn, stdin and a decision',
      () => judgeTestFile(`import {spawnSync} from 'child_process';\nspawnSync(node,['h.mjs'],{input:'{}'});\nexpect(JSON.parse(o).decision).toBe('block');`, 'h.mjs', 'stdout-json').ok === true &&
        judgeTestFile(`import {spawnSync} from 'child_process';\nspawnSync(node,['h.mjs'],{input:'{}'});`, 'h.mjs', 'stdout-json').ok === false],
    ['multi-line expect is read as one statement',
      () => assertsExitTwo('expect(r.status)\n  .toBe(2);') === true],
    ['denominator: the installer walk sees this repo\'s hooks',
      async () => {
        const r = await evaluate(REPO_ROOT);
        return !r.unmeasurable && r.hooks.filter((h) => h.kind === 'hook').length >= 5;
      }],
  ];
  let failed = 0;
  console.log('[hook-entry-tests --self-test]');
  for (const [name, fn] of arms) {
    let ok = false;
    let note = '';
    try { ok = (await fn()) === true; } catch (e) { note = ` (threw: ${e.message})`; }
    console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${name}${note}`);
    if (!ok) failed++;
  }
  console.log(`[hook-entry-tests --self-test] passed ${arms.length - failed} / failed ${failed}`);
  return failed === 0 ? 0 : 2;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(argv) {
  if (argv.includes('--self-test')) return selfTest();
  const ri = argv.indexOf('--root');
  const root = ri >= 0 ? resolve(argv[ri + 1] ?? '') : REPO_ROOT;
  const result = await evaluate(root);
  console.log('[hook-entry-tests] every hook that can block needs a test that runs it as the host does');
  for (const l of render(result, root)) console.log(l);
  if (result.unmeasurable) {
    console.log('[hook-entry-tests] UNMEASURABLE -- counted as a failure, not a pass.');
    return 2;
  }
  const bad = result.hooks.filter((h) => h.status === 'uncovered').length + result.problems.length;
  const covered = result.hooks.filter((h) => h.status === 'covered').length;
  if (bad > 0) {
    console.log(`[hook-entry-tests] FAILED: ${bad} problem(s). Add the entry test (see cli/tests/unit/hooks/check-dangerous-cmd-entry.test.js for the shape).`);
    return 1;
  }
  console.log(`[hook-entry-tests] OK: ${covered} blocking hook(s) have an entry test (${result.testFiles} test files scanned).`);
  console.log('                   Static check only: it proves a test of the right shape exists, not that it passes.');
  return 0;
}

if (process.argv[1] && resolve(process.argv[1]) === SELF) {
  main(process.argv.slice(2)).then((code) => process.exit(code), (e) => {
    console.error(`[hook-entry-tests] crashed: ${e.stack || e}`);
    process.exit(2);
  });
}
