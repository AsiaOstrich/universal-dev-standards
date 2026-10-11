---
source: ../../../../skills/commands/atdd.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: c056275ece8c
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

详见 [methodology-system](../dev-methodology/SKILL.md) 了解完整方法论追踪。

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

## AI 代理行为

> 遵循 [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### 进入路由

| 输入 | AI 动作 |
|------|---------|
| `/atdd` | 询问用户故事，进入 🤝 WORKSHOP |
| `/atdd "user story"` | 以指定故事为目标，进入 🤝 WORKSHOP |
| `/atdd <story-id>` | 加载现有故事，判断进入哪个阶段 |

### 交互脚本

#### 🤝 WORKSHOP Phase

1. 请用户描述用户故事（As a / I want / So that）
2. 引导定义验收条件（Given-When-Then）
3. 记录 Out of Scope 项目

**Decision: PO 角色**
- IF 用户是 PO → 直接收集 AC
- IF 用户是开发者 → AI 模拟 PO 视角提出质疑和补充
- ELSE → 建议邀请 PO 参与，或由 AI 辅助

🛑 **STOP**: AC 定义完成后展示用户故事文件，等待确认

#### 🧪 DISTILLATION Phase

1. 将 AC 转换为可执行的测试格式
2. 消除歧义
3. 展示可执行测试

🛑 **STOP**: 展示测试后等待用户（或 PO）签核

#### 💻 DEVELOPMENT Phase

1. 运行验收测试（预期失败）
2. 使用 BDD/TDD 实现功能
3. 迭代直到所有测试通过

🛑 **STOP**: 所有测试通过后等待用户确认进入 DEMO

#### 🎬 DEMO Phase

1. 展示通过的测试结果
2. 展示可运作的功能
3. 等待 PO 正式验收

🛑 **STOP**: 等待用户确认 PO 已验收

### 停止点

| 阶段 | 停止点 | 等待内容 |
|------|--------|---------|
| WORKSHOP | AC 定义后 | 确认用户故事 |
| DISTILLATION | 测试转换后 | PO 签核 |
| DEVELOPMENT | 所有测试通过后 | 确认进入 DEMO |
| DEMO | 功能展示后 | PO 正式验收 |

### 错误处理

| 错误条件 | AI 动作 |
|----------|---------|
| 用户故事不符合 INVEST 准则 | 指出哪些准则未满足，建议修改 |
| PO 不在场 | AI 模拟 PO 视角提问，标记 `[Needs PO Confirmation]` |
| 验收测试无法自动化 | 建议手动测试替代方案，产出测试检查清单 |
| DEVELOPMENT 阶段反复失败 | 回到 WORKSHOP 重新审视 AC 是否合理 |

## 参考

- 核心规范: [acceptance-test-driven-development.md](../../core/acceptance-test-driven-development.md)
- 技能: [atdd-assistant](../atdd-assistant/SKILL.md)
- 方法论: [atdd.methodology.yaml](../../../../methodologies/atdd.methodology.yaml)
- 方法论系统: [methodology-system](../dev-methodology/SKILL.md)
