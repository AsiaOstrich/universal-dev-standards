---
source: ../../../../skills/requirement-assistant/requirement-writing.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2025-12-25
status: current
---

# 需求撰寫指南

> **語言**: [English](../../../../skills/requirement-assistant/requirement-writing.md) | 繁體中文

**版本**: 1.0.0
**最後更新**: 2025-12-24
**適用範圍**: Claude Code Skills

---

## 目的

本文件提供撰寫清晰有效需求的完整指南。

---

## 使用者故事格式

### 標準範本

```
As a [user role],
I want [goal/feature],
So that [benefit/value].
```

### 範例

**良好**:
```
As a registered user,
I want to reset my password via email,
So that I can regain access to my account if I forget my password.
```

**不良**:
```
Users should be able to reset passwords.
(缺少：誰、為什麼、驗收標準)
```

---

## INVEST 原則

### I - 獨立性（Independent）

- 故事可以獨立開發和交付
- 對其他故事的依賴最小
- 可以靈活地排定優先級和排程

**測試**：「我們可以在不完成另一個故事的情況下交付這個嗎？」

### N - 可協商性（Negotiable）

- 細節不是一成不變的
- 是對話的起點，而不是合約
- 實作方法可以討論

**測試**：「有技術討論的空間嗎？」

### V - 有價值性（Valuable）

- 為使用者或利害關係人提供價值
- 解決實際問題
- 有助於商業目標

**測試**：「這解決了什麼問題？誰會受益？」

### E - 可估算性（Estimable）

- 團隊可以估算工作量
- 範圍理解得足夠充分
- 沒有重大的未知因素

**測試**：「我們可以給出粗略估算嗎？」

### S - 小型化（Small）

- 可以在一個衝刺內完成
- 通常 1-5 天的工作
- 如果更大，拆分成更小的故事

**測試**：「我們可以在一個衝刺內完成這個嗎？」

### T - 可測試性（Testable）

- 驗收標準清楚
- 可以編寫自動化測試
- 完成的定義清楚

**測試**：「我們如何知道這完成了？」

---

## 驗收標準

### 格式選項

#### Given-When-Then (BDD 風格)

```gherkin
Given [precondition]
When [action]
Then [expected result]
```

**範例**:
```gherkin
Given I am on the login page
When I enter valid credentials and click login
Then I should be redirected to the dashboard
```

#### Checkbox 風格

```markdown
- [ ] User can upload files up to 10MB
- [ ] Supported formats: JPG, PNG, PDF
- [ ] Upload progress is displayed
- [ ] Error message shown if upload fails
```

### 撰寫良好的驗收標準

| 品質 | 良好 | 不良 |
|---------|------|-----|
| **具體** | "Error message displays within 2 seconds" | "Error handling works" |
| **可衡量** | "Response time < 500ms" | "System is fast" |
| **可測試** | "User sees confirmation modal" | "User experience is good" |
| **完整** | 列出所有情境 | 缺少邊界情況 |

### 檢查清單

- [ ] 涵蓋所有正常路徑情境
- [ ] 錯誤情境已定義
- [ ] 邊緣案例已考慮
- [ ] 效能標準（如果適用）
- [ ] 安全需求（如果適用）
- [ ] 無障礙需求（如果適用）

---

## 需求類型

### 功能性需求 (FR)

**系統應該做什麼**

```markdown
### FR1: User Registration

**Description**: Users can create new accounts using email.

**Acceptance Criteria**:
- [ ] Email format validation
- [ ] Password strength requirements (min 8 chars, 1 uppercase, 1 number)
- [ ] Confirmation email sent
- [ ] Duplicate email prevention
```

### 非功能性需求 (NFR)

**系統應該如何表現**

| 類別 | 範例 |
|----------|---------|
| **效能** | Response time < 200ms for 95th percentile |
| **擴展性** | Support 10,000 concurrent users |
| **安全性** | All data encrypted in transit (TLS 1.3) |
| **可用性** | 99.9% uptime |
| **易用性** | WCAG 2.1 AA compliance |

---

## 優先順序框架

### MoSCoW 方法

