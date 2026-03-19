---
source: ../../../../skills/commands/init.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-19
---

---
description: [UDS] Initialize development standards in current project
allowed-tools: Read, Bash(uds init:*), Bash(npx:*)
argument-hint: "[--level N | --yes]"
---

# 初始化標準

> **Language**: [English](../../../../skills/commands/init.md) | 繁體中文

在當前專案初始化 Universal Development Standards。

## 互動模式（預設）

當不帶 `--yes` 執行時，使用 AskUserQuestion 詢問用戶偏好後再執行。

### 步驟 1：偵測專案

首先，CLI 會自動偵測專案特性：
- 程式語言（JavaScript、TypeScript、Python、Go 等）
- 框架（React、Vue、Express 等）
- AI 工具（Claude Code、Cursor、Copilot 等）

### 步驟 2：詢問 AI 工具選擇

使用 AskUserQuestion（多選）詢問要配置哪些 AI 工具：

| AI 工具 | 整合檔案 | Skills 支援 | Commands 支援 |
|---------|----------|-------------|---------------|
| **Claude Code** | `CLAUDE.md` | ✅ | ❌ |
| **Cursor** | `.cursorrules` | ✅ | ❌ |
| **Windsurf** | `.windsurfrules` | ✅ | ❌ |
| **Cline** | `.clinerules` | ✅ | ❌ |
| **GitHub Copilot** | `.github/copilot-instructions.md` | ✅ | ✅ |
| **OpenCode** | `AGENTS.md` | ✅ | ✅ |
| **Gemini CLI** | `GEMINI.md` | ✅ | ✅ |
| **Codex** | `AGENTS.md` | ✅ | ❌ |
| **Antigravity** | `INSTRUCTIONS.md` | ✅ | ❌ |

預選環境中偵測到的工具。注意：Codex 和 OpenCode 共用 `AGENTS.md`。

### 步驟 3：詢問 Skills 安裝

對於支援 Skills 的工具，根據工具數量使用**智能分組**策略。

**重要：AskUserQuestion 最多只能有 4 個選項。** 使用智能分組來處理。

#### 策略 A：1-2 個工具 → 合併詢問

**範例（僅 Claude Code）：**
```
Question: "Skills 要安裝到哪裡？"
Options:
1. Plugin Marketplace (建議) - 自動更新，易於管理
2. User Level (~/.claude/skills/) - 所有專案共用
3. Project Level (.claude/skills/) - 僅此專案
4. 跳過 - 不安裝 Skills
```

**範例（Claude Code + OpenCode）：**
```
Question: "Skills 要安裝到哪裡？"
Options:
1. Plugin Marketplace + OpenCode Project Level (建議)
2. 全部 User Level - 所有專案共用
3. 全部 Project Level - 僅此專案
4. 跳過 - 不安裝 Skills
```

#### 策略 B：3+ 個工具 → 兩階段詢問

**第一階段：詢問統一或個別**
```
Question: "您選擇了 3 個以上的 AI 工具，Skills 安裝層級要如何設定？"
Options:
1. 統一層級 (建議) - 所有工具使用相同層級
2. 個別設定 - 為每個工具分別選擇層級
3. 跳過 - 不安裝 Skills
```

**第二階段 a：如果統一 → 詢問一次層級**
```
Question: "所有 Skills 要安裝到哪個層級？"
Options:
1. User Level - 所有專案共用
2. Project Level (建議) - 僅此專案
```
注意：Claude Code 預設使用 Plugin Marketplace；只有其他工具使用所選層級。

**第二階段 b：如果個別 → 逐工具詢問**
為每個工具分別詢問（參見策略 A 範例）。

### 步驟 4：詢問 Commands 安裝

對於支援 Commands 的工具（OpenCode、Copilot、Gemini CLI），使用**智能分組**策略。

**重要：AskUserQuestion 最多只能有 4 個選項。** 使用智能分組來處理。

#### 策略 A：1-2 個工具 → 合併詢問

**範例（僅 OpenCode）：**
```
Question: "Commands 要安裝到哪裡？"
Options:
1. User Level (~/.config/opencode/command/) - 所有專案共用
2. Project Level (.opencode/command/) - 僅此專案 (建議)
3. 跳過 - 使用 Skills 即可
```

**範例（OpenCode + Copilot）：**
```
Question: "Commands 要安裝到哪裡？"
Options:
1. 全部 User Level - 所有專案共用
2. 全部 Project Level (建議) - 僅此專案
3. 跳過 - 使用 Skills 即可
```

#### 策略 B：3+ 個工具 → 兩階段詢問

**第一階段：詢問統一或個別**
```
Question: "您選擇了多個支援 Commands 的 AI 工具，安裝層級要如何設定？"
Options:
1. 統一層級 (建議) - 所有工具使用相同層級
2. 個別設定 - 為每個工具分別選擇層級
3. 跳過 - 不安裝 Commands
```

