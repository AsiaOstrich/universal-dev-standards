#!/usr/bin/env tsx
/**
 * Reference-only disclosure gate
 * 「僅供參考」揭露閘門
 *
 * Seven `core/*.md` standards had their `.ai.yaml` removed in 6.0.0 and are no
 * longer installed by `uds init` / `uds update`. The files were deliberately
 * kept as reference documents for the adoption layer — a reasonable decision,
 * recorded in `docs/MIGRATION-v6.md` §2 and in the machine-readable list at
 * `scripts/reference-only-standards.json`.
 *
 * The gap this gate closes: **none of the seven said so in its own text.**
 * A migration guide is read once at upgrade time; `core/` is read continuously,
 * by people and by agents walking the directory to answer "what standards does
 * UDS have". They counted every file, including the ones that have never been
 * installed since 6.0.0. This is the failure shape where something is present,
 * is not what it appears to be, and nothing in the artefact itself says so.
 *
 * Why the gate walks instead of iterating the list
 * ─────────────────────────────────────────────────
 * Checking only the seven names would make the next descoping repeat the same
 * silence: drop a registry entry, and nothing notices the orphaned document.
 * So the shipped surface is derived from `standards-registry.json` itself —
 * every `source.human` path any entry points at, at any nesting depth — and the
 * difference against `core/*.md` on disk IS the reference-only set. The
 * hand-maintained list is then checked **against** that difference in both
 * directions, so the list cannot quietly drift either.
 *
 * That is not hypothetical: the first run of this gate found `core/full-
 * coverage-testing.md` orphaned — not retired at all, but a live standard whose
 * registry entry pointed `source.human` at `core/testing-standards.md`. Under a
 * `--format human` install, adopters received `testing-standards.md` twice
 * under two standard ids and never received the full-coverage document.
 * `check-registry-completeness.ts` Check 2 could not see it: it passes an entry
 * if *either* the human or the ai path appears anywhere in the registry text,
 * and the ai path was there.
 *
 * Checks
 *   A  orphan on disk, not declared          → UNDECLARED_ORPHAN
 *   B  declared, but the registry ships it   → STALE_DECLARATION
 *   C  declared, no such file                → DECLARED_MISSING_FILE
 *   D  reference-only, no disclosure marker  → MISSING_DISCLOSURE
 *   E  the same, in a locale copy            → LOCALE_MISSING_DISCLOSURE
 *   F  shipped file carrying the marker      → STRAY_DISCLOSURE
 *
 * F is the reverse arm. A gate that only looks for a missing notice cannot tell
 * a correct notice from one left behind on a document that started shipping
 * again — and that second shape reads as green while the text lies.
 *
 * Exit codes
 *   0  every reference-only document discloses it, and nothing else claims to
 *   1  findings
 *   2  could not judge: self-test failed, registry unreadable, or zero core
 *      files walked. **This is not a green light.**
 *
 * Usage:
 *   tsx scripts/check-reference-only-disclosure.ts [--verbose]
 *   tsx scripts/check-reference-only-disclosure.ts --self-test
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = join(__dirname, '..');
const CORE_DIR = join(ROOT_DIR, 'core');
const LOCALES_DIR = join(ROOT_DIR, 'locales');
const REGISTRY_FILE = join(ROOT_DIR, 'cli', 'standards-registry.json');
const REFERENCE_ONLY_FILE = join(ROOT_DIR, 'scripts', 'reference-only-standards.json');

const args = new Set(process.argv.slice(2));
const VERBOSE = args.has('--verbose');
const SELF_TEST_ONLY = args.has('--self-test');

const RED = '\x1b[0;31m';
const GREEN = '\x1b[0;32m';
const YELLOW = '\x1b[1;33m';
const BLUE = '\x1b[0;34m';
const DIM = '\x1b[2m';
const NC = '\x1b[0m';

/**
 * The marker every reference-only document must carry. It is an HTML comment so
 * it survives rendering, and it is the addressable key — the prose around it may
 * be reworded or translated, this may not.
 */
const MARKER = '<!-- UDS:REFERENCE-ONLY';

