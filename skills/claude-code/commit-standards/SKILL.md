---
name: commit-standards
description: |
  Format commit messages following conventional commits standard.
  Use when: writing commit messages, git commit, reviewing commit history.
  Keywords: commit, git, message, conventional, 提交, 訊息, feat, fix, refactor.
---

# Commit Message Standards

This skill ensures consistent, meaningful commit messages following conventional commits.

## Quick Reference

### Basic Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Commit Types

| English | 中文 | When to Use |
|---------|------|-------------|
| `feat` | `新增` | New feature |
| `fix` | `修正` | Bug fix |
| `refactor` | `重構` | Code refactoring (no functional change) |
| `docs` | `文件` | Documentation only |
| `style` | `樣式` | Formatting (no code logic change) |
| `test` | `測試` | Adding or updating tests |
| `perf` | `效能` | Performance improvement |
| `build` | `建置` | Build system or dependencies |
| `ci` | `整合` | CI/CD pipeline changes |
| `chore` | `維護` | Maintenance tasks |
| `revert` | `回退` | Revert previous commit |
| `security` | `安全` | Security vulnerability fix |

### Subject Line Rules

1. **Length**: ≤72 characters (50 ideal)
2. **Tense**: Imperative mood ("Add feature" not "Added feature")
3. **Capitalization**: First letter capitalized
4. **No period**: Don't end with a period

## Detailed Guidelines

For complete standards, see:
- [Conventional Commits Guide](./conventional-commits.md)
- [Language Options](./language-options.md)

## Examples

### ✅ Good Examples (English)

```
feat(auth): Add OAuth2 Google login support
fix(api): Resolve memory leak in user session cache
refactor(database): Extract query builder to separate class
docs(readme): Update installation instructions for Node 20
```

### ✅ Good Examples (中文)

```
新增(認證): 實作 OAuth2 Google 登入支援
修正(API): 解決使用者 session 快取記憶體洩漏
重構(資料庫): 提取查詢建構器為獨立類別
```

### ✅ Good Example (Bilingual)

```
feat(auth): Add OAuth2 Google login support. 新增 OAuth2 Google 登入支援。

Implement Google OAuth2 authentication flow for user login.

實作 Google OAuth2 認證流程供使用者登入。

Closes #123
```

### ❌ Bad Examples

```
fixed bug                    # Too vague, no scope
feat(auth): added google login  # Past tense
Update stuff.                # Period, vague
WIP                          # Not descriptive
```

## Body Guidelines

Use the body to explain **WHY** the change was made:

```
fix(api): Resolve race condition in concurrent user updates

Why this occurred:
- Two simultaneous PUT requests could overwrite each other
- No optimistic locking implemented

What this fix does:
- Add version field to User model
- Return 409 Conflict if version mismatch

Fixes #789
```

## Breaking Changes

Always document breaking changes in footer:

```
feat(api): Change user endpoint response format

BREAKING CHANGE: User API response format changed

Migration guide:
1. Update API clients to remove .data wrapper
2. Use created_at instead of createdAt
```

## Issue References

```
Closes #123    # Automatically closes issue
Fixes #456     # Automatically closes issue
Refs #789      # Links without closing
```

---

## Configuration Detection

This skill supports project-specific language configuration.

### Detection Order

1. Check `CONTRIBUTING.md` for "Commit Message Language" section
2. If found, use the specified option (English / Traditional Chinese / Bilingual)
3. If not found, **default to English** for maximum tool compatibility

### First-Time Setup

If no configuration found and context is unclear:

1. Ask the user: "This project hasn't configured commit message language preference. Which option would you like to use? (English / 中文 / Bilingual)"
2. After user selection, suggest documenting in `CONTRIBUTING.md`:

```markdown
## Commit Message Language

This project uses **[chosen option]** commit types.
<!-- Options: English | Traditional Chinese | Bilingual -->
```

### Configuration Example

In project's `CONTRIBUTING.md`:

```markdown
## Commit Message Language

This project uses **English** commit types.

### Allowed Types
feat, fix, refactor, docs, style, test, perf, build, ci, chore, revert, security
```

---

**License**: CC BY 4.0 | **Source**: [universal-doc-standards](https://github.com/AsiaOstrich/universal-doc-standards)
