# Git Workflow Strategies
# Git 工作流程策略

## Strategy Selection Matrix | 策略選擇矩陣

| Factor | GitFlow | GitHub Flow | Trunk-Based |
|--------|---------|-------------|-------------|
| **Release frequency** | Monthly+ | Weekly | Multiple/day |
| **Team size** | Large (10+) | Medium (5-15) | Small-Medium (3-10) |
| **CI/CD maturity** | Basic | Intermediate | Advanced |
| **Feature flags** | Optional | Optional | Required |
| **Complexity** | High | Low | Medium |

---

## Strategy A: GitFlow

**Best For**: Scheduled releases, multiple production versions, large teams

### Branch Structure

```
main          ─●────────●─────────●── (Production: v1.0, v2.0)
               ╱          ╲         ╲
develop   ────●────●──────●─────────●── (Development)
             ╱      ╲      ╲
feature/*  ─●────────●      ╲  (Features)
                              ╲
release/*                      ●───● (Release prep)
                                   ╱
hotfix/*                      ────● (Emergency fixes)
```

### Branch Types

| Branch | Purpose | Base | Merge To | Lifetime |
|--------|---------|------|----------|----------|
| `main` | Production code | - | - | Permanent |
| `develop` | Integration | - | - | Permanent |
| `feature/*` | New features | `develop` | `develop` | Temporary |
| `release/*` | Release prep | `develop` | `main` + `develop` | Temporary |
| `hotfix/*` | Urgent fixes | `main` | `main` + `develop` | Temporary |

### Feature Development Flow

```bash
# Create from develop
git checkout develop
git pull origin develop
git checkout -b feature/oauth-login

# Work and commit
git add .
git commit -m "feat(auth): add OAuth2 login"
git push -u origin feature/oauth-login

# After PR approval, merge to develop
git checkout develop
git merge --no-ff feature/oauth-login
git push origin develop

# Delete feature branch
git branch -d feature/oauth-login
git push origin --delete feature/oauth-login
```

### Release Flow

```bash
# Create release branch
git checkout develop
git checkout -b release/v1.2.0

# Prepare release (bump version, update changelog)
npm version 1.2.0
git add package.json CHANGELOG.md
git commit -m "chore(release): prepare v1.2.0"

# Merge to main
git checkout main
git merge --no-ff release/v1.2.0
git tag -a v1.2.0 -m "Release v1.2.0"
git push origin main --tags

# Merge back to develop
git checkout develop
git merge --no-ff release/v1.2.0
git push origin develop

# Delete release branch
git branch -d release/v1.2.0
```

### Hotfix Flow

```bash
# Create from main
git checkout main
git checkout -b hotfix/critical-fix

# Fix and commit
git add .
git commit -m "fix(security): patch vulnerability"

# Merge to main
git checkout main
git merge --no-ff hotfix/critical-fix
git tag -a v1.2.1 -m "Hotfix v1.2.1"
git push origin main --tags

# Merge to develop
git checkout develop
git merge --no-ff hotfix/critical-fix
git push origin develop
```

---

## Strategy B: GitHub Flow

**Best For**: Continuous deployment, web apps, small-medium teams

### Branch Structure

```
main      ────●─────────●──────●── (Always deployable)
               ╲         ╱      ╱
feature/*       ●───●───●      ╱
                              ╱
bugfix/*                 ────●
```

### Branch Types

| Branch | Purpose | Base | Merge To | Lifetime |
|--------|---------|------|----------|----------|
| `main` | Production | - | - | Permanent |
| `feature/*` | Features | `main` | `main` | Temporary |
| `bugfix/*` | Bug fixes | `main` | `main` | Temporary |

### Workflow

```bash
# 1. Create from main
git checkout main
git pull origin main
git checkout -b feature/user-profile

# 2. Work and push
git add .
git commit -m "feat(profile): add avatar"
git push -u origin feature/user-profile

# 3. Open PR to main (via GitHub/GitLab UI)

# 4. After approval and CI pass, merge (squash recommended)

# 5. Deploy main to production

# 6. Delete branch (auto or manual)
```

### Key Principles

1. `main` is **always deployable**
2. Branch from `main`
3. Merge to `main` via PR
4. Deploy immediately after merge

---

## Strategy C: Trunk-Based Development

**Best For**: Mature CI/CD, high-trust teams, frequent integration

### Branch Structure

```
main  ────●─●─●─●─●─●─●──► (Single trunk)
           ╲│╱ ╲│╱ ╲│╱
feature/*   ●   ●   ●  (Very short-lived, ≤2 days)
```

### Branch Types

| Branch | Purpose | Base | Merge To | Lifetime |
|--------|---------|------|----------|----------|
| `main` | Trunk | - | - | Permanent |
| `feature/*` | Small changes | `main` | `main` | ≤2 days |

### Workflow

```bash
# 1. Create short-lived branch
git checkout main
git pull origin main
git checkout -b feature/add-validation

# 2. Small, atomic change
git add .
git commit -m "feat(validation): add email check"
git push -u origin feature/add-validation

# 3. Quick PR and merge (same day)
git checkout main
git pull origin main
git rebase main feature/add-validation
git checkout main
git merge --ff-only feature/add-validation
git push origin main

# 4. Delete immediately
git branch -d feature/add-validation
```

### Key Principles

1. Integrate **multiple times per day**
2. Branches live **≤2 days**
3. Use **feature flags** for incomplete features
4. **Automate everything**

---

## Merge Strategies Comparison | 合併策略比較

### Merge Commit (`--no-ff`)

```bash
git merge --no-ff feature/user-auth
```

**Pros**: Complete history, easy to revert features
**Cons**: Complex git log
**Best For**: GitFlow, long-lived features

### Squash Merge

```bash
git merge --squash feature/user-auth
git commit -m "feat(auth): add user authentication"
```

**Pros**: Clean history, one commit per feature
**Cons**: Loses detailed history
**Best For**: GitHub Flow, feature PRs

### Rebase + Fast-Forward

```bash
git rebase main feature/user-auth
git checkout main
git merge --ff-only feature/user-auth
```

**Pros**: Linear history, preserves commits
**Cons**: Rewrites history
**Best For**: Trunk-Based, short-lived branches

---

## Protected Branch Recommendations

### For `main`

- ✅ Require pull request reviews (1-2)
- ✅ Require status checks (CI, tests, lint)
- ✅ Require up-to-date branches
- ❌ No force pushes
- ❌ No deletions

### For `develop` (GitFlow)

- ✅ Require pull request reviews (1)
- ✅ Require status checks
- ❌ No force pushes

---

**License**: CC BY 4.0 | **Source**: [universal-doc-standards](https://github.com/AsiaOstrich/universal-doc-standards)
