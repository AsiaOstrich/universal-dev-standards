#!/usr/bin/env tsx
/**
 * `vibeops` Mention Classification Walker — XSPEC-389 R1
 * `vibeops` 提及分類走訪器
 *
 * ── The gap this closes ────────────────────────────────────────────────────
 * The rename evaluation (XSPEC-389) had exactly one number: "51 files mention
 * vibeops". Rename cost is the number of SUBSTANTIVE references — places where
 * a standard's content depends on the name — and that number had never been
 * measured. This walker walks every tracked file, finds every mention, and
 * reconciles each one against a hand-written classification
 * (scripts/vibeops-mention-classification.tsv). Classification is judgment;
 * the walker's job is to guarantee the judgment covers the whole population:
 *
 *   substantive + incidental + dead + unclassifiable == every hit walked
 *
 * The identity is enforced, not assumed. A hit with no TSV entry — or whose
 * line content no longer matches what was classified — is reported as
 * "unclassifiable" (判不了), never silently absorbed into a category
 * (XSPEC-385 R4).
 *
 * ── Denominator, walked rather than typed ──────────────────────────────────
 * The file population comes from `git ls-files`, not from a list in this
 * file. Exclusions are printed on every run with their rule and their count:
 * gitignored paths (the rule is .gitignore itself — this is what keeps
 * node_modules/ and the generated cli/bundled/ out), untracked files, and
 * binary files (NUL byte in content). locales/ mirrors are tracked and
 * therefore IN the population — they ship.
 *
 * ── Proving the query tool works before trusting "no hits" ─────────────────
 * Before reporting anything, the same scanner runs a control pattern
 * (`universal-dev-standards`) that is known to appear in hundreds of files.
 * If the control comes back under --control-min files, the scanner itself is
 * broken and the run exits 2 — "no hits" from a broken scanner is not clean.
 *
 * ── The probe must not count itself ────────────────────────────────────────
 * This script and its classification TSV both contain the target string —
 * committing them adds tracked files full of "vibeops" that exist only to
 * measure "vibeops". They are excluded from the walk, and the exclusion is
 * printed with what it redefines: the question changes from "every mention in
 * the repo" to "every mention outside the measurement apparatus itself". The
 * apparatus is renamed with the audit, so it is not part of rename cost. The
 * file names deliberately avoid the target string so that package.json's
 * registration line does not become a hit either.
 *
 * Usage:
 *   tsx scripts/check-name-mention-classification.ts            # walk + reconcile
 *   tsx scripts/check-name-mention-classification.ts --verbose  # also list every incidental hit
 *   tsx scripts/check-name-mention-classification.ts --root <dir>     # walk another git repo
 *   tsx scripts/check-name-mention-classification.ts --pattern <s>    # target substring (default: vibeops)
 *   tsx scripts/check-name-mention-classification.ts --control-pattern <s> --control-min <n>
 *   tsx scripts/check-name-mention-classification.ts --tsv <path>     # classification file
 *
 * Exit codes (three states — "could not measure" is not a pass):
 *   0 — every hit classified into the three categories; identity holds
 *   1 — findings: unclassifiable hits (no entry / content drifted) or stale
 *       TSV entries pointing at lines that no longer hit
 *   2 — could not measure: not a git repo, zero files walked, zero hits for
 *       the target pattern, control pattern under threshold, TSV unreadable
 *       or malformed, or the identity arithmetic itself fails
 *
 * Measured arms (2026-08-21):
 *   green      — 153 hits = 50 substantive + 101 incidental + 2 dead + 0
 *                unclassifiable, control 638 files          → exit 0
 *   empty root — --root <empty dir>: git ls-files fails     → exit 2
 *   dead ctrl  — --control-pattern zzz-not-in-this-repo-zzz:
 *                control 0 < 100, scanner declared broken   → exit 2
 */

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(SCRIPT_DIR, '..');

interface Args {
  root: string;
  pattern: string;
  controlPattern: string;
  controlMin: number;
  tsv: string;
  verbose: boolean;
}

