# Branch Completion Workflow

> **Language**: English | [繁體中文](../locales/zh-TW/core/branch-completion.md)

**Version**: 1.0.0
**Last Updated**: 2026-03-20
**Applicability**: All projects using Git branching workflows
**Scope**: universal
**Inspired by**: [Superpowers](https://github.com/obra/superpowers) — finishing-a-development-branch (MIT)

---

## Purpose

Define a standardized workflow for completing development branches, including prerequisite checks, four completion options, and safe discard procedures. This standard prevents premature merges, forgotten branches, and accidental data loss.

定義分支完成的標準化工作流，包含前置檢查、四個完成選項與安全丟棄流程。防止過早合併、遺忘分支與意外資料遺失。

---

## Glossary

| Term | Definition |
|------|-----------|
| Branch Completion | The process of finishing work on a feature/fix branch |
| Prerequisites | Conditions that must be met before a branch can be considered complete |
| Discard Confirmation | A safety mechanism requiring explicit input before deleting work |

---

## Core Principle — Test Before Talk

> **All tests must pass before any completion option is considered.**

所有測試必須通過，才能討論完成選項。

---

## Prerequisites

Before a branch can be completed, ALL of the following must pass:

| Check | Command (example) | Required |
|-------|-------------------|----------|
| All tests pass | `pnpm test` | Yes |
| Lint passes | `pnpm lint` | Yes |
| Type check passes | `pnpm tsc --noEmit` | Yes |
| No uncommitted changes | `git status --porcelain` | Yes |

If any prerequisite fails, the branch is **not ready for completion**. Fix the issues first.

---

## Four Completion Options

### Option 1: Merge Locally（本地合併）

Merge the branch into the target branch on your local machine.

```bash
git checkout main
git merge --no-ff feature/my-feature
git branch -d feature/my-feature
# If worktree exists:
git worktree remove .worktrees/my-feature
```

**When to use**: Small changes, solo work, no review needed.

### Option 2: Create Pull Request（建立 PR）

Push the branch and create a pull request for review.

```bash
git push -u origin feature/my-feature
gh pr create --title "feat: add my feature" --body "..."
```

**When to use**: Team projects, changes needing review, CI/CD pipelines.

### Option 3: Keep As-Is（保持現狀）

Keep the branch without merging or creating a PR.

- Record the branch state and reason for deferral
- Set a reminder to revisit

**When to use**: Work in progress, waiting for dependencies, exploring alternatives.

### Option 4: Discard（丟棄）

Delete the branch and all its changes.

**Safety requirement**: The user must **explicitly confirm** by typing the branch name.

```
⚠️  You are about to discard branch 'feature/my-feature'.
    This will permanently delete all uncommitted and committed changes on this branch.
    Type the branch name to confirm: feature/my-feature
```

```bash
# After confirmation:
git checkout main
git branch -D feature/my-feature
# If worktree exists:
git worktree remove .worktrees/my-feature
```

**When to use**: Abandoned experiments, superseded approaches.

丟棄操作需要使用者明確確認（輸入分支名稱），防止誤刪。

---

## Decision Flow

```
Prerequisites pass?
  ├── No → Fix issues first
  └── Yes → Choose completion option:
        ├── 1. Merge locally
        ├── 2. Create PR
        ├── 3. Keep as-is
        └── 4. Discard (requires confirmation)
```

---

## Worktree Integration

If the branch has an associated worktree, the worktree must be cleaned up as part of the completion process:

| Completion Option | Worktree Action |
|------------------|----------------|
| Merge locally | Remove worktree after merge |
| Create PR | Keep worktree until PR is merged |
| Keep as-is | Keep worktree |
| Discard | Remove worktree immediately |

---

## Rules

| ID | Trigger | Action | Priority |
|----|---------|--------|----------|
| BC-001 | User selects Discard | Require branch name confirmation | Critical |
| BC-002 | Branch has associated worktree | Clean up worktree on completion | High |
| BC-003 | Prerequisites not met | Block completion, show failing checks | High |
| BC-004 | Branch idle for 14+ days | Notify user to complete or discard | Medium |

---

## References

- **Superpowers**: [finishing-a-development-branch](https://github.com/obra/superpowers) (MIT)
- **Git Flow**: Branch lifecycle management
- **Trunk-Based Development**: Short-lived branches pattern

---

> **Branch completion ≠ Release readiness.** A completed branch means all its own quality gates passed. It does not mean the product is ready to ship. See `release-readiness-gate.md` for the 16-dimension release gate that must pass before production deployment.
