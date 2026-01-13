---
source: ../../../../integrations/spec-kit/README.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-01-13
status: current
---

# Spec Kit 整合

本目錄包含 [Spec Kit](https://github.com/spec-kit/spec-kit) 的整合檔案，這是一個用於規格驅動開發的輕量級規格追蹤工具。

## 檔案

| 檔案 | 說明 |
|------|------|
| `AGENTS.md` | 使用 Spec Kit 的 AI 助手指令 |

## 使用方式

### 手動安裝

將 `AGENTS.md` 複製到您的專案，或將其內容包含在 AI 助手的系統指令中。

### 搭配 Claude Code

如果使用 Claude Code，您可以在 `CLAUDE.md` 中引用此檔案：

```markdown
## 規格驅動開發

本專案使用 Spec Kit 進行規格管理。請遵循以下指南：
- [Spec Kit 指令](integrations/spec-kit/AGENTS.md)
```

## 相關資源

- [OpenSpec 整合](../openspec/) - 替代的 SDD 工具整合
- [規格驅動開發標準](../../core/spec-driven-development.md) - SDD 方法論

## 注意事項

Spec Kit 和 OpenSpec 是**規格驅動開發工具**，不是 AI 編碼助手。它們不包含在 `uds init` 的 AI 工具選擇中，但可以根據需要手動整合。
