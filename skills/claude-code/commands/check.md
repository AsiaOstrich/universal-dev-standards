---
description: Verify standards adoption status
allowed-tools: Read, Bash(uds check:*), Bash(npx:*)
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

### File Integrity | 檔案完整性
- Checks all expected files exist
- Reports missing or modified files
- Shows count of present vs missing

### Skills Status | Skills 狀態
- Installation location (Marketplace, User, Project)
- Version information
- Migration suggestions if applicable

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
