---
source: ../../../../integrations/opencode/skills-mapping.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-01-13
status: current
---

# Skills 移植指南

本文件將 Claude Code 技能對應到 OpenCode 的等效實現方式。

---

## 概述

Claude Code 提供 18 個技能和 16 個斜線指令。OpenCode 原生支援技能，且**完全相容** Claude Code 技能格式。

### 關鍵優勢：原生相容

OpenCode 按以下順序搜索技能：
1. `.opencode/skill/<name>/SKILL.md`（專案本地）
2. `~/.config/opencode/skill/<name>/SKILL.md`（全域）
3. **`.claude/skills/<name>/SKILL.md`**（Claude 相容 ✅）

這意味著所有 UDS Claude Code 技能無需修改即可在 OpenCode 中使用。

---

## 技能對照表

| Claude Code 技能 | OpenCode 實現方式 | 狀態 |
|-----------------|-------------------|------|
| **ai-collaboration-standards** | AGENTS.md 第 2 節 | ✅ 完整 |
| **commit-standards** | AGENTS.md 第 3 節 + 技能 | ✅ 完整 |
| **code-review-assistant** | AGENTS.md 第 4 節 + 技能 | ✅ 完整 |
| **tdd-assistant** | 技能（自動載入） | ✅ 完整 |
| **test-coverage-assistant** | 技能（自動載入） | ✅ 完整 |
| **checkin-assistant** | AGENTS.md 第 5 節 + 技能 | ✅ 完整 |
| **requirement-assistant** | 技能（自動載入） | ✅ 完整 |
| **spec-driven-dev** | AGENTS.md 第 1 節 + 技能 | ✅ 完整 |
| **testing-guide** | 技能（自動載入） | ✅ 完整 |
| **release-standards** | 技能（自動載入） | ✅ 完整 |
| **changelog-guide** | 技能（自動載入） | ✅ 完整 |
| **git-workflow-guide** | 技能（自動載入） | ✅ 完整 |
| **documentation-guide** | 技能（自動載入） | ✅ 完整 |
| **methodology-system** | 技能（自動載入） | ✅ 完整 |
| **refactoring-assistant** | 技能（自動載入） | ✅ 完整 |
| **error-code-guide** | 技能（自動載入） | ✅ 完整 |
| **project-structure-guide** | 技能（自動載入） | ✅ 完整 |
| **logging-guide** | 技能（自動載入） | ✅ 完整 |

### 狀態說明

| 狀態 | 含義 |
|------|------|
| ✅ 完整 | 技能在 OpenCode 中完全相同 |
| ⚠️ 部分 | 部分功能有差異 |
| ❌ 無 | 無法複製 |

---

## 斜線指令對照

OpenCode 支援與 Claude Code 相同的技能調用語法：

| Claude Code | OpenCode | 備註 |
|-------------|----------|------|
| `/commit` | `/commit` 或 `skill("commit-standards")` | 相同 |
| `/review` | `/review` 或 `skill("code-review-assistant")` | 相同 |
| `/tdd` | `/tdd` 或 `skill("tdd-assistant")` | 相同 |
| `/coverage` | `/coverage` 或 `skill("test-coverage-assistant")` | 相同 |
| `/requirement` | `/requirement` 或 `skill("requirement-assistant")` | 相同 |
| `/check` | `/check` 或 `skill("checkin-assistant")` | 相同 |
| `/release` | `/release` 或 `skill("release-standards")` | 相同 |
| `/changelog` | `/changelog` 或 `skill("changelog-guide")` | 相同 |
| `/docs` | `/docs` 或 `skill("documentation-guide")` | 相同 |
| `/spec` | `/spec` 或 `skill("spec-driven-dev")` | 相同 |
| `/methodology` | `/methodology` 或 `skill("methodology-system")` | 相同 |
| `/bdd` | 透過 `/methodology` 或 `/tdd` | 相同功能 |
| `/config` | `/config` 或 `skill("project-structure-guide")` | 相同 |
| `/init` | `/init`（內建） | OpenCode 原生 |
| `/update` | 手動或透過 CLI | 使用 `uds update` |

---

## 安裝方法

### 方法一：使用 UDS Skills 目錄（推薦）

配置 OpenCode 從 UDS 安裝載入技能：

```json
// opencode.json
{
  "instructions": [
    "AGENTS.md",
    "node_modules/@anthropic/universal-dev-standards/skills/claude-code/*/SKILL.md"
  ]
}
```

### 方法二：複製技能到專案

```bash
# 複製所有 UDS 技能到專案
cp -r node_modules/@anthropic/universal-dev-standards/skills/claude-code/* .opencode/skill/

# 或複製特定技能
cp -r node_modules/@anthropic/universal-dev-standards/skills/claude-code/commit-standards .opencode/skill/
```

### 方法三：全域安裝

```bash
# 複製到全域 OpenCode 配置
cp -r node_modules/@anthropic/universal-dev-standards/skills/claude-code/* ~/.config/opencode/skill/
```

