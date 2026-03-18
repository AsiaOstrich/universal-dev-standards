# [SPEC-STD-04] Database Standards — 新增核心標準

## Status: Implemented
## Created: 2026-03-18 (retroactive)
## Implemented: 2026-03-18

---

## Summary

新增 Database Standards 核心標準，填補 UDS 在資料庫設計領域的覆蓋缺口。涵蓋 Schema 設計、遷移策略、索引、查詢最佳化、交易管理、SQL vs NoSQL 決策、敏感資料處理等。

## Motivation

- 資料庫設計是基礎 SE 實踐，影響效能、安全、可維護性
- UDS 完全缺乏資料庫相關標準，屬於 P0 優先級缺口
- 已有 Deployment Standards（含簡要 DB 遷移提及）和 Security Standards（含資料加密），但缺乏完整的資料庫設計指導

## Scope

| 面向 | 包含 |
|------|------|
| Schema 設計 | 正規化（1NF-3NF）、反正規化決策矩陣、命名慣例 |
| 資料型別 | 適當型別選擇、UUID vs auto-increment |
| 索引策略 | 複合索引順序、覆蓋索引、反模式 |
| 遷移策略 | 版本控制遷移、Zero-downtime（expand-contract）、rollback |
| 查詢最佳實踐 | N+1 防範、EXPLAIN、分頁、參數化查詢 |
| 交易管理 | ACID、隔離層級、死鎖預防、樂觀/悲觀鎖定 |
| SQL vs NoSQL | 決策矩陣（關聯/文件/鍵值/圖形） |
| 連線管理 | 連線池、大小公式、超時配置 |
| 資料完整性 | 約束、級聯規則、軟刪除 vs 硬刪除 |
| 備份與復原 | RPO/RTO、完整/增量/差異備份 |
| 敏感資料 | 欄位加密、資料遮蔽、PII 管理 |
| 效能監控 | 慢查詢、查詢計畫、關鍵指標 |

## Files Changed

| File | Action | Description |
|------|--------|-------------|
| `core/database-standards.md` | Created | 英文主版本（828 行） |
| `.standards/database-standards.ai.yaml` | Created | AI 最佳化 YAML（220 行） |
| `ai/standards/database-standards.ai.yaml` | Created | ai/ 目錄副本 |
| `locales/zh-TW/core/database-standards.md` | Created | 繁體中文翻譯 |
| `cli/standards-registry.json` | Modified | 新增 registry 登錄 |
| `.standards/manifest.json` | Modified | 新增 manifest 項目 |

## Acceptance Criteria

- [x] AC-1: Given the core standards collection, When database-standards.md is added, Then it follows the standard template format.
- [x] AC-2: Given the new standard, When scope is evaluated, Then it is marked as `universal`.
- [x] AC-3: Given the standard content, When reviewed, Then it covers schema design, migration, indexing, transactions, and SQL vs NoSQL with decision matrices and SQL code examples.
- [x] AC-4: Given the AI-optimized version, When created, Then it contains structured rules, quick_reference tables, and meta information.
- [x] AC-5: Given the zh-TW translation, When synced, Then the frontmatter reflects source_version=1.0.0 and status=current.
- [x] AC-6: Given all sync scripts, When `check-standards-sync.sh` and `check-translation-sync.sh` are run, Then all checks pass.

## Industry Standards Referenced

- ISO/IEC 9075 (SQL)
- ACID Properties
- BASE Theorem
