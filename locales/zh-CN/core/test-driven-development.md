---
source: ../../../core/test-driven-development.md
source_version: 1.2.0
translation_version: 1.2.0
last_synced: 2026-01-25
status: current
---

# 测试驱动开发 (TDD) 标准

**版本**: 1.2.0
**最后更新**: 2026-01-25
**适用范围**: 所有采用测试驱动开发的项目
**范围**: universal

> **语言**: [English](../../../core/test-driven-development.md) | [繁體中文](../../zh-TW/core/test-driven-development.md)

---

## 目的

本标准定义了测试驱动开发 (TDD) 的原则、工作流程和最佳实践，确保测试能够驱动软体功能的设计与实作。

**主要优点**：
- 设计从测试中浮现，产生更具可测试性和模组化的程序码
- 对程序码正确性获得即时回馈
- 测试作为活文件
- 减少除错时间和缺陷率
- 对重构更有信心

---

## 方法论分类

> **分类**: 传统开发方法论 (1999-2011)

TDD 是**传统测试驱动开发家族**的一部分，源自极限编程 (XP) 和敏捷实践。它不同于 **AI 时代 SDD (规格驱动开发)** 方法论。

### 历史背景

| 方法论 | 时代 | 起源 | 关注点 |
|-------------|-----|--------|-------|
| **TDD** | 1999 | Kent Beck, XP | 测试驱动代码设计 |
| **BDD** | 2006 | Dan North | 行为驱动测试 |
| **ATDD** | 2003-2006 | GOOS, Gojko Adzic | 验收驱动开发 |
| **SDD** | 2025+ | Thoughtworks, Martin Fowler | 规格驱动生成 (AI 时代) |

### 与 SDD 的关系

TDD 可以**在 SDD 实施阶段内**使用，但不是 SDD 方法论本身的一部分：

```
┌──────────────────────────────────────────────────────────────┐
│                    方法论关系                                   │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│   SDD 工作流程:                                              │
│   讨论 → 提案 → 审查 → [实施] → 验证    │
│                             ↑                                │
│                     TDD 可在此处使用                     │
│                     (可选，非必需)                 │
│                                                              │
│   传统双循环 TDD (GOOS):                        │
│   BDD (外层) → TDD (内层)                                  │
│                                                              │
│   SDD 通过正向推导生成测试工件,                        │
│   TDD 然后可用作起点。                  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 何时使用 TDD

| 上下文 | 建议 |
|---------|----------------|
| **SDD 项目** | 在实施阶段使用 TDD (可选) |
| **遗留项目** | 对新功能和错误修复使用 TDD |
| **非 AI 开发** | 将 TDD 作为主要方法论 |
| **性能关键代码** | 使用 TDD 确保算法正确性 |

**参考**: [规格驱动开发标准](spec-driven-development.md)

---

## 目录

1. [TDD 核心循环](#tdd-核心循环)
2. [TDD 原则](#tdd-原则)
3. [适用场景指南](#适用场景指南)
4. [TDD vs BDD vs ATDD](#tdd-vs-bdd-vs-atdd)
5. [与 SDD 集成](#与-sdd-集成)
6. [TDD 工作流程](#tdd-工作流程)
7. [测试设计指南](#测试设计指南)
8. [重构策略](#重构策略)
9. [TDD 中的测试替身](#tdd-中的测试替身)
10. [反模式与修复](#反模式与修复)
11. [语言/框架实践](#语言框架实践)
12. [度量与评估](#度量与评估)
13. [相关标准](#相关标准)
14. [参考资料](#参考资料)
15. [版本历史](#版本历史)
16. [授权](#授权)

---

## TDD 核心循环

### 红-绿-重构循环

TDD 遵循一个简单但强大的迭代循环：

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        TDD 核心循环                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│      ┌─────────┐         ┌─────────┐         ┌─────────┐                   │
│      │  🔴 红   │────────▶│ 🟢 绿   │────────▶│🔵 重构  │                   │
│      └─────────┘         └─────────┘         └─────────┘                   │
│           ▲                                        │                        │
│           │                                        │                        │
│           └────────────────────────────────────────┘                        │
│                                                                             │
│   🔴 红色阶段 (1-5 分钟)                                                     │
│   ├─ 撰写一个描述预期行为的失败测试                                           │
│   ├─ 测试应该因为「正确的原因」而失败                                         │
│   └─ 验证测试确实失败                                                        │
│                                                                             │
│   🟢 绿色阶段 (1-10 分钟)                                                    │
│   ├─ 撰写「最少」的程序码让测试通过                                           │
│   ├─ 「先假装，再实现」是可以接受的                                           │
│   └─ 不要过度设计；只要让它能运作                                             │
│                                                                             │
│   🔵 重构阶段 (5-15 分钟)                                                    │
│   ├─ 在保持测试绿色的同时改善程序码品质                                        │
│   ├─ 消除重复 (DRY)                                                         │
│   ├─ 改善命名、结构、可读性                                                   │
│   └─ 每次重构步骤后执行测试                                                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 循环时间建议

| 阶段 | 建议时间 | 警示讯号 |
|------|---------|---------|
| 🔴 红 | 1-5 分钟 | 若超过 10 分钟，测试范围太大 |
| 🟢 绿 | 1-10 分钟 | 若超过 15 分钟，需要分解问题 |
| 🔵 重构 | 5-15 分钟 | 若跳过，技术债会累积 |

### 口诀

> **红 → 绿 → 重构 → 重复**

每次迭代都应该很小。如果你发现自己在任何阶段花费太长时间，测试可能太有野心了。

---

## TDD 原则

### FIRST 原则

高品质的测试遵循 FIRST 原则：

| 原则 | 说明 | 实践指南 |
|------|------|---------|
| **F**ast (快速) | 测试应该快速执行 | 单元测试每个 < 100ms；总测试套件 < 10s |
| **I**ndependent (独立) | 测试之间不互相依赖 | 无共享状态；每个测试设置自己的资料 |
| **R**epeatable (可重复) | 每次执行结果相同 | 无随机性；无时间依赖；无外部 I/O |
| **S**elf-validating (自我验证) | 有明确的通过/失败结果 | 不需手动检查；明确的断言 |
| **T**imely (及时) | 在生产程序码之前撰写 | 这是 TDD 的本质 |

### Uncle Bob 的 TDD 三规则

Robert C. Martin (Uncle Bob) 用三条严格的规则定义 TDD：

1. **规则一（红色规则）**：除非是为了让失败的单元测试通过，否则不允许撰写任何生产程序码。

2. **规则二（测试规则）**：不允许撰写超过足以失败的单元测试；编译失败也算失败。

3. **规则三（绿色规则）**：不允许撰写超过足以让当前失败测试通过的生产程序码。

### 测试的单一职责

每个测试应该验证「一个」行为：

```
✅ 好：test_calculate_total_with_discount_applies_percentage()
❌ 差：test_calculate_total_and_tax_and_discount_and_shipping()
```

### 测试即文件

良好撰写的测试可作为可执行的文件：

```
✅ 好的测试名称：
- should_return_empty_list_when_no_users_found
- should_throw_validation_error_when_email_is_invalid
- should_calculate_discount_when_order_exceeds_threshold

