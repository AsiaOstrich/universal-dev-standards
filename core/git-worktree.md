# Git Worktree Isolation

> **Language**: English | [繁體中文](../locales/zh-TW/core/git-worktree.md)

**Version**: 1.0.0
**Last Updated**: 2026-03-20
**Applicability**: All projects using Git for version control
**Scope**: universal
**Inspired by**: [Superpowers](https://github.com/obra/superpowers) — using-git-worktrees (MIT)

---

## Purpose

Define a lifecycle for using Git worktrees to isolate development work, ensuring clean environments, safe merging, and proper cleanup. Worktrees allow parallel work on multiple branches without stashing or switching.

定義 Git Worktree 的完整生命週期管理標準，確保環境乾淨、安全合併與適當清理。Worktree 允許在多個分支上並行工作，無需 stash 或切換。

---

## Glossary

| Term | Definition |
|------|-----------|
| Worktree | A linked working copy of a Git repository at a different branch |
| Baseline Test | A test run on a fresh worktree to verify the environment is clean |
| Worktree Directory | The filesystem path where the worktree is created |

---

## Core Principle — Isolation with Accountability

> **Every worktree must start clean (baseline test), work in isolation, and end with either a merge or explicit cleanup.**

每個 worktree 必須以乾淨狀態開始（基準測試）、在隔離環境中工作、以合併或明確清理結束。

---

## Lifecycle Phases

### Phase 1: Setup（建立）

1. **Choose worktree location** — priority order:
   - Existing configured path
   - `.devap/worktrees/` or similar project-local directory
   - Ask the user
2. **Verify `.gitignore`** — run `git check-ignore` to confirm the worktree directory is ignored
3. **Create the worktree** — `git worktree add <path> -b <branch-name>`
4. **Install dependencies** — run package manager install if needed

```bash
# Example setup
git worktree add .worktrees/feature-auth -b feature/auth
cd .worktrees/feature-auth
pnpm install  # or npm install, pip install, etc.
```

### Phase 2: Baseline（基準驗證）

1. **Run the test suite** in the fresh worktree
2. **Confirm all tests pass** — this verifies the environment is clean
3. **If tests fail** — abort and report the environment issue (do not proceed)

```bash
# Baseline verification
pnpm test  # Must pass before any work begins
```

基準測試失敗代表環境有問題，必須中止並報告。

### Phase 3: Execute（執行）

1. Work in the isolated worktree as a normal development environment
2. Make commits as usual
3. Run tests after changes

### Phase 4: Merge（合併）

1. **Verify all tests pass** in the worktree
2. **Merge back** — use `--no-ff` to preserve branch history
3. **Handle conflicts** if they arise

```bash
git checkout main
git merge --no-ff feature/auth
```

### Phase 5: Cleanup（清理）

1. **Remove the worktree** — `git worktree remove <path>`
2. **Delete the branch** — `git branch -d <branch-name>`
3. **Prune stale worktrees** — `git worktree prune`

```bash
git worktree remove .worktrees/feature-auth
git branch -d feature/auth
git worktree prune
```

**Important**: Cleanup must happen even on abnormal exits. Use try/finally patterns or cleanup hooks.

清理必須在異常退出時也執行，使用 try/finally 或清理 hook。

---

## Rules

| ID | Trigger | Action | Priority |
|----|---------|--------|----------|
| GW-001 | Worktree directory not in `.gitignore` | Automatically add to `.gitignore` | Critical |
| GW-002 | Baseline tests fail | Abort task, report environment issue | High |
| GW-003 | Abnormal exit during worktree operation | Ensure cleanup is executed | High |
| GW-004 | Worktree exists after branch merge/delete | Prune stale worktree references | Medium |

---

## Best Practices

| Practice | Rationale |
|----------|-----------|
| Use a consistent worktree directory (e.g., `.worktrees/`) | Easy to `.gitignore` and locate |
| Always run baseline tests | Prevents false failures from environment issues |
| Use `--no-ff` for merges | Preserves branch topology in history |
| Clean up immediately after merge | Prevents stale worktree accumulation |

---

## References

- **Superpowers**: [using-git-worktrees](https://github.com/obra/superpowers) (MIT)
- **Git Documentation**: [git-worktree](https://git-scm.com/docs/git-worktree)
