#!/usr/bin/env node
/**
 * check-command-existence — XSPEC-383 R4
 *
 * 這道閘門存在的理由：
 *   2026-08-19 實測發現，UDS 出貨的指引裡有指令是根本不存在的：
 *   `uds install`（意近 `uninstall`）、`uds lint`（意近 `list`）、`uds sync`，
 *   外加旗標 `uds check --spec-size`、`uds spec create --boost`。
 *   落點包含兩處會把壞指令送到使用者面前的活程式碼——
 *   `cli/src/commands/quickstart.js`（自我描述是「快速找到對的指令」）與
 *   `cli/src/utils/integration-generator.js`（把指令寫進每個採用者的
 *   CLAUDE.md／AGENTS.md）。這些已在 465335e4 修掉。
 *
 *   同一天再查，`docs/user/CHEATSHEET.md`、`docs/reference/FEATURE-REFERENCE.md`、
 *   `skills/workflows/README.md`（以及各自的 zh-TW/zh-CN 鏡像）仍把 v6.0.0
 *   已移除的 `uds workflow` 當作現行指令展示——而 `docs/MIGRATION-v6.md` 自己
 *   給的收尾 grep（`grep -rn "uds start\|uds workflow\|uds flow\|uds sweep"`）
 *   從未真的被跑過。`ai/standards/developer-memory.ai.yaml` 也提到
 *   `uds memory ...`，但那從來不是一個真指令。
 *
 *   「我們叫別人跑的指令是否真的存在」這個面，在此之前零個檢查。這支腳本就是那個檢查。
 *
 * 為什麼 `--help` 不能拿來當存在性探針：
 *   commander 對未知的頂層或巢狀指令一律印出**通用說明**而不是報錯
 *   （`uds flow --help` 印出跟 `uds --help` 一樣的頂層清單，exit 0）。
 *   `uds lint`／`uds sync` 就是這樣在第一輪存活下來的。
 *   正確探針是 `uds <path...> --definitely-not-a-real-flag`，
 *   找輸出裡的 `unknown command '<segment>'`；旗標存在性則找
 *   `unknown option '--<flag>'`。兩者皆已針對本 CLI（commander v15）實測確認
 *   （見下方 probeCommand / probeFlag 的實測依據）。
 *
 * 旗標探針為何要接兩個 sentinel、不是一個：
 *   若目標旗標本身是「吃值」的（如 `--scope <scope>`），單一 sentinel
 *   `uds spec create --scope --sentinel` 會被 commander 當成 `--scope` 的值吃掉，
 *   若此時該指令剛好沒有其他必填的位置參數，就會**真的執行下去**。
 *   接兩個 sentinel（`--scope --sentinel-a --sentinel-b`）保證無論目標旗標
 *   吃不吃值，第二個 sentinel 一定會被當成一個新選項解析，
 *   在 commander 的 arg-parsing 階段就以 `unknown option` 中止——
 *   不曾進到任何 action handler，因此沒有副作用風險。已實測 boolean 與
 *   value-taking 兩種旗標皆在此設計下安全中止。
 *
 * 它刻意做的幾件事（沿用 check-module-reachability.mjs 的慣例）：
 *   1. **走訪並排除，不用檔名白名單。** 排除規則寫在 FILE_EXCLUSIONS／
 *      MATCH_EXCLUSIONS，且每一條都印出自己排除了幾個。
 *   2. **成功時也印分母**——掃了哪些目錄、各自命中幾個、去重後幾個。
 *   3. **佔位符（`{lang}`、`<intent>`、`$VAR`）不猜測、不當真值執行，
 *      計數為「無法判定」並印出，不吞掉。**
 *   4. **配基線 ＋ 到期日。** 目前基線是空的——找到的殘留壞指令已在同一次
 *      commit 修掉，沒有「先不處理」的項目。基線機制仍保留，供未來若出現
 *      需要人工判斷的邊界案例時使用。
 *   5. **`--self-test` 三臂**：綠（現況通過）／紅（塞一個
 *      `uds definitelynotacommand` 進真實檔案，證明會被抓到，測完刪除）／
 *      分母（走訪數 > 0）。
 *
 * 用法：
 *   node cli/scripts/check-command-existence.mjs             # 檢查
 *   node cli/scripts/check-command-existence.mjs --json      # 機器可讀
 *   node cli/scripts/check-command-existence.mjs --self-test # 證明它能紅也能綠
 *
 * 結束碼三態——「沒有壞指令」與「掃不動」必須分得開：
 *   0  掃完，沒有（新增的）不存在指令／旗標
 *   1  掃完，找到不存在的指令／旗標，或基線已過期
 *   2  掃不動（來源目錄不見、uds 入口不存在、無法建立探針用暫存目錄）——**這不是綠燈**
 */