❌ 差的测试名称：
- test1
- testCalculate
- itWorks
```

---

## 适用场景指南

### TDD 场景适用性

| 场景 | 评分 | 说明 |
|------|------|------|
| **新功能开发** | ⭐⭐⭐⭐⭐ | TDD 最佳使用场景；设计从测试中浮现 |
| **Bug 修复** | ⭐⭐⭐⭐⭐ | 先撰写失败测试重现 bug |
| **API 设计** | ⭐⭐⭐⭐⭐ | 测试即 API 使用文件 |
| **核心业务逻辑** | ⭐⭐⭐⭐⭐ | 高价值程序码必须有测试保护 |
| **演算法实现** | ⭐⭐⭐⭐ | 边界情况多；TDD 帮助思考 |
| **重构现有程序码** | ⭐⭐⭐⭐ | 先补测试，再安全重构 |
| **UI 组件** | ⭐⭐⭐ | 部分适用；可结合 BDD |
| **探索性原型** | ⭐⭐ | TDD 可能拖慢不确定的探索 |
| **一次性脚本** | ⭐ | 成本效益比低 |
| **第三方集成** | ⭐⭐ | 难以 Mock；改用集成测试 |

### 依专案类型的 TDD

| 专案类型 | TDD | BDD | ATDD | 建议 |
|---------|-----|-----|------|------|
| **新创 MVP** | ⚠️ 选择性 | ✅ 推荐 | ❌ | 快速迭代优先 |
| **企业应用** | ✅ 推荐 | ✅ 推荐 | ✅ 推荐 | 品质与可维护性关键 |
| **开源专案** | ✅ 推荐 | ⚠️ 选择性 | ❌ | 贡献者需要测试文件 |
| **遗留系统改造** | ✅ 必要 | ⚠️ 选择性 | ❌ | 使用 Golden Master 策略（见下方） |
| **微服务** | ✅ 推荐 | ✅ 推荐 | ✅ 推荐 | 契约测试重要 |
| **资料管线** | ⚠️ 选择性 | ❌ | ❌ | 以集成测试为主 |
| **机器学习** | 🔶 视情况 | ❌ | ❌ | 见下方 ML 测试边界 |

### 机器学习 (ML) 测试边界

**重要**：ML 专案需要区分「模型效果」和「资料工程」：

| 面向 | TDD 适用性 | 说明 |
|------|-----------|------|
| **模型准确率** | ❌ 不适用 | 结果不确定性高；难以预先定义期望值 |
| **特征处理** | ✅ 必须 | 避免 Garbage In, Garbage Out |
| **资料清洗** | ✅ 必须 | 资料品质直接影响模型效果 |
| **资料转换** | ✅ 必须 | 确保转换逻辑正确 |
| **管线集成** | ⚠️ 选择性 | 以集成测试为主 |

### 遗留系统策略：Golden Master Testing（黄金大师测试）

**问题**：在没有测试的遗留系统中，「补测试」本身就有破坏现有逻辑的风险。

**Golden Master Testing 工作流程**：

```
┌─────────────────────────────────────────────────────────────────┐
│           Golden Master Testing 工作流程                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1️⃣  录制阶段（不修改程序码）                                    │
│      ├─ 对系统执行大量输入                                       │
│      ├─ 记录所有输出作为「黄金基准」                              │
│      └─ 使用自动化工具或 AI 生成测试案例                          │
│                                                                 │
│  2️⃣  验证阶段                                                    │
│      ├─ 建立 Snapshot/Approval 测试                              │
│      └─ 确保重构前后输出一致                                     │
│                                                                 │
│  3️⃣  重构阶段                                                    │
│      ├─ 在 Golden Master 保护下安全重构                          │
│      ├─ 每次修改后执行 Golden Master 测试                        │
│      └─ 逐步将 Golden Master 转换为正式的单元测试                 │
│                                                                 │
│  4️⃣  演进阶段                                                    │
│      └─ 新功能使用标准 TDD                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**工具支援**：
- ApprovalTests（多语言支援）
- Jest Snapshot Testing
- Python: pytest-snapshot
- AI 辅助测试输入生成

