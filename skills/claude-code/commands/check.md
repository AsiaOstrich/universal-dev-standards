---
description: Verify standards adoption status
allowed-tools: Read, Bash(uds check:*), Bash(npx:*), Bash(ls:*)
argument-hint: "[--offline | --restore]"
---

# Check Standards | 檢查標準

Verify the adoption status of Universal Development Standards in the current project.

驗證當前專案的 Universal Development Standards 採用狀態。

## Quick Start | 快速開始

```bash
# Basic check
uds check

# Check without network access
uds check --offline

# Restore missing or modified files
uds check --restore
```

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

### Summary Mode (--summary) | 摘要模式

When using `--summary`, shows compact status for use by other commands:

使用 `--summary` 時，顯示供其他命令使用的精簡狀態：

```
UDS Status Summary
──────────────────────────────────────────────────
  Version: 3.5.1-beta.16 ✓
  Level: 2 - Recommended (推薦)
  Files: 12 ✓
  Skills: Claude Code ✓ | OpenCode ○
  Commands: OpenCode ✓
──────────────────────────────────────────────────
```

### Adoption Status | 採用狀態
- Adoption level (1-3)
- Installation date
- Installed version

### File Integrity | 檔案完整性
- Checks all expected files exist
- Reports missing or modified files
- Shows count of present vs missing

### Skills Status | Skills 狀態
- Installation location (Marketplace, User, Project)
- Version information
- Migration suggestions if applicable

### Skills Verification | Skills 驗證

After displaying `uds check` results, verify Skills installation by checking actual paths.

顯示 `uds check` 結果後，透過檢查實際路徑來驗證 Skills 安裝。

**For each AI tool showing "✓ installed", run diagnostic commands:**

針對每個顯示「✓ 已安裝」的 AI 工具，執行診斷命令：

| AI Tool | Skills Path | Diagnostic Command |
|---------|-------------|-------------------|
| Claude Code | `.claude/skills/` | `ls -la .claude/skills/ 2>/dev/null \|\| echo "Not found"` |
| OpenCode | `.opencode/skill/` | `ls -la .opencode/skill/ 2>/dev/null \|\| echo "Not found"` |
| GitHub Copilot | `.github/skills/` | `ls -la .github/skills/ 2>/dev/null \|\| echo "Not found"` |
| Cursor | `.cursor/skills/` | `ls -la .cursor/skills/ 2>/dev/null \|\| echo "Not found"` |

**Expected output for valid installation:**
- Should see skill directories (e.g., `commit-standards/`, `testing-guide/`)
- Each skill directory should contain `SKILL.md`

**有效安裝的預期輸出：**
- 應看到 skill 目錄（如 `commit-standards/`、`testing-guide/`）
- 每個 skill 目錄應包含 `SKILL.md`

**If directory is empty or not found:**
- Skills are NOT actually installed
- Run `/update` and select "Install All" to install

**如果目錄為空或不存在：**
- Skills 實際上未安裝
- 執行 `/update` 並選擇「全部安裝」

### Coverage Summary | 覆蓋率摘要
- Required standards count for current level
- Skills vs reference document coverage

## Status Indicators | 狀態指示

| Symbol | Meaning | 意義 |
|--------|---------|------|
| ✓ (green) | All good | 一切正常 |
| ⚠ (yellow) | Warning, action recommended | 警告，建議採取行動 |
| ✗ (red) | Error, action required | 錯誤，需要採取行動 |

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

## Usage | 使用方式

- `/check` - Check current adoption status
- `/check --offline` - Check without network access
- `/check --restore` - Restore modified/missing files
- `/check --diff` - Show file differences

## Reference | 參考

- CLI documentation: `uds check --help`
- Init command: [/init](./init.md)
- Update command: [/update](./update.md)
