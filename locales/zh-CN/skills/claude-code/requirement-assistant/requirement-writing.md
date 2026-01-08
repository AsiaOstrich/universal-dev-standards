---
source: skills/claude-code/requirement-assistant/requirement-writing.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2025-12-25
status: current
---

# 需求撰写指南

> **语言**: [English](../../../../../skills/claude-code/requirement-assistant/requirement-writing.md) | 繁体中文

**版本**: 1.0.0
**最后更新**: 2025-12-24
**适用范围**: Claude Code Skills

---

## 目的

本文件提供撰写清晰有效需求的完整指南。

---

## 使用者故事格式

### 标准范本

```
As a [user role],
I want [goal/feature],
So that [benefit/value].
```

### 范例

**良好**:
```
As a registered user,
I want to reset my password via email,
So that I can regain access to my account if I forget my password.
```

**不良**:
```
Users should be able to reset passwords.
(缺少：谁、为什么、验收标准)
```

---

## INVEST 原则

### I - 独立性（Independent）

- 故事可以独立开发和交付
- 对其他故事的依赖最小
- 可以灵活地排定优先级和排程

**测试**：「我们可以在不完成另一个故事的情况下交付这个吗？」

### N - 可协商性（Negotiable）

- 细节不是一成不变的
- 是对话的起点，而不是合约
- 实作方法可以讨论

**测试**：「有技术讨论的空间吗？」

### V - 有价值性（Valuable）

- 为使用者或利害关系人提供价值
- 解决实际问题
- 有助于商业目标

**测试**：「这解决了什么问题？谁会受益？」

### E - 可估算性（Estimable）

- 团队可以估算工作量
- 范围理解得足够充分
- 没有重大的未知因素

**测试**：「我们可以给出粗略估算吗？」

### S - 小型化（Small）

- 可以在一个冲刺内完成
- 通常 1-5 天的工作
- 如果更大，拆分成更小的故事

**测试**：「我们可以在一个冲刺内完成这个吗？」

### T - 可测试性（Testable）

- 验收标准清楚
- 可以编写自动化测试
- 完成的定义清楚

**测试**：「我们如何知道这完成了？」

---

## 验收标准

### 格式选项

#### Given-When-Then (BDD 风格)

```gherkin
Given [precondition]
When [action]
Then [expected result]
```

**范例**:
```gherkin
Given I am on the login page
When I enter valid credentials and click login
Then I should be redirected to the dashboard
```

#### Checkbox 风格

```markdown
- [ ] User can upload files up to 10MB
- [ ] Supported formats: JPG, PNG, PDF
- [ ] Upload progress is displayed
- [ ] Error message shown if upload fails
```

### 撰写良好的验收标准

| 品质 | 良好 | 不良 |
|---------|------|-----|
| **具体** | "Error message displays within 2 seconds" | "Error handling works" |
| **可衡量** | "Response time < 500ms" | "System is fast" |
| **可测试** | "User sees confirmation modal" | "User experience is good" |
| **完整** | 列出所有情境 | 缺少边界情况 |

### 检查清单

- [ ] 涵盖所有正常路径情境
- [ ] 错误情境已定义
- [ ] 边缘案例已考虑
- [ ] 效能标准（如果适用）
- [ ] 安全需求（如果适用）
- [ ] 无障碍需求（如果适用）

---

## 需求类型

### 功能性需求 (FR)

**系统应该做什么**

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

**系统应该如何表现**

| 类别 | 范例 |
|----------|---------|
| **效能** | Response time < 200ms for 95th percentile |
| **扩展性** | Support 10,000 concurrent users |
| **安全性** | All data encrypted in transit (TLS 1.3) |
| **可用性** | 99.9% uptime |
| **易用性** | WCAG 2.1 AA compliance |

---

## 优先顺序框架

### MoSCoW 方法