type Verdict =
  | 'OK'
  | 'UNDECLARED_ORPHAN'
  | 'STALE_DECLARATION'
  | 'DECLARED_MISSING_FILE'
  | 'MISSING_DISCLOSURE'
  | 'STRAY_DISCLOSURE';

// ───────────────────────────────────────────────────────────────────────────
// Pure comparators — what the self-test proves are not vacuous.
// ───────────────────────────────────────────────────────────────────────────

/**
 * Does this document disclose that it is reference-only, in its header rather
 * than buried in the body? "Before the first `## ` heading" is the placement
 * rule: a notice further down is a notice nobody reading the top will see, and
 * a bare substring search would also match a document that merely *discusses*
 * reference-only standards.
 */
export function hasDisclosure(content: string): boolean {
  const lines = content.split('\n');
  for (const line of lines) {
    if (line.startsWith('## ')) return false;
    if (line.includes(MARKER)) return true;
  }
  return false;
}

/**
 * Classify one `core/*.md` against the shipped surface, the declared list and
 * its own text. Pure — no I/O — so it can be exercised synthetically.
 */
export function classify(input: {
  onDisk: boolean;
  shipped: boolean;
  declared: boolean;
  discloses: boolean;
}): Verdict {
  if (!input.onDisk) return input.declared ? 'DECLARED_MISSING_FILE' : 'OK';
  if (input.shipped) {
    if (input.declared) return 'STALE_DECLARATION';
    return input.discloses ? 'STRAY_DISCLOSURE' : 'OK';
  }
  if (!input.declared) return 'UNDECLARED_ORPHAN';
  return input.discloses ? 'OK' : 'MISSING_DISCLOSURE';
}

/** Every `source.human` path the registry points at, at any nesting depth. */
export function collectShippedHuman(registry: unknown): Set<string> {
  const out = new Set<string>();
  const walk = (node: unknown): void => {
    if (!node || typeof node !== 'object') return;
    const rec = node as Record<string, unknown>;
    const source = rec.source;
    if (typeof source === 'string') {
      out.add(source);
    } else if (source && typeof source === 'object') {
      const human = (source as Record<string, unknown>).human;
      if (typeof human === 'string') out.add(human);
    }
    for (const value of Object.values(rec)) {
      if (Array.isArray(value)) value.forEach(walk);
      else if (value && typeof value === 'object') walk(value);
    }
  };
  walk(registry);
  return out;
}

