---
source: ../../../../skills/bdd-assistant/guide.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-16
source_hash: b428d2d778bd
status: current
scope: partial
description: |
  引导开发者完成行为驱动开发工作流程。
  使用时机：撰写 BDD 场景、使用 Gherkin 语法、Given-When-Then 格式、Feature 文件、三方协作。
  关键字：BDD, behavior-driven, Given When Then, Gherkin, Cucumber, scenario, feature file, step definition, 行为驱动开发.
---

# BDD 助手

> **语言**: [English](../../../../skills/bdd-assistant/guide.md) | [繁體中文](../../../zh-TW/skills/bdd-assistant/guide.md) | 简体中文

**版本**: 1.0.0
**最后更新**: 2026-01-19
**适用范围**: Claude Code Skills

---

## 目的

本技能引导开发者完成行为驱动开发工作流程，协助：
- 进行 Discovery 会议探索需求
- 以 Given-When-Then 格式撰写有效的 Gherkin 场景
- 创建可重用的步骤定义
- 整合 BDD 与 TDD 进行实现
- 维护活文档

---

## 快速参考

### BDD 工作流程检查清单

```
┌─────────────────────────────────────────────────────────────────┐
│  🔍 DISCOVERY Phase                                              │
│  □ 利益相关方已识别（商业、Dev、QA）                             │
│  □ 用户故事已讨论并理解                                          │
│  □ 具体示例已收集（Example Mapping）                             │
│  □ 边界案例已识别                                                │
│  □ 问题已回答或记录待追踪                                        │
├─────────────────────────────────────────────────────────────────┤
│  📝 FORMULATION Phase                                            │
│  □ 场景使用正确的 Gherkin 语法                                   │
│  □ 场景是声明式的（WHAT，不是 HOW）                              │
│  □ 使用商业语言（无技术术语）                                    │
│  □ 每个场景独立且自包含                                          │
│  □ 场景最多 5-10 个步骤                                          │
│  □ 场景已由利益相关方审查                                        │
├─────────────────────────────────────────────────────────────────┤
│  ⚙️ AUTOMATION Phase                                             │
│  □ 所有步骤已创建步骤定义                                        │
│  □ 步骤定义可重用                                                │
│  □ 场景初始失败（RED）                                           │
│  □ TDD 用于单元层级实现                                          │
│  □ 所有场景通过（GREEN）                                         │
│  □ 代码重构且整洁                                                │
└─────────────────────────────────────────────────────────────────┘
```

### Gherkin 快速参考

| 关键字 | 用途 | 示例 |
|--------|------|------|
| `Feature` | 场景容器 | `Feature: User Login` |
| `Scenario` | 单一测试用例 | `Scenario: Successful login` |
| `Given` | 设置初始上下文 | `Given I am on the login page` |
| `When` | 触发操作 | `When I enter valid credentials` |
| `Then` | 断言结果 | `Then I should see my dashboard` |
| `And`/`But` | 延续前一个 | `And I should see a welcome message` |
| `Background` | 公共设置 | 在每个场景之前运行 |
| `Scenario Outline` | 数据驱动 | 带有 Examples 表格的模板 |

### 声明式 vs 命令式

```gherkin
# ❌ BAD - 命令式（过于细节，以 UI 为中心）
Scenario: Login
  Given I navigate to "http://example.com/login"
  And I click on the username field
  And I type "john@example.com"
  And I click on the password field
  And I type "secret123"
  And I click the submit button
  Then I should see "Dashboard" in the page title

# ✅ GOOD - 声明式（以行为为中心）
Scenario: Successful login with valid credentials
  Given I am a registered user
  When I login with valid credentials
  Then I should see my dashboard
```

---

## Three Amigos 快速参考

| 角色 | 关注点 | 要问的问题 |
|------|-------|------------------|
| **商业** (PO/BA) | What & Why | “价值是什么？”，“用户是谁？” |
| **开发** | How | “技术影响是什么？”，“依赖项有哪些？” |
| **测试** (QA) | What if | “可能出什么问题？”，“边界案例？” |

---

## 工作流程协助

### 探索阶段指引

探索需求时：

1. **Example Mapping**
   ```
   🟡 User Story: "User can login"
        │
        ├─ 🔵 Rule: "Users must be authenticated"
        │      ├─ 🟢 Example: Valid credentials → login success
        │      └─ 🟢 Example: Invalid credentials → error message
        │
        ├─ 🔵 Rule: "Account lockout after failures"
        │      ├─ 🟢 Example: 3 failures → account locked
        │      └─ 🟢 Example: Locked account → cannot login
        │
        └─ 🔴 Question: Password expiration policy?
   ```

2. **要问的问题**
   - 正常路径（happy path）是什么？
   - 可能出什么问题？
   - 边界条件是什么？
   - 哪些内容明确属于范围之外？

