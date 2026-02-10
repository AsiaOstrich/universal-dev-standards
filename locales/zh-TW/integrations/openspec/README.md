---
source: ../../../../integrations/openspec/README.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-01-13
status: current
---

# OpenSpec 整合

本目錄包含 [OpenSpec](https://github.com/openspec) 的整合檔案，這是一個用於規格驅動開發的規格管理工具。

## 檔案

| 檔案 | 說明 |
|------|------|
| `AGENTS.md` | 使用 OpenSpec 的 AI 助手完整指令 |

## 使用方式

### 手動安裝

將 `AGENTS.md` 複製到專案的 `openspec/` 目錄，或將其內容包含在 AI 助手的系統指令中。

### 搭配 Claude Code

如果使用 Claude Code，您可以在 `CLAUDE.md` 中引用此檔案：

```markdown
## 規格驅動開發

本專案使用 OpenSpec 進行規格管理。請遵循以下指南：
- [OpenSpec 指令](openspec/AGENTS.md)
```

## 相關資源

- [Spec Kit 整合](../spec-kit/) - 替代的輕量級 SDD 工具
- [規格驅動開發標準](../../core/spec-driven-development.md) - SDD 方法論

## 注意事項

OpenSpec 和 Spec Kit 是**規格驅動開發工具**，不是 AI 編碼助手。它們不包含在 `uds init` 的 AI 工具選擇中，但可以根據需要手動整合。