### 决策树

```
需求来源？
├─ 技术需求（效能、重构）→ TDD
├─ 业务需求
│   ├─ 有明确验收标准？
│   │   ├─ 是 → ATDD → BDD → TDD
│   │   └─ 否 → BDD → TDD
│   └─ 复杂业务流程？
│       ├─ 是 → BDD（场景描述）→ TDD
│       └─ 否 → TDD
└─ 探索性/原型 → 暂时跳过 TDD
```

---

## TDD vs BDD vs ATDD

### 比较概览

| 面向 | TDD | BDD | ATDD |
|------|-----|-----|------|
| **焦点** | 程序码单元 | 行为 | 验收标准 |
| **语言** | 程序码 | 自然语言 (Gherkin) | 业务语言 |
| **参与者** | 开发者 | 开发者 + BA + QA | 全团队 + 利益相关者 |
| **测试层级** | 单元/集成 | 功能/场景 | 系统/验收 |
| **工具** | xUnit 框架 | Cucumber, Behave, SpecFlow | FitNesse, Concordion |
| **时机** | 编码期间 | 编码之前 | 开发开始之前 |

### 集成金字塔

```
┌─────────────────────────────────────────────────────────────────┐
│              完整的测试驱动开发堆叠                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   需求层       ATDD - 验收测试驱动开发                           │
│               （接收业务验收标准）                                │
│                        ↓                                        │
│   规格层       SDD - 规格驱动开发                                │
│               （正式规格、验收条件）                              │
│                        ↓                                        │
│   功能层       BDD - 行为驱动开发                                │
│               （场景 → Step Definitions）                        │
│                        ↓                                        │
│   开发层       TDD - 测试驱动开发                                │
│               （单元测试 → 程序码）                               │
│                        ↓                                        │
│   集成层       集成与系统测试                                     │
│                                                                 │
│   关键：ATDD → SDD → BDD → TDD → 集成测试（自上而下）            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### BDD Gherkin 语法概览

```gherkin
Feature: 使用者登入
  作为一个注册使用者
  我想要登入我的帐号
  以便我可以存取我的个人化内容

  Scenario: 使用有效凭证成功登入
    Given 我在登入页面
    And 我有一个注册帐号，电子邮件为 "user@example.com"
    When 我输入电子邮件 "user@example.com"
    And 我输入密码 "correctpassword"
    And 我点击登入按钮
    Then 我应该被重新导向到仪表板
    And 我应该看到包含我名字的欢迎讯息

  Scenario: 使用无效密码登入失败
    Given 我在登入页面
    When 我输入电子邮件 "user@example.com"
    And 我输入密码 "wrongpassword"
    And 我点击登入按钮
    Then 我应该看到错误讯息 "无效的凭证"
    And 我应该保持在登入页面
```

### ATDD 验收标准格式

```markdown
## 功能：购物车结帐

### 验收标准：

**AC-1：计算订单总额**
- GIVEN 购物车中有价格为 [$10, $20, $15] 的商品
- WHEN 使用者进行结帐
- THEN 总额应为 $45

**AC-2：套用折扣码**
- GIVEN 购物车总额为 $100
- AND 有效的折扣码 "SAVE20" 为 20% 折扣
- WHEN 使用者套用折扣码
- THEN 总额应为 $80

