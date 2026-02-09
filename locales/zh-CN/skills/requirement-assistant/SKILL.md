---
source: ../../../../skills/requirement-assistant/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-02-10
status: current
description: |
  编写结构良好的用户故事和需求文件，遵循 INVEST 准则。
  使用时机：编写需求、定义用户故事、验收条件。
  关键字：requirement, user story, INVEST, acceptance criteria, 需求, 用户故事, 验收条件。
---

# 需求助手

> **语言**: [English](../../../../skills/requirement-assistant/SKILL.md) | 简体中文

编写结构良好的用户故事和需求文件，遵循 INVEST 准则。

## 工作流程

1. **理解情境** - 收集功能信息
2. **识别利害关系人** - 谁从这个功能受益？
3. **编写用户故事** - 遵循标准格式
4. **定义验收条件** - 具体、可测试的条件
5. **以 INVEST 验证** - 检查质量准则

## 用户故事格式

```
As a [role],
I want [feature],
So that [benefit].

### Acceptance Criteria
- [ ] Given [context], when [action], then [result]
- [ ] Given [context], when [action], then [result]
```

## INVEST 准则

| 准则 | 说明 | Criterion | Description |
|------|------|-----------|-------------|
| **I**ndependent | 可独立开发 | Independent | Can be developed separately |
| **N**egotiable | 可协商细节 | Negotiable | Details can be discussed |
| **V**aluable | 提供用户价值 | Valuable | Delivers value to user |
| **E**stimable | 可估算工作量 | Estimable | Can estimate effort |
| **S**mall | 适合单一迭代 | Small | Fits in one sprint |
| **T**estable | 有明确测试标准 | Testable | Has clear test criteria |

## 质量检查清单

- [ ] 用户故事遵循「As a / I want / So that」格式
- [ ] 至少定义 2 个验收条件
- [ ] 满足全部 6 个 INVEST 准则
- [ ] 已考虑边界案例和错误情境
- [ ] 已记录范围外项目

## 使用方式

- `/requirement` - 交互式需求编写向导
- `/requirement user login` - 为功能编写需求
- `/requirement "users can export data"` - 根据描述编写需求

## 参考

- 详细指南：[guide.md](./guide.md)
- 核心规范：[requirement-engineering.md](../../../../core/requirement-engineering.md)
