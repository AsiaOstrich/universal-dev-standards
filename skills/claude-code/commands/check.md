---
description: Verify standards adoption status
allowed-tools: Read, Bash(uds check:*), Bash(npx:*), Bash(ls:*)
argument-hint: "[--offline | --restore | --summary]"
---

# Check Standards | 檢查標準

Verify the adoption status of Universal Development Standards in the current project.

驗證當前專案的 Universal Development Standards 採用狀態。

## Quick Start | 快速開始

```bash
# Basic check (with interactive mode for issues)
uds check

# Compact summary for quick status
uds check --summary

# Check without network access
uds check --offline

# Restore missing or modified files
uds check --restore
```

## Output Modes | 輸出模式

### Summary Mode (--summary) | 摘要模式

Shows compact status for quick overview:

顯示精簡狀態供快速瀏覽：

```
UDS Status Summary
──────────────────────────────────────────────────
  Version: 3.5.1-beta.16 → 3.5.1-beta.18 ⚠
  Level: 2 - Professional (專業)
  Files: 12 ✓
  Skills: Claude Code ✓ | OpenCode ○
  Commands: OpenCode ✓
──────────────────────────────────────────────────
```

### Full Mode (Default) | 完整模式

Shows detailed information including:
- Adoption status (level, version, install date)
- File integrity (unchanged/modified/missing counts)
- Skills integrity (if tracked in manifest)
- Commands integrity (if tracked in manifest)
- Integration blocks integrity
- Reference sync status
- AI tool integration files coverage
- Coverage report

## Interactive Mode | 互動模式

When issues are detected (modified/missing files), CLI automatically enters interactive mode:

當偵測到問題時，CLI 自動進入互動模式：

```
──────────────────────────────────────────────────
⚠ Modified: .standards/commit-message-guide.md

? What would you like to do?
❯ View diff
  Restore original
  Keep current (update hash)
  Skip
```

**Available actions:**

| Action | Description |
|--------|-------------|
| **View diff** | Show differences between current and original |
| **Restore original** | Replace with upstream version |
| **Keep current** | Accept modifications and update hash |
| **Skip** | Do nothing for this file |

For missing files:

| Action | Description |
|--------|-------------|
| **Restore** | Download and restore from upstream |
| **Remove from tracking** | Remove from manifest |
| **Skip** | Do nothing for this file |

## Options | 選項

| Option | Description | 說明 |
|--------|-------------|------|
| `--summary` | Show compact status summary | 顯示精簡狀態摘要 |
| `--offline` | Skip npm registry check | 跳過 npm registry 檢查 |
| `--diff` | Show diff for modified files | 顯示修改檔案的差異 |
| `--restore` | Restore all modified and missing files | 還原所有修改和遺失的檔案 |
| `--restore-missing` | Restore only missing files | 僅還原遺失的檔案 |
| `--migrate` | Migrate legacy manifest to hash-based tracking | 遷移舊版 manifest |

## Output Sections | 輸出區段

### Adoption Status | 採用狀態

- Adoption level (1-3)
- Installation date
- Installed version
- Update availability

### File Integrity | 檔案完整性

Shows status for each tracked file:

| Symbol | Meaning | 意義 |
|--------|---------|------|
| ✓ (green) | Unchanged | 未變更 |
| ⚠ (yellow) | Modified | 已修改 |
| ✗ (red) | Missing | 遺失 |
| ? (gray) | Exists but no hash | 存在但無 hash |

Summary format: `{unchanged} unchanged, {modified} modified, {missing} missing`

### Skills Integrity (v3.3.0+) | Skills 完整性

If `skillHashes` exist in manifest, checks:
- File existence at expected paths
- Hash comparison for modifications

### Commands Integrity (v3.3.0+) | Commands 完整性

If `commandHashes` exist in manifest, checks:
- File existence at expected paths
- Hash comparison for modifications

### Integration Blocks Integrity (v3.3.0+) | 整合區塊完整性

If `integrationBlockHashes` exist in manifest, checks:
- UDS marker block presence
- Block content hash (user customizations outside blocks are preserved)

### Skills Status | Skills 狀態

Shows installation status for each configured AI tool:

```
Skills Status
  Claude Code:
    ✓ Skills installed:
      - User level: ~/.claude/skills/
        Version: 3.5.1
    ✓ Commands: 7 installed
      Path: .opencode/commands/
```

Status indicators:
- ✓ installed (green) - Skills/Commands are installed
- ○ not installed (gray) - Not installed

### Coverage Summary | 覆蓋率摘要

Shows standards coverage:
- Required standards for current level
- Standards covered by Skills
- Standards covered by reference documents

## Status Indicators | 狀態指示

| Symbol | Meaning | 意義 |
|--------|---------|------|
| ✓ (green) | All good | 一切正常 |
| ⚠ (yellow) | Warning, action recommended | 警告，建議採取行動 |
| ✗ (red) | Error, action required | 錯誤，需要採取行動 |
| ○ (gray) | Not installed/configured | 未安裝/配置 |

## Common Issues | 常見問題

**"Standards not initialized"**
- Run `/init` to initialize standards

**"Update available"**
- Run `/update` to get latest version

**"Missing files"**
- Run `/check --restore` or `/update` to restore

**"Modified files detected"**
- Run `/check --diff` to see changes
- Run `/check --restore` to reset to original
- Or use interactive mode to handle each file

**"Skills not installed"**
- Run `/update` to install missing Skills
- Or run `/config skills` to manage Skills

**"Legacy manifest detected"**
- Run `uds check --migrate` to upgrade to hash-based tracking

## Usage | 使用方式

```bash
/check                  # Full check with interactive mode
/check --summary        # Quick status overview
/check --offline        # Check without network access
/check --restore        # Restore modified/missing files
/check --diff           # Show file differences
/check --migrate        # Upgrade manifest format
```

## Reference | 參考

- CLI documentation: `uds check --help`
- Init command: [/init](./init.md)
- Update command: [/update](./update.md)
- Config command: [/config](./config.md)
