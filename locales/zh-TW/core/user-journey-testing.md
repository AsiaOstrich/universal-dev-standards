---
source: ../../../core/user-journey-testing.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-06-24
source_hash: 6d57ca40bd8e
status: current
---

# 使用者旅程測試標準

> **語言**: [English](../../../core/user-journey-testing.md) | 繁體中文 | [简体中文](../../zh-CN/core/user-journey-testing.md)

**適用範圍**：具備跨越多個 user story 的多步驟、有狀態使用者流程的專案
**Scope**: universal

---

## 概述

使用者旅程測試標準定義了 **TESTPLAN** 格式，讓連貫、循序的使用者旅程成為一等公民的測試產物。驗收條件（AC）測試只能孤立地驗證單一 story，而旅程測試驗證 AC 測試做不到的事：**跨 story 的狀態連續性**——亦即一個步驟為下一個步驟留下的狀態鏈。

一條旅程在人類可讀的 `TESTPLAN-NNN.md` 中描述一次，並透過共用的 `T-NNN` 識別碼一對一對應到自動化 E2E 測試，使計畫與可執行測試套件永不脫鉤。

## 參考

| 標準／來源 | 內容 |
|----------------|---------|
| journey-test-assistant（skill） | 產生 TESTPLAN 與旅程 E2E 骨架 |
| flow-based-testing | 旅程所實例化的流程原型 |
| e2e-testing（option） | 旅程對應到的端對端執行層 |

---

## 準則

- 每個專案 MUST 至少有一份 `TESTPLAN-NNN.md` 記錄主要使用者旅程。
- TESTPLAN 步驟 MUST 循序且有狀態——每個步驟依賴前一步的狀態。
- 每份 TESTPLAN MUST 在測試步驟之前先定義 personas。
- TESTPLAN 與自動化 E2E 測試 MUST 使用相同的 `T-NNN` 識別碼。
- 旅程 E2E 測試 MUST 在環境不可用時優雅略過（skip gracefully）。
- 旅程測試涵蓋 AC 測試無法涵蓋的：跨 story 的狀態連續性。

---

## TESTPLAN 格式

- **檔名**：`TESTPLAN-NNN-<project-slug>.md`
- **位置**：`test-plans/`

### 必要區段

| 區段 | 說明 | 格式 |
|---------|-------------|--------|
| **Personas** | 定義所有測試行為者及其角色與權限 | `\| Actor \| Role \| Key Permissions \|` |
| **Environment** | 列出環境前置條件與驗證指令 | — |
| **Test Groups** | `T-NNN` 編號的測試群組，具循序依賴鏈 | — |
| **Execution Order** | 呈現 `T-NNN → T-NNN` 關係的依賴圖 | — |

### 步驟標記

| 標記 | 意義 |
|--------|---------|
| `[UI]` | 瀏覽器操作，需視覺驗證 |
| `[API]` | `curl` / API 客戶端驗證 |
| `[CHECK]` | 需確認的預期結果 |
| `[SKIP-if]` | 帶原因的條件略過 |
| `★` | 需確認的高風險步驟 |

### 步驟格式

每個步驟宣告：

- **step_id**——`T-NNN-M`（群組-步驟格式）
- **operation**——要做什麼，標註 `[MARKER]`
- **expected_result**——應發生什麼
- **precondition**——必須滿足、來自前一個 `T-NNN` 的狀態
- **depends_on**——以逗號分隔的 `T-NNN` 識別碼

---

## 自動化對應

- **原則**：每個 `T-NNN` 群組對應一個 `describe()` 區塊；每個步驟對應一個 `it()`。
- **檔案樣式**：`*.journey.spec.ts` 或 `*.journey.e2e.test.ts`。
- **共用狀態**：旅程測試 MUST 跨 `it()` 區塊使用共用 `let` 變數，使每個步驟建立於前一步的結果之上。
- **略過策略**：以 `describe.skipIf(!BASE_URL)` 保護依賴環境的測試。

---

## 旅程分類

| ID | 說明 | 必要於 |
|----|-------------|--------------|
| `platform-admin-journey` | 平台管理員設定：login → org → project → pipeline | enterprise、saas |
| `member-journey` | 組織成員：join → project access → pipeline view | enterprise、saas |
| `dev-journey` | 開發者：new project → spec → pipeline → artifact | all |

---

## 規則

| 規則 | 觸發時機 | 指示 | 優先級 |
|------|---------|-------------|----------|
| `testplan-required` | 建立新專案 | 在寫程式碼前產生 `TESTPLAN-001.md`，含 personas、environment 與主旅程步驟 | required |
| `journey-before-code` | 開始專案實作 | 先定義使用者旅程測試計畫；旅程測試作為活的驗收條件 | recommended |
| `sequential-state` | 撰寫旅程 E2E 測試 | 使用共用狀態變數（`let token, orgSlug, projectSlug`），使每步建立於前一步結果 | required |
| `graceful-skip` | 撰寫旅程 E2E 測試 | 以 `describe.skipIf(!process.env.JOURNEY_BASE_URL)` 保護，使單元 CI 略過 | required |
| `t-nnn-alignment` | 撰寫任何 E2E 測試 | 在測試描述中引用 TESTPLAN 的 `T-NNN` 識別碼以利追溯 | recommended |
| `persona-first` | 撰寫 TESTPLAN | 在撰寫任何測試步驟前先定義所有使用者 personas | required |
| `dependency-chain` | 撰寫 TESTPLAN | 每個測試群組必須宣告其 `depends_on` 清單，使執行順序明確 | required |
