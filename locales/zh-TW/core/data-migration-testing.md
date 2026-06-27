---
source: ../../../core/data-migration-testing.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-06-27
source_hash: 2ddd76ee8654
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
| REQ-DMT-006 | 跨編碼或跨資料庫引擎的遷移必須包含位元組層編碼轉換測試 | 「看起來相等」會掩蓋 codepoint/normalization/collation 的損壞 |
| REQ-DMT-007 | business-critical 資料的遷移必須包含聚合不變量測試 | 逐列抽樣會錯過分佈層級的偏移 |

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

### 編碼轉換測試

當字串「看起來相等」時，綱要層與資料列層的測試都會通過——但底層的位元組可能已被跨編碼或跨引擎的搬移（UTF-8 → UTF-16/`NVARCHAR`、`VARCHAR` → `NVARCHAR`、隱含的 collation 變更）悄悄損壞。跨編碼或跨資料庫引擎的遷移**必須**在**位元組／codepoint／normalization** 層斷言相等，而非顯示層。

要斷言的內容：

- **位元組／codepoint 等同**——遷移後的值具有相同的 Unicode codepoint（且在目標以 UTF-16 儲存時，具有預期的單元數），而不只是相同的渲染字形。
- **Normalization 形式**——NFC vs NFD：`"é"`（U+00E9）與 `"e"+◌́`（U+0065 U+0301）渲染相同但位元組序列不同；斷言形式被保留（或被刻意正規化）。
- **多位元組邊界**——在來源依**字元**上限截斷的值，不得在目標被依**位元組**上限截斷（一個 4 位元組的 emoji 必須能存活於 `NVARCHAR(n)` 欄位）。
- **CJK／emoji／組合字**——明確測試輔助平面 codepoint（emoji、罕用 CJK）與組合序列；surrogate-pair 與 collation-folding 的 bug 就藏在這裡。

```typescript
it('preserves bytes across UTF-8 -> target encoding (no display-only equality)', async () => {
  // 混合 BMP CJK、一個輔助平面 emoji，以及一個 NFD 組合序列
  const samples = [
    '繁體中文',           // CJK (BMP)
    '😀 family 👨‍👩‍👧',     // emoji 含 ZWJ 序列（輔助平面）
    'é'             // NFD：'e' + 組合銳音符（渲染如 'é'）
  ]
  samples.forEach((s, i) =>
    db.prepare('INSERT INTO notes (id, body) VALUES (?, ?)').run(i, s))

  await migrate.up(db)

  samples.forEach((expected, i) => {
    const row = db.prepare('SELECT body FROM notes WHERE id = ?').get(i) as { body: string }
    // ❌ 反模式：expect(row.body).toBe(expected)  // 即使部分損壞，只要兩者渲染相同就會通過
    // ✅ 在位元組與 codepoint 層斷言：
    expect(Buffer.from(row.body, 'utf8')).toEqual(Buffer.from(expected, 'utf8'))
    expect([...row.body]).toEqual([...expected])                 // 逐 codepoint 比對
    expect(row.body.normalize('NFC')).toBe(expected.normalize('NFC')) // 明確的正規化意圖
  })
})
```

> **反模式**：只對解碼後的字串斷言 `expect(actual).toBe(expected)`。兩個不同的位元組／normalization 序列可解碼為*看起來*相同的字形，因此顯示層斷言會通過，而儲存的位元組（以及任何下游的 `LIKE`／unique-key／collation 行為）卻已損壞。

### 聚合不變量測試

資料列抽樣能證明個別資料列存活；它**無法**證明*分佈*存活。植入有代表性的資料集，在遷移**前**對 business-critical 欄位擷取聚合不變量，並在遷移**後**斷言其不變。這與 post-cutover 生產對帳所用的 oracle 相同（聚合相等跨越 cutover 邊界），只是在遷移測試期就跑。

要擷取的不變量：`COUNT(*)`、`SUM(money_column)`、`COUNT(DISTINCT key)`，以及依業務維度（如 status 或 period）分組的內容 `checksum`（例如雜湊總和）。

```typescript
it('preserves aggregate invariants over financial data', async () => {
  seedRepresentativeOrders(db) // 各種 status、金額、幣別

  const invariantQuery = `
    SELECT status,
           COUNT(*)            AS cnt,
           SUM(amount_cents)   AS total_cents,
           COUNT(DISTINCT customer_id) AS distinct_customers
    FROM orders
    GROUP BY status
    ORDER BY status`
  const before = db.prepare(invariantQuery).all()

  await migrate.up(db)

  const after = db.prepare(invariantQuery).all()
  // 分佈必須完全一致——而非只是「還有一些資料列存在」
  expect(after).toEqual(before)
})
```

> 因為聚合把整張表收斂成幾個數字，一個不符的 `SUM`／`COUNT` 就能標出偏移；而逐列抽樣——只檢查你剛好挑到的資料列——會完全錯過它。

## 跨方言遷移：SQLite → SQL Server 風險表

當遷移同時改變資料庫引擎（不只綱要）時，來源與目標方言在型別語義、比較與排序上會分歧。下表每一項分歧都是資料可能悄悄改變意義之處，也是上述編碼與聚合測試（以及 reverse-engineering-standards.md 中非 HTTP 隱含規則掃描）的 derive 清單輸入。

| 風險點 | SQLite | SQL Server | 遷移須驗 |
|---|---|---|---|
| **型別系統** | 動態型別（值層 type affinity） | 靜態／強型別 | 每欄宣告型別；掃描 SQLite 容忍的越界／混型別值 |
| **布林** | 通常存成 `0/1` 整數 | `BIT` | `0/1` ↔ `BIT` 對映；NULL 布林的處理 |
| **日期時間** | 常存為 `TEXT`／`REAL`／`INTEGER` | `datetime2`／`datetimeoffset` | 格式解析、時區處理、精度截斷 |
| **自增主鍵** | `AUTOINCREMENT` | `IDENTITY` | 既有 id 連續性；正確的 seed/reseed 值 |
| **大小寫／collation** | `LIKE` 預設大小寫不敏感；`NOCASE` | 由欄位 collation 決定 | 對齊 collation；檢查 unique-key 折疊衝突 |
| **NULL 排序** | NULL 排最前（最小） | 依設定而定 | `ORDER BY` 結果順序不變量跨引擎 |
| **浮點精度** | `REAL` | `float`／`decimal` | 金額／精確值改用 `decimal` 避免捨入誤差 |
| **字串串接** | `\|\|` | `+`／`CONCAT` | 改寫查詢；對齊 NULL 串接語義 |
| **分頁** | `LIMIT`／`OFFSET` | `OFFSET .. FETCH`／`TOP` | 改寫 + 保證穩定排序鍵以取得確定性分頁 |

> 每個「查詢改寫／語義差異」格也可能藏一條**隱含業務規則**——把本表餵入反向工程的隱含規則掃描階段。

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
- **只對解碼後的值斷言字串相等** — 即使位元組、normalization 形式或 codepoint 在跨編碼/跨引擎變更中已損壞，顯示層相等仍會通過
- **僅以資料列抽樣驗證跨引擎遷移** — 分佈層級的偏移（錯誤的 `SUM`／`COUNT`／`DISTINCT`）會逃過任何剛好錯過受影響資料列的抽樣

## 參閱

- `database-standards.ai.yaml` — 綱要設計原則
- `testing.ai.yaml` — 通用測試結構與金字塔
- `verification-evidence.ai.yaml` — 稽核證據需求

---

**Scope**: universal
