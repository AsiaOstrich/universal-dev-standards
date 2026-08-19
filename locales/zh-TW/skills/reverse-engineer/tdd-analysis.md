---
source: ../../../../skills/reverse-engineer/tdd-analysis.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-01-19
status: current
---

# TDD 分析工作流程指南

**版本**: 1.0.0
**最後更新**: 2026-01-19

> **語言**: [English](../../../../skills/reverse-engineer/tdd-analysis.md) | 繁體中文

本指南提供針對 BDD 場景分析測試覆蓋率並識別缺口的詳細工作流程。

---

## 概覽

TDD 分析將 BDD 場景映射到現有的單元測試，計算覆蓋率並識別缺口。這確保驗收標準在單元測試層級得到驗證。

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        TDD 分析管道                                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌───────────┐   ┌───────────┐   ┌───────────┐   ┌───────────┐        │
│  │  Feature  │──▶│   解析    │──▶│   掃描    │──▶│   匹配    │        │
│  │   檔案    │   │   場景    │   │   測試    │   │   演算法  │        │
│  └───────────┘   └───────────┘   └───────────┘   └─────┬─────┘        │
│                                                        │               │
│                                                        ▼               │
│                       ┌───────────────────────────────────┐            │
│                       │         計算信心度               │            │
│                       │   [已確認] [推斷] [無]           │            │
│                       └─────────────────┬─────────────────┘            │
│                                         │                              │
│                                         ▼                              │
│  ┌───────────┐   ┌───────────┐   ┌───────────┐                        │
│  │   動作    │◀──│  覆蓋率   │◀──│   缺口    │                        │
│  │   項目    │   │   報告    │   │   分析    │                        │
│  └───────────┘   └───────────┘   └───────────┘                        │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 階段 1：場景解析

### 1.1 從 Feature 檔案提取場景

將 Gherkin 場景解析為可分析的結構：

```markdown
## 已解析的場景

### features/auth.feature

| ID | 場景名稱 | 步驟數 | 標籤 |
|----|----------|--------|------|
| S1 | 成功登入 | 4 | @confirmed |
| S2 | 登入失敗-密碼錯誤 | 3 | @inferred |
| S3 | 帳號鎖定 | 4 | @edge-case |

### 提取的關鍵字

| 場景 | 關鍵字 | 領域 |
|------|--------|------|
| S1: 成功登入 | login, success, credentials | auth |
| S2: 登入失敗 | login, failure, password, error | auth |
| S3: 帳號鎖定 | account, lock, attempts, security | auth |
```

### 1.2 建立場景索引

建立可搜尋的索引用於匹配：

```json
{
  "scenarios": [
    {
      "id": "auth.feature:S1",
      "name": "成功登入",
      "keywords": ["login", "success", "credentials", "user", "password"],
      "domain": "auth",
      "steps": [
        { "type": "Given", "text": "使用者在登入頁面" },
        { "type": "When", "text": "使用者輸入正確的 email 和密碼" },
        { "type": "Then", "text": "使用者應該看到首頁" }
      ],
      "tags": ["@confirmed"],
      "source": "features/auth.feature:12-18"
    }
  ]
}
```

---

## 階段 2：測試檔案掃描

### 2.1 偵測測試框架

從專案識別測試框架：

| 指標 | 框架 | 語言 |
|------|------|------|
| `jest.config.js` | Jest | JS/TS |
| `vitest.config.ts` | Vitest | JS/TS |
| `pytest.ini`、`pyproject.toml` | pytest | Python |
| `pom.xml` with JUnit | JUnit | Java |
| `*_test.go` | Go testing | Go |
| `Cargo.toml` with test | Rust testing | Rust |

### 2.2 掃描測試檔案

定位並解析測試檔案：

```markdown
## 測試檔案發現

### 偵測到的框架：Vitest

### 找到的檔案
| 路徑 | 測試數 | 領域（推斷） |
|------|--------|--------------|
| tests/auth.test.ts | 12 | auth |
| tests/cart.test.ts | 8 | cart |
| tests/checkout.test.ts | 15 | checkout |

### 測試結構分析

#### tests/auth.test.ts
```typescript
describe('AuthService', () => {
  describe('login', () => {
    it('should return token for valid credentials', () => {...});
    it('should throw error for invalid password', () => {...});
    it('should lock account after 5 attempts', () => {...});
  });
  describe('logout', () => {
    it('should invalidate session', () => {...});
  });
});
```

### 提取的測試索引
| 測試 ID | 測試名稱 | 關鍵字 | 路徑 |
|---------|----------|--------|------|
| T1 | should return token for valid credentials | token, valid, credentials | auth.test.ts:5 |
| T2 | should throw error for invalid password | error, invalid, password | auth.test.ts:12 |
| T3 | should lock account after 5 attempts | lock, account, attempts | auth.test.ts:20 |
```

