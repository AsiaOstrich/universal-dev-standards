---
description: [UDS] Perform systematic code review with checklist
allowed-tools: Read, Grep, Glob, Bash(git diff:*), Bash(git log:*), Bash(git show:*)
argument-hint: "[file path or branch | 文件路径或分支名称]"
---

# Code Review Assistant | 代码审查助手

Perform systematic code review using standardized checklists and comment prefixes.

执行系统性的代码审查，使用标准化的检查清单和评论前缀。

## Workflow | 工作流程

1. **识别变更** - 获取待审查文件的 diff
2. **应用检查清单** - 系统性地检查每个类别
3. **生成报告** - 使用标准前缀输出发现
4. **总结** - 提供整体评估

## Review Categories | 审查类别

1. **功能性** - 是否正确运行？
2. **设计** - 架构是否合适？
3. **质量** - 代码是否整洁、可维护？
4. **可读性** - 是否易于理解？
5. **测试** - 是否有足够的测试覆盖？
6. **安全性** - 是否有漏洞？
7. **性能** - 是否高效？
8. **错误处理** - 是否正确处理错误？

## Comment Prefixes | 评论前缀

| Prefix | Meaning | Action |
|--------|---------|--------|
| **BLOCKING** | 必须在合并前修复 | 必需 |
| **IMPORTANT** | 应该修复 | 建议 |
| **SUGGESTION** | 锦上添花 | 可选 |
| **QUESTION** | 需要澄清 | 讨论 |
| **NOTE** | 信息性说明 | 仅供参考 |

## Usage | 使用方式

- `/review` - 审查当前分支的所有变更
- `/review src/auth.js` - 审查特定文件
- `/review feature/login` - 审查特定分支

## Reference | 参考

- Full standard: [code-review-assistant](../code-review-assistant/SKILL.md)
- Core guide: [code-review-checklist](../../core/code-review-checklist.md)
