---
source: ../../../core/data-migration-testing.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-06-10
source_hash: cc35f3fcd7ec
status: current
---

# 資料遷移測試

> **Language**: [English](../../../core/data-migration-testing.md) | 繁體中文

---

## 概述

資料庫綱要遷移（schema migration）是高風險操作：它以難以輕易復原的方式改變持久化資料，除非有經過測試的回滾路徑。完整的遷移測試套件需驗證三個面向——正確性（up 可乾淨套用）、安全性（down 能還原狀態），以及健壯性（套用兩次無害）。

## 需求摘要

| ID | 規則 | 理由 |
|----|------|------|
| REQ-DMT-001 | 每個遷移都必須有 up 測試 | 未驗證的遷移會損壞生產環境綱要 |
| REQ-DMT-002 | 每個具備 down 函式的遷移都必須有回滾測試 | 未測試的回滾在事故期間會失敗 |
| REQ-DMT-003 | 對同一遷移套用兩次不得失敗 | CI 重試可能觸發重複套用 |
| REQ-DMT-004 | 變更資料的遷移必須包含資料保存測試 | 綱要正確性 ≠ 資料正確性 |
| REQ-DMT-005 | 每個測試必須使用隔離資料庫 | 共用狀態會導致非確定性失敗 |

## 測試結構

### 隔離

每個遷移測試都在隔離的資料庫上執行——無論是記憶體資料庫（SQLite `:memory:`）或全新的 Docker 容器（PostgreSQL）。絕對不要對共用的開發或暫存資料庫執行遷移測試。

```typescript
// 正確：每個測試檔案使用隔離的記憶體資料庫
const db = new Database(':memory:')
await applyBaseline(db)

// 錯誤：測試共用一個開發資料庫
const db = openDatabase(process.env.DATABASE_URL)
```

### Up 測試

將遷移套用到基準綱要，並斷言預期的套用後狀態。

```typescript
it('adds email column to users table', async () => {
  await migrate.up(db)
  const columns = db.prepare("PRAGMA table_info(users)").all()
  expect(columns.map(c => c.name)).toContain('email')
})
```

### Down 測試（回滾）

先套用 up，再套用 down，並斷言綱要回到遷移前的狀態。

```typescript
it('rollback removes email column', async () => {
  await migrate.up(db)
  await migrate.down(db)
  const columns = db.prepare("PRAGMA table_info(users)").all()
  expect(columns.map(c => c.name)).not.toContain('email')
})
```

### 冪等性測試

套用遷移兩次，第二次套用不得拋出例外。

```typescript
it('applying migration twice is safe', async () => {
  await migrate.up(db)
  await expect(migrate.up(db)).resolves.not.toThrow()
})
```

### 資料保存測試

在遷移前先插入資料列，在遷移後斷言資料完整性。

```typescript
it('preserves existing user rows', async () => {
  db.prepare("INSERT INTO users (id, name) VALUES (1, 'Alice')").run()
  await migrate.up(db)
  const user = db.prepare("SELECT * FROM users WHERE id = 1").get()
  expect(user.name).toBe('Alice')
})
```

## 工具

### SQLite / Drizzle ORM

```typescript
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'

const sqlite = new Database(':memory:')
const db = drizzle(sqlite)
await migrate(db, { migrationsFolder: './drizzle' })
```

### PostgreSQL

使用 `testcontainers` 為每個測試套件啟動一個全新的 PostgreSQL 容器。容器在套件結束後銷毀，確保隔離性。

## 反模式

- **對共用資料庫進行測試** — 造成跨測試污染、不可重複的建置結果
- **跳過 down 遷移測試** — 回滾在生產事故中失敗
- **事後撰寫遷移測試且未預先植入資料** — 完全錯過資料保存的 bug
- **提交遷移卻沒有對應的測試** — 遷移在進入生產前完全未被測試

## 參閱

- `database-standards.ai.yaml` — 綱要設計原則
- `testing.ai.yaml` — 通用測試結構與金字塔
- `verification-evidence.ai.yaml` — 稽核證據需求

---

**Scope**: universal
