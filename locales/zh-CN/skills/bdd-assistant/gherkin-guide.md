---
source: ../../../../skills/bdd-assistant/gherkin-guide.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-02-05
status: current
---

# Gherkin 快速参考指南

**版本**: 1.0.0
**最后更新**: 2026-01-19

---

## 概述

Gherkin 是一种商业可读、领域特定的语言，用于描述软件行为而不详述该行为如何实现。

---

## 关键字

### Feature

相关场景的容器。

```gherkin
Feature: 购物车
  As a 客户
  I want 管理我的购物车
  So that 我可以购买我想要的产品
```

### Scenario

描述特定行为的单一测试案例。

```gherkin
Scenario: 添加商品到空购物车
  Given 我有一个空的购物车
  When 我添加「Widget」到我的购物车
  Then 我的购物车应该包含 1 个商品
```

### Given

设置初始情境或状态。

```gherkin
Given 我以 "admin@example.com" 登录
Given 我的购物车有 3 个商品
Given 存在以下用户:
  | email            | role  |
  | user@example.com | user  |
  | admin@example.com| admin |
```

### When

触发动作或事件。

```gherkin
When 我点击「提交」按钮
When 我搜索「笔记本电脑」
When 我添加「Widget」到我的购物车
```

### Then

断言预期结果。

```gherkin
Then 我应该看到「订单已确认」
Then 我的购物车总计应该是 $99.99
Then 我应该收到确认电子邮件
```

### And / But

延续前一个关键字。

```gherkin
Scenario: 使用有效凭证登录
  Given 我在登录页面
  And 我有一个注册账号
  When 我输入我的电子邮件
  And 我输入我的密码
  And 我点击登录
  Then 我应该看到我的仪表板
  And 我应该看到欢迎消息
  But 我不应该看到登录表单
```

### Background

功能中所有场景的共同设置。

```gherkin
Feature: 用户个人资料
  Background:
    Given 我已登录
    And 我在我的个人资料页面

  Scenario: 更新显示名称
    When 我将显示名称改为「新名称」
    Then 我的显示名称应该是「新名称」

  Scenario: 更新电子邮件
    When 我将电子邮件改为 "new@example.com"
    Then 我的电子邮件应该是 "new@example.com"
```

### Scenario Outline

带多组数据的模板。

```gherkin
Scenario Outline: 计算折扣
  Given 我的购物车总计 <cart_total>
  When 我应用折扣码 "<code>"
  Then 我的总计应该是 <final_total>

  Examples:
    | cart_total | code    | final_total |
    | $100       | SAVE10  | $90         |
    | $100       | SAVE20  | $80         |
    | $50        | SAVE10  | $45         |
```

---

## 数据表格

### 哈希表格（具名列）

```gherkin
Given 存在以下用户:
  | name  | email            | role  |
  | John  | john@example.com | admin |
  | Jane  | jane@example.com | user  |
```

```typescript
// 步骤定义
Given('存在以下用户:', async function (dataTable) {
  const users = dataTable.hashes();
  // users = [
  //   { name: 'John', email: 'john@example.com', role: 'admin' },
  //   { name: 'Jane', email: 'jane@example.com', role: 'user' }
  // ]
  for (const user of users) {
    await createUser(user);
  }
});
```

### 原始表格（无标题）

```gherkin
Given 我有以下商品:
  | Widget A |
  | Widget B |
  | Widget C |
```

```typescript
// 步骤定义
Given('我有以下商品:', async function (dataTable) {
  const items = dataTable.raw().flat();
  // items = ['Widget A', 'Widget B', 'Widget C']
});
```

### 行数组

```gherkin
Given 这些价格等级:
  | tier     | min | max  | discount |
  | Bronze   | 0   | 99   | 0%       |
  | Silver   | 100 | 499  | 5%       |
  | Gold     | 500 | 999  | 10%      |
```

```typescript
// 步骤定义
Given('这些价格等级:', async function (dataTable) {
  const rows = dataTable.rows();
  // rows = [
  //   ['Bronze', '0', '99', '0%'],
  //   ['Silver', '100', '499', '5%'],
  //   ['Gold', '500', '999', '10%']
  // ]
});
```

---

## Doc Strings

用于多行文本内容。

```gherkin
Scenario: 创建文章
  Given 我在新文章页面
  When 我输入以下内容:
    """
    # 欢迎

    这是文章内容。

    - 要点 1
    - 要点 2
    """
  And 我点击发布
  Then 文章应该被创建
```

---

## Tags

组织和筛选场景。

### 常用 Tags

```gherkin
@smoke @critical
Feature: 用户认证

  @happy-path
  Scenario: 成功登录
    ...

  @error-handling
  Scenario: 失败登录
    ...

  @wip
  Scenario: 双因素认证
    ...

  @slow @integration
  Scenario: SSO 登录
    ...
```

### Tag 类别

