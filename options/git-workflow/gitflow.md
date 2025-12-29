# GitFlow

> **Language**: English | [繁體中文](../../locales/zh-TW/options/git-workflow/gitflow.md)

**Parent Standard**: [Git Workflow](../../core/git-workflow.md)

---

## Overview

GitFlow is a branching model designed for projects with scheduled releases. It provides a robust framework for managing larger projects with multiple parallel development streams.

## Best For

- Scheduled releases (monthly or longer cycles)
- Multiple version maintenance
- Large teams (10+ developers)
- Enterprise environments with formal release processes

## Branch Structure

| Branch | Purpose | Lifetime | Base | Merge To |
|--------|---------|----------|------|----------|
| `main` | Production releases | Permanent | - | - |
| `develop` | Integration branch | Permanent | main | - |
| `feature/*` | New features | Short-term | develop | develop |
| `release/*` | Release preparation | Medium (1-2 weeks) | develop | main, develop |
| `hotfix/*` | Emergency fixes | Very short | main | main, develop |

## Branch Diagram

```
main     ─────●─────────────●─────────●─────
              │             │         │
              │    release/1.0        │
              │     ┌───●───┐        hotfix/fix
              │     │       │         ┌─●─┐
develop ──●───●─────●───────●─────────●───●──
          │                           │
       feature/A                   feature/B
        ┌──●──┐                     ┌──●──┐
```

## Core Principles

1. **Never commit directly to main** - Use release or hotfix branches
2. **Develop is the integration branch** - All features merge here first
3. **Release branches freeze features** - Only bug fixes allowed
4. **Hotfixes go to both main and develop** - Keep branches in sync

## Workflow: Feature Development

### 1. Start Feature

```bash
git checkout develop
git pull origin develop
git checkout -b feature/user-dashboard
```

### 2. Develop Feature

```bash
# Make commits
git commit -m "feat(dashboard): add widget system"
git commit -m "feat(dashboard): add chart component"
```

### 3. Complete Feature

```bash
git checkout develop
git merge --no-ff feature/user-dashboard
git branch -d feature/user-dashboard
git push origin develop
```

## Workflow: Release

### 1. Create Release Branch

```bash
git checkout develop
git checkout -b release/v1.2.0
```

### 2. Prepare Release

```bash
# Update version numbers
# Update CHANGELOG
# Bug fixes only - no new features!
git commit -m "chore: bump version to 1.2.0"
```

### 3. Complete Release

```bash
# Merge to main
git checkout main
git merge --no-ff release/v1.2.0
git tag -a v1.2.0 -m "Release v1.2.0"

# Merge back to develop
git checkout develop
git merge --no-ff release/v1.2.0

# Cleanup
git branch -d release/v1.2.0
git push origin main develop --tags
```

## Workflow: Hotfix

### 1. Create Hotfix

```bash
git checkout main
git checkout -b hotfix/security-patch
```

### 2. Fix and Complete

```bash
# Make fix
git commit -m "fix: patch XSS vulnerability"

# Merge to main
git checkout main
git merge --no-ff hotfix/security-patch
git tag -a v1.2.1 -m "Hotfix v1.2.1"

# Merge to develop
git checkout develop
git merge --no-ff hotfix/security-patch

# Cleanup
git branch -d hotfix/security-patch
```

## Advantages

- Clear separation between development and production
- Supports parallel development of features
- Well-suited for scheduled releases
- Easy to maintain multiple versions

## Disadvantages

- Complex branch structure
- Overhead for small teams
- Can lead to long-lived feature branches
- Merge conflicts more likely

## Related Options

- [GitHub Flow](./github-flow.md) - Simpler alternative for continuous deployment
- [Trunk-Based Development](./trunk-based.md) - For teams with mature CI/CD

---

## License

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
