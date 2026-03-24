---
source: ../../../../skills/commands/database.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-25
status: current
---

---
description: "[UDS] Guide database design, migration planning and query optimization"
allowed-tools: Read, Grep, Glob
argument-hint: "[schema or migration to review | 要審查的 schema 或遷移]"
---

# 資料庫助手

引導資料庫設計、遷移規劃和查詢最佳化。

## 工作流程

```
PLAN ──► WRITE ──► TEST ──► DEPLOY ──► VERIFY
```

## 使用方式

- `/database` - 開始互動式資料庫設計
- `/database schema` - 審查或設計 schema
- `/database --migration` - 規劃遷移

## AI Agent Behavior | AI 代理行為

> 遵循 [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### Entry Router | 進入路由

| 輸入 | AI 動作 |
|------|---------|
| `/database` | 詢問任務類型（schema 設計 / 遷移規劃 / 查詢優化） |
| `/database schema` | 進入 schema 設計/審查模式 |
| `/database --migration` | 進入遷移規劃模式 |

### Interaction Script | 互動腳本

1. 確認任務類型和目標
2. 分析現有 schema 或遷移檔案

**決策：任務類型**
- IF schema 設計 → 引導正規化、索引設計、關聯定義
- IF 遷移規劃 → 評估風險、產生遷移腳本、規劃回滾
- IF 查詢優化 → 分析慢查詢、建議索引

3. 展示設計/計畫結果

🛑 **STOP**: 結果展示後等待使用者確認

🛑 **STOP**: 遷移腳本寫入前等待使用者確認

### Stop Points | 停止點

| 停止點 | 等待內容 |
|--------|---------|
| 設計/計畫展示後 | 確認方案 |
| 遷移腳本生成後 | 確認寫入 |

### Error Handling | 錯誤處理

| 錯誤條件 | AI 動作 |
|----------|---------|
| 無法偵測資料庫類型 | 詢問使用者（PostgreSQL/MySQL/MongoDB 等） |
| 遷移存在資料遺失風險 | 明確警告，要求使用者確認 |

## 參考

- 完整標準：[database-assistant](../database-assistant/SKILL.md)
- 核心指南：[database-standards](../../core/database-standards.md)
