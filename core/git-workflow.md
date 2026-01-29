# Git Workflow Standards

> **Language**: English | [繁體中文](../locales/zh-TW/core/git-workflow.md)

**Version**: 1.4.0
**Last Updated**: 2026-01-29
**Applicability**: All projects using Git for version control
**Scope**: universal

> **For detailed explanations and tutorials, see [Git Workflow Guide](guides/git-workflow-guide.md)**

---

## Purpose

This standard defines Git branching strategies and workflows to ensure consistent, predictable collaboration patterns across teams and projects.

---

## Workflow Strategy Selection

**PROJECT MUST CHOOSE ONE** workflow strategy and document it clearly.

| Factor | GitFlow | GitHub Flow | Trunk-Based |
|--------|---------|-------------|-------------|
| **Release frequency** | Monthly+ | Weekly | Multiple/day |
| **Team size** | Large (10+) | Medium (5-15) | Small-Medium (3-10) |
| **CI/CD maturity** | Basic | Intermediate | Advanced |
| **Feature flags** | Optional | Optional | Required |
| **Complexity** | High | Low | Medium |

---

## Branch Types

### GitFlow Branch Types

| Branch Type | Purpose | Base Branch | Merge Target | Lifetime |
|-------------|---------|-------------|--------------|----------|
| `main` | Production code | - | - | Permanent |
| `develop` | Integration branch | - | - | Permanent |
| `feature/*` | New features | `develop` | `develop` | Temporary |
| `release/*` | Release prep | `develop` | `main` + `develop` | Temporary |
| `hotfix/*` | Urgent fixes | `main` | `main` + `develop` | Temporary |

### GitHub Flow Branch Types

| Branch Type | Purpose | Base Branch | Merge Target | Lifetime |
|-------------|---------|-------------|--------------|----------|
| `main` | Production code | - | - | Permanent |
| `feature/*` | New features | `main` | `main` | Temporary |
| `bugfix/*` | Bug fixes | `main` | `main` | Temporary |
| `hotfix/*` | Urgent fixes | `main` | `main` | Temporary |

### Trunk-Based Branch Types

| Branch Type | Purpose | Base Branch | Merge Target | Lifetime |
|-------------|---------|-------------|--------------|----------|
| `main` | Trunk | - | - | Permanent |
| `feature/*` | Small changes | `main` | `main` | ≤2 days |

---

## Branch Naming Conventions

### Standard Format

```
<type>/<short-description>
```

### Types

| Type | Usage | Example |
|------|-------|---------|
| `feature/` | New functionality | `feature/oauth-login` |
| `fix/` or `bugfix/` | Bug fixes | `fix/memory-leak` |
| `hotfix/` | Urgent production fixes | `hotfix/security-patch` |
| `refactor/` | Code refactoring | `refactor/extract-service` |
| `docs/` | Documentation only | `docs/api-reference` |
| `test/` | Test additions | `test/integration-tests` |
| `chore/` | Maintenance tasks | `chore/update-dependencies` |
| `release/` | Release preparation (GitFlow) | `release/v1.2.0` |

### Naming Rules

1. **Use lowercase**
2. **Use hyphens for spaces**
3. **Be descriptive but concise**
4. **Avoid issue numbers as only identifier**

---

## Merge Strategies

**PROJECT MUST CHOOSE ONE** for each branch type.

| Strategy | Command | Best For | Pros | Cons |
|----------|---------|----------|------|------|
| **Merge Commit** | `git merge --no-ff` | GitFlow, long-lived features | Complete history, easy revert | Cluttered log |
| **Squash Merge** | `git merge --squash` | GitHub Flow, feature branches | Clean history, one commit per feature | Loses detail |
| **Rebase + FF** | `git rebase && git merge --ff-only` | Trunk-Based, short-lived branches | Linear history, preserves commits | Rewrites history |

---

## Pre-branch Checklist

Before creating a new branch, complete these checks:

### For GitFlow and GitHub Flow

