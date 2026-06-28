---
source: ../../../core/data-migration-testing.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-06-28
source_hash: 990309b5e8b1
status: current
---

# 数据迁移测试

> **Language**: [English](../../../core/data-migration-testing.md) | [繁體中文](../../zh-TW/core/data-migration-testing.md) | 简体中文

---

## 概述

数据库模式迁移（schema migration）是高风险操作：它以难以轻易恢复的方式改变持久化数据，除非存在经过测试的回滚路径。完整的迁移测试套件需验证三个维度——正确性（up 可干净应用）、安全性（down 能还原状态），以及健壮性（应用两次无害）。

## 需求摘要

| ID | 规则 | 理由 |
|----|------|------|
| REQ-DMT-001 | 每个迁移都必须有 up 测试 | 未验证的迁移会损坏生产环境模式 |
| REQ-DMT-002 | 每个具备 down 函数的迁移都必须有回滚测试 | 未测试的回滚在事故期间会失败 |
| REQ-DMT-003 | 对同一迁移应用两次不得失败 | CI 重试可能触发重复应用 |
| REQ-DMT-004 | 变更数据的迁移必须包含数据保存测试 | 模式正确性 ≠ 数据正确性 |
| REQ-DMT-005 | 每个测试必须使用隔离数据库 | 共享状态会导致非确定性失败 |
| REQ-DMT-006 | 跨编码或跨数据库引擎的迁移必须包含字节层编码转换测试 | 「看起来相等」会掩盖 codepoint/normalization/collation 的损坏 |
| REQ-DMT-007 | business-critical 数据的迁移必须包含聚合不变量测试 | 逐行抽样会错过分布层级的偏移 |

## 测试结构

### 隔离

每个迁移测试都在隔离的数据库上执行——无论是内存数据库（SQLite `:memory:`）还是全新的 Docker 容器（PostgreSQL）。绝对不要对共享的开发或预发布数据库执行迁移测试。

```typescript
// 正确：每个测试文件使用隔离的内存数据库
const db = new Database(':memory:')
await applyBaseline(db)

// 错误：测试共享一个开发数据库
const db = openDatabase(process.env.DATABASE_URL)
```

### Up 测试

将迁移应用到基准模式，并断言预期的应用后状态。

```typescript
it('adds email column to users table', async () => {
  await migrate.up(db)
  const columns = db.prepare("PRAGMA table_info(users)").all()
  expect(columns.map(c => c.name)).toContain('email')
})
```

### Down 测试（回滚）

先应用 up，再应用 down，并断言模式回到迁移前的状态。

```typescript
it('rollback removes email column', async () => {
  await migrate.up(db)
  await migrate.down(db)
  const columns = db.prepare("PRAGMA table_info(users)").all()
  expect(columns.map(c => c.name)).not.toContain('email')
})
```

### 幂等性测试

应用迁移两次，第二次应用不得抛出异常。

```typescript
it('applying migration twice is safe', async () => {
  await migrate.up(db)
  await expect(migrate.up(db)).resolves.not.toThrow()
})
```

### 数据保存测试

在迁移前先插入数据行，在迁移后断言数据完整性。

```typescript
it('preserves existing user rows', async () => {
  db.prepare("INSERT INTO users (id, name) VALUES (1, 'Alice')").run()
  await migrate.up(db)
  const user = db.prepare("SELECT * FROM users WHERE id = 1").get()
  expect(user.name).toBe('Alice')
})
```

### 编码转换测试

当字符串「看起来相等」时，模式层与数据行层的测试都会通过——但底层的字节可能已被跨编码或跨引擎的搬移（UTF-8 → UTF-16/`NVARCHAR`、`VARCHAR` → `NVARCHAR`、隐含的 collation 变更）悄悄损坏。跨编码或跨数据库引擎的迁移**必须**在**字节／codepoint／normalization** 层断言相等，而非显示层。

要断言的内容：

- **字节／codepoint 等同**——迁移后的值具有相同的 Unicode codepoint（且在目标以 UTF-16 储存时，具有预期的单元数），而不只是相同的渲染字形。
- **Normalization 形式**——NFC vs NFD：`"é"`（U+00E9）与 `"e"+◌́`（U+0065 U+0301）渲染相同但字节序列不同；断言形式被保留（或被刻意正规化）。
- **多字节边界**——在来源依**字符**上限截断的值，不得在目标被依**字节**上限截断（一个 4 字节的 emoji 必须能存活于 `NVARCHAR(n)` 栏位）。
- **CJK／emoji／组合字**——明确测试辅助平面 codepoint（emoji、罕用 CJK）与组合序列；surrogate-pair 与 collation-folding 的缺陷就藏在这里。