function parseArgs(argv: string[]): Args {
  const args: Args = {
    root: REPO_ROOT,
    pattern: 'vibeops',
    controlPattern: 'universal-dev-standards',
    controlMin: 100,
    tsv: path.join(SCRIPT_DIR, 'name-mention-classification.tsv'),
    verbose: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--root') args.root = path.resolve(argv[++i]);
    else if (a === '--pattern') args.pattern = argv[++i];
    else if (a === '--control-pattern') args.controlPattern = argv[++i];
    else if (a === '--control-min') args.controlMin = Number(argv[++i]);
    else if (a === '--tsv') args.tsv = path.resolve(argv[++i]);
    else if (a === '--verbose') args.verbose = true;
    else {
      console.error(`unknown flag: ${a}`);
      process.exit(2);
    }
  }
  return args;
}

function git(root: string, ...gitArgs: string[]): string {
  return execFileSync('git', ['-C', root, ...gitArgs], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
}

interface Hit {
  file: string;
  line: number;
  text: string;
  occurrences: number;
}

interface TsvEntry {
  file: string;
  line: number;
  category: string;
  match: string;
  reason: string;
}

const CATEGORIES = ['substantive', 'incidental', 'dead'] as const;
const CATEGORY_LABEL: Record<string, string> = {
  substantive: '實質引用',
  incidental: '順帶提及',
  dead: '已死引用',
};

function main(): number {
  const args = parseArgs(process.argv.slice(2));
  const needle = args.pattern.toLowerCase();
  const controlNeedle = args.controlPattern.toLowerCase();

  // ── 1. Walk: population = git-tracked files ───────────────────────────────
  let fileList: string[];
  let ignoredEntries: string[];
  let untrackedCount: number;
  try {
    fileList = git(args.root, 'ls-files', '-z').split('\0').filter(Boolean);
    ignoredEntries = git(
      args.root, 'ls-files', '--others', '-i', '--exclude-standard', '--directory', '-z',
    ).split('\0').filter(Boolean);
    untrackedCount = git(args.root, 'ls-files', '--others', '--exclude-standard', '-z')
      .split('\0').filter(Boolean).length;
  } catch (e) {
    console.error(`✗ CANNOT MEASURE: git ls-files failed under ${args.root}`);
    console.error(`  ${(e as Error).message.split('\n')[0]}`);
    return 2;
  }
  if (fileList.length === 0) {
    console.error(`✗ CANNOT MEASURE: git ls-files returned 0 files under ${args.root} — an empty walk is not a clean walk`);
    return 2;
  }

  // ── 2. Scan every tracked file; binary files are excluded AND counted ─────
  // The probe must not count itself: this script and its TSV contain the
  // target string but exist only to measure it (see header).
  // Always exclude the in-repo apparatus, even when --tsv points elsewhere —
  // otherwise overriding --tsv silently puts the tracked TSV back into the
  // population it exists to measure.
  const probeFiles = new Set(
    [
      path.join(SCRIPT_DIR, 'check-name-mention-classification.ts'),
      path.join(SCRIPT_DIR, 'name-mention-classification.tsv'),
      args.tsv,
    ].map((p) => path.relative(args.root, p)),
  );
  let probeExcluded = 0;
  const hits: Hit[] = [];
  const controlFiles = new Set<string>();
  let binarySkipped = 0;
  const unreadable: string[] = [];
  let totalOccurrences = 0;
  for (const file of fileList) {
    if (probeFiles.has(file)) {
      probeExcluded++;
      continue;
    }
    let buf: Buffer;
    try {
      buf = readFileSync(path.join(args.root, file));
    } catch {
      unreadable.push(file);
      continue;
    }
    if (buf.includes(0)) {
      binarySkipped++;
      continue;
    }
    const lower = buf.toString('utf8').toLowerCase();
    if (lower.includes(controlNeedle)) controlFiles.add(file);
    if (!lower.includes(needle)) continue;
    const lines = lower.split('\n');
    const origLines = buf.toString('utf8').split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (!lines[i].includes(needle)) continue;
      const occurrences = lines[i].split(needle).length - 1;
      totalOccurrences += occurrences;
      hits.push({ file, line: i + 1, text: origLines[i], occurrences });
    }
  }

  console.log('═'.repeat(74));
  console.log(`vibeops mention classification — XSPEC-389 R1`);
  console.log('═'.repeat(74));
  console.log(`root walked            : ${args.root}`);
  console.log(`population rule        : git ls-files（受版控檔案；走訪，非列舉）`);
  console.log(`tracked files walked   : ${fileList.length}`);
  console.log(`excluded — gitignored  : ${ignoredEntries.length} 個路徑（規則＝.gitignore；含 node_modules/、產生物 cli/bundled/ 等）`);
  if (args.verbose) for (const p of ignoredEntries) console.log(`    ignored: ${p}`);
  console.log(`excluded — untracked   : ${untrackedCount} 個檔（規則＝不在 git ls-files 母體內）`);
  console.log(`excluded — binary      : ${binarySkipped} 個檔（規則＝內容含 NUL byte）`);
  console.log(`excluded — unreadable  : ${unreadable.length} 個檔（規則＝readFileSync 失敗，如 submodule/目錄項）${unreadable.length ? ' → ' + unreadable.join(', ') : ''}`);
  console.log(`excluded — probe       : ${probeExcluded} 個檔（量測器自身：本腳本＋分類 TSV）。這個排除把問題從`);
  console.log(`                         「全庫所有提及」改成「量測器以外的所有提及」——量測器與名稱同進退，不屬改名成本`);
  console.log(`NOT excluded           : locales/ 鏡像（受版控＝出貨面，一律在母體內）`);

  // ── 3. Control group: prove the scanner works before trusting its output ──
  console.log('─'.repeat(74));
  console.log(`control pattern        : "${args.controlPattern}" → ${controlFiles.size} 個檔命中（門檻 ≥ ${args.controlMin}）`);
  if (controlFiles.size < args.controlMin) {
    console.error(`✗ CANNOT MEASURE: 對照組只命中 ${controlFiles.size} 個檔（< ${args.controlMin}）——掃描器本身沒在工作，target 的任何數字都不可信`);
    return 2;
  }
  console.log(`  ✓ 掃描器自證通過`);

  if (hits.length === 0) {
    console.error(`✗ CANNOT MEASURE: pattern "${args.pattern}" 命中 0 行——本檢查的前提是母體非空；0 是「判不了」不是「乾淨」`);
    return 2;
  }

  // ── 4. Load classification TSV ────────────────────────────────────────────
  let tsvRaw: string;
  try {
    tsvRaw = readFileSync(args.tsv, 'utf8');
  } catch (e) {
    console.error(`✗ CANNOT MEASURE: 讀不到分類檔 ${args.tsv}`);
    console.error(`  ${(e as Error).message.split('\n')[0]}`);
    return 2;
  }
  const entries = new Map<string, TsvEntry>();
  for (const [idx, line] of tsvRaw.split('\n').entries()) {
    if (!line.trim() || line.startsWith('#')) continue;
    const cols = line.split('\t');
    if (cols.length !== 5) {
      console.error(`✗ CANNOT MEASURE: TSV 第 ${idx + 1} 行不是 5 欄（實得 ${cols.length} 欄）`);
      return 2;
    }
    const [file, lineNo, category, match, reason] = cols;
    if (!(CATEGORIES as readonly string[]).includes(category)) {
      console.error(`✗ CANNOT MEASURE: TSV 第 ${idx + 1} 行 category "${category}" 不在 {${CATEGORIES.join(', ')}}`);
      return 2;
    }
    if (!reason.trim()) {
      console.error(`✗ CANNOT MEASURE: TSV 第 ${idx + 1} 行沒有理由——沒有理由的分類無法被複核`);
      return 2;
    }
    const key = `${file}:${lineNo}`;
    if (entries.has(key)) {
      console.error(`✗ CANNOT MEASURE: TSV 重複鍵 ${key}`);
      return 2;
    }
    entries.set(key, { file, line: Number(lineNo), category, match, reason });
  }

  // ── 5. Reconcile hits against classifications ─────────────────────────────
  const classified: Record<string, Hit[]> = { substantive: [], incidental: [], dead: [] };
  const reasons = new Map<Hit, string>();
  const unclassifiable: { hit: Hit; why: string }[] = [];
  const seenKeys = new Set<string>();
  for (const hit of hits) {
    const key = `${hit.file}:${hit.line}`;
    const entry = entries.get(key);
    if (!entry) {
      unclassifiable.push({ hit, why: '無分類條目' });
      continue;
    }
    seenKeys.add(key);
    const normalized = hit.text.trim().replace(/\t/g, ' ');
    if (normalized !== entry.match) {
      unclassifiable.push({ hit, why: `行內容與分類時不同（分類時: "${entry.match.slice(0, 60)}…"）——舊分類不沿用` });
      continue;
    }
    classified[entry.category].push(hit);
    reasons.set(hit, entry.reason);
  }
  const stale = [...entries.keys()].filter((k) => !seenKeys.has(k));

  // ── 6. The identity, enforced ─────────────────────────────────────────────
  const s = classified.substantive.length;
  const i = classified.incidental.length;
  const d = classified.dead.length;
  const u = unclassifiable.length;
  console.log('─'.repeat(74));
  console.log(`分母（命中行數）        : ${hits.length}（出現次數 ${totalOccurrences}；分類單位＝行）`);
  console.log(`命中檔案數              : ${new Set(hits.map((h) => h.file)).size}`);
  console.log(`實質引用 (substantive)  : ${s}`);
  console.log(`順帶提及 (incidental)   : ${i}`);
  console.log(`已死引用 (dead)         : ${d}`);
  console.log(`判不了 (unclassifiable) : ${u}（不計入任何一類）`);
  console.log(`恆等式                  : ${s} + ${i} + ${d} + ${u} = ${s + i + d + u}，分母 = ${hits.length}`);
  if (s + i + d + u !== hits.length) {
    console.error(`✗ CANNOT MEASURE: 恆等式不成立——本腳本自己的算術壞了，任何分類數字都不可信`);
    return 2;
  }
  console.log(`  ✓ 恆等式成立`);

  // ── 7. The lists that matter ──────────────────────────────────────────────
  console.log('─'.repeat(74));
  console.log(`實質引用完整清單（改名成本的真正估計值）：`);
  for (const hit of classified.substantive) {
    console.log(`  ${hit.file}:${hit.line}`);
    console.log(`      ${reasons.get(hit)}`);
  }
  console.log('─'.repeat(74));
  console.log(`已死引用完整清單：`);
  for (const hit of classified.dead) {
    console.log(`  ${hit.file}:${hit.line}`);
    console.log(`      ${reasons.get(hit)}`);
  }
  if (args.verbose) {
    console.log('─'.repeat(74));
    console.log(`順帶提及完整清單：`);
    for (const hit of classified.incidental) {
      console.log(`  ${hit.file}:${hit.line} — ${reasons.get(hit)}`);
    }
  }
  if (u > 0) {
    console.log('─'.repeat(74));
    console.log(`✗ 判不了（需要人把分類補回 TSV）：`);
    for (const { hit, why } of unclassifiable) {
      console.log(`  ${hit.file}:${hit.line} — ${why}`);
      console.log(`      現行內容: ${hit.text.trim().slice(0, 100)}`);
    }
  }
  if (stale.length > 0) {
    console.log('─'.repeat(74));
    console.log(`✗ TSV 內指向已不存在命中的過期條目（需要人清理）：`);
    for (const k of stale) console.log(`  ${k}`);
  }

  console.log('═'.repeat(74));
  if (u > 0 || stale.length > 0) {
    console.log(`✗ FINDINGS: ${u} 筆判不了、${stale.length} 筆 TSV 過期條目`);
    return 1;
  }
  console.log(`✓ 全部 ${hits.length} 筆命中都有帶理由的分類：${CATEGORIES.map((c) => `${CATEGORY_LABEL[c]} ${classified[c].length}`).join('、')}`);
  return 0;
}

process.exit(main());
