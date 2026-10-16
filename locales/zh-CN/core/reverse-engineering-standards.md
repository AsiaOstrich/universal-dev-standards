---
source: ../../../core/reverse-engineering-standards.md
source_version: 1.3.0
translation_version: 1.3.0
last_synced: 2026-10-16
source_hash: 5d4bb821ae35
status: current
---

# Reverse Engineering Standards | 反向工程标准

**Version**: 1.3.0
**Last Updated**: 2026-08-20
**Applicability**: All projects requiring code-to-specification transformation
**Scope**: uds-specific
**Industry Standards**: IEEE 830-1998, SWEBOK v4.0 Chapter 9

> **语言**: [English](../../../core/reverse-engineering-standards.md) | [繁體中文](../../zh-TW/core/reverse-engineering-standards.md) | 简体中文

---

## 目的

本标准定义将现有代码反向工程为结构化规格文档的原则、工作流程和最佳实践。反向工程是连接遗留系统与现代开发方法论（SDD → BDD → TDD）的桥梁。

**主要收益**：
- 将未文档化的代码转换为可追溯的规格
- 在遗留系统上启用现代开发实践
- 在新团队成员与现有代码库之间建立共同理解
- 为未来的增强与重构奠定基础

---

## 反向工程工作流程

```
┌──────────────────────────────────────────────────────────────────────────┐
│                     Reverse Engineering Workflow                          │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌───────────┐  │
│  │ Code Scan   │───▶│Test Analysis│───▶│Gap Identify │───▶│ Spec Gen  │  │
│  └─────────────┘    └─────────────┘    └─────────────┘    └───────────┘  │
│        │                  │                  │                  │        │
│        │                  │                  │                  ▼        │
│        │                  │                  │         ┌───────────────┐ │
│        │                  │                  │         │ Human Review  │ │
│        │                  │                  │         └───────────────┘ │
│        │                  │                  │                  │        │
│        ▼                  ▼                  ▼                  ▼        │
│   [Confirmed]        [Confirmed]        [Unknown]         [Validated]    │
│   from code          from tests         for humans        specification  │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### 工作流程阶段

| 阶段 | 说明 | 产出物 | 确定性层级 |
|-------|-------------|--------|-----------------|
| **代码扫描** | 分析代码结构、API、数据模型 | 技术清单 | [已确认] |
| **测试分析** | 解析现有测试以提取验收条件 | 草拟验收条件 | [已确认]/[推论] |
| **隐含规则扫描** | 扫描非 HTTP 持久化写入路径中未文档化的规则 | 隐含规则清单 + 三问解答 | [已确认]/[推论]/[未知] |
| **权限范围提取** | 提取所有根据操作者自身身份限定结果范围的查询谓词 | 自作用域谓词清单 + 必需的反向测试 | [已确认]/[推论]/[未知] |
| **缺口识别** | 列出需要人工输入的未知项 | 缺口分析文档 | [未知] 项 |
| **规格生成** | 生成草拟规格 | 草拟 SPEC-XXX.md | 混合确定性 |
| **人工审查** | 利益相关者验证与填补缺口 | 已验证规格 | [已确认] |

> **注（v1.3.0）**：**权限范围提取**阶段与隐含规则扫描并行运行——参见下方的[权限范围提取（自引用查询谓词）](#auth-scope-extraction-self-referential-query-predicates)。隐含规则扫描涵盖那些由于在请求路径**之外**运行而不可见的规则。本阶段涵盖的则是一条虽然位于得到充分执行的请求路径**之上**却依然不可见的规则：一个根据操作者自身身份限定结果范围的 `WHERE` 谓词。它看起来只是若干过滤条件中的一个，而一旦重写时遗漏了它，返回的数据形状完全正确——却属于所有人。
>
> **注（v1.2.0）**：在代码扫描／测试分析之后、缺口识别之前插入了**隐含规则扫描**阶段——参见下方的[隐含规则扫描（非 HTTP 持久化规则）](#implicit-rule-scan-non-http-persistence-rules)。标准代码扫描提取 HTTP 入口点与数据模型，但持久化字段的值经常由**非 HTTP 路径**（cron、队列、计算列、触发器、ORM 钩子）写入，其业务规则从未被文档化——这是跨语言重写或跨数据库迁移中遗漏逻辑发生频率最高的原因。

---

## 隐含规则扫描（非 HTTP 持久化规则）

> **工作流程位置**：代码扫描／测试分析之后，缺口识别之前。

代码扫描提取的是通过 HTTP 可达的内容——路由、控制器、请求处理器。但持久化字段的值往往是在**请求路径之外**决定的：夜间 cron 翻转状态、队列重试重新打上时间戳、数据库触发器计算总和、ORM 生命周期钩子将计数器归零。这些规则很少被记录下来，因此仅镜像 HTTP 表面的重写会静默丢失它们。本阶段机械化地推导出每一条非 HTTP 写入路径，并将每条隐含规则锁定为可验证的产物。

### 推导（机械化清单来源）

扫描遗留系统中跨越四个类别的每一条**非 HTTP 持久化写入路径**：

1. **定时任务（Scheduled）**——crontab 条目、调度器配置、`@Scheduled` 风格注解、批处理作业
2. **队列（Queue）**——队列消费者、作业处理器、后台 worker、消息监听器
3. **数据库层（DB-layer）**——触发器、计算列/生成列、`DEFAULT` 表达式、检查约束
4. **ORM 生命周期（ORM lifecycle）**——`beforeSave`/`afterSave`/观察者/模型事件钩子、修改持久化状态的中间件

### 预言机（检测）——每个字段的三问

针对由非 HTTP 路径写入的每个持久化字段，回答并锁定**三个问题**：

| 问题 | 需要捕获的内容 |
|------|-----------------|
| **何时设值（SET）？** | 首次赋值的条件／触发器 |
| **何时被覆盖（OVERWRITTEN）？** | 之后每一次写入——**包括异步覆盖**（关联回割接后的聚合对账） |
| **何时重置／归零（RESET）？** | 清除或恢复为默认值的条件 |

- 将**魔鬼代言人（Devil's Advocate）**质疑从 HTTP 层扩展到**覆盖非 HTTP 路径**：将相同的五种对抗性类别（边界、顺序、并发、失败/重试、空值/默认值）应用于 cron 条件、队列重试、计算列和触发器逻辑。
- 为每条提取的规则标注确定性层级：`[已确认]`（附 `file:line` 引用）／`[推论]`／`[未知]`。每个 `[未知]` 均移交给缺口识别由人工处理——绝不臆测。
- **产出**：将每条隐含规则锁定为**行为快照场景（behavior-snapshot scenario）**或**对账不变量（reconciliation invariant）**（例如 `SUM(cost) GROUP BY status` 必须跨割接保持一致），使规则成为可重复运行的判定准则（oracle）而非散文式描述。

### 门禁时机

起飞前（规划期）。任何三个问题未获解答的非 HTTP 写入字段都会被标记为 `not_implemented` 并**阻断割接（blocks cutover）**——未声明的隐含规则被视为已知的遗漏风险，而非可接受的缺口。

### PHP 特别说明：宽松比较／type juggling

扫描 PHP 写入路径时，需额外标记**宽松比较／类型戏法（loose-comparison / type-juggling）**依赖项：`==` 比较、`"0"` / `""` / `null` / `0` 的真假值（truthy/falsy）行为，以及字符串到数字的自动强制转换。这些在强类型目标（例如 C#/.NET）下没有直接等价物，因此它们所编码的隐含规则是在跨语言重写期间静默丢失逻辑的高发来源。为每个此类位置标注 `[已确认]` 并附带 `file:line`，并将预期语义锁定为一条明确的规则。

---

## 权限范围提取（自引用查询谓词）

> **工作流程位置**：与隐含规则扫描并行——在代码扫描／测试分析之后，缺口识别之前。

**自引用谓词（self-referential predicate）**是一种根据*请求者是谁*来限定结果集范围的查询条件：`WHERE tenant_id = :current_user_tenant`、`WHERE owner = :uid`、`WHERE dept_id = (SELECT dept_id FROM member WHERE account = :uid)`。正是这行代码将“列出所有账户”变成了“列出**你的**账户”。

本阶段所回答的问题狭窄且机械化：

> **对于遗留代码中每一个根据操作者自身身份限定结果范围的谓词，移植后的代码是否具有等价的谓词？**

不是“它是否返回相同的结构形状”。不是“它是否返回数据”。而是一个**等价谓词**：相同的字段，绑定到对*自身（self）*相同的概念定义。

### 为什么这需要一个独立阶段

授权并非被遗漏的关注点——任何合格的测试分类法都早已将跨租户访问列为测试对象。该关注点并没有丢失；**它只是未被召回（un-recalled）**。以下三个特性使得这一特定缺陷能够在通常可以捕获它的所有门禁中幸存下来：

1. **关乎安全的关键代码行看起来就像普通过滤器。** 安全边界存在于 `WHERE` 子句内部，而非请求或响应契约中。移植“获取所有账户”的人会看到 `SELECT` 和 `JOIN`；租户谓词看起来只是众多条件中的又一个而已。
2. **基于结构形状的断言无法察觉作用域。** 一个以某个有效管理员身份调用端点并断言 `200` 以及非空列表的测试，无论作用域限定是正确的还是被彻底删除了，其通过情况都是**完全相同**的。契约测试、对等快照（parity snapshot）和响应 DTO 比较在此处结构性地失效（全然盲目）：无论哪种方式，响应格式都是良好的。只不过它属于所有人。
3. **存在共享解析器并不等同于该调用点使用了它。** 曾经吃过亏的代码库通常会发展出一个共享的作用域解析器（scope-resolver）工具类。新的或被忽视的调用点可能会从零重新实现该查询并且从未调用它——而该工具类在代码库其他地方的存在反而会产生极大的误导，因为它被误读为测试覆盖。

### 推导（机械化清单来源）

通过扫描遗留数据访问层来枚举候选谓词——切勿凭记忆行事。根据具体技术栈调整模式；目标是其右侧解析为**调用者自身的值**的任何条件：

| 信号 | 示例 |
|------|------|
| **直接自身绑定** | `WHERE <col> = :currentUser` / `:uid` / `$operatorId` / `session.user_id` |
| **租户／组织／所有者字段** | 与调用者派生值进行比较的 `tenant_id`、`org_id`、`master_account`、`owner_id`、`dept_id`、`company_id` |
| **解析调用者作用域的子查询** | `WHERE dept_id = (SELECT dept_id FROM member WHERE account = :uid)` |
| **按角色分支构建查询** | 基于 `role` / `account_type` 进行分支，其中**每个分支**应用不同的作用域——枚举每一个分支，而不仅仅是正常路径（happy path）所走的分支 |
| **在 SQL 之外应用的作用域** | ORM 全局作用域、查询构建器 mixin、仓储基类、行级安全策略、注入过滤器的中间件 |

最后一行至关重要：谓词可以由 `SELECT` 语句从未提及的机制来强制执行。仅对 SQL 进行 grep 将报告一个比实际存在的集合**更小**的集合，而在这里，更小的集合看起来恰恰像是一个更安全的集合。

### 记录（每个匹配项）

针对每个候选谓词进行记录——`[已确认]`需要 `file:line` 引用：

| 字段 | 内容 |
|------|------|
| **位置** | 遗留源码中的 `file:line` |
| **谓词** | 确切的条件文本 |
| **自身绑定** | 解析为哪一个调用者派生值，以及该值是如何获取的 |
| **触发分支** | 哪个角色／参数／代码路径到达此谓词 |
| **确定性** | `[已确认]` / `[推论]` / `[未知]` |

每个 `[未知]`——即无法从代码中确定的作用域——均进入缺口识别由人工处理。绝不臆测，也绝不假定其不存在。

### 预言机（检测）——每个调用点的谓词等价性

针对每个记录的谓词，在移植后的代码中验证：

1. **存在字面等价物**——相同的字段，绑定到对自身（self）相同的概念定义。一个“恰好对当前数据返回相同行”的不同字段并不是等价的；它只是一个带有有效期的巧合。
2. **覆盖每一个分支。** 如果遗留代码根据角色进行了不同的作用域限定，则每个分支都需要有自己经过验证的等价物。将五个角色分支合并为一个粗粒度的“此账户是否为管理员？”检查的移植实现，是用权限取代了边界。
3. **该调用点调用了共享解析器。** 如果新系统将作用域限定集中在一个工具类中，请确认**该**调用点确实调用了它。该工具类在代码库其他位置的存在，并不能作为该端点已正确处理的证据。

### 强制性反向测试

**规则 RE-AUTH-001（必需）**——每一个确认的自作用域谓词必须由一个**反向测试**锁定：操作者 **A** 发起请求，断言结果为操作者 **B** 的记录在响应中**不存在**。A 和 B 均为有效、已认证且被授权使用该端点的操作者。

断言必须是关于**不存在（absence）**。断言 `200`、非空列表或匹配的响应模式（schema）的测试不是充分的证据，且**绝不能**被视为对该谓词的覆盖——即使删除了作用域子句，这些测试中的每一项也都能照样通过。

在信任测试之前，一个有用的自检方法是：**在临时副本中删除作用域谓词并重新运行。**如果测试仍然通过，那么无论它的名称叫什么，它都没有在测试作用域。

### 门禁时机

提取阶段为起飞前（规划期）；反向测试阶段为 UAT 前。

**规则 RE-AUTH-002（必需）**——任何移植等价物未经验证或没有反向测试的自作用域谓词，均被标记为 `not_implemented` 并**阻断割接**。未经验证的授权边界是已知的遗漏风险，而非可接受的缺口——其故障模式是跨租户信息泄露，而且在测试全绿（ships green）的情况下直接发布。

> **出处（Provenance）。** 本阶段源于一次真实的 PHP → C# 迁移，在该迁移中，一个按租户限定作用域的账户列表端点在重写期间丢失了其隔离谓词。移植实现用粗粒度的“该账户是否为任何已启用的管理员？”检查取代了按角色的作用域限定，并不管是哪个租户发起的请求，直接返回数据库中的所有账户。它发布了，它通过了所有现有的测试——该方法本来没有任何测试——直到有客户报告看到了不该出现的账户信息时才被发现。

---

## 核心原则

### 1. 确定性框架

所有提取的信息必须标注确定性层级：

| 标签 | 定义 | 范例 |
|------|------|------|
| `[已确认]` | 直接从代码或测试验证 | "POST /api/users 端点位于 src/routes/users.ts:15" |
| `[推论]` | 从观察到的模式进行逻辑推导 | "根据构造函数模式，可能使用依赖注入" |
| `[假设]` | 需要验证的合理假设 | "根据典型模式，session 可能在 24 小时后过期" |
| `[未知]` | 无法从代码判断，需要人类输入 | "此功能的业务动机" |

**规则**：有疑问时，使用更不确定的标签，而非过度声称。

### 2. 反幻觉合规

本标准严格遵循[反幻觉标准](anti-hallucination.md)：

- **基于证据**：仅分析已明确读取的内容
- **来源归属**：每项声明必须包含 `[来源: 代码]` 或 `[来源: 测试]` 并附带 file:line 引用
- **禁止捏造**：未经验证不得编造 API、配置或需求
- **明确未知**：始终列出无法从代码判断的内容

### 3. 渐进式披露

分层提取信息：

1. **系统概览**：入口点、主要组件、高层架构
2. **组件详情**：各个模块、其职责、接口
3. **实现细节**：算法、数据流、边界情况

### 4. 测试对需求映射

现有测试是隐含需求的宝贵来源：

```javascript
// Test: src/tests/auth.test.ts
describe('Authentication', () => {
  it('should return 401 for invalid credentials', () => {...});
  it('should issue JWT token on successful login', () => {...});
});
```

映射为：

```markdown
## Acceptance Criteria
[Confirmed] From test analysis (src/tests/auth.test.ts):
- [ ] Return 401 status code for invalid credentials (line 3)
- [ ] Issue JWT token on successful login (line 4)
```

---

## 可提取与不可提取的内容

### 可提取（AI 自动化）

| 方面 | 确定性 | 来源 |
|------|--------|------|
| API 端点 | [已确认] | 路由定义、控制器 |
| 数据模型 | [已确认] | 类型、接口、Schema |
| 函数签名 | [已确认] | 参数、返回类型 |
| 测试用例 | [已确认] | 测试文件 → 验收条件 |
| 依赖项 | [已确认] | 包引用、导入 |
| 配置模式 | [已确认] | 配置文件 |
| 行为模式 | [推论] | 代码分析 |

### 不可提取（需要人类输入）

| 方面 | 原因 | 必要行动 |
|------|------|---------|
| **动机/为什么** | 历史背景不在代码中 | 询问利益相关者 |
| **业务背景** | 领域知识 | 询问产品负责人 |
| **风险评估** | 需要领域专业知识 | 咨询领域专家 |
| **取舍决策** | 缺失历史背景 | 查阅设计文档（如有） |
| **非功能性需求** | 通常是隐含的 | 与架构师讨论 |
| **范围外决策** | 明确排除的项目 | 审查原始需求 |

---

## 与开发方法论整合

### 反向工程流水线

```
┌───────────────────────────────────────────────────────────────────────┐
│                   Reverse Engineering → Forward Development            │
├───────────────────────────────────────────────────────────────────────┤
│                                                                       │
│   Existing                                                            │
│   Code + Tests                                                        │
│       │                                                               │
│       ▼                                                               │
│   ┌─────────────────────────────────────────────────────────────┐    │
│   │ Reverse Engineering (This Standard)                          │    │
│   │   • Code Scanning → Technical Inventory                      │    │
│   │   • Test Analysis → Acceptance Criteria                      │    │
│   │   • Gap Identification → [Unknown] List                      │    │
│   └─────────────────────────────────────────────────────────────┘    │
│       │                                                               │
│       ▼                                                               │
│   ┌─────────────────────────────────────────────────────────────┐    │
│   │ SDD (Spec-Driven Development)                                │    │
│   │   • Reverse-engineered spec = Proposal Draft                 │    │
│   │   • Fill [Unknown] sections → Complete Proposal              │    │
│   │   • Formal Review → Approved Specification                   │    │
│   └─────────────────────────────────────────────────────────────┘    │
│       │                                                               │
│       ▼                                                               │
│   ┌─────────────────────────────────────────────────────────────┐    │
│   │ BDD (Behavior-Driven Development)                            │    │
│   │   • Acceptance Criteria → Gherkin Scenarios                  │    │
│   │   • Stakeholder Validation                                   │    │
│   └─────────────────────────────────────────────────────────────┘    │
│       │                                                               │
│       ▼                                                               │
│   ┌─────────────────────────────────────────────────────────────┐    │
│   │ TDD (Test-Driven Development)                                │    │
│   │   • Gherkin → Unit Test Requirements                         │    │
│   │   • Gap Analysis → Missing Test Coverage                     │    │
│   └─────────────────────────────────────────────────────────────┘    │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

