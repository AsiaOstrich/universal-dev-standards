---
source: ../../../core/full-coverage-testing.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-06-10
source_hash: e05fa172a6ee
status: current
---

# 全覆盖测试标准

> **Language**: [English](../../../core/full-coverage-testing.md) | [繁體中文](../../zh-TW/core/full-coverage-testing.md) | 简体中文

> **AI 最优化版本**: `ai/standards/full-coverage-testing.ai.yaml`
> **XSPEC**: XSPEC-178
> **取代**: 金字塔门槛模型（UT≥80%、IT≥70%、E2E 仅 happy-path）

## 概述

全覆盖测试（Full Coverage Testing）是为 AI 时代设计的行为完整性范式——在这个时代，产生测试的成本等同于产生代码的成本。传统金字塔门槛假设测试编写成本高昂——这个假设已不再成立。

**核心原则**：每个 public 函数都必须测试全部三种行为路径。覆盖率以行为完整性衡量，而非百分比下限。CI 强制执行棘轮（ratchet）：覆盖率只能上升，不能下降。

---

## 行为完整性模型

不以「80% 行覆盖率」为要求，改为要求：

| 路径 | 说明 | 示例 |
|------|-------------|---------|
| **Happy path** | 正常输入产生正确输出 | `calculateDiscount(100, 0.1) → 90` |
| **Edge case** | 边界值不引发非预期错误 | `calculateDiscount(0, 1.0) → 0 without throwing` |
| **Error path** | 无效输入引发明确错误或错误状态 | `calculateDiscount(-1, 2.0) → throws ArgumentError` |

每个 public 函数都需要全部三种。这以质性的、行为驱动的要求，取代「业务逻辑 80%」的目标。

---

## 棘轮（Ratchet）CI 策略

- 当前的覆盖率基准线即为最低可接受覆盖率
- 任何降低覆盖率的 PR 都会被阻止合并
- 覆盖率提升时，合并后自动更新基准线
- 没有固定百分比下限——今天达到的覆盖率就是明天的下限

```bash
# Stored in .coverage-baseline.json
{ "line": 91.3, "branch": 88.7, "timestamp": "2026-05-06" }

# PR regression → blocked
Coverage regression: 91.3% → 89.1%. Ratchet threshold violated.

# PR improvement → baseline updated
Coverage improved: 91.3% → 92.0%. New baseline set.
```

---

## 反假测试规则

### 禁止：恒真断言（Tautology Assertions）

无论行为如何都会通过的断言，提供的是虚假覆盖率。

```typescript
// ❌ FORBIDDEN — always passes, tests nothing
expect(true).toBe(true)
expect(result).toBeDefined()  // without specific value

// ✅ REQUIRED — verifies actual behavior
expect(result).toBe(90)
expect(result).toEqual({ discount: 10, total: 90 })
```

### 禁止：Mock 核心业务逻辑

Mock 自己的代码，意味着业务逻辑从未真正执行。

```typescript
// ❌ FORBIDDEN — business logic never runs
jest.mock('./orderService', () => ({ calculateTotal: jest.fn(() => 100) }))

// ✅ ALLOWED — mock only external dependencies
// MOCK: External Stripe API — no sandbox available in CI
jest.mock('./payment-gateway', () => ({ charge: jest.fn().mockResolvedValue({ id: 'ch_test' }) }))
```

### 必要：Mock 原因注释

每个 mock 都必须说明为何该依赖不能使用真实实现。

```typescript
// ❌ FORBIDDEN — no explanation
jest.mock('./payment-gateway')

// ✅ REQUIRED — explicit reason
// MOCK: External payment gateway — network dependency, no sandbox in CI
jest.mock('./payment-gateway', () => ({ ... }))
```

### Mock 边界：哪些可以 Mock

| ✅ 允许 Mock | ❌ 禁止 Mock |
|-------------------|---------------------|
| 外部 HTTP API（金流、OAuth） | 核心业务计算函数 |
| 硬件接口（传感器、GPIO） | 自己的 service 层方法 |
| 无测试模式的第三方 SDK | 数据库查询（改用 in-memory SQLite） |
| Docker daemon | 自己的工具函数 |

---

## STUB 标记协议

所有临时性/占位实现都必须（MUST）以标准 STUB 标记标示。此规则由 pre-push hooks 与 deploy.sh 强制执行。

### 标记一个 STUB

```typescript
// WARNING: STUB — Remove before UAT
async function validatePayment(card: Card): Promise<boolean> {
  return true; // Always approve — replace with real Stripe call
}
```

### 豁免真正的限制

当某个依赖确实无法被测试时（硬件、无 sandbox 的线上 API）：

```typescript
// COVERAGE_EXEMPT: Hardware temperature sensor — no simulation available in CI
async function readTemperature(): Promise<number> {
  return hardwareSensor.read();
}
```

豁免原因必须（MUST）非空且具体。

### 部署闸门

| 环境 | 存在 STUB | 动作 |
|-------------|-------------|--------|
| Feature branch push | 是 | ⚠️ 警告（不阻止） |
| `main` branch push | 是 | ❌ 阻止 |
| Staging deploy | 是 | ⚠️ 警告（不阻止） |
| UAT deploy | 是 | ❌ 阻止 |
| Production deploy | 是 | ❌ 阻止（critical log） |

---

## AC 可追溯性

使用 `@ac` JSDoc 标签将每个测试连接到其验收标准（Acceptance Criteria）：

```typescript
/**
 * @ac AC-US03-2
 */
it('should block PR when coverage regresses below baseline', () => {
  // test body
})

// If no AC maps to this test:
/**
 * @ac UNTRACED
 */
it('helper utility returns correct format', () => { ... })
```

CI 会回报 AC 覆盖率。若超过 20% 的 AC 没有 `@ac` 标签的测试，会显示警告。

---

## 从金字塔模型迁移

若你的项目先前使用金字塔门槛：

1. **删除** `jest.config.js` / `vitest.config.ts` 中任何硬编码的覆盖率门槛（`coverageThreshold` 选项）
2. **安装** `.coverage-baseline.json`，以当前的覆盖率作为棘轮起点
3. **新增** `scripts/check-coverage-ratchet.sh` 到 CI
4. **新增** `scripts/check-stubs.sh` 到 deploy.sh 与 pre-push hook
5. **新增** `scripts/check-anti-fake-tests.sh` 到 pre-commit 或 CI

棘轮从你当前的覆盖率开始。从那一刻起，它只能上升。

---

## 相关标准

- `testing.ai.yaml` — 测试结构、FIRST 原则、AAA 模式（金字塔门槛在此已弃用）
- `unit-testing.ai.yaml` — 单元测试范围与组织
- `integration-testing.ai.yaml` — 集成测试模式
- `deployment-standards.ai.yaml` — 部署闸门需求
- XSPEC-178 — 完整规格与实现阶段


**Scope**: universal
