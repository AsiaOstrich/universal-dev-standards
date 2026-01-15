---
description: Initialize development standards in current project
allowed-tools: Read, Bash(uds init:*), Bash(npx:*)
argument-hint: [--level N | --yes]
---

# Initialize Standards | 初始化標準

Initialize Universal Development Standards in the current project.

在當前專案初始化 Universal Development Standards。

## Interactive Mode (Default) | 互動模式（預設）

When invoked without `--yes`, use AskUserQuestion to gather user preferences before executing.

當不帶 `--yes` 執行時，使用 AskUserQuestion 詢問用戶偏好後再執行。

### Step 1: Ask Adoption Level | 步驟 1：詢問採用層級

Use AskUserQuestion with these options:

| Option | Description |
|--------|-------------|
| **Recommended (Level 2)** | Professional quality for teams (Recommended) |
| **Essential (Level 1)** | Minimum viable standards for small projects |
| **Enterprise (Level 3)** | Comprehensive for regulated/enterprise projects |

### Step 2: Ask Skills Location | 步驟 2：詢問 Skills 安裝位置

Use AskUserQuestion with these options:

| Option | Description |
|--------|-------------|
| **Plugin Marketplace** | Auto-updates, recommended for most users |
| **User Level** | Install at ~/.claude/skills/ |
| **Project Level** | Install at .claude/skills/ |
| **Skip** | Don't install Skills |

### Step 3: Execute | 步驟 3：執行

After collecting answers, execute:

```bash
uds init --level <level> --skills-location <location> --yes
```

Explain the results and next steps to the user.

## Quick Mode | 快速模式

When invoked with `--yes` or specific options, skip interactive questions:

```bash
/init --yes              # Use defaults
/init --level 2 --yes    # Specific level with defaults
```

## Options Reference | 選項參考

| Option | Description | 說明 |
|--------|-------------|------|
| `--yes`, `-y` | Non-interactive mode | 非互動模式 |
| `--level N` | Adoption level (1, 2, or 3) | 採用層級 |
| `--skills-location` | marketplace, user, project, or none | Skills 位置 |
| `--format` | ai, human, or both | 格式 |

See `uds init --help` for all options.

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

## Reference | 參考

- CLI documentation: `uds init --help`
- Adoption guide: [ADOPTION-GUIDE.md](../../../adoption/ADOPTION-GUIDE.md)
