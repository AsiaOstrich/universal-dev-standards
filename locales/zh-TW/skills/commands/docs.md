---
source: ../../../../skills/commands/docs.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: 55ff9b202f90
status: current
---

---
name: docs
description: [UDS] 管理、引導並產生文件。
argument-hint: "[impact|translate|generate|readme|api] [options]"
---

# /docs 命令

> **Language**: [English](../../../../skills/commands/docs.md) | 繁體中文

管理、撰寫和生成專案文件。

## 用法

```bash
/docs [subcommand] [options]
```

### 子命令

| 子命令 | 說明 |
|--------|------|
| `impact` | 分析程式碼變更對文件的影響 |
| `translate` | 檢查翻譯狀態或翻譯文件 |
| `generate` | 產生文件工件（速查表、參考手冊） |
| `readme` | 稽核並更新 README.md |
| `api` | 從程式碼產生 API 文件 |
| `structure` | 檢查文件目錄結構 |
| `(none)` | 展示文件狀態總覽 |

### Impact 選項

搭配 `/docs impact` 使用：

| 選項 | 說明 |
|------|------|
| `--staged` | 只分析已暫存（git add）的變更 |
| `--commit <ref>` | 分析指定 commit 或範圍的變更 |
| （預設） | 分析所有未提交的變更 |

### Translate 選項

搭配 `/docs translate` 使用：

| 選項 | 說明 |
|------|------|
| `<file>` | 翻譯指定的源檔 |
| `--lang <lang>` | 目標語言（`zh-TW`、`zh-CN`） |
| `--check` | 只檢查翻譯同步狀態（不做修改） |
| `--all` | 翻譯所有過時的檔案 |
| （預設） | 顯示翻譯狀態摘要 |

### Generate 選項

搭配 `/docs generate` 使用：

| 選項 | 說明 |
|------|------|
| `--lang <lang>` | 語言（`en`、`zh-TW`、`zh-CN`） |
| `--cheatsheet` | 僅產生速查表 |
| `--reference` | 僅產生功能參考手冊 |
| `--check` | 檢查文件是否不同步 |

## 範例

```bash
# 分析目前變更對文件的影響
/docs impact

# 只分析已暫存變更對文件的影響
/docs impact --staged

# 檢查翻譯同步狀態
/docs translate --check

# 將指定檔案翻譯為 zh-TW
/docs translate docs/CLI-INIT-OPTIONS.md --lang zh-TW

# 翻譯所有過時的檔案
/docs translate --all --lang zh-TW

# 產生所有文件
/docs generate

# 更新 README
/docs readme

# 檢查文件結構
/docs structure
```

## AI 代理行為

> 遵循 [AI 命令行為標準](../../core/ai-command-behavior.md)

### 進入路由

| 輸入 | AI 動作 |
|------|---------|
| `/docs` | 展示專案文件狀態總覽（哪些文件存在、是否過時） |
| `/docs impact` | 分析未提交的程式碼變更對文件的影響，列出受影響文件和建議命令 |
| `/docs impact --staged` | 只分析已 stage 的變更 |
| `/docs impact --commit <ref>` | 分析指定 commit 的變更影響 |
| `/docs translate` | 展示翻譯狀態摘要（哪些翻譯過時、缺失） |
| `/docs translate <file>` | 翻譯指定文件，依據 `output_language` 設定和 `locales/` 結構 |
| `/docs translate --check` | 只檢查翻譯狀態，不做修改（等同 `check-translation-sync.sh`） |
| `/docs translate --all` | 翻譯所有過時的檔案 |
| `/docs generate` | 產生文件工件（速查表、參考手冊） |
| `/docs generate --lang <lang>` | 產生指定語言的文件 |
| `/docs readme` | 稽核並更新 README.md |
| `/docs api` | 從程式碼產生 API 文件 |
| `/docs structure` | 檢查文件目錄結構是否符合規範 |

### 互動腳本

**決策：子命令分派**
- IF `impact` → 執行文件影響分析（見下方 Impact 流程）
- IF `translate` → 執行翻譯流程（見下方 Translate 流程）
- IF `generate` → 執行 `/docgen` 的產生流程
- IF `readme` → 分析 README 完整性，建議更新
- IF `api` → 掃描程式碼，產生 API 文件
- IF `structure` → 檢查目錄結構，報告缺失
- IF 無子命令 → 展示文件狀態總覽

#### Impact 流程

1. 取得變更清單（`git diff` 或 `git diff --staged` 或 `git diff <ref>`）
2. 對每個變更的檔案，掃描哪些文件引用了它
3. 輸出影響報告，格式：

```
📋 Documentation Impact Analysis
─────────────────────────────────
Modified: cli/src/commands/init.js, cli/src/prompts/init.js

Affected documents:
  README.md — describes CLI init options
    → /docs readme
  docs/CLI-INIT-OPTIONS.md — references promptOutputLanguage()
    → manual update or /docs generate
  locales/zh-TW/docs/CLI-INIT-OPTIONS.md — translation outdated
    → /docs translate docs/CLI-INIT-OPTIONS.md --lang zh-TW

No impact: ARCHITECTURE.md, API.md (not referenced)
```

🛑 **STOP**：展示報告後等待使用者選擇要執行哪些更新

#### Translate 流程

1. IF `--check` 或無參數 → 掃描 `locales/` 目錄，比對源檔版本
2. 輸出翻譯狀態表：

```
📋 Translation Status (zh-TW)
─────────────────────────────
✅ current     core/commit-message-guide.md (v1.3.0)
⚠️  outdated   docs/CLI-INIT-OPTIONS.md (source v1.5.0, translation v1.4.0)
❌ missing     core/documentation-writing-standards.md (new sections added)
```

3. IF 指定 `<file>` 或 `--all` → 讀取源檔和現有翻譯，產生更新的翻譯內容
4. 依據 `output_language` 設定決定翻譯語言和風格

🛑 **STOP**：展示翻譯結果後等待使用者確認寫入

### 停止點

| 停止點 | 等待內容 |
|--------|---------|
| impact 報告展示後 | 選擇要執行哪些更新 |
| translate 結果展示後 | 確認翻譯內容寫入 |
| generate/readme/api 結果展示後 | 確認寫入 |

### 錯誤處理

| 錯誤條件 | AI 動作 |
|----------|---------|
| 子命令無效 | 列出可用子命令 |
| 目標目錄不存在 | 自動建立或詢問使用者 |
| 無程式碼可分析（api 子命令） | 告知並建議檢查路徑 |
| 無 git 歷史（impact 子命令） | 告知需要 git 初始化 |
| locales/ 目錄不存在（translate 子命令） | 告知專案未設定翻譯結構 |
| 源檔未變更（translate 子命令） | 告知翻譯已是最新 |

## 參考

*   [文件指南技能](../documentation-guide/SKILL.md)
*   [核心規範](../../core/documentation-writing-standards.md)
