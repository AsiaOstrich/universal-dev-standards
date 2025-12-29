# Trunk-Based Development

> **Language**: English | [繁體中文](../../locales/zh-TW/options/git-workflow/trunk-based.md)

**Parent Standard**: [Git Workflow](../../core/git-workflow.md)

---

## Overview

Trunk-Based Development is a source-control branching model where developers collaborate on code in a single branch called "trunk" (main), resist creating long-lived branches, and use feature flags to manage incomplete features.

## Best For

- Continuous deployment (multiple times per day)
- Mature CI/CD pipelines
- Experienced development teams
- Microservices architecture

## Branch Structure

| Branch | Purpose | Lifetime |
|--------|---------|----------|
| `main` (trunk) | Single source of truth, always deployable | Permanent |
| `feature/*` | Very short-lived feature branches (optional) | Maximum 1-2 days |

## Core Principles

1. **Small, frequent commits** - Commit to trunk multiple times per day
2. **Feature flags** - Hide incomplete features behind flags
3. **Trunk is always green** - All tests must pass on every commit
4. **No long-lived branches** - Branches live at most 2 days
5. **Fast CI** - Build and test in minutes, not hours

## Workflow: Direct Commit

For small changes, commit directly to trunk:

```bash
# Start from latest trunk
git checkout main
git pull origin main

# Make small, focused changes
# ... edit files ...

# Commit and push
git add .
git commit -m "feat: add email validation"
git pull --rebase origin main
git push origin main
```

## Workflow: Short-Lived Branch

For slightly larger changes (still < 2 days):

```bash
# Create short-lived branch
git checkout main
git pull origin main
git checkout -b feature/add-avatar

# Make changes (complete within 1-2 days)
git commit -m "feat: add avatar upload"
git commit -m "test: add avatar tests"

# Merge quickly
git checkout main
git pull origin main
git merge --ff-only feature/add-avatar
git push origin main
git branch -d feature/add-avatar
```

## Feature Flags

Feature flags are essential for trunk-based development:

```javascript
// Example feature flag usage
if (featureFlags.isEnabled('new-checkout-flow')) {
  return <NewCheckout />;
}
return <OldCheckout />;
```

### Feature Flag Lifecycle

1. **Create flag** - Before starting feature development
2. **Develop behind flag** - All new code hidden by flag
3. **Test with flag on** - QA tests the feature
4. **Gradual rollout** - Enable for percentage of users
5. **Remove flag** - Once feature is stable

## Best Practices

### Pair Programming
- Real-time code review
- Higher quality commits
- Shared knowledge

### Test-Driven Development
- Write tests first
- High confidence in trunk stability
- Fast feedback

### Continuous Integration
- Run tests on every commit
- Automated deployment
- Fast build times (< 10 minutes)

### Monitoring
- Real-time error tracking
- Quick rollback capability
- Feature flag analytics

## Commit Guidelines

```bash
# Good: Small, atomic commits
git commit -m "feat: add user avatar field to schema"
git commit -m "feat: add avatar upload endpoint"
git commit -m "feat: add avatar display component"

# Bad: Large, compound commits
git commit -m "feat: add complete avatar feature with upload, display, and tests"
```

## Advantages

- Fastest integration of changes
- Minimal merge conflicts
- Encourages small, reviewable changes
- Supports continuous deployment

## Disadvantages

- Requires mature CI/CD
- Needs feature flag infrastructure
- Higher skill requirement
- Not suitable for all team sizes

## Prerequisites

- [ ] Fast, reliable CI pipeline (< 10 min builds)
- [ ] High test coverage
- [ ] Feature flag system
- [ ] Monitoring and rollback capability
- [ ] Team experience with Git

## Related Options

- [GitHub Flow](./github-flow.md) - Less strict, allows longer branches
- [GitFlow](./gitflow.md) - For scheduled releases

---

## License

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
