#!/usr/bin/env node
/**
 * check-effect-boundary — XSPEC-383 R8（＋ R7-b / R7-c / R10）
 *
 * 形狀 D：**一個元件可達、被呼叫、跑得動、回報成功，而它什麼動作都沒做。**
 *
 * R3 的可達性閘門對它一個字都沒說，因為可達性問的是入邊（誰呼叫它），
 * 而形狀 D 的病灶在出邊（它最終碰到什麼）。方向相反。
 *
 * 判定邏輯全部在 `cli/src/utils/effect-boundary.js`，本檔只做四件事：
 * argv、報表輸出、exit code、自測。
 *
 * ## 為什麼引擎不在本檔裡
 *
 * 實測 `npm pack --dry-run`：`cli/scripts/` 出貨 **0** 個檔案（package.json 的
 * `files` 只列 bin/src/bundled/…），`cli/src/` 出貨 120 個。一個住在 scripts/ 的
 * 引擎，採用者跑 `uds audit --effects` 時**根本不在他的硬碟上**。
 * 所以引擎在 src/（出貨、被 audit 指令 import），本檔只是它的另一個入口，
 * 讓 `npm run check:effect-boundary` 與 CI 叫得到。
 *
 * 這與 check-module-reachability.mjs / check-command-existence.mjs 的分層不同，
 * 而不同是有理由的：那兩支的**檢查對象是本 repo 自己**，沒有出貨的需求。
 * 本支的檢查對象是**採用者的原始碼**。
 *
 * ## 基線為什麼是 TSV 不是 JSON
 *
 * XSPEC-383 §7.11.2 明文指定 TSV ＋ 每筆到期日（同 dev-platform
 * `cross-project/unattended-risks.tsv` 的形狀）。**不是**要回頭改那兩支的 JSON
 * 基線。理由：每一列是一個人做過的「先不處理」判斷，要能被 sort／awk／人眼
 * 在一行內讀完並看到到期日；JSON 要展開三層才看得到那個日期。
 *
 * ## UDS 自己沒有效果家族
 *
 * 本 repo 是一個標準庫 ＋ 一支 CLI，沒有「多個實作同一個效果介面」的家族。
 * 所以**不帶 config 直接跑本支會 exit 2**（沒有 config ＝ 量不了），那是正確
 * 行為而不是故障。UDS 這一側能對自己斷言的完整內容就是 `--self-test`——
 * 它用 `cli/tests/fixtures/effect-boundary/` 下的合成語料跑完綠臂、紅臂、
 * 金絲雀、空集合、探針失效五臂。CI 跑的是那一支。
 *
 * 用法：
 *   node cli/scripts/check-effect-boundary.mjs --config <path>   # 檢查
 *   node cli/scripts/check-effect-boundary.mjs --config <path> --json
 *   node cli/scripts/check-effect-boundary.mjs --self-test        # 證明它能紅也能綠
 *
 * 結束碼三態——「沒有空殼」與「量不出來」必須分得開：
 *   0  量得到，而且乾淨
 *   1  量得到，有基線外的空殼實作／不屬於我方的網域／基線已過期
 *   2  **量不出來**——沒有 config、家族解析出 0 個成員、探針自證失敗、
 *      有無法分類的成員、宣告了 ownedDomains 卻讀不到。**這不是綠燈。**
 */

import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  analyseEffectBoundary,
  formatReport,
  parseBaselineTsv,
  deriveBoundarySurface,
  verifyProbeIsWorking,
  DEFAULT_CONFIG_PATH
} from '../src/utils/effect-boundary.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const CLI_ROOT = resolve(HERE, '..');
const BASELINE_PATH = join(HERE, 'effect-boundary-baseline.tsv');
const FIXTURES = join(CLI_ROOT, 'tests', 'fixtures', 'effect-boundary');

const args = process.argv.slice(2);
const JSON_OUT = args.includes('--json');
const SELF_TEST = args.includes('--self-test');

function argValue(name) {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : null;
}

function fail(msg) {
  console.error(`[effect-boundary] FATAL: ${msg}`);
  process.exit(2);
}

function loadBaseline() {
  if (!existsSync(BASELINE_PATH)) return { entries: [], errors: [], missing: true };
  const parsed = parseBaselineTsv(readFileSync(BASELINE_PATH, 'utf8'));
  return { ...parsed, missing: false };
}

function loadConfig(configPath) {
  if (!existsSync(configPath)) {
    fail(
      `no effect-family config at ${configPath}.\n` +
        '  This gate measures "does this effect implementation reach anything outside the process",\n' +
        '  and it cannot answer that without being told which implementations form a family.\n' +
        `  Declare them by glob in ${DEFAULT_CONFIG_PATH} (or pass --config <path>).\n` +
        '  Exiting 2 (cannot measure), not 0 — a gate with nothing to check must not print a green tick.'
    );
  }
  try {
    return JSON.parse(readFileSync(configPath, 'utf8'));
  } catch (e) {
    fail(`config exists but does not parse: ${configPath}: ${e.message} — this is "cannot read config", not "no config"`);
  }
}

