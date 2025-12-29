# Squash Merge Strategy

> **Language**: English | [繁體中文](../../locales/zh-TW/options/git-workflow/squash-merge.md)

**Parent Standard**: [Git Workflow](../../core/git-workflow.md)

---

## Overview

Squash merge combines all commits from a feature branch into a single commit when merging. This creates a clean, linear history on the main branch where each merge represents one complete feature or change.

## Best For

- Teams that value clean main branch history
- Projects with many small commits during development
- Code review workflows where the end result matters more than the journey
- Open source projects accepting external contributions

## How It Works

```
Feature branch:          Main branch after squash merge:
A---B---C---D            X---Y---Z (single squashed commit)
    \                        |
     E---F---G---H    →      S (contains E+F+G+H)
     (feature commits)
```

## Workflow

### Creating a Pull Request

```bash
# Create feature branch
git checkout -b feature/user-profile
git checkout main
git pull origin main

# Make multiple commits during development
git commit -m "wip: start user profile"
git commit -m "add avatar upload"
git commit -m "fix styling"
git commit -m "add tests"
git commit -m "fix test failure"

# Push and create PR
git push origin feature/user-profile
```

### Squash Merging (via CLI)

```bash
# On main branch
git checkout main
git pull origin main

# Squash merge
git merge --squash feature/user-profile

# Create single commit with meaningful message
git commit -m "feat(users): add user profile with avatar upload

- Add profile page component
- Implement avatar upload functionality
- Add comprehensive test coverage

Closes #123"

# Push and clean up
git push origin main
git branch -d feature/user-profile
git push origin --delete feature/user-profile
```

### Squash Merging (via GitHub)

1. Open the Pull Request
2. Click "Squash and merge" button
3. Edit the commit message to be meaningful
4. Confirm the merge
5. Delete the feature branch

## Commit Message Best Practices

When squash merging, write a comprehensive commit message:

```
feat(scope): concise description

- Key change 1
- Key change 2
- Key change 3

Closes #issue-number
Co-authored-by: Name <email@example.com>
```

### Good Example

```
feat(auth): implement OAuth2 login flow

- Add Google and GitHub OAuth providers
- Create secure token storage
- Implement automatic token refresh
- Add logout functionality

Closes #456
Reviewed-by: @teammate
```

### Bad Example

```
Squashed commit of the following:
- wip
- more wip
- fix stuff
- actually fix stuff
```

## Advantages

| Advantage | Description |
|-----------|-------------|
| Clean history | Main branch shows one commit per feature |
| Easy reverts | Revert entire features with single commit |
| Simplified bisect | Fewer commits to search through |
| Freedom to commit | Developers can commit frequently without cluttering history |

## Disadvantages

| Disadvantage | Description |
|--------------|-------------|
| Lost granularity | Individual commit history is lost |
| Harder blame | Can't trace specific lines to original commits |
| Large diffs | Single commit may have large changes |
| Lost context | Development journey is not preserved |

## When NOT to Use

- When individual commit history is important
- For long-running branches with valuable commit messages
- When you need to cherry-pick specific changes later
- For branches with multiple authors who need attribution

## Configuration

### GitHub Repository Settings

```yaml
# In repository settings > Pull Requests
Allow squash merging: ✓
Allow merge commits: ✗ (optional, for enforcement)
Allow rebase merging: ✗ (optional, for enforcement)

# Default commit message
Default to pull request title and description
```

### Git Aliases

```bash
# Add to ~/.gitconfig
[alias]
    squash = merge --squash
    sm = "!f() { git merge --squash $1 && git commit; }; f"
```

## Preserving Co-authors

When multiple people contributed to a branch:

```bash
git commit -m "feat: implement feature

Co-authored-by: Alice <alice@example.com>
Co-authored-by: Bob <bob@example.com>"
```

## Related Options

- [Merge Commit](./merge-commit.md) - Preserves all commit history
- [Rebase and Fast-Forward](./rebase-ff.md) - Linear history with all commits

---

## License

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
