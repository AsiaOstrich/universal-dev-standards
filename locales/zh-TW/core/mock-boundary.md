---
source: ../../../core/mock-boundary.md
source_version: 1.3.0
translation_version: 1.3.0
last_synced: 2026-10-28
source_hash: b95f3da59a8e
status: current
---

# Mock 邊界標準

> **Language**: [English](../../../core/mock-boundary.md) | 繁體中文

**版本**: 1.3.0
**最後更新**: 2026-10-28
**適用範圍**: 所有具備單元測試與整合測試的軟體專案
**Scope**: universal
**產業標準**: ISTQB Foundation（Test Doubles）, xUnit Patterns（Gerard Meszaros）
**參考資料**: "Working Effectively with Legacy Code"（Feathers）, "Growing Object-Oriented Software"（Freeman & Pryce）

---

## 目的

本文件定義測試中哪些東西可以 mock、哪些不可以。其目標是防止**空心測試（hollow tests）**——永遠通過卻無法偵測真實 bug 的測試，因為它們用 stub 取代了系統的邏輯。

---

## 空心測試問題

空心測試 mock 掉系統的大部分內容，使測試變成 mock 接線的規格說明，而非系統行為的規格說明。經典症狀：你可以刪掉實作檔案，測試仍然通過。

**真實案例（Multi-agent pipeline SPEC-002.test.ts）**:

```typescript
vi.mock('../../src/runner/agent-runner.js')      // Core logic replaced
vi.mock('../../src/runner/guardian-hooks.js')     // Core logic replaced
vi.mock('../../src/runner/prototyper.js')         // Core logic replaced
vi.mock('../../src/runner/iteration-report.js')   // Core logic replaced
vi.mock('../../src/memory/memory-store.js')       // Core logic replaced
vi.mock('node:fs/promises', ...)                  // I/O replaced

// All assertions verify mock call counts — not actual outputs.
// runPipeline() touches zero real code.
```

---

## 可以 Mock 的項目

| 類別 | 範例 | 理由 |
|------|------|------|
| 外部 HTTP 服務 | LLM API、金流閘道、email 服務 | 防止不穩定（flaky）測試；可控制回應情境 |
| 時間函式 | `Date.now()`、`new Date()`、`setTimeout` | 使測試具確定性 |
| 環境變數 | `process.env.NODE_ENV`、`process.env.LICENSE_KEY` | 支援組態變化 |
| 檔案系統（僅限單元測試） | `fs.readFile`、`fs.writeFile` | 讓快速單元測試避免 I/O |
| 跨模組邊界（須有對應 IT） | 其他模組的 public API | 隔離受測單元 |
| 行程內背景執行（透過可注入 runner） | `Task.Run`、unawaited promise、`setTimeout`、goroutine、thread-pool dispatch | 注入 runner seam 讓測試能 await 到確定完成，消除 race |

---

## 不可 Mock 的項目

| 類別 | 違規範例 | 禁止原因 |
|------|---------|---------|
| 自身模組的核心邏輯 | 在 pipeline-runner 測試中 `vi.mock('./pipeline-runner.js')` | 使測試形同虛設 |
| IT/flow/E2E 測試中的資料庫 | 在整合測試中 `vi.mock('./db/client.js')` | 隱藏查詢 bug、schema 問題 |
| HTTP 框架內部 | `vi.mock('express')` | 真實路由可能已壞 |
| 安全控制 | 永遠通過的 auth middleware stub | 安全性回歸不可見 |

---

## 可注入的背景執行（Injectable Background Execution）

fire-and-forget 的背景工作（`Task.Run`、unawaited promise、`setTimeout`、goroutine、`java.util.concurrent` executor 提交，或 `asyncio.create_task`）是一個 **seam**，就跟系統時鐘一樣。正如你注入 clock 而非讀取 wall-clock 時間，你也應注入背景 dispatcher，而非直接生出背景工作。這讓測試能把工作驅動到**確定、可被 await 的完成**，並斷言其結果（成功、例外或 retry）——不用 poll、不用 sleep、沒有 race。

把 dispatch 抽象成一個小介面（例如 `IBackgroundTaskRunner` / `BackgroundDispatcher`），再提供兩種實作：

- **Production**：保留真正的 fire-and-forget 語意——dispatch 立即回傳，工作以 detached 方式執行。
- **Test**：以 **inline** 方式執行工作並**追蹤底層 Task/promise**，對外暴露一個 handle 讓測試能 `await`，使完成（與任何失敗）可被觀察。

語言中立示意（TypeScript pseudo-code）：