import {
  readFileSync,
  existsSync,
  readdirSync,
  statSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
  unlinkSync,
} from 'node:fs';
import { join, resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';

const HERE = dirname(fileURLToPath(import.meta.url));
const CLI_ROOT = resolve(HERE, '..');
const REPO_ROOT = resolve(CLI_ROOT, '..');
const UDS_BIN = join(CLI_ROOT, 'bin', 'uds.js');

const args = process.argv.slice(2);
const JSON_OUT = args.includes('--json');
const SELF_TEST = args.includes('--self-test');

function fail(msg) {
  console.error(`[cmd-existence] FATAL: ${msg}`);
  process.exit(2);
}

if (!existsSync(UDS_BIN)) fail(`找不到 CLI 入口 ${UDS_BIN} —— 沒有入口就無從探測`);

/**
 * 掃描來源。範圍由本閘門自行決定（XSPEC-383 R4 明文授權），理由逐一寫在旁邊。
 * 每個來源掃完都會印出：走訪幾個檔、排除幾個（依規則）、實際內容掃描幾個、
 * 命中幾個 `uds <cmd>` 樣式。
 */
const SOURCES = [
  { id: 'core', dir: 'core', ext: /\.md$/, kind: 'markdown', why: '標準本文，使用者最常照著抄的指令來源' },
  { id: 'locales', dir: 'locales', ext: /\.md$/, kind: 'markdown', why: '翻譯鏡像；壞指令常見的漂移點——canonical 修了、鏡像沒跟上' },
  { id: 'ai-standards', dir: 'ai/standards', ext: /\.ai\.yaml$/, kind: 'yaml', why: '機器可讀標準，AI 會直接把裡面的指令當事實執行' },
  { id: 'cli-src', dir: 'cli/src', ext: /\.m?js$/, kind: 'js', why: '活程式碼——quickstart.js／integration-generator.js 就是本次事故的落點' },
  { id: 'skills', dir: 'skills', ext: /\.md$/, kind: 'markdown', why: 'Skill 說明文件，同樣會被 AI 讀入當成可執行指引' },
  { id: 'docs', dir: 'docs', ext: /\.md$/, kind: 'markdown', why: '使用者手冊/速查表，CHEATSHEET.md 與 FEATURE-REFERENCE.md 都在這裡' },
  {
    id: 'repo-root',
    dir: '.',
    ext: /\.md$/,
    kind: 'markdown',
    shallow: true,
    why: 'repo 根目錄的 README/CONTRIBUTING 等——GitHub 上第一眼看到的頁面，也踩過同一個 uds config --lang 錯誤（不遞迴，避免與上面已涵蓋的子目錄重複計數）',
  },
];

/**
 * 檔案層級排除規則。全部是「角色」判準（路徑樣式），不是檔名清單。
 * 這些檔案的存在目的就是記錄「曾經存在、現在不存在」的指令——
 * 拿現在的存在性去檢查它們，等於要求歷史文件說謊。
 */
const FILE_EXCLUSIONS = [
  {
    id: 'changelog',
    why: 'CHANGELOG 記錄的是過去式；驗證「現在還存不存在」違背 changelog 的功能本身',
    match: (rel) => /(^|\/)CHANGELOG\.md$/.test(rel),
  },
  {
    id: 'migration-guide',
    why: 'migration guide 的整份文件就是在列舉「已移除的指令，教你怎麼改」——那些指令本來就該探測為不存在',
    match: (rel) => /(^|\/)MIGRATION-v\d+\.md$/.test(rel),
  },
  {
    id: 'spec-archive',
    why: 'docs/specs/ 是 UDS 自己的 SDD 規格封存（多數標 Status: Archived），記錄的是原始設計時點的指令面，不是現行 CLI 表面',
    match: (rel) => /(^|\/)docs\/specs\//.test(rel),
  },
  {
    id: 'dated-archive',
    why: 'docs/archive/ 下是加了日期戳的舊版手冊快照，本質與 changelog 相同',
    match: (rel) => /(^|\/)docs\/archive\//.test(rel),
  },
];

/**
 * 比對層級排除規則（目前只用在 .ai.yaml）。
 * developer-memory.ai.yaml 在 `not_needed:` 鍵下寫了
 * `"CLI commands (uds memory ...) — core operations require LLM intelligence"`——
 * 這是明講「我們決定不做這個」，不是在教人跑一個真指令。
 * 判準：往回找縮排更淺的最近一個 YAML key，如果那個 key 的名字屬於
 * 「否定/拒絕」語意類（not_needed / rejected / deferred / avoid / removed / …），
 * 這個比對就不算數。
 */
const NEGATION_YAML_KEY = /^(not_needed|rejected|deferred|avoided?|anti[-_]?patterns?|counter[-_]?examples?|removed|deprecated|forbidden|do_not|bad_examples?|wrong|superseded)s?$/i;

/**
 * 同行否定語意規則（跨 markdown / yaml / js 通用）。
 * `core/developer-memory.md` 用表格明講「CLI commands (`uds memory ...`) | **Not needed**」——
 * 否定詞跟指令樣式在同一行,這是最常見、最好偵測的「刻意反例」形狀。
 * 判準是關鍵詞清單，不是逐檔白名單；命中會計數並在報告中列出規則本身命中了幾次。
 */
const NEGATION_LINE_PATTERN =
  /\b(not[\s_-]?needed|never needed|no longer (exists|supported|works)|not a (real|valid) command|there is no|does not exist|doesn'?t exist|removed in v?\d|deprecated|rejected|superseded|contradicts|forbidden)\b|不需要|永遠不需要|永不需要|已移除|已棄用|已弃用|拒絕採用|拒绝采用|矛盾|不存在/i;

function findEnclosingYamlKey(lines, matchLineIdx) {
  const line = lines[matchLineIdx];
  const indent = (line.match(/^(\s*)/) ?? ['', ''])[1].length;
  for (let i = matchLineIdx - 1; i >= 0; i--) {
    const l = lines[i];
    if (!l.trim()) continue;
    const ind = (l.match(/^(\s*)/) ?? ['', ''])[1].length;
    if (ind < indent) {
      const m = l.match(/^\s*([a-zA-Z_][\w-]*):\s*(#.*)?$/);
      return m ? m[1] : null;
    }
  }
  return null;
}

/** 全域忽略的旗標：commander 對每個指令都自動加，且 --help 短路探針本身（見檔頭說明），沒有測的意義。 */
const UNIVERSAL_FLAGS = new Set(['--help', '--version']);

/**
 * 把一段以 "uds " 開頭的文字解析成 { path, flags, undecidable }。
 *   - path：最多兩個小寫 kebab-case 詞（頂層指令＋一層子指令）
 *   - flags：`--xxx` 樣式的長旗標（跳過 --help/--version）
 *   - undecidable：路徑第一個詞就是變數/佔位符（`{lang}`、`<intent>`、`$VAR`），
 *     無法判定要測哪個指令 —— 計數但不探測
 * 回傳 null 代表這段文字裡沒有可判定也不需判定的東西（例如單獨的 "uds"）。
 */
function parseCommandSpan(segment) {
  const rest = segment.replace(/^uds\b/, '').trim();
  if (!rest) return null;

  const tokens = rest.split(/\s+/).filter(Boolean);
  const path = [];
  const flags = new Set();
  let pathClosed = false;
  let undecidable = false;

  for (const tok of tokens) {
    const flagMatch = tok.match(/^(--[a-zA-Z][\w-]*)/);
    if (flagMatch) {
      if (!UNIVERSAL_FLAGS.has(flagMatch[1])) flags.add(flagMatch[1]);
      pathClosed = true;
      continue;
    }
    if (tok === '-h' || tok === '-V') {
      pathClosed = true;
      continue;
    }
    if (!pathClosed && path.length < 2 && /^[a-z][a-z0-9-]*$/.test(tok)) {
      path.push(tok);
      continue;
    }
    if (path.length === 0 && /^[$\{<]/.test(tok)) undecidable = true;
    pathClosed = true;
  }

  if (path.length === 0 && flags.size === 0 && !undecidable) return null;
  return { path, flags: [...flags], undecidable };
}

/** 只列出 dir 直屬子檔（不遞迴），符合 ext 的部分。用於 repo-root 來源,避免跟其他已涵蓋的子目錄重複。 */
function walkShallow(dir, ext) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) continue;
    if (ext.test(entry.name)) out.push(relative(REPO_ROOT, join(dir, entry.name)));
  }
  return out;
}

/** 走訪 dir 底下符合 ext 的檔案，回傳相對 REPO_ROOT 的路徑陣列。 */
function walk(dir, ext, out = []) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'coverage') continue;
      walk(full, ext, out);
    } else if (ext.test(entry.name)) {
      out.push(relative(REPO_ROOT, full));
    }
  }
  return out;
}

