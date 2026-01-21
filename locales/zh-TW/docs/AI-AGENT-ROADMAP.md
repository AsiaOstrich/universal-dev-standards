---
source: ../../../docs/AI-AGENT-ROADMAP.md
source_version: 2.3.0
translation_version: 2.3.0
last_synced: 2026-01-21
status: current
---

# AI Agent 整合指南

> **語言**: [English](../../../docs/AI-AGENT-ROADMAP.md) | 繁體中文 | [简体中文](../../zh-CN/docs/AI-AGENT-ROADMAP.md)

**版本**: 2.3.0
**最後更新**: 2026-01-21

本文件提供 Universal Development Standards (UDS) 對 AI Agent 支援的完整參考。

---

## 目錄

1. [快速參考](#1-快速參考)
2. [整合深度](#2-整合深度)
3. [Skills 系統](#3-skills-系統)
4. [配置參考](#4-配置參考)
5. [資源](#5-資源)
6. [附錄：未來發展](#附錄未來發展)

---

## 1. 快速參考

### 配置檔

| AI Agent | 專案配置 | 全域配置 | 備註 |
|----------|----------|----------|------|
| Claude Code | `.claude/CLAUDE.md` | `~/.claude/CLAUDE.md` | ~100KB 限制 |
| OpenCode | `.opencode/AGENTS.md` | `~/.config/opencode/AGENTS.md` | 無限制 |
| GitHub Copilot | `.github/copilot-instructions.md` | 個人設定 | ~8KB 限制 |
| Cline | `.clinerules/` | `~/.cline-rules/` | 資料夾或單一檔案 |
| Roo Code | `.roo/rules/*.md` | `~/.roo/rules/` | 模式特定：`.roo/rules-{mode}/` |
| OpenAI Codex | `.codex/AGENTS.md` | `~/.codex/AGENTS.md` | 32KB 限制 |
| Windsurf | `.windsurfrules` | 設定 UI | 6K/檔，總計 12K |
| Gemini CLI | `.gemini/GEMINI.md` | `~/.gemini/GEMINI.md` | 支援 `@import` |
| Cursor | `.cursor/rules/*.mdc` | `~/.cursor/rules/` | 需要 YAML frontmatter |
| Antigravity | `.antigravity/` | `~/.antigravity/` | 最低支援，手動模式 |

### Skills 路徑

| AI Agent | Skills | 專案路徑 | 全域路徑 | 備註 |
|----------|:------:|----------|----------|------|
| Claude Code | ✅ 原生 | `.claude/skills/` | `~/.claude/skills/` | 參考實作 |
| OpenCode | ✅ 完整 | `.opencode/skill/` | `~/.config/opencode/skill/` | 也讀取 `.claude/skills/` |
| GitHub Copilot | ✅ 完整 | `.github/skills/` | `~/.copilot/skills/` | 舊版：`.claude/skills/` |
| Cline | ✅ 完整 | `.claude/skills/` | `~/.claude/skills/` | 直接使用 Claude 路徑 |
| Roo Code | ✅ 完整 | `.roo/skills/` | `~/.roo/skills/` | 模式特定：`.roo/skills-{mode}/` |
| OpenAI Codex | ✅ 完整 | `.codex/skills/` | `~/.codex/skills/` | 也讀取 `.claude/skills/` |
| Windsurf | ✅ 完整 | `.windsurf/rules/` | 設定 UI | 2026/01 起支援 Skills |
| Gemini CLI | ✅ 預覽 | `.gemini/skills/` | `~/.gemini/skills/` | v0.23+ 預覽版 |
| Cursor | ❌ 否 | `.cursor/rules/` | `~/.cursor/rules/` | 僅 Rules，不支援 SKILL.md |
| Antigravity | ❌ 否 | `.antigravity/skills/` | `~/.antigravity/skills/` | 不支援 SKILL.md |

### 斜線命令

| AI Agent | 支援 | 類型 | 範例 | 自訂路徑 |
|----------|:----:|------|------|----------|
| Claude Code | ✅ | Skill 觸發 | `/commit`, `/review`, `/tdd` | 僅內建 |
| OpenCode | ✅ | 使用者定義 | 可配置 | `.opencode/command/*.md` |
| GitHub Copilot | ✅ | 內建 | `/fix`, `/tests`, `/explain` | `.github/prompts/*.prompt.md` |
| Cline | ✅ | 內建 + Workflows | `/smol`, `/plan`, `/newtask` | Workflow 檔案 |
| Roo Code | ✅ | 模式命令 | `/code`, `/architect`, `/init` | `.roo/commands/*.md` |
| OpenAI Codex | ✅ | 系統命令 | `/model`, `/diff`, `/skills` | 自訂 prompts |
| Windsurf | ✅ | Rulebook | 自動產生 | 從 `.windsurfrules` |
| Gemini CLI | ✅ | 系統 + 自訂 | `/clear`, `/memory`, `/mcp` | `.gemini/commands/*.toml` |
| Cursor | ✅ | 內建 + 自訂 | `/summarize`, `/models` | `.cursor/commands/*.md` |
| Antigravity | ❌ | N/A | N/A | N/A |

### 平台支援

| 平台 | CLI 工具 | Skills |
|------|:--------:|:------:|
| macOS | 已測試 | 已測試 |
| Linux | 預期可用 | 預期可用 |
| Windows | 提供 PowerShell | 預期可用 |

---

## 2. 整合深度

> **說明**: 截至 2026 年 1 月，Agent Skills (SKILL.md) 已成為業界標準。大多數主流 AI 程式碼工具現在都支援相同的 Skills 格式。

### 原生 Skills（參考實作）

**工具**: Claude Code

- Agent Skills 標準的參考實作
- 18 個內建 UDS Skills + Marketplace
- 完整斜線命令支援（`/commit`、`/review`、`/tdd` 等）
- 關鍵字自動觸發

### 完整 Skills 支援

**工具**: OpenCode, GitHub Copilot, Cline, Roo Code, OpenAI Codex, Windsurf, Gemini CLI

- 可讀取並執行 SKILL.md 檔案
- 跨平台相容 `.claude/skills/` 目錄
- 大多數工具也有自己的原生路徑（見 Skills 路徑欄）

### 僅 Rules（無 Skills）

**工具**: Cursor

- 有自己的規則格式（`.cursor/rules/*.mdc`）
- 尚未支援 SKILL.md 格式
- 社群已提出功能請求

### 最低支援

**工具**: Antigravity

- 不支援 SKILL.md
- 不支援 AGENT.md
- 僅手動執行模式
- 為完整性而收錄

---

## 3. Skills 系統

### 3.1 UDS Skills 相容性

| # | Skill | 斜線命令 | Claude | OpenCode | Cursor | Copilot |
|---|-------|----------|:------:|:--------:|:------:|:-------:|
| 1 | ai-collaboration-standards | - | 完整 | 完整 | 完整 | 完整 |
| 2 | checkin-assistant | `/check` | 完整 | 完整 | 部分 | 部分 |
| 3 | commit-standards | `/commit` | 完整 | 完整 | 部分 | 部分 |
| 4 | code-review-assistant | `/review` | 完整 | 完整 | 部分 | 部分 |
| 5 | testing-guide | - | 完整 | 完整 | 完整 | 完整 |
| 6 | tdd-assistant | `/tdd` | 完整 | 完整 | 部分 | 部分 |
| 7 | release-standards | `/release` | 完整 | 完整 | 部分 | 無 |
| 8 | git-workflow-guide | - | 完整 | 完整 | 完整 | 完整 |
| 9 | documentation-guide | `/docs` | 完整 | 完整 | 部分 | 無 |
| 10 | requirement-assistant | `/requirement` | 完整 | 完整 | 部分 | 部分 |
| 11 | changelog-guide | `/changelog` | 完整 | 完整 | 部分 | 無 |
| 12 | spec-driven-dev | `/spec` | 完整 | 完整 | 部分 | 部分 |
| 13 | test-coverage-assistant | `/coverage` | 完整 | 完整 | 部分 | 部分 |
| 14 | refactoring-assistant | - | 完整 | 完整 | 完整 | 完整 |
| 15 | error-code-guide | - | 完整 | 完整 | 完整 | 完整 |
| 16 | methodology-system | `/methodology` | 完整 | 完整 | 部分 | 無 |
| 17 | project-structure-guide | `/config` | 完整 | 完整 | 部分 | 無 |
| 18 | logging-guide | - | 完整 | 完整 | 完整 | 完整 |

### 3.2 Skills 路徑與啟用

#### Skills 探索路徑

| AI Agent | 專案路徑 | 全域路徑 | 讀取 `.claude/skills/` |
|----------|----------|----------|:----------------------:|
| Claude Code | `.claude/skills/` | `~/.claude/skills/` | 原生 |
| OpenCode | `.opencode/skill/` | `~/.config/opencode/skill/` | ✅ 是 |
| GitHub Copilot | `.github/skills/` | `~/.copilot/skills/` | ✅ 是（舊版） |
| Cline | `.claude/skills/` | `~/.claude/skills/` | ✅ 是 |
| Roo Code | `.roo/skills/` | `~/.roo/skills/` | ✅ 是 |
| OpenAI Codex | `.codex/skills/` | `~/.codex/skills/` | ✅ 是 |
| Windsurf | `.windsurf/rules/` | 設定 UI | ✅ 是 |
| Gemini CLI | `.gemini/skills/` | `~/.gemini/skills/` | ✅ 是 |
| Cursor | `.cursor/rules/` | `~/.cursor/rules/` | ❌ 否 |
| Antigravity | `.antigravity/skills/` | `~/.antigravity/skills/` | ❌ 否 |

#### 啟用方式

| AI Agent | 啟用方式 |
|----------|----------|
| Claude Code | 斜線命令、自動觸發、提及 |
| OpenCode | 斜線命令、Tab 切換 |
| GitHub Copilot | 自動載入、`applyTo` 模式 |
| Cline | 自動從目錄載入 |
| Roo Code | 自動載入、模式特定（`.roo/skills-{mode}/`） |
| OpenAI Codex | `/skills` 命令、自動觸發 |
| Windsurf | 手動（@提及）、始終開啟、模型決定 |
| Gemini CLI | 自動觸發、透過設定啟用/停用 |
| Cursor | Glob 模式、`alwaysApply` 旗標（僅 rules） |
| Antigravity | 僅手動 |

**建議**：使用 `.claude/skills/` 作為預設安裝路徑 — 大多數工具都可讀取以獲得跨工具相容性。

### 3.3 跨平台可攜性

> **業界標準**: 截至 2025 年 12 月，SKILL.md 已被 OpenAI、GitHub、Google 及更廣泛的 AI 程式碼生態系統採用。

| 平台 | SKILL.md 支援 | 採用日期 |
|------|:-------------:|----------|
| Claude Code | ✅ 原生 | 2025/10 |
| OpenCode | ✅ 完整 | 2025/11 |
| GitHub Copilot | ✅ 完整 | 2025/12/18 |
| OpenAI Codex | ✅ 完整 | 2025/12 |
| Cline | ✅ 完整 | v3.48.0 |
| Roo Code | ✅ 完整 | 2025/12/27 |
| Windsurf | ✅ 完整 | 2026/01/09 |
| Gemini CLI | ✅ 預覽版 | 2026/01/07 |
| Cursor | ❌ 尚未 | 已請求 |
| Antigravity | ❌ 否 | N/A |

**跨平台安裝器**:
- [skilz](https://github.com/skilz-ai/skilz) - 通用 Skills 安裝器（14+ 平台）
- [openskills](https://github.com/numman-ali/openskills) - 通用 skills 載入器
- UDS CLI (`uds init`) - 為多個 AI 工具產生配置

---

## 4. 配置參考

### 4.1 配置檔

| AI Agent | 專案配置 | 全域配置 | 字元限制 |
|----------|----------|----------|----------|
| Claude Code | `CLAUDE.md` | `~/.claude/CLAUDE.md` | ~100KB |
| OpenCode | `AGENTS.md` | `~/.config/opencode/AGENTS.md` | 無限制 |
| Cursor | `.cursor/rules/*.mdc` | `~/.cursor/rules/` | 每檔不同 |
| Windsurf | `.windsurfrules` | 設定 UI | 6K/檔，總計 12K |
| Cline | `.clinerules` | `~/.cline-rules/` | 無限制 |
| Roo Code | `.roorules` | `~/.roo/rules/` | 無限制 |
| GitHub Copilot | `.github/copilot-instructions.md` | 個人設定 | ~8KB |
| OpenAI Codex | `AGENTS.md` | `~/.codex/AGENTS.md` | 32KB |
| Gemini CLI | `GEMINI.md` | `~/.gemini/GEMINI.md` | 1M tokens |
| Antigravity | N/A | `~/.antigravity/` | N/A |

### 4.2 配置合併行為

| AI Agent | 合併策略 | 優先順序（高到低） |
|----------|----------|-------------------|
| Claude Code | 串接 | 目錄範圍 > 專案 > 個人 |
| OpenCode | 串接 | 專案 > 全域 |
| Cursor | 取代/選擇性 | `.mdc` 按 glob，alwaysApply 旗標 |
| Windsurf | 達限制時截斷 | 全域 > 工作區 > 模式特定 |
| Cline | 附加 | 專案目錄 > 根檔案 |
| GitHub Copilot | 組合 | 個人 > 儲存庫 > 組織 |
| OpenAI Codex | 串接 | 覆寫檔 > 基礎，較近者優先 |
| Gemini CLI | 串接 | 所有檔案支援 `@import` |
| Antigravity | N/A | N/A |

### 4.3 Skills 檔案格式

> **標準格式**: 帶有 YAML frontmatter 的 SKILL.md 是大多數工具支援的通用格式。

| AI Agent | Skills 格式 | 配置格式 | Frontmatter |
|----------|:-----------:|----------|-------------|
| Claude Code | ✅ SKILL.md | `CLAUDE.md` | YAML (`---`) |
| OpenCode | ✅ SKILL.md | `AGENTS.md` | YAML |
| GitHub Copilot | ✅ SKILL.md | `copilot-instructions.md` | YAML |
| Cline | ✅ SKILL.md | `.clinerules/` | YAML |
| Roo Code | ✅ SKILL.md | `.roo/rules/` | YAML |
| OpenAI Codex | ✅ SKILL.md | `AGENTS.md` | YAML |
| Windsurf | ✅ SKILL.md | `.windsurfrules` | YAML |
| Gemini CLI | ✅ SKILL.md | `GEMINI.md` | YAML |
| Cursor | ❌ `.mdc` | `.cursor/rules/` | YAML (globs, alwaysApply) |
| Antigravity | ❌ N/A | N/A | N/A |

---

## 5. 資源

### 官方文件

| 工具 | 文件 |
|------|------|
| Claude Code | [docs.anthropic.com/claude-code](https://docs.anthropic.com/claude-code) |
| OpenCode | [opencode.ai/docs](https://opencode.ai/docs) |
| Cursor | [docs.cursor.com](https://docs.cursor.com) |
| GitHub Copilot | [docs.github.com/copilot](https://docs.github.com/copilot) |
| Windsurf | [docs.windsurf.com](https://docs.windsurf.com/) |
| OpenAI Codex | [developers.openai.com/codex](https://developers.openai.com/codex/guides/agents-md/) |
| Gemini CLI | [github.com/google-gemini/gemini-cli](https://github.com/google-gemini/gemini-cli) |

### Skills 市集

| 平台 | URL |
|------|-----|
| n-skills | [github.com/numman-ali/n-skills](https://github.com/numman-ali/n-skills) |
| claude-plugins.dev | [claude-plugins.dev/skills](https://claude-plugins.dev/skills) |
| agentskills.io | [agentskills.io](https://agentskills.io) |

### 貢獻指南

1. 研究工具的配置格式
2. 在 `integrations/<tool-name>/` 下建立整合目錄
3. 新增包含設定說明的 README.md
4. 更新本文件
5. 依照 [CONTRIBUTING.md](../../../CONTRIBUTING.md) 提交 PR

**問題回報**: [GitHub Issues](https://github.com/anthropics-tw/universal-dev-standards/issues)

---

## 附錄：未來發展

### 潛在新工具

| 工具 | 優先度 | 備註 |
|------|--------|------|
| Aider | 高 | Git 感知、自動提交、本地模型支援 |
| Continue.dev | 高 | 社群驅動、開源 |
| Amazon Q Developer | 中 | AWS 生態系統 |
| JetBrains AI Assistant | 中 | JetBrains 生態系統 |
| Sourcegraph Cody | 中 | 企業功能 |

### 功能增強路線圖

| 功能 | 描述 | 狀態 |
|------|------|------|
| SKILL.md 標準 | 通用 Skills 格式 | ✅ 已達成 (2025/12) |
| 跨工具相容性 | 大多數工具可讀取 `.claude/skills/` | ✅ 已達成 |
| Skills 市集 | 發布和發現 Skills | ✅ 多個平台 |
| 多 Agent 安裝 | 一次安裝 Skills 到多個 Agent | ✅ v3.5.0 |
| Gemini CLI TOML | 自動轉換指令為 TOML 格式 | ✅ v3.5.0 |
| Cursor Skills 支援 | 原生 SKILL.md 支援 | ⏳ 社群已請求 |
| CLI 自動偵測 | 偵測已安裝的 AI 工具 | 計劃中 |

---

## 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| 2.3.0 | 2026-01-21 | 新增 Antigravity 至所有表格以與 CLI 保持一致 |
| 2.2.0 | 2026-01-15 | 新增多 Agent 安裝、Gemini CLI TOML 轉換 |
| 2.1.0 | 2026-01-15 | 更新所有工具的 Skills 支援狀態（業界廣泛採用） |
| 2.0.0 | 2026-01-15 | 重大重構：整合內容、減少表格 |
| 1.1.0 | 2026-01-15 | 新增配置檔矩陣、Skills 系統配置 |
| 1.0.0 | 2026-01-14 | 初始發布 |
