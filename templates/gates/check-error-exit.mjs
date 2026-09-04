#!/usr/bin/env node
// SPDX-License-Identifier: MIT
//
// ─────────────────────────────────────────────────────────────────────────────
// 錯誤訊息單一出口閘門　　可攜版（複製到任何專案，只改下面的 CONFIG）
// ─────────────────────────────────────────────────────────────────────────────
//
// 它防的是什麼：
//   2026-09-03 使用者照著建議打上企業名稱，畫面回他一句 `Bad Request`。
//   真正的原因寫在回應的 `details` 裡，而呼叫端只讀了 `error`——把它丟掉了。
//   當天的修法改了**一個**呼叫端；隔天走訪整個前端，同型的有 24 處，
//   其中三處就在當時打開的那個檔案裡，一處只在往下十行。
//   **「修好了」與「修好了其中一個」在畫面上無從分辨**，因為壞的在別的頁面。
//
// 它怎麼防：
//   規則收進一個檔案（單一出口），其餘每一處都必須經過它。
//   這支腳本走訪整個專案，找「有人自己把錯誤物件的欄位拼成字串」。
//
// 為什麼是獨立腳本而不是一支測試：
//   測試框架每個專案不一樣（vitest／jest／node:test），而這道規則跟框架無關。
//   寫成 .mjs 就不必在意目標專案用哪一套，也不必在意測試檔要放哪個目錄。
//
// 用法：
//   node scripts/check-error-exit.mjs              走訪並檢查
//   node scripts/check-error-exit.mjs --self-test  只驗判別式自己
//   node scripts/check-error-exit.mjs --json       機器可讀輸出
//
// 退出碼：0 通過｜1 有違規（或宣告與事實不符）｜2 量不到（沒設定、走訪不到東西）
//   🔴 2 也是不通過。在一道會擋的閘門裡，如果「解析不了」放行，
//      那弄壞設定就成了繞過的方法。

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

// ═══════════════════════════════════════════════════════════════════════════
// CONFIG —— 複製到新專案後，要動的只有這一塊
// ═══════════════════════════════════════════════════════════════════════════
const CONFIG = {
  /**
   * 🔴 沒填就是沒設定，而沒設定會 exit 2，**不會安靜地通過**。
   * 一支在新專案裡靜靜回綠的閘門，跟一支根本沒裝的閘門無從分辨。
   */
  configured: false,

  /** 走訪哪些目錄（相對 repo 根）。 */
  scanDirs: ["src"],

  /** 規則住在哪個檔案。它是唯一被允許讀那些欄位的地方。 */
  singleExit: null,

  /** 走訪時跳過的目錄名。 */
  skipDirs: ["node_modules", "dist", "build", ".vite", "__tests__", "coverage"],

  /** 副檔名。 */
  extensions: [".ts", ".tsx", ".js", ".jsx", ".mjs"],

  /** 走訪至少要看到幾個檔——低於這個數代表走訪器壞了，而那與「全部通過」輸出相同。 */
  minFilesScanned: 10,

  /**
   * 這個專案根本不把錯誤回應轉成文字時填這裡（例如純資料處理的函式庫）。
   * 🔴 **這個宣告本身會被驗證**：填了之後腳本會去找專案有沒有在讀 HTTP 回應，
   *    找得到就代表宣告是假的，exit 1。不驗證的宣告只是一個有禮貌的關閉開關。
   * 形狀：{ reason: "……", declaredOn: "YYYY-MM-DD" }
   */
  notApplicable: null,
};
// ═══════════════════════════════════════════════════════════════════════════

/**
 * 判別式：抓「把錯誤物件的欄位當成給人看的字串」。
 *
 * ⚠️ 刻意**不**抓 `e instanceof Error ? e.message : "…"` 與 `e?.message ?? "…"`——
 *    那些讀的是 JS 的 Error 物件，不是回應的 body。抓進來這道閘門就沒有人滿足得了，
 *    而滿足不了的閘門的下場是被關掉。
 *
 * ⚠️ 也刻意**不**抓後備值是 null／undefined 的——那是成功路徑在讀選填欄位。
 *    每加一個排除項就要說出它把問題改成了什麼：這裡把問題從「有沒有讀 message」
 *    改成「**有沒有把 message 當成給人看的錯誤字串**」。
 *
 * ⚠️ 排除項必須寫成 `\?\?(?!\s*(?:null|undefined)\b)`，不能寫成 `\?\?\s*(?!null\b)`：
 *    後者的 `\s*` 會回溯成零寬，讓否定環顧在空白處成立而整個排除失效。
 *    **這個 bug 是下面的反臂抓到的，不是看出來的。**
 */
