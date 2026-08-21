/**
 * effect-boundary — XSPEC-383 R8 靜態效果邊界閘（引擎）
 *
 * ## 這道閘門存在的理由：形狀 D
 *
 * 「一個元件可達、被呼叫、跑得動、回報成功，而它什麼動作都沒做。」
 *
 * 它會通過 R3 的可達性閘門（`scripts/check-module-reachability.mjs`），因為
 * 可達性問的是**入邊**——「誰呼叫它」。形狀 D 的病灶在**出邊**——「它最終碰到
 * 什麼」。方向相反，所以那道閘門對它一個字都沒說。
 *
 * 根因是**宣稱與證據共用同一個作者**：一個效果實作的回傳值既是「我做了什麼」
 * 的宣稱，也是下游唯一的證據，沒有第二條讀取路徑。型別系統驗的是回傳值的
 * 形狀，而形狀對「真的做了」與「捏造的」**完全同構**——`{ ok: true, url }`
 * 這個型別，寫了 200 行部署邏輯的實作與 `return { ok: true, url }` 一行的空殼
 * 都完全滿足。
 *
 * 這支引擎走訪每個宣告的效果實作的**呼叫圖**，量它是否觸及跨程序邊界。
 *
 * ## 它抓不到什麼（誠實邊界，寫在最前面而不是附錄）
 *
 * 「摸到了外部世界，但做的是無關的事」——打一發裝飾性的 log 請求就能過關。
 * 它只證明**有路徑**，不證明**路徑載著正確的貨**。這是 R9（世界回讀）存在的
 * 理由，R9 不在本引擎範圍內。
 *
 * ## 邊界集合從 runtime 自讀，不手打白名單
 *
 * 邊界模組清單由 `builtinModules` 走訪產生（見 BOUNDARY_FAMILY_RULES）：
 * 規則是「家族根名」，實際模組名（`fs`、`fs/promises`、`node:fs`…）由走訪展開。
 * 一條規則展開出 0 個模組，本身就是值得看的訊號——**規則過期了，或它從來
 * 沒對過**——所以每條規則都印出自己命中幾個。
 *
 * 免 import 的全域邊界 API（`fetch`、`WebSocket`、`process.dlopen`…）同樣
 * **先探測 runtime 是否真的有這個全域再納入**，不是假設它存在。Node 版本不同
 * 時納入的集合會不同，而那個差異會印出來。
 *
 * ## 三種判定，以及為什麼不能只有一種
 *
 * 1. **絕對零判準**：可達圖裡零邊界節點 → RED。
 * 2. **家族組內離群判準**：同一家族中位數 > 0 而某成員 = 0 → RED，且該判紅
 *    帶「有兄弟當對照組」的佐證（corroborated）。
 *    判準 2 的命中集合是判準 1 的子集，它的價值不在多抓，在**佐證強度**：
 *    當整個家族全是 0，組內比較會**集體沉默**，此時判紅只由判準 1 支撐，
 *    報告必須明說這件事（見 report 中的 "no in-family control group"）。
 * 3. **不可判定**：可達圖零邊界，但圖裡有**無法分類的外部套件 import**。
 *    這既不是紅也不是綠——`import { deploy } from 'some-sdk'` 可能整包都在
 *    打網路，也可能是純型別。**把它算成綠是 fail-open，算成紅是誣告**，
 *    所以它是第三態，並讓整支結束於 2。採用者的出路是在 config 的
 *    `packages.boundary` / `packages.inert` 宣告那個套件的分類。
 *
 * ## R7-b：誠實的未實作必須有一條合法出路
 *
 * 「什麼也沒做卻回報成功」是違規；「什麼也沒做並誠實說出來」必須合法。
 * 否則動機鏈是：閘門擋死新 adapter → 有人加白名單 → 白名單腐壞。
 * 給誠實的未實作一條合法出路，白名單就沒有存在的理由。
 *
 * **靜態可偵測的契約（採用者要照做的就是這兩條）**：
 *   - 檔案中出現 `NOT_IMPLEMENTED` 這個字面值（字串或列舉成員皆可），
 *     或註解中出現 `@uds-effect-not-implemented`；**且**
 *   - 檔案中**不得**出現成功形狀的回傳字面值（`ok: true`、`success: true`、
 *     `status: 'ok'|'success'`）。
 * 兩者同時出現 → **不是**豁免，是本閘門要抓的正中紅心（宣告未實作卻同時
 * 回報成功），判 RED 並在理由中指名。
 *
 * ## R7-c：產品不得印出我方不擁有的網域
 *
 * 從**字串拼接**抽出網域（模板字面值與 `+` 串接皆處理），對照「組織實際持有
 * 清單」。清單來源**可插拔**且**不得手打進本檔**：config 的 `ownedDomains`
 * 指向 file / env / command，`command` 正是接註冊商或雲帳戶 DNS zone API 的
 * 那個位置。宣告了但讀不到或讀到空的 → **exit 2**，不得把讀不到當成
 * 「清單為空所以什麼都合法」。
 *
 * ## 為什麼引擎在 src/ 而不是只在 scripts/
 *
 * 實測 `npm pack --dry-run`：`cli/scripts/` 出貨 0 個檔案，`cli/src/` 出貨 120 個
 * （package.json 的 `files` 只列 bin/src/bundled/…）。一個只住在 scripts/ 的
 * 引擎，採用者 `npx uds audit --effects` 時**根本不在他的硬碟上**。
 * 所以：引擎在此（出貨、被 `uds audit --effects` import），
 * scripts/check-effect-boundary.mjs 只做 argv/報表/自測/exit code（不出貨）。
 *
 * ## 輸出語言
 *
 * 本檔的報告文字是**英文**，與兩支同型的 dev-only 腳本（中文）不同：那兩支
 * 不出貨、只有本 repo 的人會看；這一支會出現在任何採用者的 terminal 上。
 *
 * @module utils/effect-boundary
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, resolve, dirname, relative, extname, sep } from 'node:path';
import { builtinModules } from 'node:module';
import { spawnSync } from 'node:child_process';

/** 預設的 config 位置，沿用本 repo 既有的 `.uds/` 慣例（見 src/core/constants.js）。 */
export const DEFAULT_CONFIG_PATH = join('.uds', 'effect-boundary.json');

/** 採用者專案裡的基線位置。格式與到期日規則見 parseBaselineTsv。 */
export const DEFAULT_BASELINE_PATH = join('.uds', 'effect-boundary-baseline.tsv');

