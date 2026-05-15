---
source: ../../README.md
source_version: 5.2.0
translation_version: 5.2.0
last_synced: 2026-04-22
status: current
---

# Universal Development Standards

[![npm version](https://img.shields.io/npm/v/universal-dev-standards.svg)](https://www.npmjs.com/package/universal-dev-standards)
[![License: MIT + CC BY 4.0](https://img.shields.io/badge/License-MIT%20%2B%20CC%20BY%204.0-blue.svg)](../../LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20.0.0-green.svg)](https://nodejs.org/)

> **語言**: [English](../../README.md) | 繁體中文 | [简体中文](../zh-CN/README.md)

**版本**: 5.12.0 | **發布日期**: 2026-05-14 | **授權**: [雙重授權](../../LICENSE) (CC BY 4.0 + MIT)

語言無關、框架無關的軟體專案文件標準。透過 AI 原生工作流，確保不同技術堆疊之間的一致性、品質和可維護性。

---

## 🚀 快速開始

### 透過 npm 安裝（推薦）

```bash
# 全域安裝（穩定版）
npm install -g universal-dev-standards

# 初始化專案
uds init
```

> 尋找 beta 或 RC 版本？請參閱 [預發布版本](../../docs/PRE-RELEASE.md)。

### 或使用 npx（無需安裝）

```bash
npx universal-dev-standards init
```

> **注意**：僅複製標準文件不會啟用 AI 協助功能。請使用 `uds init` 自動設定 AI 工具，或手動在工具設定檔中引用標準。

### 🗺️ 安裝後下一步

| 我想要... | 指令 |
| :--- | :--- |
| **理解既有程式碼** | `/discover` |
| **用規格驅動開發新功能** | `/sdd` |
| **處理舊有程式碼** | `/reverse` |
| **選擇開發方法論** | `/methodology` |
| **撰寫規範化的 commit** | `/commit` |

> **提示**：輸入 `/dev-workflow` 取得完整的開發階段指南與所有可用指令。
>
> 另請參閱：[每日開發工作流程指南](adoption/DAILY-WORKFLOW-GUIDE.md)

---

## ✨ 功能特色

<!-- UDS_STATS_TABLE_START -->
| 類別 | 數量 | 說明 |
|----------|-------|-------------|
| **核心標準** | 125 | 通用開發準則 |
| **AI Skills** | 54 | 互動式技能 |
| **斜線命令** | 48 | 快速操作 |
| **CLI 指令** | 6 | list, init, configure, check, update, skills |
<!-- UDS_STATS_TABLE_END -->

> **5.0 新功能？** 請參閱[預發布說明](../../docs/PRE-RELEASE.md)了解新功能詳情。

---

## 🏗️ 系統架構

UDS 採用 **雙層執行模型 (Dual-Layer Execution Model)**，專為高速互動開發與深度技術合規而設計。

```mermaid
graph TD
    A[AI 助手 / 開發者] --> B{執行層}
    B -- "日常任務" --> C["技能層 Skills (.ai.yaml)"]
    B -- "深度審查" --> D["標準層 Standards (.md)"]
    
    C --> C1[Token 最佳化]
    C --> C2[互動式引導]
    
    D --> D1[完整理論與定義]
    D --> D2[工具自動化配置]
    
    C1 -. "回退機制" .-> D1
```

| 面向 | 技能層 Skills (執行層) | 核心標準 Standards (知識庫) |
| :--- | :--- | :--- |
| **格式** | YAML 最佳化 | 完整 Markdown |
| **目標** | 高速互動與快速查詢 | 深度理解與理論依據 |
| **Token 使用** | 極小（AI 友善） | 詳細（參考文獻） |

---

## 🤖 AI 工具支援

| AI 工具 | 狀態 | Skills | 斜線命令 | 設定檔 |
| :--- | :--- | :---: | :---: | :--- |
| **Claude Code** | ✅ 完整支援 | **29** | **33** | `CLAUDE.md` |
| **OpenCode** | ✅ 完整支援 | **29** | **33** | `AGENTS.md` |
| **Cursor** | ✅ 完整支援 | **核心** | **模擬支援** | `.cursorrules` |
| **Roo Code** | ✅ 完整支援 | **核心** | **工作流** | `.roo/rules/` |
| **Gemini CLI** | 🧪 預覽版 | **18+** | **20+** | `GEMINI.md` |
| **Cline** | 🔶 部分支援 | **核心** | **工作流** | `.clinerules` |
| **Windsurf** | 🔶 部分支援 | **核心** | **規則書** | `.windsurfrules` |
| **GitHub Copilot** | 🔶 部分支援 | **核心** | **提示詞** | `.github/copilot-instructions.md` |
| **OpenAI Codex** | 🔶 部分支援 | **核心** | — | `AGENTS.md` |
| **Aider** | 🔶 部分支援 | — | — | `AGENTS.md` |
| **Continue** | 🔶 部分支援 | — | — | `.continue/config.json` |
| **Google Antigravity** | ⚠️ 最低限度 | — | — | `.antigravity/rules.md` |

> **狀態圖例**：✅ 完整支援 | 🧪 預覽版 | 🔶 部分支援 | ⚠️ 最低限度 | ⏳ 計畫中

---

## 📦 安裝方式

### CLI 工具（主要方式）

**npm（推薦）**
```bash
npm install -g universal-dev-standards
uds init        # 互動式初始化
uds check       # 檢查採用狀態
uds update      # 更新至最新版本
uds config      # 管理偏好設定（語言、模式）
uds uninstall   # 從專案移除標準
```

---

## ⚙️ 設定

使用 `uds config` 管理您的偏好設定：

| 參數 | 指令範例 | 說明 |
| :--- | :--- | :--- |
| **提交語言** | `uds config --lang zh-TW` | 設定 AI 提交訊息的偏好語言 |
| **標準等級** | `uds init --level 2` | 選擇採用深度 (1: 基本, 3: 全面) |
| **工具模式** | `uds config --mode skills` | 在 Skills、Standards 或兩者之間切換 |

---

## 👥 貢獻

1. **建議改進**：開立 issue 說明問題與解決方案。
2. **新增範例**：提交實際使用範例。
3. **擴展標準**：貢獻語言/框架/領域擴展。

詳細準則請參閱 [CONTRIBUTING.md](../../CONTRIBUTING.md)。

---

## 📄 授權

| 元件 | 授權 |
| :--- | :--- |
| **文件內容** | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| **CLI 工具** | [MIT](../../cli/LICENSE) |

## 致謝

UDS 的架構靈感來自以下傑出的開源專案：

| 專案 | 借鑑概念 | 授權 |
|------|---------|------|
| [Superpowers](https://github.com/obra/superpowers) | 系統性除錯、代理人派遣、驗證證據 | MIT |
| [GSD](https://github.com/gsd-build/get-shit-done) | 結構化任務定義、可追蹤性矩陣、驗證迴圈上限 | MIT |
| [PAUL](https://github.com/ChristopherKahler/paul) | Plan-Apply-Unify 迴圈、驗收驅動開發 | MIT |
| [CARL](https://github.com/ChristopherKahler/carl) | 情境感知載入、動態規則注入 | MIT |
| [CrewAI](https://github.com/crewAIInc/crewAI) | 多代理人通訊協定、情境預算追蹤 | MIT |
| [LangGraph](https://github.com/langchain-ai/langgraph) | 工作流程狀態協定、HITL 中斷檢查點 | MIT |
| [OpenHands](https://github.com/All-Hands-AI/OpenHands) | 事件溯源、動作-觀察串流模式 | MIT |
| [DSPy](https://github.com/stanfordnlp/dspy) | 代理人簽名、結構化 I/O 契約 | MIT |

> **注意**：UDS 僅借鑑概念與方法論，不包含上述專案的任何原始碼。

---

**由開源社群用 ❤️ 維護**