export function findsHandRolledErrorText(src) {
  const re = /\b[A-Za-z_$][\w$]*\.(?:error|message)\s*\?\?(?!\s*(?:null|undefined)\b)/g;
  return (src.match(re) ?? []).length;
}

/** 「這個專案有沒有在讀 HTTP 回應」——用來驗證 notApplicable 的宣告是不是真的。 */
export function readsHttpResponses(src) {
  return /\bfetch\s*\(|\bres(?:ponse)?\.json\s*\(|\baxios\b|\bgot\s*\(/.test(src);
}

function walk(dirs) {
  const out = [];
  const skip = new Set(CONFIG.skipDirs);
  const isTest = (n) => /\.(test|spec)\.[jt]sx?$/.test(n);
  const visit = (dir) => {
    let entries;
    try {
      entries = readdirSync(dir);
    } catch {
      return; // 目錄不存在——由 minFilesScanned 那道分母臂負責報告
    }
    for (const name of entries) {
      const full = join(dir, name);
      let st;
      try {
        st = statSync(full);
      } catch {
        continue;
      }
      if (st.isDirectory()) {
        if (!skip.has(name)) visit(full);
        continue;
      }
      if (!CONFIG.extensions.some((e) => name.endsWith(e))) continue;
      if (isTest(name)) continue;
      out.push(full);
    }
  };
  for (const d of dirs) visit(join(REPO_ROOT, d));
  return out;
}

// ── 自我測試：一個從未被觀察到會紅的閘門，與一個永遠回綠的閘門無從分辨 ──────
function selfTest() {
  const arms = [
    [
      "正臂：抓得到真實的四種寫法",
      () => {
        const a = findsHandRolledErrorText("throw new Error(body.error ?? `HTTP ${res.status}`)") === 1;
        const b = findsHandRolledErrorText('setError(data.error ?? "無法開始登入。")') === 1;
        const c = findsHandRolledErrorText("throw new Error(err.message ?? err.error ?? `HTTP ${s}`)") === 2;
        const d = findsHandRolledErrorText("throw new Error(retryErr.error ?? `HTTP ${s}`)") === 1;
        return a && b && c && d;
      },
    ],
    [
      "🔴 負臂：JS Error 物件的讀法不得被抓（抓了這閘門就沒人滿足得了）",
      () =>
        findsHandRolledErrorText('setError(e instanceof Error ? e.message : "載入失敗")') === 0 &&
        findsHandRolledErrorText('setError(e?.message ?? "Failed to load")') === 0 &&
        findsHandRolledErrorText("throw new Error(await readApiError(res))") === 0,
    ],
    [
      "🔴 負臂：成功路徑讀選填欄位不算（首跑抓到的假陽性）",
      () =>
        findsHandRolledErrorText("setModelListMessage(body.message ?? null)") === 0 &&
        findsHandRolledErrorText("const m = body.message ?? undefined;") === 0 &&
        findsHandRolledErrorText('const m = body.message ?? "失敗";') === 1,
    ],
    [
      "宣告驗證臂：偵測得到專案有在讀 HTTP 回應",
      () =>
        readsHttpResponses('const r = await fetch("/api/x");') === true &&
        readsHttpResponses("const b = await res.json();") === true,
    ],
    [
      "🔴 宣告驗證的負臂：純計算的檔案不得被判為有讀回應",
      () => readsHttpResponses("export const add = (a, b) => a + b;") === false,
    ],
    [
      // ⚠️ 尚未設定、或宣告不適用時，這一臂沒有東西可量。它會**明說自己被跳過**，
      //    不會靜靜回綠——「跳過」與「通過」在輸出上要分得出來。
      CONFIG.configured && !CONFIG.notApplicable
        ? "分母臂：走訪拿得到檔案（0 與『全部通過』的輸出相同）"
        : "分母臂：跳過（尚未設定或已宣告不適用，沒有東西可走訪）",
      () =>
        !CONFIG.configured || CONFIG.notApplicable !== null || walk(CONFIG.scanDirs).length >= CONFIG.minFilesScanned,
    ],
  ];
  let failed = 0;
  console.log("[error-exit --self-test]");
  for (const [name, fn] of arms) {
    let ok = false;
    // ⚠️ 用另一個變數，不要改 name——它是 for-of 解構出來的 const。
    //    第一版直接 `name += …`，而那條路徑**只有在某個臂擲出例外時才會走到**，
    //    也就是自我測試自己的錯誤處理是壞的，而平常永遠看不出來。lint 抓到的。
    let note = "";
    try {
      ok = fn() === true;
    } catch (e) {
      ok = false;
      note = ` （擲出例外：${e.message}）`;
    }
    console.log(`  ${ok ? "✓" : "✗"} ${name}${note}`);
    if (!ok) failed++;
  }
  console.log(`[error-exit --self-test] 通過 ${arms.length - failed}／失敗 ${failed}`);
  return failed === 0 ? 0 : 2;
}

// ── 主流程 ────────────────────────────────────────────────────────────────
function main() {
  const argv = process.argv.slice(2);
  if (argv.includes("--self-test")) return selfTest();
  const asJson = argv.includes("--json");
  const say = (s) => {
    if (!asJson) console.log(s);
  };
  const emit = (verdict, extra = {}) => {
    if (asJson) console.log(JSON.stringify({ verdict, ...extra }, null, 2));
    return verdict === "pass" ? 0 : verdict === "violations" ? 1 : 2;
  };

  // 狀態一：沒設定。**不是通過。**
  if (!CONFIG.configured) {
    say("[error-exit] ✗ 這個專案還沒指定它的錯誤訊息單一出口。");
    say("            打開 scripts/check-error-exit.mjs 的 CONFIG 區塊，填 scanDirs 與 singleExit，");
    say("            然後把 configured 改成 true。真的用不到就填 notApplicable（要寫理由）。");
    say("            🔴 這裡刻意不放行：一支在新專案裡靜靜回綠的閘門，跟沒裝無從分辨。");
    return emit("unmeasurable", { why: "not-configured" });
  }

  // 狀態二：宣告不適用——而宣告本身要被驗證。
  if (CONFIG.notApplicable) {
    const { reason, declaredOn } = CONFIG.notApplicable;
    if (!reason || !declaredOn) {
      say("[error-exit] ✗ notApplicable 要同時有 reason 與 declaredOn。沒有理由的豁免只是關閉開關。");
      return emit("unmeasurable", { why: "declaration-incomplete" });
    }
    const files = walk(CONFIG.scanDirs);
    const talkers = files.filter((f) => readsHttpResponses(readFileSync(f, "utf8")));
    say(`[error-exit] 宣告不適用（${declaredOn}）：${reason}`);
    say(`             走訪 ${files.length} 個檔驗證這個宣告——不驗證的宣告只是有禮貌的關閉開關。`);
    if (talkers.length > 0) {
      say(`[error-exit] ✗ 宣告與程式碼不符：${talkers.length} 個檔在讀 HTTP 回應。`);
      for (const t of talkers.slice(0, 5)) say(`             · ${relative(REPO_ROOT, t)}`);
      return emit("violations", { why: "false-declaration", files: talkers.map((t) => relative(REPO_ROOT, t)) });
    }
    say("[error-exit] ✓ 宣告成立：走訪範圍內沒有任何檔案在讀 HTTP 回應。");
    return emit("pass", { state: "not-applicable" });
  }

  // 狀態三：正常走訪。
  //
  // 🔴 singleExit 允許是 null，而這**不是**一個放水的開關。
  //    2026-09-04 把這道閘門裝進另外三個 repo 時才發現：它們今天都是 0 處。
  //    要求它們先生一個「單一出口」檔案出來，等於逼一個**沒有任何呼叫端的模組**誕生，
  //    而那正是我們在別的地方花整整一份規格在抓的東西（可達、但沒有人用）。
  //    正確的語意是：**這道閘門要防的是第二處，不是第一處。**
  //      · 有指定出口 → 除了它，其餘一律 0。
  //      · 沒指定出口 → 最多容許 1 個檔（那個檔按定義就是出口）；出現第 2 個就紅，
  //        並且當場告訴你「現在有兩個了，挑一個當出口、其餘接過去」。
  const hasDesignatedExit = typeof CONFIG.singleExit === "string" && CONFIG.singleExit.length > 0;
  if (hasDesignatedExit && !existsSync(join(REPO_ROOT, CONFIG.singleExit))) {
    say(`[error-exit] ✗ 指定的單一出口不存在：${CONFIG.singleExit}`);
    say("            檔案被搬走或改名時，這道閘門會變成在檢查一個不存在的規則。");
    return emit("unmeasurable", { why: "single-exit-missing" });
  }

  const files = walk(CONFIG.scanDirs);
  say(`[error-exit] 走訪 ${CONFIG.scanDirs.join("、")} 共 ${files.length} 個非測試檔`);
  if (files.length < CONFIG.minFilesScanned) {
    say(`[error-exit] ✗ 只走訪到 ${files.length} 個檔（下限 ${CONFIG.minFilesScanned}）。`);
    say("            🔴 走訪不到東西與『全部通過』的輸出一模一樣，所以這裡當成量不到，不當成通過。");
    return emit("unmeasurable", { why: "denominator-too-small", scanned: files.length });
  }

  const exitRel = hasDesignatedExit ? CONFIG.singleExit.split("/").join(sep) : null;
  const carriers = []; // 含有那個形狀的檔（不含指定出口）
  for (const f of files) {
    const rel = relative(REPO_ROOT, f);
    if (exitRel !== null && rel === exitRel) continue; // 規則本身住的地方
    const hits = findsHandRolledErrorText(readFileSync(f, "utf8"));
    if (hits > 0) carriers.push({ file: rel, hits });
  }

  // ── 有指定出口：其餘一律 0 ──────────────────────────────────────────────
  if (hasDesignatedExit) {
    if (carriers.length > 0) {
      say(`[error-exit] ✗ ${carriers.length} 個檔自己把錯誤回應拼成字串：`);
      for (const o of carriers) say(`             · ${o.file}（${o.hits} 處）`);
      say(`             改成經過 ${CONFIG.singleExit}——理由見那個檔的檔頭。`);
      return emit("violations", { offenders: carriers });
    }
    say(`[error-exit] ✓ ${files.length} 個檔裡，只有 ${CONFIG.singleExit} 在讀那些欄位。`);
    say("             本閘門**沒有**證明的事：那個出口自己寫對了沒有。");
    say("             出口的優先順序若反了，所有呼叫端會一致地錯而這裡全綠——那是它自己單元測試的工作。");
    return emit("pass", { scanned: files.length, exit: CONFIG.singleExit });
  }

  // ── 尚未指定出口：容許 1 個，第 2 個就是重複的開始 ──────────────────────
  if (carriers.length > 1) {
    say(`[error-exit] ✗ ${carriers.length} 個檔各自把錯誤回應拼成字串，而還沒有指定的單一出口：`);
    for (const o of carriers) say(`             · ${o.file}（${o.hits} 處）`);
    say("             挑其中一個當出口（或新開一個），其餘接過去，然後把 CONFIG.singleExit 填上。");
    say("             🔴 本閘門防的是**第二處**：第一處是實作，第二處開始是各寫各的。");
    return emit("violations", { offenders: carriers, why: "duplication-without-exit" });
  }
  if (carriers.length === 1) {
    say(`[error-exit] ✓ 只有一個檔在做這件事：${carriers[0].file}`);
    say("             它按定義就是這個 repo 的單一出口。出現第二個時本閘門會紅。");
    say("             把 CONFIG.singleExit 填成它，可以讓這件事變成明講的而不是碰巧的。");
    return emit("pass", { scanned: files.length, deFactoExit: carriers[0].file });
  }
  say(`[error-exit] ✓ 走訪 ${files.length} 個檔，還沒有任何地方在把錯誤回應拼成字串。`);
  say("             這個類別目前是空的——第一個成員出現時不會紅（那是實作），");
  say("             第二個出現時會紅（那是重複）。**不是空轉：它在等第二處。**");
  return emit("pass", { scanned: files.length, state: "class-empty" });
}

process.exit(main());
