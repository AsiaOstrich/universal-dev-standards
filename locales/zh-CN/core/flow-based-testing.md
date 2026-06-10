---
source: ../../../core/flow-based-testing.md
source_version: 1.3.0
translation_version: 1.3.0
last_synced: 2026-06-10
source_hash: a8838e95f84e
status: current
---

# 流程式测试（Flow-Based Testing）

> **语言**: [English](../../../core/flow-based-testing.md) | [繁體中文](../../zh-TW/core/flow-based-testing.md) | 简体中文

**版本**: 1.3.0
**最后更新**: 2026-05-05
**适用性**: 所有具备多步骤工作流程的软件项目
**范围**: universal
**行业标准**: ISO/IEC/IEEE 29119-4（测试技术）、ISTQB Foundation Syllabus
**参考资料**: Decision Table Testing（ISTQB）、Pairwise Testing、State Transition Testing

---

## 目的

本文档定义测试多步骤流程的系统化方法论。它填补了 AC 中心式测试（孤立验证单个行为）与流程级测试（验证带有累积状态与分支覆盖的顺序行为）之间的差距。

---

## 核心问题：AC 中心式 vs. 流程中心式测试

AC 中心式测试验证每个验收标准在孤立情况下可正常工作。然而，它们会漏掉两类关键 bug：

1. **步骤交互 bug**：只有当 Step 1 的输出成为 Step 2 的输入时才会显现的 bug
2. **分支覆盖缺口**：从未以所有可能值演练过的决策点

**示例**：某 pipeline 有 8 个步骤。每个 AC 都独立通过。但当 Step 3 的配额检查依赖 Step 1 与 Step 2 累积的状态时，这个交互从未被测试到。

---

## 三步骤流程分解

### Step 1: 流程识别（Flow Identification）

在编写任何测试代码之前，先记录：

- **前置条件（Preconditions）**：系统的初始状态
- **步骤序列（Step sequence）**：按顺序排列的动作列表（Step 1 → Step N）
- **决策点（Decision points）**：流程中的每一个 if/else/条件
- **终止状态（Terminal states）**：所有可能的结束状态（成功 + 每一种不同的失败）

### Step 2: 决策表展开（Decision Table Expansion）

针对每个决策点，列出所有可能的值。然后应用覆盖策略：

| 策略 | 使用时机 | 场景数量 |
|----------|-------------|---------------|
| **Each-Choice**（最小） | 低风险流程、快速反馈 | 各唯一值的总和 |
| **Pairwise** | 中风险流程 | ~N × max_values |
| **All-Combinations** | 认证、支付、安全 | 各值数量的乘积 |

**决策表示例**：

| 决策点 | 值 |
|----------------|--------|
| Authorization | valid / expired / missing |
| Quota | sufficient / exceeded |
| External Service | available / timeout / error |

Each-Choice 最小值：3 + 2 + 3 = 8 个场景（相比团队实际上通常只写 1-2 个）。

### Step 3: 旅程测试结构（Journey Test Structure）

以共享状态串联（shared state threading）编写测试——以 `ctx` 对象跨步骤累积状态：

```typescript
describe("Flow: Create Order", () => {
  const ctx: { token?: string; orderId?: string } = {}

  it("Step 1: Login", async () => {
    ctx.token = await login(credentials)
    expect(ctx.token).toBeTruthy()
  })

  it("Step 2: Create order (uses Step 1 token)", async () => {
    ctx.orderId = await createOrder(ctx.token!, orderData)
    expect(ctx.orderId).toMatch(/^ord-/)
  })

  it("Step 3: Verify order state (uses Step 2 orderId)", async () => {
    const order = await getOrder(ctx.token!, ctx.orderId!)
    expect(order.status).toBe("pending")
  })
})

describe("Flow Branch: Quota exceeded path", () => {
  it("should return 429 and NOT create order when quota is exhausted", async () => {
    await exhaustQuota(testUser)
    const response = await attemptCreateOrder(testToken, orderData)
    expect(response.status).toBe(429)
    expect(response.body.code).toBe("QUOTA_EXCEEDED")
    // Verify side effects: no order was created
    const orders = await getOrders(testUser)
    expect(orders.length).toBe(0)
  })
})
```

---

## 反模式（Anti-Patterns）

- 只测试 happy path 流程（漏掉失败终止状态）
- 在步骤之间重置共享状态（破坏状态串联）
- 孤立测试每个步骤而不验证累积状态
- 对含多个决策点的流程只用单个测试
- 对每个流程都应用 All-Combinations（应保留给关键路径）
- 在分支测试中不验证副作用（或副作用的不存在）

---

## 与其他标准的关系

- **test-completeness-dimensions**：维度 9（Flow Completeness）与维度 10（Branch Coverage）在此定义
- **behavior-driven-development**：BDD Scenario Outline 表格对应到决策表展开
- **mock-boundary**：流程测试必须遵守 mock boundary 规则（不 mock 自身模块逻辑）
- **e2e-testing**：旅程测试在 ST 或 E2E 级别运行；流程测试可在 IT 级别搭配真实 DB 运行

---

## 多门禁流程验证模型（Multi-Gate Flow Verification Model）

流程覆盖不是单一的发布前检查——它是横跨整个 SDLC 的**渐进式验证链**。有两个本质上不同的问题，必须在不同阶段回答：

| 验证类型 | 问题 | 执行者 | 时机 |
|------------------|----------|----------|--------|
| **覆盖（Coverage）** | 所有终止状态都测试了吗？ | 自动化 CI | Dev → Staging → Pre-UAT |
| **正确性（Correctness）** | 终止状态的定义正确吗？ | 人工 UAT | UAT 阶段 |

