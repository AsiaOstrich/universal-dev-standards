---
description: [UDS] Generate commit messages following Conventional Commits standard
allowed-tools: Read, Grep, Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(git add:*), Bash(git commit:*)
argument-hint: "[description of changes | 變更描述]"
---

# Commit Message Assistant | Commit Message 助手

Generate well-formatted commit messages following the Conventional Commits standard.

根據 staged 的變更，產生符合 Conventional Commits 格式的 commit message。

## Pre-Flight Checks | 前置檢查

Before generating a commit, the AI assistant MUST run these checks:

在產生 commit 前，AI 助手必須執行以下檢查：

| Check | Command | On Failure |
|-------|---------|------------|
| Staged changes exist | `git diff --cached --stat` | → Guide user to `git add` |
| No merge conflicts | `grep -r "<<<<<<< " --include="*.{js,ts,md,yaml}" .` | → Resolve conflicts first |
| Tests pass (if feat/fix) | `cd cli && npm run test:unit` (or project test cmd) | → Fix tests before committing |
| Spec reference (feat/fix) | Check `docs/specs/SPEC-*.md` for active specs | → Suggest `Refs: SPEC-XXX` in footer |

### Spec Tracking Gate | Spec 追蹤閘門

For `feat` and `fix` type commits:
1. **Check**: `ls docs/specs/SPEC-*.md 2>/dev/null` — any active specs?
2. **If specs exist**: Suggest adding `Refs: SPEC-XXX` to commit footer
3. **If no specs and change is significant** (>3 files or new API): Suggest creating a spec via `/sdd`
4. **Mode**: This is advisory (non-blocking) — user can always proceed without a spec reference

對於 `feat` 和 `fix` 類型的提交：
1. **檢查**：是否有活躍的規格？
2. **如果有規格**：建議在 footer 加入 `Refs: SPEC-XXX`
3. **如果沒有規格且變更顯著**：建議透過 `/sdd` 建立規格
4. **模式**：這是建議性的（非阻斷）— 使用者可以不引用規格

---

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

For `feat`/`fix` commits, evaluate whether a spec should be created or linked. Suggest a spec when: many files changed (>3), public API signatures modified, or significant new functionality. Skip for `docs`/`style`/`chore`/`test` types.

If a spec is linked, add `Refs: SPEC-XXX` to the commit footer. This is advisory — the user can always ignore.

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
