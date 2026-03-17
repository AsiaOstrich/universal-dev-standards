---
source: ../../../core/workflow-state-protocol.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-17
status: current
---

# 工作流程状态协议

> **语言**: [English](../../../core/workflow-state-protocol.md) | [繁體中文](../../zh-TW/core/workflow-state-protocol.md)

**版本**: 1.0.0
**最后更新**: 2026-03-17
**适用范围**: 所有使用多阶段 AI 工作流程的项目
**范围**: universal
**行业标准**: 灵感来自 LangGraph 检查点、OpenHands 事件溯源、GSD 状态前言
**参考**: [LangGraph](https://github.com/langchain-ai/langgraph)、[OpenHands](https://github.com/All-Hands-AI/OpenHands)、[GSD](https://github.com/gsd-build/get-shit-done)

---

## 摘要

工作流程状态协议定义了如何在 AI 工作会话之间持久化和恢复工作流程状态。通过结合结构化状态文件（机器 + 人类可读）与仅追加的事件日志，团队可以恢复中断的工作流程、审计决策历史，并防止长时间运行的开发流程中发生状态丢失。

---

## 快速参考

| 方面 | 说明 |
|------|------|
| **状态目录** | `.workflow-state/`（项目根目录） |
| **状态文件** | `.workflow-state/{workflow}-{id}.yaml` |
| **事件日志** | `.workflow-state/{workflow}-{id}.log.yaml` |
| **保存触发** | 阶段转换、重要决策、工作会话边界 |
| **加载触发** | 工作会话开始、工作流程恢复、`/sdd` 搭配现有规格 |
| **Gitignore** | 建议：将 `.workflow-state/` 加入 `.gitignore` |

---

## 状态文件格式

状态文件结合机器可读的前言与人类可读的正文，遵循 GSD 前言模式。

### 结构

```yaml
# .workflow-state/sdd-SPEC-042.yaml

# === Machine-Readable Metadata ===
workflow: sdd
spec_id: SPEC-042
title: Add rate limiting to login endpoint
current_phase: implementation
status: in-progress
iteration_count: 0
created: 2026-03-17T10:00:00Z
updated: 2026-03-17T14:30:00Z
phases_completed:
  - discuss
  - proposal
  - review
artifacts:
  spec: docs/specs/SPEC-042.md
  tests: tests/auth/login.test.js
  implementation: src/auth/login.js

# === Human-Readable Summary ===
progress_summary: |
  Rate limiting feature for login endpoint.
  Spec approved after 1 review iteration.
  Currently implementing AC-2 (valid credentials still work).

completed_steps:
  - "AC-1: Rate limit check added to login.js:45"
  - "AC-1: Test cases added for rate limit exceeded"

next_steps:
  - "AC-2: Verify no regression on valid login flow"
  - "AC-3: Add rate limit headers to response"

open_questions:
  - "Should rate limiting be per-IP or per-user? (deferred to SPEC-043)"

decisions:
  - date: 2026-03-17
    decision: Use sliding window algorithm for rate limiting
    reason: Better UX than fixed window, prevents burst at window boundaries
```

### 必填字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `workflow` | string | 工作流程类型（例如 `sdd`、`feature-dev`） |
| `spec_id` | string | 规格或任务标识符 |
| `current_phase` | string | 活跃的阶段 ID |
| `status` | enum | `in-progress`、`paused`、`blocked`、`completed`、`abandoned` |
| `updated` | datetime | 最后状态更新时间戳 |
| `phases_completed` | list | 已完成阶段 ID 的有序列表 |

### 选填字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `title` | string | 人类友好的描述 |
| `iteration_count` | number | 验证迭代计数器（用于循环上限） |
| `created` | datetime | 工作流程开始时间 |
| `artifacts` | map | 工作流程产出的关键文件 |
| `progress_summary` | text | 以白话文描述的当前状态 |
| `completed_steps` | list | 已完成的工作项目 |
| `next_steps` | list | 待完成的工作项目 |
| `open_questions` | list | 未解决的问题 |
| `decisions` | list | 工作流程期间做出的重要决策 |

---

## 事件日志格式

事件日志是仅追加的 YAML 列表，用于记录工作流程事件以便审计。灵感来自 OpenHands 的 action-observation 流。

### 结构

```yaml
# .workflow-state/sdd-SPEC-042.log.yaml

- timestamp: 2026-03-17T10:00:00Z
  event_type: phase_enter
  phase: discuss
  actor: user
  summary: Started discuss phase for rate limiting feature

- timestamp: 2026-03-17T10:15:00Z
  event_type: decision
  phase: discuss
  actor: ai
  summary: "Scope locked: rate limiting for login only, not all endpoints"
  details: "User confirmed per-endpoint approach. Global rate limiting deferred."

- timestamp: 2026-03-17T10:30:00Z
  event_type: phase_exit
  phase: discuss
  actor: ai
  summary: Discuss phase complete, all gray areas resolved

- timestamp: 2026-03-17T11:00:00Z
  event_type: checkpoint
  phase: proposal
  actor: ai
  summary: Spec SPEC-042 created with 3 acceptance criteria

- timestamp: 2026-03-17T14:00:00Z
  event_type: error
  phase: implementation
  actor: ai
  summary: "Test failure in AC-2: existing login test broke after rate limiter"
  details: "rateLimiter.check() was called before user lookup, causing null ref"
```

### 事件类型

| 类型 | 说明 | 何时记录 |
|------|------|----------|
| `phase_enter` | 工作流程进入新阶段 | 阶段转换时 |
| `phase_exit` | 工作流程退出阶段 | 阶段完成时 |
| `checkpoint` | 阶段内的重要里程碑 | 关键产物创建时 |
| `decision` | 做出重要决策 | 设计选择、范围变更时 |
| `error` | 遇到错误或失败 | 测试失败、构建错误时 |
| `interruption` | 工作流程暂停（HITL 或上下文限制） | 需要人工介入时 |
| `resumption` | 从已保存状态恢复工作流程 | 工作会话重新启动时 |

### 事件字段

| 字段 | 必填 | 说明 |
|------|------|------|
| `timestamp` | 是 | ISO 8601 时间戳 |
| `event_type` | 是 | 定义的事件类型之一 |
| `phase` | 是 | 当前的工作流程阶段 |
| `actor` | 否 | `user`、`ai` 或 `system` |
| `summary` | 是 | 单行描述 |
| `details` | 否 | 扩展信息 |

---

## 规则

### 状态保存规则

1. **阶段转换时保存**（必要）：当工作流程从一个阶段移动到另一个阶段时，状态文件必须更新为新阶段及已完成阶段列表。

2. **工作会话边界时保存**（必要）：在活跃工作流程期间结束 AI 工作会话之前，保存当前状态以便下次工作会话恢复。

3. **重要决策时保存**（建议）：做出重要设计决策时，将其记录在状态文件的 `decisions` 列表和事件日志中。

### 状态加载规则

1. **工作会话开始时检查**（必要）：在 AI 工作会话开始时，检查 `.workflow-state/` 中是否有 `in-progress` 或 `paused` 的工作流程。如有，通知用户并提供恢复选项。

2. **工作流程命令时加载**（必要）：当用户调用工作流程命令（例如 `/sdd implement SPEC-042`）时，检查现有状态并加载，而非重新开始。

3. **验证状态新鲜度**（建议）：如果状态文件的 `updated` 时间戳超过 7 天，警告用户状态可能已过时。

---

## 目录结构

```
project-root/
├── .workflow-state/           # 工作流程状态目录
│   ├── sdd-SPEC-042.yaml     # 活跃的 SDD 工作流程状态
│   ├── sdd-SPEC-042.log.yaml # SPEC-042 的事件日志
│   ├── sdd-SPEC-038.yaml     # 已完成的工作流程（status: completed）
│   └── feature-dev-auth.yaml  # 功能开发工作流程状态
├── .gitignore                 # 应包含 .workflow-state/
└── ...
```

### Gitignore 建议

加入 `.gitignore`：
```
# Workflow state (session-specific, not for version control)
.workflow-state/
```

**理由**：工作流程状态是特定于工作会话的，包含瞬态的执行数据。不应进行版本控制，因为它可能包含敏感上下文或变得过时。

**例外**：希望跨开发者共享工作流程状态的团队可以选择将其纳入版本控制，但应定期清理已完成的工作流程。

---

## 与 SDD 集成

与规格驱动开发搭配使用时：

| SDD 阶段 | 状态动作 |
|----------|----------|
| 讨论 | 创建状态文件，记录灰色地带和范围决策 |
| 提案 | 更新规格产物路径 |
| 审查 | 记录审查意见和迭代次数 |
| 实施 | 追踪 AC 进度、记录 commits |
| 验证 | 记录迭代计数（用于循环上限）、记录结果 |
| 归档 | 将状态设为 `completed`，最终事件日志条目 |

---

## 与上下文重置集成

开始新的 AI 工作会话时：

1. 检查 `.workflow-state/` 中是否有活跃的工作流程
2. 如有，加载状态文件的 `progress_summary`、`next_steps` 和 `open_questions`
3. 仅加载与当前阶段相关的标准（通过 context-aware-loading）
4. 从上次工作会话中断的地方继续

这提供了高效的上下文恢复，无需加载整个对话历史。

---

## 最佳实践

### 应该做的

- 在每次阶段转换时保存状态
- 保持 `progress_summary` 简洁且最新
- 记录决策及其理由
- 定期清理已完成的工作流程

### 不应该做的

- 不要在状态文件中存储大型产物（改用路径引用）
- 不要仅依赖状态文件来保存关键数据（以规格和代码为事实来源）
- 默认不要将状态文件纳入版本控制
- 不要修改事件日志（仅追加）

---

## 相关标准

- [规格驱动开发](spec-driven-development.md) — 使用状态协议的主要工作流程
- [项目上下文记忆](project-context-memory.md) — `.project-context/` 中的持久决策
- [上下文感知加载](context-aware-loading.md) — 基于阶段的标准加载
- [结构化任务定义](structured-task-definition.md) — 工作流程步骤中的任务结构

---

## 版本历史

| 版本 | 日期 | 变更内容 |
|------|------|----------|
| 1.0.0 | 2026-03-17 | 初始标准：状态文件格式、事件日志、保存/加载规则 |

---

## 授权

本标准以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权发布。
