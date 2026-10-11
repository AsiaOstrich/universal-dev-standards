---
source: ../../../../skills/commands/derive.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: 2f9bbee08f05
status: current
---

---
name: derive
description: "[UDS] 從規格推演 BDD 場景、TDD 骨架或 ATDD 表格。"
argument-hint: "[all|bdd|tdd|it|e2e|atdd] <spec-file> [--lang <lang>] [--framework <fw>] [--output-dir <dir>]"
---

# 推演測試結構

> **Language**: [English](../../../../skills/commands/derive.md) | 繁體中文

從已批准的 SDD 規格生成衍生工件（BDD 場景、TDD 骨架、ATDD 表格）。

## 用法

```bash
/derive [subcommand] <spec-file> [options]
```

### 子命令

| 子命令 | 說明 | 輸出 |
|--------|------|------|
| `all` | 完整推演管線（BDD + TDD + IT + E2E + ATDD + 合約） | 所有格式 |
| `bdd` | 僅產生 BDD 場景 | `.feature` |
| `tdd` | 僅產生 TDD 骨架 | `.test.*` |
| `it` | 產生整合測試骨架 | `.it.test.*` |
| `e2e` | 產生 E2E 測試骨架 | `.e2e.test.*` |
| `atdd` | 產生 ATDD 測試表格 | `.md`（Markdown 表格） |

### 選項

| 選項 | 說明 | 預設值 |
|------|------|--------|
| `--lang` | 目標語言（ts、python 等） | 自動偵測或 `ts` |
| `--framework` | 測試框架（vitest、pytest 等） | 自動偵測或 `vitest` |
| `--output-dir` | 輸出目錄 | `./generated` |
| `--dry-run` | 預覽輸出但不寫入 | `false` |

## 工作流程

1.  **讀取規格**：分析輸入的 `SPEC-XXX.md` 檔案。
2.  **萃取 AC**：解析所有驗收條件。
3.  **產生工件**：
    *   **BDD**：將 AC 轉換為 Gherkin `Scenario` 格式。
    *   **TDD**：建立測試檔案骨架，以 `describe`/`it` 區塊對應 AC。
    *   **ATDD**：建立 Markdown 表格，包含輸入/輸出/通過-失敗欄位。
4.  **驗證**：確保 AC 與生成項目之間為 1:1 對應。

## 防幻覺

*   **1:1 對應**：每個 AC 必須恰好對應一個測試/場景。
*   **可追溯性**：所有生成的工件必須引用來源規格 ID 和 AC ID。
*   **禁止捏造**：不得新增規格中不存在的場景。

## 範例

```bash
# 完整推演管線（BDD + TDD + IT + E2E + ATDD + 合約）
/derive all specs/SPEC-001.md

# 僅推演 BDD 場景
/derive bdd specs/SPEC-001.md

# 推演 Python 的 TDD
/derive tdd specs/SPEC-001.md --lang python --framework pytest

# 推演整合測試骨架
/derive it specs/SPEC-001.md

# 推演 E2E 測試骨架
/derive e2e specs/SPEC-001.md

# 推演 ATDD 表格供手動測試
/derive atdd specs/SPEC-001.md
```

## AI 代理行為

> 遵循 [AI 命令行為標準](../../core/ai-command-behavior.md)

### 進入路由

| 輸入 | AI 動作 |
|------|---------|
| `/derive` | 列出 `docs/specs/` 中 status=Approved 的 spec，問使用者選擇 spec 和子命令 |
| `/derive <subcommand> <spec-file>` | 直接對指定 spec 執行指定子命令 |
| `/derive <subcommand>` | 執行指定子命令，列出可用 spec 供選擇 |
| `/derive <spec-file>` | 對指定 spec 執行 `all`（預設子命令） |

### 互動腳本

1. 讀取 spec 檔案，驗證 status = Approved
2. 擷取所有 AC，確認使用 GWT 格式

**決策：AC 格式**
- IF AC 使用 GWT 格式 → 直接推演
- IF AC 不是 GWT 格式 → 嘗試轉換，標記 `[Derived]`，展示轉換結果
- IF AC 無法轉換 → 🛑 STOP，請使用者先修改 spec 中的 AC 格式

🛑 **STOP**：AC 格式轉換後展示結果，等待使用者確認轉換正確再繼續

3. 依子命令分派到 `/derive-bdd`、`/derive-tdd`、`/derive-it`、`/derive-e2e`、`/derive-atdd`
4. 驗證 1:1 對應（每個 AC 恰好一個測試/場景）
5. 展示推演摘要

🛑 **STOP**：展示生成的測試工件後等待使用者確認寫入

### 停止點

| 停止點 | 等待內容 |
|--------|---------|
| AC 格式轉換後 | 確認轉換結果 |
| 測試工件生成後 | 確認寫入檔案 |

### 錯誤處理

| 錯誤情況 | AI 動作 |
|----------|---------|
| Spec status ≠ Approved | 告知當前 status，引導到 `/sdd approve` |
| Spec 檔案不存在 | 列出可用 spec，或引導到 `/sdd create` |
| AC 數量為 0 | 告知 spec 無 AC，引導修改 spec |
| 1:1 對應驗證失敗 | 列出不對應項目，停止並報告 |

## 參考

*   [正向推演標準](../spec-derivation/SKILL.md)
*   [核心規範](../../core/forward-derivation-standards.md)