### SDD 整合

反向工程规格直接进入 SDD 工作流程：

1. **产出 = SDD 提案草稿**：生成的规格成为提案
2. **需要人类审查**：所有 `[未知]` 区块必须由人类填写
3. **正式核准**：规格必须经过标准 SDD 审查流程
4. **状态追踪**：在规格元数据中标记为 "Reverse-Engineered"

### BDD 整合

将验收条件转换为 Gherkin 格式：

```markdown
## Acceptance Criteria (from reverse engineering)
[Confirmed] User can add item to empty cart
[Confirmed] Quantity increments for duplicate items
[Inferred] Maximum quantity limit: 99 items
```

转换为：

```gherkin
Feature: Shopping Cart
  # Source: Reverse-engineered from src/cart/

  Scenario: Add item to empty cart
    Given an empty shopping cart
    When the user adds "Widget" to the cart
    Then the cart should contain 1 "Widget"

  Scenario: Add duplicate item
    Given a cart with 1 "Widget"
    When the user adds another "Widget"
    Then the cart should contain 2 "Widget"

  @needs-confirmation
  Scenario: Maximum quantity limit
    Given a cart with 99 "Widget"
    When the user tries to add another "Widget"
    Then the add should be rejected
    # [Inferred] - Verify with stakeholders
```