```typescript
it('preserves bytes across UTF-8 -> target encoding (no display-only equality)', async () => {
  // 混合 BMP CJK、一个辅助平面 emoji，以及一个 NFD 组合序列
  const samples = [
    '繁體中文',           // CJK (BMP)
    '😀 family 👨‍👩‍👧',     // emoji 含 ZWJ 序列（辅助平面）
    'é'             // NFD：'e' + 组合锐音符（渲染如 'é'）
  ]
  samples.forEach((s, i) =>
    db.prepare('INSERT INTO notes (id, body) VALUES (?, ?)').run(i, s))

  await migrate.up(db)

  samples.forEach((expected, i) => {
    const row = db.prepare('SELECT body FROM notes WHERE id = ?').get(i) as { body: string }
    // ❌ 反模式：expect(row.body).toBe(expected)  // 即使部分损坏，只要两者渲染相同就会通过
    // ✅ 在字节与 codepoint 层断言：
    expect(Buffer.from(row.body, 'utf8')).toEqual(Buffer.from(expected, 'utf8'))
    expect([...row.body]).toEqual([...expected])                 // 逐 codepoint 比对
    expect(row.body.normalize('NFC')).toBe(expected.normalize('NFC')) // 明确的正规化意图
  })
})
```

> **反模式**：只对解码后的字符串断言 `expect(actual).toBe(expected)`。两个不同的字节／normalization 序列可解码为*看起来*相同的字形，因此显示层断言会通过，而储存的字节（以及任何下游的 `LIKE`／unique-key／collation 行为）却已损坏。

### 聚合不变量测试

数据行抽样能证明个别数据行存活；它**无法**证明*分布*存活。填充有代表性的数据集，在迁移**前**对 business-critical 栏位撷取聚合不变量，并在迁移**后**断言其不变。这与 post-cutover 生产对账所用的 oracle 相同（聚合相等跨越 cutover 边界），只是在迁移测试期就跑。

要撷取的不变量：`COUNT(*)`、`SUM(money_column)`、`COUNT(DISTINCT key)`，以及依业务维度（如 status 或 period）分组的内容 `checksum`（例如哈希总和）。

```typescript
it('preserves aggregate invariants over financial data', async () => {
  seedRepresentativeOrders(db) // 各种 status、金额、币别

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
  // 分布必须完全一致——而非只是「还有一些数据行存在」
  expect(after).toEqual(before)
})
```

> 因为聚合把整张表收敛成几个数字，一个不符的 `SUM`／`COUNT` 就能标出偏移；而逐行抽样——只检查你刚好挑到的数据行——会完全错过它。

## 跨方言迁移：SQLite → SQL Server 风险表

当迁移同时改变数据库引擎（不只模式）时，来源与目标方言在型别语义、比较与排序上会分歧。下表每一项分歧都是数据可能悄悄改变意义之处，也是上述编码与聚合测试（以及 reverse-engineering-standards.md 中非 HTTP 隐含规则扫描）的 derive 清单输入。

| 风险点 | SQLite | SQL Server | 迁移须验 |
|---|---|---|---|
| **型别系统** | 动态型别（值层 type affinity） | 静态／强型别 | 每栏宣告型别；扫描 SQLite 容忍的越界／混型别值 |
| **布尔** | 通常存成 `0/1` 整数 | `BIT` | `0/1` ↔ `BIT` 对映；NULL 布尔的处理 |
| **日期时间** | 常存为 `TEXT`／`REAL`／`INTEGER` | `datetime2`／`datetimeoffset` | 格式解析、时区处理、精度截断 |
| **自增主键** | `AUTOINCREMENT` | `IDENTITY` | 既有 id 连续性；正确的 seed/reseed 值 |
| **大小写／collation** | `LIKE` 预设大小写不敏感；`NOCASE` | 由栏位 collation 决定 | 对齐 collation；检查 unique-key 折叠冲突 |
| **NULL 排序** | NULL 排最前（最小） | 依设定而定 | `ORDER BY` 结果顺序不变量跨引擎 |
| **浮点精度** | `REAL` | `float`／`decimal` | 金额／精确值改用 `decimal` 避免舍入误差 |
| **字符串拼接** | `\|\|` | `+`／`CONCAT` | 改写查询；对齐 NULL 拼接语义 |
| **分页** | `LIMIT`／`OFFSET` | `OFFSET .. FETCH`／`TOP` | 改写 + 保证稳定排序键以取得确定性分页 |

> 每个「查询改写／语义差异」格也可能藏一条**隐含业务规则**——把本表喂入反向工程的隐含规则扫描阶段。

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

使用 `testcontainers` 为每个测试套件启动一个全新的 PostgreSQL 容器。容器在套件结束后销毁，确保隔离性。

## 反模式

- **对共享数据库进行测试** — 造成跨测试污染、不可重复的构建结果
- **跳过 down 迁移测试** — 回滚在生产事故中失败
- **事后编写迁移测试且未预先填充数据** — 完全遗漏数据保存的缺陷
- **提交迁移却没有对应的测试** — 迁移在进入生产前完全未被测试
- **只对解码后的值断言字符串相等** — 即使字节、normalization 形式或 codepoint 在跨编码/跨引擎变更中已损坏，显示层相等仍会通过
- **仅以数据行抽样验证跨引擎迁移** — 分布层级的偏移（错误的 `SUM`／`COUNT`／`DISTINCT`）会逃过任何刚好错过受影响数据行的抽样

## 参见

- `database-standards.ai.yaml` — 模式设计原则
- `testing.ai.yaml` — 通用测试结构与金字塔
- `verification-evidence.ai.yaml` — 审计证据需求
- `behavior-snapshot.ai.yaml` — 同样的「别只比看起来相等」原则，作用于 oracle／序列化层，而非 DB 存储层

---

**Scope**: universal