### 方法四：使用 Claude 路徑（零配置）

如果您已有 Claude Code 技能：

```bash
# OpenCode 會自動偵測 .claude/skills/
# 無需任何動作！
```

---

## 功能比較

### 相同功能

| 功能 | Claude Code | OpenCode |
|------|-------------|----------|
| 技能格式 | YAML frontmatter + Markdown | ✅ 相同 |
| 技能搜索路徑 | `.claude/skills/` | ✅ + `.opencode/skill/` |
| 斜線指令 | `/commit`、`/review` 等 | ✅ 相同 |
| 自動觸發 | 基於關鍵字 | ✅ 相同 |
| 技能權限 | 按技能設定 | ✅ 相同 |

### OpenCode 優勢

| 功能 | Claude Code | OpenCode |
|------|-------------|----------|
| 內建 agents | ❌ 無 | ✅ `build`、`plan`、`general`、`explore` |
| Agent 定義 | ❌ 非原生 | ✅ Markdown 檔案 |
| Glob 模式 | ❌ 不支援 | ✅ `instructions: ["**/*.md"]` |
| Subagent 調用 | ❌ 非原生 | ✅ `@agent-name` |
| 多 LLM 提供者 | ❌ 僅 Claude | ✅ Claude、OpenAI、Google、本地 |

### Claude Code 優勢

| 功能 | Claude Code | OpenCode |
|------|-------------|----------|
| MCP 整合 | ✅ 完整 | ⚠️ 有限 |
| 子目錄規則 | ✅ 每資料夾 CLAUDE.md | ❌ 單一 AGENTS.md |
| 工具生態系 | ✅ Anthropic 工具 | ⚠️ 社群工具 |

---

## 技能專用自訂 Agents

OpenCode 允許為特定技能建立專門的 agent：

### 程式碼審查 Agent

```markdown
<!-- .opencode/agent/reviewer.md -->
---
description: 依據 UDS 程式碼審查清單進行審查
mode: subagent
temperature: 0.3
tools:
  write: false
  edit: false
  bash: false
---

# 程式碼審查 Agent

您是程式碼審查專家。請遵循以下指南：

1. 使用 code-review-assistant 技能
2. 應用 core/code-review-checklist.md 的審查清單
3. 使用註解前綴：❗ BLOCKING、⚠️ IMPORTANT、💡 SUGGESTION、❓ QUESTION
4. 檢查所有 10 個審查類別

調用方式：@reviewer
```

### TDD 教練 Agent

```markdown
<!-- .opencode/agent/tdd-coach.md -->
---
description: 引導 TDD 工作流程（紅-綠-重構）
mode: subagent
temperature: 0.5
---

# TDD 教練 Agent

您是 TDD 教練。協助開發者：

1. 紅色階段：撰寫失敗的測試
2. 綠色階段：最少程式碼通過測試
3. 重構階段：保持綠色下清理程式碼

始終使用 tdd-assistant 技能。

調用方式：@tdd-coach
```

---

## 技能配置

### 權限控制

```json
// opencode.json
{
  "permission": {
    "skill": {
      "*": "allow",
      "methodology-system": "ask",
      "release-standards": "ask"
    }
  }
}
```

### 停用特定技能

```json
// opencode.json
{
  "permission": {
    "skill": {
      "methodology-system": "deny"
    }
  }
}
```

---

## 驗證清單

設定技能後：

```
□ 執行 `opencode` 並輸入 `/commit` 測試技能載入
□ 驗證技能自動完成功能（輸入 `/` 查看可用項目）
□ 使用 `@agent-name` 測試自訂 agents
□ 確認 AGENTS.md 已載入（使用 `/show rules` 查看）
□ 確認 glob 模式運作（若在 opencode.json 中使用）
```

---

## 疑難排解

### 技能未載入

1. **檢查檔案名稱**：必須是 `SKILL.md`（全大寫）
2. **驗證 frontmatter**：需要 `name` 和 `description`
3. **檢查路徑**：應為 `.opencode/skill/<name>/SKILL.md`
4. **檢視權限**：檢查 `opencode.json` 技能權限

### 斜線指令無效

1. **驗證技能存在**：檢查技能目錄
2. **檢查名稱對應**：斜線指令使用技能的 `name` 欄位
3. **嘗試完整語法**：使用 `skill("skill-name")` 而非 `/skill-name`

---

## 相關資源

- [AGENTS.md](../../../../integrations/opencode/AGENTS.md) - 核心規則檔
- [opencode.json](../../../../integrations/opencode/opencode.json) - 配置範例
- [Claude Code Skills](../../../../skills/claude-code/) - 原始技能
- [GitHub Copilot 技能對照](../github-copilot/skills-mapping.md) - Copilot 等效版本

---

## 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| 1.0.0 | 2026-01-13 | 初始版本 |

---

## 授權

本文件以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。
