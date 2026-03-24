---
description: [UDS] Update development standards to latest version
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

For detailed versioning standards, see [core/versioning.md](../../core/versioning.md).

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

After update completes, check for missing or outdated Skills/Commands using multi-stage AskUserQuestion.

更新完成後，使用多階段 AskUserQuestion 檢查缺少或過時的 Skills/Commands。

**Important:** Since AskUserQuestion has limited options (max 4), we use a multi-stage approach to handle different AI tools and installation preferences.

**重要：** 由於 AskUserQuestion 選項有限（最多 4 個），使用多階段方式處理不同 AI 工具和安裝偏好。

#### Step 4a: Detect Missing Skills | 步驟 4a：偵測缺少的 Skills

First, read the manifest to identify configured AI tools and their Skills status:

首先讀取 manifest 來識別已配置的 AI 工具及其 Skills 狀態：

```bash
# Read manifest to get configured AI tools
cat .standards/manifest.json
# Check existing Skills installations
ls .claude/skills/ 2>/dev/null || echo "Not installed"
ls .opencode/skill/ 2>/dev/null || echo "Not installed"
```

For each configured AI tool that supports Skills, check if Skills are installed.

#### Step 4b/4c: Ask Skills Installation (Combined) | 步驟 4b/4c：詢問 Skills 安裝（整合）

If any configured AI tools are missing Skills, use **Smart Grouping** strategy.

如果有已配置的 AI 工具缺少 Skills，使用**智能分組**策略。

**IMPORTANT: AskUserQuestion has a 4-option limit.** Use smart grouping to handle this.

**重要：AskUserQuestion 最多只能有 4 個選項。** 使用智能分組來處理。

**Step 4b-1: Check Marketplace Status (Claude Code only)**

First, check if Plugin Marketplace is already installed:
```bash
ls ~/.claude/plugins/universal-dev-standards@asia-ostrich 2>/dev/null && echo "Marketplace installed"
```

- If Marketplace IS installed → Show "Claude Code: ✓ 已透過 Marketplace 安裝" and skip Claude Code options
- If Marketplace NOT installed → Include Marketplace option

**Step 4b-2: Apply Smart Grouping Strategy**

#### Strategy A: 1-2 Tools → Combined Question | 策略 A：1-2 個工具 → 合併詢問

**Example (Claude Code only, Marketplace not installed):**
```
Question: "Skills 要安裝到哪裡？"
Options:
1. Plugin Marketplace (建議) - 自動更新，易於管理
2. User Level (~/.claude/skills/) - 所有專案共用
3. Project Level (.claude/skills/) - 僅此專案
4. 跳過 - 不安裝 Skills
```

**Example (OpenCode + Copilot, Claude Code already via Marketplace):**
```
Question: "Skills 要安裝到哪裡？（Claude Code: ✓ 已透過 Marketplace 安裝）"
Options:
1. 全部 User Level - 所有專案共用
2. 全部 Project Level (建議) - 僅此專案
3. 跳過 - 不安裝額外 Skills
```

#### Strategy B: 3+ Tools → Two-Stage Question | 策略 B：3+ 個工具 → 兩階段詢問

**Stage 1: Ask unified or individual**
```
Question: "有多個 AI 工具需要安裝 Skills，安裝層級要如何設定？"
Options:
1. 統一層級 (建議) - 所有工具使用相同層級
2. 個別設定 - 為每個工具分別選擇層級
3. 跳過 - 不安裝 Skills
```

**Stage 2a: If unified → ask level once**
```
Question: "所有 Skills 要安裝到哪個層級？"
Options:
1. User Level - 所有專案共用
2. Project Level (建議) - 僅此專案
```

**Stage 2b: If individual → per-tool questions**

**Execute installation:**
```bash
uds configure --type skills --ai-tool opencode --skills-location project
uds configure --type skills --ai-tool cursor --skills-location user
```

**Note:** If user selects unified level, the `--skills-location` option is used. If individual, run without the option to trigger interactive prompt.

**注意：** 如果用戶選擇統一層級，使用 `--skills-location` 選項。如果選擇個別設定，不帶此選項執行以觸發互動提示。

#### Step 4d: Detect Missing Commands | 步驟 4d：偵測缺少的 Commands

Check for configured AI tools that support Commands but don't have them installed:

檢查已配置但尚未安裝 Commands 的 AI 工具：

```bash
# Check existing Commands installations
ls .opencode/commands/ 2>/dev/null || echo "Not installed"
ls .github/commands/ 2>/dev/null || echo "Not installed"
```

**Note:** Not all AI tools support Commands. Tools that support Commands:
- OpenCode (.opencode/commands/)
- GitHub Copilot (.github/commands/)
- Roo Code (.roo/commands/)
- Gemini CLI (.gemini/commands/)

#### Step 4e: Ask Commands Installation | 步驟 4e：詢問 Commands 安裝

If any configured AI tools are missing Commands, use **Smart Grouping** strategy.