混淆这两者会把 UAT 周期浪费在 CI 早该发现的技术覆盖问题上。

### Gate 0 — PRD 签核（实现开始之前）

三项可测试性要素必须在写下任何一行代码之前写入 PRD。使用 `templates/requirement-template.md` 的 §2.4 与 §9.4：

| 要素 | PRD 章节 | 何时必须 |
|---------|-------------|---------------|
| 前置条件 + 有序步骤 | §2.4 | ≥ 3 步骤的流程 |
| 决策点列表 | §2.4 | 每一个分支条件 |
| 终止状态列表 | §2.4 | 所有不同的结束状态 |
| 决策表（Each-Choice） | §9.4 | 所有流程 |
| 升级到 All-Combinations | §9.4 | 认证 / 支付 / 安全 |
| UAT 验收脚本（预先填写） | §9.4 | PRD 批准之前 |

> **为什么在 PRD 阶段？** 测试工程师无法从只描述 happy path 的规格推导出分支覆盖。在测试设计阶段才发现缺失的决策点会浪费整整一个 sprint。

### Gate 1 — PR 合并（每个功能分支）

任何触及 ≥ 3 步骤流程的 PR 必须包含覆盖该 PR 所引入或修改之终止状态的自动化测试。若终止状态被加入 §2.4 而没有对应的测试，审查者应阻止合并。

### Gate 3 — Pre-UAT 部署（自动化 + QA Lead 签核）

CI 必须在 UAT 开始**之前**证明覆盖完整性。UAT 用于正确性验证，不是技术测试。

必需的 CI 检查：
- 所有决策表场景都有通过的自动化测试
- 没有任何终止状态缺乏测试覆盖
- 分支覆盖率 ≥ 90%（或项目自定义阈值）
- 认证 / 支付 / 安全流程的 All-Combinations 全部通过

> 未通过 Gate 3 就部署到 UAT，等于强迫业务利益相关者充当技术 QA——这是对 UAT 时间既昂贵又打击士气的滥用。

### Gate 4 — UAT 签核（业务正确性，上线前）

UAT 验证的是终止状态的**定义是否正确**地对应真实业务规则，而不是它们是否被覆盖。使用 §9.4 的 UAT 验收脚本（直接从决策表推导——不需要另外创建脚本）：

- 业务利益相关者逐行（终止状态）签核
- 若 UAT 揭示先前未定义的终止状态：将其加入 §2.4 + 决策表 + 自动化测试，重跑 Gate 3，然后恢复 UAT
- UAT 期间没有发现新的终止状态 = §2.4 足够周全的强烈信号

### 门禁模型总览

```
PRD Sign-off
    │ Gate 0: §2.4 + §9.4 complete (Decision Points, Terminal States,
    │         Decision Table, UAT script pre-filled)
    ▼
Implementation + PR Reviews
    │ Gate 1: Each PR covering a flow includes terminal state tests
    ▼
Staging / Integration
    │ (no formal gate — CI green is sufficient)
    ▼
Pre-UAT Deployment
    │ Gate 3: CI proves 100% terminal state coverage + branch coverage ≥ 90%
    ▼
UAT Execution
    │ Gate 4: Business sign-off on terminal state correctness
    │         New terminal states → back to Gate 3 before proceeding
    ▼
Production
```

---

## RQM 集成

Gate 3（Pre-UAT CI 覆盖门禁）必须产出 **`flow_gate_report.json`** 产物，供 Release Quality Manifest（`release-quality-manifest.md`，字段 `flow_gate_report`）消费。

### flow_gate_report.json Schema

```json
{
  "generated_at": "2026-05-05T04:00:00Z",
  "commit": "abc1234",
  "flows": [
    {
      "flow_id": "login-authentication",
      "spec_ref": "docs/specs/SPEC-001.md#2.4",
      "decision_points": 3,
      "terminal_states": 7,
      "gate_0_complete": true,
      "gate_1_pr_coverage": true,
      "gate_3": {
        "all_scenarios_green": true,
        "terminal_states_covered": 7,
        "terminal_states_defined": 7,
        "branch_coverage_pct": 94,
        "coverage_target": 90,
        "all_combinations_required": false,
        "status": "pass"
      },
      "gate_4_uat_signoff": true
    }
  ],
  "summary": {
    "total_flows": 5,
    "gate_0_complete": true,
    "gate_1_pr_coverage": true,
    "gate_3_ci_pass": true,
    "gate_4_uat_signoff": true,
    "status": "pass"
  }
}
```

### 生成脚本挂钩（Generation Script Hook）

在 CI 测试运行之后加入（Gate 3）：

```bash
# scripts/generate-flow-gate-report.sh
node scripts/generate-flow-gate-report.mjs \
  --coverage-report coverage/coverage-summary.json \
  --flow-specs "docs/specs/**/*.md" \
  --uat-signoffs ".release-readiness/*.md" \
  --output flow_gate_report.json
```

`summary.status` 字段会输入 `release-quality-manifest.yaml` 的 `flow_gate_report.status`。

---

## 快速参考检查清单

```
Flow: ___________________

□ Step 1 — Flow Identification
  □ Preconditions documented
  □ Ordered step sequence listed
  □ All decision points extracted
  □ All terminal states defined

□ Step 2 — Decision Table
  □ Decision table created
  □ Coverage strategy chosen (Each-Choice / Pairwise / All-Combinations)
  □ Critical flows (auth/payment/security) → All-Combinations

□ Step 3 — Journey Test Structure
  □ Happy path journey test (shared ctx, sequential steps)
  □ Each branch outcome has its own describe block
  □ Branch tests verify both response AND absence of side effects
  □ No beforeEach resetting ctx between steps
```
