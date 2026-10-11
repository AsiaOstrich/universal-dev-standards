---
source: ../../../../skills/commands/e2e.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: 3f1c7685057c
status: current
---

---
description: "[UDS] 從 BDD 場景生成 E2E 測試骨架，支援框架偵測"
allowed-tools: Read, Write, Grep, Glob, Bash(npm test:*)
argument-hint: "[feature-file | --analyze] [options]"
status: experimental
---

# E2E 助手

> [!WARNING]
> **實驗性功能 / Experimental Feature**
>
> 此功能正在積極開發中，可能在 v4.0 中有重大變更。
> This feature is under active development and may change significantly in v4.0.

從 BDD `.feature` 場景生成 E2E 測試骨架。偵測專案框架、分析既有測試模式，並產出框架適配的骨架與 `[TODO]` 標記。

## 用法

```bash
/e2e <feature-file>            # 從 BDD 場景生成 E2E 骨架（預設模式）
/e2e <spec-file>               # 從 SDD 規格委派 /derive e2e
/e2e --analyze                 # 掃描所有 feature 的 E2E 覆蓋差距
/e2e --analyze <feature-file>  # 分析特定 feature 的 AC 適用性
```

## 選項

| 選項 | 說明 |
|------|------|
| `<feature-file>` | `.feature` 檔案路徑 |
| `<spec-file>` | `SPEC-XXX.md` 規格路徑（委派至 `/derive e2e`） |
| `--analyze` | 執行覆蓋差距分析模式 |

## 工作流程

### 生成模式

```
1. 解析 .feature 檔案 → 擷取場景
2. 分類每個場景 → e2e / integration / unit 適用
3. 偵測 E2E 框架 → Playwright / Cypress / Vitest
4. 分析既有 E2E 模式 → imports、helpers、慣例
5. 生成框架適配骨架 → 含 [TODO] 標記
6. 展示結果 → 等待使用者確認寫入
```

### 分析模式（--analyze）

```
1. 掃描 features 目錄 → 列出所有 .feature 檔案
2. 掃描 E2E 測試目錄 → 列出所有 E2E 測試檔案
3. 比對覆蓋狀況 → 識別缺少 E2E 測試的項目
4. 產生報告 → 建議使用 /ac-coverage-assistant 取得詳情
```

## 防幻覺

- **必須**先讀取實際的 `.feature` 檔案再進行分類，不可猜測場景內容
- **必須**從 `package.json` 或既有測試檔案偵測框架，不可假設框架
- **必須**參考 `cli/src/utils/e2e-analyzer.js` 和 `cli/src/utils/e2e-detector.js` 的分類邏輯
- **不得**捏造專案中不存在的測試 helper 或 import 路徑

## 範例

### 從 feature 檔案生成 E2E

```
/e2e tests/features/SPEC-AUTH-001-login.feature
```

輸出：
```
📊 AC 適用性分析結果：
┌──────────────────────────────┬──────────────────┬───────────────────────────────┐
│ Scenario                     │ Category         │ Reason                        │
├──────────────────────────────┼──────────────────┼───────────────────────────────┤
│ Successful login             │ e2e-suitable     │ Multi-step user flow          │
│ Failed login                 │ e2e-suitable     │ UI interaction detected       │
│ Password validation          │ unit-suitable    │ Pure validation logic         │
└──────────────────────────────┴──────────────────┴───────────────────────────────┘

🔍 框架偵測：Playwright (auto-detected from package.json)
📁 既有模式：3 E2E tests found, using @playwright/test

✅ 已生成 E2E 骨架（2 scenarios, 1 skipped）
```

### 分析覆蓋差距

```
/e2e --analyze
```