/** 從 markdown 抽取：fenced code block 中以 uds 開頭的行 ＋ inline code span `uds ...`。 */
function extractMarkdown(text) {
  const found = [];

  // Fenced code blocks
  const fenceRe = /```[a-zA-Z]*\n([\s\S]*?)```/g;
  let fm;
  while ((fm = fenceRe.exec(text))) {
    const blockStart = fm.index;
    const block = fm[1];
    const blockLines = block.split('\n');
    let offset = 0;
    for (const rawLine of blockLines) {
      let line = rawLine.trim().replace(/^\$\s+/, '').replace(/^npx\s+/, '');
      if (/^uds(\s|$)/.test(line)) {
        // 切掉 shell 串接符號之後的部分,只留第一段指令
        const cut = line.search(/\s(&&|\|\||;)\s|\s#\s/);
        const seg = cut > -1 ? line.slice(0, cut) : line;
        const lineNo = text.slice(0, blockStart + offset).split('\n').length;
        found.push({ segment: seg, lineNo, lineText: rawLine.trim() });
      }
      offset += rawLine.length + 1;
    }
  }

  // Inline code spans, 但跳過 fenced block 內部(已處理),避免重複
  const withoutFences = text.replace(/```[a-zA-Z]*\n[\s\S]*?```/g, (m) => '\n'.repeat((m.match(/\n/g) ?? []).length));
  const fenceFreeLines = withoutFences.split('\n');
  const inlineRe = /`([^`\n]+)`/g;
  let im;
  while ((im = inlineRe.exec(withoutFences))) {
    const content = im[1].trim();
    if (!/^uds(\s|$)/.test(content)) continue;
    const lineNo = withoutFences.slice(0, im.index).split('\n').length;
    // lineText 要用「整行原文」不是只有反引號內容——同行否定語意判準需要看到整行
    // （例：markdown 表格「| `uds workflow` | **Not needed** | ... |」，否定詞跟指令在同一行）
    found.push({ segment: content, lineNo, lineText: fenceFreeLines[lineNo - 1] ?? content });
  }

  return found;
}

/** 從 .ai.yaml 原始文字抽取：逐行找 `\buds\b` 出現處,切到下一個引號/括號或行尾。 */
function extractYamlLike(text) {
  const lines = text.split('\n');
  const found = [];
  const udsRe = /\buds(?=\s)/g;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    udsRe.lastIndex = 0;
    let m;
    while ((m = udsRe.exec(line))) {
      let seg = line.slice(m.index);
      const endMatch = seg.slice(3).match(/["'`)]/);
      if (endMatch) seg = seg.slice(0, 3 + endMatch.index);
      found.push({ segment: seg.trim(), lineNo: i + 1, lineText: line.trim(), lineIdx: i });
    }
  }
  return { found, lines };
}

