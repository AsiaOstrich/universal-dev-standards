---
source: ../../../../skills/bdd-assistant/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-02-05
status: current
scope: partial
description: |
  引导开发者完成行为驱动开发工作流程。
  使用时机：撰写 BDD 场景、使用 Gherkin 语法、Given-When-Then 格式、Feature 文件、三方协作。
  关键字：BDD, behavior-driven, Given When Then, Gherkin, Cucumber, scenario, feature file, step definition, 行为驱动开发.
---

# BDD 助手

> **语言**: [English](../../../../skills/bdd-assistant/SKILL.md) | 简体中文

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
│  🔍 探索阶段                                                     │
│  □ 利益相关方已识别（商业、Dev、QA）                             │
│  □ 用户故事已讨论并理解                                          │
│  □ 具体示例已收集（Example Mapping）                             │
│  □ 边界案例已识别                                                │
│  □ 问题已回答或记录待追踪                                        │
├─────────────────────────────────────────────────────────────────┤
│  📝 制定阶段                                                     │
│  □ 场景使用正确的 Gherkin 语法                                   │
│  □ 场景是声明式的（WHAT，不是 HOW）                              │
│  □ 使用商业语言（无技术术语）                                    │
│  □ 每个场景独立且自包含                                          │
│  □ 场景最多 5-10 个步骤                                          │
│  □ 场景已由利益相关方审查                                        │
├─────────────────────────────────────────────────────────────────┤
│  ⚙️ 自动化阶段                                                   │
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
| `Feature` | 场景容器 | `Feature: 用户登录` |
| `Scenario` | 单一测试案例 | `Scenario: 成功登录` |
| `Given` | 设置初始情境 | `Given 我在登录页面` |
| `When` | 触发动作 | `When 我输入有效凭证` |
| `Then` | 断言结果 | `Then 我应该看到我的仪表板` |
| `And`/`But` | 延续前一个 | `And 我应该看到欢迎消息` |
| `Background` | 共同设置 | 每个场景前执行 |
| `Scenario Outline` | 数据驱动 | 带 Examples 表格的模板 |

### 声明式 vs 命令式

```gherkin
# ❌ 坏 - 命令式（太详细，UI 导向）
Scenario: 登录
  Given 我导航到 "http://example.com/login"
  And 我点击用户名字段
  And 我输入 "john@example.com"
  And 我点击密码字段
  And 我输入 "secret123"
  And 我点击提交按钮
  Then 我应该在页面标题看到 "Dashboard"

# ✅ 好 - 声明式（行为导向）
Scenario: 使用有效凭证成功登录
  Given 我是注册用户
  When 我使用有效凭证登录
  Then 我应该看到我的仪表板
```

---

## 三方协作快速参考

| 角色 | 焦点 | 要问的问题 |
|------|------|----------|
| **商业** (PO/BA) | What & Why | 「价值是什么？」「用户是谁？」 |
| **开发** | How | 「技术影响是什么？」「依赖？」 |
| **测试** (QA) | What if | 「可能出什么错？」「边界案例？」 |

---

## 工作流程协助

### 探索阶段指引

探索需求时：

1. **Example Mapping**
   ```
   🟡 用户故事: "用户可以登录"
        │
        ├─ 🔵 规则: "用户必须通过验证"
        │      ├─ 🟢 示例: 有效凭证 → 登录成功
        │      └─ 🟢 示例: 无效凭证 → 错误消息
        │
        ├─ 🔵 规则: "失败后账号锁定"
        │      ├─ 🟢 示例: 3 次失败 → 账号锁定
        │      └─ 🟢 示例: 锁定账号 → 无法登录
        │
        └─ 🔴 问题: 密码过期政策？
   ```

2. **要问的问题**
   - Happy path 是什么？
   - 可能出什么错？
   - 边界条件是什么？
   - 明确的范围外是什么？

### 制定阶段指引

撰写场景时：

1. **Feature 文件结构**
   ```gherkin
   Feature: 功能名称
     As a [角色]
     I want [功能]
     So that [好处]

     Background:
       Given 共同前置条件

     Scenario: 描述性场景名称
       Given [初始情境]
       When [动作]
       Then [预期结果]
   ```