- [ ] Check for unmerged branches: `git branch --no-merged main`
- [ ] Sync latest code: `git checkout main && git pull origin main`
- [ ] Verify tests pass: Run project test suite
- [ ] Create branch: `git checkout -b feature/description`

### For Trunk-Based Development

- [ ] Sync latest code: `git checkout main && git pull origin main` (Critical)
- [ ] Verify tests pass (Critical)
- [ ] Create short-lived branch: `git checkout -b feature/description`

---

## Conflict Resolution

### Prevention Checklist

- [ ] Sync frequently with base branch
- [ ] Keep branches small (avoid long-lived feature branches)
- [ ] Communicate major refactoring to team

### Resolution Steps

```bash
git checkout main && git pull origin main
git checkout feature/my-feature && git merge main
# Resolve conflicts in marked files
git add resolved-file.js
git commit -m "chore: resolve merge conflicts with main"
npm test  # Verify
git push origin feature/my-feature
```

---

## Tagging and Releases

### Semantic Versioning

```
MAJOR.MINOR.PATCH
```

| Component | When to Increment | Example |
|-----------|-------------------|---------|
| **MAJOR** | Breaking changes | v2.0.0 |
| **MINOR** | New features (backward-compatible) | v1.2.0 |
| **PATCH** | Bug fixes (backward-compatible) | v1.2.1 |

### Pre-release Versions

| Type | Format | Example |
|------|--------|---------|
| Alpha | `X.Y.Z-alpha.N` | v1.2.0-alpha.1 |
| Beta | `X.Y.Z-beta.N` | v1.2.0-beta.2 |
| RC | `X.Y.Z-rc.N` | v1.2.0-rc.1 |

### Creating Tags

```bash
git tag -a v1.2.0 -m "Release version 1.2.0: Add OAuth2 support"
git push origin v1.2.0
```

---

## Protected Branches

### Recommended Protection for `main`/`develop`

| Setting | Required |
|---------|----------|
| Require pull request reviews | ✅ (1-2 reviewers) |
| Require status checks to pass | ✅ (CI tests, linting) |
| Require branches to be up to date | ✅ |
| Include administrators | ✅ |
| Allow force pushes | ❌ |
| Allow deletions | ❌ |

---

## Pull Request Workflow

### PR Creation Checklist

- [ ] **Title follows commit convention** (e.g., `feat(auth): add OAuth2`)
- [ ] **Description explains why** (not just what)
- [ ] **Linked to issue** (e.g., "Closes #123")
- [ ] **Tests included** for new functionality
- [ ] **Documentation updated** if needed
- [ ] **Breaking changes highlighted** in description
- [ ] **Screenshots/GIFs** for UI changes

### PR Type Reference

| Type | Purpose | Example |
|------|---------|---------|
| `feat` | New feature | `feat(auth): add OAuth2 login` |
| `fix` | Bug fix | `fix(api): handle null response` |
| `docs` | Documentation | `docs(readme): update install steps` |
| `refactor` | Code refactoring | `refactor(utils): extract validation` |
| `test` | Adding tests | `test(auth): add login unit tests` |
| `chore` | Maintenance | `chore(deps): update lodash` |
| `perf` | Performance | `perf(query): optimize user lookup` |

---

## Related Standards

- [Commit Message Guide](commit-message-guide.md)
- [Code Check-in Standards](checkin-standards.md)
- [Versioning Standard](versioning.md)
- [Changelog Standards](changelog-standards.md)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.4.0 | 2026-01-29 | Refactored: Split into Rules + Guide, moved tutorials to guide |
| 1.3.0 | 2026-01-24 | Added: Trunk-Based + Feature Flags integration, Ship/Show/Ask decision model, Stacked PRs workflow |
| 1.2.1 | 2025-12-24 | Added: Related Standards section |
| 1.2.0 | 2025-12-16 | Added: Decision tree, selection matrix |
| 1.1.0 | 2025-12-08 | Add pre-branch checklist section |
| 1.0.0 | 2025-11-12 | Initial Git workflow standard |

---

## License

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
