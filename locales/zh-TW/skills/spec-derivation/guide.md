---
source: ../../../../skills/spec-derivation/guide.md
source_version: 2.0.0
translation_version: 2.0.0
last_synced: 2026-06-10
source_hash: 8c89e24244a5
status: current
scope: partial
description: |
  從已核准的 SDD 規格推演 BDD 場景與 TDD 測試骨架。
  ATDD 驗收測試表格為選用輸出，供特殊需求使用。
  使用時機：規格已核准、開始 BDD/TDD 實作、產生測試結構。
  關鍵字：forward derivation、spec to test、BDD generation、TDD skeleton、test derivation、正向推演、規格轉測試、測試生成。
---

# 正向推演指南（Forward Derivation Guide）

> **語言**：[English](../../../../skills/spec-derivation/guide.md) | 繁體中文

**版本**：2.0.0
**最後更新**：2026-01-25
**適用範圍**：Claude Code Skills

> **核心標準**：此 skill 實作 [Forward Derivation Standards](../../core/forward-derivation-standards.md)。如需任何 AI 工具皆可存取的完整方法論文件，請參閱該核心標準。

---

## 目的

此 skill 引導你從已核准的 SDD 規格推演 BDD 場景與 TDD 測試骨架，並嚴格遵循反幻覺（Anti-Hallucination）標準。

> **注意**：ATDD 測試表格為選用，可透過 `/derive-atdd` 取得。BDD 場景本身即可作為可執行的驗收測試，因此在多數情境下 ATDD 表格屬於冗餘。

正向推演（Forward Derivation）是 [逆向工程（Reverse Engineering）](../reverse-engineer/SKILL.md) 的對稱對應：
- **逆向工程（Reverse Engineering）**：程式碼 → 規格
- **正向推演（Forward Derivation）**：規格 → 測試

## 快速參考

### 正向推演工作流程

```
┌─────────────────────────────────────────────────────────────────┐
│              Forward Derivation Workflow                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1️⃣  SPEC Parsing (AI Automated)                               │
│      ├─ Read approved specification                             │
│      ├─ Extract Acceptance Criteria (GWT or bullet)             │
│      └─ Validate SPEC structure and completeness                │
│                                                                 │
│  2️⃣  Derivation (AI Automated)                                 │
│      ├─ AC → BDD Gherkin scenarios                             │
│      ├─ AC → TDD test skeletons with TODOs                     │
│      └─ (Optional) AC → ATDD acceptance test tables            │
│                                                                 │
│  3️⃣  Human Review (Required)                                   │
│      ├─ Verify generated scenarios match AC intent              │
│      ├─ Fill in [TODO] sections                                │
│      └─ Refine step definitions if needed                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 指令總覽

| 指令 | 輸入 | 輸出 | 目的 |
|---------|-------|--------|---------|
| `/derive-bdd` | SPEC-XXX.md | .feature | AC → Gherkin 場景 |
| `/derive-tdd` | SPEC-XXX.md | .test.ts | AC → 測試骨架 |
| `/derive-all` | SPEC-XXX.md | .feature + .test.ts | 完整推演管線 |
| `/derive-atdd` | SPEC-XXX.md | acceptance.md | AC → 驗收測試表格（選用） |

## 核心原則

### 1. 受規格約束的生成（Spec-Bounded Generation）

**至關重要**：只推演規格中存在的內容。絕不新增超出 Acceptance Criteria 明確定義範圍的場景、測試或功能。

```
# Anti-Hallucination Rule
Input:  SPEC with N Acceptance Criteria
Output: Exactly N scenarios (BDD)
        Exactly N test groups (TDD)
        Exactly N acceptance tests (ATDD, if requested)

If output count ≠ input count → VIOLATION
```

### 2. 來源歸屬（Source Attribution）

每個生成的項目都「必須」包含 traceability：

```gherkin
# Generated from: specs/SPEC-001.md
# AC: AC-1

