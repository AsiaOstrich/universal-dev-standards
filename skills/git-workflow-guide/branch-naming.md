# Branch Naming Reference

> **Language**: English | [繁體中文](../../locales/zh-TW/skills/git-workflow-guide/branch-naming.md)

**Version**: 1.0.0
**Last Updated**: 2025-12-24
**Applicability**: Claude Code Skills

---

## Purpose

This document provides reference for Git branch naming conventions and rules.

---

## Standard Format

```
<type>/<short-description>
```

---

## Branch Types

### Feature Branches

| Type | Usage | Example |
|------|-------|---------|
| `feature/` | New functionality | `feature/oauth-login` |
| `feat/` | Short form | `feat/user-dashboard` |

### Fix Branches

| Type | Usage | Example |
|------|-------|---------|
| `fix/` | Bug fixes | `fix/memory-leak` |
| `bugfix/` | Alternative form | `bugfix/login-error` |
| `hotfix/` | Urgent production fixes | `hotfix/security-patch` |

### Other Types

| Type | Usage | Example |
|------|-------|---------|
| `refactor/` | Code refactoring | `refactor/extract-service` |
| `docs/` | Documentation only | `docs/api-reference` |
| `test/` | Test additions | `test/integration-tests` |
| `chore/` | Maintenance tasks | `chore/update-deps` |
| `perf/` | Performance | `perf/optimize-query` |
| `style/` | Formatting | `style/code-format` |
| `ci/` | CI/CD changes | `ci/add-coverage` |
| `release/` | Release preparation | `release/v1.2.0` |

---

## Naming Rules

### Do

1. **Use lowercase**
   ```bash
   feature/user-auth    # ✅ Good
   Feature/User-Auth    # ❌ Bad
   ```

2. **Use hyphens for spaces**
   ```bash
   feature/oauth-login  # ✅ Good
   feature/oauth_login  # ❌ Bad (underscores)
   feature/oauthlogin   # ❌ Bad (no separator)
   ```

3. **Be descriptive but concise**
   ```bash
   feature/add-user-authentication  # ✅ Good
   feature/auth                     # ⚠️ Too vague
   feature/add-new-user-authentication-with-oauth2-and-jwt  # ❌ Too long
   ```

4. **Include issue number (optional)**
   ```bash
   feature/123-oauth-login   # ✅ Good
   feature/GH-123-oauth      # ✅ Good (GitHub issue)
   feature/JIRA-456-payment  # ✅ Good (Jira ticket)
   ```

### Don't

1. **Don't use only issue numbers**
   ```bash
   feature/123       # ❌ Not descriptive
   fix/456           # ❌ What does it fix?
   ```

2. **Don't use special characters**
   ```bash
   feature/oauth@login  # ❌ @ not allowed
   feature/auth#123     # ❌ # not allowed
   ```

3. **Don't use spaces**
   ```bash
   feature/oauth login  # ❌ Spaces not allowed
   ```

---

## Examples

### Good Examples

```bash
# Feature branches
feature/user-authentication
feature/oauth2-google-login
feature/123-add-payment-gateway
feat/dashboard-analytics

# Fix branches
fix/null-pointer-payment
fix/memory-leak-session-cache
bugfix/login-redirect-loop
hotfix/critical-data-loss

# Other branches
refactor/database-connection-pool
docs/update-installation-guide
test/add-integration-tests
chore/update-dependencies
perf/optimize-database-queries
release/v1.2.0
```

### Bad Examples

```bash
# ❌ Not descriptive
feature/123
fix/bug
update

# ❌ Wrong case
Feature/OAuth-Login
FIX/Memory-Leak
HOTFIX/security

# ❌ Wrong separators
feature/oauth_login
feature/oauth.login
feature/oauth login

# ❌ No type prefix
oauth-login
user-authentication
memory-leak-fix

# ❌ Too vague
feature/update
fix/issue
chore/stuff

# ❌ Too long
feature/add-new-user-authentication-system-with-oauth2-jwt-and-session-management
```

---

## Quick Validation

Before pushing, check your branch name:

```bash
# Check current branch name
git branch --show-current

# Validate format (should match pattern)
# <type>/<description>
# - type: feature, fix, bugfix, hotfix, refactor, docs, test, chore, perf, style, ci, release
# - description: lowercase, hyphen-separated, descriptive
```

### Validation Checklist

- [ ] Starts with valid type prefix (`feature/`, `fix/`, etc.)
- [ ] All lowercase
- [ ] Uses hyphens (not underscores or spaces)
- [ ] Descriptive but concise (3-5 words ideal)
- [ ] No special characters (@, #, $, etc.)

---

## Related Standards

- [Git Workflow Strategies](./git-workflow.md)
- [Git Workflow](../../core/git-workflow.md)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-12-24 | Added: Standard sections (Purpose, Related Standards, Version History, License) |

---

## License

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
