/**
 * Class-level guard: nothing UDS ships may run the bare name `uds` through a
 * package runner (npx, bunx, pnpm dlx, yarn dlx, npm exec ...).
 *
 * Why: the npm registry package named `uds` is not this project (unrelated
 * maintainer, unrelated repo, last published 2022, no `bin` today). A package
 * runner resolves a bare command from node_modules/.bin and PATH first and asks
 * the registry only when neither has it — so on any machine without UDS
 * installed, a hook, script or instruction that says `npx uds ...` fetches a
 * stranger's package by name. It fails today only because that package has no
 * executable; the day its owner publishes one with a `uds` bin, every adopter
 * whose hook says `npx uds check` runs their code on every commit.
 * The name of THIS project's package is `universal-dev-standards`; that is the
 * only name that is safe to hand to a runner.
 *
 * What this walks (derived, not listed by hand): everything `npm pack` puts in
 * the tarball — `cli/src`, `cli/bin`, `cli/README.md`, and every source
 * directory `cli/scripts/prepack.mjs` copies into `bundled/` (read from that
 * file, so a directory added there is covered without anyone editing this one).
 *
 *  - .js/.mjs/.cjs are parsed and only STRING and TEMPLATE literals are
 *    examined. A comment cannot reach an adopter's disk, and incident notes in
 *    comments quote the old line on purpose; a text scan would flag them and the
 *    only fix would be to falsify the history.
 *  - every other text file (md, yaml, json, sh, ...) is scanned whole, because
 *    its content IS what gets copied.
 *
 * Not caught, stated so nobody assumes otherwise: a command assembled from
 * pieces at runtime (`'npx ' + name`). The walk reads text, not behavior;
 * tests/unit/utils/pre-commit-block.test.js is what proves the hook's behavior.
 *
 * Exclusions are a table with a reason each, and each is checked to still match
 * something: an exclusion that no longer excludes anything is dead weight that
 * would quietly widen if the file it names grew a real violation.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync, mkdtempSync, mkdirSync, writeFileSync, rmSync, existsSync } from 'fs';
import { join, relative, extname, basename, sep } from 'path';
import { tmpdir } from 'os';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as acorn from 'acorn';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '../../../..');
const CLI_ROOT = join(REPO_ROOT, 'cli');

/** A package runner followed, after optional flags, by the bare name `uds`. */
const BARE_UDS_RUNNER = /\b(?:npx|bunx|pnpx|pnpm\s+dlx|yarn\s+dlx|npm\s+exec|npm\s+x)\s+(?:-\S+\s+)*uds\b/;

const SKIP_DIRS = new Set(['node_modules', '.git', 'bundled', 'coverage']);
const SCRIPT_EXTS = new Set(['.js', '.mjs', '.cjs']);
// Formats that cannot carry text a shell or a reader would act on.
const BINARY_EXTS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.woff', '.woff2', '.ttf', '.zip', '.gz', '.tgz', '.pdf']);

/**
 * Each entry: which files (by path relative to the repo root, forward slashes),
 * and why they may name the bare-runner form.
 */
const EXCLUSIONS = [
  {
    test: (rel) => rel === 'cli/src/utils/legacy-hook-migration.js',
    reason:
      'Recognises the two exact lines older UDS versions wrote so `uds update` can replace them. ' +
      'It matches them; it emits the current block from git-hooks.js instead (proved by ' +
      'tests/unit/utils/legacy-hook-migration.test.js, which asserts the result contains no bare-runner line).'
  },
  {
    test: (rel) => basename(rel) === 'CHANGELOG.md',
    reason:
      'A changelog records what earlier versions wrote — including this very fix, which has to quote the old line ' +
      'to describe it. History is not an instruction.'
  }
];

function toRel(root, abs) {
  return relative(root, abs).split(sep).join('/');
}

