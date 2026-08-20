#!/usr/bin/env node
/**
 * check-bump-sync-roundtrip — 測「跑完 bump 之後 check 必須通過」這個不變量。
 *
 * ## 為什麼存在
 *
 * `bump-version.mjs` 寫版本號，`check-version-sync.sh` 檢查版本號，
 * **而兩者各自持有一份手工維護的「哪些檔案帶版本號」清單**。
 *
 * 2026-08-20 發 6.8.0 時它們漂開了：bump 更新了 package.json、registry、manifest
 * 與三份 README，**卻不含三份 SECURITY.md**——而 check 有檢查那三份。
 * 照文件跑完 bump，check 立刻在三個檔案上變紅，**而那三個正是 bump 自己該處理的**。
 *
 * ## 這個不變量原本就有東西在守——本腳本補的是**時機**，不是有無
 *
 * `bump-version.mjs:301` 跑完會呼叫 `check-version-sync.sh`，失敗就 `exit 1`。
 * 所以 6.8.0 那天並不是「沒有訊號」，訊號有出來——**只是它在發版流程中途才出來**，
 * 逼人在最貴的那一刻停下來手改三個檔案。本腳本不新增偵測能力，它把同一個不變量
 * 從「有人真的發版時」提前到「每次 CI」。**把這支說成『補上一個不存在的檢查』
 * 會是誇大**——寫在這裡是為了讓下一個讀的人不必自己去 bump 裡確認一次。
 *
 * ## 為什麼是往返測試，不是比對兩份清單
 *
 * 比對清單要靠正規表示式從兩支腳本裡把檔名摳出來，而**那會隨任一支的寫法改變而失效**
 * ——一個看不懂新寫法的比對器會回報「兩份一致」，與真的一致無從分辨。
 *
 * 這支測的是**行為**：真的跑一次 bump，真的跑一次 check，斷言後者通過。
 * 不論任一支怎麼列舉、用什麼語言寫、將來換成自動走訪，這個不變量都成立。
 *
 * ## 安全性
 *
 * bump 會就地改檔，所以本腳本**拒絕在工作區有未提交變更時執行**——
 * 否則還原步驟會連帶丟掉別人的工作。還原用 `git checkout --` 針對
 * bump 實際動過的檔案，並在最後驗證工作區確實回到乾淨。
 *
 * 用法：
 *   node scripts/check-bump-sync-roundtrip.mjs
 *   node scripts/check-bump-sync-roundtrip.mjs --self-test
 *
 * 結束碼：
 *   0  往返通過（bump 之後 check 是綠的）
 *   1  往返失敗（bump 漏了 check 在看的某個檔案，或反之）
 *   2  跑不動（工作區不乾淨、腳本不存在、還原失敗）——**這不是綠燈**
 */

import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");
const SELF_TEST = process.argv.includes("--self-test");

// 刻意選一個沒有人會真的發布的版本號。它只在本腳本執行期間存在於工作區。
// bump-version.mjs 只接受 X.Y.Z 或 X.Y.Z-{beta,alpha,rc}.N。首版用了
// "0.0.0-roundtrip-probe" 而被它拒絕——**那個拒絕是對的**,格式閘門正在工作。
// 改用它接受的形狀,且 0.0.0 保證不與任何真實發布相撞。
const PROBE_VERSION = "0.0.0-rc.999";

function fail(msg) {
  console.error(`[bump-roundtrip] FATAL: ${msg}`);
  process.exit(2);
}

function git(args, opts = {}) {
  return execFileSync("git", ["-C", ROOT, ...args], { encoding: "utf8", ...opts });
}

function dirtyFiles() {
  return git(["status", "--porcelain"]).split("\n").filter(Boolean);
}

function restore(files) {
  if (files.length === 0) return;
  // 只還原 bump 動過的那些。**不用 `git checkout .`**——那會掃掉整個工作區。
  git(["checkout", "--", ...files]);
}