```typescript
// Seam — 於任何 dispatch 背景工作處注入
interface BackgroundDispatcher {
  dispatch(work: () => Promise<void>): void
}

// Production：真正的 fire-and-forget——立即回傳，工作以 detached 執行
class FireAndForgetDispatcher implements BackgroundDispatcher {
  dispatch(work: () => Promise<void>): void {
    void work() // 刻意不 await
  }
}

// Test：inline 執行 + 追蹤 task，讓測試能 await 到完成
class DeterministicDispatcher implements BackgroundDispatcher {
  private readonly tasks: Promise<void>[] = []
  dispatch(work: () => Promise<void>): void {
    this.tasks.push(work()) // inline 啟動並保留 handle
  }
  async settle(): Promise<void> {
    await Promise.all(this.tasks) // 測試 await 到確定完成
  }
}
```

測試注入 `DeterministicDispatcher`，執行受測程式碼，再於斷言結果前 `await dispatcher.settle()`——背景副作用此時已完全可觀察且具確定性。

---

## 攔截型 Hook：測宿主的入口，不是測比對函式

**hook** 是 AI 宿主（Claude Code、Codex、Gemini CLI、Antigravity CLI 等）在生命週期事件上執行的腳本。有些 hook 能**擋下**宿主原本要做的事：拒絕一次工具呼叫、拒絕一則提示、不讓一個回合結束。對這類 hook，空心測試根本不需要任何 mock——測試只是從來沒碰到宿主會呼叫的入口。

hook 有兩層。**判斷層**決定這條指令危不危險；**接線層**讀宿主送來的 stdin 資料，並用宿主會讀的訊號回答（結束碼，或標準輸出的 JSON）。匯入判斷函式的單元測試只練到第一層，而宿主讀的是第二層。結束碼錯、欄位名稱讀錯、輸出格式宿主不認，這些都不會讓那支測試變紅。

### 反例：UDS 自己的危險指令 hook，擋下 0／26

`scripts/hooks/check-dangerous-cmd.mjs` 是 PreToolUse hook。偵測到危險指令時它 `exit 1`。Claude Code 只有 `exit 2` 才擋下工具呼叫；其他非 0 結束碼都是不阻擋的 hook 錯誤，指令照樣執行。它的測試匯入比對函式（`isDangerousCommand()`）直接呼叫，所以綠了好幾個月。

重播 11,617 次真實 shell 呼叫（2026-10-27），規則 `rm -rf /` 命中 26 次，宿主擋下 **0** 次。26 次中有 25 次是無害的暫存清理，例如 `rm -rf /tmp/x`；沒有任何一次是真的要清空根目錄。同一個規則還漏掉 `rm -fr /` 與 `rm -r -f /`。修正與入口測試在 PR #281 出貨。

### 規則

**H1（MUST）**：能擋下工具呼叫、提示或回合的 hook，至少要有一支測試同時做到下列三件事：

1. **另起行程執行 hook**，用宿主設定檔裡執行它的同一個指令。啟動腳本算數；匯入不算。
2. **在 stdin 送入宿主自己的資料**，欄位名稱用該宿主的（見下表：Claude Code 送 `tool_name`／`tool_input`，Antigravity 送 `toolCall`）。照作者想像的宿主格式做出來的資料什麼也證明不了。
3. **斷言宿主據以判斷的訊號**：確切的結束碼，或宿主在標準輸出解析的 JSON。「非 0」「有錯誤結束」「stderr 含某個字」都不算：exit 1 是非 0，卻在 Claude Code 上什麼也沒擋。

匯入並呼叫內部函式的測試可以存在，對判斷層也有用，但**不計入** H1。

**H2（SHOULD）**：擋下的案例旁邊，用同樣方式跑一個放行的案例，並斷言宿主的放行訊號（例如 exit 0 且標準輸出為空）。一個什麼都擋的 hook 可以通過只測擋下的測試。

**H3（SHOULD）**：切斷檢查——把 hook 的擋下訊號改掉（例如 `exit 2` 改成 `exit 1`），確認入口測試變紅。維持綠色，代表那支測試沒在守接線。

H1 也適用於「唯一作用是讓宿主讀到它的訊號」的 hook，例如用 exit 2 把 stderr 送到模型面前的 PostToolUse hook。工具已經跑完、無法撤銷，但錯的結束碼一樣會讓這支 hook 無聲無息。

### 各宿主把什麼當成「已擋下」

2026-10-28 取自各宿主自己的官方文件。宿主會改這些約定；採信某一格之前請重查出處。格子寫「未查到」，是讀過該頁而頁面沒寫，不等於「沒有」。

