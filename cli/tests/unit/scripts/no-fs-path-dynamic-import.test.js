/**
 * Class-level guard for the defect fixed in scripts/hooks/turn-completion/
 * engine.mjs and four scripts/check-*.ts files: `import(join(...))`.
 *
 * A filesystem path is not a valid ESM import specifier. `join(HERE,
 * 'locales', 'en.mjs')` returns `C:\...\locales\en.mjs` on Windows — dynamic
 * `import()` there throws, unlike POSIX where an absolute path happens to
 * also parse as a (non-standard but Node-accepted) specifier. Measured
 * 2026-09-27 in CI (windows-latest): every locale pack in engine.mjs failed
 * to load, `loadPacks()`'s `failed` array was silently non-empty, and every
 * adapter test expecting a block/deny decision got `undefined` — the hook
 * ran, found zero packs, and let every turn end uninspected.
 *
 * The fix is not "avoid dynamic import of a path" (`cli/src/utils/
 * standard-fixer.js` and `standard-validator.js` already do this correctly)
 * — it is "wrap the path in `pathToFileURL(...).href` first". This test
 * walks the repo's own tooling source for the broken shape rather than
 * re-checking the five sites by name, per the standing rule "fix the class,
 * not the instance": a sixth site written next month must fail this test
 * without anyone remembering this incident.
 *
 * Scope: `scripts/` (repo root) and `cli/src/`, `cli/scripts/` — the
 * tooling and product code that actually executes. `cli/tests/` is
 * deliberately excluded: it is this file's own directory, and a source-text
 * scanner that includes its own directory risks matching its own pattern
 * strings (the standing lesson "the string I'm hunting for can appear in the
 * prose that describes it" — measured elsewhere in this repo as the
 * self-counting `pgrep -f` and `check_` prefix incidents). `cli/bundled/`
 * is excluded because it is a gitignored prepack artifact, not a source.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname, relative } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '../../../..');

const SCAN_ROOTS = [
  join(REPO_ROOT, 'scripts'),
  join(REPO_ROOT, 'cli', 'src'),
  join(REPO_ROOT, 'cli', 'scripts'),
];

const EXCLUDED_DIR_NAMES = new Set(['node_modules', 'bundled', 'dist', '.git']);
const SCANNED_EXTENSIONS = new Set(['.js', '.mjs', '.ts']);

function listSourceFiles(dir) {
  const out = [];
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out; // a scan root that does not exist is not this test's problem
  }
  for (const entry of entries) {
    if (EXCLUDED_DIR_NAMES.has(entry)) continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) out.push(...listSourceFiles(full));
    else if (SCANNED_EXTENSIONS.has(extname(full))) out.push(full);
  }
  return out;
}

/**
 * Blank out comment and string/template-literal TEXT (replacing it with
 * spaces, preserving line breaks and `${...}` template expressions) so a
 * naive keyword scan does not fire on the word "import(" appearing inside a
 * comment or a human-readable message — e.g. cli/src/utils/effect-boundary.js
 * has the literal prose "...external package import(s): " inside a template
 * literal, which is not a dynamic import call.
 *
 * This is NOT a full JS/TS lexer (no regex-literal handling, escape edge
 * cases are approximated) — it exists only to keep this scanner's own
 * findings list free of prose false positives; every finding it does report
 * is a byte-for-byte match against the ORIGINAL source line, so a human
 * reviewing `offenders` output is looking at real code either way.
 */
function blankStringsAndComments(src) {
  let out = '';
  let i = 0;
  const n = src.length;
  while (i < n) {
    const c = src[i];
    const two = src.slice(i, i + 2);
    if (two === '//') {
      while (i < n && src[i] !== '\n') { out += ' '; i++; }
      continue;
    }
    if (two === '/*') {
      out += '  ';
      i += 2;
      while (i < n && src.slice(i, i + 2) !== '*/') {
        out += src[i] === '\n' ? '\n' : ' ';
        i++;
      }
      out += '  ';
      i += 2;
      continue;
    }
    if (c === '\'' || c === '"') {
      const quote = c;
      out += ' ';
      i++;
      while (i < n && src[i] !== quote && src[i] !== '\n') {
        if (src[i] === '\\') { out += '  '; i += 2; continue; }
        out += ' ';
        i++;
      }
      out += ' ';
      i++;
      continue;
    }
    if (c === '`') {
      out += ' ';
      i++;
      while (i < n && src[i] !== '`') {
        if (src[i] === '\\') { out += '  '; i += 2; continue; }
        if (src[i] === '$' && src[i + 1] === '{') {
          out += '${';
          i += 2;
          let depth = 1;
          while (i < n && depth > 0) {
            if (src[i] === '{') depth++;
            else if (src[i] === '}') depth--;
            out += src[i];
            i++;
          }
          continue;
        }
        out += src[i] === '\n' ? '\n' : ' ';
        i++;
      }
      out += ' ';
      i++;
      continue;
    }
    out += c;
    i++;
  }
  return out;
}

