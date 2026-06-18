---
source: ../../../core/flow-based-testing.md
source_version: 1.3.0
translation_version: 1.3.0
last_synced: 2026-06-10
source_hash: a8838e95f84e
status: stale
---

# 流程式測試（Flow-Based Testing）

> **Language**: [English](../../../core/flow-based-testing.md) | 繁體中文

**版本**: 1.3.0
**最後更新**: 2026-05-05
**適用範圍**: 所有具備多步驟工作流程的軟體專案
**Scope**: universal
**產業標準**: ISO/IEC/IEEE 29119-4（測試技術）、ISTQB Foundation Syllabus
**參考資料**: Decision Table Testing（ISTQB）、Pairwise Testing、State Transition Testing

---

## 目的

本文件定義測試多步驟流程的系統化方法論。它填補了 AC 中心式測試（孤立驗證個別行為）與流程層級測試（驗證帶有累積狀態與分支覆蓋的序列行為）之間的落差。

---

## 核心問題：AC 中心式 vs. 流程中心式測試

AC 中心式測試驗證每個驗收條件在孤立情況下可正常運作。然而，它們會漏掉兩類關鍵 bug：

1. **步驟互動 bug**：只有當 Step 1 的輸出成為 Step 2 的輸入時才會顯現的 bug
2. **分支覆蓋缺口**：從未以所有可能值演練過的決策點

**範例**：某 pipeline 有 8 個步驟。每個 AC 都獨立通過。但當 Step 3 的配額檢查依賴 Step 1 與 Step 2 累積的狀態時，這個互動從未被測試到。

---

## 三步驟流程分解

### Step 1: 流程辨識（Flow Identification）

在撰寫任何測試程式碼之前，先記錄：

- **前置條件（Preconditions）**：系統的初始狀態
- **步驟序列（Step sequence）**：依序排列的動作清單（Step 1 → Step N）
- **決策點（Decision points）**：流程中的每一個 if/else/條件
- **終止狀態（Terminal states）**：所有可能的結束狀態（成功 + 每一種不同的失敗）

### Step 2: 決策表展開（Decision Table Expansion）

針對每個決策點，列出所有可能的值。然後套用覆蓋策略：

| 策略 | 使用時機 | 場景數量 |
|----------|-------------|---------------|
| **Each-Choice**（最小） | 低風險流程、快速回饋 | 各唯一值的總和 |
| **Pairwise** | 中風險流程 | ~N × max_values |
| **All-Combinations** | 認證、付款、安全 | 各值數量的乘積 |

**決策表範例**：

| 決策點 | 值 |
|----------------|--------|
| Authorization | valid / expired / missing |
| Quota | sufficient / exceeded |
| External Service | available / timeout / error |

Each-Choice 最小值：3 + 2 + 3 = 8 個場景（相較於團隊實際上通常只寫 1-2 個）。

### Step 3: 旅程測試結構（Journey Test Structure）

以共享狀態串接（shared state threading）撰寫測試——以 `ctx` 物件跨步驟累積狀態：

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

- 只測試 happy path 流程（漏掉失敗終止狀態）
- 在步驟之間重設共享狀態（破壞狀態串接）
- 孤立測試每個步驟而不驗證累積狀態
- 對含多個決策點的流程只用單一測試
- 對每個流程都套用 All-Combinations（應保留給關鍵路徑）
- 在分支測試中不驗證副作用（或副作用的不存在）

---

## 與其他標準的關係

- **test-completeness-dimensions**：維度 9（Flow Completeness）與維度 10（Branch Coverage）在此定義
- **behavior-driven-development**：BDD Scenario Outline 表格對應到決策表展開
- **mock-boundary**：流程測試必須遵守 mock boundary 規則（不 mock 自身模組邏輯）
- **e2e-testing**：旅程測試在 ST 或 E2E 層級執行；流程測試可在 IT 層級搭配真實 DB 執行

---

## 多閘門流程驗證模型（Multi-Gate Flow Verification Model）

