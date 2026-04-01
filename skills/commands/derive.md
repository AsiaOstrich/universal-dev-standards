---
name: derive
description: [UDS] Derive BDD scenarios, TDD skeletons, or ATDD tables from specifications.
argument-hint: "[all|bdd|tdd|it|e2e|atdd] <spec-file> [--lang <lang>] [--framework <fw>] [--output-dir <dir>]"
---

# Derive Test Structures | 推演測試結構

Generate derived artifacts (BDD scenarios, TDD skeletons, ATDD tables) from approved SDD specifications.

從已批准的 SDD 規格生成衍生工件（BDD 場景、TDD 骨架、ATDD 表格）。

## Usage | 用法

```bash
/derive [subcommand] <spec-file> [options]
```

### Subcommands | 子命令

| Subcommand | Description | Output |
|------------|-------------|--------|
| `all` | Full derivation pipeline (BDD + TDD + IT + E2E + ATDD + Contracts) | All formats |
| `bdd` | Generate BDD scenarios only | `.feature` |
| `tdd` | Generate TDD skeletons only | `.test.*` |
| `it` | Generate Integration test skeletons | `.it.test.*` |
| `e2e` | Generate E2E test skeletons | `.e2e.test.*` |
| `atdd` | Generate ATDD test tables | `.md` (Markdown tables) |

### Options | 選項

| Option | Description | Default |
|--------|-------------|---------|
| `--lang` | Target language (ts, python, etc.) | Detected or `ts` |
| `--framework` | Test framework (vitest, pytest, etc.) | Detected or `vitest` |
| `--output-dir` | Output directory | `./generated` |
| `--dry-run` | Preview output without writing | `false` |

## Workflow | 工作流程

1.  **Read Spec**: Analyze the input `SPEC-XXX.md` file.
2.  **Extract AC**: Parse all Acceptance Criteria.
3.  **Generate Artifacts**:
    *   **BDD**: Convert AC to Gherkin `Scenario` format.
    *   **TDD**: Create test file skeleton with `describe`/`it` blocks matching ACs.
    *   **ATDD**: Create a Markdown table with inputs/outputs/pass-fail columns.
4.  **Verify**: Ensure 1:1 mapping between ACs and generated items.

## Anti-Hallucination | 防幻覺

*   **1:1 Mapping**: Every AC must have exactly one corresponding test/scenario.
*   **Traceability**: All generated artifacts must reference the Source Spec ID and AC ID.
*   **No Invention**: Do not add scenarios not present in the spec.

## Examples | 範例

```bash
# Full derivation pipeline (BDD + TDD + IT + E2E + ATDD + Contracts)
/derive all specs/SPEC-001.md

# Derive BDD scenarios only
/derive bdd specs/SPEC-001.md

# Derive TDD for Python
/derive tdd specs/SPEC-001.md --lang python --framework pytest

# Derive Integration test skeletons
/derive it specs/SPEC-001.md

# Derive E2E test skeletons
/derive e2e specs/SPEC-001.md

# Derive ATDD tables for manual testing
/derive atdd specs/SPEC-001.md
```

## AI Agent Behavior | AI 代理行為

> Follows [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### Entry Router | 進入路由

| Input | AI Action |
|-------|-----------|
| `/derive` | 列出 `docs/specs/` 中 status=Approved 的 spec，問使用者選擇 spec 和子命令 |
| `/derive <subcommand> <spec-file>` | 直接對指定 spec 執行指定子命令 |
| `/derive <subcommand>` | 執行指定子命令，列出可用 spec 供選擇 |
| `/derive <spec-file>` | 對指定 spec 執行 `all`（預設子命令） |

### Interaction Script | 互動腳本

1. 讀取 spec 檔案，驗證 status = Approved
2. 擷取所有 AC，確認使用 GWT 格式

**Decision: AC 格式**
- IF AC 使用 GWT 格式 → 直接推演
- IF AC 不是 GWT 格式 → 嘗試轉換，標記 `[Derived]`，展示轉換結果
- IF AC 無法轉換 → 🛑 STOP，請使用者先修改 spec 中的 AC 格式

🛑 **STOP**: AC 格式轉換後展示結果，等待使用者確認轉換正確再繼續

3. 依子命令分派到 `/derive-bdd`、`/derive-tdd`、`/derive-it`、`/derive-e2e`、`/derive-atdd`
4. 驗證 1:1 對應（每個 AC 恰好一個測試/場景）
5. 展示推演摘要

🛑 **STOP**: 展示生成的測試工件後等待使用者確認寫入

### Stop Points | 停止點

| Stop Point | 等待內容 |
|-----------|---------|
| AC 格式轉換後 | 確認轉換結果 |
| 測試工件生成後 | 確認寫入檔案 |

### Error Handling | 錯誤處理

| Error Condition | AI Action |
|-----------------|-----------|
| Spec status ≠ Approved | 告知當前 status，引導到 `/sdd approve` |
| Spec 檔案不存在 | 列出可用 spec，或引導到 `/sdd create` |
| AC 數量為 0 | 告知 spec 無 AC，引導修改 spec |
| 1:1 對應驗證失敗 | 列出不對應項目，停止並報告 |

## References | 參考

*   [Forward Derivation Standard](../forward-derivation/SKILL.md)
*   [Core Standard](../../core/forward-derivation-standards.md)
