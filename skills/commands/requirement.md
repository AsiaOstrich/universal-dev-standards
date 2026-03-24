---
description: [UDS] Write user stories and requirements following INVEST criteria
allowed-tools: Read, Write, Grep, Glob
argument-hint: "[feature name or description | 功能名稱或描述]"
---

# Requirement Assistant | 需求助手

Write well-structured user stories and requirements following INVEST criteria.

撰寫結構良好的用戶故事和需求文件，遵循 INVEST 標準。

## Workflow | 工作流程

1. **Understand context** - Gather information about the feature
2. **Identify stakeholders** - Who benefits from this feature?
3. **Write user story** - Follow the standard format
4. **Define acceptance criteria** - Specific, testable conditions
5. **Validate with INVEST** - Check quality criteria

## User Story Format | 用戶故事格式

```markdown
As a [role],
I want [feature],
So that [benefit].

### Acceptance Criteria

- [ ] Given [context], when [action], then [result]
- [ ] Given [context], when [action], then [result]
```

## INVEST Criteria | INVEST 標準

| Criterion | Description | 說明 |
|-----------|-------------|------|
| **I**ndependent | Can be developed separately | 可獨立開發 |
| **N**egotiable | Details can be discussed | 可協商細節 |
| **V**aluable | Delivers value to user | 提供用戶價值 |
| **E**stimable | Can estimate effort | 可估算工作量 |
| **S**mall | Fits in one sprint | 適合單一迭代 |
| **T**estable | Has clear test criteria | 有明確測試標準 |

## Usage | 使用方式

- `/requirement` - Interactive requirement writing wizard
- `/requirement user login` - Write requirement for specific feature
- `/requirement "users can export data"` - Based on description

## AI Agent Behavior | AI 代理行為

> Follows [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### Entry Router | 進入路由

| Input | AI Action |
|-------|-----------|
| `/requirement` | 詢問使用者要定義的功能，開始互動式需求撰寫 |
| `/requirement <feature>` | 以指定功能為目標，開始收集資訊 |
| `/requirement "description"` | 從描述中提取需求，生成使用者故事 |

### Interaction Script | 互動腳本

1. 收集功能描述和使用者角色
2. 引導定義 As a / I want / So that
3. 引導定義 Acceptance Criteria（GWT 格式）
4. 以 INVEST 準則逐項驗證

**Decision: INVEST 驗證結果**
- IF 全部通過 → 展示完整需求文件
- IF 有項目未通過 → 指出哪些未通過，建議修改方式

🛑 **STOP**: 展示需求文件後等待使用者確認寫入

### Stop Points | 停止點

| Stop Point | 等待內容 |
|-----------|---------|
| 需求文件生成後 | 確認內容正確並寫入 |

### Error Handling | 錯誤處理

| Error Condition | AI Action |
|-----------------|-----------|
| 使用者描述過於模糊 | 提出具體問題釐清範圍 |
| AC 無法用 GWT 格式表達 | 協助轉換，展示轉換建議 |

## Reference | 參考

- Full standard: [requirement-assistant](../requirement-assistant/SKILL.md)
- Core guide: [requirements-standards](../../core/requirement-engineering.md)
