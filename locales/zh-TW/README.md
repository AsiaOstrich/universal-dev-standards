# Universal Development Standards

[![npm version](https://img.shields.io/npm/v/universal-dev-standards.svg)](https://www.npmjs.com/package/universal-dev-standards)
[![License: MIT + CC BY 4.0](https://img.shields.io/badge/License-MIT%20%2B%20CC%20BY%204.0-blue.svg)](../../LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20.0.0-green.svg)](https://nodejs.org/)

> **語言**: [English](../../README.md) | 繁體中文 | [简体中文](../zh-CN/README.md)

**版本**: 5.0.0-beta.11 (Pre-release) | **發布日期**: 2026-02-11 | **授權**: [雙重授權](../../LICENSE) (CC BY 4.0 + MIT)

語言無關、框架無關的軟體專案文件標準。確保不同技術堆疊之間的一致性、品質和可維護性。

---

## 功能特色

<!-- UDS_STATS_TABLE_START -->
| 類別 | 數量 | 說明 |
|----------|-------|-------------|
| **核心標準** | 32 | 通用開發準則 |
| **AI Skills** | 32 | 互動式技能 |
| **斜線命令** | 30 | 快速操作 |
| **CLI 指令** | 6 | list, init, configure, check, update, skills |
<!-- UDS_STATS_TABLE_END -->

---

## Beta 安裝指南

> **這是預發布版本。** 功能可能在正式發布前有所變更。如遇到任何問題，請[回報 issue](https://github.com/AsiaOstrich/universal-dev-standards/issues)。

### 安裝 Beta

```bash
# 全域安裝最新 beta
npm install -g universal-dev-standards@beta

# 或安裝特定 beta 版本
npm install -g universal-dev-standards@5.0.0-beta.11

# 無需安裝直接使用
npx universal-dev-standards@beta init
```

### 降級回穩定版

```bash
npm install -g universal-dev-standards@latest
```

### 5.0 Beta 新功能

| 功能 | 說明 |
|------|------|
| **32 個核心標準** | 新增 10 個標準，包含安全性、效能、無障礙、需求工程 |
| **26 Skills / 30 Commands** | 新增 `/requirement`、`/security`、`/perf` 指令 |
| **開發者記憶** | 跨工作階段的持久記憶（`.standards/developer-memory.ai.yaml`） |
| **增強 i18n** | 提交語言偏好設定、改進簡體中文支援 |
| **設定統一** | `uds config` 合併偏好設定 + 專案設定 |

完整 beta 版本紀錄請參閱 [CHANGELOG.md](../../CHANGELOG.md)。

---

## 快速開始

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

### 手動設定

若不使用 npm 的手動設定方式，請參閱下方[安裝方式](#安裝方式)。

> **注意**：僅複製標準文件不會啟用 AI 協助功能。請使用 `uds init` 自動設定 AI 工具，或手動在工具設定檔中引用標準。

---

## 安裝方式

### CLI 工具（主要方式）

**npm（推薦）**
```bash
npm install -g universal-dev-standards
uds init    # 互動式初始化
uds check   # 檢查採用狀態
uds update  # 更新至最新版本
uds skills  # 列出已安裝的 skills
```

**npx（無需安裝）**
```bash
npx universal-dev-standards init
```

**指定版本**
```bash
npm install -g universal-dev-standards@5.0.0-beta.10  # 最新 beta
npm install -g universal-dev-standards@beta            # 始終取得最新 beta
npm install -g universal-dev-standards@latest           # 穩定版
```

**Clone 並連結（開發用）**

macOS / Linux:
```bash
git clone https://github.com/AsiaOstrich/universal-dev-standards.git
cd universal-dev-standards/cli && npm install && npm link
```

Windows (PowerShell):
```powershell
git clone https://github.com/AsiaOstrich/universal-dev-standards.git
cd universal-dev-standards\cli; npm install; npm link
```

---

## AI 工具支援

| AI 工具 | 狀態 | Skills | 斜線命令 (Slash Commands) | 設定檔 |
|---------|--------|:------:|:--------------:|--------|
| **Claude Code** | ✅ 完整支援 | **26** | **30** (如 `/tdd`, `/review`) | `CLAUDE.md` |
| **OpenCode** | ✅ 完整支援 | **26** | **30** (如 `/sdd`, `/commit`) | `AGENTS.md` |
| **Gemini CLI** | 🧪 預覽版 | **18+** | **20+** (如 `/derive`, `/config`) | `GEMINI.md` |
| **Cursor** | ✅ 完整支援 | **核心** | **模擬支援** (`/review`, `/refactor`) | `.cursorrules` |
| **Cline / Roo Code**| 🔶 部分支援 | **核心** | **工作流** (`/checkin`, `/tdd`) | `.clinerules` |
| GitHub Copilot | 🔶 部分支援 | ✅ | **對話式** (`commit`, `review`) | `copilot-instructions.md` |
| OpenAI Codex | 🔶 部分支援 | ✅ | - | `AGENTS.md` |
| Windsurf | 🔶 部分支援 | ✅ | **規則書** (`/sdd`, `/refactor`) | `.windsurfrules` |
| Antigravity | 📄 最小支援 | - | - | `INSTRUCTIONS.md` |

> **狀態圖例**（UDS CLI 實作狀態）：
> - ✅ 完整支援 = Skills + Commands 完整支援，已測試
> - 🔶 部分支援 = Skills 可用，Commands 受限或不支援
> - 🧪 預覽版 = 功能可用但為預覽版本
> - ⏳ 計畫中 = 程式碼存在，待測試
> - 📄 最小支援 = 僅規則檔生成，不支援 Skills/Commands

### 平台支援

| 平台 | 狀態 | 備註 |
|------|------|------|
| **macOS** | ✅ 已測試 | 主要開發平台 |
| **Linux** | ⚠️ 未測試 | 預期可運作（基於 Node.js） |
| **Windows** | ⚠️ 未測試 | 提供 PowerShell 腳本 |

請參閱 [Windows 指南](../../docs/WINDOWS-GUIDE.md)了解平台特定說明。

---

## Skills 安裝

### 方法 1：Claude Code Plugin Marketplace（最簡單）

```bash
/plugin install universal-dev-standards@asia-ostrich
```

**優點**：單一指令、自動更新、立即載入全部 23 個 skills。

**從 v3.x 升級？**
```bash
/plugin uninstall universal-dev-standards@universal-dev-standards
/plugin install universal-dev-standards@asia-ostrich
```

### 方法 2：UDS CLI

```bash
npm install -g universal-dev-standards
uds init  # 選擇 AI 工具，skills 自動安裝
```

使用 `uds check` 驗證安裝狀態。

### 方法 3：手動安裝

macOS / Linux:
```bash
git clone https://github.com/AsiaOstrich/universal-dev-standards.git /tmp/uds
cp -r /tmp/uds/skills/* ~/.claude/skills/    # 全域
# 或: cp -r /tmp/uds/skills/* .claude/skills/  # 專案
rm -rf /tmp/uds
```

Windows (PowerShell):
```powershell
git clone https://github.com/AsiaOstrich/universal-dev-standards.git $env:TEMP\uds
Copy-Item -Recurse $env:TEMP\uds\skills\claude-code\* $env:USERPROFILE\.claude\skills\
Remove-Item -Recurse $env:TEMP\uds
```

### 社群市集

- **[n-skills](https://github.com/numman-ali/n-skills)** - Claude Code、OpenCode、Cursor 精選市集
- **[claude-plugins.dev](https://claude-plugins.dev/skills)** - 自動索引的 skill 探索
- **[agentskills.io](https://agentskills.io)** - 官方 Agent Skills 規範

---

## 使用模式

| 模式 | 最適合 | 主要優勢 |
|------|--------|----------|
| **僅 Skills** | 個人開發者 + Claude Code | 最低 token 使用量、最佳互動體驗 |
| **僅標準** | 多工具團隊 / 企業 | 完整自訂、版本控制 |
| **Skills + 標準** | 完整體驗 / 學習 | 100% 功能覆蓋 |

---

## 選擇您的路徑

根據您的角色與需求開始使用 UDS：

### 🚀 個人開發者 (快速開始)
- **目標**：利用 AI 協助進行高速開發。
- **路徑**：[僅 Skills 模式](#使用模式)。
- **工具**：Claude Code 或 OpenCode。
- **行動**：`/plugin install universal-dev-standards@asia-ostrich`。

### 🏗️ 架構師 / 技術主管 (標準優先)
- **目標**：建立技術邊界並確保跨團隊品質。
- **路徑**：[僅標準模式](#使用模式)。
- **工具**：任何 AI 編碼助手。
- **行動**：`uds init -m full --level 2`。

### 🛡️ 企業 / DevOps (治理優先)
- **目標**：合規性、安全稽核與自動化品質門檻。
- **路徑**：[Skills + 標準模式](#使用模式)。
- **工具**：多工具環境 + CI/CD。
- **行動**：`uds init -m full --level 3`。

---

## 核心標準概覽

> **更新 (v4.3.0)**：核心標準已針對 AI Token 使用量進行最佳化。
> - **規則 (`core/*.md`)**：供 AI 驗證使用的精簡檢查清單與規則。
> - **指南 (`core/guides/*.md`)**：供人類閱讀的詳細解釋與教學。

### 等級一：基本（30 分鐘設定）

每個專案必須包含：

| 標準 | 說明 |
|------|------|
| `anti-hallucination.md` | AI 協作準則 |
| `checkin-standards.md` | 提交前品質檢查 |
| `commit-message-guide.md` | Conventional Commits 格式 |
| `spec-driven-development.md` | 規格優先方法 |

### Level 2：推薦（2 小時設定）

包含 Level 1 加上：

| 標準 | 說明 |
|------|------|
| `git-workflow.md` | 分支策略（GitHub Flow、GitFlow、Trunk-Based） |
| `code-review-checklist.md` | 系統化審查準則 |
| `versioning.md` | 語意化版本（SemVer） |
| `changelog-standards.md` | Keep a Changelog 格式 |
| `testing-standards.md` | 測試金字塔（70/20/7/3） |
| `test-driven-development.md` | TDD 方法論 |
| `behavior-driven-development.md` | BDD 與 Given-When-Then |

### Level 3：全面（1-2 天設定）

包含 Level 2 加上：

| 標準 | 說明 |
|------|------|
| `documentation-structure.md` | 文件組織 |
| `project-structure.md` | 目錄慣例 |
| `acceptance-test-driven-development.md` | ATDD 方法論 |
| `refactoring-standards.md` | 安全重構實務 |

完整指引請參閱[採用指南](../../adoption/ADOPTION-GUIDE.md)。

---

## 客製化

### 客製化檔案位置

| 類型 | 檔案 | 位置 |
|------|------|------|
| AI 工具規則 | `CLAUDE.md`、`.cursorrules` 等 | 專案根目錄 |
| 專案覆寫 | `PROJECT-STANDARDS.md` | 專案根目錄 |
| 複製的標準 | `docs/standards/` | 您的專案 |

### 調整標準

1. **語言**：英文、繁體中文或簡體中文提交類型
2. **工具**：設定建置指令（`npm`、`dotnet`、`mvn` 等）
3. **閾值**：調整測試覆蓋率、方法長度限制
4. **範圍**：定義模組允許的提交範圍

### 排除標準

- **執行 `uds init` 時**：互動式選擇需要的標準
- **選擇性採用**：僅複製特定檔案
- **AI 工具排除**：在 `CLAUDE.md` 或 `.cursorrules` 中新增模式

---

## 貢獻

### 如何貢獻

1. **建議改進**：開立 issue 說明問題與解決方案
2. **新增範例**：提交實際使用範例
3. **擴展標準**：貢獻語言/框架/領域擴展
4. **翻譯**：協助翻譯成其他語言

### 準則

- 核心標準保持語言/框架無關性
- 至少在 2 個不同情境中包含範例
- 遵循現有文件結構
- 採用 CC BY 4.0 授權

詳細準則請參閱 [CONTRIBUTING.md](../../CONTRIBUTING.md)。

---

## 常見問題

### 如何選擇「僅 Skills」還是「僅標準」？

- **僅 Skills**：最適合使用 Claude Code 的個人開發者，想要以最少設定獲得互動式 AI 協助
- **僅標準**：最適合使用多個 AI 工具或需要企業合規與完整版本控制的團隊

### 可以只採用部分標準嗎？

可以！執行 `uds init` 並選擇需要的標準。也可以從 `core/` 手動複製特定檔案。

### 如何更新已安裝的 skills？

Plugin Marketplace：Skills 會自動更新或使用 `/plugin update`。
CLI 安裝：執行 `uds update --skills`。

### UDS 支援 Windows 嗎？

支援。CLI 基於 Node.js，可在所有平台運作。PowerShell 特定說明請參閱 [Windows 指南](../../docs/WINDOWS-GUIDE.md)。

### 核心標準和 skills 有什麼不同？

- **核心標準**：定義最佳實務的文件（Markdown）- 參考資料
- **Skills**：實作這些標準的互動式 AI 指令 - 主動協助

### 為什麼有些 AI 工具標示為「計畫中」？

我們提供這些工具的設定檔，但完整整合測試尚待進行。設定應該可以運作，但可能存在邊緣案例。

---

## 延伸閱讀

### 相關標準

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [Google Engineering Practices](https://google.github.io/eng-practices/)

### 推薦書籍

- **The Art of Readable Code** - Boswell & Foucher
- **Clean Code** - Robert C. Martin
- **The Pragmatic Programmer** - Hunt & Thomas
- **Accelerate** - Forsgren, Humble & Kim

---

## 版本歷史

| 版本 | 日期 | 重點 |
|------|------|------|
| **4.1.0** | 2026-01-21 | 增強重構標準 |
| **4.0.0** | 2026-01-20 | 雙向推導；6 個新核心標準 |
| 3.5.0 | 2026-01-15 | 多代理 Skills；Gemini CLI；i18n |
| 3.2.2 | 2026-01-06 | `uds skills` 指令 |
| 3.0.0 | 2025-12-30 | Windows 支援；npm 發布 |

完整歷史請參閱 [CHANGELOG.md](../../CHANGELOG.md)。

---

## 4.x 新功能

### 4.1.0 重點

- 增強重構標準，包含戰術、策略和遺留程式碼安全策略
- 選擇重構方法的決策矩陣

### 4.0.0 重點

| 功能 | 說明 |
|------|------|
| **雙向推導** | Forward Derivation + Reverse Engineering 實現完整規格-程式碼生命週期 |
| **6 個新核心標準** | BDD、ATDD、Reverse Engineering、Forward Derivation、AI Instructions、Refactoring |
| **23 Skills** | 7 個新 skills 包括 Forward Derivation、BDD/ATDD assistants |
| **24 Slash Commands** | 9 個新指令（`/derive-*`、`/reverse-*`、`/atdd`、`/bdd`） |
| **方法論系統** | TDD/BDD/SDD/ATDD 工作流程已達生產就緒 |

---

## 授權

| 元件 | 授權 | 允許 |
|------|------|------|
| 文件 | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) | 商業使用、修改、帶署名的再發布 |
| CLI 工具 | [MIT](../../cli/LICENSE) | 商業使用、修改、再發布 |

完整詳情請參閱 [LICENSE](../../LICENSE)。

---

### 目錄結構

```
universal-dev-standards/
├── core/                    # 核心規則與檢查清單（輕量化）
│   ├── guides/              # 詳細指南與教學
│   ├── anti-hallucination.md
│   ├── commit-message-guide.md
│   └── ...
├── methodologies/           # 方法論指南 (TDD, BDD, SDD)
│   └── guides/              # 詳細方法論教學
├── ai/                      # AI 最佳化格式（.ai.yaml）
├── skills/                  # AI 工具 skills
│   └── claude-code/         # 23 個 skill 目錄
├── extensions/              # 語言/框架擴展
│   ├── languages/           # csharp-style.md、php-style.md
│   └── frameworks/          # fat-free-patterns.md
├── integrations/            # AI 工具設定
│   ├── cursor/              # .cursorrules
│   ├── windsurf/            # .windsurfrules
│   └── ...
├── cli/                     # CLI 工具（uds 指令）
├── locales/                 # 翻譯
│   ├── zh-TW/               # 繁體中文
│   └── zh-CN/               # 簡體中文
├── templates/               # 文件模板
└── adoption/                # 採用指南
```

---

**準備好提升專案品質了嗎？** 從[快速開始](#快速開始)開始！

**由開源社群用 ❤️ 維護**