### TDD 整合

使用反向工程规格识别测试覆盖缺口：

1. **映射现有测试**：将测试关联到验收条件
2. **识别缺口**：找出没有对应测试的验收条件
3. **确定优先级**：重点关注高风险且未测试的行为
4. **编写测试**：使用 TDD 工作流程补全测试覆盖

---

## 反向工程规格模板

```markdown
# [SPEC-XXX] [Feature Name] - Reverse Engineered

## Metadata
- **Status**: Draft (Reverse-Engineered)
- **Source**: [directory or file path]
- **Generated**: [date]
- **Reviewed By**: [pending]

## Summary
[Brief description - [Inferred] or [Confirmed]]

## Motivation
[Unknown] - Requires human input
- Why was this feature originally built?
- What problem does it solve?

## Technical Design

### API Endpoints
[Confirmed] From code analysis:
- `POST /api/resource` - [Source: Code] src/routes/resource.ts:15
- `GET /api/resource/:id` - [Source: Code] src/routes/resource.ts:25

### Data Models
[Confirmed] From type definitions:
- `Resource` interface - [Source: Code] src/types/resource.ts:5-20

### Dependencies
[Confirmed] From import analysis:
- Database: PostgreSQL (knex client)
- Cache: Redis

## Acceptance Criteria
[Confirmed] From test analysis (src/tests/resource.test.ts):
- [ ] Create resource with valid data (line 10)
- [ ] Return 400 for invalid input (line 25)
- [ ] Return 404 for non-existent resource (line 40)

[Unknown] Not covered by tests:
- [ ] [Need Confirmation] Rate limiting behavior
- [ ] [Need Confirmation] Cache invalidation strategy

## Risks
[Unknown] - Requires domain expertise

## Out of Scope
[Unknown] - Requires historical context

## Source Citations
| Item | File | Line | Certainty |
|------|------|------|-----------|
| POST /api/resource | src/routes/resource.ts | 15 | [Confirmed] |
| Resource interface | src/types/resource.ts | 5-20 | [Confirmed] |
| 400 on invalid | src/tests/resource.test.ts | 25 | [Confirmed] |
```