@SPEC-001 @AC-1
Scenario: User login with valid credentials
```

### 3. 推演標籤（Derivation Tags，來自統一標籤系統）

此 skill 使用 **推演標籤（Derivation Tags）** 從規格生成新內容。完整的標籤參考請見 [Anti-Hallucination Standards](../../../../core/anti-hallucination.md#certainty-classification-tags)。

| 標籤 | 使用時機 | 範例 |
|-----|----------|---------|
| `[Source]` | 直接取自 SPEC 的內容 | 功能標題、AC 文字 |
| `[Derived]` | 從 SPEC 內容轉換而來 | 由 bullet AC 轉成 GWT |
| `[Generated]` | AI 生成的結構 | 測試骨架 |
| `[TODO]` | 需要人工實作 | 斷言、step definition |

## 工作流程階段

### 階段 1：SPEC 解析

**輸入**：已核准的規格檔案
**輸出**：結構化的 Acceptance Criteria 清單

**動作**：
1. 讀取規格檔案
2. 辨識 Acceptance Criteria 區段
3. 解析 AC 格式（Given-When-Then 或 Bullet）
4. 驗證 AC 完整性

**驗證檢查清單**：
- [ ] SPEC 狀態為「Approved」或「Ready」
- [ ] Acceptance Criteria 區段存在
- [ ] 每個 AC 都有唯一識別碼（AC-1、AC-2 等）
- [ ] AC 格式可解析（GWT 或 bullet）

### 階段 2：BDD 推演

**輸入**：已解析的 Acceptance Criteria
**輸出**：Gherkin .feature 檔案

**轉換規則**：

| AC 格式 | 轉換方式 |
|-----------|----------------|
| Given-When-Then | 直接對應到 Gherkin |
| Bullet points | 使用 GWT 模式比對轉換 |
| Checklist | 條件 → Given、動作 → When、結果 → Then |

**範例**：
```markdown
# Input AC (Bullet)
- [ ] User can login with email and password
- [ ] Login shows error for invalid credentials
```

```gherkin
# Output BDD
@SPEC-001 @AC-1
Scenario: User login with email and password
  Given a user with valid credentials
  When the user submits login form
  Then the user is logged in successfully

@SPEC-001 @AC-2
Scenario: Login shows error for invalid credentials
  Given a user with invalid credentials
  When the user submits login form
  Then an error message is displayed
```

### 階段 3：TDD 推演

**輸入**：已解析的 Acceptance Criteria
**輸出**：測試骨架檔案

**動作**：
1. 為 SPEC 建立 describe 區塊
2. 為每個 AC 建立 describe 區塊
3. 以具描述性的名稱產生 it 區塊
4. 加入帶有 TODO 註解的 AAA 結構
5. 包含占位用的斷言（placeholder assertions）

**參數**：
| 參數 | 選項 | 預設 |
|-----------|---------|---------|
| `--lang` | typescript、javascript、python、java、go | typescript |
| `--framework` | vitest、jest、pytest、junit、go-test | vitest |

### 階段 4：ATDD 推演（選用）

> **注意**：ATDD 測試表格為選用。BDD 場景本身即可作為可執行的驗收測試。僅在以下情況使用 ATDD 表格：
> - 需要人工測試流程
> - 利害關係人偏好表格式的測試文件
> - 法規遵循要求特定的測試證據格式

**輸入**：已解析的 Acceptance Criteria
**輸出**：驗收測試表格文件

**動作**：
1. 為每個 AC 建立測試表格
2. 產生逐步動作欄位
3. 加入預期結果欄位
4. 包含 Pass/Fail 勾選框
5. 加入測試員簽核區段

### 階段 5：人工審查

**輸入**：生成的檔案
**輸出**：經審查與精修的檔案

**審查檢查清單**：
- [ ] 生成的場景符合 AC 意圖
- [ ] 沒有超出 AC 數量的多餘場景
- [ ] 來源歸屬正確
- [ ] 已標出 [TODO] 區段供實作
- [ ] step 語言為業務層級（非技術性）

## 輸出格式

### BDD Feature 檔案

```gherkin
# Generated from: specs/SPEC-001.md
# Generator: /derive-bdd v1.0.0
# Generated at: 2026-01-19T10:00:00Z

