---
name: docs
description: [UDS] Manage, guide, and generate documentation.
argument-hint: "[generate|readme|api] [options]"
---

# /docs Command | /docs 命令

Manage, write, and generate project documentation.

管理、撰寫和生成專案文件。

## Usage | 用法

```bash
/docs [subcommand] [options]
```

### Subcommands | 子命令

| Subcommand | Description |
|------------|-------------|
| `generate` | Generate documentation artifacts (cheatsheets, reference) |
| `readme` | Audit and update README.md |
| `api` | Generate API documentation from code |
| `structure` | Check documentation folder structure |
| `(none)` | Show documentation guide/status |

### Generate Options

Used with `/docs generate`:

| Option | Description |
|--------|-------------|
| `--lang <lang>` | Language (`en`, `zh-TW`, `zh-CN`) |
| `--cheatsheet` | Generate cheatsheet only |
| `--reference` | Generate feature reference only |
| `--check` | Check if docs are out of sync |

## Examples | 範例

```bash
# Generate all docs
/docs generate

# Generate Traditional Chinese docs
/docs generate --lang zh-TW

# Update README
/docs readme

# Check doc structure
/docs structure
```

## References | 參考

*   [Documentation Guide Skill](../documentation-guide/SKILL.md)
*   [Core Standard](../../core/documentation-writing-standards.md)