function runOnce(configPath, { surface } = {}) {
  const cfg = loadConfig(configPath);
  const result = analyseEffectBoundary({ projectPath: dirname(configPath), config: cfg, surface });
  const baseline = loadBaseline();
  return { result, baseline, ...formatReport(result, baseline) };
}

/* ─────────────────────────────── 自測五臂 ─────────────────────────────── */

/**
 * R10 的入場費在這裡兌現。五臂，每一臂各自回答一個不同的問題：
 *
 *   1. 探針自證  — 偵測器本身在工作嗎（正向＋負向兩個對照組，不等價）
 *   2. 分母臂    — 走訪了幾個檔、家族解析出幾個成員、排除了幾個
 *   3. 綠臂      — 一組全部真的碰到邊界的成員，回 0
 *   4. 紅臂      — 語料裡的形狀 D 標本被抓到，回 1
 *   5. 金絲雀    — 把一個**已知真實作**的邊界呼叫拿掉，它必須從綠轉紅
 *   6. 空集合臂  — 家族解析出 0 個成員 → 2（不是 0）
 *   7. 探針失效臂 — 餵一個壞掉的 surface → 2（不是 0，也不是「全部都紅」）
 *
 * 為什麼金絲雀與紅臂是兩臂：紅臂證明**語料裡本來就有的**標本會被抓；
 * 金絲雀證明**一個原本會過的檔案被改壞時**會被抓。第二件事才是這道閘門
 * 在真實 repo 裡每天要做的工作，而它可能在紅臂仍然通過的情況下壞掉
 * （例如判定意外綁死在檔名或路徑上）。
 */