流程覆蓋不是單一的發布前檢查——它是橫跨整個 SDLC 的**漸進式驗證鏈**。有兩個本質上不同的問題，必須在不同階段回答：

| 驗證類型 | 問題 | 執行者 | 時機 |
|------------------|----------|----------|--------|
| **覆蓋（Coverage）** | 所有終止狀態都測試了嗎？ | 自動化 CI | Dev → Staging → Pre-UAT |
| **正確性（Correctness）** | 終止狀態的定義正確嗎？ | 人工 UAT | UAT 階段 |

混淆這兩者會把 UAT 週期浪費在 CI 早該抓到的技術覆蓋問題上。

### Gate 0 — PRD 簽核（實作開始之前）

三項可測試性要素必須在寫下任何一行程式碼之前寫入 PRD。使用 `templates/requirement-template.md` 的 §2.4 與 §9.4：

| 要素 | PRD 章節 | 何時必須 |
|---------|-------------|---------------|
| 前置條件 + 有序步驟 | §2.4 | ≥ 3 步驟的流程 |
| 決策點清單 | §2.4 | 每一個分支條件 |
| 終止狀態清單 | §2.4 | 所有不同的結束狀態 |
| 決策表（Each-Choice） | §9.4 | 所有流程 |
| 升級到 All-Combinations | §9.4 | 認證 / 付款 / 安全 |
| UAT 驗收腳本（預先填寫） | §9.4 | PRD 核准之前 |

> **為什麼在 PRD 階段？** 測試工程師無法從只描述 happy path 的規格推導出分支覆蓋。在測試設計階段才發現缺漏的決策點會浪費整整一個 sprint。

### Gate 1 — PR 合併（每個功能分支）

任何觸及 ≥ 3 步驟流程的 PR 必須包含覆蓋該 PR 所引入或修改之終止狀態的自動化測試。若終止狀態被加入 §2.4 而沒有對應的測試，審查者應阻擋合併。

### Gate 3 — Pre-UAT 部署（自動化 + QA Lead 簽核）

CI 必須在 UAT 開始**之前**證明覆蓋完整性。UAT 用於正確性驗證，不是技術測試。

必要的 CI 檢查：
- 所有決策表場景都有通過的自動化測試
- 沒有任何終止狀態缺乏測試覆蓋
- 分支覆蓋率 ≥ 90%（或專案自定義門檻）
- 認證 / 付款 / 安全流程的 All-Combinations 全數通過

> 未通過 Gate 3 就部署到 UAT，等於強迫業務利害關係人充當技術 QA——這是對 UAT 時間既昂貴又打擊士氣的濫用。

### Gate 4 — UAT 簽核（業務正確性，上線前）

UAT 驗證的是終止狀態的**定義是否正確**地對應真實業務規則，而不是它們是否被覆蓋。使用 §9.4 的 UAT 驗收腳本（直接從決策表推導——不需要另外建立腳本）：

- 業務利害關係人逐列（終止狀態）簽核
- 若 UAT 揭露先前未定義的終止狀態：將其加入 §2.4 + 決策表 + 自動化測試，重跑 Gate 3，然後恢復 UAT
- UAT 期間沒有發現新的終止狀態 = §2.4 足夠周延的強烈訊號

### 閘門模型總覽

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

## RQM 整合

Gate 3（Pre-UAT CI 覆蓋閘門）必須產出 **`flow_gate_report.json`** 產物，供 Release Quality Manifest（`release-quality-manifest.md`，欄位 `flow_gate_report`）消費。

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

### 產生腳本掛鉤（Generation Script Hook）

在 CI 測試執行之後加入（Gate 3）：

```bash
# scripts/generate-flow-gate-report.sh
node scripts/generate-flow-gate-report.mjs \
  --coverage-report coverage/coverage-summary.json \
  --flow-specs "docs/specs/**/*.md" \
  --uat-signoffs ".release-readiness/*.md" \
  --output flow_gate_report.json
```

`summary.status` 欄位會餵入 `release-quality-manifest.yaml` 的 `flow_gate_report.status`。

---

## 快速參考檢查清單

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
