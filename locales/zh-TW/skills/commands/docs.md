---
source: ../../../../skills/commands/docs.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-19
---

---
name: docs
description: [UDS] Manage, guide, and generate documentation.
argument-hint: "[generate|readme|api] [options]"
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
| `generate` | 產生文件工件（速查表、參考手冊） |
| `readme` | 稽核並更新 README.md |
| `api` | 從程式碼產生 API 文件 |
| `structure` | 檢查文件目錄結構 |
| `（無）` | 顯示文件指南/狀態 |

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
# 產生所有文件
/docs generate

# 產生繁體中文文件
/docs generate --lang zh-TW

# 更新 README
/docs readme

# 檢查文件結構
/docs structure
```

## 參考

*   [文件指南技能](../documentation-guide/SKILL.md)
*   [核心規範](../../core/documentation-writing-standards.md)