function selfTest() {
  let pass = true;
  const say = (ok, label, detail = '') => {
    console.log(`  ${ok ? '✓' : '✗'} ${label}${detail ? `\n      ${detail}` : ''}`);
    pass &&= ok;
  };

  const surface = deriveBoundarySurface();
  const probe = verifyProbeIsWorking(surface, { boundary: new Set(), inert: new Set() });
  for (const l of probe.lines) console.log(l);
  pass &&= probe.ok;

  const redCfg = join(FIXTURES, 'effect-boundary.json');
  const greenCfg = join(FIXTURES, 'effect-boundary.green.json');
  const emptyCfg = join(FIXTURES, 'effect-boundary.empty.json');

  // 2. 分母臂
  const red = runOnce(redCfg);
  const fam = red.result.families?.[0];
  const denomOk = red.result.walked > 0 && red.result.totalMembers > 0 && red.result.totalExcluded > 0;
  say(
    denomOk,
    `denominator: walked ${red.result.walked} source file(s), family '${fam?.name}' matched ${fam?.matched}, ` +
      `excluded ${red.result.totalExcluded}, members ${red.result.totalMembers}`,
    denomOk ? '' : 'a zero anywhere here means the corpus was not actually read'
  );

  // 3. 綠臂
  const green = runOnce(greenCfg);
  say(
    green.exitCode === 0,
    `green arm: a family whose members all reach a real boundary exits ${green.exitCode} (want 0)`,
    green.exitCode === 0 ? '' : green.lines.join('\n      ')
  );

  // 4. 紅臂
  const redMembers = red.result.families.flatMap((f) => f.members);
  const hollow = redMembers.find((m) => m.file.endsWith('shape-d/hollow.provider.ts'));
  const abuse = redMembers.find((m) => m.file.endsWith('shape-d/exemption-abuse.provider.ts'));
  const honest = redMembers.find((m) => m.file.endsWith('honest.provider.ts'));
  const delegates = redMembers.find((m) => m.file.endsWith('delegates.provider.ts'));
  say(
    red.exitCode === 1 && hollow?.verdict === 'RED',
    `red arm: the shape-D specimen (${hollow?.file}) is judged ${hollow?.verdict}, run exits ${red.exitCode} (want RED / 1)`
  );
  say(
    abuse?.verdict === 'RED',
    `red arm (R7-b abuse): NOT_IMPLEMENTED + ok:true is judged ${abuse?.verdict} (want RED) — the marker alone must not buy an exemption`
  );
  say(
    honest?.verdict === 'EXEMPT-HONEST',
    `R7-b: honest non-implementation is judged ${honest?.verdict} (want EXEMPT-HONEST) — otherwise the allowlist gets reinvented`
  );
  say(
    delegates?.verdict === 'GREEN' && delegates?.graphSize > 1,
    `call graph: a member that delegates its boundary call is ${delegates?.verdict} across ${delegates?.graphSize} file(s) (want GREEN, >1)`
  );

  // 5. 金絲雀：把一個已知真實作的邊界呼叫拿掉，必須從綠轉紅
  const canaryFile = join(FIXTURES, 'providers', 'runs-process.provider.ts');
  const original = readFileSync(canaryFile, 'utf8');
  let canaryOk = false;
  let canaryDetail = '';
  try {
    const beforeMember = green.result.families
      .flatMap((f) => f.members)
      .find((m) => m.file.endsWith('runs-process.provider.ts'));
    const mutated = original
      .replace("import { spawnSync } from 'node:child_process';", 'const spawnSync = (..._a: unknown[]) => ({ status: 0 });')
      .replace(/^/, '// MUTATED BY --self-test. If you are reading this in git status, the run was interrupted.\n');
    writeFileSync(canaryFile, mutated, 'utf8');
    const after = runOnce(greenCfg);
    const afterMember = after.result.families
      .flatMap((f) => f.members)
      .find((m) => m.file.endsWith('runs-process.provider.ts'));
    canaryOk =
      beforeMember?.verdict === 'GREEN' && afterMember?.verdict === 'RED' && after.exitCode === 1;
    canaryDetail =
      `${canaryFile.replace(CLI_ROOT + '/', '')}: ${beforeMember?.verdict}(${beforeMember?.hitCount} hits) → ` +
      `${afterMember?.verdict}(${afterMember?.hitCount} hits), run exit ${green.exitCode} → ${after.exitCode}`;
  } finally {
    writeFileSync(canaryFile, original, 'utf8');
  }
  say(canaryOk, 'canary: removing the boundary call from a known-real implementation turns it red', canaryDetail);

  // 5b. R7-c 金絲雀：把一個真實作的網域換成不屬於我方的，必須轉紅。
  // 沒有這一臂，R7-c 的整條判定路徑從未在任何一次執行裡真的觸發過——
  // 而「0 個違規」與「違規偵測從來沒被執行」印出同一行綠。
  const domainFile = join(FIXTURES, 'providers', 'writes-files.provider.ts');
  const domainOriginal = readFileSync(domainFile, 'utf8');
  let domainRedOk = false;
  let domainDetail = '';
  try {
    writeFileSync(
      domainFile,
      domainOriginal.replace('fixtures.uds-effect-boundary.test', 'cdn.not-a-domain-we-hold.example'),
      'utf8'
    );
    const after = runOnce(greenCfg);
    const v = after.result.domainAudit?.violations ?? [];
    domainRedOk = after.exitCode === 1 && v.length === 1 && v[0].registrable === 'not-a-domain-we-hold.example';
    domainDetail = `exit ${green.exitCode} → ${after.exitCode}, violations ${v.length}: ${v.map((d) => d.host).join(', ') || '(none)'}`;
  } finally {
    writeFileSync(domainFile, domainOriginal, 'utf8');
  }
  say(domainRedOk, 'canary (R7-c): a concatenated domain the org does not own turns the run red', domainDetail);

  // 5c. R7-c 讀不到清單臂
  const unreadable = runOnce(join(FIXTURES, 'effect-boundary.unreadable-domains.json'));
  say(
    unreadable.exitCode === 2,
    `unreadable-owned-list arm: ownedDomains declared but unresolvable exits ${unreadable.exitCode} (want 2)`,
    unreadable.exitCode === 2 ? '' : 'reading nothing must not be reported as "nothing is wrong"'
  );

  // 6. 空集合臂
  const empty = runOnce(emptyCfg);
  say(
    empty.exitCode === 2,
    `empty-collection arm: a family glob matching nothing exits ${empty.exitCode} (want 2, never 0)`,
    empty.exitCode === 2 ? '' : empty.lines.join('\n      ')
  );

  // 6b. 第三態臂：零命中 ＋ 無法分類的外部相依 → 2（既非 fail-open 也非誣告）
  const undec = runOnce(join(FIXTURES, 'effect-boundary.undecidable.json'));
  const undecMember = undec.result.families?.[0]?.members?.[0];
  say(
    undec.exitCode === 2 && undecMember?.verdict === 'UNDECIDABLE',
    `undecidable arm: zero hits + an unclassifiable package is ${undecMember?.verdict}, exits ${undec.exitCode} (want UNDECIDABLE / 2)`
  );

  // 7. 探針失效臂：餵一個壞掉的 surface
  const brokenSurface = { ...surface, modules: new Set(), moduleFamily: new Map(), familyStats: surface.familyStats.map((f) => ({ ...f, matched: 0 })), globals: [] };
  const broken = runOnce(greenCfg, { surface: brokenSurface });
  say(
    broken.exitCode === 2,
    `broken-probe arm: a detector that can see no boundary at all exits ${broken.exitCode} (want 2, not 0 and not "everything is red")`
  );

  console.log(pass ? '[effect-boundary] self-test passed' : '[effect-boundary] self-test FAILED');
  return pass ? 0 : 2;
}

/* ──────────────────────────────── main ──────────────────────────────── */

let exitCode;
if (SELF_TEST) {
  exitCode = selfTest();
} else {
  const configPath = resolve(argValue('--config') ?? join(process.cwd(), DEFAULT_CONFIG_PATH));
  const run = runOnce(configPath);
  if (JSON_OUT) {
    console.log(JSON.stringify({ exitCode: run.exitCode, report: run.lines, result: run.result }, null, 2));
  } else {
    for (const l of run.lines) console.log(l);
  }
  exitCode = run.exitCode;
}
process.exit(exitCode);
