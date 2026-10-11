---
source: ../../../core/database-standards.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: b21566b7d853
status: current
---

# 数据库标准

> **语言**: [English](../../../core/database-standards.md) | [繁體中文](../../zh-TW/core/database-standards.md) | 简体中文

**版本**: 1.0.0
**最后更新**: 2026-03-18
**适用性**: 所有软件项目
**范围**: universal
**产业标准**: ISO/IEC 9075 (SQL)、ACID 特性、BASE 定理
**参考资源**: [use-the-index-luke.com](https://use-the-index-luke.com/)、[sqlstyle.guide](https://www.sqlstyle.guide/)

---

## 目的

本标准定义数据库设计、查询、迁移与运维的指导方针，涵盖关系型与非关系型数据库。包含 Schema 设计原则、索引策略、迁移工作流程、查询优化、事务管理与数据完整性 — 确保数据库具备高性能、可维护且安全的特性。

**参考标准**:
- [ISO/IEC 9075 — SQL 标准](https://www.iso.org/standard/76583.html)
- [Use The Index, Luke — SQL 索引与调优](https://use-the-index-luke.com/)
- [Martin Fowler — 演进式数据库设计](https://martinfowler.com/articles/evodb.html)
- [Designing Data-Intensive Applications (Martin Kleppmann)](https://dataintensive.net/)

---

## 核心原则

| 原则 | 说明 |
|------|------|
| **数据完整性优先** | 约束、验证与引用完整性在数据库层级强制执行，而非仅在应用代码 |
| **Schema 即代码** | 数据库 Schema 通过迁移脚本进行版本控制且可重现 |
| **最小权限** | 数据库账号使用其功能所需的最低权限 |
| **先测量再调优** | 使用 EXPLAIN 计划与指标后再进行优化；避免过早优化 |
| **纵深防御** | 在多个层级使用加密、遮蔽与访问控制来保护敏感数据 |
| **向后兼容** | Schema 变更必须在部署窗口期间维持向后兼容 |

---

## Schema 设计原则

### 正规化

应用正规化以消除冗余并确保数据完整性。以第三正规形式（3NF）作为事务系统的基准。

| 正规形式 | 规则 | 违反范例 |
|----------|------|----------|
| **1NF** | 仅原子值；无重复群组 | 单一字段中 `tags = "java,python,go"` |
| **2NF** | 1NF + 复合键无部分依赖 | 非键字段仅依赖复合主键的一部分 |
| **3NF** | 2NF + 无传递依赖 | `order.customer_name` 通过 `customer_id` 从 `customer.name` 衍生 |

### 反正规化决策矩阵

反正规化以完整性换取读取性能。需刻意为之并记录权衡考量。

| 判断条件 | 正规化 | 反正规化 |
|----------|--------|----------|
| 读写比例 | 写入密集或平衡 | 读取密集（>90% 读取） |
| 数据一致性 | 关键（财务、医疗） | 可接受最终一致性 |
| 查询复杂度 | 可接受的 JOIN 性能 | JOIN 导致不可接受的延迟 |
| 数据变动频率 | 经常更新 | 创建后很少变更 |
| 存储成本 | 最小化重复 | 存储便宜；速度是优先考量 |

**进行反正规化时：**
- 记录数据来源（source of truth）与同步机制
- 加入注释说明选择反正规化的原因
- 实现一致性检查或对账作业

### 命名惯例

| 元素 | 惯例 | 范例 |
|------|------|------|
| 数据表 | `snake_case`，单数 | `user_account`、`order_item` |
| 字段 | `snake_case` | `first_name`、`created_at` |
| 主键 | `id` | `user_account.id` |
| 外键 | `<被引用数据表>_id` | `order.user_account_id` |
| 布尔字段 | `is_` 或 `has_` 前缀 | `is_active`、`has_verified_email` |
| 时间戳记 | `_at` 后缀 | `created_at`、`updated_at`、`deleted_at` |
| 索引 | `idx_<数据表>_<字段>` | `idx_user_account_email` |
| 唯一约束 | `uq_<数据表>_<字段>` | `uq_user_account_email` |
| 检查约束 | `ck_<数据表>_<描述>` | `ck_order_positive_amount` |

### 保留字

- 避免使用 SQL 保留字作为标识符（`order`、`user`、`group`、`select`）
- 若无法避免，加上实体类型后缀：`user_account`、`order_record`、`user_group`

---

## 数据类型

### 选择适当类型

| 场景 | 建议 | 避免 |
|------|------|------|
| 金额值 | `DECIMAL(19,4)` 或 `NUMERIC` | `FLOAT`、`DOUBLE`（精度损失） |
| 日期时间 | `TIMESTAMPTZ`（含时区） | `VARCHAR` 存储日期 |
| 布尔标志 | `BOOLEAN` | `INT` (0/1)、`CHAR(1)` ('Y'/'N') |
| 短文本 (< 255) | `VARCHAR(n)` 含适当长度 | `TEXT` 用于已知长度字段 |
| 长文本 | `TEXT` | `VARCHAR(MAX)` 或过大的 `VARCHAR` |
| IP 地址 | 原生 IP 类型或 `INET` | `VARCHAR(45)` |
| JSON 数据 | `JSONB` (PostgreSQL) 或原生 JSON | `TEXT` 存储 JSON 字符串 |
| 枚举值 | `ENUM` 类型或查询表 | 字符串化的值 |

### UUID vs 自动递增

| 因素 | 自动递增 | UUID |
|------|----------|------|
| 存储大小 | 4-8 bytes | 16 bytes |
| 索引性能 | 较佳（循序写入） | 较差（随机插入造成 B-tree 碎片） |
| 分布式生成 | 需要协调 | 无需协调 |
| 安全性 | 可预测（可枚举） | 不可猜测 |
| URL 暴露 | 揭露记录数量 | 可安全用于公开 URL |
| 合并/复制 | 容易冲突 | 无冲突 |

**建议：**
- 单一数据库系统的内部 ID 使用**自动递增**
- 分布式系统或公开暴露的 ID 使用 **UUIDv7**（时间排序）
- 新项目考虑以 **UUIDv7** 为默认 — 兼具可排序性与唯一性

```sql
-- PostgreSQL: UUIDv7 as primary key
CREATE TABLE user_account (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email      VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Auto-increment alternative
CREATE TABLE user_account (
    id         BIGSERIAL PRIMARY KEY,
    public_id  UUID NOT NULL DEFAULT gen_random_uuid(),
    email      VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
```

---

## 索引策略

### 何时创建索引

| 创建索引的时机 | 避免创建索引的时机 |
|---------------|-------------------|
| 字段经常出现在 `WHERE` 子句中 | 数据表少于 1,000 行 |
| 字段用于 `JOIN` 条件 | 字段基数极低（如布尔值） |
| 字段用于 `ORDER BY` | 数据表为写入密集且很少读取 |
| 字段用于 `GROUP BY` | 字段经常更新 |
| 需要唯一约束 | 每张数据表已超过 8 个索引 |

### 复合索引字段顺序

复合索引的字段顺序影响重大。遵循**等值优先、范围最后**规则：

```sql
-- Query pattern:
-- WHERE status = 'active' AND created_at > '2026-01-01' ORDER BY created_at

-- GOOD: equality columns first, range/sort columns last
CREATE INDEX idx_order_status_created ON order_record (status, created_at);

-- BAD: range column first eliminates effectiveness for equality filter
CREATE INDEX idx_order_created_status ON order_record (created_at, status);
```

**字段顺序规则：**
1. 等值条件（`=`）优先
2. `IN` 条件其次
3. 范围条件（`>`、`<`、`BETWEEN`）最后
4. `ORDER BY` 字段放末端（若符合排序方向）

### 覆盖索引

覆盖索引包含查询所需的所有字段，实现仅索引扫描：

```sql
-- Query: SELECT email, first_name FROM user_account WHERE status = 'active';

-- Covering index — no table lookup needed
CREATE INDEX idx_user_account_status_covering
    ON user_account (status) INCLUDE (email, first_name);
```

### 部分索引

对数据行的子集创建索引，以减少索引大小并改善写入性能：

```sql
-- Only index active records (90% of queries filter on active)
CREATE INDEX idx_order_active
    ON order_record (created_at)
    WHERE status = 'active';

-- Only index non-null values
CREATE INDEX idx_user_account_phone
    ON user_account (phone_number)
    WHERE phone_number IS NOT NULL;
```

### 索引反模式

| 反模式 | 问题 | 解决方案 |
|--------|------|----------|
| **过度索引** | 拖慢写入、浪费存储空间 | 每季审查索引；移除未使用的 |
| **未使用的索引** | 有维护成本但无读取收益 | 监控 `pg_stat_user_indexes` 或同等工具 |
| **重复索引** | 多余的开销 | 索引 `(a, b)` 已涵盖 `(a)` 的查询 |
| **低基数字段索引** | 全表扫描通常更快 | 改用部分索引或 Bitmap 索引 |
| **FK 缺少索引** | CASCADE 删除与 JOIN 变慢 | 务必为外键字段创建索引 |
| **索引字段上使用函数** | 索引被绕过 | 创建函数/表达式索引 |

```sql
-- Anti-pattern: function prevents index usage
SELECT * FROM user_account WHERE LOWER(email) = 'test@example.com';

-- Solution: expression index
CREATE INDEX idx_user_account_email_lower ON user_account (LOWER(email));
```

---

## 迁移策略

### 原则

| 原则 | 说明 |
|------|------|
| **版本控制** | 所有迁移与应用代码一同存储在版本控制系统 |
| **循序执行** | 迁移以确定性顺序执行 |
| **幂等性** | 执行两次迁移产生相同结果 |
| **已测试** | 迁移在部署前以类生产数据量进行测试 |
| **有文档** | 每次迁移包含变更内容与原因的说明 |

### 命名惯例

```
YYYYMMDDHHMMSS_description.sql

Examples:
20260318120000_create_user_account_table.sql
20260318120100_add_email_index_to_user_account.sql
20260318120200_add_phone_column_to_user_account.sql
```

### 正向迁移 vs 可逆迁移

| 方式 | 优点 | 缺点 | 适用时机 |
|------|------|------|----------|
| **可逆** (up/down) | 容易回滚、较安全 | 需维护更多代码、部分变更不可逆 | 开发环境、非破坏性变更 |
| **正向** | 较简单、符合现实 | 需另外的回滚迁移 | 生产环境、破坏性变更 |

**建议：** 默认使用可逆迁移。对于破坏性操作（删除字段、删除数据表），使用正向迁移并搭配独立的回滚迁移文件。

### 零停机迁移模式（Expand-Contract）

适用于无法容忍停机的系统 Schema 变更：

**第一阶段 — Expand（向后兼容）**
```sql
-- Add new column (nullable, no constraint yet)
ALTER TABLE user_account ADD COLUMN phone VARCHAR(20);
```

**第二阶段 — Migrate（双写）**
```sql
-- Backfill existing data
UPDATE user_account SET phone = legacy_phone WHERE phone IS NULL;
```

**第三阶段 — Contract（所有消费者更新后）**
```sql
-- Add constraint now that all data is populated
ALTER TABLE user_account ALTER COLUMN phone SET NOT NULL;
-- Drop old column (only after verifying no consumers use it)
ALTER TABLE user_account DROP COLUMN legacy_phone;
```

### 回滚策略

| 场景 | 回滚方式 |
|------|----------|
| 新增字段 | 移除该字段 |
| 新增索引 | 移除该索引 |
| 新增数据表 | 移除该数据表 |
| 移除字段 | 无法复原 — 需从备份还原或重新新增 |
| 数据转换 | 执行反向转换（若有设计） |
| 重新命名字段 | 重新命名回来 |

**关键规则：** 绝不在停止写入的同一次部署中移除字段或数据表。使用 Expand-Contract 模式。

---

## 查询最佳实践

### N+1 查询预防

N+1 问题发生在代码执行一个查询获取清单，再对每个项目额外执行 N 个查询。

```sql
-- N+1 PROBLEM (application issues N queries)
-- Query 1: SELECT * FROM order_record WHERE user_id = 42;
-- Query 2..N: SELECT * FROM order_item WHERE order_id = ?;  (for each order)

-- SOLUTION: JOIN or subquery
SELECT o.*, oi.*
FROM order_record o
JOIN order_item oi ON oi.order_id = o.id
WHERE o.user_id = 42;

-- Or batch loading
SELECT * FROM order_item
WHERE order_id IN (SELECT id FROM order_record WHERE user_id = 42);
```

### EXPLAIN 计划使用

对以下查询务必分析执行计划：
- 每分钟执行超过 100 次的查询
- 执行时间 > 100ms 的查询
- 涉及超过 10,000 行的查询
- 部署前的任何新查询

```sql
-- PostgreSQL
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM order_record WHERE status = 'pending' AND created_at > '2026-01-01';

-- Key indicators to watch:
-- Seq Scan on large tables   → missing index
-- Nested Loop with high rows → consider Hash Join
-- Sort with high cost        → add index matching ORDER BY
-- Rows (estimated vs actual) → stale statistics, run ANALYZE
```

### 分页

| 方法 | 优点 | 缺点 | 适用时机 |
|------|------|------|----------|
| **Offset 分页** | 简单、支持随机页面访问 | 大 Offset 时性能差、并发写入时结果不一致 | 小型数据集、管理后台 |
| **Keyset（游标）分页** | 性能一致、结果稳定 | 无法随机跳页、多字段排序时较复杂 | API、无限滚动、大型数据集 |

```sql
-- Offset-based (avoid for large tables)
SELECT * FROM order_record ORDER BY id LIMIT 20 OFFSET 10000;
-- Performance degrades: DB must scan and discard 10,000 rows

-- Keyset-based (preferred)
SELECT * FROM order_record
WHERE id > :last_seen_id
ORDER BY id
LIMIT 20;
-- Consistent performance regardless of page depth
```

### 查询反模式

| 反模式 | 问题 | 解决方案 |
|--------|------|----------|
| `SELECT *` | 获取不必要的数据、Schema 变更时可能中断 | 明确列出所需字段 |
| 查询中的字符串拼接 | SQL 注入漏洞 | 使用参数化查询 / Prepared Statement |
| 不同字段的 `OR` | 阻止索引使用 | 使用 `UNION ALL` 或重构查询 |
| `NOT IN` 含 NULL | 非预期的空结果 | 改用 `NOT EXISTS` |
| 隐含类型转换 | 绕过索引、结果错误 | 明确转型 |
| `LIKE '%prefix'` | 前导通配符阻止索引使用 | 使用全文搜索或反向索引 |

```sql
-- ANTI-PATTERN: SQL injection risk
query = "SELECT * FROM user_account WHERE email = '" + email + "'";

-- CORRECT: Parameterized query
query = "SELECT * FROM user_account WHERE email = $1";
params = [email];
```

---

## 事务管理

### ACID 特性

| 特性 | 说明 | 实施方式 |
|------|------|----------|
| **原子性 (Atomicity)** | 所有操作成功或全部失败 | 使用事务；避免部分提交 |
| **一致性 (Consistency)** | 数据库从一个有效状态转移到另一个 | 在数据库层级强制约束 |
| **隔离性 (Isolation)** | 并发事务不互相干扰 | 选择适当的隔离等级 |
| **持久性 (Durability)** | 已提交的数据在系统故障后存活 | 使用 WAL（预写日志）；确认同步写入 |

### 隔离等级

| 等级 | 脏读 | 不可重复读 | 幻读 | 性能 | 使用场景 |
|------|------|-----------|------|------|----------|
| **Read Uncommitted** | 可能 | 可能 | 可能 | 最快 | 不建议使用 |
| **Read Committed** | 防止 | 可能 | 可能 | 快 | 大多数 RDBMS 的默认；一般用途查询 |
| **Repeatable Read** | 防止 | 防止 | 可能 | 中等 | 财务报表、库存检查 |
| **Serializable** | 防止 | 防止 | 防止 | 最慢 | 金钱转账、订位系统 |

**建议：** 使用 **Read Committed** 作为默认。仅在需要严格一致性的操作（如账户余额更新、座位预订）时提升至 **Repeatable Read** 或 **Serializable**。

### 死锁预防

| 策略 | 实施方式 |
|------|----------|
| **一致的锁定顺序** | 在所有事务中以相同顺序获取数据表/行的锁定 |
| **短事务** | 尽可能保持事务简短；将非数据库工作移出事务外 |
| **锁定超时** | 设置 `lock_timeout` 以快速失败而非无限等待 |
| **重试逻辑** | 对死锁错误（SQLSTATE 40P01）实现指数退避重试 |
| **避免用户交互** | 绝不在等待用户输入时保持事务开启 |

```sql
-- Set lock timeout to prevent indefinite waiting
SET lock_timeout = '5s';

-- Keep transactions short
BEGIN;
    UPDATE account SET balance = balance - 100 WHERE id = 1;
    UPDATE account SET balance = balance + 100 WHERE id = 2;
COMMIT;
```

### 乐观锁定 vs 悲观锁定

| 因素 | 乐观锁定 | 悲观锁定 |
|------|----------|----------|
| 机制 | 写入时检查版本字段/时间戳记 | `SELECT ... FOR UPDATE` 获取行锁定 |
| 冲突率 | 低冲突环境 | 高冲突环境 |
| 性能 | 冲突罕见时较佳 | 冲突频繁时较佳 |
| 用户体验影响 | 用户可能看到「其他人已修改」错误 | 用户可能等待锁定释放 |
| 死锁风险 | 无 | 可能 |

```sql
-- Optimistic locking
UPDATE order_record
SET status = 'shipped', version = version + 1
WHERE id = 42 AND version = 3;
-- If affected rows = 0, another transaction modified it → retry or error

-- Pessimistic locking
BEGIN;
SELECT * FROM order_record WHERE id = 42 FOR UPDATE;
-- Row is locked; other transactions wait
UPDATE order_record SET status = 'shipped' WHERE id = 42;
COMMIT;
```

---

## SQL vs NoSQL 决策矩阵

| 判断条件 | 关系型 (SQL) | 文档型 (NoSQL) | 键值型 | 图形型 |
|----------|-------------|---------------|--------|--------|
| **数据结构** | 结构化、明确定义的 Schema | 半结构化、弹性 Schema | 简单的 key→value 配对 | 高度关联的实体 |
| **一致性** | 强一致（ACID） | 最终一致（BASE），部分支持 ACID | 最终一致 | 依实现而异 |
| **查询复杂度** | 复杂 JOIN、聚合 | 简单查询、嵌套文档 | 单键查询 | 关系遍历 |
| **扩展模式** | 垂直扩展（scale-up） | 水平扩展（scale-out） | 水平扩展 | 依实现而异 |
| **Schema 变更** | 需要迁移 | 无 Schema / 弹性 | 无 Schema | Schema 可选 |
| **范例用途** | 财务系统、ERP、CRM | 内容管理、用户档案、产品目录 | 缓存、Session、速率限制 | 社交网络、推荐、欺诈检测 |
| **范例数据库** | PostgreSQL、MySQL、SQL Server | MongoDB、CouchDB、DynamoDB | Redis、Memcached、DynamoDB | Neo4j、Amazon Neptune |

### 决策指南

```
Is your data highly relational with complex queries?
├── Yes → Relational (SQL)
└── No  → Is your data simple key-value pairs?
          ├── Yes → Key-Value store
          └── No  → Are relationships the primary query pattern?
                    ├── Yes → Graph database
                    └── No  → Document database
```

**Polyglot Persistence（多语言持久化）：** 许多系统受益于使用多种数据库类型。范例：
- **PostgreSQL** 用于事务数据（订单、账户）
- **Redis** 用于缓存与 Session
- **Elasticsearch** 用于全文搜索
- **Neo4j** 用于推荐引擎

---

## 连接管理

### 连接池

每个应用程序都必须使用连接池。每次请求创建新的数据库连接代价极高（TCP 握手、认证、SSL 协商）。

| 参数 | 建议默认值 | 说明 |
|------|-----------|------|
| **最小池大小** | 2-5 | 维持的最少空闲连接数 |
| **最大池大小** | 10-20 | 最大并发连接数 |
| **连接超时** | 5 秒 | 等待从池获取连接的时间 |
| **空闲超时** | 10 分钟 | 超过此时间关闭空闲连接 |
| **最大存活时间** | 30 分钟 | 回收连接以防止状态过时 |
| **验证查询** | `SELECT 1` | 返回连接前的健康检查 |

### 池大小公式

最大连接池大小的常用公式：

```
pool_size = (core_count * 2) + effective_spindle_count

Examples:
- 4-core server, SSD:    (4 * 2) + 1 = 9-10 connections
- 8-core server, SSD:    (8 * 2) + 1 = 17 connections
- 4-core server, 4 HDDs: (4 * 2) + 4 = 12 connections
```

**重要：** 更多连接不一定更好。过多连接会导致：
- 数据库中的线程竞争
- 内存压力（每个连接使用约 5-10 MB）
- 增加上下文切换

### 健康检查

```sql
-- Basic health check
SELECT 1;

-- Advanced health check (verify read/write capability)
SELECT NOW();

-- Connection validation before use
SET statement_timeout = '2s';
SELECT 1;
```

---

## 数据完整性

### 约束

务必在数据库层级强制数据完整性。应用程序层级的验证是补充，不是替代。

| 约束 | 用途 | 范例 |
|------|------|------|
| `NOT NULL` | 防止缺少必要数据 | `email VARCHAR(255) NOT NULL` |
| `UNIQUE` | 防止重复值 | `UNIQUE (email)` |
| `CHECK` | 验证值范围/格式 | `CHECK (amount > 0)` |
| `FOREIGN KEY` | 强制引用完整性 | `REFERENCES user_account(id)` |
| `DEFAULT` | 提供合理的默认值 | `DEFAULT NOW()` |
| `EXCLUSION` | 防止范围重叠 | `EXCLUDE USING gist (room WITH =, period WITH &&)` |

```sql
CREATE TABLE order_record (
    id              BIGSERIAL PRIMARY KEY,
    user_account_id BIGINT       NOT NULL REFERENCES user_account(id),
    amount          DECIMAL(19,4) NOT NULL CHECK (amount > 0),
    status          VARCHAR(20)   NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
```

### 级联规则

| 规则 | 行为 | 适用时机 |
|------|------|----------|
| `CASCADE` | 自动删除/更新子行 | 强拥有权关系（order → order_items） |
| `SET NULL` | 父行删除时将 FK 设为 NULL | 可选关系（文章 → 作者删除时） |
| `SET DEFAULT` | 父行删除时将 FK 设为默认值 | 重新指派至默认值 |
| `RESTRICT` | 若存在子行则阻止父行删除 | 保护关键引用（user → audit_log） |
| `NO ACTION` | 与 RESTRICT 相同（可延迟检查） | 默认行为 |

**建议：** 默认使用 `RESTRICT`。仅在父子生命周期紧密耦合时使用 `CASCADE`。

### 软删除 vs 硬删除

| 因素 | 软删除 | 硬删除 |
|------|--------|--------|
| 实现方式 | `deleted_at TIMESTAMPTZ` 字段 | `DELETE FROM table` |
| 数据恢复 | 简单 — 设置 `deleted_at = NULL` | 需从备份还原 |
| 查询复杂度 | 每处都须加 `WHERE deleted_at IS NULL` | 查询较简单 |
| 存储 | 随时间增长 | 回收空间 |
| 合规性 | 保留审计轨迹 | 可能违反保留要求 |
| 性能 | 大量软删除行的大型数据表 | 更干净的表统计数据 |

```sql
-- Soft delete implementation
ALTER TABLE user_account ADD COLUMN deleted_at TIMESTAMPTZ;

-- Create partial index for active records
CREATE INDEX idx_user_account_active ON user_account (email) WHERE deleted_at IS NULL;

-- Application query pattern
SELECT * FROM user_account WHERE deleted_at IS NULL AND email = $1;
```

**建议：** 对面向用户的数据和任何需要审计轨迹的内容使用软删除。对暂时性数据（Session、临时 Token、超过保留期的日志）使用硬删除。

---

## 备份与恢复

### 备份策略类型

| 策略 | 说明 | 备份速度 | 还原速度 | 存储成本 |
|------|------|----------|----------|----------|
| **完整备份** | 整个数据库的完整副本 | 最慢 | 最快 | 最高 |
| **增量备份** | 自上次备份以来的变更 | 最快 | 最慢（需完整链） | 最低 |
| **差异备份** | 自上次完整备份以来的变更 | 中等 | 中等（完整 + 差异） | 中等 |

### RPO 与 RTO

| 指标 | 定义 | 目标范例 |
|------|------|----------|
| **RPO**（恢复点目标） | 可接受的最大数据损失（时间） | 1 小时：每小时备份；0：持续复制 |
| **RTO**（恢复时间目标） | 可接受的最大停机时间 | 15 分钟：自动容错切换；4 小时：手动还原 |

### 备份调度建议

| 层级 | RPO | RTO | 策略 |
|------|-----|-----|------|
| **关键**（财务、医疗） | < 1 分钟 | < 15 分钟 | 同步复制 + 持续 WAL 归档 |
| **重要**（电子商务、SaaS） | < 1 小时 | < 1 小时 | 流式复制 + 每小时 WAL 归档 |
| **标准**（内部工具） | < 24 小时 | < 4 小时 | 每日完整 + 每小时增量 |
| **低**（开发、预发布环境） | < 1 周 | < 1 天 | 每周完整备份 |

### 备份测试

| 要求 | 频率 |
|------|------|
| 还原测试至独立环境 | 每月 |
| 还原后验证数据完整性 | 每次还原测试 |
| 测量实际 RTO vs 目标 | 每季 |
| 测试时间点恢复 | 每半年 |
| 更新文档与执行手册 | 每次测试后 |

---

## 敏感数据处理

### 字段层级加密

```sql
-- Encrypt at write time
INSERT INTO user_account (email, ssn_encrypted)
VALUES ($1, pgp_sym_encrypt($2, $encryption_key));

-- Decrypt at read time (only by authorized roles)
SELECT email, pgp_sym_decrypt(ssn_encrypted, $encryption_key) AS ssn
FROM user_account WHERE id = $1;
```

### 数据分级

| 等级 | 说明 | 范例 | 处理方式 |
|------|------|------|----------|
| **公开** | 无敏感性 | 营销内容、公开 API | 无特殊处理 |
| **内部** | 业务敏感 | 营收数据、产品路线图 | 访问控制、禁止公开暴露 |
| **机密** | 个人识别信息 | Email、电话、地址 | 静态加密、访问日志 |
| **限制** | 高度敏感 | 身份证号、信用卡、密码 | 字段加密、数据遮蔽、严格审计 |

### 数据遮蔽

```sql
-- View-based masking for support staff
CREATE VIEW user_account_masked AS
SELECT
    id,
    LEFT(email, 2) || '***@' || SPLIT_PART(email, '@', 2) AS email,
    '***-**-' || RIGHT(ssn, 4) AS ssn_masked,
    first_name,
    created_at
FROM user_account;

-- Grant support team access to masked view only
GRANT SELECT ON user_account_masked TO support_role;
```

### PII 管理检查清单

- [ ] 识别并编目所有数据表中的 PII 字段
- [ ] 静态加密 PII（字段层级或表空间加密）
- [ ] 传输中加密 PII（所有连接使用 TLS）
- [ ] 非生产环境实施数据遮蔽
- [ ] 定义并执行保留策略
- [ ] 支持数据主体请求（GDPR 删除权、访问权）
- [ ] 记录所有对 PII 字段的访问
- [ ] 在开发与预发布环境中匿名化数据

### 审计日志

```sql
-- Audit log table
CREATE TABLE audit_log (
    id          BIGSERIAL PRIMARY KEY,
    table_name  VARCHAR(100)  NOT NULL,
    record_id   BIGINT        NOT NULL,
    action      VARCHAR(10)   NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_values  JSONB,
    new_values  JSONB,
    changed_by  VARCHAR(100)  NOT NULL,
    changed_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Trigger-based audit (PostgreSQL example)
CREATE OR REPLACE FUNCTION audit_trigger_fn()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_log (table_name, record_id, action, old_values, new_values, changed_by)
    VALUES (
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        CASE WHEN TG_OP != 'INSERT' THEN to_jsonb(OLD) END,
        CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) END,
        current_user
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;
```

---

## 性能监控

### 慢查询日志

| 数据库 | 配置 | 建议阈值 |
|--------|------|----------|
| PostgreSQL | `log_min_duration_statement` | 200ms（开发）、1000ms（生产） |
| MySQL | `slow_query_log`、`long_query_time` | 1 秒 |
| SQL Server | Extended Events 或 Query Store | 1 秒 |

### 关键监控指标

| 指标 | 警告阈值 | 严重阈值 | 工具 |
|------|----------|----------|------|
| **活跃连接数** | > 最大值的 70% | > 最大值的 90% | 数据库仪表板 |
| **缓存/缓冲命中率** | < 95% | < 90% | `pg_stat_bgwriter`、InnoDB buffer pool |
| **复制延迟** | > 1 秒 | > 10 秒 | 复制监控 |
| **事务速率** | 偏离基线 > 20% | 偏离 > 50% | 应用程序指标 |
| **锁定等待时间** | 平均 > 1 秒 | > 5 秒 | 锁定监控查询 |
| **每分钟死锁数** | > 1 | > 5 | 数据库日志 |
| **数据表膨胀** | > 20% 死元组 | > 40% 死元组 | `pg_stat_user_tables` |
| **查询执行时间 (p95)** | > 500ms | > 2 秒 | APM 工具 |

### 查询计划分析工作流程

```
1. Identify slow query (slow query log or APM)
   ↓
2. Run EXPLAIN ANALYZE on staging with production-like data
   ↓
3. Look for:
   - Sequential scans on large tables → add index
   - High actual vs estimated rows → run ANALYZE (update statistics)
   - Nested loops with many iterations → restructure query or add index
   - Sort operations with high cost → add index matching sort order
   ↓
4. Apply fix (add index, rewrite query, update statistics)
   ↓
5. Re-run EXPLAIN ANALYZE to verify improvement
   ↓
6. Deploy and monitor execution time in production
```

---

## 快速参考卡

### Schema 设计

```
✅ Use snake_case for all identifiers
✅ Singular table names (user_account, not user_accounts)
✅ Use _id suffix for foreign keys
✅ Always have id, created_at, updated_at columns
✅ Enforce constraints at database level
✅ Normalize to 3NF, denormalize with documented reasoning
```

### 查询

```
✅ Always use parameterized queries
✅ List specific columns instead of SELECT *
✅ Use EXPLAIN ANALYZE for query optimization
✅ Prefer keyset pagination over offset for large datasets
✅ Batch operations to prevent N+1 queries
✅ Set statement_timeout to prevent runaway queries
```

### 运维

```
✅ Use connection pooling (never open per-request connections)
✅ Version-control all migrations
✅ Test migrations with production-like data
✅ Use expand-contract for zero-downtime schema changes
✅ Monitor slow queries, connections, cache hit ratio
✅ Test backup restoration regularly
```

---

## 相关标准

- [安全标准](../../../core/security-standards.md) — 数据加密、访问控制、PII 处理
- [性能标准](../../../core/performance-standards.md) — 应用程序层级的性能优化
- [日志标准](../../../core/logging-standards.md) — 数据库操作的结构化日志
- [部署标准](../../../core/deployment-standards.md) — 数据库迁移作为部署管线的一部分

---

## 版本历程

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0.0 | 2026-03-18 | 初始发布 |

---

## 参考资源

- [ISO/IEC 9075 — SQL 标准](https://www.iso.org/standard/76583.html)
- [Use The Index, Luke](https://use-the-index-luke.com/) — SQL 索引与调优
- [SQL Style Guide](https://www.sqlstyle.guide/) — 一致的 SQL 格式
- [Martin Fowler — 演进式数据库设计](https://martinfowler.com/articles/evodb.html)
- [Designing Data-Intensive Applications](https://dataintensive.net/) — Martin Kleppmann
- [PostgreSQL 文档](https://www.postgresql.org/docs/)

---

## 许可

本标准以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可发布。
