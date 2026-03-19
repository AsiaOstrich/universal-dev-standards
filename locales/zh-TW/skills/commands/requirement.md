---
source: ../../../../skills/commands/requirement.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-19
---

---
description: [UDS] Write user stories and requirements following INVEST criteria
allowed-tools: Read, Write, Grep, Glob
argument-hint: "[feature name or description | 功能名稱或描述]"
---

# 需求助手

> **Language**: [English](../../../../skills/commands/requirement.md) | 繁體中文

撰寫結構良好的用戶故事和需求文件，遵循 INVEST 標準。

## 工作流程

1. **了解背景** - 收集功能相關資訊
2. **識別利害關係人** - 誰會從這個功能受益？
3. **撰寫用戶故事** - 遵循標準格式
4. **定義驗收標準** - 具體、可測試的條件
5. **INVEST 驗證** - 檢查品質標準

## 用戶故事格式

```markdown
As a [role],
I want [feature],
So that [benefit].

### Acceptance Criteria

- [ ] Given [context], when [action], then [result]
- [ ] Given [context], when [action], then [result]
```

## INVEST 標準

| 標準 | 說明 |
|------|------|
| **I**ndependent | 可獨立開發 |
| **N**egotiable | 可協商細節 |
| **V**aluable | 提供用戶價值 |
| **E**stimable | 可估算工作量 |
| **S**mall | 適合單一迭代 |
| **T**estable | 有明確測試標準 |

## 使用方式

- `/requirement` - 互動式需求撰寫精靈
- `/requirement user login` - 為特定功能撰寫需求
- `/requirement "users can export data"` - 根據描述撰寫

## 參考

- 完整標準：[requirement-assistant](../requirement-assistant/SKILL.md)
- 核心指南：[requirements-standards](../../core/requirement-engineering.md)
