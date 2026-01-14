---
description: Verify standards adoption status | 檢查標準採用狀態
allowed-tools: Read, Bash(uds check:*), Bash(npx:*)
argument-hint:
---

# Check Standards | 檢查標準

Verify the adoption status of Universal Development Standards in the current project. This command checks file integrity, version status, and coverage summary.

驗證當前專案的 Universal Development Standards 採用狀態。此命令會檢查檔案完整性、版本狀態和覆蓋率摘要。

## Workflow | 工作流程

1. **Run check** - Execute `uds check` to verify installation
2. **Review status** - Examine adoption level, file integrity, and Skills status
3. **Take action** - Follow recommendations if issues are found

## Quick Start | 快速開始

```bash
uds check
```

## Output Sections | 輸出區段

### Adoption Status | 採用狀態
- Adoption level (1-3)
- Installation date
- Installed version

### File Integrity | 檔案完整性
- Checks all expected files exist
- Reports missing files
- Shows count of present vs missing

### Skills Status | Skills 狀態
- Installation location (Marketplace, User, Project)
- Version information (auto-detected from `~/.claude/plugins/installed_plugins.json` for Marketplace installations)
- Last updated date
- Migration suggestions if applicable

### Coverage Summary | 覆蓋率摘要
- Required standards count for current level
- Skills vs reference document coverage
- Your actual coverage status

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
- Run `/update` or `/init --yes` to restore

**"Skills marked as installed but not found"**
- Reinstall via Plugin Marketplace or local installation

## Usage | 使用方式

- `/check` - Check current adoption status

## Reference | 參考

- CLI documentation: `uds check --help`
- Init command: [/init](./init.md)
- Update command: [/update](./update.md)
