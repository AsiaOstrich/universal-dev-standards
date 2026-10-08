---
source: ../../../core/full-coverage-testing.md
source_version: 1.3.0
translation_version: 1.3.0
last_synced: 2026-10-08
source_hash: e8b78ceb60ce
status: current
---

# 全覆盖测试标准

> **Language**: [English](../../../core/full-coverage-testing.md) | [繁體中文](../../zh-TW/core/full-coverage-testing.md) | 简体中文

> **AI 最优化版本**: `ai/standards/full-coverage-testing.ai.yaml`
> **XSPEC**: XSPEC-178、XSPEC-444（R2、R5——提交前警告与随附闸门脚本）、XSPEC-470（R1——恒真式＝预期值不独立）
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

断言若不可能与实现产生分歧，提供的就是虚假覆盖率。恒真断言有两种：

1. **恒为真**——不管程序做什么都会通过：`expect(true).toBe(true)`、`assert 200 == 200`。
2. **预期值不独立**——预期值由被测的代码产生，或由测试里再写一遍的同一套逻辑产生。实现正确时它会通过；实现与那份副本以同样方式出错时，它照样通过。

第二种用 [`verification-oracle`](verification-oracle.md) 的词汇定义：断言的**预言（oracle）**是“说明正确答案是什么”的来源，恒真式就是**预言本身就是被测实现**的断言。本标准不另立第二套“独立真值”定义，直接采用该标准的：登记的真值案例、已知的字面值、手算例，或规格（见其 *Oracle-ability Spectrum*）。

```typescript
// ❌ FORBIDDEN — always passes, tests nothing
expect(true).toBe(true)
expect(result).toBeDefined()  // without specific value

// ❌ FORBIDDEN — the oracle is the implementation
expect(countInstalled(manifest)).toBe(countInstalled(manifest))                    // the same call on both sides
expect(countInstalled(manifest)).toBe(manifest.standards.filter(s => s.installed).length)  // the same logic, typed again
//   ^ 这一例要靠审查者判断：自动检查只抓下方《随附扫描脚本判定什么、哪些留给审查者》列出的子集，这一例不在其中

// ✅ REQUIRED — a value that was decided before the code ran
expect(result).toBe(90)
expect(result).toEqual({ discount: 10, total: 90 })
expect(countInstalled({ standards: [{ id: 'a', installed: true }, { id: 'b', installed: false }] })).toBe(1)
```

并非每个“两个算出来的值互相比较”都是恒真式。下列是正常测试，**不会**被报告：

| 看起来相似 | 为什么它是真测试 |
|------------|------------------|
| 动作之后 `expect(snapshot(dir)).toEqual(before)` | 问的是“有没有任何东西变动？”——两个值取自不同时间点 |
| `expect(parse(a)).toEqual(parseWithOldEngine(a))` | 预言是另一份独立写成的实现 |
| 名称就是在讲确定性的测试里 `expect(hash(x)).toBe(hash(x))` | 比较两次调用正是这个测试的目的 |
| `report` 与 `rows` 来自不同数据路径时的 `expect(report.total).toBe(rows.reduce(...))` | 两个来源之间的对账 |

#### 随附扫描脚本判定什么、哪些留给审查者

`scripts/check-anti-fake-tests.mjs`（见下方《两个扫描脚本》）只点名光看文本就能判定的两种形状。它读 **JavaScript/TypeScript**（`toBe`、`toEqual`、`toStrictEqual`、chai 的 `to.equal`/`to.eql`、node 的 `assert.equal`/`strictEqual`/`deepEqual`/`deepStrictEqual`）：

| 形状 | 示例 | 报告条件 |
|------|------|----------|
| **同一个调用（same call）** | `expect(total(items)).toBe(total(items))` | 两侧是同一个函数、同样的参数（调用里没有另一个调用），写在同一条语句里，且测试名称不是在讲“比较两次调用”（确定性、幂等、缓存、同一性） |
| **重算（recomputed）** | `expect(total(items)).toBe(items.reduce((s, i) => s + i.price, 0))` | 被测调用吃一个输入，预期值把同一个输入（就是实参本身，如 `items.reduce`，不是它的某个字段）送进 `reduce`、`map`、`flatMap` 或 `filter`，且回调只用到自己的参数、不含任何字面值（直接写，或经由同一个测试里先设定的 `const`） |

下列看起来相似的写法**刻意放过**，因为光看文本分不出它们和正当测试的差别：`expect(priceOf(ids)).toEqual(ids.map(id => KNOWN_PRICES[id]))`（预期值查写死的价目表，是独立来源）；`expect(activeOf(users)).toEqual(users.filter(u => u.id === 2))`（字面值是测试作者提供的知识）；`expect(render(now())).toBe(render(now()))`（两次 `now()` 是两个值，两侧不一定相等）。原则是：拿不准宁可漏抓，不可误报。

与 `expect(true).toBe(true)` 相同，只有在测试的**所有**断言都不是真断言时才报告；自我比较旁边还有一个对字面值的断言，就留给审查者。文本判不了的，扫描脚本保持沉默——会乱叫的扫描脚本迟早被关掉。

其余一律是**审查者的判断题**，在代码审查时问（见[代码审查检查清单](code-review-checklist.md)）：这个预期值从哪里来？能不能靠运行被测代码得到？如果实现错得跟测试自己的算式一样，这个测试还会过吗？扫描脚本不判的典型情形：手写循环重新推导答案、包着实现的辅助函数、拿实现第一次的输出当快照，以及 JavaScript/TypeScript 以外的所有语言。

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

## UDS 随附的提交前警告与闸门脚本（XSPEC-444 R2、R5）

