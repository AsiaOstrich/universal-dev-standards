---
source: ../../../core/cross-flow-regression.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-06-02
source_hash: 2f7bdbe6dc36
---

# 跨流程回歸（Cross-Flow Regression）

> **語言**：[English](../../../core/cross-flow-regression.md) | 繁體中文

**版本**：1.0.0
**最後更新**：2026-05-05
**適用範圍**：所有具有多個 user flow 或業務流程的軟體專案
**Scope**：universal
**業界標準**：ISTQB Advanced Test Analyst（Regression Test Strategy）
**參考資料**：`core/flow-based-testing.md`、`core/testing-standards.md`

---

## 目的

本標準定義跨流程回歸測試（cross-flow regression testing）——驗證對某一個 flow 的修改不會破壞其他 flow，並確保**多個 flow 的組合**在依序執行時行為正確。

### 與 `flow-based-testing.md` 的界線

| 標準 | 範圍 | 它能捕捉的問題 |
|----------|-------|----------------|
| `flow-based-testing.md`（Multi-Gate Model） | 單一 flow：Decision Points、Terminal States、Decision Table | flow 內部的分支覆蓋缺口 |
| **本標準** | 多個 flow：互動、共享狀態、依序組合 | flow 之間的污染、累積狀態 bug、跨 flow 的回歸 |

這兩者是互補而非重疊的關係。一個專案兩者都需要。

---

## 為何跨流程 bug 與眾不同

flow 內部測試（Multi-Gate）能證明「Login」處理了全部 7 種 terminal state。但它無法偵測：

- **狀態污染（State contamination）**：在一次失敗的「Create Order」（FAIL_QUOTA_EXCEEDED）之後，quota 計數器遭到破壞 → 即使 quota 已重置，下一次「Create Order」嘗試仍然失敗
- **共享資源衝突（Shared resource conflicts）**：「Report Generation」與「Data Export」同時執行時，破壞了共用的暫存目錄
- **依序相依（Sequential dependency）**：「Cancel Subscription」成功，但後續的「Reactivate」flow 假設訂閱仍然存在 → NullPointerException

---

## 跨流程 Test Suite 定義

### Tier-1：Critical User Journeys（CUJ，關鍵使用者旅程）

Critical User Journeys 是橫跨 ≥ 2 個 flow 的端到端序列，代表核心業務價值路徑。每一次 release 都必須包含一套 CUJ regression suite。

**CUJ 識別**：
1. 列出所有 flow（來自 requirement-template §2.4）
2. 找出共享狀態或常被依序執行的 pair／triple（成對／三組組合）
3. 標記業務關鍵的組合（purchase、onboarding、authentication + 下游流程）

**CUJ 覆蓋率要求**：

| 指標 | Tier-2 門檻（預設） | Tier-1 關鍵路徑 |
|--------|--------------------------|---------------------|
| CUJ 通過率 | ≥ 95% | 100% |
| 業務關鍵 flow 組合 | 100% | 100% |

### Tier-2：flow 變更時的回歸

當任何 flow 的 §2.4（Decision Points、Terminal States）被修改時，整套 CUJ suite 必須重新執行——而不只是執行被修改 flow 的測試。觸發邏輯：

```bash
# In CI: detect flow spec changes
changed_flows=$(git diff origin/main... --name-only | grep -E "requirement-template|SPEC.*\.md")
if [ -n "$changed_flows" ]; then
  npm run test:cross-flow-regression
fi
```

### Tier-3：並行與共享資源測試

針對具有並行使用者操作的專案：
- 兩位使用者同時執行相同的 flow
- Flow A 與 Flow B 共用一個寫入資源
- 長時間執行的 flow（非同步）與短 flow 的結果互動

---

## 測試結構

跨流程回歸測試採用跨 flow 的**依序狀態穿引（sequential state threading）**（延伸自 `flow-based-testing.md` 的 `ctx` 模式）：

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

### 跨流程失敗隔離

當一個跨流程測試失敗時，失敗訊息必須指出是**哪一個 flow** 引入了狀態破壞：

```typescript
// BAD: generic assertion
expect(result).toBe("success")

// GOOD: includes flow context
expect(result).toBe("success")  // Flow-3 depends on Flow-2 token being valid
                                 // If this fails, check Flow-2 email verification output
```

---

## 與 Release Gate 的整合

跨流程回歸是 `release-readiness-gate.md` 中的 **Dimension 6**（Tier-2）。

### 觸發條件

| 觸發時機 | 範圍 |
|---------|-------|
| 每一個 release candidate | 整套 CUJ suite |
| 修改任何 flow §2.4 的 PR | 整套 CUJ suite（merge 前） |
| 部署至 staging 後 | CUJ 的 smoke 子集 |
| 部署至 production 後 | 僅關鍵路徑 CUJ（canary） |

### Sign-off 的證據

```
| 6 | Cross-flow Regression | PASS | CUJ suite: 47/47 passed; 0 flow-interaction failures | QA Lead |
```

### WARN 門檻

- CUJ 通過率 ≥ 95% 但 < 100% → WARN，並需記錄具體失敗的 CUJ 並完成 root-cause（根因分析）
- CUJ 通過率 < 95% → FAIL（release 被封鎖）
- 業務關鍵組合失敗 → FAIL，無論整體通過率如何

---

## 反模式（Anti-Patterns）

- **只在 CI 緩慢時才跑跨流程測試**——依定義，它們必須在每一個 release candidate 上執行
- **孤立地測試每個 flow 卻稱之為「regression」**——flow 的孤立測試已由 Multi-Gate 涵蓋；跨流程測試必須具備 flow 之間的狀態相依關係
- **在不相關的 `describe` 區塊間重複使用同一個 `ctx` 物件**——每個 CUJ 都需要乾淨、隔離的 `ctx`；CUJ 之間的污染會掩蓋 bug
- **失敗訊息中缺乏 flow 歸屬（attribution）**——跨流程失敗難以除錯；務必指出是哪個上游 flow 產生了被破壞的狀態
- **把 CUJ 失敗當成 flaky（不穩定）**——跨流程狀態 bug 是確定性的；「flaky」的跨流程測試幾乎都是共享狀態破壞的徵兆

---

## 與其他標準的關係

- **`flow-based-testing.md`** —— flow 內部的 gate（跨流程的前置條件）
- **`testing-standards.md`** —— testing pyramid 中的 regression 層
- **`release-readiness-gate.md`** —— Dimension 6（Tier-2）
- **`e2e-testing.md`** —— CUJ 測試通常在 E2E 或 System Test 層級執行

---

## 版本歷史

| 版本 | 日期 | 變更 |
|---------|------|---------|
| 1.0.0 | 2026-05-05 | 初版發布：CUJ 定義、依序狀態穿引、release gate 標準、Tier-1/2/3 分類 |

---

## 授權

本標準依 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。

**來源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
