---
source: ../../../docs/AI-AGENT-ROADMAP.md
source_version: 1.0.0
translation_version: 1.0.0
status: current
last_updated: 2026-01-14
---

# AI Agent 整合規劃

> **Language**: [English](../../../docs/AI-AGENT-ROADMAP.md) | 繁體中文 | [简体中文](../../zh-CN/docs/AI-AGENT-ROADMAP.md)

**版本**: 1.0.0
**最後更新**: 2026-01-14

本文件記錄 Universal Development Standards (UDS) 目前支援的 AI Agent 狀態及未來發展規劃。

---

## 目錄

1. [目前支援狀態](#1-目前支援狀態)
2. [整合深度分類](#2-整合深度分類)
3. [Skills 相容性矩陣](#3-skills-相容性矩陣)
4. [Skills 存放位置](#4-skills-存放位置)
5. [未來發展方向](#5-未來發展方向)
6. [社群資源](#6-社群資源)
7. [貢獻指南](#7-貢獻指南)

---

## 1. 目前支援狀態

UDS 目前支援 **11 個 AI Agent/工具**，依整合深度分類：

| 等級 | AI Agent | 整合類型 | 目錄位置 | 狀態 | 平台測試 |
|------|----------|---------|---------|------|----------|
| **Level 1** | Claude Code | 18 個原生 Skills | `skills/claude-code/` | ✅ 完整 | macOS ✅ |
| **Level 1** | OpenCode | Skills + AGENTS.md | `integrations/opencode/` | ✅ 完整 | macOS 🧪 |
| **Level 2** | Cursor | 可讀取 `.claude/skills/` | `skills/cursor/`, `integrations/cursor/` | ✅ 完整 | - |
| **Level 2** | GitHub Copilot | 部分 Skills 支援 | `skills/copilot/`, `integrations/github-copilot/` | ✅ 完整 | macOS 🧪 |
| **Level 3** | Windsurf | .windsurfrules | `skills/windsurf/`, `integrations/windsurf/` | ✅ 完整 | - |
| **Level 3** | Cline | .clinerules | `skills/cline/`, `integrations/cline/` | ✅ 完整 | - |
| **Level 4** | OpenAI Codex | AGENTS.md | `integrations/codex/` | ✅ 完整 | - |
| **Level 4** | OpenSpec | AGENTS.md | `integrations/openspec/` | ✅ 完整 | - |
| **Level 4** | Spec Kit | AGENTS.md | `integrations/spec-kit/` | ✅ 完整 | - |
| **Level 5** | Google Gemini CLI | GEMINI.md | `integrations/gemini-cli/` | ✅ 完整 | - |
| **Level 5** | Google Antigravity | rules.md | `integrations/google-antigravity/` | ✅ 完整 | - |

### 平台支援狀態

| 平台 | CLI 工具 | Skills | 備註 |
|------|----------|--------|------|
| **macOS** | ✅ 已測試 | ✅ 已測試 | 主要開發平台 |
| **Linux** | ⚠️ 未測試 | ⚠️ 未測試 | 預期可運作（基於 Node.js） |
| **Windows** | ⚠️ 未測試 | ⚠️ 未測試 | 提供 PowerShell 腳本 |

**圖例**: ✅ 已測試 | 🧪 測試中 | ⚠️ 未測試 | - 不適用

---

## 2. 整合深度分類

### Level 1: 原生 Skills 支援
- **完整 Skills 相容性**：可直接使用全部 18 個 Claude Code Skills
- **斜線命令支援**：支援 `/commit`、`/review`、`/tdd` 等命令
- **自動觸發**：關鍵字自動調用相關 Skills
- **工具**：Claude Code、OpenCode

### Level 2: Skills 相容
- **可讀取 Skills**：能讀取 `.claude/skills/` 目錄
- **有限斜線命令**：部分工具不支援所有命令
- **需手動調用**：某些功能需要明確呼叫
- **工具**：Cursor、GitHub Copilot

### Level 3: 規則檔案格式
- **專用規則檔案**：使用工具特定的格式
- **靜態規則**：規則在啟動時載入，無動態 Skills
- **跨工具生成**：UDS CLI 可為這些工具生成規則檔案
- **工具**：Windsurf (.windsurfrules)、Cline (.clinerules)

### Level 4: 代理規則
- **AGENTS.md 格式**：遵循 OpenAI Codex 代理規範
- **SDD 工具支援**：包含 Spec-Driven Development 工具
- **靜態配置**：規則定義在 markdown 檔案中
- **工具**：OpenAI Codex、OpenSpec、Spec Kit

### Level 5: 指令檔案
- **自訂格式**：每個工具有自己的指令格式
- **基礎整合**：提供核心開發標準
- **功能有限**：無 Skills 或斜線命令支援
- **工具**：Google Gemini CLI (GEMINI.md)、Google Antigravity (rules.md)

---

## 3. Skills 相容性矩陣

### 18 個 Claude Code Skills

| # | Skill | 斜線命令 | Claude | OpenCode | Cursor | Copilot |
|---|-------|---------|--------|----------|--------|---------|
| 1 | ai-collaboration-standards | - | ✅ | ✅ | ✅ | ✅ |
| 2 | checkin-assistant | `/check` | ✅ | ✅ | ⚠️ | ⚠️ |
| 3 | commit-standards | `/commit` | ✅ | ✅ | ⚠️ | ⚠️ |
| 4 | code-review-assistant | `/review` | ✅ | ✅ | ⚠️ | ⚠️ |
| 5 | testing-guide | - | ✅ | ✅ | ✅ | ✅ |
| 6 | tdd-assistant | `/tdd` | ✅ | ✅ | ⚠️ | ⚠️ |
| 7 | release-standards | `/release` | ✅ | ✅ | ⚠️ | ❌ |
| 8 | git-workflow-guide | - | ✅ | ✅ | ✅ | ✅ |
| 9 | documentation-guide | `/docs` | ✅ | ✅ | ⚠️ | ❌ |
| 10 | requirement-assistant | `/requirement` | ✅ | ✅ | ⚠️ | ⚠️ |
| 11 | changelog-guide | `/changelog` | ✅ | ✅ | ⚠️ | ❌ |
| 12 | spec-driven-dev | `/spec` | ✅ | ✅ | ⚠️ | ⚠️ |
| 13 | test-coverage-assistant | `/coverage` | ✅ | ✅ | ⚠️ | ⚠️ |
| 14 | refactoring-assistant | - | ✅ | ✅ | ✅ | ✅ |
| 15 | error-code-guide | - | ✅ | ✅ | ✅ | ✅ |
| 16 | methodology-system | `/methodology` | ✅ | ✅ | ⚠️ | ❌ |
| 17 | project-structure-guide | `/config` | ✅ | ✅ | ⚠️ | ❌ |
| 18 | logging-guide | - | ✅ | ✅ | ✅ | ✅ |

**圖例**：✅ 完整支援 | ⚠️ 部分/手動 | ❌ 不支援

---

## 4. Skills 存放位置

### 專案層級路徑

| AI Agent | 主要路徑 | 替代路徑 | Claude 相容 |
|----------|---------|---------|------------|
| Claude Code | `.claude/skills/` | - | ✅ 原生 |
| OpenCode | `.opencode/skill/` | `.claude/skills/` | ✅ 支援 |
| Cursor | `.cursor/skills/` | `.claude/skills/` | ✅ 支援 |
| GitHub Copilot | `.github/skills/` | `.claude/skills/` (Legacy) | ✅ 支援 |
| OpenAI Codex | `.codex/skills/` | - | ❌ 獨立 |
| Windsurf | `.windsurf/skills/` | - | ❌ 獨立 |
| Cline | `.cline/skills/` | - | ❌ 獨立 |

### 使用者層級路徑

| AI Agent | 使用者路徑 |
|----------|-----------|
| Claude Code | `~/.claude/skills/` |
| OpenCode | `~/.config/opencode/skill/` |
| Cursor | `~/.cursor/skills/` |
| GitHub Copilot | `~/.copilot/skills/` |
| OpenAI Codex | `~/.codex/skills/` |
| Windsurf | `~/.codeium/windsurf/skills/` |
| Cline | `~/.cline/skills/` |

### 建議

**使用 `.claude/skills/` 作為預設安裝路徑**，以獲得最大的跨工具相容性。大多數 Skills 相容工具都支援從此位置讀取。

---

## 5. 未來發展方向

### 5.1 潛在新增工具

| 工具 | 類型 | 優先級 | 備註 |
|------|------|--------|------|
| Amazon Q Developer | IDE 外掛 | 中 | AWS 生態系統整合 |
| JetBrains AI Assistant | IDE 外掛 | 中 | JetBrains 生態系統 |
| Tabnine | 程式碼補全 | 低 | 隱私優先選項 |
| Sourcegraph Cody | 程式碼搜尋 + AI | 中 | 企業功能 |
| Continue.dev | 開源 | 高 | 社群驅動，開放 |

### 5.2 功能增強規劃

| 功能 | 描述 | 目標工具 |
|------|------|---------|
| Skills v2 格式 | 增強的 metadata、依賴性 | 所有 Level 1-2 |
| 跨工具同步 | 自動生成規則檔案 | Level 3-5 |
| CLI 自動偵測 | 偵測已安裝的 AI 工具 | 全部 |
| Skills 市場 | 發布和發現 Skills | Level 1-2 |

### 5.3 整合改進

- **Windsurf/Cline**：探索採用 Skills 格式
- **Copilot**：更深入的 Chat 整合
- **Codex**：監控 Skills 支援
- **OpenCode**：持續作為參考實作

---

## 6. 社群資源

### Skills 市場

| 平台 | 網址 | 支援工具 |
|------|------|---------|
| n-skills | https://github.com/numman-ali/n-skills | Claude、Cursor、Windsurf、Cline、OpenCode、Codex |
| claude-plugins.dev | https://claude-plugins.dev/skills | Claude、Cursor、OpenCode、Codex |
| agentskills.io | https://agentskills.io | 所有 Skills 相容工具 |

### 官方文件

| 工具 | 文件 |
|------|------|
| Claude Code | https://docs.anthropic.com/claude-code |
| OpenCode | https://opencode.ai/docs |
| Cursor | https://docs.cursor.com |
| GitHub Copilot | https://docs.github.com/copilot |

---

## 7. 貢獻指南

### 新增 AI 工具支援

1. 研究該工具的配置格式
2. 在 `integrations/<tool-name>/` 下建立整合目錄
3. 新增 README.md 說明設定步驟
4. 若為 Skills 相容，新增 skills-mapping.md
5. 更新本規劃文件
6. 依照 [CONTRIBUTING.md](../../../CONTRIBUTING.md) 提交 PR

### 回報問題

- 整合問題：[GitHub Issues](https://github.com/anthropics-tw/universal-dev-standards/issues)
- 功能請求：使用 `enhancement` 標籤
- 文件問題：使用 `documentation` 標籤

---

## 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| 1.0.0 | 2026-01-14 | 初始版本 |
