---
description: Initialize development standards in current project | 在當前專案初始化開發標準
allowed-tools: Read, Bash(uds init:*), Bash(npx:*)
argument-hint: [--level N | --yes]
---

# Initialize Standards | 初始化標準

Initialize Universal Development Standards in the current project. This command sets up the `.standards/` directory with core standards, integrations, and optionally installs Claude Code Skills.

在當前專案初始化 Universal Development Standards。此命令會設置 `.standards/` 目錄，包含核心標準、整合配置，並可選擇安裝 Claude Code Skills。

## Workflow | 工作流程

1. **Check prerequisites** - Verify `uds` CLI is available (install via `npm install -g universal-dev-standards` if needed)
2. **Run initialization** - Execute `uds init` with user-specified options
3. **Report results** - Summarize what was installed and next steps

## Quick Start | 快速開始

```bash
# Interactive mode (recommended for first-time setup)
uds init

# Non-interactive with defaults
uds init --yes

# Specific adoption level
uds init --level 2

# Skip Skills installation
uds init --skills-location none
```

## Options | 選項

| Option | Description | 說明 |
|--------|-------------|------|
| `--yes`, `-y` | Non-interactive mode with defaults | 非互動模式，使用預設值 |
| `--level N` | Adoption level (1=Essential, 2=Recommended, 3=Enterprise) | 採用層級 |
| `--format` | Format: `ai`, `human`, or `both` | 格式選擇 |
| `--skills-location` | Skills location: `marketplace`, `user`, `project`, `none` | Skills 安裝位置 |
| `--lang` | Language extension (e.g., `csharp`, `php`) | 語言擴展 |
| `--framework` | Framework extension (e.g., `fat-free`) | 框架擴展 |
| `--locale` | Locale extension (e.g., `zh-tw`) | 語系擴展 |

## Adoption Levels | 採用層級

| Level | Name | Description | 說明 |
|-------|------|-------------|------|
| 1 | Essential | Minimum viable standards | 最基本的標準 |
| 2 | Recommended | Professional quality for teams | 團隊專業品質標準 |
| 3 | Enterprise | Comprehensive for regulated projects | 企業級完整標準 |

## What Gets Installed | 安裝內容

- `.standards/` directory with core standards
- Integration files (`.cursorrules`, `CLAUDE.md`, etc.)
- Skills (via Plugin Marketplace or local installation)
- `manifest.json` for tracking installation

## Usage | 使用方式

- `/init` - Run interactive initialization
- `/init --yes` - Quick setup with defaults
- `/init --level 3` - Enterprise-level setup

## Reference | 參考

- CLI documentation: `uds init --help`
- Adoption guide: [ADOPTION-GUIDE.md](../../../adoption/ADOPTION-GUIDE.md)
