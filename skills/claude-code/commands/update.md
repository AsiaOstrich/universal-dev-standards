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

If updates are available, use AskUserQuestion with options based on version type.

根據可用更新的版本類型顯示對應選項。

#### Pre-release Version Types | Pre-release 版本類型

Pre-release versions are sorted by stability (ascending):

Pre-release 版本按穩定度排序（由低到高）：

| Type | Stability | Description | 說明 |
|------|-----------|-------------|------|
| alpha | 🔴 Early | Features may be incomplete, for internal testing | 功能可能不完整，供內部測試 |
| beta | 🟡 Testing | Features complete, may have bugs, for early adopters | 功能大致完成，可能有 bug，供早期採用者 |
| rc | 🟢 Near-stable | Release candidate, close to stable, for beta testers | 候選發布版，接近正式版，供 beta 測試者 |

Version comparison: `alpha < beta < rc < stable`

For detailed versioning standards, see [core/versioning.md](../../../core/versioning.md).

#### Update Options | 更新選項

**If stable version available (e.g., 3.5.1):**

| Option | Description |
|--------|-------------|
| **Update Now** | Update standards to latest stable version X.Y.Z (Recommended) |
| **Check Beta** | Check for beta version updates |
| **Skip** | Don't update at this time |

**If only pre-release version available (e.g., 3.5.1-beta.N, 3.5.1-alpha.N, 3.5.1-rc.N):**

| Option | Description |
|--------|-------------|
| **Update to Pre-release** | Update standards to pre-release version X.Y.Z-tag.N (Recommended) |
| **Skip** | Don't update at this time |

Note: Detect version type from `uds check` output. If version contains "beta", "alpha", or "rc", it's a pre-release.

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

After update completes, check if Skills/Commands need installation.

更新完成後，檢查是否需要安裝 Skills/Commands。

**Check installation status:**

1. Read `.standards/manifest.json` to get `aiTools` list and `skills.installed` status
2. Check if Skills are installed for each configured AI tool
3. Check if Commands are installed for tools that support them (opencode, copilot, gemini-cli, roo-code)

**If missing Skills/Commands detected**, use AskUserQuestion:

| Option | Description |
|--------|-------------|
| **Install All (Recommended)** | Install Skills + Commands for all configured tools |
| **Skills Only** | Install only Skills |
| **Commands Only** | Install only Commands |
| **Skip** | Don't install at this time |

**Based on user selection, execute:**

| Selection | Command |
|-----------|---------|
| Install All | `uds configure --type skills --ai-tool <tool>` for each tool, then `uds configure --type commands --ai-tool <tool>` |
| Skills Only | `uds configure --type skills --ai-tool <tool>` for each tool |
| Commands Only | `uds configure --type commands --ai-tool <tool>` for each tool |
| Skip | No action needed |

**Note**: The `--ai-tool` option allows non-interactive installation for specific tools.

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
