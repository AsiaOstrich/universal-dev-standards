---
source: ../../../docs/OPERATION-WORKFLOW.md
source_version: 1.3.0
translation_version: 1.3.0
status: current
last_updated: 2026-01-26
translator: Claude
---

# UDS 作業流程

> **Language**: [English](../../docs/OPERATION-WORKFLOW.md) | 繁體中文 | [简体中文](../zh-CN/docs/OPERATION-WORKFLOW.md)

**版本**: 1.3.0
**最後更新**: 2026-01-26

本文件提供 Universal Development Standards (UDS) 專案的完整作業流程，涵蓋從核心規範到檔案生成的所有流程。

---

## 目錄

1. [概覽](#1-概覽)
2. [核心規範層](#2-核心規範層)
3. [衍生格式生成](#3-衍生格式生成)
4. [Claude Code Skills](#4-claude-code-skills)
5. [AI 工具整合](#5-ai-工具整合)
6. [CLI 執行流程](#6-cli-執行流程)
7. [維護流程](#7-維護流程)
8. [開發指南](#8-開發指南)
9. [發布流程](#9-發布流程)
10. [檔案路徑參考](#10-檔案路徑參考)

---

## 1. 概覽

### 1.1 專案架構

```
┌─────────────────────────────────────────────────────────────────┐
│                      核心規範層 (core/)                          │
│   16 個標準：Essential(6) + Recommended(6) + Enterprise(4)      │
└──────────────────────────┬──────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ↓                  ↓                  ↓
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│  AI 格式      │  │  選項檔案     │  │  本地化       │
│  ai/standards/│  │  options/     │  │  locales/     │
│  16 個 YAML   │  │  7 類 36 個   │  │  zh-TW/zh-CN  │
└───────┬───────┘  └───────┬───────┘  └───────────────┘
        │                  │
        └────────┬─────────┘
                 ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Claude Code Skills                            │
│   skills/ - 15 個 Skills                            │
│   每個 Skill 對應 1+ 個核心規範                                  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│                      AI 工具整合                                 │
│   integrations/ - 10 種工具範本                                 │
│   CLI 動態生成：CLAUDE.md, .cursorrules, .windsurfrules 等     │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 檔案關係摘要

| 來源 | 衍生格式 | 數量 |
|------|----------|------|
| `core/*.md` | 人類可讀規範 | 16 |
| `ai/standards/*.ai.yaml` | AI 優化規範 | 16 |
| `options/*/*.md` | 實踐選項 | 36 |
| `ai/options/*/*.ai.yaml` | AI 優化選項 | 36 |
| `skills/*/` | Claude Code 技能 | 15 |
| `integrations/*/` | AI 工具範本 | 10 |
| `locales/zh-TW/` | 繁體中文 | ~129 |
| `locales/zh-CN/` | 簡體中文 | 部分 |

---

## 2. 核心規範層

### 2.1 依採用層級分類

#### 層級 1：Essential（6 個規範）

| ID | 檔案 | 說明 |
|----|------|------|
| anti-hallucination | `core/anti-hallucination.md` | AI 協作防幻覺指南 |
| commit-message | `core/commit-message-guide.md` | Conventional Commits 規範 |
| checkin-standards | `core/checkin-standards.md` | 程式碼簽入標準 |
| git-workflow | `core/git-workflow.md` | Git 工作流程標準 |
| changelog | `core/changelog-standards.md` | CHANGELOG 格式規範 |
| versioning | `core/versioning.md` | 語義化版本規範 |

#### 層級 2：Recommended（6 個規範）

| ID | 檔案 | 說明 |
|----|------|------|
| code-review | `core/code-review-checklist.md` | 程式碼審查清單 |
| documentation-structure | `core/documentation-structure.md` | 文件組織結構 |
| documentation-writing | `core/documentation-writing-standards.md` | 文件撰寫標準 |
| project-structure | `core/project-structure.md` | 專案目錄結構 |
| testing | `core/testing-standards.md` | 測試標準 |
| logging | `core/logging-standards.md` | 日誌記錄標準 |

#### 層級 3：Enterprise（4 個規範）

| ID | 檔案 | 說明 |
|----|------|------|
| tdd | `core/test-driven-development.md` | 測試驅動開發 |
| test-completeness | `core/test-completeness-dimensions.md` | 測試完整性維度 |
| spec-driven | `core/spec-driven-development.md` | 規格驅動開發 |
| error-codes | `core/error-code-standards.md` | 錯誤碼標準 |

### 2.2 規範文件範本

```markdown
# [規範名稱]

> **Language**: English | [繁體中文](../locales/zh-TW/core/[file].md)

**版本**: X.Y.Z
**最後更新**: YYYY-MM-DD

---

## 目的

[規範目的說明]

## 主要指南

[詳細指南]

## 相關規範

- [相關規範連結]

## 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| X.Y.Z | YYYY-MM-DD | 說明 |

## 授權

本規範採用 [CC BY 4.0](...)
```

---

## 3. 衍生格式生成

### 3.1 AI 優化格式（`ai/`）

**轉換規則：**
```
core/commit-message-guide.md（人類可讀）
        ↓ 轉換
ai/standards/commit-message.ai.yaml（AI 優化）
```

**名稱對應：**
| 核心檔案 | AI 檔案 |
|----------|---------|
| `changelog-standards` | `changelog` |
| `code-review-checklist` | `code-review` |
| `commit-message-guide` | `commit-message` |
| `error-code-standards` | `error-codes` |
| `logging-standards` | `logging` |
| `testing-standards` | `testing` |
| 其他 | 相同名稱 |

**AI YAML 結構：**
```yaml
---
name: commit-message
description: AI 助手的簡要說明
keywords: [commit, conventional, message, 提交, 訊息]
---

# Commit Message Standards

## Quick Reference
[簡潔內容]

## Configuration Detection
[專案配置偵測邏輯]

## Related Standards
- [核心規範連結]

## Version History
[表格]

## License
CC BY 4.0
```

### 3.2 選項檔案（`options/`）

| 類別 | 選項 | 路徑 |
|------|------|------|
| Git 工作流 | github-flow, gitflow, trunk-based | `options/git-workflow/` |
| 合併策略 | squash, merge-commit, rebase-ff | `options/git-workflow/` |
| 提交訊息語言 | english, traditional-chinese, bilingual | `options/commit-message/` |
| 測試類型 | unit, integration, e2e, system 等 | `options/testing/` |
| 程式碼審查 | pr-review, pair-programming, automated | `options/code-review/` |
| 文件類型 | markdown, api-docs, wiki-style | `options/documentation/` |
| 專案結構 | nodejs, python, java, go 等 | `options/project-structure/` |

### 3.3 本地化（`locales/`）

**同步層級：**
```
core/*.md（主要來源）
    ↓
locales/zh-TW/core/*.md（繁體中文）
    ↓
locales/zh-CN/core/*.md（簡體中文）
```

**YAML Front Matter 範本：**
```yaml
---
source: ../../../docs/OPERATION-WORKFLOW.md
source_version: 1.2.0
translation_version: 1.2.0
status: current
last_updated: 2026-01-10
translator: [名稱]
---
```

**狀態值：**
- `current` - 翻譯已同步
- `outdated` - 來源已更新
- `needs_review` - 需要審查

---

## 4. Claude Code Skills

### 4.1 Skills 清單（15 個 Skills）

| Skill 名稱 | 對應核心規範 | 路徑 |
|------------|--------------|------|
| ai-collaboration-standards | anti-hallucination | `skills/ai-collaboration-standards/` |
| changelog-guide | changelog | `skills/changelog-guide/` |
| code-review-assistant | code-review, checkin | `skills/code-review-assistant/` |
| commit-standards | commit-message | `skills/commit-standards/` |
| documentation-guide | documentation-* | `skills/documentation-guide/` |
| error-code-guide | error-codes | `skills/error-code-guide/` |
| git-workflow-guide | git-workflow | `skills/git-workflow-guide/` |
| logging-guide | logging | `skills/logging-guide/` |
| project-structure-guide | project-structure | `skills/project-structure-guide/` |
| release-standards | versioning | `skills/release-standards/` |
| requirement-assistant | （需求文件） | `skills/requirement-assistant/` |
| spec-driven-dev | spec-driven | `skills/spec-driven-dev/` |
| tdd-assistant | tdd | `skills/tdd-assistant/` |
| test-coverage-assistant | test-completeness | `skills/test-coverage-assistant/` |
| testing-guide | testing | `skills/testing-guide/` |

### 4.2 Skill 目錄結構

```
skills/[skill-name]/
├── SKILL.md              # 主要技能文件（YAML 前置 + 內容）
├── [guide1].md           # 詳細指南
├── [guide2].md           # 詳細指南
└── commands/             # 選用：命令檔案
    └── [command].md
```

### 4.3 SKILL.md 範本

```markdown
---
name: skill-name
description: |
  簡要說明。
  使用時機：觸發此技能的時機。
  關鍵字：[keyword1, keyword2]
---

# 技能標題

> **Language**: English | [繁體中文](翻譯路徑)

**版本**: 1.0.0
**最後更新**: YYYY-MM-DD
**適用範圍**: Claude Code Skills

---

## 目的
[清楚說明]

## 快速參考
[快速參考指南]

## 詳細指南
完整資訊請參閱：
- [guide1.md](./guide1.md)

## 配置偵測
[專案配置偵測]

## 相關規範
- [core/related-standard.md](路徑)

## 版本歷史
| 版本 | 日期 | 變更 |
|------|------|------|

## 授權
CC BY 4.0
```

---

## 5. AI 工具整合

### 5.1 支援工具（10 種工具）

| 工具 | 整合檔案 | 格式 |
|------|----------|------|
| Claude Code | `CLAUDE.md` | Markdown |
| Cursor | `.cursorrules` | 純文字 |
| Windsurf | `.windsurfrules` | 純文字 |
| Cline | `.clinerules` | 純文字 |
| GitHub Copilot | `.github/copilot-instructions.md` | Markdown |
| Google Antigravity | `INSTRUCTIONS.md` | Markdown |
| OpenAI Codex | `AGENTS.md` | Markdown |
| OpenCode | `AGENTS.md`（共用） | Markdown |
| Gemini CLI | `GEMINI.md` | Markdown |
| OpenSpec | `AGENTS.md` | Markdown |

> **相關文件**：完整的 AI Agent 支援狀態、Skills 相容性矩陣及未來規劃，請參閱 [AI-AGENT-ROADMAP.md](./AI-AGENT-ROADMAP.md)。

### 5.2 整合目錄結構

```
integrations/[tool-name]/
├── README.md           # 安裝和使用指南
├── [config-file]       # 工具特定配置
└── examples/           # 選用：範例配置
```

---

## 6. CLI 執行流程

### 6.1 完整流程圖（`uds init`）

```
┌─────────────────────────────────────────────────────────────────┐
│ 階段 1：初始化檢查                                              │
│ - 檢查 .standards/manifest.json 是否存在                        │
│ - 如已初始化，提示使用 uds update                               │
└─────────────────────────────┬───────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 階段 2：專案偵測（detector.js）                                 │
│ - detectLanguage(): C#, PHP, TypeScript, JavaScript, Python     │
│ - detectFramework(): Fat-Free, React, Vue, Angular, .NET        │
│ - detectAITools(): 9 種 AI 工具偵測                             │
└─────────────────────────────┬───────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 階段 3：互動配置（prompts/init.js）                             │
│ - AI 工具選擇（1-9 種）                                         │
│ - Skills 安裝位置（marketplace/user/project/none）              │
│ - 採用層級（Essential/Recommended/Enterprise）                  │
│ - 格式選擇（ai/human/both）                                     │
│ - 標準選項（workflow, commit_language, test_levels）            │
│ - 內容模式（minimal/index/full）                                │
└─────────────────────────────┬───────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 階段 4：標準查詢（registry.js）                                 │
│ - 載入 cli/standards-registry.json                              │
│ - getStandardsByLevel() 篩選標準                                │
│ - getStandardSource() 取得來源路徑                              │
└─────────────────────────────┬───────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 階段 5：檔案複製（copier.js）                                   │
│ - 核心規範 → .standards/*.md                                    │
│ - AI 格式 → .standards/*.ai.yaml                                │
│ - 選項檔案 → .standards/options/                                │
│ - 擴展檔案 → .standards/（語言/框架/本地化）                    │
└─────────────────────────────┬───────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 階段 6：整合檔案生成（integration-generator.js）                │
│ - 根據選擇的 AI 工具動態生成                                    │
│ - 依據 contentMode 調整內容量                                   │
│ - 支援多語言（en/zh-tw）                                        │
│ 生成檔案：                                                      │
│ - CLAUDE.md（Claude Code）                                      │
│ - .cursorrules（Cursor）                                        │
│ - .windsurfrules（Windsurf）                                    │
│ - .clinerules（Cline）                                          │
│ - .github/copilot-instructions.md（Copilot）                    │
│ - AGENTS.md（Codex/OpenCode）                                   │
│ - GEMINI.md（Gemini CLI）                                       │
│ - INSTRUCTIONS.md（Antigravity）                                │
└─────────────────────────────┬───────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 階段 7：Skills 安裝（github.js）                                │
│ - 使用者層級：~/.claude/skills/                                 │
│ - 專案層級：.claude/skills/                                     │
│ - 下載全部 15 個 Skills 檔案                                    │
│ - 寫入 skills-manifest.json                                     │
└─────────────────────────────┬───────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 階段 8：雜湊計算（hasher.js）                                   │
│ - 計算所有複製檔案的 SHA-256 雜湊                               │
│ - 用於 uds check 完整性驗證                                     │
└─────────────────────────────┬───────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 階段 9：Manifest 生成                                           │
│ - 寫入 .standards/manifest.json                                 │
│ - 記錄：版本、配置、檔案路徑、雜湊、時間戳                      │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 生成檔案結構

```
project-root/
├── .standards/                     # 標準目錄
│   ├── manifest.json              # 追蹤清單
│   ├── anti-hallucination.md      # 核心規範（Markdown）
│   ├── anti-hallucination.ai.yaml # 核心規範（AI YAML）
│   ├── commit-message.md
│   ├── commit-message.ai.yaml
│   ├── ...（其他規範）
│   └── options/                   # 選項檔案
│       ├── github-flow.md
│       ├── english.md
│       └── unit-testing.md
│
├── CLAUDE.md                      # Claude Code 整合
├── .cursorrules                   # Cursor 整合
├── .windsurfrules                 # Windsurf 整合
├── .clinerules                    # Cline 整合
├── AGENTS.md                      # Codex/OpenCode 整合
├── .github/
│   └── copilot-instructions.md    # Copilot 整合
│
└── .claude/                       # Claude Code Skills
    └── skills/
        ├── commit-standards/
        ├── code-review-assistant/
        └── ...（其他 skills）
```

### 6.3 CLI 原始碼結構

```
cli/
├── bin/
│   └── uds.js                    # 進入點
├── src/
│   ├── index.js                  # 主要匯出
│   ├── commands/                 # 命令實作
│   │   ├── init.js              # init 命令（約 920 行）
│   │   ├── list.js              # list 命令
│   │   ├── check.js             # check 命令
│   │   ├── update.js            # update 命令
│   │   ├── configure.js         # configure 命令
│   │   └── skills.js            # skills 命令
│   ├── prompts/                  # 互動提示
│   │   ├── init.js              # init 提示（約 1007 行）
│   │   └── integrations.js      # 整合提示
│   └── utils/                    # 工具模組
│       ├── registry.js          # 標準登錄表（207 行）
│       ├── copier.js            # 檔案複製（143 行）
│       ├── github.js            # GitHub 下載（508 行）
│       ├── detector.js          # 專案偵測（159 行）
│       ├── hasher.js            # 雜湊計算（219 行）
│       ├── integration-generator.js  # 整合生成（2310 行）
│       └── reference-sync.js    # 參考同步（189 行）
├── standards-registry.json       # 標準登錄表（約 1000 行）
└── package.json                  # 相依套件
```

---

## 7. 維護流程

### 7.1 同步檢查腳本

| 腳本 | 用途 | 命令 |
|------|------|------|
| `check-translation-sync.sh` | 檢查翻譯同步 | `./scripts/check-translation-sync.sh [locale]` |
| `check-standards-sync.sh` | 檢查 MD ↔ AI YAML 同步 | `./scripts/check-standards-sync.sh` |
| `check-version-sync.sh` | 檢查版本一致性 | `./scripts/check-version-sync.sh` |
| `check-install-scripts-sync.sh` | 檢查安裝腳本同步 | `./scripts/check-install-scripts-sync.sh` |
| `pre-release.sh` | 預發布自動化 | `./scripts/pre-release.sh --version X.Y.Z` |

### 7.2 翻譯同步機制

**檢查流程：**
```bash
# 檢查 zh-TW 翻譯
./scripts/check-translation-sync.sh

# 檢查 zh-CN 翻譯
./scripts/check-translation-sync.sh zh-CN
```

**輸出狀態：**
- `[CURRENT]`（綠色）- 翻譯已同步
- `[OUTDATED]`（紅色）- 翻譯版本過舊
- `[NO META]`（黃色）- 缺少 YAML Front Matter
- `[MISSING]`（紅色）- 來源檔案不存在

**更新流程：**
1. 執行同步檢查
2. 開啟過時的翻譯檔案
3. 更新內容
4. 更新 YAML Front Matter 中的 `source_version` 和 `translation_version`
5. 再次執行同步檢查驗證

### 7.3 標準同步機制

**檢查流程：**
```bash
./scripts/check-standards-sync.sh
```

**第一階段：core/ ↔ ai/standards/**
```
core/changelog-standards.md ↔ ai/standards/changelog.ai.yaml
core/commit-message-guide.md ↔ ai/standards/commit-message.ai.yaml
...
```

**第二階段：options/ ↔ ai/options/**
```
options/git-workflow/github-flow.md ↔ ai/options/git-workflow/github-flow.ai.yaml
options/commit-message/english.md ↔ ai/options/commit-message/english.ai.yaml
...
```

### 7.4 版本同步機制

**版本檔案位置（6 處）：**

| 檔案 | 欄位 | 更新頻率 |
|------|------|----------|
| `cli/package.json` | `"version"` | 每次發布 |
| `.claude-plugin/plugin.json` | `"version"` | 每次發布 |
| `.claude-plugin/marketplace.json` | `"version"` | 每次發布 |
| `cli/standards-registry.json` | 根 `"version"` | 每次發布 |
| `cli/standards-registry.json` | `repositories.standards.version` | 每次發布 |
| `cli/standards-registry.json` | `repositories.skills.version` | 每次發布 |
| `README.md` | `**Version**:` | 僅穩定版本 |

**檢查流程：**
```bash
./scripts/check-version-sync.sh
```

### 7.5 CLI 與斜線命令同步

#### 關係概述

UDS 有兩個相關但獨立的元件：

| 元件 | 類型 | 位置 | 用途 |
|------|------|------|------|
| UDS CLI | Node.js 程式 | `cli/src/` | 執行實際操作（`uds init`、`uds check` 等）|
| 斜線命令 | Markdown 文檔 | `skills/commands/` | 指導 AI 如何使用 CLI |

**執行流程：**
```
使用者在 Claude Code 輸入 /update
    ↓
AI 讀取 skills/commands/update.md
    ↓
AI 執行 CLI 命令（uds check、uds update）
    ↓
AI 根據 CLI 輸出向使用者報告結果
```

#### 同步要求

修改 CLI 功能時，對應的斜線命令文檔**必須**同步更新：

| CLI 檔案 | 斜線命令 |
|----------|----------|
| `cli/src/commands/init.js` | `skills/commands/init.md` |
| `cli/src/commands/check.js` | `skills/commands/check.md` |
| `cli/src/commands/update.js` | `skills/commands/update.md` |
| `cli/src/commands/configure.js` | `skills/commands/configure.md` |
| `cli/src/commands/list.js` | `skills/commands/list.md` |
| `cli/src/commands/skills.js` | `skills/commands/skills.md` |

#### 同步檢查清單

新增 CLI 功能時：

1. [ ] 在 CLI 實作功能（`cli/src/commands/*.js` 或 `cli/src/utils/*.js`）
2. [ ] 新增單元測試（`cli/tests/`）
3. [ ] 更新斜線命令文檔（`skills/commands/*.md`）
4. [ ] 如需要，更新翻譯（`locales/zh-TW/skills/`、`locales/zh-CN/skills/`）
5. [ ] 執行驗證：`cd cli && npm test && npm run lint`

#### 範例：新增 Marketplace Skills 版本檢測

當 CLI `check.js` 更新以檢測 Plugin Marketplace Skills 版本時：

```
步驟 1：在 cli/src/utils/github.js 新增 getMarketplaceSkillsInfo()
        - 讀取 ~/.claude/plugins/installed_plugins.json
        - 返回 universal-dev-standards plugin 的版本資訊
        ↓
步驟 2：更新 cli/src/commands/check.js 的 displaySkillsStatus()
        - 對 Marketplace 安裝呼叫 getMarketplaceSkillsInfo()
        - 顯示版本和最後更新日期
        ↓
步驟 3：在 cli/tests/utils/github.test.js 新增單元測試
        - 測試各種情境（檔案存在、找不到、解析錯誤）
        ↓
步驟 4：更新 skills/commands/check.md
        - 在 Skills Status 區段記錄新的版本輸出
        ↓
步驟 5：更新 skills/commands/update.md
        - 新增說明如何檢查 Skills 版本的章節
```

**關鍵洞察**：如果不更新斜線命令文檔，AI 將不知道新的 CLI 功能，可能向使用者提供不準確的資訊。

---

## 8. 開發指南

### 8.1 新增核心規範

**完整流程（10 步驟）：**

```
步驟 1：建立 core/new-standard.md
        ↓
步驟 2：建立 ai/standards/new-standard.ai.yaml
        ↓
步驟 3：建立 options/new-standard/*.md（如適用）
        ↓
步驟 4：建立 ai/options/new-standard/*.ai.yaml（如適用）
        ↓
步驟 5：建立 skills/new-skill/（如適用）
        ↓
步驟 6：建立 locales/zh-TW/core/new-standard.md
        ↓
步驟 7：建立 locales/zh-CN/core/new-standard.md
        ↓
步驟 8：更新 cli/standards-registry.json
        ↓
步驟 9：更新 CHANGELOG.md
        ↓
步驟 10：執行所有同步檢查腳本
```

**詳細步驟：**

1. **建立核心規範**
   ```bash
   # 建立 markdown 檔案
   touch core/new-standard.md
   # 遵循標準範本結構
   ```

2. **建立 AI 優化版本**
   ```bash
   touch ai/standards/new-standard.ai.yaml
   # 使用簡潔的 YAML 格式
   ```

3. **建立選項（如適用）**
   ```bash
   mkdir -p options/new-standard
   touch options/new-standard/option-1.md
   touch options/new-standard/option-2.md

   mkdir -p ai/options/new-standard
   touch ai/options/new-standard/option-1.ai.yaml
   touch ai/options/new-standard/option-2.ai.yaml
   ```

4. **建立 Skill（如適用）**
   ```bash
   mkdir -p skills/new-standard-skill
   touch skills/new-standard-skill/SKILL.md
   touch skills/new-standard-skill/guide.md
   ```

5. **建立翻譯**
   ```bash
   touch locales/zh-TW/core/new-standard.md
   touch locales/zh-CN/core/new-standard.md
   # 添加含來源追蹤的 YAML Front Matter
   ```

6. **更新登錄表**
   ```json
   // 在 cli/standards-registry.json 中
   {
     "standards": [
       {
         "id": "new-standard",
         "name": "New Standard Name",
         "level": 2,
         "category": "reference",
         "source": {
           "ai": "ai/standards/new-standard.ai.yaml",
           "human": "core/new-standard.md"
         }
       }
     ]
   }
   ```

7. **驗證**
   ```bash
   ./scripts/check-standards-sync.sh
   ./scripts/check-translation-sync.sh
   ./scripts/check-translation-sync.sh zh-CN
   cd cli && npm test
   ```

### 8.2 新增 Skill

**完整流程（6 步驟）：**

```
步驟 1：建立 skills/new-skill/ 目錄
        ↓
步驟 2：建立含 YAML 前置的 SKILL.md
        ↓
步驟 3：建立輔助指南檔案
        ↓
步驟 4：在 locales/ 中建立翻譯
        ↓
步驟 5：更新文件（README.md 等）
        ↓
步驟 6：執行驗證腳本
```

### 8.3 新增 AI 工具整合

**完整流程（14 步驟）：**

```
階段 1：研究與規劃（3 步驟）
步驟 1：研究目標工具的指令格式與功能
步驟 2：識別相較於 Claude Code 的限制
步驟 3：建立 Skills 對照計畫（哪些 Claude Code 功能要移植）
        ↓
階段 2：核心檔案 - 4 檔案模式（4 步驟）
步驟 4：建立 integrations/[tool-name]/ 目錄
步驟 5：建立 README.md（安裝指南、限制說明、功能比較）
步驟 6：建立 [tool]-instructions.md（主要 AI 指令）
步驟 7：建立 CHAT-REFERENCE.md（適用於無斜線命令的工具）
步驟 8：建立 skills-mapping.md（Claude Code → 工具功能對照）
        ↓
階段 3：翻譯（2 步驟）
步驟 9：建立 locales/zh-TW/integrations/[tool-name]/（4 個檔案）
步驟 10：建立 locales/zh-CN/integrations/[tool-name]/（4 個檔案）
        ↓
階段 4：整合更新（3 步驟）
步驟 11：更新 integration-generator.js（如需 CLI 動態生成）
步驟 12：更新 skills/[tool]/ 精簡版（如存在）
步驟 13：更新相關文件（README.md 等）
        ↓
階段 5：驗證（1 步驟）
步驟 14：執行所有驗證腳本
```

#### 4 檔案模式（必要結構）

完整的 AI 工具整合需建立這 4 個檔案：

| 檔案 | 用途 | 必要 |
|------|------|------|
| `README.md` | 安裝指南、快速開始、限制說明、功能比較 | ✅ 必要 |
| `[tool]-instructions.md` | 工具的主要 AI 指令 | ✅ 必要 |
| `CHAT-REFERENCE.md` | Chat 提示範本（適用於無斜線命令的工具） | ⚠️ 視情況 |
| `skills-mapping.md` | Claude Code → 工具功能對照 | ✅ 必要 |

**範例：**
```
integrations/github-copilot/
├── README.md                    # 整合概述
├── copilot-instructions.md      # 主要指令
├── COPILOT-CHAT-REFERENCE.md    # Chat 提示範本
└── skills-mapping.md            # Skills 遷移指南
```

#### README.md 範本

```markdown
# [工具名稱] 整合

## 概述
[簡要說明]

## 快速開始

### 方式 1：從儲存庫複製
### 方式 2：使用 curl 下載
### 方式 3：使用 UDS CLI

## 配置方式
[IDE 特定設定：VS Code、JetBrains 等]

## 限制說明
[與 Claude Code 和其他工具的功能比較表]

## 包含的規範
[整合中包含的規範表格]

## 驗證整合
[如何驗證整合是否正常運作]

## 相關規範
## 版本歷史
## 授權
```

#### Skills 對照方法論

將 Claude Code 功能遷移到其他工具時：

| Claude Code 功能 | 遷移策略 |
|------------------|----------|
| Skills（18 個） | → 指令檔案中的專用章節 |
| 斜線命令（16 個） | → CHAT-REFERENCE.md 中的 Chat 提示範本 |
| MCP 支援 | → 記錄為限制，建議替代方案 |
| 全域配置 | → 記錄為限制 |
| 自動觸發關鍵字 | → 建議使用 IDE 程式碼片段/快捷鍵作為替代 |
| 方法論追蹤 | → 記錄為限制，建議手動追蹤 |

#### 翻譯要求

每個整合需要 8 個翻譯檔案（每種語言 4 個）：

**目錄：**
- `locales/zh-TW/integrations/[tool-name]/`（繁體中文）
- `locales/zh-CN/integrations/[tool-name]/`（簡體中文）

**YAML 前置範本：**
```yaml
---
source: ../../../docs/OPERATION-WORKFLOW.md
source_version: X.Y.Z
translation_version: X.Y.Z
last_synced: YYYY-MM-DD
status: current
---
```

#### 驗證檢查清單

完成整合後，驗證：

```bash
# 翻譯同步檢查
./scripts/check-translation-sync.sh
./scripts/check-translation-sync.sh zh-CN

# 標準一致性檢查
./scripts/check-standards-sync.sh

# CLI 測試（如修改了 integration-generator.js）
cd cli && npm test && npm run lint

# 完整預發布檢查
./scripts/pre-release-check.sh
```

#### 功能比較表範本

在 README.md 中包含此表格：

| 功能 | [新工具] | Claude Code | 其他工具 |
|------|----------|-------------|----------|
| 專案指令 | ✅/❌ | ✅ | ... |
| 全域配置 | ✅/❌ | ✅ | ... |
| 斜線命令 | ✅/❌ | ✅（18 個 skills） | ... |
| MCP 支援 | ✅/❌ | ✅ | ... |
| 自訂 skills | ✅/❌ | ✅ | ... |
| 多檔案上下文 | ✅/❌ | ✅ | ... |

---

## 9. 發布流程

### 9.1 預發布檢查清單

**任何發布前：**
- [ ] 所有測試通過（`npm test`）
- [ ] Linting 通過（`npm run lint`）
- [ ] 版本同步檢查通過（`./scripts/check-version-sync.sh`）
- [ ] CHANGELOG.md 已更新
- [ ] Git 工作目錄乾淨

**版本檔案檢查清單（6 個檔案）：**
- [ ] `cli/package.json` - `"version": "X.Y.Z"`
- [ ] `.claude-plugin/plugin.json` - `"version": "X.Y.Z"`
- [ ] `.claude-plugin/marketplace.json` - `"version": "X.Y.Z"`
- [ ] `cli/standards-registry.json` - 3 處位置
- [ ] `README.md` - `**Version**:`（僅穩定版本）

### 9.2 版本類型與 npm Tags

| 類型 | 版本格式 | npm Tag | 用途 |
|------|----------|---------|------|
| 穩定版 | `3.3.0` | `@latest` | 正式發布 |
| Beta | `3.3.0-beta.1` | `@beta` | 測試新功能 |
| Alpha | `3.3.0-alpha.1` | `@alpha` | 早期內部測試 |
| RC | `3.3.0-rc.1` | `@rc` | 最終預發布測試 |

### 9.3 完整發布工作流

```
步驟 1：預發布準備
        ./scripts/pre-release.sh --version X.Y.Z
        ↓
步驟 2：更新 CHANGELOG.md
        （遵循 Keep a Changelog 格式）
        ↓
步驟 3：提交變更
        git add -A
        git commit -m "chore(release): prepare vX.Y.Z"
        ↓
步驟 4：建立 Git 標籤
        git tag vX.Y.Z
        git push origin main --tags
        ↓
步驟 5：建立 GitHub Release
        （在 GitHub UI 中手動操作）
        ↓
步驟 6：GitHub Actions 自動發布
        - 偵測版本類型（stable/beta/alpha/rc）
        - npm publish --tag [latest/beta/alpha/rc]
        ↓
步驟 7：驗證發布
        npm view universal-dev-standards dist-tags
```

### 9.4 GitHub Actions 工作流

**CI 工作流（`.github/workflows/ci.yml`）：**
- 觸發條件：Push 到 main、PR 到 main
- 工作：Linting、測試（多矩陣）、翻譯同步檢查

**發布工作流（`.github/workflows/publish.yml`）：**
- 觸發條件：GitHub Release 發布
- 自動從 package.json 偵測版本類型
- 使用適當的 tag 發布到 npm

---

## 10. 檔案路徑參考

### 10.1 核心目錄

| 目錄 | 說明 | 數量 |
|------|------|------|
| `core/` | 人類可讀核心規範 | 16 檔案 |
| `ai/standards/` | AI 優化規範 | 16 檔案 |
| `ai/options/` | AI 優化選項 | 36 檔案 |
| `options/` | 人類可讀選項 | 36 檔案 |
| `skills/` | Claude Code skills | 15 目錄 |
| `integrations/` | AI 工具整合範本 | 10 目錄 |
| `locales/zh-TW/` | 繁體中文翻譯 | ~129 檔案 |
| `locales/zh-CN/` | 簡體中文翻譯 | 部分 |

### 10.2 維護腳本

| 腳本 | 路徑 | 用途 |
|------|------|------|
| 翻譯同步 | `scripts/check-translation-sync.sh` | 檢查翻譯同步 |
| 標準同步 | `scripts/check-standards-sync.sh` | 檢查 MD ↔ YAML 同步 |
| 版本同步 | `scripts/check-version-sync.sh` | 檢查版本一致性 |
| 安裝腳本同步 | `scripts/check-install-scripts-sync.sh` | 檢查安裝腳本 |
| 預發布 | `scripts/pre-release.sh` | 預發布自動化 |

### 10.3 配置檔案

| 檔案 | 用途 |
|------|------|
| `cli/package.json` | 主版本來源、相依套件 |
| `cli/standards-registry.json` | 標準登錄表、版本資訊 |
| `.claude-plugin/plugin.json` | Plugin 配置 |
| `.claude-plugin/marketplace.json` | Marketplace 配置 |
| `cli/.eslintrc.json` | ESLint 配置 |
| `cli/vitest.config.js` | 測試配置 |

### 10.4 GitHub Actions

| 檔案 | 用途 |
|------|------|
| `.github/workflows/ci.yml` | CI 工作流（測試、linting） |
| `.github/workflows/publish.yml` | npm 發布工作流 |

---

## 附錄：快速參考命令

### 日常維護

```bash
# 執行所有同步檢查
./scripts/check-standards-sync.sh
./scripts/check-translation-sync.sh
./scripts/check-version-sync.sh

# 執行測試和 linting
cd cli && npm test && npm run lint
```

### 預發布

```bash
# 自動化預發布準備
./scripts/pre-release.sh --version 3.4.0

# 或使用選項
./scripts/pre-release.sh --version 3.4.0-beta.1 --skip-translations
```

### 發布

```bash
# 提交並標記
git add -A
git commit -m "chore(release): prepare v3.4.0"
git tag v3.4.0
git push origin main --tags

# 在 GitHub Release 後驗證
npm view universal-dev-standards dist-tags
```

---

## 授權

本文件採用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)。

**來源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
