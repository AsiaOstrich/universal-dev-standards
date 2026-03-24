---
name: database
scope: universal
description: |
  Guide database design, migration, and query optimization.
  Use when: schema design, migration planning, query optimization, index strategy.
  Keywords: database, schema, migration, SQL, index, query, 資料庫, 遷移, 查詢.
allowed-tools: Read, Grep, Glob
argument-hint: "[schema or migration to review | 要審查的 schema 或遷移]"
---

# Database Assistant | 資料庫助手

Guide database design, migration planning, and query optimization.

引導資料庫設計、遷移規劃和查詢最佳化。

## Core Principles | 核心原則

| Principle | Description | 說明 |
|-----------|-------------|------|
| Normalization | Eliminate redundancy (3NF minimum) | 消除冗餘（至少 3NF） |
| Referential Integrity | Enforce FK constraints | 強制外鍵約束 |
| Index Strategy | Index query patterns, not all columns | 依查詢模式建立索引 |
| Migration Safety | Always reversible, zero-downtime | 可逆、零停機 |
| Data Protection | Encrypt sensitive fields, audit access | 加密敏感欄位、稽核存取 |

## Schema Design Checklist | Schema 設計檢查清單

- [ ] Primary keys defined (prefer UUID or BIGINT) | 主鍵已定義
- [ ] Foreign keys with proper ON DELETE/UPDATE | 外鍵含適當的級聯策略
- [ ] NOT NULL constraints on required fields | 必填欄位加 NOT NULL
- [ ] Indexes on frequently queried columns | 常查詢欄位建立索引
- [ ] Created/Updated timestamps on all tables | 所有表加建立/更新時間戳
- [ ] Sensitive data encrypted at rest | 敏感資料靜態加密
- [ ] Naming conventions consistent (snake_case) | 命名慣例一致（snake_case）

## Normalization Quick Reference | 正規化快速參考

| Normal Form | Rule | 規則 |
|-------------|------|------|
| **1NF** | Atomic values, no repeating groups | 原子值、無重複群組 |
| **2NF** | 1NF + no partial dependencies | 1NF + 無部分相依 |
| **3NF** | 2NF + no transitive dependencies | 2NF + 無遞移相依 |
| **Denormalize** | Only for proven read performance needs | 僅針對已證實的讀取效能需求 |

## Migration Workflow | 遷移工作流程

```
PLAN ──► WRITE ──► TEST ──► DEPLOY ──► VERIFY
```

### 1. Plan — Assess Impact | 評估影響
Identify affected tables, estimate data volume, plan rollback strategy.

識別受影響的表、估算資料量、規劃回滾策略。

### 2. Write — Create Migration | 撰寫遷移
Write forward and rollback scripts. Use incremental, numbered migrations.

撰寫正向和回滾腳本。使用遞增編號的遷移。

### 3. Test — Validate Migration | 驗證遷移
Run on staging with production-like data. Verify data integrity post-migration.

在 staging 環境使用類生產資料執行。驗證遷移後資料完整性。

### 4. Deploy — Execute Migration | 執行遷移
Apply during maintenance window or use online schema change tools.

在維護窗口執行，或使用線上 Schema 變更工具。

### 5. Verify — Confirm Success | 確認成功
Check row counts, constraint validity, application functionality.

檢查列數、約束有效性、應用程式功能。

## Index Strategy | 索引策略

| Type | Use Case | 使用場景 |
|------|----------|----------|
| B-tree | Equality, range queries (default) | 等值、範圍查詢（預設） |
| Hash | Exact match only | 僅精確匹配 |
| GIN | Full-text search, JSONB | 全文搜尋、JSONB |
| Partial | Filtered subsets | 過濾子集 |
| Composite | Multi-column queries | 多欄位查詢 |

## Usage | 使用方式

```
/database                - Interactive database design guide | 互動式資料庫設計引導
/database schema         - Review schema design | 審查 Schema 設計
/database --migration    - Migration planning assistant | 遷移規劃助手
```

## Next Steps Guidance | 下一步引導

After `/database` completes, the AI assistant should suggest:

> **資料庫設計完成。建議下一步 / Database design complete. Suggested next steps:**
> - 執行 `/security` 檢查資料保護措施 — Check data protection measures
> - 執行 `/testing` 規劃資料庫測試策略 — Plan database testing strategy
> - 執行 `/checkin` 確認遷移符合提交規範 — Verify migrations meet check-in standards
> - 產生 API 端點 → 執行 `/api-design` — Generate API endpoints → Run `/api-design`

## Reference | 參考

- Core standard: [database-standards.md](../../core/database-standards.md)

## Version History | 版本歷史

| Version | Date | Changes | 變更說明 |
|---------|------|---------|----------|
| 1.0.0 | 2026-03-23 | Initial release | 初始版本 |

## License | 授權

CC BY 4.0 — Documentation content
