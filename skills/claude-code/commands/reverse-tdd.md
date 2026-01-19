---
description: Analyze test coverage for BDD scenarios
allowed-tools: Read, Grep, Glob
argument-hint: "[feature file or test directory | Feature 檔案或測試目錄]"
---

# BDD → TDD Coverage Analysis | BDD → TDD 覆蓋率分析

Analyze existing unit tests against BDD scenarios to identify coverage gaps and generate actionable reports.

分析現有單元測試與 BDD 場景的對應關係，識別覆蓋率缺口並生成可執行報告。

## Workflow | 工作流程

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Parse Feature  │───▶│ Scan Test       │───▶│ Map Scenarios   │
│  Files          │    │ Files           │    │ to Tests        │
│  解析 Feature    │    │ 掃描測試檔案    │    │ 映射場景到測試  │
└─────────────────┘    └─────────────────┘    └────────┬────────┘
                                                       │
                                                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Generate       │◀───│ Calculate       │◀───│ Identify        │
│  Report         │    │ Coverage        │    │ Gaps            │
│  生成報告        │    │ 計算覆蓋率      │    │ 識別缺口        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Anti-Hallucination Compliance | 反幻覺合規

**CRITICAL**: All outputs MUST follow [Anti-Hallucination Standards](../../../core/anti-hallucination.md).

**關鍵**：所有輸出必須遵循[反幻覺標準](../../../core/anti-hallucination.md)。

### Certainty Labels | 確定性標籤

| Label | Use When | 使用時機 |
|-------|----------|---------|
| `[Confirmed]` | Test explicitly matches scenario name | 測試明確對應場景名稱 |
| `[Inferred]` | Test appears to cover scenario based on patterns | 測試似乎涵蓋場景（基於模式） |
| `[Unknown]` | Cannot determine coverage | 無法判斷覆蓋情況 |

## Steps | 步驟

### 1. Parse Feature Files | 解析 Feature 檔案

Extract scenarios from Gherkin files:

從 Gherkin 檔案提取場景：

- Scenario names and descriptions
- Given-When-Then steps
- Tags and metadata
- Examples (for Scenario Outlines)

### 2. Scan Test Files | 掃描測試檔案

Identify test files based on project patterns:

根據專案模式識別測試檔案：

| Pattern | Framework | Language |
|---------|-----------|----------|
| `*.test.ts`, `*.spec.ts` | Jest, Vitest | TypeScript |
| `*_test.py`, `test_*.py` | pytest | Python |
| `*Test.java` | JUnit | Java |
| `*_test.go` | Go testing | Go |
| `*.test.js`, `*.spec.js` | Jest, Mocha | JavaScript |

### 3. Map Scenarios to Tests | 映射場景到測試

Apply matching strategies:

套用匹配策略：

#### Strategy 1: Name Matching | 名稱匹配

```typescript
// Feature: 使用者認證
// Scenario: 成功登入

// Test file: auth.test.ts
describe('使用者認證', () => {
  it('成功登入', () => {...});  // [Confirmed] Direct match
});
```

#### Strategy 2: Keyword Extraction | 關鍵字提取

```typescript
// Scenario: User can add item to cart
// Keywords: add, item, cart

// Test file: cart.test.ts
it('should add item to empty cart', () => {...});  // [Inferred] Keywords match
```

#### Strategy 3: Step Matching | 步驟匹配

```typescript
// Given 使用者在登入頁面
// When 使用者輸入有效的帳號密碼
// Then 導向首頁

// Test extracts assertions matching "Then" steps
expect(response.redirect).toBe('/home');  // [Inferred] Assertion matches
```

### 4. Calculate Coverage | 計算覆蓋率

Generate coverage metrics:

生成覆蓋率指標：

```markdown
## Coverage Summary | 覆蓋率總覽

| Metric | Value | Status |
|--------|-------|--------|
| Total Scenarios | 18 | - |
| Covered [Confirmed] | 12 | ✅ |
| Covered [Inferred] | 3 | ⚠️ |
| Missing Coverage | 3 | ❌ |
| **Coverage Rate** | **83%** | - |
```

### 5. Identify Gaps | 識別缺口

List scenarios without test coverage:

列出沒有測試覆蓋的場景：

```markdown
## ❌ Missing Test Coverage | 缺少測試覆蓋

| Scenario | Feature File | Priority | Suggested Test |
|----------|--------------|----------|----------------|
| 帳號鎖定 | auth.feature:45 | 🔴 High | `test_account_lockout` |
| 購物車上限 | cart.feature:32 | 🟡 Medium | `test_cart_max_items` |
| 結帳逾時 | checkout.feature:78 | 🟡 Medium | `test_checkout_timeout` |
```

### 6. Generate Report | 生成報告

Output comprehensive coverage report:

輸出完整的覆蓋率報告。

## Output Format | 輸出格式

### Coverage Report Template | 覆蓋率報告模板

