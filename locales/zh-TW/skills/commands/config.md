---
source: ../../../../skills/commands/config.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-19
---

---
description: [UDS] Configure project development standards
allowed-tools: Read, Bash(uds config:*), Bash(uds configure:*), Bash(uds check:*)
argument-hint: "[type] [--ai-tool <tool>]"
---

# 設定標準

> **Language**: [English](../../../../skills/commands/config.md) | 繁體中文

配置當前專案的 Universal Development Standards 設定。

---

## 互動模式（預設）

當不指定類型時，使用 AskUserQuestion 詢問要配置什麼。

### 步驟 0：顯示目前狀態

首先，執行 `uds check --summary` 顯示目前安裝狀態。

```bash
uds check --summary
```

這幫助用戶在修改前了解目前的配置。

### 步驟 1：詢問配置類型

使用 AskUserQuestion 提供以下選項：

| 類別 | 選項 |
|------|------|
| **基本選項** | Format、Git Workflow、Merge Strategy、Commit Language、Test Levels |
| **AI 工具** | 新增或移除 AI 工具整合 |
| **Skills** | 管理 Skills 安裝（安裝/更新/重新安裝已拒絕的）|
| **Commands** | 管理 Commands 安裝 |
| **進階** | Adoption Level、Content Mode |
| **全部** | 配置所有選項 |

### 步驟 2：根據選擇執行

**如果選擇 AI 工具：**
```bash
uds configure --type ai_tools
```

**如果選擇 Skills：**
```bash
uds configure --type skills
```

**如果選擇 Commands：**
```bash
uds configure --type commands
```

**如果選擇 Adoption Level：**
```bash
uds configure --type level
```

**如果選擇 Content Mode：**
```bash
uds configure --type content_mode
```

## 快速模式

指定類型時，跳過互動式問題：

```bash
/config ai_tools      # 直接配置 AI 工具
/config skills        # 直接管理 Skills
/config commands      # 直接管理 Commands
/config level         # 直接配置採用等級
/config content_mode  # 直接配置內容模式
```

### 非互動式安裝

使用 `--ai-tool` 選項為特定工具安裝 Skills/Commands，無需提示：

```bash
# 為特定工具安裝 Skills（專案層級，預設）
uds configure --type skills --ai-tool opencode

# 為特定工具安裝 Skills（使用者層級）
uds configure --type skills --ai-tool opencode --skills-location user

# 為特定工具安裝 Skills（專案層級，明確指定）
uds configure --type skills --ai-tool claude-code --skills-location project

# 為特定工具安裝 Commands
uds configure --type commands --ai-tool copilot
```

**Skills 位置選項：**

| 選項 | 路徑 | 說明 |
|------|------|------|
| `project` | `.claude/skills/`, `.opencode/skill/` | 專案特定（預設）|
| `user` | `~/.claude/skills/`, `~/.opencode/skill/` | 跨專案共享 |

## 設定類型

| 類型 | 說明 |
|------|------|
| `ai_tools` | AI 工具整合 |
| `skills` | Skills 安裝管理 |
| `commands` | Commands 安裝管理 |
| `level` | 採用等級（1/2/3）|
| `content_mode` | 整合檔案內容模式 |
| `format` | AI/人類文件格式 |
| `workflow` | Git 工作流程策略 |
| `merge_strategy` | 合併策略 |
| `commit_language` | 提交訊息語言 |
| `test_levels` | 測試層級 |
| `methodology` | 開發方法論（實驗性，需要 -E）|
| `all` | 設定所有選項 |

## Skills 配置

選擇 `skills` 類型時，CLI 顯示：

1. **目前狀態** - 顯示每個 AI 工具已安裝的 Skills
2. **拒絕狀態** - 顯示使用者之前拒絕 Skills 的工具
3. **動作選單**：
   - 安裝/更新 Skills
   - 重新安裝已拒絕的 Skills
   - 僅檢視狀態

```
Current Skills status:
  ✓ Claude Code:
    - User: v3.5.1
  ○ OpenCode: Not installed
  ⊘ Copilot: Previously declined

? What would you like to do?
❯ Install/Update Skills
  Reinstall declined Skills
  View status only
  Cancel
```

## Commands 配置

選擇 `commands` 類型時，CLI 顯示：

1. **目前狀態** - 顯示每個支援工具已安裝的 Commands
2. **拒絕狀態** - 顯示使用者之前拒絕 Commands 的工具
3. **動作選單**與 Skills 類似

支援 Commands 的工具：
- OpenCode (`.opencode/commands/`)
- GitHub Copilot (`.github/commands/`)
- Gemini CLI (`.gemini/commands/`)
- Roo Code (`.roo-code/commands/`)

## 內容模式選項

| 模式 | 說明 |
|------|------|
| `standard` | 摘要 + 任務映射，AI 知道何時讀取哪個標準（推薦）|
| `full` | 將所有標準完整內嵌於整合檔案 |
| `minimal` | 僅內嵌核心規則 |

## 設定變更的影響

| 配置 | 影響 |
|------|------|
| AI 工具（新增）| 產生新的整合檔案 |
| AI 工具（移除）| 刪除整合檔案 |
| Skills | 安裝/更新 Skills 至已配置的路徑 |
| Commands | 安裝/更新 Commands 至已配置的路徑 |
| Level | 更新標準，重新產生整合 |
| Content Mode | 重新產生所有整合檔案 |

## 拒絕的功能

CLI 在 `manifest.declinedFeatures` 中追蹤拒絕的 Skills/Commands：

- 之前拒絕的工具不會在 `/update` 提示中出現
- 使用 `/config skills` 或 `/config commands` 重新安裝已拒絕的功能
- 從選單中選擇「重新安裝已拒絕的 Skills/Commands」

## 選項參考

| 選項 | 說明 |
|------|------|
| `--type <type>` | 配置類型 |
| `--ai-tool <tool>` | 特定 AI 工具（非互動式）|
| `--skills-location <loc>` | Skills 安裝位置：project、user |
| `--yes`, `-y` | 跳過確認提示 |
| `-E`, `--experimental` | 啟用實驗性功能 |

## 參考

- CLI 文件：`uds configure --help`
- 初始化命令：[/init](./init.md)
- 檢查命令：[/check](./check.md)
- 更新命令：[/update](./update.md)
