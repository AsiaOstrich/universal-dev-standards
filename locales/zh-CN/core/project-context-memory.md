---
source: ../../../core/project-context-memory.md
source_version: 1.2.1
translation_version: 1.2.1
last_synced: 2026-10-16
source_hash: a852f1970d37
status: current
---

# 项目情境记忆标准

> **语言**: [English](../../../core/project-context-memory.md) | [繁體中文](../../zh-TW/core/project-context-memory.md) | 简体中文

**版本**: 1.2.1
**最后更新**: 2026-10-07
**适用范围**: 所有使用 AI 助手的软件项目
**范围**: uds-specific

---

## 目的

本标准定义一个结构化系统，用于捕获、检索和执行**项目特定的**上下文、架构决策和领域知识。与开发者记忆（通用且可迁移的）不同，项目情境记忆充当特定代码库的"长期大脑"，确保 AI 助手遵守本地惯例和历史决策。

---

## 快速参考

### 记忆条目模式

| 字段 | 类型 | 描述 |
|------|------|------|
| `id` | string | 唯一标识符（`PRJ-YYYY-NNNN`） |
| `type` | enum | `decision` / `convention` / `structure` / `glossary` |
| `summary` | string | 上下文的单行摘要 |
| `status` | enum | `active` / `proposed` / `deprecated` |
| `scope` | list | 此规则适用的文件或目录 |

### 存储位置

条目存储为**带有 YAML Frontmatter 的 Markdown**，确保人类可读性（文档）和机器可解析性。

- **目录**: `.project-context/`
- **格式**: `.md` 文件

---

## 1. 记忆模式

### 1.1 完整模式定义

```markdown
---
id: "PRJ-2026-0001"              # Required: Unique ID
type: decision                   # Required: Category
status: active                   # Required: active | proposed | deprecated
created_at: "2026-02-09"         # Required: ISO date
confidence: 1.0                  # Required: 0.0–1.0 (Project facts usually start high)
authors: ["user-name", "ai-assistant"]

# Scope & Triggers (Context Awareness)
scope:                           # Where this rule applies
  - "src/api/**"
  - "src/services/**"
triggers:                        # Keywords/patterns to wake up this memory
  - "error handling"
  - "API response"
  - "try-catch"

# Relationships
related: ["PRJ-2026-0004"]       # Related project memories
supersedes: []                   # IDs of decisions this replaces
---

# Unified API Error Handling

## Context
We previously handled errors inconsistently across controllers, leading to frontend parsing issues.

## Decision
All API endpoints must return errors in the `StandardErrorResponse` format defined in `src/types/api.ts`.
Do not throw raw exceptions in controllers; wrap them in `ApiError` class.

## Constraint
- Forbidden: `res.status(500).json({ error: err.message })`
- Required: `next(new ApiError(500, 'internal_error', err.message))`
```

### 1.2 ID 格式

| 组件 | 格式 | 示例 |
|------|------|------|
| 前缀 | `PRJ` | `PRJ` |
| 年份 | `YYYY` | `2026` |
| 序号 | `NNNN` | `0001` |
| 完整 | `PRJ-YYYY-NNNN` | `PRJ-2026-0001` |

---

## 2. 记忆类别（分类法）

| 类别 | 描述 | 示例 |
|------|------|------|
| `decision` | 架构决策记录（轻量级 ADR） | "核心领域使用六边形架构" |
| `convention` | 强制编码风格或模式 | "所有接口名称必须以 'I' 开头" |
| `structure` | 目录职责与边界 | "`src/shared` 不得从 `src/features` 导入" |
| `glossary` | 通用语言 / 领域术语 | "'User' 指管理员；'Customer' 是最终用户" |
| `constraint` | 硬性技术限制或禁令 | "禁止使用 `lodash`（使用原生 ES6+）" |
| `workflow` | 流程特定规则 | "迁移必须通过 CLI 生成，而非手动编写 SQL" |
| `workflow-state` | 活跃工作流进度跟踪 | "Release v5.1.0 — 当前处于 beta-testing 阶段" |

---

## 3. 操作协议

### 3.1 主动提取（记录）

AI 必须在对话中积极倾听"共识时刻"。

**触发器:**
*   "我们约定..."
*   "从现在起，我们使用..."
*   "架构应该是..."
*   就同一条项目特定规则反复纠正 AI。

**工作流:**
1.  AI 检测到共识或规则。
2.  AI 提议："这似乎是一个项目级决策。是否需要我将其保存到项目情境中？"
3.  用户确认。
4.  AI 生成一个 `.project-context/topic-name.md` 文件。

### 3.2 上下文注入（查询）

**触发器:**
*   **规划阶段**：当用户要求"构建功能"时，扫描 `structure` 和 `decision` 记忆。
*   **编码阶段**：编辑 `scope` 中的文件时，扫描 `convention` 记忆。
*   **审查阶段**：检查代码是否违反 `constraint` 记忆。

**行为:**
*   AI 必须在生成代码*之前***读取**相关上下文文件。
*   AI 在执行规则时必须**引用**记忆 ID（例如："根据 PRJ-2026-0012，我在此处使用工厂模式"）。