```markdown
# BDD → TDD 覆蓋率報告

> Generated: YYYY-MM-DD HH:mm
> Feature Files: N files analyzed
> Test Files: M files scanned

---

## 📊 總覽 | Summary

| Metric | Value |
|--------|-------|
| 場景總數 | 18 |
| 有測試覆蓋 | 15 (83%) |
| 缺少測試 | 3 (17%) |
| [Confirmed] 覆蓋 | 12 |
| [Inferred] 覆蓋 | 3 |

---

## ✅ 已覆蓋場景 | Covered Scenarios

### [Confirmed] 明確對應

| BDD 場景 | 單元測試 | 來源 |
|----------|---------|------|
| 成功登入 | `test_login_success` | auth.test.ts:25 |
| 登入失敗-密碼錯誤 | `test_login_invalid_password` | auth.test.ts:45 |
| 新增商品到購物車 | `test_add_to_cart` | cart.test.ts:12 |

### [Inferred] 推斷對應

| BDD 場景 | 可能對應測試 | 來源 | 匹配信心 |
|----------|-------------|------|---------|
| 更新購物車數量 | `test_update_quantity` | cart.test.ts:35 | 85% |
| 移除購物車商品 | `test_remove_item` | cart.test.ts:48 | 75% |

> ⚠️ [Inferred] 項目需要人工確認

---

## ❌ 缺少測試 | Missing Tests

| BDD 場景 | 建議測試名稱 | 優先級 | 理由 |
|----------|-------------|--------|------|
| 帳號鎖定 | `test_account_lockout` | 🔴 高 | 安全性關鍵功能 |
| 購物車超過上限 | `test_cart_max_limit` | 🟡 中 | 邊界條件 |
| 結帳逾時處理 | `test_checkout_timeout` | 🟡 中 | 錯誤處理 |

---

## 📋 建議行動 | Recommended Actions

### 高優先級 (立即處理)
1. 為「帳號鎖定」場景新增單元測試
   - File: `tests/auth.test.ts`
   - Test: `it('should lock account after 5 failed attempts')`

### 中優先級 (下次 Sprint)
2. 確認 [Inferred] 測試是否正確對應 BDD 場景
3. 為「購物車超過上限」新增邊界測試

---

## 🔗 來源追溯 | Source References

| Feature File | Line | Scenario |
|--------------|------|----------|
| features/auth.feature | 12 | 成功登入 |
| features/auth.feature | 24 | 登入失敗-密碼錯誤 |
| features/cart.feature | 8 | 新增商品到購物車 |
```

## Usage Examples | 使用範例

```bash
# Analyze single feature file
/reverse-tdd features/auth.feature

# Analyze all features in directory
/reverse-tdd features/

# Specify test directory
/reverse-tdd features/auth.feature --tests tests/unit/

# Output report to file
/reverse-tdd features/ --output reports/coverage.md

# Focus on missing coverage only
/reverse-tdd features/ --missing-only

# Include confidence scores
/reverse-tdd features/ --show-confidence
```

## Matching Algorithms | 匹配演算法

### Confidence Scoring | 信心評分

```
Score Calculation:
- Name exact match: +50 points
- Keyword overlap: +10 points per keyword
- Assertion match: +20 points per step
- File proximity: +10 points (same directory)

Confidence Levels:
- 90-100%: [Confirmed]
- 70-89%:  [Inferred] (High)
- 50-69%:  [Inferred] (Medium)
- <50%:    [Unknown]
```

### Test Pattern Detection | 測試模式偵測

```typescript
// Pattern 1: BDD-style test
describe('User Authentication', () => {
  describe('successful login', () => {
    it('should redirect to home page', () => {...});
  });
});

// Pattern 2: Flat test
test('user can login successfully', () => {...});

// Pattern 3: Table-driven test
test.each([
  ['valid', true],
  ['invalid', false],
])('login with %s credentials returns %s', (type, result) => {...});
```

## Integration | 整合

### Pipeline Integration | 管道整合

```bash
# Complete reverse engineering pipeline
/reverse-spec src/auth/           # → specs/SPEC-AUTH.md
/reverse-bdd specs/SPEC-AUTH.md   # → features/auth.feature
/reverse-tdd features/auth.feature # → Coverage report
```

### With /tdd Command | 與 /tdd 命令整合

After generating coverage report:

生成覆蓋率報告後：

1. Use `/tdd` to implement missing tests following Red-Green-Refactor
2. Re-run `/reverse-tdd` to verify coverage improvement
3. Update BDD scenarios if tests reveal new requirements

### CI/CD Integration | CI/CD 整合

```yaml
# Example GitHub Actions workflow
- name: BDD Coverage Check
  run: |
    uds reverse-tdd features/ --output coverage-report.md
    # Fail if coverage below threshold
    grep -q "Coverage Rate.*[89][0-9]%" coverage-report.md
```

## Error Handling | 錯誤處理

### No Feature Files Found

```markdown
⚠️ Warning: No .feature files found in specified path

Suggestions:
1. Check file path is correct
2. Use /reverse-bdd first to generate feature files
3. Verify features/ directory exists
```

### No Test Files Found

```markdown
⚠️ Warning: No test files found matching project patterns

Detected project type: TypeScript/Node.js
Expected patterns: *.test.ts, *.spec.ts

Suggestions:
1. Check tests/ directory structure
2. Specify test directory: /reverse-tdd features/ --tests src/__tests__/
```

## Reference | 參考

- Full workflow guide: [tdd-analysis.md](../reverse-engineer/tdd-analysis.md)
- TDD standards: [core/test-driven-development.md](../../../core/test-driven-development.md)
- Testing pyramid: [testing-guide/](../testing-guide/)
- Anti-hallucination: [core/anti-hallucination.md](../../../core/anti-hallucination.md)