**AC-3：验证最低订单金额**
- GIVEN 购物车总额低于 $25
- WHEN 使用者尝试结帐
- THEN 系统应显示「最低订单金额为 $25」错误
```

### 选择正确的方法

| 使用案例 | 主要方法 | 辅助方法 |
|---------|---------|---------|
| 演算法实现 | TDD | - |
| 使用者验证流程 | BDD | TDD |
| 支付处理 | ATDD | BDD + TDD |
| API 端点 | TDD | BDD 用于集成 |
| UI 组件 | BDD | TDD 用于逻辑 |
| 业务规则验证 | ATDD | TDD |
| 效能优化 | TDD | - |
| 外部服务集成 | TDD | BDD 用于契约 |

---

## 与 SDD 集成

### SDD + TDD 统一工作流程

规格驱动开发 (SDD) 和测试驱动开发 (TDD) 是互补的：

- **SDD**：「规格优先，程序码其次」- 定义要建构「什么」
- **TDD**：「测试优先，程序码其次」- 定义如何「验证」

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SDD + TDD 集成工作流程                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1️⃣  SDD：提案阶段                                                          │
│      ├─ 撰写 Spec：定义功能、验收标准、边界情况                               │
│      ├─ 包含验收标准（转换为 ATDD 场景）                                      │
│      └─ 取得利益相关者批准                                                    │
│         (Spec ID: SPEC-001)                                                 │
│                                                                             │
│  2️⃣  TDD：红色阶段                                                          │
│      ├─ 基于 Spec 的验收标准撰写测试                                         │
│      ├─ 撰写描述预期行为的失败测试                                           │
│      ├─ 测试实现 Spec：一个标准 = 多个测试                                   │
│      └─ 在测试文件注解中参考 SPEC-001                                        │
│                                                                             │
│  3️⃣  TDD：绿色 + 重构阶段                                                   │
│      ├─ 迭代开发，一次实现一个小功能                                         │
│      ├─ 测试通过后重构                                                       │
│      └─ 保持所有 Spec 验收标准测试通过                                       │
│                                                                             │
│  4️⃣  SDD：验证阶段                                                          │
│      ├─ 确认实现与 Spec 相符                                                 │
│      ├─ 验收测试套件通过                                                     │
│      └─ 所有验收标准已实现 ✓                                                 │
│                                                                             │
│  5️⃣  提交 PR 和撰写提交讯息                                                  │
│      ├─ Commit: "feat(auth): implement login"                               │
│      ├─ Body: "Implements SPEC-001 with OAuth2"                             │
│      ├─ Refs: SPEC-001                                                      │
│      └─ 包含测试覆盖率报告                                                   │
│                                                                             │
│  6️⃣  SDD：归档阶段                                                          │
│      └─ 归档 Spec，连结到 PR/提交                                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 将 Spec 验收标准对应到 TDD 测试

| Spec 验收标准 | TDD 测试 |
|--------------|----------|
| 「使用者可以用有效凭证登入」 | `test_login_with_valid_credentials_succeeds()` |
| 「无效密码显示错误」 | `test_login_with_invalid_password_shows_error()` |
| 「3 次失败尝试后帐号锁定」 | `test_account_locks_after_three_failed_attempts()` |
| 「锁定的帐号无法登入」 | `test_locked_account_cannot_login()` |

### 在测试中参考 Spec

```typescript
/**
 * SPEC-001：使用者验证 的测试
 * @see specs/SPEC-001-user-authentication.md
 */
describe('使用者验证 (SPEC-001)', () => {
  // AC-1：使用者可以用有效凭证登入
  test('should login successfully with valid credentials', async () => {
    // ...
  });

  // AC-2：无效密码显示错误
  test('should show error message for invalid password', async () => {
    // ...
  });
});
```

---

## TDD 工作流程

### 个人层级 TDD

```
┌─────────────────────────────────────────────────────────────────┐
│              个人 TDD 工作阶段流程                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. 理解需求                                                     │
│     ├─ 阅读 spec/使用者故事                                      │
│     └─ 识别验收标准                                              │
│                                                                 │
│  2. 列出测试案例（纸上或 TODO 注解）                               │
│     ├─ 快乐路径场景                                              │
│     ├─ 边界情况                                                  │
│     ├─ 错误场景                                                  │
│     └─ 边界条件                                                  │
│                                                                 │
│  3. 选择最简单的测试案例                                          │
│     └─ 从最基本的快乐路径开始                                     │
│                                                                 │
│  4. 红色：撰写测试                                                │
│     ├─ 使用清晰的 Arrange-Act-Assert 撰写测试                    │
│     ├─ 使用描述性的测试名称                                       │
│     └─ 执行测试，验证它失败                                       │
│                                                                 │
│  5. 绿色：让它通过                                                │
│     ├─ 撰写最少的程序码让测试通过                                 │
│     ├─ 「假装」是可以接受的                                       │
│     └─ 执行测试，验证它通过                                       │
│                                                                 │
│  6. 重构：清理                                                    │
│     ├─ 消除重复                                                  │
│     ├─ 改善命名                                                  │
│     ├─ 提取方法/函式                                             │
│     └─ 每次变更后执行所有测试                                     │
│                                                                 │
│  7. 从步骤 3 重复，直到所有测试完成                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 团队层级 TDD

#### 使用 TDD 的结对程序设计

**乒乓模式**：
1. 开发者 A 撰写一个失败的测试
2. 开发者 B 撰写程序码让测试通过
3. 开发者 B 撰写下一个失败的测试
4. 开发者 A 撰写程序码让测试通过
5. 任一开发者可以随时重构
6. 重复

**驾驶员-领航员模式**：
1. 领航员思考设计和测试案例
2. 驾驶员撰写测试和程序码
3. 每 15-30 分钟交换角色

#### 使用 TDD 的群体程序设计