| 优先顺序 | 意义 | 说明 |
|----------|---------|-------------|
| **M**ust Have (必须有) | 关键 | 没有就无法发布 |
| **S**hould Have (应该有) | 重要 | 高价值但不阻塞 |
| **C**ould Have (可以有) | 理想 | 最好有，优先顺序较低 |
| **W**on't Have (不会有) | 不在范围内 | 此版本不包含 |

### 数字优先顺序 (P0-P3)

| 等级 | 标签 | 说明 | 范例 |
|-------|-------|-------------|---------|
| P0 | Critical | 阻碍性问题 | 安全漏洞 |
| P1 | High | 必须尽快修复 | 核心功能 bug |
| P2 | Medium | 应该修复 | UX 改进 |
| P3 | Low | 最好有 | 次要增强 |

---

## 问题范本

### 功能请求

```markdown
## Summary
[功能的一行描述]

## Motivation
### Problem Statement
[这解决了什么问题？]

### User Impact
[谁受到影响以及如何影响？]

## Detailed Description
[请求功能的完整描述]

## Acceptance Criteria
- [ ] [标准 1]
- [ ] [标准 2]
- [ ] [标准 3]

## Design Considerations
[任何技术考量或限制]

## Out of Scope
- [此功能不包含什么]

## Priority
- [ ] P0 - Critical
- [ ] P1 - High
- [ ] P2 - Medium
- [ ] P3 - Low
```

### Bug 报告

```markdown
## Description
[清晰、简洁的 bug 描述]

## Steps to Reproduce
1. [第一步]
2. [第二步]
3. [第三步]

## Expected Behavior
[应该发生什么]

## Actual Behavior
[实际发生什么]

## Screenshots/Logs
[如适用]

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

### 技术任务

```markdown
## Summary
[一行描述]

## Background
[为什么需要这个？背景。]

## Technical Details
[实作细节、方法]

## Acceptance Criteria
- [ ] [技术标准 1]
- [ ] [技术标准 2]

## Dependencies
- [列出任何依赖项]

## Risks
- [列出任何风险或顾虑]
```

---

## 常见错误

### 过于模糊

❌ **不好的范例**：
```
使系统更快。
```

✅ **好的范例**：
```
将 /users 端点的 API 回应时间减少到 200ms 以下。
```

### 解决方案而非问题

❌ **不好的范例**：
```
新增 Redis 快取。
```

✅ **好的范例**：
```
将仪表板载入时间从 5 秒改善到 1 秒以下。
（Redis 快取可能是一个解决方案，但让团队决定）
```

### 缺少验收标准

❌ **不好的范例**：
```
实作使用者身份验证。
```

✅ **好的范例**：
```
实作使用者身份验证。

验收标准：
- [ ] 使用者可以使用电子邮件/密码注册
- [ ] 使用者可以使用凭证登入
- [ ] 使用者可以透过电子邮件重设密码
- [ ] 闲置 24 小时后工作阶段过期
- [ ] 每小时登入失败尝试限制为 5 次
```

### 范围过大

❌ **不好的范例**：
```
建立整个电子商务平台。
```

✅ **好的范例**：
```
Epic：电子商务平台

故事 1：使用者可以浏览产品目录
故事 2：使用者可以将商品加入购物车
故事 3：使用者可以使用信用卡结帐
故事 4：管理员可以管理库存
```

---

## 需求审查检查清单

在提交需求之前：

- [ ] 问题陈述清楚
- [ ] 目标使用者/角色已识别
- [ ] 验收标准已定义
- [ ] 优先级已分配
- [ ] 范围边界清楚
- [ ] 依赖项已识别
- [ ] 遵循 INVEST 原则
- [ ] 可测试且可衡量
- [ ] 没有实作细节（除非必要）

---

## 相关标准

- [需求完整性检查清单](./requirement-checklist.md)
- [规格驱动开发](../../../core/spec-driven-development.md)

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0.0 | 2025-12-24 | 新增：标准区段（目的、相关标准、版本历史、授权） |

---

## 授权

本文件以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权发布。

**来源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
