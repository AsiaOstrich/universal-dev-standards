---
source: ../../../core/full-coverage-testing.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-06-10
source_hash: e05fa172a6ee
status: current
---

# 全覆蓋測試標準

> **Language**: [English](../../../core/full-coverage-testing.md) | 繁體中文

> **AI 最佳化版本**: `ai/standards/full-coverage-testing.ai.yaml`
> **XSPEC**: XSPEC-178
> **取代**: 金字塔門檻模型（UT≥80%、IT≥70%、E2E 僅 happy-path）

## 概述

全覆蓋測試（Full Coverage Testing）是為 AI 時代設計的行為完整性典範——在這個時代，產生測試的成本等同於產生程式碼的成本。傳統金字塔門檻假設測試撰寫成本高昂——這個假設已不再成立。

**核心原則**：每個 public 函式都必須測試全部三種行為路徑。覆蓋率以行為完整性衡量，而非百分比下限。CI 強制執行棘輪（ratchet）：覆蓋率只能上升，不能下降。

---

## 行為完整性模型

不以「80% 行覆蓋率」為要求，改為要求：

| 路徑 | 說明 | 範例 |
|------|-------------|---------|
| **Happy path** | 正常輸入產生正確輸出 | `calculateDiscount(100, 0.1) → 90` |
| **Edge case** | 邊界值不引發非預期錯誤 | `calculateDiscount(0, 1.0) → 0 without throwing` |
| **Error path** | 無效輸入引發明確錯誤或錯誤狀態 | `calculateDiscount(-1, 2.0) → throws ArgumentError` |

每個 public 函式都需要全部三種。這以質性的、行為驅動的要求，取代「業務邏輯 80%」的目標。

---

## 棘輪（Ratchet）CI 政策

- 目前的覆蓋率基準線即為最低可接受覆蓋率
- 任何降低覆蓋率的 PR 都會被阻擋合併
- 覆蓋率提升時，合併後自動更新基準線
- 沒有固定百分比下限——今天達到的覆蓋率就是明天的下限

```bash
# Stored in .coverage-baseline.json
{ "line": 91.3, "branch": 88.7, "timestamp": "2026-05-06" }

# PR regression → blocked
Coverage regression: 91.3% → 89.1%. Ratchet threshold violated.

# PR improvement → baseline updated
Coverage improved: 91.3% → 92.0%. New baseline set.
```

---

## 反假測試規則

### 禁止：恆真斷言（Tautology Assertions）

無論行為如何都會通過的斷言，提供的是虛假覆蓋率。

```typescript
// ❌ FORBIDDEN — always passes, tests nothing
expect(true).toBe(true)
expect(result).toBeDefined()  // without specific value

// ✅ REQUIRED — verifies actual behavior
expect(result).toBe(90)
expect(result).toEqual({ discount: 10, total: 90 })
```

### 禁止：Mock 核心業務邏輯

Mock 自己的程式碼，意味著業務邏輯從未真正執行。

```typescript
// ❌ FORBIDDEN — business logic never runs
jest.mock('./orderService', () => ({ calculateTotal: jest.fn(() => 100) }))

// ✅ ALLOWED — mock only external dependencies
// MOCK: External Stripe API — no sandbox available in CI
jest.mock('./payment-gateway', () => ({ charge: jest.fn().mockResolvedValue({ id: 'ch_test' }) }))
```

### 必要：Mock 原因註解

每個 mock 都必須說明為何該依賴不能使用真實實作。

```typescript
// ❌ FORBIDDEN — no explanation
jest.mock('./payment-gateway')

// ✅ REQUIRED — explicit reason
// MOCK: External payment gateway — network dependency, no sandbox in CI
jest.mock('./payment-gateway', () => ({ ... }))
```

### Mock 邊界：哪些可以 Mock

| ✅ 允許 Mock | ❌ 禁止 Mock |
|-------------------|---------------------|
| 外部 HTTP API（金流、OAuth） | 核心業務計算函式 |
| 硬體介面（感測器、GPIO） | 自己的 service 層方法 |
| 無測試模式的第三方 SDK | 資料庫查詢（改用 in-memory SQLite） |
| Docker daemon | 自己的工具函式 |

---

## STUB 標記協議

所有暫時性/占位實作都必須（MUST）以標準 STUB 標記標示。此規則由 pre-push hooks 與 deploy.sh 強制執行。

### 標記一個 STUB

```typescript
// WARNING: STUB — Remove before UAT
async function validatePayment(card: Card): Promise<boolean> {
  return true; // Always approve — replace with real Stripe call
}
```

### 豁免真正的限制

當某個依賴確實無法被測試時（硬體、無 sandbox 的線上 API）：

```typescript
// COVERAGE_EXEMPT: Hardware temperature sensor — no simulation available in CI
async function readTemperature(): Promise<number> {
  return hardwareSensor.read();
}
```

豁免原因必須（MUST）非空且具體。

### 部署閘門

| 環境 | 存在 STUB | 動作 |
|-------------|-------------|--------|
| Feature branch push | 是 | ⚠️ 警告（不阻擋） |
| `main` branch push | 是 | ❌ 阻擋 |
| Staging deploy | 是 | ⚠️ 警告（不阻擋） |
| UAT deploy | 是 | ❌ 阻擋 |
| Production deploy | 是 | ❌ 阻擋（critical log） |

---

## AC 可追溯性

使用 `@ac` JSDoc 標籤將每個測試連結到其驗收標準（Acceptance Criteria）：

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

CI 會回報 AC 覆蓋率。若超過 20% 的 AC 沒有 `@ac` 標籤的測試，會顯示警告。

---

## 從金字塔模型遷移

若你的專案先前使用金字塔門檻：

1. **刪除** `jest.config.js` / `vitest.config.ts` 中任何硬編碼的覆蓋率門檻（`coverageThreshold` 選項）
2. **安裝** `.coverage-baseline.json`，以目前的覆蓋率作為棘輪起點
3. **新增** `scripts/check-coverage-ratchet.sh` 到 CI
4. **新增** `scripts/check-stubs.sh` 到 deploy.sh 與 pre-push hook
5. **新增** `scripts/check-anti-fake-tests.sh` 到 pre-commit 或 CI

棘輪從你目前的覆蓋率開始。從那一刻起，它只能上升。

---

## 相關標準

- `testing.ai.yaml` — 測試結構、FIRST 原則、AAA 模式（金字塔門檻在此已棄用）
- `unit-testing.ai.yaml` — 單元測試範圍與組織
- `integration-testing.ai.yaml` — 整合測試模式
- `deployment-standards.ai.yaml` — 部署閘門需求
- XSPEC-178 — 完整規格與實作階段


**Scope**: universal
