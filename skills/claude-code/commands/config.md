---
description: Configure project development standards
allowed-tools: Read, Bash(uds config:*), Bash(uds configure:*)
argument-hint: "[type]"
---

# Config Standards | 設定標準

Configure Universal Development Standards settings for the current project.

配置當前專案的 Universal Development Standards 設定。

## Interactive Mode (Default) | 互動模式（預設）

When invoked without a specific type, use AskUserQuestion to ask what to configure.

當不指定類型時，使用 AskUserQuestion 詢問要配置什麼。

### Step 1: Ask Configuration Type | 步驟 1：詢問配置類型

Use AskUserQuestion with these options:

| Option | Description |
|--------|-------------|
| **AI Tools** | Add or remove AI tool integrations |
| **Adoption Level** | Change adoption level (1/2/3) |
| **Content Mode** | Change how much content is embedded |
| **Other Options** | Format, workflow, merge strategy, etc. |

### Step 2: Execute Based on Selection | 步驟 2：根據選擇執行

**If AI Tools selected:**
```bash
uds config --type ai_tools
```

**If Adoption Level selected:**
Ask which level (1/2/3), then:
```bash
uds config --type level
```

**If Content Mode selected:**
Ask which mode (full/index/minimal), then:
```bash
uds config --type content_mode
```

**If Other Options selected:**
Ask which specific option, then execute accordingly.

## Quick Mode | 快速模式

When invoked with a specific type, skip interactive questions:

```bash
/config ai_tools      # Directly configure AI tools
/config level         # Directly configure adoption level
/config content_mode  # Directly configure content mode
```

## Configuration Types | 設定類型

| Type | Description | 說明 |
|------|-------------|------|
| `ai_tools` | AI tool integrations | AI 工具整合 |
| `level` | Adoption level (1/2/3) | 採用等級 |
| `content_mode` | Integration file content mode | 整合檔案內容模式 |
| `format` | AI/Human documentation format | AI/人類文件格式 |
| `workflow` | Git workflow strategy | Git 工作流程策略 |
| `merge_strategy` | Merge strategy | 合併策略 |
| `commit_language` | Commit message language | 提交訊息語言 |
| `test_levels` | Test levels to include | 測試層級 |
| `all` | Configure all options | 設定所有選項 |

## Content Mode Options | 內容模式選項

| Mode | Description | 說明 |
|------|-------------|------|
| `index` | Standards index with compliance instructions (Recommended) | 標準索引（推薦）|
| `full` | Embed all standards in integration files | 完整內嵌所有標準 |
| `minimal` | Only core rules embedded | 僅內嵌核心規則 |

## Effects of Configuration Changes | 設定變更的影響

| Configuration | Effect | 影響 |
|---------------|--------|------|
| AI Tools (add) | Generates new integration files | 產生新的整合檔案 |
| AI Tools (remove) | Deletes integration files | 刪除整合檔案 |
| Level | Updates standards, regenerates integrations | 更新標準，重新產生整合 |
| Content Mode | Regenerates all integration files | 重新產生所有整合檔案 |

## Reference | 參考

- CLI documentation: `uds config --help`
- Init command: [/init](./init.md)
- Check command: [/check](./check.md)