| 優先順序 | 意義 | 說明 |
|----------|---------|-------------|
| **M**ust Have (必須有) | 關鍵 | 沒有就無法發布 |
| **S**hould Have (應該有) | 重要 | 高價值但不阻塞 |
| **C**ould Have (可以有) | 理想 | 最好有，優先順序較低 |
| **W**on't Have (不會有) | 不在範圍內 | 此版本不包含 |

### 數字優先順序 (P0-P3)

| 等級 | 標籤 | 說明 | 範例 |
|-------|-------|-------------|---------|
| P0 | Critical | 阻礙性問題 | 安全漏洞 |
| P1 | High | 必須儘快修復 | 核心功能 bug |
| P2 | Medium | 應該修復 | UX 改進 |
| P3 | Low | 最好有 | 次要增強 |

---

## 問題範本

### 功能請求

```markdown
## Summary
[功能的一行描述]

## Motivation
### Problem Statement
[這解決了什麼問題？]

### User Impact
[誰受到影響以及如何影響？]

## Detailed Description
[請求功能的完整描述]

## Acceptance Criteria
- [ ] [標準 1]
- [ ] [標準 2]
- [ ] [標準 3]

## Design Considerations
[任何技術考量或限制]

## Out of Scope
- [此功能不包含什麼]

## Priority
- [ ] P0 - Critical
- [ ] P1 - High
- [ ] P2 - Medium
- [ ] P3 - Low
```

### Bug 報告

```markdown
## Description
[清晰、簡潔的 bug 描述]

## Steps to Reproduce
1. [第一步]
2. [第二步]
3. [第三步]

## Expected Behavior
[應該發生什麼]

## Actual Behavior
[實際發生什麼]

## Screenshots/Logs
[如適用]

## Environment
- OS: [例如 Windows 11, macOS 14]
- Browser: [例如 Chrome 120]
- Version: [例如 v1.2.3]

## Severity
- [ ] Critical - System unusable
- [ ] High - Major feature broken
- [ ] Medium - Minor feature broken
- [ ] Low - Cosmetic issue
```

### 技術任務

```markdown
## Summary
[一行描述]

## Background
[為什麼需要這個？背景。]

## Technical Details
[實作細節、方法]

## Acceptance Criteria
- [ ] [技術標準 1]
- [ ] [技術標準 2]

## Dependencies
- [列出任何依賴項]

## Risks
- [列出任何風險或顧慮]
```

---

## 常見錯誤

### 過於模糊

❌ **不好的範例**：
```
使系統更快。
```

✅ **好的範例**：
```
將 /users 端點的 API 回應時間減少到 200ms 以下。
```

### 解決方案而非問題

❌ **不好的範例**：
```
新增 Redis 快取。
```

✅ **好的範例**：
```
將儀表板載入時間從 5 秒改善到 1 秒以下。
（Redis 快取可能是一個解決方案，但讓團隊決定）
```

### 缺少驗收標準

❌ **不好的範例**：
```
實作使用者身份驗證。
```

✅ **好的範例**：
```
實作使用者身份驗證。

驗收標準：
- [ ] 使用者可以使用電子郵件/密碼註冊
- [ ] 使用者可以使用憑證登入
- [ ] 使用者可以透過電子郵件重設密碼
- [ ] 閒置 24 小時後工作階段過期
- [ ] 每小時登入失敗嘗試限制為 5 次
```

### 範圍過大

❌ **不好的範例**：
```
建立整個電子商務平台。
```

✅ **好的範例**：
```
Epic：電子商務平台

故事 1：使用者可以瀏覽產品目錄
故事 2：使用者可以將商品加入購物車
故事 3：使用者可以使用信用卡結帳
故事 4：管理員可以管理庫存
```

---

## 需求審查檢查清單

在提交需求之前：

- [ ] 問題陳述清楚
- [ ] 目標使用者/角色已識別
- [ ] 驗收標準已定義
- [ ] 優先級已分配
- [ ] 範圍邊界清楚
- [ ] 依賴項已識別
- [ ] 遵循 INVEST 原則
- [ ] 可測試且可衡量
- [ ] 沒有實作細節（除非必要）

---

## 相關標準

- [需求完整性檢查清單](./requirement-checklist.md)
- [規格驅動開發](../../core/spec-driven-development.md)

---

## 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| 1.0.0 | 2025-12-24 | 新增：標準區段（目的、相關標準、版本歷史、授權） |

---

## 授權

本文件以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。

**來源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