/** 從 JS 原始碼抽取：先剝註解(理由同 check-module-reachability.mjs——JSDoc 範例不是活指令),再逐行找 uds 開頭的字串內容。 */
function extractJs(text) {
  const stripped = text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  const lines = stripped.split('\n');
  const found = [];
  const udsRe = /\buds(?=\s)/g;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    udsRe.lastIndex = 0;
    let m;
    while ((m = udsRe.exec(line))) {
      let seg = line.slice(m.index);
      const endMatch = seg.slice(3).match(/["'`]/);
      if (endMatch) seg = seg.slice(0, 3 + endMatch.index);
      found.push({ segment: seg.trim(), lineNo: i + 1, lineText: line.trim() });
    }
  }
  return found;
}

/**
 * 對 uds CLI 送出探針。一律從隔離的暫存目錄執行(不用 repo cwd,也不用全域安裝的 uds),
 * 確保：(a) 測的是這個 commit 的程式碼、(b) 就算某個未知邊界情況真的滑過 arg-parsing
 * 執行到 action handler,也不會動到 repo 裡的任何檔案。
 */
let PROBE_CWD = null;
function ensureProbeCwd() {
  if (PROBE_CWD) return PROBE_CWD;
  try {
    PROBE_CWD = mkdtempSync(join(tmpdir(), 'uds-cmd-existence-'));
  } catch (e) {
    fail(`建立探針用暫存目錄失敗：${e.message}`);
  }
  return PROBE_CWD;
}

function runUds(extraArgs) {
  const cwd = ensureProbeCwd();
  const r = spawnSync('node', [UDS_BIN, ...extraArgs], {
    cwd,
    encoding: 'utf8',
    timeout: 10_000,
  });
  if (r.error) fail(`呼叫 uds CLI 失敗（${extraArgs.join(' ')}）：${r.error.message}`);
  return `${r.stdout ?? ''}${r.stderr ?? ''}`;
}

/** path 存在性探針。回傳 { exists, brokenSegment } */
const commandProbeCache = new Map();
function probeCommand(path) {
  const key = path.join(' ');
  if (commandProbeCache.has(key)) return commandProbeCache.get(key);
  const out = runUds([...path, '--definitely-not-a-real-flag-cmd-probe']);
  const m = out.match(/unknown command '([^']+)'/);
  const result = { exists: !m, brokenSegment: m ? m[1] : null, raw: out.trim().slice(0, 300) };
  commandProbeCache.set(key, result);
  return result;
}

