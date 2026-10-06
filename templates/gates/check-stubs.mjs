#!/usr/bin/env node
// SPDX-License-Identifier: MIT
//
// ─────────────────────────────────────────────────────────────────────────────
// check-stubs —— 空殼與暫時實作掃描（UDS full-coverage-testing 的出貨閘門）
// ─────────────────────────────────────────────────────────────────────────────
//
// What it finds, in the source files of any project:
//   stub-marker       a `// WARNING: STUB — Remove before UAT` marker (a declared placeholder:
//                     UDS's full-coverage-testing standard says it must be gone before UAT)
//   not-implemented   a body that says it is not implemented (raise NotImplementedError,
//                     todo!(), TODO(), throw new Error("not implemented") ...) with no
//                     STUB / COVERAGE_EXEMPT marker beside it — a SILENT placeholder
//   empty-function    a named function whose body is empty (or only `pass` / `...`) with no
//                     such marker — a silent empty shell
//
// Written into your project by `uds init` (XSPEC-444 R5). It is YOURS: edit it, or replace
// it. `uds update` never overwrites it. `uds check` (which your pre-commit hook runs) calls
// it and prints what it finds as a WARNING; it does not stop your commit unless you set
// "mode": "block" in .standards/test-policy.json. To make STUB markers stop a push to main or
// a deploy (the standard's deployment gates), run it yourself in that step:
//     node scripts/check-stubs.mjs        # exit 1 when anything is found
//
// Usage:
//   node scripts/check-stubs.mjs            scan the whole project
//   node scripts/check-stubs.mjs --staged   scan only the files staged for commit
//   node scripts/check-stubs.mjs --json     machine-readable result
//
// Exit codes:  0 nothing found  |  1 findings  |  2 could not judge (the scanner's own
//   self-test failed, or git was unreadable in --staged mode). 2 is never a pass.
//
// Marker rule: a placeholder is DECLARED when the text `STUB` or `COVERAGE_EXEMPT` is on
// the same line or in the three lines above it. A declared placeholder is reported once, as
// its marker (stub-marker), not again as an empty function.
//
// Empty-function detection has rules for JavaScript/TypeScript, Python, Go, Rust, Ruby and
// PHP. In other languages only markers and "not implemented" bodies are found, and the
// summary says so — it does not pretend to have looked.
//
// Heuristic by nature: it reads text, it does not understand your program. An empty function
// that is intentional (an interface default, a hook point) belongs next to a
// `// COVERAGE_EXEMPT: <reason>` comment, which states why.

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
// Stub rules
// ═══════════════════════════════════════════════════════════════════════════

const MARKER_RE = /WARNING:\s*STUB/;
const DECLARED_RE = /\bSTUB\b|COVERAGE_EXEMPT/;