| Tag | 用途 |
|-----|------|
| `@smoke` | 快速健全性测试 |
| `@critical` | 高优先级功能 |
| `@wip` | 进行中的工作 |
| `@slow` | 长时间执行的测试 |
| `@manual` | 需要手动验证 |
| `@skip` | 暂时禁用 |
| `@integration` | 集成测试 |
| `@api` | API 层级测试 |
| `@ui` | UI 层级测试 |

### 使用 Tags 执行

```bash
# 只执行 smoke 测试
cucumber --tags @smoke

# 执行 critical 但不执行 slow 测试
cucumber --tags "@critical and not @slow"

# 执行 smoke 或 critical 测试
cucumber --tags "@smoke or @critical"
```

---

## 本地化

Gherkin 支持多种语言。

### 英文（默认）

```gherkin
Feature: Shopping Cart
  Scenario: Add item
    Given I have an empty cart
    When I add an item
    Then my cart should have 1 item
```

### 繁体中文 (zh-TW)

```gherkin
# language: zh-TW
功能: 購物車
  場景: 新增商品
    假設 我有一個空的購物車
    當 我新增一個商品
    那麼 我的購物車應該有 1 個商品
```

### 简体中文 (zh-CN)

```gherkin
# language: zh-CN
功能: 购物车
  场景: 添加商品
    假如 我有一个空的购物车
    当 我添加一个商品
    那么 我的购物车应该有 1 个商品
```

### 日文 (ja)

```gherkin
# language: ja
機能: ショッピングカート
  シナリオ: 商品を追加
    前提 カートが空である
    もし 商品を追加する
    ならば カートには 1 個の商品がある
```

---

## 最佳实践

### 应该

```gherkin
# ✅ 声明式 - 描述行为
Scenario: 成功结账
  Given 我的购物车有商品
  And 我已登录
  When 我使用有效付款完成结账
  Then 我的订单应该被确认

# ✅ 商业语言
Scenario: 应用会员折扣
  Given 我是金卡会员
  And 我的购物车总计 $100
  When 我进入结账
  Then 我应该获得 15% 折扣

# ✅ 独立场景
# 每个场景设置自己的情境
Scenario: 新用户注册
  Given 我是新访客
  When 我使用有效信息注册
  Then 我应该拥有一个账号
```

### 不应该

```gherkin
# ❌ 命令式 - 太技术
Scenario: 登录
  Given 我导航到 "/login"
  And 我输入 "user@example.com" 到 "#email"
  And 我输入 "password" 到 "#password"
  And 我点击 "#submit"
  Then 我应该看到元素 ".dashboard"

# ❌ 技术术语
Scenario: API 认证
  Given 我 POST 到 "/api/auth" 带 JSON payload
  Then 响应码应该是 200
  And 响应应该包含 "token"

# ❌ 相依场景
Scenario: 步骤 1 - 创建用户
  ...
Scenario: 步骤 2 - 以上面创建的用户登录
  # 这依赖于 Scenario 1 先执行！
```

---

## 常见模式

### Page Object 整合

```gherkin
# 场景引用页面，不是元素
Scenario: 导航到结账
  Given 我在购物车页面
  When 我点击进入结账
  Then 我应该在结账页面
```

### 数据驱动测试

```gherkin
Scenario Outline: 验证电子邮件格式
  When 我以电子邮件 "<email>" 注册
  Then 我应该看到 "<message>"

  Examples:
    | email           | message         |
    | valid@test.com  | 成功            |
    | invalid         | 无效电子邮件    |
    | @test.com       | 无效电子邮件    |
    |                 | 需要电子邮件    |
```

### Hooks（非 Gherkin）

```typescript
// 在步骤定义中
import { Before, After, BeforeAll, AfterAll } from '@cucumber/cucumber';

BeforeAll(async function () {
  // 所有场景前设置一次
  await database.connect();
});

Before(async function () {
  // 每个场景前设置
  await database.beginTransaction();
});

After(async function () {
  // 每个场景后清理
  await database.rollback();
});

AfterAll(async function () {
  // 所有场景后清理一次
  await database.disconnect();
});
```

---

## 各语言工具

| 语言 | 工具 | 包 |
|------|------|------|
| JavaScript | Cucumber.js | `@cucumber/cucumber` |
| TypeScript | Cucumber.js | `@cucumber/cucumber` |
| Python | Behave | `behave` |
| Python | pytest-bdd | `pytest-bdd` |
| Java | Cucumber-JVM | `io.cucumber:cucumber-java` |
| C# | SpecFlow | `SpecFlow` |
| Ruby | Cucumber | `cucumber` |
| Go | Godog | `github.com/cucumber/godog` |

---

## 相关资源

- [BDD 工作流程指南](./bdd-workflow.md)
- [BDD 核心标准](../../../../core/behavior-driven-development.md)
- [官方 Gherkin 参考](https://cucumber.io/docs/gherkin/reference/)
