---
description: Update development standards to latest version | 更新開發標準至最新版本
allowed-tools: Read, Bash(uds update:*), Bash(uds check:*), Bash(npx:*)
argument-hint: [--yes]
---

# Update Standards | 更新標準

Update Universal Development Standards to the latest version. This command checks for available updates and refreshes all standard files while preserving your configuration.

將 Universal Development Standards 更新至最新版本。此命令會檢查可用更新，並在保留您的配置的情況下更新所有標準檔案。

## Workflow | 工作流程

1. **Check current status** - Run `uds check` to verify current installation
2. **Check for updates** - Compare installed version with latest available
3. **Run update** - Execute `uds update` if updates are available
4. **Verify results** - Run `uds check` again to confirm update

## Quick Start | 快速開始

```bash
# Check current status first
uds check

# Interactive update
uds update

# Non-interactive update
uds update --yes
```

## Options | 選項

| Option | Description | 說明 |
|--------|-------------|------|
| `--yes`, `-y` | Skip confirmation prompt | 跳過確認提示 |

## What Gets Updated | 更新內容

- Standard files in `.standards/` directory
- Extension files (language, framework, locale)
- Integration files (`.cursorrules`, etc.)
- Version info in `manifest.json`

## Skills Update | Skills 更新

Skills are managed separately based on installation method:

| Installation | Update Method | 更新方法 |
|--------------|---------------|----------|
| Plugin Marketplace | Auto-updates on Claude Code restart | 重啟 Claude Code 自動更新 |
| User-level | `cd ~/.claude/skills && git pull` | 手動更新 |
| Project-level | `cd .claude/skills && git pull` | 手動更新 |

### Checking Skills Version | 檢查 Skills 版本

**Plugin Marketplace Installation:**
- Version info stored in: `~/.claude/plugins/installed_plugins.json`
- Look for key containing `universal-dev-standards`
- CLI `uds check` will automatically display the version

**Manual Installation:**
- Version info stored in: `~/.claude/skills/.manifest.json` or `.claude/skills/.manifest.json`

**Important:** Skills version and standards version are managed independently. They may differ, and this is expected behavior.

## Usage | 使用方式

- `/update` - Check and update standards
- `/update --yes` - Update without confirmation

## Troubleshooting | 疑難排解

**"Standards not initialized"**
- Run `/init` first to initialize standards

**"Could not read manifest"**
- Check if `.standards/manifest.json` exists and is valid JSON

**"Already up to date"**
- No action needed; standards are current

## Reference | 參考

- CLI documentation: `uds update --help`
- Check command: [/check](./check.md)
