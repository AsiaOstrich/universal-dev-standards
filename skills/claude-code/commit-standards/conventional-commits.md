# Conventional Commits Guide

## Format Structure

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Components

| Component | Required | Description |
|-----------|----------|-------------|
| `type` | ✅ Yes | Type of change |
| `scope` | Optional | Module/component affected |
| `subject` | ✅ Yes | Brief description (≤72 chars) |
| `body` | Recommended | Detailed explanation |
| `footer` | Optional | Issue references, breaking changes |

---

## Commit Types

### Primary Types

| Type | When to Use | Example |
|------|-------------|----------|
| `feat` | New feature for the user | `feat(cart): Add quantity selector` |
| `fix` | Bug fix for the user | `fix(login): Resolve password reset loop` |
| `docs` | Documentation only | `docs(api): Add authentication examples` |
| `refactor` | Code change without feature/fix | `refactor(utils): Simplify date formatting` |

### Secondary Types

| Type | When to Use | Example |
|------|-------------|----------|
| `style` | Formatting, whitespace | `style: Apply prettier formatting` |
| `test` | Adding/updating tests | `test(auth): Add login integration tests` |
| `perf` | Performance improvement | `perf(query): Add database index` |
| `build` | Build system, dependencies | `build(deps): Upgrade React to v18` |
| `ci` | CI/CD pipeline | `ci: Add deploy workflow` |
| `chore` | Maintenance tasks | `chore: Update .gitignore` |
| `revert` | Revert commit | `revert: Revert "feat(auth): Add SSO"` |
| `security` | Security fix | `security(auth): Fix XSS vulnerability` |

---

## Scope Guidelines

### Naming Rules

1. **Use lowercase**: `auth`, not `Auth`
2. **Use hyphen for multi-word**: `user-profile`, not `userProfile`
3. **Keep it short**: 1-2 words maximum

### Common Scopes

**By Layer**:
- `api`, `ui`, `database`, `config`, `middleware`

**By Feature**:
- `auth`, `login`, `payment`, `notification`, `search`

**By File Type**:
- `tests`, `docs`, `build`, `deps`

**Special**:
- `*`: Multiple scopes affected
- (no scope): Global changes

---

## Subject Line Rules

1. **Length**: ≤72 characters (50 ideal)
2. **Tense**: Imperative mood
   - ✅ "Add feature" 
   - ❌ "Added feature"
3. **Capitalization**: First letter capitalized
4. **No period**: Don't end with period
5. **Be specific**: Describe what changed

### Examples

```
✅ feat(auth): Add OAuth2 Google login support
✅ fix(api): Resolve memory leak in session cache
✅ refactor(database): Extract query builder class

❌ fixed bug                    # Vague, past tense
❌ feat(auth): added login.     # Past tense, period
❌ Update stuff                 # Too vague
```

---

## Body Guidelines

Explain **WHY**, not **WHAT** (code shows what).

### Templates

**For Features**:
```
Why this feature is needed:
- Reason 1
- Reason 2

What this implements:
- Implementation detail 1
- Implementation detail 2
```

**For Bug Fixes**:
```
Why this occurred:
- Root cause explanation

What this fix does:
- Solution description

Testing:
- How it was tested
```

**For Refactoring**:
```
Why this refactoring:
- Motivation

What this changes:
- Changes description

Migration:
- Migration steps if needed
```

---

## Footer Guidelines

### Issue References

```
Closes #123     # Automatically closes issue
Fixes #456      # Automatically closes issue
Resolves #789   # Automatically closes issue
Refs #101       # Links without closing
See also #999   # Related reference
```

### Breaking Changes

```
BREAKING CHANGE: <description>

Migration guide:
- Step 1
- Step 2
```

---

## Complete Example

```
feat(export): Add CSV export functionality for user data

Why this feature is needed:
- Admins need to export user lists for compliance audits
- Manual copy-paste from UI is error-prone
- Requested by legal and compliance teams

What this implements:
- New /api/users/export endpoint
- CSV generation using csv-writer library
- Streaming response for large datasets
- Date range filtering options

Technical notes:
- Streaming prevents memory issues with 100k+ users
- Export limited to admin role only
- Rate limited to prevent abuse

Closes #567
Refs #234 (related compliance requirement)
```

---

## Anti-Patterns

### ❌ Vague Messages

```
fix: bug fix
refactor: code improvements
update: changes
```

### ❌ Mixing Multiple Concerns

```
feat: add login, fix bugs, refactor database
```

**Fix**: Split into separate commits.

### ❌ Implementation Details in Subject

```
fix: change line 45 from getUserById to getUserByEmail
```

**Fix**: Focus on purpose, not implementation.

---

**License**: CC BY 4.0 | **Source**: [universal-doc-standards](https://github.com/AsiaOstrich/universal-doc-standards)