/**
 * A dynamic import() argument is compliant when it is a plain literal
 * specifier (relative/bare specifiers are resolved as URLs by Node, so
 * `import('./locales/en.mjs')` is fine on every platform even though it
 * LOOKS like a path), or when it goes through pathToFileURL / new URL /
 * import.meta.resolve — the forms that turn an OS filesystem path into a
 * valid specifier on Windows too.
 */
function isCompliantImportArg(arg) {
  const trimmed = arg.trim();
  if (trimmed === '') return true; // couldn't extract anything — not this scanner's finding to make
  if (/^['"`]/.test(trimmed)) return true;
  if (/\bpathToFileURL\s*\(/.test(trimmed)) return true;
  if (/\bnew\s+URL\s*\(/.test(trimmed)) return true;
  if (/\bimport\.meta\.resolve\s*\(/.test(trimmed)) return true;
  return false;
}

/**
 * Find every dynamic `import(...)` call in `content` and report the ones
 * whose argument is neither a literal specifier nor wrapped for
 * cross-platform path-to-URL conversion. `blankStringsAndComments` is run
 * first so line numbers still match the original file.
 */
function findViolations(content, filePath) {
  const scanned = blankStringsAndComments(content);
  const violations = [];
  const re = /\bimport\s*\(/g;
  let match;
  while ((match = re.exec(scanned))) {
    const argStart = match.index + match[0].length;
    let depth = 1;
    let i = argStart;
    while (i < scanned.length && depth > 0) {
      if (scanned[i] === '(') depth++;
      else if (scanned[i] === ')') depth--;
      i++;
    }
    const arg = content.slice(argStart, i - 1); // original text, for the report
    if (isCompliantImportArg(scanned.slice(argStart, i - 1))) continue;
    const lineNum = scanned.slice(0, match.index).split('\n').length;
    violations.push({ file: filePath, line: lineNum, arg: arg.trim() });
  }
  return violations;
}

describe('no dynamic import() of a raw filesystem path (Windows ESM compat)', () => {
  it('sanity check: fires on the exact broken shape', () => {
    const bad = "await import(join(HERE, 'locales', `${id}.mjs`));";
    expect(findViolations(bad, 'fixture.mjs')).toHaveLength(1);
  });

  it('sanity check: does not fire on a literal specifier', () => {
    const ok = "await import('../../cli/src/utils/telemetry-uploader.js');";
    expect(findViolations(ok, 'fixture.mjs')).toHaveLength(0);
  });

  it('sanity check: does not fire on pathToFileURL(...).href', () => {
    const ok = 'await import(pathToFileURL(fullScriptPath).href);';
    expect(findViolations(ok, 'fixture.mjs')).toHaveLength(0);
  });

  it('sanity check: does not fire on the word "import(" inside a comment', () => {
    const ok = "// dynamic import('...')\n// dynamic import(<non-literal>) — cannot resolve statically";
    expect(findViolations(ok, 'fixture.mjs')).toHaveLength(0);
  });

  it('sanity check: does not fire on the word "import(" inside a template-literal message', () => {
    const ok = "m.reason = `unclassifiable external package import(s): ` + list;";
    expect(findViolations(ok, 'fixture.mjs')).toHaveLength(0);
  });

  it('sanity check: still fires on a real import() nested inside a template-literal ${} expression', () => {
    const bad = 'const p = `${await import(join(ROOT, "x.js"))}`;';
    expect(findViolations(bad, 'fixture.mjs')).toHaveLength(1);
  });

  it('scans a non-trivial number of files (the walk is not silently empty)', () => {
    const files = SCAN_ROOTS.flatMap(listSourceFiles);
    expect(files.length).toBeGreaterThan(100);
  });

  it('no scanned file dynamic-imports a raw filesystem path', () => {
    const files = SCAN_ROOTS.flatMap(listSourceFiles);
    const offenders = [];
    for (const file of files) {
      const content = readFileSync(file, 'utf-8');
      for (const v of findViolations(content, relative(REPO_ROOT, file))) {
        offenders.push(`${v.file}:${v.line}: import(${v.arg})`);
      }
    }
    expect(offenders).toEqual([]);
  });
});
