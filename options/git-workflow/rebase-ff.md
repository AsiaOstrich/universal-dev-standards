# Rebase and Fast-Forward Strategy

> **Language**: English | [繁體中文](../../locales/zh-TW/options/git-workflow/rebase-ff.md)

**Parent Standard**: [Git Workflow](../../core/git-workflow.md)

---

## Overview

Rebase and fast-forward is a merge strategy that creates a completely linear history by replaying feature branch commits on top of the target branch. The result is a clean, straight-line history where all commits appear as if they were made sequentially on a single branch.

## Best For

- Teams that prefer linear history
- Projects that rely heavily on `git bisect`
- Developers who want clean, readable logs
- Open source projects with high code quality standards

## How It Works

```
Before rebase:               After rebase + fast-forward:
main:    A---B---C           A---B---C---D'---E'---F'
              \                              (rebased commits)
feature:       D---E---F
```

The commits D, E, F are "replayed" as D', E', F' on top of C.

## Workflow

### Interactive Rebase Before Merging

```bash
# Start on feature branch
git checkout feature/user-profile

# Fetch latest changes
git fetch origin

# Rebase onto main
git rebase origin/main

# If conflicts occur, resolve and continue
git add <resolved-files>
git rebase --continue

# Or abort if needed
git rebase --abort
```

### Fast-Forward Merge

```bash
# Switch to main
git checkout main
git pull origin main

# Fast-forward merge (only works if feature is ahead)
git merge --ff-only feature/user-profile

# Push
git push origin main

# Clean up
git branch -d feature/user-profile
```

### Force Push After Rebase

When you've rebased a branch that's already pushed:

```bash
# After rebasing
git push --force-with-lease origin feature/user-profile

# --force-with-lease is safer than --force
# It fails if someone else pushed to the branch
```

## Interactive Rebase

Clean up commits before merging:

```bash
# Rebase last 4 commits interactively
git rebase -i HEAD~4

# Or rebase from branch point
git rebase -i main
```

### Interactive Rebase Commands

```
pick   abc1234 feat: add user model
squash def5678 fix typo
reword ghi9012 add user service
drop   jkl3456 wip - remove this

# Commands:
# p, pick   = use commit
# r, reword = use commit, but edit message
# e, edit   = use commit, but stop for amending
# s, squash = meld into previous commit
# f, fixup  = like squash, but discard message
# d, drop   = remove commit
```

### Common Cleanup Patterns

```bash
# Combine fixup commits
pick abc1234 feat: add user model
fixup def5678 fix typo in user model
fixup ghi9012 another fix

# Result: single clean commit

# Reorder and edit
pick abc1234 feat: add user model
reword def5678 feat: add user validation
pick ghi9012 test: add user tests
```

## Advantages

| Advantage | Description |
|-----------|-------------|
| Linear history | Easy to read and understand |
| Clean log | `git log` shows straight line |
| Effective bisect | Clear progression of changes |
| Atomic commits | Each commit is self-contained |
| No merge commits | Cleaner repository |

## Disadvantages

| Disadvantage | Description |
|--------------|-------------|
| Rewritten history | Commit SHAs change after rebase |
| Force push required | After rebasing pushed branches |
| Conflict resolution | May need to resolve conflicts multiple times |
| Lost merge context | No record of when branches merged |
| Dangerous if shared | Can cause issues for collaborators |

## Safety Rules

### The Golden Rule of Rebasing

**Never rebase commits that have been pushed to a shared branch.**

```bash
# SAFE: Rebase local-only commits
git rebase main  # If feature branch is not pushed

# CAUTION: Rebase pushed feature branch
git rebase main
git push --force-with-lease  # Only if you're the only one working on it

# DANGEROUS: Never do this
git checkout main
git rebase feature  # Never rebase main/master!
```

### Using `--force-with-lease`

```bash
# Safer than --force
git push --force-with-lease origin feature-branch

# Fails if remote has commits you don't have locally
# Prevents overwriting others' work
```

## Configuration

### Repository Settings (GitHub)

```yaml
# In repository settings > Pull Requests
Allow rebase merging: ✓
Allow merge commits: ✗ (for enforcement)
Allow squash merging: ✗ (for enforcement)
```

### Git Configuration

```bash
# Default to rebase when pulling
git config --global pull.rebase true

# Auto-stash before rebase
git config --global rebase.autoStash true

# Auto-squash fixup commits
git config --global rebase.autoSquash true
```

### Git Aliases

```bash
# Add to ~/.gitconfig
[alias]
    rb = rebase
    rbi = rebase -i
    rbc = rebase --continue
    rba = rebase --abort
    fpush = push --force-with-lease
```

## Handling Conflicts During Rebase

```bash
# Start rebase
git rebase main

# When conflict occurs:
# 1. Edit conflicted files
# 2. Stage resolved files
git add <resolved-files>

# 3. Continue rebase
git rebase --continue

# Repeat for each conflicting commit

# If you want to skip a commit
git rebase --skip

# If you want to abort entirely
git rebase --abort
```

## Autosquash Workflow

Use commit message prefixes for automatic squashing:

```bash
# Original commit
git commit -m "feat: add user model"

# Later fixup (will auto-squash)
git commit --fixup=<original-sha>
# Creates: "fixup! feat: add user model"

# Or squash with custom message
git commit --squash=<original-sha>
# Creates: "squash! feat: add user model"

# Auto-squash during rebase
git rebase -i --autosquash main
```

## Related Options

- [Squash Merge](./squash-merge.md) - Single commit, simpler workflow
- [Merge Commit](./merge-commit.md) - Preserves branch history

---

## License

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
