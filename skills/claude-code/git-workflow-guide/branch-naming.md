# Branch Naming Reference
# 分支命名參考

## Standard Format | 標準格式

```
<type>/<short-description>
```

---

## Branch Types | 分支類型

### Feature Branches | 功能分支

| Type | Usage | Example |
|------|-------|---------|
| `feature/` | New functionality | `feature/oauth-login` |
| `feat/` | Short form | `feat/user-dashboard` |

### Fix Branches | 修復分支

| Type | Usage | Example |
|------|-------|---------|
| `fix/` | Bug fixes | `fix/memory-leak` |
| `bugfix/` | Alternative form | `bugfix/login-error` |
| `hotfix/` | Urgent production fixes | `hotfix/security-patch` |

### Other Types | 其他類型

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

## Naming Rules | 命名規則

### Do | 應該

1. **Use lowercase** | 使用小寫
   ```bash
   feature/user-auth    # ✅ Good
   Feature/User-Auth    # ❌ Bad
   ```

2. **Use hyphens for spaces** | 使用連字號分隔單詞
   ```bash
   feature/oauth-login  # ✅ Good
   feature/oauth_login  # ❌ Bad (underscores)
   feature/oauthlogin   # ❌ Bad (no separator)
   ```

3. **Be descriptive but concise** | 具描述性但簡潔
   ```bash
   feature/add-user-authentication  # ✅ Good
   feature/auth                     # ⚠️ Too vague
   feature/add-new-user-authentication-with-oauth2-and-jwt  # ❌ Too long
   ```

4. **Include issue number (optional)** | 包含 issue 編號（可選）
   ```bash
   feature/123-oauth-login   # ✅ Good
   feature/GH-123-oauth      # ✅ Good (GitHub issue)
   feature/JIRA-456-payment  # ✅ Good (Jira ticket)
   ```

### Don't | 不應該

1. **Don't use only issue numbers** | 不要只用 issue 編號
   ```bash
   feature/123       # ❌ Not descriptive
   fix/456           # ❌ What does it fix?
   ```

2. **Don't use special characters** | 不要使用特殊字元
   ```bash
   feature/oauth@login  # ❌ @ not allowed
   feature/auth#123     # ❌ # not allowed
   ```

3. **Don't use spaces** | 不要使用空格
   ```bash
   feature/oauth login  # ❌ Spaces not allowed
   ```

---

## Examples | 範例

### Good Examples | 良好範例

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

### Bad Examples | 不良範例

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

## Quick Validation | 快速驗證

Before pushing, check your branch name:

```bash
# Check current branch name
git branch --show-current

# Validate format (should match pattern)
# <type>/<description>
# - type: feature, fix, bugfix, hotfix, refactor, docs, test, chore, perf, style, ci, release
# - description: lowercase, hyphen-separated, descriptive
```

### Validation Checklist | 驗證清單

- [ ] Starts with valid type prefix (`feature/`, `fix/`, etc.)
- [ ] All lowercase
- [ ] Uses hyphens (not underscores or spaces)
- [ ] Descriptive but concise (3-5 words ideal)
- [ ] No special characters (@, #, $, etc.)

---

**License**: CC BY 4.0 | **Source**: [universal-doc-standards](https://github.com/AsiaOstrich/universal-doc-standards)
