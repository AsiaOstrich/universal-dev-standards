---
source: ../../../../skills/atdd-assistant/guide.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-16
source_hash: 10e5e8da5ac4
status: current
scope: partial
description: |
  引导团队完成验收测试驱动开发工作流程。
  使用时机：定义验收标准、进行规格研讨会、撰写含验收测试的用户故事、PO 签核。
  关键字：ATDD, acceptance test, acceptance criteria, user story, product owner, specification workshop, 验收测试驱动开发.
---

# ATDD 助手

> **语言**: English | [繁体中文](../../../zh-TW/skills/atdd-assistant/SKILL.md)

**版本**: 1.0.0
**最后更新**: 2026-01-19
**适用范围**: Claude Code Skills

---

## 目的

本技能引导团队完成验收测试驱动开发工作流程，协助：
- 进行有效的规格研讨会
- 以 Given-When-Then 格式撰写可测试的验收标准
- 将标准转换为可执行的验收测试
- 确保 PO、Dev 和 QA 之间的良好协作
- 整合 ATDD 与 BDD 和 TDD 以实现完整工作流程

---

## 快速参考

### ATDD 工作流程检查清单

```
┌─────────────────────────────────────────────────────────────────┐
│  🤝 SPECIFICATION WORKSHOP Phase                                 │
│  □ Product Owner presents user story                            │
│  □ Team asks clarifying questions                               │
│  □ Acceptance criteria defined together                         │
│  □ Concrete examples written for each AC                        │
│  □ Edge cases and error scenarios discussed                     │
│  □ Out of scope explicitly documented                           │
├─────────────────────────────────────────────────────────────────┤
│  🧪 DISTILLATION Phase                                           │
│  □ Examples converted to executable tests                       │
│  □ Ambiguity removed from tests                                 │
│  □ Tests in executable format (Gherkin, FitNesse, etc.)         │
│  □ Product Owner signs off on tests                             │
├─────────────────────────────────────────────────────────────────┤
│  💻 DEVELOPMENT Phase                                            │
│  □ Acceptance tests initially fail (RED)                        │
│  □ BDD used for feature tests, TDD for unit tests               │
│  □ Incremental progress toward passing ATs                      │
│  □ All acceptance tests pass (GREEN)                            │
│  □ Code refactored and clean                                    │
├─────────────────────────────────────────────────────────────────┤
│  🎬 DEMO Phase                                                   │
│  □ All acceptance tests passing                                 │
│  □ Demo environment prepared                                    │
│  □ Key stakeholders present                                     │
│  □ Product Owner validates functionality                        │
│  □ Story accepted or criteria refined                           │
└─────────────────────────────────────────────────────────────────┘
```

### 验收标准快速参考

| 元素 | 格式 | 示例 |
|---------|--------|---------|
| **用户故事** | As a / I want / So that | 作为客户，我想要重设密码，以便我能重新获得访问权限 |
| **AC 格式** | Given / When / Then | 假设我在登录页面，当我点击“忘记密码”，那么我应该看到重设表单 |
| **范围外** | 项目列表 | - 短信重设，- 管理员重设功能 |
| **技术备注** | 项目列表 | - Token 在 24 小时后过期 |

### INVEST 准则

| 原则 | 描述 | 检查 |
|-----------|-------------|-------|
| **I**ndependent 独立 | 可独立开发 | 无阻塞依赖 |
| **N**egotiable 可协商 | 细节可讨论 | 非合同 |
| **V**aluable 有价值 | 交付业务价值 | PO 能解释“为什么” |
| **E**stimable 可估算 | 可被估算 | 团队理解范围 |
| **S**mall 小 | 可在一个 Sprint 内完成 | < 1 周工作量 |
| **T**estable 可测试 | 可被验证 | 明确的验收标准 |

---

## 工作流程协助

### 规格研讨会指引

进行规格研讨会时：

1. **故事说明** (5 分钟)
   ```
   User Story: [Title]

   As a [role]
   I want [feature]
   So that [benefit]

   Business Value: [Why this matters]
   ```

2. **澄清问题** (10 分钟)
   - 业务：“价值是什么？”、“用户是谁？”
   - 开发：“影响是什么？”、“依赖？”
   - 测试：“可能出什么错？”、“边界用例？”

3. **AC 定义** (20 分钟)
   ```markdown
   ### AC-1: [Criterion name]
   **Given** [precondition]
   **When** [action]
   **Then** [expected result]
   ```

4. **范围外** (10 分钟)
   - 明确列出不包含的内容
   - 防止开发期间范围蔓延

5. **技术备注** (5 分钟)
   - 实现提示
   - 已知约束
   - 依赖

### 精炼指引

将 AC 转换为可执行测试时：

1. **审查每个 AC**
   - 是否明确无歧义？
   - 可以自动化吗？
   - 是否验证业务价值？

2. **选择测试格式**
   | 格式 | 最适合 |
   |--------|----------|
   | Gherkin | 聚焦行为、业务可读 |
   | FitNesse | 数据驱动、Wiki 表格 |
   | Robot Framework | 复杂工作流程 |
   | 代码 (xUnit) | 技术团队 |

3. **撰写可执行测试**
   ```gherkin
   # For AC-1: Password reset request
   Scenario: Request password reset
     Given I am on the login page
     And I have a registered account
     When I click "Forgot Password"
     And I enter my email address
     Then I should see "Reset link sent"
     And I should receive an email within 5 minutes
   ```

