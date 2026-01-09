---
description: Configure project development standards | 配置專案開發標準
allowed-tools: Read, Bash(uds config:*), Bash(uds configure:*)
argument-hint: [type]
---

# Config Standards | 設定標準

Configure Universal Development Standards settings for the current project. This command allows you to modify AI tools, adoption level, content mode, and other options.

配置當前專案的 Universal Development Standards 設定。此命令允許您修改 AI 工具、採用等級、內容模式和其他選項。

## Workflow | 工作流程

1. **Check initialization** - Ensure project has UDS initialized
2. **Display current config** - Show existing configuration
3. **Select config type** - Choose what to modify
4. **Apply changes** - Update settings and regenerate files if needed

## Quick Start | 快速開始

```bash
# Interactive mode - select what to configure
uds config

# Direct configuration type
uds config --type ai_tools
uds config --type level
uds config --type content_mode
```

## Configuration Types | 設定類型

| Type | Description | 說明 |
|------|-------------|------|
| `format` | AI/Human documentation format | AI/人類文件格式 |
| `workflow` | Git workflow strategy | Git 工作流程策略 |
| `merge_strategy` | Merge strategy (squash/rebase/merge) | 合併策略 |
| `commit_language` | Commit message language | 提交訊息語言 |
| `test_levels` | Test levels to include | 測試層級 |
| `ai_tools` | AI tool integrations | AI 工具整合 |
| `level` | Adoption level (1/2/3) | 採用等級 |
| `content_mode` | Integration file content mode | 整合檔案內容模式 |
| `all` | Configure all options | 設定所有選項 |

## AI Tools Configuration | AI 工具設定

When configuring AI tools, you can:

| Action | Description | 說明 |
|--------|-------------|------|
| Add | Add new AI tool integrations | 新增 AI 工具整合 |
| Remove | Remove existing AI tools | 移除現有 AI 工具 |
| View | View current AI tools | 檢視目前 AI 工具 |

Supported AI tools: Claude Code, Cursor, Windsurf, Cline, GitHub Copilot, Google Antigravity, OpenAI Codex, Gemini CLI, OpenCode

## Content Mode Options | 內容模式選項

| Mode | Description | 說明 |
|------|-------------|------|
| `full` | Embed all standards in integration files | 完整內嵌所有標準 |
| `index` | Standards index with compliance instructions (Recommended) | 標準索引和遵守指令（推薦）|
| `minimal` | Only core rules embedded | 僅內嵌核心規則 |

## Usage | 使用方式

- `/config` - Interactive configuration
- `/config ai_tools` - Manage AI tool integrations
- `/config level` - Modify adoption level (1/2/3)
- `/config content_mode` - Modify content mode

## Effects of Configuration Changes | 設定變更的影響

| Configuration | Effect | 影響 |
|---------------|--------|------|
| AI Tools (add) | Generates new integration files | 產生新的整合檔案 |
| AI Tools (remove) | Deletes integration files | 刪除整合檔案 |
| Level | Updates standards, regenerates integrations | 更新標準，重新產生整合 |
| Content Mode | Regenerates all integration files | 重新產生所有整合檔案 |
| Format/Workflow/etc | Copies new option files | 複製新的選項檔案 |

## Reference | 參考

- CLI documentation: `uds config --help`
- Init command: [/init](./init.md)
- Check command: [/check](./check.md)
- Update command: [/update](./update.md)
