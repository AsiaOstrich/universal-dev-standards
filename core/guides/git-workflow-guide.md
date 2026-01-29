# Git Workflow Guide

> **Language**: English | [繁體中文](../../locales/zh-TW/core/guides/git-workflow-guide.md)

**Version**: 1.0.0
**Last Updated**: 2026-01-29
**Related Standard**: [Git Workflow Standards](../git-workflow.md)

---

## Purpose

This guide provides detailed explanations, tutorials, and examples for Git workflow strategies. For actionable rules and checklists, see [Git Workflow Standards](../git-workflow.md).

---

## Table of Contents

1. [Workflow Selection Guide](#workflow-selection-guide)
2. [GitFlow Detailed Tutorial](#gitflow-detailed-tutorial)
3. [GitHub Flow Detailed Tutorial](#github-flow-detailed-tutorial)
4. [Trunk-Based Development Tutorial](#trunk-based-development-tutorial)
5. [Feature Flags Implementation](#feature-flags-implementation)
6. [Ship/Show/Ask Decision Model](#shipshowask-decision-model)
7. [Stacked PRs Workflow](#stacked-prs-workflow)
8. [Conventional PR Titles Guide](#conventional-pr-titles-guide)
9. [Git Commands Reference](#git-commands-reference)
10. [Troubleshooting Guide](#troubleshooting-guide)

---

## Workflow Selection Guide

### Decision Tree

Use this flowchart to select the appropriate workflow:

```
                    ┌─────────────────────────────────────┐
                    │ How often do you deploy to         │
                    │ production?                        │
                    └───────────────┬─────────────────────┘
                                    │
            ┌───────────────────────┼───────────────────────┐
            ▼                       ▼                       ▼
   ┌────────────────┐    ┌────────────────┐    ┌────────────────┐
   │ Multiple times │    │ Weekly to      │    │ Monthly or     │
   │ per day        │    │ bi-weekly      │    │ longer         │
   └───────┬────────┘    └───────┬────────┘    └───────┬────────┘
           │                     │                     │
           ▼                     ▼                     ▼
   ┌────────────────┐    ┌────────────────┐    ┌────────────────┐
   │ Trunk-Based    │    │ GitHub Flow    │    │ GitFlow        │
   │ Development    │    │                │    │                │
   └────────────────┘    └────────────────┘    └────────────────┘
```

### Selection Matrix

| Factor | GitFlow | GitHub Flow | Trunk-Based |
|--------|---------|-------------|-------------|
| **Release frequency** | Monthly+ | Weekly | Multiple/day |
| **Team size** | Large (10+) | Medium (5-15) | Small-Medium (3-10) |
| **CI/CD maturity** | Basic | Intermediate | Advanced |
| **Feature flags** | Optional | Optional | Required |
| **Hotfix process** | Dedicated branch | Same as feature | Same as feature |
| **Complexity** | High | Low | Medium |

### Quick Selection Guide

**Choose GitFlow if**:
- You have scheduled release cycles (monthly, quarterly)
- You maintain multiple production versions simultaneously
- You have separate teams for development and release management

**Choose GitHub Flow if**:
- You deploy to production weekly or on-demand
- You have a single production version
- You want simplicity with good traceability

**Choose Trunk-Based if**:
- You have mature CI/CD with automated testing
- Your team practices continuous integration
- You're comfortable with feature flags for incomplete features

### Workflow Selection Process

**Who Decides**: Tech Lead or Engineering Manager, in consultation with the team.

**When to Decide**:

| Project Phase | Action |
|---------------|--------|
| Project kickoff | Select initial workflow based on team size and release plan |
| First release | Review and confirm choice; lock for at least one release cycle |
| Major team change | Re-evaluate if team doubles or halves in size |
| Release cadence change | Re-evaluate if moving from monthly to weekly or vice versa |

**How to Document**:

1. **Record in project README** or CONTRIBUTING.md:
   ```markdown
   ## Git Workflow
   This project uses **GitHub Flow**.
   - Decision date: 2025-01-15
   - Decision maker: @techlead
   - Rationale: Weekly deployments, single production version
   ```

2. **Configure branch protection** rules to enforce the chosen workflow.

3. **Update onboarding docs** to reference the workflow choice.

**Changing Workflows**: Workflow changes should be treated as breaking changes. Announce at least one sprint in advance and provide migration documentation.

---

## GitFlow Detailed Tutorial

**Best For**:
- Scheduled releases (monthly, quarterly)
- Multiple production versions maintained simultaneously
- Clear distinction between development and production
- Large teams with formal release processes

### Branch Structure

```
main          ─●────────●─────────●── (Production releases: v1.0, v2.0)
               ╱          ╲         ╲
develop   ────●────●──────●─────────●── (Development mainline)
             ╱      ╲      ╲
feature/*  ─●────────●      ╲  (Feature branches)
                              ╲
release/*                      ●───● (Release preparation)
                                   ╱
hotfix/*                      ────● (Emergency fixes)
```

### Workflow Steps

#### 1. Feature Development

```bash
# Create feature branch from develop
git checkout develop
git pull origin develop
git checkout -b feature/oauth-login

# Work on feature
git add .
git commit -m "feat(auth): add OAuth2 login"

# Push to remote
git push -u origin feature/oauth-login

# Create pull request to develop
# After review approval, merge to develop
git checkout develop
git merge --no-ff feature/oauth-login
git push origin develop

# Delete feature branch
git branch -d feature/oauth-login
git push origin --delete feature/oauth-login
```

#### 2. Release Preparation

> **CHANGELOG Update**: Move entries from `[Unreleased]` to the new version section and add the release date. See [changelog-standards.md](../changelog-standards.md) for detailed guidelines.

```bash
# Create release branch from develop
git checkout develop
git pull origin develop
git checkout -b release/v1.2.0

# Prepare release (version bump, changelog, etc.)
# 1. Update CHANGELOG.md: move [Unreleased] to [1.2.0] - YYYY-MM-DD
# 2. Update version in package.json (or equivalent)
npm version 1.2.0
git add package.json CHANGELOG.md
git commit -m "chore(release): prepare v1.2.0"

# Merge to main
git checkout main
git merge --no-ff release/v1.2.0
git tag -a v1.2.0 -m "Release version 1.2.0"
git push origin main --tags

# Merge back to develop
git checkout develop
git merge --no-ff release/v1.2.0
git push origin develop

# Delete release branch
git branch -d release/v1.2.0
git push origin --delete release/v1.2.0
```

#### 3. Hotfix

```bash
# Create hotfix branch from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-security-fix

# Fix the issue
git add .
git commit -m "fix(security): patch SQL injection vulnerability"

# Merge to main
git checkout main
git merge --no-ff hotfix/critical-security-fix
git tag -a v1.2.1 -m "Hotfix version 1.2.1"
git push origin main --tags

# Merge to develop
git checkout develop
git merge --no-ff hotfix/critical-security-fix
git push origin develop

# Delete hotfix branch
git branch -d hotfix/critical-security-fix
git push origin --delete hotfix/critical-security-fix
```

---

## GitHub Flow Detailed Tutorial

**Best For**:
- Continuous deployment
- Web applications
- Small to medium teams
- Fast iteration cycles

### Branch Structure

```
main      ────●─────────●──────●── (Always deployable)
               ╲         ╱      ╱
feature/*       ●───●───●      ╱  (Feature + PR)
                              ╱
bugfix/*                 ────●  (Bug fixes)
```

### Workflow Steps

```bash
# 1. Create feature branch from main
git checkout main
git pull origin main
git checkout -b feature/user-profile

# 2. Work and commit frequently
git add .
git commit -m "feat(profile): add avatar upload"
git push -u origin feature/user-profile

# 3. Open pull request to main
# Use GitHub/GitLab UI to create PR

# 4. After CI passes and review approval, merge to main
# (Usually done via GitHub/GitLab UI with "Squash and merge")

# 5. Deploy main to production
git checkout main
git pull origin main
# Trigger deployment pipeline

# 6. Delete feature branch (auto-deleted by GitHub/GitLab)
```

### Key Principles

1. **`main` is always deployable**
2. **Branch from `main`**
3. **Merge to `main` via PR**
4. **Deploy immediately after merge**

---

## Trunk-Based Development Tutorial

**Best For**:
- Mature CI/CD pipelines
- High-trust, experienced teams
- Frequent integration (multiple times per day)
- Feature flags for incomplete features

### Branch Structure

```
main  ────●─●─●─●─●─●─●──► (Single long-lived branch)
           ╲│╱ ╲│╱ ╲│╱
feature/*   ●   ●   ●  (Very short-lived, ≤2 days)
```

### Workflow Steps

```bash
# 1. Create short-lived branch
git checkout main
git pull origin main
git checkout -b feature/add-validation

# 2. Make small, atomic change
git add .
git commit -m "feat(validation): add email format check"

# 3. Push and create PR (same day)
git push -u origin feature/add-validation

# 4. Merge quickly after review (within hours)
# Prefer rebase to keep linear history
git checkout main
git pull origin main
git rebase main feature/add-validation
git checkout main
git merge --ff-only feature/add-validation
git push origin main

# 5. Delete branch immediately
git branch -d feature/add-validation
git push origin --delete feature/add-validation
```

### Key Principles

1. **Integrate frequently** (multiple times per day)
2. **Keep branches short-lived** (≤2 days)
3. **Use feature flags** for incomplete features
4. **Automate everything** (tests, builds, deployments)

---

## Feature Flags Implementation

### Why Feature Flags Are Essential

Feature flags enable trunk-based development by decoupling **deployment** from **release**:

```
┌─────────────────────────────────────────────────────────────────┐
│                    Code Lifecycle                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Merge to main    Deploy to Prod    Enable for Users           │
│        │                │                   │                    │
│        ▼                ▼                   ▼                    │
│   ┌─────────┐      ┌─────────┐        ┌─────────┐              │
│   │ Commit  │─────►│ Deploy  │───────►│ Release │              │
│   │ (Code)  │      │ (Binary)│        │ (Users) │              │
│   └─────────┘      └─────────┘        └─────────┘              │
│                         │                   │                    │
│                         │    Feature Flag   │                    │
│                         └───────────────────┘                    │
│                              (Decoupled)                         │
└─────────────────────────────────────────────────────────────────┘
```

### Implementation Patterns

**Basic Toggle**:

```javascript
// Simple on/off flag
if (featureFlags.isEnabled('new-checkout-flow')) {
  return newCheckoutFlow(cart);
} else {
  return legacyCheckoutFlow(cart);
}
```

**Gradual Rollout**:

```javascript
// Percentage-based rollout
const flag = featureFlags.get('new-checkout-flow');
if (flag.isEnabledForPercentage(user.id, 10)) {
  // 10% of users see new flow
  return newCheckoutFlow(cart);
}
```

**User Segment Targeting**:

```javascript
// Target specific user segments
if (featureFlags.isEnabledFor('new-checkout-flow', {
  userId: user.id,
  plan: user.plan,        // e.g., 'enterprise'
  region: user.region,    // e.g., 'asia-pacific'
  betaTester: user.isBetaTester
})) {
  return newCheckoutFlow(cart);
}
```

### Feature Flag Lifecycle

| Phase | Flag State | Action |
|-------|------------|--------|
| Development | Off | Code merged but hidden |
| Internal Testing | On for team | QA and dogfooding |
| Beta | On for beta users | Gather feedback |
| Gradual Rollout | 1% → 10% → 50% → 100% | Monitor metrics |
| Full Release | On for all | Default behavior |
| Cleanup | Flag removed | Technical debt cleanup |

### Flag Hygiene Best Practices

1. **Name flags descriptively**: `enable-new-checkout-v2` not `flag-123`
2. **Set expiration dates**: Review and remove stale flags
3. **Limit active flags**: Too many flags = complexity
4. **Document flag purpose**: What, why, when to remove

```javascript
// Flag metadata example
{
  "name": "enable-new-checkout-v2",
  "description": "New checkout flow with improved UX",
  "owner": "checkout-team",
  "createdAt": "2026-01-15",
  "targetRemovalDate": "2026-03-15",
  "status": "gradual-rollout"
}
```

---

## Ship/Show/Ask Decision Model

### Overview

Not all changes need the same review process. The Ship/Show/Ask model helps teams decide:

```
┌─────────────────────────────────────────────────────────────────┐
│                    Ship / Show / Ask                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   SHIP                SHOW                ASK                    │
│   ────                ────                ───                    │
│   Push directly       Merge, then         Open PR, wait          │
│   to main            notify team         for approval            │
│                                                                  │
│   Low risk           Medium risk         High risk               │
│   High confidence    Need awareness      Need discussion         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### When to Ship (Direct Push)

**Criteria**:
- Small, low-risk changes
- High confidence in correctness
- Easy to revert if wrong
- Strong test coverage

**Examples**:
- Typo fixes in documentation
- Adding debug logging
- Updating dependencies (with CI passing)
- Config changes (non-breaking)
- Obvious bug fixes with tests

```bash
# Ship: Direct push to main
git checkout main
git pull origin main
# Make small change
git add .
git commit -m "fix: correct typo in error message"
git push origin main
```

### When to Show (Merge, Then Notify)

**Criteria**:
- Team should be aware
- Code review is nice-to-have, not blocking
- Changes are straightforward
- You want feedback but not blocking approval

**Examples**:
- Refactoring that improves code quality
- Adding tests for existing functionality
- Non-critical feature enhancements
- Updating internal documentation

```bash
# Show: Merge and notify
git checkout -b refactor/extract-validation
# Make changes
git add .
git commit -m "refactor: extract validation logic"
git push origin refactor/extract-validation

# Create PR and immediately merge (no blocking review)
gh pr create --title "refactor: extract validation logic" --body "FYI: Extracting validation for reuse"
gh pr merge --auto --squash

# Notify team in Slack/Teams
```

### When to Ask (PR with Blocking Review)

**Criteria**:
- Architectural decisions
- Breaking changes
- Security-sensitive code
- New patterns or conventions
- Changes you're uncertain about

**Examples**:
- New API endpoints
- Database schema changes
- Authentication/authorization changes
- Changes to shared libraries
- Performance-critical code

```bash
# Ask: Full PR process
git checkout -b feature/new-auth-flow
# Make changes
git push origin feature/new-auth-flow

# Create PR and request review
gh pr create --title "feat(auth): implement OAuth2 PKCE flow" \
  --body "## What\nNew authentication flow\n\n## Why\nImproved security" \
  --reviewer security-team,backend-team
```

### Decision Flowchart

```
┌────────────────────────────────────────┐
│ Is this change risky or complex?       │
└────────────────────┬───────────────────┘
                     │
         ┌───────────┴───────────┐
         ▼                       ▼
        YES                      NO
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌────────────────────────┐
│ Does it need    │    │ Should team be aware?  │
│ discussion?     │    └───────────┬────────────┘
└────────┬────────┘                │
         │                ┌────────┴────────┐
    ┌────┴────┐           ▼                 ▼
    ▼         ▼          YES                NO
   YES        NO          │                 │
    │         │           ▼                 ▼
    ▼         ▼     ┌──────────┐      ┌──────────┐
┌───────┐ ┌───────┐ │   SHOW   │      │   SHIP   │
│  ASK  │ │  ASK  │ │ (notify) │      │ (direct) │
│(review)│ │(review)│ └──────────┘      └──────────┘
└───────┘ └───────┘
```

---

## Stacked PRs Workflow

### What Are Stacked PRs?

Stacked PRs break large features into smaller, dependent pull requests that can be reviewed incrementally:

```
┌─────────────────────────────────────────────────────────────────┐
│                    Stacked PRs Structure                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   main ────●─────────────────────────────────────────►          │
│             ╲                                                    │
│              PR #1 (Database schema) ────●                       │
│                                           ╲                      │
│                                            PR #2 (API) ────●     │
│                                                            ╲     │
│                                                      PR #3 (UI) ●│
│                                                                  │
│   Review: PR #1 first, then #2, then #3                         │
│   Merge: PR #1 → PR #2 → PR #3                                  │
└─────────────────────────────────────────────────────────────────┘
```

### When to Use Stacked PRs

| Scenario | Stacked PRs Recommended |
|----------|-------------------------|
| Feature > 500 lines | Yes |
| Multiple logical components | Yes |
| Need early feedback | Yes |
| Simple bug fix | No, use single PR |
| Independent changes | No, use parallel PRs |

### Creating Stacked PRs

**Step 1: Plan the Stack**

```
Feature: User Authentication
├── PR #1: Database schema for users table
├── PR #2: User service and repository
├── PR #3: REST API endpoints
└── PR #4: Frontend login form
```

**Step 2: Create Base Branch**

```bash
# Start from main
git checkout main
git pull origin main

# Create first PR branch
git checkout -b feature/auth-1-schema
# Make database changes
git add .
git commit -m "feat(db): add users table schema"
git push origin feature/auth-1-schema
```

**Step 3: Stack Next Branch**

```bash
# Branch from previous, NOT from main
git checkout -b feature/auth-2-service feature/auth-1-schema
# Make service changes
git add .
git commit -m "feat(auth): add user service"
git push origin feature/auth-2-service
```

**Step 4: Create Linked PRs**

```bash
# PR #1: Against main
gh pr create --base main --head feature/auth-1-schema \
  --title "feat(db): add users table schema" \
  --body "Part 1/4 of user authentication feature"

# PR #2: Against PR #1's branch
gh pr create --base feature/auth-1-schema --head feature/auth-2-service \
  --title "feat(auth): add user service" \
  --body "Part 2/4 - depends on #1"
```

### Handling Updates to Base PR

When PR #1 changes after PR #2 was created:

```bash
# Rebase PR #2 on updated PR #1
git checkout feature/auth-2-service
git fetch origin
git rebase origin/feature/auth-1-schema
git push --force-with-lease origin feature/auth-2-service
```

### Merging Stacked PRs

```bash
# Merge in order
# 1. Merge PR #1 to main (squash or merge commit)
gh pr merge 1 --squash

# 2. Update PR #2 base to main (GitHub auto-updates)
# 3. Merge PR #2 to main
gh pr merge 2 --squash

# Continue for remaining PRs...
```

### Tools for Stacked PRs

| Tool | Description |
|------|-------------|
| [Graphite](https://graphite.dev/) | Purpose-built for stacked PRs |
| [ghstack](https://github.com/ezyang/ghstack) | CLI for stacking PRs |
| [git-branchless](https://github.com/arxanas/git-branchless) | Advanced git workflows |
| Manual | Use git rebase and gh CLI |

---

## Conventional PR Titles Guide

### Format

PR titles should follow the same format as commit messages:

```
<type>(<scope>): <subject>
```

### Type Reference

| Type | Purpose | Example |
|------|---------|---------|
| `feat` | New feature | `feat(auth): add OAuth2 login` |
| `fix` | Bug fix | `fix(api): handle null response` |
| `docs` | Documentation | `docs(readme): update install steps` |
| `refactor` | Code refactoring | `refactor(utils): extract validation` |
| `test` | Adding tests | `test(auth): add login unit tests` |
| `chore` | Maintenance | `chore(deps): update lodash to 4.17.21` |
| `perf` | Performance | `perf(query): optimize user lookup` |
| `style` | Code style | `style(lint): fix eslint warnings` |
| `ci` | CI/CD changes | `ci(actions): add caching step` |
| `build` | Build system | `build(webpack): upgrade to v5` |

### Breaking Changes

Indicate breaking changes with `!` after type:

```
feat(api)!: change response format for users endpoint
```

### PR Title Best Practices

**Good Examples**:
```
feat(checkout): add Apple Pay support
fix(auth): prevent session fixation attack
refactor(orders): extract shipping calculator
docs(api): document rate limiting headers
chore(deps): update security patches
```

**Bad Examples**:
```
❌ Update code                    (too vague)
❌ fix bug                        (not descriptive)
❌ WIP: working on auth          (WIP shouldn't be in title)
❌ JIRA-1234                      (no description)
❌ Final fixes                    (meaningless)
```

### Automated Enforcement

Configure GitHub Actions to validate PR titles:

```yaml
# .github/workflows/pr-title.yml
name: PR Title Check
on:
  pull_request:
    types: [opened, edited, synchronize]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: amannn/action-semantic-pull-request@v5
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          types: |
            feat
            fix
            docs
            refactor
            test
            chore
            perf
            style
            ci
            build
          requireScope: false
          subjectPattern: ^[A-Z].+$
          subjectPatternError: |
            Subject must start with uppercase letter
```

---

## Git Commands Reference

### Daily Operations

```bash
# Check status
git status

# View changes
git diff
git diff --staged

# Stage changes
git add file.js
git add .

# Commit
git commit -m "feat: add feature"

# Push
git push origin feature/my-feature

# Pull latest
git pull origin main

# View history
git log --oneline --graph --all
```

### Branch Operations

```bash
# List branches
git branch -a

# Create branch
git checkout -b feature/new-feature

# Switch branch
git checkout main

# Delete local branch
git branch -d feature/old-feature

# Delete remote branch
git push origin --delete feature/old-feature

# Rename branch
git branch -m old-name new-name
```

### Advanced Operations

```bash
# Stash changes
git stash
git stash pop

# Cherry-pick commit
git cherry-pick <commit-hash>

# Revert commit
git revert <commit-hash>

# Reset to previous commit (dangerous!)
git reset --hard <commit-hash>

# Amend last commit
git commit --amend

# Interactive rebase (clean up commits)
git rebase -i HEAD~3
```

---

## Troubleshooting Guide

### Accidentally Committed to Wrong Branch

```bash
# Undo last commit but keep changes
git reset --soft HEAD~1

# Switch to correct branch
git checkout correct-branch

# Commit changes
git add .
git commit -m "feat: add feature"
```

### Need to Update Branch from Main

```bash
# Option 1: Merge (preserves history)
git checkout feature/my-feature
git merge main

# Option 2: Rebase (cleaner history)
git checkout feature/my-feature
git rebase main
```

### Accidentally Force Pushed to Protected Branch

```bash
# ⚠️ Contact team immediately
# ⚠️ Check if branch protection was enabled
# ⚠️ Restore from reflog if needed:
git reflog
git reset --hard <previous-commit-hash>
```

---

## Project Configuration Template

Document your workflow in `CONTRIBUTING.md`:

```markdown
## Git Workflow

### Branching Strategy
This project uses **[GitFlow / GitHub Flow / Trunk-Based Development]**.

### Branch Types
- `main`: Production code
- `develop`: Development mainline (GitFlow only)
- `feature/*`: New features
- `fix/*`: Bug fixes
- `hotfix/*`: Urgent production fixes

### Branch Naming
Format: `<type>/<description>`
Example: `feature/oauth-login`, `fix/memory-leak`

### Merge Strategy
- Feature branches: **[Squash / Merge commit / Rebase]**
- Release branches: Merge commit (--no-ff)
- Hotfix branches: Merge commit (--no-ff)

### Protected Branches
- `main`: Requires 1 review, CI must pass
- `develop`: Requires 1 review (if using GitFlow)

### Pull Request Process
1. Create branch from `[main/develop]`
2. Make changes and push
3. Open PR with description
4. Wait for review approval
5. Ensure CI passes
6. Merge using **[strategy]**
```

---

## References

- [GitFlow Original Article](https://nvie.com/posts/a-successful-git-branching-model/)
- [GitHub Flow Guide](https://guides.github.com/introduction/flow/)
- [Trunk-Based Development](https://trunkbaseddevelopment.com/)
- [Semantic Versioning](https://semver.org/)
- [Ship/Show/Ask](https://martinfowler.com/articles/ship-show-ask.html) - Rouan Wilsenach's decision model for code changes
- [Feature Flags Best Practices](https://launchdarkly.com/blog/best-practices-feature-flags/) - LaunchDarkly's comprehensive guide
- [Stacked Diffs](https://graphite.dev/guides/stacked-diffs) - Graphite's guide to stacked PR workflow
- [Conventional Commits](https://www.conventionalcommits.org/) - Specification for commit messages

---

## License

This guide is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
