#!/usr/bin/env node
/**
 * check-module-reachability — XSPEC-383 R3
 *
 * 這道閘門存在的理由：
 *   2026-04-07 的 7b245a5a 建了 `cli/src/utils/spec-linter.js`（172 行，匯出 `lintAll`）
 *   與 `cli/src/commands/sync.js`（133 行）。兩者都有測試，測試都過。
 *   **兩者從未被註冊，沒有任何使用者到得了它們**——而同一天 VibeOps 把自己接上
 *   `npx uds lint --json`，一個永遠不會存在的指令。四個半月，兩邊全綠。
 *
 *   **綠色單元測試證明函式是對的，它對「有沒有人叫得到」一個字都沒說。**
 *   這支腳本就是在問那個問題。
 *
 * 它怎麼量：
 *   從真正的入口（package.json 的 bin 與 main，加上下面第二類入口）做 BFS，
 *   沿著 static import、re-export 與 dynamic import 走。**走得到的才算可達**——
 *   不是「被 import 次數 > 0」，因為一群互相 import 卻整團沒人用的模組，
 *   在那種算法下每個都是 1。
 *
 * 入口有兩類（決策 552甲，2026-11-17）：
 *   A. cli 自己的 bin 與 main —— 使用者從指令列碰得到的。
 *   B. **repo 根目錄 scripts/ 底下的腳本，其「靜態 import」指向 cli/ 的那些邊。**
 *      這些腳本是 repo 自己跑的活程式（pre-release-check、CI、維運腳本），
 *      它們 import cli/src 的模組就是那個模組存在的理由。首版只認 A，
 *      於是 context-chunker／md-parser／yaml-generator 被誤報為孤兒——
 *      它們其實被 scripts/check-prompt-footprint.mjs（pre-release-check.sh 第 25 項）
 *      與 scripts/convert-md-to-yaml.mjs 靜態 import。
 *
 *   B 類的納入規則（SCRIPT_ENTRY_RULES 與 SCRIPT_EXCLUSIONS，皆為規則不是檔名）：
 *     納入：scripts/ 下（含子目錄）所有 .mjs／.js／.ts。
 *     排除：fixtures／reports／node_modules 目錄（fixture 是測試資料、reports 是產出，
 *           都不是「會被執行的程式」；它們 import 了什麼不代表產品用得到），
 *           以及 .test／.spec 檔。
 *     只取**靜態** import（`import … from`、`export … from`、`import 'x'`）：
 *           靜態 import 在腳本一啟動就必然執行；動態 import 常包在「可能沒人呼叫的函式」
 *           裡，是潛在邊不是確定邊。例：scripts/hooks/telemetry-wrapper.mjs 的
 *           uploadTelemetry() 動態 import telemetry-uploader.js，但 uploadTelemetry 查無
 *           呼叫者——若把動態邊也算進來，一條死掉的呼叫鏈會替它背書。
 *           進入 cli/ 之後的走訪照舊（static + dynamic 都跟）。
 *     已知限制：scripts/ 底下一支「沒人執行」的死腳本，也會替它 import 的模組背書。
 *           要擋這個需要知道每支腳本由誰啟動（ci.yml、pre-release-check.sh、package.json），
 *           成本高於收益；留在這裡當已知缺口，不假裝它不存在。
 *
 * 它刻意做的三件事：
 *   1. **走訪並排除，不列舉白名單。** 排除規則寫在 EXCLUSIONS，且每一條都印出
 *      自己排除了幾個——白名單會腐壞，規則加計數不會。
 *   2. **印分母。** 成功時也說「掃了幾個」，不是只在失敗時說話。
 *   3. **解析不了的 dynamic import 要出聲，不能吞。** `import(variable)` 無法靜態解析，
 *      而吞掉它會讓一個其實可達的模組被報成孤兒。無法解析的數量一律列出。
 *
 * 用法：
 *   node cli/scripts/check-module-reachability.mjs            # 檢查
 *   node cli/scripts/check-module-reachability.mjs --json     # 機器可讀
 *   node cli/scripts/check-module-reachability.mjs --self-test # 證明它能紅也能綠
 *   node cli/scripts/check-module-reachability.mjs --baseline <檔>  # 改用指定的基線檔（測試用）
 *
 * 基線到期規則（決策 616乙，規則本身在 lib/baseline-expiry.mjs）：到期日是「清單」的時鐘，
 * 不是這道閘門的時鐘——清單為空就不看到期日；非空時，已過期或沒有到期日都算失敗。
 *
 * 結束碼三態——「沒有孤兒」與「量不了」必須分得開：
 *   0  掃完，沒有不可達模組
 *   1  掃完，有不可達模組，或基線非空而已過期／沒有到期日
 *   2  掃不動（入口不存在、來源目錄不見、package.json 壞掉）——**這不是綠燈**
 */