Feature: User Authentication
  [Source] From SPEC-001 Summary

  @SPEC-001 @AC-1 @happy-path
  Scenario: User login with valid credentials
    # [Source] From SPEC-001 AC-1
    Given a registered user with valid credentials
    When the user submits login form
    Then the user is redirected to dashboard

  @SPEC-001 @AC-2 @error-handling
  Scenario: Login fails with invalid credentials
    # [Source] From SPEC-001 AC-2
    Given a user with invalid credentials
    When the user submits login form
    Then an error message is displayed
```

### TDD 測試骨架

```typescript
/**
 * Tests for SPEC-001: User Authentication
 * Generated from: specs/SPEC-001.md
 * Generated at: 2026-01-19T10:00:00Z
 * AC Coverage: AC-1, AC-2
 */

describe('SPEC-001: User Authentication', () => {
  describe('AC-1: User login with valid credentials', () => {
    it('should redirect to dashboard on successful login', async () => {
      // Arrange
      // [TODO] Set up registered user with valid credentials

      // Act
      // [TODO] Submit login form

      // Assert
      // [TODO] Verify redirect to dashboard
      expect(true).toBe(true); // Placeholder
    });
  });

  describe('AC-2: Login fails with invalid credentials', () => {
    it('should display error message', async () => {
      // Arrange
      // [TODO] Set up user with invalid credentials

      // Act
      // [TODO] Submit login form

      // Assert
      // [TODO] Verify error message is displayed
      expect(true).toBe(true); // Placeholder
    });
  });
});
```

### ATDD 驗收測試表格（選用）

> 當需要 ATDD 測試表格時，透過 `/derive-atdd` 生成。

```markdown
# SPEC-001 Acceptance Tests

**Specification**: SPEC-001
**Generated**: 2026-01-19
**Status**: Pending

## AT-001: User login with valid credentials
**Source**: AC-1

| Step | Action | Expected | Pass/Fail |
|------|--------|----------|-----------|
| 1 | Navigate to login page | Login form displayed | [ ] |
| 2 | Enter valid credentials | Fields accept input | [ ] |
| 3 | Click Login | Form submitted | [ ] |
| 4 | Verify redirect | Dashboard displayed | [ ] |

**Tester**: _______________
**Date**: _______________
**Result**: [ ] Pass / [ ] Fail
```

## 與其他 Skill 的整合

### 與 /sdd（Spec-Driven Development）

1. 使用 `/sdd` 工作流程完成 SPEC
2. 透過審查取得 SPEC 核准
3. 執行 `/derive-all` 產生測試結構
4. 在 BDD/TDD 工作流程中使用生成的輸出

### 與 /bdd（Behavior-Driven Development）

1. 使用 `/derive-bdd` 產生 BDD 場景
2. 與利害關係人審查並精修場景
3. 使用 `/bdd` 繼續進行 BDD 構思
4. 實作 step definition

### 與 /tdd（Test-Driven Development）

1. 使用 `/derive-tdd` 產生 TDD 骨架
2. 在 [TODO] 區段填入實際的斷言
3. 以生成的測試結構進入 TDD Red 階段
4. 實作程式碼以讓測試通過

### 與整合式流程（Integrated Flow）

正向推演融入整合式流程（Integrated Flow）方法論：

```
spec-review (approved) → forward-derivation → discovery (BDD)
                              │
                              ├─→ .feature files for BDD
                              └─→ .test.ts skeletons for TDD

