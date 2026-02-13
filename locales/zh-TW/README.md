# Universal Development Standards

[![npm version](https://img.shields.io/npm/v/universal-dev-standards.svg)](https://www.npmjs.com/package/universal-dev-standards)
[![License: MIT + CC BY 4.0](https://img.shields.io/badge/License-MIT%20%2B%20CC%20BY%204.0-blue.svg)](../../LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20.0.0-green.svg)](https://nodejs.org/)

> **語言**: [English](../../README.md) | 繁體中文 | [简体中文](../zh-CN/README.md)

**版本**: 5.0.0-rc.2 (Pre-release) | **發布日期**: 2026-02-13 | **授權**: [雙重授權](../../LICENSE) (CC BY 4.0 + MIT)

語言無關、框架無關的軟體專案文件標準。透過 AI 原生工作流，確保不同技術堆疊之間的一致性、品質和可維護性。

---

## 🚀 快速開始

### 透過 npm 安裝（推薦）

```bash
# 全域安裝（穩定版）
npm install -g universal-dev-standards

# 或安裝 beta 取得最新功能
npm install -g universal-dev-standards@beta

# 初始化專案
uds init
```

### 或使用 npx（無需安裝）

```bash
npx universal-dev-standards init
```

> **注意**：僅複製標準文件不會啟用 AI 協助功能。請使用 `uds init` 自動設定 AI 工具，或手動在工具設定檔中引用標準。

---

## ✨ 功能特色

<!-- UDS_STATS_TABLE_START -->
| 類別 | 數量 | 說明 |
|----------|-------|-------------|
| **核心標準** | 32 | 通用開發準則 |
| **AI Skills** | 27 | 互動式技能 |
| **斜線命令** | 30 | 快速操作 |
| **CLI 指令** | 6 | list, init, configure, check, update, skills |
<!-- UDS_STATS_TABLE_END -->

### 5.0 Beta 新功能

| 功能 | 說明 |
| :--- | :--- |
| **32 個核心標準** | 新增 10 個標準，包含安全性、效能、無障礙 |
| **26 Skills / 30 Commands** | 新增 `/requirement`、`/security`、`/perf` 指令 |
| **開發者記憶** | 跨工作階段的持久記憶（`.standards/developer-memory.ai.yaml`） |
| **增強 i18n** | 提交語言偏好設定、改進簡體中文支援 |

---

## 🏗️ 系統架構

UDS 採用 **雙層執行模型 (Dual-Layer Execution Model)**，專為高速互動開發與深度技術合規而設計。

```mermaid
graph TD
    A[AI 助手 / 開發者] --> B{執行層}
    B -- "日常任務" --> C[技能層 Skills (.ai.yaml)]
    B -- "深度審查" --> D[標準層 Standards (.md)]
    
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
| **Claude Code** | ✅ 完整支援 | **26** | **30** | `CLAUDE.md` |
| **OpenCode** | ✅ 完整支援 | **26** | **30** | `AGENTS.md` |
| **Gemini CLI** | 🧪 預覽版 | **18+** | **20+** | `GEMINI.md` |
| **Cursor** | ✅ 完整支援 | **核心** | **模擬支援** | `.cursorrules` |
| **Cline / Roo Code**| 🔶 部分支援 | **核心** | **工作流** | `.clinerules` |
| **Windsurf** | 🔶 部分支援 | ✅ | **規則書** | `.windsurfrules` |

> **狀態圖例**：✅ 完整支援 | 🧪 預覽版 | 🔶 部分支援 | ⏳ 計畫中

---

## 📦 安裝方式

### CLI 工具（主要方式）

**npm（推薦）**
```bash
npm install -g universal-dev-standards
uds init    # 互動式初始化
uds check   # 檢查採用狀態
uds update  # 更新至最新版本
```

### 預發布版本 (Pre-release)

```bash
# 安裝最新 RC (Release Candidate)
npm install -g universal-dev-standards@rc

# 安裝最新 Beta
npm install -g universal-dev-standards@beta
```

### 原始碼安裝（開發用）

```bash
git clone https://github.com/AsiaOstrich/universal-dev-standards.git
cd universal-dev-standards/cli && npm install && npm link
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

---

**由開源社群用 ❤️ 維護**