**第二階段 a：如果統一 → 詢問一次層級**
```
Question: "所有 Commands 要安裝到哪個層級？"
Options:
1. User Level - 所有專案共用
2. Project Level (建議) - 僅此專案
```

**第二階段 b：如果個別 → 逐工具詢問**
為每個工具分別詢問（參見策略 A 範例）。

### 步驟 5：詢問標準範圍

使用 AskUserQuestion（僅在安裝 Skills 時顯示）：

| 選項 | 說明 |
|------|------|
| **Lean（建議）** | 僅參考文件，Skills 提供即時任務指導 |
| **Complete** | 安裝所有標準檔案，不依賴 Skills |

### 步驟 6：詢問採用層級

使用 AskUserQuestion：

| 選項 | 說明 |
|------|------|
| **Level 1：Starter** | 6 項核心標準：commit、anti-hallucination、checkin 等 |
| **Level 2：Professional（建議）** | 新增測試、Git 工作流程、錯誤處理 — 共 12 項 |
| **Level 3：Complete** | 包含版本控制、日誌、SDD — 全部 16 項標準 |

### 步驟 7：詢問標準格式

使用 AskUserQuestion：

| 選項 | 說明 |
|------|------|
| **AI（精簡）** | 針對 AI 消費最佳化（建議） |
| **Human（詳細）** | 人類可讀的格式 |
| **Both** | 產生兩種格式 |

### 步驟 8：詢問標準選項

根據採用層級，詢問：
- **Git 工作流程**：github-flow、gitflow、trunk-based
- **合併策略**：squash、merge、rebase
- **Commit 語言**：english、traditional-chinese、bilingual
- **測試層級**：unit-testing、integration-testing、e2e-testing

### 步驟 9：詢問語言擴展

如果偵測到程式語言，詢問是否納入語言特定標準：
- C# Style Guide
- PHP Style Guide
- 等

### 步驟 10：詢問框架擴展

如果偵測到框架，詢問是否納入框架特定模式：
- Fat-Free Patterns
- 等

### 步驟 11：詢問地區設定

使用 AskUserQuestion：

| 選項 | 說明 |
|------|------|
| **English（預設）** | 英文文件 |
| **Traditional Chinese** | 繁體中文文件 |

### 步驟 12：詢問內容模式

使用 AskUserQuestion 設定整合檔案內容：

| 選項 | 說明 |
|------|------|
| **Standard（建議）** | 摘要 + 任務對應，AI 知道何時讀取哪項標準 |
| **Full Embed** | 嵌入所有規則，AI 可立即使用但檔案較大 |
| **Minimal** | 僅檔案參考，適合搭配 Skills 使用 |

### 步驟 13：確認並執行

顯示設定摘要並在執行前確認。

確認後，CLI 會一次執行所有安裝：
- 將標準複製到 `.standards/`
- 產生整合檔案
- 安裝 Skills（如果已選擇）
- 安裝 Commands（如果已選擇）
- 建立 `manifest.json`

## 快速模式

使用 `--yes` 或特定選項時，跳過互動式問題：

```bash
/init --yes                    # 使用所有預設值
/init --level 2 --yes          # 指定層級並使用預設值
/init --skills-location none   # 不安裝 Skills
/init --content-mode standard  # 指定內容模式
```

## 選項參考

| 選項 | 說明 |
|------|------|
| `--yes`, `-y` | 非互動模式 |
| `--level N` | 採用層級（1、2 或 3） |
| `--skills-location` | marketplace、user、project 或 none |
| `--content-mode` | standard、full 或 minimal |
| `--format` | ai、human 或 both |
| `-E`, `--experimental` | 啟用實驗性功能（methodology） |

詳見 `uds init --help` 取得所有選項。

## 採用層級

| 層級 | 名稱 | 標準數量 | 說明 |
|------|------|----------|------|
| 1 | Starter | 6 | 核心標準（小型專案） |
| 2 | Professional | 12 | 團隊專業品質標準 |
| 3 | Complete | 16 | 完整的 16 項標準 |

## 安裝內容

- `.standards/` 目錄包含核心標準
- 整合檔案（`CLAUDE.md`、`.cursorrules` 等）
- Skills（透過 Plugin Marketplace 或本地安裝）
- Commands（針對支援的 AI 工具）
- `manifest.json` 用於追蹤安裝狀態

## 參考

- CLI 文件：`uds init --help`
- 採用指南：[ADOPTION-GUIDE.md](../../adoption/ADOPTION-GUIDE.md)
- 檢查指令：[/check](./check.md)
- 更新指令：[/update](./update.md)
