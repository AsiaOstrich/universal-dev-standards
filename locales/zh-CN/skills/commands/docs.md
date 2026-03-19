---
source: ../../../../skills/commands/docs.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-19
status: current
---

---
name: docs
description: [UDS] Manage, guide, and generate documentation.
argument-hint: "[generate|readme|api] [options]"
---

# /docs 命令

管理、编写和生成专案文档。

## 用法

```bash
/docs [subcommand] [options]
```

### 子命令

| Subcommand | Description |
|------------|-------------|
| `generate` | 生成文档产物（速查表、参考手册） |
| `readme` | 审查并更新 README.md |
| `api` | 从代码生成 API 文档 |
| `structure` | 检查文档文件夹结构 |
| `(none)` | 显示文档指南/状态 |

### Generate 选项

与 `/docs generate` 一起使用：

| Option | Description |
|--------|-------------|
| `--lang <lang>` | 语言（`en`、`zh-TW`、`zh-CN`） |
| `--cheatsheet` | 仅生成速查表 |
| `--reference` | 仅生成功能参考 |
| `--check` | 检查文档是否不同步 |

## 范例

```bash
# 生成所有文档
/docs generate

# 生成繁体中文文档
/docs generate --lang zh-TW

# 更新 README
/docs readme

# 检查文档结构
/docs structure
```

## 参考

*   [文档指南技能](../documentation-guide/SKILL.md)
*   [核心规范](../../core/documentation-writing-standards.md)