| 宿主 | 事件 | 擋下 | 不擋下 | 出處 |
|---|---|---|---|---|
| Claude Code | PreToolUse | exit **2**（stderr 是理由）；或 exit 0 並在 stdout 輸出 `{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"..."}}` | 其他任何結束碼，**包含 1**，都是不阻擋的 hook 錯誤，動作照常進行；無效的 JSON 同理。文件寫明的例外：設定了 `onFailure: "block"` 的 hook，失敗時會擋下 | code.claude.com/docs/en/hooks：Exit code output、Exit code 2、Other exit codes、Decision control |
| Claude Code | UserPromptSubmit | exit **2**（提示不會送到模型）；或 exit 0 並在 stdout 輸出 `{"decision":"block","reason":"..."}` | 其他任何結束碼（同樣有 `onFailure: "block"` 的例外） | 同頁，Exit code 2 behavior per event |
| Claude Code | PostToolUse | 不能擋：工具已經執行。exit 2 只會把 stderr 顯示給模型 | 以擋下而言，任何結束碼都不行 | 同頁，Exit code 2 behavior per event |
| Codex | PreToolUse | exit **2** 並把理由寫到 stderr；或 stdout 輸出 `{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"..."}}`；舊式 `{"decision":"block","reason":"..."}` 也接受 | stdout 的純文字會被忽略；`permissionDecision:"ask"`、`continue:false`、`stopReason`、`suppressOutput` 尚不支援，該次 hook 執行被標為失敗而工具呼叫繼續；其他非 0 結束碼：未查到 | developers.openai.com/codex/hooks，PreToolUse |
| Codex | UserPromptSubmit | exit **2** 並把理由寫到 stderr；或 stdout 輸出 `{"decision":"block","reason":"..."}` | stdout 純文字會被當成額外脈絡；其他非 0 結束碼：未查到 | 同頁，UserPromptSubmit |
| Codex | PermissionRequest | stdout 輸出 `{"hookSpecificOutput":{"decision":{"behavior":"deny","message":"..."}}}`；任一 `deny` 即勝出 | 此事件的 exit 2：未查到；stdout 純文字會被忽略 | 同頁，PermissionRequest |
| Gemini CLI（舊版） | BeforeTool | exit **2**（stderr 是送給 agent 的理由）；或 exit 0 並在 stdout 輸出 `{"decision":"deny","reason":"..."}`（`"block"` 是別名）。文件把 JSON 形式列為優先路徑 | 其他任何結束碼只是警告，CLI 繼續 | geminicli.com/docs/hooks/reference，Global hook mechanics 與 BeforeTool |
| Gemini CLI（舊版） | BeforeAgent、BeforeModel | exit **2** 中止該回合（BeforeAgent 還會把提示從脈絡抹除；BeforeModel 跳過 LLM 呼叫）；或 `decision:"deny"` | 同上 | 同頁 |
| Antigravity CLI（`agy`） | PreToolUse | exit 0 並在 stdout 輸出 `{"decision":"deny","reason":"..."}`（「Hard blocks execution immediately」）。`decision` 欄位必填，其他值為 `allow`、`auto_approve`、`ask`、`force_ask`、`deny_unless_prior_grant`。stdin 帶的是 `toolCall.name` 與 `toolCall.args`，不是 Claude Code 的欄位名 | 結束碼語意：未查到（官方頁面沒寫）。不要假設 Claude Code 的 exit 2 適用。第三方文章宣稱任何非 0 都視為拒絕；那不是官方說法，此處不採用 | antigravity.google/docs/hooks，Input and output contract，PreToolUse |
| Cursor 與其他宿主 | 任何 | 未查到（本版未調查） | 未查到 | 無 |

Stop 類事件（Claude Code 與 Codex 的 Stop、Gemini CLI 的 AfterAgent、Antigravity 的 Stop）**不在這裡重複**。它們的擋下約定寫在 [turn-completion-integrity](turn-completion-integrity.md) 的「支援的執行環境」表，那是唯一寫下它們的地方。該表也記錄了一個 Antigravity hook 失敗後被靜默放行的案例，與本節要防的接線失敗是同一型。

### 重播驗證的是接線，不是規則

把錄下的真實呼叫重播給 hook（例如用 rules-to-guards）是檢查接線的有力方法。但它有一個每次回報結果時都必須講明的限制：若同一份規則清單同時決定「該擋」與「不該擋」，重播只證明 hook 照它的規則運作，**不證明規則本身是對的**。

0／26 之所以量得出來，是因為宿主的約定（exit 2 才擋）是 hook 之外的事實。至於「哪些指令值得擋」，手上只有 hook 自己的比對式：26 次命中都與它一致，真正的危險 0 次，而它沒涵蓋的 `rm -fr /` 永遠不會在重播裡顯示為漏掉，因為答案來源與 hook 共用同一個盲點。

所以重播的結果只能報「接線正確」或「接線錯誤」，不要由它得出「規則正確」。要對規則下結論，請去讀實際命中的指令，或另備一份不看 hook 比對式寫成的獨立答案（見 [verification-oracle](verification-oracle.md)）。

### UDS 的執行方式