function selfTest(): { pass: boolean; log: string[] } {
  const log: string[] = [];
  let pass = true;

  const record = (name: string, ok: boolean, detail: string): void => {
    log.push(`  ${ok ? `${GREEN}[FIRED]${NC}` : `${RED}[DID NOT FIRE]${NC}`} ${name} ${DIM}${detail}${NC}`);
    if (!ok) pass = false;
  };

  // hasDisclosure — both directions, plus the two ways a naive substring
  // search would be wrong.
  const header = `# T\n\n${MARKER} since=6.0.0 -->\n> Reference only.\n\n## Overview\ntext\n`;
  const body = `# T\n\n## Overview\n${MARKER} since=6.0.0 -->\n`;
  const prose = '# T\n\n> This standard explains how reference-only documents work.\n\n## Overview\n';
  const cases: Array<{ name: string; content: string; expect: boolean }> = [
    { name: 'hasDisclosure: marker in the header', content: header, expect: true },
    { name: 'hasDisclosure: marker below the first section', content: body, expect: false },
    { name: 'hasDisclosure: prose about reference-only docs', content: prose, expect: false },
    { name: 'hasDisclosure: empty file', content: '', expect: false },
  ];
  for (const c of cases) {
    const got = hasDisclosure(c.content);
    record(c.name, got === c.expect, `(expected ${c.expect}, got ${got})`);
  }

  // classify — every verdict must be reachable, including the reverse arm.
  const classifyCases: Array<{ name: string; input: Parameters<typeof classify>[0]; expect: Verdict }> = [
    { name: 'classify: shipped, undeclared, silent', input: { onDisk: true, shipped: true, declared: false, discloses: false }, expect: 'OK' },
    { name: 'classify: retired, declared, discloses', input: { onDisk: true, shipped: false, declared: true, discloses: true }, expect: 'OK' },
    { name: 'classify: retired, declared, silent', input: { onDisk: true, shipped: false, declared: true, discloses: false }, expect: 'MISSING_DISCLOSURE' },
    { name: 'classify: orphaned and undeclared', input: { onDisk: true, shipped: false, declared: false, discloses: false }, expect: 'UNDECLARED_ORPHAN' },
    { name: 'classify: orphaned, undeclared, but disclosing', input: { onDisk: true, shipped: false, declared: false, discloses: true }, expect: 'UNDECLARED_ORPHAN' },
    { name: 'classify: ships again, declaration left behind', input: { onDisk: true, shipped: true, declared: true, discloses: true }, expect: 'STALE_DECLARATION' },
    { name: 'classify: ships, notice left behind (reverse arm)', input: { onDisk: true, shipped: true, declared: false, discloses: true }, expect: 'STRAY_DISCLOSURE' },
    { name: 'classify: declared, file deleted', input: { onDisk: false, shipped: false, declared: true, discloses: false }, expect: 'DECLARED_MISSING_FILE' },
  ];
  for (const c of classifyCases) {
    const got = classify(c.input);
    record(c.name, got === c.expect, `(expected ${c.expect}, got ${got})`);
  }

  // collectShippedHuman — nested option choices must be reached, and a
  // registry-shaped object with no human path must yield nothing.
  const nested = collectShippedHuman({
    standards: [
      { id: 'a', source: { human: 'core/a.md', ai: 'ai/standards/a.ai.yaml' } },
      { id: 'b', source: { ai: 'ai/standards/b.ai.yaml' } },
      { id: 'c', options: { lvl: { choices: [{ id: 'c1', source: { human: 'options/c/c1.md' } }] } } },
    ],
  });
  record('collectShippedHuman: top-level human path', nested.has('core/a.md'), `(set: ${[...nested].join(', ')})`);
  record('collectShippedHuman: nested option choice', nested.has('options/c/c1.md'), '(depth 4)');
  record('collectShippedHuman: ai-only entry contributes nothing', !nested.has('ai/standards/b.ai.yaml'), '(ai paths are not the human surface)');

  return { pass, log };
}

// ───────────────────────────────────────────────────────────────────────────
// Real scan
// ───────────────────────────────────────────────────────────────────────────

function cannotJudge(msg: string): never {
  console.error(`${RED}[reference-only] 判不了：${msg}${NC}`);
  console.error(`${RED}[reference-only] 這不是綠燈。${NC}`);
  process.exit(2);
}

function localeCopies(basename: string): string[] {
  if (!existsSync(LOCALES_DIR)) return [];
  const out: string[] = [];
  for (const locale of readdirSync(LOCALES_DIR)) {
    const rel = join('locales', locale, 'core', `${basename}.md`);
    if (existsSync(join(ROOT_DIR, rel))) out.push(rel);
  }
  return out.sort();
}

