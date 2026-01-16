---
description: Update development standards to latest version
allowed-tools: Read, Bash(uds update:*), Bash(uds check:*), Bash(npx:*), Bash(cat .standards/*), Bash(ls .claude/*), Bash(ls .opencode/*), Bash(ls .github/*)
argument-hint: [--yes] [--offline] [--beta]
---

# Update Standards | 更新標準

Update Universal Development Standards to the latest version.

將 Universal Development Standards 更新至最新版本。

## Interactive Mode (Default) | 互動模式（預設）

When invoked without `--yes`, use AskUserQuestion to confirm update preferences.

當不帶 `--yes` 執行時，使用 AskUserQuestion 確認更新偏好。

### Step 1: Check Current Status | 步驟 1：檢查目前狀態

First, run `uds check` to show current installation status and available updates.

### Step 2: Ask Update Preferences | 步驟 2：詢問更新偏好

If updates are available, use AskUserQuestion with these options:

| Option | Description |
|--------|-------------|
| **Update Now** | Update standards to latest stable version (Recommended) |
| **Check Beta** | Check for beta version updates |
| **Skip** | Don't update at this time |

### Step 3: Execute | 步驟 3：執行

**If Update Now selected:**
```bash
uds update --yes
```

**If Check Beta selected:**
```bash
uds update --beta --yes
```

### Step 4: Check New Features | 步驟 4：檢查新功能

After update completes, check if Skills/Commands need to be installed:

更新完成後，檢查是否需要安裝 Skills/Commands：

1. Read `.standards/manifest.json` to get `aiTools` list and `skills.installed` status
2. Check if Skills are installed: `skills.installed === true`
3. Check if Commands are installed for tools that support them (opencode, copilot, gemini-cli, roo-code)

If `skills.installed` is `false` OR command directories are missing for supported tools, use AskUserQuestion:

| Option | Description | 說明 |
|--------|-------------|------|
| **Install All (Recommended)** | Install Skills + Commands | 安裝 Skills 和斜線命令 |
| **Skills Only** | Install Skills to .claude/skills/ | 只安裝 Skills |
| **Commands Only** | Install Commands for supported tools | 只安裝斜線命令 |
| **Skip** | Don't install features | 跳過 |

**If Install All or Skills Only selected:**
```bash
uds update --skills
```

**If Install All or Commands Only selected:**
```bash
uds update --commands
```

Explain the results and any next steps to the user.

## Quick Mode | 快速模式

When invoked with `--yes` or specific options, skip interactive questions:

```bash
/update --yes           # Update without confirmation
/update --beta --yes    # Update to beta version
/update --offline       # Skip npm registry check
```

## Options Reference | 選項參考

| Option | Description | 說明 |
|--------|-------------|------|
| `--yes`, `-y` | Skip confirmation prompt | 跳過確認提示 |
| `--offline` | Skip npm registry check | 跳過 npm registry 檢查 |
| `--beta` | Check for beta version updates | 檢查 beta 版本更新 |

## What Gets Updated | 更新內容

- Standard files in `.standards/` directory
- Extension files (language, framework, locale)
- Integration files (`.cursorrules`, etc.)
- Version info in `manifest.json`

## Skills Update | Skills 更新

Skills are managed separately:

| Installation | Update Method | 更新方法 |
|--------------|---------------|----------|
| Plugin Marketplace | Auto-updates on Claude Code restart | 重啟 Claude Code 自動更新 |
| User-level | `cd ~/.claude/skills && git pull` | 手動更新 |
| Project-level | `cd .claude/skills && git pull` | 手動更新 |

## Troubleshooting | 疑難排解

**"Standards not initialized"**
- Run `/init` first to initialize standards

**"Already up to date"**
- No action needed; standards are current

## Reference | 參考

- CLI documentation: `uds update --help`
- Check command: [/check](./check.md)
