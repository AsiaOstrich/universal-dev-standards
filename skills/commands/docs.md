---
name: docs
description: [UDS] Manage, guide, and generate documentation.
argument-hint: "[generate|readme|api] [options]"
---

# /docs Command | /docs 命令

Manage, write, and generate project documentation.

管理、撰寫和生成專案文件。

## Usage | 用法

```bash
/docs [subcommand] [options]
```

### Subcommands | 子命令

| Subcommand | Description |
|------------|-------------|
| `generate` | Generate documentation artifacts (cheatsheets, reference) |
| `readme` | Audit and update README.md |
| `api` | Generate API documentation from code |
| `structure` | Check documentation folder structure |
| `(none)` | Show documentation guide/status |

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
# Generate all docs
/docs generate

# Generate Traditional Chinese docs
/docs generate --lang zh-TW

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
| `/docs generate` | 生成文件工件（速查表、參考手冊） |
| `/docs generate --lang <lang>` | 生成指定語言的文件 |
| `/docs readme` | 審計並更新 README.md |
| `/docs api` | 從程式碼生成 API 文件 |
| `/docs structure` | 檢查文件目錄結構是否符合規範 |

### Interaction Script | 互動腳本

**Decision: 子命令分派**
- IF `generate` → 執行 `/docgen` 的生成流程
- IF `readme` → 分析 README 完整性，建議更新
- IF `api` → 掃描程式碼，生成 API 文件
- IF `structure` → 檢查目錄結構，報告缺失
- IF 無子命令 → 展示文件狀態總覽

🛑 **STOP**: 生成結果展示後等待使用者確認寫入（僅 generate / readme / api 子命令）

### Stop Points | 停止點

| Stop Point | 等待內容 |
|-----------|---------|
| 生成結果展示後 | 確認寫入（generate / readme / api） |

### Error Handling | 錯誤處理

| Error Condition | AI Action |
|-----------------|-----------|
| 子命令無效 | 列出可用子命令 |
| 目標目錄不存在 | 自動建立或詢問使用者 |
| 無程式碼可分析（api 子命令） | 告知並建議檢查路徑 |

## References | 參考

*   [Documentation Guide Skill](../documentation-guide/SKILL.md)
*   [Core Standard](../../core/documentation-writing-standards.md)