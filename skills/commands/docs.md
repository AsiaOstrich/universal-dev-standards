---
name: docs
description: [UDS] Manage, guide, and generate documentation.
argument-hint: "[impact|translate|generate|readme|api] [options]"
---

# /docs Command | /docs 命令

Manage, write, and generate project documentation.

管理、撰寫和生成專案文件。

## Usage | 用法

```bash
/docs [subcommand] [options]
```

### Subcommands | 子命令

| Subcommand | Description | 說明 |
|------------|-------------|------|
| `impact` | Analyze documentation impact of recent code changes | 分析程式碼變更對文件的影響 |
| `translate` | Check translation status or translate documents | 檢查翻譯狀態或翻譯文件 |
| `generate` | Generate documentation artifacts (cheatsheets, reference) | 產生文件工件 |
| `readme` | Audit and update README.md | 審計並更新 README.md |
| `api` | Generate API documentation from code | 從程式碼產生 API 文件 |
| `structure` | Check documentation folder structure | 檢查文件目錄結構 |
| `(none)` | Show documentation guide/status | 展示文件狀態總覽 |

### Impact Options

Used with `/docs impact`:

| Option | Description |
|--------|-------------|
| `--staged` | Only analyze staged (git add) changes |
| `--commit <ref>` | Analyze changes from a specific commit or range |
| (default) | Analyze all uncommitted changes |

### Translate Options

Used with `/docs translate`:

| Option | Description |
|--------|-------------|
| `<file>` | Translate a specific source file |
| `--lang <lang>` | Target language (`zh-TW`, `zh-CN`) |
| `--check` | Check translation sync status only (no changes) |
| `--all` | Translate all outdated files |
| (default) | Show translation status summary |

### Generate Options

Used with `/docs generate`:

| Option | Description |
|--------|-------------|
| `--lang <lang>` | Language (`en`, `zh-TW`, `zh-CN`) |
| `--cheatsheet` | Generate cheatsheet only |
| `--reference` | Generate feature reference only |
| `--check` | Check if docs are out of sync |

## Examples | 範例

```bash
# Analyze doc impact of current changes
/docs impact

# Analyze doc impact of staged changes only
/docs impact --staged

# Check translation sync status
/docs translate --check

# Translate a specific file to zh-TW
/docs translate docs/CLI-INIT-OPTIONS.md --lang zh-TW

# Translate all outdated files
/docs translate --all --lang zh-TW

# Generate all docs
/docs generate

# Update README
/docs readme

# Check doc structure
/docs structure
```

## AI Agent Behavior | AI 代理行為

> Follows [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### Entry Router | 進入路由

| Input | AI Action |
|-------|-----------|
| `/docs` | 展示專案文件狀態總覽（哪些文件存在、是否過時） |
| `/docs impact` | 分析未提交的程式碼變更對文件的影響，列出受影響文件和建議命令 |
| `/docs impact --staged` | 只分析已 stage 的變更 |
| `/docs impact --commit <ref>` | 分析指定 commit 的變更影響 |
| `/docs translate` | 展示翻譯狀態摘要（哪些翻譯過時、缺失） |
| `/docs translate <file>` | 翻譯指定文件，根據 `output_language` 設定和 `locales/` 結構 |
| `/docs translate --check` | 只檢查翻譯狀態，不做修改（等同 `check-translation-sync.sh`） |
| `/docs translate --all` | 翻譯所有過時的檔案 |
| `/docs generate` | 生成文件工件（速查表、參考手冊） |
| `/docs generate --lang <lang>` | 生成指定語言的文件 |
| `/docs readme` | 審計並更新 README.md |
| `/docs api` | 從程式碼生成 API 文件 |
| `/docs structure` | 檢查文件目錄結構是否符合規範 |

### Interaction Script | 互動腳本

**Decision: 子命令分派**
- IF `impact` → 執行文件影響分析（見下方 Impact 流程）
- IF `translate` → 執行翻譯流程（見下方 Translate 流程）
- IF `generate` → 執行 `/docgen` 的生成流程
- IF `readme` → 分析 README 完整性，建議更新
- IF `api` → 掃描程式碼，生成 API 文件
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

🛑 **STOP**: 展示報告後等待使用者選擇要執行哪些更新

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
4. 根據 `output_language` 設定決定翻譯語言和風格

🛑 **STOP**: 展示翻譯結果後等待使用者確認寫入

### Stop Points | 停止點

| Stop Point | 等待內容 |
|-----------|---------|
| impact 報告展示後 | 選擇要執行哪些更新 |
| translate 結果展示後 | 確認翻譯內容寫入 |
| generate/readme/api 結果展示後 | 確認寫入 |

### Error Handling | 錯誤處理

| Error Condition | AI Action |
|-----------------|-----------|
| 子命令無效 | 列出可用子命令 |
| 目標目錄不存在 | 自動建立或詢問使用者 |
| 無程式碼可分析（api 子命令） | 告知並建議檢查路徑 |
| 無 git 歷史（impact 子命令） | 告知需要 git 初始化 |
| locales/ 目錄不存在（translate 子命令） | 告知專案未設定翻譯結構 |
| 源檔未變更（translate 子命令） | 告知翻譯已是最新 |

## References | 參考

*   [Documentation Guide Skill](../documentation-guide/SKILL.md)
*   [Core Standard](../../core/documentation-writing-standards.md)