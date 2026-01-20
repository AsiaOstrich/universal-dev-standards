---
source: ../../CLAUDE.md
source_version: 1.2.0
translation_version: 1.2.0
last_synced: 2026-01-08
status: current
---

# 通用開發標準 - 專案規範

本文件定義 Universal Development Standards 專案本身的開發規範。作為一個提供開發標準給其他專案的框架，我們實踐自己所倡導的理念（「吃自己的狗糧」）。

## 專案概述

Universal Development Standards 是一個語言無關、框架無關的文件化標準框架。它提供：

- **核心規範** (`core/`)：22 個基礎開發標準
- **AI 技能** (`skills/`)：用於 AI 輔助開發的 Claude Code 技能
- **CLI 工具** (`cli/`)：用於採用標準的 Node.js CLI
- **整合** (`integrations/`)：各種 AI 工具的配置
- **本地化** (`locales/`)：多語言支援（英文、繁體中文）

## 技術棧

| 元件 | 技術 | 版本 |
|------|------|------|
| 運行環境 | Node.js | >= 18.0.0 |
| 模組系統 | ES Modules | - |
| 測試框架 | Vitest | ^4.0.16 |
| 程式碼檢查 | ESLint | ^8.56.0 |
| CLI 框架 | Commander.js | ^12.1.0 |
| 互動式提示 | Inquirer.js | ^9.2.12 |

## 開發規範

### 1. Commit 訊息格式

遵循 `core/commit-message-guide.md` 中定義的 Conventional Commits 規範：

```
<type>(<scope>): <subject>

<body>

<footer>
```

**類型：**
- `feat`：新功能或標準
- `fix`：錯誤修復或糾正
- `docs`：文件更新
- `chore`：維護任務
- `test`：測試相關變更
- `refactor`：程式碼重構
- `style`：格式變更

**範例：**
```bash
feat(core): 新增測試完整度維度標準
docs(skills): 更新 Claude Code 技能文件
fix(cli): 修復 Windows 路徑解析問題
chore(i18n): 同步翻譯與原始檔案
```

### 2. 分支策略

遵循 `core/git-workflow.md` 中定義的 Git 工作流：

| 分支 | 用途 |
|------|------|
| `main` | 穩定、生產就緒的版本 |
| `feature/*` | 新功能和增強 |
| `fix/*` | 錯誤修復 |
| `docs/*` | 文件更新 |
| `chore/*` | 維護任務 |

### 3. 程式碼風格

**JavaScript：**
- 使用單引號作為字串
- 語句以分號結尾
- 使用 ES Module 語法（`import`/`export`）
- 遵循 `cli/.eslintrc.json` 中的 ESLint 配置

**Markdown：**
- 使用 ATX 風格標題（`#`、`##`、`###`）
- 標題前後包含空行
- 使用帶語言規範的圍欄式程式碼區塊

### 4. 測試要求

- 所有 CLI 功能必須有對應的測試
- 提交前執行測試：`npm test`（在 `cli/` 目錄）
- 執行程式碼檢查：`npm run lint`（在 `cli/` 目錄）
- 測試覆蓋率報告：`npm run test:coverage`

### 5. 翻譯同步

修改核心規範時：
1. 先更新英文原始檔案
2. 同步變更到 `locales/zh-TW/` 目錄
3. 執行翻譯檢查：`./scripts/check-translation-sync.sh`

## 快速指令

### macOS / Linux

```bash
# CLI 開發（在 cli/ 目錄執行）
cd cli
npm install          # 安裝依賴
npm test             # 執行測試
npm run test:watch   # 以 watch 模式執行測試
npm run lint         # 檢查程式碼風格
npm run test:coverage # 產生覆蓋率報告

# 翻譯同步檢查（從根目錄執行）
./scripts/check-translation-sync.sh

# 版本同步檢查（從根目錄執行）
./scripts/check-version-sync.sh

# 標準一致性檢查（從根目錄執行）
./scripts/check-standards-sync.sh

# 本地 CLI 測試
node cli/bin/uds.js list
node cli/bin/uds.js init --help
```

### Windows (PowerShell)

```powershell
# CLI 開發（在 cli\ 目錄執行）
cd cli
npm install          # 安裝依賴
npm test             # 執行測試
npm run test:watch   # 以 watch 模式執行測試
npm run lint         # 檢查程式碼風格
npm run test:coverage # 產生覆蓋率報告

# 翻譯同步檢查（從根目錄執行）
.\scripts\check-translation-sync.ps1

# 版本同步檢查（從根目錄執行）
.\scripts\check-version-sync.ps1

# 標準一致性檢查（從根目錄執行）
.\scripts\check-standards-sync.ps1

# 本地 CLI 測試
node cli\bin\uds.js list
node cli\bin\uds.js init --help
```

### Windows (Git Bash)

```bash
# 與 macOS / Linux 相同的指令在 Git Bash 中可用
./scripts/check-translation-sync.sh
./scripts/check-version-sync.sh
./scripts/check-standards-sync.sh
```

## AI 協作指南

在此專案中使用 AI 助手（Claude Code、Cursor 等）時：

### 應該做的：
- 參考 `core/` 中現有標準以保持一致性
- 文件遵循雙語格式（英文 + 繁體中文）
- 修改核心規範後檢查翻譯同步
- 提交前執行測試和程式碼檢查

### 不應該做的：
- 建立新標準時不遵循現有範本結構
- 修改翻譯檔案而不更新原始檔案
- 跳過 PR 的程式碼審查檢查清單
- 在核心規範中引入特定語言或框架的內容

### 專案特定脈絡：
- 本專案使用 ES Modules（非 CommonJS）
- 所有核心規範應保持語言/框架無關
- 需要雙語文件（英文主版本，zh-TW 翻譯）
- CLI 工具是主要程式碼元件；大部分內容是 Markdown

### 規範合規參考

| 任務 | 必須遵循 | 參考 |
|------|----------|------|
| 程式碼分析 | 反幻覺標準 | [core/anti-hallucination.md](../../core/anti-hallucination.md) |
| PR 審查 | 程式碼審查清單 | [core/code-review-checklist.md](../../core/code-review-checklist.md) |
| 新增功能 | 測試標準 | [core/testing-standards.md](../../core/testing-standards.md) |
| 任何提交 | 提交規範 | [core/checkin-standards.md](../../core/checkin-standards.md) |
| 新功能設計 | 規格驅動開發 | [core/spec-driven-development.md](../../core/spec-driven-development.md) |
| 撰寫 AI 指令 | AI 指令標準 | [core/ai-instruction-standards.md](../../core/ai-instruction-standards.md) |
| 撰寫文件 | 文件撰寫標準 | [core/documentation-writing-standards.md](../../core/documentation-writing-standards.md) |

## 檔案結構參考

```
universal-dev-standards/
├── core/                  # 核心規範（22 個檔案）
├── skills/                # AI 工具技能
│   └── claude-code/       # Claude Code 技能（23 個技能）
├── cli/                   # Node.js CLI 工具
│   ├── src/               # 原始碼
│   ├── tests/             # 測試檔案
│   └── package.json       # 依賴
├── locales/               # 翻譯
│   └── zh-TW/             # 繁體中文
├── integrations/          # AI 工具配置
├── templates/             # 文件範本
├── adoption/              # 採用指南
└── scripts/               # 維護腳本
```

## 貢獻

詳細的貢獻指南請參閱 [CONTRIBUTING.md](../../CONTRIBUTING.md)。

## 授權

- 文件（Markdown）：CC BY 4.0
- 程式碼（JavaScript）：MIT
