---
name: release
description: [UDS] Manage release process and changelogs.
argument-hint: "[start|finish|changelog] <version>"
---

# /release Command | /release 命令

Manage the release workflow and changelogs according to Semantic Versioning.

根據語義化版本管理發布流程和變更日誌。

## Usage | 用法

```bash
/release [subcommand] [version]
```

### Subcommands | 子命令

| Subcommand | Description |
|------------|-------------|
| `start` | Start a release branch/process |
| `finish` | Finalize release (tag, merge) |
| `changelog` | Generate or update CHANGELOG.md |
| `check` | Run pre-release checks |

## Changelog Management

```bash
/release changelog [version]
```

Updates `CHANGELOG.md` by:
1.  Moving "Unreleased" changes to the new `[version]` section.
2.  Creating a new "Unreleased" section.
3.  Updating comparison links at the bottom.

## Examples | 範例

```bash
# Start release v1.2.0
/release start 1.2.0

# Update changelog for v1.2.0
/release changelog 1.2.0

# Finish release
/release finish 1.2.0
```

## References | 參考

*   [Release Standards Skill](../release-standards/SKILL.md)
*   [Changelog Guide](../changelog-guide/SKILL.md)
*   [Core Standard](../../core/versioning.md)