---

## 階段 3：匹配演算法

### 3.1 匹配策略

套用多個策略並合併分數：

#### 策略 1：名稱相似度（權重：40%）

比較場景名稱與測試名稱：

```
場景: 成功登入 (關鍵字: 成功, 登入)
測試: should return token for valid credentials

翻譯映射:
- 成功 → success, valid
- 登入 → login, credentials

相似度計算:
- "valid" 匹配 "成功" 翻譯 → +20%
- "credentials" 匹配 "登入" 脈絡 → +15%
- 名稱相似度分數: 35%
```

#### 策略 2：關鍵字重疊（權重：30%）

匹配提取的關鍵字：

```
場景關鍵字: [login, success, credentials, user, password]
測試關鍵字: [token, valid, credentials, return]

重疊: [credentials]
重疊分數: 1/5 = 20%
加權: 20% × 0.30 = 6%
```

#### 策略 3：步驟-斷言映射（權重：20%）

匹配 Then 步驟到測試斷言：

```gherkin
Then 使用者應該看到首頁
```

```typescript
expect(response.redirect).toBe('/home');
expect(response.status).toBe(200);
```

斷言分析:
- "/home" 建議首頁 → 匹配 "首頁"
- 狀態 200 建議成功 → 匹配場景意圖
- 步驟-斷言分數: 70%
- 加權: 70% × 0.20 = 14%

#### 策略 4：檔案鄰近度（權重：10%）

測試檔案在相同領域：

```
場景領域: auth
測試檔案: tests/auth.test.ts

領域匹配: ✅
鄰近度分數: 100%
加權: 100% × 0.10 = 10%
```

### 3.2 信心度計算

合併加權分數：

```markdown
## 匹配結果: S1 → T1

| 策略 | 分數 | 權重 | 加權 |
|------|------|------|------|
| 名稱相似度 | 35% | 0.40 | 14% |
| 關鍵字重疊 | 20% | 0.30 | 6% |
| 步驟-斷言 | 70% | 0.20 | 14% |
| 檔案鄰近度 | 100% | 0.10 | 10% |
| **總計** | - | - | **44%** |

信心度等級: [推斷] (中等)
```

### 3.3 信心度門檻

| 總分 | 信心度等級 | 標籤 |
|------|------------|------|
| 85-100% | 高 | `[已確認]` |
| 60-84% | 中高 | `[推斷]` (高) |
| 40-59% | 中等 | `[推斷]` (中) |
| 20-39% | 低 | `[推斷]` (低) |
| 0-19% | 無 | `[未知]` |

---

## 階段 4：缺口分析

### 4.1 識別缺少的覆蓋

列出沒有匹配測試的場景：

```markdown
## 覆蓋缺口分析

### ❌ 無測試覆蓋

| 場景 | 功能 | 優先級 | 缺口原因 |
|------|------|--------|----------|
| 帳號鎖定 | auth.feature:45 | 🔴 高 | 找不到匹配的測試 |
| 購物車上限 | cart.feature:32 | 🟡 中 | 僅部分匹配 |

### 缺口分類

| 類型 | 數量 | 範例 |
|------|------|------|
| 完全沒有測試 | 2 | 帳號鎖定, 購物車上限 |
| 缺少邊界情況 | 3 | 空購物車, 無效 email, 逾時 |
| 缺少錯誤處理 | 4 | 登入錯誤, 付款失敗 |
```

### 4.2 優先級分配

根據以下因素決定測試優先級：

```markdown
## 優先級計算

| 因素 | 權重 | 高 | 中 | 低 |
|------|------|------|------|------|
| 安全影響 | 30% | 認證, 付款 | 用戶資料 | 顯示 |
| 用戶頻率 | 25% | 核心流程 | 常見 | 罕見 |
| 商業風險 | 25% | 營收 | 留存 | 次要 |
| 複雜度 | 20% | 高邏輯 | 中等 | 簡單 |

### 優先級結果

| 場景 | 安全 | 頻率 | 風險 | 複雜度 | 總計 | 優先級 |
|------|------|------|------|--------|------|--------|
| 帳號鎖定 | 90% | 20% | 80% | 60% | 62.5% | 🔴 高 |
| 購物車上限 | 30% | 60% | 40% | 40% | 42.5% | 🟡 中 |
```

### 4.3 測試建議

生成可執行的測試建議：

