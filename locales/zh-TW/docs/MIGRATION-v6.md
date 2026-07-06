# UDS 6.0.0 遷移指南

> **語言**: [English](../../../docs/MIGRATION-v6.md) | 繁體中文 | [简体中文](../../zh-CN/docs/MIGRATION-v6.md)

UDS 6.0.0 是 **major** 版本：包含一項 breaking 更名、移除 8 個已棄用的機器可讀標準與 4 個已棄用的 CLI 命令——以上皆自 5.4.0 起帶有「6.0.0 移除」預告。本指南涵蓋所有需要調整的事項。

**TL;DR 檢查清單：**

- [ ] 把所有 `/review` 呼叫改為 `/code-review`
- [ ] 若腳本用到 `uds start` / `uds mission*` / `uds workflow*` / `uds flow*` / `uds sweep`，依 §3 遷移
- [ ] 若採用層曾載入 8 個被移除的 `.ai.yaml` stub，改用自家 runtime 等效實作（§2）
- [ ] 升級：`npm install -g universal-dev-standards@6`，然後在各專案跑 `uds update`

---

## 1. Breaking 更名：`/review` → `/code-review`

`review` 命令/skill 更名為 `code-review`，使 skill frontmatter 名稱與其目錄（`code-review-assistant`）對齊。

| 更名前 | 更名後 |
|--------|--------|
| `/review` | `/code-review` |
| `skills/commands/review.md` | `skills/commands/code-review.md` |
| `.gemini/commands/review.toml` | `.gemini/commands/code-review.toml` |
| `flows/review.flow.yaml`（flow-id `review-flow`）| `flows/code-review.flow.yaml`（flow-id `code-review-flow`）|

**你需要做的：**

- 把自家 prompt、文件、CI 腳本、AI 指令檔（`CLAUDE.md`、`AGENTS.md`、`.cursor/rules/` 等）中的 `/review` 改為 `/code-review`。
- 若你的 flow 引用了 flow-id `review-flow`（如 `workflow-prerequisites`），改為 `code-review-flow`。
- 重跑 `uds update` 讓重生成的命令索引落進專案。

**不受影響**：指涉外部工具內建 review 命令（如 Codex）的 `/review` 字樣與 UDS 無關，刻意保留原樣。

## 2. 移除：8 個已棄用的機器可讀標準（`.ai.yaml`）

這 8 個標準的 runtime 已於 5.4.0 移交採用層（XSPEC-086/095；UDS 定義活動、採用層編排流程——DEC-049），其 `.ai.yaml` stub 如期移除：

| 移除的 `.ai.yaml` | 保留的人類可讀文件 |
|---|---|
| `agent-communication-protocol` | `core/agent-communication-protocol.md` |
| `agent-dispatch` | `core/agent-dispatch.md` |
| `branch-completion` | `core/branch-completion.md` |
| `change-batching-standards` | `core/change-batching-standards.md` |
| `execution-history` | `core/execution-history.md` |
| `pipeline-integration-standards` | `core/pipeline-integration-standards.md` |
| `workflow-enforcement` | `core/workflow-enforcement.md` |
| `workflow-state-protocol` | `core/workflow-state-protocol.md` |

**你需要做的：**

- 若從未直接載入這些 `.ai.yaml`：不需動作——人類可讀概念仍留在 `core/` 作為參考文件。
- 若採用層（agent runtime、orchestrator、CI）曾載入這些 stub：在自家工具鏈實作等效機制。這些 stub 自 5.4.0 起本身就是指向此方向的棄用告示。
- 這些標準不再由 `uds init` / `uds update` 發佈。專案 `.standards/` 中既有副本不會被自動刪除——想要乾淨樹的話請手動移除。

## 3. 移除：4 個已棄用的 CLI 命令

四者皆於 5.4.0 標記 `@deprecated`（XSPEC-095）並預告 6.0.0 移除。流程編排屬採用層職責（DEC-049）。

| 移除的命令 | 遷移路徑 |
|---|---|
| `uds start`、`uds mission:*`（status/pause/resume/cancel/list）| 用採用層的 mission runtime（如 VibeOps orchestrator）|
| `uds workflow:*`（list/install/info/execute/status）| workflow 定義在 `flows/`；執行歸採用層 |
| `uds flow:*`（create/list/validate/diff/export/import）| 直接撰寫 flow YAML；驗證/執行在採用層 |
| `uds sweep` | 用 `/sweep` skill（同能力、skill 形式）|

保留的命令：`init`、`update`、`check`、`audit`、`config`、`skills`、`release`、`hitl`、`run` 及其餘非編排類 CLI。

## 4. 已棄用但 6.0.0「未」移除

- **6 個 workflow skills** 標記為 `reference` 級並帶明顯棄用告示（XSPEC-291 §4）。它們仍隨版發佈；可按自己的節奏遷移。
- 其他已棄用 runtime 命令帶結構化 `@superseded-by` 指標。

## 5. 升級步驟

```bash
# 1. 升級 CLI
npm install -g universal-dev-standards@6

# 2. 在各消費專案
uds update

# 3. 掃自家設定的殘留引用
grep -rn "/review\b" . --include="*.md" --include="*.toml" | grep -v code-review
grep -rn "uds start\|uds workflow\|uds flow\|uds sweep" . --exclude-dir=node_modules
```

`uds check` 通過且上述 grep 乾淨，即完成遷移。
