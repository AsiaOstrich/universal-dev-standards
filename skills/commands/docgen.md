---
name: docgen
description: "[UDS] Generate usage documentation from project sources"
argument-hint: "[config file | 設定檔]"
---

# Documentation Generator | 文件產生器

Generate usage documentation (cheatsheets, references, guides) from project source files.

從專案原始檔案產生使用文件（速查表、參考手冊、使用指南）。

## Usage | 用法

```bash
/docgen [config file]
```

## Workflow | 工作流程

1. **Read config** - Load `.usage-docs.yaml` (or specified config file)
2. **Scan sources** - Read source files, commands, and skill definitions
3. **Extract content** - Parse descriptions, options, examples from source
4. **Generate docs** - Produce output in the configured format
5. **Write output** - Save generated files to the configured output directory

## Output Types | 輸出類型

| Type | Description | 說明 |
|------|-------------|------|
| **cheatsheet** | Quick reference card with commands and shortcuts | 速查表，列出命令與快捷方式 |
| **reference** | Comprehensive feature reference with all options | 完整功能參考手冊含所有選項 |
| **usage-guide** | Step-by-step usage guide for new users | 新手入門的逐步使用指南 |

## Examples | 範例

```bash
/docgen                          # Generate docs using default .usage-docs.yaml
/docgen .usage-docs.yaml         # Generate docs from specified config file
/docgen --format cheatsheet      # Generate cheatsheet only
```

## Config File Format | 設定檔格式

```yaml
# .usage-docs.yaml
output_dir: docs/generated/
formats:
  - cheatsheet
  - reference
sources:
  - path: skills/commands/
    type: commands
  - path: cli/src/commands/
    type: cli
language: [en, zh-TW]
```

## References | 參考

*   [Docs Generator Skill](../docs-generator/SKILL.md)
