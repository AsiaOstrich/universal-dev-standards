---
source: ../../../core/test-data-standards.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-16
source_hash: 67bb6b804e50
status: current
---

# 测试数据标准

> **语言**: [English](../../../core/test-data-standards.md) | [繁體中文](../../zh-TW/core/test-data-standards.md) | 简体中文

**版本**: 1.0.0
**最后更新**: 2026-03-31
**适用范围**: 所有软件项目
**范畴**: universal
**参考文档**: [Testing Standards](testing-standards.md), [Security Standards](security-standards.md)

---

## 概述

本文件定义了跨所有测试层级管理测试数据的标准。它涵盖了数据策略选择、个人身份信息（PII）匿名化、Fixture 与 Schema Migration 同步、测试隔离原则、用于数据创建的工厂模式（Factory Pattern），以及应避免的常见反模式。

妥善管理的测试数据可确保测试具有**可靠性**（确定性结果）、**安全性**（无 PII 泄露）以及**可维护性**（当 Schema 变更时易于更新）。

---

## 测试数据策略

根据测试层级和数据复杂度选择适当的测试数据策略：

| 策略 | 说明 | 适用场景 | 测试层级 |
|------|------|---------|---------|
| **Inline Data** | 直接在测试代码中定义的数据 | 简单、聚焦的值 | 单元测试 |
| **Fixture Files** | 由测试加载的外部 JSON/YAML/SQL 文件 | 共享参考数据、复杂结构 | 集成测试 |
| **Seed Scripts** | 填充数据库的可执行脚本 | 完整环境设置、拟真数据集 | E2E 测试 |

### Inline Data

直接在测试函数内定义测试数据。这可以保持测试的自包含性并且易于理解。

**适用场景：**
- 输入/输出简单的单元测试
- 数据量小（1-5 个对象）
- 每个测试需要略有不同的数据

**示例概念：**
```
// Inline: data is right next to the assertion
const user = { name: 'Jane Doe', email: 'jane@example.com', role: 'admin' };
expect(greet(user)).toBe('Hello, Admin Jane Doe');
```

### Fixture Files

将测试数据存储在测试运行时加载的外部文件（JSON、YAML、CSV 或 SQL）中。

**适用场景：**
- 需要复杂或大型数据集的集成测试
- 多个测试共享相同的参考数据（只读）
- 数据代表真实的领域对象

**最佳实践：**
- 将 fixture 存储在专门的 `tests/fixtures/` 或 `__fixtures__/` 目录中
- 具描述性地命名文件：`valid-order-with-items.json`、`expired-subscription.json`
- 保持 fixture 紧凑且聚焦——每个 fixture 对应一个场景
- 切勿在运行时修改 fixture 文件

### Seed Scripts

用于为数据库或外部服务搭建测试数据的可执行脚本。

**适用场景：**
- 需要完全填充环境的 E2E 测试
- 具有拟真数据量的性能/负载测试
- 与真实数据库交互的测试

**最佳实践：**
- 确保 seed 脚本具备幂等性（可安全地多次运行）
- 同时包含 setup 和 teardown 逻辑
- 将 seed 脚本与 schema migration 一同进行版本控制
- 记录 seeding 后的预期状态

### 策略选择指南

```
What test level?
├─ Unit test
│  └─ Use inline data (simple, self-contained)
├─ Integration test
│  └─ Use fixture files (shared, structured)
└─ E2E test
   └─ Use seed scripts (full environment setup)
```

---

## 数据匿名化规则

当测试需要拟真数据时，**绝不使用真实 PII**。针对每种字段类型应用以下匿名化技术：

| PII 字段 | 匿名化技术 | 示例（处理前 → 处理后） |
|----------|-----------|--------------------------|
| **姓名** | 使用 Faker 库或虚构假名 | `John Smith` → `Jane Doe`（生成） |
| **Email** | 将域名替换为 `@example.com` | `john@company.com` → `user1@example.com` |
| **电话** | 采用固定前缀的保留格式遮罩 | `+1-555-123-4567` → `+1-555-000-0001` |
| **地址** | 泛化为虚构地址 | `123 Main St, NYC` → `1 Test Ave, Anytown` |
| **ID** | 对原始值进行哈希或使用序列/UUID 生成 | `SSN: 123-45-6789` → `ID: test-uuid-0001` |

### 规则

1. **切勿复制生产数据**到测试环境中，除非经过完全匿名化
2. 当测试需要可重现的数据时，**使用确定性生成**（固定 seed 的 Faker）
3. **验证匿名化数据**保留了格式约束（例如有效的 email 格式）
4. **记录匿名化映射关系**，以确保原始字段语义清晰
5. **在 CI 日志中审查测试数据**——确保测试输出中未出现真实 PII

---

## Fixture 与 Schema Migration 同步

当数据库 Schema 发生变更时，fixture 文件必须同步更新以匹配变更。过期的 fixture 会导致伪阳性（测试通过但代码损坏）或伪阴性（测试失败但代码正确）。

### 同步规则

1. **原子更新**：当 migration 增添/删除/重命名列时，在**同一个 commit** 中更新引用该表的所有 fixture
2. **自动化检测**：添加 CI 检查，依据当前 schema 验证 fixture 文件
   - 加载每个 fixture 并验证其与预期 schema 相符
   - 标记任何带有过期或缺失字段的 fixture
3. **Fixture 版本化**：在 fixture 文件中包含 schema 版本注释
   ```json
   {
     "_schema_version": "2026-03-31-add-status-column",
     "users": [{ "name": "Test User", "email": "test@example.com", "status": "active" }]
   }
   ```
4. **Migration 检查清单**：在 migration PR 模板中将“更新测试 fixture”添加为必选步骤
5. **过期 fixture 检测**：运行自动化检查以检测引用了不再存在于 schema 中的列或表的 fixture

