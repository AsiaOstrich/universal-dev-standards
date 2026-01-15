---
source: skills/claude-code/requirement-assistant/requirement-writing.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2025-12-25
status: current
---

# 需求撰写指南

> **语言**: [English](../../../../../skills/claude-code/requirement-assistant/requirement-writing.md) | 简体中文

**版本**: 1.0.0
**最後更新**: 2025-12-24
**適用範圍**: Claude Code Skills

---

## 目的

本文件提供撰写清晰有效需求的完整指南。

---

## 使用者故事格式

### 标准範本

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
(缺少：誰、为什麼、驗收标准)
```

---

## INVEST 原則

### I - 獨立性（Independent）

- 故事可以獨立开发和交付
- 对其他故事的依賴最小
- 可以靈活地排定優先级和排程

**测试**：「我們可以在不完成另一个故事的情况下交付这个嗎？」

### N - 可協商性（Negotiable）

- 細节不是一成不变的
- 是对话的起点，而不是合約
- 实作方法可以討論

**测试**：「有技術討論的空间嗎？」

### V - 有价值性（Valuable）

- 为使用者或利害关系人提供价值
- 解决实际問題
- 有助於商业目標

**测试**：「这解决了什麼問題？誰会受益？」

### E - 可估算性（Estimable）

- 团队可以估算工作量
- 範圍理解得足夠充分
- 没有重大的未知因素

**测试**：「我們可以給出粗略估算嗎？」

### S - 小型化（Small）

- 可以在一个衝刺內完成
- 通常 1-5 天的工作
- 如果更大，拆分成更小的故事

**测试**：「我們可以在一个衝刺內完成这个嗎？」

### T - 可测试性（Testable）

- 驗收标准清楚
- 可以编写自动化测试
- 完成的定義清楚

**测试**：「我們如何知道这完成了？」

---

## 驗收标准

### 格式选项

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

### 撰写良好的驗收标准

| 品质 | 良好 | 不良 |
|---------|------|-----|
| **具体** | "Error message displays within 2 seconds" | "Error handling works" |
| **可衡量** | "Response time < 500ms" | "System is fast" |
| **可测试** | "User sees confirmation modal" | "User experience is good" |
| **完整** | 列出所有情境 | 缺少邊界情况 |

### 检查清单

- [ ] 涵蓋所有正常路徑情境
- [ ] 错误情境已定義
- [ ] 邊緣案例已考慮
- [ ] 效能标准（如果適用）
- [ ] 安全需求（如果適用）
- [ ] 無障礙需求（如果適用）

---

## 需求类型

### 功能性需求 (FR)

**系统应該做什麼**

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

**系统应該如何表現**

| 类别 | 範例 |
|----------|---------|
| **效能** | Response time < 200ms for 95th percentile |
| **擴展性** | Support 10,000 concurrent users |
| **安全性** | All data encrypted in transit (TLS 1.3) |
| **可用性** | 99.9% uptime |
| **易用性** | WCAG 2.1 AA compliance |

---

## 優先順序框架

### MoSCoW 方法

| 優先順序 | 意義 | 说明 |
|----------|---------|-------------|
| **M**ust Have (必須有) | 关鍵 | 没有就無法發布 |
| **S**hould Have (应該有) | 重要 | 高价值但不阻塞 |
| **C**ould Have (可以有) | 理想 | 最好有，優先順序較低 |
| **W**on't Have (不会有) | 不在範圍內 | 此版本不包含 |

### 數字優先順序 (P0-P3)

| 等级 | 标签 | 说明 | 範例 |
|-------|-------|-------------|---------|
| P0 | Critical | 阻礙性問題 | 安全漏洞 |
| P1 | High | 必須儘快修復 | 核心功能 bug |
| P2 | Medium | 应該修復 | UX 改进 |
| P3 | Low | 最好有 | 次要增強 |

---

## 問題範本

### 功能请求

```markdown
## Summary
[功能的一行描述]

## Motivation
### Problem Statement
[这解决了什麼問題？]

### User Impact
[誰受到影響以及如何影響？]

## Detailed Description
[请求功能的完整描述]

## Acceptance Criteria
- [ ] [标准 1]
- [ ] [标准 2]
- [ ] [标准 3]

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

### Bug 报告

```markdown
## Description
[清晰、簡潔的 bug 描述]

## Steps to Reproduce
1. [第一步]
2. [第二步]
3. [第三步]

## Expected Behavior
[应該發生什麼]

## Actual Behavior
[实际發生什麼]

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

### 技術任务

```markdown
## Summary
[一行描述]

## Background
[为什麼需要这个？背景。]

## Technical Details
[实作細节、方法]

## Acceptance Criteria
- [ ] [技術标准 1]
- [ ] [技術标准 2]

## Dependencies
- [列出任何依賴项]

## Risks
- [列出任何風險或顧慮]
```

---

## 常見错误

### 過於模糊

❌ **不好的範例**：
```
使系统更快。
```

✅ **好的範例**：
```
將 /users 端点的 API 响应时间減少到 200ms 以下。
```

### 解决方案而非問題

❌ **不好的範例**：
```
新增 Redis 快取。
```

✅ **好的範例**：
```
將儀表板载入时间從 5 秒改善到 1 秒以下。
（Redis 快取可能是一个解决方案，但讓团队决定）
```

### 缺少驗收标准

❌ **不好的範例**：
```
实作使用者身份验证。
```

✅ **好的範例**：
```
实作使用者身份验证。

驗收标准：
- [ ] 使用者可以使用電子郵件/密码註冊
- [ ] 使用者可以使用憑证登入
- [ ] 使用者可以透過電子郵件重设密码
- [ ] 閒置 24 小时後工作阶段過期
- [ ] 每小时登入失败嘗試限制为 5 次
```

### 範圍過大

❌ **不好的範例**：
```
建立整个電子商务平台。
```

✅ **好的範例**：
```
Epic：電子商务平台

故事 1：使用者可以瀏覽产品目录
故事 2：使用者可以將商品加入購物車
故事 3：使用者可以使用信用卡結帳
故事 4：管理員可以管理庫存
```

---

## 需求审查检查清单

在提交需求之前：

- [ ] 問題陳述清楚
- [ ] 目標使用者/角色已識别
- [ ] 驗收标准已定義
- [ ] 優先级已分配
- [ ] 範圍邊界清楚
- [ ] 依賴项已識别
- [ ] 遵循 INVEST 原則
- [ ] 可测试且可衡量
- [ ] 没有实作細节（除非必要）

---

## 相关标准

- [需求完整性检查清单](./requirement-checklist.md)
- [規格驅动开发](../../../core/spec-driven-development.md)

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0.0 | 2025-12-24 | 新增：标准區段（目的、相关标准、版本历史、授权） |

---

## 授权

本文件以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权發布。

**來源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