/** flag 存在性探針(雙 sentinel,理由見檔頭)。只在呼叫端已確認 path 本身存在時才有意義。 */
const flagProbeCache = new Map();
function probeFlag(path, flag) {
  const key = `${path.join(' ')}|${flag}`;
  if (flagProbeCache.has(key)) return flagProbeCache.get(key);
  const out = runUds([...path, flag, '--definitely-not-a-real-flag-aaa', '--definitely-not-a-real-flag-bbb']);
  const exists = !out.includes(`unknown option '${flag}'`);
  const result = { exists, raw: out.trim().slice(0, 300) };
  flagProbeCache.set(key, result);
  return result;
}

/**
 * 基線：R4 落地當下已知、選擇暫不處理的殘留項目。
 * 目前是空的——本次找到的殘留壞指令都已在同一個 commit 修掉。
 * 機制保留是為了未來若出現需要人工判斷的邊界案例(而不是立刻能修)時使用。
 */
function loadBaseline() {
  const p = join(HERE, 'command-existence-baseline.json');
  if (!existsSync(p)) return { entries: [], expires: null, missing: true };
  try {
    const b = JSON.parse(readFileSync(p, 'utf8'));
    return { entries: b.entries ?? [], expires: b.expires ?? null, missing: false };
  } catch (e) {
    fail(`基線檔存在但解析失敗：${e.message} —— 這不是「沒有基線」，是讀不了基線`);
  }
}