---

## 失败处理与升级

反向工程从现有代码中推断意图；某些输入无法被安全地分析。本节定义了“失败 → 升级 → 重新验证”路径，以确保低置信度或无法解析的输入绝不会产生看似权威的规格。

| 条件 | 触发点 | 操作 | 重新验证 |
|-----------|---------|--------|-----------|
| **解析失败** | 源代码无法解析（不支持的语言、损坏的语法树） | 将该单元标记为 `[Unknown]` 并报告语言/文件；升级至人类领域专家。不为其生成任何推断行为。 | 工具修复/补丁后源代码可正常解析 |
| **未知比例过高** | `[Unknown]` 项超出置信度阈值（默认 > 50% 的行为） | 暂停规格定稿；要求先对业务领域专家进行访谈以填补 `[Unknown]` 项。绝不交付大部分靠猜测的规格。 | 未知比例低于阈值 |
| **推断冲突** | 代码与先前推断的行为相冲突 | 将该项降级为 `[Assumption]` 并升级给代码所有者；切勿将存在冲突的推断记录为 `[Confirmed]`。 | 所有者确认或修正 |
| **测试分析失败** | 现有测试无法运行/解析以提取行为 | 回退为仅进行静态分析；将受影响的行为标记为 `[Inferred]`（较低确定性），绝不标记为 `[Confirmed]`。 | — |

