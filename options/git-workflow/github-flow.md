# GitHub Flow

> **Language**: English | [繁體中文](../../locales/zh-TW/options/git-workflow/github-flow.md)

**Parent Standard**: [Git Workflow](../../core/git-workflow.md)

---

## Overview

GitHub Flow is a lightweight, branch-based workflow designed for teams that deploy regularly. It's simple to understand and implement, making it ideal for continuous deployment environments.

## Best For

- Continuous deployment (multiple times per day to weekly)
- Web applications and SaaS products
- Small to medium teams (5-15 developers)
- Projects with strong CI/CD pipelines

## Branch Structure

| Branch | Purpose | Lifetime |
|--------|---------|----------|
| `main` | Always deployable production code | Permanent |
| `feature/*` | New features or fixes | Short-lived (1-3 days ideal) |

## Core Principles

1. **Main is always deployable** - The main branch should always be in a deployable state
2. **Branch for everything** - Create a branch for any new work
3. **Use descriptive names** - Branch names should describe the work
4. **Open PRs early** - Get feedback early through pull requests
5. **Deploy after merge** - Deploy immediately after merging to main

## Workflow Steps

### 1. Create Feature Branch

```bash
# Start from latest main
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/user-authentication
```

### 2. Make Changes and Commit

```bash
# Make your changes
git add .
git commit -m "feat(auth): add login form component"

# Continue making commits...
git commit -m "feat(auth): add authentication service"
git commit -m "test(auth): add login tests"
```

### 3. Push and Create Pull Request

```bash
# Push branch to remote
git push -u origin feature/user-authentication

# Create PR via GitHub/GitLab UI
# - Add description
# - Request reviewers
# - Link related issues
```

### 4. Review and Merge

- Get code review approval
- Ensure CI checks pass
- Merge via GitHub UI (squash or merge commit)

### 5. Deploy and Cleanup

```bash
# After merge, update local main
git checkout main
git pull origin main

# Delete feature branch
git branch -d feature/user-authentication
```

## Branch Naming Convention

```
<type>/<short-description>

Examples:
feature/oauth-login
fix/memory-leak
docs/api-reference
refactor/user-service
```

## Merge Strategy Recommendations

| Merge Type | When to Use |
|------------|-------------|
| **Squash Merge** | Most feature branches (clean history) |
| **Merge Commit** | When preserving commit history matters |
| **Rebase + FF** | For very short-lived branches |

## Advantages

- Simple to understand and implement
- Works well with CI/CD
- Encourages frequent integration
- Minimal branch management overhead

## Disadvantages

- No separate development branch for integration
- All features go directly to main
- Less suitable for scheduled releases

## Related Options

- [GitFlow](./gitflow.md) - For scheduled releases
- [Trunk-Based Development](./trunk-based.md) - For even more frequent integration

---

## License

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
