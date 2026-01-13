---
source: ../../../../integrations/opencode/README.md
source_version: 1.3.0
translation_version: 1.3.0
last_synced: 2026-01-13
status: current
---

# OpenCode 整合

本目錄提供將通用開發規範與 OpenCode 整合的資源。

## 概述

OpenCode 是開源 AI 編碼代理，可作為終端介面、桌面應用或 IDE 擴充。此整合協助 OpenCode 理解您的專案並遵循開發規範。

## 資源

- **[AGENTS.md](./AGENTS.md)**（必要）：
  專案級規則檔，OpenCode 會自動載入。

- **[skills-mapping.md](./skills-mapping.md)**（參考）：
  將所有 18 個 Claude Code 技能對應到 OpenCode 等效方式。

- **[opencode.json](../../../../integrations/opencode/opencode.json)**（可選）：
  配置範例，包含權限設定和自訂 agent。

## 配置層級

OpenCode 支援多層配置：

| 類型 | 檔案位置 | 說明 |
|------|---------|------|
| 專案規則 | `AGENTS.md` | 專案根目錄，自動載入 |
| 全域規則 | `~/.config/opencode/AGENTS.md` | 個人規則，適用所有專案 |
| 專案配置 | `opencode.json` | JSON 格式配置 |
| 全域配置 | `~/.config/opencode/opencode.json` | 全域 JSON 配置 |
| 自訂 Agent | `.opencode/agent/*.md` | 專案級 agent |
| 全域 Agent | `~/.config/opencode/agent/*.md` | 全域 agent |

## 快速開始

### 方式一：複製規則檔（推薦）

```bash
# 複製到專案根目錄
cp integrations/opencode/AGENTS.md AGENTS.md

# 可選：複製配置檔
cp integrations/opencode/opencode.json opencode.json
```

### 方式二：使用 curl

```bash
curl -o AGENTS.md https://raw.githubusercontent.com/AsiaOstrich/universal-dev-standards/main/integrations/opencode/AGENTS.md
```

### 方式三：使用 /init（追加模式）

```bash
opencode
/init
```

注意：`/init` 會**追加**到現有 AGENTS.md，而非覆蓋。

### 方式四：使用 UDS CLI（推薦用於 Skills）

```bash
# 全域安裝 UDS CLI
npm install -g universal-dev-standards

# 初始化專案 - 選擇 OpenCode 作為 AI 工具
uds init

# Skills 將安裝到 .claude/skills/（OpenCode 會自動偵測）
```

**v3.5.0 新功能**：OpenCode 現在在 CLI 中被視為 skills 相容工具。
當只選擇 OpenCode（或 Claude Code）時，將自動提供帶有 skills 的精簡安裝。

使用 `uds check` 驗證安裝狀態和 skills 相容性。

## 規則合併行為

OpenCode 的規則合併機制：

| 情況 | 行為 |
|------|------|
| `/init` 且已有 AGENTS.md | **追加**新內容，不覆蓋 |
| 全域 + 專案規則同時存在 | **合併**兩者，專案規則優先 |
| 配置檔（opencode.json） | **合併**，只有衝突的鍵才覆蓋 |

## 配置選項

### opencode.json

```json
{
  "$schema": "https://opencode.ai/config.json",
  "instructions": ["AGENTS.md", "CONTRIBUTING.md"],
  "permission": {
    "edit": "ask",
    "bash": "ask"
  },
  "agent": {
    "code-reviewer": {
      "description": "Reviews code following standards",
      "mode": "subagent",
      "tools": {"write": false, "edit": false}
    }
  }
}
```

**關鍵選項**：
- `instructions`：引用額外規則檔（適用於 monorepo）
- `permission`：編輯和 bash 指令需使用者確認
- `agent`：定義具有特定能力的自訂 agent

---

## Skills 相容性

OpenCode **完全相容** Claude Code 技能。所有 18 個 UDS 技能無需修改即可使用。

### 配置對照

| Claude Code | OpenCode |
|-------------|----------|
| `CLAUDE.md` | `AGENTS.md` |
| `.claude/skills/` | `.opencode/skill/`（也讀取 `.claude/skills/`） |
| `settings.json` | `opencode.json` |

### 技能搜索順序

OpenCode 按以下順序搜索技能：
1. `.opencode/skill/<name>/SKILL.md`（專案）
2. `~/.config/opencode/skill/<name>/SKILL.md`（全域）
3. **`.claude/skills/<name>/SKILL.md`**（Claude 相容 ✅）

### 快速驗證

```bash
# 在 OpenCode 中測試技能載入
opencode
/commit  # 應載入 commit-standards 技能
```

完整技能對照和安裝方法，請參閱 **[skills-mapping.md](./skills-mapping.md)**

---

## 相關標準

- [防幻覺標準](../../core/anti-hallucination.md)
- [Commit 訊息指南](../../core/commit-message-guide.md)
- [程式碼審查清單](../../core/code-review-checklist.md)

---

## 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| 1.3.0 | 2026-01-13 | 新增 UDS CLI 安裝選項；OpenCode 現在在 CLI 中支援 skills |
| 1.2.0 | 2026-01-13 | 新增 skills-mapping.md；簡化 README |
| 1.1.0 | 2026-01-13 | 新增 Claude Code 遷移指南 |
| 1.0.0 | 2026-01-09 | 初始 OpenCode 整合 |

---

## 授權

本文件以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。