### 制定阶段指引

撰写场景时：

1. **Feature 文件结构**
   ```gherkin
   Feature: Feature name
     As a [role]
     I want [feature]
     So that [benefit]

     Background:
       Given common preconditions

     Scenario: Descriptive scenario name
       Given [initial context]
       When [action]
       Then [expected outcome]
   ```

2. **场景风格指南**
   - 每个场景对应一个行为
   - 使用商业语言
   - 保持步骤为声明式
   - 目标最多 5-10 个步骤
   - 使场景保持独立

### 自动化阶段指引

实现时：

1. **步骤定义最佳实践**
   ```typescript
   // ✅ Good: Reusable, parameterized
   Given('I have {int} items in my cart', (count) => { ... });

   // ❌ Bad: Specific to one scenario
   Given('I have 3 widgets in my cart', () => { ... });
   ```

2. **BDD + TDD 整合**
   ```
   BDD Scenario (feature level)
        │
        └──▶ Step Definitions
                │
                └──▶ TDD Cycle (unit level)
                      🔴 Write failing unit test
                      🟢 Implement minimal code
                      🔵 Refactor
   ```

---

## 与其他工作流程整合

### BDD + SDD

与规格驱动开发一起工作时：

```gherkin
# Reference spec in feature file
# @spec SPEC-001
Feature: User Authentication
  Implements SPEC-001 user authentication requirements.

  @SPEC-001 @AC-1
  Scenario: Successful login
    # Acceptance Criterion 1 from SPEC-001
    ...
```

### BDD + TDD

```
Scenario Level (BDD)           Unit Level (TDD)
─────────────────────          ─────────────────
Scenario: Checkout    ──────▶  test_calculate_total()
  Given cart items             test_apply_discount()
  When checkout                test_create_order()
  Then order created           test_send_email()
```

### BDD + ATDD

```
ATDD: Acceptance Criteria (business sign-off)
  │
  └──▶ BDD: Feature Files (Gherkin scenarios)
         │
         └──▶ TDD: Unit Tests (implementation)
```

---

## 配置检测

本技能支持项目特定配置。

### 检测顺序

1. 检查 `CONTRIBUTING.md` 的“Disabled Skills”部分
   - 若此技能被列出，则在此项目中禁用
2. 检查 `CONTRIBUTING.md` 的“BDD Standards”部分
3. 检查代码库中现有的 `.feature` 文件
4. 若未找到，**默认使用标准 BDD 实践**

### 首次设置

若未找到配置且上下文不明确：

1. 询问：“此项目尚未配置 BDD 偏好。您使用哪个 BDD 工具？”
   - Cucumber (JavaScript/TypeScript)
   - Behave (Python)
   - SpecFlow (C#)
   - 其他

2. 选择后，建议记录在 `CONTRIBUTING.md`：

```markdown
## BDD Standards

### BDD Tool
- Cucumber.js

### Feature File Location
- `features/` directory

### Scenario Style
- Declarative (behavior-focused)
- Business language required
- Max 10 steps per scenario
```

---

## 详细指南

完整标准请参阅：
- [BDD Core Standard](../../core/behavior-driven-development.md)
- [BDD Workflow Guide](./bdd-workflow.md)
- [Gherkin Quick Reference](./gherkin-guide.md)

相关标准：
- [TDD Standards](../../core/test-driven-development.md)
- [ATDD Standards](../../core/acceptance-test-driven-development.md)
- [Testing Standards](../../core/testing-standards.md)

---

## 反模式快速检测

| 症状 | 可能的问题 | 快速修复 |
|---------|----------------|-----------|
| 场景因 UI 变更而破坏 | 命令式风格 | 使用声明式语言 |
| 业务人员无法阅读场景 | 技术术语 | 使用业务语言 |
| 场景通过但功能无法正常运行 | 遗漏场景 | 进行更充分的 Discovery 会议 |
| 场景过多 | 场景爆炸 | 使用 Scenario Outlines |
| 步骤定义重复 | 不可重用 | 提取到 helper 中 |

---

## 相关标准

- [Behavior-Driven Development](../../core/behavior-driven-development.md) - 核心 BDD 标准
- [Acceptance Test-Driven Development](../../core/acceptance-test-driven-development.md) - ATDD 标准
- [Test-Driven Development](../../core/test-driven-development.md) - TDD 标准
- [Spec-Driven Development](../../core/spec-driven-development.md) - SDD 工作流程
- [Testing Standards](../../core/testing-standards.md) - 测试框架
- [TDD Assistant](../tdd-assistant/SKILL.md) - TDD 技能

---

## 版本历史

| 版本 | 日期 | 变更 |
|---------|------|---------|
| 1.0.0 | 2026-01-19 | 初始发布 |

---

## 许可证

本技能在 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可下发布。

**来源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
