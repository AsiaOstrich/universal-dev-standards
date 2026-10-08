#!/usr/bin/env node
// SPDX-License-Identifier: MIT
//
// ─────────────────────────────────────────────────────────────────────────────
// check-anti-fake-tests —— 假測試掃描（UDS full-coverage-testing 的出貨閘門）
// ─────────────────────────────────────────────────────────────────────────────
//
// What it finds, in the test files of any project (no test framework is assumed):
//   no-assertion  a test whose body contains nothing that can fail
//   tautology     a test whose only assertions can never fail (expect(true).toBe(true)), or whose
//                 expected value is not independent of the code under test (XSPEC-470): the
//                 assertion calls the same function with the same arguments on both sides, or
//                 recomputes the expected value from the same input with reduce/map/filter.
//                 (JavaScript/TypeScript only; other languages are a reviewer's judgment call.)
//   all-skipped   a test file in which every test is skipped or marked todo
//
// Written into your project by `uds init` (XSPEC-444 R5). It is YOURS: edit it, or replace
// it. `uds update` never overwrites it. `uds check` (which your pre-commit hook runs) calls
// it and prints what it finds as a WARNING; it does not stop your commit unless you set
// "mode": "block" in .standards/test-policy.json.
//
// Usage:
//   node scripts/check-anti-fake-tests.mjs            scan every test file under the project
//   node scripts/check-anti-fake-tests.mjs --staged   scan only the test files staged for commit
//   node scripts/check-anti-fake-tests.mjs --json     machine-readable result
//
// Exit codes:  0 nothing found  |  1 findings (run on its own, this is a hard failure —
//   wire it into CI to enforce)  |  2 could not judge (the scanner's own self-test failed,
//   or git was unreadable in --staged mode). 2 is never a pass.
//
// Which files are tests, and which extensions are code, comes from `.standards/test-policy.json`
// (optional; see the UDS docs). Test files in a language this script has no rule for are
// LISTED as "not scanned" — never counted as clean.
//
// Extra "this call is an assertion" names for your own helpers:
//   .standards/test-policy.json → "assertionPatterns": ["\\bmustMatch\\w*\\s*\\("]
//
// Heuristic by nature: it reads text, it does not run your tests. A helper that asserts
// under a name this script cannot recognise will be reported as "no-assertion" — name it
// assert*/verify*/expect*, or list it in assertionPatterns.