### 3.3 生命周期管理（审查）

**陈旧检测:**
*   如果 `scope` 中提到的文件路径已不存在。
*   如果 `Constraint` 中提到的代码模式已无处可寻。
*   AI 应主动询问："PRJ-2025-0045 是否仍然有效？"

**废弃:**
*   当新的 `decision` 与旧的冲突时，旧决策的 `status` 变为 `deprecated`，且新决策中的 `supersedes` 字段会被更新。

---

## 4. 工作流状态跟踪

### 4.1 目的

`workflow-state` 类型用于捕获正在进行的工作流的**当前状态**，使 AI 助手能够在跨会话时恢复中断的工作。与 `workflow` 类型（存储流程规则）不同，`workflow-state` 跟踪特定进行中工作流的进度、阻塞项和后续步骤。

### 4.2 附加模式字段

| 字段 | 类型 | 描述 |
|------|------|------|
| `workflow` | string | 工作流名称（例如 `release-v5.1.0`） |
| `phase` | string | 当前步骤（例如 `beta-testing`） |
| `progress` | object | `{ completed: [], current: string, remaining: [], percentage: int }` |
| `blockers` | list | 当前阻止进度的阻塞项 |
| `next_steps` | list | 后续行动的有序列表 |
| `updated_at` | date | 最后更新时间戳（用于陈旧检测） |

### 4.3 示例

```markdown
---
id: "PRJ-2026-0042"
type: workflow-state
status: active
workflow: "release-v5.1.0"
phase: "beta-testing"
progress:
  completed: ["alpha-release", "internal-validation"]
  current: "beta-testing"
  remaining: ["stable-release", "changelog-finalize"]
  percentage: 40
blockers:
  - "Waiting for CI fix on Windows tests"
next_steps:
  - "Fix Windows CI (#234)"
  - "Collect beta feedback"
  - "Prepare stable release notes"
created_at: "2026-03-10"
updated_at: "2026-03-16"
scope: ["cli/**", "scripts/**"]
triggers: ["release", "version", "publish"]
---

# Release v5.1.0 Workflow State

## Current Phase: Beta Testing
Beta v5.1.0-beta.1 published on 2026-03-14.
```

### 4.4 主动行为

| 触发条件 | AI 行动 |
|----------|---------|
| 会话开始 | 扫描活跃的 `workflow-state` 条目，呈现摘要 |
| `updated_at` > 7 天 | 标记为陈旧，询问是否归档或恢复 |
| 所有 `remaining` 步骤均已完成 | 建议归档该工作流状态 |

> 7 天陈旧窗口是 UDS 默认值，可按项目配置。依据：
> 在短周期开发中，超过一周未触及的工作流状态很可能已被放弃或取代；
> 它与开发者记忆的陈旧模型保持一致。对于长期运行或兼职项目，可延长该窗口。

---

## 5. 与开发者记忆的对比

| 特性 | 开发者记忆（`core/developer-memory.md`） | 项目情境记忆（`core/project-context-memory.md`） |
| :--- | :--- | :--- |
| **范围** | 通用 / 跨项目 | **本地 / 项目特定** |
| **隐私** | 去标识化（严格） | **具名标识**（允许特定路径/名称） |
| **内容** | "如何使用 React useEffect" | "我们在此应用中如何使用 React" |
| **存储** | `.memory/`（全局/用户） | `.project-context/`（仓库） |
| **目标** | 技能获取 | **一致性与合规性** |

---

## 6. 架构决策

### 6.1 "Always-On" 协议
与开发者记忆类似，项目情境是一项 **Always-On Protocol**。AI 不需要显式命令即可使用它。它是智能体环境"物理法则"的一部分。

### 6.2 存储策略
我们使用**分文件存储**（每个主题一个 Markdown 文件），而非单个庞大的 `GEMINI.md` 或 JSON 文件。
*   **原因 1**：Git 友好的 diff。
*   **原因 2**：更低的 token 消耗（AI 仅根据 `scope/triggers` 读取相关文件）。
*   **原因 3**：人类可读的文档。

---

## 边界：本标准不放什么

- **个人、跨项目、可识别的信息**（谁负责什么、怎么连到某个环境）不是项目上下文：这里的条目放在仓库里，会被每个 clone 它的人看到。把它们放在用户自己的 AI 工具记忆，不要放进 `.project-context/`。
- **项目之间的协调**（哪件工作在等哪件工作）是开放工作，不是上下文：见 [Open Work Tracking](../../../core/open-work-tracking.md)（OWT-027–OWT-029）。

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.2.1 | 2026-10-07 | 新增：边界章节 —— 个人、跨项目、可识别的事实以及项目间的协调不属于代码仓库的项目情境（XSPEC-460 R5；补丁，无行为变更） |
| 1.2.0 | 2026-06-18 | 新增：7 天陈旧阈值的合理性分析 + 可配置说明（XSPEC-292 T8） |
| 1.1.0 | 2026-03-16 | 新增用于跨会话状态跟踪的 `workflow-state` 类型 |
| 1.0.0 | 2026-02-09 | 初始标准定义 |

---

## 许可证

本标准采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 发布。