**规则 RE-FAIL-001（强制）**：解析失败或超出阈值的 `[Unknown]` 比例必须阻断规格定稿并升级至人类处理——绝不能将低于置信度阈值的规格作为权威规格呈现。

---

## 应避免的反模式

### 代码分析反模式

| 反模式 | 影响 | 正确方法 |
|--------------|--------|------------------|
| **捏造动机** | 误导性规格 | 标记为 `[Unknown]` |
| **臆测需求** | 虚假信心 | 标记为 `[Need Confirmation]` |
| **臆想未读代码** | 幻觉 | 仅分析已读取的内容 |
| **将推断作为事实呈现** | 破坏信任 | 始终使用适当的标签 |
| **跳过人类审查** | 规格不完整 | 始终要求审查阶段 |

### 流程反模式

| 反模式 | 影响 | 正确方法 |
|--------------|--------|------------------|
| **为未读代码生成规格** | 无效输出 | 先读取所有相关文件 |
| **未经人类参与填补 [Unknown]** | 无效规格 | 始终获取人类输入 |
| **跳过测试分析** | 遗漏标准 | 始终分析现有测试 |
| **单次通过生成** | 规格肤浅 | 使用渐进式揭露 |

---

## 最佳实践

### 应做事项

- ✅ 在提出任何论断之前阅读所有相关文件
- ✅ 为每项陈述标注确定性层级
- ✅ 包含附带 file:line 引用的来源出处
- ✅ 清楚列出需要人类输入的内容
- ✅ 保留原始代码注释作为上下文
- ✅ 将测试映射至验收条件
- ✅ 使用渐进式揭露（概览 → 详情）
- ✅ 与利益相关者验证推断