import { existsSync, readFileSync, readdirSync, lstatSync, realpathSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// ---- BEGIN SHARED POLICY (identical in templates/gates/check-anti-fake-tests.mjs and check-stubs.mjs; test-policy-drift.test.js compares them) ----
/** Where an adopter's policy lives (inside `.standards/`, beside release-config.yaml). */
export const POLICY_FILE = '.standards/test-policy.json';

export const DEFAULT_POLICY = Object.freeze({
  mode: 'warn',
  testDirs: Object.freeze(['test', 'tests', '__tests__', 'spec', 'e2e']),
  testPatterns: Object.freeze([
    '*.test.*', '*.spec.*', '*_test.*', '*_spec.*', 'test_*.*', 'conftest.py',
    '*Test.*', '*Tests.*', '*Spec.scala', '*Spec.kt', '*Spec.groovy'
  ]),
  sourceExtensions: Object.freeze([
    'js', 'mjs', 'cjs', 'jsx', 'ts', 'tsx', 'mts', 'cts', 'vue', 'svelte', 'astro',
    'py', 'pyi', 'java', 'kt', 'kts', 'scala', 'groovy', 'go', 'rs', 'rb', 'php', 'cs', 'fs', 'vb',
    'swift', 'm', 'mm', 'dart', 'c', 'h', 'cc', 'cpp', 'cxx', 'hpp', 'hh',
    'ex', 'exs', 'erl', 'hrl', 'lua', 'pl', 'pm', 'r', 'jl', 'clj', 'cljs', 'hs', 'ml', 'mli',
    'sh', 'bash', 'zsh', 'ps1'
  ]),
  nonCodeExtensions: Object.freeze([
    'md', 'mdx', 'txt', 'rst', 'adoc', 'json', 'jsonc', 'json5', 'yaml', 'yml', 'toml', 'ini', 'cfg',
    'conf', 'properties', 'env', 'lock', 'xml', 'csv', 'tsv', 'svg', 'png', 'jpg', 'jpeg', 'gif', 'ico',
    'webp', 'avif', 'pdf', 'woff', 'woff2', 'ttf', 'otf', 'eot', 'map', 'html', 'htm', 'css', 'scss',
    'sass', 'less', 'sql', 'gitignore', 'gitattributes', 'editorconfig', 'npmrc', 'nvmrc', 'license',
    'log', 'snap'
  ]),
  nonCodeNames: Object.freeze([
    'LICENSE', 'README', 'CHANGELOG', 'NOTICE', 'AUTHORS', 'CODEOWNERS', 'Dockerfile', 'Makefile', 'Procfile'
  ]),
  ignoreDirs: Object.freeze([
    'node_modules', 'vendor', 'dist', 'build', 'coverage', '.git', '.standards', '.claude', '.husky',
    '.github', 'docs', 'target', '__pycache__', '.venv', 'venv', '.next', '.nuxt', '.idea', '.vscode',
    '.ruff_cache', '.pytest_cache', '.mypy_cache', '.tox', '.gradle', '.cache', '.turbo', '.svelte-kit',
    '.parcel-cache', '.terraform', '.dart_tool', '.eggs'
  ]),
  ignore: Object.freeze(['**/*.min.js', '**/*.min.css', '**/*.d.ts']),
  exempt: Object.freeze([])
});

const norm = (p) => String(p).replace(/\\/g, '/').replace(/^\.\//, '');

/** Glob → RegExp. `*` stays inside a path segment, `**` crosses them, `?` is one non-slash character. */
export function globToRegex(glob) {
  const g = norm(glob);
  let re = '';
  for (let i = 0; i < g.length; i++) {
    const c = g[i];
    if (c === '*') {
      if (g[i + 1] === '*') {
        if (g[i + 2] === '/') { re += '(?:.*/)?'; i += 2; } else { re += '.*'; i += 1; }
      } else {
        re += '[^/]*';
      }
    } else if (c === '?') {
      re += '[^/]';
    } else if ('\\^$+.()|{}[]'.includes(c)) {
      re += '\\' + c;
    } else {
      re += c;
    }
  }
  return new RegExp(`^${re}$`);
}

/** A glob with no slash is a file-name glob (matches the basename anywhere); otherwise it matches the whole path. */
function matchesGlob(relPath, glob) {
  const p = norm(relPath);
  const g = norm(glob);
  const target = g.includes('/') ? p : p.split('/').pop();
  return globToRegex(g).test(target);
}

const extOf = (relPath) => {
  const base = norm(relPath).split('/').pop();
  const i = base.lastIndexOf('.');
  return i > 0 ? base.slice(i + 1).toLowerCase() : '';
};

/**
 * Read `.standards/test-policy.json` and merge it over the defaults.
 * @returns {{ policy: object, problems: string[], source: string|null }}
 *   `problems` is never swallowed: an unreadable file or a bad value is reported, and the
 *   defaults (mode "warn") are what runs.
 */
export function loadPolicy(projectPath) {
  const problems = [];
  const policy = {
    mode: DEFAULT_POLICY.mode,
    testDirs: [...DEFAULT_POLICY.testDirs],
    testPatterns: [...DEFAULT_POLICY.testPatterns],
    sourceExtensions: [...DEFAULT_POLICY.sourceExtensions],
    nonCodeExtensions: [...DEFAULT_POLICY.nonCodeExtensions],
    nonCodeNames: [...DEFAULT_POLICY.nonCodeNames],
    ignoreDirs: [...DEFAULT_POLICY.ignoreDirs],
    ignore: [...DEFAULT_POLICY.ignore],
    exempt: []
  };
  const file = join(projectPath, POLICY_FILE);
  if (!existsSync(file)) return { policy, problems, source: null };

  let raw;
  try {
    raw = JSON.parse(readFileSync(file, 'utf-8').replace(/^\uFEFF/, ''));
  } catch (e) {
    problems.push(`${POLICY_FILE} cannot be read (${e.message}); defaults are in effect`);
    return { policy, problems, source: POLICY_FILE };
  }
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    problems.push(`${POLICY_FILE} must be a JSON object; defaults are in effect`);
    return { policy, problems, source: POLICY_FILE };
  }

  if (raw.mode !== undefined) {
    if (raw.mode === 'warn' || raw.mode === 'block') policy.mode = raw.mode;
    else problems.push(`${POLICY_FILE}: "mode" must be "warn" or "block", got ${JSON.stringify(raw.mode)}; "warn" is in effect`);
  }
  for (const key of ['testDirs', 'testPatterns', 'sourceExtensions', 'nonCodeExtensions', 'ignore']) {
    if (raw[key] === undefined) continue;
    if (!Array.isArray(raw[key]) || raw[key].some((v) => typeof v !== 'string' || !v)) {
      problems.push(`${POLICY_FILE}: "${key}" must be an array of non-empty strings; it is ignored`);
      continue;
    }
    const add = key === 'sourceExtensions' || key === 'nonCodeExtensions'
      ? raw[key].map((v) => v.replace(/^\./, '').toLowerCase())
      : raw[key];
    policy[key] = [...policy[key], ...add];
  }
  if (raw.exempt !== undefined) {
    if (!Array.isArray(raw.exempt)) {
      problems.push(`${POLICY_FILE}: "exempt" must be an array; it is ignored`);
    } else {
      raw.exempt.forEach((e, i) => {
        const okPattern = e && typeof e.pattern === 'string' && e.pattern.trim();
        const okReason = e && typeof e.reason === 'string' && e.reason.trim();
        if (!okPattern) problems.push(`${POLICY_FILE}: exempt[${i}] has no "pattern"; it is ignored`);
        else if (!okReason) problems.push(`${POLICY_FILE}: exempt[${i}] ("${e.pattern}") has no "reason" and is NOT honored — an exemption must say why`);
        else policy.exempt.push({ pattern: e.pattern, reason: e.reason.trim() });
      });
    }
  }
  return { policy, problems, source: POLICY_FILE };
}

/**
 * Classify one project-relative path.
 * @returns {{ kind: 'ignored'|'noncode'|'test'|'source'|'unclassified', ext: string, exempt?: {pattern:string, reason:string} }}
 */
export function classifyPath(relPath, policy = DEFAULT_POLICY) {
  const p = norm(relPath);
  const segments = p.split('/');
  const base = segments[segments.length - 1];
  const dirs = segments.slice(0, -1);
  const ext = extOf(p);
  const sets = {
    source: new Set(policy.sourceExtensions || DEFAULT_POLICY.sourceExtensions),
    noncode: new Set(policy.nonCodeExtensions || DEFAULT_POLICY.nonCodeExtensions),
    names: new Set(policy.nonCodeNames || DEFAULT_POLICY.nonCodeNames),
    ignoreDirs: new Set(policy.ignoreDirs || DEFAULT_POLICY.ignoreDirs)
  };

  if (dirs.some((d) => sets.ignoreDirs.has(d))) return { kind: 'ignored', ext };
  if ((policy.ignore || DEFAULT_POLICY.ignore).some((g) => matchesGlob(p, g))) return { kind: 'ignored', ext };

  const docsLike = sets.noncode.has(ext) || sets.names.has(base) || sets.names.has(base.replace(/\.[^.]*$/, ''));
  const inTestDir = dirs.some((d) => (policy.testDirs || DEFAULT_POLICY.testDirs).includes(d));
  const testNamed = (policy.testPatterns || DEFAULT_POLICY.testPatterns).some((g) => matchesGlob(p, g));

  // A test is a test even when its data is JSON; but a README inside tests/ is documentation.
  if ((inTestDir || testNamed) && !['md', 'mdx', 'txt', 'rst', 'adoc'].includes(ext)) return { kind: 'test', ext };
  // Dot-files (.prettierrc, .eslintrc.js, .env.local ...) are tool configuration, not product code.
  if (docsLike || base.startsWith('.')) return { kind: 'noncode', ext };
  if (sets.source.has(ext)) {
    const exempt = (policy.exempt || []).find((e) => matchesGlob(p, e.pattern));
    return exempt ? { kind: 'source', ext, exempt } : { kind: 'source', ext };
  }
  return { kind: 'unclassified', ext };
}
// ---- END SHARED POLICY ----

// ---- BEGIN SHARED ENGINE (identical in check-anti-fake-tests.mjs and check-stubs.mjs; test-policy-drift.test.js compares them) ----

/**
 * Language families this script has rules for, keyed by file extension.
 * An extension that is not here is UNSUPPORTED: the script says so by name. It never
 * counts a file it cannot read as a file that passed.
 */
export const FAMILY_BY_EXT = Object.freeze({
  js: 'js', mjs: 'js', cjs: 'js', jsx: 'js', ts: 'js', tsx: 'js', mts: 'js', cts: 'js', vue: 'js', svelte: 'js',
  py: 'python', pyi: 'python',
  java: 'jvm', kt: 'jvm', kts: 'jvm', scala: 'jvm', groovy: 'jvm', cs: 'jvm',
  go: 'go', rs: 'rust', rb: 'ruby', ex: 'elixir', exs: 'elixir',
  php: 'php', swift: 'swift', dart: 'dart', lua: 'lua',
  c: 'cpp', h: 'cpp', cc: 'cpp', cpp: 'cpp', cxx: 'cpp', hpp: 'cpp', hh: 'cpp'
});

const LEX = {
  js: { line: ['//'], block: [['/*', '*/']], quotes: ['\'', '"', '`'], triple: [], regex: true },
  python: { line: ['#'], block: [], quotes: ['\'', '"'], triple: ['"""', '\'\'\''] },
  jvm: { line: ['//'], block: [['/*', '*/']], quotes: ['\'', '"'], triple: ['"""'] },
  go: { line: ['//'], block: [['/*', '*/']], quotes: ['\'', '"', '`'], triple: [] },
  rust: { line: ['//'], block: [['/*', '*/']], quotes: ['"', '\''], triple: [], rustChar: true },
  ruby: { line: ['#'], block: [], quotes: ['\'', '"'], triple: [] },
  elixir: { line: ['#'], block: [], quotes: ['"', '\''], triple: ['"""'] },
  php: { line: ['//', '#'], block: [['/*', '*/']], quotes: ['\'', '"'], triple: [], phpAttr: true },
  swift: { line: ['//'], block: [['/*', '*/']], quotes: ['"'], triple: ['"""'] },
  dart: { line: ['//'], block: [['/*', '*/']], quotes: ['\'', '"'], triple: ['"""', '\'\'\''] },
  lua: { line: ['--'], block: [['--[[', ']]']], quotes: ['\'', '"'], triple: [] },
  cpp: { line: ['//'], block: [['/*', '*/']], quotes: ['\'', '"'], triple: [] },
  other: { line: ['//', '#'], block: [['/*', '*/']], quotes: ['\'', '"'], triple: [] }
};

/**
 * Same-length copies of `text`: `noComments` (comments blanked) and `noStrings` (comments
 * AND the inside of string literals blanked). Same length means an index found in one is
 * the same place in the other and in the original — which is how names are read back.
 */
export function maskSource(text, family) {
  const lex = LEX[family] || LEX.other;
  const nc = text.split('');
  const ns = text.split('');
  const n = text.length;
  const blank = (arr, from, to) => { for (let k = from; k < to; k++) if (arr[k] !== '\n') arr[k] = ' '; };
  let i = 0;
  while (i < n) {
    let hit = false;
    for (const [open, close] of lex.block) {
      if (text.startsWith(open, i)) {
        const end = text.indexOf(close, i + open.length);
        const stop = end === -1 ? n : end + close.length;
        blank(nc, i, stop); blank(ns, i, stop);
        i = stop; hit = true; break;
      }
    }
    if (hit) continue;
    for (const lc of lex.line) {
      if (text.startsWith(lc, i) && !(lex.phpAttr && lc === '#' && text[i + 1] === '[')) {
        let end = text.indexOf('\n', i);
        if (end === -1) end = n;
        blank(nc, i, end); blank(ns, i, end);
        i = end; hit = true; break;
      }
    }
    if (hit) continue;
    const triple = lex.triple.find((t) => text.startsWith(t, i));
    if (triple) {
      const end = text.indexOf(triple, i + 3);
      // The delimiters go too: a closing `"""` left at column 0 would end an indented block early.
      const stop = end === -1 ? n : end + 3;
      blank(ns, i, stop);
      i = stop;
      continue;
    }
    const ch = text[i];
    if (lex.regex && ch === '/') {
      // A regex literal may hold a quote or a backtick; read it as one token so it cannot open a string.
      let p = i - 1;
      while (p >= 0 && /[ \t]/.test(text[p])) p--;
      const before = p < 0 ? '' : text[p];
      const word = /(?:^|[^\w$])(return|typeof|case|in|of|void|delete|throw|yield|await)$/.test(text.slice(Math.max(0, p - 9), p + 1));
      if (p < 0 || '(,=:[!&|?{};+-*%<>~^\n'.includes(before) || word) {
        let j = i + 1;
        let inClass = false;
        while (j < n) {
          const c = text[j];
          if (c === '\\') { j += 2; continue; }
          if (c === '\n') { j = -1; break; }
          if (c === '[') inClass = true;
          else if (c === ']') inClass = false;
          else if (c === '/' && !inClass) break;
          j++;
        }
        if (j > i && j < n) { blank(ns, i + 1, j); i = j + 1; continue; }
      }
    }
    if (lex.quotes.includes(ch)) {
      if (lex.rustChar && ch === '\'') {
        const isChar = text[i + 2] === '\'' || (text[i + 1] === '\\' && text[i + 3] === '\'');
        if (!isChar) { i++; continue; }
      }
      const multiline = ch === '`';
      let j = i + 1;
      while (j < n) {
        if (text[j] === '\\') { j += 2; continue; }
        if (text[j] === ch) break;
        if (text[j] === '\n' && !multiline) break;
        j++;
      }
      blank(ns, i + 1, Math.min(j, n));
      i = j + 1;
      continue;
    }
    i++;
  }
  return { noComments: nc.join(''), noStrings: ns.join('') };
}

/** Index of the bracket that closes the one at `open` (counting only that bracket pair), or -1. */
export function matchClose(s, open) {
  const pairs = { '(': ')', '{': '}', '[': ']' };
  const o = s[open];
  const c = pairs[o];
  if (!c) return -1;
  let depth = 0;
  for (let i = open; i < s.length; i++) {
    if (s[i] === o) depth++;
    else if (s[i] === c && --depth === 0) return i;
  }
  return -1;
}

/** A function that maps a character index to its 1-based line number. */
export function lineIndex(text) {
  const starts = [0];
  for (let i = 0; i < text.length; i++) if (text[i] === '\n') starts.push(i + 1);
  return (idx) => {
    let lo = 0; let hi = starts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (starts[mid] <= idx) lo = mid; else hi = mid - 1;
    }
    return lo + 1;
  };
}