- 一个驾驶员（打字），多个领航员（指导）
- 每 5-10 分钟轮换驾驶员
- 集体决定测试案例和实现
- 透过多元视角获得更高品质

### CI/CD 集成

```yaml
# TDD 的 GitHub Actions 工作流程范例
name: TDD CI Pipeline

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:unit

      - name: Run integration tests
        run: npm run test:integration

      - name: Check coverage threshold
        run: npm run test:coverage -- --coverage-threshold=80

      - name: Upload coverage report
        uses: codecov/codecov-action@v4
```

---

## 测试设计指南

### AAA 模式（Arrange-Act-Assert）

```typescript
test('should calculate total with discount', () => {
  // Arrange - 设置测试资料和依赖
  const cart = new ShoppingCart();
  cart.addItem({ name: 'Widget', price: 100 });
  cart.setDiscountCode('SAVE20'); // 20% 折扣

  // Act - 执行被测试的行为
  const total = cart.calculateTotal();

  // Assert - 验证结果
  expect(total).toBe(80);
});
```

### Given-When-Then 模式（BDD 风格）

```typescript
test('given a cart with items, when discount applied, then total is reduced', () => {
  // Given
  const cart = new ShoppingCart();
  cart.addItem({ name: 'Widget', price: 100 });

  // When
  cart.applyDiscount('SAVE20');
  const total = cart.calculateTotal();

  // Then
  expect(total).toBe(80);
});
```

### 测试命名惯例

| 模式 | 范例 |
|------|------|
| `should_[行为]_when_[条件]` | `should_return_error_when_email_invalid` |
| `[方法]_[场景]_[预期]` | `calculateTotal_withDiscount_returnsReducedPrice` |
| `test_[方法]_[场景]_[预期]` | `test_login_invalidPassword_throwsError` |
| `it_[做某事]` | `it_calculates_total_correctly` |

### 测试资料最佳实践

```typescript
// ✅ 好：清晰、有意义的测试资料
const validUser = {
  email: 'john.doe@example.com',
  password: 'SecureP@ss123',
  role: 'admin'
};

// ❌ 差：没有上下文的魔术字串
const user = {
  email: 'a@b.c',
  password: '123',
  role: 'x'
};

// ✅ 好：使用测试资料建构器
const user = UserBuilder.create()
  .withEmail('john.doe@example.com')
  .withRole('admin')
  .build();

// ✅ 好：使用常数表示边界值
const MAX_PASSWORD_LENGTH = 128;
const MIN_PASSWORD_LENGTH = 8;

test('should reject password exceeding max length', () => {
  const longPassword = 'a'.repeat(MAX_PASSWORD_LENGTH + 1);
  expect(() => validatePassword(longPassword)).toThrow();
});
```

### 测试边界情况

确保测试涵盖 [测试完整性维度](test-completeness-dimensions.md) 定义的所有八个维度。这些维度包括：快乐路径、边界条件、错误处理、授权、状态变化、验证、集成，以及 AI 生成质量（适用时）。

请使用该文件中的检查清单来验证每个功能的覆盖率。

---

## 重构策略

### 何时重构

当你看到代码异味时进行重构。使用下方的完整目录来识别问题及其解决方案。

### 代码异味目录

根据 Martin Fowler 的《Refactoring》（第二版），代码异味分为五大类别：

#### 1. 膨胀型（Bloaters）

代码变得过大且难以处理。

| 异味 | 说明 | 重构方式 |
|------|------|---------|
| **Long Method（过长方法）** | 方法超过 20 行，做太多事 | Extract Method、Replace Temp with Query、Introduce Parameter Object |
| **Large Class（过大类）** | 类有太多职责 | Extract Class、Extract Subclass、Extract Interface |
| **Primitive Obsession（基本类型偏执）** | 过度使用基本类型而非小对象 | Replace Primitive with Object、Replace Type Code with Class、Introduce Parameter Object |
| **Long Parameter List（过长参数列表）** | 方法有太多参数（>3 个） | Introduce Parameter Object、Preserve Whole Object、Replace Parameter with Method Call |
| **Data Clumps（数据泥团）** | 相同的数据群组一起出现 | Extract Class、Introduce Parameter Object、Preserve Whole Object |

#### 2. 面向对象滥用者（OO Abusers）

不完整或不正确的面向对象应用。

| 异味 | 说明 | 重构方式 |
|------|------|---------|
| **Switch Statements（Switch 语句）** | 复杂的 switch/if-else 链基于类型 | Replace Conditional with Polymorphism、Replace Type Code with Strategy、Replace Type Code with State |
| **Temporary Field（临时字段）** | 只在某些情况下有值的字段 | Extract Class、Introduce Null Object、Introduce Special Case |
| **Refused Bequest（被拒绝的遗产）** | 子类不使用继承的方法 | Push Down Method、Push Down Field、Replace Inheritance with Delegation |
| **Alternative Classes with Different Interfaces（接口不同的替代类）** | 做相同事情但有不同方法签名的类 | Rename Method、Move Method、Extract Superclass |
| **Parallel Inheritance Hierarchies（平行继承层次）** | 创建子类需要在另一个层次中创建另一个 | Move Method、Move Field |

