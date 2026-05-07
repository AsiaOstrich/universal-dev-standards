# SPEC-008: CLI Integration UX Refinement

> **Status**: Archived
> **Author**: Architect Agent
> **Date**: 2026-01-30

## 1. Objective

Refine the Integration Configuration UX by improving prompt clarity, removing English suffixes, and providing detailed configuration summaries.

## 2. Changes

### 2.1 Prompt Polish
- **Issue**: `(Press <space> to select...)` suffix appears in integration prompts.
- **Fix**: Add `suffix: ' '` to all prompts in `cli/src/prompts/integrations.js`.

### 2.2 Detailed Summary
- **Issue**: Summary only lists tools, not the configuration mode (Default/Custom/Merge).
- **Issue**: Custom mode details (selected categories) are hidden.
- **Fix**:
  - Add "Integration Config" line to summary.
  - For Custom mode, list selected rule categories.

## 3. Implementation Plan

1.  **Update `cli/src/prompts/integrations.js`**:
    - Add `suffix: ' '` to all prompts.
2.  **Update `cli/src/i18n/messages.js`**:
    - Add labels: `integrationConfigLabel`, `ruleCategoriesLabel`.
3.  **Update `cli/src/commands/init.js`**:
    - Enhance `displaySummary` to show integration mode and categories.
    - Implement `getCategoryLabel` helper using `RULE_CATEGORIES` (might need export/import adjustment).

## 4. Verification

- Run `uds init` -> Select "Custom" integration.
- Verify suffix is gone.
- Verify summary shows "Integration Config: Custom" and "Rule Categories: ...".

## 5. 採用層整合模式（Future）

### 5.1 安裝差異

`uds init` 已支援不同 AI 工具的設定。未來可透過 `--target` 參數進一步區分採用層消費者：

| 指令 | 行為 | 安裝內容 |
|------|------|----------|
| `uds init` | 預設安裝（偵測 AI 工具） | .standards/ + AI 工具設定 |
| `uds init --target pipeline` | Pipeline 採用層模式 | .standards/ + TestPolicy 對齊檢查 |
| `uds init --target agent` | Agent 採用層模式 | .standards/ + Agent prompt 引用 |

### 5.2 差異化行為

**Pipeline 模式**（`--target pipeline`）：
- 安裝核心標準（同預設）
- 額外安裝 `test-governance.ai.yaml`（TestPolicy 依賴）
- 生成 `.standards/options/testing/` 完整目錄
- 檢查 `specs/test-policy-schema.json` 與 UDS 標準的一致性

**Agent 模式**（`--target agent`）：
- 安裝核心標準（同預設）
- 額外確認 Agent prompt 引用的標準都已安裝
- 生成 `.standards/options/` 完整目錄（含 testing、workflow）
- 設定 CLAUDE.md 的 UDS 規範引用區塊

### 5.3 實作考量

- `--target` 為可選參數，預設行為不變
- 目標設定儲存在 `.uds/config.json` 的 `target` 欄位
- 未來可擴展更多 target（如 `--target cursor`、`--target gemini`）