/** Every project-relative file under `root`, skipping the policy's ignored directories and symlinks. */
export function walkFiles(root, policy) {
  const skip = new Set(policy.ignoreDirs);
  const out = [];
  const stack = [''];
  while (stack.length > 0 && out.length < 200000) {
    const rel = stack.pop();
    let entries;
    try { entries = readdirSync(join(root, rel), { withFileTypes: true }); } catch { continue; }
    for (const e of entries) {
      const r = rel ? `${rel}/${e.name}` : e.name;
      if (e.isSymbolicLink()) continue;
      if (e.isDirectory()) { if (!skip.has(e.name)) stack.push(r); } else if (e.isFile()) out.push(r);
    }
  }
  return out.sort();
}

/** Files staged for the next commit (added, copied, modified, renamed), or `{ error }`. */
export function stagedFiles(root) {
  try {
    const out = execFileSync('git', ['-c', 'core.quotepath=off', 'diff', '--cached', '--name-only', '--diff-filter=ACMR', '-z'], {
      cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 * 1024 * 1024
    });
    return { files: out.split('\0').filter(Boolean) };
  } catch (e) {
    return { error: String(e.stderr || e.message || 'git diff failed').trim().split('\n')[0] };
  }
}

/** File text, or `{ skipped }` when it is binary or larger than 2 MB (said, never silently dropped). */
export function readText(abs) {
  try {
    if (lstatSync(abs).size > 2 * 1024 * 1024) return { skipped: 'larger than 2 MB' };
    const buf = readFileSync(abs);
    if (buf.subarray(0, 8000).includes(0)) return { skipped: 'binary', quiet: true };
    return { text: buf.toString('utf8').replace(/^\uFEFF/, '') };
  } catch (e) {
    return { skipped: `unreadable (${e.code || e.message})` };
  }
}

export function extOfPath(p) {
  const base = String(p).replace(/\\/g, '/').split('/').pop();
  const i = base.lastIndexOf('.');
  return i > 0 ? base.slice(i + 1).toLowerCase() : '';
}

/** Is this module the one being run (not imported)? Resolves symlinks so `node scripts/x.mjs` and a symlinked path agree. */
export function isMain(metaUrl) {
  try {
    return realpathSync(process.argv[1]) === realpathSync(fileURLToPath(metaUrl));
  } catch {
    return false;
  }
}

export const indentOf = (l) => l.match(/^[ \t]*/)[0].replace(/\t/g, '    ').length;

/** Indented block that follows line `startLine` (0-based index into `lines`): every following line that is blank or indented deeper than `indent`. */
export function indentBlock(lines, startLine, indent) {
  let end = startLine + 1;
  let lastBody = startLine;
  while (end < lines.length) {
    const l = lines[end];
    if (l.trim() === '') { end++; continue; }
    const ind = indentOf(l);
    if (ind <= indent) break;
    lastBody = end;
    end++;
  }
  return { first: startLine + 1, last: lastBody };
}
// ---- END SHARED ENGINE ----

// ═══════════════════════════════════════════════════════════════════════════
// Test-case finders: one per language family. Each returns the cases it can see:
//   { name, idx, bodyStart, bodyEnd, skipped, credit }
// `bodyStart..bodyEnd` is the text the assertion count is taken from.
// ═══════════════════════════════════════════════════════════════════════════