function* walk(dir) {
  let entries;
  try { entries = readdirSync(dir); } catch { return; }
  for (const name of entries.sort()) {
    if (SKIP_DIRS.has(name)) continue;
    const abs = join(dir, name);
    const st = statSync(abs);
    if (st.isDirectory()) yield* walk(abs);
    else if (st.isFile()) yield abs;
  }
}

/** Every string/template chunk in a script. Throws on a script that does not parse — never skipped silently. */
function stringsOf(source) {
  const out = [];
  const ast = acorn.parse(source, { ecmaVersion: 'latest', sourceType: 'module', allowHashBang: true });
  (function visit(node) {
    if (!node || typeof node.type !== 'string') return;
    if (node.type === 'Literal' && typeof node.value === 'string') out.push(node.value);
    if (node.type === 'TemplateElement') out.push(node.value.cooked ?? node.value.raw);
    for (const key of Object.keys(node)) {
      const child = node[key];
      if (Array.isArray(child)) child.forEach(visit);
      else if (child && typeof child === 'object') visit(child);
    }
  })(ast);
  return out;
}

/** Violations in one file's text. `path` decides how the text is read. */
function violationsIn(path, text) {
  const hits = [];
  const chunks = SCRIPT_EXTS.has(extname(path)) ? stringsOf(text) : text.split('\n');
  for (const chunk of chunks) {
    for (const line of chunk.split('\n')) {
      if (BARE_UDS_RUNNER.test(line)) hits.push(line.trim());
    }
  }
  return hits;
}

/** Scan `files` (absolute paths) relative to `root`. Returns { hits, excludedMatches, scanned }. */
function scan(root, files) {
  const hits = [];
  const excludedMatches = new Map(); // exclusion index -> matched-something?
  EXCLUSIONS.forEach((_, i) => excludedMatches.set(i, false));
  let scanned = 0;
  for (const abs of files) {
    if (BINARY_EXTS.has(extname(abs).toLowerCase())) continue;
    const rel = toRel(root, abs);
    const found = violationsIn(abs, readFileSync(abs, 'utf-8'));
    scanned += 1;
    if (found.length === 0) continue;
    const ex = EXCLUSIONS.findIndex((e) => e.test(rel));
    if (ex !== -1) { excludedMatches.set(ex, true); continue; }
    for (const line of found) hits.push(`${rel}: ${line}`);
  }
  return { hits, excludedMatches, scanned };
}