Optional: /derive-atdd → acceptance.md for manual testing
```

## 完整推演管線

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Complete Forward Derivation Pipeline                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   Approved SPEC                                                         │
│        │                                                                │
│        ▼                                                                │
│   /derive-all specs/SPEC-XXX.md                                        │
│        │                                                                │
│        ├─→ /derive-bdd                                                  │
│        │    └─→ features/SPEC-XXX.feature                              │
│        │                                                                │
│        └─→ /derive-tdd                                                  │
│             └─→ tests/SPEC-XXX.test.ts                                 │
│                                                                         │
│   Optional: /derive-atdd specs/SPEC-XXX.md                              │
│        └─→ acceptance/SPEC-XXX-acceptance.md                           │
│                                                                         │
│   Human Review                                                          │
│        │                                                                │
│        ├─→ Verify 1:1 AC mapping                                       │
│        ├─→ Fill [TODO] sections                                        │
│        └─→ Refine step definitions                                     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 使用範例

```bash
# Generate BDD scenarios
/derive-bdd specs/SPEC-001.md

# Generate TDD skeleton with Python/pytest
/derive-tdd specs/SPEC-001.md --lang python --framework pytest

# Generate all test structures
/derive-all specs/SPEC-001.md

# Preview without creating files
/derive-all specs/SPEC-001.md --dry-run

# Specify output directory
/derive-all specs/SPEC-001.md --output-dir ./generated
```

## 應避免的反模式（Anti-Patterns）

### ❌ 不要這樣做

1. **新增多餘場景**
   - 錯誤：SPEC 有 3 個 AC，卻生成 5 個場景
   - 正確：SPEC 有 3 個 AC，恰好生成 3 個場景

2. **從草稿 SPEC 推演**
   - 錯誤：對未核准的規格執行 `/derive-all`
   - 正確：只從已核准的規格推演

3. **略過來源歸屬**
   - 錯誤：場景沒有 @SPEC-XXX 標籤
   - 正確：每個場景都標上來源 SPEC 與 AC

4. **過度指定技術細節**
   - 錯誤：`Given database connection is established using PostgreSQL driver`
   - 正確：`Given user data exists in the system`

5. **把骨架當成已完成**
   - 錯誤：未填入 [TODO] 就使用生成的測試
   - 正確：執行測試前先填完所有 [TODO] 區段

## 最佳實踐

### 該做的（Do's）

- ✅ 只從已核准的規格推演
- ✅ 維持嚴格的 1:1 AC 對輸出對應
- ✅ 在所有輸出中包含來源歸屬
- ✅ 以 [TODO] 標記實作區段
- ✅ 與利害關係人審查生成的輸出
- ✅ 讓 step 語言保持在業務層級

### 不該做的（Don'ts）

- ❌ 新增超出 AC 定義範圍的場景
- ❌ 從草稿或未核准的規格推演
- ❌ 略過對生成輸出的人工審查
- ❌ 把生成的骨架當成完整的測試
- ❌ 移除來源歸屬註解
- ❌ 過度指定實作細節

---

## 配置偵測

此 skill 會自動偵測專案配置：

1. 檢查既有的 `specs/` 目錄結構
2. 從 package.json/pyproject.toml 偵測測試框架
3. 辨識偏好的輸出目錄
4. 配置語言專屬的範本

---

## 相關標準

- [Forward Derivation Standards](../../core/forward-derivation-standards.md) - **核心方法論標準（主要參考）**
- [Reverse Engineering Standards](../../core/reverse-engineering-standards.md) - 對稱對應
- [Spec-Driven Development](../../core/spec-driven-development.md) - 輸入規格格式
- [Behavior-Driven Development](../../core/behavior-driven-development.md) - BDD 輸出格式
- [Test-Driven Development](../../core/test-driven-development.md) - TDD 輸出用途
- [Anti-Hallucination Guidelines](../../core/anti-hallucination.md) - 生成合規性

---

## 版本歷史

| 版本 | 日期 | 變更 |
|---------|------|---------|
| 2.0.0 | 2026-01-25 | ATDD 從必要輸出改為選用輸出；/derive-all 現在只輸出 BDD + TDD |
| 1.1.0 | 2026-01-25 | 新增：對統一標籤系統的參考 |
| 1.0.0 | 2026-01-19 | 初始發布 |

---

## 授權

此 skill 以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 釋出。

**來源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
