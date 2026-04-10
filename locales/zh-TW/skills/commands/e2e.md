---
source: ../../../../skills/commands/e2e.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-04-10
status: experimental
description: "[UDS] 從 BDD 場景生成 E2E 測試骨架，支援框架偵測"
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
