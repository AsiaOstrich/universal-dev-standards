---
source: ../../../core/structured-task-definition.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-04-22
status: current
---

# 結構化任務定義標準

> **語言**: [English](../../../core/structured-task-definition.md) | 繁體中文

**版本**: 1.0.0
**最後更新**: 2026-03-17
**適用性**: 所有使用 AI 輔助開發的專案
**範圍**: 通用 (Universal)
**產業標準**: 靈感來自 GSD (Get Shit Done) 任務結構
**參考**: [GSD](https://github.com/gsd-build/get-shit-done)

---

## 摘要

結構化任務定義確保每個 AI 任務都包含可靠執行所需的最低上下文。透過要求四個必填欄位 — `read_first`、`action`、`acceptance_criteria` 和 `verification` — 本標準防止幻覺、消除歧義，並確保每個任務結果都可客觀驗證。

---

## 快速參考

| 面向 | 說明 |
|------|------|
| **核心原則** | 每個任務必須有依據、具體、可測試且可驗證 |
| **必填欄位** | `read_first`、`action`、`acceptance_criteria`、`verification` |
| **防幻覺** | `read_first` 在執行前建立事實基礎 |
| **防歧義** | `action` 指定確切的檔案、行號和操作 |
| **防遺漏** | `acceptance_criteria` 使用 GWT 格式確保完整性 |
| **防主觀** | `verification` 使用可執行命令，而非主觀判斷 |

---

## 四個必填欄位

### 1. `read_first` — 建立事實基礎

在執行任務之前必須讀取的檔案清單。這防止 AI 對程式碼結構、API 簽名或專案慣例進行幻覺。

**目的**: 從實際程式碼建立準確的心智模型，而非基於假設。

**格式**:
```yaml
read_first:
  - path: src/auth/login.js
    reason: Contains current login implementation
  - path: tests/auth/login.test.js
    reason: Existing test patterns to follow
  - path: docs/specs/SPEC-042.md
    reason: Approved specification for this change
```

**規則**:
- 所有列出的檔案必須存在（在任務執行前驗證）
- 同時包含實作檔案及其測試
- 包含相關的規格文件（如果 SDD 已啟用）
- 包含影響行為的配置檔案

### 2. `action` — 具體步驟

包含確切檔案路徑和行號引用的具體、明確步驟清單。消除模糊指令，如「改進錯誤處理」或「新增驗證」。

**目的**: 移除關於做什麼和在哪裡做的所有歧義。

**格式**:
```yaml
action:
  - step: 1
    file: src/auth/login.js
    operation: modify
    location: "lines 42-58 (validateCredentials function)"
    description: Add rate limiting check before credential validation
    details: |
      Insert a call to rateLimiter.check(req.ip) before the
      existing validateCredentials() call. If rate limit exceeded,
      throw RateLimitError with 429 status.
  - step: 2
    file: tests/auth/login.test.js
    operation: add
    location: "after line 120 (end of 'validation' describe block)"
    description: Add rate limiting test cases
```

**規則**:
- 每個步驟指定單一檔案和操作
- 操作類型為：`add`、`modify`、`delete`、`move`、`rename`
- 行號為近似值（可能會移動），但提供上下文
- 不應有「做任何看起來合適的事」這類步驟

### 3. `acceptance_criteria` — 可衡量的完成條件

以 Given/When/Then 格式定義任務何時完成的條件。每個條件對應一個可驗證的結果。

**目的**: 每個條件都是可測試的 — 沒有「看起來可以運作」的空間。

**格式**:
```yaml
acceptance_criteria:
  - id: AC-1
    given: A user has made 5 login attempts in the last minute
    when: They attempt a 6th login
    then: The system returns HTTP 429 with "Rate limit exceeded" message
  - id: AC-2
    given: A user has not exceeded the rate limit
    when: They attempt login with valid credentials
    then: Login succeeds as before (no regression)
```

**規則**:
- 使用 GWT 格式（與 SDD 和 BDD 標準一致）
- 每個 AC 必須可獨立驗證
- 包含回歸條件（現有行為得以保留）
- 為可追溯性編號條件（AC-1、AC-2 等）

### 4. `verification` — 可執行檢查

客觀驗證任務已完成的命令或檢查。使用 `grep`、`test`、`ls`、`npm test` 或類似工具 — 絕不使用主觀判斷。

**目的**: 機器可驗證的結果消除「我覺得看起來不錯」。

**格式**:
```yaml
verification:
  - command: "grep -n 'rateLimiter.check' src/auth/login.js"
    expect: "At least one match found"
  - command: "npm test -- tests/auth/login.test.js"
    expect: "All tests pass (exit code 0)"
  - command: "grep -c 'rate.limit' tests/auth/login.test.js"
    expect: "At least 2 test cases for rate limiting"
```

**規則**:
- 每個 AC 應至少有一個驗證命令
- 優先使用確定性檢查（grep、test、檔案存在）而非語義評估
- 將測試執行納入驗證步驟
- 驗證失敗 = 任務未完成

---

## 完整任務範例

```yaml
task:
  id: TASK-042
  title: Add rate limiting to login endpoint
  spec_ref: SPEC-042

  read_first:
    - path: src/auth/login.js
      reason: Current login implementation
    - path: src/middleware/rate-limiter.js
      reason: Existing rate limiter utility
    - path: tests/auth/login.test.js
      reason: Test patterns to follow
    - path: docs/specs/SPEC-042.md
      reason: Approved specification

  action:
    - step: 1
      file: src/auth/login.js
      operation: modify
      location: "validateCredentials function (line ~45)"
      description: Add rate limit check before credential validation
    - step: 2
      file: tests/auth/login.test.js
      operation: add
      location: "end of validation describe block"
      description: Add rate limiting test cases

  acceptance_criteria:
    - id: AC-1
      given: A user exceeds 5 login attempts per minute
      when: They attempt another login
      then: HTTP 429 returned with rate limit message
    - id: AC-2
      given: A user is within rate limits
      when: They login with valid credentials
      then: Login succeeds normally (no regression)

  verification:
    - command: "grep -n 'rateLimiter' src/auth/login.js"
      expect: "Rate limiter imported and used"
    - command: "npm test -- tests/auth/login.test.js"
      expect: "All tests pass"
```

---

## 適用時機

| 情境 | 套用完整結構？ | 備註 |
|------|---------------|------|
| 新功能 (SDD) | 是 | 四個欄位全部必填 |
| 錯誤修復 | 是 | `read_first` 包含錯誤報告和受影響的程式碼 |
| 重構 | 是 | `acceptance_criteria` 專注於無回歸 |
| 瑣碎變更 | 否 | 錯字、格式化 — 跳過結構 |
| 緊急修復 | 部分 | 至少需要 `read_first` + `verification` |

---

## 與 SDD 整合

與規格驅動開發搭配使用時：
- `read_first` 包含已核准的規格文件
- `acceptance_criteria` 源自規格的 AC 章節
- `verification` 包含規格合規檢查
- 任務在實作階段建立

---

## 最佳實踐

### 應該做的

- 在每個任務中包含回歸條件
- 使用確切的檔案路徑（透過 `read_first` 驗證）
- 保持任務原子化（一個邏輯變更）
- 適用時引用規格 ID

### 不應該做的

- 不要使用模糊的動作描述（「改進」、「增強」、「重構」）
- 不要跳過 `verification` — 這是最重要的欄位
- 不要假設檔案結構 — 始終透過 `read_first` 驗證
- 不要在未讀取目標程式碼的情況下建立任務

---

## 相關標準

- [規格驅動開發](spec-driven-development.md) — 任務結構與 SDD 工作流程整合
- [防幻覺標準](anti-hallucination.md) — `read_first` 實作證據導向分析
- [測試標準](testing-standards.md) — `verification` 與測試金字塔一致
- [簽入標準](checkin-standards.md) — 任務產出可提交的工作單元

---

## 版本歷史

| 版本 | 日期 | 變更內容 |
|------|------|----------|
| 1.0.0 | 2026-03-17 | 初始標準：4 個必填欄位（read_first、action、acceptance_criteria、verification） |

---

## 授權

本標準以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。
