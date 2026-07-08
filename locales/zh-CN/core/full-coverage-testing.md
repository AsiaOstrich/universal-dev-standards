---
source: ../../../core/full-coverage-testing.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-07-08
source_hash: 8ca921c68533
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

## 迁移错误路径完整性（XSPEC-288）

> 属于 [XSPEC-284](https://github.com/AsiaOstrich/universal-dev-standards) 9 轴迁移完整性矩阵的**轴⑨（错误路径）**。上述三路径模型要求**每个函数**都有错误路径；本节新增**迁移专属**保证——legacy 的错误/降级/fallback 分支被**系统性**移植，而非仅抽样。

### 为何三路径模型对迁移还不够

每函数错误路径要求与 XSPEC-201 的错误路径快照，只验证你**想到要枚举**的错误案例。重写时 happy path 因有明确需求而被迁移，而错误分支——散落于 `try/catch` 层级、自定义异常层级、特定错误码、降级 fallback——**被整批静默遗漏**。通过的错误路径抽样**不能证明没有分支被遗漏**（与 #134 同源盲区，只是发生在错误路径层）。本节是快照机制之上的**系统性枚举 + gap 分析**层。

### 步骤 1 — 机械化 legacy 异常/错误码清单（derive，R1）

**机械化**枚举 legacy 错误面，而非依赖人脑回忆：

| 来源 | 推导出 |
|--------|--------|
| `catch` / `except` / `rescue` 区块（grep） | 每个捕获的异常类型 + handler |
| 自定义异常/错误类层级 | 声明的错误分类法 |
| 错误/状态码（HTTP status、app 错误码、错误 enum） | 响应码面 |
| 错误响应形状（serializer、错误 DTO） | on-the-wire 错误契约 |

捕获到的清单即**错误路径待验清单**——来自 artifact 而非人脑回忆。

### 步骤 2 — 系统性遗漏分支 gap 分析（oracle，R2）

对步骤 1 的**每条** legacy 错误分支，验证新系统有对应 handler。无对应者标记为 `not_implemented`（XSPEC-199）并**阻止**。产出覆盖完整推导清单的**「遗漏错误分支」gap 报告**——而非仅抽样通过。

```markdown
## Error-Path Gap Report — <module>

| Legacy branch (error type / code) | New-system handler | Status |
|-----------------------------------|--------------------|--------|
| PaymentDeclinedException → 402 | PaymentService.handleDecline | MAPPED |
| GatewayTimeout → retry+fallback | (none found) | not_implemented — BLOCK |
| ValidationError → 422 + field list | InputValidator | MAPPED |

**Branches: N total · M mapped · K not_implemented (block if K>0)**
```

### 步骤 3 — 降级/Fallback 对等（R3）

legacy 降级模式（外部服务失败时的 fallback、重试、部分结果）因仅在失败时才执行而容易被遗漏。验证新系统保留对应降级行为，避免「正常路径一致、失败时行为迥异」：

- [ ] 外部服务失败的 **fallback** 行为与 legacy 一致
- [ ] **重试**策略（次数、backoff、放弃条件）与 legacy 一致
- [ ] **部分结果**处理与 legacy 一致（尽量返回 vs all-or-nothing）
- [ ] **熔断器/超时**降级与 legacy 一致

### 步骤 4 — 错误响应差分（oracle，R4）

把 [behavior-snapshot](behavior-snapshot.md) 对等与 XSPEC-284 R5 replay 延伸至涵盖**错误响应**，而不只是 happy-path 响应。比对新旧系统：

- **错误码**（HTTP status、app 错误码）
- **消息结构**（错误 DTO 形状、字段级错误）
- 各错误类的 **HTTP status** 映射

这让隐性错误路径分歧在 cutover 时自我暴露，如同 happy-path 快照一样。

**Gate 时机**：pre-UAT（gap 分析 + 降级对等）+ cutover 前后（错误响应差分）。

### 重要性分级（范围指引）

并非每条 legacy 错误分支都同等优先。按**生产实际触发频率**排序（呼应 #134「以生产为准」）：生产日志中实际触发过的分支优先对应；从未触发的潜在分支优先级较低但仍列入。高频生产错误分支若无新系统对应即为硬阻止。

### 完整性声明（矩阵对齐）

当本节声明以下三者——**derive**（步骤 1 机械化异常/错误码清单）、**oracle**（步骤 2 系统性 gap 分析 + 步骤 4 错误响应差分）、**gate 时机**（pre-UAT + cutover 前后）——即满足轴⑨。复用 XSPEC-201 错误路径快照 + 上述三路径模型——本节只新增系统性遗漏分支分析与错误响应差分，不重建测试框架。

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
- `flaky-test-management.md` — 间歇性失败处理：会 flaky 的测试**不算**通过的测试。覆盖率数字计入闸门前，间歇性失败必须（MUST）依该标准隔离/设定重试预算/根因排查——否则「全覆盖」会掩盖非确定性缺口。
- `behavior-snapshot.md` — 错误响应差分 oracle（迁移错误路径完整性，轴⑨）
- `migration-assistant` skill — legacy 异常/错误码 derive + 降级对等（XSPEC-288）
- XSPEC-178 — 完整规格与实现阶段
- XSPEC-288 — 迁移错误路径完整性（XSPEC-284 矩阵轴⑨）


**Scope**: universal