```markdown
## 建議的測試

### 🔴 高優先級

#### 1. 帳號鎖定測試
**場景**：帳號鎖定
**建議檔案**：tests/auth.test.ts
**建議測試**：
```typescript
describe('AuthService', () => {
  describe('account lockout', () => {
    it('should lock account after 5 failed attempts', async () => {
      // Arrange
      const user = await createTestUser();

      // Act - 5 次失敗嘗試
      for (let i = 0; i < 5; i++) {
        await authService.login(user.email, 'wrong-password');
      }

      // Assert
      const status = await authService.getAccountStatus(user.id);
      expect(status).toBe('locked');
    });

    it('should reset attempt count after successful login', async () => {
      // ...
    });
  });
});
```

**涵蓋**：S3 (帳號鎖定) 來自 auth.feature:45
**優先級**：🔴 高 (安全關鍵)
```

---

## 階段 5：覆蓋率報告生成

### 5.1 報告結構

```markdown
# BDD → TDD 覆蓋率報告

> 生成時間: 2026-01-19 14:30
> Feature 檔案: 3 個已分析
> 測試檔案: 5 個已掃描
> 匹配演算法: v1.0

---

## 📊 執行摘要

| 指標 | 值 | 狀態 |
|------|------|------|
| 總場景數 | 18 | - |
| 覆蓋 [已確認] | 10 (56%) | ✅ |
| 覆蓋 [推斷] | 5 (28%) | ⚠️ |
| 無覆蓋 | 3 (17%) | ❌ |
| **有效覆蓋率** | **83%** | - |

### 趨勢（如有歷史資料）
| 日期 | 覆蓋率 |
|------|--------|
| 2026-01-12 | 75% |
| 2026-01-19 | 83% ↑ |

---

## 📈 依功能覆蓋率

| 功能 | 場景數 | 已覆蓋 | 覆蓋率 |
|------|--------|--------|--------|
| auth.feature | 8 | 7 | 88% ✅ |
| cart.feature | 6 | 5 | 83% ✅ |
| checkout.feature | 4 | 3 | 75% ⚠️ |

---

## ✅ 已覆蓋場景

### [已確認] 直接匹配 (56%)

| BDD 場景 | 單元測試 | 信心度 | 來源 |
|----------|----------|--------|------|
| 成功登入 | test_login_success | 92% | auth.test.ts:25 |
| 登入失敗-密碼錯誤 | test_login_invalid_pwd | 88% | auth.test.ts:45 |
| 新增商品到購物車 | test_add_to_cart | 95% | cart.test.ts:12 |

### [推斷] 可能匹配 (28%)

| BDD 場景 | 單元測試 | 信心度 | 需要審查 |
|----------|----------|--------|----------|
| 更新購物車數量 | test_update_quantity | 65% | ⚠️ 驗證 |
| 移除購物車商品 | test_remove_item | 58% | ⚠️ 驗證 |

> ⚠️ [推斷] 項目應由開發人員審查

---

## ❌ 缺少覆蓋 (17%)

### 高優先級 🔴

| 場景 | 來源 | 建議測試 | 原因 |
|------|------|----------|------|
| 帳號鎖定 | auth.feature:45 | test_account_lockout | 安全關鍵 |

### 中優先級 🟡

| 場景 | 來源 | 建議測試 | 原因 |
|------|------|----------|------|
| 購物車超過上限 | cart.feature:32 | test_cart_max_limit | 邊界條件 |
| 結帳逾時處理 | checkout.feature:78 | test_checkout_timeout | 錯誤處理 |

---

## 📋 建議動作

### 立即（本 Sprint）
1. [ ] 新增 `test_account_lockout` 到 auth.test.ts
   - 安全關鍵功能
   - 估計工作量：2 小時

### 下個 Sprint
2. [ ] 與領域專家驗證 [推斷] 測試映射
3. [ ] 新增購物車上限的邊界測試
4. [ ] 新增逾時處理測試

### 待辦清單
5. [ ] 改善測試命名以利更好的自動匹配
6. [ ] 為複雜流程新增整合測試

---

## 🔗 可追溯性矩陣

| SPEC → BDD → TDD |
|------------------|
| SPEC-AUTH.md:42 → auth.feature:12 (成功登入) → auth.test.ts:25 ✅ |
| SPEC-AUTH.md:48 → auth.feature:24 (登入失敗) → auth.test.ts:45 ✅ |
| SPEC-AUTH.md:52 → auth.feature:45 (帳號鎖定) → ❌ 缺少 |
```

### 5.2 機器可讀輸出

