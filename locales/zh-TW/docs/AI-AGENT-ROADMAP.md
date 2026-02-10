---
source: ../../../docs/AI-AGENT-ROADMAP.md
source_version: 2.5.0
translation_version: 2.5.0
last_synced: 2026-02-09
status: current
---

# AI Agent 整合指南

> **語言**: [English](../../../docs/AI-AGENT-ROADMAP.md) | 繁體中文 | [简体中文](../../zh-CN/docs/AI-AGENT-ROADMAP.md)

**版本**: 2.5.0
**最後更新**: 2026-02-09

本文件提供 Universal Development Standards (UDS) 對 AI Agent 支援的完整參考。

---

## 2026 年產業變動摘要

> **2026 年 2 月更新**：UDS 追蹤的所有 10 個 AI 程式碼工具現在都支援 SKILL.md。業界已達成 100% Skills 覆蓋率。
>
> *研究日期：2026-02-09。來源：各工具的官方文件與變更日誌。*

### 重要發展

| 變動 | 影響 | 日期 | 來源 |
|------|------|------|------|
| **Cursor SKILL.md 支援** | Cursor v2.4 透過 agentskills.io 標準原生支援 SKILL.md | 2026/01/22 | [cursor.com/changelog/2-4](https://cursor.com/changelog/2-4) |
| **SKILL.md 業界標準** | 所有主流 AI 程式碼工具都支援相同的 Skills 格式 | 2025/12 - 2026/01 | [agentskills.io](https://agentskills.io) |
| **Skills/Commands 合併** | Claude Code 在 v2.1.3+ 合併了 Skills 與 Commands | 2026/01/09 | [Claude Code Changelog](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md) |
| **Gemini CLI Skills 穩定版** | Skills 在 v0.27.0 從預覽升級為穩定版 | 2026/02/03 | [geminicli.com/docs/changelogs/latest](https://geminicli.com/docs/changelogs/latest/) |
| **Antigravity Skills** | Google Antigravity 支援 SKILL.md 與斜線命令 | 2025/11/18 | [antigravity.google/docs/skills](https://antigravity.google/docs/skills) |
| **Windsurf 被 Cognition 收購** | Windsurf (Devin) 現在有完整的 Skills + Workflows 支援 | 2025/07 | [TechCrunch](https://techcrunch.com/2025/07/14/cognition-maker-of-the-ai-coding-agent-devin-acquires-windsurf/) |
| **Codex 桌面應用程式** | OpenAI Codex 桌面應用程式發布，支援 Skills | 2026/02/02 | [openai.com/index/introducing-the-codex-app](https://openai.com/index/introducing-the-codex-app/) |
| **Vibe Coding 時代** | 自然語言 → 程式碼生成成為主流 | 2026 | - |

### 通用 Skills 覆蓋率

截至 2026 年 2 月，SKILL.md 已被**全部 10 個追蹤的 AI 工具**支援：
- ✅ Claude Code（原生，參考實作，2025/10）
- ✅ OpenCode（完整支援，v1.1.53）
- ✅ Cursor（完整支援，v2.4，2026/01）
- ✅ GitHub Copilot（完整支援，2025/12）
- ✅ Cline（完整支援，v3.48.0，2026/01）
- ✅ Roo Code（完整支援，v3.47.3）
- ✅ OpenAI Codex（完整支援，CLI v0.98.0）
- ✅ Windsurf（完整支援，2026/01）
- ✅ Gemini CLI（穩定版，v0.27.0，2026/02）
- ✅ Antigravity（完整支援，2025/11）

### 對 UDS 的影響

1. **跨平台可攜性**：Skills 只需撰寫一次即可在全部 10 個 AI 工具上使用（100% 覆蓋率）
2. **簡化維護**：不需要工具專用的轉換
3. **統一工作流程**：在所有工具中使用相同的 `/commit`、`/review`、`/tdd` 命令

---

## 目錄

1. [UDS CLI 實作狀態](#1-uds-cli-實作狀態)
2. [快速參考](#2-快速參考)
3. [整合深度](#3-整合深度)
4. [Skills 系統](#4-skills-系統)
5. [配置參考](#5-配置參考)
6. [資源](#6-資源)
7. [附錄：未來發展](#附錄未來發展)

---

## 1. UDS CLI 實作狀態

> **重要**: 本節描述的是 UDS CLI 對各工具的實作狀態，而非工具的原生能力。關於原生能力，請參閱[快速參考](#2-快速參考)。

### 狀態定義

| 狀態 | 定義 |
|------|------|
| `complete` | Skills + Commands 完整支援，已測試且生產就緒 |
| `partial` | Skills 可用，Commands 受限或不支援 |
| `preview` | 功能可用但為預覽版，可能有邊緣案例 |
| `planned` | CLI 中程式碼存在但未完整測試 |
| `minimal` | 僅生成規則檔，不支援 Skills/Commands |

### 實作矩陣

| AI 工具 | UDS 狀態 | Skills | Commands | 設定檔 | 備註 |
|---------|:--------:|:------:|:--------:|--------|------|
| **Claude Code** | ✅ complete | ✅ | 內建 | `CLAUDE.md` | Marketplace + User + Project 三層級 |
| **OpenCode** | ✅ complete | ✅ | ✅ | `AGENTS.md` | 完整實作，可讀取 Claude 規則 |
| Cline | 🔶 partial | ✅ | - | `.clinerules` | Skills 透過 fallback，Commands 使用 Workflow |
| GitHub Copilot | 🔶 partial | ✅ | ✅ | `copilot-instructions.md` | 補充 Copilot Chat |
| OpenAI Codex | 🔶 partial | ✅ | - | `AGENTS.md`（共用） | Skills 可用 |
| Gemini CLI | 🧪 preview | ✅ | ✅ (TOML) | `GEMINI.md` | Commands 自動轉換為 TOML |
| Roo Code | ⏳ planned | ✅ | ✅ | - | 實作存在，待測試 |
| Cursor | ✅ complete | ✅ | ✅ | `.cursorrules` | Skills 支援自 v2.4（2026/01/22） |
| Windsurf | 🔶 partial | ✅ | ✅ | `.windsurfrules` | Skills + Workflows（2026/01） |
| Antigravity | 📄 minimal | - | - | `INSTRUCTIONS.md` | UDS CLI 尚未更新（工具原生支援 Skills） |

### 兩種「支援」的區別

| 概念 | 定義 | 記錄位置 |
|------|------|----------|
| **工具原生能力** | AI 工具本身支援什麼功能 | [快速參考](#2-快速參考) |
| **UDS CLI 實作** | UDS CLI 對該工具的實作程度 | 本節 |

範例：Cursor 自 v2.4（2026/01/22）起原生支援 SKILL.md，UDS CLI 提供完整的 Skills、Commands 與 `.cursorrules` 生成整合。

---

## 2. 快速參考

### 2.1 配置檔

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
| Cursor | `.cursor/skills/` | `~/.cursor/skills/` | SKILL.md + Rules 支援 |
| Antigravity | `INSTRUCTIONS.md` | `~/.antigravity/` | Skills + 斜線命令 |

### 2.2 Skills 路徑

| AI Agent | Skills | 專案路徑 | 全域路徑 | 備註 |
|----------|:------:|----------|----------|------|
| Claude Code | ✅ 原生 | `.claude/skills/` | `~/.claude/skills/` | 參考實作 |
| OpenCode | ✅ 完整 | `.opencode/skill/` | `~/.config/opencode/skill/` | 也讀取 `.claude/skills/` |
| GitHub Copilot | ✅ 完整 | `.github/skills/` | `~/.copilot/skills/` | 舊版：`.claude/skills/` |
| Cline | ✅ 完整 | `.claude/skills/` | `~/.claude/skills/` | 直接使用 Claude 路徑 |
| Roo Code | ✅ 完整 | `.roo/skills/` | `~/.roo/skills/` | 模式特定：`.roo/skills-{mode}/` |
| OpenAI Codex | ✅ 完整 | `.codex/skills/` | `~/.codex/skills/` | 也讀取 `.claude/skills/` |
| Windsurf | ✅ 完整 | `.windsurf/rules/` | 設定 UI | 2026/01 起支援 Skills |
| Gemini CLI | ✅ 穩定版 | `.gemini/skills/` | `~/.gemini/skills/` | v0.27.0 穩定版 |
| Cursor | ✅ 完整 | `.cursor/skills/` | `~/.cursor/skills/` | SKILL.md 支援自 v2.4 |
| Antigravity | ✅ 完整 | `.agent/skills/` | `~/.gemini/antigravity/skills/` | 2025/11 起支援 Skills |

### 2.3 斜線命令

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
| Cursor | ✅ | 內建 + 自訂 + Skills | `/summarize`, `/models`, `/rules`, `/mcp` | `.cursor/skills/`, `.cursor/commands/*.md` |
| Antigravity | ✅ | 斜線命令 | `/deslop`, `/refactor`, `/write-tests` | 社群驅動 |

### 2.4 平台支援

| 平台 | CLI 工具 | Skills |
|------|:--------:|:------:|
| macOS | 已測試 | 已測試 |
| Linux | 預期可用 | 預期可用 |
| Windows | 提供 PowerShell | 預期可用 |

---

## 3. 整合深度

> **說明**: 截至 2026 年 2 月，Agent Skills (SKILL.md) 已成為業界標準。所有 10 個追蹤的 AI 程式碼工具現在都支援相同的 Skills 格式。

### 原生 Skills（參考實作）

**工具**: Claude Code

- Agent Skills 標準的參考實作
- 25 個內建 UDS Skills + Marketplace
- 37 個斜線命令（25 個基於 Skill + 12 個僅 Commands）
- 完整斜線命令支援（`/commit`、`/review`、`/tdd` 等）
- 關鍵字自動觸發

### 完整 Skills 支援

**工具**: OpenCode, Cursor, GitHub Copilot, Cline, Roo Code, OpenAI Codex, Windsurf, Gemini CLI

- 可讀取並執行 SKILL.md 檔案
- 跨平台相容 `.claude/skills/` 目錄
- 大多數工具也有自己的原生路徑（見 Skills 路徑欄）

### 最低 UDS CLI 支援

**工具**: Antigravity

- 工具原生支援 SKILL.md 與斜線命令（自 2025/11 起）
- UDS CLI 整合尚未更新 — 目前僅生成 `INSTRUCTIONS.md`
- 計劃中：升級 UDS CLI 以為 Antigravity 生成 Skills

---

## 4. Skills 系統

### 4.1 UDS Skills 相容性

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
| 12 | spec-driven-dev | `/sdd` | 完整 | 完整 | 部分 | 部分 |
| 13 | test-coverage-assistant | `/coverage` | 完整 | 完整 | 部分 | 部分 |
| 14 | refactoring-assistant | - | 完整 | 完整 | 完整 | 完整 |
| 15 | error-code-guide | - | 完整 | 完整 | 完整 | 完整 |
| 16 | methodology-system | `/methodology` | 完整 | 完整 | 部分 | 無 |
| 17 | project-structure-guide | `/config` | 完整 | 完整 | 部分 | 無 |
| 18 | logging-guide | - | 完整 | 完整 | 完整 | 完整 |

### 4.2 Skills 路徑與啟用

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
| Cursor | `.cursor/skills/` | `~/.cursor/skills/` | ✅ 是 |
| Antigravity | `.agent/skills/` | `~/.gemini/antigravity/skills/` | ✅ 是 |

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
| Cursor | 斜線命令、Glob 模式、`alwaysApply` 旗標 |
| Antigravity | 斜線命令、語義觸發 |

**建議**：使用 `.claude/skills/` 作為預設安裝路徑 — 大多數工具都可讀取以獲得跨工具相容性。

### 4.3 跨平台可攜性

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
| Gemini CLI | ✅ 穩定版 | 2026/02/03，v0.27.0 |
| Cursor | ✅ 完整 | 2026/01/22，v2.4 |
| Antigravity | ✅ 完整 | 2025/11/18 |

**跨平台安裝器**:
- [skilz](https://github.com/skilz-ai/skilz) - 通用 Skills 安裝器（14+ 平台）
- [openskills](https://github.com/numman-ali/openskills) - 通用 skills 載入器
- UDS CLI (`uds init`) - 為多個 AI 工具產生配置

---

## 5. 配置參考

### 5.1 配置檔

| AI Agent | 專案配置 | 全域配置 | 字元限制 |
|----------|----------|----------|----------|
| Claude Code | `CLAUDE.md` | `~/.claude/CLAUDE.md` | ~100KB |
| OpenCode | `AGENTS.md` | `~/.config/opencode/AGENTS.md` | 無限制 |
| Cursor | `.cursor/skills/`, `.cursor/rules/*.mdc` | `~/.cursor/skills/` | 每檔不同 |
| Windsurf | `.windsurfrules` | 設定 UI | 6K/檔，總計 12K |
| Cline | `.clinerules` | `~/.cline-rules/` | 無限制 |
| Roo Code | `.roorules` | `~/.roo/rules/` | 無限制 |
| GitHub Copilot | `.github/copilot-instructions.md` | 個人設定 | ~8KB |
| OpenAI Codex | `AGENTS.md` | `~/.codex/AGENTS.md` | 32KB |
| Gemini CLI | `GEMINI.md` | `~/.gemini/GEMINI.md` | 1M tokens |
| Antigravity | `INSTRUCTIONS.md` | `~/.antigravity/` | Skills + 斜線命令 |

### 5.2 配置合併行為

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
| Antigravity | 串接 | 工作區 > 全域 |

### 5.3 Skills 檔案格式

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
| Cursor | ✅ SKILL.md | `.cursor/skills/`, `.cursor/rules/` | YAML (globs, alwaysApply) |
| Antigravity | ✅ SKILL.md | `INSTRUCTIONS.md` | YAML |

---

## 6. 資源

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
| Cursor Skills 支援 | 原生 SKILL.md 支援 | ✅ v2.4（2026/01/22） |
| Antigravity Skills | 原生 SKILL.md + 斜線命令 | ✅ 2025/11 |
| Gemini CLI Skills 穩定版 | Skills 從預覽升級為穩定版 | ✅ v0.27.0（2026/02/03） |
| Windsurf 完整 Skills | Skills + Workflows（Cognition 擁有） | ✅ 2026/01 |
| 100% SKILL.md 覆蓋率 | 所有 10 個追蹤的 AI 工具支援 SKILL.md | ✅ 已達成（2026/02） |
| CLI 自動偵測 | 偵測已安裝的 AI 工具 | 計劃中 |

---

## 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| 2.5.0 | 2026-02-09 | 研究更新：Antigravity 支援 Skills + 斜線命令（先前錯誤標記為不支援）；Gemini CLI Skills 升級為穩定版（v0.27.0）；Windsurf 升級為 partial（Skills + Workflows）；Cursor 版本更正為 v2.4；新增來源 URL 至重要發展；所有 10 個 AI 工具現在支援 SKILL.md（100% 覆蓋率） |
| 2.4.0 | 2026-01-27 | 更新 Cursor 為 complete/完整 Skills 支援（v2.3.35）；新增「2026 年產業變動摘要」章節；移除「僅 Rules」分類（Cursor 已升級） |
| 2.3.0 | 2026-01-22 | 新增 UDS CLI 實作狀態章節與狀態定義；新增 Antigravity 至所有表格以與 CLI 保持一致 |
| 2.2.0 | 2026-01-15 | 新增多 Agent 安裝、Gemini CLI TOML 轉換 |
| 2.1.0 | 2026-01-15 | 更新所有工具的 Skills 支援狀態（業界廣泛採用） |
| 2.0.0 | 2026-01-15 | 重大重構：整合內容、減少表格 |
| 1.1.0 | 2026-01-15 | 新增配置檔矩陣、Skills 系統配置 |
| 1.0.0 | 2026-01-14 | 初始發布 |
