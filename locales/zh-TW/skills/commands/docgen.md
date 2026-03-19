---
source: ../../../../skills/commands/docgen.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-19
---

---
name: docgen
description: "[UDS] Generate usage documentation from project sources"
argument-hint: "[config file | 設定檔]"
---

# 文件產生器

> **Language**: [English](../../../../skills/commands/docgen.md) | 繁體中文

從專案原始檔案產生使用文件（速查表、參考手冊、使用指南）。

## 用法

```bash
/docgen [config file]
```

## 工作流程

1. **讀取設定** - 載入 `.usage-docs.yaml`（或指定的設定檔）
2. **掃描來源** - 讀取原始檔案、指令和技能定義
3. **萃取內容** - 從來源解析說明、選項、範例
4. **產生文件** - 以設定的格式輸出
5. **寫入輸出** - 將產生的檔案儲存到設定的輸出目錄

## 輸出類型

| 類型 | 說明 |
|------|------|
| **cheatsheet** | 速查表，列出命令與快捷方式 |
| **reference** | 完整功能參考手冊含所有選項 |
| **usage-guide** | 新手入門的逐步使用指南 |

## 範例

```bash
/docgen                          # 使用預設 .usage-docs.yaml 產生文件
/docgen .usage-docs.yaml         # 從指定設定檔產生文件
/docgen --format cheatsheet      # 僅產生速查表
```

## 設定檔格式

```yaml
# .usage-docs.yaml
output_dir: docs/generated/
formats:
  - cheatsheet
  - reference
sources:
  - path: skills/commands/
    type: commands
  - path: cli/src/commands/
    type: cli
language: [en, zh-TW]
```

## 參考

*   [文件產生器技能](../docs-generator/SKILL.md)