上面的规则过去要靠标准让你自己写的脚本来执行。现在 `uds init` 会直接把扫描脚本写进你的项目，而 `uds check`——UDS 的 pre-commit hook 执行的命令——会打印这些脚本和另一项检查找到的东西。**默认一律只警告、不拦任何东西**；要收紧是可选的（见“先警告，之后再收紧”）。

### 两个扫描脚本（`uds init` 写到 `scripts/`）

| 脚本 | 找什么 |
|------|--------|
| `scripts/check-anti-fake-tests.mjs` | **没有断言**的测试；唯一的断言是**恒真式**的测试（`expect(true).toBe(true)`、`assert 200 == 200`；JavaScript/TypeScript 另含“预期值就是被测的同一个调用”或“以同一个输入经 `reduce`/`map`/`filter` 重算而得”，见《禁止：恒真断言》）；**每个测试都被跳过或标为 todo** 的测试文件 |
| `scripts/check-stubs.mjs` | `// WARNING: STUB` 标记；声称**尚未实现**的函数体（`raise NotImplementedError`、`todo!()`、`TODO()` 等）而旁边没有标记；函数体**为空**的具名函数而旁边没有标记 |

- 纯 Node、零依赖、不预设任何测试框架。它们是**你的文件**：可以改、可以接入 CI。单独运行时，找到东西就以非 0 退出——`node scripts/check-stubs.mjs` 就是本标准部署闸门所说的 pre-push／部署闸门。
- `uds init` 不会覆盖已存在的文件，`uds update` 也不会；较早初始化的项目，`uds update` 会询问是否写入（提示的默认为否；`uds update -y` 会直接回答是）。
- 有暂存文件时只读那些文件；没有暂存任何东西时（CI 运行、手动 `uds check`）每个都会遍历整个项目——遍历最多 200,000 个文件，`uds check` 给每个 120 秒（超过就报告“无法判定”，绝不算通过）——所以在很大的仓库里，请在 CI 运行，不要期待立刻完成。
- 同一行或上面三行内出现 `STUB` 或 `COVERAGE_EXEMPT`，该临时实现就算已**声明**；已声明的只以标记报告一次。
- **语言范围。**测试文件规则覆盖 JavaScript／TypeScript、Python、Java／Kotlin／Scala／C#、Go、Rust、Ruby、Elixir、PHP、Swift、Dart、Lua 与 C／C++。其他语言的测试文件会被列为“未扫描”——绝不当成干净。空函数规则覆盖 JavaScript／TypeScript、Python、Go、Rust、Ruby 与 PHP；其他语言仍会找标记与“尚未实现”的函数体，输出也会写明哪些语言没有空函数规则。
- 它们读的是文本，不运行你的测试。若某个辅助函数用扫描器认不出的名称做断言，会被报为“no-assertion”：把它命名为 `assert*`／`verify*`／`expect*`，或把它的模式列在策略文件的 `assertionPatterns`。
- 每次运行都先拿已知的假测试与已知的好测试检验自己；检验失败就以 `2`（“无法判定”）退出，这绝不算通过。

### 改了代码却没动测试（`uds check`，针对已暂存的变更）

有文件暂存准备提交时，`uds check` 会比对变更内容：

- 改了代码文件，**同一次提交没有任何测试文件变动** → 警告，并列出代码文件；
- 变更中有 UDS 不认识的文件类型 → 警告，列出它并说明如何分类（绝不当成没事，也绝不拦）；
- 删除不算需要测试的变更；**纯重命名**（git 的 `R100`）与匹配 `exempt` 条目的路径可免，输出会记下理由。

没有暂存任何东西时（CI 运行、手动 `uds check`），差异检查不出声；两个扫描脚本则改为扫整个项目。

### 策略文件 `.standards/test-policy.json`（可选）

哪些路径是测试、哪些是代码，是带有常见生态默认值的数据，不是一份框架清单。每个列表都是**加进**默认值：

```json
{
  "mode": "warn",
  "testDirs": ["integration"],
  "testPatterns": ["*.itest.*"],
  "sourceExtensions": ["zig"],
  "nonCodeExtensions": ["gradle"],
  "ignore": ["generated/**"],
  "exempt": [{ "pattern": "src/gen/**", "reason": "generated by protoc" }],
  "assertionPatterns": ["\\bmustMatch\\w*\\s*\\("]
}
```

没有 `reason` 的 `exempt` 条目不会生效，并会被报告：豁免必须说明原因。

### 先警告，之后再收紧

`"mode": "warn"`（默认）只打印警告、放行提交。`"mode": "block"` 会让 `uds check` 在以下情况以非 0 退出，因此拦下提交：扫描脚本找到东西、扫描脚本无法判定、或改了代码却没动测试。UDS 不认识的文件类型永远不会拦。**尚未实现**（规格没有定义基线放在哪里、以什么计数）：未配测试的变更数棘轮，以及逐次提交的豁免理由（pre-commit hook 读不到提交信息）。

---

## 从金字塔模型迁移

若你的项目先前使用金字塔门槛：

1. **删除** `jest.config.js` / `vitest.config.ts` 中任何硬编码的覆盖率门槛（`coverageThreshold` 选项）
2. **安装** `.coverage-baseline.json`，以当前的覆盖率作为棘轮起点
3. **新增** `scripts/check-coverage-ratchet.sh` 到 CI
4. **新增** `scripts/check-stubs.mjs` 到 deploy.sh 与 pre-push hook（由 `uds init` 写入；已有项目由 `uds update` 提供）
5. **新增** `scripts/check-anti-fake-tests.mjs` 到 pre-commit 或 CI（由 `uds init` 写入；`uds check` 已会运行并警告）

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