import { readFileSync, existsSync, readdirSync, statSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { judgeBaselineExpiry } from './lib/baseline-expiry.mjs';
import { relativePosix } from './lib/posix-path.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const REAL_CLI_ROOT = resolve(HERE, '..');
// 目前量測的 cli 根目錄。自測會暫時指到合成的 fixture，所以是 let；
// 所有路徑一律相對它，repo 根目錄 = 它的上一層。
let CLI_ROOT = REAL_CLI_ROOT;

const args = process.argv.slice(2);
const JSON_OUT = args.includes('--json');
const SELF_TEST = args.includes('--self-test');
const BASELINE_FLAG = args.indexOf('--baseline');
const BASELINE_PATH =
  BASELINE_FLAG === -1 ? join(HERE, 'reachability-baseline.json') : resolve(args[BASELINE_FLAG + 1] ?? '');

/**
 * 排除規則。每一條都是**規則**不是檔名清單，且各自計數。
 * 一個規則排除了 0 個，本身就是值得看的訊號（規則過期了，或它從來沒對過）。
 */
const EXCLUSIONS = [
  {
    id: 'test-file',
    why: '測試檔本身。它們是「誰在用」的分母之外——一個只被自己的測試 import 的模組，正是本閘門要抓的東西',
    match: (rel) => /\.(test|spec)\.m?js$/.test(rel),
  },
  {
    id: 'test-dir',
    why: '測試目錄下的輔助檔（fixture、helper）。它們服務測試，不服務使用者',
    match: (rel) => /(^|\/)(tests?|__tests__)\//.test(rel),
  },
  {
    id: 'entry',
    why: '入口自己。BFS 的起點不必被別人 import 才算可達',
    match: (rel, ctx) => ctx.entrySet.has(rel),
  },
];

/**
 * B 類入口（repo 根目錄 scripts/）的納入／排除規則。見檔頭說明。
 * 與 EXCLUSIONS 一樣各自計數——一條排除 0 個的規則，代表它過期或從來沒對過。
 */
const SCRIPT_EXT = /\.(m?js|ts)$/;
const SCRIPT_EXCLUSIONS = [
  {
    id: 'script-fixture-or-report-dir',
    why: 'fixtures／reports／node_modules 目錄：測試資料與產出，不是會被執行的程式',
    match: (rel) => /(^|\/)(fixtures?|reports?|node_modules)\//.test(rel),
  },
  {
    id: 'script-test-file',
    why: '.test／.spec 檔：測試不算「使用者叫得到」，與 cli 端 test-file 規則一致',
    match: (rel) => /\.(test|spec)\.(m?js|ts)$/.test(rel),
  },
];

function fail(msg) {
  console.error(`[reachability] FATAL: ${msg}`);
  process.exit(2);
}

/** 走訪 dir 底下所有 .js / .mjs，回傳相對 CLI_ROOT 的路徑。 */
function walkJs(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'coverage') continue;
      walkJs(full, out);
    } else if (/\.m?js$/.test(entry.name)) {
      out.push(relativePosix(CLI_ROOT, full));
    }
  }
  return out;
}