function analyse() {
  const sourceStats = [];
  const allFindings = []; // { source, file, lineNo, lineText, kind: 'command'|'flag', target, brokenSegment }
  let undecidableTotal = 0;
  const uniqueCommandPaths = new Map(); // key -> path array
  const uniqueFlagChecks = new Map(); // key -> {path, flag}
  const pendingMatches = []; // { source, file, lineNo, lineText, path, flags }

  for (const src of SOURCES) {
    const absDir = join(REPO_ROOT, src.dir);
    const walked = src.shallow ? walkShallow(absDir, src.ext) : walk(absDir, src.ext);
    const excludedBy = Object.fromEntries(FILE_EXCLUSIONS.map((e) => [e.id, 0]));
    const scannedFiles = [];
    for (const rel of walked) {
      const rule = FILE_EXCLUSIONS.find((e) => e.match(rel));
      if (rule) {
        excludedBy[rule.id]++;
        continue;
      }
      scannedFiles.push(rel);
    }

    let rawMatchCount = 0;
    let matchExcluded = 0;
    let negationLineExcluded = 0;
    let negationKeyExcluded = 0;

    for (const rel of scannedFiles) {
      const full = join(REPO_ROOT, rel);
      const text = readFileSync(full, 'utf8');

      let rawFound = [];
      let lines = null;
      if (src.kind === 'markdown') {
        rawFound = extractMarkdown(text);
      } else if (src.kind === 'yaml') {
        const r = extractYamlLike(text);
        rawFound = r.found;
        lines = r.lines;
      } else if (src.kind === 'js') {
        rawFound = extractJs(text);
      }

      for (const item of rawFound) {
        const parsed = parseCommandSpan(item.segment);
        if (!parsed) continue;
        rawMatchCount++;

        if (NEGATION_LINE_PATTERN.test(item.lineText)) {
          matchExcluded++;
          negationLineExcluded++;
          continue;
        }

        if (src.kind === 'yaml' && item.lineIdx !== undefined) {
          const key = findEnclosingYamlKey(lines, item.lineIdx);
          if (key && NEGATION_YAML_KEY.test(key)) {
            matchExcluded++;
            negationKeyExcluded++;
            continue;
          }
        }

        if (parsed.undecidable) {
          undecidableTotal++;
          continue;
        }
        if (parsed.path.length === 0) continue; // 只有旗標沒有路徑的殘餘,不判定

        const pKey = parsed.path.join(' ');
        uniqueCommandPaths.set(pKey, parsed.path);
        for (const f of parsed.flags) {
          uniqueFlagChecks.set(`${pKey}|${f}`, { path: parsed.path, flag: f });
        }

        pendingMatches.push({
          source: src.id,
          file: rel,
          lineNo: item.lineNo,
          lineText: item.lineText,
          path: parsed.path,
          flags: parsed.flags,
        });
      }
    }

    sourceStats.push({
      id: src.id,
      dir: src.dir,
      why: src.why,
      walked: walked.length,
      excludedBy,
      excludedTotal: Object.values(excludedBy).reduce((a, b) => a + b, 0),
      scanned: scannedFiles.length,
      rawMatchCount,
      matchExcluded,
      negationLineExcluded,
      negationKeyExcluded,
    });
  }

  // 探測所有去重後的 path
  for (const [, path] of uniqueCommandPaths) probeCommand(path);
  // path 存在時才有意義去測它的旗標
  for (const [, { path, flag }] of uniqueFlagChecks) {
    const cmdResult = commandProbeCache.get(path.join(' '));
    if (cmdResult && cmdResult.exists) probeFlag(path, flag);
  }

  // 產生 findings
  for (const m of pendingMatches) {
    const pKey = m.path.join(' ');
    const cmdResult = commandProbeCache.get(pKey);
    if (!cmdResult.exists) {
      allFindings.push({
        source: m.source,
        file: m.file,
        lineNo: m.lineNo,
        lineText: m.lineText,
        kind: 'command',
        target: `uds ${pKey}`,
        brokenSegment: cmdResult.brokenSegment,
      });
      continue; // path 本身就壞了,不用再報旗標
    }
    for (const f of m.flags) {
      const flagResult = flagProbeCache.get(`${pKey}|${f}`);
      if (flagResult && !flagResult.exists) {
        allFindings.push({
          source: m.source,
          file: m.file,
          lineNo: m.lineNo,
          lineText: m.lineText,
          kind: 'flag',
          target: `uds ${pKey} ${f}`,
          brokenSegment: f,
        });
      }
    }
  }

  return {
    sourceStats,
    uniqueCommandPathCount: uniqueCommandPaths.size,
    uniqueFlagCheckCount: uniqueFlagChecks.size,
    undecidableTotal,
    findings: allFindings,
  };
}