/** The directories prepack copies into bundled/, read from prepack.mjs itself. */
function bundledSourceDirs() {
  const prepack = readFileSync(join(CLI_ROOT, 'scripts', 'prepack.mjs'), 'utf-8');
  return [...prepack.matchAll(/\{\s*src:\s*'([^']+)'/g)].map((m) => m[1]);
}

function shippedFiles() {
  const roots = [
    join(CLI_ROOT, 'src'),
    join(CLI_ROOT, 'bin'),
    ...bundledSourceDirs().map((d) => join(REPO_ROOT, d))
  ];
  const files = roots.flatMap((r) => [...walk(r)]);
  files.push(join(CLI_ROOT, 'README.md'), join(CLI_ROOT, 'standards-registry.json'));
  return files.filter((f) => existsSync(f));
}

describe('no bare `uds` through a package runner in anything UDS ships', () => {
  it('the pattern recognises the forms it exists to catch, and not the safe ones', () => {
    for (const bad of [
      'npx uds check', 'npx uds', 'npx -y uds check', 'npx --yes uds@latest init', 'pnpm dlx uds check',
      'bunx uds lint', 'yarn dlx uds update', 'npm exec uds check', 'npm exec -- uds', 'echo x && npx uds check',
      "Use 'npx uds init' or 'npx uds update' to modify."
    ]) expect(BARE_UDS_RUNNER.test(bad), bad).toBe(true);
    for (const ok of [
      'npx universal-dev-standards init', 'universal-dev-standards check', 'uds check', 'npx husky', 'npx udsx',
      'npx -p universal-dev-standards uds check', 'pnpm exec vitest', 'npm exec vitest'
    ]) expect(BARE_UDS_RUNNER.test(ok), ok).toBe(false);
  });

  it('walks a real amount of the shipped tree (a guard that scans nothing passes forever)', () => {
    const dirs = bundledSourceDirs();
    // prepack.mjs must still list the directories this walk derives from it.
    expect(dirs.length).toBeGreaterThanOrEqual(5);
    for (const d of ['core', 'skills', 'ai']) expect(dirs).toContain(d);
    const { scanned } = scan(REPO_ROOT, shippedFiles());
    expect(scanned).toBeGreaterThan(500);
  });

  it('nothing shipped runs the bare name `uds` through a package runner', () => {
    const { hits } = scan(REPO_ROOT, shippedFiles());
    expect(hits, `Found a bare-runner form of \`uds\` — the npm registry's \`uds\` is not this project. ` +
      'Use `universal-dev-standards`, or resolve an installed binary (see buildPreCommitBlock in cli/src/utils/git-hooks.js):\n' +
      hits.join('\n')).toEqual([]);
  });

  it('every exclusion still excludes something (a dead exclusion is a hole waiting for a violation)', () => {
    const { excludedMatches } = scan(REPO_ROOT, shippedFiles());
    EXCLUSIONS.forEach((e, i) => {
      expect(excludedMatches.get(i), `exclusion no longer matches anything: ${e.reason}`).toBe(true);
    });
  });

  describe('mutation: the walker goes red on a planted violation, and only on real ones', () => {
    function tree(files) {
      const root = mkdtempSync(join(tmpdir(), 'uds-guard-'));
      for (const [rel, content] of Object.entries(files)) {
        mkdirSync(join(root, rel, '..'), { recursive: true });
        writeFileSync(join(root, rel), content);
      }
      return root;
    }
    const run = (files) => {
      const root = tree(files);
      try { return scan(root, [...walk(root)]).hits; } finally { rmSync(root, { recursive: true, force: true }); }
    };

    it('a string literal', () => {
      expect(run({ 'cli/src/a.js': "export const line = 'npx uds check';\n" })).toHaveLength(1);
    });
    it('a template literal, and one in a .mjs', () => {
      expect(run({ 'cli/src/a.mjs': 'export const l = `run: npx uds ${x}`;\n' })).toHaveLength(1);
    });
    it('a line inside a markdown or yaml file that would be copied', () => {
      expect(run({ 'core/x.md': 'Run `npx uds init`.\n' })).toHaveLength(1);
      expect(run({ 'templates/ci.yml': 'steps:\n  - run: npx uds check\n' })).toHaveLength(1);
    });
    it('a command nested in a function call, a default parameter, an object', () => {
      expect(run({ 'cli/src/b.js': "f({ hook: ['a', 'pnpm dlx uds check'] });\n" })).toHaveLength(1);
    });
    it('NOT a comment (it cannot reach an adopter)', () => {
      expect(run({ 'cli/src/c.js': "// used to write 'npx uds check'\n/* npx uds init */\nexport const ok = 1;\n" })).toEqual([]);
    });
    it('NOT the safe spelling', () => {
      expect(run({ 'cli/src/d.js': "export const l = 'npx universal-dev-standards init';\n" })).toEqual([]);
    });
    it('a script that does not parse fails loudly instead of being skipped', () => {
      expect(() => run({ 'cli/src/e.js': 'export const = ;\n' })).toThrow();
    });
    it('an excluded file is not reported, but the same text elsewhere is', () => {
      expect(run({ 'cli/src/utils/legacy-hook-migration.js': "export const l = 'npx uds check';\n" })).toEqual([]);
      expect(run({ 'cli/src/utils/other.js': "export const l = 'npx uds check';\n" })).toHaveLength(1);
      expect(run({ 'locales/zh-TW/CHANGELOG.md': 'wrote `npx uds check`\n' })).toEqual([]);
    });
  });
});
