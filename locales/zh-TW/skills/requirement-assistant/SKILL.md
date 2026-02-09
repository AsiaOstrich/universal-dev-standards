---
source: ../../../../skills/requirement-assistant/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-02-10
status: current
description: |
  撰寫結構良好的使用者故事和需求文件，遵循 INVEST 準則。
  使用時機：撰寫需求、定義使用者故事、驗收條件。
  關鍵字：requirement, user story, INVEST, acceptance criteria, 需求, 使用者故事, 驗收條件。
---

# 需求助手

> **語言**: [English](../../../../skills/requirement-assistant/SKILL.md) | 繁體中文

撰寫結構良好的使用者故事和需求文件，遵循 INVEST 準則。

## 工作流程

1. **理解情境** - 收集功能資訊
2. **識別利害關係人** - 誰從這個功能受益？
3. **撰寫使用者故事** - 遵循標準格式
4. **定義驗收條件** - 具體、可測試的條件
5. **以 INVEST 驗證** - 檢查品質準則

## 使用者故事格式

```
As a [role],
I want [feature],
So that [benefit].

### Acceptance Criteria
- [ ] Given [context], when [action], then [result]
- [ ] Given [context], when [action], then [result]
```

## INVEST 準則

| 準則 | 說明 | Criterion | Description |
|------|------|-----------|-------------|
| **I**ndependent | 可獨立開發 | Independent | Can be developed separately |
| **N**egotiable | 可協商細節 | Negotiable | Details can be discussed |
| **V**aluable | 提供使用者價值 | Valuable | Delivers value to user |
| **E**stimable | 可估算工作量 | Estimable | Can estimate effort |
| **S**mall | 適合單一迭代 | Small | Fits in one sprint |
| **T**estable | 有明確測試標準 | Testable | Has clear test criteria |

## 品質檢查清單

- [ ] 使用者故事遵循「As a / I want / So that」格式
- [ ] 至少定義 2 個驗收條件
- [ ] 滿足全部 6 個 INVEST 準則
- [ ] 已考慮邊界案例和錯誤情境
- [ ] 已記錄範圍外項目

## 使用方式

- `/requirement` - 互動式需求撰寫精靈
- `/requirement user login` - 為功能撰寫需求
- `/requirement "users can export data"` - 根據描述撰寫需求

## 參考

- 詳細指南：[guide.md](./guide.md)
- 核心規範：[requirement-engineering.md](../../../../core/requirement-engineering.md)
