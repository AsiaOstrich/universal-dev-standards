---
source: ../../../../skills/docs-generator/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-02-10
status: current
description: |
  從專案原始檔案產生使用文件（速查表、參考手冊、使用指南）。
  使用時機：產生文件、建立速查表、產生參考手冊。
  關鍵字：docgen, documentation, cheatsheet, reference, 文件產生, 速查表, 參考手冊。
---

# 文件產生器

> **語言**: [English](../../../../skills/docs-generator/SKILL.md) | 繁體中文

從專案原始檔案產生使用文件（速查表、參考手冊、使用指南）。

## 工作流程

1. **讀取設定** - 載入 `.usage-docs.yaml`（或指定的設定檔）
2. **掃描來源** - 讀取原始碼檔案、命令和技能定義
3. **提取內容** - 從原始碼解析描述、選項、範例
4. **產生文件** - 以設定的格式產生輸出
5. **寫入輸出** - 將產生的檔案儲存到設定的輸出目錄

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

## 輸出類型

| 類型 | 說明 |
|------|------|
| **cheatsheet** | 速查表，包含命令和快捷鍵 |
| **reference** | 完整功能參考手冊，包含所有選項 |
| **usage-guide** | 新手入門使用指南 |

## 使用方式

- `/docgen` - 使用預設的 `.usage-docs.yaml` 產生文件
- `/docgen .usage-docs.yaml` - 從指定的設定檔產生文件
- `/docgen --format cheatsheet` - 僅產生速查表

## 參考

- 詳細指南：[guide.md](./guide.md)