4. **取得 PO 签核**
   - PO 确认测试代表需求
   - 开发开始前签核

### 演示指引

准备演示时：

1. **演示前检查清单**
   ```
   □ All acceptance tests passing
   □ Demo environment ready
   □ Test data prepared
   □ Stakeholders notified
   ```

2. **演示结构** (15-30 分钟)
   - 背景 (1 分钟)：重申故事和 AC
   - 测试 (2 分钟)：现场运行验收测试
   - 功能 (5-10 分钟)：逐一演示每个 AC
   - 反馈 (5 分钟)：收集反馈、问答

3. **可能结果**
   - ✅ 接受：故事完成
   - 🔄 精炼：返回研讨会
   - ❌ 拒绝：找出差距

---

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

### AC-3: [Edge case]
**Given** [edge condition]
**When** [action]
**Then** [appropriate result]

## Out of Scope
- [Feature 1 not included]
- [Feature 2 deferred to future]

## Technical Notes
- [Implementation constraint]
- [Dependency information]
- [Performance requirement]

## Questions / Assumptions
- [Open question 1]
- [Assumption 1]
```

---

## 与其他工作流程整合

### ATDD → BDD → TDD 流程

```
ATDD Level (Business Acceptance)
  │
  │  User Story + Acceptance Criteria
  │  PO Sign-off
  │
  ▼
BDD Level (Behavior Specification)
  │
  │  Feature Files (Gherkin)
  │  Three Amigos collaboration
  │
  ▼
TDD Level (Implementation)
  │
  │  Unit Tests
  │  Red → Green → Refactor
  │
  ▼
Verification (Demo)
  │
  └──▶ PO Acceptance
```

### ATDD + SDD 整合

```markdown
# Link ATDD to SDD Spec

## User Story: US-123

**Spec Reference**: SPEC-001

### AC-1: Implements SPEC-001 Section 3.1
**Given** [from spec requirements]
**When** [action per spec]
**Then** [expected per spec]
```

---

## 配置侦测

本技能支持项目特定配置。

### 侦测顺序

1. 检查 `CONTRIBUTING.md` 的「Disabled Skills」区段
2. 检查 `CONTRIBUTING.md` 的「ATDD Standards」区段
3. 检查现有的验收测试模式
4. 若未找到，**默认使用标准 ATDD 实务**

### 首次设置

若未找到配置：

1. 询问：「此项目尚未配置 ATDD 偏好。您偏好哪种验收测试格式？」
   - Gherkin (Cucumber, SpecFlow)
   - FitNesse 表格
   - 代码基础 (xUnit)

2. 选择后，建议记录在 `CONTRIBUTING.md`：

```markdown
## ATDD Standards

### Acceptance Test Format
- Gherkin (Cucumber.js)

### User Story Template
- INVEST criteria required
- Given-When-Then format for AC

### Workflow
- Specification workshop required for all stories
- PO sign-off before development
- Demo for each completed story
```

---

## 详细指南

完整标准请参阅：
- [ATDD 核心标准](../../core/acceptance-test-driven-development.md)
- [ATDD 工作流程指南](./atdd-workflow.md)
- [验收标准指南](./acceptance-criteria-guide.md)

相关标准：
- [BDD 标准](../../core/behavior-driven-development.md)
- [TDD 标准](../../core/test-driven-development.md)
- [测试标准](../../core/testing-standards.md)

---

## 反模式快速侦测

| 症状 | 可能问题 | 快速修复 |
|------|---------|---------|
| 功能标记完成但 PO 拒绝 | AC 未与 PO 验证 | 强制 PO 签核 |
| 长期开发无进展 | AC 太大或模糊 | 拆分为更小的标准 |
| 验收测试首次就通过 | 实现后才写测试 | 开发前写测试 |
| 无尽的范围讨论 | 没有「范围外」定义 | 明确范围外 |
| AC 无法自动化 | QA/Dev 未参与 AC 定义 | 研讨会纳入技术观点 |

---

## RACI 矩阵

| 活动 | 产品负责人 | 开发人员 | QA/测试人员 |
|------|-----------|---------|------------|
| 定义用户故事 | **R/A** | C | C |
| 规格研讨会 | **R** | C | C |
| 定义验收标准 | **A** | R | R |
| 撰写可执行测试 | C | R | **R/A** |
| 实现功能 | C | **R/A** | C |
| 执行验收测试 | I | R | **R/A** |
| 接受/拒绝功能 | **R/A** | I | I |

**图例**: R = 负责, A = 当责, C = 咨询, I = 知会

---

## 相关标准

- [验收测试驱动开发](../../core/acceptance-test-driven-development.md) - 核心 ATDD 标准
- [行为驱动开发](../../core/behavior-driven-development.md) - BDD 标准
- [测试驱动开发](../../core/test-driven-development.md) - TDD 标准
- [规格驱动开发](../../core/spec-driven-development.md) - SDD 工作流程
- [测试标准](../../core/testing-standards.md) - 测试框架
- [BDD 助手](../bdd-assistant/SKILL.md) - BDD 技能
- [TDD 助手](../tdd-assistant/SKILL.md) - TDD 技能

---

## 版本历史

| 版本 | 日期 | 变更 |
|---------|------|---------|
| 1.0.0 | 2026-01-19 | 初始发布 |

---

## 授权

本技能以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权发布。

**来源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