function run() {
  for (const s of ["scripts/bump-version.mjs", "scripts/check-version-sync.sh"]) {
    if (!existsSync(join(ROOT, s))) fail(`找不到 ${s} —— 這不是「不需要檢查」，是檢查不了`);
  }

  const before = dirtyFiles();
  if (before.length > 0) {
    fail(
      "工作區有未提交的變更，拒絕執行。\n" +
        "  本檢查會真的跑一次 bump 並就地改檔，再用 git checkout 還原；\n" +
        "  在髒的工作區上執行，還原步驟會連帶丟掉你未提交的工作。\n" +
        `  目前有 ${before.length} 個變更：\n    ` +
        before.slice(0, 5).join("\n    "),
    );
  }

  let touched = [];
  let checkOut = "";
  let checkOk = false;
  try {
    execFileSync(process.execPath, [join(ROOT, "scripts/bump-version.mjs"), PROBE_VERSION], {
      cwd: ROOT,
      encoding: "utf8",
      stdio: "pipe",
    });
    touched = dirtyFiles().map((l) => l.slice(3).trim());
    if (touched.length === 0) {
      restore(touched);
      fail("bump 跑完之後工作區沒有任何變更 —— 它什麼都沒改，那不是「已經是最新」");
    }
    try {
      checkOut = execFileSync("bash", [join(ROOT, "scripts/check-version-sync.sh")], {
        cwd: ROOT,
        encoding: "utf8",
        stdio: "pipe",
      });
      checkOk = true;
    } catch (e) {
      checkOut = `${e.stdout ?? ""}${e.stderr ?? ""}`;
      checkOk = false;
    }
  } finally {
    // 🔴 **在這裡重新問一次「現在哪些檔是髒的」，不要用 try 區塊裡算出的 touched。**
    // 首版用了那個變數,而它是在 bump **成功之後**才賦值的——於是 bump 中途拋例外時
    // （2026-08-20 實測過一次:bump 因變數名打錯而崩潰）,它已經改過的檔案
    // `touched` 是空的,還原什麼都不做,污染就留在工作區裡。
    // 一個「只在順利時才清理」的清理程序,正好在最需要它的時候不動作。
    const toRestore = dirtyFiles().map((l) => l.slice(3).trim());
    restore(toRestore);
    if (touched.length === 0) touched = toRestore;
    const after = dirtyFiles();
    if (after.length > 0) {
      console.error(`[bump-roundtrip] FATAL: 還原後工作區仍有 ${after.length} 個變更，請人工檢查：`);
      for (const l of after.slice(0, 10)) console.error(`    ${l}`);
      process.exit(2);
    }
  }

  console.log(`[bump-roundtrip] bump 至 ${PROBE_VERSION} 動了 ${touched.length} 個檔案，已全部還原`);
  if (checkOk) {
    console.log("[bump-roundtrip] ✓ 往返通過 —— bump 寫的與 check 看的是同一組檔案");
    return 0;
  }
  const mismatches = checkOut.split("\n").filter((l) => /MISMATCH/.test(l));
  console.log(`\n[bump-roundtrip] ✗ 往返失敗 —— bump 之後 check 仍然紅，${mismatches.length} 處：`);
  for (const m of mismatches.slice(0, 12)) console.log(`  ${m.replace(/\x1b\[[0-9;]*m/g, "")}`);
  console.log(
    "\n  意思是：**有檔案帶著版本號，而只有其中一支腳本知道它**。\n" +
      "  修法：把它加進 bump-version.mjs（若是 bump 漏了），或從 check-version-sync.sh 移除\n" +
      "  （若它其實不該帶版本號）。不要只改其中一邊就當結案——那正是本檢查存在的原因。",
  );
  return 1;
}

/**
 * 前置條件檢查。**注意它不是紅臂證明。**
 *
 * 「一支從未紅過的檢查與一支永遠回綠的檢查無從分辨」——這句話對本腳本一樣成立，
 * 而下面這幾行**證明不了**它會變紅：它們只確認兩支被測腳本存在、工作區乾淨、
 * 探針版本號安全。把這叫「自測通過」會讓人以為紅臂驗過了。
 *
 * 紅臂**是**驗過的，但用的是變異而非自測，因為本檢查沒有可分離的純邏輯可測
 * ——它整支就是「真的跑 bump、真的跑 check」。2026-08-20 實測記錄：
 *
 *   拋棄式 clone：拿掉 bump 的 SECURITY.md 段 → rc=1。**但那次是假的**，
 *     clone 沒裝 node_modules，`tsx: command not found` 讓它崩潰，
 *     rc=1 是崩潰的副產品不是往返失敗。差點就把崩潰當成證據收下。
 *   真 repo 暫存分支 tmp/mut2：同樣變異 → rc=1，且輸出指名
 *     `[MISMATCH] SECURITY.md / locales/zh-TW/SECURITY.md / locales/zh-CN/SECURITY.md`
 *     ——完整重現 6.8.0 當天的真實失敗。跑完工作區乾淨，分支已刪。
 *
 * 下次改動 bump 或 check 的檔案清單邏輯時，**紅臂要重驗一次**，
 * 方式同上：暫存分支 → 拿掉 bump 的某一段 → 確認 rc=1 且指名該段的檔案。
 */
function selfTest() {
  let pass = true;
  const check = (ok, label) => {
    console.log(`  ${ok ? "✓" : "✗"} ${label}`);
    pass &&= ok;
  };
  check(existsSync(join(ROOT, "scripts/bump-version.mjs")), "bump-version.mjs 存在");
  check(existsSync(join(ROOT, "scripts/check-version-sync.sh")), "check-version-sync.sh 存在");
  check(dirtyFiles().length === 0, "工作區乾淨（本檢查的前提，髒的話它會拒跑而不是誤判）");
  check(/^0\.0\.0-/.test(PROBE_VERSION), "探針版本號不會與任何真實發布相撞");
  console.log(
    pass
      ? "[bump-roundtrip] 前置條件齊備（這不是「紅臂已驗」——見上方 docblock）"
      : "[bump-roundtrip] 前置條件不成立，本檢查跑不動",
  );
  return pass ? 0 : 2;
}

process.exit(SELF_TEST ? selfTest() : run());
