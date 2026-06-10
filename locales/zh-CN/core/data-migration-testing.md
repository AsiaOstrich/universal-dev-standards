---
source: ../../../core/data-migration-testing.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-06-10
source_hash: cc35f3fcd7ec
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

## 参见

- `database-standards.ai.yaml` — 模式设计原则
- `testing.ai.yaml` — 通用测试结构与金字塔
- `verification-evidence.ai.yaml` — 审计证据需求

---

**Scope**: universal
