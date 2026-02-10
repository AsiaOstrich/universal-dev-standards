---
source: ../../../docs/CLI-INIT-OPTIONS.md
source_version: 3.5.1
translation_version: 3.5.1
last_synced: 2026-01-15
status: current
---

# UDS CLI Init 選項完整指南

> **語言**: [English](../../../docs/CLI-INIT-OPTIONS.md) | 繁體中文 | [简体中文](../../zh-CN/docs/CLI-INIT-OPTIONS.md)
>
> **版本**: 3.5.0
> **最後更新**: 2026-01-09

本文件詳細說明 `uds init` 命令的每一個選項，包含使用情境、影響範圍和建議選擇。

---

## 目錄

1. [AI 工具選擇](#1-ai-工具選擇)
2. [Skills 安裝位置](#2-skills-安裝位置)
3. [Standards Scope（標準範圍）](#3-standards-scope標準範圍)
4. [Adoption Level（採用等級）](#4-adoption-level採用等級)
5. [Format（標準格式）](#5-format標準格式)
6. [Standard Options（標準選項）](#6-standard-options標準選項)
7. [Extensions（擴展）](#7-extensions擴展)
8. [Integration Configuration（整合配置）](#8-integration-configuration整合配置)
9. [Content Mode（內容模式）](#9-content-mode內容模式)
10. [Methodology（開發方法論）](#10-methodology開發方法論)
11. [CLI 參數對照表](#11-cli-參數對照表)

---

## 1. AI 工具選擇

### 互動式提示

```
? Which AI tools are you using?
  ── Dynamic Skills ──
❯ ◉ Claude Code (推薦) - Anthropic CLI with dynamic Skills
  ── Static Rule Files ──
  ◯ Cursor (.cursorrules)
  ◯ Windsurf (.windsurfrules)
  ◯ Cline (.clinerules)
  ◯ GitHub Copilot (.github/copilot-instructions.md)
  ◯ Google Antigravity (INSTRUCTIONS.md) - Gemini Agent
  ── AGENTS.md Tools ──
  ◯ OpenAI Codex (AGENTS.md) - OpenAI Codex CLI
  ◯ OpenCode (AGENTS.md) - Open-source AI coding agent
  ── Gemini Tools ──
  ◯ Gemini CLI (GEMINI.md) - Google Gemini CLI
  ──────────────
  ◯ None / Skip
```

### 說明

選擇你在專案中使用的 AI 編碼助手。CLI 會根據選擇生成對應的整合檔案。

### 支援的工具

| 工具 | 生成檔案 | 格式 | 說明 |
|------|----------|------|------|
| **Claude Code** | `CLAUDE.md` | Markdown | Anthropic CLI，支援動態 Skills |
| **Cursor** | `.cursorrules` | Plaintext | Cursor IDE 規則檔 |
| **Windsurf** | `.windsurfrules` | Plaintext | Windsurf IDE 規則檔 |
| **Cline** | `.clinerules` | Plaintext | Cline 擴展規則檔 |
| **GitHub Copilot** | `.github/copilot-instructions.md` | Markdown | Copilot 自訂指示 |
| **Google Antigravity** | `INSTRUCTIONS.md` | Markdown | Gemini Agent 系統指令 |
| **OpenAI Codex** | `AGENTS.md` | Markdown | OpenAI Codex CLI |
| **OpenCode** | `AGENTS.md` | Markdown | 開源 AI 編碼 Agent（與 Codex 共用檔案） |
| **Gemini CLI** | `GEMINI.md` | Markdown | Google Gemini CLI |

### 分類

```
── Dynamic Skills ──
  Claude Code (推薦) - 支援動態 Skills 載入

── Static Rule Files ──
  Cursor, Windsurf, Cline, GitHub Copilot, Google Antigravity

── AGENTS.md Tools ──
  OpenAI Codex, OpenCode (共用 AGENTS.md)

── Gemini Tools ──
  Gemini CLI
```

### 使用情境

| 情境 | 建議選擇 |
|------|----------|
| 主要使用 Claude Code | 只選 Claude Code，可使用 minimal scope |
| 團隊成員使用不同工具 | 選擇所有團隊使用的工具 |
| 想要最完整的規則覆蓋 | 選擇 Claude Code + 其他工具 |

### 注意事項

- **Codex + OpenCode**：兩者共用 `AGENTS.md`，只會生成一份檔案
- **只選 Claude Code**：會觸發 Skills 安裝位置提示
- **選擇多個工具**：會統一使用相同的整合配置

---

## 2. Skills 安裝位置

### 互動式提示（多 Agent 選擇）

```
? Select AI agents to install Skills for:
  ── Claude Code ──
❯ ◉ Claude Code (Plugin Marketplace) - Auto-managed (Recommended)
  ◯ Claude Code (User Level) - ~/.claude/skills/
  ◯ Claude Code (Project Level) - .claude/skills/
  ── OpenCode ──
  ◯ OpenCode (User Level) - ~/.config/opencode/skill/
  ◯ OpenCode (Project Level) - .opencode/skill/
  ── Cline ──
  ◯ Cline (User Level) - ~/.cline/skills/
  ◯ Cline (Project Level) - .cline/skills/
  ── 其他 Agents ──
  ◯ Roo Code, Codex, Copilot, Windsurf, Gemini CLI...
  ──────────────
  ◯ Skip Skills Installation
```

### 說明

選擇要安裝 Skills 的 AI agents。**v3.5.0 支援同時安裝 Skills 到多個 agents**。每個 agent 有自己的 skills 目錄路徑。

### 選項

| Agent | User Level 路徑 | Project Level 路徑 | 備註 |
|-------|-----------------|-------------------|------|
| **Claude Code** | `~/.claude/skills/` | `.claude/skills/` | 也支援 Plugin Marketplace |
| **OpenCode** | `~/.config/opencode/skill/` | `.opencode/skill/` | 完整 SKILL.md 支援 |
| **Cline** | `~/.cline/skills/` | `.cline/skills/` | 使用 Claude skills 路徑 |
| **Roo Code** | `~/.roo/skills/` | `.roo/skills/` | 模式特定: `.roo/skills-{mode}/` |
| **OpenAI Codex** | `~/.codex/skills/` | `.codex/skills/` | 完整 SKILL.md 支援 |
| **GitHub Copilot** | `~/.copilot/skills/` | `.github/skills/` | 完整 SKILL.md 支援 |
| **Windsurf** | `~/.codeium/windsurf/skills/` | `.windsurf/skills/` | 2026/01 起支援 Skills |
| **Gemini CLI** | `~/.gemini/skills/` | `.gemini/skills/` | 預覽支援 |

> **注意**: Cursor 尚不支援 SKILL.md 格式（使用 `.mdc` rules 格式）。

### 詳細說明

#### Plugin Marketplace (推薦)

```bash
# 如果尚未安裝，執行：
/plugin marketplace add AsiaOstrich/universal-dev-standards
/plugin install universal-dev-standards@asia-ostrich
```

**優點**：
- 自動更新到最新版本
- 無需手動管理
- 所有 15 個 Skills 一次安裝

**缺點**：
- 無法鎖定特定版本
- 需要網路連線

#### User Level

```
~/.claude/skills/
├── universal-dev-standards/
│   ├── ai-collaboration-standards/
│   ├── commit-standards/
│   └── ...
```

**優點**：
- 所有專案共用
- 可離線使用
- 可手動控制版本

**缺點**：
- 需要手動更新
- 不會隨專案版本控制

#### Project Level

```
your-project/
├── .claude/
│   └── skills/
│       └── universal-dev-standards/
│           ├── ai-collaboration-standards/
│           └── ...
```

**優點**：
- 可加入 Git 版本控制
- 團隊成員共享相同版本
- 專案獨立，不影響其他專案

**缺點**：
- 增加專案大小
- 需要手動更新
- 建議加入 `.gitignore`（視需求）

### 決策流程

```
是否使用 Claude Code？
    │
    ├─ 否 → 選擇 None
    │
    └─ 是 → 是否需要自動更新？
              │
              ├─ 是 → Plugin Marketplace
              │
              └─ 否 → 是否需要團隊共享？
                        │
                        ├─ 是 → Project Level
                        │
                        └─ 否 → User Level
```

---

## 3. Standards Scope（標準範圍）

### 互動式提示

```
? How should standards be installed?
❯ Lean (推薦) - Reference docs only, Skills handle the rest
  Complete - All standards as local files
```

### 說明

決定複製到 `.standards/` 目錄的標準範圍。**僅當 Skills 已安裝時才會顯示此選項**。

### 選項

| 範圍 | 複製內容 | 適用情境 |
|------|----------|----------|
| **Minimal** (推薦) | 只有 Reference 類別標準 | 已安裝 Skills，避免重複 |
| **Full** | Reference + Skill 類別標準 | 未安裝 Skills，或需要完整文件 |

### 詳細說明

#### Minimal 範圍

只複製 **Reference** 類別的標準（沒有對應 Skill 的標準）：

```
.standards/
├── checkin-standards.md          # Reference
├── spec-driven-development.md    # Reference
├── project-structure.md          # Reference (Level 3)
└── documentation-writing-standards.md  # Reference (Level 3)
```

**適用情境**：
- ✅ 已安裝 Skills（Marketplace / User / Project）
- ✅ 想要避免 Skill 與文件重複
- ✅ 想要較小的 `.standards/` 目錄

#### Full 範圍

複製 **Reference + Skill** 類別的標準：

```
.standards/
├── anti-hallucination.md         # Skill 類別
├── commit-message-guide.md       # Skill 類別
├── code-review-checklist.md      # Skill 類別
├── git-workflow.md               # Skill 類別
├── testing-standards.md          # Skill 類別
├── checkin-standards.md          # Reference 類別
├── spec-driven-development.md    # Reference 類別
└── ...
```

**適用情境**：
- ✅ 未安裝 Skills
- ✅ 需要完整的本地文件參考
- ✅ 團隊成員不使用 Claude Code

### 重要提醒

> **原則**：對於有 Skill 的標準，使用 Skill **或**複製文件 — **不要同時使用兩者**。

---

## 4. Adoption Level（採用等級）

### 互動式提示

```
? Select adoption level:
  Level 1: Starter (基本) - 6 core standards
❯ Level 2: Professional (推薦) - 12 standards
  Level 3: Complete (完整) - All 16 standards
```

### 說明

決定採用的標準數量和深度。等級越高，包含的標準越完整。

### 選項

| 等級 | 名稱 | 標準數量 | 設定時間 | 適用情境 |
|------|------|----------|----------|----------|
| **Level 1** | Starter (基本) | 6 個核心標準 | ~30 分鐘 | 個人專案、快速啟動 |
| **Level 2** | Professional (推薦) | 12 標準 | ~2 小時 | 團隊專案、專業開發 |
| **Level 3** | Complete (完整) | 全部 16 標準 | 1-2 天 | 企業專案、法規遵循 |

### Level 1: Starter (基本)

**包含標準**：
- `anti-hallucination.md` - AI 協作防幻覺
- `checkin-standards.md` - 程式碼簽入檢查
- `commit-message-guide.md` - 提交訊息格式
- `spec-driven-development.md` - 規格驅動開發

**適用情境**：
- 個人 side project
- 快速原型開發
- 剛開始導入標準的團隊

**Standard Options**：
- ✅ Commit Language

### Level 2: Professional (推薦)

**包含 Level 1 + 額外標準**：
- `code-review-checklist.md` - 程式碼審查
- `git-workflow.md` - Git 工作流程
- `versioning.md` - 語意化版本
- `changelog-standards.md` - 變更日誌
- `testing-standards.md` - 測試標準
- 適用的語言/框架擴展

**適用情境**：
- 多人協作的團隊專案
- 需要 Code Review 流程
- 有 CI/CD 的專案

**Standard Options**：
- ✅ Git Workflow
- ✅ Merge Strategy
- ✅ Commit Language
- ✅ Test Levels

### Level 3: Complete (完整)

**包含 Level 2 + 額外標準**：
- `documentation-structure.md` - 文件結構
- `documentation-writing-standards.md` - 文件撰寫
- `project-structure.md` - 專案結構
- 完整模板套件

**適用情境**：
- 企業級專案
- 法規遵循要求（金融、醫療等）
- 需要完整文件的專案

---

## 5. Format（標準格式）

### 互動式提示

```
? Select standards format:
❯ Compact (推薦) - YAML format, optimized for AI reading
  Detailed - Full Markdown, best for human reading
  Both (進階) - Include both formats
```

### 說明

決定複製的標準檔案格式。

### 選項

| 格式 | 檔案類型 | Token 使用量 | 適用情境 |
|------|----------|--------------|----------|
| **Compact** (推薦) | `.ai.yaml` | ~80% 減少 | AI 助手使用、自動化 |
| **Detailed** | `.md` | 標準 | 人工閱讀、團隊訓練 |
| **Both** | 兩種都有 | 較高 | 需要兩種用途 |

### 詳細說明

#### Compact (推薦)

```yaml
# commit-message.ai.yaml
format: "<type>(<scope>): <subject>"
types:
  feat: New feature
  fix: Bug fix
  docs: Documentation
rules:
  - subject_max_length: 72
  - use_imperative_mood: true
```

**特點**：
- Token 效率高（約減少 80%）
- 結構化 YAML 格式
- 適合 AI 解析

#### Detailed

```markdown
# Commit Message Guide

## Format
<type>(<scope>): <subject>

## Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation

## Rules
- Subject line maximum 72 characters
- Use imperative mood: "add" not "added"
```

**特點**：
- 易於人工閱讀
- 詳細說明和範例
- 適合團隊訓練

#### Both

同時複製兩種格式，適合需要：
- AI 自動化處理
- 人工參考閱讀

---

## 6. Standard Options（標準選項）

### 說明

針對特定標準的配置選項。選項會根據 Adoption Level 顯示。

### 6.1 Git Workflow（Level 2+）

#### 互動式提示

```
? Select Git branching strategy:
❯ GitHub Flow (推薦) - Simple, continuous deployment
  GitFlow - Structured releases with develop/release branches
  Trunk-Based - Direct commits to main, feature flags
```

決定團隊的 Git 分支策略。

| 策略 | 說明 | 適用情境 |
|------|------|----------|
| **GitHub Flow** (推薦) | 簡單，持續部署 | 小團隊、Web 應用、持續部署 |
| **GitFlow** | 結構化，有 develop/release 分支 | 大團隊、定期發布、多版本維護 |
| **Trunk-Based** | 直接提交 main，feature flags | 高度自動化、成熟 CI/CD |

#### GitHub Flow

```
main ──────────────────────────────>
       \         /
        feature ─
```

- 只有 `main` 分支
- Feature branch → PR → Merge
- 適合持續部署

#### GitFlow

```
main    ─────────────────────────────>
              \         /
develop ───────────────────────────>
           \   /     \   /
         feature   release
```

- `main` + `develop` 分支
- Feature → develop → release → main
- 適合計劃性發布

#### Trunk-Based

```
main ─────────────────────────────>
       │   │   │
       ↑   ↑   ↑
     直接提交或極短 PR
```

- 所有人直接提交 main
- 使用 feature flags
- 需要高度自動化測試

### 6.2 Merge Strategy（Level 2+）

#### 互動式提示

```
? Select merge strategy:
❯ Squash Merge (推薦) - Clean history, one commit per PR
  Merge Commit - Preserve full branch history
  Rebase + Fast-Forward - Linear history, advanced
```

決定 PR 合併方式。

| 策略 | 說明 | 適用情境 |
|------|------|----------|
| **Squash Merge** (推薦) | 壓縮為單一 commit | 乾淨歷史、大多數專案 |
| **Merge Commit** | 保留完整分支歷史 | 需要追蹤詳細歷史 |
| **Rebase + Fast-Forward** | 線性歷史，進階 | 追求完美線性歷史 |

### 6.3 Commit Language（Level 1+）

#### 互動式提示

```
? Select commit message language:
❯ English (推薦) - Standard international format
  Traditional Chinese (繁體中文) - For Chinese-speaking teams
  Bilingual (雙語) - Both English and Chinese
```

決定提交訊息的語言。

| 語言 | 範例 | 適用情境 |
|------|------|----------|
| **English** (推薦) | `feat(auth): add OAuth2 support` | 國際團隊、開源專案 |
| **Traditional Chinese** | `新增(認證): 實作 OAuth2 支援` | 繁體中文團隊 |
| **Bilingual** | `feat(auth): add OAuth2 / 新增 OAuth2` | 雙語環境 |

### 6.4 Test Levels（Level 2+）

#### 互動式提示

```
? Select test levels to include:
❯ ◉ Unit Testing (70% pyramid base)
  ◉ Integration Testing (20%)
  ◯ System Testing (7%)
  ◯ E2E Testing (3% pyramid top)
```

選擇要包含的測試層級。

| 層級 | 覆蓋率建議 | 說明 |
|------|------------|------|
| **Unit Testing** | 70% | 單元測試（預設選中）|
| **Integration Testing** | 20% | 整合測試（預設選中）|
| **System Testing** | 7% | 系統測試 |
| **E2E Testing** | 3% | 端對端測試 |

---

## 7. Extensions（擴展）

### 說明

根據專案的語言、框架、地區設定，複製對應的擴展標準。

### 7.1 Language Extensions（語言擴展）

#### 互動式提示

```
? Detected language(s). Select style guides to include:
❯ ◉ C# Style Guide
  ◉ PHP Style Guide (PSR-12)
```

> 注意：此提示僅在專案中偵測到相關語言時才會顯示。

| 擴展 | 檔案 | 偵測方式 |
|------|------|----------|
| **C#** | `csharp-style.md` | `.cs` 檔案、`.csproj` |
| **PHP** | `php-style.md` | `.php` 檔案、`composer.json` |

### 7.2 Framework Extensions（框架擴展）

#### 互動式提示

```
? Detected framework(s). Select patterns to include:
❯ ◉ Fat-Free Framework Patterns
```

> 注意：此提示僅在專案中偵測到相關框架時才會顯示。

| 擴展 | 檔案 | 偵測方式 |
|------|------|----------|
| **Fat-Free** | `fat-free-patterns.md` | Fat-Free Framework 相關檔案 |

### 7.3 Locale Extensions（地區擴展）

#### 互動式提示

```
? Use Traditional Chinese (繁體中文) locale? (y/N)
```

| 擴展 | 檔案 | 說明 |
|------|------|------|
| **zh-TW** | `zh-tw.md` | 繁體中文本地化指引 |

### 自動偵測

CLI 會自動偵測專案特徵並預選相關擴展：

```bash
uds init
# Detecting project characteristics...
# Languages: javascript, typescript
# Frameworks: react
# AI Tools: cursor
```

---

## 8. Integration Configuration（整合配置）

### 說明

針對非 Claude Code 工具（Cursor、Windsurf、Cline 等）的整合檔案配置。

### 配置項目

#### 規則類別

選擇要嵌入的規則類別：

| 類別 | 說明 |
|------|------|
| `anti-hallucination` | 反幻覺協議 |
| `commit-standards` | 提交訊息標準 |
| `code-review` | 程式碼審查清單 |
| `testing` | 測試標準 |
| `git-workflow` | Git 工作流程 |
| `documentation` | 文件標準 |
| `error-handling` | 錯誤處理 |
| `project-structure` | 專案結構 |
| `spec-driven-development` | 規格驅動開發 |

#### Detail Level（詳細程度）

| 程度 | 說明 | 檔案大小 |
|------|------|----------|
| **Minimal** | 最精簡的規則 | 最小 |
| **Standard** (預設) | 標準詳細度 | 中等 |
| **Comprehensive** | 完整詳細說明 | 較大 |

#### 現有檔案處理

如果整合檔案已存在：

| 策略 | 說明 |
|------|------|
| **Overwrite** | 完全覆寫 |
| **Merge** | 合併（避免重複區段）|
| **Append** | 附加到現有內容 |
| **Keep** | 保留現有檔案 |

### 共享配置

當選擇多個 AI 工具時，所有工具會共享相同的配置：

```
選擇: Cursor + Windsurf + Cline
     ↓
共享配置提示（一次設定）
     ↓
生成三個檔案，使用相同規則
```

---

## 9. Content Mode（內容模式）

### 互動式提示

```
? Select content level:
❯ Standard (推薦) - Summary + links to full docs
  Full Embed - All rules in one file (larger)
  Minimal - Core rules only (smallest)
```

### 說明

決定 AI 工具整合檔案中嵌入多少標準內容。這是影響 AI 合規程度的關鍵設定。

### 選項

| 模式 | 檔案大小 | AI 可見性 | 適用情境 |
|------|----------|-----------|----------|
| **Standard** (推薦) | 中等 | 高 | 大多數專案 |
| **Full Embed** | 最大 | 最高 | 企業級合規 |
| **Minimal** | 最小 | 低 | 舊專案遷移 |

### 詳細說明

#### Minimal 模式

**生成內容**：簡單的標準參考列表

```markdown
## 規範文件參考

**重要**：執行相關任務時，務必讀取並遵循 `.standards/` 目錄下的對應規範：

**核心規範：**
- `.standards/anti-hallucination.md`
- `.standards/commit-message.ai.yaml`
- `.standards/checkin-standards.md`

**選項：**
- `.standards/options/github-flow.ai.yaml`
```

**特點**：
- 只列出檔案路徑
- AI 需要主動讀取 `.standards/`
- 最小檔案大小

**適用情境**：
- ✅ 舊專案遷移，不想大幅改動
- ✅ 小型專案 / 原型
- ✅ 檔案大小敏感
- ⚠️ 風險：AI 可能不會主動讀取

#### Standard 模式 (推薦)

**生成內容**：合規指示 + 標準索引

```markdown
## Standards Compliance Instructions

**MUST follow** (每次都要遵守):
| Task | Standard | When |
|------|----------|------|
| AI collaboration | anti-hallucination.md | Always |
| Writing commits | commit-message.ai.yaml | Every commit |
| Committing code | checkin-standards.md | Every commit |

**SHOULD follow** (相關任務時參考):
| Task | Standard | When |
|------|----------|------|
| Adding logging | logging-standards.md | When writing logs |
| Writing tests | testing.ai.yaml | When creating tests |

## Installed Standards Index

本專案採用 **Level 2** 標準。所有規範位於 `.standards/`：

### Core (6 standards)
- `anti-hallucination.md` - AI 協作防幻覺規範
- `commit-message.ai.yaml` - 提交訊息格式
...
```

**特點**：
- **MUST / SHOULD** 優先級分類
- 任務對應表（Task → Standard → When）
- 告訴 AI **何時**該讀取哪個標準
- 平衡檔案大小與可見性

**適用情境**：
- ✅ 大多數專案
- ✅ 希望 AI 遵守規範但不想檔案太大
- ✅ AI 工具會讀取專案檔案

#### Full Embed 模式

**生成內容**：完整嵌入所有規則

```markdown
## Anti-Hallucination Protocol
Reference: .standards/anti-hallucination.md

### Core Principle
You are an AI assistant that prioritizes accuracy over confidence...

### Evidence-Based Analysis
1. **File Reading Requirement**
   - You MUST read files before analyzing them
   - Do not guess APIs, class names, or library versions
...

---

## Commit Message Standards
Reference: .standards/commit-message-guide.md

### Format Structure
<type>(<scope>): <subject>

### Commit Types
| Type | Description | Example |
| feat | New feature | feat(auth): add OAuth2 login |
...
```

**特點**：
- 所有核心規則直接嵌入
- AI **保證**看到所有標準
- 檔案大小可能是 Index 的 3-5 倍

**適用情境**：
- ✅ 企業級合規要求
- ✅ AI 可能不讀取外部檔案
- ✅ 不能容許 AI 遺漏任何規則
- ✅ 新團隊導入，確保完全了解規範

### 決策流程

```
開始選擇內容模式
        │
        ▼
  ┌─────────────────────────────┐
  │ AI 是否會主動讀取專案檔案？  │
  └─────────────────────────────┘
        │
    ┌───┴───┐
    │       │
   是       否
    │       │
    ▼       ▼
Index    Full
    │
    ▼
  ┌─────────────────────────────┐
  │ 是否有嚴格合規要求？         │
  └─────────────────────────────┘
        │
    ┌───┴───┐
    │       │
   是       否
    │       │
    ▼       ▼
 Full    Index


舊專案遷移 / 想要最小改動？ → Minimal
```

### 使用案例

| 案例 | 推薦模式 | 理由 |
|------|----------|------|
| 新創團隊的 SaaS 專案 | **Index** | 平衡效率與規範 |
| 銀行核心系統 | **Full** | 法規要求，不能遺漏 |
| 個人 side project | **Minimal** | 輕量就好 |
| 開源專案 | **Index** | 讓貢獻者 AI 知道規範 |
| 從舊設定遷移 | **Minimal** | 保留現有設定 |
| 新導入 AI 的傳統企業 | **Full** | 確保 AI 完全遵循 |

---

## 10. Methodology（開發方法論）

### 互動式提示

```
? Which development methodology do you want to use?
❯ TDD - Test-Driven Development (Red → Green → Refactor)
  BDD - Behavior-Driven Development (Given-When-Then)
  SDD - Spec-Driven Development (Spec First, Code Second)
  ATDD - Acceptance Test-Driven Development
  ──────────────
  None - No specific methodology
```

> **⚠️ 實驗性功能**：此功能需要使用 `-E` 或 `--experimental` 旗標才能啟用。將在 v4.0 重新設計。

### 說明

選擇開發方法論來指導專案的工作流程。此選項僅在使用 `--experimental` 旗標時才會出現。

### 選項

| 方法論 | 全名 | 說明 |
|--------|------|------|
| **TDD** | Test-Driven Development | Red → Green → Refactor 循環 |
| **BDD** | Behavior-Driven Development | Given-When-Then 情境 |
| **SDD** | Spec-Driven Development | Spec First, Code Second |
| **ATDD** | Acceptance Test-Driven Development | 以驗收標準為焦點 |
| **None** | - | 不使用特定方法論 |

### 啟用實驗性功能

```bash
# 啟用實驗性功能
uds init -E

# 或使用完整形式
uds init --experimental
```

---

## 11. CLI 參數對照表

### 互動模式 vs 非互動模式

| 選項 | 互動式提示 | CLI 參數 | 預設值 |
|------|------------|----------|--------|
| AI Tools | `promptAITools()` | - (偵測) | 自動偵測 |
| Skills Location | `promptSkillsInstallLocation()` | `--skills-location` | `marketplace` |
| Standards Scope | `promptStandardsScope()` | - | 依 Skills 決定 |
| Level | `promptLevel()` | `-l, --level` | `2` |
| Format | `promptFormat()` | `-f, --format` | `ai` |
| Git Workflow | `promptGitWorkflow()` | `--workflow` | `github-flow` |
| Merge Strategy | `promptMergeStrategy()` | `--merge-strategy` | `squash` |
| Commit Language | `promptCommitLanguage()` | `--commit-lang` | `english` |
| Test Levels | `promptTestLevels()` | `--test-levels` | `unit,integration` |
| Language | `promptLanguage()` | `--lang` | 自動偵測 |
| Framework | `promptFramework()` | `--framework` | 自動偵測 |
| Locale | `promptLocale()` | `--locale` | - |
| Content Mode | `promptContentMode()` | `--content-mode` | `index` |
| Methodology | `promptMethodology()` | - | `null` (需 `-E`) |

### 控制旗標

| 旗標 | CLI 參數 | 說明 |
|------|----------|------|
| 非互動模式 | `-y, --yes` | 跳過互動提示，使用預設值 |
| 實驗性功能 | `-E, --experimental` | 啟用實驗性功能（開發方法論選擇） |
| 模式（已棄用） | `-m, --mode` | 安裝模式（skills, full）- 請改用 `--skills-location` |

### 完整 CLI 範例

```bash
# 完全互動式
uds init

# 非互動式，使用預設值
uds init -y

# 指定所有選項
uds init -y \
  --level 2 \
  --format ai \
  --skills-location marketplace \
  --workflow github-flow \
  --merge-strategy squash \
  --commit-lang english \
  --test-levels unit,integration \
  --content-mode index

# Level 1 快速設定
uds init -y --level 1

# 企業級完整設定
uds init -y --level 3 --content-mode full

# 繁體中文團隊
uds init -y --level 2 --commit-lang traditional-chinese --locale zh-tw

# PHP 專案
uds init -y --level 2 --lang php --framework fat-free
```

---

## 相關文件

- [CLI README](../../../cli/README.md) - CLI 基本使用
- [ADOPTION-GUIDE.md](../adoption/ADOPTION-GUIDE.md) - 採用指南
- [CLAUDE.md](../../../CLAUDE.md) - 專案開發指引
- [CHANGELOG.md](../../../CHANGELOG.md) - 版本歷史

---

**由 Universal Dev Standards 團隊維護**
