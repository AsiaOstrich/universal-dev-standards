# UDS 6.0.0 迁移指南

> **语言**: [English](../../../docs/MIGRATION-v6.md) | [繁體中文](../../zh-TW/docs/MIGRATION-v6.md) | 简体中文

UDS 6.0.0 是 **major** 版本：包含一项 breaking 更名、移除 8 个已弃用的机器可读标准与 4 个已弃用的 CLI 命令——以上皆自 5.4.0 起带有「6.0.0 移除」预告。本指南涵盖所有需要调整的事项。

**TL;DR 检查清单：**

- [ ] 把所有 `/review` 呼叫改为 `/code-review`
- [ ] 若脚本用到 `uds start` / `uds mission*` / `uds workflow*` / `uds flow*` / `uds sweep`，依 §3 迁移
- [ ] 若采用层曾载入 8 个被移除的 `.ai.yaml` stub，改用自家 runtime 等效实作（§2）
- [ ] 升级：`npm install -g universal-dev-standards@6`，然后在各专案跑 `uds update`

---

## 1. Breaking 更名：`/review` → `/code-review`

`review` 命令/skill 更名为 `code-review`，使 skill frontmatter 名称与其目录（`code-review-assistant`）对齐。

| 更名前 | 更名后 |
|--------|--------|
| `/review` | `/code-review` |
| `skills/commands/review.md` | `skills/commands/code-review.md` |
| `.gemini/commands/review.toml` | `.gemini/commands/code-review.toml` |
| `flows/review.flow.yaml`（flow-id `review-flow`）| `flows/code-review.flow.yaml`（flow-id `code-review-flow`）|

**你需要做的：**

- 把自家 prompt、文件、CI 脚本、AI 指令档（`CLAUDE.md`、`AGENTS.md`、`.cursor/rules/` 等）中的 `/review` 改为 `/code-review`。
- 若你的 flow 引用了 flow-id `review-flow`（如 `workflow-prerequisites`），改为 `code-review-flow`。
- 重跑 `uds update` 让重生成的命令索引落进专案。

**不受影响**：指涉外部工具内建 review 命令（如 Codex）的 `/review` 字样与 UDS 无关，刻意保留原样。

## 2. 移除：8 个已弃用的机器可读标准（`.ai.yaml`）

这 8 个标准的 runtime 已于 5.4.0 移交采用层（XSPEC-086/095；UDS 定义活动、采用层编排流程——DEC-049），其 `.ai.yaml` stub 如期移除：

| 移除的 `.ai.yaml` | 保留的人类可读文件 |
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

- 若从未直接载入这些 `.ai.yaml`：不需动作——人类可读概念仍留在 `core/` 作为参考文件。
- 若采用层（agent runtime、orchestrator、CI）曾载入这些 stub：在自家工具链实作等效机制。这些 stub 自 5.4.0 起本身就是指向此方向的弃用告示。
- 这些标准不再由 `uds init` / `uds update` 发布。专案 `.standards/` 中既有副本不会被自动删除——想要干净树的话请手动移除。

## 3. 移除：4 个已弃用的 CLI 命令

四者皆于 5.4.0 标记 `@deprecated`（XSPEC-095）并预告 6.0.0 移除。流程编排属采用层职责（DEC-049）。

| 移除的命令 | 迁移路径 |
|---|---|
| `uds start`、`uds mission:*`（status/pause/resume/cancel/list）| 用采用层的 mission runtime（如 VibeOps orchestrator）|
| `uds workflow:*`（list/install/info/execute/status）| workflow 定义在 `flows/`；执行归采用层 |
| `uds flow:*`（create/list/validate/diff/export/import）| 直接撰写 flow YAML；验证/执行在采用层 |
| `uds sweep` | 用 `/sweep` skill（同能力、skill 形式）|

保留的命令：`init`、`update`、`check`、`audit`、`config`、`skills`、`release`、`hitl`、`run` 及其余非编排类 CLI。

## 4. 已弃用但 6.0.0「未」移除

- **6 个 workflow skills** 标记为 `reference` 级并带明显弃用告示（XSPEC-291 §4）。它们仍随版发布；可按自己的节奏迁移。
- 其他已弃用 runtime 命令带结构化 `@superseded-by` 指标。

## 5. 升级步骤

```bash
# 1. 升级 CLI
npm install -g universal-dev-standards@6

# 2. 在各消费专案
uds update

# 3. 扫自家设定的残留引用
grep -rn "/review\b" . --include="*.md" --include="*.toml" | grep -v code-review
grep -rn "uds start\|uds workflow\|uds flow\|uds sweep" . --exclude-dir=node_modules
```

`uds check` 通过且上述 grep 干净，即完成迁移。
