---
source: ../../../core/full-coverage-testing.md
source_version: 1.1.0
translation_version: 1.1.0
last_synced: 2026-07-23
source_hash: 8ca921c68533
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

## 遷移錯誤路徑完整性（XSPEC-288）

> 屬於 [XSPEC-284](https://github.com/AsiaOstrich/universal-dev-standards) 9 軸遷移完整性矩陣的**軸⑨（錯誤路徑）**。上述三路徑模型要求**每個函式**都有錯誤路徑；本節新增**遷移專屬**保證——legacy 的錯誤/降級/fallback 分支被**系統性**移植，而非僅抽樣。

### 為何三路徑模型對遷移不夠

每函式錯誤路徑要求與 XSPEC-201 的錯誤路徑快照，只驗你**想到要列舉**的錯誤案例。重寫時 happy path 因有明確需求而被移植，而錯誤分支——散落於 `try/catch` 階層、自訂例外階層、特定錯誤碼、降級 fallback——**被整批靜默遺漏**。通過的錯誤路徑抽樣**不證明沒有任何分支被漏**（與 #134 同源盲區，只是發生在錯誤路徑層）。本節是快照機制之上的**系統性列舉 + gap 分析**層。

### 步驟 1 — 機械化 legacy 例外/錯誤碼清單（derive，R1）

**機械化**列舉 legacy 錯誤面，不靠人腦回憶：

| 來源 | 推導出 |
|------|--------|
| `catch`／`except`／`rescue` 區塊（grep） | 每個捕捉的例外型別 + handler |
| 自訂例外／錯誤類階層 | 宣告的錯誤分類法 |
| 錯誤／狀態碼（HTTP status、app 錯誤碼、錯誤 enum） | 回應碼面 |
| 錯誤回應形狀（serializer、錯誤 DTO） | on-the-wire 錯誤契約 |

擷取的清單即**錯誤路徑待驗清單**——來自 artifact 而非人腦回憶。

### 步驟 2 — 系統性遺漏分支 gap 分析（oracle，R2）

對步驟 1 的**每條** legacy 錯誤分支，驗證新系統有對應 handler。無對映者標 `not_implemented`（XSPEC-199）並 **block**。產出涵蓋完整推導清單的**「遺漏錯誤分支」gap 報告**——而非僅抽樣通過。

```markdown
## Error-Path Gap Report — <module>

| Legacy branch (error type / code) | New-system handler | Status |
|-----------------------------------|--------------------|--------|
| PaymentDeclinedException → 402 | PaymentService.handleDecline | MAPPED |
| GatewayTimeout → retry+fallback | (none found) | not_implemented — BLOCK |
| ValidationError → 422 + field list | InputValidator | MAPPED |

**Branches: N total · M mapped · K not_implemented (block if K>0)**
```

### 步驟 3 — 降級／Fallback 對等（R3）

legacy 降級模式（外部服務失敗時的 fallback、重試、部分結果）因只在失敗時才執行而容易被漏。驗證新系統保留對應降級行為，避免「正常路徑一致、失敗時行為迥異」：

- [ ] 外部服務失敗的 **fallback** 行為與 legacy 一致
- [ ] **重試**策略（次數、backoff、放棄條件）與 legacy 一致
- [ ] **部分結果**處理與 legacy 一致（盡量回傳 vs all-or-nothing）
- [ ] **斷路器／逾時**降級與 legacy 一致

### 步驟 4 — 錯誤回應差分（oracle，R4）

把 [behavior-snapshot](behavior-snapshot.md) 對等與 XSPEC-284 R5 replay 延伸涵蓋**錯誤回應**，不只 happy-path 回應。比對新舊：**錯誤碼**（HTTP status、app 錯誤碼）、**訊息結構**（錯誤 DTO 形狀、欄位級錯誤）、各錯誤類的 **HTTP status** 對映。讓隱性錯誤路徑分歧在 cutover 自報，如同 happy-path 快照。

**Gate 時機**：pre-UAT（gap 分析 + 降級對等）+ cutover 前後（錯誤回應差分）。

### 重要性分級（範圍指引）

並非每條 legacy 錯誤分支都同等優先。依**生產實際觸發頻率**排序（呼應 #134「以生產為準」）：生產 log 中實際觸發過的分支優先對映；從未觸發的潛在分支較低優先但仍列入。高頻生產錯誤分支若無新系統對映即硬 block。

### 完整性宣告（矩陣對齊）

當本節宣告三件事——**清單來源**（步驟 1 機械化例外/錯誤碼清單）、**oracle**（步驟 2 系統性 gap 分析 + 步驟 4 錯誤回應差分）、**gate 時機**（pre-UAT + cutover 前後）——即滿足軸⑨。複用 XSPEC-201 錯誤路徑快照 + 上述三路徑模型——本節只新增系統性遺漏分支分析與錯誤回應差分，不重造測試框架。

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
- `flaky-test-management.md` — 間歇性失敗處理：會 flaky 的測試**不算**通過的測試。在覆蓋率數字被計入閘門之前，間歇性失敗必須依該標準被隔離（quarantine）／設定重試預算（retry-budget）／根因排除——否則「全覆蓋」會掩蓋非決定性的缺口。
- `behavior-snapshot.md` — 錯誤回應差分 oracle（遷移錯誤路徑完整性，軸⑨）
- `migration-assistant` skill — legacy 例外/錯誤碼 derive + 降級對等（XSPEC-288）
- XSPEC-178 — 完整規格與實作階段
- XSPEC-288 — 遷移錯誤路徑完整性（XSPEC-284 矩陣軸⑨）


**Scope**: universal