#### 3. 变更阻碍者（Change Preventers）

使变更比必要更困难的代码。

| 异味 | 说明 | 重构方式 |
|------|------|---------|
| **Divergent Change（发散式变更）** | 一个类因多种不同原因被修改 | Extract Class、Split Phase |
| **Shotgun Surgery（散弹枪手术）** | 一个变更需要修改多个类 | Move Method、Move Field、Inline Function、Inline Class |
| **Parallel Inheritance Hierarchies（平行继承层次）** | （见上方） | Move Method、Move Field |

#### 4. 可有可无者（Dispensables）

可以移除的不必要代码。

| 异味 | 说明 | 重构方式 |
|------|------|---------|
| **Comments（注释）** | 隐藏糟糕代码的过多注释 | Extract Method、Rename Method、Introduce Assertion |
| **Duplicate Code（重复代码）** | 多处相同或相似的代码 | Extract Method、Pull Up Method、Extract Class、Slide Statements |
| **Dead Code（死代码）** | 未使用的代码（变量、方法、类） | Remove Dead Code |
| **Lazy Class（懒惰类）** | 做太少事而不值得存在的类 | Inline Class、Collapse Hierarchy |
| **Speculative Generality（推测式通用性）** | 「为将来使用」的未使用抽象 | Collapse Hierarchy、Inline Function、Inline Class、Remove Dead Code |
| **Data Class（数据类）** | 只有字段和 getter/setter 的类 | Move Method、Encapsulate Field、Encapsulate Collection |

#### 5. 耦合者（Couplers）

类之间过度耦合的代码。

| 异味 | 说明 | 重构方式 |
|------|------|---------|
| **Feature Envy（功能嫉妒）** | 方法使用另一个类的数据多于自己的 | Move Method、Extract Method |
| **Inappropriate Intimacy（不当亲密）** | 类过于紧密耦合，访问彼此的私有部分 | Move Method、Move Field、Hide Delegate、Replace Delegation with Inheritance |
| **Message Chains（消息链）** | `a.getB().getC().getD().getValue()` | Hide Delegate、Extract Method、Move Method |
| **Middle Man（中间人）** | 类只是委托给另一个类 | Remove Middle Man、Inline Function、Replace Superclass with Delegate |

### 代码异味检测检查清单

快速检查清单以识别常见异味：

```
方法/函数层级：
□ 方法 > 20 行？ → Extract Method
□ > 3 个参数？ → Introduce Parameter Object
□ 深度嵌套（> 3 层）？ → Extract Method、Replace Nested Conditional with Guard Clauses
□ 多个 return 语句？ → 考虑重构

类层级：
□ 类 > 200 行？ → Extract Class
□ > 10 个方法？ → 考虑拆分职责
□ 上帝类（什么都做）？ → Extract Class
□ 数据类（只有字段）？ → 把行为移进来

代码模式：
□ 基于类型的 Switch？ → Replace with Polymorphism
□ 复制粘贴代码？ → Extract Method/Class
□ 未使用的代码？ → 删除它
□ 魔法数字？ → Replace with Named Constant
```

### 安全重构检查清单

```
重构前：
□ 所有测试都通过（绿色）
□ 有足够的测试覆盖
□ 你理解代码在做什么

重构中：
□ 一次只做「一个」小变更
□ 「每次」变更后执行测试
□ 如果测试失败，立即恢复
□ 重构时不要新增功能

重构后：
□ 所有测试仍然通过
□ 代码更干净/简单
□ 没有新增功能
```

### 常见重构技术

| 技术 | 使用时机 | 示例 |
|------|---------|------|
| **Extract Method** | 过长方法、重复代码 | 提取 10 行到 `calculateDiscount()` |
| **Rename** | 不清楚的名称 | `calc()` → `calculateOrderTotal()` |
| **Inline** | 过度抽象 | 移除不必要的包装函数 |
| **Extract Variable** | 复杂表达式 | `const isEligible = age >= 18 && hasLicense` |
| **Replace Conditional with Polymorphism** | 复杂的 switch/if 链 | 使用策略模式 |
| **Introduce Parameter Object** | 太多参数 | `(x, y, width, height)` → `Rectangle rect` |

---

## TDD 中的测试替身

### 测试替身类型

| 类型 | 目的 | 使用时机 |
|------|------|---------|
| **Dummy** | 填充参数列表 | 必要参数但测试中未使用 |
| **Stub** | 回传预定义的值 | 模拟特定场景 |
| **Spy** | 记录互动 | 验证方法是否被呼叫 |
| **Mock** | 验证互动 + 回传值 | 测试行为和协作 |
| **Fake** | 简化的实作 | 记忆体内资料库 |

### 依测试层级的测试替身使用

| 层级 | 建议的替身 |
|------|-----------|
| **单元测试** | 所有外部依赖使用 Mock、Stub |
| **集成测试** | DB 使用 Fake，外部 API 使用 Stub |
| **系统测试** | 真实元件，只有外部服务使用 Fake |
| **E2E 测试** | 全部使用真实 |

### 范例：使用 Mock 和 Stub

