---
source: ../../../../skills/commands/derive.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-19
---

---
name: derive
description: [UDS] Derive BDD scenarios, TDD skeletons, or ATDD tables from specifications.
argument-hint: "[all|bdd|tdd|atdd] <spec-file> [--lang <lang>] [--framework <fw>] [--output-dir <dir>]"
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
| `all` | 產生 BDD + TDD（預設） | `.feature` + `.test.*` |
| `bdd` | 僅產生 BDD 場景 | `.feature` |
| `tdd` | 僅產生 TDD 骨架 | `.test.*` |
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
# 推演全部（BDD + TDD）
/derive all specs/SPEC-001.md

# 僅推演 BDD 場景
/derive bdd specs/SPEC-001.md

# 推演 Python 的 TDD
/derive tdd specs/SPEC-001.md --lang python --framework pytest

# 推演 ATDD 表格供手動測試
/derive atdd specs/SPEC-001.md
```

## 參考

*   [正向推演標準](../forward-derivation/SKILL.md)
*   [核心規範](../../core/forward-derivation-standards.md)