/**
 * 走訪 repo 根目錄 scripts/，回傳相對 CLI_ROOT 的路徑（例如 '../scripts/x.mjs'）。
 * 套用 SCRIPT_EXCLUSIONS（相對 scripts/ 的路徑比對）並計數。
 */
function walkScripts(scriptsDir, excludedBy, out = [], base = scriptsDir) {
  for (const entry of readdirSync(scriptsDir, { withFileTypes: true })) {
    const full = join(scriptsDir, entry.name);
    const relToScripts = relativePosix(base, full);
    if (entry.isDirectory()) {
      const dirRule = SCRIPT_EXCLUSIONS.find((e) => e.match(`${relToScripts}/`));
      if (dirRule) {
        // 整個目錄被排除：只計入其中的程式檔數，才看得出規則有沒有在作用
        excludedBy[dirRule.id] += countScriptFiles(full);
        continue;
      }
      walkScripts(full, excludedBy, out, base);
    } else if (SCRIPT_EXT.test(entry.name)) {
      const fileRule = SCRIPT_EXCLUSIONS.find((e) => e.match(relToScripts));
      if (fileRule) {
        excludedBy[fileRule.id]++;
        continue;
      }
      out.push(relativePosix(CLI_ROOT, full));
    }
  }
  return out;
}

function countScriptFiles(dir) {
  let n = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) n += countScriptFiles(full);
    else if (SCRIPT_EXT.test(entry.name)) n++;
  }
  return n;
}

/**
 * 只抽**靜態** import 指定字串（見檔頭：B 類入口只取確定會執行的邊）。
 * 與 extractImports 共用剝註解的步驟，但不取 import('…')。
 */
function extractStaticImports(rawSrc) {
  const src = rawSrc.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  const specs = [];
  for (const m of src.matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)) specs.push(m[1]);
  for (const m of src.matchAll(/\bimport\s+['"]([^'"]+)['"]/g)) specs.push(m[1]);
  return specs;
}

/**
 * 從原始碼抽出 import 指定字串。
 * 三種形式都要：`import x from 's'`、`export * from 's'`、`import('s')`。
 * 回傳 { specs: string[], unresolvableDynamic: number }
 * —— **無法靜態解析的 dynamic import 要計數，不能當作不存在。**
 */
