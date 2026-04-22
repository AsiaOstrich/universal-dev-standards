---
source: ../../../core/workflow-enforcement.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-04-22
status: current
---

# 工作流程强制执行标准

**适用范围**：所有使用结构化开发方法论的软件项目
**范围**：通用

## 概述

本标准定义了机器可强制执行的工作流程闸门，防止在开发方法论（SDD、TDD、BDD）中跳过阶段。除了依赖开发者的自律外，工作流程闸门在阶段转换时提供自动化检查。

## 核心原则

> **引导而非阻断。** 当前置条件失败时，总是提供可操作的指引：缺少什么、为什么重要、以及如何修复。

## 执行模式

项目可通过 `.uds/config.yaml` 配置执行行为：

| 模式 | 行为 | 使用场景 |
|------|------|---------|
| `enforce` | 阻断阶段转换 + 显示指引 | 承诺流程纪律的团队 |
| `suggest` | 显示警告 + 允许覆盖 | 渐进式采用的团队 |
| `off` | 不执行任何检查 | 选择退出 |

**默认值**：`enforce`

```yaml
# .uds/config.yaml
workflow:
  enforcement_mode: enforce  # enforce | suggest | off
```

## 阶段闸门架构

### 运作方式

1. 用户调用工作流程命令（例如 `/sdd implement`）
2. AI 助手检查该阶段的前置条件
3. 如果前置条件通过 → 正常进行
4. 如果前置条件失败：
   - **enforce 模式**：停止、解释、引导到正确阶段
   - **suggest 模式**：警告、允许覆盖
   - **off 模式**：完全跳过检查

### 闸门类型

| 闸门类型 | 阻断 | 描述 |
|---------|------|------|
| **硬闸门** | 是 | 必须通过才能继续（例如：规格必须为已核准才能实作） |
| **软闸门** | 否 | 建议性警告（例如：建议在 commit 中引用规格） |

## SDD 阶段闸门

```
discuss → create → review → approve → implement → verify
```

| 阶段 | 前置条件 |
|------|---------|
| discuss | 无（入口点） |
| create | 检查孤儿规格（软闸门） |
| review | 规格存在且状态 = Draft |
| approve | 规格存在且状态 = Review，所有评论已处理 |
| implement | 规格存在且状态 = Approved |
| verify | 实作存在，所有 AC 有代码 + 测试 |

## TDD 阶段闸门

```
RED → GREEN → REFACTOR → (重复)
```

| 阶段 | 前置条件 |
|------|---------|
| RED | 功能/行为已明确定义 |
| GREEN | 至少一个失败的测试存在（不是错误，而是断言失败） |
| REFACTOR | 所有测试通过 |

**关键强制规则**：AI 不得在失败测试存在之前撰写实作代码。这是 TDD 的基本契约。

## BDD 阶段闸门

```
DISCOVERY → FORMULATION → AUTOMATION → LIVING DOCS
```

| 阶段 | 前置条件 |
|------|---------|
| DISCOVERY | 行为/功能已识别 |
| FORMULATION | 探索阶段产出的具体范例存在 |
| AUTOMATION | 包含 Gherkin 场景的 `.feature` 文件存在 |
| LIVING DOCS | 步骤定义已实作，所有场景通过 |

## 提交闸门

| 检查 | 类型 | 触发 |
|------|------|------|
| 存在已暂存的变更 | 硬闸门 | 所有提交 |
| 无合并冲突 | 硬闸门 | 所有提交 |
| 测试通过 | 硬闸门 | feat/fix 提交 |
| 规格引用 | 软闸门 | 有活跃规格的 feat/fix 提交 |

## 实作注意事项

### 对于 AI 助手

AI 助手应该：
1. 在执行任何工作流程阶段**之前**检查闸门
2. 使用项目配置中的执行模式
3. 当闸门失败时提供清晰、可操作的指引
4. 在开始新工作流程前检查是否有可恢复的工作流程状态
5. 在 `.workflow-state/` 中追踪阶段转换

### 对于 CLI 工具

CLI 工具可通过以下方式整合闸门：
1. `WorkflowGate` 模块 — 验证阶段转换
2. Pre-commit hooks — 警告工作流程合规性
3. `uds check` — 报告工作流程状态

### 对于 Git Hooks

Git 层级的执行应为**仅警告**（非阻断），以避免让开发者感到挫折。AI 层级处理阻断性执行，因为它可以解释和引导。

## 与其他标准的关系

| 标准 | 关系 |
|------|------|
| [工作流状态协议](workflow-state-protocol.md) | 闸门检查由此协议管理的状态文件 |
| [规格驱动开发](spec-driven-development.md) | SDD 阶段闸门强制 SDD 工作流程 |
| [测试标准](testing-standards.md) | TDD/BDD 闸门强制测试方法论 |
| [提交消息指南](commit-message-guide.md) | 提交闸门强制规格追踪性 |
| [签入标准](checkin-standards.md) | Pre-commit 闸门补充签入规则 |
