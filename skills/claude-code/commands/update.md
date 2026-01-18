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

First, run `uds check --summary` to show compact installation status.

首先，執行 `uds check --summary` 顯示精簡安裝狀態。

```bash
uds check --summary
```

This shows: version (with update indicator), level, files status, Skills status, and Commands status.

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

**If only pre-release version available, show specific type:**

Detect the version type from `uds check` output and display the specific type name:

| Detected Type | Option Label | Description |
|---------------|--------------|-------------|
| `X.Y.Z-alpha.N` | **Update to Alpha** | Update to alpha version X.Y.Z-alpha.N (🔴 Early testing) |
| `X.Y.Z-beta.N` | **Update to Beta** | Update to beta version X.Y.Z-beta.N (🟡 Feature complete) |
| `X.Y.Z-rc.N` | **Update to RC** | Update to RC version X.Y.Z-rc.N (🟢 Near-stable) |

Always include **Skip** option: Don't update at this time.

**Example AskUserQuestion for beta version:**
- Question: "有新的 beta 版本可用：3.5.1-beta.3 → 3.5.1-beta.15。您想如何處理？"
- Option 1: "更新至 Beta (建議)" - "更新標準至 3.5.1-beta.15 版本（🟡 功能大致完成）"
- Option 2: "暫時跳過" - "目前不進行更新，維持現有版本"

### Step 3: Execute Update | 步驟 3：執行更新

**If Update Now selected:**
```bash
uds update --yes
```

**If Check Beta selected:**
```bash
uds update --beta --yes
```

### Step 4: Check Skills/Commands Status | 步驟 4：檢查 Skills/Commands 狀態

After update completes, the CLI automatically detects missing or outdated Skills/Commands.

更新完成後，CLI 會自動偵測缺少或過時的 Skills/Commands。

**Important:** The CLI uses file-based detection (`getInstalledSkillsInfoForAgent`) to check actual installation status, not just manifest records.

**重要：** CLI 使用檔案實際存在檢測，而非僅讀取 manifest 記錄。

#### Handling Missing Skills | 處理缺少的 Skills

If missing Skills are detected for configured AI tools, CLI shows checkbox selection:

如果偵測到已配置 AI 工具缺少 Skills，CLI 會顯示多選介面：

```
Skills not yet installed for these AI tools:
  • Claude Code
  • OpenCode

? Select AI tools to install Skills for: (Press <space> to select)
❯ ◯ Claude Code
  ◯ OpenCode
  ──────────────
  ◯ Skip Skills installation
```

**After tool selection, prompt for installation level:**

| Option | Description |
|--------|-------------|
| **Project level** | Install to `.claude/skills/`, `.opencode/skill/`, etc. |
| **User level** | Install to `~/.claude/skills/`, `~/.opencode/skill/`, etc. |

#### Handling Outdated Skills | 處理過時的 Skills

If installed Skills have older version than latest, CLI shows update prompt:

如果已安裝的 Skills 版本比最新版本舊，CLI 會顯示更新提示：

```
Skills updates available for these AI tools:
  • Claude Code (project: .claude/skills/)
      3.4.0 → 3.5.1

? Select AI tools to update Skills for: (Press <space> to select)
❯ ◉ Claude Code (project) 3.4.0 → 3.5.1
  ──────────────
  ◯ Skip Skills update
```

#### Handling Missing Commands | 處理缺少的 Commands

Similar checkbox selection for Commands:

```
Slash commands not yet installed for these AI tools:
  • OpenCode → .opencode/commands/
  • GitHub Copilot → .github/commands/

? Select AI tools to install Commands for: (Press <space> to select)
❯ ◉ OpenCode (.opencode/commands/)
  ◉ GitHub Copilot (.github/commands/)
  ──────────────
  ◯ Skip Commands installation
```

#### Declined Features Handling | 拒絕功能處理

**Important:** The CLI tracks user's declined choices in `manifest.declinedFeatures`.

**重要：** CLI 會在 `manifest.declinedFeatures` 中追蹤用戶拒絕的選項。

- Tools that user previously declined will NOT be shown in subsequent prompts
- Users can reinstall declined features via `/config skills` or `/config commands`
- Declining is remembered per-tool (e.g., declining Skills for OpenCode doesn't affect Claude Code)

用戶之前拒絕的工具不會在後續提示中顯示。可透過 `/config skills` 或 `/config commands` 重新安裝。

### Step 5: Explain Results | 步驟 5：說明結果

After all operations complete, explain:
1. What was updated (standards version, file count)
2. Skills/Commands installation results
3. Any errors encountered
4. Next steps (restart AI tool if Skills were installed)

## Quick Mode | 快速模式

When invoked with `--yes` or specific options, skip interactive questions:

```bash
/update --yes           # Update without confirmation
/update --beta --yes    # Update to beta version
/update --offline       # Skip npm registry check
/update --skills        # Update Skills only
/update --commands      # Update Commands only
```

**Note:** In `--yes` mode, CLI shows hints about available Skills/Commands but does NOT auto-install them (conservative behavior).

## Options Reference | 選項參考

| Option | Description | 說明 |
|--------|-------------|------|
| `--yes`, `-y` | Skip confirmation prompt | 跳過確認提示 |
| `--offline` | Skip npm registry check | 跳過 npm registry 檢查 |
| `--beta` | Check for beta version updates | 檢查 beta 版本更新 |
| `--skills` | Update Skills only | 僅更新 Skills |
| `--commands` | Update Commands only | 僅更新 Commands |
| `--integrations-only` | Regenerate integration files only | 僅重新產生整合檔案 |
| `--sync-refs` | Sync integration file references | 同步整合檔案參考 |
| `--standards-only` | Update standards without integrations | 僅更新標準，不更新整合 |

## What Gets Updated | 更新內容

- Standard files in `.standards/` directory
- Extension files (language, framework, locale)
- Integration files (`.cursorrules`, `CLAUDE.md`, etc.)
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

**"Skills previously declined"**
- Run `/config skills` to reinstall declined Skills

## Reference | 參考

- CLI documentation: `uds update --help`
- Check command: [/check](./check.md)
- Config command: [/config](./config.md)
