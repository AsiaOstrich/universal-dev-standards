---
description: Perform systematic code review with checklist | 執行系統性程式碼審查
allowed-tools: Read, Grep, Glob, Bash(git diff:*), Bash(git log:*), Bash(git show:*)
argument-hint: [file path or branch | 檔案路徑或分支名稱]
---

# Code Review Assistant | 程式碼審查助手

Perform systematic code review using standardized checklists and comment prefixes.

執行系統性的程式碼審查，使用標準化的檢查清單和評論前綴。

## Workflow | 工作流程

1. **Identify changes** - Get diff of files to review
2. **Apply checklist** - Check each category systematically
3. **Generate report** - Output findings with standard prefixes
4. **Summarize** - Provide overall assessment

## Review Categories | 審查類別

1. **Functionality** - Does it work correctly?
2. **Design** - Is the architecture appropriate?
3. **Quality** - Is the code clean and maintainable?
4. **Readability** - Is it easy to understand?
5. **Tests** - Is there adequate test coverage?
6. **Security** - Are there any vulnerabilities?
7. **Performance** - Is it efficient?
8. **Error Handling** - Are errors handled properly?

## Comment Prefixes | 評論前綴

| Prefix | Meaning | Action |
|--------|---------|--------|
| **BLOCKING** | Must fix before merge | Required |
| **IMPORTANT** | Should fix | Recommended |
| **SUGGESTION** | Nice-to-have | Optional |
| **QUESTION** | Need clarification | Discuss |
| **NOTE** | Informational | FYI |

## Usage | 使用方式

- `/uds:review` - Review all changes in current branch
- `/uds:review src/auth.js` - Review specific file
- `/uds:review feature/login` - Review specific branch

## Reference | 參考

- Full standard: [code-review-assistant](../../code-review-assistant/SKILL.md)
- Core guide: [code-review-checklist](../../../../core/code-review-checklist.md)
