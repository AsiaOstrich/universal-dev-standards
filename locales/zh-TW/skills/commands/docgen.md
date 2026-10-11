---
source: ../../../../skills/commands/docgen.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: fd0be3c2b60b
status: current
---

---
name: docgen
description: "[UDS] 從專案原始檔產生使用文件"
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

## AI 代理行為

> 遵循 [AI 命令行為標準](../../core/ai-command-behavior.md)

### 進入路由

| 輸入 | AI 動作 |
|------|---------|
| `/docgen` | 尋找預設設定檔 `.usage-docs.yaml`，找到則使用，否則詢問 |
| `/docgen <config>` | 使用指定設定檔 |
| `/docgen --format <type>` | 僅產生指定格式（cheatsheet / reference / usage-guide） |

### 互動腳本

1. 載入設定檔，解析來源和輸出設定
2. 掃描來源檔案，擷取描述、選項、範例
3. 依設定的格式產生文件
4. 展示產生的檔案清單和預覽

🛑 **STOP**：展示產生結果後等待使用者確認寫入

### 停止點

| 停止點 | 等待內容 |
|--------|---------|
| 文件產生後 | 確認內容正確並寫入 |

### 錯誤處理

| 錯誤條件 | AI 動作 |
|----------|---------|
| 設定檔不存在 | 建議建立 `.usage-docs.yaml`，提供範本 |
| 來源目錄為空 | 告知無內容可擷取，列出已掃描的路徑 |
| 輸出目錄不存在 | 自動建立目錄 |

## 參考

*   [文件產生器技能](../docs-generator/SKILL.md)
