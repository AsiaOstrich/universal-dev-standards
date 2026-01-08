---
description: Guide through release process with semantic versioning | 引導發布流程，使用語義化版本
allowed-tools: Read, Grep, Glob, Bash(git:*), Bash(npm version:*), Bash(gh release:*)
argument-hint: [version type: major|minor|patch|beta | 版本類型]
---

# Release Assistant | 發布助手

Guide through the complete release process following semantic versioning standards.

引導完整的發布流程，遵循語義化版本標準。

## Workflow | 工作流程

1. **Pre-release checks** - Run tests, linting, verify git status
2. **Determine version** - Based on changes since last release
3. **Update CHANGELOG** - Document all changes
4. **Update version** - Bump version in package.json
5. **Create tag** - Git tag with version number
6. **Push changes** - Commit and push to remote
7. **Create release** - GitHub release (triggers npm publish)

## Version Types | 版本類型

| Type | When to Use | Example |
|------|-------------|---------|
| `major` | Breaking changes | 1.0.0 → 2.0.0 |
| `minor` | New features (backward compatible) | 1.0.0 → 1.1.0 |
| `patch` | Bug fixes | 1.0.0 → 1.0.1 |
| `beta` | Pre-release testing | 1.0.0 → 1.1.0-beta.1 |
| `alpha` | Early testing | 1.0.0 → 1.1.0-alpha.1 |

## Pre-release Checklist | 發布前檢查

- [ ] All tests pass
- [ ] Linting passes
- [ ] Git working directory is clean
- [ ] On correct branch (main for stable)
- [ ] CHANGELOG is updated

## Usage | 使用方式

- `/release` - Interactive release wizard
- `/release patch` - Create patch release
- `/release beta` - Create beta pre-release

## Reference | 參考

- Full standard: [release-standards](../../release-standards/SKILL.md)
- Workflow guide: [release-workflow](../../release-standards/release-workflow.md)
