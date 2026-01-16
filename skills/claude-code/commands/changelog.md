---
description: Generate or update CHANGELOG following Keep a Changelog format
allowed-tools: Read, Grep, Glob, Bash(git log:*), Bash(git tag:*), Bash(git diff:*)
argument-hint: "[version number | 版本號]"
---

# Changelog Assistant | 變更日誌助手

Generate or update CHANGELOG.md following the Keep a Changelog format.

依據 Keep a Changelog 格式產生或更新 CHANGELOG.md。

## Workflow | 工作流程

1. **Read existing CHANGELOG** - Parse current entries
2. **Analyze commits** - Get commits since last version tag
3. **Categorize changes** - Group by type (Added, Changed, etc.)
4. **Generate entry** - Create new version section
5. **Update file** - Insert new entry at top of Unreleased section

## Change Categories | 變更類別

| Category | Description | 說明 |
|----------|-------------|------|
| **Added** | New features | 新功能 |
| **Changed** | Changes to existing features | 功能變更 |
| **Deprecated** | Soon-to-be removed features | 即將移除 |
| **Removed** | Removed features | 已移除 |
| **Fixed** | Bug fixes | 錯誤修復 |
| **Security** | Security vulnerability fixes | 安全修復 |

## CHANGELOG Format | 格式

```markdown
## [Unreleased]

### Added
- New feature description

### Fixed
- Bug fix description

## [1.0.0] - 2024-01-15

### Added
- Initial release
```

## Usage | 使用方式

- `/changelog` - Update Unreleased section with recent commits
- `/changelog 1.2.0` - Prepare changelog for specific version

## Reference | 參考

- Full standard: [changelog-guide](../../changelog-guide/SKILL.md)
- Core guide: [changelog-standards](../../../../core/changelog-standards.md)