/** R7-b 契約的兩個字面值。改這裡等於改採用者的契約，不要當成內部常數。 */
export const NOT_IMPLEMENTED_MARKERS = [
  /\bNOT_IMPLEMENTED\b/,
  /@uds-effect-not-implemented\b/
];

/** 成功形狀的回傳字面值——與上面的 marker 同時出現時，豁免不成立。 */
export const SUCCESS_SHAPED_LITERALS = [
  /\bok\s*:\s*true\b/,
  /\bsuccess\s*:\s*true\b/,
  /\bstatus\s*:\s*['"`](ok|success|succeeded|done)['"`]/i
];

/**
 * 邊界家族規則。**每一條是規則（家族根名），不是模組清單**——
 * 實際模組名由走訪 `builtinModules` 展開，因此 Node 新增
 * `fs/promises`、`dns/promises` 這類子路徑時不需要改這裡。
 */
export const BOUNDARY_FAMILY_RULES = [
  {
    id: 'process-spawn',
    why: 'starts another OS process — the clearest possible cross-process effect',
    roots: ['child_process', 'cluster']
  },
  {
    id: 'filesystem',
    why: 'reads or writes state that outlives this process',
    roots: ['fs']
  },
  {
    id: 'network-socket',
    why: 'opens a socket to something outside this process',
    roots: ['net', 'dgram', 'tls']
  },
  {
    id: 'network-protocol',
    why: 'HTTP family — the usual shape of "call the platform API"',
    roots: ['http', 'https', 'http2']
  },
  {
    id: 'name-resolution',
    why: 'a DNS lookup is itself a round trip out of the process',
    roots: ['dns']
  },
  {
    id: 'thread-boundary',
    why: 'worker_threads crosses a scheduling boundary and can hold its own handles',
    roots: ['worker_threads']
  }
];

/**
 * FFI / N-API 入口**不是一個 builtin 家族**，所以它不在上表裡。
 *
 * 首版把它寫成 `roots: ['module']`，那是錯的：`node:module` 提供的是
 * `createRequire`，而本 repo 自己的 `src/commands/audit.js` 第一行就在 import 它。
 * 那樣寫會讓「載入原生模組」與「讀 package.json 版本號」變成同一件事，
 * 每一個用了 createRequire 的檔案都會被誤判成有邊界——**一個憑空多出來的綠燈**。
 *
 * 原生入口實際靠兩個訊號認：`.node` 指定字串（見 detectBoundaryHits），
 * 以及 `process.dlopen`（見 GLOBAL_BOUNDARY_CANDIDATES，且先探測 runtime 才納入）。
 */
export const NATIVE_ADDON_SIGNALS = ['a specifier ending in .node', 'process.dlopen'];

/**
 * 免 import 的全域邊界 API 候選。**每個都先探測 runtime 再納入**——
 * 這正是「邊界集合從 runtime 自讀」對全域 API 的那一半。
 */
const GLOBAL_BOUNDARY_CANDIDATES = [
  {
    id: 'fetch',
    why: 'HTTP round trip with no import at all',
    probe: () => typeof globalThis.fetch === 'function',
    // 排除 `function fetch(` 這種自己定義的同名函式——那不是全域 fetch，
    // 而把它算成命中的方向是**假綠**，正是本閘門最不能犯的錯。
    pattern: /(?<!\bfunction\s)(?<![.\w$])fetch\s*\(/
  },
  {
    id: 'WebSocket',
    why: 'long-lived socket with no import at all',
    probe: () => typeof globalThis.WebSocket === 'function',
    pattern: /\bnew\s+WebSocket\s*\(/
  },
  {
    id: 'EventSource',
    why: 'server-sent events; a long-lived outbound connection',
    probe: () => typeof globalThis.EventSource === 'function',
    pattern: /\bnew\s+EventSource\s*\(/
  },
  {
    id: 'process.dlopen',
    why: 'loads a native addon directly — the FFI entry point',
    probe: () => typeof process.dlopen === 'function',
    pattern: /\bprocess\s*\.\s*dlopen\s*\(/
  }
];

/** 走訪原始碼時認得的副檔名。 */
const SOURCE_EXTENSIONS = ['.js', '.mjs', '.cjs', '.jsx', '.ts', '.mts', '.cts', '.tsx'];

/** 走訪時永遠不進入的目錄。規則，不是專案清單。 */
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build', 'coverage', '.next', '.nuxt', 'out', '.turbo']);

/* ────────────────────────────── 邊界集合 ────────────────────────────── */

/**
 * 從 runtime 推導邊界表面。
 *
 * @returns {{
 *   modules: Set<string>,
 *   moduleFamily: Map<string, string>,
 *   familyStats: Array<{id: string, why: string, roots: string[], matched: number}>,
 *   globals: Array<{id: string, why: string, pattern: RegExp}>,
 *   globalsRejected: string[],
 *   builtinTotal: number,
 *   inertBuiltins: Set<string>
 * }}
 */
export function deriveBoundarySurface() {
  const modules = new Set();
  const moduleFamily = new Map();
  const inertBuiltins = new Set();
  const familyStats = [];

  const rootOf = (name) => name.replace(/^node:/, '').split('/')[0];

  for (const rule of BOUNDARY_FAMILY_RULES) {
    let matched = 0;
    for (const name of builtinModules) {
      const bare = name.replace(/^node:/, '');
      if (!rule.roots.includes(rootOf(bare))) continue;
      // 兩種書寫形式都要認得，且兩種都由走訪產生，不是手打的一對
      for (const form of [bare, `node:${bare}`]) {
        if (!modules.has(form)) {
          modules.add(form);
          moduleFamily.set(form, rule.id);
          matched++;
        }
      }
    }
    familyStats.push({ id: rule.id, why: rule.why, roots: rule.roots, matched });
  }

  for (const name of builtinModules) {
    const bare = name.replace(/^node:/, '');
    for (const form of [bare, `node:${bare}`]) {
      if (!modules.has(form)) inertBuiltins.add(form);
    }
  }

  const globals = [];
  const globalsRejected = [];
  for (const cand of GLOBAL_BOUNDARY_CANDIDATES) {
    let present;
    try {
      present = cand.probe() === true;
    } catch {
      present = false;
    }
    if (present) globals.push({ id: cand.id, why: cand.why, pattern: cand.pattern });
    else globalsRejected.push(cand.id);
  }

  return {
    modules,
    moduleFamily,
    familyStats,
    globals,
    globalsRejected,
    builtinTotal: builtinModules.length,
    inertBuiltins
  };
}

/* ────────────────────────── 原始碼掃描的基礎件 ────────────────────────── */

/**
 * 剝掉註解、保留字串與換行。
 *
 * **為什麼一定要剝**：JSDoc 裡的 `import fs from 'node:fs'` 範例會被算成一次
 * 真的邊界命中——那是**憑空多出來的綠燈**，也就是讓這道閘門**少報**，
 * 正是它存在要防的那個方向。R3 的 reachability 首版踩過同型的坑。
 *
 * **為什麼不能用正則**：`'https://example.com'` 裡的 `//` 會被行註解正則吃掉，
 * 而 R7-c 的整個判定就住在那些字串裡。所以用狀態機，逐字掃。
 *
 * 已知限制：不辨識 regex 字面值，因此 `/foo\/\*bar/` 這種內含 `/*` 的
 * regex 會被誤判為區塊註解起點。實務上罕見，且失效方向是「多剝一點」＝多報。
 */
export function stripComments(src) {
  let out = '';
  let i = 0;
  let state = 'code';
  while (i < src.length) {
    const c = src[i];
    const n = src[i + 1];
    if (state === 'code') {
      if (c === '/' && n === '/') { state = 'line'; i += 2; continue; }
      if (c === '/' && n === '*') { state = 'block'; i += 2; continue; }
      if (c === '\'') { state = 'sq'; out += c; i++; continue; }
      if (c === '"') { state = 'dq'; out += c; i++; continue; }
      if (c === '`') { state = 'tpl'; out += c; i++; continue; }
      out += c; i++; continue;
    }
    if (state === 'line') {
      if (c === '\n') { state = 'code'; out += c; }
      i++; continue;
    }
    if (state === 'block') {
      if (c === '*' && n === '/') { state = 'code'; i += 2; continue; }
      if (c === '\n') out += c;
      i++; continue;
    }
    if (c === '\\') { out += c + (n ?? ''); i += 2; continue; }
    if ((state === 'sq' && c === '\'') || (state === 'dq' && c === '"') || (state === 'tpl' && c === '`')) {
      state = 'code'; out += c; i++; continue;
    }
    out += c; i++; continue;
  }
  return out;
}

/**
 * 從（已剝註解的）原始碼抽出 import/require 指定字串，**並分辨 type-only import**。
 *
 * 🔴 為什麼一定要分辨 type-only：這是本引擎第一次自測就抓到的真缺陷。
 *
 * 形狀 D 的空殼實作幾乎一定會 `import type { Result } from './real-one'`——
 * 它要那個介面的型別。而 `./real-one` 是個真實作，裡面 import 了 `node:fs`。
 * 首版把那條 type-only import 當成呼叫圖的一條邊，於是**空殼繼承了介面檔的
 * 邊界命中，被判成綠**。實測：hollow.provider.ts → GREEN，金絲雀拿掉
 * spawnSync 之後仍然 GREEN（1 hit，全部來自型別 import）。
 *
 * `import type` 在編譯後**整行消失**，它不可能在 runtime 造成任何效果。
 * 把它算成邊，失效方向正是最不能犯的那個：**憑空多出來的綠燈**。
 *
 * 認定為 type-only 的兩種寫法：
 *   - `import type { X } from 's'` / `export type { X } from 's'`
 *   - `import { type X, type Y } from 's'`（所有具名綁定都帶 type 修飾）
 * 混合寫法 `import { type X, doWork } from 's'` 帶有值綁定，**是**真的邊。
 *
 * 無法靜態解析的 dynamic import / require 要計數，不能當作不存在——
 * 吞掉它會讓一個其實有邊界的元件被誤報成空殼。
 */
export function extractSpecifiers(strippedSrc) {
  const specs = [];
  const seen = new Set();
  const push = (spec, typeOnly, at) => {
    const key = `${at}:${spec}`;
    if (seen.has(key)) return;
    seen.add(key);
    specs.push({ spec, typeOnly });
  };

  // tempered pattern：clause 不得跨過下一個 import/export 或一個 `;`，
  // 否則一個沒有 from 的 `import 'side-effect'` 會把後面那句的 from 吸過來。
  const stmt = /\b(?:import|export)\b((?:(?!\b(?:import|export)\b|;)[\s\S])*?)\bfrom\s*['"]([^'"]+)['"]/g;
  for (const m of strippedSrc.matchAll(stmt)) {
    const clause = m[1].trim();
    let typeOnly = /^type\b/.test(clause);
    if (!typeOnly) {
      const braced = clause.match(/^\{([\s\S]*)\}$/);
      if (braced) {
        const parts = braced[1].split(',').map((p) => p.trim()).filter(Boolean);
        typeOnly = parts.length > 0 && parts.every((p) => /^type\s/.test(p));
      }
    }
    push(m[2], typeOnly, m.index);
  }
  for (const m of strippedSrc.matchAll(/\bimport\s+['"]([^'"]+)['"]/g)) push(m[1], false, m.index);
  for (const m of strippedSrc.matchAll(/\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g)) push(m[1], false, m.index);
  for (const m of strippedSrc.matchAll(/\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g)) push(m[1], false, m.index);

  const dynAll = [...strippedSrc.matchAll(/\b(?:import|require)\s*\(/g)].length;
  const dynLiteral = [...strippedSrc.matchAll(/\b(?:import|require)\s*\(\s*['"]/g)].length;
  return { specs, unresolvable: Math.max(0, dynAll - dynLiteral) };
}

/**
 * 對單一檔案的原始碼做邊界偵測。**純函式**——這一點很重要：
 * 它讓探針自證可以用兩段寫死在本檔裡的對照字串跑，不依賴磁碟上任何 fixture
 * （fixture 會被搬走、被 .npmignore 濾掉，而字串常數不會）。
 *
 * @param {string} rawSrc 原始碼
 * @param {ReturnType<deriveBoundarySurface>} surface
 * @param {{boundary: Set<string>, inert: Set<string>}} pkgClass 採用者宣告的外部套件分類
 */
export function detectBoundaryHits(rawSrc, surface, pkgClass = { boundary: new Set(), inert: new Set() }) {
  const src = stripComments(rawSrc);
  const hits = [];
  const relativeSpecs = [];
  const unknownPackages = new Set();

  const { specs, unresolvable } = extractSpecifiers(src);
  let typeOnlySkipped = 0;
  for (const { spec, typeOnly } of specs) {
    // type-only import 編譯後整行消失——它既不是呼叫圖的邊，也不是邊界命中
    if (typeOnly) { typeOnlySkipped++; continue; }
    if (spec.startsWith('.') || spec.startsWith('/')) {
      relativeSpecs.push(spec);
      if (spec.endsWith('.node')) hits.push({ kind: 'native-addon', detail: spec });
      continue;
    }
    if (spec.endsWith('.node')) { hits.push({ kind: 'native-addon', detail: spec }); continue; }

    const bare = spec.replace(/^node:/, '');
    const normalised = spec.startsWith('node:') ? spec : bare;
    if (surface.modules.has(normalised) || surface.modules.has(bare)) {
      hits.push({ kind: surface.moduleFamily.get(bare) ?? surface.moduleFamily.get(normalised), detail: spec });
      continue;
    }
    if (surface.inertBuiltins.has(bare)) continue; // 內建但不跨邊界（path、url、util…）

    // 外部套件：本引擎靜態上分不出它跨不跨邊界
    const pkgRoot = bare.startsWith('@') ? bare.split('/').slice(0, 2).join('/') : bare.split('/')[0];
    if (pkgClass.boundary.has(pkgRoot)) { hits.push({ kind: 'declared-boundary-package', detail: pkgRoot }); continue; }
    if (pkgClass.inert.has(pkgRoot)) continue;
    unknownPackages.add(pkgRoot);
  }

  for (const g of surface.globals) {
    if (g.pattern.test(src)) hits.push({ kind: `global:${g.id}`, detail: g.id });
  }

  return { hits, relativeSpecs, unknownPackages: [...unknownPackages], unresolvable, typeOnlySkipped };
}

/* ───────────────────────────── R7-c 網域抽取 ───────────────────────────── */

/**
 * 從原始碼抽出**字串拼接產生的**網域。
 *
 * 只在 URL 上下文裡抽（`https?://` 之後），不從任意看起來像網域的字面值抽——
 * 否則 `package.json`、`1.2.3`、`foo.spec.ts` 全都會變成「網域」，而一個滿是
 * 假陽性的清單會在兩週內被整條關掉。
 *
 * 動態片段（`${x}`、`' + x + '`）一律折成 `*`，因此
 * `` `https://${env}.api.example.net` `` → `*.api.example.net`：
 * **可註冊的那一段是字面值，所以這個判定是可決的**。反過來
 * `` `https://api.${tld}` `` → `api.*`，最後兩段含動態片段 → 不可決，計入
 * undecidable 而不是默默放行。
 */
export function extractDomains(rawSrc) {
  const src = stripComments(rawSrc);
  const found = [];
  const re = /https?:\/\//gi;
  let m;
  while ((m = re.exec(src)) !== null) {
    let i = m.index + m[0].length;
    let host = '';
    let sawDynamic = false;
    // 往前吃，直到 host 結束（/ ? # 空白 引號 反引號 或字串結束）
    while (i < src.length) {
      const c = src[i];
      if (c === '$' && src[i + 1] === '{') {
        let depth = 1; i += 2;
        while (i < src.length && depth > 0) {
          if (src[i] === '{') depth++;
          else if (src[i] === '}') depth--;
          i++;
        }
        host += '*'; sawDynamic = true; continue;
      }
      // `'https://' + host + '.example.net'` 形式：跳過引號與 + 與識別字
      if (c === '\'' || c === '"') {
        const rest = src.slice(i);
        const cont = rest.match(/^['"]\s*\+\s*[A-Za-z_$][\w$.[\]()]*\s*\+\s*['"]/);
        if (cont) { host += '*'; sawDynamic = true; i += cont[0].length; continue; }
        break;
      }
      if (/[A-Za-z0-9._-]/.test(c)) { host += c; i++; continue; }
      break;
    }
    host = host.replace(/^\.+|\.+$/g, '').toLowerCase();
    if (!host) continue;
    const labels = host.split('.').filter(Boolean);
    if (labels.length < 2) {
      found.push({ host, decidable: false, why: 'fewer than two labels after folding dynamic segments' });
      continue;
    }
    const registrable = labels.slice(-2).join('.');
    const decidable = !registrable.includes('*');
    found.push({
      host,
      registrable,
      decidable,
      dynamic: sawDynamic,
      why: decidable ? null : 'the registrable part itself is built at runtime'
    });
  }
  return found;
}

/**
 * 解析「組織實際持有的網域」清單。**來源可插拔，本檔不得內建任何網域。**
 *
 * @returns {{ok: true, domains: string[], source: string} | {ok: false, reason: string}}
 */
export function resolveOwnedDomains(ownedConfig, projectPath) {
  if (!ownedConfig) return { ok: false, reason: 'not-declared' };
  const parse = (text, source) => {
    // 逐行處理再切 token。**不能整份 split 空白**——那樣一行 `# see foo.example`
    // 的註解會貢獻一個叫 `foo.example` 的「持有網域」，
    // 而一份被自己的說明文字污染的白名單，比沒有白名單更難發現。
    const domains = text
      .split(/\r?\n/)
      .map((line) => line.split('#')[0])
      .flatMap((line) => line.split(/[\s,;]+/))
      .map((d) => d.trim().toLowerCase().replace(/^\*\./, '').replace(/\.$/, ''))
      .filter((d) => d && d.includes('.'));
    if (domains.length === 0) {
      return { ok: false, reason: `source ${source} produced zero domains — an unreadable list is not an empty list` };
    }
    return { ok: true, domains: [...new Set(domains)], source };
  };

  if (ownedConfig.source === 'file') {
    const p = resolve(projectPath, ownedConfig.path ?? '');
    if (!ownedConfig.path) return { ok: false, reason: 'ownedDomains.source=file but no path given' };
    if (!existsSync(p)) return { ok: false, reason: `ownedDomains file not found: ${p}` };
    try {
      return parse(readFileSync(p, 'utf8'), `file:${relative(projectPath, p)}`);
    } catch (e) {
      return { ok: false, reason: `ownedDomains file unreadable: ${e.message}` };
    }
  }

  if (ownedConfig.source === 'env') {
    const v = process.env[ownedConfig.var ?? ''];
    if (!ownedConfig.var) return { ok: false, reason: 'ownedDomains.source=env but no var given' };
    if (v === undefined) return { ok: false, reason: `env var ${ownedConfig.var} is not set` };
    return parse(v, `env:${ownedConfig.var}`);
  }

  if (ownedConfig.source === 'command') {
    // 這是接註冊商 / 雲帳戶 DNS zone API 的位置。指令從專案自己 commit 進來的
    // config 讀，信任層級等同 npm scripts。
    if (!ownedConfig.command) return { ok: false, reason: 'ownedDomains.source=command but no command given' };
    const r = spawnSync(ownedConfig.command, { shell: true, encoding: 'utf8', cwd: projectPath, timeout: 60_000 });
    if (r.error) return { ok: false, reason: `ownedDomains command failed to start: ${r.error.message}` };
    if (r.status !== 0) {
      return { ok: false, reason: `ownedDomains command exited ${r.status}: ${(r.stderr || '').trim().slice(0, 300)}` };
    }
    return parse(r.stdout ?? '', `command:${ownedConfig.command}`);
  }

  return { ok: false, reason: `unknown ownedDomains.source: ${JSON.stringify(ownedConfig.source)}` };
}

/* ─────────────────────────── 探針自證（R10 入場費） ─────────────────────────── */

/**
 * 已知為真的對照樣本。**寫成字串常數而不是磁碟上的 fixture**，因為
 * fixture 會被 `files` 濾掉、被搬走、被改壞，而那三種情況下這個對照組
 * 會安靜地消失——正是它要防的那件事。
 */
const KNOWN_POSITIVE_SOURCE = `
import { writeFileSync } from 'node:fs';
import { spawnSync } from 'child_process';
export function reallyDoesSomething(p, d) {
  writeFileSync(p, d);
  return spawnSync('true');
}
`;

/** 已知為淨的對照樣本：純計算，一個邊界都不碰。 */
const KNOWN_NEGATIVE_SOURCE = `
import { join } from 'node:path';
export function pureComputation(a, b) {
  return join(String(a), String(b)).length + 1;
}
`;

/**
 * 已知**只有型別 import** 的對照樣本。
 * 它釘住的是本引擎第一次自測就抓到的真缺陷（見 extractSpecifiers 的說明）：
 * 把 `import type` 當成呼叫圖的邊，會讓空殼實作繼承介面檔的邊界命中而判綠。
 * 沒有這一臂，那個 bug 修好之後也沒有東西阻止它回來。
 */
const KNOWN_TYPE_ONLY_SOURCE = `
import type { Stats } from 'node:fs';
import { type ChildProcess } from 'node:child_process';
export function describe(s: Stats, c: ChildProcess) { return String(s) + String(c); }
`;

/** 已知含拼接網域的對照樣本，給 R7-c 抽取器用。 */
const KNOWN_DOMAIN_SOURCE = [
  'const base = `https://${region}.api.probe-fixture.invalid/v1`;',
  'const alt = \'https://\' + tenant + \'.probe-fixture.invalid\';'
].join('\n');

/**
 * 探針自我驗證。**在任何掃描開始之前跑，主路徑與自測路徑共用同一支。**
 *
 * 🔴 為什麼這段必須在主路徑，不能只在 `--self-test` 裡：
 * 這道閘門判紅的方式是「命中數 = 0」。一個**壞掉的偵測器**對每一個檔案都
 * 回 0，於是它會把整個家族判成紅——看起來像「抓到一堆問題」，實際上是
 * 探針死了。反向亦然：一個把什麼都當成命中的偵測器，會把整個家族判成綠，
 * 而**那個綠燈與真的乾淨逐字相同**。
 *
 * ⚠️ **兩臂不等價，缺一不可**（R4 那支已經用實測付過學費）：
 *   - 正向臂（已知真實作 → 命中 > 0）抓「偵測器整個死了」。
 *   - 負向臂（已知純計算 → 命中 = 0）抓「偵測器對什麼都說命中」。
 * 只留正向臂時，一個無條件回報命中的偵測器照樣全綠通過。
 *
 * 第三臂是 R7-c 的抽取器自證：抽取器找到 0 個網域，與「這份程式碼真的沒有
 * 網域」在輸出上無從分辨——所以先用已知含網域的對照樣本證明它會抽到東西。
 */
export function verifyProbeIsWorking(surface, pkgClass) {
  const lines = [];
  let ok = true;

  const pos = detectBoundaryHits(KNOWN_POSITIVE_SOURCE, surface, pkgClass);
  const posOk = pos.hits.length > 0;
  lines.push(
    `  ${posOk ? '✓' : '✗'} control (positive): a known-real implementation reports ${pos.hits.length} boundary hit(s)` +
      (posOk ? '' : ' — the detector is dead; every member would be judged RED')
  );
  ok &&= posOk;

  const neg = detectBoundaryHits(KNOWN_NEGATIVE_SOURCE, surface, pkgClass);
  const negOk = neg.hits.length === 0;
  lines.push(
    `  ${negOk ? '✓' : '✗'} control (negative): a known-pure computation reports ${neg.hits.length} boundary hit(s)` +
      (negOk ? '' : ' — the detector says "hit" for anything; every member would be judged GREEN')
  );
  ok &&= negOk;

  const typeOnly = detectBoundaryHits(KNOWN_TYPE_ONLY_SOURCE, surface, pkgClass);
  const typeOnlyOk = typeOnly.hits.length === 0 && typeOnly.typeOnlySkipped === 2;
  lines.push(
    `  ${typeOnlyOk ? '✓' : '✗'} control (type-only imports): ${typeOnly.typeOnlySkipped}/2 skipped, ` +
      `${typeOnly.hits.length} boundary hit(s) counted` +
      (typeOnlyOk ? '' : ' — a type import vanishes at compile time; counting it is a green light out of thin air')
  );
  ok &&= typeOnlyOk;

  const dom = extractDomains(KNOWN_DOMAIN_SOURCE);
  const domOk = dom.length === 2 && dom.every((d) => d.registrable === 'probe-fixture.invalid');
  lines.push(
    `  ${domOk ? '✓' : '✗'} control (domain extractor): known concatenated domains extracted ` +
      `${dom.length}/2 → ${dom.map((d) => d.host).join(', ') || '(none)'}`
  );
  ok &&= domOk;

  const surfaceOk = surface.modules.size > 0 && surface.familyStats.every((f) => f.matched > 0);
  lines.push(
    `  ${surfaceOk ? '✓' : '✗'} control (boundary surface): ${surface.modules.size} module forms derived from ` +
      `${surface.builtinTotal} builtins; every family rule matched at least one` +
      (surfaceOk ? '' : ` — empty families: ${surface.familyStats.filter((f) => f.matched === 0).map((f) => f.id).join(', ')}`)
  );
  ok &&= surfaceOk;

  return { ok, lines };
}

/* ────────────────────────────── 走訪與判定 ────────────────────────────── */

/** 極小的 glob → RegExp。支援 `**`、`*`、`?`；路徑一律以 `/` 正規化。 */
export function globToRegExp(glob) {
  let re = '';
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i];
    if (c === '*') {
      if (glob[i + 1] === '*') {
        // `**/` 允許零層目錄，否則 `**/x` 匹配不到根目錄下的 x
        if (glob[i + 2] === '/') { re += '(?:[^/]*\\/)*'; i += 2; }
        else { re += '.*'; i += 1; }
      } else {
        re += '[^/]*';
      }
      continue;
    }
    if (c === '?') { re += '[^/]'; continue; }
    re += c.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  }
  return new RegExp(`^${re}$`);
}

/** 走訪 dir 下所有原始碼檔，回傳相對 root 的 posix 路徑。 */
export function walkSources(root, dir = root, out = []) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      walkSources(root, join(dir, entry.name), out);
    } else if (SOURCE_EXTENSIONS.includes(extname(entry.name))) {
      out.push(relative(root, join(dir, entry.name)).split(sep).join('/'));
    }
  }
  return out;
}

/** 把相對 import 解析成相對 root 的檔案路徑；解析不到回 null。 */
function resolveRelative(root, fromRel, spec) {
  const base = resolve(dirname(join(root, fromRel)), spec);
  const candidates = [];
  if (extname(base)) {
    candidates.push(base);
    // TS 寫 `./x.js` 指的常常是 `./x.ts`
    candidates.push(base.replace(/\.js$/, '.ts'), base.replace(/\.mjs$/, '.mts'));
  }
  for (const ext of SOURCE_EXTENSIONS) candidates.push(base + ext, join(base, `index${ext}`));
  for (const c of candidates) {
    if (existsSync(c) && statSync(c).isFile()) return relative(root, c).split(sep).join('/');
  }
  return null;
}

/** R7-b：這個檔案有沒有誠實地說「我沒做」——以及有沒有同時回報成功。 */
export function classifyHonesty(rawSrc) {
  const src = rawSrc; // marker 允許出現在註解裡，所以這裡**不**剝註解
  const stripped = stripComments(rawSrc);
  const declaresNotImplemented = NOT_IMPLEMENTED_MARKERS.some((r) => r.test(src));
  const claimsSuccess = SUCCESS_SHAPED_LITERALS.some((r) => r.test(stripped));
  return { declaresNotImplemented, claimsSuccess };
}

function median(nums) {
  if (nums.length === 0) return 0;
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

/**
 * 主分析。
 *
 * @param {{projectPath: string, config: object, surface?: object}} opts
 *   `surface` 是**測試接縫**：預設從 runtime 推導。傳入一個壞掉的 surface
 *   是唯一能端對端演示「探針失效 → exit 2」的方法，而一道從未演示過自己會
 *   exit 2 的閘門，與一道 exit 2 路徑早就壞掉的閘門，輸出上無從分辨。
 *   它是參數不是環境變數，所以不會有人在生產路徑上意外踩到。
 * @returns {object} 完整結果；exit code 由 formatReport 決定
 */
export function analyseEffectBoundary({ projectPath, config, surface: injectedSurface }) {
  const surface = injectedSurface ?? deriveBoundarySurface();
  const pkgClass = {
    boundary: new Set(config.packages?.boundary ?? []),
    inert: new Set(config.packages?.inert ?? [])
  };

  // 🔴 先證明探針在工作，再相信它量出來的任何東西。
  const probe = verifyProbeIsWorking(surface, pkgClass);
  if (!probe.ok) {
    return { fatal: 'probe-broken', probe, surface };
  }

  const root = resolve(projectPath, config.root ?? '.');
  if (!existsSync(root)) return { fatal: `root not found: ${root}`, probe, surface };

  const families = config.families ?? [];
  if (families.length === 0) {
    return { fatal: 'config declares zero effect families — nothing to measure is not the same as nothing wrong', probe, surface };
  }

  const walked = walkSources(root);
  if (walked.length === 0) {
    return { fatal: `walked ${root} and found zero source files — this is "cannot measure", not "clean"`, probe, surface };
  }

  const ownedResult = resolveOwnedDomains(config.ownedDomains, projectPath);

  const familyResults = [];
  let totalMembers = 0;
  let totalExcluded = 0;

  for (const fam of families) {
    const includeRes = (fam.include ?? []).map(globToRegExp);
    const excludeRes = (fam.exclude ?? []).map(globToRegExp);
    const included = walked.filter((p) => includeRes.some((r) => r.test(p)));
    const members = [];
    let excluded = 0;
    for (const p of included) {
      if (excludeRes.some((r) => r.test(p))) { excluded++; continue; }
      members.push(p);
    }
    totalExcluded += excluded;

    const memberResults = [];
    for (const rel of members) {
      // 沿呼叫圖 BFS：一個把邊界委派給 helper 的成員必須算綠
      const visited = new Set();
      const queue = [rel];
      const hits = [];
      const unknownPackages = new Set();
      let unresolvable = 0;
      let graphSize = 0;
      while (queue.length) {
        const cur = queue.shift();
        if (visited.has(cur)) continue;
        visited.add(cur);
        const full = join(root, cur);
        if (!existsSync(full)) continue;
        graphSize++;
        const srcText = readFileSync(full, 'utf8');
        const d = detectBoundaryHits(srcText, surface, pkgClass);
        for (const h of d.hits) hits.push({ ...h, file: cur });
        for (const u of d.unknownPackages) unknownPackages.add(u);
        unresolvable += d.unresolvable;
        for (const spec of d.relativeSpecs) {
          const t = resolveRelative(root, cur, spec);
          if (t && !visited.has(t)) queue.push(t);
        }
      }

      const honesty = classifyHonesty(readFileSync(join(root, rel), 'utf8'));
      const domains = [];
      for (const f of visited) {
        const full = join(root, f);
        if (!existsSync(full)) continue;
        for (const d of extractDomains(readFileSync(full, 'utf8'))) domains.push({ ...d, file: f });
      }

      memberResults.push({
        file: rel,
        graphSize,
        hits,
        hitCount: hits.length,
        unknownPackages: [...unknownPackages],
        unresolvable,
        honesty,
        domains
      });
      totalMembers++;
    }

    const nonExempt = memberResults.filter((m) => !(m.honesty.declaresNotImplemented && !m.honesty.claimsSuccess));
    const med = median(nonExempt.map((m) => m.hitCount));

    for (const m of memberResults) {
      const exempt = m.honesty.declaresNotImplemented && !m.honesty.claimsSuccess;
      if (exempt) {
        m.verdict = 'EXEMPT-HONEST';
        m.reason = 'declares NOT_IMPLEMENTED and never claims success — R7-b says this must be legal';
        continue;
      }
      if (m.honesty.declaresNotImplemented && m.honesty.claimsSuccess) {
        m.verdict = 'RED';
        m.reason = 'declares NOT_IMPLEMENTED *and* returns a success-shaped literal — the exemption does not apply';
        m.corroborated = med > 0;
        continue;
      }
      if (m.hitCount > 0) { m.verdict = 'GREEN'; m.reason = `${m.hitCount} boundary hit(s) across ${m.graphSize} file(s)`; continue; }
      if (m.unknownPackages.length > 0) {
        m.verdict = 'UNDECIDABLE';
        m.reason = `zero boundary hits, but ${m.unknownPackages.length} unclassifiable external package import(s): ` +
          `${m.unknownPackages.join(', ')} — declare them under packages.boundary / packages.inert`;
        continue;
      }
      if (m.unresolvable > 0) {
        m.verdict = 'UNDECIDABLE';
        m.reason = `zero boundary hits, but ${m.unresolvable} dynamic import/require call(s) whose argument is not a literal`;
        continue;
      }
      m.verdict = 'RED';
      m.corroborated = med > 0;
      m.reason = `zero boundary hits across its whole reachable graph (${m.graphSize} file(s))` +
        (med > 0
          ? ` — and its family median is ${med}, so siblings in the same family do reach the outside world`
          : ' — the whole family is zero, so there is no in-family control group; this RED rests on the absolute-zero test alone');
    }

    familyResults.push({
      name: fam.name ?? '(unnamed)',
      include: fam.include ?? [],
      exclude: fam.exclude ?? [],
      matched: included.length,
      excluded,
      members: memberResults,
      median: med,
      hasControlGroup: med > 0
    });
  }

  if (totalMembers === 0) {
    return {
      fatal: `every declared family resolved to zero members (walked ${walked.length} source files under ${root}) — ` +
        'an empty collection prints the same green as zero failures',
      probe,
      surface,
      walked: walked.length
    };
  }

  // R7-c 判定
  const allDomains = familyResults.flatMap((f) => f.members.flatMap((m) => m.domains.map((d) => ({ ...d, member: m.file }))));
  const domainAudit = { requested: Boolean(config.ownedDomains), owned: ownedResult, extracted: allDomains.length, violations: [], undecidable: [] };
  if (domainAudit.requested) {
    if (!ownedResult.ok) {
      domainAudit.fatal = `ownedDomains was declared but could not be resolved: ${ownedResult.reason}`;
    } else {
      const owned = ownedResult.domains;
      for (const d of allDomains) {
        if (!d.decidable) { domainAudit.undecidable.push(d); continue; }
        const isOurs = owned.some((o) => d.registrable === o || d.host === o || d.host.endsWith(`.${o}`));
        if (!isOurs) domainAudit.violations.push(d);
      }
    }
  }

  return {
    probe,
    surface,
    root,
    walked: walked.length,
    totalMembers,
    totalExcluded,
    families: familyResults,
    domainAudit
  };
}

/* ──────────────────────────────── 基線（TSV） ──────────────────────────────── */

/**
 * 基線用 **TSV ＋ 每筆到期日**，不是 JSON——這是 XSPEC-383 §7.11.2 明文指定給
 * 本閘門的格式（同 dev-platform `cross-project/unattended-risks.tsv` 的形狀），
 * **不是**要回頭改 reachability / command-existence 那兩支的 JSON 基線。
 *
 * 為什麼是 TSV：每一列是一個人做過的判斷，而它要能被 `sort`／`awk`／人眼在
 * 一行內讀完並比對到期日。JSON 基線要展開三層才看得到那個日期。
 *
 * **每筆帶到期日。** 一份沒有時鐘的例外清單只是有禮貌的刪除鍵。
 *
 * 欄位：family <TAB> member <TAB> verdict <TAB> expires(YYYY-MM-DD) <TAB> reason
 * 欄數不對 → 解析失敗 → exit 2。**壞掉的基線不是「沒有基線」。**
 */
export function parseBaselineTsv(text) {
  const entries = [];
  const errors = [];
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim() || line.trimStart().startsWith('#')) continue;
    const cols = line.split('\t');
    if (cols.length !== 5) {
      errors.push(`line ${i + 1}: expected 5 tab-separated columns, got ${cols.length}`);
      continue;
    }
    const [family, member, verdict, expires, reason] = cols.map((c) => c.trim());
    if (!/^\d{4}-\d{2}-\d{2}$/.test(expires)) {
      errors.push(`line ${i + 1}: expiry '${expires}' is not YYYY-MM-DD — an entry without a clock never expires`);
      continue;
    }
    entries.push({ family, member, verdict, expires, reason });
  }
  return { entries, errors };
}

export function baselineKey(familyName, memberFile) {
  return `${familyName}\t${memberFile}`;
}

/* ──────────────────────────────── 報表 ──────────────────────────────── */

/**
 * 產生報表行與 exit code。
 *
 * 三態：
 *   0  量得到，而且乾淨
 *   1  量得到，有基線外的違規（或基線已過期）
 *   2  **量不出來**——探針壞掉／沒有 config／家族解析出 0 個成員／
 *      有 UNDECIDABLE 成員／宣告了 ownedDomains 卻讀不到。**這不是綠燈。**
 *
 * 2 優先於 1：有東西量不出來時，「其餘皆綠」這句話本身就不成立。
 * 但報表仍然把已確認的紅列出來——exit code 只有一個數字，而資訊不必因此丟掉。
 */
export function formatReport(result, baseline, today = new Date().toISOString().slice(0, 10)) {
  const L = [];
  const P = (s) => L.push(s);

  if (result.fatal) {
    P(`[effect-boundary] FATAL: ${result.fatal}`);
    if (result.probe && !result.probe.ok) for (const l of result.probe.lines) P(l);
    return { lines: L, exitCode: 2 };
  }

  const s = result.surface;
  P('[effect-boundary] Boundary surface derived from this runtime (not a hand-written allowlist):');
  for (const f of s.familyStats) {
    P(`               ${f.matched.toString().padStart(3)} module form(s)  [${f.id}]  roots=${f.roots.join(',')} — ${f.why}`);
  }
  P(`               ${s.globals.length} import-free global API(s) present in this runtime: ${s.globals.map((g) => g.id).join(', ') || '(none)'}`);
  if (s.globalsRejected.length) {
    P(`               ${s.globalsRejected.length} global candidate(s) absent here, so not counted: ${s.globalsRejected.join(', ')}`);
  }
  P(`               native addon entry is not a builtin family; detected via: ${NATIVE_ADDON_SIGNALS.join(' / ')}`);
  P(`               total: ${s.modules.size} boundary module forms out of ${s.builtinTotal} builtins`);
  for (const l of result.probe.lines) P(l);

  P(`[effect-boundary] Walked ${result.walked} source file(s) under ${result.root}`);
  P(`[effect-boundary] ${result.families.length} declared family/families → ${result.totalMembers} member(s), ${result.totalExcluded} excluded by the families' own exclude globs`);

  const baseSet = new Map((baseline?.entries ?? []).map((e) => [baselineKey(e.family, e.member), e]));
  const newFindings = [];
  const baselined = [];
  const expired = [];
  const undecidable = [];

  for (const fam of result.families) {
    P(`               family '${fam.name}': include=${JSON.stringify(fam.include)} matched ${fam.matched}, excluded ${fam.excluded}, members ${fam.members.length}, hit-count median ${fam.median}` +
      (fam.hasControlGroup ? '' : '  ⚠ no in-family control group (every member is zero)'));
    for (const m of fam.members) {
      if (m.verdict === 'UNDECIDABLE') { undecidable.push({ fam: fam.name, m }); continue; }
      if (m.verdict !== 'RED') continue;
      const b = baseSet.get(baselineKey(fam.name, m.file));
      if (!b) { newFindings.push({ fam: fam.name, m }); continue; }
      if (b.expires < today) expired.push({ fam: fam.name, m, b });
      else baselined.push({ fam: fam.name, m, b });
    }
  }

  if (baseline?.errors?.length) {
    P('[effect-boundary] FATAL: the baseline file exists but does not parse:');
    for (const e of baseline.errors) P(`               ${e}`);
    P('               A broken baseline is not "no baseline" — refusing to report a result.');
    return { lines: L, exitCode: 2 };
  }

  const da = result.domainAudit;
  if (da.fatal) {
    P(`[effect-boundary] FATAL (R7-c): ${da.fatal}`);
    P('               Failing to read the owned-domain list is not the same as "the list is empty, so everything is allowed".');
    return { lines: L, exitCode: 2 };
  }
  if (!da.requested) {
    P('[effect-boundary] R7-c domain audit: NOT RUN — config declares no `ownedDomains` source.');
    P('               This is an opt-in gap, stated loudly on purpose: no domain in this codebase was checked against anything.');
  } else {
    P(`[effect-boundary] R7-c domain audit: ${da.extracted} domain(s) extracted from string concatenation, checked against ${da.owned.domains.length} owned domain(s) from ${da.owned.source}`);
    if (da.extracted === 0) {
      P('               ⚠ zero domains extracted. The extractor\'s known-positive control passed above, so this reads as "this corpus has none" rather than "the extractor is dead" — but those two are only distinguishable *because* of that control.');
    }
    for (const d of da.undecidable) {
      P(`               ? ${d.member}: ${d.host} — ${d.why}`);
    }
  }

  let exitCode = 0;

  if (undecidable.length) {
    P(`\n[effect-boundary] ${undecidable.length} member(s) could not be classified:`);
    for (const { fam, m } of undecidable) P(`  ? [${fam}] ${m.file} — ${m.reason}`);
    P('  Zero boundary hits plus an unclassifiable dependency is neither clean nor dirty.');
    P('  Calling it clean would be fail-open; calling it dirty would be an accusation. So: exit 2.');
    exitCode = 2;
  }

  if (da.requested && da.violations.length) {
    P(`\n[effect-boundary] ✗ ${da.violations.length} domain(s) built in code are not on the owned list:`);
    for (const d of da.violations) P(`  ✗ [${d.member}] ${d.host}  (registrable: ${d.registrable})`);
    if (exitCode === 0) exitCode = 1;
  }

  if (expired.length) {
    P(`\n[effect-boundary] ✗ ${expired.length} baseline entry/entries expired:`);
    for (const { fam, m, b } of expired) P(`  ⏰ [${fam}] ${m.file} expired ${b.expires} — ${b.reason}`);
    P('  Expiry does not mean something broke. It means the decision to defer this needs making again.');
    if (exitCode === 0) exitCode = 1;
  }

  if (newFindings.length) {
    P(`\n[effect-boundary] ✗ ${newFindings.length} effect implementation(s) reach nothing outside this process:`);
    for (const { fam, m } of newFindings) {
      P(`  ✗ [${fam}] ${m.file}`);
      P(`      ${m.reason}`);
      if (m.corroborated === false) P('      (corroboration: none — no sibling in this family reaches the outside either)');
      else if (m.corroborated === true) P('      (corroboration: siblings in this family do reach the outside)');
    }
    P('\n  Three ways out: implement the effect; make it fail honestly (see R7-b — a NOT_IMPLEMENTED');
    P('  marker with no success-shaped return is legal and needs no allowlist); or add a baseline row');
    P('  with an expiry date and a reason.');
    if (exitCode === 0) exitCode = 1;
  }

  if (baselined.length) {
    P(`[effect-boundary] ${baselined.length} known finding(s) suppressed by the baseline (all still within their expiry).`);
  }

  const exemptCount = result.families.flatMap((f) => f.members).filter((m) => m.verdict === 'EXEMPT-HONEST').length;
  if (exemptCount) {
    P(`[effect-boundary] ${exemptCount} member(s) exempt under R7-b: they declare NOT_IMPLEMENTED and never claim success.`);
  }

  if (exitCode === 0) {
    const green = result.families.flatMap((f) => f.members).filter((m) => m.verdict === 'GREEN').length;
    P(`[effect-boundary] ✓ ${green} member(s) reach a real cross-process boundary; no unexplained zero-effect implementations.`);
    P('               What this does NOT prove: that the boundary they touch is the *right* one.');
    P('               A decorative log request passes this gate. That is R9\'s job, and R9 is not implemented.');
  }

  return { lines: L, exitCode };
}