---

## 测试隔离原则

每个测试都必须保持独立。依赖共享状态或执行顺序的测试脆弱且不可靠。

### 核心规则

1. **创建自己的数据**：每个测试在其 `beforeEach` 或 `setUp` 块中精确搭建其所需的数据
2. **清理自己的数据**：每个测试在 `afterEach` 或 `tearDown` 中销毁或回滚其数据
3. **无共享可变状态**：测试绝不能读取或写入其他测试也在使用的共享可变变量、数据库行或文件
4. **并行安全**：测试应设计为可并行运行且互不干扰
5. **幂等性**：运行测试一次或多次应产生相同的结果

### 各测试层级的隔离策略

| 测试层级 | 隔离策略 |
|---------|---------|
| **Unit** | 纯函数；mock 外部依赖 |
| **Integration** | 事务回滚；测试专属数据库 schema |
| **E2E** | 专用测试环境；唯一命名空间数据 |

### 事务回滚模式（Transaction Rollback Pattern）

对于数据库集成测试，将每个测试包装在事务中并在之后回滚：

```
beforeEach: BEGIN TRANSACTION
  test runs (INSERT, UPDATE, SELECT)
afterEach: ROLLBACK
```

这可确保测试之间产生零副作用。

---

## Factory Pattern

使用 Factory Pattern 创建具有合理默认值的测试数据，这些默认值可在每个测试中覆写。

### 定义

**测试数据工厂（test data factory）**是一个具备以下特性的函数：
1. 为所有必填字段提供**合理默认值**
2. 允许针对特定测试场景**覆写**任意默认值
3. 支持自动创建**关联/相关数据**

### 概念示例

```
// Factory with defaults
function createUser(overrides = {}) {
  return {
    id: generateUUID(),
    name: 'Default User',
    email: 'default@example.com',
    role: 'viewer',
    createdAt: new Date(),
    ...overrides       // Override any default
  };
}

// Usage: override only what matters for this test
const admin = createUser({ role: 'admin' });
const named = createUser({ name: 'Specific Name' });
```

### 关联数据

工厂应支持创建相关实体：

```
// Factory that creates associated data
function createOrder(overrides = {}) {
  const user = overrides.user || createUser();
  return {
    id: generateUUID(),
    userId: user.id,
    items: overrides.items || [createOrderItem()],
    status: 'pending',
    ...overrides
  };
}
```

### 最佳实践

1. **每个实体一个工厂**：`createUser()`, `createOrder()`, `createProduct()`
2. **最小默认值**：仅包含必填字段；保持默认值简单
3. **可组合**：工厂可以调用其他工厂来获取关联数据
4. **无副作用**：工厂返回数据对象；它们不会写入数据库（那是单独的步骤）
5. **Traits/预设**：为常见场景定义命名预设：`createUser({ ...adminTraits })`

---

## 反模式

避免以下常见的测试数据反模式：

### 1. 共享可变数据

**问题**：多个测试读取和写入相同的数据（全局变量、共享数据库行）。

**危害原因**：测试变得依赖执行顺序。一个测试的变更会影响另一个测试的预期，从而导致偶发性失败。

**解决方案**：每个测试创建并拥有自己的数据。使用工厂以及 setup/teardown 钩子。

### 2. 硬编码 ID

**问题**：测试使用硬编码的 ID，例如 `userId: 1` 或 `orderId: 'abc-123'`。

**危害原因**：并行执行时不同测试之间的 ID 会发生冲突。关于自增值的假设在不同环境中会失效。

**解决方案**：在工厂中生成唯一 ID（UUID）。绝不假定特定的 ID 值。

### 3. 执行顺序依赖

**问题**：测试 B 假定测试 A 已经运行并设置了特定数据。

**危害原因**：测试在隔离运行、以不同顺序运行或并行运行时会失败。这会使调试变得极其困难。

**解决方案**：每个测试完全自包含，拥有自己的 setup 与 teardown。任何测试都不应依赖来自另一个测试的副作用。

### 4. 使用生产数据

**问题**：将生产数据库快照复制到测试环境中。

**危害原因**：暴露真实的 PII（法律/合规风险），产生庞大的测试数据集拖慢 CI，且包含不可预测的数据导致脆弱的测试。

**解决方案**：使用匿名化的合成数据。通过工厂和 Faker 库生成测试数据。保持数据集最小化且为特定目的构建。

---

## 快速参考卡

### 策略选择
```
Unit test?           → Inline data
Integration test?    → Fixture files
E2E test?            → Seed scripts
```

### 匿名化快速检查
```
Name?    → Faker / pseudonym
Email?   → @example.com domain
Phone?   → Format-preserving mask
Address? → Fictitious / generalized
ID?      → Hash / UUID / sequential
```

### 隔离检查清单
```
[ ] Test creates its own data
[ ] Test cleans up after itself
[ ] No shared mutable state
[ ] Safe to run in parallel
[ ] Same result every time
```

---

## 参考资料

- [Testing Standards](testing-standards.md) — 测试层级、覆盖率与质量要求
- [Security Standards](security-standards.md) — 数据保护与 PII 处理
- [Unit Testing Standards](../options/testing/unit-testing.md) — 单元测试模式与最佳实践
- [Integration Testing Standards](../options/testing/integration-testing.md) — 集成测试策略

---

**相关标准：**
- [Testing Standards](testing-standards.md) — 整体测试框架
- [Performance Standards](performance-standards.md) — 性能测试数据考量

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0.0 | 2026-03-31 | 初始发布：策略、匿名化、Fixture 同步、隔离、Factory Pattern、反模式 |

---

## 许可

本标准以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可发布。