function main(): void {
  const self = selfTest();
  if (SELF_TEST_ONLY) {
    console.log(`${BLUE}[reference-only] 自測臂${NC}`);
    self.log.forEach((l) => console.log(l));
    console.log(self.pass ? `${GREEN}自測通過${NC}` : `${RED}自測失敗${NC}`);
    process.exit(self.pass ? 0 : 1);
  }
  if (!self.pass) {
    console.error(`${RED}[reference-only] 比較器自測失敗——建立在它上面的掃描不可信：${NC}`);
    self.log.forEach((l) => console.error(l));
    cannotJudge('comparator self-test failed');
  }

  let registry: unknown;
  try {
    registry = JSON.parse(readFileSync(REGISTRY_FILE, 'utf8'));
  } catch (error) {
    cannotJudge(`讀不到 standards-registry.json：${(error as Error).message}`);
  }

  let declared: string[];
  try {
    declared = JSON.parse(readFileSync(REFERENCE_ONLY_FILE, 'utf8')).referenceOnlyCore;
    if (!Array.isArray(declared)) throw new Error('referenceOnlyCore is not an array');
  } catch (error) {
    cannotJudge(`讀不到 reference-only-standards.json：${(error as Error).message}`);
  }

  const shippedHuman = collectShippedHuman(registry);
  if (shippedHuman.size === 0) cannotJudge('registry 裡一個 source.human 都沒有');

  if (!existsSync(CORE_DIR)) cannotJudge(`core/ 不存在：${CORE_DIR}`);
  const coreFiles = readdirSync(CORE_DIR).filter((f) => f.endsWith('.md')).sort();
  if (coreFiles.length === 0) cannotJudge('走訪到 0 份 core/*.md');

  const declaredSet = new Set(declared);
  const findings: Array<{ verdict: Verdict; file: string; note: string }> = [];
  let referenceOnlyCount = 0;

  for (const filename of coreFiles) {
    const basename = filename.replace(/\.md$/, '');
    const rel = `core/${filename}`;
    const content = readFileSync(join(CORE_DIR, filename), 'utf8');
    const shipped = shippedHuman.has(rel);
    const verdict = classify({
      onDisk: true,
      shipped,
      declared: declaredSet.has(basename),
      discloses: hasDisclosure(content),
    });

    if (verdict === 'OK') {
      if (!shipped) referenceOnlyCount += 1;
      if (VERBOSE) console.log(`  ${GREEN}[OK]${NC}       ${rel}${shipped ? '' : `${DIM} (reference-only, discloses it)${NC}`}`);
      continue;
    }

    const notes: Record<Exclude<Verdict, 'OK'>, string> = {
      UNDECLARED_ORPHAN:
        'registry 沒有任何條目的 source.human 指向它。要嘛補一筆 registry 條目，要嘛把它加進 scripts/reference-only-standards.json 並補揭露',
      STALE_DECLARATION:
        'registry 已經在出貨這份文件，但它仍被列為 reference-only。把它從 scripts/reference-only-standards.json 移除，並拿掉檔內的揭露',
      DECLARED_MISSING_FILE: '列在 reference-only 清單裡，但 core/ 找不到這個檔',
      MISSING_DISCLOSURE: `不出貨，而檔案本身沒說。在第一個 \`## \` 之前加上 \`${MARKER} ... -->\` 與一段可讀的說明`,
      STRAY_DISCLOSURE: '這份文件有在出貨，卻帶著「僅供參考」的揭露——文字在說謊',
    };
    findings.push({ verdict, file: rel, note: notes[verdict as Exclude<Verdict, 'OK'>] });
    if (!shipped) referenceOnlyCount += 1;
  }

  for (const basename of declared) {
    if (!existsSync(join(CORE_DIR, `${basename}.md`))) {
      findings.push({
        verdict: 'DECLARED_MISSING_FILE',
        file: `core/${basename}.md`,
        note: '列在 reference-only 清單裡，但 core/ 找不到這個檔',
      });
      continue;
    }
    // A translated copy that omits the notice is the same silence in another
    // language — and it is the copy zh-TW/zh-CN readers actually open.
    for (const rel of localeCopies(basename)) {
      if (!hasDisclosure(readFileSync(join(ROOT_DIR, rel), 'utf8'))) {
        findings.push({
          verdict: 'MISSING_DISCLOSURE',
          file: rel,
          note: `翻譯本也要帶揭露：在第一個 \`## \` 之前加上 \`${MARKER} ... -->\``,
        });
      }
    }
  }

  console.log('');
  console.log(`${BLUE}[reference-only] 走訪 ${coreFiles.length} 份 core/*.md；registry 指向其中 ${coreFiles.length - referenceOnlyCount} 份；差集 ${referenceOnlyCount} 份應為 reference-only${NC}`);
  console.log('');

  if (findings.length === 0) {
    console.log(`${GREEN}全部通過 ✓${NC}`);
    console.log(`  reference-only 文件：${referenceOnlyCount} 份，每一份都在自己的開頭說明了`);
    console.log(`  出貨中的文件：${coreFiles.length - referenceOnlyCount} 份，沒有一份帶著多餘的揭露`);
    console.log('');
    process.exit(0);
  }

  for (const f of findings) {
    console.log(`  ${RED}[${f.verdict}]${NC} ${f.file}`);
    console.log(`      ${YELLOW}${f.note}${NC}`);
  }
  console.log('');
  console.log(`${RED}findings: ${findings.length}${NC}`);
  console.log('');
  process.exit(1);
}

main();
