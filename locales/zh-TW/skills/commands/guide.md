---
source: ../../../../skills/commands/guide.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-19
---

---
name: guide
description: [UDS] Access Universal Development Standards guides and references.
---

# /guide 命令

> **Language**: [English](../../../../skills/commands/guide.md) | 繁體中文

`/guide` 命令是存取所有 Universal Development Standards 參考資料和指南的中央入口。

## 用法

```bash
/guide [topic]
```

## 可用主題

| 主題 | 說明 | 來源 |
|------|------|------|
| `git` | Git 工作流程與分支策略 | `skills/git-workflow-guide/` |
| `testing` | 測試金字塔與策略 | `skills/testing-guide/` |
| `errors` | 錯誤碼設計標準 | `skills/error-code-guide/` |
| `logging` | 結構化日誌標準 | `skills/logging-guide/` |
| `structure` | 專案結構慣例 | `skills/project-structure-guide/` |
| `ai-arch` | AI 友善架構 | `skills/ai-friendly-architecture/` |
| `ai-collab` | AI 協作與反幻覺 | `skills/ai-collaboration-standards/` |
| `ai-instruct` | AI 指令檔案標準 | `skills/ai-instruction-standards/` |

## 範例

- `/guide git` - 顯示 Git 分支與命名慣例
- `/guide testing` - 顯示測試金字塔與最佳實踐
- `/guide structure` - 顯示建議的專案目錄結構
- `/guide` - 列出所有可用指南

## AI 實作注意事項

當使用者調用 `/guide [topic]` 時：
1.  識別請求的主題。
2.  讀取對應的標準/技能檔案（例如 `skills/git-workflow-guide/SKILL.md`）。
3.  向使用者摘要或呈現該檔案的關鍵資訊。
4.  如果主題缺失或無效，列出可用的主題清單。