輸出：
```
📊 E2E 覆蓋差距報告：
┌──────────────────────────────┬──────────┬───────────────────┐
│ Feature File                 │ E2E Test │ Status            │
├──────────────────────────────┼──────────┼───────────────────┤
│ login.feature                │ ✅       │ Covered           │
│ checkout.feature             │ ❌       │ Missing           │
│ registration.feature         │ ❌       │ Missing           │
└──────────────────────────────┴──────────┴───────────────────┘

覆蓋率：1/3 (33%)
建議：執行 /ac-coverage-assistant 取得 AC 層級追蹤。
```

## AI 代理行為

> 遵循 [AI 命令行為標準](../../../../core/ai-command-behavior.md)

### 進入路由

| 輸入 | AI 動作 |
|------|---------|
| `/e2e` | 列出 `tests/features/` 中的 `.feature` 檔案，詢問使用者選擇 |
| `/e2e <feature-file>` | 直接進入生成模式，解析指定 `.feature` 檔案 |
| `/e2e <spec-file>` | 偵測到 `SPEC-XXX.md` 格式，委派至 `/derive e2e` |
| `/e2e --analyze` | 進入分析模式，掃描覆蓋差距 |
| `/e2e --analyze <feature>` | 分析指定 feature 的 AC 適用性 |

### 互動腳本

#### Phase 1：AC 適用性分析

1. 讀取 `.feature` 檔案，解析所有 Scenario
2. 使用分類邏輯（E2E/Integration/Unit keywords + step count）分類每個 Scenario
3. 以表格展示分類結果

**決策：無 E2E 適合的場景**
- IF 所有場景都非 `e2e-suitable` → 通知使用者，建議使用 `/tdd` 或 `/bdd` 替代
- IF 部分適合 → 僅處理 `e2e-suitable` 場景，列出跳過的場景及原因

🛑 **STOP**：展示分類結果後等待使用者確認繼續

#### Phase 2：框架偵測與模式分析

1. 偵測專案使用的 E2E 框架（package.json dependencies）
2. 掃描既有 E2E 測試目錄，擷取 import、helper、編碼慣例

**決策：多框架偵測**
- IF 偵測到多個框架 → 列出選項，詢問使用者選擇
- IF 未偵測到框架 → 詢問使用者指定，或預設使用 Vitest

#### Phase 3：骨架生成

1. 使用框架範本生成 E2E 測試骨架
2. 包含 `[TODO]` 標記、traceability tags（`@SPEC-XXX @AC-N`）
3. 包含 fixture/setup 引導（beforeAll/beforeEach）
4. 展示生成的程式碼

🛑 **STOP**：展示生成的骨架後等待使用者確認寫入

#### Phase 4：完成與下一步

1. 寫入檔案（經使用者確認）
2. 建議下一步操作

### 停止點

| 階段 | 停止點 | 等待內容 |
|------|--------|---------|
| AC 分析 | 分類結果展示後 | 確認繼續生成 |
| 骨架生成 | 程式碼展示後 | 確認寫入檔案 |

### 錯誤處理

| 錯誤條件 | AI 動作 |
|----------|---------|
| `.feature` 檔案不存在 | 列出目錄中可用的 `.feature` 檔案 |
| `.feature` 無 Scenario | 通知使用者，建議先使用 `/bdd` 撰寫場景 |
| 輸入為 `SPEC-XXX.md` | 辨識後委派至 `/derive e2e`，說明原因 |
| 框架未偵測到 | 詢問使用者選擇框架（Playwright/Cypress/Vitest） |
| 既有 E2E 目錄不存在 | 使用預設模板，不進行模式分析 |

## 參考

- 規格：[SPEC-E2E-001](../../../../docs/specs/skills/SPEC-E2E-001-e2e-skill.md)
- Skill：[e2e-assistant](../e2e-assistant/SKILL.md)
- 工具程式：`cli/src/utils/e2e-analyzer.js`、`cli/src/utils/e2e-detector.js`
- 相關：[/derive](./derive.md)、[/bdd](./bdd.md)、[/tdd](./tdd.md)
