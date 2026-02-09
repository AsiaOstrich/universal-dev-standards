---
source: ../../../../skills/code-review-assistant/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-02-10
status: current
description: |
  使用标准化检查清单执行系统性代码审查。
  使用时机：审查代码、PR 审查、代码品质检查。
  关键字：review, code review, PR, checklist, 审查, 代码, 品质。
---

# 代码审查助手

> **语言**: [English](../../../../skills/code-review-assistant/SKILL.md) | 简体中文

使用标准化的检查清单和评论前缀，执行系统性的代码审查。

## 工作流程

1. **识别变更** - 通过 `git diff` 或 `git show` 取得待审查文件的差异
2. **套用检查清单** - 系统性地检查每个审查类别
3. **产生报告** - 使用标准评论前缀输出发现
4. **总结** - 提供整体评估和建议的后续行动

## 审查类别

1. **功能性** - 功能是否正确？ | Does it work correctly?
2. **设计** - 架构是否合适？ | Is the architecture appropriate?
3. **品质** - 代码是否干净可维护？ | Is the code clean and maintainable?
4. **可读性** - 是否容易理解？ | Is it easy to understand?
5. **测试** - 测试覆盖是否足够？ | Is there adequate test coverage?
6. **安全性** - 是否有安全漏洞？ | Are there any vulnerabilities?
7. **性能** - 是否有效率？ | Is it efficient?
8. **错误处理** - 错误处理是否妥当？ | Are errors handled properly?

## 评论前缀

| 前缀 | 意义 | 动作 | Action |
|------|------|------|--------|
| **BLOCKING** | 必须在合并前修复 | 必须修复 | Required |
| **IMPORTANT** | 应该修复 | 建议修复 | Recommended |
| **SUGGESTION** | 锦上添花 | 可选改善 | Optional |
| **QUESTION** | 需要说明 | 需要讨论 | Discuss |
| **NOTE** | 信息性 | 仅供参考 | FYI |

## 使用方式

- `/review` - 审查目前分支的所有变更
- `/review src/auth.js` - 审查特定文件
- `/review feature/login` - 审查特定分支

## 参考

- 详细指南：[guide.md](./guide.md)
- 核心规范：[code-review-checklist.md](../../../../core/code-review-checklist.md)