如果有已配置的 AI 工具缺少 Commands，使用**智能分組**策略。

**IMPORTANT: AskUserQuestion has a 4-option limit.** Use smart grouping to handle this.

**重要：AskUserQuestion 最多只能有 4 個選項。** 使用智能分組來處理。

#### Strategy A: 1-2 Tools → Combined Question | 策略 A：1-2 個工具 → 合併詢問

**Example (OpenCode only):**
```
Question: "Commands 要安裝到哪裡？"
Options:
1. User Level (~/.config/opencode/command/) - 所有專案共用
2. Project Level (.opencode/command/) - 僅此專案 (建議)
3. 跳過 - 使用 Skills 即可
```

**Example (OpenCode + Copilot):**
```
Question: "Commands 要安裝到哪裡？"
Options:
1. 全部 User Level - 所有專案共用
2. 全部 Project Level (建議) - 僅此專案
3. 跳過 - 使用 Skills 即可
```

#### Strategy B: 3+ Tools → Two-Stage Question | 策略 B：3+ 個工具 → 兩階段詢問

**Stage 1: Ask unified or individual**
```
Question: "有多個 AI 工具需要安裝 Commands，安裝層級要如何設定？"
Options:
1. 統一層級 (建議) - 所有工具使用相同層級
2. 個別設定 - 為每個工具分別選擇層級
3. 跳過 - 不安裝 Commands
```

**Stage 2a: If unified → ask level once**
```
Question: "所有 Commands 要安裝到哪個層級？"
Options:
1. User Level - 所有專案共用
2. Project Level (建議) - 僅此專案
```

**Stage 2b: If individual → per-tool questions**

**Execute installation:**
```bash
# CLI will prompt for installation level
uds configure --type commands --ai-tool opencode
uds configure --type commands --ai-tool copilot
```

**Note:** The CLI will interactively prompt for installation level (project or user) when `--ai-tool` is specified.

**注意：** 指定 `--ai-tool` 時，CLI 會互動詢問安裝層級（project 或 user）。

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

## AI Agent Behavior | AI 代理行為

> Follows [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### Entry Router | 進入路由

| Input | AI Action | AI 行為 |
|-------|-----------|--------|
| `/update` | 檢查狀態 → 詢問更新偏好 → 執行 → 檢查 Skills/Commands | Check, ask, execute, post-check |
| `/update --yes` | 跳過確認直接更新（不自動安裝 Skills） | Update without confirmation |
| `/update --beta` | 檢查 beta 版本更新 | Check beta updates |
| `/update --skills` | 僅更新 Skills | Update Skills only |
| `/update --commands` | 僅更新 Commands | Update Commands only |
| `/update --offline` | 跳過 npm registry 檢查 | Skip network check |

### Interaction Script | 互動腳本

1. 執行 `uds check --summary` 顯示目前狀態

**Decision: 有無可用更新**
- IF 已是最新 → 顯示「Already up to date」，跳至 Step 4 檢查 Skills/Commands
- IF 有更新 → 進入 Step 2

2. 詢問更新偏好（AskUserQuestion）

**Decision: 版本類型**
- IF stable 可用 → 選項：Update Now（建議）/ Check Beta / Skip
- IF 僅 pre-release → 顯示具體類型：Update to Alpha/Beta/RC / Skip

🛑 **STOP**: 展示版本資訊後等待使用者選擇

3. 執行更新 `uds update --yes` 或 `uds update --beta --yes`

4. 檢查 Skills/Commands 狀態（Smart Grouping 策略）
   - 偵測缺少的 Skills → 使用 Smart Grouping 詢問安裝
   - 偵測缺少的 Commands → 使用 Smart Grouping 詢問安裝
   - 已拒絕的工具不再顯示

**IMPORTANT**: AskUserQuestion 最多 4 個選項。3+ 工具時必須使用兩階段策略。

🛑 **STOP**: 每個 Skills/Commands 安裝決策點等待使用者選擇

5. 說明結果（更新內容、安裝結果、下一步）

### Stop Points | 停止點

| Stop Point | 等待內容 |
|-----------|---------|
| 更新偏好選擇 | 使用者選擇更新版本或跳過 |
| Skills 安裝詢問 | 使用者選擇安裝位置或跳過 |
| Commands 安裝詢問 | 使用者選擇安裝位置或跳過 |

### Error Handling | 錯誤處理

| Error Condition | AI Action |
|-----------------|-----------|
| 標準未初始化 | 提示執行 `/init` |
| npm registry 無法連線 | 建議加 `--offline`，或稍後重試 |
| 更新失敗（寫入錯誤） | 顯示錯誤，建議檢查檔案權限 |
| Skills 之前被拒絕 | 不再詢問，提示可透過 `/config skills` 重新安裝 |

## Reference | 參考

- CLI documentation: `uds update --help`
- Check command: [/check](./check.md)
- Config command: [/config](./config.md)
