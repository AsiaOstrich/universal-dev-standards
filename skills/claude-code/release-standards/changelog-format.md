# Changelog Format Guide

This standard follows [Keep a Changelog](https://keepachangelog.com/) format.

## File Structure

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added
- New features not yet released

## [1.2.0] - 2025-12-15

### Added
- Feature description

### Changed
- Change description

### Fixed
- Bug fix description

[Unreleased]: https://github.com/user/repo/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/user/repo/compare/v1.1.0...v1.2.0
```

---

## Categories

| Category | Usage | When to Use |
|----------|-------|-------------|
| **Added** | New features | New functionality for users |
| **Changed** | Modifications | Changes in existing functionality |
| **Deprecated** | Soon to be removed | Features to be removed |
| **Removed** | Removed features | Features removed in this version |
| **Fixed** | Bug fixes | Any bug fixes |
| **Security** | Security patches | Vulnerability fixes |

---

## Version Header Format

```markdown
## [VERSION] - YYYY-MM-DD
```

**Examples**:
```markdown
## [2.0.0] - 2025-12-15
## [1.5.0-beta.1] - 2025-12-01
## [Unreleased]
```

---

## Entry Format

```markdown
- [Action verb] [what changed] ([reference])
```

**Examples**:
```markdown
### Added
- Add user dashboard with customizable widgets (#123)
- Add support for PostgreSQL 15 (PR #456)

### Changed
- **BREAKING**: Change API response format from XML to JSON (#789)
- Update minimum Node.js version to 18.0 (#101)

### Fixed
- Fix memory leak when processing large files (#112)
- Fix incorrect date formatting in reports (#134)
```

---

## Breaking Changes

Mark breaking changes clearly with **BREAKING** prefix:

```markdown
### Changed
- **BREAKING**: Remove deprecated `getUserById()` method, use `getUser()` instead
- **BREAKING**: Change configuration file format from YAML to TOML

### Removed
- **BREAKING**: Remove support for Node.js 14
```

---

## Security Advisories

Include severity and CVE if available:

```markdown
### Security
- Fix SQL injection vulnerability in search endpoint (HIGH, CVE-2025-12345)
- Fix XSS vulnerability in comment rendering (MEDIUM)
- Update dependency `lodash` to patch prototype pollution (LOW)
```

---

## Commit to Changelog Mapping

| Commit Type | CHANGELOG Category | Notes |
|-------------|-------------------|-------|
| `feat` | **Added** | New features |
| `fix` | **Fixed** | Bug fixes |
| `perf` | **Changed** | Performance improvements |
| `refactor` | *(usually omit)* | Internal changes |
| `docs` | *(usually omit)* | Documentation only |
| `test` | *(usually omit)* | Test only |
| `chore` | *(usually omit)* | Maintenance |
| `BREAKING CHANGE` | **Changed** or **Removed** | With **BREAKING** prefix |
| `security` | **Security** | Security patches |
| `deprecate` | **Deprecated** | Deprecation notices |

---

## Exclusion Rules

The following should **NOT** be recorded in CHANGELOG:

| Category | Examples | Reason |
|----------|----------|--------|
| Build outputs | `dist/`, `build/`, `bin/` | Generated files |
| Dependencies | `node_modules/`, lock files | Auto-managed |
| Local config | `.env`, `*.local.json` | Environment-specific |
| IDE settings | `.vscode/`, `.idea/` | Developer preference |
| Internal refactoring | Code style, variable names | No user impact |

---

## Writing Tips

### Write for Users, Not Developers

| ✅ Good | ❌ Bad |
|---------|--------|
| Add dark mode theme option | Implement ThemeProvider with context |
| Fix login timeout on slow networks | Fix race condition in AuthService |
| Improve page load speed by 40% | Optimize SQL queries with indexes |

---

## Multi-Language Support

### Bilingual Entries

```markdown
## [1.2.0] - 2025-12-15

### Added | 新增
- Add dark mode support
  新增深色模式支援
- Add CSV export feature
  新增 CSV 匯出功能

### Fixed | 修復
- Fix login timeout issue
  修復登入逾時問題
```

---

## Automation

### conventional-changelog

```bash
# Install
npm install -g conventional-changelog-cli

# Generate (append to existing)
conventional-changelog -p angular -i CHANGELOG.md -s
```

### semantic-release

```json
// .releaserc.json
{
  "branches": ["main"],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    "@semantic-release/git"
  ]
}
```

---

**License**: CC BY 4.0 | **Source**: [universal-doc-standards](https://github.com/AsiaOstrich/universal-doc-standards)