```typescript
// Stub 范例 - 预定义的回传值
const paymentGateway = {
  processPayment: jest.fn().mockResolvedValue({ success: true, transactionId: 'TXN123' })
};

// Mock 范例 - 验证互动
const emailService = {
  sendConfirmation: jest.fn()
};

test('should send confirmation email after successful payment', async () => {
  const order = new OrderService(paymentGateway, emailService);

  await order.checkout({ amount: 100, email: 'user@example.com' });

  // 验证 mock 是否使用正确的参数被呼叫
  expect(emailService.sendConfirmation).toHaveBeenCalledWith(
    'user@example.com',
    expect.objectContaining({ transactionId: 'TXN123' })
  );
});
```

### 避免过度 Mock

```
❌ 过度 mock（测试实作细节）：
- Mock 私有方法
- Mock 每一个依赖
- 验证每一个内部方法呼叫

✅ 适当的 mock：
- Mock 外部服务（API、资料库）
- Mock 慢速操作（档案 I/O、网路）
- Mock 非确定性操作（时间、随机）
```

---

## 反模式与修复

### 程序码层级反模式

| 反模式 | 说明 | 影响 | 修复方式 |
|--------|------|------|---------|
| **测试实作细节** | 测试私有方法或内部状态 | 脆弱的测试，重构会破坏测试 | 只测试公开行为 |
| **过度 Mock** | Mock 所有东西，失去真实性 | 虚假的信心，bug 进入生产环境 | 平衡 mock 和真实元件 |
| **测试相依性** | 测试依赖执行顺序 | 随机失败，难以隔离 | 每个测试设置自己的状态 |
| **魔术数字/字串** | 没有意义的硬编码值 | 可读性差，维护噩梦 | 使用命名常数、建构器 |
| **缺少断言** | 测试没有适当的断言 | 假阳性 | 每个测试需要明确的断言 |
| **不稳定测试** | 有时通过，有时失败 | 对测试套件信任度降低 | 消除时间/顺序依赖 |
| **过大的 Arrange 区块** | 每个测试都有复杂设置 | 难以理解、维护 | 提取设置到建构器/fixtures |
| **测试中的条件逻辑** | 测试程序码中的 if/else | 一个测试中有多个测试 | 分割成独立的测试 |
| **测试程序码重复** | 许多测试中相同的设置 | 维护负担 | 提取共享设置 |
| **过于特定的断言** | 断言每一个栏位 | 脆弱的测试 | 只断言相关栏位 |
| **忽略测试失败** | 跳过或注解掉失败的测试 | 隐藏的 bug | 修复或移除失败的测试 |
| **测试第三方程序码** | 测试程序库/框架行为 | 浪费努力 | 信任第三方，测试你的程序码 |
| **一个巨大的测试** | 单一测试涵盖所有 | 难以诊断失败 | 分割成聚焦的测试 |
| **没有测试名称** | `test1`、`test2` | 无法理解 | 使用描述性名称 |
| **捕获所有例外** | 测试中的 `catch (Exception e)` | 隐藏的失败 | 捕获特定例外 |

### 流程层级反模式

| 反模式 | 说明 | 影响 | 修复方式 |
|--------|------|------|---------|
| **跳过红色阶段** | 在测试之前写程序码 | 失去 TDD 设计优点 | 纪律：始终先写失败的测试 |
| **跳过重构阶段** | 从不清理 | 技术债累积 | 安排重构时间 |
| **开发后测试 (TAD)** | 程序码完成后才写测试 | 不是 TDD，错过设计回馈 | 真正的 TDD：测试优先 |
| **一次写所有测试** | 同时写所有测试 | 不堪负荷，覆盖率差 | 一次一个测试 |
| **100% 覆盖率迷思** | 追求覆盖率指标 | 无意义的测试 | 专注于行为覆盖 |
| **不审查测试** | PR 中不审查测试 | 测试品质差 | 在程序码审查中包含测试 |
| **延迟执行测试** | 不常执行测试 | 回馈延迟 | 持续执行测试 |
| **忽略慢速测试** | 让测试套件变慢 | 开发者跳过测试 | 优化或并行化 |
| **TDD 狂热** | 到处强制使用 TDD | 团队挫败 | 务实地应用 TDD |
| **不维护测试** | 让测试腐败 | 假阳性/假阴性 | 将测试视为生产程序码 |

### 诊断与修复步骤

