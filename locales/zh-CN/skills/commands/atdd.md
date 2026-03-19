---
source: ../../../../skills/commands/atdd.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-19
status: experimental
---

---
description: [UDS] Guide through Acceptance Test-Driven Development workflow
allowed-tools: Read, Write, Grep, Glob, Bash(npm test:*), Bash(npx:*)
argument-hint: "[要定义的用户故事或功能 | user story or feature to define]"
status: experimental
---

# ATDD 助手

> [!WARNING]
> **实验性功能 / Experimental Feature**
>
> 此功能正在积极开发中，可能在 v4.0 中有重大变更。
> This feature is under active development and may change significantly in v4.0.

引导验收测试驱动开发（ATDD）流程，用于定义和实现用户故事。

## 方法论集成

当调用 `/atdd` 时：
1. **自动启用 ATDD 方法论**（如果尚未启用）
2. **将当前阶段设为规格工作坊**（定义验收条件）
3. **追踪阶段转换**随着工作进展
4. **在响应中显示阶段指示器**（🤝 工作坊、🧪 提炼、💻 开发、🎬 展示、✅ 完成）

详见 [methodology-system](../methodology-system/SKILL.md) 了解完整方法论追踪。

## ATDD 循环

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ┌──────────┐  ┌───────────┐  ┌───────────┐  ┌──────┐  ┌──────┐│
│  │ WORKSHOP │► │ DISTILL   │► │ DEVELOP   │► │ DEMO │► │ DONE ││
│  └──────────┘  └───────────┘  └───────────┘  └──────┘  └──────┘│
│       ▲                              │              │           │
│       │                              │              │           │
│       └──────────────────────────────┴──────────────┘           │
│                  (Refinement needed)                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 工作流程

### 1. 规格工作坊 - 定义验收条件
- PO 提出用户故事
- 团队提出澄清问题
- 共同定义验收条件
- 记录超出范围的项目

### 2. 提炼 - 转换为测试
- 将 AC 转换为可执行的测试格式
- 消除歧义
- 获得 PO 签核

### 3. 开发 - 实现
- 运行验收测试（应该先失败）
- 使用 BDD/TDD 进行实现
- 迭代直到所有测试通过

### 4. 展示 - 向利害关系人展示
- 展示通过的验收测试
- 演示工作中的功能
- 获得 PO 正式验收

### 5. 完成
- PO 已验收
- 代码已合并
- 故事已关闭

## 用户故事模板

```markdown
## User Story: [Title]

**As a** [role]
**I want** [feature]
**So that** [benefit]

## Acceptance Criteria

### AC-1: [Happy path]
**Given** [precondition]
**When** [action]
**Then** [expected result]

### AC-2: [Error scenario]
**Given** [precondition]
**When** [invalid action]
**Then** [error handling]

## Out of Scope
- [Things explicitly not included]

## Technical Notes
- [Implementation hints]
```

## INVEST 准则

| 准则 | 描述 |
|------|------|
| **I**ndependent | 可独立开发 |
| **N**egotiable | 细节可协商 |
| **V**aluable | 提供商业价值 |
| **E**stimable | 可估算 |
| **S**mall | 一个 Sprint 可完成 |
| **T**estable | 有明确验收条件 |

## 与 BDD/TDD 集成

```
ATDD Level (Business Acceptance)
  │
  └─▶ BDD Level (Behavior Specification)
         │
         └─▶ TDD Level (Unit Implementation)
```

## 使用方式

- `/atdd` - 启动互动式 ATDD 会话
- `/atdd "user can reset password"` - 针对特定功能的 ATDD
- `/atdd US-123` - 针对现有用户故事的 ATDD

## 阶段检查清单

### 工作坊阶段
- [ ] PO 在场
- [ ] 用户故事已说明
- [ ] AC 使用 Given-When-Then 格式
- [ ] 超出范围已记录

### 提炼阶段
- [ ] AC 已转换为可执行测试
- [ ] 测试无歧义
- [ ] PO 已签核

### 开发阶段
- [ ] 验收测试最初失败
- [ ] 使用 BDD/TDD 进行实现
- [ ] 所有验收测试通过

### 展示阶段
- [ ] 展示环境就绪
- [ ] 测试显示通过
- [ ] PO 正式验收

## 参考

- 核心规范: [acceptance-test-driven-development.md](../../core/acceptance-test-driven-development.md)
- 技能: [atdd-assistant](../atdd-assistant/SKILL.md)
- 方法论: [atdd.methodology.yaml](../../methodologies/atdd.methodology.yaml)
- 方法论系统: [methodology-system](../methodology-system/SKILL.md)