const NOT_IMPLEMENTED = [
  /\braise\s+NotImplementedError\b/g,
  /\bthrow\s+new\s+\w*NotImplemented\w*/g,
  /\bthrow\s+new\s+(?:Error|\w*Exception)\s*\(\s*['"`]\s*(?:not\s+(?:yet\s+)?implemented|todo|unimplemented)/gi,
  /\b(?:todo|unimplemented)!\s*\(/g,
  /\bTODO\s*\(\s*(?:"[^"\n]*")?\s*\)/g,
  /\bpanic\(\s*"\s*(?:not\s+(?:yet\s+)?implemented|todo|unimplemented)/gi,
  /\bfatalError\(\s*"\s*(?:not\s+(?:yet\s+)?implemented|todo)/gi
];

const EMPTY_FN = {
  js: [
    /\bfunction\s*\*?\s*(\w+)\s*\([^)]*\)\s*(?::\s*[^{;\n]+?)?\s*\{\s*\}/g,
    /\b(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?(?:\([^)]*\)|\w+)\s*(?::\s*[^=\n]+?)?=>\s*\{\s*\}/g
  ],
  php: [/\bfunction\s+(\w+)\s*\([^)]*\)\s*(?::\s*\??[\w\\]+\s*)?\{\s*\}/g],
  go: [/\bfunc\s+(?:\([^)]*\)\s*)?(\w+)\s*\([^)]*\)\s*(?:\([^)]*\)|[\w.*[\]]+)?\s*\{\s*\}/g],
  rust: [/\bfn\s+(\w+)\s*(?:<[^>]*>)?\s*\([^)]*\)\s*(?:->\s*[^{;]+?)?\s*\{\s*\}/g],
  ruby: [/\bdef\s+(\w+[?!=]?)(?:\([^)]*\))?[ \t]*\n\s*end\b/g]
};
const IGNORED_NAMES = /^(?:noop|no_?op|_+|initialize)$/i;

const declaredNear = (lines, lineNo) => {
  for (let k = Math.max(0, lineNo - 4); k <= lineNo - 1; k++) if (DECLARED_RE.test(lines[k] || '')) return true;
  return false;
};

/**
 * @returns {{ family: string|null, emptyRule: boolean, findings: { rule: string, line: number, name: string, detail: string }[] }}
 */
export function analyzeStubText(text, ext) {
  const family = FAMILY_BY_EXT[ext] || null;
  const { noComments, noStrings } = maskSource(text, family || 'other');
  const lineOf = lineIndex(text);
  const lines = text.split('\n');
  const findings = [];

  // 1. declared placeholders: the STUB marker itself
  lines.forEach((l, i) => {
    if (MARKER_RE.test(l)) {
      findings.push({ rule: 'stub-marker', line: i + 1, name: l.trim().slice(0, 80), detail: 'placeholder marked STUB — must be removed before UAT/production' });
    }
  });

  // 2. silent "not implemented" bodies
  for (const re of NOT_IMPLEMENTED) {
    const r = new RegExp(re.source, re.flags);
    let m;
    while ((m = r.exec(noComments)) !== null) {
      const line = lineOf(m.index);
      if (declaredNear(lines, line)) continue;
      if (/@(?:abc\.)?abstractmethod\b|@overload\b/.test(lines.slice(Math.max(0, line - 4), line - 1).join('\n'))) continue;
      findings.push({ rule: 'not-implemented', line, name: m[0].trim().slice(0, 60), detail: 'a body that says it is not implemented, with no STUB / COVERAGE_EXEMPT marker beside it' });
    }
  }

  // 3. silent empty functions (languages with a rule)
  const emptyRule = Boolean(family && (EMPTY_FN[family] || family === 'python'));
  if (family && EMPTY_FN[family]) {
    for (const re of EMPTY_FN[family]) {
      const r = new RegExp(re.source, re.flags);
      let m;
      while ((m = r.exec(noStrings)) !== null) {
        const line = lineOf(m.index);
        if (IGNORED_NAMES.test(m[1]) || declaredNear(lines, line)) continue;
        findings.push({ rule: 'empty-function', line, name: m[1], detail: 'the function body is empty, with no STUB / COVERAGE_EXEMPT marker beside it' });
      }
    }
  }
  if (family === 'python') {
    const ns = noStrings.split('\n');
    for (let li = 0; li < ns.length; li++) {
      const m = /^([ \t]*)(?:async\s+)?def\s+(\w+)\s*\(/.exec(ns[li]);
      if (!m || IGNORED_NAMES.test(m[2]) || /^__\w+__$/.test(m[2])) continue;
      const indent = indentOf(m[1] + 'x') - 1;
      // the signature may span lines; the body starts after the line that ends with ':'
      let sig = li;
      while (sig < ns.length - 1 && !/:\s*$/.test(ns[sig]) && !/:\s*\S/.test(ns[sig].slice(ns[sig].lastIndexOf(')')))) sig++;
      const { first, last } = indentBlock(ns, sig, indent);
      const inline = ns[sig].slice(ns[sig].lastIndexOf(')')).replace(/^\)[^:]*:/, '').trim();
      const body = [inline, ...ns.slice(first, last + 1)].map((s) => s.trim()).filter(Boolean);
      const empty = body.length === 0 || body.every((s) => s === 'pass' || s === '...');
      if (!empty) continue;
      if (declaredNear(lines, li + 1)) continue;
      const decorators = lines.slice(Math.max(0, li - 4), li).join('\n');
      if (/@(?:abc\.)?abstractmethod\b|@overload\b/.test(decorators)) continue;
      findings.push({ rule: 'empty-function', line: li + 1, name: m[2], detail: 'the function body is empty (or only `pass` / `...`), with no STUB / COVERAGE_EXEMPT marker beside it' });
    }
  }
  findings.sort((a, b) => a.line - b.line);
  return { family, emptyRule, findings };
}

// ═══════════════════════════════════════════════════════════════════════════
// Self-test — runs on EVERY invocation, before a single project file is read.
// ═══════════════════════════════════════════════════════════════════════════

const SELF_TEST = [
  { ext: 'js', rules: ['empty-function'], text: 'function save(order) {}\n' },
  { ext: 'js', rules: ['empty-function'], text: 'const charge = async (card) => {\n}\n' },
  { ext: 'js', rules: [], text: 'function noop() {}\nfunction add(a, b) { return a + b; }\n' },
  { ext: 'js', rules: ['stub-marker'], text: '// WARNING: STUB — Remove before UAT\nasync function validatePayment(card) {}\n' },
  { ext: 'js', rules: [], text: '// COVERAGE_EXEMPT: hardware hook point, nothing to do on this platform\nfunction onTick() {}\n' },
  { ext: 'py', rules: ['not-implemented'], text: 'def charge(card):\n    raise NotImplementedError\n' },
  { ext: 'py', rules: ['empty-function'], text: 'def save(order):\n    pass\n' },
  { ext: 'py', rules: [], text: 'class A:\n    @abstractmethod\n    def run(self):\n        raise NotImplementedError\n\n    def __init__(self):\n        pass\n\n\ndef add(a, b):\n    return a + b\n' },
  { ext: 'go', rules: ['empty-function'], text: 'func Charge(card Card) error {}\n' },
  { ext: 'rs', rules: ['not-implemented'], text: 'fn charge() {\n    todo!()\n}\n' },
  { ext: 'rs', rules: [], text: 'fn add(a: i32, b: i32) -> i32 {\n    a + b\n}\n' },
  { ext: 'zig', rules: ['not-implemented'], text: 'fn charge() void {\n    unimplemented!()\n}\n' }
];

/** @returns {string[]} what went wrong; empty = the scanner behaves on every known sample */
export function selfTest() {
  const problems = [];
  for (const [i, s] of SELF_TEST.entries()) {
    const got = analyzeStubText(s.text, s.ext).findings.map((f) => f.rule).sort();
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

// This file spells out the very markers it looks for (in comments and in its self-test), so it
// must not scan itself.
const SELF = (() => { try { return realpathSync(fileURLToPath(import.meta.url)); } catch { return null; } })();
const isSelf = (abs) => { try { return SELF !== null && realpathSync(abs) === SELF; } catch { return false; } };

export function scan(root, { staged = false } = {}) {
  const { policy, problems } = loadPolicy(root);
  let files;
  if (staged) {
    const s = stagedFiles(root);
    if (s.error) return { error: `cannot read the staged files: ${s.error}`, problems };
    files = s.files;
  } else {
    files = walkFiles(root, policy);
  }
  const result = { mode: staged ? 'staged' : 'all', problems, files: 0, findings: [], noEmptyRule: new Set(), unreadable: [] };
  for (const rel of files) {
    const kind = classifyPath(rel, policy).kind;
    if (kind !== 'source' && kind !== 'unclassified') continue;
    if (isSelf(join(root, rel))) continue;
    const ext = extOfPath(rel);
    const r = readText(join(root, rel));
    if (r.skipped) { if (!r.quiet) result.unreadable.push(`${rel} (${r.skipped})`); continue; }
    const a = analyzeStubText(r.text, ext);
    result.files++;
    if (!a.emptyRule) result.noEmptyRule.add(ext ? `.${ext}` : '(no extension)');
    for (const f of a.findings) result.findings.push({ file: rel, ...f });
  }
  result.noEmptyRule = [...result.noEmptyRule].sort();
  return result;
}

function report(r) {
  const out = [];
  for (const p of r.problems) out.push(`  ! ${p}`);
  out.push(`check-stubs: scanned ${r.files} source file(s) (${r.mode === 'staged' ? 'staged files only' : 'whole project'})`);
  for (const f of r.findings) out.push(`  ✗ ${f.file}:${f.line}  ${f.rule}  ${f.name} — ${f.detail}`);
  if (r.noEmptyRule.length > 0) {
    out.push(`  · empty-function scan has no rule for: ${r.noEmptyRule.join(' ')} (markers and "not implemented" bodies were still searched)`);
  }
  for (const u of r.unreadable) out.push(`  · NOT scanned — ${u}`);
  out.push(r.findings.length > 0 ? `RESULT: ${r.findings.length} finding(s)` : 'RESULT: no stubs found among the files scanned');
  return out.join('\n');
}

export function main(argv, root = process.cwd()) {
  const bad = selfTest();
  if (bad.length > 0) {
    console.error('check-stubs: the scanner failed its own self-test, so its result would mean nothing:');
    for (const b of bad) console.error(`  ${b}`);
    return 2;
  }
  const r = scan(root, { staged: argv.includes('--staged') });
  if (r.error) {
    console.error(`check-stubs: ${r.error}`);
    return 2;
  }
  console.log(argv.includes('--json') ? JSON.stringify(r, null, 2) : report(r));
  return r.findings.length > 0 ? 1 : 0;
}

if (isMain(import.meta.url)) process.exitCode = main(process.argv.slice(2));