### 避免事项

- ❌ 臆测动机或业务上下文
- ❌ 将推断作为已确认的事实呈现
- ❌ 跳过来源归属
- ❌ 为未读取的代码生成规格
- ❌ 未经人类输入即填补 `[Unknown]` 部分
- ❌ 忽视现有测试
- ❌ 跳过人类审查阶段
- ❌ 过度设计规格

---

## 工具集成

### 命令行工具

| 工具 | 命令 | 用途 |
|------|---------|---------|
| **Claude Code** | `/reverse-spec` | 从代码生成 SDD 规格 |
| **Claude Code** | `/reverse-bdd` | 将 AC 转换为 Gherkin 场景 |
| **Claude Code** | `/reverse-tdd` | 针对 BDD 分析测试覆盖率 |

### 技能参考

- [反向工程技能](../skills/reverse-engineer/SKILL.md) - 详细工作流程实现
- [规格驱动开发技能](../skills/spec-driven-dev/SKILL.md) - SDD 集成
- [BDD 助手技能](../skills/bdd-assistant/SKILL.md) - Gherkin 编写
- [TDD 助手技能](../skills/tdd-assistant/SKILL.md) - 测试覆盖率分析

---

## 相关标准

- [反幻觉指南](anti-hallucination.md) - 基于证据的分析要求
- [规格驱动开发](spec-driven-development.md) - 规格工作流程
- [行为驱动开发](behavior-driven-development.md) - Given-When-Then 场景
- [测试驱动开发](test-driven-development.md) - 红-绿-重构循环
- [验收测试驱动开发](acceptance-test-driven-development.md) - 验收条件
- [代码审查清单](code-review-checklist.md) - 审查指南
- [测试完备性维度](test-completeness-dimensions.md) - 维度 4（授权）指定了跨租户测试；权限范围提取是确定需要哪些测试的发现步骤