function findingKey(f) {
  return `${f.file}:${f.lineNo}:${f.target}`;
}

function report(r) {
  const baseline = loadBaseline();
  const baseSet = new Set(baseline.entries.map((e) => e.key));
  const newFindings = r.findings.filter((f) => !baseSet.has(findingKey(f)));
  const baselineFixed = baseline.entries.filter(
    (e) => !r.findings.some((f) => findingKey(f) === e.key),
  );

  const today = new Date().toISOString().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(today)) fail(`日期取得異常：'${today}'`);
  const baselineExpired = Boolean(baseline.expires && baseline.expires < today);

  const totalWalked = r.sourceStats.reduce((a, s) => a + s.walked, 0);
  const totalScanned = r.sourceStats.reduce((a, s) => a + s.scanned, 0);
  const totalRaw = r.sourceStats.reduce((a, s) => a + s.rawMatchCount, 0);

  if (JSON_OUT) {
    console.log(JSON.stringify({ ...r, newFindings, baselineFixed, baselineExpired, totalWalked, totalScanned, totalRaw }, null, 2));
    return newFindings.length > 0 || baselineExpired ? 1 : 0;
  }

  console.log(`[cmd-existence] 掃描來源（${SOURCES.length} 個目錄）：`);
  for (const s of r.sourceStats) {
    console.log(
      `  ${s.dir.padEnd(14)} 走訪 ${s.walked} 檔 → 掃描 ${s.scanned}（排除 ${s.excludedTotal}）` +
        ` → 命中 ${s.rawMatchCount} 個 uds <cmd> 樣式`,
    );
    for (const rule of FILE_EXCLUSIONS) {
      if (s.excludedBy[rule.id] > 0) console.log(`      排除 [${rule.id}]：${s.excludedBy[rule.id]} 個 —— ${rule.why}`);
    }
    if (s.negationLineExcluded > 0) console.log(`      比對排除（同行否定語意）：${s.negationLineExcluded} 個`);
    if (s.negationKeyExcluded > 0) console.log(`      比對排除（否定語意 YAML key）：${s.negationKeyExcluded} 個`);
  }
  console.log(
    `[cmd-existence] 合計：走訪 ${totalWalked} 檔、掃描 ${totalScanned} 檔、命中 ${totalRaw} 個樣式 → ` +
      `去重後 ${r.uniqueCommandPathCount} 個指令路徑、${r.uniqueFlagCheckCount} 個旗標組合`,
  );
  if (r.undecidableTotal > 0) {
    console.log(`[cmd-existence] ⚠ ${r.undecidableTotal} 個樣式含變數/佔位符（{lang}／<intent>／$VAR），無法判定，未探測`);
  }

  console.log(`[cmd-existence] 基線 ${baseline.entries.length} 個${baselineExpired ? ' —— ⏰ 已過期' : ''}`);
  if (baselineFixed.length > 0) {
    console.log(`[cmd-existence] ✓ 基線中有 ${baselineFixed.length} 個已修好，請從基線移除：`);
    for (const f of baselineFixed) console.log(`               - ${f.key}`);
  }

  if (baselineExpired) {
    console.log(
      `\n[cmd-existence] ✗ 基線已於 ${baseline.expires} 到期。到期不代表出事，代表「先不處理」的判斷該重做一次。`,
    );
    return 1;
  }

  if (newFindings.length === 0) {
    console.log(`[cmd-existence] ✓ 沒有找到不存在的指令或旗標（既有 ${r.findings.length} 個全部在基線內）`);
    return 0;
  }

  console.log(`\n[cmd-existence] ✗ 找到 ${newFindings.length} 個不存在的指令／旗標：`);
  for (const f of newFindings) {
    console.log(`  ✗ ${f.file}:${f.lineNo}  ${f.target}`);
    console.log(`      ${f.kind === 'command' ? `unknown command '${f.brokenSegment}'` : `unknown option '${f.brokenSegment}'`}`);
    console.log(`      來源行：${f.lineText.slice(0, 120)}`);
  }
  console.log('\n  修法：改成真的指令／拿掉這段範例／若是刻意的歷史紀錄，加進 FILE_EXCLUSIONS 或 NEGATION_YAML_KEY（不要加檔名清單）。');
  return 1;
}

