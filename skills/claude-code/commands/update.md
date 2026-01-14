---
description: Update development standards to latest version | 更新開發標準至最新版本
allowed-tools: Read, Bash(uds update:*), Bash(uds check:*), Bash(npx:*)
argument-hint: [--yes] [--offline] [--beta]
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
| `--offline` | Skip npm registry check | 跳過 npm registry 檢查 |
| `--beta` | Check for beta version updates | 檢查 beta 版本更新 |

## CLI Version Check | CLI 版本檢查

Before updating standards, the CLI automatically checks npm registry for newer CLI versions. If a newer version is available, you'll be prompted with options:

在更新標準之前，CLI 會自動檢查 npm registry 是否有更新版本的 CLI。如果有更新版本，會提供選項：

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ New CLI version available!
  Your bundled version: 3.4.0
  Latest on npm: 3.5.0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

? What would you like to do?
❯ Update CLI first (recommended)
  Continue with current CLI
  Cancel
```

**Options explained | 選項說明：**
- **Update CLI first (recommended)**: Updates CLI via npm and prompts you to re-run `uds update`. This ensures you get the latest standards.
- **Continue with current CLI**: Proceed with the bundled standards (may not be the latest).
- **Cancel**: Abort the operation.

**為什麼要先更新 CLI？** CLI 綑綁了標準註冊表。更新 CLI 可確保你能存取最新的標準。

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
- `/update --offline` - Update without npm registry check
- `/update --beta` - Check for beta version updates (for beta users)

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
