---
description: Update development standards to latest version
allowed-tools: Read, Bash(uds update:*), Bash(uds check:*), Bash(uds configure:*), Bash(npx:*), Bash(cat .standards/*), Bash(ls .claude/*), Bash(ls .opencode/*), Bash(ls .github/*)
argument-hint: "[--yes] [--offline] [--beta]"
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

### Step 4: Install Skills/Commands | 步驟 4：安裝 Skills/Commands

The CLI automatically handles Skills/Commands installation in Step 4:

CLI 會自動處理 Skills/Commands 安裝：

**With `--yes` flag (automatic):**
- All missing Skills/Commands are installed automatically for configured AI tools
- No additional action needed

使用 `--yes` 時，會自動為所有設定的 AI 工具安裝缺少的 Skills/Commands。

**Without `--yes` (interactive):**
- CLI shows a checkbox menu to select which AI tools to install for
- All options are checked by default (opt-out behavior)

不使用 `--yes` 時，CLI 會顯示 checkbox 選單讓用戶選擇要安裝的 AI 工具。

**Example checkbox interface:**
```
? Select AI tools to install Skills for:
❯◉ Claude Code
 ◉ OpenCode
 ◉ GitHub Copilot
 ──────────────
 ◯ Skip Skills installation
```

**If CLI cannot prompt (non-TTY environment):**

Use AskUserQuestion and then run `uds configure`:

| User Selection | Action |
|----------------|--------|
| **Install All** | `uds configure --type skills` then `uds configure --type commands` |
| **Skills Only** | `uds configure --type skills` |
| **Commands Only** | `uds configure --type commands` |
| **Skip** | No action needed |

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