/**
 * 自測三臂：
 *   分母臂：走訪數 > 0，且每個來源都印出命中數
 *   綠臂：現況（在正確修完之後）通過
 *   紅臂：往一個真實會被掃到的檔案塞一個 `uds definitelynotacommand`，
 *         證明完整流程（走訪→抽取→探測→回報）真的抓得到，測完刪除
 * 外加一個獨立於三臂之外、更基礎的對照組：探針本身對「已知一定不存在」的名字
 * 是否老實回報不存在——這是「工具在工作」的前提，三臂的紅臂建立在它之上。
 */
function selfTest() {
  let pass = true;

  // 對照組：探針機制本身有沒有在工作
  const control = probeCommand(['definitelynotacommand']);
  const controlOk = control.exists === false && control.brokenSegment === 'definitelynotacommand';
  console.log(`  ${controlOk ? '✓' : '✗'} 對照組：探針對已知不存在的指令名回報「不存在」`);
  pass &&= controlOk;

  const controlKnownGood = probeCommand(['check']);
  const controlGoodOk = controlKnownGood.exists === true;
  console.log(`  ${controlGoodOk ? '✓' : '✗'} 對照組：探針對已知存在的指令名（check）回報「存在」`);
  pass &&= controlGoodOk;

  // 分母臂
  const before = analyse();
  const totalWalked = before.sourceStats.reduce((a, s) => a + s.walked, 0);
  const denomOk = totalWalked > 0 && before.sourceStats.every((s) => s.walked >= 0);
  console.log(`  ${denomOk ? '✓' : '✗'} 分母臂：走訪 ${totalWalked} 個檔案（跨 ${before.sourceStats.length} 個來源）`);
  pass &&= denomOk;

  // 綠臂：現況（排除基線後）應該乾淨
  const baseline = loadBaseline();
  const baseSet = new Set(baseline.entries.map((e) => e.key));
  const newFindings = before.findings.filter((f) => !baseSet.has(findingKey(f)));
  const greenOk = newFindings.length === 0;
  console.log(`  ${greenOk ? '✓' : '✗'} 綠臂：現況沒有基線外的殘留壞指令（找到 ${newFindings.length} 個）`);
  if (!greenOk) for (const f of newFindings) console.log(`      ✗ ${f.file}:${f.lineNo} ${f.target}`);
  pass &&= greenOk;

  // 紅臂：塞一個真的壞指令進真實被掃到的檔案,證明整條流程真的會紅
  const probeFile = join(REPO_ROOT, 'docs', '.command-existence-selftest.md');
  let redOk = false;
  try {
    writeFileSync(
      probeFile,
      '# Self-test fixture for check-command-existence.mjs --self-test\n\n' +
        'Auto-generated, auto-deleted. If you see this file outside a test run, delete it.\n\n' +
        '`uds definitelynotacommand`\n',
      'utf8',
    );
    const withInjected = analyse();
    const injectedFindings = withInjected.findings.filter(
      (f) => f.file === 'docs/.command-existence-selftest.md' && f.kind === 'command',
    );
    redOk = injectedFindings.length === 1 && injectedFindings[0].brokenSegment === 'definitelynotacommand';
  } finally {
    if (existsSync(probeFile)) unlinkSync(probeFile);
  }
  console.log(`  ${redOk ? '✓' : '✗'} 紅臂：塞入 \`uds definitelynotacommand\` 到真實掃描路徑下的檔案，被完整流程抓到（已刪除測試檔）`);
  pass &&= redOk;

  console.log(pass ? '[cmd-existence] 自測通過' : '[cmd-existence] 自測失敗');
  return pass ? 0 : 2;
}

let exitCode;
try {
  exitCode = SELF_TEST ? selfTest() : report(analyse());
} finally {
  if (PROBE_CWD && existsSync(PROBE_CWD)) {
    try {
      rmSync(PROBE_CWD, { recursive: true, force: true });
    } catch {
      // 清不掉暫存目錄不影響檢查結果本身,不因此改變 exit code
    }
  }
}
process.exit(exitCode);
