# Keep a Changelog

> **Language**: English | [繁體中文](../../locales/zh-TW/options/changelog/keep-a-changelog.md)

**Parent Standard**: [Changelog Standards](../../core/changelog-standards.md)

---

## Overview

Keep a Changelog is a standard format for maintaining human-readable changelogs. It emphasizes clarity and consistency, making it easy for users and developers to understand what has changed between versions.

## Best For

- Open source projects
- Projects requiring human-readable changelogs
- Projects following Semantic Versioning
- Manual release management
- Projects where curated release notes matter

## Format Structure

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [X.Y.Z] - YYYY-MM-DD

### Added
- New features

### Changed
- Changes in existing functionality

### Deprecated
- Soon-to-be removed features

### Removed
- Removed features

### Fixed
- Bug fixes

### Security
- Security vulnerability fixes
```

## Change Types

| Type | Order | Description |
|------|-------|-------------|
| **Added** | 1 | New features |
| **Changed** | 2 | Changes in existing functionality |
| **Deprecated** | 3 | Soon-to-be removed features |
| **Removed** | 4 | Removed features |
| **Fixed** | 5 | Bug fixes |
| **Security** | 6 | Security vulnerability fixes |

## Core Principles

1. **Changelogs are for humans** - Not machine-generated commit dumps
2. **Every version gets a section** - Even if no changes
3. **Group by type** - Use the standard change types
4. **Dates are ISO format** - Use YYYY-MM-DD
5. **Latest first** - Reverse chronological order
6. **Unreleased section** - Track ongoing changes

## Example Entry

```markdown
## [1.2.0] - 2025-01-15

### Added
- User authentication with OAuth2 support (#123)
- Dark mode theme option (#145)

### Changed
- Updated API response format for consistency

### Fixed
- Login timeout issue on slow networks (#156)

### Security
- Updated dependencies to patch CVE-2025-1234

[Unreleased]: https://github.com/user/repo/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/user/repo/compare/v1.1.0...v1.2.0
```

## Rules

| Rule | Description | Priority |
|------|-------------|----------|
| Use [Unreleased] | Add entries during development | Required |
| Move on release | Move entries to versioned section with date | Required |
| Reverse chronological | Newest version at top | Required |
| Link versions | Add diff links at bottom of file | Recommended |
| ISO dates | Use YYYY-MM-DD format | Required |

## Comparison with Auto-Generated

| Aspect | Keep a Changelog | Auto-Generated |
|--------|-----------------|----------------|
| Effort | High (manual writing) | Low (automated) |
| Consistency | Varies (human written) | High (template-based) |
| Detail Level | Feature-level (curated) | Commit-level |
| Prerequisites | None | Conventional Commits |
| Best For | Milestone releases | Frequent releases |

## Related Options

- [Auto-Generated Changelog](./auto-generated.md) - For automated changelog generation

---

## References

- [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
- [Semantic Versioning](https://semver.org/)

---

## License

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
