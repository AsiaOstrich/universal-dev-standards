# English Commit Messages

> **Language**: English | [繁體中文](../../locales/zh-TW/options/commit-message/english.md)

**Parent Standard**: [Commit Message Guide](../../core/commit-message-guide.md)

---

## Overview

This option defines standards for writing commit messages entirely in English. English is the most widely used language in software development, making commits accessible to the global developer community.

## Best For

- International teams
- Open source projects
- Projects with external contributors
- Organizations with English as corporate language
- Projects seeking maximum accessibility

## Format

### Basic Structure

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Components

| Component | Required | Description |
|-----------|----------|-------------|
| type | Yes | Category of change (feat, fix, docs, etc.) |
| scope | No | Module or component affected |
| subject | Yes | Brief description (imperative mood) |
| body | No | Detailed explanation |
| footer | No | References, breaking changes |

## Commit Types

| Type | Description | Example |
|------|-------------|---------|
| `feat` | New feature | `feat: add user authentication` |
| `fix` | Bug fix | `fix: resolve login timeout issue` |
| `docs` | Documentation | `docs: update API reference` |
| `style` | Formatting | `style: fix indentation in utils` |
| `refactor` | Code restructure | `refactor: simplify validation logic` |
| `perf` | Performance | `perf: optimize database queries` |
| `test` | Tests | `test: add unit tests for auth module` |
| `chore` | Maintenance | `chore: update dependencies` |
| `ci` | CI/CD changes | `ci: add GitHub Actions workflow` |
| `build` | Build system | `build: configure webpack for production` |

## Writing Guidelines

### Subject Line

1. **Use imperative mood**: "Add feature" not "Added feature"
2. **Don't capitalize first letter**: "add feature" not "Add feature" (after colon)
3. **No period at end**: "add feature" not "add feature."
4. **Keep under 50 characters**: Be concise
5. **Be specific**: "fix null pointer in user service" not "fix bug"

### Body

1. **Wrap at 72 characters**: For readability in terminals
2. **Explain what and why**: Not how (code shows how)
3. **Use bullet points**: For multiple changes
4. **Separate from subject**: With blank line

### Footer

1. **Reference issues**: `Closes #123`, `Fixes #456`
2. **Note breaking changes**: `BREAKING CHANGE: description`
3. **Add co-authors**: `Co-authored-by: Name <email>`

## Examples

### Simple Feature

```
feat(auth): add password strength indicator

- Display strength bar during password input
- Show requirements as user types
- Prevent submission of weak passwords

Closes #234
```

### Bug Fix

```
fix(api): handle null response from payment gateway

The payment gateway occasionally returns null instead of an error
object when the service is degraded. This caused unhandled exceptions
in the checkout flow.

Added null check and appropriate error handling to gracefully
handle this edge case.

Fixes #567
```

### Breaking Change

```
feat(api): change authentication to JWT tokens

BREAKING CHANGE: Session-based authentication is removed.
All API clients must now use JWT tokens for authentication.

Migration guide:
1. Obtain JWT token from /auth/token endpoint
2. Include token in Authorization header
3. Remove session cookie handling

Closes #789
```

### Documentation

```
docs(readme): add installation instructions for Windows

- Add PowerShell commands
- Include WSL setup guide
- Add troubleshooting section
```

### Refactoring

```
refactor(core): extract validation into separate module

Move validation logic from UserService to dedicated
ValidationService for better separation of concerns and reusability.

No functional changes.
```

## Anti-Patterns

### Bad Examples

```
# Too vague
fix: fix bug

# Past tense
fixed: fixed the login issue

# Too long
feat: add a new feature that allows users to upload their profile pictures and automatically resize them to multiple dimensions

# No type
update user service

# Meaningless
wip
misc changes
asdf
```

### Good Alternatives

```
# Specific
fix(auth): prevent session timeout during file upload

# Imperative
fix(auth): resolve login redirect loop

# Concise with body for details
feat(users): add profile picture upload

Support JPEG, PNG, and WebP formats. Images are automatically
resized to 100x100, 200x200, and 400x400 pixels.

# With type
refactor(users): simplify service layer

# Clear purpose
feat(cache): add Redis support for session storage
```

## Configuration

### Git Commit Template

Create `~/.gitmessage`:

```
# <type>(<scope>): <subject>
# |<----  Using a maximum of 50 characters  ---->|

# Explain why this change is being made
# |<----   Try to limit each line to 72 characters   ---->|

# Provide links or keys to any relevant issues or PRs
# Example: Closes #23
```

Configure git:

```bash
git config --global commit.template ~/.gitmessage
```

### Commitlint Configuration

```javascript
// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'header-max-length': [2, 'always', 72],
    'body-max-line-length': [2, 'always', 72],
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'chore', 'ci', 'build']
    ],
    'subject-case': [2, 'always', 'lower-case']
  }
};
```

## Related Options

- [Traditional Chinese](./traditional-chinese.md) - Commits in Traditional Chinese
- [Bilingual](./bilingual.md) - Combined English and Chinese format

---

## License

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