UDS 在 CI 對自己出貨的 hook 檢查這條規則：`node scripts/check-hook-entry-tests.mjs`（npm 指令 `check:hook-entry-tests`），出貨的、能擋下的 hook 若沒有「啟動它、送 stdin、斷言宿主訊號」的測試就判失敗。它是靜態文字分析：只證明「形狀對的測試存在」，不證明 hook 退化時那支測試會變紅——那是 H3 的工作。

---

## 空心測試偵測

提交測試檔之前，請檢查：

1. **Mock 數量 ≥ import 數量** → 審查：至少要有一個斷言驗證實際輸出
2. **所有斷言都是 `.toHaveBeenCalled()` 系列** → 加入輸出值斷言
3. **Mock 路徑與受測對象目錄相同** → 自我引用 mock；移除之
4. **Mock 設定行數多於斷言行數** → 很可能是空心測試
5. **攔截型 hook 的測試只匯入並呼叫它的函式** → 補一支啟動 hook 並斷言宿主訊號的入口測試（見「攔截型 Hook」）

---

## 反模式

- **Total Mock Isolation**：所有 import 都被 mock；只斷言 mock 互動
- **Mock the World**：外部 + 內部 + DB + FS 在同一個測試中全部 mock
- **Orphan Mock**：跨模組 mock 卻沒有對應的整合測試
- **Security Bypass Mock**：auth/權限邏輯被換成直接放行的 stub
- **Database Mock Cascade**：DB 回傳寫死的資料，隱藏真實查詢錯誤
- **Matcher-Only Hook Test**：攔截型 hook 的測試只匯入並呼叫其判斷函式，從未照宿主的方式執行 hook。hook 什麼也沒擋，測試卻是綠的（UDS 自己的 0／26）
- **Poll/Sleep for Background Result**：用 sleep 或 poll 等待 fire-and-forget 背景工作完成。race 依然存在——timeout 只是多數時候把它遮住，同時拖慢整套測試；在共用 runner 上更會把 flakiness 洩漏進其他 MR 的 CI。改注入 deterministic runner 並 await 被追蹤的 task。

---

## 規則摘要

| 規則 | 觸發條件 | 動作 |
|------|---------|------|
| 禁止 self-mock | 測試檔 mock 自己的模組 | 移除 mock；讓真實程式碼執行 |
| IT/flow 用真實 DB | 撰寫 IT 或 flow 測試 | 使用 in-memory SQLite 或測試 schema |
| IT 對應測試 | mock 跨模組邊界 | 確保有對應的 IT 存在 |
| 禁止 mock 安全機制 | 測試涉及 auth/權限 | 使用真實測試使用者 + 真實 token |
| 空心審查 | Mock 數量 ≥ import 數量 | 加入輸出值斷言 |
| 背景工作禁止 poll/sleep | 測試斷言某個 fire-and-forget 副作用 | 注入 deterministic runner；await 被追蹤的 task |
| 攔截型 hook 要有宿主入口測試 | hook 能擋下工具呼叫、提示或回合 | 啟動它、在 stdin 送宿主的資料、斷言宿主據以判斷的結束碼或 stdout JSON |
| 重播只證明接線 | 回報把真實呼叫重播給 hook 的結果 | 報「接線正確」；除非規則另以獨立答案核對過，否則不報「規則正確」 |

---

## 與其他標準的關係

- **testing**：Mock 邊界規則適用於測試金字塔的所有測試層級
- **test-completeness-dimensions**：維度 8（AI 測試品質）引用了這些規則
- **flow-based-testing**：Flow 測試必須遵循 mock 邊界規則
- **turn-completion-integrity**：Stop 類事件的擋下約定寫在那裡；工具與提示事件的寫在本標準，兩邊都不重複對方
- **verification-oracle**：用來判斷 hook 規則對不對的答案來源，不得由 hook 自己的比對式推出

---

## 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| 1.0.0 | 2026-05-04 | 初始標準：空心測試問題、可／不可 Mock 表格、偵測、反模式、規則摘要 |
| 1.1.0 | 2026-07-01 | 新增可注入的背景執行作為 seam（平行於 clock injection）：可 Mock 表列、`可注入的背景執行` 章節、`Poll/Sleep for Background Result` 反模式，以及背景工作禁止 poll/sleep 規則（issue #143） |
| 1.3.0 | 2026-10-28 | 新增《攔截型 Hook：測宿主的入口，不是測比對函式》：H1 MUST（啟動 hook、送宿主的 stdin 資料、斷言宿主據以判斷的訊號）、H2／H3 SHOULD、各宿主擋下訊號對照表，以及「重播驗證接線、不驗證規則」的註記，並以 UDS 自己的 0／26 為反例。版本號與 `mock-boundary.ai.yaml` 對齊——該檔先前把「背景執行」那次新增記為 1.2.0，本檔記為 1.1.0 |
