---
source: ../../../core/cross-flow-regression.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-06-10
source_hash: ac618caf6d7f
status: stale
---

# 跨流程回归（Cross-Flow Regression）

> **语言**：[English](../../../core/cross-flow-regression.md) | [繁體中文](../../zh-TW/core/cross-flow-regression.md) | 简体中文

**版本**：1.0.0
**最后更新**：2026-05-05
**适用范围**：所有具有多个 user flow 或业务流程的软件项目
**Scope**：universal
**业界标准**：ISTQB Advanced Test Analyst（Regression Test Strategy）
**参考资料**：`core/flow-based-testing.md`、`core/testing-standards.md`

---

## 目的

本标准定义跨流程回归测试（cross-flow regression testing）——验证对某一个 flow 的修改不会破坏其他 flow，并确保**多个 flow 的组合**在依序执行时行为正确。

### 与 `flow-based-testing.md` 的界线

| 标准 | 范围 | 它能捕捉的问题 |
|----------|-------|----------------|
| `flow-based-testing.md`（Multi-Gate Model） | 单一 flow：Decision Points、Terminal States、Decision Table | flow 内部的分支覆盖缺口 |
| **本标准** | 多个 flow：交互、共享状态、依序组合 | flow 之间的污染、累积状态 bug、跨 flow 的回归 |

这两者是互补而非重叠的关系。一个项目两者都需要。

---

## 为何跨流程 bug 与众不同

flow 内部测试（Multi-Gate）能证明「Login」处理了全部 7 种 terminal state。但它无法检测：

- **状态污染（State contamination）**：在一次失败的「Create Order」（FAIL_QUOTA_EXCEEDED）之后，quota 计数器遭到破坏 → 即使 quota 已重置，下一次「Create Order」尝试仍然失败
- **共享资源冲突（Shared resource conflicts）**：「Report Generation」与「Data Export」同时执行时，破坏了共用的临时目录
- **依序依赖（Sequential dependency）**：「Cancel Subscription」成功，但后续的「Reactivate」flow 假设订阅仍然存在 → NullPointerException

---

## 跨流程测试套件定义

### Tier-1：Critical User Journeys（CUJ，关键用户旅程）

Critical User Journeys 是横跨 ≥ 2 个 flow 的端到端序列，代表核心业务价值路径。每一次 release 都必须包含一套 CUJ regression suite。

**CUJ 识别**：
1. 列出所有 flow（来自 requirement-template §2.4）
2. 找出共享状态或常被依序执行的 pair／triple（成对／三组组合）
3. 标记业务关键的组合（purchase、onboarding、authentication + 下游流程）

**CUJ 覆盖率要求**：

| 指标 | Tier-2 门槛（默认） | Tier-1 关键路径 |
|--------|--------------------------|---------------------|
| CUJ 通过率 | ≥ 95% | 100% |
| 业务关键 flow 组合 | 100% | 100% |

### Tier-2：flow 变更时的回归

当任何 flow 的 §2.4（Decision Points、Terminal States）被修改时，整套 CUJ suite 必须重新执行——而不只是执行被修改 flow 的测试。触发逻辑：

```bash
# In CI: detect flow spec changes
changed_flows=$(git diff origin/main... --name-only | grep -E "requirement-template|SPEC.*\.md")
if [ -n "$changed_flows" ]; then
  npm run test:cross-flow-regression
fi
```

### Tier-3：并行与共享资源测试

针对具有并行用户操作的项目：
- 两位用户同时执行相同的 flow
- Flow A 与 Flow B 共用一个写入资源
- 长时间运行的 flow（异步）与短 flow 的结果交互

---

## 测试结构

跨流程回归测试采用跨 flow 的**依序状态穿引（sequential state threading）**（延伸自 `flow-based-testing.md` 的 `ctx` 模式）：