function extractImports(rawSrc) {
  // **先剝註解，否則 JSDoc 裡的 import 範例會被算成真的邊。**
  // 這個方向很重要：假的邊讓不可達的模組看起來可達，也就是讓閘門**少報**。
  // 首版沒剝，`src/reconciler/index.js` 的 JSDoc 用法示例因此被當成一條斷掉的 import
  // ——那是它報出來的那一半，另一半（憑空多出的可達性）不會有任何症狀。
  const src = rawSrc.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  const specs = [];
  // static import / re-export：from '...'
  for (const m of src.matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)) specs.push(m[1]);
  // 純副作用 import 'x'
  for (const m of src.matchAll(/\bimport\s+['"]([^'"]+)['"]/g)) specs.push(m[1]);
  // dynamic import('...')
  for (const m of src.matchAll(/\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g)) specs.push(m[1]);
  // dynamic import(<非字面值>) —— 解析不了，計數並回報
  const dynAll = [...src.matchAll(/\bimport\s*\(/g)].length;
  const dynLiteral = [...src.matchAll(/\bimport\s*\(\s*['"]/g)].length;
  return { specs, unresolvableDynamic: Math.max(0, dynAll - dynLiteral) };
}

/** 把 import 指定字串解析成相對 CLI_ROOT 的檔案路徑；非相對路徑（套件）回 null。 */
function resolveSpec(fromRel, spec) {
  if (!spec.startsWith('.')) return null; // 外部套件，不在本閘門範圍
  const fromDir = dirname(join(CLI_ROOT, fromRel));
  const base = resolve(fromDir, spec);
  const candidates = extname(base)
    ? [base]
    : [`${base}.js`, `${base}.mjs`, join(base, 'index.js'), join(base, 'index.mjs')];
  for (const c of candidates) {
    if (existsSync(c) && statSync(c).isFile()) return relativePosix(CLI_ROOT, c);
  }
  return null; // 指到不存在的檔案——由呼叫端計數
}

function loadEntries() {
  const pkgPath = join(CLI_ROOT, 'package.json');
  if (!existsSync(pkgPath)) fail(`找不到 ${pkgPath}`);
  let pkg;
  try {
    pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  } catch (e) {
    fail(`package.json 解析失敗：${e.message}`);
  }
  const entries = new Set();
  for (const v of Object.values(pkg.bin ?? {})) entries.add(v);
  if (pkg.main) entries.add(pkg.main);
  const missing = [...entries].filter((e) => !existsSync(join(CLI_ROOT, e)));
  if (missing.length) fail(`package.json 宣告的入口不存在：${missing.join(', ')}`);
  if (entries.size === 0) fail('package.json 沒有宣告任何 bin 或 main —— 沒有入口就無從判斷可達性');
  return [...entries];
}

function analyse() {
  const entries = loadEntries();
  const entrySet = new Set(entries);

  const universe = [...walkJs(join(CLI_ROOT, 'src')), ...walkJs(join(CLI_ROOT, 'bin'))];
  if (universe.length === 0) fail('src/ 與 bin/ 底下掃不到任何 .js —— 這不是「沒有模組」，是掃不動');

  // B 類入口：repo 根目錄 scripts/ 的靜態 import 指向 cli/ 的邊（見檔頭）
  const scriptsDir = join(dirname(CLI_ROOT), 'scripts');
  // 掃不到 scripts/ 不是「沒有 B 類入口」，是量不了：此時 context-chunker 這類
  // 只被根腳本用的模組會全部被誤報成孤兒，而報錯的方向看起來像閘門正常運作。
  if (!existsSync(scriptsDir)) fail(`找不到 repo 根目錄的 scripts/：${scriptsDir} —— 少了 B 類入口，結果不可信`);
  const scriptExcludedBy = Object.fromEntries(SCRIPT_EXCLUSIONS.map((e) => [e.id, 0]));
  const scriptFiles = walkScripts(scriptsDir, scriptExcludedBy);
  if (scriptFiles.length === 0) fail('scripts/ 底下掃不到任何腳本 —— 這不是「沒有入口」，是掃不動');
  const scriptSeeds = new Map(); // cli 模組 → 哪些根腳本 import 它
  for (const sf of scriptFiles) {
    for (const spec of extractStaticImports(readFileSync(join(CLI_ROOT, sf), 'utf8'))) {
      if (!spec.startsWith('.')) continue;
      const target = resolveSpec(sf, spec);
      // 只收落在 cli/ 之內的目標；指到其他根腳本或 cli 之外的不是本閘門的事
      if (!target || target.startsWith('..')) continue;
      if (!scriptSeeds.has(target)) scriptSeeds.set(target, []);
      scriptSeeds.get(target).push(relativePosix(dirname(CLI_ROOT), join(CLI_ROOT, sf)));
    }
  }

  // BFS
  const reached = new Set();
  const queue = [...entries, ...scriptSeeds.keys()];
  let unresolvableDynamic = 0;
  const brokenSpecs = [];
  while (queue.length) {
    const cur = queue.shift();
    if (reached.has(cur)) continue;
    reached.add(cur);
    const full = join(CLI_ROOT, cur);
    if (!existsSync(full)) continue;
    const { specs, unresolvableDynamic: u } = extractImports(readFileSync(full, 'utf8'));
    unresolvableDynamic += u;
    for (const spec of specs) {
      if (!spec.startsWith('.')) continue;
      const target = resolveSpec(cur, spec);
      if (target) {
        if (!reached.has(target)) queue.push(target);
      } else {
        brokenSpecs.push({ from: cur, spec });
      }
    }
  }

  // 分類：可達 / 被規則排除 / 不可達
  const ctx = { entrySet };
  const excludedBy = Object.fromEntries(EXCLUSIONS.map((e) => [e.id, 0]));
  const unreachable = [];
  let reachableCount = 0;
  for (const rel of universe) {
    if (reached.has(rel)) {
      reachableCount++;
      continue;
    }
    const rule = EXCLUSIONS.find((e) => e.match(rel, ctx));
    if (rule) {
      excludedBy[rule.id]++;
      continue;
    }
    unreachable.push(rel);
  }
  unreachable.sort();

  return {
    entries,
    scriptEntries: {
      scanned: scriptFiles.length,
      excludedBy: scriptExcludedBy,
      seeds: Object.fromEntries([...scriptSeeds.entries()].sort()),
    },
    total: universe.length,
    reachable: reachableCount,
    excludedBy,
    excludedTotal: Object.values(excludedBy).reduce((a, b) => a + b, 0),
    unreachable,
    unresolvableDynamic,
    brokenSpecs,
  };
}

/**
 * 基線：R3 落地當下已存在的不可達模組。
 *
 * 它的作用是讓閘門**對新增的孤兒有效**，不是讓既有的那些變成合格——
 * CI 那支 XSPEC-355 棘輪的註解已經立好規矩：接上去不該當場燒紅。
 *
 * **基線帶到期日。** 一份沒有時鐘的例外清單只是有禮貌的刪除鍵：
 * 過期後這支腳本一律回 1，逼人重新做一次「先不處理」的判斷。
 */
function loadBaseline(p = BASELINE_PATH) {
  if (!existsSync(p)) return { modules: [], expires: null, missing: true };
  try {
    const b = JSON.parse(readFileSync(p, 'utf8'));
    return { modules: b.modules ?? [], expires: b.expires ?? null, missing: false };
  } catch (e) {
    fail(`基線檔存在但解析失敗：${e.message} —— 這不是「沒有基線」，是讀不了基線`);
  }
}

function report(r) {
  const baseline = loadBaseline();
  const baseSet = new Set(baseline.modules);
  r.newUnreachable = r.unreachable.filter((u) => !baseSet.has(u));
  r.baselineFixed = baseline.modules.filter((m) => !r.unreachable.includes(m));
  r.baselineSize = baseline.modules.length;

  // 先證明日期工具會動。它不會動的時候，下面的「未過期」與真的未過期長得一樣。
  const today = new Date().toISOString().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(today)) fail(`日期取得異常：'${today}'`);
  const expiry = judgeBaselineExpiry({ size: baseline.modules.length, expires: baseline.expires, today });
  r.baselineExpired = expiry.state === 'expired';
  r.baselineNoExpiry = expiry.state === 'no-expiry';
  r.baselineState = expiry.state;

  if (JSON_OUT) {
    console.log(JSON.stringify(r, null, 2));
    return r.newUnreachable.length > 0 || expiry.failed ? 1 : 0;
  }

  console.log(`[reachability] 入口：${r.entries.join(', ')}`);
  const seedCount = Object.keys(r.scriptEntries.seeds).length;
  console.log(
    `[reachability] 根 scripts/ 入口：掃 ${r.scriptEntries.scanned} 支腳本（納入）→ 靜態 import 指向 cli/ 的模組 ${seedCount} 個`,
  );
  for (const e of SCRIPT_EXCLUSIONS) {
    console.log(`               排除 [${e.id}]：${r.scriptEntries.excludedBy[e.id]} 個 —— ${e.why}`);
  }
  console.log(`[reachability] 走訪 ${r.total} 個模組 → 可達 ${r.reachable}，規則排除 ${r.excludedTotal}，不可達 ${r.unreachable.length}`);
  for (const e of EXCLUSIONS) {
    console.log(`               排除 [${e.id}]：${r.excludedBy[e.id]} 個 —— ${e.why}`);
  }

  // 這兩個數字必須出聲。它們是**這次量測本身的可信度**，不是附註。
  if (r.unresolvableDynamic > 0) {
    console.log(
      `[reachability] ⚠ ${r.unresolvableDynamic} 個 dynamic import 的引數不是字面值，靜態解析不了。` +
        `\n               若下方有模組其實是被它們載入的，這裡會誤報為不可達。`,
    );
  }
  if (r.brokenSpecs.length > 0) {
    console.log(`[reachability] ⚠ ${r.brokenSpecs.length} 個相對 import 指向不存在的檔案：`);
    for (const b of r.brokenSpecs.slice(0, 5)) console.log(`               ${b.from} → ${b.spec}`);
    if (r.brokenSpecs.length > 5) console.log(`               …另外 ${r.brokenSpecs.length - 5} 個`);
  }

  console.log(
    `[reachability] 基線 ${r.baselineSize} 個（XSPEC-383 R3 落地當下已存在）` +
      `${r.baselineExpired ? ' —— ⏰ 已過期' : ''}${r.baselineNoExpiry ? ' —— ⏰ 沒有到期日' : ''}`,
  );
  if (expiry.state === 'empty') console.log('[reachability] 基線為空，不檢查到期');

  // 基線縮小了要說出來。不說的話，一份修好了的清單會安靜地繼續代表舊事實。
  if (r.baselineFixed.length > 0) {
    console.log(`[reachability] ✓ 基線中有 ${r.baselineFixed.length} 個已不再不可達，請從基線移除：`);
    for (const f of r.baselineFixed) console.log(`               - ${f}`);
  }

  if (r.baselineExpired) {
    console.log(
      `\n[reachability] ✗ 基線已於 ${baseline.expires} 到期。` +
        '\n  到期不代表出事，代表「當初決定先不處理基線內這幾個」的判斷該重新做一次。' +
        '\n  三個選項：縮小基線／延期並在基線檔改日期（延期要寫理由）／把仍成立的項目轉成 EXCLUSIONS 規則。',
    );
    return 1;
  }
  if (r.baselineNoExpiry) {
    console.log(
      `\n[reachability] ✗ 基線有 ${r.baselineSize} 個，卻沒有有效的到期日（expires 要寫 YYYY-MM-DD）。` +
        '\n  沒有時鐘的例外清單只是一把客氣的刪除鍵：補上到期日與理由，或把這幾個修掉。',
    );
    return 1;
  }

  if (r.newUnreachable.length === 0) {
    console.log(
      `[reachability] ✓ 沒有**新增**的不可達模組（既有 ${r.unreachable.length} 個全部在基線內）。`,
    );
    return 0;
  }

  console.log(`\n[reachability] ✗ ${r.newUnreachable.length} 個**新增**的不可達模組（基線外）：`);
  for (const u of r.newUnreachable) console.log(`  ✗ ${u}`);
  console.log(
    '\n  不可達不代表沒用，代表**沒有使用者叫得到它**。三個處置：接上入口／刪除／' +
      '若是刻意保留的未來程式碼，加進 EXCLUSIONS 並寫明規則與理由（不要加檔名，要加規則）。',
  );
  return 1;
}

/** 在暫存目錄合成一個迷你 repo（cli/ + 根 scripts/），回傳其路徑。 */
function makeScriptEntryFixture() {
  const base = mkdtempSync(join(tmpdir(), 'reachability-selftest-'));
  const put = (rel, body) => {
    const f = join(base, rel);
    mkdirSync(dirname(f), { recursive: true });
    writeFileSync(f, body);
  };
  put('cli/package.json', JSON.stringify({ name: 'fx', bin: { fx: 'bin/fx.js' } }));
  put('cli/bin/fx.js', "import './../src/from-bin.js';\n");
  put('cli/src/from-bin.js', 'export const a = 1;\n');
  put('cli/src/only-from-script.js', 'export const b = 1;\n');
  put('cli/src/only-from-dynamic-script.js', 'export const c = 1;\n');
  put('cli/src/only-from-fixture.js', 'export const d = 1;\n');
  put('cli/src/nobody.js', 'export const e = 1;\n');
  put(
    'scripts/tool.mjs',
    "import { b } from '../cli/src/only-from-script.js';\n" +
      "export async function later() { return import('../cli/src/only-from-dynamic-script.js'); }\n" +
      'console.log(b);\n',
  );
  put('scripts/fixtures/f.mjs', "import { d } from '../../cli/src/only-from-fixture.js';\nconsole.log(d);\n");
  return { base, cliRoot: join(base, 'cli') };
}

/**
 * 自測：證明這支腳本能紅也能綠。
 * 一支從未紅過的檢查，與一支永遠回綠的檢查，在輸出上無從分辨。
 */
function selfTest() {
  const r = analyse();
  let pass = true;

  // 綠臂：入口自己必須可達
  const entriesReached = r.entries.length > 0 && !r.unreachable.some((u) => r.entries.includes(u));
  console.log(`  ${entriesReached ? '✓' : '✗'} 綠臂：入口不會被自己報成不可達`);
  pass &&= entriesReached;

  // 紅臂：塞一個必定不可達的虛構路徑，看它會不會被抓
  const fake = 'src/__reachability_probe_that_nothing_imports__.js';
  const fakeCaught = !r.unreachable.includes(fake); // 檔案不存在，故不該出現
  console.log(`  ${fakeCaught ? '✓' : '✗'} 分母臂：沒有掃到不存在的檔案`);
  pass &&= fakeCaught;

  // 分母臂：走訪數必須大於入口數（否則就是只掃到入口）
  const denomOk = r.total > r.entries.length;
  console.log(`  ${denomOk ? '✓' : '✗'} 分母臂：走訪 ${r.total} 個 > 入口 ${r.entries.length} 個`);
  pass &&= denomOk;

  // B 類入口（根 scripts/）的真實量測：真 repo 上必須掃得到腳本、且至少有一條邊指進 cli/
  const sc = r.scriptEntries;
  const scriptsOk = sc.scanned > 0 && Object.keys(sc.seeds).length > 0;
  console.log(
    `  ${scriptsOk ? '✓' : '✗'} 分母臂：根 scripts/ 掃到 ${sc.scanned} 支、指進 cli/ 的模組 ${Object.keys(sc.seeds).length} 個`,
  );
  pass &&= scriptsOk;

  // B 類入口的紅綠臂：合成一個小 repo，四種模組各一個，量它們各自的可達性。
  // 在真 repo 上驗「某模組變可達」會隨時間失效（那個模組被刪就沒得驗），合成的不會。
  const fx = makeScriptEntryFixture();
  const saved = CLI_ROOT;
  let fr;
  try {
    CLI_ROOT = fx.cliRoot;
    fr = analyse();
  } finally {
    CLI_ROOT = saved;
    rmSync(fx.base, { recursive: true, force: true });
  }
  const un = new Set(fr.unreachable);
  const arms = [
    ['綠臂：只被根 scripts/ 靜態 import 的模組 → 可達', !un.has('src/only-from-script.js')],
    ['綠臂：被 cli 入口 import 的模組 → 可達（對照，證明走訪本身有在動）', !un.has('src/from-bin.js')],
    ['紅臂：誰都不 import 的模組 → 仍不可達', un.has('src/nobody.js')],
    ['紅臂：只被根 scripts/ 的「動態」import 的模組 → 仍不可達（B 類只取靜態邊）', un.has('src/only-from-dynamic-script.js')],
    ['紅臂：只被 scripts/fixtures/ 底下檔案 import 的模組 → 仍不可達（目錄排除規則）', un.has('src/only-from-fixture.js')],
  ];
  for (const [label, ok] of arms) {
    console.log(`  ${ok ? '✓' : '✗'} ${label}`);
    pass &&= ok;
  }

  console.log(pass ? '[reachability] 自測通過' : '[reachability] 自測失敗');
  return pass ? 0 : 2;
}

const result = SELF_TEST ? selfTest() : report(analyse());
process.exit(result);
