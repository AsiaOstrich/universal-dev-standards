# Merge Commit Strategy

> **Language**: English | [繁體中文](../../locales/zh-TW/options/git-workflow/merge-commit.md)

**Parent Standard**: [Git Workflow](../../core/git-workflow.md)

---

## Overview

Merge commit (also known as "true merge" or "merge with merge commit") preserves the complete history of a feature branch by creating a merge commit that combines two branches. This maintains the full development history and shows exactly when branches were merged.

## Best For

- Teams that value complete history preservation
- Projects requiring audit trails
- Long-running feature branches
- When individual commits have meaningful messages
- Debugging with `git bisect`

## How It Works

```
Before merge:                After merge commit:
main:    A---B---C           A---B---C---------M (merge commit)
              \                       \       /
feature:       D---E---F               D---E---F
```

The merge commit `M` has two parents: `C` (from main) and `F` (from feature).

## Workflow

### Standard Merge Commit

```bash
# Ensure main is up to date
git checkout main
git pull origin main

# Merge feature branch with merge commit
git merge feature/user-auth --no-ff

# This opens editor for merge commit message
# Or specify inline:
git merge feature/user-auth --no-ff -m "Merge feature/user-auth: Add OAuth support"

# Push
git push origin main
```

### The `--no-ff` Flag

The `--no-ff` (no fast-forward) flag ensures a merge commit is always created:

```bash
# Without --no-ff (may fast-forward if possible)
git merge feature-branch
# Result: May or may not create merge commit

# With --no-ff (always creates merge commit)
git merge --no-ff feature-branch
# Result: Always creates merge commit
```

### Via GitHub Pull Request

1. Open Pull Request
2. Click "Create a merge commit" (or "Merge pull request")
3. Optionally edit the merge commit message
4. Confirm merge

## Merge Commit Messages

### Default Format

```
Merge branch 'feature/user-auth' into main
```

### Enhanced Format (Recommended)

```
Merge feature/user-auth: Implement OAuth authentication

This merge adds:
- Google OAuth integration
- GitHub OAuth integration
- Token refresh mechanism
- Session management

PR #123
Reviewed-by: @teammate
```

## Advantages

| Advantage | Description |
|-----------|-------------|
| Complete history | All commits preserved and visible |
| Clear merge points | Easy to see when features were integrated |
| Easy attribution | Each commit shows its author |
| Effective bisect | `git bisect` works with full granularity |
| Revert flexibility | Can revert merge or individual commits |

## Disadvantages

| Disadvantage | Description |
|--------------|-------------|
| Non-linear history | Branch structure can be complex |
| More commits | Main branch accumulates many commits |
| Harder to read | `git log` shows interleaved commits |
| Merge conflicts | Conflicts resolved in merge commit |

## Viewing Merge History

### Show Merge Commits Only

```bash
# List only merge commits
git log --merges --oneline

# Show merge commits with their parents
git log --merges --format="%h %s (%p)"
```

### Visualize Branch Structure

```bash
# ASCII graph of branches
git log --oneline --graph

# Simplified graph
git log --oneline --graph --first-parent
```

### View Contents of a Merge

```bash
# Show what was merged
git show <merge-commit-sha>

# Show changes from first parent (main)
git diff <merge-commit>^1 <merge-commit>

# Show changes from second parent (feature)
git diff <merge-commit>^2 <merge-commit>
```

## Reverting Merges

```bash
# Revert the entire merge
git revert -m 1 <merge-commit-sha>

# -m 1 means keep first parent (main branch)
# -m 2 would keep second parent (feature branch)
```

## Configuration

### Repository Settings (GitHub)

```yaml
# In repository settings > Pull Requests
Allow merge commits: ✓
Default commit message: Pull request title and description
```

### Git Configuration

```bash
# Always use --no-ff for merges
git config --global merge.ff false

# Or per-repository
git config merge.ff false
```

### Git Aliases

```bash
# Add to ~/.gitconfig
[alias]
    mg = merge --no-ff
    mgm = "!f() { git merge --no-ff -m \"Merge $1\" $1; }; f"
```

## Handling Merge Conflicts

When conflicts occur during merge:

```bash
# Start merge
git merge feature-branch

# If conflicts:
# 1. Edit conflicted files
# 2. Mark as resolved
git add <resolved-files>

# 3. Complete merge
git commit
# Merge commit message will include conflict info
```

## Best Practices

1. **Use meaningful merge messages** - Describe what the feature adds
2. **Keep branches updated** - Regularly merge main into feature branches
3. **Use `--no-ff`** - Ensure merge commits are always created
4. **Clean up branches** - Delete feature branches after merging
5. **Reference issues** - Include issue/PR numbers in merge messages

## Related Options

- [Squash Merge](./squash-merge.md) - Combines all commits into one
- [Rebase and Fast-Forward](./rebase-ff.md) - Linear history without merge commits

---

## License

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