```json
{
  "reportMeta": {
    "generated": "2026-01-19T14:30:00Z",
    "version": "1.0",
    "featureFiles": 3,
    "testFiles": 5
  },
  "summary": {
    "totalScenarios": 18,
    "coveredConfirmed": 10,
    "coveredInferred": 5,
    "noCoverage": 3,
    "effectiveCoverage": 0.83
  },
  "mappings": [
    {
      "scenario": {
        "id": "auth.feature:S1",
        "name": "成功登入",
        "source": "features/auth.feature:12"
      },
      "test": {
        "id": "auth.test.ts:T1",
        "name": "test_login_success",
        "source": "tests/auth.test.ts:25"
      },
      "confidence": 0.92,
      "level": "confirmed"
    }
  ],
  "gaps": [
    {
      "scenario": {
        "id": "auth.feature:S3",
        "name": "帳號鎖定",
        "source": "features/auth.feature:45"
      },
      "priority": "high",
      "reason": "security_critical",
      "suggestion": {
        "testName": "test_account_lockout",
        "file": "tests/auth.test.ts"
      }
    }
  ]
}
```

---

## 階段 6：動作項目生成

### 6.1 Sprint 就緒任務

生成可執行的任務：

```markdown
## 生成的 Sprint 任務

### 任務 1：新增帳號鎖定測試
- **類型**：單元測試
- **檔案**：tests/auth.test.ts
- **涵蓋**：S3 (帳號鎖定)
- **優先級**：🔴 高
- **估計**：2 小時
- **驗收標準**：
  - [ ] 測試 5 次失敗嘗試後鎖定帳號
  - [ ] 測試成功登入後重設計數
  - [ ] 測試鎖定持續時間（如適用）

### 任務 2：驗證購物車更新測試
- **類型**：審查
- **動作**：確認 test_update_quantity 涵蓋 BDD 場景
- **優先級**：🟡 中
- **估計**：30 分鐘
```

### 6.2 與問題追蹤器整合

```markdown
## GitHub Issues（草稿）

### Issue 1
**標題**：為帳號鎖定功能新增單元測試
**標籤**：test, security, high-priority
**內容**：
BDD 場景 `帳號鎖定` (auth.feature:45) 缺少單元測試覆蓋。

**驗收標準**：
- [ ] 新增 test_account_lockout 到 auth.test.ts
- [ ] 涵蓋 5 次失敗嘗試 → 鎖定
- [ ] 涵蓋成功後鎖定重設

**參考**：SPEC-AUTH.md:52, BDD 覆蓋率報告 2026-01-19
```

---

## 處理挑戰

### 挑戰 1：不同的測試命名慣例

```markdown
# 問題
場景: 使用者可以登入
測試: it('verifies authentication flow')

# 解決方案
1. 從兩者提取語意關鍵字
2. 對多語言使用翻譯映射
3. 降低信心度但仍然匹配
4. 標記供人類審查
```

### 挑戰 2：表格驅動測試

```typescript
test.each([
  ['valid', true],
  ['invalid', false],
])('login with %s credentials', (type, expected) => {...});
```

```markdown
# 分析
單一測試涵蓋多個場景：
- 成功登入 → 表格行 'valid'
- 登入失敗 → 表格行 'invalid'

將兩個場景標記為 [推斷]，引用共用測試
```

### 挑戰 3：整合 vs 單元測試

```markdown
# 分類
| 測試類型 | 覆蓋類型 | 權重 |
|----------|----------|------|
| 單元測試 | 直接 | 100% |
| 整合測試 | 部分 | 50% |
| E2E | 間接 | 25% |

# 分別報告但合併計算總覆蓋率
```

---

## CI/CD 整合

### GitHub Actions —— 目前無法腳本化

`uds reverse-tdd` 這個 CLI 指令不存在。覆蓋率缺口分析是以 **`reverse-tdd`
AI agent**（`uds agent install reverse-tdd`）提供——由你的 AI 工具互動式執行，
不是會吐出 `coverage.json` 的確定性腳本。本文件先前版本示範了一個呼叫不存在
CLI 指令的 GitHub Actions 步驟（XSPEC-383 R4，2026-08-19）。

下方僅為**示意**——展示若未來真的做出可腳本化的分析器，CI 整合可能長什麼樣，
不是現在就能貼進 workflow 使用的東西：

```yaml
# 示意用途——目前沒有可腳本化的等價物。
# 現況：改用 reverse-tdd agent 從你的 AI 工具互動式執行。
name: BDD Coverage Check

on: [pull_request]

jobs:
  coverage:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run BDD Coverage Analysis (尚未實作)
        run: |
          echo "目前沒有 CLI 等價物——互動式用法請見 reverse-tdd agent"
```

---

## 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| 1.0.0 | 2026-01-19 | 初始版本 |