const nameFrom = (original, from, to) => {
  const m = /(['"`])((?:\\.|(?!\1)[^\\])*)\1/.exec(original.slice(from, to));
  return m ? m[2].trim() : '(unnamed)';
};

/** `it('x', () => {...})`, `test('x', fn)`, `it.skip(...)`, `it.each(rows)('x', fn)`, `test("x") { ... }` */
function findCallCases(text, ns, nc, { names = 'it|test|specify', trailingBrace = false } = {}) {
  const re = new RegExp(`(?<![.\\w$])(x?(?:${names}))((?:\\.\\w+)*)\\s*(?=\\()`, 'g');
  const cases = [];
  let unparsed = 0;
  let m;
  while ((m = re.exec(ns)) !== null) {
    const mods = m[2].split('.').filter(Boolean);
    let pos = m.index + m[0].length;
    if (mods.includes('each')) {
      const c1 = matchClose(ns, pos);
      if (c1 === -1) { unparsed++; continue; }
      pos = c1 + 1;
      while (/\s/.test(ns[pos] || '')) pos++;
      if (ns[pos] !== '(') continue;
    }
    let close = matchClose(ns, pos);
    if (close === -1) { unparsed++; continue; }
    const args = ns.slice(pos + 1, close);
    const pending = !args.includes(',');
    let bodyEnd = close;
    if (trailingBrace) {
      let k = close + 1;
      while (/\s/.test(ns[k] || '')) k++;
      if (ns[k] === '{') {
        const c = matchClose(ns, k);
        if (c !== -1) bodyEnd = c;
      }
    }
    const skipped = mods.includes('skip') || mods.includes('todo') || (m[1].length > 1 && m[1][0] === 'x') ||
      m[1] === 'pending' || pending || /\bskip\s*:\s*(?!false\b)/.test(args);
    cases.push({
      name: nameFrom(text, pos + 1, close), idx: m.index, bodyStart: pos + 1, bodyEnd, skipped, credit: 0
    });
    re.lastIndex = bodyEnd + 1;
  }
  return { cases, unparsed };
}

const linesAbove = (s, idx, n) => {
  let start = idx;
  for (let k = 0; k <= n && start > 0; k++) start = s.lastIndexOf('\n', start - 1) + 0;
  return s.slice(Math.max(0, start), idx);
};

/** A test marked by an annotation/attribute: `@Test`, `[Fact]`, `#[test]`, `#[Test]`, Swift `@Test` ... */
function findAnnotationCases(text, ns, nc, annotationRe) {
  const cases = [];
  const re = new RegExp(annotationRe.source, annotationRe.flags.includes('g') ? annotationRe.flags : annotationRe.flags + 'g');
  let m;
  while ((m = re.exec(ns)) !== null) {
    let pos = m.index + m[0].length;
    // step over any further annotations between this one and the declaration
    for (;;) {
      while (/\s/.test(ns[pos] || '')) pos++;
      const rest = ns.slice(pos, pos + 3);
      if (rest[0] === '@') {
        pos++;
        while (/[\w.]/.test(ns[pos] || '')) pos++;
        if (ns[pos] === '(') { const c = matchClose(ns, pos); if (c === -1) break; pos = c + 1; }
      } else if (rest.startsWith('#[')) {
        const c = matchClose(ns, pos + 1);
        if (c === -1) break;
        pos = c + 1;
      } else if (rest[0] === '[' ) {
        const c = matchClose(ns, pos);
        if (c === -1) break;
        pos = c + 1;
      } else break;
    }
    const open = ns.indexOf('(', pos);
    if (open === -1) continue;
    const declText = text.slice(pos, open);
    const nameM = /(?:`([^`]+)`|([\w$]+))\s*(?:<[^>]*>)?\s*$/.exec(declText);
    const name = nameM ? (nameM[1] || nameM[2]) : '(unnamed)';
    const pc = matchClose(ns, open);
    if (pc === -1) continue;
    let k = pc + 1;
    while (k < ns.length && !'{=;'.includes(ns[k])) k++;
    if (k >= ns.length || ns[k] === ';') continue; // abstract / interface: no body
    let bodyStart; let bodyEnd;
    if (ns[k] === '{') {
      bodyStart = k + 1;
      bodyEnd = matchClose(ns, k);
      if (bodyEnd === -1) continue;
    } else {
      bodyStart = k + 1;
      let e = bodyStart;
      while (e < ns.length && !'{;\n'.includes(ns[e])) e++;
      bodyEnd = ns[e] === '{' ? matchClose(ns, e) : e;
      if (bodyEnd === -1) continue;
    }
    const header = linesAbove(nc, m.index, 5) + nc.slice(m.index, open);
    const skipped = /@(?:Ignore|Disabled|Skip)\b|\[(?:Ignore|Skip)\b|#\[ignore\b|\bSkip\s*=|\.disabled\b/.test(header);
    const credit = /\bexpected\s*=|ExpectedException|should_panic/.test(header) ? 1 : 0;
    cases.push({ name, idx: m.index, bodyStart, bodyEnd, skipped, credit });
    re.lastIndex = Math.max(re.lastIndex, bodyStart);
  }
  return { cases, unparsed: 0 };
}

/** `func TestX(t *testing.T) {`, `function testX() {`, `func testX() {` — a named function opens the case. */
function findFuncCases(text, ns, nc, funcRe, { skipRe } = {}) {
  const cases = [];
  let unparsed = 0;
  const re = new RegExp(funcRe.source, funcRe.flags.includes('g') ? funcRe.flags : funcRe.flags + 'g');
  let m;
  while ((m = re.exec(ns)) !== null) {
    const open = m.index + m[0].length - 1;
    const close = matchClose(ns, open);
    if (close === -1) { unparsed++; continue; }
    const body = ns.slice(open + 1, close);
    cases.push({
      name: m[1], idx: m.index, bodyStart: open + 1, bodyEnd: close,
      skipped: skipRe ? skipRe.test(body) : false, credit: 0
    });
    re.lastIndex = close + 1;
  }
  return { cases, unparsed };
}

function offsetsOf(s) {
  const off = [0];
  for (let i = 0; i < s.length; i++) if (s[i] === '\n') off.push(i + 1);
  return off;
}

function findPythonCases(text, ns, nc) {
  const lines = ns.split('\n');
  const ncLines = nc.split('\n');
  const off = offsetsOf(ns);
  const cases = [];
  for (let li = 0; li < lines.length; li++) {
    const m = /^([ \t]*)(?:async\s+)?def\s+(test\w*)\s*\(/.exec(lines[li]);
    if (!m) continue;
    const indent = indentOf(m[1] + 'x') - 1;
    const open = off[li] + lines[li].indexOf('(');
    const pc = matchClose(ns, open);
    if (pc === -1) continue;
    const colon = ns.indexOf(':', pc);
    if (colon === -1) continue;
    const colonLine = off.findIndex((o, i) => o <= colon && (i === off.length - 1 || off[i + 1] > colon));
    const { first, last } = indentBlock(lines, colonLine, indent);
    const bodyStart = colon + 1;
    const bodyEnd = last >= first ? (off[last + 1] !== undefined ? off[last + 1] - 1 : ns.length) : (off[colonLine + 1] !== undefined ? off[colonLine + 1] - 1 : ns.length);
    let decorators = '';
    for (let k = li - 1; k >= 0 && /^\s*@/.test(ncLines[k]); k--) decorators += ncLines[k] + '\n';
    const body = ns.slice(bodyStart, bodyEnd);
    const skipped = /@(?:pytest\.mark\.skip|unittest\.skip|skip)\b(?!if)/.test(decorators) ||
      /^\s*(?:pytest\.skip|self\.skipTest)\s*\(/.test(body.replace(/^[\s]*/, ''));
    cases.push({ name: m[2], idx: off[li], bodyStart, bodyEnd, skipped, credit: 0 });
  }
  return { cases, unparsed: 0 };
}

function findRubyCases(text, ns, nc) {
  const lines = ns.split('\n');
  const off = offsetsOf(ns);
  const cases = [];
  for (let li = 0; li < lines.length; li++) {
    const line = lines[li];
    let m = /^([ \t]*)def\s+(test_\w+)/.exec(line);
    let name; let kind;
    if (m) { name = m[2]; kind = 'def'; } else {
      m = /^([ \t]*)(x?it|x?specify|x?example|x?scenario|test)\b(?![_?!:\w])\s*(.*)$/.exec(line);
      if (!m) continue;
      const rest = m[3];
      if (!/^\(?\s*['":%]/.test(rest) && !/^(?:do\b|\{)/.test(rest)) continue;
      kind = m[2];
      name = nameFrom(text, off[li], off[li] + line.length);
    }
    const indent = indentOf(m[1] + 'x') - 1;
    const hasDo = /\bdo\b(?:\s*\|[^|]*\|)?\s*$/.test(line);
    const braceAt = line.indexOf('{');
    let bodyStart; let bodyEnd; let skipped = kind.length > 2 && kind[0] === 'x' && kind !== 'example';
    if (kind === 'def' || hasDo) {
      const { first, last } = indentBlock(lines, li, indent);
      bodyStart = off[li] + line.length; bodyEnd = last >= first ? (off[last + 1] !== undefined ? off[last + 1] - 1 : ns.length) : bodyStart;
    } else if (braceAt !== -1) {
      const c = matchClose(ns, off[li] + braceAt);
      bodyStart = off[li] + braceAt + 1; bodyEnd = c === -1 ? off[li] + line.length : c;
    } else { bodyStart = off[li] + line.length; bodyEnd = bodyStart; skipped = true; }
    if (/^\s*(?:skip|pending)\b/.test(ns.slice(bodyStart, bodyEnd).replace(/^[\s]*/, ''))) skipped = true;
    cases.push({ name, idx: off[li], bodyStart, bodyEnd, skipped, credit: 0 });
  }
  return { cases, unparsed: 0 };
}

function findElixirCases(text, ns, nc) {
  const lines = ns.split('\n');
  const ncLines = nc.split('\n');
  const off = offsetsOf(ns);
  const cases = [];
  for (let li = 0; li < lines.length; li++) {
    const m = /^([ \t]*)test\s+"[^"\n]*"(?:\s*,\s*[^\n]*?)?\s+do\s*$/.exec(lines[li]);
    if (!m) continue;
    const indent = indentOf(m[1] + 'x') - 1;
    const { first, last } = indentBlock(lines, li, indent);
    const bodyStart = off[li] + lines[li].length;
    const bodyEnd = last >= first ? (off[last + 1] !== undefined ? off[last + 1] - 1 : ns.length) : bodyStart;
    const above = ncLines.slice(Math.max(0, li - 3), li).join('\n');
    cases.push({ name: nameFrom(text, off[li], off[li] + lines[li].length), idx: off[li], bodyStart, bodyEnd, skipped: /@tag\s+(?::skip|skip:)/.test(above), credit: 0 });
  }
  return { cases, unparsed: 0 };
}

function findCppCases(text, ns, nc) {
  const re = /\b(TEST|TEST_F|TEST_P|TYPED_TEST|TYPED_TEST_P|TEST_CASE|SCENARIO|BOOST_AUTO_TEST_CASE|BOOST_FIXTURE_TEST_CASE|BOOST_DATA_TEST_CASE)\s*\(/g;
  const cases = [];
  let unparsed = 0;
  let m;
  while ((m = re.exec(ns)) !== null) {
    const open = m.index + m[0].length - 1;
    const close = matchClose(ns, open);
    if (close === -1) { unparsed++; continue; }
    let k = close + 1;
    while (/\s/.test(ns[k] || '')) k++;
    if (ns[k] !== '{') continue;
    const end = matchClose(ns, k);
    if (end === -1) { unparsed++; continue; }
    const argsOriginal = text.slice(open + 1, close);
    cases.push({
      name: argsOriginal.replace(/\s+/g, ' ').trim(), idx: m.index, bodyStart: k + 1, bodyEnd: end,
      skipped: /DISABLED_|\[\.\]|\[!hide\]/.test(argsOriginal), credit: 0
    });
    re.lastIndex = end + 1;
  }
  return { cases, unparsed };
}

const LIT = '[\\w.$\'"]+';
const JS_TOKENS = /\b(?:expect\w*|assert\w*|verify\w*|should\w*)\s*\(|\bfail\s*\(|\.should\b|\bassert\s*\.|\bexpect\s*\.|\bt\.(?:is|not|true|false|truthy|falsy|deepEqual|throws|notThrows|pass|fail|equal|ok|same|match|rejects|snapshot|assert|like|plan)\w*\s*\(/g;
const JS_TAUT = [
  new RegExp(`\\bexpect\\(\\s*(${LIT})\\s*\\)\\s*\\.\\s*(?:toBe|toEqual|toStrictEqual)\\s*\\(\\s*\\1\\s*\\)`, 'g'),
  /\bexpect\(\s*(?:true|1)\s*\)\s*\.\s*toBeTruthy\s*\(\s*\)/g,
  /\bexpect\(\s*(?:false|0|null|undefined)\s*\)\s*\.\s*toBeFalsy\s*\(\s*\)/g,
  /\bexpect\(\s*true\s*\)\s*\.\s*to\s*\.\s*(?:be\s*\.\s*)?(?:true|ok)\b/g,
  /\bassert(?:\s*\.\s*ok)?\s*\(\s*(?:true|1)\s*[),]/g,
  new RegExp(`\\bassert\\s*\\.\\s*(?:equal|strictEqual|deepEqual|deepStrictEqual)\\s*\\(\\s*(${LIT})\\s*,\\s*\\1\\s*[),]`, 'g')
];
const JVM_TOKENS = /\b(?:assert\w*|Assert\w*|verify\w*|Verify\w*|expect|expectThat|expectThrows|Expect|fail|check|require)\s*[(.]|\b(?:should\w*|must\w*)\b|\.Should\w*\s*[(.]/g;
const JVM_TAUT = [
  /\bassert(?:True)?\s*\(\s*true\s*[),]/gi,
  /\bAssert\s*\.\s*(?:True|IsTrue)\s*\(\s*true\s*[),]/gi,
  new RegExp(`\\bassert(?:Equals?|Same|AreEqual|Equal)\\s*\\(\\s*(${LIT})\\s*,\\s*\\1\\s*[),]`, 'gi'),
  new RegExp(`\\bAssert\\s*\\.\\s*(?:AreEqual|Equal)\\s*\\(\\s*(${LIT})\\s*,\\s*\\1\\s*[),]`, 'gi')
];

const FAMILY_RULES = {
  js: {
    tokens: JS_TOKENS, taut: JS_TAUT,
    find: (t, ns, nc) => findCallCases(t, ns, nc)
  },
  python: {
    tokens: /^[ \t]*assert\b|\bself\.(?:assert|fail)\w*\s*\(|\bpytest\.(?:raises|warns|fail)\b|\.assert_\w+\s*\(|\bassert_\w+\s*\(|\braise\s+AssertionError\b|\bexpect\s*\(|\b(?:verify|check)_\w+\s*\(/gm,
    taut: [
      /^[ \t]*assert\s+(?:True|1)\s*(?:,.*)?$/gm,
      new RegExp(`^[ \\t]*assert\\s+(${LIT})\\s*==\\s*\\1\\s*(?:,.*)?$`, 'gm'),
      /\bself\.assertTrue\(\s*(?:True|1)\s*[),]/g,
      new RegExp(`\\bself\\.assertEqual\\(\\s*(${LIT})\\s*,\\s*\\1\\s*[),]`, 'g')
    ],
    find: findPythonCases
  },
  jvm: {
    tokens: JVM_TOKENS, taut: JVM_TAUT,
    find: (t, ns, nc, ext) => {
      const a = findAnnotationCases(t, ns, nc, /(@(?:\w+\.)*(?:Test|ParameterizedTest|RepeatedTest|TestFactory|TestTemplate)\b(?:\s*\([^)]*\))?|\[(?:Fact|Theory|Test|TestMethod|TestCase|DataTestMethod)\b[^\]]*\])/);
      if (ext === 'scala' || ext === 'kt' || ext === 'kts') {
        const b = findCallCases(t, ns, nc, { names: 'test|it', trailingBrace: true });
        return { cases: [...a.cases, ...b.cases], unparsed: a.unparsed + b.unparsed };
      }
      return a;
    }
  },
  go: {
    tokens: /\bt\.(?:Error|Errorf|Fatal|Fatalf|Fail|FailNow|Run)\b|\b(?:assert|require)\.\w+\s*\(|\bcmp\.(?:Diff|Equal)\s*\(|\bsuite\.\w+|\b\w+\s*\(\s*t\s*[,)]|\bExpect\s*\(|\.Should\s*\(|\bgomega\.\w+/g,
    taut: [
      /\bassert\.True\s*\(\s*t\s*,\s*true\s*\)/g,
      new RegExp(`\\bassert\\.Equal\\s*\\(\\s*t\\s*,\\s*(${LIT})\\s*,\\s*\\1\\s*\\)`, 'g')
    ],
    find: (t, ns, nc) => findFuncCases(t, ns, nc, /^func\s+(Test\w*|Example\w*|Fuzz\w*)\s*\(\s*\w+\s+\*testing\.[TF]\s*\)\s*\{/m, { skipRe: /^\s*t\.Skip\w*\(/ })
  },
  rust: {
    tokens: /\b(?:assert\w*|debug_assert\w*|prop_assert\w*)!|\bpanic!|\bunreachable!|\.unwrap\s*\(|\.expect\s*\(|\bunwrap_err\s*\(|\?\s*;/g,
    taut: [/\bassert!\s*\(\s*true\s*[),]/g, new RegExp(`\\bassert_eq!\\s*\\(\\s*(${LIT})\\s*,\\s*\\1\\s*[),]`, 'g')],
    find: (t, ns, nc) => findAnnotationCases(t, ns, nc, /#\[(?:\w+::)*(?:test|rstest|test_case)\b[^\]]*\]/)
  },
  ruby: {
    tokens: /\b(?:assert\w*|refute\w*|flunk|verify\w*)\b|\bexpect\b|\bis_expected\b|\.should(?:_not)?\b|\bshould(?:_not)?\b|\bmust_\w+|\bwont_\w+/g,
    taut: [
      /\bassert\s*\(?\s*true\s*\)?[ \t]*$/gm,
      /\bassert_equal\s*\(?\s*([\w:'"]+)\s*,\s*\1\s*\)?[ \t]*$/gm,
      /\bexpect\(\s*(?:true|1)\s*\)\.to\s+(?:be_truthy|be\s*\(?\s*true|eq\(\s*(?:true|1)\s*\))/g
    ],
    find: findRubyCases
  },
  elixir: {
    tokens: /\b(?:assert\w*|refute\w*|flunk|catch_\w+)\b/g,
    taut: [/\bassert\s+true\b/g, /\bassert\s+([\w:'"]+)\s*==\s*\1\b/g],
    find: findElixirCases
  },
  php: {
    tokens: /\$this\s*->\s*(?:assert\w*|expect\w*|fail)\s*\(|\b(?:Assert\s*::\s*\w+|assert\w*|expect\w*|self\s*::\s*assert\w*|static\s*::\s*assert\w*)\s*\(|->\s*(?:shouldReceive|expects|verify)\w*\s*\(/g,
    taut: [
      /\$this\s*->\s*assertTrue\s*\(\s*true\s*\)/g,
      /\$this\s*->\s*assert(?:Equals|Same)\s*\(\s*([\w.'"$]+)\s*,\s*\1\s*\)/g
    ],
    find: (t, ns, nc) => {
      const a = findFuncCases(t, ns, nc, /\bfunction\s+(test\w*)\s*\([^)]*\)\s*(?::\s*\??[\w\\]+\s*)?\{/, { skipRe: /^\s*\$this\s*->\s*markTest(?:Skipped|Incomplete)\s*\(/ });
      const b = findAnnotationCases(t, ns, nc, /#\[(?:\\?[\w\\]+\\)?Test\b[^\]]*\]/);
      const c = findCallCases(t, ns, nc, { names: 'it|test' });
      const seen = new Set(a.cases.map((x) => x.bodyStart));
      const extra = [...b.cases, ...c.cases].filter((x) => !seen.has(x.bodyStart));
      return { cases: [...a.cases, ...extra], unparsed: a.unparsed + b.unparsed + c.unparsed };
    }
  },
  swift: {
    tokens: /\bXCT(?:Assert\w*|Fail|Unwrap|ExpectFailure)\b|#(?:expect|require)\b|\bIssue\.record\b|\b(?:expect|require)\s*\(/g,
    taut: [
      /\bXCTAssertTrue\s*\(\s*true\s*[),]/g,
      new RegExp(`\\bXCTAssertEqual\\s*\\(\\s*(${LIT})\\s*,\\s*\\1\\s*[),]`, 'g'),
      /#expect\s*\(\s*true\s*\)/g
    ],
    find: (t, ns, nc) => {
      const a = findFuncCases(t, ns, nc, /\bfunc\s+(test\w*)\s*\([^)]*\)\s*(?:async\s*)?(?:throws\s*)?\{/, { skipRe: /XCTSkip/ });
      const b = findAnnotationCases(t, ns, nc, /@Test\b(?:\s*\([^)]*\))?/);
      const seen = new Set(a.cases.map((x) => x.bodyStart));
      return { cases: [...a.cases, ...b.cases.filter((x) => !seen.has(x.bodyStart))], unparsed: a.unparsed };
    }
  },
  dart: {
    tokens: JS_TOKENS,
    taut: [
      /\bexpect\(\s*true\s*,\s*(?:isTrue|true|equals\(\s*true\s*\))\s*\)/g,
      new RegExp(`\\bexpect\\(\\s*(${LIT})\\s*,\\s*(?:equals\\(\\s*\\1\\s*\\)|\\1)\\s*\\)`, 'g')
    ],
    find: (t, ns, nc) => findCallCases(t, ns, nc, { names: 'test|testWidgets|it' })
  },
  lua: {
    tokens: /\bassert\w*\s*[.(]|\bspy\b|\bstub\b|\bmock\b|\bexpect\s*[(.]|\bshould\b/g,
    taut: [
      /\bassert\.is_true\s*\(\s*true\s*\)/g,
      /\bassert\s*\(\s*true\s*\)/g,
      new RegExp(`\\bassert\\.are\\.equal\\s*\\(\\s*(${LIT})\\s*,\\s*\\1\\s*\\)`, 'g')
    ],
    find: (t, ns, nc) => findCallCases(t, ns, nc, { names: 'it|test|pending' })
  },
  cpp: {
    tokens: /\b(?:ASSERT|EXPECT)_\w+\s*\(|\b(?:CHECK|REQUIRE|CHECK_THAT|REQUIRE_THAT|ADD_FAILURE|FAIL|SUCCEED|GTEST_FAIL|GTEST_SKIP)\w*\s*\(|\bBOOST_(?:CHECK|REQUIRE|TEST|ERROR|FAIL)\w*\s*\(|\bassert\s*\(/g,
    taut: [
      /\b(?:ASSERT|EXPECT)_TRUE\s*\(\s*true\s*\)/g,
      new RegExp(`\\b(?:ASSERT|EXPECT)_EQ\\s*\\(\\s*(${LIT})\\s*,\\s*\\1\\s*\\)`, 'g'),
      /\b(?:CHECK|REQUIRE|BOOST_CHECK)\s*\(\s*true\s*\)/g
    ],
    find: findCppCases
  }
};

const countMatches = (re, s) => {
  const r = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g');
  let n = 0;
  while (r.exec(s) !== null) { n++; if (r.lastIndex === 0) break; }
  return n;
};

// ═══════════════════════════════════════════════════════════════════════════
// Expected values that are not independent of the code under test (XSPEC-470 R1)
//
// An oracle is the source that says what the right answer is (UDS `verification-oracle`).
// A test whose expected value is produced by the code under test — or by the same logic re-typed
// in the test — has the implementation as its own oracle, so it cannot disagree with it. Two
// shapes are mechanical enough to judge from text, and they are the only ones judged here:
//
//   same-call   expect(total(items)).toBe(total(items))      same function, same arguments, both sides
//   recomputed  expect(total(items)).toBe(items.reduce(...)) expected value is built from the same
//                                                            input with reduce / map / flatMap / filter
//                                                            by a callback that uses nothing but its own
//                                                            parameters and holds no literal
//
// Left alone on purpose, because they cannot be told from a sound test by reading the text:
//   a lookup in a fixed table      expect(priceOf(ids)).toEqual(ids.map((id) => KNOWN_PRICES[id]))
//   a pick by a literal            expect(activeOf(users)).toEqual(users.filter((u) => u.id === 2))
//   a call inside the call         expect(render(now())).toBe(render(now()))     (two now() are two values)
// Everything else (a hand-rolled loop, a helper that re-derives the answer, a snapshot taken from
// the implementation's own output) is a reviewer's question, not this script's: when it cannot be
// decided from the text, it is NOT reported. A false alarm teaches people to switch the scanner off.
// Deliberately narrow: JavaScript/TypeScript matchers toBe / toEqual / toStrictEqual, chai
// to.equal / to.eql, node assert.equal / strictEqual / deepEqual / deepStrictEqual.
// ═══════════════════════════════════════════════════════════════════════════

/** A test named like this compares two calls ON PURPOSE (determinism, caching, identity): not judged. */
const DELIBERATE_COMPARISON_NAME = /determinis|idempot|\bsame\b|identical|\bstable\b|stability|consisten|\bcach(?:e|es|ed|ing)\b|memo|singleton|twice|repeat|\bagain\b|reuse|reference|identity|\bpure\b|決定|確定性|相同|一致|同一|冪等|快取|重複|兩次|不變/i;

const SKIP_WORDS = new Set(['true', 'false', 'null', 'undefined', 'this', 'new', 'typeof', 'void', 'await', 'async', 'function', 'return']);

/** Index just past the end of the statement/expression that starts at `start` in the string-blanked text `ns`. */
function expressionEnd(ns, start) {
  let depth = 0;
  for (let i = start; i < ns.length; i++) {
    const ch = ns[i];
    if (ch === '(' || ch === '[' || ch === '{') depth++;
    else if (ch === ')' || ch === ']' || ch === '}') { if (depth === 0) return i; depth--; }
    else if (depth === 0 && ch === ';') return i;
    else if (depth === 0 && ch === '\n') {
      const prev = ns.slice(start, i).trimEnd().slice(-1);
      const next = /^\s*(\S)/.exec(ns.slice(i + 1));
      if (!next) return ns.length;
      if (/[.?:+\-*/%&|,<>=!]/.test(next[1]) || /[+\-*/%&|,<>=!?:.]/.test(prev)) continue; // the expression goes on
      return i;
    }
  }
  return ns.length;
}

/** Top-level (bracket-depth 0) comma-separated pieces of `ns[from, to)`, as [start, end) pairs. */
function topLevelPieces(ns, from, to) {
  const out = [];
  let depth = 0;
  let begin = from;
  for (let i = from; i < to; i++) {
    const ch = ns[i];
    if (ch === '(' || ch === '[' || ch === '{') depth++;
    else if (ch === ')' || ch === ']' || ch === '}') depth--;
    else if (ch === ',' && depth === 0) { out.push([begin, i]); begin = i + 1; }
  }
  out.push([begin, to]);
  return out.filter(([a, b]) => ns.slice(a, b).trim() !== '');
}

/** Canonical form for "is this the same expression?": no `await`, no spacing, no trailing comma. */
const canonicalExpr = (s) => s
  .replace(/^\s*await\s+/, '')
  .replace(/\s+/g, ' ')
  .replace(/\s*([(),.\[\]])\s*/g, '$1')
  .replace(/,\)/g, ')')
  .trim()
  .replace(/,$/, '');

/** `const NAME = <expr>` declared once in the test body: NAME → canonical <expr>. A name declared twice is dropped. */
function constantsOf(ncBody, nsBody) {
  const seen = new Map();
  const re = /\bconst\s+([A-Za-z_$][\w$]*)\s*(?::[^=;\n]+)?=(?![=>])\s*/g;
  let m;
  while ((m = re.exec(nsBody)) !== null) {
    const from = m.index + m[0].length;
    const to = expressionEnd(nsBody, from);
    const expr = canonicalExpr(ncBody.slice(from, to));
    seen.set(m[1], seen.has(m[1]) ? null : { expr, ns: canonicalExpr(nsBody.slice(from, to)) });
    re.lastIndex = Math.max(re.lastIndex, to);
  }
  for (const [k, v] of seen) if (v === null) seen.delete(k);
  return seen;
}

/** One hop: a bare name (or name.member.chain) declared by `const` in this test becomes what it was set to. */
function resolveOnce(expr, ns, constants) {
  const m = /^([A-Za-z_$][\w$]*)((?:\.[A-Za-z_$][\w$]*)*)$/.exec(expr);
  if (!m || !constants.has(m[1])) return { expr, ns };
  const c = constants.get(m[1]);
  return { expr: c.expr + m[2], ns: c.ns + m[2] };
}

/** Does this canonical expression call something with at least one argument (and is not a `new` expression)? */
const callsWithArguments = (expr) => !/^new\b/.test(expr) && /[A-Za-z_$][\w$]*\(['"`\w$\[{(-]/.test(expr);

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** If `ns` (canonical, strings blanked) is `callee(args)` plus optional member access, the identifier paths used in args. */
function callInputs(ns) {
  const m = /^([A-Za-z_$][\w$.]*)\(/.exec(ns);
  if (!m || /^new\b/.test(ns)) return null;
  const open = m[0].length - 1;
  const close = matchClose(ns, open);
  if (close === -1) return null;
  const rest = ns.slice(close + 1);
  if (rest !== '' && !/^(?:\.[A-Za-z_$][\w$]*|\[[^\]]*\])+$/.test(rest)) return null; // something more than the call: not judged
  const args = ns.slice(open + 1, close);
  const paths = new Set();
  const re = /(?<![\w$.])([A-Za-z_$][\w$]*(?:(?:\?\.|\.)[A-Za-z_$][\w$]*)*)(?!\w|\$)(?!\()/g;
  let p;
  while ((p = re.exec(args)) !== null) if (!SKIP_WORDS.has(p[1])) paths.add(p[1]);
  return [...paths];
}

/** Words that can appear in a callback body without naming anything outside it. */
const CALLBACK_KEYWORDS = new Set(['return', 'if', 'else', 'typeof', 'void', 'in', 'of', 'instanceof', 'const', 'let', 'var', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'default']);
/** Built-ins that compute from their arguments only, so using them does not bring in anything from outside the callback. */
const CALLBACK_GLOBALS = new Set(['Math', 'Number', 'String', 'Boolean', 'Array', 'Object', 'JSON', 'Infinity', 'NaN', 'parseInt', 'parseFloat']);

/**
 * Is this callback "the same logic re-typed in the test"? Only when it is self-contained: it uses nothing but
 * its own parameters (so it cannot be looking an answer up in a table, a constant or a helper the test brings in)
 * and it holds no literal (a literal inside the callback is knowledge the test author supplied: `u.id === 2`,
 * `x * 2`, `'abc'`, `/re/`). Anything else is not decidable from text, and what is not decidable is not reported.
 * @param {string} arg  the callback as written (strings blanked), e.g. `(s, i) => s + i.price`
 */
function isSelfContainedCallback(arg) {
  let params;
  let body;
  const arrow = /^(?:async\s*)?(?:\(([^()]*)\)|([A-Za-z_$][\w$]*))\s*=>\s*([\s\S]*)$/.exec(arg.trim());
  const fn = /^(?:async\s*)?function\s*[A-Za-z_$]*\s*\(([^()]*)\)\s*\{([\s\S]*)\}$/.exec(arg.trim());
  if (arrow) {
    params = arrow[1] ?? arrow[2];
    body = arrow[3].trim();
    if (body.startsWith('{')) {
      const close = matchClose(body, 0);
      if (close !== body.length - 1) return false;
      body = body.slice(1, close);
    }
  } else if (fn) {
    params = fn[1];
    body = fn[2];
  } else {
    return false; // a named function, or a shape not understood: not judged
  }
  if (params.includes('=')) return false; // default values can call anything
  if (/['"`]/.test(body)) return false; // a string literal (their contents are blanked, their quotes are not)
  if (/(?<![\w$.])\d|(?<=\.)\d/.test(body)) return false; // a number literal
  if (/(?:^|[(,=:[!&|?{};>+\-*%<~^]|\breturn\b)\s*\//.test(body)) return false; // a regex literal
  if (/\b(?:true|false|null|undefined)\b/.test(body)) return false; // a keyword literal
  if (/\b(?:this|arguments|new|await|yield|function)\b|=>/.test(body)) return false; // outside state, or a nested function
  const known = new Set([...params.matchAll(/[A-Za-z_$][\w$]*/g)].map((m) => m[0]));
  for (const d of body.matchAll(/\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)/g)) known.add(d[1]);
  for (const id of body.matchAll(/(?<![\w$.])(?<!\?\.)([A-Za-z_$][\w$]*)/g)) {
    const name = id[1];
    if (!known.has(name) && !CALLBACK_KEYWORDS.has(name) && !CALLBACK_GLOBALS.has(name)) return false; // something from outside the callback
  }
  return true;
}

/** Is `rhs` the input `x` run through reduce / map / flatMap / filter by a callback that re-types the logic (see above)? */
function recomputesFrom(rhs, x) {
  const X = escapeRe(x).replace(/\\\./g, '(?:\\?\\.|\\.)');
  const source = `(?:${X}|\\[\\.\\.\\.${X}\\]|Object\\.(?:values|keys|entries)\\(${X}\\)|Array\\.from\\(${X}\\))`;
  const verb = '(?:reduce|reduceRight|map|flatMap|filter)(?:<[^>()]*>)?\\(';
  const re = new RegExp(`(?<![\\w$.])${source}(?:\\?\\.|\\.)${verb}`, 'g');
  for (const m of rhs.matchAll(re)) {
    const open = m.index + m[0].length - 1;
    const close = matchClose(rhs, open);
    if (close === -1) continue;
    const [callback] = topLevelPieces(rhs, open + 1, close);
    if (callback && isSelfContainedCallback(rhs.slice(callback[0], callback[1]))) return true;
  }
  return false;
}

/**
 * The assertions in one test body whose expected value is not independent.
 * @param {string} ncBody  the body with comments blanked (strings intact)
 * @param {string} nsBody  the same body with comments AND string contents blanked (same offsets)
 * @param {string} testName
 * @returns {{ form: 'same-call'|'recomputed', offset: number }[]}
 */
export function findNonIndependentExpectations(ncBody, nsBody, testName = '') {
  const hits = [];
  const constants = constantsOf(ncBody, nsBody);
  const judge = (lhsFrom, lhsTo, rhsFrom, rhsTo, offset) => {
    const rawL = canonicalExpr(ncBody.slice(lhsFrom, lhsTo));
    const rawR = canonicalExpr(ncBody.slice(rhsFrom, rhsTo));
    if (rawL === rawR && !callsWithArguments(rawL)) return; // `x` against `x`: the literal rule above counts it
    // same-call is judged on the text as written. A name set earlier (`const before = snapshot(x)`) holds the
    // value from an EARLIER moment: `expect(snapshot(x)).toEqual(before)` after an action asks "did it change?",
    // which is a real question. Only two calls inside one statement cannot differ in time.
    if (rawL === rawR && callsWithArguments(rawL)) {
      // Another call inside the expression (`render(now())`, `total(load())`) may return something different the
      // second time, so the two sides are not known to be the same value: not judged.
      const callCount = (canonicalExpr(nsBody.slice(lhsFrom, lhsTo)).match(/[A-Za-z_$][\w$]*\(/g) || []).length;
      const hasNew = /\bnew\b/.test(canonicalExpr(nsBody.slice(lhsFrom, lhsTo)));
      if (callCount <= 1 && !hasNew && !DELIBERATE_COMPARISON_NAME.test(testName)) hits.push({ form: 'same-call', offset });
      return;
    }
    const l = resolveOnce(rawL, canonicalExpr(nsBody.slice(lhsFrom, lhsTo)), constants);
    const r = resolveOnce(rawR, canonicalExpr(nsBody.slice(rhsFrom, rhsTo)), constants);
    const inputs = callInputs(l.ns);
    if (inputs && inputs.some((x) => recomputesFrom(r.ns, x))) hits.push({ form: 'recomputed', offset });
  };

  const expectRe = /(?<![.\w$])expect\s*\(/g;
  let m;
  while ((m = expectRe.exec(nsBody)) !== null) {
    const open = m.index + m[0].length - 1;
    const close = matchClose(nsBody, open);
    if (close === -1) continue;
    const after = /^\s*\.\s*(?:(?:toBe|toEqual|toStrictEqual)|to\s*\.\s*(?:deep\s*\.\s*)?(?:equal|equals|eql))\s*\(/.exec(nsBody.slice(close + 1, close + 60));
    if (!after) continue; // `.not.`, `.resolves`, `.toThrow`, ... are not judged
    const mOpen = close + 1 + after[0].length - 1;
    const mClose = matchClose(nsBody, mOpen);
    if (mClose === -1) continue;
    const [first] = topLevelPieces(nsBody, mOpen + 1, mClose);
    if (!first) continue;
    judge(open + 1, close, first[0], first[1], m.index);
  }

  const assertRe = /(?<![.\w$])assert\s*\.\s*(?:equal|strictEqual|deepEqual|deepStrictEqual)\s*\(/g;
  while ((m = assertRe.exec(nsBody)) !== null) {
    const open = m.index + m[0].length - 1;
    const close = matchClose(nsBody, open);
    if (close === -1) continue;
    const pieces = topLevelPieces(nsBody, open + 1, close);
    if (pieces.length < 2) continue;
    judge(pieces[0][0], pieces[0][1], pieces[1][0], pieces[1][1], m.index);
  }
  return hits;
}

/**
 * The independence detectors, by language family. `count` is what analyzeTestText subtracts from the
 * assertions it credits; `find` says which assertions and why. Passed in (not read from a global) so a
 * test can hand the scanner a weakened set and watch the self-test and the samples catch it.
 */
export const INDEPENDENCE_DETECTORS = Object.freeze({
  count: (family, ncBody, nsBody, testName) => (family === 'js' ? findNonIndependentExpectations(ncBody, nsBody, testName).length : 0),
  find: (family, ncBody, nsBody, testName) => (family === 'js' ? findNonIndependentExpectations(ncBody, nsBody, testName) : [])
});

const FORM_DETAIL = {
  'same-call': 'the expected value is the same call as the code under test (same function, same arguments)',
  recomputed: 'the expected value is recomputed from the same input as the code under test (reduce/map/filter with a callback that uses only its own parameters), so it is not an independent oracle'
};

/**
 * Analyze one test file's text.
 * @returns {{ family: string|null, cases: number, skipped: number, unparsed: number,
 *             findings: { rule: string, line: number|null, name: string, detail: string }[] }}
 */
export function analyzeTestText(text, ext, extraAssertion = [], detectors = INDEPENDENCE_DETECTORS) {
  const family = FAMILY_BY_EXT[ext] || null;
  const rules = family && FAMILY_RULES[family];
  if (!rules) return { family: null, cases: 0, skipped: 0, unparsed: 0, findings: [] };
  const { noComments, noStrings } = maskSource(text, family);
  const { cases, unparsed } = rules.find(text, noStrings, noComments, ext);
  const lineOf = lineIndex(text);
  const findings = [];
  let skipped = 0;
  for (const c of cases) {
    if (c.skipped) { skipped++; continue; }
    const nsBody = noStrings.slice(c.bodyStart, c.bodyEnd);
    const ncBody = noComments.slice(c.bodyStart, c.bodyEnd);
    let tokens = countMatches(rules.tokens, nsBody);
    for (const re of extraAssertion) tokens += countMatches(re, nsBody);
    let taut = 0;
    for (const re of rules.taut) taut += countMatches(re, ncBody);
    const regexTaut = taut;
    taut += detectors.count(family, ncBody, nsBody, c.name);
    const real = Math.max(0, tokens - taut) + c.credit;
    if (real > 0) continue;
    if (taut === 0) {
      findings.push({ rule: 'no-assertion', line: lineOf(c.idx), name: c.name, detail: 'the body contains nothing that can fail an assertion' });
      continue;
    }
    const hits = detectors.find(family, ncBody, nsBody, c.name);
    const forms = [...new Set(hits.map((h) => h.form))];
    const finding = { rule: 'tautology', line: lineOf(c.idx), name: c.name, detail: 'its only assertion(s) can never fail' };
    if (forms.length > 0) {
      const parts = forms.map((f) => FORM_DETAIL[f]);
      if (regexTaut > 0) parts.unshift('an assertion that can never fail');
      finding.detail = `its only assertion(s) are not independent of the code under test: ${parts.join('; ')} (see verification-oracle)`;
      finding.forms = forms;
      finding.assertions = hits.map((h) => ({ line: lineOf(c.bodyStart + h.offset), form: h.form }));
    }
    findings.push(finding);
  }
  if (cases.length > 0 && skipped === cases.length) {
    findings.push({ rule: 'all-skipped', line: null, name: '(file)', detail: `every test in this file is skipped or todo (${skipped})` });
  }
  return { family, cases: cases.length, skipped, unparsed, findings };
}

// ═══════════════════════════════════════════════════════════════════════════
// Self-test — runs on EVERY invocation, before a single project file is read.
// A scanner that always says "clean" and a scanner that works print the same report;
// so the scanner must first catch fakes it was handed and let real tests through.
// ═══════════════════════════════════════════════════════════════════════════

const SELF_TEST = [
  { ext: 'js', rules: ['no-assertion'], text: "it('does nothing', () => { const a = 1; });\n" },
  { ext: 'js', rules: ['tautology'], text: "it('always passes', () => { expect(true).toBe(true); });\n" },
  { ext: 'js', rules: [], text: "it('adds', () => { expect(add(1, 2)).toBe(3); });\ntest('t', async () => { await expect(f()).rejects.toThrow(); });\n" },
  { ext: 'js', rules: ['all-skipped'], text: "it.skip('a', () => { expect(1).toBe(2); });\nit.todo('b');\n" },
  { ext: 'js', rules: ['no-assertion'], text: "it('commented out', () => {\n  // expect(a).toBe(b);\n  const s = \"expect(a).toBe(b)\";\n});\n" },
  // XSPEC-470: an expected value that is not independent of the code under test.
  { ext: 'js', rules: ['tautology'], text: "it('totals', () => { expect(calculateTotal(items)).toBe(calculateTotal(items)); });\n" },
  { ext: 'js', rules: ['tautology'], text: "it('totals', () => { expect(calculateTotal(items)).toBe(items.reduce((s, i) => s + i.price, 0)); });\n" },
  { ext: 'js', rules: ['tautology'], text: "it('names', () => { expect(namesOf(users)).toEqual(users.map((u) => u.name)); });\n" },
  { ext: 'js', rules: ['tautology'], text: "it('totals', () => {\n  const expected = items.reduce((s, i) => s + i.price, 0);\n  expect(calculateTotal(items)).toBe(expected);\n});\n" },
  { ext: 'js', rules: [], text: "it('totals', () => { expect(calculateTotal([{ price: 10 }, { price: 5 }])).toBe(15); });\n" },
  { ext: 'js', rules: [], text: "it('totals', () => { expect(calculateTotal(a)).toBe(calculateTotal(b)); });\n" },
  { ext: 'js', rules: [], text: "it('totals', () => { expect(calculateTotal(cart)).toBe(items.reduce((s, i) => s + i.price, 0)); });\n" },
  { ext: 'js', rules: [], text: "it('is deterministic', () => { expect(calculateTotal(items)).toBe(calculateTotal(items)); });\n" },
  { ext: 'js', rules: [], text: "it('changes nothing', () => {\n  const before = snapshot(dir);\n  preview(dir);\n  expect(snapshot(dir)).toEqual(before);\n});\n" },
  { ext: 'js', rules: [], text: "it('totals', () => { expect(calculateTotal(items)).toBe(calculateTotal(items)); expect(calculateTotal([])).toBe(0); });\n" },
  { ext: 'js', rules: [], text: "it('totals', () => { expect(calculateTotal(first)).not.toBe(calculateTotal(first)); });\n" },
  // XSPEC-470: look-alikes the rule must let through (the false alarms the first review measured).
  { ext: 'js', rules: [], text: "it('prices', () => { expect(priceOf(ids)).toEqual(ids.map((id) => KNOWN_PRICES[id])); });\n" },
  { ext: 'js', rules: [], text: "it('active', () => { expect(activeOf(users)).toEqual(users.filter((u) => u.id === 2)); });\n" },
  { ext: 'js', rules: [], text: "it('renders', () => { expect(render(now())).toBe(render(now())); });\n" },
  { ext: 'py', rules: ['no-assertion'], text: "def test_nothing():\n    x = 1\n    pass\n" },
  { ext: 'py', rules: ['tautology'], text: "def test_true():\n    assert True\n" },
  { ext: 'py', rules: [], text: "def test_ok():\n    assert add(1, 2) == 3\n\n\ndef test_raises():\n    with pytest.raises(ValueError):\n        f()\n" },
  { ext: 'go', rules: ['no-assertion'], text: 'func TestNothing(t *testing.T) {\n\tx := 1\n\t_ = x\n}\n' },
  { ext: 'go', rules: [], text: 'func TestOk(t *testing.T) {\n\tif got := Add(1, 2); got != 3 {\n\t\tt.Errorf("got %d", got)\n\t}\n}\n' },
  { ext: 'java', rules: ['no-assertion'], text: 'class A {\n  @Test\n  public void doesNothing() {\n    int a = 1;\n  }\n}\n' },
  { ext: 'java', rules: ['tautology'], text: 'class A {\n  @Test\n  void t() {\n    assertTrue(true);\n  }\n}\n' },
  { ext: 'java', rules: [], text: 'class A {\n  @Test\n  void t() {\n    assertEquals(3, add(1, 2));\n  }\n}\n' },
  { ext: 'rs', rules: ['no-assertion'], text: '#[test]\nfn does_nothing() {\n    let a = 1;\n}\n' },
  { ext: 'rs', rules: [], text: '#[test]\nfn adds() {\n    assert_eq!(add(1, 2), 3);\n}\n' },
  { ext: 'rb', rules: ['no-assertion'], text: "describe 'x' do\n  it 'does nothing' do\n    a = 1\n  end\nend\n" },
  { ext: 'rb', rules: [], text: "describe 'x' do\n  it 'adds' do\n    expect(add(1, 2)).to eq(3)\n  end\nend\n" },
  { ext: 'php', rules: ['no-assertion'], text: "<?php\nclass T {\n  public function testNothing() {\n    $a = 1;\n  }\n}\n" },
  { ext: 'cpp', rules: ['no-assertion'], text: 'TEST(Suite, Nothing) {\n  int a = 1;\n}\n' },
  { ext: 'cpp', rules: [], text: 'TEST(Suite, Adds) {\n  EXPECT_EQ(3, Add(1, 2));\n}\n' }
];

/** @returns {string[]} what went wrong; empty = the scanner behaves on every known sample */
export function selfTest() {
  const problems = [];
  for (const [i, s] of SELF_TEST.entries()) {
    const got = analyzeTestText(s.text, s.ext).findings.map((f) => f.rule).sort();
    const want = [...s.rules].sort();
    if (JSON.stringify(got) !== JSON.stringify(want)) {
      problems.push(`self-test #${i} (.${s.ext}): expected [${want.join(', ')}], got [${got.join(', ')}]`);
    }
  }
  return problems;
}

// ═══════════════════════════════════════════════════════════════════════════
// Run
// ═══════════════════════════════════════════════════════════════════════════

function readAssertionPatterns(root) {
  const file = join(root, POLICY_FILE);
  if (!existsSync(file)) return { patterns: [], problems: [] };
  try {
    const raw = JSON.parse(readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
    const list = Array.isArray(raw.assertionPatterns) ? raw.assertionPatterns : [];
    const patterns = [];
    const problems = [];
    for (const s of list) {
      try { patterns.push(new RegExp(String(s), 'g')); } catch (e) { problems.push(`assertionPatterns: "${s}" is not a valid regular expression (${e.message})`); }
    }
    return { patterns, problems };
  } catch {
    return { patterns: [], problems: [] }; // loadPolicy already reported an unreadable file
  }
}

// Directories under a test tree that hold data, not tests.
const FIXTURE_DIRS = new Set(['fixtures', 'fixture', '__fixtures__', '__snapshots__', 'snapshots', 'testdata', '__mocks__']);

export function scan(root, { staged = false } = {}) {
  const { policy, problems } = loadPolicy(root);
  const extra = readAssertionPatterns(root);
  problems.push(...extra.problems);
  let files;
  if (staged) {
    const s = stagedFiles(root);
    if (s.error) return { error: `cannot read the staged files: ${s.error}`, problems };
    files = s.files;
  } else {
    files = walkFiles(root, policy);
  }
  const result = {
    mode: staged ? 'staged' : 'all', problems, testFiles: 0, cases: 0, skippedCases: 0, unparsed: 0,
    findings: [], unsupported: [], unreadable: []
  };
  for (const rel of files) {
    if (classifyPath(rel, policy).kind !== 'test') continue;
    const base = rel.split('/').pop();
    if (policy.nonCodeNames.includes(base) || base === 'conftest.py' || base.startsWith('.')) continue;
    if (rel.split('/').some((d) => FIXTURE_DIRS.has(d))) continue;
    const ext = extOfPath(rel);
    // A test-directory file that is not code at all (a JSON fixture, a snapshot) is not a test case holder.
    if (!FAMILY_BY_EXT[ext]) {
      if (policy.sourceExtensions.includes(ext) || !policy.nonCodeExtensions.includes(ext)) result.unsupported.push(rel);
      continue;
    }
    const r = readText(join(root, rel));
    if (r.skipped) { if (!r.quiet) result.unreadable.push(`${rel} (${r.skipped})`); continue; }
    const a = analyzeTestText(r.text, ext, extra.patterns);
    result.testFiles++;
    result.cases += a.cases;
    result.skippedCases += a.skipped;
    result.unparsed += a.unparsed;
    for (const f of a.findings) result.findings.push({ file: rel, ...f });
  }
  return result;
}

function report(r) {
  const out = [];
  for (const p of r.problems) out.push(`  ! ${p}`);
  out.push(`check-anti-fake-tests: scanned ${r.testFiles} test file(s), ${r.cases} test case(s) (${r.mode === 'staged' ? 'staged files only' : 'whole project'})`);
  for (const f of r.findings) {
    out.push(`  ✗ ${f.file}${f.line ? `:${f.line}` : ''}  ${f.rule}  "${f.name}" — ${f.detail}`);
  }
  if (r.unsupported.length > 0) {
    const exts = [...new Set(r.unsupported.map((p) => `.${extOfPath(p) || '(none)'}`))].join(', ');
    out.push(`  · NOT scanned — no rule for this language (${exts}): ${r.unsupported.slice(0, 5).join(', ')}${r.unsupported.length > 5 ? `, +${r.unsupported.length - 5} more` : ''}`);
    out.push('    These files were not judged. Fake tests in them would not be found by this script.');
  }
  for (const u of r.unreadable) out.push(`  · NOT scanned — ${u}`);
  if (r.unparsed > 0) out.push(`  · ${r.unparsed} test call(s) could not be parsed (unbalanced brackets) and were not judged`);
  if (r.testFiles === 0 && r.unsupported.length === 0 && r.mode === 'all') out.push('  · no test files found — nothing was measured');
  out.push(r.findings.length > 0 ? `RESULT: ${r.findings.length} finding(s)` : 'RESULT: no fake tests found among the files scanned');
  return out.join('\n');
}

export function main(argv, root = process.cwd()) {
  const bad = selfTest();
  if (bad.length > 0) {
    console.error('check-anti-fake-tests: the scanner failed its own self-test, so its result would mean nothing:');
    for (const b of bad) console.error(`  ${b}`);
    return 2;
  }
  const r = scan(root, { staged: argv.includes('--staged') });
  if (r.error) {
    console.error(`check-anti-fake-tests: ${r.error}`);
    return 2;
  }
  console.log(argv.includes('--json') ? JSON.stringify(r, null, 2) : report(r));
  return r.findings.length > 0 ? 1 : 0;
}

if (isMain(import.meta.url)) process.exitCode = main(process.argv.slice(2));