```typescript
describe("CUJ: Register → Verify Email → Create First Order", () => {
  const ctx: {
    userId?: string
    token?: string
    orderId?: string
  } = {}

  // Flow 1: Register
  it("Flow-1 Step 1: Register new user", async () => {
    ctx.userId = await registerUser({ email: testEmail, plan: "trial" })
    expect(ctx.userId).toBeDefined()
  })

  // Flow 2: Email Verification (depends on Flow 1 output)
  it("Flow-2 Step 1: Verify email token", async () => {
    const token = await getEmailToken(ctx.userId!)
    ctx.token = await verifyEmail(token)
    expect(ctx.token).toBeDefined()
  })

  // Flow 3: Create Order (depends on Flow 2 auth token)
  it("Flow-3 Step 1: Create first order", async () => {
    ctx.orderId = await createOrder(ctx.token!, orderPayload)
    expect(ctx.orderId).toMatch(/^ord-/)
  })

  // Cross-flow verification: order state reflects trial plan limits
  it("Cross-flow: Trial plan quota enforced on first order", async () => {
    const order = await getOrder(ctx.token!, ctx.orderId!)
    expect(order.quota_applied).toBe("trial")
  })
})
```

### 跨流程失败隔离

当一个跨流程测试失败时，失败信息必须指出是**哪一个 flow** 引入了状态破坏：

```typescript
// BAD: generic assertion
expect(result).toBe("success")

// GOOD: includes flow context
expect(result).toBe("success")  // Flow-3 depends on Flow-2 token being valid
                                 // If this fails, check Flow-2 email verification output
```

---

## 与 Release Gate 的集成

跨流程回归是 `release-readiness-gate.md` 中的 **Dimension 6**（Tier-2）。

### 触发条件

| 触发时机 | 范围 |
|---------|-------|
| 每一个 release candidate | 整套 CUJ suite |
| 修改任何 flow §2.4 的 PR | 整套 CUJ suite（merge 前） |
| 部署至 staging 后 | CUJ 的 smoke 子集 |
| 部署至 production 后 | 仅关键路径 CUJ（canary） |

### Sign-off 的证据

```
| 6 | Cross-flow Regression | PASS | CUJ suite: 47/47 passed; 0 flow-interaction failures | QA Lead |
```

### WARN 门槛

- CUJ 通过率 ≥ 95% 但 < 100% → WARN，并需记录具体失败的 CUJ 并完成 root-cause（根因分析）
- CUJ 通过率 < 95% → FAIL（release 被封锁）
- 业务关键组合失败 → FAIL，无论整体通过率如何

---

## 反模式（Anti-Patterns）

- **只在 CI 缓慢时才跑跨流程测试**——依定义，它们必须在每一个 release candidate 上执行
- **孤立地测试每个 flow 却称之为「regression」**——flow 的孤立测试已由 Multi-Gate 涵盖；跨流程测试必须具备 flow 之间的状态依赖关系
- **在不相关的 `describe` 块间复用同一个 `ctx` 对象**——每个 CUJ 都需要干净、隔离的 `ctx`；CUJ 之间的污染会掩盖 bug
- **失败信息中缺乏 flow 归属（attribution）**——跨流程失败难以调试；务必指出是哪个上游 flow 产生了被破坏的状态
- **把 CUJ 失败当成 flaky（不稳定）**——跨流程状态 bug 是确定性的；「flaky」的跨流程测试几乎都是共享状态破坏的征兆

---

## 与其他标准的关系

- **`flow-based-testing.md`** —— flow 内部的 gate（跨流程的前置条件）
- **`testing-standards.md`** —— testing pyramid 中的 regression 层
- **`release-readiness-gate.md`** —— Dimension 6（Tier-2）
- **`e2e-testing.md`** —— CUJ 测试通常在 E2E 或 System Test 层级执行

---

## 版本历史

| 版本 | 日期 | 变更 |
|---------|------|---------|
| 1.0.0 | 2026-05-05 | 初版发布：CUJ 定义、依序状态穿引、release gate 标准、Tier-1/2/3 分类 |

---

## 授权

本标准依 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权发布。

**来源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
