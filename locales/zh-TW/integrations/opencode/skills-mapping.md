---
source: ../../../../integrations/opencode/skills-mapping.md
source_version: 1.4.0
translation_version: 1.4.0
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

### 方法一：使用 UDS CLI（推薦）

為 Claude Code 和 OpenCode 取得技能的最簡單方式：

```bash
# 全域安裝 UDS CLI
npm install -g universal-dev-standards

# 初始化專案 - 選擇 OpenCode 作為 AI 工具
uds init

# 技能會安裝到 .claude/skills/
# OpenCode 會自動偵測此路徑 ✅
```

**v3.5.0 新功能**：OpenCode 現在在 CLI 中被視為 skills 相容工具。
當只選擇 OpenCode（或 Claude Code）時，將自動提供帶有 skills 的精簡安裝。

```bash
# 驗證安裝狀態和 skills 相容性
uds check
```

### 方法二：從 GitHub 複製

```bash
# 複製儲存庫
git clone https://github.com/AsiaOstrich/universal-dev-standards.git /tmp/uds

# 複製技能到 OpenCode 目錄
cp -r /tmp/uds/skills/claude-code/* ~/.config/opencode/skill/

# 或複製到專案層級
cp -r /tmp/uds/skills/claude-code/* .opencode/skill/

# 清理
rm -rf /tmp/uds
```

### 方法三：透過 Claude Code Plugin（若已安裝）

如果您已透過 Claude Code Plugin Marketplace 安裝 UDS：

```bash
# 檢查技能安裝位置
uds skills

# 從 Claude 技能路徑複製到 OpenCode
cp -r .claude/skills/* ~/.config/opencode/skill/

# 或複製特定技能
cp -r .claude/skills/commit-standards ~/.config/opencode/skill/
```

### 方法四：直接下載

```bash
# 直接下載特定技能
mkdir -p .opencode/skill/commit-standards
curl -o .opencode/skill/commit-standards/SKILL.md \
  https://raw.githubusercontent.com/AsiaOstrich/universal-dev-standards/main/skills/claude-code/commit-standards/SKILL.md
```

### 方法五：使用 Claude 路徑（零配置）

如果您已透過 `uds init` 安裝 Claude Code 技能：

```bash
# OpenCode 會自動偵測 .claude/skills/
# 無需任何動作！
```

### 方法六：社群 Marketplace

OpenCode 沒有像 Claude Code 那樣的官方 marketplace，但有幾個社群驅動的選項：

**[n-skills](https://github.com/numman-ali/n-skills)** - 精選 marketplace：
- 支援 Claude Code、Cursor、Windsurf、Cline、OpenCode 和 Codex
- 只收錄高品質、有實際價值的技能

**[claude-plugins.dev](https://claude-plugins.dev/skills)** - 自動索引發現：
- 自動索引 GitHub 上所有公開的 Agent Skills
- 支援 Claude、Cursor、OpenCode、Codex 等 AI 編碼助手

**[agentskills.io](https://agentskills.io)** - 開放標準：
- Anthropic 於 2024 年 12 月發布的 Agent Skills 規範
- 已被 OpenCode、Codex、Cursor 等多種工具採用

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

## 跨工具相容性

### Skills 路徑參考

[Agent Skills 規範](https://agentskills.io/specification) **未指定標準安裝路徑**，各工具自行實作探索機制。

#### 路徑對照表

| AI Agent | 專案路徑 | 使用者路徑 | Claude 相容 |
|----------|---------|-----------|-------------|
| Claude Code | `.claude/skills/` | `~/.claude/skills/` | ✅ 原生 |
| OpenCode | `.opencode/skill/`<br>`.claude/skills/` | `~/.config/opencode/skill/` | ✅ 支援 |
| Cursor | `.cursor/skills/`<br>`.claude/skills/` | `~/.cursor/skills/`<br>`~/.claude/skills/` | ✅ 支援 |
| OpenAI Codex | `.codex/skills/` | `~/.codex/skills/` | ❌ 獨立 |
| GitHub Copilot | `.github/skills/`<br>`.claude/skills/` (legacy) | `~/.copilot/skills/`<br>`~/.claude/skills/` (legacy) | ✅ 支援 |
| Windsurf | `.windsurf/skills/` | `~/.codeium/windsurf/skills/` | ❌ 獨立 |
| Cline | `.cline/skills/` | `~/.cline/skills/` | ❌ 獨立 |

#### 為何選擇 `.claude/skills/`？

UDS 將技能安裝到 `.claude/skills/` 的原因：

1. **最廣泛相容**：多數工具支援此路徑（Cursor、Copilot、OpenCode）
2. **事實標準**：Claude Code 是 Agent Skills 概念的發起者
3. **單次安裝**：一次安裝即可跨多個工具使用

#### 未來考量

- GitHub Copilot 建議使用 `.github/skills/`（將 `.claude/` 標記為 legacy）
- 中立路徑如 `.agent-skills/` 可能成為未來標準
- UDS 將在社群達成共識時進行調整

#### 跨工具安裝

對於不讀取 `.claude/skills/` 的工具：

| 工具 | 解決方案 |
|------|----------|
| OpenAI Codex | `cp -r .claude/skills/* ~/.codex/skills/` |
| Windsurf | `cp -r .claude/skills/* .windsurf/skills/` |
| Cline | `cp -r .claude/skills/* .cline/skills/` |

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
| 1.4.0 | 2026-01-13 | 新增跨工具相容性章節與路徑對照表 |
| 1.3.0 | 2026-01-13 | 新增社群 marketplace 章節（n-skills、claude-plugins.dev、agentskills.io） |
| 1.2.0 | 2026-01-13 | 更新 CLI 方法；OpenCode 現在在 UDS CLI 中支援 skills |
| 1.1.0 | 2026-01-13 | 修正安裝方法；移除錯誤的 npm 路徑 |
| 1.0.0 | 2026-01-13 | 初始版本 |

---

## 授權

本文件以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。