2. **场景风格指南**
   - 每个场景一个行为
   - 使用商业语言
   - 保持步骤声明式
   - 最多 5-10 个步骤
   - 使场景独立

### 自动化阶段指引

实现时：

1. **步骤定义最佳实践**
   ```typescript
   // ✅ 好: 可重用、参数化
   Given('我的购物车有 {int} 个商品', (count) => { ... });

   // ❌ 坏: 特定于一个场景
   Given('我的购物车有 3 个 Widget', () => { ... });
   ```

2. **BDD + TDD 整合**
   ```
   BDD 场景（功能层级）
        │
        └──▶ 步骤定义
                │
                └──▶ TDD 循环（单元层级）
                      🔴 撰写失败的单元测试
                      🟢 实现最小代码
                      🔵 重构
   ```

---

## 与其他工作流程整合

### BDD + SDD

与规格驱动开发一起工作时：

```gherkin
# 在 feature 文件中引用规格
# @spec SPEC-001
Feature: 用户认证
  实现 SPEC-001 用户认证需求。

  @SPEC-001 @AC-1
  Scenario: 成功登录
    # SPEC-001 的验收标准 1
    ...
```

### BDD + TDD

```
场景层级（BDD）           单元层级（TDD）
─────────────────────    ─────────────────
Scenario: 结账    ──────▶  test_calculate_total()
  Given 购物车商品         test_apply_discount()
  When 结账                test_create_order()
  Then 订单创建            test_send_email()
```

### BDD + ATDD

```
ATDD: 验收标准（商业签核）
  │
  └──▶ BDD: Feature 文件（Gherkin 场景）
         │
         └──▶ TDD: 单元测试（实现）
```

---

## 配置侦测

本技能支持项目特定配置。

### 侦测顺序

1. 检查 `CONTRIBUTING.md` 的「Disabled Skills」区段
   - 若此技能被列出，则在此项目中禁用
2. 检查 `CONTRIBUTING.md` 的「BDD Standards」区段
3. 检查代码库中现有的 `.feature` 文件
4. 若未找到，**默认使用标准 BDD 实务**

### 首次设置

若未找到配置且情境不明确：

1. 询问：「此项目尚未配置 BDD 偏好。您使用哪个 BDD 工具？」
   - Cucumber (JavaScript/TypeScript)
   - Behave (Python)
   - SpecFlow (C#)
   - 其他

2. 选择后，建议记录在 `CONTRIBUTING.md`：

```markdown
## BDD 标准

### BDD 工具
- Cucumber.js

### Feature 文件位置
- `features/` 目录

### 场景风格
- 声明式（行为导向）
- 需要商业语言
- 每个场景最多 10 个步骤
```

---

## 详细指南

完整标准请参阅：
- [BDD 核心标准](../../../../core/behavior-driven-development.md)
- [BDD 工作流程指南](./bdd-workflow.md)
- [Gherkin 快速参考](./gherkin-guide.md)

相关标准：
- [TDD 标准](../../../../core/test-driven-development.md)
- [ATDD 标准](../../../../core/acceptance-test-driven-development.md)
- [测试标准](../../../../core/testing-standards.md)

---

## 反模式快速侦测

| 症状 | 可能问题 | 快速修复 |
|------|---------|---------|
| 场景因 UI 变更而失败 | 命令式风格 | 使用声明式语言 |
| 商业无法阅读场景 | 技术术语 | 使用商业语言 |
| 场景通过但功能不工作 | 缺少场景 | 更好的 Discovery 会议 |
| 太多场景 | 场景爆炸 | 使用 Scenario Outline |
| 步骤定义重复 | 不可重用 | 抽取到辅助函数 |

---

## 相关标准

- [行为驱动开发](../../../../core/behavior-driven-development.md) - 核心 BDD 标准
- [验收测试驱动开发](../../../../core/acceptance-test-driven-development.md) - ATDD 标准
- [测试驱动开发](../../../../core/test-driven-development.md) - TDD 标准
- [规格驱动开发](../../../../core/spec-driven-development.md) - SDD 工作流程
- [测试标准](../../../../core/testing-standards.md) - 测试框架
- [TDD 助手](../tdd-assistant/SKILL.md) - TDD 技能

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0.0 | 2026-01-19 | 初始发布 |

---

## 授权

本技能以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权发布。

**来源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
