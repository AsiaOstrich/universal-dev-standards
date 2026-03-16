---
description: [UDS] Generate commit messages following Conventional Commits standard
allowed-tools: Read, Grep, Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(git add:*), Bash(git commit:*)
argument-hint: "[description of changes | 變更描述]"
---

# Commit Message Assistant | Commit Message 助手

Generate well-formatted commit messages following the Conventional Commits standard.

根據 staged 的變更，產生符合 Conventional Commits 格式的 commit message。

## Workflow | 工作流程

1. **Check status** - Run `git status` and `git diff --staged` to understand changes
2. **Analyze changes** - Determine the type (feat, fix, refactor, etc.) and scope
3. **Spec tracking assessment** - Evaluate whether this change needs a spec (see below)
4. **Generate message** - Create a commit message following the format:
   ```
   <type>(<scope>): <subject>

   <body>

   <footer>
   ```
5. **Confirm and commit** - Ask user to confirm before executing `git commit`

## Spec Tracking Assessment | Spec 追蹤評估

After analyzing the changes, evaluate whether a spec should be created or linked:

| Condition | Suggestion | 建議 |
|-----------|-----------|------|
| Type is `feat` or `fix` | Suggest creating/linking a spec | 建議建立或關聯 spec |
| >3 files modified | Suggest creating a spec | 建議建立 spec |
| Public API signature changed | Strongly suggest a spec | 強烈建議建立 spec |
| Type is `docs`, `style`, `chore`, `test` | No spec needed | 不需要 spec |

**Assessment output | 評估輸出：**
- 🟢 **No spec needed** — Skip for docs/style/chore/test changes
- 🟡 **Consider a spec** — Moderate changes (feat/fix, ≤3 files)
- 🔴 **Spec recommended** — Large changes (>3 files) or API changes

If a spec exists or is created, add `Refs: SPEC-XXX` to the commit footer.

The user can always accept or ignore the suggestion — this is advisory, not blocking.

## Commit Types | 提交類型

| Type | When to Use | 使用時機 |
|------|-------------|---------|
| `feat` | New feature | 新功能 |
| `fix` | Bug fix | 修復錯誤 |
| `refactor` | Code refactoring | 重構 |
| `docs` | Documentation | 文件更新 |
| `style` | Formatting | 格式調整 |
| `test` | Tests | 測試相關 |
| `perf` | Performance | 效能優化 |
| `chore` | Maintenance | 維護任務 |

## Usage | 使用方式

- `/commit` - Auto-analyze changes and suggest commit message
- `/commit fix login bug` - Generate message based on provided description

## Reference | 參考

- Full standard: [commit-standards](../commit-standards/SKILL.md)
- Core guide: [commit-message-guide](../../core/commit-message-guide.md)
