---
description: "[UDS] Guide database design, migration planning and query optimization"
allowed-tools: Read, Grep, Glob
argument-hint: "[schema or migration to review | 要審查的 schema 或遷移]"
---

# Database Assistant | 資料庫助手

Guide database design, migration planning and query optimization.

引導資料庫設計、遷移規劃和查詢最佳化。

## Workflow | 工作流程

```
PLAN ──► WRITE ──► TEST ──► DEPLOY ──► VERIFY
```

## Usage | 使用方式

- `/database` - Start interactive database design
- `/database schema` - Review or design schema
- `/database --migration` - Plan migration

## AI Agent Behavior | AI 代理行為

> Follows [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### Entry Router | 進入路由

| Input | AI Action |
|-------|-----------|
| `/database` | 詢問任務類型（schema 設計 / 遷移規劃 / 查詢優化） |
| `/database schema` | 進入 schema 設計/審查模式 |
| `/database --migration` | 進入遷移規劃模式 |

### Interaction Script | 互動腳本

1. 確認任務類型和目標
2. 分析現有 schema 或遷移檔案

**Decision: 任務類型**
- IF schema 設計 → 引導正規化、索引設計、關聯定義
- IF 遷移規劃 → 評估風險、產生遷移腳本、規劃回滾
- IF 查詢優化 → 分析慢查詢、建議索引

3. 展示設計/計畫結果

🛑 **STOP**: 結果展示後等待使用者確認

🛑 **STOP**: 遷移腳本寫入前等待使用者確認

### Stop Points | 停止點

| Stop Point | 等待內容 |
|-----------|---------|
| 設計/計畫展示後 | 確認方案 |
| 遷移腳本生成後 | 確認寫入 |

### Error Handling | 錯誤處理

| Error Condition | AI Action |
|-----------------|-----------|
| 無法偵測資料庫類型 | 詢問使用者（PostgreSQL/MySQL/MongoDB 等） |
| 遷移存在資料遺失風險 | 明確警告，要求使用者確認 |

## Reference | 參考

- Full standard: [database-assistant](../database-assistant/SKILL.md)
- Core guide: [database-standards](../../core/database-standards.md)