---

## 版本历史

| 版本 | 日期 | 变更内容 |
|---------|------|---------|
| 1.3.0 | 2026-08-20 | 新增：权限范围提取阶段（自引用查询谓词）——派生信号包括非 SQL 范围强制执行、附带 `file:line` 的逐匹配记录、覆盖每个角色分支和每个调用点解析器使用的谓词等价 oracle、规则 RE-AUTH-001（强制性反向测试断言不存在另一操作员的记录）和 RE-AUTH-002（未验证的谓词阻断切换）（issue [#166](https://github.com/AsiaOstrich/universal-dev-standards/issues/166)） |
| 1.2.0 | 2026-06-27 | 新增：隐含规则扫描阶段（非 HTTP 持久化写入路径提取）——4 类 derive 分类 + 三问 oracle + 非 HTTP 魔鬼代言人 + PHP 类型杂耍（type-juggling）说明 + 确定性/`file:line`（XSPEC-284 R4/AC-8） |
| 1.1.0 | 2026-06-18 | 新增：失败处理与升级章节——解析失败 / 未知比例过高 / 推断冲突升级 + 规则 RE-FAIL-001（XSPEC-292 T7） |
| 1.0.0 | 2026-01-19 | 初始发布 |

---

## 参考资料

- [反幻觉标准](anti-hallucination.md) - 核心合规要求
- [IEEE 830-1998 - 软件需求规格](https://standards.ieee.org/ieee/830/1222/)
- [SWEBOK v4.0 - 第 9 章：软件维护](https://www.computer.org/education/bodies-of-knowledge/software-engineering)
- [与旧有代码有效协作 - Michael Feathers](https://www.oreilly.com/library/view/working-effectively-with/0131177052/)

---

## 许可证

本标准依据 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可发布。