```
┌─────────────────────────────────────────────────────────────────┐
│           反模式诊断工作流程                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  症状：重构时测试经常失败                                         │
│  ├─ 可能原因：测试实作细节                                        │
│  └─ 修复：审查测试，确保只测试行为                                 │
│                                                                 │
│  症状：测试通过但 bug 进入生产环境                                 │
│  ├─ 可能原因：过度 mock，缺少边界情况                              │
│  └─ 修复：新增集成测试，审查覆盖差距                               │
│                                                                 │
│  症状：测试随机失败                                               │
│  ├─ 可能原因：测试相依性，时间问题                                 │
│  └─ 修复：隔离测试，mock 时间相关操作                              │
│                                                                 │
│  症状：测试套件执行时间太长                                        │
│  ├─ 可能原因：集成测试太多，慢速 I/O                               │
│  └─ 修复：增加单元测试比例，并行化                                 │
│                                                                 │
│  症状：团队回避写测试                                             │
│  ├─ 可能原因：测试太复杂，工具不佳                                 │
│  └─ 修复：简化测试设置，改善测试工具                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 语言/框架实践

详细的语言特定 TDD 范例，请参阅 TDD Assistant skill：
- [语言范例](../skills/tdd-assistant/language-examples.md)

### 依语言快速参考

| 语言 | 测试框架 | Mock 程序库 | BDD 工具 |
|------|---------|------------|---------|
| **JavaScript/TypeScript** | Jest, Vitest | jest.mock, vitest.mock | Cucumber.js |
| **Python** | pytest, unittest | unittest.mock, pytest-mock | Behave |
| **C#** | xUnit, NUnit, MSTest | Moq, NSubstitute | SpecFlow |
| **Java** | JUnit 5, TestNG | Mockito, EasyMock | Cucumber-JVM |
| **Go** | testing | testify/mock | godog |
| **Ruby** | RSpec, minitest | rspec-mocks | Cucumber |

### 框架选择指南

| 考量 | 建议 |
|------|------|
| **新专案** | 使用 IDE 支援最好的框架 |
| **团队经验** | 使用团队最熟悉的 |
| **现有程序码库** | 匹配现有测试框架 |
| **需要 BDD** | 选择有 BDD 集成的框架 |
| **速度关键** | 考虑并行执行支援 |

---

## 度量与评估

### TDD 成熟度模型

| 层级 | 名称 | 特征 |
|------|------|------|
| **Level 0** | 无 TDD | 程序码之后写测试（如果有的话） |
| **Level 1** | 测试优先 | 有时在程序码之前写测试 |
| **Level 2** | TDD 实践者 | 一致的红-绿-重构循环 |
| **Level 3** | TDD 专家 | 有效的测试替身，干净的测试 |
| **Level 4** | TDD 大师 | TDD 驱动设计，指导他人 |

### 关键指标

| 指标 | 目标 | 警示阈值 |
|------|------|---------|
| **程序码覆盖率** | > 80% | < 60% |
| **测试对程序码比** | 1:1 到 2:1 | < 0.5:1 |
| **测试执行时间** | < 30 秒（单元） | > 2 分钟 |
| **不稳定测试率** | 0% | > 1% |
| **测试维护成本** | < 15% 开发时间 | > 30% |
| **缺陷逃逸率** | 下降中 | 上升中 |

### 评估检查清单

```
团队 TDD 评估：

□ 在生产程序码之前写测试
□ 遵循红-绿-重构循环
□ 测试名称清楚描述行为
□ 测试是独立且可重复的
□ 测试套件执行快速（< 2 分钟）
□ 没有不稳定的测试
□ 足够的覆盖率（> 80%）
□ 程序码审查中审查测试
□ 定期进行重构
□ CI/CD 自动执行测试
```

---

## 相关标准

- [测试标准](testing-standards.md) - 核心测试标准（UT/IT/ST/E2E）（或使用 `/testing-guide` 技能）
- [测试完整性维度](test-completeness-dimensions.md) - 8 维度框架
- [规格驱动开发](spec-driven-development.md) - SDD 工作流程
- [程序码入库标准](checkin-standards.md) - 入库要求
- [程序码审查检查清单](code-review-checklist.md) - 审查指南

---

## 参考资料

### 书籍

- Kent Beck - "Test Driven Development: By Example" (2002)
- Robert C. Martin - "Clean Code" 第 9 章：单元测试 (2008)
- Michael Feathers - "Working Effectively with Legacy Code" (2004)
- Steve Freeman & Nat Pryce - "Growing Object-Oriented Software, Guided by Tests" (2009)

### 标准

- [IEEE 29119 - 软体测试标准](https://www.iso.org/standard/81291.html)
- [SWEBOK v4.0 - 第 5 章：软体建构](https://www.computer.org/education/bodies-of-knowledge/software-engineering)
- [ISTQB 认证测试员基础级](https://www.istqb.org/)

### 线上资源

- [TDD by Example - Martin Fowler](https://martinfowler.com/bliki/TestDrivenDevelopment.html)
- [The Three Rules of TDD - Uncle Bob](http://butunclebob.com/ArticleS.UncleBob.TheThreeRulesOfTdd)
- [Test Pyramid - Martin Fowler](https://martinfowler.com/bliki/TestPyramid.html)
- [Approval Tests](https://approvaltests.com/)

---

## 版本历史

| 版本 | 日期 | 变更内容 |
|------|------|----------|
| 1.2.0 | 2026-01-25 | 新增：方法论分类章节，明确 TDD 与 SDD 的关系、历史背景、使用上下文 |
| 1.1.0 | 2026-01-12 | 新增：完整代码异味目录（22+ 种异味分 5 类，基于 Martin Fowler《Refactoring》第二版）、代码异味检测检查清单 |
| 1.0.0 | 2026-01-07 | 初始 TDD 标准定义 |

---

## 授权

本标准依据 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权释出。

**来源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
